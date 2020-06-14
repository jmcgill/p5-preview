let requestedHeight = 1, requestedWidth = 1;

function Capturer() {
    const r = p5.Renderer2D;

    const oldCreateCanvas = createCanvas;
    createCanvas = function(width, height, renderer) {
        requestedHeight = height;
        requestedWidth = width;
        console.log('****** Calling wrapped create canvas', requestedHeight, requestedWidth);
        oldCreateCanvas(width * parameters.scale, height * parameters.scale, renderer);
    }

    const w = r.prototype._applyDefaults;
    r.prototype._applyDefaults = () => {
        w.call(this._renderer);
        scale(parameters.scale);
        background('white');
        randomSeed(parameters.seed);
        setupComplete();
    }
    return r;
}

const rows = 15;
const cols = 11;

const height = 279;
const width = 215;

const size = 15;
const spacing = size;
const xOffset = (width - (cols * spacing)) / 2;
const yOffset = 30; // (height - (rows * spacing)) / 2;

function setup() {
    console.log('*** SCALE', parameters.scale);
    Capturer();
    createCanvas(width, height, NoHPGL);

    background('red');
    translate(20, 20);
    // line(0, 0, 60, 100);
    line(0, 0, 215, 279);
    text("TEST", 60, 200);
}

function draw() {
}