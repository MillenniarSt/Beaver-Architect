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

import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { emit, once } from '@tauri-apps/api/event';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { Setting, SettingGroup } from './settings';
import { SplitterModule } from 'primeng/splitter';
import { FormComponent } from "../components/form/form.component";
import { FormDataInput } from '../components/form/inputs/inputs';

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [TreeModule, ButtonModule, CardModule, PanelModule, SplitterModule, NgClass, NgIf, FormComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {

  groups: TreeNode<Setting[]>[] = []
  selectedGroup?: TreeNode<Setting[]> = undefined

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    once<{ groups: SettingGroup[] }>('settings:get', (event) => {
      this.groups = this.mapGroups(event.payload.groups)
      this.selectedGroup = this.groups[0]

      this.cdr.detectChanges()
    })

    emit('settings:ready')
  }

  mapGroups(groups: SettingGroup[]): TreeNode<Setting[]>[] {
    return groups.map((group) => {
      return {
        label: group.label,
        icon: group.icon,
        children: group.groups ? this.mapGroups(group.groups) : undefined,
        data: group.settings ?? []
      }
    })
  }

  selectGroup(group: TreeNode<Setting[]>) {
    this.selectedGroup = group
    this.cdr.detectChanges()
  }

  getFormData(): FormDataInput {
    return FormDataInput.fromJson({ inputs: this.selectedGroup!.data }, (output) => {
      emit('settings:edit', output)
    })
  }

  close() {
    getCurrentWebview().close()
  }

  nodeExpand(event: any) {
    this.cdr.detectChanges()
  }

  nodeCollapse(event: any) {
    this.cdr.detectChanges()
  }
}