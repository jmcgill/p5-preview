// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { remote, ipcRenderer } = require('electron');
const main = remote.require('./main.js');
const $ = require('./jquery.min');
const hpgl = require('./hpgl/index.js');
const fs = remote.require('fs');
const randomWords = remote.require('random-words');

window.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
hpgl(p5);

// window.setTimeout(function() {
//     setupComplete();
// }, 500);

ipcRenderer.on('trigger-fit', () => {
    console.log('triggering fit');
    const bounds = remote.getCurrentWindow().getBounds();
    const height = $('#defaultCanvas0').height();
    const width = $('#defaultCanvas0').width();
    console.log('Current height is: ', height, width);
    //main.fit(height, width,bounds.height, bounds.width, false);
    main.fit(requestedHeight, requestedWidth, bounds.height, bounds.width, false);
    console.log('Finished calling main fit');
});

function fit() {
    const bounds = remote.getCurrentWindow().getBounds();
    const height = $('#defaultCanvas0').height();
    const width = $('#defaultCanvas0').width();
    main.fit(height, width,bounds.height, bounds.width, true);
}

ipcRenderer.on('trigger-zoom', () => {
    console.log('triggering zoom');
    function zoom() {
       // const height = $('#defaultCanvas0').height();
       // const width = $('#defaultCanvas0').width();
        main.zoom(requestedHeight, requestedWidth, false);
    }
});

function zoom() {
    const height = $('#defaultCanvas0').height();
    const width = $('#defaultCanvas0').width();
    main.zoom(height, width, true);
}

function refresh() {
    main.refresh();
}

function snapshot() {
    main.snapshot();
}

function setupComplete() {
    console.log('Calling setup complete');
    main.setupComplete();
}