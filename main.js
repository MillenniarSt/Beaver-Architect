const { app, BrowserWindow, ipcMain } = require('electron');
const getAppDataPath = require('appdata-path');
const fs = require('fs');
const { architectsDir } = require('./src/paths');
const path = require('path');

// Init ipcMain handles
const home = require('./src/windows/home/window');
require('./src/windows/edit-project/window');
require('./src/windows/dialog/window');
require('./src/windows/project/window');

app.whenReady().then(() => {
    home.createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) home.createWindow();
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    });
});

ipcMain.handle('get:app-data-path', () => {
    return getAppDataPath("Beaver Architect");
});

ipcMain.handle('get:tree-files', (e, data) => {
    return browseDir(data)
});

function browseDir(dir) {
    return fs.readdirSync(dir).map((file) => {
        const filePath = path.join(dir, file)
        if(fs.lstatSync(filePath).isDirectory()) {
            return {path: filePath, name: file, files: browseDir(filePath)}
        } else {
            return {path: filePath, name: file}
        }
    })
}

ipcMain.handle('architect:get-all', () => {
    return fs.readdirSync(architectsDir).map((dir) => JSON.parse(fs.readFileSync(path.join(architectsDir, dir, 'architect.json'), 'utf8')))
});