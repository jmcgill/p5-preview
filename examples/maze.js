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

const height = 215 * 2;
const width = 279;

const size = 15;
const spacing = size;
const xOffset = (width - (cols * spacing)) / 2;
const yOffset = 30; // (height - (rows * spacing)) / 2;

function setup() {
    Capturer();
    createCanvas(width, height, HPGL);
    rectMode(CENTER);
    ellipseMode(CORNER);

    const gridSpacing = 0.5;
    const gridWidth = 320;
    const gridHeight = 320;

    translate((width - (gridSpacing * (gridWidth - 1))) / 2,
        (height - (gridSpacing * (gridHeight - 1))) / 2);

    for (let i = 0; i < 4000; ++i) {
        const x = Math.floor(Math.random() * gridWidth);
        const y = Math.floor(Math.random() * gridHeight);

        if (x > 80 || y < 240) {
            continue;
        }

        const dir = Math.floor(Math.random() * 4);

        let x1 = x;
        let y1 = y;

        if (dir === 0) {
            x1 -= 1;
            y1 -= 1;
        } else if (dir === 1) {
            x1 += 1;
            y1 -= 1;
        } else if (dir === 2) {
            x1 -= 1;
            y1 += 1;
        } else if (dir === 3) {
            x1 += 1;
            y1 += 1;
        }

        line(x * gridSpacing, y * gridSpacing, x1 * gridSpacing, y1 * gridSpacing);
    }
}

function draw() {

}
