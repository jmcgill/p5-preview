// This example can be used to validate the four plottable extremes on a piece of A3 paper. It draws a small square
// in each corner.
async function setup() {
    createCanvas(A3.width, A3.height, HPGL);
    setupComplete();

    stroke(0, 0, 0);
    rectMode(CORNER);

    // Top Left
    rect(0, 0, 2, 2);

    // Top Right
    rect(A3.plottable_width - 2, 0, 2, 2);

    // Bottom Left
    rect(0, A3.plottable_height - 2, 2, 2);

    // Bottom Right
    rect(A3.plottable_width - 2, A3.plottable_height - 2, 2, 2);
}

function draw() {
}
