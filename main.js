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

ipcMain.handle('file:read-text', (e, data) => {
    return fs.readFileSync(data, 'utf8').replace(/\r\n/g, '\n')
});

ipcMain.handle('file:write-text', (e, data) => {
    fs.writeFileSync(data.file, data.text)
});

ipcMain.handle('file:create-dir', (e, data) => {
    fs.mkdirSync(data.dir);
});

ipcMain.handle('file:rename', (e, data) => {
    fs.renameSync(data.file, data.rename);
});

ipcMain.handle('file:delete', (e, data) => {
    fs.rmSync(data.file, { recursive: true });
});

ipcMain.handle('architect:get-all', () => {
    return fs.readdirSync(architectsDir).map((dir) => JSON.parse(fs.readFileSync(path.join(architectsDir, dir, 'architect.json'), 'utf8')))
});