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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'search-bar',
  standalone: true,
  imports: [IconFieldModule, InputIconModule, FormsModule],
  template: `
    <p-iconField class="w-full" iconPosition="left">
      <p-inputIcon styleClass="pi pi-search" />
      <input type="text" pInputText [placeholder]="placeholder" [(ngModel)]="value" (keyup.enter)="onEnter()" (ngModelChange)="change()" />
    </p-iconField>
  `
})
export class SearchBarComponent {

  @Output() submit = new EventEmitter<string>()
  @Output() edit = new EventEmitter<string>()

  @Input() value: string = ''
  @Input() placeholder: string = 'Search'

  onEnter() {
    this.submit.emit(this.value)
  }

  change() {
    this.edit.emit(this.value)
  }
}
