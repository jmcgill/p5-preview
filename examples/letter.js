let requestedHeight = 1, requestedWidth = 1;
let scales = 3.7;

const oldPop = pop;
const oldPush = push;

let depth = 0;

function push() {
    depth += 1;
    console.log('Pushing, new depth is', depth);
    oldPush();
}
window['push'] = push;

function pop() {
    depth -= 1;
    console.log('Popping, new depth is', depth);
    oldPop();
}
window['pop'] = pop;

const letter = `Dear Emily and Kristian,

As I'm writing this, Nat has Covid, but is starting to feel a lot better. So far, I feel fine, and I have my fingers crossed that I dodge it again. We had to defer the UK trip, but hopefully we can go later in the year.

We have a few visitors coming up, after a fairly quiet 2.5 years! Allie Becker is doing a trip around America and stopping by New York. One of Nat's close friends, Dana, is going to be staying with us for most of October.

I'm still designing & building a million things; the 3D printer has been running nearly non-stop since I got it, and I have a few pieces of furniture that I'm wrapping up at the workshop. I haven't done a lot of _finishing_ projects recently, but I hope to finish off a few projects in August (fingers crossed).

I wrapped up my intermediate Neon Sign course a few weeks ago - I still have a long way to go, but I'm much better at making curves, and can now make
signs in almost any color. If only I had somewhere to hang them all!

Nat continues to cook up a storm. She briefly tried getting into embroidery, but it wasn't for her.

The LIC Crime Spree continues; our building has formed a neighborhood watch because of the number of car breakins on our street. I am very glad that our new car is safe and sound in an indoor garage. 

Other highlights in New York from June/July:

- Nat and I went to an 'undersea' themed immersive production in Bushwhick. Nat described it as a "kindergarten music therapy for adults", which I think was fair! It was extremely relaxing and enjoyable.

We saw Into the Woods on Broadway for my 36th birthday. Sarah Bareilles was outstanding, but the real highlights were Delphi Borich as Little Red Riding Hood and Kennedy Kanagawa as Milky White the cow (an incredible puppet, full of emotion!).

A Ninja Warrior, Parkour and Trampoline gym has opened up in Greenpoint - you better believe I've joined! Time to brush off my tumbling skills.

We've seen a number of great concerts at 

We're taking plenty of advantage of NY Summer, with plenty of trips upstate and to the beach to hike & swim. Picking the right beach has been a bit tough, with closures for both shark sightings and some sort of bacteria. Keeps us guessing! On my last trip upstate, I spent time hanging out with baby goats, friendly donkeys and a bunch of horses. It's very nice to be able to get out of the city.

Love,
James and Nat`;

function filterMap(elements, targetType, fn, args) {
    for (const e of elements) {
        const type = e.nodeName;
        if (type !== targetType) {
            continue;
        }

        fn.apply(null, [e, ...args]);
    }
}

