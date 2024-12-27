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
import { ElectronService } from 'ngx-electron';

export type DialogButton = {
  id?: number
  name: string
  color?: string
  focus?: boolean
}

@Component({
  selector: 'dialog-base',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './base.component.html',
  styleUrl: './base.component.css'
})
export class BaseDialogComponent implements OnInit {

  constructor(private electron: ElectronService, private cdRef: ChangeDetectorRef) { }

  color: string = 'info'
  icon: string = 'assets/icon/info.svg'
  title: string = ''
  message: string = ''

  buttons: DialogButton[] = []

  hasReport: boolean = false

  ngOnInit() {
    this.electron.ipcRenderer.once('dialog:get', (e, data) => {
      this.color = data.color ?? 'info'
      this.icon = data.icon ?? 'assets/icon/info.svg'
      this.title = data.title ?? 'Untitled'
      this.message = data.message ?? ''
      this.buttons = data.buttons ?? [{name: 'OK', focus: true}]
      this.hasReport = data.hasReport ?? false

      this.cdRef.detectChanges()
    });
  }

  getColorBtn(index: number): string {
    console.log('btn-' + (this.buttons[index].color ?? (this.buttons[index].focus ? 'info' : 'empty')))
    return 'btn-' + (this.buttons[index].color ?? (this.buttons[index].focus ? 'info' : 'empty'))
  }

  report() {
    //TODO
  }

  click(id?: number) {
    this.electron.ipcRenderer.invoke('dialog:close', id)
  }
}
