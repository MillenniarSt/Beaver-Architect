import { Observable, Subject, takeUntil } from "rxjs"
import { ServerProblem, WebSocketError } from "../errors"
import { v4 } from "uuid"
import { baseErrorDialog, infoDialog, openBaseDialog, openErrorDialog } from "../../app/dialog/dialogs"
import { Child, Command } from "@tauri-apps/plugin-shell"
import { invoke } from "@tauri-apps/api/core"

export type WebSocketMessage = {
    path: string,
    id?: string,
    data: {}
}

export type WebSocketResponse = {
    id: string,
    data?: {},
    err?: WebSocketError
}

export abstract class Server {

    private ws: WebSocket | null = null
    private messageSubject = new Subject<WebSocketMessage>()

    public messages$: Observable<WebSocketMessage> = this.messageSubject.asObservable()

    private channels: Map<string, (value: any) => boolean | void> = new Map()

    abstract get isLocal(): boolean
    abstract get url(): string

    abstract open(): Promise<void>

    abstract close(): void

    connect(): Promise<void> {
        return new Promise((resolve) => {
            console.log('Connecting to', this.url)
            this.ws = new WebSocket(this.url)

            this.ws.onopen = () => {
                console.log('Client Connected to WebSocketServer')
                resolve()
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data)

                    if (message.path) {
                        try {
                            this.messageSubject.next(message)
                        } catch (error) {
                            const socketError = error instanceof ServerProblem ? error.toSocketError() : toSocketError(error)
                            this.respond(message.id ?? null, { path: message.path, data: message.data }, socketError)
                        }
                    } else {
                        if (message.err) {
                            console.error('Socket Error:', message.err)
                            openErrorDialog(message.err, message.path)
                        }

                        const resolve = this.channels.get(message.id)
                        if (resolve) {
                            if (resolve(message.data)) {
                                this.channels.delete(message.id)
                            }
                        } else {
                            console.error('Invalid Response Id')
                            openBaseDialog(baseErrorDialog('Invalid Response', 'The Server tried to respond to a request with an unexpected id'))
                        }
                    }
                } catch (error) {
                    console.error('Invalid socket message', error)
                    openErrorDialog(error)
                }
            }

            this.ws.onclose = (event) => {
                console.warn('Connection WebSocket closed')
                if (this.onClose) {
                    this.onClose(event)
                }
            }

            this.ws.onerror = (error) => {
                console.error('WebSocket Error:', error)
                if (this.onError) {
                    this.onError(error)
                }
            }
        })
    }

    onClose: ((event: CloseEvent) => void) | undefined

    onError: ((event: Event) => void) | undefined

    disconnect() {
        if (this.isOpen) {
            this.ws!.close()
        }
    }

    listen(path: string, on: (data: any) => void) {
        this.messages$.subscribe((message) => {
            if (message.path === path) {
                on(message.data)
            }
        })
    }

    listenUntil(path: string, on: (data: any) => void, subject: Subject<void>) {
        this.messages$.pipe(takeUntil(subject)).subscribe((message) => {
            if (message.path === path) {
                on(message.data)
            }
        })
    }

    send(path: string, data: {} = {}) {
        if (this.isOpen) {
            this.ws!.send(JSON.stringify({ path, data }))
        } else {
            console.error('WebSocket Server connection not available')
        }
    }

    request(path: string, data: {} = {}): Promise<any> {
        return new Promise((resolve) => {
            if (this.isOpen) {
                const id = v4()
                this.channels.set(id, resolve)
                this.ws!.send(JSON.stringify({ path: path, id: id, data: data }))
            } else {
                console.error('WebSocket Server connection not available')
                resolve(undefined)
            }
        })
    }

    channel(path: string, data: {}, on: (data: any) => boolean | void): Promise<void> {
        return new Promise((resolve) => {
            if (this.isOpen) {
                const id = v4()
                this.channels.set(id, (data: any) => {
                    if (data === '$close') {
                        resolve()
                        return true
                    } else {
                        return on(data) ?? false
                    }
                })
                this.ws!.send(JSON.stringify({ path: path, id: id, data: data ?? {} }))
            } else {
                console.error('WebSocket Server connection not available')
                resolve(undefined)
            }
        })
    }

    respond(id: string | undefined | null, data: {}, err?: WebSocketError) {
        if (this.isOpen) {
            if (id === undefined) {
                console.error(`Trying to respond without a response id`)
            } else {
                this.ws!.send(JSON.stringify({ id: id, data: data, err: err }))
            }
        } else {
            console.error('WebSocket Server connection not available')
        }
    }

    get isOpen(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN
    }
}

export class LocalServer extends Server {

    protected process: Child | null = null

    /*constructor(
        readonly port: number,
        readonly command: Command<string>,
        protected readonly openKey: string
    ) {
        super()
    }*/

    constructor(
        readonly port: number,
        readonly path: string,
        readonly args: string[],
        protected readonly openKey: string
    ) {
        super()
    }

    override async open(): Promise<void> {
        await invoke('run_exe', { path: this.path, args: this.args, readySignal: this.openKey })

        /*await new Promise<void>(async (resolve) => {
            this.command.stdout.on('data', (line) => {
                if (`${line}`.includes(this.openKey)) {
                    resolve()
                }
                console.log(`${line}`.trim())
            })
            this.command.stderr.on('data', (line) => {
                console.error(`${line}`.trim())
            })
            this.command.on('close', (data) => {
                console.log(`Local Server Process exited with code ${data.code}`)
            })

            this.process = await this.command.spawn()
        })
        this.command.stdout.removeAllListeners('data')
        this.command.stdout.on('data', (line) => {
            console.log(`${line}`.trim())
        })*/

        await this.connect()
    }

    override close(): void {
        this.disconnect()
        this.process?.kill()
    }

    override get isLocal(): boolean {
        return true
    }

    override get url(): string {
        return `ws://localhost:${this.port}`
    }
}

export class RemoteServer extends Server {

    constructor(
        readonly url: string
    ) {
        super()
    }

    override open(): Promise<void> {
        return this.connect()
    }

    override close(): void {
        this.disconnect()
    }

    override get isLocal(): boolean {
        return false
    }
}

export function getFreePort(): Promise<number> {
    return invoke<number>('get_free_port')
}

export function toSocketError(err: any): WebSocketError {
    return {
        severity: 'error',
        name: err.name,
        message: err.message,
        stack: err.stack,
        errno: err.errno,
        syscall: err.syscall
    }
}