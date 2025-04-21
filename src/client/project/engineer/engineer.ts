import { idToLabel } from "../../util"

export type ListUpdateObject<D = any> = {
    id: string
    mode?: 'push' | 'delete'
    data?: D
}

export abstract class Engineer {

    constructor(
        readonly ref: ResourceReference
    ) { }
}

export type ReferenceData = { pack: string, location: string } | string
export type MappedResourceReference = { ref: ResourceReference, name: string, children: MappedResourceReference[] | null }

export class ResourceReference {

    readonly pack: string
    readonly location: string

    constructor(ref: ReferenceData) {
        if (typeof ref === 'string') {
            const unpack = ref.split(':')
            this.pack = unpack[0]
            this.location = unpack[1]
        } else {
            this.pack = ref.pack
            this.location = ref.location
        }
    }

    static map(references: ResourceReference[]): MappedResourceReference[] {
        let mapped: MappedResourceReference[] = []

        const add = (reference: ResourceReference, mapped: MappedResourceReference[], level: number = 1) => {
            const dirs = reference.location.split('/')
            if (dirs.length > level) {
                const locationToSearch = dirs.slice(0, level).join('/')
                let subMapped = mapped.find((map) => map.ref.location === locationToSearch && map.children !== null)
                if (!subMapped) {
                    subMapped = { ref: new ResourceReference({ pack: reference.pack, location: locationToSearch }), name: dirs[level - 1], children: [] }
                    mapped.push(subMapped)
                }
                add(reference, subMapped.children!, level + 1)
            } else {
                mapped.push({ ref: reference, name: dirs[dirs.length - 1], children: null })
            }
        }

        references.forEach((reference) => add(reference, mapped))
        return mapped
    }

    get name(): string {
        return idToLabel(this.location.includes('/') ? this.location.substring(this.location.lastIndexOf('/') + 1) : this.location)
    }

    get folder(): ResourceReference {
        return new ResourceReference({ pack: this.pack, location: this.location.includes('/') ? this.location.substring(0, this.location.lastIndexOf('/')) : '' })
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