// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { remote, ipcRenderer } = require('electron');
const main = remote.require('./main.js');
const $ = require('./jquery.min');

window.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

ipcRenderer.on('trigger-fit', () => {
    console.log('triggering fit');
    const bounds = remote.getCurrentWindow().getBounds();
    const height = $('#defaultCanvas0').height();
    const width = $('#defaultCanvas0').width();
    main.fit(height, width,bounds.height, bounds.width, false);
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
        const height = $('#defaultCanvas0').height();
        const width = $('#defaultCanvas0').width();
        main.zoom(height, width, false);
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
    console.log('Calling setup compolete');
    main.setupComplete();
}
