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

import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ProjectTileComponent } from '../project-tile/project-tile.component';
import { Architect, HomeService, Project } from '../../services/home.service';

const ALL_ARCHITECTS: Architect = { identifier: '', name: 'All', icon: '', version: '' }

@Component({
  selector: 'projects',
  standalone: true,
  imports: [NgFor, NgIf, ProjectTileComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {

  @Input() type?: string

  @Output() editProject = new EventEmitter<string>()

  selectedArchitect: number = -1

  constructor(private cdr: ChangeDetectorRef, private home: HomeService) { }

  get architect(): Architect {
    return this.selectedArchitect < 0 ? ALL_ARCHITECTS : this.home.architects[this.selectedArchitect]
  }
  get architectsLength(): number {
    return this.home.architects.length
  }

  get projects(): Project[] {
    return this.home.getProjects(this.type, this.selectedArchitect < 0 ? undefined : this.home.architects[this.selectedArchitect].identifier)
  }

  switchArchitect(f: number) {
    this.selectedArchitect += f
    this.cdr.detectChanges()
  }

  doEditProject(project: Project) {
    this.editProject.emit(project.identifier)
  }

  async doDeleteProject(identifier: string) {
    await this.home.deleteProject(identifier)
    this.cdr.detectChanges()
  }
}
