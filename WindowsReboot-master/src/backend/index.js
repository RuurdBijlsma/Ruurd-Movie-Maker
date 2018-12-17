const electron = require('electron');
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const {app, BrowserWindow, Menu, Tray} = electron;
const {config} = require('../config');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const exeName = path.basename(process.execPath);
app.setLoginItemSettings({
    openAtLogin: !isDev,
    path: process.execPath,
    args: [
        '--processStart', `"${exeName}"`,
        '--process-start-args', "--hidden"
    ]
});

function createWindow() {
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
    let programWidth = 150;
    let programHeight = 49 * config.commands.length;

    mainWindow = new BrowserWindow({
        show: false,
        icon: path.join(__dirname, '../../res/img/icon.png'),
        width: programWidth,
        height: programHeight,
        x: width / 2 - programWidth / 2,
        y: height / 2 - programHeight / 2,
        skipTaskbar: true,
        alwaysOnTop: true,
        transparent: true,
        frame: false,
        toolbar: false
    });

    mainWindow.once('ready-to-show', () => mainWindow.show());

    let indexUrl = path.join(__dirname, '../frontend/index.html');
    mainWindow.loadURL(url.format({
        pathname: indexUrl,
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.setMenu(null);

    if (isDev)
        mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

let tray = null;
app.on('ready', async () => {
    createWindow();

    tray = new Tray(path.join(__dirname, '../../res/img/icon.ico'));
    let contextMenu = Menu.buildFromTemplate([
        {
            label: 'Toggle visibility',
            click: () => mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
        },
        {role: "quit"},
    ]);
    tray.setToolTip('Windows Reboot');
    tray.setContextMenu(contextMenu);

    mainWindow.on('close', () => {
        tray.destroy();
    });
});

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