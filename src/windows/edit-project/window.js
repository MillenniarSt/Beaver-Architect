const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow(parentWin, project) {
    win = new BrowserWindow({
        modal: true,
        parent: parentWin,
        width: 1000,
        height: 700,
        //resizable: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(app.getAppPath(), 'preload.js')
        }
    });

    win.loadURL(url.format({
        pathname: path.join(app.getAppPath(), 'build', 'index.html'),
        protocol: 'file:',
        slashes: true,
        hash: 'edit-project'
    }));

    win.webContents.on('did-finish-load', () => {
        win.webContents.send('project-edit:get', project);
    });
}

function close() {
    win.close();
    win = null;
}

ipcMain.handle('edit-project:open', (e, data) => {
    createWindow(BrowserWindow.fromWebContents(e.sender), data.project);
});

ipcMain.handle('edit-project:close', (e, data) => {
    close();
});

module.exports = { win, createWindow, close };