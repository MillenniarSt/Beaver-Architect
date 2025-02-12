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

import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImagePickerComponent } from "../../components/image-picker/image-picker.component";
import { HomeInteractive } from '../home/home.component';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Editor } from 'primeng/editor';
import { idToLabel, labelToId } from '../../util';
import { Tooltip } from 'primeng/tooltip';
import { Architect, HomeService, Project } from '../../services/home.service';
import '../../components/form/inputs/import'

@Component({
  selector: 'edit-project',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FloatLabelModule, InputTextModule, InputGroupModule, InputGroupAddonModule, Editor, FormsModule, ImagePickerComponent, ButtonModule, Tooltip],
  templateUrl: './edit-project.component.html',
  styleUrl: './edit-project.component.css',
  encapsulation: ViewEncapsulation.None
})
export class EditProjectComponent implements OnInit {

  @Input() isNew: boolean = true

  @Input() type: string = 'world'

  @Input() project: Project = {
    identifier: 'user.new_project',
    data: {
      type: this.type,
      architect: 'minecraft',
      name: 'New project',
      authors: 'User',
      description: 'My beautiful project'
    },
    info: 'New Project\nA new beautiful project'
  }

  editing!: Project

  @Output() changeInteractive = new EventEmitter<HomeInteractive>()

  selectArchitect: number = 0

  pages = ['Type', 'Project', 'Info']
  page: number = 0

  constructor(private cdr: ChangeDetectorRef, private home: HomeService) { }

  ngOnInit(): void {
    this.editing = this.home.cloneProject(this.project)
  }

  user: string = 'user'

  switchPage(f: number): void {
    this.page += f
  }

  setType(type: string): void {
    if (this.isNew) {
      this.type = type
      this.editing.data.type = type
    }
  }

  get architects(): Architect[] {
    return this.home.architects
  }

  getArchitectName(architect: number = this.selectArchitect): string {
    return this.home.architects[architect].name
  }

  getArchitectIcon(architect: number = this.selectArchitect): string {
    return this.home.architects[architect].icon
  }

  get convertArchitect(): boolean {
    return !this.isNew && this.project.data.architect !== this.editing.data.architect
  }
  setArchitect(index: number): void {
    this.selectArchitect = index
    this.editing.data.architect = this.home.architects[this.selectArchitect].identifier
    this.cdr.detectChanges()
  }

  nameTouched = !this.isNew
  get isNameValid(): boolean {
    return this.editing.data.name.trim() !== ''
  }
  get isNameDifferent(): boolean {
    return this.editing.data.name !== this.syncName()
  }
  changeName() {
    if (!this.idTouched) {
      this.editing.identifier = `${this.user}.${labelToId(this.editing.data.name)}`
    }
    this.nameTouched = true
    this.cdr.detectChanges()
  }
  syncName(): string {
    return idToLabel(this.editing.identifier.substring(this.editing.identifier.lastIndexOf('.') + 1))
  }

  idTouched = !this.isNew
  get isIdValid(): boolean {
    return this.home.isValidProjectIdentifier(this.editing.identifier, this.project)
  }
  get shouldUpdateIdentifier(): boolean {
    return !this.isNew && this.project.identifier !== this.editing.identifier
  }
  changeId() {
    if (!this.nameTouched) {
      this.editing.data.name = this.syncName()
    }
    this.idTouched = true
    this.cdr.detectChanges()
  }

  get isFormValid(): boolean {
    return this.isNameValid && this.isIdValid
  }

  close() {
    this.changeInteractive.emit(HomeInteractive.PROJECTS)
  }

  async submit() {
    if (this.isNew) {
      await this.home.createProject(this.editing)
    } else {
      await this.home.editProject(this.project.identifier, this.editing)
    }
    this.close()
  }
}