function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4, log) {
    x12 = x1 - x2;
    x34 = x3 - x4;

    y12 = y1 - y2;
    y34 = y3 - y4;

    // Ignore common origins
    if (Math.abs(x1 - x3) < 0.01 && Math.abs(y1 - y3) < 0.1) {
        return {x: x1, y: y1};
    }
    if (Math.abs(x1 - x4) < 0.01 && Math.abs(y1 - y4) < 0.1) {
        return {x: x1, y: y1};
    }
    if (Math.abs(x2 - x3) < 0.01 && Math.abs(y2 - y3) < 0.1) {
        return {x: x2, y: y2};
    }
    if (Math.abs(x2 - x4) < 0.01 && Math.abs(y2 - y4) < 0.1) {
        return {x: x2, y: y2};
    }

    c = (x12 * y34) - (y12 * x34);
    if (Math.abs(c) < 0.01) {
        // No intersection
        return false;
    } else {
        // Intersection
        a = x1 * y2 - y1 * x2;
        b = x3 * y4 - y3 * x4;

        x = (a * x34 - b * x12) / c;
        y = (a * y34 - b * y12) / c;

        // Intersection point must be within the bounds of line 1
        if (((x1 - x) < -0.1 && (x2 - x) < -0.1) ||
            ((x1 - x) > 0.1 && (x2 - x) > 0.1)) {
            return false;
        }

        if (((x3 - x) < -0.1 && (x4 - x) < -0.1) ||
            ((x3 - x) > 0.1 && (x4 - x) > 0.1)) {
            return false;
        }

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

    intersections.sort(function (a, b) {
        return Math.hypot(x1 - a.x, y1 - a.y)  - Math.hypot(x1 - b.x, y1 - b.y);
    });

    // Remove intersections that are really close. This could be caused by noisy lines.
    if (intersections.length > 0) {
        let lastIntersection = intersections[0];
        let filteredIntersections = [intersections[0]];
        for (var i = 1; i < intersections.length; ++i) {
            let distance = Math.hypot(lastIntersection.x - intersections[i].x, lastIntersection.y - intersections[i].y);
            if (Math.abs(distance) < 1) {
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

    if (log) {
        circle(intersections[0].x, intersections[0].y, 5);
        circle(intersections[1].x, intersections[1].y, 5);
        line(x1, y1, x2, y2);
    }

    for (let i = 0; i < intersections.length; ++i) {
        if (inShape) {
            // TODO(jimmy): Why are these offsets what they are?
            // TODO(jimmy): Need to read offsets from parent groups
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

function getPoint(t, c1, c2, c3, c4) {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    return (c1 * mt3) + (3 * c2 * mt2 * t) + (3 * c3 * mt * t2) + (c4 * t3);
}

function curveToLines(x1, y1, x2, y2, c1x, c1y, c2x, c2y) {
    const segments = 20;
    const step = (1.0 / segments);
    const out = [];
    for (var i = 0; i <= segments; ++i) {
        const t = (i * step);
        const x = getPoint(t, x1, c1x, c2x, x2);
        const y = getPoint(t, y1, c1y, c2y, y2);
        out.push({
            x, y
        });
    }
    return out;
}

function quadraticGetPoint(t, c1, c2, c3) {
    const t2 = t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    return (c1 * mt2) + (2 * t * mt * c2) + (t2 * c3)
}

// Quadratic has only a single control p;oint
function quadraticCurveToLines(x1, y1, x2, y2, c1x, c1y) {
    const segments = 20;
    const step = (1.0 / segments);
    const out = [];
    for (var i = 0; i <= segments; ++i) {
        const t = (i * step);


        const x = quadraticGetPoint(t, x1, c1x, x2);
        const y = quadraticGetPoint(t, y1, c1y, y2);
        out.push({
            x, y
        });
    }
    return out;
}

function drawPolygon(polygon, state) {
    console.log('DRAWING POLYGON')
    const code = polygon.getAttribute('points').trim().replace(/\s+/g, ' ');
    const cp = code.split(/(?=[,\s+])/);
    console.log(cp)
    const components = [];
    for (let i = 0; i < cp.length; ++i) {
        components.push(parseFloat(cp[i].replace(',', '')));
    }
    console.log(components);

    // Merge state
    //let stroke = polygon.getAttribute('stroke') || state.stroke;
    let stroke = "#ff0000";
    //const strokeWidth = parseInt(polygon.getAttribute('stroke-width'), 10) || state.strokeWidth;
    const strokeWidth = 1;
    const fill = polygon.getAttribute('fill') || state.fill;

    if (stroke === "none") {
        stroke = null;
    }
    console.log(strokeWidth, stroke);

    const outlinePath = [];
    let minx = 999999;
    let miny = 999999;
    let maxx = 0;
    let maxy = 0;


    if (strokeWidth > 0 && stroke) {
        beginShape();
    }
    for (var i = 0; i < components.length - 2; i += 2) {
        outlinePath.push({
            x1: components[i],
            y1: components[i + 1],
            x2: components[i + 2],
            y2: components[i + 3]
        })

        if (components[i] < minx) {
            minx = components[i];
        }

        if (components[i] > maxx) {
            maxx = components[i];
        }

        if (components[i + 1] < miny) {
            miny = components[i + 1];
        }

        if (components[i + 1] > maxy) {
            maxy = components[i + 1];
        }

        if (strokeWidth > 0 && stroke) {
            vertex(components[i], components[i + 1]);
        }
    }

    // Ensure the shape is closed.
    console.log('PUSHHY')
    outlinePath.push({
        x1: components[components.length - 2],
        y1: components[components.length - 1],
        x2: components[0],
        y2: components[1]
    })
    if (strokeWidth > 0 && stroke) {
        vertex(components[components.length - 2], components[components.length - 1]);
        vertex(components[0], components[1]);
        endShape();
    }

    if (fill) {
        let cx = minx - 100;
        let cy = maxy;
        let height = (Math.abs(miny - maxy)) + 100;
        let width = (Math.abs(minx - maxx)) + 100;
        let angle = Math.PI;
        const spacing = 5;

        for (let i = 0; i < Math.ceil(width / spacing); ++i) {
            let nx = cx + (height * Math.sin(angle));
            let ny = cy + (height * Math.cos(angle));
            const o = drawIntersectingLine(outlinePath, cx, cy, nx, ny, false);
            cx += spacing;
        }
    }
}

// <line id="SvgjsLine1059" x1="588" y1="1260" x2="588" y2="3516" stroke="#000000" stroke-width="1"/>
function drawLine(l) {
    const x1 = parseInt(l.getAttribute('x1'), 10);
    const y1 = parseInt(l.getAttribute('y1'), 10);
    const x2 = parseInt(l.getAttribute('x2'), 10);
    const y2 = parseInt(l.getAttribute('y2'), 10);
    const st = l.getAttribute('stroke');
    const sw = parseInt(l.getAttribute('stroke-width'), 10);

    // if (st) {
    //     stroke(color(st));
    // }
    console.log(`Line ${x1},${y1} to ${x2},${y2}`)
    line(x1, y1, x2, y2);
}

function drawRect(r) {
    let x = 0;
    let y = 0;
    if (r.getAttribute('x')) {
        x = Math.floor(parseFloat(r.getAttribute('x')));
    }
    if (r.getAttribute('y')) {
        y = Math.floor(parseFloat(r.getAttribute('y')));
    }
    const width = parseInt(r.getAttribute('width'), 10);
    const height = parseInt(r.getAttribute('height'), 10);
    const st = r.getAttribute('stroke') || '#000000';
    const sw = parseInt(r.getAttribute('stroke-width'), 10);
    const transform = r.getAttribute('transform');

    console.log('RECT RECT RECT', x, y, r.getAttribute('x'), r);
    push();

    console.log('Transform is: ', transform);
    // matrix(6.825238e-07 1 -1 6.825238e-07 1139.082 31.4954)
    if (transform && transform.indexOf('matrix') !== -1) {
        const t = transform.replace("matrix(", "").replace(")", "")
        const p = t.split(' ');
        for (var i = 0; i < p.length; ++i) {
            p[i] = parseFloat(p[i]);
        }
        console.log(p[0], p[1], p[2], p[3], p[4], p[5])
        applyMatrix(p[0], p[1], p[2], p[3], p[4], p[5]);
    }

    if (st) {
        stroke(color(st));
    }

    if (sw === 0) {
        // Do not draw this line
        stroke(255, 255, 255);
        fill(0, 255, 0);
        console.log('Drawing rect 1', x, y, width, height);
        rect(x, y, width, height);
    } else {
        stroke(0, 255, 0);
        fill(255, 255, 255);
        rect(x, y, width, height);
        console.log('Drawing rect 2', x, y, width, height);
    }
    pop();
}

function drawText(t) {
    // TODO(jimmy): Handle text anchor other than middle
    let x = parseInt(t.getAttribute('x'), 10) || 0;
    let y = parseInt(t.getAttribute('y'), 10) || 0;
    let fontSize = parseInt(t.getAttribute('font-size'), 10);
    let transform = t.getAttribute('transform');
    const spans = t.getElementsByTagName("tspan");
    let yOffset = 0;
    for (let s of spans) {
        x = x + (parseInt(s.getAttribute('x'), 10) || 0) + (parseInt(s.getAttribute('dx'), 10) || 0);
        y = y + (parseInt(s.getAttribute('y'), 10) || 0) + (parseInt(s.getAttribute('dy'), 10) || 0);

        // HACK: Treat all transforms as rotate 90 degrees
        push();
        // // We subtract half line height
        //
        textSize(fontSize / 5);
        translate(x, y);
        if (transform) {
            rotate(PI / 2);
        } else {
            rotate(PI);
        }
        translate(0, yOffset)
        // console.log('Text is: ', s.innerHTML)
        text(s.innerHTML, 0, 0);
        pop();
        // rotate(-PI / 2);
        yOffset -= (5 * fontSize);
    }
}

function drawPolyline(p) {
    const points  = p.getAttribute('points');
    const components = points.split(' ');
    const st  = p.getAttribute('stroke') || '#000000';

    if (st) {
        stroke(color(st));
    }

    beginShape(POINTS);
    for (var i = 0; i < components.length; i += 2) {
        vertex(components[i], components[i + 1]);
    }
    endShape();
}

function drawCircle(p) {
    const x  = parseFloat(p.getAttribute('cx'));
    const y  = parseFloat(p.getAttribute('cy'));
    const r  = parseFloat(p.getAttribute('r'));

    for (var i = 0; i < 6; ++i) {
        const dr = (r / 6) * i;
        circle(x, y, 2 * dr);
    }

}


function drawEllipse(p) {
    const x  = parseFloat(p.getAttribute('cx'));
    const y  = parseFloat(p.getAttribute('cy'));
    const rx  = parseFloat(p.getAttribute('rx'));
    const ry  = parseFloat(p.getAttribute('ry'));

    for (var i = 0; i < 6; ++i) {
        const drx = (rx / 6) * i;
        const dry = (ry / 6) * i;
        ellipse(x, y, 2 * drx, 2 * dry);
    }


}

let count = 0;
function drawPath(path) {
    noFill();
    //if (count < 33 || count > 33) return;
    const code = path.getAttribute('d');
    if (!code) {
        return;
    }

    const components = code.split(/(?=[A-Za-z])/);
    const st  = path.getAttribute('stroke') || '#000000';

    let x0 = null;
    let y0 = null;
    let x = 0;
    let y = 0;
    let lastCommand = null;
    let reflectedControl = null;

    beginShape();
    let inPath = true;
    // for (var i = 0; i < 590; ++i) {
    //     let component = components[i];
    for (let component of components) {
        console.log(component[0]);
        if (component[0] === 'M') {
            console.log('M!');
            // endShape();
            // beginShape(POINTS);
            // This is a move only - we do not add a vertex.
            console.log(component.substr(1));
            const p = component.substr(1).trim().split(',');
            x = parseFloat(p[0], 10);
            y = parseFloat(p[1], 10);
            console.log('Moved to', x, y);
            vertex(x, y);

            if (x0 === null || lastCommand === 'Z' || lastCommand === 'z') {
                x0 = x;
                y0 = y;
            }
            reflectedControl = [x, y];
        } else if (component[0] === 'Z' || component[0] === 'z') {
            vertex(x0, y0);
            endShape();
            beginShape();
            reflectedControl = [x, y];
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
            reflectedControl = [x, y];
        } else if (component[0] === 'L') {
            let m = component.substr(1).trim();//.replace(/-/g, ',-');
            if (m[0] === ',') {
                m = m.slice(1);
            }
            const p = m.split(',');
            const x1 = parseFloat(p[0], 10);
            const y1 = parseFloat(p[1], 10);
            //line(x, y, x + x1, y + y1);
            // vertex(x, y);
            console.log('Moving to L', x1, y1);
            vertex(x1, y1);
            x = x1;
            y = y1;
            // x = x + x1;
            // y = y + y1;
            reflectedControl = [x, y];
        } else if (component[0] === 'v') {
            let m = component.substr(1).replace(/-/g, ',-');
            if (m[0] === ',') {
                m = m.slice(1);
            }

            const y1 = parseFloat(m, 10);
            //line(x, y, x + x1, y + y1);

            // No relative movement in x
            vertex(x, y);
            vertex(x, y + y1);

            y = y + y1;
            reflectedControl = [x, y];
        } else if (component[0] === 'V') {
            let m = component.substr(1).replace(/-/g, ',-');
            if (m[0] === ',') {
                m = m.slice(1);
            }
            const p = m.split(',');
            const y1 = parseFloat(p, 10);

            vertex(x, y1);
            y = y1;
            reflectedControl = [x, y];
        } else if (component[0] === 'h') {
            let m = component.substr(1).replace(/-/g, ',-');
            if (m[0] === ',') {
                m = m.slice(1);
            }

            const x1 = parseFloat(m, 10);
            //line(x, y, x + x1, y + y1);

            // No relative movement in x
            console.log('***** X1 IS', x1);
            vertex(x, y);
            vertex(x + x1, y);

            x = x + x1;
            reflectedControl = [x, y];
        } else if (component[0] === 'H') {
            let m = component.substr(1).replace(/-/g, ',-');
            if (m[0] === ',') {
                m = m.slice(1);
            }
            const p = m.split(',');
            const x1 = parseFloat(p, 10);

            vertex(x1, y);
            x = x1;
            reflectedControl = [x, y];
        } else if (component[0] === 'c') {
            let m = component.trim().substr(1).replace(/-/g, ',-');
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
            console.log(x2, y2,  parseFloat(p[4], 10), parseFloat(p[5], 10));
            console.log('Curve: ', x, y, c1x, c1y, c2x, c2y, x2, y2);
            reflectedControl = [x2 + (1 * (x2 - c2x)), y2 + (1 * (y2 - c2y))];

            const steps = curveToLines(x, y, x2, y2, c1x, c1y, c2x, c2y);
            for (let i = 0; i < steps.length; ++i) {
                vertex(steps[i].x, steps[i].y);
                // line(steps[i-1].x, steps[i-1].y, steps[i].x, steps[i].y);
            }
            x = x2;
            y = y2;
        } else if (component[0] === 'C') {
            // If a coordinate is negative, it *can* (but may not) ommit the previous separator
            let p = component.substr(1).replace(/-/g, ',-');

            // Coordinates can be separated by a space or a comma.
            p = p.split(/ |,/);

            // Trim any empty components
            p = p.filter(e => e !== "" );
            console.log(component);
            console.log(p);
            const c1x = parseFloat(p[0], 10);
            const c1y = parseFloat(p[1], 10);
            const c2x = parseFloat(p[2], 10);
            const c2y = parseFloat(p[3], 10);
            const x2 = parseFloat(p[4], 10);
            const y2 = parseFloat(p[5], 10);
            console.log('Curve: ', x, y, x2, y2, c1x, c1y, c2x, c2y);

            reflectedControl = [x2 + (1 * (x2 - c2x)), y2 + (1 * (y2 - c2y))];

            const steps = curveToLines(x, y, x2, y2, c1x, c1y, c2x, c2y);
            for (let i = 0; i < steps.length; ++i) {
                vertex(steps[i].x, steps[i].y);
                // line(steps[i-1].x, steps[i-1].y, steps[i].x, steps[i].y);
            }
            x = x2;
            y = y2;
        } else if (component[0] === 's') {
            let m = component.trim().substr(1).replace(/-/g, ',-');
            if (m[0] === ',') {
                m = m.slice(1);
            }
            const p = m.split(',');
            const c2x = parseFloat(p[0], 10) + x;
            const c2y = parseFloat(p[1], 10) + y;
            const x2 = parseFloat(p[2], 10) + x;
            const y2 = parseFloat(p[3], 10) + y;
            const c1x = reflectedControl[0];
            const c1y = reflectedControl[1];
            reflectedControl = [x2 + (1 * (x2 - c2x)), y2 + (1 * (y2 - c2y))];
            console.log('s Curve: ', x, y, x2, y2, c1x, c1y, c2x, c2y);

            const steps = curveToLines(x, y, x2, y2, c1x, c1y, c2x, c2y);
            for (let i = 0; i < steps.length; ++i) {
                vertex(steps[i].x, steps[i].y);
                // line(steps[i-1].x, steps[i-1].y, steps[i].x, steps[i].y);
            }
            x = x2;
            y = y2;
        } else if (component[0] === 'S') {
            // If a coordinate is negative, it *can* (but may not) ommit the previous separator
            let p = component.substr(1).replace(/-/g, ',-');

            // Coordinates can be separated by a space or a comma.
            p = p.split(/ |,/);

            // Trim any empty components
            p = p.filter(e => e !== "" );
            console.log(component);
            console.log(p);
            const c2x = parseFloat(p[0], 10);
            const c2y = parseFloat(p[1], 10);
            const x2 = parseFloat(p[2], 10);
            const y2 = parseFloat(p[3], 10);

            const c1x = reflectedControl[0];
            const c1y = reflectedControl[1];
            reflectedControl = [x2 + (1 * (x2 - c2x)), y2 + (1 * (y2 - c2y))];

            console.log('S Curve: ', x, y, x2, y2, c1x, c1y, c2x, c2y);
            const steps = curveToLines(x, y, x2, y2, c1x, c1y, c2x, c2y);
            for (let i = 0; i < steps.length; ++i) {
                vertex(steps[i].x, steps[i].y);
                // line(steps[i-1].x, steps[i-1].y, steps[i].x, steps[i].y);
            }
            x = x2;
            y = y2;
        } else {
            console.log('Unrecognized command: ', component[0]);
        }

        lastCommand = component[0];
    }
    endShape();
}

function drawGroup(svg, state, filter) {
    // Filter
    const id = svg.getAttribute('id');
    const re = new RegExp(filter);
    console.log(`Comparing ${id} to ${filter}`)
    if (id && !re.exec(id)) {
        return;
    }

    // Push before we translate the canvas for any child groups.
    console.log('PUSHING!');
    push();

    // Translate x, y
    const x = parseInt(svg.getAttribute('x'), 10) || 0;
    const y = parseInt(svg.getAttribute('y'), 10) || 0;
    translate(x, y);

    // Handle simple transforms
    const transform = svg.getAttribute('transform');
    const match = /translate\(([-.\d]+), ([-.\d]+)\)/.exec(transform);
    if (match) {
        translate(parseFloat(match[1]), parseFloat(match[2]));
    }

    // Merge state
    let newState = {};
    newState.stroke = svg.getAttribute('stroke') || state.stroke;
    newState.strokeWidth = parseInt(svg.getAttribute('stroke-width'), 10) || state.strokeWidth;
    newState.fill = svg.getAttribute('fill') || state.fill;

    const children = svg.children;
    filterMap(children, 'g', drawGroup, [newState, filter]);
    filterMap(children, 'polygon', drawPolygon, [newState]);
    filterMap(children, 'line', drawLine, [newState]);
    filterMap(children, 'rect', drawRect, [newState]);
    filterMap(children, 'text', drawText, [newState]);
    filterMap(children, 'circle', drawCircle, [newState]);
    filterMap(children, 'ellipse', drawEllipse, [newState]);
    filterMap(children, 'polyline', drawPolyline, [newState]);
    filterMap(children, 'path', drawPath, [newState]);

    // TODO(jimmy): Re-implement the path parser.
    // filterMap(children, 'path', drawPath);
    console.log('POPPING!');
    pop();
}

// Must be globals for HPGLRenderer to work.
// const height = 1000;
// const width = 1000;

const height = 215 * 2;
const width = 279;

class SVGFont {
    constructor(path) {
        this.path = path;
    }

    async load() {
        const font = await window.electronApi.readFile(this.path);
        const parser = new DOMParser();
        const f = parser.parseFromString(font, "text/xml");

        // <font-face
        //     font-family="EMS Brush"
        //     units-per-em="1000"
        //     ascent="800"
        //     descent="-200"
        //     cap-height="500"
        //     x-height="300"
        // />
        const properties = f.getElementsByTagName("font-face")[0];
        this.unitsPerEm = parseInt(properties.getAttribute("units-per-em"), 10);

        const missing = f.getElementsByTagName("missing-glyph")[0];
        this.missingGlyphAdvance = parseInt(missing.getAttribute('horiz-adv-x'), 10);

        const glyphs = f.getElementsByTagName("glyph");

        this.glyphs = {};
        for (const glyph of glyphs) {
            const unicode = glyph.getAttribute("unicode");
            const id = glyph.getAttribute("id");
            this.glyphs[id] = glyph;
        }
    }

    drawText(text, em, height) {
        let x = 0;
        let y = 0;
        let max_width = 40000;

        const paragraphs = text.split('\n\n');
        for (const para of paragraphs) {
            const words = para.split(' ');

            for (const word of words) {
                const width = this.getWordWidth(word);
                if (x + width > max_width) {
                    x = 0;
                    y -= 1000;
                }
                this.drawWord(word, em , x, y);
                x += width + this.drawGlyph(' ', em, x, y);
            }

            x = 0;
            y -= height;
        }
    }

    drawWord(word, em, x, y) {
        beginShape();
        for (const char of word) {
            const offset = this.drawGlyph(char, em, x, y);
            x += offset;
        }
        endShape();
    }

    getWordWidth(word) {
        let width = 0;
        for (char of word) {
            width += this.getCharWidth(char);
        }
        return width;
    }

    getCharWidth(char) {
        const glyph = this.glyphs[char];
        if (!glyph) {
            return this.missingGlyphAdvance;
        }

        const code = glyph.getAttribute('d');
        if (!code) {
            return this.missingGlyphAdvance;
        }

        return parseInt(glyph.getAttribute("horiz-adv-x"), 10);
    }

    drawGlyph(id, em, x_offset, y_offset) {
//        console.log(char);
        const glyph = this.glyphs[id];
        const scale = em / this.unitsPerEm;

        if (!glyph) {
            return this.missingGlyphAdvance;
        }

        const code = glyph.getAttribute('d');
        if (!code) {
            return this.missingGlyphAdvance;
        }

        const components = code.split(/(?=[A-Za-z])/);
        const st  = glyph.getAttribute('stroke') || '#000000';

        let x0 = null;
        let y0 = null;
        let x = 0;
        let y = 0;
        let lastCommand = null;
        let reflectedControl = null;

        beginShape();
        let inPath = true;
        for (let component of components) {
            // console.log(component);
            if (component[0] === 'M') {
                endShape();
                beginShape();

                // This is a move only - we do not add a vertex.
                const p = component.substr(1).trim().split(' ');
                x = parseFloat(p[0], 10);
                y = parseFloat(p[1], 10);
                // console.log(`M ${x} ${y}`);
                vertex(x, y);

                if (x0 === null || lastCommand === 'Z' || lastCommand === 'z') {
                    x0 = x;
                    y0 = y;
                }
                reflectedControl = [x, y];
            } else if (component[0] === 'Z' || component[0] === 'z') {
                vertex(x0, y0);
                endShape();
                beginShape(POINTS);
                reflectedControl = [x, y];
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
                reflectedControl = [x, y];
            } else if (component[0] === 'L') {
                let m = component.substr(1).trim();//.replace(/-/g, ',-');
                if (m[0] === ',') {
                    m = m.slice(1);
                }
                const p = m.split(' ');
                const x1 = parseFloat(p[0], 10);
                const y1 = parseFloat(p[1], 10);
                //line(x, y, x + x1, y + y1);
                // vertex(x, y);
                // console.log('Moving to L', x1, y1);
                vertex(x1, y1);
                x = x1;
                y = y1;
                // x = x + x1;
                // y = y + y1;
                reflectedControl = [x, y];
            } else if (component[0] === 'v') {
                let m = component.substr(1).replace(/-/g, ',-');
                if (m[0] === ',') {
                    m = m.slice(1);
                }

                const y1 = parseFloat(m, 10);
                //line(x, y, x + x1, y + y1);

                // No relative movement in x
                vertex(x, y);
                vertex(x, y + y1);

                y = y + y1;
                reflectedControl = [x, y];
            } else if (component[0] === 'V') {
                let m = component.substr(1).replace(/-/g, ',-');
                if (m[0] === ',') {
                    m = m.slice(1);
                }
                const p = m.split(',');
                const y1 = parseFloat(p, 10);

                vertex(x, y1);
                y = y1;
                reflectedControl = [x, y];
            } else if (component[0] === 'h') {
                let m = component.substr(1).replace(/-/g, ',-');
                if (m[0] === ',') {
                    m = m.slice(1);
                }

                const x1 = parseFloat(m, 10);
                //line(x, y, x + x1, y + y1);

                // No relative movement in x
                // console.log('***** X1 IS', x1);
                vertex(x, y);
                vertex(x + x1, y);

                x = x + x1;
                reflectedControl = [x, y];
            } else if (component[0] === 'H') {
                let m = component.substr(1).replace(/-/g, ',-');
                if (m[0] === ',') {
                    m = m.slice(1);
                }
                const p = m.split(',');
                const x1 = parseFloat(p, 10);

                vertex(x1, y);
                x = x1;
                reflectedControl = [x, y];
            } else if (component[0] === 'q') {
                let m = component.trim().substr(1);
                //.replace(/-/g, ',-');
                if (m[0] === ',') {
                    m = m.slice(1);
                }
                const p = m.split(' ');
                const c1x = parseFloat(p[0], 10) + x;
                const c1y = parseFloat(p[1], 10) + y;
                const x2 = parseFloat(p[2], 10) + x;
                const y2 = parseFloat(p[3], 10) + y;
                // console.log(p, x, y);
                // console.log(`q ${c1x} ${c1y} ${x2} ${y2}`);

                // console.log(x2, y2,  parseFloat(p[4], 10), parseFloat(p[5], 10));
                // console.log('Curve: ', x, y, c1x, c1y, c2x, c2y, x2, y2);

                reflectedControl = [x2 + (1 * (x2 - c1x)), y2 + (1 * (y2 - c1y))];

                const steps = quadraticCurveToLines(x, y, x2, y2, c1x, c1y);

                for (let i = 0; i < steps.length; ++i) {
                    vertex(steps[i].x, steps[i].y);
                    // line(steps[i-1].x, steps[i-1].y, steps[i].x, steps[i].y);
                }
                x = x2;
                y = y2;
            } else if (component[0] === 'Q') {
                // If a coordinate is negative, it *can* (but may not) ommit the previous separator
                let p = component.substr(1).replace(/-/g, ',-');

                // Coordinates can be separated by a space or a comma.
                p = p.split(/ |,/);

                // Trim any empty components
                p = p.filter(e => e !== "" );
                // console.log(component);
                // console.log(p);
                const c1x = parseFloat(p[0], 10);
                const c1y = parseFloat(p[1], 10);
                const x2 = parseFloat(p[2], 10);
                const y2 = parseFloat(p[3], 10);
                // console.log('Curve: ', x, y, x2, y2, c1x, c1y, c2x, c2y);

                reflectedControl = [x2 + (1 * (x2 - c1x)), y2 + (1 * (y2 - c1y))];

                const steps = quadraticCurveToLines(x, y, x2, y2, c1x, c1y);
                for (let i = 0; i < steps.length; ++i) {
                    vertex(steps[i].x, steps[i].y);
                    // line(steps[i-1].x, steps[i-1].y, steps[i].x, steps[i].y);
                }
                x = x2;
                y = y2;
            } else if (component[0] === 'c') {
                let m = component.trim().substr(1).replace(/-/g, ',-');
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
                // console.log(x2, y2,  parseFloat(p[4], 10), parseFloat(p[5], 10));
                // console.log('Curve: ', x, y, c1x, c1y, c2x, c2y, x2, y2);
                reflectedControl = [x2 + (1 * (x2 - c2x)), y2 + (1 * (y2 - c2y))];

                const steps = curveToLines(x, y, x2, y2, c1x, c1y, c2x, c2y);
                for (let i = 0; i < steps.length; ++i) {
                    vertex(steps[i].x, steps[i].y);
                    // line(steps[i-1].x, steps[i-1].y, steps[i].x, steps[i].y);
                }
                x = x2;
                y = y2;
            } else if (component[0] === 'C') {
                // If a coordinate is negative, it *can* (but may not) ommit the previous separator
                let p = component.substr(1).replace(/-/g, ',-');

                // Coordinates can be separated by a space or a comma.
                p = p.split(/ |,/);

                // Trim any empty components
                p = p.filter(e => e !== "" );
                // console.log(component);
                // console.log(p);
                const c1x = parseFloat(p[0], 10);
                const c1y = parseFloat(p[1], 10);
                const c2x = parseFloat(p[2], 10);
                const c2y = parseFloat(p[3], 10);
                const x2 = parseFloat(p[4], 10);
                const y2 = parseFloat(p[5], 10);
                // console.log('Curve: ', x, y, x2, y2, c1x, c1y, c2x, c2y);

                reflectedControl = [x2 + (1 * (x2 - c2x)), y2 + (1 * (y2 - c2y))];

                const steps = curveToLines(x, y, x2, y2, c1x, c1y, c2x, c2y);
                for (let i = 0; i < steps.length; ++i) {
                    vertex(steps[i].x, steps[i].y);
                    // line(steps[i-1].x, steps[i-1].y, steps[i].x, steps[i].y);
                }
                x = x2;
                y = y2;
            } else if (component[0] === 's') {
                let m = component.trim().substr(1).replace(/-/g, ',-');
                if (m[0] === ',') {
                    m = m.slice(1);
                }
                const p = m.split(',');
                const c2x = parseFloat(p[0], 10) + x;
                const c2y = parseFloat(p[1], 10) + y;
                const x2 = parseFloat(p[2], 10) + x;
                const y2 = parseFloat(p[3], 10) + y;
                const c1x = reflectedControl[0];
                const c1y = reflectedControl[1];
                reflectedControl = [x2 + (1 * (x2 - c2x)), y2 + (1 * (y2 - c2y))];
                // console.log('s Curve: ', x, y, x2, y2, c1x, c1y, c2x, c2y);

                const steps = curveToLines(x, y, x2, y2, c1x, c1y, c2x, c2y);
                for (let i = 0; i < steps.length; ++i) {
                    vertex(steps[i].x, steps[i].y);
                    // line(steps[i-1].x, steps[i-1].y, steps[i].x, steps[i].y);
                }
                x = x2;
                y = y2;
            } else if (component[0] === 'S') {
                // If a coordinate is negative, it *can* (but may not) ommit the previous separator
                let p = component.substr(1).replace(/-/g, ',-');

                // Coordinates can be separated by a space or a comma.
                p = p.split(/ |,/);

                // Trim any empty components
                p = p.filter(e => e !== "" );
                // console.log(component);
                // console.log(p);
                const c2x = parseFloat(p[0], 10);
                const c2y = parseFloat(p[1], 10);
                const x2 = parseFloat(p[2], 10);
                const y2 = parseFloat(p[3], 10);

                const c1x = reflectedControl[0];
                const c1y = reflectedControl[1];
                reflectedControl = [x2 + (1 * (x2 - c2x)), y2 + (1 * (y2 - c2y))];

                // console.log('S Curve: ', x, y, x2, y2, c1x, c1y, c2x, c2y);
                const steps = curveToLines(x, y, x2, y2, c1x, c1y, c2x, c2y);
                for (let i = 0; i < steps.length; ++i) {
                    vertex(steps[i].x, steps[i].y);
                    // line(steps[i-1].x, steps[i-1].y, steps[i].x, steps[i].y);
                }
                x = x2;
                y = y2;
            }  else if (component[0] === 't') {
                let m = component.trim().substr(1);
                //.replace(/-/g, ',-');
                if (m[0] === ',') {
                    m = m.slice(1);
                }
                const p = m.split(' ');
                const x2 = parseFloat(p[0], 10) + x;
                const y2 = parseFloat(p[1], 10) + y;
                const c1x = reflectedControl[0];
                const c1y = reflectedControl[1];

                // console.log(`t ${x2} ${y2}`);

                reflectedControl = [x2 + (1 * (x2 - c1x)), y2 + (1 * (y2 - c1y))];
                // console.log('s Curve: ', x, y, x2, y2, c1x, c1y, c2x, c2y);

                const steps = quadraticCurveToLines(x, y, x2, y2, c1x, c1y);
                for (let i = 0; i < steps.length; ++i) {
                    vertex(steps[i].x, steps[i].y);
                    // line(steps[i-1].x, steps[i-1].y, steps[i].x, steps[i].y);
                }
                x = x2;
                y = y2;
            } else if (component[0] === 'T') {
                // If a coordinate is negative, it *can* (but may not) ommit the previous separator
                let p = component.substr(1).replace(/-/g, ',-');

                // Coordinates can be separated by a space or a comma.
                p = p.split(/ |,/);

                // Trim any empty components
                p = p.filter(e => e !== "" );
                // console.log(component);
                // console.log(p);
                const x2 = parseFloat(p[0], 10);
                const y2 = parseFloat(p[1], 10);

                const c1x = reflectedControl[0];
                const c1y = reflectedControl[1];
                reflectedControl = [x2 + (1 * (x2 - c1x)), y2 + (1 * (y2 - c1y))];

                // console.log('S Curve: ', x, y, x2, y2, c1x, c1y, c2x, c2y);
                const steps = quadraticCurveToLines(x, y, x2, y2, c1x, c1y);
                for (let i = 0; i < steps.length; ++i) {
                    vertex(steps[i].x, steps[i].y);
                    // line(steps[i-1].x, steps[i-1].y, steps[i].x, steps[i].y);
                }
                x = x2;
                y = y2;
            } else {
                console.log('Unrecognized command: ', component[0]);
            }

            lastCommand = component[0];
        }
        endShape();
        return parseInt(glyph.getAttribute("horiz-adv-x"), 10);
    }


}

async function setup() {
    createCanvas(width, height, NoHPGL);
    // createCanvas(width, height);

    // const data = fs.readFileSync('/Users/jimmy/Desktop/test2.svg');
    //const data = fs.readFileSync('/Users/jimmy/out_planer.svg');
    setupComplete();

    stroke(0, 0, 0);
    rectMode(CORNER);

    translate(279 / 2, 215);
    scale(1, -1);
    translate(-279 / 2, 100);

    scale(0.375, 0.375);

    // Customize these for a specific SVG
    // translate(0, 140)
    // translate(-8, 0);
    //scale(25.4 / 72.0, (25.4 / 72.0) * 1.00795);
    strokeWeight(0.5);

    // Letterhead
    push();
    scale(0.09)
    translate(560, 120);
    const font2 = new SVGFont('/Users/jmcgill/P1.svg');
    await font2.load();
    //font.drawGlyph("R", 20);
    //font2.drawText("James McGill\n\nNew York, NY", 15, 1200);
    font2.drawGlyph('glyph2172', 20);

    // glyph1846 = y

    pop();

    // Text
    // push();
    // translate(70, 150);
    // // rect(10, 10, 0, 0);
    // const font = new SVGFont('/Users/jmcgill/Downloads/EMSBrush.svg');
    // await font.load();
    // font.drawText(letter, 15, 2200);
    // //font.drawText(letter, 20, 2200);
    // pop();
    //
    // // Icon
    // const icon = await window.electronApi.readFile('/Users/jmcgill/logo.svg');
    // const parser = new DOMParser();
    // const svg = parser.parseFromString(icon, "text/xml");
    // const group = svg.getElementsByTagName('g')[0];
    //
    // push();
    // scale(1.5, 1.5);
    // translate(360, 0);
    // drawGroup(group, {}, '');
    // pop();


    // scale(1, 0.3);
    // scale(1);
    let filter = '.*';
    // let filter = 'cas9_all|Fills';

    // const parser = new DOMParser();
    // const svg = parser.parseFromString(data, "text/xml");
    // drawGroup(svg.documentElement, {}, filter);
}

function draw() {
}
