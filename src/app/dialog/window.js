//             _____
//         ___/     \___        |  |
//      ##/  _.- _.-    \##  -  |  |                       -
//      ##\#=_  '    _=#/##  |  |  |  /---\  |      |      |   ===\  |  __
//      ##   \\#####//   ##  |  |  |  |___/  |===\  |===\  |   ___|  |==/
//      ##       |       ##  |  |  |  |      |   |  |   |  |  /   |  |
//      ##       |       ##  |  \= \= \====  |   |  |   |  |  \___/  |
//      ##\___   |   ___/
//      ##    \__|__/
//

const { BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const url = require('url')

let current
let currentResolve

function createDialog(parentWin, type, width, height, resizable, display) {
    return new Promise((resolve) => {
        currentResolve = resolve
        current = new BrowserWindow({
            modal: true,
            parent: parentWin,
            width: width,
            height: height,
            minWidth: 500,
            minHeight: 450,
            resizable: resizable,
            transparent: true,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        })
    
        current.loadURL(url.format({
            pathname: path.resolve(__dirname, '..', '..', '..', 'dist', 'front-end', 'browser', 'index.html'),
            protocol: 'file:',
            slashes: true,
            hash: `dialog/${type}`
        }))
    
        current.webContents.on('did-finish-load', () => {
            current.webContents.send('dialog:get', display)
        })
    })
}

function close(data) {
    current.close()
    currentResolve(data)

    current = null
    currentResolve = null
}

ipcMain.handle('dialog:open', (e, data) => {
    if(current) {
        close()
    }

    const parentWin = BrowserWindow.fromWebContents(e.sender)
    createDialog(parentWin, data.type, data.width, data.height, data.resizable, data.display).then((data) => parentWin.webContents.send('dialog:result', data))
})

ipcMain.handle('dialog:close', (e, data) => {
    close(data)
})

ipcMain.handle('dialog:open-file', async (e, data) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: data.name, extensions: data.extensions }],
    })
    if (canceled) {
        return null
    } else {
        return data.multiple ? filePaths : filePaths[0]
    }
})

module.exports = { createDialog }