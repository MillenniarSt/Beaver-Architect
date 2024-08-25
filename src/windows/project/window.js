const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let windows = new Map();

function createWindow(project) {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
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
        hash: 'project'
    }));

    win.webContents.on('did-finish-load', () => {
        win.webContents.send('project:get', project);
    });

    win.maximize();

    windows.set(project._id, win);
}

function close(id) {
    windows.get(id).close();
    windows.delete(id);
}

ipcMain.handle('project:open', (e, data) => {
    createWindow(data);
});

ipcMain.handle('project:close', (e, data) => {
    close(data);
});

module.exports = { windows, createWindow, close };