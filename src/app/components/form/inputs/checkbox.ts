import { FormGroup, ReactiveFormsModule } from "@angular/forms"
import { SingleFormInput, TypedInput } from "./inputs"
import { Component, Input, Type } from "@angular/core"
import { Checkbox } from 'primeng/checkbox'
import { idToLabel } from "../../../../client/util"

export type CheckboxInputDisplay = {
    label?: string
    variant?: 'filled' | 'outlined'
}

@TypedInput('checkbox')
export class CheckboxInput extends SingleFormInput<boolean, CheckboxInputDisplay, undefined> {

    override get component(): Type<any> {
        return CheckboxInputComponent
    }

    override defaultValue(): boolean {
        return false
    }

    override defaultDisplay(): CheckboxInputDisplay {
        return {
            label: idToLabel(this.id)
        }
    }

    override defaultOptions(): undefined { }
}

@Component({
    selector: 'form-checkbox-input',
    standalone: true,
    imports: [ReactiveFormsModule, Checkbox],
    template: `
        <p-checkbox [formGroup]="parentForm" [formControlName]="input.id" [inputId]="input.id" [variant]="input.display.variant ?? 'outlined'"/>
        <label [for]="input.id">{{input.display.label}}</label>
    `
})
export class CheckboxInputComponent {

    @Input() input!: CheckboxInput
    @Input() parentForm!: FormGroup
}