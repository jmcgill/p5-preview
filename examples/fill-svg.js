function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4, log) {

    //
    // if (totalCount === 178) {
    //     stroke(255, 255, 0);
    //     line(x1, y1, x2, y2);
    //     stroke(255, 0, 0);
    //     line(x3, y3, x4, y4);
    // }

    x12 = x1 - x2;
    x34 = x3 - x4;

    y12 = y1 - y2;
    y34 = y3 - y4;

    // Ignore common origins
    if (Math.abs(x1 - x3) < 0.01 && Math.abs(y1 - y3) < 0.1) {
        return {x: x1, y: y1};
    }
    if (Math.abs(x1 - x4) < 0.01 && Math.abs(y1 - y4) < 0.1) {
        //return false;
        return {x: x1, y: y1};
    }
    if (Math.abs(x2 - x3) < 0.01 && Math.abs(y2 - y3) < 0.1) {
        //return false;
        return {x: x2, y: y2};
    }
    if (Math.abs(x2 - x4) < 0.01 && Math.abs(y2 - y4) < 0.1) {
        return {x: x2, y: y2};
        //return false;
    }

    if (log) { console.log('GOT HERE'); }
    c = (x12 * y34) - (y12 * x34);
    if (Math.abs(c) < 0.01) {
        // No intersection
        return false;
    } else {
        if (log) { console.log('MAYBE?'); console.log(x1, y1, x2, y2, x3, y3, x4, y4); }

        // if (totalCount === 178) {
        //     stroke(255, 0, 255);
        //     line(x1, y1, x2, y2);
        // }

        // Intersection
        a = x1 * y2 - y1 * x2;
        b = x3 * y4 - y3 * x4;

        x = (a * x34 - b * x12) / c;
        y = (a * y34 - b * y12) / c;

        // if (totalCount === 178) {
        //     circle(x, y, 1);
        // }

        // Intersection point must be within the bounds of line 1
        if (((x1 - x) < -0.1 && (x2 - x) < -0.1) ||
            ((x1 - x) > 0.1 && (x2 - x) > 0.1)) {
            return false;
        }

        if (((x3 - x) < -0.1 && (x4 - x) < -0.1) ||
            ((x3 - x) > 0.1 && (x4 - x) > 0.1)) {
            return false;
        }

        // if ((x < x1 || x > x2) && (y < y1 || y > y2)) {
        //     if (totalCount === 178) {
        //         console.log('Not inside bounds 1');
        //         console.log(x, y, x1, y1, x2, y2);
        //     }
        //     return false;
        // }
        //
        // if ((x < x3 || x > x4) && (y < y3 || y > y4)) {
        //     if (totalCount === 178) console.log('Not inside bounds 2');
        //     return false;
        // }



        // DRAW INTERSECTING LINES
        // stroke(255, 0, 0);
        // line(x1, y1, x2, y2);
        // console.log(x1, y1, x2, y2);
        // stroke(0, 255, 0);
        // line(x3, y3, x4, y4);
        // console.log(x3, y3, x4, y4);
        // // running = false;
        // console.log(Math.abs(x1 - x3));
        // console.log('AND C WAS: ', Math.abs(c));
        return {
            x, y
        }
    }
}

function drawIntersectingLine(lines, x1, y1, x2, y2, log) {
    const intersections = [];
    for (let i = 0; i < lines.length; ++i) {
        let o = linesIntersect(x1, y1, x2, y2, lines[i].x1, lines[i].y1, lines[i].x2, lines[i].y2, log);
        if (o) {
            intersections.push(o)
        }
    }

    intersections.sort(function (a, b) {
        return Math.hypot(x1 - a.x, y1 - a.y)  - Math.hypot(x1 - b.x, y1 - b.y);
    });

    let inShape = false;
    let cx = x1;
    let cy = y1;
    if (log) {
        console.log('INTERSECTIONS ARE');
        console.log(intersections);
        circle(intersections[0].x, intersections[0].y, 5);
        line(x1, y1, x2, y2);
        // console.log(x1, y1, x2, y2, x3, y3, x4, y4);
    }
    for (let i = 0; i < intersections.length; ++i) {
        if (inShape) {
            line(cx, cy, intersections[i].x, intersections[i].y);
        }
        inShape = !inShape;
        cx = intersections[i].x;
        cy = intersections[i].y;
    }

    if (intersections.length > 0) {
        return {
            x: cx,
            y: cy
        }
    } else {
        return {
            x: x2,
            y: y2,
        }
    }
}

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

    createCanvas(width, height, NoHPGL);
    //const data = fs.readFileSync('/Users/jimmy/src/p5-preview/examples/fill.svg');
    const data = fs.readFileSync('/Users/jimmy/Desktop/bonded_filled.svg');

    setupComplete();

    stroke(0, 0, 0);
    rectMode(CENTER);
    ellipseMode(CENTER);
    randomSeed(84093169606);

    const parser = new DOMParser();
    const svg = parser.parseFromString(data, "text/xml");
    const paths = svg.getElementsByTagName("path");


    let ox = 200;
    let oy = 200;

    let x = 0;
    let y = 0;

    scale(0.25);

    const polygons = svg.getElementsByTagName("polygon");
    for (let polygon of polygons) {
        const code = polygon.getAttribute('points');
        const cp = code.split(/(?=[ ])/);
        const components = [];
        for (let i = 0; i < cp.length; ++i) {
            components.push(parseFloat(cp[i]));
        }

        lines = [];
        let minx = 999999;
        let miny = 999999;
        let maxy = 0;

        beginShape(POINTS);
        for (var i = 0; i < components.length - 2; i += 2) {
            lines.push({
                x1: components[i] + ox,
                y1: components[i + 1] + oy,
                x2: components[i + 2] + ox,
                y2: components[i + 3] + oy
            })

            if (components[i] < minx) {
                minx = components[i] + ox;
            }
            if (components[i + 1] < miny) {
                miny = components[i + 1] + oy;
            }

            if (components[i + 1] > maxy) {
                maxy = components[i + 1] + oy;
            }

            vertex(components[i] + ox, components[i + 1] + oy);
        }
        lines.push({
            x1: components[components.length - 2] + ox,
            y1: components[components.length - 1] + oy,
            x2: components[0] + ox,
            y2: components[1] + oy
        })
        vertex(components[components.length - 2]  + ox, components[components.length - 1] + oy);
        vertex(components[0] + ox, components[1] + oy);
        // endShape();

        // Uncomment to draw outline
        // for (var idx = 0; idx < lines.length; ++idx) {
        //     line(lines[idx].x1, lines[idx].y1, lines[idx].x2, lines[idx].y2);
        // }

        let cx = minx - 50;
        let cy = maxy;
        let height = Math.abs(miny - maxy);
        let mode = false;
        let angle = Math.PI;

        for (let i = 0; i < 60; ++i) {
            let nx = cx + (height * Math.sin(angle));
            let ny = cy + (height * Math.cos(angle));

            const o = drawIntersectingLine(lines, cx, cy, nx, ny, false);
            //line(cx, cy, nx, ny);
            cx += 5;
            // cx = o.x;
            // cy = o.y;
            // if (mode) {
            //     angle = Math.PI / 2  + (Math.PI);
            // } else {
            //     angle = -(Math.PI);
            // }
            // mode = !mode;
        }
    }
}

function draw() {
}
