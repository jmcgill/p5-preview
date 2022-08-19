const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronApi', {
  zoom: (height, width) => ipcRenderer.invoke('zoom', height, width),
  fit: (height, width, windowHeight, windowWidth) => ipcRenderer.invoke('fit', height, width, windowHeight, windowWidth),
  fitToSize: (height, width) => ipcRenderer.invoke('fitToSize', height, width),
  setupComplete: () => ipcRenderer.invoke('setupComplete'),
  refresh: () => ipcRenderer.invoke('refresh'),
  snapshot: () => ipcRenderer.invoke('snapshot'),
  readFile: (path) => ipcRenderer.invoke('readFile', path),
  initializePlotter: () => ipcRenderer.invoke('initializePlotter'),
  moveTo: (x, y) => ipcRenderer.invoke('moveTo', x, y),
  drawLine: (x, y, opts) => ipcRenderer.invoke('drawLine', x, y, opts),
  drawRectangle: (x, y, opts) => ipcRenderer.invoke('drawRectangle', x, y, opts),
  setVelocity: (v) => ipcRenderer.invoke('setVelocity', v),
  drawText: (msg, opts) => ipcRenderer.invoke('drawText', msg, opts),
  drawLines: (lines) => ipcRenderer.invoke('drawLines', lines),

  onTriggerFit: (callback) => ipcRenderer.on('triggerFit', callback),
})

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
