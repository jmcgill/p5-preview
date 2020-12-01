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

const height = 279;
const width = 215;

const size = 15;
const spacing = size;
const xOffset = (width - (cols * spacing)) / 2;
const yOffset = 30; // (height - (rows * spacing)) / 2;

function setup() {
    // Capturer();
    createCanvas(width, height, NoHPGL);

    rectMode(CENTER);
    ellipseMode(CORNER);
    setupComplete();


    seedy = 01290487009814093847;
    randomSeed(seedy);
    noiseSeed(seedy);

    var centX = 0;
    var centY = 0;
    var radius = 50;
    var x, y;
    var lastx = -999;
    var lasty = -999;
    var radiusNoise = random(10);

    let its = [];

    for (var l = 0; l < 15; ++l) {
        var radius = random(30) + 30;
        var radiusNoise = random(20);
        let xs = [];
        let ys = [];
        let a = random() * 360;

        let minX = 999;
        let minY = 999;
        let maxX = 0;
        let maxY = 0;

        for (ang = 0; ang <= 360; ang += 1) {
            radiusNoise += 0.005;

            // radius += 0.5;
            const n = random() * radiusNoise; //noise(radiusNoise);
            const n2 = noise(radiusNoise);
            // console.log(n, n2, radiusNoise);

            var thisRadius = radius + (n2 * 100) - 50;
            var rad = radians(a);

            x = centX + (thisRadius * cos(rad));
            y = centY + (thisRadius * sin(rad));

            xs.push(x);
            ys.push(y);

            if (x > maxX) {
                maxX = x;
            }
            if (x < minX) {
                minX = x;
            }

            if (y > maxY) {
                maxY = y;
            }
            if (y < minY) {
                minY = y;
            }
            a += 1;
            //if (lastx > -999) {
            //line(x,y,lastx,lasty);
            //}

            //lastx = x;
            //lasty = y;
        }
        its.push({
            xs: xs,
            ys: ys,
            minX: minX,
            maxX: maxX,
            minY: minY,
            maxY: maxY
        });
    }



    for (var l = 0; l < its.length; ++l) {
        let xs = its[l].xs;
        let ys = its[l].ys;

        const middleX = its[l].minX + ((its[l].maxX - its[l].minX) / 2);
        const middleY = its[l].minY + ((its[l].maxY - its[l].minY) / 2);

        push();
        translate((width / 2) - middleX, (height / 2) - middleY);

        beginShape(POINTS);
        for (var i = 0; i < xs.length; ++i) {
            vertex(xs[i], ys[i]);
            //line(xs[i - 1], ys[i - 1], xs[i], ys[i]);
        }
        endShape();
        pop();
    }

    // text(0, 0, parameters.seed);
    console.log(parameters);
}

function draw() {

}
