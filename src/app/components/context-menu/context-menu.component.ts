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

import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'context-menu',
  standalone: true,
  imports: [NgFor, NgIf, NgStyle],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.css'
})
export class ContextMenuComponent {

  @Input() x: number = 0
  @Input() y: number = 0
  @Input() title: string | undefined

  @Input() items: {
    icon?: string,
    text: string,
    click?: () => void,
    color?: string
  }[] = [{icon: 'assets/icon/error.svg', text: 'Error', color: 'error'}]
}
