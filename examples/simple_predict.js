// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
// implied. See the License for the specific language governing
// permissions and limitations under the License.
/**
 * Author: David Ha <hadavid@google.com>
 *
 * @fileoverview Basic p5.js sketch to show how to use sketch-rnn
 * to finish a fixed incomplete drawings, and loop through multiple
 * endings automatically.
 */

function Capturer() {
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
    // scale(parameters.scale);
    // scale(10.0);
    background('white');
    randomSeed(parameters.seed);
    setupComplete();
  }
  return r;
}

var class_list = ['bird',
  'ant',
  'angel',
  'bee',
  'bicycle',
  'flamingo',
  'flower',
  'mosquito',
  'owl',
  'spider',
  'yoga'];

var strokes=[[-4,0,1,0,0],[-15,9,1,0,0],[-10,17,1,0,0],[-1,28,1,0,0],[14,13,1,0,0],[12,4,1,0,0],[22,1,1,0,0],[14,-11,1,0,0],[5,-12,1,0,0],[2,-19,1,0,0],[-12,-23,1,0,0],[-13,-7,1,0,0],[-14,-1,0,1,0], [0, 0, 0, 1, 0]];

function randomStrokes() {
  let count = Math.floor(random(10));

  const grid = 3;
  strokes = [];

  for (let i = 0; i < 1; ++i) {
    //square();
    //line();
    let type = Math.floor(random(2));
    if (type === 0) {
      line();
    } else {
      circle();
    }
    // line();
  }

  // strokes.push([0, 0, 0, 1, 0]);
}

function line() {
  let grid = 40;

  let x = Math.floor(random(2));
  let y = Math.floor(random(2));
  strokes.push([x * grid, y * grid, 1, 0, 0]);

  let x1 = Math.floor(random(2));
  let y1 = Math.floor(random(2));

  // Line to x, y
  strokes.push([(x - x1) * grid, (y - y1) * grid, 0, 1, 0]);
}

function square() {
  let h = 20; // Math.floor(p.random(30));
  let w = 20; // Math.floor(p.random(30));

  let grid = 10;
  let x = Math.floor(random(10)) * grid;
  let y = Math.floor(random(10)) * grid;

  strokes.push([x, y, 1, 0, 0]);

  // Line to x, y
  strokes.push([w, 0, 1, 0, 0]);
  strokes.push([0, h, 1, 0, 0]);
  strokes.push([-w, 0, 1, 0, 0]);
  strokes.push([0, -h, 0, 0, 0]);
}

function circle() {
  const sides = Math.floor(random(15)) + 4;

  const start = Math.floor(random(sides));
  const arcs = Math.floor(random(sides - start));

  const angle = (2 * Math.PI) / sides;
  let ca = 0;
  const radius = Math.floor(random(40)) + 5;

  // Move to a random location on the grid, this is our circle center;
  let grid = 3;
  let x = Math.floor(random(20)) * grid;
  let y = Math.floor(random(20)) * grid;

  // strokes.push([x, y, 1, 0, 0]);
  for (let i = 0; i <= sides; ++i) {
    let x1 = radius * Math.cos(ca);
    let y1 = radius * Math.sin(ca);
    let dx = x1 - x;
    let dy = y1 - y;

    if (i >= start && i < (start + arcs)) {
      strokes.push([dx, dy, 1, 0, 0]);
    } else {
      strokes.push([dx, dy, 0, 1, 0]);
    }
    x = x1;
    y = y1;
    ca += angle;
  }
}

// sketch_rnn model
var model;
var model_data;
var temperature = 0.25;
var min_sequence_length = 5;

var model_pdf; // store all the parameters of a mixture-density distribution
var model_state, model_state_orig;
var model_prev_pen;
var model_x, model_y;

// variables for the sketch input interface.
var start_x, start_y;
var end_x, end_y;

// UI
var screen_width, screen_height, temperature_slider;
var line_width = 2.0;
var line_color, predict_line_color;

// dom
var model_sel;

var draw_example = function(example, start_x, start_y, line_color) {
  var i;
  var x=start_x, y=start_y;
  var dx, dy;
  var pen_down, pen_up, pen_end;
  var prev_pen = [0, 0, 0];

  for(i=0;i<example.length;i++) {
    // sample the next pen's states from our probability distribution
    [dx, dy, pen_down, pen_up, pen_end] = example[i];

    if (prev_pen[2] == 1) { // end of drawing.
      break;
    }

    // only draw on the paper if the pen is touching the paper
    if (prev_pen[0] == 1) {
      stroke(line_color);
      strokeWeight(line_width);
      line(x, y, x+dx, y+dy); // draw line connecting prev point to current point.
      console.log(`Drawing line from ${x},${y} to ${x+dx},${y+dy}`);
    }

    // update the absolute coordinates from the offsets
    x += dx;
    y += dy;

    // update the previous pen's state to the current one we just sampled
    prev_pen = [pen_down, pen_up, pen_end];
  }

  return [x, y]; // return final coordinates.

};

var clear_screen = function() {
  background(255, 255, 255, 255);
  fill(255, 255, 255, 255);
  noStroke();
  textFont("Courier New");
  fill(0);
  textSize(12);
  text(runName, screen_width-130, screen_height-35);
  stroke(1.0);
  strokeWeight(1.0);
};

let counter = 0;

let offsetX = -55;
let offsetY = -20;
let sscale = 1.0;
let spacing = 35;
var screen_scale_factor = 50.0;
let ww = 4;

