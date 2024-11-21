import { Observable, Subject, takeUntil } from 'rxjs';
import { v4 } from 'uuid';

export type WebSocketMessage = {
  path?: string,
  data?: {}
}

export type WebSocketResponse = {
  path?: string,
  id?: string,
  data?: {},
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

  private waitingRequests: Map<string, (value: any) => void> = new Map()

  connectLocal(port: number): Promise<void> {
    return this.connect(`ws://localhost:${port}`)
  }

  connect(url: string): Promise<void> {
    return new Promise((resolve) => {
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
          }

          if(message.id) {
            const resolve = this.waitingRequests.get(message.id)
            if(resolve) {
              resolve(message.data)
              this.waitingRequests.delete(message.id)
            } else {
              console.error('Invalid Response Id')
            }
          } else {
            this.messageSubject.next(message)
          }
        } catch (error) {
          console.error('Invalid socket message', error)
        }
      };

      this.ws.onclose = () => {
        console.warn('Connection WebSocket closed, trying to reconnect in 3s')
        setTimeout(() => this.connect(url), 3000)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket Error: ', error)
      }
    })
  }

  disconnect() {
    if(this.isOpen) {
      this.ws!.close()
    }
  }

  listen(path: string, on: (data: any) => void, subject: Subject<void>) {
    this.messages$.pipe(takeUntil(subject)).subscribe((message) => {
      if(message.path === path) {
        on(message.data)
      }
    })
  }

  send(path: string, data: {}) {
    if(this.isOpen) {
      this.ws!.send(JSON.stringify({path, data}))
    } else {
      console.error('WebSocket Server connection not available')
    }
  }

  request(path: string, data?: {}): Promise<any> {
    return new Promise((resolve) => {
      if(this.isOpen) {
        const id = v4()
        this.waitingRequests.set(id, resolve)
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
