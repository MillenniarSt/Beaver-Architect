import { ClassicPreset } from "rete";
import { ReteConnection, ReteNode, ReteSocket } from "../preset";
import { BuilderOptionsNode, OptionSocket } from "./options";
import { GeoRegistry } from "../../register/geo";

export class BuilderNode extends ReteNode<
    { parent: BuilderSocket },
    Record<string, BuilderSocket | OptionSocket>,
    Record<string, ClassicPreset.Input<any>>
> {

    constructor(
        public type: any
    ) {
        super(type.label)
        this.addInput('parent', new ClassicPreset.Input(new BuilderSocket(type.geo)))
        type.options.forEach((option: any) => {
            this.addOutput(option.id, new ClassicPreset.Output(new OptionSocket(option.id), option.label))
        })
        type.outputs.forEach((output: any) => {
            this.addOutput(output.id, new ClassicPreset.Output(new BuilderSocket(output.geo), output.label, output.multiple))
        })
    }
}

export class BuilderSocket extends ReteSocket {

    constructor(
        readonly geo: GeoRegistry
    ) {
        super('Parent')
    }

    isCompatibleWith(socket: ReteSocket) {
        return socket instanceof BuilderSocket && this.geo.isChild(socket.geo)
    }
}

export class BuilderConnection extends ReteConnection<BuilderNode, BuilderNode> {

    constructor(parent: BuilderNode, port: string, child: BuilderNode) {
        super(parent, port, child, 'parent')
    }
}

export class BuilderOptionsConnection extends ReteConnection<BuilderNode, BuilderOptionsNode> {

    constructor(builder: BuilderNode, port: string, option: BuilderOptionsNode) {
        super(builder, port, option, port)
    }
}