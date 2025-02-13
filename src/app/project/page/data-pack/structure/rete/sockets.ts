import { ClassicPreset } from "rete";
import { idToLabel } from "../../../../../util";
import { BuilderType, Object3Type } from "../types";

export class MaterialSocket extends ClassicPreset.Socket {

    constructor(id?: string) {
        super(id ? idToLabel(id) : 'Material')
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof MaterialSocket
    }
}

export class OptionSocket extends ClassicPreset.Socket {

    constructor(
        readonly type: string
    ) {
        super(optionTypes[type].label)
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof OptionSocket && this.type === socket.type
    }
}

export type OptionType = { label: string }

export const optionTypes: Record<string, OptionType> = {}

export class BuilderSocket extends ClassicPreset.Socket {

    constructor(
        readonly object: Object3Type | null
    ) {
        super('Parent')
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof BuilderSocket && !(this.object === null && socket.object !== null) && (this.object?.isCompatibleWith(socket.object) ?? true)
    }
}