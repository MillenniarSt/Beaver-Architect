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

import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common'
import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { ButtonModule } from 'primeng/button'
import { emit, once } from '@tauri-apps/api/event'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'

export type BaseDialog = {
  icon?: string,
  severity?: string
  title: string,
  message: string,
  buttons?: DialogButton[],
  hasReport?: boolean
}

export type DialogButton = {
  id?: number
  label: string
  severity?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast'
  variant?: 'text' | 'outlined'
  icon?: string
  focus?: boolean
}

@Component({
  selector: 'dialog-base',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ButtonModule],
  templateUrl: './base.component.html',
  styleUrl: './base.component.css'
})
export class BaseDialogComponent implements OnInit {

  constructor(private cdRef: ChangeDetectorRef) { }

  data?: BaseDialog

  ngOnInit() {
    once<any>('dialog:get', (event) => {
      this.data = event.payload
      this.cdRef.detectChanges()
    })

    emit('dialog:ready')
  }

  getBorder(): string {
    return `border: solid 2px var(--p-button-${this.data!.severity ?? 'info'}-background)`
  }

  report() {
    //TODO
  }

  click(id?: number) {
    emit('dialog:close', id)
    getCurrentWebviewWindow().close()
  }
}
