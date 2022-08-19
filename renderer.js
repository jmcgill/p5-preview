// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

// const { remote, ipcRenderer } = require('electron');
// const main = remote.require('./main.js');
const $ = require('./jquery.min');
// const hpgl = require('./hpgl/index.js');

window.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
// hpgl(p5);

// ipcRenderer.on('trigger-fit', () => {
//     console.log('triggering fit');
//     const bounds = remote.getCurrentWindow().getBounds();
//     const height = $('#defaultCanvas0').height();
//     const width = $('#defaultCanvas0').width();
//     console.log('Current height is: ', height, width);
//     //main.fit(height, width,bounds.height, bounds.width, false);
//
//     window.electronApi.fit(requestedHeight, requestedWidth, bounds.height, bounds.width, false);
//
//
//     console.log('Finished calling main fit');
// });

window.addEventListener('DOMContentLoaded', () => {
    console.log('Setting up onTriggerFIt');
    window.electronApi.onTriggerFit((_event, value) => {
        console.log('**** TRIGGER FIT CALLED');
        console.log('triggering fit');
        console.log(_event, value);
        const bounds = remote.getCurrentWindow().getBounds();
        const height = $('#defaultCanvas0').height();
        const width = $('#defaultCanvas0').width();
        console.log('Current height is: ', height, width);
        //main.fit(height, width,bounds.height, bounds.width, false);

        window.electronApi.fit(requestedHeight, requestedWidth, bounds.height, bounds.width, false);


        console.log('Finished calling main fit');
    })
});

function fit(bounds) {
    // const height = $('#defaultCanvas0').height();
    // const width = $('#defaultCanvas0').width();
    //
    // window.electronApi.fit(height, width,bounds.height, bounds.width, true);
}

// REPLACE
// ipcRenderer.on('trigger-zoom', () => {
//     console.log('triggering zoom');
//     function zoom() {
//         // const height = $('#defaultCanvas0').height();
//         // const width = $('#defaultCanvas0').width();
//
//         // REPLACE
//         window.electronApi.zoom(requestedHeight, requestedWidth, false);
//     }
// });

function zoom() {
    const height = $('#defaultCanvas0').height();
    const width = $('#defaultCanvas0').width();

    // REPLACE
    window.electronApi.zoom(height, width, true);
}

function refresh() {
    // REPLACE
    window.electronApi.refresh();
}

function snapshot() {
    // REPLACE
    window.electronApi.snapshot();
}

function setupComplete() {
    // REPLACE
    // window.electronApi.setupComplete();
    // const bounds = remote.getCurrentWindow().getBounds();
    const height = $('#defaultCanvas0').height();
    const width = $('#defaultCanvas0').width();
    console.log('Current height is: ', height, width);
    //main.fit(height, width,bounds.height, bounds.width, false);

    window.electronApi.fitToSize(height, width);
}

window['setupComplete'] = setupComplete;
window['zoom'] = zoom;