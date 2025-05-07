import { resourcePath } from "../file"

export abstract class Resource<T> {

    constructor(
        protected map: Record<string, T>
    ) { }

    abstract get undefinedValue(): T

    join(lang: Resource<T>) {
        this.map = { ...this.map, ...lang.map }
    }

    load(json: any) {
        this.map = { ...this.map, ...this.parseMap(json) }
    }

    protected parseMap(json: Record<string, any>): Record<string, T> {
        let entries: Record<string, T> = {}
        Object.entries(json).map(([key, value]: [string, string | Record<string, any>]) => {
            if(typeof value === 'string') {
                entries[key] = this.stringToValue(value)
            } else {
                entries = { ...entries, ...this.parseMap(Object.fromEntries(Object.entries(value).map(([k, v]) => [`${key}.${k}`, v]))) }
            }
        })
        return entries
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
        return string
    }
}

export class Icons extends Resource<string> {

    readonly undefinedValue = 'assets/icon/undefined.svg'

    constructor(
        readonly baseDir: string,
        map: Record<string, string> = {}
    ) {
        super(map)
    }

    protected override stringToValue(string: string): string {
        return string.startsWith('§') ? `assets/icon/${string.substring(1)}` : resourcePath(this.baseDir, string)
    }
}