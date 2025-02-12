import { Type } from "@angular/core"
import { FormControl, FormGroup } from "@angular/forms"

export type FormOutput<V> = {
    id: string,
    value: V,
    isValid: boolean
}

export enum FormInputState {
    VALID = 'valid',
    INVALID = 'invalid',
    PENDING = 'pending',
    UNTOUCHED = 'untouched'
}

export class FormDataInput {

    constructor(readonly inputs: FormInput<any, any, any>[], public onEdit: (output: FormOutput<any>) => void) { }

    buildFormGroup(): FormGroup {
        let entries: [string, FormControl][] = []

        this.inputs.forEach((input) => {
            const controls = input.buildControls()
            controls.forEach((control) => {
                control[1].valueChanges.subscribe((value) => this.onEdit({
                    id: control[0],
                    value: input.getValue(control[1], control[0], value),
                    isValid: control[1].valid
                }))
            })
            entries.push(...controls)
        })

        return new FormGroup(Object.fromEntries(entries))
    }

    static fromJson(json: any, onEdit: (output: FormOutput<any>) => void): FormDataInput {
        return new FormDataInput(json.inputs.map((input: { type: string }) => {
            const factory = inputs.get(input.type)
            if(!factory) {
                throw Error(`No form input registered for type: ${input.type}`)
            }
            return factory(input)
        }), onEdit)
    }
}

export type FormInputData<V, D, O> = {
    id: string,
    value?: V,
    options?: O,
    display?: D,
    disabled?: boolean
}

export abstract class FormInput<V, D extends {}, O extends {} | undefined> {

    readonly id: string
    options: O
    display: D
    value: V
    disabled: boolean

    constructor(data: FormInputData<V, D, O>) {
        this.id = data.id
        this.options = data.options ?? this.defaultOptions()
        this.display = data.display ?? this.defaultDisplay()
        this.value = data.value ?? this.defaultValue()
        this.disabled = data.disabled ?? false
    }

    abstract get component(): Type<any>

    abstract buildControls(): [string, FormControl][]

    abstract getValue(control: FormControl, controlId: string, controlValue: any): V

    abstract defaultValue(): V

    abstract defaultDisplay(): D

    abstract defaultOptions(): O
}

export abstract class SingleFormInput<V, D extends {}, O extends {} | undefined> extends FormInput<V, D, O> {

    buildControls(): [string, FormControl][] {
        return [[this.id, new FormControl(this.value)]]
    }

    override getValue(control: FormControl, controlId: string, controlValue: any): V {
        return control.value
    }
}

export const inputs: Map<string, (json: any) => FormInput<any, any, any>> = new Map()

export function TypedInput(type: string) {
    return function (constructor: { new (data: any): FormInput<any, any, any> }) {
        inputs.set(type, (json: any) => new constructor(json))
    }
}