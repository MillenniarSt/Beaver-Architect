import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ServerService } from '../../services/server.service';
import { NgFor, NgIf } from '@angular/common';
import { ProjectTileComponent } from '../project-tile/project-tile.component';
import { Architect, Project } from '../../types';

@Component({
  selector: 'projects',
  standalone: true,
  imports: [NgFor, NgIf, ProjectTileComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit, OnChanges {

  @Input() type?: string

  @Output() editProject = new EventEmitter<Project>()

  constructor(private server: ServerService) { }

  architects: Architect[] = [{ identifier: '', name: 'All', port: 0 }]
  projects: Project[] = []

  selectedArchitect: number = 0

  ngOnInit(): void {
    this.server.get('architects').then(({data}) => this.architects = [{ identifier: '', name: 'All' }, ...data])
    this.reloadProjects()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reloadProjects()
  }

  reloadProjects(): void {
    if (this.selectedArchitect > 0) {
      this.server.get('projects', this.type ?
        { type: this.type, architect: this.architects[this.selectedArchitect].identifier } :
        { architect: this.architects[this.selectedArchitect].identifier },
      ).then(({data}) => this.projects = data)
    } else {
      this.server.get('projects', this.type ? { type: this.type } : {}).then(({data}) => this.projects = data)
    }
  }

  switchArchitect(f: number): void {
    this.selectedArchitect += f
    this.reloadProjects()
  }

  doEditProject(project: Project): void {
    this.editProject.emit(project)
  }

  doDeleteProject(identifier: string): void {
    this.server.delete(`projects/${identifier}`).then(() => this.reloadProjects())
  }
}
