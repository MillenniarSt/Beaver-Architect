import { Component, EventEmitter, Input, Output } from '@angular/core';
import { getProjectDir } from '../../../paths';
import { ContextMenuComponent } from "../../components/context-menu/context-menu.component";
import { NgIf } from '@angular/common';
import { Project } from '../../types';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'project-tile',
  standalone: true,
  imports: [ContextMenuComponent, NgIf],
  templateUrl: './project-tile.component.html',
  styleUrl: './project-tile.component.css'
})
export class ProjectTileComponent {

  constructor(private electron: ElectronService) { }

  @Input() project!: Project

  @Output() edit = new EventEmitter<Project>()
  @Output() delete = new EventEmitter<string>()

  showMenu: boolean = false

  getBackground(): string {
    return `${getProjectDir(this.project.identifier)}\\background.png`
  }

  getImage() {
    return `${getProjectDir(this.project.identifier)}\\image.png`
  }

  click() {
    if(this.showMenu) {
      this.closeContextMenu()
    } else {
      this.openProject()
    }
  }

  openProject() {
    this.electron.ipcRenderer.invoke('project:open', this.project.identifier)
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