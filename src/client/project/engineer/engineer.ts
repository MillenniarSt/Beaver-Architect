import { idToLabel } from "../../util"

export abstract class Engineer {

    constructor(
        readonly ref: ResourceReference
    ) { }
}

export type ReferenceData = { pack?: string, location: string } | string
export type MappedResourceReference = { ref: ResourceReference, name: string, children: MappedResourceReference[] | null }

export class ResourceReference {

    readonly pack?: string
    readonly location: string

    constructor(ref: ReferenceData) {
        if (typeof ref === 'string') {
            if (ref.includes(':')) {
                const unpack = ref.split(':')
                this.pack = unpack[0]
                this.location = unpack[1]
            } else {
                this.location = ref
            }
        } else {
            this.pack = ref.pack
            this.location = ref.location
        }
    }

    static map(references: ResourceReference[]): MappedResourceReference[] {
        let mapped: MappedResourceReference[] = []
        references.forEach((reference) => {
            // TODO
        })
        return mapped
    }

    get name(): string {
        return idToLabel(this.location)
    }

    equals(resource: ResourceReference): boolean {
        return this.pack === resource.pack && this.location === resource.location
    }

    toJson(): string {
        return this.toString()
    }

    toString(): string {
        if (!this.pack) {
            return this.location
        }
        return `${this.pack}:${this.location}`
    }
}