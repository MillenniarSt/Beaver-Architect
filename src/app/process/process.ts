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

import { getCurrentWebviewWindow, WebviewWindow } from "@tauri-apps/api/webviewWindow"
import { WebSocketServer } from "../socket"

export type ProgressOptions = {
    title: string
    description?: string
    cancellable?: boolean
    autoClose?: boolean
}

export enum TaskState {
    UNDONE = 'undone',
    EXECUTING = 'executing',
    COMPLETED = 'completed'
}

export enum ProcessState {
    PENDING,
    STARTING,
    EXECUTING,
    DONE,
    CLOSED
}

export type TaskUpdate = (progress: number, task?: { location: number[], state: TaskState }) => void

export class Process {

    protected state: ProcessState = ProcessState.PENDING
    protected win: WebviewWindow | null = null

    protected progress: number = 0

    protected readonly tasksWeight: number
    protected readonly tasksProgress: (number | null)[]

    constructor(
        readonly id: string,
        readonly options: ProgressOptions,
        readonly tasks: Task<any>[],
        public onClose?: (cancelled: boolean, completed: boolean[]) => void
    ) {
        this.tasksProgress = new Array(tasks.length).fill(null)

        let tasksWeight: number = 0
        tasks.forEach((task) => tasksWeight += task.weight)
        this.tasksWeight = tasksWeight
    }

    start(): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.state !== ProcessState.PENDING) {
                console.error(`Can not start the process: it is already started [state=${this.state}]`)
                resolve(false)
            }

            this.state = ProcessState.STARTING
            this.win = new WebviewWindow('process', {
                url: 'index.html#/process',
                parent: getCurrentWebviewWindow(),

                title: this.options.title,
                center: true,
                width: 800,
                height: 500,
                closable: false,
                decorations: false,
                skipTaskbar: true,
                shadow: true
            })

            this.win.once('tauri://created', () => {
                this.win!.once('process:ready', async () => {
                    await this.win!.emit('process:get', {
                        process: this.id,
                        options: this.options,
                        tasks: this.mapTasks(this.tasks)
                    })
                    this.state = ProcessState.EXECUTING
                    resolve(true)
                })
            })

            this.win.once('tauri://error', (e) => {
                console.error('Window Process Error:', e)
                if (this.state === ProcessState.STARTING) {
                    this.state = ProcessState.PENDING
                    resolve(false)
                }
            })

            this.win.once<{ isCancelled: boolean, completed: number }>('process:close', () => this.close())
        })
    }

    async executeTask(index: number, data?: {}): Promise<void> {
        const task = this.tasks[index]
        if (task.progress === null) {
            let lastSentProgress = 0

            await task.execute(data ?? {}, (progress, subtask) => {
                this.tasksProgress[index] = progress
                this.updateProgress()

                if (subtask) {
                    subtask.location = [index, ...subtask.location]
                    this.win!.emit('process:update', { progress: this.progress, task: { index, progress }, subtask })
                } else if (progress - lastSentProgress >= 0.01) {
                    lastSentProgress = progress
                    this.win!.emit('process:update', { progress: this.progress, task: { index, progress }, subtask })
                }
            })

            if (this.progress === 1) {
                this.state = ProcessState.DONE
                if (this.options.autoClose) {
                    setTimeout(() => this.close(), 1000)
                }
            }
        } else {
            console.warn(`Task already started [${task.label}]`)
        }
    }

    close() {
        if (this.state === ProcessState.DONE) {
            this.exeClose(false, new Array(this.tasks.length).fill(true))
        } else if (this.state === ProcessState.EXECUTING) {
            if (this.options.cancellable) {
                this.exeClose(true, this.tasks.map((task) => task.progress === 1))
            } else {
                console.warn('Can not close an executing process that is not cancellable')
            }
        } else {
            console.warn(`Can not close a non executing process [state=${this.state}]`)
        }
    }

    protected exeClose(cancelled: boolean, completed: boolean[]) {
        if (this.onClose) {
            this.onClose(cancelled, completed)
        }

        this.win?.close()
    }

    protected updateProgress() {
        let progress = 0
        this.tasks.forEach((task, i) => progress += (this.tasksProgress[i] ?? 0) * (task.weight / this.tasksWeight))
        this.progress = progress
    }

    protected mapTasks(tasks: Task<any>[]): {}[] {
        return tasks.map((task) => {
            return {
                label: task.label,
                subtasks: task.subtasks.length > 0 ? this.mapTasks(task.subtasks) : []
            }
        })
    }

    get getState(): ProcessState {
        return this.state
    }
}

