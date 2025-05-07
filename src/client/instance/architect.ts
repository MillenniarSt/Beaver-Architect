import { architectsDir, resourcePath, joinPath, read } from "../file"
import { Version } from "./version"

export class ArchitectInstance {

    constructor(
        readonly identifier: string,
        readonly name: string,
        readonly version: Version
    ) { }

    static async load(identifier: string): Promise<ArchitectInstance> {
        return ArchitectInstance.fromJson(await read(joinPath(architectsDir, identifier, 'architect.json')))
    }

    static fromJson(json: any): ArchitectInstance {
        return new ArchitectInstance(json.identifier, json.name, json.version)
    }

    toJson() {
        return {
            identifier: this.identifier,
            version: this.version.toString(),
            name: this.name
        }
    }

    get dir(): string {
        return joinPath(architectsDir, this.identifier)
    }

    get exe(): string {
        return joinPath(this.dir, 'architect.exe')
    }

    get icon(): string {
        return resourcePath(this.dir, 'icon.png')
    }
}