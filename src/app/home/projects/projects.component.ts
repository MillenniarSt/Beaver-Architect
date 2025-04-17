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
import { HomeService } from '../../services/home.service';
import { ProjectInstance } from '../../../client/instance/project';
import { architects } from '../../../client/instance/instance';
import { ArchitectInstance } from '../../../client/instance/architect';
import { Version } from '../../../client/instance/version';

const ALL_ARCHITECTS = new ArchitectInstance('&all', 'All Architects', Version.FIRST)

@Component({
  selector: 'projects',
  standalone: true,
  imports: [NgFor, NgIf, ProjectTileComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {

  @Output() editProject = new EventEmitter<string>()

  search: string = ''
  selectedArchitect: number = -1

  constructor(private cdr: ChangeDetectorRef, private home: HomeService) { }

  get architect(): ArchitectInstance {
    return this.selectedArchitect >= 0 ? architects[this.selectedArchitect] : ALL_ARCHITECTS
  }

  get projects(): ProjectInstance[] {
    return this.home.getProjects(this.selectedArchitect >= 0 ? architects[this.selectedArchitect] : null, this.search)
  }

  get architectsLength(): number {
    return architects.length
  }

  switchArchitect(modifier: number) {
    this.selectedArchitect += modifier
    this.cdr.detectChanges()
  }

  doEditProject(project: ProjectInstance) {
    this.editProject.emit(project.identifier)
  }

  async doDeleteProject(identifier: string) {
    await this.home.deleteProject(identifier)
    this.cdr.detectChanges()
  }
}
