const { BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

let win

function threeImage(data) {
    win = new BrowserWindow({
        width: 500,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });

    win.loadURL(url.format({
        pathname: path.resolve(__dirname, '..', '..', '..', '..', 'dist', 'front-end', 'browser', 'index.html'),
        protocol: 'file:',
        slashes: true,
        hash: 'three-image'
    }))

    win.webContents.on('did-finish-load', () => {
        win.webContents.send('three-image:get', data)
    })
}

ipcMain.handle('generate-images', async (e, data) => {
    threeImage(data)
});

module.exports = { threeImage }