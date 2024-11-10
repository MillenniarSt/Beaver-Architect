import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Architect, Project } from '../../types';
import { getArchitectDir, getProjectDir, userName } from '../../../paths';
import { ServerService } from '../../services/server.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImagePickerComponent } from "../../components/image-picker/image-picker.component";
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { BrowserModule } from '@angular/platform-browser';
import { HomeInteractive } from '../home/home.component';

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
  @Input() architect: string = 'generic'

  @Input() project: Project = {
    identifier: `${userName.toLowerCase()}.new_project`,
    type: this.type,
    architect: this.architect,
    name: 'New Project',
    authors: userName,
    description: 'A new project',
    info: '# New Project\nA new beautiful project',
    image: this.isNew ? undefined : `${getProjectDir(`${userName.toLowerCase()}.new_project`)}\\image.png`,
    background: this.isNew ? undefined : `${getProjectDir(`${userName.toLowerCase()}.new_project`)}\\background.png`
  }

  @Output() changeInteractive = new EventEmitter<HomeInteractive>()

  constructor(private server: ServerService) {
    //this.doUpload = this.doUpload.bind(this);
  }

  /*doUpload(files: Array<File>): Promise<Array<UploadResult>> {
    return Promise.resolve(files.map((file) => {
      return { name: file.name, url: file.path, isImg: true }
    }));
  }*/

  existingProjects: string[] = ['test', 'test2']

  architects: Architect[] = [{ identifier: 'generic', name: 'Generic', port: 0 }]
  selectArchitect: number = 0

  pages = ['Type', 'Project', 'Info']
  page: number = 0

  ngOnInit(): void {
    this.server.get('architects').then(({data}) => {
      this.architects = data
      this.selectArchitect = this.architects.indexOf(this.architects.find((architect) => architect.identifier === this.project.architect)!)
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
    return `${getArchitectDir(this.architects[architect].identifier)}\\icon.svg`
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
      this.server.post('projects', this.project).then(() => this.close())
    } else {
      this.server.put('projects', this.project.identifier, this.project).then(() => this.close())
    }
  }
}
