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
import { Architect, Project } from '../types';
import { ProjectType } from '../project/types';
import { BehaviorSubject, Subject } from 'rxjs';
import { WebSocketServer } from '../../socket';
import { ElectronService } from 'ngx-electron';

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

  _project?: Project
  _projectType?: ProjectType
  _architectData?: Architect

  materialGroups: MaterialGroup[] = []
  materials: Record<string, Material> = {}

  pages: Page[] = []

  private pagesMessageSource = new BehaviorSubject<PageMessage>({})
  pagesMessage = this.pagesMessageSource.asObservable()

  private destroy$ = new Subject<void>()

  constructor(private electron: ElectronService) {
    this.architect.listen('util/generate-three-image', (data) => {
      this.electron.ipcRenderer.invoke('generate-images', data)
    }, this.destroy$)
  }

  close() {
    this.destroy$.next()
    this.destroy$.complete()
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

  get projectType(): ProjectType {
    return this._projectType!
  }

  get architectData(): Architect {
    return this._architectData!
  }
}
