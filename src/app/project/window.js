const { BrowserWindow, ipcMain, Menu } = require('electron')
const url = require('url')
const path = require('path')
const { closeHome, createHomeWindow } = require('../home/window')
const { createSettingsWindow } = require('../settings/window')

const projectsWin = new Map()

function createWindow(identifier) {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        roundedCorners: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                { label: 'Settings', click: createSettingsWindow },
                { type: 'separator' },
                { label: 'Open new Project', click: () => {
                    createHomeWindow()
                } },
                { label: 'Return to Home', click: () => {
                    createHomeWindow(() => close(identifier))
                } },
                { label: 'Exit', click: () => close(identifier) }
            ]
        },
        {
            label: 'Dev',
            submenu: [
                { label: 'Tools', click: () => win.webContents.openDevTools(), accelerator: 'Ctrl+Shift+I' }
            ]
        }
    ]))

    win.maximize()

    win.loadURL(url.format({
        pathname: path.resolve(__dirname, '..', '..', '..', 'dist', 'front-end', 'browser', 'index.html'),
        protocol: 'file:',
        slashes: true,
        hash: 'project'
    }))

    win.webContents.on('did-finish-load', () => {
        closeHome()
        win.webContents.send('project:get', identifier)
    })

    projectsWin.set(identifier, win)
}

function close(identifier) {
    projectsWin.delete(identifier).close()
}

ipcMain.handle('project:open', (e, data) => {
    createWindow(data)
})

ipcMain.handle('project:close', (e, data) => {
    close(data)
})

module.exports = { projectsWin, createWindow }