import { Command } from "@tauri-apps/plugin-shell";
import { Process, SingleTask, Task, TaskGroup } from "../../app/process/process";
import { getFreePort, LocalServer, RemoteServer, Server } from "../connection/server";
import { ProjectInstance } from "../instance/project";
import { Version } from "../instance/version";
import { Architect } from "./architect";
import { fullPath, joinPath, projectsDir } from "../file";

export class Project {

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

    static async fromLocalInstance(instance: ProjectInstance): Promise<Project> {
        const port = await getFreePort()
        const architectPort = await getFreePort()

        return new Project(
            instance.identifier, instance.version, instance.dependencies,
            Architect.fromInstance(instance.architect, new LocalServer(
                architectPort,
                Command.create(fullPath(projectsDir, instance.identifier, 'architect', 'architect.exe'), [instance.identifier, `${architectPort}`, 'true']),
                'Architect started'
            )),
            new LocalServer(
                port,
                Command.create(fullPath('server.exe'), [`${port}`, 'false', fullPath(projectsDir, instance.identifier)]),
                'Opened Project Server'
            ),
            instance.name, instance.authors, instance.description, instance.info
        )
    }

    static async fromRemoteInstance(instance: ProjectInstance, url: string): Promise<Project> {
        const architectPort = await getFreePort()

        return new Project(
            instance.identifier, instance.version, instance.dependencies,
            Architect.fromInstance(instance.architect, new LocalServer(
                architectPort,
                Command.create(fullPath(projectsDir, instance.identifier, 'architect', 'architect.exe'), [instance.identifier, `${architectPort}`, 'true']),
                'Architect started'
            )),
            new RemoteServer(url),
            instance.name, instance.authors, instance.description, instance.info
        )
    }

    load(): Promise<boolean> {
        return new Promise(async (resolve) => {
            let serverTask: Task
            if (this.server.isLocal) {
                serverTask = new SingleTask('Opening', 2, () => this.server.open())
            } else {
                serverTask = new SingleTask('Connecting', 1, () => this.server.open())
            }

            const process = new Process(`load_project:${this.identifier}`, {
                title: `Loading ${this.name}`,
                description: 'Funziona per favore',
                autoClose: true
            }, [
                serverTask,
                new TaskGroup('Architect', 4, [
                    new SingleTask('Opening', 1, () => this.architect.server.open())
                ])
            ], (cancelled) => resolve(!cancelled))

            await process.executeTask(0)
            process.executeTask(1)
        })
    }

    get dir(): string {
        return joinPath(projectsDir, this.identifier)
    }

    get image(): string {
        return fullPath(this.dir, 'image.png')
    }

    get background(): string {
        return fullPath(this.dir, 'background.png')
    }
}