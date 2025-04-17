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
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { Project } from '../../client/project/project';

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

  _project?: Project

  pages: Page[] = []

  private pagesMessageSource = new BehaviorSubject<PageMessage>({})
  pagesMessage = this.pagesMessageSource.asObservable()

  close() {
    if(this._project) {
      this.project.server.close()
      this.project.architect.server.close()
    }
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
}
