let requestedHeight = 1, requestedWidth = 1;

let scales = 3.7;

// function Capturer() {
//     const r = p5.Renderer2D;
//
//     const oldCreateCanvas = createCanvas;
//     createCanvas = function(width, height, renderer) {
//         requestedHeight = height;
//         requestedWidth = width;
//         console.log('****** Calling wrapped create canvas', requestedHeight, requestedWidth);
//         oldCreateCanvas(width * scales, height * scales, renderer);
//     }
//
//     const w = r.prototype._applyDefaults;
//     r.prototype._applyDefaults = () => {
//         w.call(this._renderer);
//         // scale(parameters.scale);
//         scale(1.0);
//         background('white');
//         randomSeed(parameters.seed);
//         setupComplete();
//     }
//     return r;
// }

const rows = 15;
const cols = 11;

const height = 215 * 2;
const width = 279;
//const height = 279;
//const width = 215;

const size = 15;
const spacing = size;
const xOffset = (width - (cols * spacing)) / 2;
const yOffset = 30; // (height - (rows * spacing)) / 2;


function setup() {
    // Capturer();
    createCanvas(width, height, HPGL);
    // scale(3.7);
    setupComplete();

    // scale(scales);
    rectMode(CENTER);
    ellipseMode(CENTER);
    randomSeed(84093169606);



    let angle1 = 0;
    let angle2 = 180;

    let accel1 = 0.1;
    let accel2 = 0.1;

    let radius = 110;
    const ox = (width/2);
    const oy = (height/2);
    stroke(255, 255, 0);

    for (i = 0; i < 50000; ++i) {

        angle1 += accel1;
        angle2 += accel2;

        accel1 += (Math.random() * 0.2);
        accel2 += (Math.random() * 0.2);

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
    console.log('CENTER IS: ', ox, oy);
    circle(ox, oy, radius * 2);
}

function draw() {

}
