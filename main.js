const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const getAppDataPath = require('appdata-path');
const home = require('./src/windows/home/window');
const editProject = require('./src/windows/edit-project/window');

app.whenReady().then(() => {
    home.createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) home.createWindow();
    })
});

ipcMain.handle('open:home', () => {
    home.createWindow();
});

ipcMain.handle('open:edit-project', (e, data) => {
    editProject.createWindow(data.win ?? home.win, data.project);
});

ipcMain.handle('close:home', () => {
    home.close();
});

ipcMain.handle('close:edit-project', (e, data) => {
    editProject.close();
});

ipcMain.handle('get:app-data-path', () => {
    return getAppDataPath("Beaver Architect");
});

ipcMain.handle('dialog:openFile', async (e, data) => {
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