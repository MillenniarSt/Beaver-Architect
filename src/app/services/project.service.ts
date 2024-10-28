import { Injectable, Type } from '@angular/core';
import { Project } from '../../types';
import { ProjectType } from '../project/types';
import { BehaviorSubject } from 'rxjs';

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
  _projectType?: ProjectType

  pages: Page[] = []

  private pagesMessageSource = new BehaviorSubject<PageMessage>({})
  pagesMessage = this.pagesMessageSource.asObservable()

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
}
