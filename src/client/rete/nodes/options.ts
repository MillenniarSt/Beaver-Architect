import { ClassicPreset } from "rete";
import { ReteControl, ReteNode, ReteSocket } from "../preset";

export type Option = { id: string, label: string }

export class BuilderOptionsNode extends ReteNode<
    Record<string, OptionSocket>,
    {},
    Record<string, ReteControl>
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

export class OptionSocket extends ReteSocket {

    constructor(
        readonly type: string
    ) {
        super(optionTypes[type].label)
    }

    isCompatibleWith(socket: ReteSocket) {
        return socket instanceof OptionSocket && this.type === socket.type
    }
}

export type OptionType = { label: string }

export const optionTypes: Record<string, OptionType> = {}