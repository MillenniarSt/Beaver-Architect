const { BrowserWindow, ipcMain, Menu } = require('electron')
const url = require('url')
const path = require('path')

let settingsWin

function createSettingsWindow() {
    Menu.setApplicationMenu(null)

    settingsWin = new BrowserWindow({
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

    settingsWin.loadURL(url.format({
        pathname: path.resolve(__dirname, '..', '..', '..', 'dist', 'front-end', 'browser', 'index.html'),
        protocol: 'file:',
        slashes: true,
        hash: 'settings'
    }))
}

function closeSettings() {
    if(settingsWin) {
        settingsWin.close();
        settingsWin = null;
    }
}

ipcMain.handle('settings:open', () => {
    createSettingsWindow()
})

ipcMain.handle('settings:close', () => {
    closeSettings()
})

module.exports = { settingsWin, closeSettings, createSettingsWindow }