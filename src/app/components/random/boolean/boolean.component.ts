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
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { RandomTypeRegistry } from '../../../../client/register/random';

@Component({
  standalone: true,
  imports: [FormsModule, SliderModule, InputNumberModule],
  templateUrl: './random.component.html'
})
export class RandomBooleanComponent {

  @Input() editable: boolean = true

  @Input() randomType!: RandomTypeRegistry
  @Input() set data(value: number) {
    this.value = value * 100
  }

  @Output() edit = new EventEmitter<number>()

  value: number = this.data * 100

  change(value: string | number) {
    const changed = Number(value)
    if (!Number.isNaN(changed)) {
      this.edit.emit(changed / 100)
    }
  }
}

@Component({
  standalone: true,
  imports: [NgClass],
  templateUrl: './constant.component.html'
})
export class ConstantBooleanComponent {

  @Input() editable: boolean = true

  @Input() randomType!: RandomTypeRegistry
  @Input() data: boolean = false

  @Output() edit = new EventEmitter<boolean>()

  switch(value: boolean = !this.data) {
    if (this.editable && value !== this.data) {
      this.data = value
      this.edit.emit(value)
    }
  }
}

@Component({
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="rounded-md px-2 py-1" [ngClass]="{'bg-green-700': data, 'bg-red-700': !data}">
      <span>{{data ? 'True' : 'False'}}</span>
    </div>
  `
})
export class RandomBooleanResultComponent {

  @Input() randomType!: RandomTypeRegistry
  @Input() data!: boolean
}