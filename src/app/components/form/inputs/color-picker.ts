import { FormGroup, ReactiveFormsModule } from "@angular/forms"
import { SingleFormInput, TypedInput } from "./inputs"
import { Component, Input, Type } from "@angular/core"
import { idToLabel } from "../../../util"
import { ColorPickerModule } from 'primeng/colorpicker'

export type ColorPickerInputOptions = {
    format?: 'rgb' | 'hsb'
}

export type ColorPickerInputDisplay = {
    label?: string
    inline?: boolean
}

@TypedInput('color_picker')
export class ColorPickerInput extends SingleFormInput<string, ColorPickerInputDisplay, ColorPickerInputOptions> {

    override get component(): Type<any> {
        return ColorPickerInputComponent
    }

    override defaultValue(): string {
        return '#000000'
    }

    override defaultDisplay(): ColorPickerInputDisplay {
        return {
            label: idToLabel(this.id)
        }
    }

    override defaultOptions(): ColorPickerInputOptions {
        return {}
    }
}

@Component({
    selector: 'form-ColorPicker-input',
    standalone: true,
    imports: [ReactiveFormsModule, ColorPickerModule],
    template: `
        <div class="flex gap-2">
            <p-colorpicker [formGroup]="parentForm" [formControlName]="input.id" [inline]="input.display.inline"/>
            <span>{{input.display.label}}</span>
        </div>
    `
})
export class ColorPickerInputComponent {

    @Input() input!: ColorPickerInput
    @Input() parentForm!: FormGroup
}