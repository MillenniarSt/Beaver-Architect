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
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Icon } from '../../../../client/instance/resources';
import { ICONS, LANG } from '../../../../client/instance/instance';
import { IconComponent } from '../../simple/icon.component';
import { RandomTypeRegistry } from '../../../../client/register/random';

type EnumCollectionItem = { icon: Icon, label: string, code: string }

type RandomEnumValue = { id: string, weight: number }

@Component({
  standalone: true,
  imports: [FormsModule, NgIf, NgStyle, NgFor, ButtonModule, SelectModule, InputNumberModule, IconComponent],
  templateUrl: './random.component.html'
})
export class RandomEnumComponent {

  @Input() editable: boolean = true

  collection: EnumCollectionItem[] = []

  @Input() set randomType(type: RandomTypeRegistry<string>) {
    this.collection = (type.allowed ?? []).map((value) => { return { icon: ICONS.get(`random_type.${type.id}.collection.${value}`), label: LANG.get(`random_type.${type.id}.collection.${value}`), code: value } })
  }

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

  options: EnumCollectionItem[] = []

  possibleOptions: EnumCollectionItem[] = []
  addNewItemOption?: EnumCollectionItem

  @Output() edit = new EventEmitter<RandomEnumValue[]>()

  constructor(private cdr: ChangeDetectorRef) { }

  get hasFilter(): boolean {
    return this.collection.length > 15
  }

  get isHuge(): boolean {
    return false
  }

  getWeightInPercent(index: number): string {
    let totalWeight = 0
    this.data.forEach((item) => totalWeight += item.weight)
    return (this.data[index].weight / totalWeight * 100).toFixed(1)
  }

  getPossibleOptionsFor(index: number): EnumCollectionItem[] {
    return [...this.possibleOptions, this.options[index]]
  }

  addItem(item: EnumCollectionItem) {
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
  imports: [SelectModule, FormsModule, IconComponent],
  templateUrl: './constant.component.html'
})
export class ConstantEnumComponent {

  @Input() editable: boolean = true

  collection: EnumCollectionItem[] = []

  @Input() set randomType(type: RandomTypeRegistry<string>) {
    this.collection = (type.allowed ?? []).map((value) => { return { icon: ICONS.get(`random_type.${type.id}.collection.${value}`), label: LANG.get(`random_type.${type.id}.collection.${value}`), code: value } })
  }

  @Output() edit = new EventEmitter<string>()

  option!: EnumCollectionItem

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
  imports: [IconComponent],
  template: `
    <div class="flex gap-2">
      <icon [icon]="result.icon"></icon>
      <span>{{result.label}}</span>
    </div>
  `
})
export class RandomEnumResultComponent {

  @Input() randomType!: RandomTypeRegistry
  @Input() set data(value: string) {
    this.result = { icon: ICONS.get(`random_type.${this.randomType.id}.collection.${value}`), label: LANG.get(`random_type.${this.randomType.id}.collection.${value}`), code: value }
  }

  result: EnumCollectionItem = { icon: ICONS.undefinedValue, label: LANG.undefinedValue, code: 'undefined' }
}