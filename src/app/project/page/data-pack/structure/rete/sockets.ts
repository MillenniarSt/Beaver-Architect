import { ClassicPreset } from "rete";
import { idToLabel } from "../../../../../util";

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
        readonly object?: string
    ) {
        super('Parent')
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof BuilderSocket && (!this.object || !socket.object || builderObjects[this.object].compatibles.includes(socket.object))
    }
}

export type BuilderObject = { label: string, compatibles: string[] }

export const builderObjects: Record<string, BuilderObject> = {}