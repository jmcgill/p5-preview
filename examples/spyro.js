let requestedHeight = 1, requestedWidth = 1;

let scales = 3.7;

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
  createCanvas(width, height, NoHPGL);
  // scale(3.7);
  setupComplete();

  // scale(scales);
  rectMode(CENTER);
  ellipseMode(CENTER);
  randomSeed(84093169606);
  scale(4);

  const config = [
    { radius: 40, speed: 0.1 },
    { radius: 5, speed: 0.1 * (40 / 5) },
  ];

  let angles = [];

  // Initialize angles
  for (let i = 0; i < config.length; ++i) {
    angles.push(0);
  }

  let R = 50;
  let r = 10;
  let a = 37.5;

  let ox = width / 2;
  let oy = height / 2;

  beginShape(POINTS);
  for (let t = 0; t < 3000; t += 0.1) {
    let x = ((R-r) * Math.cos((r/R) * t)) + (a * Math.cos((1 - (r/R)) * t));
    let y = ((R-r) * Math.sin((r/R) * t)) + (a * Math.sin((1 - (r/R)) * t));

    // let x = width / 2;
    // let y = height / 2;
    // for (let i = 0; i < config.length; ++i) {
    //   const angle = angles[i];
    //   const c = config[i];
    //   x = x + (c.radius * Math.cos(angle));
    //   y = y + (c.radius * Math.sin(angle));
    //   //circle(x, y, c.radius)
    //   angles[i] += c.speed;
    // }
    // vertex(x, y);
    vertex(x + ox, y + oy);
  }
  endShape();
}

function draw() {

}
