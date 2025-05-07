import { Command } from "@tauri-apps/plugin-shell";
import { Process, SingleTask, Task, TaskGroup } from "../../app/process/process";
import { getFreePort, LocalServer, RemoteServer, Server } from "../connection/server";
import { ProjectInstance } from "../instance/project";
import { Version } from "../instance/version";
import { Architect } from "./architect";
import { resourcePath, fullPath, joinPath, projectsDir } from "../file";
import { registerRandomType } from "./random";
import { Register } from "../register/register";
import { GeoRegistry } from "../register/geo";
import { BuilderRegistry } from "../register/builder";

let _project: Project | undefined

export function setProject(project: Project) {
    _project = project
}

export function getProject(): Project {
    return _project!
}

export class Project {

    readonly GEOS: Register<GeoRegistry> = new Register('geos', GeoRegistry.fromJson)
    readonly BUILDERS: Register<BuilderRegistry> = new Register('builders', BuilderRegistry.fromJson)

    constructor(
        readonly identifier: string,
        readonly version: Version,
        readonly dependencies: string[],

        readonly architect: Architect,

        readonly server: Server,

        public name: string,
        public authors: string,
        public description: string,
        public info: string
    ) { }

    static async fromInstance(instance: ProjectInstance): Promise<Project> {
        let server: Server
        if(instance.isLocal) {
            const port = await getFreePort()
            server = new LocalServer(
                port,
                Command.create('run-server', [`${port}`, 'false', fullPath(projectsDir, instance.identifier)]),
                'Started Project'
            )
        } else {
            server = new RemoteServer(instance.url!)
        }

        const architectPort = await getFreePort()

        return new Project(
            instance.identifier, instance.version, instance.dependencies,
            Architect.fromInstance(instance.architect, new LocalServer(
                architectPort,
                Command.create('run-minecraft-architect', [instance.identifier, `${architectPort}`, 'true']),
                'Architect started'
            )),
            server,
            instance.name, instance.authors, instance.description, instance.info
        )
    }

    static async fromRemoteInstance(instance: ProjectInstance, url: string): Promise<Project> {
        const architectPort = await getFreePort()

        return new Project(
            instance.identifier, instance.version, instance.dependencies,
            Architect.fromInstance(instance.architect, new LocalServer(
                architectPort,
                Command.create(resourcePath(projectsDir, instance.identifier, 'architect', 'architect.exe'), [instance.identifier, `${architectPort}`, 'true']),
                'Architect started'
            )),
            new RemoteServer(url),
            instance.name, instance.authors, instance.description, instance.info
        )
    }

    load(): Promise<boolean> {
        return new Promise(async (resolve) => {
            let serverOpeningTask: Task
            if (this.server.isLocal) {
                serverOpeningTask = new SingleTask('Opening', 2, () => this.server.open())
            } else {
                serverOpeningTask = new SingleTask('Connecting', 1, () => this.server.open())
            }

            const process = new Process(`load_project:${this.identifier}`, {
                title: `Loading ${this.name}`,
                description: 'Funziona per favore',
                cancellable: true,
                autoClose: true
            }, [
                new TaskGroup('Server', 3, [
                    serverOpeningTask,
                    new SingleTask('Data', 1, async () => {
                        this.GEOS.loadJson(await this.server.request('register/get-all', { box: this.GEOS.box }))
                    })
                ]),
                new TaskGroup('Architect', 4, [
                    new SingleTask('Opening', 1, () => this.architect.server.open()),
                    new SingleTask('Resources', 1, async () => {
                        
                    })
                ])
            ], (cancelled) => resolve(!cancelled))

            if(await process.start()) {
                setProject(this)

                process.executeTask(0)
                process.executeTask(1)
            } else {
                resolve(false)
            }
        })
    }

    get dir(): string {
        return joinPath(projectsDir, this.identifier)
    }

    get image(): string {
        return resourcePath(this.dir, 'image.png')
    }

    get background(): string {
        return resourcePath(this.dir, 'background.png')
    }
}