const { app, BrowserWindow, ipcMain } = require('electron')
const os = require('os')
const fs = require('fs')
const path = require('path')
const { default: getAppDataPath } = require('appdata-path')

console.log('            _____            ')
console.log('        ___/     \\___        ')
console.log('      |/  _.- _.-    \\|      ')
console.log('     ||\\\\=_  \'    _=//||     ')
console.log('     ||   \\\\\\===///   ||     ')
console.log('     ||       |       ||     ')
console.log('     ||       |       ||     ')
console.log('     ||\\___   |   ___/||     ')
console.log('           \\__|__/           ')
console.log('                             ')
console.log('       Beaver Architect      ')
console.log('          Millenniar         ')
console.log('                             ')

const log = console.log
console.log = (...args) => {
    log('\x1b[90m[     Server     ]', ...args, '\x1b[0m')
}

const info = console.info
console.info = (...args) => {
    info('[     Server     ] ', ...args)
}

const warn = console.warn
console.warn = (...args) => {
    warn('\x1b[33m[     Server     ] | WARN |', ...args, '\x1b[0m')
}

const error = console.error
console.error = (...args) => {
    error('\x1b[31m[     Server     ] | ERROR |', ...args, '\x1b[0m')
}

const debug = console.debug
console.debug = (...args) => {
    debug('[     Server     ] | DEBUG |', ...args)
}

// Load windows

const { createHomeWindow } = require('./src/app/home/window')
require('./src/app/architect-util/three-image/window')
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

// Log

ipcMain.handle('log', (e, data) => {
    console.log(data)
})

ipcMain.handle('warn', (e, data) => {
    console.warn(data)
})

ipcMain.handle('error', (e, data) => {
    console.error(data)
})

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

const dir = getAppDataPath('Beaver Architect')
const projectsDir = path.join(dir, 'projects')
const architectsDir = path.join(dir, 'architects')

// Project

let projects = new Map()

ipcMain.handle('project:load-all', (e, data) => {
    projects = new Map(fs.readdirSync(projectsDir).map((identifier) => {
        return [identifier, {
            data: JSON.parse(fs.readFileSync(path.join(projectsDir, identifier, 'project.json'), 'utf8')),
            info: fs.readFileSync(path.join(projectsDir, identifier, 'info.md'), 'utf8')
        }]
    }))
})

ipcMain.handle('project:get-all', (e, data) => {
    return Array.from(projects.values()).filter(
        (project) => (!data.architect || project.data.architect === data.architect) && (!data.type || project.data.type === data.type)
    ).map((project) => project.data)
})

ipcMain.handle('project:get', (e, data) => {
    return projects.get(data)
})

ipcMain.handle('project:create', (e, data) => {
    const identifier = data.data.identifier

    fs.mkdirSync(path.join(projectsDir, identifier))

    fs.writeFileSync(path.join(projectsDir, identifier, 'project.json'), JSON.stringify(data.data))
    fs.writeFileSync(path.join(projectsDir, identifier, 'info.md'), data.info)
    fs.copyFileSync(data.image, path.join(projectsDir, identifier, 'image.png'))
    fs.copyFileSync(data.background, path.join(projectsDir, identifier, 'background.png'))

    projects.set(identifier, { data: data.data, info: data.info })
})

ipcMain.handle('project:edit', (e, data) => {
    fs.writeFileSync(path.json(projectsDir, data.identifier, 'project.json'), JSON.stringify(data.data))
    fs.writeFileSync(path.json(projectsDir, data.identifier, 'info.md'), data.info)
    fs.copyFileSync(data.image, path.json(projectsDir, data.identifier, 'image.png'))
    fs.copyFileSync(data.background, path.json(projectsDir, data.identifier, 'background.png'))

    projects.set(data.identifier, { data: data.data, info: data.info })
})

ipcMain.handle('project:delete', (e, data) => {
    fs.rmdirSync(path.json(projectsDir, data), { recursive: true })

    projects.delete(data)
})

// Architect

let architects = new Map()

ipcMain.handle('architect:load-all', (e, data) => {
    architects = new Map(fs.readdirSync(architectsDir).map((identifier) => {
        return [identifier, JSON.parse(fs.readFileSync(path.join(architectsDir, identifier, 'architect.json'), 'utf8'))]
    }))
})

ipcMain.handle('architect:get-all', (e, data) => {
    return Array.from(architects.values())
})

ipcMain.handle('architect:get', (e, data) => {
    return architects.get(data)
})