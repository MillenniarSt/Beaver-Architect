import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms"
import { SingleFormInput, TypedInput } from "./inputs"
import { Component, Input, Type } from "@angular/core"
import { FloatLabelModule } from "primeng/floatlabel"
import { Select } from 'primeng/select'
import { idToLabel } from "../../../../client/util"

export type SelectInputOptions = {
    nullable?: boolean
    editable?: boolean
    items: SelectInputItem[]
}

export type SelectInputItem = {
    label: string
    code: string
}

export type SelectInputDisplay = {
    label?: string
    placeholder?: string
    variantLabel?: 'in' | 'over' | 'on'
    variant?: 'filled' | 'outlined'
    filter?: boolean
}

@TypedInput('select')
export class SelectInput extends SingleFormInput<string | null, SelectInputDisplay, SelectInputOptions> {

    override buildControls(): [string, FormControl][] {
        return [[this.id, new FormControl(this.options.items.find((item) => item.code === this.value))]]
    }

    override getValue(control: FormControl, controlId: string, controlValue: any): string | null {
        return control.value.code
    }

    override get component(): Type<any> {
        return SelectInputComponent
    }

    override defaultValue(): string | null {
        return this.options.items.length > 0 && this.options.nullable !== true ? this.options.items[0].code : null
    }

    override defaultDisplay(): SelectInputDisplay {
        return {
            label: idToLabel(this.id)
        }
    }

    override defaultOptions(): SelectInputOptions {
        return {
            items: []
        }
    }
}

@Component({
    selector: 'form-select-input',
    standalone: true,
    imports: [ReactiveFormsModule, Select, FloatLabelModule],
    template: `
        <p-floatlabel [formGroup]="parentForm" [variant]="input.display.variantLabel ?? 'on'">
            <p-select [inputId]="input.id" [formControlName]="input.id" optionLabel="label" 
                [options]="input.options.items" [checkmark]="input.options.nullable" [editable]="input.options.editable" 
                [variant]="input.display.variant ?? 'outlined'" [placeholder]="input.display.placeholder" [filter]="input.display.filter" filterBy="label"
            />
            <label [for]="input.id">{{input.display.label}}</label>
        </p-floatlabel>
    `
})
export class SelectInputComponent {

    @Input() input!: SelectInput
    @Input() parentForm!: FormGroup
}