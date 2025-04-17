import { idToLabel } from "../../../../../client/util"

export class Object3Type {

    constructor(
        readonly id: string,
        readonly parents: Object3Type[] = []
    ) { }

    static fromJson(json: any): Object3Type {
        return new Object3Type(json.id, json.parents.map((parent: string) => objects3[parent]))
    }

    static register(json: any) {
        const object = Object3Type.fromJson(json)
        objects3[object.id] = object
    }

    isCompatibleWith(object: Object3Type | null): boolean {
        if(object === null || object.id === this.id || object.parents.length === 0) {
            return true
        }

        for(let i = 0; i < this.parents.length; i++) {
            if(this.parents[i].isCompatibleWith(object)) {
                return true
            }
        }

        return false
    }
}

export type BuilderTypeOption = { id: string, label: string }
export type BuilderTypeOutput = { id: string, label: string, multiple: boolean, object: Object3Type | null }

export class BuilderType {

    constructor(
        readonly id: string,
        readonly label: string,
        readonly object: Object3Type | null,
        readonly options: BuilderTypeOption[] = [],
        readonly outputs: BuilderTypeOutput[] = []
    ) { }

    static fromJson(json: any): BuilderType {
        return new BuilderType(
            json.id,
            json.label ?? `${idToLabel(json.id)} Builder`,
            getObject3(json.object),
            json.options,
            json.outputs.map((output: any) => {
                return {
                    id: output.id,
                    label: output.label ?? idToLabel(output.id),
                    multiple: output.multiple ?? false,
                    object: getObject3(output.object)
                }
            })
        )
    }
}

const objects3: Record<string, Object3Type> = {
    prism: new Object3Type('prism')
}
export function getObject3(id: string | null | undefined): Object3Type | null {
    return id ? objects3[id] ?? null : null
}

const builderTypes: Record<string, BuilderType> = {
    flexPrism: new BuilderType('flexPrism', 'Flex Prism Builder', getObject3('prism'), [], [
        { id: 'children', label: 'Children', multiple: true, object: getObject3('prism') }
    ])
}
export function getBuilderType(id: string): BuilderType {
    return builderTypes[id]
}