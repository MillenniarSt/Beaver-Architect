import { ClassicPreset } from "rete";
import { OptionSocket } from "../sockets";
import { Control } from "rete/_types/presets/classic";

export type Option = { id: string, label: string }

export class BuilderOptionsNode extends ClassicPreset.Node<
    Record<string, OptionSocket>,
    {},
    Record<string, Control>
> {

    constructor(options: Option[]) {
        super(options.length === 1 ? options[0].label : 'Options')
        if(options.length < 1) {
            console.warn('BuilderOptionsNode: given empty options')
        }
        options.forEach((option) => {
            this.addInput(option.id, new ClassicPreset.Input(new OptionSocket('text'), option.label))
            this.addControl(option.id, new ClassicPreset.InputControl('text'))
        })
    }
}