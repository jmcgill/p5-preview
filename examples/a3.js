let requestedHeight = 1, requestedWidth = 1;

let scales = 3.7;

const rows = 15;
const cols = 11;

//const height = 215 * 2;
//const width = 279;
const width = 279;
const height = 430;

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
    // rectMode(CENTER);
    ellipseMode(CENTER);
    randomSeed(84093169606);

    stroke(0, 0, 255);
    // rect(10, 10, width - 20, height - 20);
    // rect(width / 2, height / 2, width - 50, height - 50);
    //const h = 400;
    // const w = 23;
    //rect (40, 10 + (h / 2), w, h)
    // text('ABCDEFGHIJK', width / 2, (height / 2) - 50);
    // text('klmnopqrst', width / 2, (height / 2) - 30);
    // rect(width / 2, (height / 2) + 20, 240, 383);

    textSize(5);
    text('HELLO WORLD', width / 2, height / 2 - 20);

    // rect((width / 2) + 60, (height / 2), 50, 50);
    //line(10, 0, 10, 10);
    // line(139.5, 215, 139.5, 215);
    // circle(width / 2, height / 2, 50)
    // line(0, 10, 10, 20);
    // line(10, 0, 20, 10);

    // rect(1, 1, 1, 1);
    // rect(3, 1, 1, 1);
    // rect(1, 3, 1, 1);
    // rect(214, 1, 1, 1);
    // rect(1, 279, 1, 1);
    // circle(width / 2, height / 2, 1);
    //rect(width / 2, height / 2, width - 50, height - 50);
}

function draw() {

}
