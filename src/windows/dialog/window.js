const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');

let dialogs = new Map();

function createWindow(parentWin, type, width, height, display) {
    id = 'random-id';

    let dialog = new BrowserWindow({
        modal: true,
        parent: parentWin,
        width: width,
        height: height,
        resizable: false,
        transparent: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(app.getAppPath(), 'preload.js')
        }
    });

    dialog.loadURL(url.format({
        pathname: path.join(app.getAppPath(), 'build', 'index.html'),
        protocol: 'file:',
        slashes: true,
        hash: `dialog/${type}`
    }));

    dialog.webContents.on('did-finish-load', () => {
        dialog.webContents.send('dialog:get', { id, display });
    });

    dialogs.set(id, dialog);
}

function close(id) {
    dialogs.get(id).close();
    dialogs.delete(id);
}

function closeAll() {
    dialogs.forEach((dialog) => {
        dialog.close();
    });
    dialogs.clear();
}

ipcMain.handle('dialog:open', (e, data) => {
    createWindow(BrowserWindow.fromWebContents(e.sender), data.type, data.width, data.height, data.display);
});

ipcMain.handle('dialog:close', (e, data) => {
    close(data);
});

ipcMain.handle('dialog:close-all', (e, data) => {
    closeAll();
});

ipcMain.handle('dialog:open-file', async (e, data) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: data.name, extensions: data.extensions }],
    });
    if (canceled) {
        return null;
    } else {
        return data.multiple === true ? filePaths : filePaths[0];
    }
});

module.exports = { dialogs, createWindow, close, closeAll };