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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { HomeService, Project } from '../../services/home.service';

@Component({
  selector: 'project-tile',
  standalone: true,
  imports: [NgIf],
  templateUrl: './project-tile.component.html',
  styleUrl: './project-tile.component.css'
})
export class ProjectTileComponent {

  @Input() project!: Project

  @Output() edit = new EventEmitter<Project>()
  @Output() delete = new EventEmitter<string>()

  showMenu: boolean = false

  constructor(private home: HomeService) { }

  click() {
    if(this.showMenu) {
      this.closeContextMenu()
    } else {
      this.openProject(false)
    }
  }

  openProject(isPublic: boolean) {
    this.home.openProject(this.project.identifier, isPublic)
  }

  contextMenu(event: MouseEvent) {
    this.showMenu = true
  }

  closeContextMenu() {
    this.showMenu = false
  }

  editProject() {
    this.edit.emit(this.project)
  }

  deleteProject() {
    this.delete.emit(this.project!.identifier)
  }
}