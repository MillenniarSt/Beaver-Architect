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
import { convertFileSrc } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

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

  get ImageSrc(): string | undefined {
    return this.image ? convertFileSrc(this.image) : undefined
  }

  async chooseImage(): Promise<void> {
    this.image = await open({
      title: 'Choose an Image',
      filters: [{
        name: 'Images',
        extensions: ['png', 'jpg', 'jpeg']
      }]
    }) ?? undefined
    this.changeImage.emit(this.image)
  }

  removeImage(): void {
    this.image = undefined
    this.changeImage.emit(undefined)
  }
}
