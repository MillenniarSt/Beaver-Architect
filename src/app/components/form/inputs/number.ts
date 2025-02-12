import { FormGroup, ReactiveFormsModule } from "@angular/forms"
import { SingleFormInput, TypedInput } from "./inputs"
import { Component, Input, Type } from "@angular/core"
import { FloatLabelModule } from "primeng/floatlabel"
import { idToLabel } from "../../../util"
import { InputNumber } from 'primeng/inputnumber'

export type TextInputDisplay = {
    label?: string
    placeholder?: string
    variantLabel?: 'in' | 'over' | 'on',
    prefix?: string
    suffix?: string
}

@TypedInput('number')
export class NumberInput extends SingleFormInput<number, TextInputDisplay, undefined> {

    override get component(): Type<any> {
        return NumberInputComponent
    }

    override defaultValue(): number {
        return 0
    }

    override defaultDisplay(): TextInputDisplay {
        return {
            label: idToLabel(this.id),
            placeholder: ''
        }
    }

    override defaultOptions(): undefined { }
}

@Component({
    selector: 'form-text-input',
    standalone: true,
    imports: [ReactiveFormsModule, InputNumber, FloatLabelModule],
    template: `
        <p-floatlabel [formGroup]="parentForm" [variant]="input.display.variantLabel ?? 'on'">
            <p-inputnumber [id]="input.id" pInputText [formControlName]="input.id" [placeholder]="input.display.placeholder" [prefix]="input.display.prefix" [suffix]="input.display.suffix" [showButtons]="true"/>
            <label [for]="input.id">{{input.display.label}}</label>
        </p-floatlabel>
    `
})
export class NumberInputComponent {
    
    @Input() input!: NumberInput
    @Input() parentForm!: FormGroup
}