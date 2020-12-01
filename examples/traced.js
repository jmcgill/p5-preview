let requestedHeight = 1, requestedWidth = 1;

// function Capturer() {
//     const r = p5.Renderer2D;
//
//     const oldCreateCanvas = createCanvas;
//     createCanvas = function(width, height, renderer) {
//         requestedHeight = height;
//         requestedWidth = width;
//         console.log('****** Calling wrapped create canvas', requestedHeight, requestedWidth);
//         oldCreateCanvas(width, height, renderer);
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

const size = 15;
const spacing = size;
const xOffset = (width - (cols * spacing)) / 2;
const yOffset = 30; // (height - (rows * spacing)) / 2;

function setup() {
  // Capturer();
  createCanvas(width, height, HPGL);

  rectMode(CENTER);
  ellipseMode(CORNER);
  setupComplete();

  // Initialize the first line
  const segments = 250;
  const segmentLength = height / 200;
  const line = [];
  const xPositions = [];
  const bias = [];

  // The first line has only truly vertical segments
  for (let i = 0; i < segments; ++i) {
    line.push(Math.PI / 2);
    xPositions.push(40);
    bias.push(0);
  }

  // 88419289312

  stroke(0, 0, 0);
  strokeWeight(0.2);
  // const seed = parameters.seed;
  const seed = 48645782581;
  randomSeed(seed);
  noiseSeed(seed);

  // Trace each line
  for (let x = 0; x < 500; ++x) {
    let n = random(200);
    let prevLine = [...line];

    let x1 = 40 + (2 * x);
    let y1 = 0;

    let drawing = false;
    for (let i = 0; i < segments; ++i) {
      const prev = prevLine[i];

      const angleMax = (Math.PI / 32);
      const delta = (noise(n) - (0.5 - (bias[i] * 0.05))) * angleMax;

      // const delta = 0;

      line[i] = prev + delta;
      n += 0.05;

      x1 = x1 + segmentLength * Math.cos(prev + delta);
      y1 = y1 + segmentLength * Math.sin(prev + delta);

      bias[i] = x1 - xPositions[i];

      xPositions[i] = x1;


      if (x1 > (width - 40)) {
        if (drawing) {
          endShape();
          drawing = false
        }
      }

      if (y1 > (height - 57)) {
        if (drawing) {
          endShape();
          drawing = false
        }
      }

      if (x1 < (width - 40) && y1 < (height - 57) && y1 > 23) {
        if (!drawing) {
          beginShape(POINTS);
          drawing = true;
        }

        vertex(x1, y1);
      }

    }
    endShape();
  }
}

function draw() {

}
