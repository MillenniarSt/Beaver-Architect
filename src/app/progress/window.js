const { BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const url = require('url')

let windows = new Map()

function createDialog(parentWin, process, display, tasks) {
    return new Promise((resolve) => {
        let win = new BrowserWindow({
            modal: true,
            parent: parentWin,
            width: 1000,
            height: 800,
            minWidth: 600,
            minHeight: 400,
            transparent: true,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        })

        win.loadURL(url.format({
            pathname: path.resolve(__dirname, '..', '..', '..', 'dist', 'front-end', 'browser', 'index.html'),
            protocol: 'file:',
            slashes: true,
            hash: 'progress'
        }))

        win.webContents.on('did-finish-load', () => {
            win.webContents.send('progress:get', { process, display, tasks })
            resolve(win)
        })
    })
}

ipcMain.handle('progress:open', (e, data) => {
    if (windows.has(data.process)) {
        console.error(`Could not open new progress '${data.process}', progress already open`)
    } else {
        const sender = BrowserWindow.fromWebContents(e.sender)
        createDialog(sender, data.process, data.display, data.tasks).then((win) => {
            windows.set(data.process, {
                win, sender
            })
            sender.webContents.send('progress:start', data.process)
        })
    }
})

ipcMain.handle('progress:update', (e, data) => {
    const { win } = windows.get(data.process)
    win.webContents.send('progress:update-win', data.update)
})

ipcMain.handle('progress:close', (e, data) => {
    const { win, sender } = windows.get(data.process)
    win.close()
    sender.webContents.send('progress:end', {
        isCancelled: data.isCancelled,
        completed: data.completed
    })
})

module.exports = { createDialog }