import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';

export type FormDataInput = {
  id?: string,

  name: string,
  type: string,
  options?: any,
  validators?: InputValidators[],
  value?: any
}

export type InputValidators = {
  required?: boolean,
  minLength?: number,
  maxLength?: number,
  min?: number,
  max?: number,
  pattern?: string,

  customs?: ValidatorFn[]
}

export type FormDataOutput = Record<string, any>

@Component({
  selector: 'form-util',
  standalone: true,
  imports: [NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit, OnChanges {

  @Input() inputs: FormDataInput[] = []

  @Output() edit = new EventEmitter<FormDataOutput>()

  form: FormGroup = new FormGroup({})

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.loadForm()
  }

  ngOnChanges() {
    this.loadForm()
  }

  loadForm() {
    this.form = this.fb.group(this.buildFormGroup())

    this.form.valueChanges.subscribe(values => {
      let outputs: [string, any][] = []

      this.inputs.forEach((input) => {
        switch (input.type) {
          case 'text':
          case 'email':
          case 'password':
          case 'date':
          case 'datetime':
          case 'time':
          case 'month':
          case 'week':
          case 'radio':
          case 'checkbox':
          case 'select':
            outputs.push([input.id!, values[input.id!]])
            break

          case 'number':
          case 'range':
            outputs.push([input.id!, Number(values[input.id!]) ?? 0])
            break

          case 'vec2':
            outputs.push([input.id!, [Number(values[`${input.id!}-0`]) ?? 0, Number(values[`${input.id!}-1`]) ?? 0]])
            break

          case 'vec3':
            outputs.push([input.id!, [Number(values[`${input.id!}-0`]) ?? 0, Number(values[`${input.id!}-1`]) ?? 0, Number(values[`${input.id!}-2`]) ?? 0]])
            break
        }
      })

      this.edit.emit(Object.fromEntries(outputs))
    })
  }

  private buildFormGroup(): {} {
    let entries: [string, any][] = []

    this.inputs.forEach((input) => {
      switch (input.type) {
        case 'text':
        case 'email':
          entries.push([input.id!, [input.value, input.validators ? this.buildTextValidators(input.validators[0]) : []]])
          break

        case 'number':
        case 'range':
          entries.push([input.id!, [input.value, input.validators ? this.buildNumberValidators(input.validators[0]) : []]])
          break

        case 'password':
        case 'date':
        case 'datetime':
        case 'time':
        case 'month':
        case 'week':
        case 'radio':
        case 'select':
          entries.push([input.id!, [input.value, input.validators ? this.buildInputValidators(input.validators[0]) : []]])
          break

        case 'checkbox':
          entries.push([input.id!, [input.value, input.validators ? this.buildCustomValidators(input.validators[0]) : []]])
          break

        case 'vec2':
          entries.push([`${input.id!}-0`, [input.value[0], input.validators ? this.buildNumberValidators(input.validators[0]) : []]])
          entries.push([`${input.id!}-1`, [input.value[1], input.validators ? this.buildNumberValidators(input.validators[1]) : []]])
          break
        case 'vec3':
          entries.push([`${input.id!}-0`, [input.value[0], input.validators ? this.buildNumberValidators(input.validators[0]) : []]])
          entries.push([`${input.id!}-1`, [input.value[1], input.validators ? this.buildNumberValidators(input.validators[1]) : []]])
          entries.push([`${input.id!}-2`, [input.value[2], input.validators ? this.buildNumberValidators(input.validators[2]) : []]])
          break
      }
    })

    return Object.fromEntries(entries)
  }

  private buildCustomValidators(inputValidators: InputValidators | undefined): ValidatorFn[] {
    if (!inputValidators)
      return []

    return inputValidators.customs ?? []
  }

  private buildInputValidators(inputValidators: InputValidators | undefined): ValidatorFn[] {
    if (!inputValidators)
      return []

    let validators: ValidatorFn[] = []

    if (inputValidators.required)
      validators.push(Validators.required)
    if (inputValidators.customs)
      validators.push(...inputValidators.customs)

    return validators
  }

  private buildTextValidators(inputValidators: InputValidators | undefined): ValidatorFn[] {
    if (!inputValidators)
      return []

    let validators: ValidatorFn[] = []

    if (inputValidators.required)
      validators.push(Validators.required)
    if (inputValidators.minLength)
      validators.push(Validators.minLength(inputValidators.minLength))
    if (inputValidators.maxLength)
      validators.push(Validators.maxLength(inputValidators.maxLength))
    if (inputValidators.pattern)
      validators.push(Validators.pattern(inputValidators.pattern))
    if (inputValidators.customs)
      validators.push(...inputValidators.customs)

    return validators
  }

  private buildNumberValidators(inputValidators: InputValidators | undefined): ValidatorFn[] {
    if (!inputValidators)
      return []

    let validators: ValidatorFn[] = []

    if (inputValidators.required)
      validators.push(Validators.required)
    if (inputValidators.min)
      validators.push(Validators.min(inputValidators.min))
    if (inputValidators.max)
      validators.push(Validators.max(inputValidators.max))
    if (inputValidators.customs)
      validators.push(...inputValidators.customs)

    return validators
  }
}
