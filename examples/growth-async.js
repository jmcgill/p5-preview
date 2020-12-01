let requestedHeight = 1, requestedWidth = 1;

function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {

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
    if (Math.abs(x1 - x3) < 0.01 && Math.abs(y1 - y3) < 0.01) {
        return false;
    }
    if (Math.abs(x1 - x4) < 0.01 && Math.abs(y1 - y4) < 0.01) {
        return false;
    }
    if (Math.abs(x2 - x3) < 0.01 && Math.abs(y2 - y3) < 0.01) {
        return false;
    }
    if (Math.abs(x2 - x4) < 0.01 && Math.abs(y2 - y4) < 0.01) {
        return false;
    }

    c = (x12 * y34) - (y12 * x34);
    if (Math.abs(c) < 0.01) {
        // No intersection
        return false;
    } else {
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
        if (((x1 - x) < 0 && (x2 - x) < 0) ||
            ((x1 - x) > 0 && (x2 - x) > 0)) {
            return false;
        }

        if (((x3 - x) < 0 && (x4 - x) < 0) ||
            ((x3 - x) > 0 && (x4 - x) > 0)) {
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

        return true;
    }
}
// TODO(jimmy): This doesn't need to be a class - move it to functions.
function Grid(r, outerDiameter) {
    this.grid = [];
    this.gridOfLines = [];
    this.r = r;
    this.spacing = r / Math.sqrt(2);
    this.columns = (outerDiameter * 2) / this.spacing;
}

Grid.prototype.nearby = function(x, y, d) {
    let x1 = Math.floor(x / this.spacing);
    let y1 = Math.floor(y / this.spacing);

    const points = [];
    const search = 10;
    for (var i = -search; i <= search; ++i) {
        for (var j = -search; j <= search; ++j) {
            let x2 = (x1 + i);
            let y2 = (y1 + j);
            if (this.grid[(y2 * this.columns) + x2]) {
                points.push(this.grid[(y2 * this.columns) + x2]);
            }
        }
    }

    for (let i = 0; i < points.length; ++i) {
        if (Math.hypot(x - points[i].x, y - points[i].y) < (this.r + (d * 0.005))) {
            return true;
        }
    }

    return false;
}

Grid.prototype.intersectingLineNearby = function(x1, y1, x2, y2) {
    let xi = Math.floor(x1 / this.spacing);
    let yi = Math.floor(y1 / this.spacing);

    const lines = [];
    const searchSpace = 10;

    // Our search space for lines is much larger
    for (var i = -searchSpace; i <= searchSpace; ++i) {
        for (var j = -searchSpace; j <= searchSpace; ++j) {
            let xi2 = (xi + i);
            let yi2 = (yi + j);
            if (this.gridOfLines[(yi2 * this.columns) + xi2]) {
                lines.push(this.gridOfLines[(yi2 * this.columns) + xi2]);
            }
        }
    }

    for (let i = 0; i < lines.length; ++i) {
        if (linesIntersect(
            lines[i].x1,
            lines[i].y1,
            lines[i].x2,
            lines[i].y2,
            x1,
            y1,
            x2,
            y2
        )) {
            return true;
        }
    }

    return false;
}

Grid.prototype.insert = function(x, y) {
    const x1 = Math.floor(x / this.spacing);
    const y1 = Math.floor(y / this.spacing);
    this.grid[(y1 * this.columns) + x1] = {
        x,
        y
    };
}

Grid.prototype.insertLine = function(x1, y1, x2, y2) {
    const xi = Math.floor(x1 / this.spacing);
    const yi = Math.floor(y1 / this.spacing);
    this.gridOfLines[(yi * this.columns) + xi] = {
        x1, y1, x2, y2
    };
}

function newAngle(currentAngle, currentDiameter) {
    // To begin with, we want to emit points equally in all 360 degrees
    if (currentDiameter < 0.1) {
        return random() * Math.PI * 2;
    } else {
        return randomGaussian(currentAngle, Math.PI / 10);
    }
}
//
// def choice(items):
// p = random.random() ** 0.5
// return items[int(p * len(items))]

let grid = null;
let active = [];
let allPoints = [];
let lines = [];

let lastX = 0;
let lastY = 0;

function startPoissonDisc(x, y, r, outerDiameter, k) {
    grid = new Grid(r, outerDiameter);

    // We seed our list of active points with a single starting location
    active.push({
        x,
        y,
        angle: 0,
        index: 0,
        diameter: 0,
        line: 0,
        branched: false
    });

    // allPoints.push({
    //     ox: null,
    //     oy: null,
    //     x: x,
    //     y: y,
    //     angle: 0,
    //     line: 0,
    //     branched: false,
    //     index: 0,
    //     diameter: 0
    // });

    lines[0] = [[x, y]];

    lastX = x;
    lastY = y;
}

function nextPoissonDisc(x, y, r, outerDiameter, k) {
    if (active.length === 0) {
        console.log('Complete!');
        return null;
    }

    let newPoints = [];

    // TODO(jimmy): What happens if we sample with bias?
    const index = Math.floor(random() * active.length);
    const origin = active[index];

    // Each point in our disc emits K additional points
    let pointEmitted = false;
    for (var i = 0; (i < k) && running; ++i) {
        // We branch in a random direction a distance between 0 and r^2
        // Our selection of angle uses a Gaussian distribution so it's much more likely to
        // branch 'close to' straight ahead than turn back on ourselves.
        const angle = newAngle(origin.angle, origin.diameter);
        const diameter = (random() * r) + r;

        const x1 = origin.x + (Math.cos(angle) * diameter);
        const y1 = origin.y + (Math.sin(angle) * diameter);

        // Points outside our disc are excluded
        if (origin.diameter + diameter > outerDiameter) {
            continue;
        }

        // Avoid conflicting with any of our existing points
        if (grid.nearby(x1, y1, (origin.diameter + diameter))) {
            continue;
        }

        if (grid.intersectingLineNearby(origin.x, origin.y, x1, y1)) {
            continue;
        }

        pointEmitted = true;
        totalCount += 1;
        // if (totalCount > 178) {
        //     continue;
        // }

        grid.insert(x1, y1);
        grid.insertLine(origin.x, origin.y, x1, y1);

        let lineIndex = -1;
        if (origin.branched) {
            // This point has already branched once, we need to start a new line
            lines.push([[origin.x, origin.y], [x1, y1]]);
            lineIndex = lines.length - 1;
        } else {
            // TODO(jimmy): Can I do this by reference?
            active[index].branched = true;
            lineIndex = active[index].line;
            lines[lineIndex].push([x1, y1]);
        }

        active.push({
            x: x1,
            y: y1,
            angle,
            line: lineIndex,
            branched: false,
            index: origin.index + 1,
            diameter: origin.diameter + diameter
        });

        allPoints.push({
            ox: origin.x,
            oy: origin.y,
            x: x1,
            y: y1,
            angle,
            line: lineIndex,
            branched: false,
            index: origin.index + 1,
            diameter: origin.diameter + diameter
        });

        // points.push({
        //     x: x1,
        //     y: y1,
        // })

        newPoints.push({
            x1: origin.x,
            y1: origin.y,
            x2: x1,
            y2: y1
        });


        // line(origin.x, origin.y, x1, y1);
        // lastX = x1;
        // lastY = y1;
        // console.log(x1, y1);
    }

    // If we fail to land *any* points after K attempts, we remove this seed
    if (!pointEmitted) {
        active.splice(index, 1);
    }
    return newPoints;
}

//const height = 279;
//const width = 215;
const height = 215 * 2;
const width = 279;

const r = 1.2;
const k = 32;
const outerDiameter = 240;

// const r = 6;
// const k = 12;
// const outerDiameter = 30;

function setup() {
    createCanvas(width, height, NoHPGL);
    setupComplete();

    rectMode(CENTER);
    ellipseMode(CENTER);
    strokeWeight(0.3);

    frameRate(240);

    randomSeed(72422985186);

    startPoissonDisc(width / 2, height / 2,  r, outerDiameter, k);
}

running = true;
totalCount = 0;
function draw() {
    // stroke(0, 0, 0);
    if (running) {
        let points = nextPoissonDisc(width / 2, height / 2, r, outerDiameter, k);

        // We've finished growing - draw points as lines.
        if (!points) {
            console.log('Run complete');
            running = false;

            // Rendering mode
            stroke(0, 0, 0);

            // Build an index of every point
            pointsIndex = {};
            for (let i = 0; i < allPoints.length; ++i) {
                const key = `${allPoints[i].x}-${allPoints[i].y}`;
                pointsIndex[key] = allPoints[i];
            }

            // Sort all points by diameter
            allPoints = allPoints.sort((a, b) => (a.diameter < b.diameter) ? 1 : -1);

            console.log('Generating depth graph');
            let newLines = [];
            for (let i = 0; i < allPoints.length; ++i) {
                const key = `${allPoints[i].x}-${allPoints[i].y}`;
                let parentKey = `${allPoints[i].ox}-${allPoints[i].oy}`;

                // Has this point already been walked?
                if (pointsIndex[key] === null) {
                    console.log('Point has already been walked');
                    continue;
                }

                const line = [];
                line.push([allPoints[i].x, allPoints[i].y]);

                // If we can't re-use the parent, we start a new line beginning at this point.
                let ox = allPoints[i].ox;
                let oy = allPoints[i].oy;

                // Can we find the parent?
                let parent = pointsIndex[parentKey];
                console.log(parent, parentKey);
                while (parent) {
                    console.log('Adding one complete line', parent.diameter);
                    line.push([parent.x, parent.y]);

                    // Remove this parent from being able to be reused
                    if (parent.diameter !== 0) {
                        pointsIndex[parentKey] = null
                        parentKey = `${parent.ox}-${parent.oy}`;
                        ox = parent.ox;
                        oy = parent.oy;
                        parent = pointsIndex[parentKey];
                        console.log(parentKey, parent);
                    } else {
                        parent = null;
                    }
                }
                line.push([ox, oy]);
                newLines.push(line);
            }

            // Sort lines by length
            newLines = newLines.sort((a, b) => (a.length < b.length) ? 1 : -1);
            console.log(newLines)

            for (let i = 0; i < newLines.length; ++i) {
                // Draw a single line
                let line = newLines[i];

                // Reverse the line to draw from middle outwards.
                line = line.reverse();

                beginShape(POINTS);
                for (var j = 0; j < line.length; ++j) {
                    // console.log('Adding vertex ', line[j][0], line[j][1]);
                    vertex(line[j][0], line[j][1]);
                }
                endShape();
            }
            return;
        }

        for (var i = 0; i < points.length; ++i) {
            stroke(0, 0, 255);
            line(points[i].x1, points[i].y1, points[i].x2, points[i].y2);
        }
    }
}
