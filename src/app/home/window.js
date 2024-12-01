const { BrowserWindow, ipcMain, Menu } = require('electron')
const url = require('url')
const path = require('path')

let homeWin

function createHomeWindow(onOpen) {
    Menu.setApplicationMenu(null)

    homeWin = new BrowserWindow({
        width: 1100,
        height: 700,
        minWidth: 900,
        minHeight: 600,
        roundedCorners: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    homeWin.loadURL(url.format({
        pathname: path.resolve(__dirname, '..', '..', '..', 'dist', 'front-end', 'browser', 'index.html'),
        protocol: 'file:',
        slashes: true,
        hash: 'home'
    }))

    homeWin.webContents.on('did-finish-load', async () => {
        if(onOpen) {
            onOpen()
        }
    })
}

function closeHome() {
    if(homeWin) {
        homeWin.close();
        homeWin = null;
    }
}

ipcMain.handle('home:open', () => {
    createHomeWindow()
})

ipcMain.handle('home:close', () => {
    closeHome()
})

module.exports = { homeWin, closeHome, createHomeWindow }