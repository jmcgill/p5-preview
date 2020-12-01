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

  stroke(255, 255, 0);
  const spacing = 0.5;
  beginShape(POINTS);
  for (i = 30; i < 249; i+=(2 * spacing)) {
    vertex(i, 20);
    vertex(i, 390);
    vertex(i + spacing, 390);
    vertex(i + spacing, 20);
    vertex(i + (2 * spacing), 20);
  }
  endShape();
}

function draw() {

}
