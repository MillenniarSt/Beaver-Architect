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

const { BrowserWindow, ipcMain, Menu } = require('electron')
const url = require('url')
const path = require('path')
const { closeHome, createHomeWindow } = require('../home/window')
const { createSettingsWindow } = require('../settings/window')
const { fork } = require('child_process')
const { default: getAppDataPath } = require('appdata-path')

const projectsWin = new Map()

async function createWindow(identifier, socketUrl, isLocal) {
    return new Promise((resolve) => {
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
                    {
                        label: 'Open new Project', click: () => {
                            createHomeWindow()
                        }
                    },
                    {
                        label: 'Return to Home', click: () => {
                            createHomeWindow(() => close(identifier))
                        }
                    },
                    { label: 'Exit', click: () => close(identifier) }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { label: 'Undo', click: () => win.webContents.send('server:send', { path: 'client/undo' }), accelerator: 'Ctrl+Z' },
                    { label: 'Redo', click: () => win.webContents.send('server:send', { path: 'client/redo' }), accelerator: 'Ctrl+Shift+Z' }
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
            win.webContents.send('project:get', { identifier, url: socketUrl, isLocal })
            resolve(win)
        })

        projectsWin.set(identifier, win)
    })
}

function close(identifier) {
    projectsWin.delete(identifier).close()
}

ipcMain.handle('project:open', async (e, data) => {
    if (data.url) {
        console.log(`Connecting to external Project Server url: ${data.url}`)

        await createWindow(data.url, data.url, false)
    } else {
        const identifier = data.identifier
        const port = await (await import('get-port')).default()

        console.log(`Opening local Project Server ${identifier} on ${port}...`)
        if (data.isPublic) {
            console.log('Project will be public')
        }

        const win = await createWindow(identifier, `ws://localhost:${port}`, true)

        const process = fork(path.join(getAppDataPath('Beaver Architect'), 'server', 'src', 'index.js'), {
            cwd: path.join(getAppDataPath('Beaver Architect'), 'server'),
            stdio: 'inherit'
        })
        process.send(JSON.stringify({ identifier: identifier, port: port, isPublic: data.isPublic }))
        process.on('message', () => {
            console.log(`Opened project ${identifier} successfully`)
            win.webContents.send('project:open-server', {})
        })
    }
})

ipcMain.handle('project:open-architect', async (e, data) => {
    return await new Promise((resolve) => {
        const architectProcess = fork(path.join(getAppDataPath('Beaver Architect'), 'architects', data.identifier, 'src', 'index.js'), {
            cwd: path.join(getAppDataPath('Beaver Architect'), 'architects', data.identifier),
            stdio: 'inherit',
        })
    
        architectProcess.send(JSON.stringify({ identifier: data.project, port: data.port }))

        architectProcess.on('message', () => resolve())
    })
})

ipcMain.handle('project:close', (e, data) => {
    close(data)
})

module.exports = { projectsWin, createWindow }