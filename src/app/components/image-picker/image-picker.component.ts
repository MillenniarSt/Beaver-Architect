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
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'image-picker',
  standalone: true,
  imports: [NgIf],
  templateUrl: './image-picker.component.html',
  styleUrl: './image-picker.component.css'
})
export class ImagePickerComponent {

  @Input() title?: string
  @Input() image?: string

  @Output() changeImage = new EventEmitter<string>()

  constructor(private electron: ElectronService) { }

  async chooseImage(): Promise<void> {
    this.image = (await this.electron.ipcRenderer.invoke('dialog:open-file', {name: 'Images', extensions: ['png', 'jpg', 'jpeg']})) ?? this.image
    this.changeImage.emit(this.image)
  }

  removeImage(): void {
    this.image = undefined
    this.changeImage.emit(undefined)
  }
}
