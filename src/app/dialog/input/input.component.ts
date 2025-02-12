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

import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { emit, once } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputDialogComponent implements OnInit {

  constructor(private cdRef: ChangeDetectorRef) { }

  color: string = 'info'
  icon: string = 'assets/icon/info.svg'
  title: string = ''
  message: string = ''
  placeholder: string = ''
  value: string = ''

  ngOnInit() {
    once<any>('dialog:get', (event) => {
      const data = event.payload

      this.color = data.color ?? 'info'
      this.icon = data.icon ?? 'assets/icon/info.svg'
      this.title = data.title ?? 'Untitled'
      this.message = data.message ?? 'Insert a value'
      this.value = data.initial ?? ''
      this.placeholder = data.placeholder ?? ''

      this.cdRef.detectChanges()
    });
  }

  send() {
    emit('dialog:close', { value: this.value })
    getCurrentWebviewWindow().close()
  }

  close() {
    emit('dialog:close')
    getCurrentWebviewWindow().close()
  }
}
