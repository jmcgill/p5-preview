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
