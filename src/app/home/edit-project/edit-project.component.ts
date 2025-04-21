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
import { idToLabel, labelToId } from '../../../client/util';
import { Tooltip } from 'primeng/tooltip';
import { HomeService, ProjectInstanceEdit } from '../../services/home.service';
import '../../components/form/inputs/import'
import { ProjectInstance } from '../../../client/instance/project';
import { architects, getLocalUser } from '../../../client/instance/instance';
import { Version } from '../../../client/instance/version';
import { ArchitectInstance } from '../../../client/instance/architect';

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

  @Input() project: ProjectInstance = new ProjectInstance(
    `${labelToId(getLocalUser().publicData.name)}.new_project`, Version.FIRST, [],
    architects[0],
    undefined,
    'New project', getLocalUser().publicData.name, 'My beautiful project',
    'A new beautiful project'
  )

  editing!: ProjectInstanceEdit

  @Output() changeInteractive = new EventEmitter<HomeInteractive>()

  selectArchitect: number = 0

  pages = ['Architect', 'Project', 'Info']
  page: number = 0

  constructor(private cdr: ChangeDetectorRef, private home: HomeService) { }

  ngOnInit(): void {
    this.editing = {
      identifier: this.project.identifier,
      version: this.project.version,
      architect: this.project.architect,
      name: this.project.name,
      authors: this.project.authors,
      description: this.project.description,
      info: this.project.info
    }
  }

  switchPage(f: number): void {
    this.page += f
  }

  get architects(): ArchitectInstance[] {
    return architects
  }

  getArchitectName(architect: number = this.selectArchitect): string {
    return architects[architect].name
  }

  getArchitectIcon(architect: number = this.selectArchitect): string {
    return architects[architect].icon
  }

  get convertArchitect(): boolean {
    return !this.isNew && this.editing.architect !== this.project.architect
  }
  setArchitect(index: number): void {
    this.selectArchitect = index
    this.editing.architect = architects[this.selectArchitect]
    this.cdr.detectChanges()
  }

  nameTouched = !this.isNew
  get isNameValid(): boolean {
    return this.editing.name.trim() !== ''
  }
  get isNameDifferent(): boolean {
    return this.editing.name !== this.syncName()
  }
  changeName() {
    if (!this.idTouched) {
      this.editing.identifier = `${labelToId(getLocalUser().publicData.name)}.${labelToId(this.project.name)}`
    }
    this.nameTouched = true
    this.cdr.detectChanges()
  }
  syncName(): string {
    return idToLabel(this.project.identifier.substring(this.project.identifier.lastIndexOf('.') + 1))
  }

  idTouched = !this.isNew
  get isIdValid(): boolean {
    return this.home.isValidProjectIdentifier(this.project.identifier, this.project)
  }
  get shouldUpdateIdentifier(): boolean {
    return !this.isNew && this.editing.identifier !== this.project.identifier
  }
  changeId() {
    if (!this.nameTouched) {
      this.editing.name = this.syncName()
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
      await this.home.editProject(this.editing.identifier, this.editing)
    }
    this.close()
  }
}
