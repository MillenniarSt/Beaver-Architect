import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms"
import { FormInputData, SingleFormInput, TypedInput } from "./inputs"
import { Component, Input, Type } from "@angular/core"
import { FloatLabelModule } from "primeng/floatlabel"
import { idToLabel } from "../../../util"
import { ListboxModule } from 'primeng/listbox'

export type ListboxInputOptions = {
    nullable?: boolean
    multiple?: boolean
    items: ListboxInputItem[]
}

export type ListboxInputItem = {
    label: string
    code: string
}

export type ListboxInputDisplay = {
    label?: string
    checkmark?: boolean
    filter?: boolean
}

@TypedInput('listbox')
export class ListboxInput extends SingleFormInput<string | null, ListboxInputDisplay, ListboxInputOptions> {

    private lastNonNullValue: ListboxInputItem | undefined

    constructor(data: FormInputData<string | null, ListboxInputDisplay, ListboxInputOptions>) {
        super(data)
        this.lastNonNullValue = this.options.items.find((item) => item.code === this.value)
    }

    override buildControls(): [string, FormControl][] {
        const control = new FormControl(this.options.items.find((item) => item.code === this.value))
        control.valueChanges.subscribe((value) => {
            if(value) {
                this.lastNonNullValue = value
            } else if(!this.options.nullable && this.lastNonNullValue) {
                control.setValue(this.lastNonNullValue)
            }
        })
        return [[this.id, control]]
    }

    override getValue(control: FormControl, controlId: string, controlValue: any): string | null {
        return this.options.nullable ? control.value.code : control.value.code ?? this.lastNonNullValue ?? null
    }

    override get component(): Type<any> {
        return ListboxInputComponent
    }

    override defaultValue(): string | null {
        return this.options.items.length > 0 && this.options.nullable !== true ? this.options.items[0].code : null
    }

    override defaultDisplay(): ListboxInputDisplay {
        return {
            label: idToLabel(this.id)
        }
    }

    override defaultOptions(): ListboxInputOptions {
        return {
            items: []
        }
    }
}

@Component({
    selector: 'form-Listbox-input',
    standalone: true,
    imports: [ReactiveFormsModule, ListboxModule, FloatLabelModule],
    template: `
        <div class="w-full flex flex-col gap-1">
            <span class="text-sm">{{input.display.label}}</span>
            <p-listbox [formControlName]="input.id" optionLabel="label" class="w-full"
                [options]="input.options.items" [checkmark]="input.options.nullable" [multiple]="input.options.multiple" 
                [filter]="input.display.filter" filterBy="label"
            />
        </div>
    `
})
export class ListboxInputComponent {

    @Input() input!: ListboxInput
    @Input() parentForm!: FormGroup
}