let requestedHeight = 1, requestedWidth = 1;

// TODO(jimmy): This doesn't need to be a class - move it to functions.
function Grid(r, outerDiameter) {
    this.grid = [];
    this.r = r;
    this.spacing = r / Math.sqrt(2);
    this.columns = (outerDiameter * 2) / this.spacing;
}

Grid.prototype.nearby = function(x, y) {
    let x1 = Math.floor(x / this.spacing);
    let y1 = Math.floor(y / this.spacing);

    console.log(`${x}, ${x}, ${this.spacing}`);
    console.log(`Checking near ${x1}, ${y1}`);

    const points = [];
    for (var i = -1; i <= 1; ++i) {
        for (var j = -1; j <= 1; ++j) {
            let x2 = (x1 + i);
            let y2 = (y1 + j);
            if (this.grid[(y2 * this.columns) + x2]) {
                points.push(this.grid[(y2 * this.columns) + x2]);
            }
        }
    }
    console.log(`Points found: ${points.length}`);

    for (let i = 0; i < points.length; ++i) {
        if (Math.hypot(x - points[i].x, y - points[i].y) < (this.r)) {
            return true;
        }
    }

    return false;
}

Grid.prototype.insert = function(x, y) {
    const x1 = Math.floor(x / this.spacing);
    const y1 = Math.floor(y / this.spacing);
    console.log(`Inserting at ${x1}, ${y1}`);
    this.grid[(y1 * this.columns) + x1] = {
        x,
        y
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

function poissonDisc(x, y, r, outerDiameter, k) {
    const grid = new Grid(r, outerDiameter);

    // We maintain a list of active points, which we grow from until empty
    let active = [];

    // We also maintain the list of *all* points.
    const points = [];

    // We seed our list of active points with a single starting location
    active.push({
        x,
        y,
        angle: 0,
        index: 0,
        diameter: 0
    })

    // Iterate until we have no more active points
    let count = 0;
    let lastX = x;
    let lastY = y;
    while (active.length > 0) {
        count += 1;

        // TODO(jimmy): What happens if we sample with bias?
        const index = Math.floor(random() * active.length);
        const origin = active[index];

        // Each point in our disc emits K additional points
        let pointEmitted = false;
        for (var i = 0; i < k; ++i) {
            // We branch in a random direction a distance between 0 and r^2
            // Our selection of angle uses a Gaussian distribution so it's much more likely to
            // branch 'close to' straight ahead than turn back on ourselves.
            const angle = newAngle(origin.angle, origin.diameter);
            const diameter = (random() * r) + r;

            const x1 = origin.x + (Math.cos(angle) * diameter);
            const y1 = origin.y + (Math.sin(angle) * diameter);
            console.log(`Properties: ${angle}, ${diameter}`);
            console.log(`Expanding from ${origin.x}, ${origin.y} to ${x1}, ${y1}`);

            // Points outside our disc are excluded
            if (origin.diameter + diameter > outerDiameter) {
                console.log('Too big');
                continue;
            }

            // Avoid conflicting with any of our existing points
            if (grid.nearby(x1, y1)) {
                console.log('Conflict');
                continue;
            }

            pointEmitted = true;
            grid.insert(x1, y1);

            active.push({
                x: x1,
                y: y1,
                angle,
                index: origin.index + 1,
                diameter: origin.diameter + diameter
            });

            points.push({
                x: x1,
                y: y1,
            })
            line(origin.x, origin.y, x1, y1);
            // lastX = x1;
            // lastY = y1;
            // console.log(x1, y1);
        }

        // Always splice
        // active.splice(index, 1);

        // If we fail to land *any* points after K attempts, we remove this seed
        if (!pointEmitted) {
            active.splice(index, 1);
        } else {
            console.log('Nothing evicted');
            console.log(active);
        }
    }
    console.log('Disc complete');

    return points;
}

const height = 279;
const width = 215;

function setup() {
    createCanvas(width, height, NoHPGL);
    setupComplete();

    rectMode(CENTER);
    ellipseMode(CENTER);
    strokeWeight(0.3);

    randomSeed(72422985186);

    const points = poissonDisc(width / 2, height / 2,  0.2, 90, 12);
    for (var i = 0; i < points.length; ++i) {
        line(points[i].x, points[i].y, points[i].x + 0.1, points[i].y + 0.1);
    }
}

function draw() {
}