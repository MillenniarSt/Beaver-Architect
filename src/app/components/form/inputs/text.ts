import { FormGroup, ReactiveFormsModule } from "@angular/forms"
import { SingleFormInput, TypedInput } from "./inputs"
import { Component, Input, Type } from "@angular/core"
import { InputTextModule } from 'primeng/inputtext'
import { FloatLabelModule } from "primeng/floatlabel"
import { idToLabel } from "../../../../client/util"

export type TextInputDisplay = {
    label?: string
    placeholder?: string
    variantLabel?: 'in' | 'over' | 'on'
}

@TypedInput('text')
export class TextInput extends SingleFormInput<string, TextInputDisplay, undefined> {

    override get component(): Type<any> {
        return TextInputComponent
    }

    override defaultValue(): string {
        return ''
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
    imports: [ReactiveFormsModule, InputTextModule, FloatLabelModule],
    template: `
        <p-floatlabel [formGroup]="parentForm" [variant]="input.display.variantLabel ?? 'on'">
            <input [id]="input.id" pInputText [formControlName]="input.id" [placeholder]="input.display.placeholder" autocomplete="off"/>
            <label [for]="input.id">{{input.display.label}}</label>
        </p-floatlabel>
    `
})
export class TextInputComponent {
    
    @Input() input!: TextInput
    @Input() parentForm!: FormGroup
}