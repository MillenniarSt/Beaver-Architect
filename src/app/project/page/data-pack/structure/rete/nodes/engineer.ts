import { ClassicPreset } from "rete";
import { BuilderSocket } from "../sockets";
import { Object3Type } from "../../types";

export class StructureEngineerNode extends ClassicPreset.Node<
    {},
    { builder: ClassicPreset.Socket },
    {}
> {

    constructor(
        protected baseType: Object3Type | null = null
    ) {
        super('Engineer')
        this.addOutput('builder', new ClassicPreset.Output(new BuilderSocket(baseType), 'Builder'))
    }
}