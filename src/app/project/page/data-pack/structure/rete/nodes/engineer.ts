import { ClassicPreset } from "rete";
import { BuilderSocket } from "../sockets";

export class StructureEngineerNode extends ClassicPreset.Node<
    {},
    { builder: ClassicPreset.Socket },
    {}
> {

    constructor(
        protected baseType?: string
    ) {
        super('Engineer')
        this.addOutput('builder', new ClassicPreset.Output(new BuilderSocket(baseType), 'Builder'))
    }

    execute(_: never, forward: (output: 'builder') => void) {
        forward('builder')
    }

    data() {
        return { }
    }
}