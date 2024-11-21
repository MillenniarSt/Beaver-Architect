import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Architect, Project } from '../../types';
import { getArchitectDir, getProjectDir, userName } from '../../paths';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImagePickerComponent } from "../../components/image-picker/image-picker.component";
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { BrowserModule } from '@angular/platform-browser';
import { HomeInteractive } from '../home/home.component';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'edit-project',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, BrowserModule, FormsModule, ImagePickerComponent, LMarkdownEditorModule],
  templateUrl: './edit-project.component.html',
  styleUrl: './edit-project.component.css',
  encapsulation: ViewEncapsulation.None
})
export class EditProjectComponent implements OnInit {

  @Input() isNew: boolean = true

  @Input() type: string = 'world'

  @Input() project: Project = {
    identifier: `${userName.toLowerCase()}.new_project`,
    type: this.type,
    architect: 'minecraft',
    name: 'New Project',
    authors: userName,
    description: 'A new project'
  }

  @Input() info: string = '# New Project\nA new beautiful project'

  image = this.isNew ? undefined : `${getProjectDir(this.project.identifier)}\\image.png`
  background = this.isNew ? undefined : `${getProjectDir(this.project.identifier)}\\background.png`

  @Output() changeInteractive = new EventEmitter<HomeInteractive>()

  constructor(private electron: ElectronService) { }

  architects: Architect[] = []
  selectArchitect: number = -1

  pages = ['Type', 'Project', 'Info']
  page: number = 0

  ngOnInit(): void {
    this.electron.ipcRenderer.invoke('architect:get-all').then((architects) => {
      this.architects = architects
      this.selectArchitect = this.architects.findIndex((architect) => architect.identifier === this.project.architect)
    })
  }

  switchPage(f: number): void {
    this.page += f
  }

  setType(type: string): void {
    if (this.isNew) {
      this.type = type
      this.project.type = type
    }
  }

  getArchitectName(architect: number = this.selectArchitect): string {
    return this.architects[architect].name
  }

  getArchitectIcon(architect: number = this.selectArchitect): string {
    return `${getArchitectDir(this.architects[architect].identifier)}\\${this.architects[architect].icon}`
  }

  setArchitect(index: number): void {
    if (this.isNew) {
      this.selectArchitect = index
      this.project.architect = this.architects[this.selectArchitect].identifier
    } else {
      //TODO Convert
    }
  }

  close(): void {
    this.changeInteractive.emit(HomeInteractive.PROJECTS)
  }

  submit(): void {
    if (this.isNew) {
      this.electron.ipcRenderer.invoke('project:create', 
        { data: this.project, info: this.info, image: this.image, background: this.background }
      ).then(() => this.close())
    } else {
      this.electron.ipcRenderer.invoke('project:edit', 
        { identifier: this.project.identifier, data: this.project, info: this.info, image: this.image, background: this.background }
      ).then(() => this.close())
    }
  }
}
