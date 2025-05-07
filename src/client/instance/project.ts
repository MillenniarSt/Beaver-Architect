import { RemoteServer } from "../connection/server";
import { copy, resourcePath, joinPath, mkdir, projectsDir, read, readText, removeDir, rename, write, writeText, copyFromPc } from "../file";
import { ArchitectInstance } from "./architect";
import { Version } from "./version";

export class ProjectInstance {

    constructor(
        private _identifier: string,
        public version: Version,
        private _dependencies: string[],

        private _architect: ArchitectInstance,

        readonly url: string | undefined,

        public name: string,
        public authors: string,
        public description: string,
        public info: string
    ) { }

    static async load(identifier: string): Promise<ProjectInstance> {
        const data = await read(joinPath(projectsDir, identifier, 'project.json'))
        const architectData = await read(joinPath(projectsDir, identifier, 'architect.json'))
        return new ProjectInstance(
            data.identifier, Version.fromString(data.version), data.dependencies,
            ArchitectInstance.fromJson(architectData),
            data.url,
            data.name, data.authors, data.description,
            await readText(joinPath(projectsDir, identifier, 'info.html'))
        )
    }

    static async join(url: string): Promise<ProjectInstance> {
        const server = new RemoteServer(url)
        await server.open()

        const data = await server.request('get')
        const architectData = await server.request('get-architect')
        const project = new ProjectInstance(
            data.identifier, Version.fromString(data.version), data.dependencies,
            ArchitectInstance.fromJson(architectData),
            url,
            data.name, data.authors, data.description,
            data.info
        )

        server.close()

        return project
    }

    async save() {
        await write(joinPath(this.dir, 'project.json'), {
            identifier: this.identifier,
            version: this.version.toString(),
            dependencies: this.dependencies,
            url: this.url,
            name: this.name,
            authors: this.authors,
            description: this.description
        })
        await write(joinPath(this.dir, 'architect.json'), this.architect.toJson())
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
        await copyFromPc(path, this.image)
    }

    async changeBackground(path: string) {
        await copyFromPc(path, this.background)
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

    get isLocal(): boolean {
        return this.url === undefined
    }

    get dir(): string {
        return joinPath(projectsDir, this.identifier)
    }

    get architectDir(): string {
        return joinPath(this.dir, 'architect')
    }

    get image(): string {
        return resourcePath(this.dir, 'image.png')
    }

    get background(): string {
        return resourcePath(this.dir, 'background.png')
    }
}