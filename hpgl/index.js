/**
 * @namespace p5
 */
console.log('Running initialization');
require('./p5.RendererHPGL')(p5);
require('./rendering')(p5);

// Attach constants to p5 instance
var constants = require('./constants');
console.log(p5);
console.log('I am running the HPGL thing...');
Object.keys(constants).forEach(function(k) {
    console.log('Replacing key: ', k);
    p5.prototype[k] = constants[k];
    window[k] = constants[k];
});

