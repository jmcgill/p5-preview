const hpgl = require('../../hpgl/hpgl.js');
const affine  = require('geom2d').affine;
const SerialPort = require("serialport");
const fs = require('fs');

module.exports = function(p5) {
    /**
     * @namespace RendererHPGL
     * @constructor
     * @param {Element} elt canvas element to be replaced
     * @param {p5} pInst p5 Instance
     * @param {Bool} isMainCanvas
     */
    function RendererHPGL(elt, pInst, isMainCanvas, plotForReal) {
        // TODO(jimmy): Configurable log
        console.log('Initializing HPGL renderer');

        this.operations = [];
        this.transforms = [];

        // Printer is always rotated 90 degrees
        this.current_transform = new affine.rotation(0);

        // TODO(jimmy): Work out something about size? Or just say everything is in mm relative to 0, 0
        // TODO(jimmy): Will commands be enqueued before this is initialized?
        const that = this;

        console.log('Registering plotter transport');

        if (plotForReal) {
            this.plotter = new hpgl.Plotter();
            const transport = new SerialPort('/dev/tty.usbserial-AK070I5T', {autoOpen: false});
            this.plotter.on("error", function (err) {
                console.log('Plotter error: ', err);
            }).connect(transport, {}, function (error) {
                console.log('Connected to plotter');
                if (error) {
                    console.log(error);
                    return;
                }

                this.selectPen(1);

                setInterval(function () {
                    console.log('Running operations heartbeat');
                    if (that.operations.length === 0) {
                        return;
                    }

                    const op = that.operations.shift();
                    op();
                }, 10);
            });
        } else {
            console.log('Running in Virtual Plotter mode');
            setInterval(function () {
                console.log('Running operations heartbeat');
                if (that.operations.length === 0) {
                    return;
                }

                const op = that.operations.shift();
                op();
            }, 10);
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
        this.drawingContext.lineWidth = 1;
    };

    RendererHPGL.prototype.line = function(x1, y1, x2, y2) {
        console.log('Line');
        this.operations.push(RendererHPGL.prototype.lineAsync.bind(this, x1, y1, x2, y2));
    };

    RendererHPGL.prototype.lineAsync = function(x1, y1, x2, y2) {
        console.log('Line Async');

        // Apply the current transforms
        const p1 = this.current_transform.transformPair(x1, y1);
        const p2 = this.current_transform.transformPair(x2, y2);

        p5.Renderer2D.prototype.line.call(this, p1[0], p1[1] ,p2[0], p2[1]);
        console.log(`Drawing a line from ${x1},${y1} to ${x2},${y2}`);

        // Plotter operates with an additional 90 degree rotation
        //const base = this.current_transform.copy();
        //base.rightComposeWith(new affine.rotation(Math.PI / 2));
        //const base = new affine.rotation(Math.PI / 4);
        const base = new affine.translation(215 / 2, 279 / 2);
        base.rightComposeWith(new affine.rotation(Math.PI / 2));
        base.rightComposeWith(new affine.translation(-140, -170));
        base.rightComposeWith(this.current_transform);
        const pp1 = base.transformPair(x1, y1);
        const pp2 = base.transformPair(x2, y2);

        if (this.plotter) {
            this.plotter.moveTo(pp1[0] / 10, pp1[1] / 10);
            this.plotter.drawLine(pp2[0] / 10, pp2[1] / 10);
        }
        //p5.Renderer2D.prototype.line.call(this, pp1[0], pp1[1] ,pp2[0], pp2[1]);
        return this;
    };

    RendererHPGL.prototype.rect = function(x1, y1, w, h) {
        console.log('Rect');
        this.operations.push(RendererHPGL.prototype.rectAsync.bind(this, x1, y1, w, h));
    };

    // TODO(jimmy): Handle Rect Mode, optional hight and radiused corners
    RendererHPGL.prototype.rectAsync = function(args) {
        const x1 = args[0];
        const y1 = args[1];
        const w = args[2];
        const h = args[3];

        console.log('Rect Async ', x1, y1, w, h);
        const offset = [0, 0];
        const hw = w / 2;
        const hh = h / 2;

        const p1 = [x1 + offset[0] - hw, y1 + offset[0] - hh];
        const p2 = [x1 + offset[0] + hw, y1 + offset[0] - hh];
        const p3 = [x1 + offset[0] + hw, y1 + offset[0] + hh];
        const p4 = [x1 + offset[0] - hw, y1 + offset[0] + hh];

        this.lineAsync(p1[0], p1[1] ,p2[0], p2[1]);
        this.lineAsync(p2[0], p2[1] ,p3[0], p3[1]);
        this.lineAsync(p3[0], p3[1] ,p4[0], p4[1]);
        this.lineAsync(p4[0], p4[1] ,p1[0], p1[1]);
        return this;
    };

    RendererHPGL.prototype.translate = function(x, y) {
        console.log('Translate');
        this.operations.push(RendererHPGL.prototype.translateAsync.bind(this, x, y));
    };

    RendererHPGL.prototype.translateAsync = function(x, y) {
        console.log('Translate Async');
        const translate = new affine.translation(x, y);
        this.current_transform.rightComposeWith(translate);
    };

    RendererHPGL.prototype.rotate = function(rads) {
        console.log('Rotate');
        this.operations.push(RendererHPGL.prototype.rotateAsync.bind(this, rads));
    };

    RendererHPGL.prototype.rotateAsync = function(rads) {
        console.log('Rotate Async');
        const rotate = new affine.rotation(rads);
        this.current_transform.rightComposeWith(rotate);
    };

    RendererHPGL.prototype.push = function(x, y) {
        this.operations.push(RendererHPGL.prototype.pushAsync.bind(this, x, y));
    };

    RendererHPGL.prototype.pushAsync = function(x, y) {
        this.transforms.push(this.current_transform.copy());
    };

    RendererHPGL.prototype.pop = function(x, y) {
        this.operations.push(RendererHPGL.prototype.popAsync.bind(this, x, y));
    };

    RendererHPGL.prototype.popAsync = function(x, y) {
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
