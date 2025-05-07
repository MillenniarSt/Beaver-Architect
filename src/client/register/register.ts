import { KeyNotRegistered } from "../errors"

export class Register<T extends Registry = any> {

    protected readonly registries: Record<string, T> = {}

    constructor(
        readonly box: string,
        readonly fromJson: (json: any) => T
    ) { }

    loadJson(json: any) {
        json.map((registry: any) => this.register(this.fromJson(registry)))
    }

    register(registry: T): T {
        if(this.registries[registry.id] !== undefined) {
            console.warn(`Overwritten registry ${registry.id} in register ${this.box}`)
        }
        this.registries[registry.id] = registry
        return registry
    }

    get(id: string): T {
        const registry = this.registries[id]
        if(!registry) {
            throw new KeyNotRegistered(id, 'Registries', this.box)
        }
        return registry
    }

    getAll(): T[] {
        return Object.values(this.registries)
    }
}

export abstract class Registry {

    abstract get id(): string
}