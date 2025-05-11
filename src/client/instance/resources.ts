import { resourcePath } from "../file"

export abstract class Resource<T> {

    constructor(
        protected map: Record<string, T>
    ) { }

    abstract get undefinedValue(): T

    join(lang: Resource<T>) {
        this.map = { ...this.map, ...lang.map }
    }

    load(json: Record<string, any>) {
        Object.entries(json).map(([key, value]: [string, string | Record<string, any>]) => {
            if(typeof value === 'string') {
                this.map[key] = this.stringToValue(value)
            } else {
                this.load(Object.fromEntries(Object.entries(value).map(([k, v]) => [`${key}.${k}`, v])))
            }
        })
    }

    protected abstract stringToValue(string: string): T

    get(name: string, ifNotPresent?: T): T {
        return this.map[name] ?? ifNotPresent ?? this.undefinedValue
    }
}

export class Lang extends Resource<string> {

    readonly undefinedValue = 'Undefined'

    constructor(
        readonly language: string,
        map: Record<string, string> = {}
    ) {
        super(map)
    }

    protected override stringToValue(string: string): string {
        switch(string[0]) {
            case '\\': return string.substring(1)
            case '>': return this.get(string.substring(1), 'Invalid Ref')
            default: return string
        }
    }
}

export type Icon = { image: string, pi: undefined } | { image: undefined, pi: string }

export class Icons extends Resource<Icon> {

    readonly undefinedValue = { image: 'assets/icon/undefined.svg', pi: undefined }

    constructor(
        readonly baseDir: string,
        map: Record<string, Icon> = {}
    ) {
        super(map)
    }

    protected override stringToValue(string: string): Icon {
        switch(string[0]) {
            case '§': return { image: `assets/icon/${string.substring(1)}`, pi: undefined }
            case '&': return { image: undefined, pi: `pi pi-${string.substring(1)}` }
            case '>': return this.get(string.substring(1))
            default: return { image: resourcePath(this.baseDir, string), pi: undefined }
        }
    }
}