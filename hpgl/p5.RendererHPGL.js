// const hpgl = require('../../hpgl/hpgl.js');
const affine  = require('geom2d').affine;
// const SerialPort = require("serialport");
// const fs = require('fs');
const simplify = require('simplify-js');

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

    function dlog(msg) {
        // console.log(msg, arguments.slice(1));
    }

    function RendererHPGL(elt, w, h, pInst, isMainCanvas, plotForReal) {
        this.plotForReal = plotForReal;

        this.width = w;
        this.height = h;

        this.operations = [];
        this.transforms = [];

        this.font_width = 2.85;
        this.font_height = 3.75;
        this.font_size = 1;

        this.fill_r_ = 255;
        this.fill_g_ = 255;
        this.fill_b_ = 255;

        // this.debug_rotation = true;
        // this.plotForReal = false;

        // Printer is always rotated 90 degrees
        this.current_transform = new affine.translation(0, 0);
        this.current_state = {
            transform: this.current_transform,
            scale: 1,
            rotation: 0,
        }

        // TODO(jimmy): Work out something about size? Or just say everything is in mm relative to 0, 0
        // TODO(jimmy): Will commands be enqueued before this is initialized?
        const that = this;
        if (plotForReal) {
            window.setTimeout(function() {
                window.electronApi.initializePlotter().then(() => {
                    that.plotter = true;

                    // Don't start the operations heartbear until the plotter is initialized.
                    // We run the heartbeat every 300mS to avoid overwhelming the printer buffer, as the serial
                    // buffer backoff doesn't appear to be working as expected.
                    setInterval(function () {
                        // console.log('Running operations heartbeat');
                        if (that.operations.length === 0) {
                            return;
                        }

                        const op = that.operations.shift();
                        op();
                    }, 100);
                });
            }, 1000);
        } else {
            // console.log('Running in Virtual Plotter mode');
            // Run with a small interval delay so electron has time to process events
            setInterval(function () {
                // console.log('Running operations heartbeat');
                if (that.operations.length === 0) {
                    return;
                }

                const op = that.operations.shift();
                op();
            }, 100);
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
        p5.Renderer2D.prototype._applyDefaults.call(this);
        this.drawingContext.lineWidth = 1.5;
    };

    RendererHPGL.prototype.line = function(x1, y1, x2, y2) {
        this.operations.push(RendererHPGL.prototype.lineAsync.bind(this, x1, y1, x2, y2));
    };

    RendererHPGL.prototype.getPlotterTransform = function() {
        //const base = new affine.translation(-this.width / 2, -this.height / 2);
        //base.leftComposeWith(new affine.rotation((Math.PI / 2)));
        //base.leftComposeWith(new affine.translation(this.height/2, this.width/2));
        //base.leftComposeWith(this.current_transform);


        // const base = new affine.rotation(-0.5);
        // const base = new affine.flipX();

        // V3
        const base = new affine.translation(297 / 2, 420 / 2)
        base.rightComposeWith(new affine.rotation(-Math.PI / 2));
        base.rightComposeWith(new affine.translation(-85, -148.5));

        // V2
        //const base = new affine.translation(-297 / 2, -420 / 2)
        // base.rightComposeWith(new affine.rotation(-Math.PI / 4));
        // base.rightComposeWith(new affine.translation(300, 300));

        // base.rightComposeWith(new affine.flipY());
        // base.leftComposeWith(new affine.flipY());


        //const base = new affine.translation(-279/2, -215);
        //base.rightComposeWith(new affine.rotation((Math.PI / 2)));
        //base.rightComposeWith(new affine.translation(279/2, 215));
        base.rightComposeWith(this.current_state.transform);
        //base.leftComposeWith(new affine.translation(0, this.height/2))
        return base;
    }

    RendererHPGL.prototype.lineAsync = function(x1, y1, x2, y2, opt_noplot, opt_color) {
        // console.log('Calling line');
        if (this.r_ === 255 && this.g_ === 255 && this.b_ === 255) {
            // console.log('Returning from line');
            return;
        }
        // console.log('Part 2')

        // Apply the current transforms (e.g. scale)
        const p1 = this.current_state.transform.transformPair(x1, y1);
        const p2 = this.current_state.transform.transformPair(x2, y2);

        if (opt_color) {
            p5.Renderer2D.prototype.stroke.call(this, opt_color[0], opt_color[1], opt_color[2]);
        }

        p5.Renderer2D.prototype.line.call(this, p1[0], p1[1] ,p2[0], p2[1]);
        p5.Renderer2D.prototype.stroke.call(this, this.r_, this.g_, this.b_);
        dlog('Line Async', this.r_, this.g_, this.b_, p1[0], p1[1], p2[0], p2[1]);
        // console.log(`Drawing a1077 line from ${x1},${y1} to ${x2},${y2}`);

        // Plotter operates with an additional 90 degree rotation
        //const base = this.current_transform.copy();
        //base.rightComposeWith(new affine.rotation(Math.PI / 2));
        //const base = new affine.rotation(Math.PI / 4);

        //const base = new affine.rotation(Math.PI/2);
        const base = this.getPlotterTransform();

        const pp1 = base.transformPair(x1, y1);
        const pp2 = base.transformPair(x2, y2);

        // console.log(`Drawing projected line ${pp1[0]},${pp1[1]} to ${pp2[0]}, ${pp2[1]}`);

        // console.log(opt_noplot, this.plotForReal);

        if (!opt_noplot && this.plotForReal) {
            // console.log('Plotting a line on plotter');
            // this.plotter.selectPen(this.colorToPen(this.r_, this.g_, this.b_));
            window.electronApi.moveTo(pp1[0] / 10, pp1[1] / 10);
            // this.plotter.moveTo(pp1[0] / 10, pp1[1] / 10);

            dlog(`Plotter move to ${pp1[0] / 10}, ${pp1[1] / 10}`)
            window.electronApi.drawLine(pp2[0] / 10, pp2[1] / 10, {});
            // this.plotter.drawLine(pp2[0] / 10, pp2[1] / 10, {
            //    // linePattern: 2,
            //});
        }

        // Render rotated
        //if (this.debugRotation) {
        if (true) {
            p5.Renderer2D.prototype.stroke.call(this, 255, 0, 255);
            p5.Renderer2D.prototype.line.call(this, pp1[0], pp1[1] ,pp2[0], pp2[1]);
            p5.Renderer2D.prototype.stroke.call(this, this.r_, this.g_, this.b_);
        }
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
        p5.Renderer2D.prototype.stroke.call(this, r, g, b, 255);
    }

    RendererHPGL.prototype.fill = function(r, g, b) {
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
        // console.log('**** DRAW RECT');
        this.operations.push(RendererHPGL.prototype.rectAsync.bind(this, this._rectMode, this._doStroke, args));
    };

    // TODO(jimmy): Handle Rect Mode, optional hight and radiused corners
    RendererHPGL.prototype.rectAsync = function(mode, doStroke, args, opt_noplot, opt_color) {
        const x1 = args[0];
        const y1 = args[1];
        const w = args[2];
        const h = args[3];

        // console.log('Rect Async ', mode, doStroke, opt_noplot, opt_color, x1, y1, w, h, this.fill_r_, this.fill_g_, this.fill_b_);
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

        // console.log('Before checking for color');
        if (this.fill_r_ !== 255 || this.fill_g_ !== 255 || this.fill_b_ !== 255) {
            // console.log('Draw inside of rect....');
            // Transform to plotter coordinates
            // Apply the current transforms (e.g. scale)
            const sw = w * this.current_state.scale;
            const sh = h * this.current_state.scale;
            const p1 = this.current_state.transform.transformPair(x1, y1);

            p5.Renderer2D.prototype.stroke.call(this, 0, 0, 0, 0);
            p5.Renderer2D.prototype.rect.call(this, [p1[0], p1[1], sw, sh]);
            p5.Renderer2D.prototype.stroke.call(this, this.r_, this.g_, this.b_, 255);

            const base = this.getPlotterTransform();
            const pp1 = base.transformPair(x1, y1);

            // console.log('*** Drawing rectangle: ', this.debugRotation, this.plotForReal);

            if (this.debugRotation) {
                // console.log('Drawing debug');
                p5.Renderer2D.prototype.stroke.call(this, 0, 0, 0, 0);
                p5.Renderer2D.prototype.rect.call(this, [pp1[0], pp1[1], sh, sw]);
                p5.Renderer2D.prototype.stroke.call(this, this.r_, this.g_, this.b_, 255);
            }

            if ((this.plotter && !opt_noplot) && this.plotForReal) {
                console.log('Drawing rectangle on plotter', this.plotter, !opt_noplot, this.plotForReal);
                // this.plotter.selectPen(this.colorToPen(this.fill_r_, this.fill_g_, this.fill_b_))

                this.electronApi.moveTo(pp1[0] / 10, pp1[1] / 10);
                this.electronApi.drawRectangle(sh / 10, sw / 10,{
                    fillType: 'crosshatch'
                });

                // this.plotter.moveTo(pp1[0] / 10, pp1[1] / 10);
                // this.plotter.drawRectangle(sh / 10, sw / 10,{
                //    fillType: 'crosshatch'
                //});
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
        // console.log('Text', msg);
        this.operations.push(RendererHPGL.prototype.textAsync.bind(this, msg, x, y));
    };

    // TODO(jimmy): Handle Rect Mode, optional hight and radiused corners
    // x, y represent the center of the text
    // TODO(jimmy): Handle alternate textAlign modes
    RendererHPGL.prototype.textAsync = function(msg, x, y) {
        const height = this.font_height * this.font_size * this.current_state.scale;
        const width = this.font_width * this.font_size * this.current_state.scale * msg.length;

        // We adjust by the un-scaled width since this point will be transformed.
        // TODO(jimmy): Suppport center and left align
        //let adjX = x - ((this.font_width * this.font_size * msg.length) / 2);
        //let adjX = x;
        // let adjX = x - ((this.font_width * this.font_size * msg.length));

        // const p1 = this.current_transform.transformPair(adjX, y);
        // const base = this.getPlotterTransform();
        // const pp1 = base.transformPair(adjX, y);

        // Apply the current transforms
        const p1 = this.current_state.transform.transformPair(x, y);
        const base = this.getPlotterTransform();
        const pp1 = base.transformPair(x, y);

        // dlog('Drawing text at ', msg, x, adjX, y, p1[0], p1[1], width, height);
        // console.log('Drawing text at ', msg, x, adjX, y, p1[0], p1[1], width, height);

        if (this.plotter) {
            // this.plotter.selectPen(this.colorToPen(this.r_, this.g_, this.b_));
            window.electronApi.setVelocity(1.0);
            //window.electronApi.moveTo(15, 29);

            // console.log('Moving to: ', pp1[0], pp1[1]);
            window.electronApi.moveTo(pp1[0] / 10, pp1[1] / 10);

            // console.log(this.current_state);
            // console.log('**** Plotting text with size: ', this.font_size * this.current_state.scale, this.font_size, this.current_state.scale, this.current_state.rotation);
            window.electronApi.drawText(msg, {
                rotation: (90 + this.current_state.rotation * (180 / Math.PI)) % 360,
                scale: this.font_size * this.current_state.scale
            });

            // this.plotter.setVelocity(1.0);
            // this.plotter.moveTo(pp1[0] / 10, pp1[1] / 10);
            // this.plotter.drawText(msg, {
            //    rotation: (270 + this.rotation_ * (180 / Math.PI)) % 360,
            //    scale: this.font_size * this.scale_
            // });
            // this.rectAsync('corner', [adjX, y, this.font_width * this.font_size * msg.length, this.font_height * this.font_size]);
        }

        // Draw text extents. We do this in our transformed coordinates so that rotation affects text extents correctly.
        // y -= (this.font_height * this.font_size);

        this.rectAsync('corner', true, [x, y, this.font_width * this.font_size * msg.length, this.font_height * this.font_size], true, [5, 131, 244]);
    };

    RendererHPGL.prototype.translate = function(x, y) {
        this.operations.push(RendererHPGL.prototype.translateAsync.bind(this, x, y));
    };

    RendererHPGL.prototype.translateAsync = function(x, y) {
        const translate = new affine.translation(x, y);
        this.current_state.transform.rightComposeWith(translate);
    };

    RendererHPGL.prototype.scale = function(f1, f2) {
        this.operations.push(RendererHPGL.prototype.scaleAsync.bind(this, f1, f2));
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
        this.operations.push(RendererHPGL.prototype.endShapeAsync.bind(this, mode, vertices));
    };

    RendererHPGL.prototype.endShapeAsync = function(mode, vertices) {
        // console.log(`..........Running end shape with ${vertices.length} points`);
        
        // We only handle standard mode
        // const r = Math.floor(Math.random() * 255);
        // const g = Math.floor(Math.random() * 255);
        // const b = Math.floor(Math.random() * 255);
        // p5.Renderer2D.prototype.stroke.call(this, r, g, b);

        // Simpolify our vertices
        const points = [];
        for (let i = 0; i < vertices.length; ++i) {
            points.push({
                x: vertices[i][0],
                y: vertices[i][1],
            })
        }
        const simplified = simplify(points, 1);
        vertices = [];
        for (let i = 0; i < simplified.length; ++i) {
            vertices.push([
                simplified[i].x,
                simplified[i].y
            ]);
        }

        for (let i = 1; i < vertices.length; ++i) {
            // Apply the current transforms
            const p1 = this.current_state.transform.transformPair(vertices[i-1][0], vertices[i-1][1]);
            const p2 = this.current_state.transform.transformPair(vertices[i][0], vertices[i][1]);
            p5.Renderer2D.prototype.line.call(this, p1[0], p1[1], p2[0], p2[1]);

        }

        const lines = [];
        const base = this.getPlotterTransform();

        for (let i = 1; i < vertices.length; ++i) {
            // Plotter operates with an additional 90 degree rotation
            const p0 = base.transformPair(vertices[i-1][0], vertices[i-1][1]);
            const p1 = base.transformPair(vertices[i][0], vertices[i][1]);

            lines.push(p1[0] / 10);
            lines.push(p1[1] / 10);

            dlog(vertices[i-1][0], vertices[i-1][1], p0[0], p0[1]);
        }

        const p = base.transformPair(vertices[0][0], vertices[0][1]);
        if (this.plotter && this.plotForReal) {
            window.electronApi.moveTo(p[0] / 10, p[1] / 10);
            window.electronApi.drawLines(lines);

            // window.electronApi.moveTo(p[0] / 10, p[1] / 10);
            // window.electronApi.drawLines(lines);
        }

        // console.log('*** NOW DRAWING ROTATED LINES')
        if (true) {
            p5.Renderer2D.prototype.stroke.call(this, 255, 0, 255);
            for (var i = 1; i < vertices.length; ++i) {
                const p1 = base.transformPair(vertices[i-1][0], vertices[i-1][1]);
                const p2 = base.transformPair(vertices[i][0], vertices[i][1]);
                p5.Renderer2D.prototype.line.call(this, p1[0], p1[1] ,p2[0], p2[1]);
            }
            p5.Renderer2D.prototype.stroke.call(this, this.r_, this.g_, this.b_);
        }

        this.vertices = [];
    };

    RendererHPGL.prototype.scaleAsync = function(f1, f2) {
        // console.log('*** SCALE ASYNC', f1, f2);
        const scale = new affine.scaling(f1, f2);
        this.current_state.transform.rightComposeWith(scale);

        dlog(transformToString(this.current_state.transform));

        // We store scale separately since it is a scalar transform and is needed for e.g. fonts
        // TODO(jimmy): Push and pop as needed
        this.current_state.scale = this.current_state.scale * f1;
    };

    RendererHPGL.prototype.applyMatrix = function(a, b, c, d, e, f) {
        this.operations.push(RendererHPGL.prototype.applyMatrixAsync.bind(this, a, b, c, d, e, f));
    };

    RendererHPGL.prototype.applyMatrixAsync = function(a, b, c, d, e, f) {
        const transform = new affine.affine2d(a, c, b, d, e, f);
        this.current_state.transform.rightComposeWith(transform);
    }

    RendererHPGL.prototype.rotate = function(rads) {
        this.operations.push(RendererHPGL.prototype.rotateAsync.bind(this, rads));
    };

    RendererHPGL.prototype.rotateAsync = function(rads) {
        const rotate = new affine.rotation(rads);
        this.current_state.transform.rightComposeWith(rotate);
        this.current_state.rotation = rads;
    };

    // Only circles today - height ignored
    RendererHPGL.prototype.ellipse = function(args) {
        this.operations.push(RendererHPGL.prototype.ellipseAsync.bind(this, args[0], args[1], args[2], args[3]));
    };

    RendererHPGL.prototype.ellipseAsync = function(x, y, dx, dy) {
        const lines = [];
        const segments = 100; //360 * 10;
        const arc = (360 / segments);
        const rx = (dx / 2);
        const ry = (dy / 2);

        for (let i = 0; i <= segments; ++i) {
            const angle = (i * arc);
            const r = angle * (Math.PI / 180);
            let xx = (Math.cos(r) * (rx) + (x + rx));
            let yy = (Math.sin(r) * (ry) + (y + ry));
            lines.push([xx, yy]);
        }

        this.endShapeAsync(null, lines);
    };

    RendererHPGL.prototype.circleAsync = function(x, y, diameter) {
        const lines = [];
        const segments = 100; //360 * 10;
        const arc = (360 / segments);

        for (let i = 0; i <= segments; ++i) {
            const angle = (i * arc);
            const r = angle * (Math.PI / 180);
            let xx = (Math.cos(r) * (diameter / 2)) + (x + (diameter/2));
            let yy = (Math.sin(r) * (diameter / 2)) + (y + (diameter/2));
            lines.push([xx, yy]);
        }

        this.endShapeAsync(null, lines);
    };

    RendererHPGL.prototype.push = function(x, y) {
        this.operations.push(RendererHPGL.prototype.pushAsync.bind(this, x, y));
    };

    RendererHPGL.prototype.pushAsync = function(x, y) {
        // console.log('**** Pushing state', this.current_state);
        this.transforms.push({
            transform: this.current_state.transform.copy(),
            scale: this.current_state.scale,
            rotation: this.current_state.rotation,
        });
    };

    RendererHPGL.prototype.pop = function(x, y) {
        this.operations.push(RendererHPGL.prototype.popAsync.bind(this, x, y));
    };

    RendererHPGL.prototype.popAsync = function(x, y) {
        this.current_state = this.transforms.pop();
    };

    p5.RendererHPGL = RendererHPGL;
};
