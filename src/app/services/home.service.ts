import { Injectable } from "@angular/core";
import { readDir, readTextFile, mkdir, writeTextFile, rename, copyFile, BaseDirectory, remove, exists } from '@tauri-apps/plugin-fs';
import { architectsDir, projectsDir } from "../util";
import { appDataDir } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
import { openBaseDialog, warnDialog } from "../dialog/dialogs";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export type Project = {
    identifier: string
    data: {
        type: string
        architect: string

        name: string
        authors: string
        description: string
    }

    info: string,

    image?: string,
    background?: string
}

export type Architect = {
    identifier: string,
    version: string,

    name: string,
    icon: string
}

@Injectable()
export class HomeService {

    projects: Project[] = []
    architects: Architect[] = []

    async init() {
        if(!(await exists('', { baseDir: BaseDirectory.AppData }))) {
            await mkdir('', { baseDir: BaseDirectory.AppData })
            await mkdir(projectsDir, { baseDir: BaseDirectory.AppData })
            await mkdir(architectsDir, { baseDir: BaseDirectory.AppData })
        }
    }

    async load() {
        const dir = await appDataDir()
        await this.init()

        this.projects = []
        this.architects = []

        const projectDirs = await readDir(projectsDir, { baseDir: BaseDirectory.AppData })
        for (let i = 0; i < projectDirs.length; i++) {
            this.projects.push({
                identifier: projectDirs[i].name,
                data: JSON.parse(await readTextFile(`${projectsDir}\\${projectDirs[i].name}\\project.json`, { baseDir: BaseDirectory.AppData })),
                info: await readTextFile(`${projectsDir}\\${projectDirs[i].name}\\info.html`, { baseDir: BaseDirectory.AppData }),
                image: convertFileSrc(`${dir}\\${projectsDir}\\${projectDirs[i].name}\\image.png`),
                background: convertFileSrc(`${dir}\\${projectsDir}\\${projectDirs[i].name}\\background.png`)
            })
        }

        const architectDirs = await readDir(architectsDir, { baseDir: BaseDirectory.AppData })
        for (let i = 0; i < architectDirs.length; i++) {
            const architect = JSON.parse(await readTextFile(`${architectsDir}\\${architectDirs[i].name}\\architect.json`, { baseDir: BaseDirectory.AppData }))
            architect.icon = convertFileSrc(`${dir}\\${architectsDir}\\${architectDirs[i].name}\\${architect.icon}`)
            this.architects.push(architect)
        }
    }

    getProject(identifier: string): Project {
        return this.projects.find((project) => project.identifier === identifier)!
    }

    getArchitect(identifier: string): Architect {
        return this.architects.find((architect) => architect.identifier === identifier)!
    }

    getProjects(type?: string, architect?: string): Project[] {
        return this.projects.filter((project) => !(type && project.data.type !== type) && !(architect && project.data.architect !== architect))
    }

    openProject(identifier: string, isPublic: boolean) {
        const project = this.getProject(identifier)

        const newWindow = new WebviewWindow('project', {
            title: `Beaver Architect - ${project.data.name}`,
            url: '/index.html#/project',
            width: 1000,
            height: 700,
            center: true,
            maximized: true,
            decorations: false
          })
        
          newWindow.once('tauri://created', () => {
            newWindow.once('project:ready', () => newWindow.emit('project:get', {
                identifier: identifier,
                url: 'http://localhost:8224',
                isLocal: true,
                isPublic: isPublic
            }))
          })
        
          newWindow.once('tauri://error', (e) => {
            console.error(e)
          })
    }

    cloneProject(project: Project): Project {
        return {
            identifier: project.identifier,
            data: {
                type: project.data.type,
                architect: project.data.architect,

                name: project.data.name,
                authors: project.data.authors,
                description: project.data.description
            },
            info: project.info,
            image: project.image,
            background: project.background
        }
    }

    isValidProjectIdentifier(identifier: string, exclude?: Project): boolean {
        return this.projects.find((project) => project.identifier === identifier && project !== exclude) === undefined
    }

    async editProject(identifier: string, project: Project) {
        const oldProject = this.getProject(identifier)
        const dir = `${projectsDir}\\${project.identifier}`

        if (identifier !== project.identifier) {
            await rename(`${projectsDir}\\${identifier}`, dir)
        }

        await writeTextFile(`${dir}\\project.json`, JSON.stringify(project.data), { baseDir: BaseDirectory.AppData })
        await writeTextFile(`${dir}\\info.html`, project.info, { baseDir: BaseDirectory.AppData })
        if (project.image) {
            const image = `${dir}\\image.png`
            await copyFile(project.image, image)
            project.image = image
        }
        if (project.background) {
            const background = `${dir}\\background.png`
            await copyFile(project.background, background)
            project.background = background
        }

        this.projects[this.projects.findIndex((project) => project.identifier === identifier)] = project
    }

    async createProject(project: Project) {
        const dir = `${projectsDir}\\${project.identifier}`
        await mkdir(dir, { baseDir: BaseDirectory.AppData })

        await writeTextFile(`${dir}\\project.json`, JSON.stringify(project.data), { baseDir: BaseDirectory.AppData })
        await writeTextFile(`${dir}\\info.html`, project.info, { baseDir: BaseDirectory.AppData })

        if (project.image) {
            await copyFile(project.image, `${dir}\\image.png`, { toPathBaseDir: BaseDirectory.AppData })
            project.image = convertFileSrc(`${await appDataDir()}\\${dir}\\image.png`)
        }
        if (project.background) {
            await copyFile(project.background, `${dir}\\background.png`, { toPathBaseDir: BaseDirectory.AppData })
            project.background = convertFileSrc(`${await appDataDir()}\\${dir}\\background.png`)
        }

        await mkdir(`${dir}\\architect`, { baseDir: BaseDirectory.AppData })
        await mkdir(`${dir}\\dependencies`, { baseDir: BaseDirectory.AppData })
        await mkdir(`${dir}\\data_pack`, { baseDir: BaseDirectory.AppData })

        this.projects.push(project)
    }

    async deleteProject(identifier: string) {
        const index = this.projects.findIndex((project) => project.identifier === identifier)
        if(await openBaseDialog(warnDialog(
            'Delete Project',
            `Are you sure to delete permanently the project "${this.projects[index].data.name}"?\nThe process can not be reverted!` 
        ))) {
            await remove(`${projectsDir}\\${identifier}`, {
                baseDir: BaseDirectory.AppData,
                recursive: true,
            })
            this.projects.splice(index, 1)
        }
    }
}