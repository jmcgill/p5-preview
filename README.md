# P5 Plotter Preview

This Electron app provides real-time previews of P5.js programs, with the ability to send the output to HPGL driven
pen plotters.

## Development

```
yarn install
yarn build
yarn start /absolute/path/to/p5_sketch.js
```


## Design
The app monitors the provided p5 sketch file, and refreshes on every change.

Plotting capabilities are provided by a custom P5.js renderer. Since HPGL plotters support only a very limited set
of commands, most P5 commands are re-implemented to approximate the output using line segments. To support debugging,
a non-plotting mode in which the output is rendered to the P5 canvas is provided.

This repo includes a forked version of the hpgl.js npm package which includes some small fixes to make it work with
the 7475A pen plotter and to fix some race conditions.

To make a P5.js sketch plottable, setupComplete() must be called after the createCanvas() command. 

The following example draws calibration rectangles (one in each corner) for an A3 page. Note that the plottable area
is slightly smaller than the full page size due to plotter margins.

```
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
```