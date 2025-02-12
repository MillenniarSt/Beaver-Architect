import { ClassicPreset } from "rete";
import { BuilderSocket, MaterialSocket, OptionSocket } from "../sockets";

export class BuilderNode extends ClassicPreset.Node<
    { parent: BuilderSocket },
    Record<string, BuilderSocket | OptionSocket> & { material: MaterialSocket },
    Record<string, ClassicPreset.Input<any>>
> {

    constructor(
        protected type: BuilderType
    ) {
        super(type.label)
        this.addInput('parent', new ClassicPreset.Input(new BuilderSocket(type.object)))
        type.options.forEach((option) => {
            this.addOutput(option.id, new ClassicPreset.Output(new OptionSocket(option.id), option.label))
        })
        type.outputs.forEach((output) => {
            this.addOutput(output.id, new ClassicPreset.Output(new BuilderSocket(type.object), output.label, output.multiple))
        })
        this.addOutput('material', new ClassicPreset.Output(new MaterialSocket(), 'Material'))
    }

    execute(_: never, forward: (output: string) => void) {
        forward('builder')
    }

    data() {
        return { }
    }
}

export type BuilderType = {
    label: string
    object?: string
    options: { id: string, label: string }[]
    outputs: { id: string, label: string, multiple: boolean }[]
}

export const builderTypes: Record<string, BuilderType> = {
    empty: { label: 'Empty Builder', options: [], outputs: [] },

    flexPrism: { label: 'Flex Prism Builder', object: 'prism', options: [], outputs: [{ id: 'children', label: 'Children', multiple: true }] }
}