const hpgl = require('../../hpgl/hpgl.js');
const affine  = require('geom2d').affine;
const SerialPort = require("serialport");
const fs = require('fs');

// let height = 430;
// let width = 279;



module.exports = function(p5) {
    /**
     * @namespace RendererHPGL
     * @constructor
     * @param {Element} elt canvas element to be replaced
     * @param {p5} pInst p5 Instance
     * @param {Bool} isMainCanvas
     */

    function transformToString(transform) {
        return `${transform.m00}.${transform.m01}.${transform.m10}.${transform.m11}-${transform.v0},${transform.v1}`
    }

    function RendererHPGL(elt, w, h, pInst, isMainCanvas, plotForReal) {
        console.log('**** CREATING HPGL INSTANCE');
        // TODO(jimmy): Configurable log
        console.log('Initializing HPGL renderer');
        this.plotForReal = plotForReal;

        this.width = w;
        this.height = h;

        this.operations = [];
        this.transforms = [];
        this.scale_ = 1;
        this.rotation_ = 0;

        this.font_width = 2.85;
        this.font_height = 3.75;
        this.font_size = 1;

        this.fill_r_ = 255;
        this.fill_g_ = 255;
        this.fill_b_ = 255;

        // Printer is always rotated 90 degrees
        this.current_transform = new affine.translation(0, 0);
        console.log('*** ORIGINAL TRANSFORM: ', this.current_transform);

        // TODO(jimmy): Work out something about size? Or just say everything is in mm relative to 0, 0
        // TODO(jimmy): Will commands be enqueued before this is initialized?
        const that = this;

        console.log('Registering plotter transport');

        if (plotForReal) {
            window.setTimeout(function() {
                that.plotter = new hpgl.Plotter();
                const transport = new SerialPort('/dev/tty.usbserial-AK070I5T', {autoOpen: false});
                that.plotter.on("error", function (err) {
                    console.log('Plotter error: ', err);
                }).

                on("ready", function() {
                   this.startCapturingToFile("test.hpgl")
                }).

                connect(transport, {
                    paper: "A3"
                    //paper: "A4"
                }, function (error) {

                    if (error) {
                        console.log(error);
                        return;
                    }
                    console.log('Connected to plotter');

                    // this.selectPen(4);

                    this.setVelocity(0.1);

                    setInterval(function () {
                        // console.log('Running operations heartbeat');
                        if (that.operations.length === 0) {
                            return;
                        }

                        const op = that.operations.shift();
                        op();
                    }, 200);
                });
            }, 1000);
        } else {
            console.log('Running in Virtual Plotter mode');
            setInterval(function () {
                // console.log('Running operations heartbeat');
                if (that.operations.length === 0) {
                    return;
                }

                const op = that.operations.shift();
                op();
            }, 0);
        }

        // setInterval(function () {
        //     console.log('Running operations heartbeat');
        //     if (that.operations.length === 0) {
        //         return;
        //     }
        //
        //     const op = that.operations.shift();
        //     op();
        // }, 10);

        // this.plotter.startCapturingToFile("job.hpgl");
        p5.Renderer2D.call(this, elt, pInst, isMainCanvas);

        return this;
    }

    RendererHPGL.prototype.connect = function(port) {
    };

    RendererHPGL.prototype = Object.create(p5.Renderer2D.prototype);

    RendererHPGL.prototype._applyDefaults = function() {
        console.log('*** APPLYING DEFAULTS');
        p5.Renderer2D.prototype._applyDefaults.call(this);
        this.drawingContext.lineWidth = 1.5;

        if (!this.plotForReal) {
            // Constant that makes the pen width look about right.
            // this.scale(3.7);

            p5.Renderer2D.prototype.background.call(this, 'white');
            // p5.Renderer2D.prototype.scale.call(this, 3.7, 3.7);

            // Draw margins
            p5.Renderer2D.prototype.stroke.call(this, 255, 0, 0, 0);
            p5.Renderer2D.prototype.fill.call(this, 255, 0, 0, 128);

            p5.Renderer2D.prototype.rect.call(this, [0, 0, 19, height]);
            p5.Renderer2D.prototype.rect.call(this, [width-19, 0, 19, height]);

            // Reset fill
            p5.Renderer2D.prototype.fill.call(this, 255, 0, 0, 0);

            //p5.Renderer2D.prototype.stroke.call(this, 0, 0, 0);
            //p5.Renderer2D.prototype.fill.call(this, 0, 0, 0, 0);
            // p5.Renderer2D.prototype.line.call(this, 0, 0, 50, 50);
            // p5.Renderer2D.prototype.stroke.call(this, 0, 0, 0);
        }
    };

    RendererHPGL.prototype.line = function(x1, y1, x2, y2) {
        this.operations.push(RendererHPGL.prototype.lineAsync.bind(this, x1, y1, x2, y2));
    };

    RendererHPGL.prototype.getPlotterTransform = function() {
        //const base = new affine.translation(-this.width / 2, -this.height / 2);
        //base.leftComposeWith(new affine.rotation((Math.PI / 2)));
        //base.leftComposeWith(new affine.translation(this.height/2, this.width/2));
        //base.leftComposeWith(this.current_transform);
        const base = new affine.rotation(-Math.PI / 2);
        base.leftComposeWith(new affine.flipY());
        //const base = new affine.translation(-279/2, -215);
        //base.rightComposeWith(new affine.rotation((Math.PI / 2)));
        //base.rightComposeWith(new affine.translation(279/2, 215));
        base.rightComposeWith(this.current_transform);
        //base.leftComposeWith(new affine.translation(0, this.height/2))
        return base;
    }

    RendererHPGL.prototype.lineAsync = function(x1, y1, x2, y2, opt_noplot, opt_color) {
        if (this.r_ === 255 && this.g_ === 255 && this.b_ === 255) {
            return;
        }

        // Apply the current transforms (e.g. scale)
        const p1 = this.current_transform.transformPair(x1, y1);
        const p2 = this.current_transform.transformPair(x2, y2);

        if (opt_color) {
            p5.Renderer2D.prototype.stroke.call(this, opt_color[0], opt_color[1], opt_color[2]);
        }

        p5.Renderer2D.prototype.line.call(this, p1[0], p1[1] ,p2[0], p2[1]);
        p5.Renderer2D.prototype.stroke.call(this, this.r_, this.g_, this.b_);
        console.log('Line Async', this.r_, this.g_, this.b_, p1[0], p1[1], p2[0], p2[1]);
        console.log(`Drawing a line from ${x1},${y1} to ${x2},${y2}`);

        // Plotter operates with an additional 90 degree rotation
        //const base = this.current_transform.copy();
        //base.rightComposeWith(new affine.rotation(Math.PI / 2));
        //const base = new affine.rotation(Math.PI / 4);

        //const base = new affine.rotation(Math.PI/2);
        const base = this.getPlotterTransform();

        const pp1 = base.transformPair(x1, y1);
        const pp2 = base.transformPair(x2, y2);

        console.log(`Drawing line ${pp1[0]},${pp1[1]} to ${pp2[0]}, ${pp2[1]}`);

        if (this.plotter && !opt_noplot) {
            // this.plotter.selectPen(this.colorToPen(this.r_, this.g_, this.b_));
            this.plotter.moveTo(pp1[0] / 10, pp1[1] / 10);
            console.log(`Plotter move to ${pp1[0] / 10}, ${pp1[1] / 10}`)
            this.plotter.drawLine(pp2[0] / 10, pp2[1] / 10, {
                // linePattern: 2,
            });
        }

        p5.Renderer2D.prototype.stroke.call(this, 255, 0, 255);
        p5.Renderer2D.prototype.line.call(this, pp1[0], pp1[1] ,pp2[0], pp2[1]);
        p5.Renderer2D.prototype.stroke.call(this, this.r_, this.g_, this.b_);
        // p5.Renderer2D.prototype.stroke.call(this, 0, 0, 0);
        return this;
    };

    RendererHPGL.prototype.colorToPen = function(r, g, b) {
        let pen = 0;
        if (r === 255) {
            pen += 1;
        }
        if (g === 255) {
            pen += 2;
        }
        if (b === 255) {
            pen += 4;
        }
        return pen + 1;
    }

    RendererHPGL.prototype.stroke = function(r, g, b) {
        console.log('*****$$$$$ STROKE CALLED', r, g, b);
        // If we only get a single argument, it's a color
        if (r.levels) {
            const c = r;
            r = c.levels[0];
            g = c.levels[1];
            b = c.levels[2];
        }

        p5.Renderer2D.prototype.stroke.call(this, r, g, b, 255);
        this.operations.push(RendererHPGL.prototype.strokeAsync.bind(this, r, g, b));
    };

    RendererHPGL.prototype.strokeAsync = function(r, g, b) {
        // TODO(jimmy): Swap Pens
        this.r_ = r;
        this.g_ = g;
        this.b_ = b;
        // Blue is reserved as our 'debug' color - lines in this color are rendered only in pixel space, never HPGL
        // space.
        // if (r === 0 && g === 0 && b === 255) {
        //     this.debug = true;
        // } else {
        //     this.debug = false;
        // }
        console.log('STROKE ASYNC', r, g, b);
        p5.Renderer2D.prototype.stroke.call(this, r, g, b, 255);
    }

    RendererHPGL.prototype.fill = function(r, g, b) {
        console.log('*****$$$$$ FILE CALLED', r, g, b);
        // If we only get a single argument, it's a color
        if (r.levels) {
            const c = r;
            r = c.levels[0];
            g = c.levels[1];
            b = c.levels[2];
        }

        // p5.Renderer2D.prototype.fill.call(this, r, g, b, 255);
        this.operations.push(RendererHPGL.prototype.fillAsync.bind(this, r, g, b));
    };

    RendererHPGL.prototype.fillAsync = function(r, g, b) {
        this.fill_r_ = r;
        this.fill_g_ = g;
        this.fill_b_ = b;
        // Blue is reserved as our 'debug' color - lines in this color are rendered only in pixel space, never HPGL
        // space.
        // if (r === 0 && g === 0 && b === 255) {
        //     this.debug = true;
        // } else {
        //     this.debug = false;
        // }
        p5.Renderer2D.prototype.fill.call(this, r, g, b, 255);
    }

    RendererHPGL.prototype.strokeWeight = function(val) {
        this.operations.push(RendererHPGL.prototype.strokeWeightAsync.bind(this, val));
        // console.log('Stroke - do nothing');
    };

    RendererHPGL.prototype.strokeWeightAsync = function(val) {
        p5.Renderer2D.prototype.strokeWeight.call(this, val);
        // console.log('Stroke - do nothing');
    };



    RendererHPGL.prototype.rect = function(args) {
        this.operations.push(RendererHPGL.prototype.rectAsync.bind(this, this._rectMode, this._doStroke, args));
    };

    // TODO(jimmy): Handle Rect Mode, optional hight and radiused corners
    RendererHPGL.prototype.rectAsync = function(mode, doStroke, args, opt_noplot, opt_color) {
        const x1 = args[0];
        const y1 = args[1];
        const w = args[2];
        const h = args[3];

        console.log('Rect Async ', mode, doStroke, opt_noplot, opt_color, x1, y1, w, h, this.fill_r_, this.fill_g_, this.fill_b_);
        const offset = [0, 0];
        const hw = w / 2;
        const hh = h / 2;

        var p1, p2, p3, p4;
        // if (mode === 'center') {
        //     console.log('IN CENTER MODE');
        //     p1 = [x1 - hw, y1 - hh];
        //     p2 = [x1 + hw, y1 - hh];
        //     p3 = [x1 + hw, y1 + hh];
        //     p4 = [x1 - hw, y1 + hh];
        // } else {
        p1 = [x1, y1];
        p2 = [x1, y1 + h];
        p3 = [x1 + w, y1 + h];
        p4 = [x1 + w, y1];
        // }


        //if (this.r_ !== 255 || this.g_ !== 255 || this.b_ !== 255) {
            this.lineAsync(p1[0], p1[1] ,p2[0], p2[1], opt_noplot, opt_color);
            this.lineAsync(p2[0], p2[1] ,p3[0], p3[1], opt_noplot, opt_color);
            this.lineAsync(p3[0], p3[1] ,p4[0], p4[1], opt_noplot, opt_color);
            this.lineAsync(p4[0], p4[1] ,p1[0], p1[1], opt_noplot, opt_color);
        //}

        if (this.fill_r_ !== 255 || this.fill_g_ !== 255 || this.fill_b_ !== 255) {
            // Transform to plotter coordinates
            // Apply the current transforms (e.g. scale)
            const sw = w * this.scale_;
            const sh = h * this.scale_;
            const p1 = this.current_transform.transformPair(x1, y1);

            p5.Renderer2D.prototype.stroke.call(this, 0, 0, 0, 0);
            p5.Renderer2D.prototype.rect.call(this, [p1[0], p1[1], sw, sh]);
            p5.Renderer2D.prototype.stroke.call(this, this.r_, this.g_, this.b_, 255);

            const base = this.getPlotterTransform();
            const pp1 = base.transformPair(x1, y1);

            p5.Renderer2D.prototype.stroke.call(this, 0, 0, 0, 0);
            p5.Renderer2D.prototype.rect.call(this, [pp1[0], pp1[1], sh, sw]);
            p5.Renderer2D.prototype.stroke.call(this, this.r_, this.g_, this.b_, 255);

            if (this.plotter && !opt_noplot) {
                // this.plotter.selectPen(this.colorToPen(this.fill_r_, this.fill_g_, this.fill_b_))
                this.plotter.moveTo(pp1[0] / 10, pp1[1] / 10);
                this.plotter.drawRectangle(sh / 10, sw / 10,{
                    fillType: 'crosshatch'
                });
            }
        }
        return this;
    };

    RendererHPGL.prototype.textSize = function(size) {
        this.operations.push(RendererHPGL.prototype.textSizeAsync.bind(this, size));
    };

    RendererHPGL.prototype.textSizeAsync = function(size) {
        this.font_size = size;
    };

    RendererHPGL.prototype.text = function(msg, x, y) {
        // console.log('Text');
        this.operations.push(RendererHPGL.prototype.textAsync.bind(this, msg, x, y));
    };

    // TODO(jimmy): Handle Rect Mode, optional hight and radiused corners
    // x, y represent the center of the text
    // TODO(jimmy): Handle alternate textAlign modes
    RendererHPGL.prototype.textAsync = function(msg, x, y) {
        console.log('FONT SIZE = ', this.font_size);
        console.log(msg, x, y);

        const height = this.font_height * this.font_size * this.scale_;
        const width = this.font_width * this.font_size * this.scale_ * msg.length;
        console.log('HEIGHT WIDTH = ', height, width);

        // We adjust by the un-scaled width since this point will be transformed.
        // TODO(jimmy): Suppport center and left align
        //let adjX = x - ((this.font_width * this.font_size * msg.length) / 2);
        //let adjX = x;
        let adjX = x - ((this.font_width * this.font_size * msg.length));

        // Apply the current transforms
        const p1 = this.current_transform.transformPair(adjX, y);
        const base = this.getPlotterTransform();
        const pp1 = base.transformPair(adjX, y);

        console.log('Drawing text at ', msg, x, adjX, y, p1[0], p1[1], width, height);

        if (this.plotter) {
            // this.plotter.selectPen(this.colorToPen(this.r_, this.g_, this.b_));
            this.plotter.moveTo(pp1[0] / 10, pp1[1] / 10);
            this.plotter.drawText(msg, {
                rotation: (270 + this.rotation_ * (180 / Math.PI)) % 360,
                scale: this.font_size * this.scale_
            });
            this.rectAsync('corner', [adjX, y, this.font_width * this.font_size * msg.length, this.font_height * this.font_size]);
        }

        // Draw text extents. We do this in our transformed coordinates so that
        // rotation affects text extents correctly.
        // y += (this.font_height * this.font_size);
        this.rectAsync('corner', true, [adjX, y, this.font_width * this.font_size * msg.length, this.font_height * this.font_size], true, [5, 131, 244]);
        // this.rectAsync('corner', true, [50, 50, 50, 50]);
        //p5.Renderer2D.prototype.text.call(this, msg, p1[0], p1[1]);
    };

    RendererHPGL.prototype.translate = function(x, y) {
        // console.log('Translate');
        // const translate = new affine.translation(x, y);
        // this.current_transform.rightComposeWith(translate);

        this.operations.push(RendererHPGL.prototype.translateAsync.bind(this, x, y));
    };

    RendererHPGL.prototype.translateAsync = function(x, y) {
        console.log('Translate Async', x, y);
        const translate = new affine.translation(x, y);
        this.current_transform.rightComposeWith(translate);
        console.log(transformToString(this.current_transform));
    };

    RendererHPGL.prototype.scale = function(f) {
        // console.log('Scale');
        // const scale = new affine.scaling(f, f);
        // this.current_transform.rightComposeWith(scale);
        this.operations.push(RendererHPGL.prototype.scaleAsync.bind(this, f));
    };

    // RendererHPGL.prototype.beginShape = function() {
    //     console.log('Begin Shape');
    //     this.operations.push(RendererHPGL.prototype.beginShapeAsync.bind(this));
    // };
    //
    // RendererHPGL.prototype.beginShapeAsync = function(f) {
    //     console.log('Begin Shape Async');
    //     this.vertices = [];
    // };
    //
    // RendererHPGL.prototype.vertex = function(x, y) {
    //     console.log('Vertex');
    //     this.operations.push(RendererHPGL.prototype.vertexAsync.bind(this, x, y));
    // };
    //
    // RendererHPGL.prototype.vertexAsync = function(x, y) {
    //     console.log('Vertex Async');
    //     this.vertices.push([x, y]);
    // };

    RendererHPGL.prototype.endShape = function(mode, vertices) {
        console.log('End Shape Sync');
        this.operations.push(RendererHPGL.prototype.endShapeAsync.bind(this, mode, vertices));
    };

    RendererHPGL.prototype.endShapeAsync = function(mode, vertices) {
        console.log('End Shape Async: ', mode, vertices.length);

        // We only handle standard mode
        // const r = Math.floor(Math.random() * 255);
        // const g = Math.floor(Math.random() * 255);
        // const b = Math.floor(Math.random() * 255);
        // p5.Renderer2D.prototype.stroke.call(this, r, g, b);

        for (let i = 1; i < vertices.length; ++i) {
            // Apply the current transforms
            const p1 = this.current_transform.transformPair(vertices[i-1][0], vertices[i-1][1]);
            const p2 = this.current_transform.transformPair(vertices[i][0], vertices[i][1]);
            // console.log(p1[0], p1[1]);

            p5.Renderer2D.prototype.line.call(this, p1[0], p1[1], p2[0], p2[1]);

        }
        //p5.Renderer2D.prototype.stroke.call(this, 0, 0, 0);

        const lines = [];

        const base = this.getPlotterTransform();

        for (let i = 1; i < vertices.length; ++i) {
            // Plotter operates with an additional 90 degree rotation
            const p0 = base.transformPair(vertices[i-1][0], vertices[i-1][1]);
            const p1 = base.transformPair(vertices[i][0], vertices[i][1]);

            lines.push(p1[0] / 10);
            lines.push(p1[1] / 10);

            console.log(vertices[i-1][0], vertices[i-1][1], p0[0], p0[1]);

            // p5.Renderer2D.prototype.stroke.call(this, 255, 0, 0);
            // p5.Renderer2D.prototype.line.call(this, p0[0], p0[1], p1[0], p1[1]);
            // p5.Renderer2D.prototype.stroke.call(this, 0, 0, 0);
        }

        const p = base.transformPair(vertices[0][0], vertices[0][1]);
        // console.log('CHECKING PLOTTER: ', this.plotter);

        if (this.plotter) {
            // console.log('*** DRAWING SHAPEY THING: ', lines);
            this.plotter.moveTo(p[0] / 10, p[1] / 10);
            this.plotter.drawLines(lines);
        }

        // Plotter operates with an additional 90 degree rotation
        // const base = new affine.translation(215 / 2, 279 / 2);
        // base.rightComposeWith(new affine.rotation(Math.PI / 2));
        // base.rightComposeWith(new affine.translation(-140, -170));
        // base.rightComposeWith(this.current_transform);
        // const pp1 = base.transformPair(x1, y1);
        // const pp2 = base.transformPair(x2, y2);
        //
        // if (this.plotter) {
        //     this.plotter.moveTo(pp1[0] / 10, pp1[1] / 10);
        //     this.plotter.drawLine(pp2[0] / 10, pp2[1] / 10);
        // }
        this.vertices = [];
    };



    RendererHPGL.prototype.scaleAsync = function(f) {
        console.log('Scale Async', f);
        const scale = new affine.scaling(f, f);
        this.current_transform.rightComposeWith(scale);

        console.log(transformToString(this.current_transform));

        // We store scale separately since it is a scalar transform.
        // TODO(jimmy): Push and pop as needed
        this.scale_ = this.scale_ * f;
    };

    RendererHPGL.prototype.rotate = function(rads) {
        // console.log('Rotate');
        this.operations.push(RendererHPGL.prototype.rotateAsync.bind(this, rads));
    };

    RendererHPGL.prototype.rotateAsync = function(rads) {
        console.log('Rotate Async');
        const rotate = new affine.rotation(rads);
        this.current_transform.rightComposeWith(rotate);
        this.rotation_ = rads;
    };

    // Only circles today - height ignored
    RendererHPGL.prototype.ellipse = function(args) {
        console.log('%%%%%%%% ELLIPSE', args[0], args[1], args[2]);
        this.operations.push(RendererHPGL.prototype.circleAsync.bind(this, args[0], args[1], args[2]));
    };

    RendererHPGL.prototype.circleAsync = function(x, y, diameter) {
        console.log('*** CIRCLE ASYNC', x, y);
        const lines = [];
        const segments = 100; //360 * 10;
        const arc = (360 / segments);

        for (let i = 0; i <= segments; ++i) {
            const angle = (i * arc);
            const r = angle * (Math.PI / 180);
            let xx = (Math.cos(r) * (diameter / 2)) + (x + (diameter/2));
            let yy = (Math.sin(r) * (diameter / 2)) + (y + (diameter/2));
            lines.push([xx, yy]);
            // lines.push(y);
        }

        this.endShapeAsync(null, lines);


        // for (let i = 1; i < pixelLines.length; ++i) {
        //     const p0 = this.current_transform.transformPair(pixelLines[i-1][0], pixelLines[i-1][1]);
        //     const p1 = this.current_transform.transformPair(pixelLines[i][0], pixelLines[i][1]);
        //     console.log('Drawing line');
        //     p5.Renderer2D.prototype.line.call(this, p0[0], p0[1], p1[0], p1[1]);
        // }

        // console.log('Circle Async', x, y, diameter);
        // const base = new affine.translation(215 / 2, 279 / 2);
        // base.rightComposeWith(new affine.rotation(Math.PI / 2));
        // base.rightComposeWith(new affine.translation(-140, -170));
        // base.rightComposeWith(this.current_transform);
        //
        // const p0 = base.transformPair(x, y);
        //
        // if (this.plotter) {
        //     this.plotter.moveTo(p0[0] / 10.0, p0[1] / 10.0);
        //
        //
        //
        //     //this.plotter.drawCircle((diameter / 2.0) / 10.0, 1);
        // }
    };

    RendererHPGL.prototype.push = function(x, y) {
        // console.log('Scheduling push');
        this.operations.push(RendererHPGL.prototype.pushAsync.bind(this, x, y));
    };

    RendererHPGL.prototype.pushAsync = function(x, y) {
        console.log(`Pushing current transform`);
        this.transforms.push(this.current_transform.copy());
        console.log(`${this.transforms.length} transforms on the stack after push`);
    };

    RendererHPGL.prototype.pop = function(x, y) {
        // console.log('Scheduling pop');
        this.operations.push(RendererHPGL.prototype.popAsync.bind(this, x, y));
    };

    RendererHPGL.prototype.popAsync = function(x, y) {
        console.log(`Popping current transform`);
        console.log(`${this.transforms.length} transforms on the stack before pop`);
        this.current_transform = this.transforms.pop();
    };

    // RendererSVG.prototype.resize = function(w, h) {
    //
    //     // console.log({w: w, h: h, tw: this.width, th: this.height});
    //
    //     if (!w || !h) {
    //         // ignore invalid values for width and height
    //         return;
    //     }
    //     if (this.width !== w || this.height !== h) {
    //         // canvas will be cleared if its size changed
    //         // so, we do same thing for SVG
    //         // note that at first this.width and this.height is undefined
    //         this.drawingContext.__clearCanvas();
    //     }
    //     this._withPixelDensity(function() {
    //         p5.Renderer2D.prototype.resize.call(this, w, h);
    //     });
    //     // For scale, crop
    //     // see also: http://sarasoueidan.com/blog/svg-coordinate-systems/
    //     this.svg.setAttribute('viewBox', [0, 0, w, h].join(' '));
    // };
    //
    // /**
    //  * @private
    //  */
    // RendererSVG.prototype._withPixelDensity = function(fn) {
    //     var pixelDensity = this._pInst._pixelDensity;
    //     this._pInst._pixelDensity = 1; // 1 is OK for SVG
    //     fn.apply(this);
    //     this._pInst._pixelDensity = pixelDensity;
    // };
    //
    // RendererSVG.prototype.background = function() {
    //     var args = arguments;
    //     this._withPixelDensity(function() {
    //         p5.Renderer2D.prototype.background.apply(this, args);
    //     });
    // };
    //
    // RendererSVG.prototype.resetMatrix = function() {
    //     this._withPixelDensity(function() {
    //         p5.Renderer2D.prototype.resetMatrix.apply(this);
    //     });
    // };
    //
    // /**
    //  * set gc flag for svgcanvas
    //  *
    //  * @private
    //  */
    // RendererSVG.prototype._setGCFlag = function(element) {
    //     var that = this.drawingContext;
    //     var currentGeneration = that.generations[that.generations.length - 1];
    //     currentGeneration.push(element);
    // };
    //
    // /**
    //  * Append a element to current SVG Graphics
    //  *
    //  * @function appendChild
    //  * @memberof RendererSVG.prototype
    //  * @param {SVGElement|Element} element
    //  */
    // RendererSVG.prototype.appendChild = function(element) {
    //     if (element && element.elt) {
    //         element = element.elt;
    //     }
    //     this._setGCFlag(element);
    //     var g = this.drawingContext.__closestGroupOrSvg();
    //     g.appendChild(element);
    // };
    //
    // /**
    //  * Draw an image or SVG to current SVG Graphics
    //  *
    //  * FIXME: sx, sy, sWidth, sHeight
    //  *
    //  * @function image
    //  * @memberof RendererSVG.prototype
    //  * @param {p5.Graphics|SVGGraphics|SVGElement|Element} image
    //  * @param {Number} x
    //  * @param {Number} y
    //  * @param {Number} width
    //  * @param {Number} height
    //  */
    // RendererSVG.prototype.image = function(img, sx, sy, sWidth, sHeight, x, y, w, h) {
    //     if (!img) {
    //         throw new Error('Invalid image: ' + img);
    //     }
    //     var elt = img._renderer && img._renderer.svg; // handle SVG Graphics
    //     elt = elt || (img.elt && img.elt.nodeName && (img.elt.nodeName.toLowerCase() === 'svg') && img.elt); // SVGElement
    //     elt = elt || (img.nodeName && (img.nodeName.toLowerCase() == 'svg') && img); // <svg>
    //     if (elt) {
    //         // it's <svg> element, let's handle it
    //         elt = elt.cloneNode(true);
    //         elt.setAttribute('width', w);
    //         elt.setAttribute('height', h);
    //         elt.setAttribute('x', x);
    //         elt.setAttribute('y', y);
    //         if (sx || sy || sWidth || sHeight) {
    //             sWidth /= this._pInst._pixelDensity;
    //             sHeight /= this._pInst._pixelDensity;
    //             elt.setAttribute('viewBox', [sx, sy, sWidth, sHeight].join(', '));
    //         }
    //         this.appendChild(elt);
    //     } else {
    //         p5.Renderer2D.prototype.image.apply(this, arguments);
    //     }
    // };

    p5.RendererHPGL = RendererHPGL;
};
