import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ProjectTileComponent } from '../project-tile/project-tile.component';
import { Architect, Project } from '../../types';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'projects',
  standalone: true,
  imports: [NgFor, NgIf, ProjectTileComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit, OnChanges {

  @Input() type?: string

  @Output() editProject = new EventEmitter<string>()

  constructor(private electron: ElectronService) { }

  architects: Architect[] = [{ identifier: '', name: 'All', port: 0, icon: '', version: '' }]
  projects: Project[] = []

  selectedArchitect: number = 0

  ngOnInit(): void {
    this.electron.ipcRenderer.invoke('architect:get-all').then((architects) => {
      this.architects = [{ identifier: '', name: 'All' }, ...architects]
      this.reloadProjects()
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reloadProjects()
  }

  reloadProjects(): void {
    if (this.selectedArchitect > 0) {
      this.electron.ipcRenderer.invoke('project:get-all', { architect: this.architects[this.selectedArchitect].identifier, type: this.type }).then((projects) => {
        console.log(projects)
        this.projects = projects
      })
    } else {
      this.electron.ipcRenderer.invoke('project:get-all', { type: this.type }).then((projects) => {
        console.log(projects)
        this.projects = projects
      })
    }
  }

  switchArchitect(f: number): void {
    this.selectedArchitect += f
    this.reloadProjects()
  }

  doEditProject(project: Project): void {
    this.editProject.emit(project.identifier)
  }

  doDeleteProject(identifier: string): void {
    this.electron.ipcRenderer.invoke('project:delete', identifier).then(() => this.reloadProjects())
  }
}
