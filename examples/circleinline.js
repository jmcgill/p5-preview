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

function circleIntersect(r, a, b, c) {
  let e = 0.01;
  let x0 = -a * c / (a * a + b * b)
  let y0 = -b * c / (a * a + b * b);
  if (c*c > r*r*(a*a+b*b)+e) {
    // No points
    return null;
  }
  else if (abs (c*c - r*r*(a*a+b*b)) < e) {
    // 1 point
    return null;
  }
  else {
    let d = r * r - c * c / ( a * a + b * b);
    let mult = Math.sqrt(d / (a * a + b * b));
    let ax = x0 + b * mult;
    let bx = x0 - b * mult;
    let ay = y0 - a * mult;
    let by = y0 + a * mult;
    return {
      x1: ax,
      y1: ay,
      x2: bx,
      y2: by
    }
  }
}

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
  const spacing = 0.75;

  let ox = (width / 2);
  let oy = (height / 2);

  //beginShape(POINTS);
  for (i = 30; i < 249; i+=(2 * spacing)) {
    //vertex(i, 20);

    // Find the radius of the circle at this point.
    //let intersection = circleIntersect(110, 1, 0, i - ox);
    // if (intersection) {
    //   vertex(i, 20);
    //   vertex(i, intersection.y1 + oy);
    //   vertex(i + wobble, intersection.y1 + oy);
    //   vertex(i + wobble, intersection.y2 + oy);
    //   vertex(i, intersection.y2 + oy);
    //   vertex(i, 390);
    //
    //   vertex(i + spacing, 390);
    //   vertex(i + spacing, intersection.y2 + oy);
    //   vertex(i + spacing + wobble, intersection.y2 + oy);
    //   vertex(i + spacing + wobble, intersection.y1 + oy);
    //   vertex(i + spacing, intersection.y1 + oy);
    //   vertex(i + spacing, 20);
    //   vertex(i + (2 * spacing), 20);
    //   //circle(intersection.x1 + ox, intersection.y1 + oy, 10);
    //   //circle(intersection.x2 + ox, intersection.y2 + oy, 10);
    // } else {
      // Straight line
      vertex(i, 20);
      vertex(i, 390);
      vertex(i + spacing, 390);
      vertex(i + spacing, 20);
      vertex(i + (2 * spacing), 20);
    //}


    // vertex(i, 390);
    // vertex(i + spacing, 390);
    // vertex(i + spacing, 20);
    // vertex(i + (2 * spacing), 20);
  }
  endShape();

  for (i = 30; i < 249; i+=spacing) {
    //vertex(i, 20);

    // Find the radius of the circle at this point.
    let intersection = circleIntersect(110, 1, 0, (i - ox));
    if (intersection) {
      line(
        i + (spacing/2),
        intersection.y1 + oy,
        i + (spacing/2),
        intersection.y2 + oy);
    }
  }


  // circle(width/2,height/2,110)
}

function draw() {

}
