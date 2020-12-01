

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

const size = 15;
const spacing = size;
const xOffset = (width - (cols * spacing)) / 2;
const yOffset = 30; // (height - (rows * spacing)) / 2;

function getPoint(t, c1, c2, c3, c4) {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    return (c1 * mt3) + (3 * c2 * mt2 * t) + (3 * c3 * mt * t2) + (c4 * t3);
}

function curveToLines(x1, y1, x2, y2, c1x, c1y, c2x, c2y) {
    const segments = 10;
    const step = (1.0 / segments);
    const out = [];
    for (var i = 0; i < segments; ++i) {
        const t = (i * step);
        const x = getPoint(t, x1, c1x, c2x, x2);
        const y = getPoint(t, y1, c1y, c2y, y2);
        out.push({
            x, y
        });
    }
    return out;
}

function setup() {
    // Capturer();

    createCanvas(width, height, HPGL);
    //const data = fs.readFileSync('/Users/jmcgill/Desktop/test2.svg');
    const data = fs.readFileSync('/Users/jimmy/src/layout/out.svg');
    //const data = fs.readFileSync('/Users/jimmy/src/p5-preview/font/A.svg');

    setupComplete();

    stroke(0, 0, 0);
    // rectMode(CENTER);
    ellipseMode(CENTER);
    randomSeed(84093169606);

    const parser = new DOMParser();
    const svg = parser.parseFromString(data, "text/xml");
    const paths = svg.getElementsByTagName("path");

    let ox = 200;
    let oy = 0;

    let x = 0;
    let y = 0;

    // translate(200, 200)
    rectMode(CENTER);
    // rect(width / 2, (height / 2) - 20, width - 50, height - 50);
    //rect(width / 2, (height / 2), 240, 383);
    // rect(width / 2, (height / 2), width, height);
    // rect(height / 2, (width / 2), height, width);
    rectMode(CORNER);
    //return;
    // return;

    // scale(0.0005);
    // scale(0.001);
    //scale(0.00004);
    // translate(3000000, 3000000);

    //translate(50, 50)
    translate(30, 10)
    //scale(0.25);
    scale(0.045);
    //translate(20, 20);
    //scale(10);


    // <line id="SvgjsLine1059" x1="588" y1="1260" x2="588" y2="3516" stroke="#000000" stroke-width="1"/>
    const lines = svg.getElementsByTagName("line");
    for (let l of lines) {
        const x1 = parseInt(l.getAttribute('x1'), 10);
        const y1 = parseInt(l.getAttribute('y1'), 10);
        const x2 = parseInt(l.getAttribute('x2'), 10);
        const y2 = parseInt(l.getAttribute('y2'), 10);
        const st = l.getAttribute('stroke');
        const sw = parseInt(l.getAttribute('stroke-width'), 10);

        stroke(color(st));
        line(x1, y1, x2, y2);
    }

    let count = 0;
    // TODO(jimmy): Are rects always in center mode?
    const rects = svg.getElementsByTagName("rect");
    for (let r of rects) {
        const x = parseInt(r.getAttribute('x'), 10);
        const y = parseInt(r.getAttribute('y'), 10);
        const width = parseInt(r.getAttribute('width'), 10);
        const height = parseInt(r.getAttribute('height'), 10);
        const st = r.getAttribute('stroke');
        const sw = parseInt(r.getAttribute('stroke-width'), 10);

        console.log('STROKE WIDTH IS ', r.getAttribute('id'));
        if (sw === 0) {
            // noStroke();
            stroke(255, 255, 255); // Same as no stroke
            fill(0, 255, 0);
            rect(x, y, width, height);
        } else {
            // stroke(color(st));
            stroke(0, 255, 0);
            fill(255, 255, 255);
            rect(x, y, width, height);
        }

        count += 1;
    }
    return;

    const texts = svg.getElementsByTagName("text");
    stroke(0, 0, 0);
    for (let t of texts) {
        // TODO(jimmy): Handle text anchor other than middle
        let x = parseInt(t.getAttribute('x'), 10);
        let y = parseInt(t.getAttribute('y'), 10);
        let fontSize = parseInt(t.getAttribute('font-size'), 10);
        let transform = t.getAttribute('transform');
        const spans = t.getElementsByTagName("tspan");
        let yOffset = 0;
        for (let s of spans) {
            // x = x + (s.getAttribute('x') || 0) + (s.getAttribute('dx') || 0);
            // y = y + (s.getAttribute('y') || 0) + (s.getAttribute('dy') || 0);

            // HACK: Treat all transforms as rotate 90 degrees
            push();
            // We subtract half line height

            textSize(fontSize);
            translate(x, y);
            if (transform) {
                rotate(PI / 2);
            } else {
                rotate(PI);
            }
            translate(0, yOffset)

            text(s.innerHTML, 0, 0);
            pop();
            // rotate(-PI / 2);
            yOffset -= (5 * fontSize);
        }
    }

    for (let path of paths) {
        const code = path.getAttribute('d');
        const components = code.split(/(?=[A-Za-z])/);
        console.log(components);

        beginShape(POINTS);
        for (let component of components) {
            if (component[0] === 'M') {
                const p = component.substr(1).split(',');
                x = parseFloat(p[0], 10) - ox;
                y = parseFloat(p[1], 10) - oy;
                console.log('Moving to ', x, y);
            } else if (component[0] === 'l') {
                let m = component.substr(1).replace(/-/g, ',-');
                if (m[0] === ',') {
                    m = m.slice(1);
                }
                const p = m.split(',');
                const x1 = parseFloat(p[0], 10);
                const y1 = parseFloat(p[1], 10);
                //line(x, y, x + x1, y + y1);
                vertex(x, y);
                vertex(x + x1, y + y1);
                console.log('Line from ', x, y, ' to ', x1, y1);
                x = x + x1;
                y = y + y1;
            } else if (component[0] === 'c') {
                let m = component.substr(1).replace(/-/g, ',-');
                if (m[0] === ',') {
                    m = m.slice(1);
                }
                const p = m.split(',');
                const c1x = parseFloat(p[0], 10) + x;
                const c1y = parseFloat(p[1], 10) + y;
                const c2x = parseFloat(p[2], 10) + x;
                const c2y = parseFloat(p[3], 10) + y;
                const x2 = parseFloat(p[4], 10) + x;
                const y2 = parseFloat(p[5], 10) + y;
                console.log('Curve: ', x, y, x2, y2, c1x, c1y, c2x, c2y);
                const steps = curveToLines(x, y, x2, y2, c1x, c1y, c2x, c2y);
                for (let i = 0; i < steps.length; ++i) {
                    vertex(steps[i].x, steps[i].y);
                    // line(steps[i-1].x, steps[i-1].y, steps[i].x, steps[i].y);
                }
                x = x2;
                y = y2;
            } else if (component[0] === 'C') {
            let p = component.substr(1).replace(/-/g, ',-').split(',');
            const c1x = parseFloat(p[0], 10) - ox;
            const c1y = parseFloat(p[1], 10) - oy;
            const c2x = parseFloat(p[2], 10) - ox;
            const c2y = parseFloat(p[3], 10) - oy;
            const x2 = parseFloat(p[4], 10) - ox;
            const y2 = parseFloat(p[5], 10) - oy;
            console.log('Curve: ', x, y, x2, y2, c1x, c1y, c2x, c2y);
            const steps = curveToLines(x, y, x2, y2, c1x, c1y, c2x, c2y);
            for (let i = 0; i < steps.length; ++i) {
                vertex(steps[i].x, steps[i].y);
                // line(steps[i-1].x, steps[i-1].y, steps[i].x, steps[i].y);
            }
            x = x2;
            y = y2;
        }
        }
        endShape();
    }
}

function draw() {
}
