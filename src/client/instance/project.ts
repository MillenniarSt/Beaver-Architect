import { copy, fullPath, joinPath, mkdir, projectsDir, read, readText, removeDir, rename, write, writeText } from "../file";
import { ArchitectInstance } from "./architect";
import { getArchitectInstance } from "./instance";
import { Version } from "./version";

export class ProjectInstance {

    constructor(
        private _identifier: string,
        public version: Version,
        private _dependencies: string[],

        private _architect: ArchitectInstance,

        public name: string,
        public authors: string,
        public description: string,
        public info: string
    ) { }

    static async load(identifier: string): Promise<ProjectInstance> {
        const data = await read(joinPath(projectsDir, identifier, 'project.json'))
        const clientData = await read(joinPath(projectsDir, identifier, 'client.json'))
        return new ProjectInstance(
            data.identifier, data.version, data.dependencies,
            getArchitectInstance(clientData.architect),
            data.name, data.authors, data.description,
            await readText(joinPath(projectsDir, identifier, 'info.html'))
        )
    }

    async save() {
        await write(joinPath(this.dir, 'project.json'), {
            identifier: this.identifier,
            version: this.version,
            dependencies: this.dependencies,
            name: this.name,
            authors: this.authors,
            description: this.description
        })
        await write(joinPath(this.dir, 'client.json'), {
            architect: this.architect.identifier
        })
        await writeText(joinPath(this.dir, 'info.html'), this.info)
    }

    async rename(identifier: string) {
        await rename(this.dir, joinPath(projectsDir, identifier))
        // TODO sync changes
        this._identifier = identifier
        await this.save()
    }

    async buildVersion(newVersion: Version = this.version.next()) {
        // TODO build
        this.version = newVersion
        await this.save()
    }

    async setArchitect(architect: ArchitectInstance) {
        await removeDir(this.architectDir)
        await mkdir(this.architectDir)
        await copy(architect.exe, joinPath(this.architectDir, 'architect.exe'))

        this._architect = architect
        await this.save()
    }

    async changeImage(path: string) {
        await copy(path, this.image)
    }

    async changeBackground(path: string) {
        await copy(path, this.background)
    }

    get identifier(): string {
        return this._identifier
    }

    get dependencies(): string[] {
        return this._dependencies
    }

    get architect(): ArchitectInstance {
        return this._architect
    }

    get dir(): string {
        return joinPath(projectsDir, this.identifier)
    }

    get architectDir(): string {
        return joinPath(this.dir, 'architect')
    }

    get image(): string {
        return fullPath(this.dir, 'image.png')
    }

    get background(): string {
        return fullPath(this.dir, 'background.png')
    }
}