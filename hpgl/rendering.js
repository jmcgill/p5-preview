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

            // Translate so that (0, 0) is the first position at which the plotter can actually draw/reach
            // (This accounts for the left margin on the plotter)
            this.translate(19, 0);
        }
        if (renderer === constants.NoHPGL) {
            var c = graphics.elt;
            this._setProperty('_renderer', new p5.RendererHPGL(c, w, h, this, true, false));
            this._isdefaultGraphics = true;

            // TODO(jimmy): Should this be 10?
            // Adjust the scale to either fit content to the screen or show at 1:1
            let scale = 1;
            if (parameters.scale !== -1) {
                scale = parameters.scale;
            }

            console.log('Resizing to: ', w * scale, h * scale, w, h);
            this._renderer.resize(w * scale, h * scale);
            this._renderer._applyDefaults();
            this.scale(scale);

            // Translate so that (0, 0) is the first position at which the plotter can actually draw/reach
            // this.translate(19, 0);

            // Draw margins. These indicate where the plotter cannot draw.
            p5.Renderer2D.prototype.stroke.call(this._renderer, 255, 0, 0, 0);
            p5.Renderer2D.prototype.fill.call(this._renderer, 255, 0, 0, 128);

            p5.Renderer2D.prototype.rect.call(this._renderer, [276 * scale, 0, 19 * scale, h * scale]);
            p5.Renderer2D.prototype.rect.call(this._renderer, [0, 403 * scale, w * scale, 500]);
        }
        return this._renderer;
    };
};
