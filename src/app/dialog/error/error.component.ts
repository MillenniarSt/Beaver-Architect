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

import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { emit, once } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

@Component({
  selector: 'dialog-error',
  standalone: true,
  imports: [NgIf],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorDialogComponent implements OnInit {

  constructor(private cdRef: ChangeDetectorRef) { }

  name: string = ''
  message: string = ''
  stack: string = ''
  errno?: string
  syscall?: string
  url?: string

  hasReport: boolean = false

  ngOnInit() {
    once<any>('dialog:get', (event) => {
      const { err, url } = event.payload

      this.name = err.name ?? 'Error'
      this.message = err.message ?? 'Un unexpected error occurred on the application'
      this.stack = err.stack ?? 'No stack found'
      this.errno = err.errno
      this.syscall = err.syscall
      this.url = url

      this.cdRef.detectChanges()
    })

    emit('dialog:ready')
  }

  report() {
    //TODO
  }

  close() {
    emit('dialog:close')
    getCurrentWebviewWindow().close()
  }
}
