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

import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ProjectsComponent } from "../projects/projects.component";
import { EditProjectComponent } from "../edit-project/edit-project.component";
import { openInputDialog } from '../../dialog/dialogs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { HomeService, Project } from '../../services/home.service';
import { getClientSettingsGroups, openSettings } from '../../settings/settings';

@Component({
  selector: 'home',
  standalone: true,
  imports: [NgIf, NgClass, ProjectsComponent, EditProjectComponent, CardModule, ButtonModule],
  providers: [HomeService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  loading = false

  constructor(private cdr: ChangeDetectorRef, private home: HomeService) { }

  ngOnInit(): void {
    this.home.load().then(() => {
      this.loading = false
      this.cdr.detectChanges()
    })
  }

  @Input() type?: string

  @Input() interactive: HomeInteractive = HomeInteractive.PROJECTS

  isSelectedType(type: string): boolean {
    return this.type == type
  }

  selectType(type: string): void {
    if (this.interactive === HomeInteractive.PROJECTS) {
      this.type = this.type === type ? undefined : type
    }
  }

  newProject() {
    this.interactive = HomeInteractive.NEW_PROJECT
    this.type = this.type ?? 'world'
  }

  async joinProject() {
    const url = await openInputDialog({
      icon: 'assets/icon/join.svg',
      title: 'Join Project',
      message: 'Enter the Public url of the server'
    })
    // TODO
  }

  editProject?: Project

  doEditProject(identifier: string) {
    this.changeInteractive(HomeInteractive.EDIT_PROJECT)
    this.editProject = this.home.getProject(identifier)
    this.changeInteractive(HomeInteractive.EDIT_PROJECT)
  }

  changeInteractive(interactive: HomeInteractive) {
    this.interactive = interactive
  }

  openSettings() {
    openSettings(getClientSettingsGroups(), (output) => {
      console.log(output)
    })
  }
}

export enum HomeInteractive {

  PROJECTS = 'projects',
  NEW_PROJECT = 'new_project',
  EDIT_PROJECT = 'edit_project'
}