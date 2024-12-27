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

export type ProgressDisplay = {
    title: string
    description?: string
    cancellable?: boolean
    autoClose?: boolean
}

export type Task = {
    label: string,
    weight?: number,
    started?: boolean,
    subtasks: {
        label: string
        weight?: number
    }[]
}

export type TaskUpdate = {
    index: number,
    progress: number
}

export function openProgress(process: string, display: ProgressDisplay, tasks: Task[], onStart?: (update: (update: TaskUpdate) => void) => void) {
    return new Promise((resolve) => {
        const { ipcRenderer } = window.require('electron')

        ipcRenderer.invoke('progress:open', {
            process, display, tasks
        })

        ipcRenderer.once('progress:start', (e, data) => {
            const update = (update: TaskUpdate) => {
                updateProgress(process, update)
            }
            if(onStart) {
                onStart(update)
            }
        })

        ipcRenderer.once('progress:end', (e, data) => {
            resolve({
                isCancelled: data.isCancelled,
                completed: data.completed
            })
        })
    })
}

export function updateProgress(process: string, update: TaskUpdate) {
    const { ipcRenderer } = window.require('electron')

    ipcRenderer.invoke('progress:update', {
        process, update
    })
}