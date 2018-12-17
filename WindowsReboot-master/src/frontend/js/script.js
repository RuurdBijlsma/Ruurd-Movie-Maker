document.addEventListener('DOMContentLoaded', init, false);
const {exec} = require('child_process');
const {remote} = require('electron');
const globalShortcut = remote.globalShortcut;
const mainWindow = remote.getCurrentWindow();
const {config} = require('../config.js');
const commands = config.commands;

async function init() {
    document.querySelector('.content').innerHTML = commands.map((c, i) => `<p onclick="activateResult(${i})">${c.name}</p>`).join('');

    windowHider = new WindowHider(mainWindow, document.body);
    currentIndex = 0;
    selectResult(0);
    registerShortcuts();
}

async function activateResult(index) {
    selectResult(index);
    exec(commands[index].command);
    await windowHider.hide();
}

function selectResult(index) {
    currentIndex = index;
    for (let resultElement of document.querySelectorAll('.content > p[active]')) {
        resultElement.removeAttribute('active');
    }

    let element = document.querySelector(
        `p:nth-child(${currentIndex + 1})`
    );
    element.setAttribute('active', '');
}

function selectUp() {
    if (typeof currentIndex === 'undefined') return;

    if (currentIndex > 0)
        currentIndex--;
    else
        currentIndex = commands.length - 1;
    selectResult(currentIndex);
}

function selectDown() {
    if (typeof currentIndex === 'undefined') return;

    if (currentIndex + 1 < commands.length)
        currentIndex++;
    else
        currentIndex = 0;
    selectResult(currentIndex);
}

function registerShortcuts() {
    document.addEventListener('keydown', e => {
        switch (e.key) {
            case "ArrowUp":
                selectUp();
                break;
            case "ArrowDown":
                selectDown();
                break;
            case "Enter":
                activateResult(currentIndex);
                break;
            case "F12":
                remote.getCurrentWindow().webContents.toggleDevTools();
                break;
            case "F5":
                location.reload();
                break;
            case "Escape":
                windowHider.hide();
                break;
        }
    });

    const success = globalShortcut.register(config.shortcut, () => {
        console.log('togglee');
        windowHider.toggle(mainWindow);
    });

    if (!success)
        alert('Failed to register key');

    console.log('Key register success: ', globalShortcut.isRegistered(config.shortcut));
}