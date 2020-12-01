// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require("chokidar");
const handlebars = require('handlebars');
const moment = require('moment');

const saverTemplate = handlebars.compile('' + fs.readFileSync('templates/saver-template.html'));

// Default to fit
let inFitMode = true;

let scale = 1.0;
let rightCrop = 0;
let bottomCrop = 0;
let canvasLeft = 0;
let seed = 5;
let scaledHeight = 100;
let scaledWidth = 100;

let mainWindow = null;

function reload() {
  const args = process.argv;
  const filename = process.argv[2];

  const template = handlebars.compile('' + fs.readFileSync('templates/template.html'));
  seed = Math.floor(Math.random() * 99999999999);
  fs.writeFileSync('temp.html', template({
    filename: filename,
    scale: scale,
    seedy: seed,
    rightCrop,
    bottomCrop,
    canvasLeft,
    scaledHeight,
    scaledWidth,
    overflow: inFitMode ? 'hidden' : 'scroll'
  }));
  mainWindow.loadFile('temp.html');
}

function setupComplete() {
  if (inFitMode) {
    mainWindow.webContents.send('trigger-fit');
  } else {
    mainWindow.webContents.send('trigger-zoom');
  }
}

function fit(height, width, windowHeight, windowWidth) {
  console.log('Running fit function');
  console.log('Requested height/width', height, width);
  console.log('Window height/width', windowHeight, windowWidth);
  inFitMode = true;

  const heightScale = (windowHeight - 120) / height;
  const widthScale = windowWidth / width;
  console.log('Scaling factor: ', heightScale, widthScale);

  const oldScale = scale;
  scale = Math.min(heightScale, widthScale);

  scaledHeight = scale * height;
  scaledWidth = scale * width;

  console.log('Scale is: ', scale, oldScale);

  if (Math.abs(scale - oldScale) > 0.01) {
    console.log('Triggering reload');
    reload();
  }
}

function zoom(height, width) {
  inFitMode = false;
  scale = 1.0;
  scaledHeight = height;
  scaledWidth = width;
  reload();
}

function snapshot() {
  const filename = process.argv[2];
  const hiddenWindow = new BrowserWindow({
    width: 400,
    height: 400,
    show: true,
  });

  fs.writeFileSync('save.html', saverTemplate({
    filename: filename,
    seed
  }));
  hiddenWindow.loadFile('save.html');

  const options = {weekday: 'short', month: 'short', day: 'numeric' };
  const outputFilename = moment().format('MMM-Do-YYYY_hh:mm');
  const basePath = '/Users/jmcgill/tmp';

  hiddenWindow.webContents.session.on('will-download', (event, item, webContents) => {
    // Set the save path, making Electron not to prompt a save dialog.
    item.setSavePath(path.join(basePath, outputFilename + '.png'));

    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully')
      } else {
        console.log(`Download failed: ${state}`)
      }

      // Make a copy of the code and properties too.
      const properties = {
        seed: seed,
        filename: filename
      };
      fs.writeFileSync(path.join(basePath, outputFilename + '.json'), JSON.stringify(properties, null, 4));
      fs.writeFileSync(path.join(basePath, outputFilename) + '.js', fs.readFileSync(filename));

      // hiddenWindow.close();
    })
  });
}

function refresh() {
  // Only reseed on explicit refresh
  seed = Math.floor(Math.random(Number.MAX_SAFE_INTEGER));
  reload();
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  });

  if (fs.existsSync('config.json')) {
    const bounds = JSON.parse(fs.readFileSync('config.json'))
    mainWindow.setBounds(bounds);
  }

  // mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
  //   // Set the save path, making Electron not to prompt a save dialog.
  //   console.log('SAVING');
  //   item.setSavePath('/Users/jmcgill/tmp/test.png');
  // });

  mainWindow.on('move', e => {
    fs.writeFileSync('config.json', JSON.stringify(mainWindow.getBounds()));
  });

  mainWindow.on('resize', e => {
    fs.writeFileSync('config.json', JSON.stringify(mainWindow.getBounds()));
  });

  mainWindow.webContents.openDevTools();
  reload();

  const watcher = chokidar.watch(process.argv[2], {
    persistent: true
  });

  // Declare the listeners of the watcher
  watcher.on('change', function(path) {
    mainWindow.webContents.reload();
  });

  const watcher2 = chokidar.watch('template.html', {
    persistent: true
  });
  watcher2.on('change', function(path) {
    reload();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit()
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
exports.fit = fit;
exports.zoom = zoom;
exports.refresh = refresh;
exports.snapshot = snapshot;
exports.setupComplete = setupComplete;
