const { app, BrowserWindow, ipcMain } = require('electron')
const os = require('os')
const fs = require('fs')
const path = require('path')
const { fork } = require('child_process')
const { default: getAppDataPath } = require('appdata-path')

const log = console.log
console.log = (...args) => {
    log('[     Client     ] ', ...args)
}

// Load windows

const { createHomeWindow } = require('./src/app/home/window')
require('./src/app/dialog/window')
require('./src/app/project/window')
require('./src/app/progress/window')

app.whenReady().then(() => {
    createHomeWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createHomeWindow()
    })

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })
})

// Load Plugins

let plugins = []

ipcMain.handle('plugin:init-all', async (e) => {
    if(plugins.length === 0) {
        loadAllPlugins(e)
    } else {
        sendAllPlugins(e.sender)
    }
})

ipcMain.handle('plugin:load-all', async (e) => {
    loadAllPlugins(e)
})

ipcMain.handle('plugin:get-all', async (e) => {
    sendAllPlugins(e.sender)
})

function sendAllPlugins(sender) {
    sender.send('plugin:send-all', plugins)
}

async function loadAllPlugins(e) {
    plugins = []
    const pluginsDir = `${getAppDataPath("Beaver Architect")}\\plugins`
    const dirs = fs.readdirSync(pluginsDir)
    for (let i = 0; i < dirs.length; i++) {
        await loadPlugin(path.join(pluginsDir, dirs[i]))
        e.sender.send('plugin:loaded', i / (dirs.length - 1))
    }
    sendAllPlugins(e.sender)
}

function loadPlugin(dir) {
    return new Promise((resolve) => {
        const pluginProcess = fork(`${dir}\\src\\index.js`, {
            cwd: dir,
            stdio: 'inherit',
        });

        pluginProcess.on('message', (data) => {
            plugins.push(data)
            console.log(`Loaded Plugin: ${data.identifier}`)
            resolve()
        })
    })
}

// System Info

ipcMain.handle('get:user_name', () => {
    return os.userInfo().username
})

ipcMain.handle('get:app_dir', () => {
    return getAppDataPath("Beaver Architect")
})

// File Managment

ipcMain.handle('file:exists', (e, data) => {
    return fs.existsSync(data)
})

ipcMain.handle('file:read', (e, data) => {
    return fs.readFileSync(data, 'utf8')
})

ipcMain.handle('file:write', (e, data) => {
    fs.mkdirSync(path.dirname(data.path), { recursive: true })
    fs.writeFileSync(data.path, data.data ?? '')
})

ipcMain.handle('dir:new', (e, data) => {
    fs.mkdirSync(data, { recursive: true })
})

ipcMain.handle('dir:read', (e, data) => {
    return fs.readdirSync(data).map((file) => {
        return path.join(data, file)
    })
})

ipcMain.handle('dir:read-all', (e, data) => {
    return readDir(data)
})

function readDir(dir) {
    return fs.readdirSync(dir).map((file) => {
        const filePath = path.join(dir, file)
        if (fs.lstatSync(filePath).isDirectory()) {
            return {
                name: file,
                path: filePath,
                children: readDir(filePath)
            }
        }
        return {
            name: file,
            path: filePath
        }
    })
}