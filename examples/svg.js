

let requestedHeight = 1, requestedWidth = 1;

let scales = 3.7;
let ox = 10;
let oy = -120;

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
    let intersections = [];
    for (let i = 0; i < lines.length; ++i) {
        let o = linesIntersect(x1, y1, x2, y2, lines[i].x1, lines[i].y1, lines[i].x2, lines[i].y2, log);
        if (o) {
            intersections.push(o)
        }
    }
    console.log('*** FOUND ', intersections.length, ' intersections ');

    intersections.sort(function (a, b) {
        return Math.hypot(x1 - a.x, y1 - a.y)  - Math.hypot(x1 - b.x, y1 - b.y);
    });

    // Remove intersections that are really close. This could be caused by noisy lines.
    if (intersections.length > 0) {
        let lastIntersection = intersections[0];
        let filteredIntersections = [intersections[0]];
        for (var i = 1; i < intersections.length; ++i) {
            let distance = Math.hypot(lastIntersection.x - intersections[i].x, lastIntersection.y - intersections[i].y);
            console.log(`Distance from ${i - 1} to ${i} is ${distance}`);
            if (Math.abs(distance) < 1) {
                console.log('Skipping intersection')
                continue;
            }
            filteredIntersections.push(intersections[i]);
            lastIntersection = intersections[i];
        }

        intersections = filteredIntersections;
    }

    let inShape = false;
    let cx = x1;
    let cy = y1;
    // if (log) {
    //     console.log('INTERSECTIONS ARE');
    //     console.log(intersections);
    //     circle(intersections[0].x, intersections[0].y, 5);
    //     circle(intersections[1].x, intersections[1].y, 5);
    //     line(x1, y1, x2, y2);
    //     // console.log(x1, y1, x2, y2, x3, y3, x4, y4);
    // }
    for (let i = 0; i < intersections.length; ++i) {
        if (inShape) {
            // TODO(jimmy): Why are these offsets what they are?
            // TODO(jimmy): Need to read offsets from parent groups
            let xx = -61;
            let yy = -198;
            line(cx + xx, cy + yy, intersections[i].x + xx, intersections[i].y + yy);
        }
        inShape = !inShape;
        console.log(intersections[i]);
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

function compareColor(a, b) {
}

function setup() {
    DRAW_COLOR = '#010202';

    createCanvas(width, height, HPGL);
    const data = fs.readFileSync('/Users/jimmy/Desktop/cas9_simplified.svg');
    //const data = fs.readFileSync('/Users/jimmy/src/layout/out.svg');
    //const data = fs.readFileSync('/Users/jimmy/src/p5-preview/font/A.svg');

    setupComplete();

    stroke(0, 0, 0);
    // rectMode(CENTER);
    ellipseMode(CENTER);
    randomSeed(84093169606);

    const parser = new DOMParser();
    const svg = parser.parseFromString(data, "text/xml");
    const paths = svg.getElementsByTagName("path");

    let x = 0;
    let y = 0;

    // translate(200, 200)
    rectMode(CENTER);
    // rect(width / 2, (height / 2) - 20, width - 50, height - 50);
    //rect(width / 2, (height / 2), 240, 383);
    // rect(width / 2, (height / 2), width, height);
    // rect(height / 2, (width / 2), height, width);
    rectMode(CORNER);
    // rect(50, 50, 50, 50);
    //return;
    // return;

    // scale(0.0005);
    // scale(0.001);
    //scale(0.00004);
    // translate(3000000, 3000000);

    //translate(50, 50)
    translate(30, 10)
    //scale(0.25);
    //scale(0.045);
    scale(0.2)
    //scale(1);
    //scale(0.2);
    //translate(20, 20);
    //scale(10);

    let lines = [];

    // const polygons = svg.getElementsByTagName("polygon");
    // for (let polygon of polygons) {
    //     const code = polygon.getAttribute('points');
    //     const cp = code.split(/(?=[ ])/);
    //     const components = [];
    //     for (let i = 0; i < cp.length; ++i) {
    //         components.push(parseFloat(cp[i]));
    //     }
    //
    //     lines = [];
    //     let minx = 999999;
    //     let miny = 999999;
    //     let maxy = 0;
    //
    //     //beginShape(POINTS);
    //     for (var i = 0; i < components.length - 2; i += 2) {
    //         lines.push({
    //             x1: components[i] - ox,
    //             y1: components[i + 1] - oy,
    //             x2: components[i + 2] - ox,
    //             y2: components[i + 3] - oy
    //         })
    //
    //         if (components[i] < minx) {
    //             minx = components[i] - ox;
    //         }
    //         if (components[i + 1] < miny) {
    //             miny = components[i + 1] - oy;
    //         }
    //
    //         if (components[i + 1] > maxy) {
    //             maxy = components[i + 1] - oy;
    //         }
    //
    //         vertex(components[i] - ox, components[i + 1] - oy);
    //     }
    //     // Ensure the shape is closed.
    //     lines.push({
    //         x1: components[components.length - 2] - ox,
    //         y1: components[components.length - 1] - oy,
    //         x2: components[0] - ox,
    //         y2: components[1] - oy
    //     })
    //     //vertex(components[components.length - 2] - ox, components[components.length - 1] - oy);
    //     //vertex(components[0] - ox, components[1] - oy);
    //     //endShape();
    //
    //     // Uncomment to draw outline
    //     // for (var idx = 0; idx < lines.length; ++idx) {
    //     //     line(lines[idx].x1, lines[idx].y1, lines[idx].x2, lines[idx].y2);
    //     // }
    //
    //     let cx = minx - 100;
    //     let cy = maxy;
    //     let height = (Math.abs(miny - maxy)) + 100;
    //     let mode = false;
    //     let angle = Math.PI;
    //
    //     for (let i = 0; i < 60; ++i) {
    //         let nx = cx + (height * Math.sin(angle));
    //         let ny = cy + (height * Math.cos(angle));
    //
    //         const o = drawIntersectingLine(lines, cx, cy, nx, ny, false);
    //
    //         // line(cx - 70, cy - 80, nx - 70, ny - 80);
    //         cx += 5;
    //         // cx = o.x;
    //         // cy = o.y;
    //         // if (mode) {
    //         //     angle = Math.PI / 2  + (Math.PI);
    //         // } else {
    //         //     angle = -(Math.PI);
    //         // }
    //         // mode = !mode;
    //     }
    // }
    //

    // <line id="SvgjsLine1059" x1="588" y1="1260" x2="588" y2="3516" stroke="#000000" stroke-width="1"/>
    // lines = svg.getElementsByTagName("line");
    // for (let l of lines) {
    //     const x1 = parseInt(l.getAttribute('x1'), 10);
    //     const y1 = parseInt(l.getAttribute('y1'), 10);
    //     const x2 = parseInt(l.getAttribute('x2'), 10);
    //     const y2 = parseInt(l.getAttribute('y2'), 10);
    //     const st = l.getAttribute('stroke') || '#000000';
    //     const sw = parseInt(l.getAttribute('stroke-width'), 10);
    //
    //     if (st !== DRAW_COLOR) {
    //         continue;
    //     }
    //
    //     // stroke(color(st));
    //     line(x1 - ox, y1 - oy, x2 - ox, y2 - oy);
    // }

    let count = 0;
    // // TODO(jimmy): Are rects always in center mode?
    const rects = svg.getElementsByTagName("rect");
    for (let r of rects) {
        const x = parseInt(r.getAttribute('x'), 10);
        const y = parseInt(r.getAttribute('y'), 10);
        const width = parseInt(r.getAttribute('width'), 10);
        const height = parseInt(r.getAttribute('height'), 10);
        const st = r.getAttribute('stroke') || '#000000';
        const sw = parseInt(r.getAttribute('stroke-width'), 10);

        if (st !== DRAW_COLOR) {
            continue;
        }

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

    // const texts = svg.getElementsByTagName("text");
    // stroke(0, 0, 0);
    // for (let t of texts) {
    //     // TODO(jimmy): Handle text anchor other than middle
    //     let x = parseInt(t.getAttribute('x'), 10) || 0;
    //     let y = parseInt(t.getAttribute('y'), 10) || 0;
    //     //x += ox;
    //     //y += 500;
    //     let fontSize = parseInt(t.getAttribute('font-size'), 10);
    //     let transform = t.getAttribute('transform');
    //     const spans = t.getElementsByTagName("tspan");
    //     let yOffset = 0;
    //     for (let s of spans) {
    //         x = x + (parseInt(s.getAttribute('x'), 10) || 0) + (parseInt(s.getAttribute('dx'), 10) || 0);
    //         y = y + (parseInt(s.getAttribute('y'), 10) || 0) + (parseInt(s.getAttribute('dy'), 10) || 0);
    //
    //         // HACK: Treat all transforms as rotate 90 degrees
    //         push();
    //         // // We subtract half line height
    //         //
    //         textSize(fontSize / 5);
    //         translate(x, y);
    //         if (transform) {
    //             rotate(PI / 2);
    //         } else {
    //             rotate(PI);
    //         }
    //         translate(0, yOffset)
    //         // console.log('Text is: ', s.innerHTML)
    //         text(s.innerHTML, 0, 0);
    //         pop();
    //         // rotate(-PI / 2);
    //         yOffset -= (5 * fontSize);
    //     }
    // }


    const polylines = svg.getElementsByTagName("polyline");
    for (let p of polylines) {
        const points  = p.getAttribute('points');
        const components = points.split(' ');
        const st  = p.getAttribute('stroke') || '#000000';
        if (st !== DRAW_COLOR) {
            continue;
        }

        beginShape(POINTS);
        for (var i = 0; i < components.length; i += 2) {
            vertex(components[i] - ox, components[i + 1] - oy);
        }
        endShape();
    }

    for (let path of paths) {
        const code = path.getAttribute('d');
        const components = code.split(/(?=[A-Za-z])/);
        const st  = p.getAttribute('stroke') || '#000000';
        if (st !== DRAW_COLOR) {
            continue;
        }

        beginShape(POINTS);
        for (let component of components) {
            if (component[0] === 'M') {
                const p = component.substr(1).split(',');
                x = parseFloat(p[0], 10) - ox;
                y = parseFloat(p[1], 10) - oy;
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
