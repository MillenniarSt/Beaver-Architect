const { BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
const url = require('url')

function threeImage(filePath) {
    const renderWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });

    renderWindow.loadURL(url.format({
        pathname: path.resolve(__dirname, '..', '..', '..', 'dist', 'front-end', 'browser', 'index.html'),
        protocol: 'file:',
        slashes: true,
        hash: 'home'
    }))

    renderWindow.webContents.on('did-finish-load', async () => {
        const buffer = await renderWindow.webContents.capturePage();
        fs.writeFileSync(filePath, buffer.toPNG());

        renderWindow.close();
    })
}

ipcMain.handle('capture-3d-screenshot', async (e, data) => {
    threeImage(data)
});

module.exports = { threeImage }