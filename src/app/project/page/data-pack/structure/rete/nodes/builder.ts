import { ClassicPreset } from "rete";
import { BuilderSocket, MaterialSocket, OptionSocket } from "../sockets";
import { BuilderType } from "../../types";

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
}