export abstract class Task<T extends {}> {

    protected _progress: number | null = null

    constructor(
        readonly label: string,
        readonly weight: number,
        readonly subtasks: Task<T>[]
    ) { }

    async execute(data: T, update: TaskUpdate): Promise<void> {
        this._progress = 0
        update(this._progress, { location: [], state: TaskState.EXECUTING })

        await this._execute(data, update)

        this._progress = 1
        update(this._progress, { location: [], state: TaskState.COMPLETED })
    }

    protected abstract _execute(data: T, update: TaskUpdate): Promise<void>

    get progress(): number | null {
        return this._progress
    }
}

export class TaskGroup<T extends {}> extends Task<T> {

    async _execute(data: T, update: TaskUpdate): Promise<void> {
        let subTaskWeight = 0
        let subTaskDoneWeight = 0
        this.subtasks.forEach((subtask) => subTaskWeight += subtask.weight)

        for (let i = 0; i < this.subtasks.length; i++) {
            const subtask = this.subtasks[i]
            await subtask.execute(data, (progress, task) => {
                this._progress = (subTaskDoneWeight + (progress * subtask.weight)) / subTaskWeight
                if (task) {
                    task.location = [i, ...task.location]
                }
                update(this._progress, task)
            })
            subTaskDoneWeight += subtask.weight
            this._progress = subTaskDoneWeight / subTaskWeight
            update(this._progress)
        }

        subTaskDoneWeight = subTaskWeight
        this._progress = 1
        update(this._progress)
    }
}

export abstract class SimpleTask<T extends {}> extends Task<T> {

    constructor(label: string, weight: number) {
        super(label, weight, [])
    }
}

export class SingleTask<T extends {}> extends SimpleTask<T> {

    readonly exe: (data: T) => Promise<void>

    constructor(label: string, weight: number, exe: (data: T) => Promise<void>) {
        super(label, weight)
        this.exe = exe
    }

    override _execute(data: T, update: TaskUpdate): Promise<void> {
        return this.exe(data)
    }
}

export class ForEachTask<T extends {}, I> extends SimpleTask<T> {

    readonly get: (data: T) => I[]
    readonly exe: (item: I, data: T) => Promise<void>

    constructor(label: string, weight: number, get: (data: T) => I[], exe: (item: I, data: T) => Promise<void>) {
        super(label, weight)
        this.get = get
        this.exe = exe
    }

    override async _execute(data: T, update: TaskUpdate): Promise<void> {
        const array = this.get(data)
        for (let i = 0; i < array.length; i++) {
            await this.exe(array[i], data)
            update(i / array.length)
        }
    }
}

export class ChannelTask<T extends {}> extends SimpleTask<T> {

    readonly socket: WebSocketServer
    readonly path: string
    readonly getData?: (data: T) => any

    constructor(label: string, weight: number, socket: WebSocketServer, path: string, getData?: (data: T) => any) {
        super(label, weight)
        this.socket = socket
        this.path = path
        this.getData = getData
    }

    protected override async _execute(data: T, update: TaskUpdate): Promise<void> {
        await this.socket.channel(this.path, this.getData ? this.getData(data) : {}, (received: { progress: number }) => update(received.progress))
    }
}