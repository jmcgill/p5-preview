function Capturer() {
  const r = p5.Renderer2D;
  const w = r.prototype._applyDefaults;
  r.prototype._applyDefaults = () => {
    w.call(this._renderer);
    scale(parameters.scale);
    background('white');
    randomSeed(parameters.seed);
    setupComplete();
  }
  return r;

  // Useful for HPGL wrapper
  // consoleDebugWrapClass = (Klass) ->
  // for prop of Klass.prototype
  //     obj = Klass.prototype[prop]
  // if typeof obj is 'function'
  // Klass.prototype[prop] = consoleDebugWrapFunction prop, obj
}

const rows = 15;
const cols = 11;

const height = 842;
const width = 595;

const size = 50;
const spacing = size;
const xOffset = (width - (cols * spacing)) / 2;
const yOffset = 30; // (height - (rows * spacing)) / 2;

const oldCreateCanvas = createCanvas;
createCanvas = function(height, width, renderer) {
  oldCreateCanvas(height * parameters.scale, width * parameters.scale);
}

function setup() {
  Capturer();
  createCanvas(215, 279, HPGL);

  // line(50, 50, 100, 100);
  rect(30, 30, 10, 10);
  rect(185, 30, 10, 10);
  rect(185, 249, 10, 10);
  rect(30, 249, 10, 10);
  //rect(215/2, 279/2, 215, 279);
  // for (var i = 0; i < 4; ++i) {
  //   push();
  //   translate((30 * i) + 20, 50);
  //   rotate(radians(20 * i));
  //
  //   rect(0, 0, 10, 10);
  //   pop();
  // }
}

function draw() {
}