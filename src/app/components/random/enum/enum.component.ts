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

import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { RandomCollectionItem, RandomEnumValue } from '../../../../client/project/random';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  imports: [FormsModule, NgIf, NgStyle, NgFor, ButtonModule, SelectModule, InputNumberModule],
  templateUrl: './random.component.html'
})
export class RandomEnumComponent {

  @Input() editable: boolean = true

  @Input() collection: RandomCollectionItem<string>[] = []

  private _data: RandomEnumValue[] = []
  @Input() set data(values: RandomEnumValue[]) {
    console.log('values', values)
    this.options = []
    this.possibleOptions = [...this.collection]
    this._data = values
    values.forEach((value) => {
      this.options.push(this.collection.find((item) => item.code === value.id)!)
      this.possibleOptions.splice(this.possibleOptions.findIndex((option) => option.code === value.id), 1)
    })
    this.addNewItemOption = undefined
  }
  get data(): RandomEnumValue[] {
    return this._data
  }

  options: RandomCollectionItem<string>[] = []

  possibleOptions: RandomCollectionItem<string>[] = []
  addNewItemOption?: RandomCollectionItem<string>

  @Output() edit = new EventEmitter<RandomEnumValue[]>()

  constructor(private cdr: ChangeDetectorRef) { }

  get hasFilter(): boolean {
    return this.collection.length > 15
  }

  get isHuge(): boolean {
    return this.collection.length > 100
  }

  getWeightInPercent(index: number): string {
    let totalWeight = 0
    this.data.forEach((item) => totalWeight += item.weight)
    return (this.data[index].weight / totalWeight * 100).toFixed(1)
  }

  getPossibleOptionsFor(index: number): RandomCollectionItem<string>[] {
    return [...this.possibleOptions, this.options[index]]
  }

  addItem(item: RandomCollectionItem<string>) {
    this.data.push({ id: item.code, weight: 1 })
    this.options.push(item)
    this.possibleOptions.splice(this.possibleOptions.findIndex((option) => option.code === item.code), 1)
    this.addNewItemOption = undefined
    this.edit.emit(this.data)
  }

  deleteItem(index: number) {
    this.possibleOptions.push(this.options[index])
    this.data.splice(index, 1)
    this.options.splice(index, 1)
    this.edit.emit(this.data)
  }

  changeItem(index: number, id: string) {
    this.data[index].id = id
    this.edit.emit(this.data)
  }

  changeItemWeight(index: number, weight: string | number) {
    const changed = Number(weight)
    if (!Number.isNaN(changed)) {
      this.data[index].weight = changed
      this.edit.emit(this.data)
    }
  }
}

@Component({
  standalone: true,
  imports: [SelectModule, FormsModule],
  templateUrl: './constant.component.html'
})
export class ConstantEnumComponent {

  @Input() editable: boolean = true

  @Input() collection: RandomCollectionItem<string>[] = []
  @Input() set data(value: string) {
    this.option = this.collection.find((item) => item.code === value)!
  }

  @Output() edit = new EventEmitter<string>()

  option!: RandomCollectionItem<string>

  get hasFilter(): boolean {
    return this.collection.length > 15
  }

  get isHuge(): boolean {
    return false
  }

  change(value: string) {
    this.edit.emit(value)
  }
}

@Component({
  standalone: true,
  imports: [],
  template: `
    <div class="flex gap-2">
      <img [src]="result.icon" [class]="result.piIcon" class="h-5" [style]="{'font-size': '20px'}"/>
      <span>{{result.label}}</span>
    </div>
  `
})
export class RandomEnumResultComponent {

  @Input() collection: RandomCollectionItem<string>[] = []
  @Input() set data(value: string) {
    console.log(this.collection, value)
    this.result = this.collection.find((item) => item.code === value)!
  }

  result: RandomCollectionItem<string> = this.collection[0]
}