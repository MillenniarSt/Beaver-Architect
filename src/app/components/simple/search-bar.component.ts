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
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'search-bar',
  standalone: true,
  imports: [NgIf, FloatLabelModule, InputTextModule, InputGroupModule, InputGroupAddonModule, FormsModule],
  template: `
    <p-inputgroup class="w-full">
      <p-inputgroup-addon>
        <i class="pi pi-search"></i>
      </p-inputgroup-addon>
      <p-floatlabel class="grow" variant="on">
        <input pInputText name="search" id="search" [(ngModel)]="value" (keyup.enter)="onEnter()" (ngModelChange)="change()"/>
        <label for="search">{{placeholder}}</label>
      </p-floatlabel>
      <p-inputgroup-addon *ngIf="value.trim() !== ''">
        <button (click)="clear()">
          <i class="pi pi-times-circle"></i>
        </button>
      </p-inputgroup-addon>
    </p-inputgroup>
  `
})
export class SearchBarComponent {

  @Output() submit = new EventEmitter<string>()
  @Output() edit = new EventEmitter<string>()

  @Input() value: string = ''
  @Input() placeholder: string = 'Search'

  clear() {
    this.value = ''
    this.change()
  }

  onEnter() {
    this.submit.emit(this.value)
  }

  change() {
    this.edit.emit(this.value)
  }
}
