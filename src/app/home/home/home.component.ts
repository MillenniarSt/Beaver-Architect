import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ProjectsComponent } from "../projects/projects.component";
import { EditProjectComponent } from "../edit-project/edit-project.component";
import { Project } from '../../types';
import { ElectronService } from 'ngx-electron';
import { getProjectDir } from '../../paths';

@Component({
  selector: 'home',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, ProjectsComponent, EditProjectComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  loading = true

  constructor(private cdr: ChangeDetectorRef, private electron: ElectronService) { }

  ngOnInit(): void {
    this.electron.ipcRenderer.invoke('architect:load-all').then(() => {
      this.electron.ipcRenderer.invoke('project:load-all').then(() => {
        this.loading = false
        this.cdr.detectChanges()
      })
    })
  }

  @Input() type?: string

  @Input() interactive: HomeInteractive = HomeInteractive.PROJECTS

  isSelectedType(type: string): boolean {
    return this.type == type
  }

  selectType(type: string): void {
    if(this.interactive === HomeInteractive.PROJECTS) {
      this.type = this.type === type ? undefined : type
    }
  }

  newProject() {
    this.interactive = HomeInteractive.NEW_PROJECT
    this.type = this.type ?? 'world'
  }

  editProject?: Project
  editProjectInfo?: string

  doEditProject(identifier: string) {
    this.electron.ipcRenderer.invoke('project:get', identifier).then((project) => {
      this.editProject = project.data
      this.editProjectInfo = project.info
      this.changeInteractive(HomeInteractive.EDIT_PROJECT)
    })
  }

  changeInteractive(interactive: HomeInteractive) {
    this.interactive = interactive
  }

  openSettings() {
    this.electron.ipcRenderer.invoke('settings:open')
  }
}

export enum HomeInteractive {

  PROJECTS = 'projects',
  NEW_PROJECT = 'new_project',
  EDIT_PROJECT = 'edit_project'
}