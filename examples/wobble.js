let requestedHeight = 1, requestedWidth = 1;

function Capturer() {
    const r = p5.Renderer2D;

    const oldCreateCanvas = createCanvas;
    createCanvas = function(width, height, renderer) {
        requestedHeight = height;
        requestedWidth = width;
        console.log('****** Calling wrapped create canvas', requestedHeight, requestedWidth);
        oldCreateCanvas(width, height, renderer);
    }

    const w = r.prototype._applyDefaults;
    r.prototype._applyDefaults = () => {
        w.call(this._renderer);
        // scale(parameters.scale);
        scale(1.0);
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
    Capturer();
    createCanvas(width, height, NoHPGL);
    rectMode(CENTER);
    ellipseMode(CORNER);

    const gridSpacing = 7;
    const gridWidth = 20;
    const gridHeight = 20;

    translate(width / 2, height / 2);

    let r = 50;
    let a = 0.0;

    let oldX = r * Math.cos(0);
    let oldY = r * Math.sin(0);

    for (let i = 1; i < 360; ++i) {
        console.log(a);
        if (a > 0.1) {
            // Be more likely to be negative
            a += 0.1 * (Math.random() - 1.0);
        } else if (a < -0.1) {
            a += 0.1 * (Math.random() - 0.0);
        } else {
            a += 0.1 * (Math.random() - 0.5);
        }
        r += a;

        const rad = i * (Math.PI / 180);
        const x = r * Math.cos(rad);
        const y = r * Math.sin(rad);

        line(oldX, oldY, x, y);

        oldX = x;
        oldY = y;
    }
}

function draw() {

}