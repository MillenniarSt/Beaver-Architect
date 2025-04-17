import { architectsDir, fullPath, joinPath, read } from "../file"
import { Version } from "./version"

export class ArchitectInstance {

    constructor(
        readonly identifier: string,
        readonly name: string,
        readonly version: Version
    ) { }

    static async load(identifier: string): Promise<ArchitectInstance> {
        const data = await read(joinPath(architectsDir, identifier, 'architect.json'))
        return new ArchitectInstance(data.identifier, data.name, data.version)
    }

    get dir(): string {
        return joinPath(architectsDir, this.identifier)
    }

    get exe(): string {
        return joinPath(this.dir, 'architect.exe')
    }

    get icon(): string {
        return fullPath(this.dir, 'icon.png')
    }
}