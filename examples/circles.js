let requestedHeight = 1, requestedWidth = 1;

// parameters.scale = 1.0;

function Capturer() {
    parameters.scale = 1.0;
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
        //scale(parameters.scale);
        //scale(1.0);
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
    createCanvas(500, 500, NoHPGL);

    rectMode(CENTER);
    ellipseMode(CENTER);
    // strokeWeight(0.3);

    randomSeed(72422985186);

    let angle1 = 0;
    let angle2 = 180;

    let accel1 = 0.1;
    let accel2 = 0.1;

    let radius = 25;
    let spacing = (2 * radius) + 5;
    let lastIterations = 0;

    for (y = 0; y < 3; ++y) {
        for (x = 0; x < 3; ++x) {
            let ox = (x * spacing) + (width / 2) - (spacing);
            let oy = (y * spacing) + (height / 2) - (spacing);
            circle(ox, oy, radius * 2);

            let count = random() * ((((3 * y) + x) + 0) * 300);
            while (count < lastIterations) {
                count = random() * ((((3 * y) + x) + 0) * 300);
            }
            lastIterations = count;
            for (i = 0; i < count; ++i) {

                angle1 += accel1;
                angle2 += accel2;

                accel1 += (random() * 0.2);
                accel2 += (random() * 0.2);

                if (i % 50 === 0) {
                    const a1 = angle1 * (Math.PI / 180);
                    const a2 = angle2 * (Math.PI / 180);
                    const x1 = Math.cos(a1) * radius;
                    const y1 = Math.sin(a1) * radius;
                    const x2 = Math.cos(a2) * radius;
                    const y2 = Math.sin(a2) * radius;
                    line(x1 + ox, y1 + oy, x2 + ox, y2 + oy);
                }
            }

        }
    }

    // Actual center
    // stroke(255, 0, 0);
    // circle(width / 2, height / 2, 20);

    // console.log('CENTER IS: ', ox, oy);
    // circle(ox, oy, radius * 2);
}

function draw() {

}