var restart = function() {
  // reinitialize variables before calling p5.js setup.
  line_color = color(random(64, 224), random(64, 224), random(64, 224));
  predict_line_color = color(random(64, 224), random(64, 224), random(64, 224));

  // draws original strokes
  // clear_screen();
  scale(sscale);
  let x = counter % ww;
  let y = Math.floor(counter / ww);
  translate((spacing * x) + offsetX, (spacing * y) + offsetY);
  counter += 1;

  if (counter > 16) {
    started = false;
  }
  [end_x, end_y] = draw_example(strokes, start_x, start_y, line_color);

  // copies over the model
  model_state = model.copy_state(model_state_orig);
  model_x = end_x;
  model_y = end_y;
  model_prev_pen = [0, 1, 0];
};

var encode_strokes = function() {
  model_state_orig = model.zero_state();
  // encode strokes
  model_state_orig = model.update(model.zero_input(), model_state_orig);
  for (var i=0;i<strokes.length;i++) {
    model_state_orig = model.update(strokes[i], model_state_orig);
  }
};

let started = false;
let runName = "";
function setup() {
  console.log('**** SETUP IS BEING CALLED');
  Capturer();
  runName = randomWords(2).join('-');

  // if (!fs.existsSync('sketchrnn-outputs')) {
  //   fs.mkdir('sketchrnn-outputs');
  // }
  //
  // if (!fs.existsSync(`sketchrnn-outputs/${runName}`)) {
  //
  // }

  randomStrokes();

  // fs.writeFileSync('test_embedded_fs.json', 'testtest');

  // make sure we enforce some minimum size of our demo
  screen_width = 215;
  screen_height = 279;

  // start drawing from somewhere in middle of the canvas
  start_x = screen_width/2.0;
  start_y = screen_height/3.0;

  // declare sketch_rnn model
  console.log('**** RAW DATA: ', model_raw_data);
  ModelImporter.set_init_model(model_raw_data);
  model_data = ModelImporter.get_model_data();
  model = new SketchRNN(model_data);
  model.set_pixel_factor(screen_scale_factor);

  // model selection
  // model_sel = p.createSelect();
  // model_sel.position(10, screen_height-27);
  // for (var i=0;i<class_list.length;i++) {
  //   model_sel.option(class_list[i]);
  // }
  // model_sel.changed(model_sel_event);

  // temp
  // temperature_slider = p.createSlider(1, 100, temperature*100);
  // temperature_slider.position(95, screen_height-27);
  // temperature_slider.style('width', screen_width-20-95+'px');
  // temperature_slider.changed(temperature_slider_event);

  // make the canvas and clear the screens
  createCanvas(screen_width, screen_height);
  push();
  frameRate(60);

  textFont("Courier New");
  textSize(3);
  fill(50, 50, 50);
  // stroke(color(100, 100, 100));
  text("scribbles #1 / birds", 90, 210);

  encode_strokes();
  restart();
  started = true;

  pop();
  // var model_mode = "gen";
  // var call_back = function(new_model) {
  //   console.log('Running model callback');
  //   model = new_model;
  //   model.set_pixel_factor(screen_scale_factor);
  //   encode_strokes();
  //   restart();
  //   started = true;
  // }
  // ModelImporter.change_model(model, 'ant', model_mode, call_back);
};

// TODO(jimmy): Keep calling in a loop until we get the pen up command, then
// find the center of the bounding box and shift each point so that the middle aligns with the grid.
function draw() {
  if (!started) {
    return;
  }

  push();

  var model_dx, model_dy;
  var model_pen_down, model_pen_up, model_pen_end;

  model_pdf = model.get_pdf(model_state);
  [model_dx, model_dy, model_pen_down, model_pen_up, model_pen_end] = model.sample(model_pdf, temperature);

  if (model_pen_end === 1) {
    restart();
  } else {

    // If our pen is currently down
    if (model_prev_pen[0] === 1) {
      scale(sscale);
      let x = (counter - 1) % ww;
      let y = Math.floor((counter - 1) / ww);
      translate((spacing * x) + offsetX, (spacing * y) + offsetY);
      // draw line connecting prev point to current point.
      stroke(predict_line_color);
      strokeWeight(0.3);
      //line(model_x, model_y, model_x+model_dx, model_y+model_dy);
      vertex(model_x + model_dx, model_y + model_dy);
    } else {
      if (model_pen_down) {
        noFill();
        beginShape();
        vertex(model_x + model_dx, model_y + model_dy);
      }
    }

    if (model_pen_up) {
      endShape();
    }

    model_prev_pen = [model_pen_down, model_pen_up, model_pen_end];
    model_state = model.update([model_dx, model_dy, model_pen_down, model_pen_up, model_pen_end], model_state);

    model_x += model_dx;
    model_y += model_dy;
  }

  pop();
};

// var temperature_slider_event = function() {
//   temperature = temperature_slider.value()/100;
//   clear_screen();
//   draw_example(strokes, start_x, start_y, line_color);
//   console.log("set temperature to "+temperature);
// };
//
// var model_sel_event = function() {
//   var c = model_sel.value();
//   var model_mode = "gen";
//   console.log("user wants to change to model "+c);
//   var call_back = function(new_model) {
//     model = new_model;
//     model.set_pixel_factor(screen_scale_factor);
//     encode_strokes();
//     restart();
//   }
//   ModelImporter.change_model(model, c, model_mode, call_back);
// };
