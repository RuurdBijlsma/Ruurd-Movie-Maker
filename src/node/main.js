const electron = require('electron');
const {app, BrowserWindow} = electron;
const isDev = require('electron-is-dev');

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        show: false,
        icon: path.join(__dirname, '../renderer/img/icon.png'),
        width: width + 20,
        height: height + 20,
        backgroundColor: '#1f1f1f'
    });
    mainWindow.once('ready-to-show', () => mainWindow.show());

    let indexUrl = path.join(__dirname, '../renderer/index.html');
    mainWindow.loadURL(url.format({
        pathname: indexUrl,
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.setMenu(null);
    mainWindow.maximize();

    if (isDev)
        mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

require('./ffmpeg.js');