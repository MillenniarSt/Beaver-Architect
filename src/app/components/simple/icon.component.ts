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

import { Component, Input } from '@angular/core';
import { ICONS } from '../../../client/instance/instance';
import { Icon } from '../../../client/instance/resources';

@Component({
  selector: 'icon',
  standalone: true,
  imports: [],
  template: `
    <img [src]="icon.image" [class]="icon.pi" class="h-5" [style]="{'font-size': '20px'}"/>
  `
})
export class IconComponent {

  @Input() icon: Icon = ICONS.undefinedValue
}
