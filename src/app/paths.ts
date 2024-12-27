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

export let userName: string

export let dir: string

export let projectsDir: string
export let architectsDir: string

export async function ensurePaths(ipcRenderer: Electron.IpcRenderer) {
    userName = await ipcRenderer.invoke('get:user_name')
    dir = await ipcRenderer.invoke('get:app_dir')
    projectsDir = `${dir}\\projects`
    architectsDir = `${dir}\\architects`
}

export function getProjectDir(identifier: string): string {
    return `${projectsDir}\\${identifier}`
}

export function getArchitectDir(identifier: string): string {
    return `${architectsDir}\\${identifier}`
}