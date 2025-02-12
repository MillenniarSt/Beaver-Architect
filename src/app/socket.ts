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

import { Observable, Subject, takeUntil } from 'rxjs';
import { v4 } from 'uuid';
import { baseErrorDialog, openBaseDialog, openErrorDialog } from './dialog/dialogs';

export type WebSocketMessage = {
  path?: string,
  data?: {}
}

export type WebSocketResponse = {
  path?: string,
  id?: string,
  data?: any,
  err?: WebSocketError
}

export type WebSocketError = {
  name: string,
  message: string,
  stack: string,
  errno: string,
  syscall: string
}

export class WebSocketServer {

  private ws: WebSocket | null = null
  private messageSubject = new Subject<WebSocketMessage>()

  public messages$: Observable<WebSocketMessage> = this.messageSubject.asObservable()

  private openChannels: Map<string, (value: any) => boolean | void> = new Map()

  connectLocal(port: number, beaverServer?: WebSocketServer): Promise<void> {
    return this.connect(`ws://localhost:${port}`, beaverServer)
  }

  connect(url: string, beaverServer?: WebSocketServer): Promise<void> {
    return new Promise((resolve) => {
      console.log('Connecting to', url)
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('Client Connected to WebSocketServer')
        resolve()
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketResponse = JSON.parse(event.data)

          if(message.err) {
            console.error('Socket Error:', message.err)
            openErrorDialog(message.err, message.path)
          }

          if(message.id) {
            const resolve = this.openChannels.get(message.id)
            if(resolve) {
              if(resolve(message.data)) {
                this.openChannels.delete(message.id)
              }
            } else {
              console.error('Invalid Response Id')
              openBaseDialog(baseErrorDialog('Invalid Response', 'The Server tried to respond to a request with an unexpected id'))
            }
          } else {
            if(message.path === 'server/send') {
              beaverServer?.send(message.data.path, message.data.data)
            } else if(message.path === 'server/request') {
              beaverServer?.request(message.data.path, message.data.data).then((res) => this.ws!.send(JSON.stringify({ id: message.id, data: res})))
            }
            this.messageSubject.next(message)
          }
        } catch (error) {
          console.error('Invalid socket message', error)
          openErrorDialog(error)
        }
      };

      this.ws.onclose = () => {
        console.warn('Connection WebSocket closed, trying to reconnect in 3s')
        setTimeout(() => this.connect(url), 3000)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error)
        openErrorDialog(error)
      }
    })
  }

  disconnect() {
    if(this.isOpen) {
      this.ws!.close()
    }
  }

  listen(path: string, on: (data: any) => void) {
    this.messages$.subscribe((message) => {
      if(message.path === path) {
        on(message.data)
      }
    })
  }

  listenUntil(path: string, on: (data: any) => void, subject: Subject<void>) {
    this.messages$.pipe(takeUntil(subject)).subscribe((message) => {
      if(message.path === path) {
        on(message.data)
      }
    })
  }

  send(path: string, data: {} = {}) {
    if(this.isOpen) {
      this.ws!.send(JSON.stringify({path, data}))
    } else {
      console.error('WebSocket Server connection not available')
    }
  }

  request(path: string, data: {} = {}): Promise<any> {
    return new Promise((resolve) => {
      if(this.isOpen) {
        const id = v4()
        this.openChannels.set(id, resolve)
        this.ws!.send(JSON.stringify({path: path, id: id, data: data}))
      } else {
        console.error('WebSocket Server connection not available')
        resolve(undefined)
      }
    })
  }

  channel(path: string, data: {}, on: (data: any) => boolean | void): Promise<void> {
    return new Promise((resolve) => {
      if(this.isOpen) {
        const id = v4()
        this.openChannels.set(id, (data: any) => {
          if(data === '$close') {
            resolve()
            return true
          } else {
            return on(data) ?? false
          }
        })
        this.ws!.send(JSON.stringify({path: path, id: id, data: data ?? {}}))
      } else {
        console.error('WebSocket Server connection not available')
        resolve(undefined)
      }
    })
  }

  get isOpen(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}
