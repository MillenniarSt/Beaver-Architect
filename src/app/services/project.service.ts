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

import { Injectable, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WebSocketServer } from '../socket';
import { Command } from '@tauri-apps/plugin-shell'
import { openErrorDialog } from '../dialog/dialogs';
import { appDataDir } from '@tauri-apps/api/path';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

export type Project = {
  identifier: string

  type: string
  architect: string

  name: string
  authors: string
  description: string

  image: string
  background: string
}

export type Architect = {
  identifier: string,
  version: string,

  name: string,
  icon: string,
  port: number
}

export type MaterialGroup = {
  label: string,
  icon: string,
  children: Material[]
}

export type Material = {
  id: string,
  label: string,
  icon: string
}

export type Page = {
  path: string,
  icon: string,
  label: string,
  data?: any,
  isSaved?: boolean,
  save?: () => void,
  component: Type<any>
}

export type PageMessage = {
  openPage?: Page,
  selectPage?: number
}

@Injectable()
export class ProjectService {

  readonly server: WebSocketServer = new WebSocketServer()
  readonly architect: WebSocketServer = new WebSocketServer()

  isLocal: boolean = true
  isPublic: boolean = false

  _project?: Project
  _architectData?: Architect

  materialGroups: MaterialGroup[] = []
  materials: Record<string, Material> = {}

  openServer(identifier: string, port: number): Promise<void> {
    return new Promise(async (resolve) => {
      const command = Command.create('run-server', [`${await appDataDir()}\\server\\src\\index.js`])

      command.on('close', (data) => {
        console.error(`Project Server ${identifier} closed with code ${data.code}`)
      })
      command.on('error', (error) => {
        console.error(`Error in the Project Server ${identifier}`, error)
        openErrorDialog(error)
      })
  
      command.stdout.on('data', (line) => {
        console.log('Server Output', line)
      })
  
      command.stderr.on('data', (line) => {
        console.error(`Error in the Project Server ${identifier} at line: ${line}`)
      })

      command.execute()
    })
  }

  pages: Page[] = []

  private pagesMessageSource = new BehaviorSubject<PageMessage>({})
  pagesMessage = this.pagesMessageSource.asObservable()

  close() {
    getCurrentWebviewWindow().close()
  }

  openPage(page: Page) {
    const equal = this.pages.filter((iPage) => iPage.path === page.path && iPage.component === page.component)
    if(equal.length > 0) {
      this.pagesMessageSource.next({
        selectPage: this.pages.indexOf(equal[0])
      })
    } else {
      this.pagesMessageSource.next({
        openPage: page,
        selectPage: this.pages.length
      })
    }
  }

  getPage(index: number): Page {
    return this.pages[index]
  }

  get project(): Project {
    return this._project!
  }

  get architectData(): Architect {
    return this._architectData!
  }
}
