const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1100,
        height: 700,
        minWidth: 900,
        minHeight: 600,
        roundedCorners: true,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(app.getAppPath(), 'preload.js')
        }
    });

    win.loadURL(url.format({
        pathname: path.join(app.getAppPath(), 'build', 'index.html'),
        protocol: 'file:',
        slashes: true,
        hash: 'home'
    }));
}

function close() {
    win.close();
    win = null;
}

ipcMain.handle('home:open', () => {
    createWindow();
});

ipcMain.handle('home:close', () => {
    close();
});

module.exports = { win, createWindow, close };