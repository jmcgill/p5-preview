let requestedHeight = 1, requestedWidth = 1;

function Capturer() {
    const r = p5.Renderer2D;

    const oldCreateCanvas = createCanvas;
    createCanvas = function(width, height, renderer) {
        requestedHeight = height;
        requestedWidth = width;
        console.log('****** Calling wrapped create canvas', requestedHeight, requestedWidth);
        oldCreateCanvas(width * parameters.scale, height * parameters.scale);
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
    Capturer();
    createCanvas(width, height);
    rectMode(CENTER);

    let angle1 = 0;
    let angle2 = 180;

    let accel1 = ...;
    let accel2 = ...;



    for (let y = 0; y < rows; ++y) {
        for (let x = 0; x < cols; ++x) {
            drawSymbol(x, y);
        }
    }
}

function draw() {
}

function drawSymbol(x, y) {
    let phi = 0.0;
    let mv = 0.0;

    c = 0.3;
    ny = (c * y);

    if (y >= 2) {
        phi = random(-ny, ny);
        mv = phi;
    }

    push();
    translate(xOffset + (x * spacing) + mv + (size / 2), yOffset + (y * spacing) + mv + (size / 2));
    rotate(radians(phi));
    rect(0, 0, size, size);
    pop();
}
