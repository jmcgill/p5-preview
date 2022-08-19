(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var constants = {
    HPGL: 'hpgl',
    NoHPGL: 'nohpgl'
};

module.exports = constants;

},{}],2:[function(require,module,exports){
/**
 * @namespace p5
 */
console.log('Running initialization');
require('./p5.RendererHPGL')(p5);
require('./rendering')(p5);

// Attach constants to p5 instance
var constants = require('./constants');
console.log(p5);
console.log('I am running the HPGL thing...');
Object.keys(constants).forEach(function(k) {
    console.log('Replacing key: ', k);
    p5.prototype[k] = constants[k];
    window[k] = constants[k];
});


},{"./constants":1,"./p5.RendererHPGL":3,"./rendering":4}],3:[function(require,module,exports){
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
                    }, 0);
                });
            }, 1000);
        } else {
            // console.log('Running in Virtual Plotter mode');
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
        for (let i = 1; i < vertices.length; ++i) {
            points.push({
                x: vertices[i][0],
                y: vertices[i][1],
            })
        }
        // const simplified = simplify(points, 10);
        // vertices = [];
        // for (let i = 1; i < simplified.length; ++i) {
        //     vertices.push([
        //         simplified[i].x,
        //         simplified[i].y
        //     ]);
        // }

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

},{"geom2d":5,"simplify-js":8}],4:[function(require,module,exports){
var constants = require('./constants');

module.exports = function(p5) {
    // Patch p5.Graphics for allow a HPGL renderer to be constructed, wrapping the default 2D renderer.
    var _graphics = p5.Graphics;
    p5.Graphics = function(w, h, renderer, pInst) {
        var args = arguments;
        _graphics.apply(this, args);
        if (renderer === constants.NoHPGL) {
            var c = this._renderer.elt;
            this._renderer = new p5.RendererHPGL(c, pInst, false, false); // replace renderer
            c = this._renderer.elt;
            this.elt = c; // replace this.elt

            // Re-Apply defaults
            this._renderer.resize(w, h);
            this._renderer._applyDefaults();
        }
        if (renderer === constants.HPGL) {
            var c = this._renderer.elt;
            this._renderer = new p5.RendererHPGL(c, pInst, false, true); // replace renderer
            c = this._renderer.elt;
            this.elt = c; // replace this.elt

            // Re-Apply defaults
            this._renderer.resize(w, h);
            this._renderer._applyDefaults();
        }
        return this;
    };
    p5.Graphics.prototype = _graphics.prototype;

    /**
     * Patched version of createCanvas
     *
     * use createCanvas(100, 100, SVG) to create SVG canvas.
     *
     * Creates a SVG element in the document, and sets its width and
     * height in pixels. This method should be called only once at
     * the start of setup.
     * @function createCanvas
     * @memberof p5.prototype
     * @param {Number} width - Width (in px) for SVG Element
     * @param {Number} height - Height (in px) for SVG Element
     * @return {Graphics}
     */
    var _createCanvas = p5.prototype.createCanvas;
    p5.prototype.createCanvas = function(w, h, renderer) {
        var graphics = _createCanvas.apply(this, arguments);
        if (renderer === constants.HPGL) {
            var c = graphics.elt;
            this._setProperty('_renderer', new p5.RendererHPGL(c, w, h, this, true, true));
            this._isdefaultGraphics = true;
            this._renderer.resize(w, h);
            this._renderer._applyDefaults();
        }
        if (renderer === constants.NoHPGL) {
            var c = graphics.elt;
            this._setProperty('_renderer', new p5.RendererHPGL(c, w, h, this, true, false));
            this._isdefaultGraphics = true;
            this._renderer.resize(w * 3.7, h * 3.7);
            this._renderer._applyDefaults();
        }
        return this._renderer;
    };
};

},{"./constants":1}],5:[function(require,module,exports){
// Generated by IcedCoffeeScript 1.3.1b
(function() {

  exports.affine = require('./lib/affine');

  exports.polygon = require('./lib/polygon');

}).call(this);

},{"./lib/affine":6,"./lib/polygon":7}],6:[function(require,module,exports){
// Generated by IcedCoffeeScript 1.3.1b
(function() {
  var affine2d, flipX, flipY, reflection, reflectionUnit, rotation, scaling, translation,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.compose = function(a1, a2) {
    var res;
    res = a2.copy();
    res.rightComposeWith(a1);
    return res;
  };

  affine2d = (function() {

    affine2d.name = 'affine2d';

    function affine2d() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length === 0) {
        this.m00 = 1;
        this.m01 = 0;
        this.m10 = 0;
        this.m11 = 1;
        this.v0 = 0;
        this.v1 = 0;
      } else if (args.length === 1) {
        this.m00 = args[0].m00;
        this.m01 = args[0].m01;
        this.m10 = args[0].m10;
        this.m11 = args[0].m11;
        this.v0 = args[0].v0;
        this.v1 = args[0].v1;
      } else {
        this.m00 = args[0];
        this.m01 = args[1];
        this.m10 = args[2];
        this.m11 = args[3];
        this.v0 = args[4];
        this.v1 = args[5];
      }
    }

    affine2d.prototype.oneLineSummary = function() {
      return ("M = [" + (this.m00.toPrecision(3))) + (" " + (this.m01.toPrecision(3))) + (" " + (this.m10.toPrecision(3))) + (" " + (this.m11.toPrecision(3)) + "]   V = (") + ("" + (this.v0.toPrecision(3)) + ", ") + (" " + (this.v1.toPrecision(3)) + ")   scale = ") + this.getXScale().toPrecision(3) + " x " + this.getYScale().toPrecision(3);
    };

    affine2d.prototype.copy = function() {
      return new affine2d(this);
    };

    affine2d.prototype.transformPair = function(v0, v1) {
      var t0, t1;
      t0 = this.m00 * v0 + this.m01 * v1 + this.v0;
      t1 = this.m10 * v0 + this.m11 * v1 + this.v1;
      return [t0, t1];
    };

    affine2d.prototype.transformVec = function(a) {
      var t0, t1;
      t0 = this.m00 * a[0] + this.m01 * a[1] + this.v0;
      t1 = this.m10 * a[0] + this.m11 * a[1] + this.v1;
      a[0] = t0;
      return a[1] = t1;
    };

    affine2d.prototype.rightComposeWith = function(a) {
      /*
          Typically when you have an affine A and you want to 
          perform another affine on it, use this.
          In other words:
            A.rightComposeWith(B)
            performs the composition B(A) and replaces A with the results.
      */

      var t_m00, t_m01, t_m10, t_m11, t_v0, t_v1;
      t_m10 = a.m00 * this.m10 + a.m10 * this.m11;
      t_m11 = a.m01 * this.m10 + a.m11 * this.m11;
      t_v1 = a.v0 * this.m10 + a.v1 * this.m11 + this.v1;
      t_m00 = a.m00 * this.m00 + a.m10 * this.m01;
      t_m01 = a.m01 * this.m00 + a.m11 * this.m01;
      t_v0 = a.v0 * this.m00 + a.v1 * this.m01 + this.v0;
      this.m00 = t_m00;
      this.m01 = t_m01;
      this.m10 = t_m10;
      this.m11 = t_m11;
      this.v0 = t_v0;
      return this.v1 = t_v1;
    };

    affine2d.prototype.leftComposeWith = function(a) {
      /*
          A.leftComposeWith(B)
          performs the composition A(B) and replaces A with the results
      */

      var t_m00, t_m01, t_m10, t_m11, t_v0, t_v1;
      t_m10 = this.m00 * a.m10 + this.m10 * a.m11;
      t_m11 = this.m01 * a.m10 + this.m11 * a.m11;
      t_v1 = this.v0 * a.m10 + this.v1 * a.m11 + a.v1;
      t_m00 = this.m00 * a.m00 + this.m10 * a.m01;
      t_m01 = this.m01 * a.m00 + this.m11 * a.m01;
      t_v0 = this.v0 * a.m00 + this.v1 * a.m01 + a.v0;
      this.m00 = t_m00;
      this.m01 = t_m01;
      this.m10 = t_m10;
      this.m11 = t_m11;
      this.v0 = t_v0;
      return this.v1 = t_v1;
    };

    affine2d.prototype.getXScale = function() {
      return Math.sqrt(this.m00 * this.m00 + this.m10 * this.m10);
    };

    affine2d.prototype.getYScale = function() {
      return Math.sqrt(this.m01 * this.m01 + this.m11 * this.m11);
    };

    affine2d.prototype.getXCenter = function() {
      return this.v0;
    };

    affine2d.prototype.getYCenter = function() {
      return this.v1;
    };

    return affine2d;

  })();

  rotation = (function(_super) {

    __extends(rotation, _super);

    rotation.name = 'rotation';

    function rotation(r) {
      rotation.__super__.constructor.call(this, Math.cos(r), -Math.sin(r), Math.sin(r), Math.cos(r), 0, 0);
    }

    return rotation;

  })(affine2d);

  scaling = (function(_super) {

    __extends(scaling, _super);

    scaling.name = 'scaling';

    function scaling(sx, sy) {
      scaling.__super__.constructor.call(this, sx, 0, 0, sy, 0, 0);
    }

    return scaling;

  })(affine2d);

  translation = (function(_super) {

    __extends(translation, _super);

    translation.name = 'translation';

    function translation(x, y) {
      translation.__super__.constructor.call(this, 1, 0, 0, 1, x, y);
    }

    return translation;

  })(affine2d);

  reflectionUnit = (function(_super) {

    __extends(reflectionUnit, _super);

    reflectionUnit.name = 'reflectionUnit';

    function reflectionUnit(ux, uy) {
      reflectionUnit.__super__.constructor.call(this, 2.0 * ux * ux - 1.0, 2.0 * ux * uy, 2.0 * ux * uy, 2.0 * uy * uy - 1.0, 0.0, 0.0);
    }

    return reflectionUnit;

  })(affine2d);

  reflection = (function(_super) {

    __extends(reflection, _super);

    reflection.name = 'reflection';

    function reflection(r) {
      reflection.__super__.constructor.call(this, Math.cos(r, Math.sin(r)));
    }

    return reflection;

  })(reflectionUnit);

  flipX = (function(_super) {

    __extends(flipX, _super);

    flipX.name = 'flipX';

    function flipX() {
      flipX.__super__.constructor.call(this, -1, 0, 0, 1, 0, 0);
    }

    return flipX;

  })(affine2d);

  flipY = (function(_super) {

    __extends(flipY, _super);

    flipY.name = 'flipY';

    function flipY() {
      flipY.__super__.constructor.call(this, 1, 0, 0, -1, 0, 0);
    }

    return flipY;

  })(affine2d);

  exports.affine2d = affine2d;

  exports.rotation = rotation;

  exports.scaling = scaling;

  exports.translation = translation;

  exports.reflectionUnit = reflectionUnit;

  exports.reflection = reflection;

  exports.flipX = flipX;

  exports.flipY = flipY;

}).call(this);

},{}],7:[function(require,module,exports){
// Generated by IcedCoffeeScript 1.3.1b
(function() {
  var affine, polygon;

  affine = require('./affine');

  polygon = (function() {

    polygon.name = 'polygon';

    function polygon(vertices) {
      if (vertices != null) {
        this.vertices = vertices;
      } else {
        this.vertices = [];
      }
    }

    polygon.prototype.copy = function() {
      var new_v, v, _i, _len, _ref;
      new_v = [];
      _ref = this.vertices;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        new_v.push(v.copy());
      }
      return new polygon(new_v);
    };

    polygon.prototype.addVertex = function(v) {
      return this.vertices.push(v);
    };

    polygon.prototype.transform = function(aff) {
      var v, _i, _len, _ref, _results;
      _ref = this.vertices;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        _results.push(aff.transformVec(v));
      }
      return _results;
    };

    polygon.prototype.getBoundingRectangle = function() {
      /*
          returns a pair of pairs; 
          for example: [[1,2],[3,5]] 
          means that  1 <= x <= 3
                  and 2 <= y <= 5
          for all points
      */

      var i, v, x, _i, _len, _ref;
      x = null;
      _ref = this.vertices;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        v = _ref[i];
        if (i === 0) {
          x = [[v[0], v[1]], [v[0], v[1]]];
        } else {
          if (v[0] < x[0][0]) x[0][0] = v[0];
          if (v[0] > x[1][0]) x[1][0] = v[0];
          if (v[1] < x[0][1]) x[0][1] = v[1];
          if (v[1] > x[1][1]) x[1][1] = v[1];
        }
      }
      return x;
    };

    return polygon;

  })();

  exports.polygon = polygon;

  exports.factory = {
    unitSquare: function() {
      return new polygon([[0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]]);
    },
    unitCircleApprox: function(num) {
      var i, p, radian_increment, radians, _i;
      radian_increment = 2.0 * Math.PI / num;
      radians = 0;
      p = new polygon();
      for (i = _i = 0; 0 <= num ? _i < num : _i > num; i = 0 <= num ? ++_i : --_i) {
        radians += radian_increment;
        p.addVertex([0.5 * Math.cos(radians), 0.5 * Math.sin(radians)]);
      }
      return p;
    }
  };

}).call(this);

},{"./affine":6}],8:[function(require,module,exports){
/*
 (c) 2017, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/

(function () { 'use strict';

// to suit your point format, run search/replace for '.x' and '.y';
// for 3D version, see 3d branch (configurability would draw significant performance overhead)

// square distance between 2 points
function getSqDist(p1, p2) {

    var dx = p1.x - p2.x,
        dy = p1.y - p2.y;

    return dx * dx + dy * dy;
}

// square distance from a point to a segment
function getSqSegDist(p, p1, p2) {

    var x = p1.x,
        y = p1.y,
        dx = p2.x - x,
        dy = p2.y - y;

    if (dx !== 0 || dy !== 0) {

        var t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = p2.x;
            y = p2.y;

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = p.x - x;
    dy = p.y - y;

    return dx * dx + dy * dy;
}
// rest of the code doesn't care about point format

// basic distance-based simplification
function simplifyRadialDist(points, sqTolerance) {

    var prevPoint = points[0],
        newPoints = [prevPoint],
        point;

    for (var i = 1, len = points.length; i < len; i++) {
        point = points[i];

        if (getSqDist(point, prevPoint) > sqTolerance) {
            newPoints.push(point);
            prevPoint = point;
        }
    }

    if (prevPoint !== point) newPoints.push(point);

    return newPoints;
}

function simplifyDPStep(points, first, last, sqTolerance, simplified) {
    var maxSqDist = sqTolerance,
        index;

    for (var i = first + 1; i < last; i++) {
        var sqDist = getSqSegDist(points[i], points[first], points[last]);

        if (sqDist > maxSqDist) {
            index = i;
            maxSqDist = sqDist;
        }
    }

    if (maxSqDist > sqTolerance) {
        if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
        simplified.push(points[index]);
        if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
}

// simplification using Ramer-Douglas-Peucker algorithm
function simplifyDouglasPeucker(points, sqTolerance) {
    var last = points.length - 1;

    var simplified = [points[0]];
    simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);

    return simplified;
}

// both algorithms combined for awesome performance
function simplify(points, tolerance, highestQuality) {

    if (points.length <= 2) return points;

    var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

    points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
    points = simplifyDouglasPeucker(points, sqTolerance);

    return points;
}

// export as AMD module / Node module / browser or worker variable
if (typeof define === 'function' && define.amd) define(function() { return simplify; });
else if (typeof module !== 'undefined') {
    module.exports = simplify;
    module.exports.default = simplify;
} else if (typeof self !== 'undefined') self.simplify = simplify;
else window.simplify = simplify;

})();

},{}]},{},[2]);
