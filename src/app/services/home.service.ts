import { Injectable } from "@angular/core";
import { openBaseDialog, warnDialog } from "../dialog/dialogs";
import { getCurrentWebviewWindow, WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { createProject, deleteProject, getArchitectInstance, getProjectInstance, initInstance, projects } from "../../client/instance/instance";
import { ProjectInstance } from "../../client/instance/project";
import { ArchitectInstance } from "../../client/instance/architect";
import { Version } from "../../client/instance/version";
import { copyFromPc } from "../../client/file";

export type ProjectInstanceEdit = {
    identifier: string,
    version: Version,
    architect: ArchitectInstance,
    name: string,
    authors: string,
    description: string,
    image?: string,
    background?: string,
    info: string
}

@Injectable()
export class HomeService {

    async init() {
        await initInstance()
    }

    getProject(identifier: string): ProjectInstance {
        return getProjectInstance(identifier)
    }

    getArchitect(identifier: string): ArchitectInstance {
        return getArchitectInstance(identifier)
    }

    getProjects(architect: ArchitectInstance | null, search: string = ''): ProjectInstance[] {
        return projects.filter((project) => !(architect && project.architect !== architect) && (project.identifier.includes(search) || project.name.includes(search)))
    }

    openProject(identifier: string, isPublic: boolean) {
        const project = this.getProject(identifier)

        const newWindow = new WebviewWindow('project', {
            title: `Beaver Architect - ${project.name}`,
            url: '/index.html#/project',
            width: 1000,
            height: 700,
            center: true,
            maximized: true,
            decorations: false
        })

        newWindow.once('tauri://created', () => {
            newWindow.once('project:ready', () => {
                newWindow.emit('project:get', {
                    identifier: identifier,
                    isPublic: isPublic
                })
                getCurrentWebviewWindow().close()
            })
        })

        newWindow.once('tauri://error', (e) => {
            console.error(e)
        })
    }

    cloneProject(project: ProjectInstance): ProjectInstance {
        return new ProjectInstance(
            project.identifier, project.version, [...project.dependencies],
            project.architect,
            project.url,
            project.name, project.authors, project.description,
            project.info
        )
    }

    isValidProjectIdentifier(identifier: string, exclude?: ProjectInstance): boolean {
        return projects.find((project) => project.identifier === identifier && project !== exclude) === undefined
    }

    async editProject(identifier: string, edit: ProjectInstanceEdit) {
        const project = this.getProject(identifier)

        project.version = edit.version
        project.name = edit.name
        project.authors = edit.authors
        project.description = edit.description
        project.info = project.info
        await project.save()

        if (edit.image) {
            await project.changeImage(edit.image)
        }
        if (edit.background) {
            await project.changeBackground(edit.background)
        }

        if (edit.identifier !== project.identifier) {
            await project.rename(edit.identifier)
        }
        if (edit.architect !== project.architect) {
            await project.setArchitect(edit.architect)
        }
    }

    async createProject(edit: ProjectInstanceEdit) {
        const project = new ProjectInstance(
            edit.identifier, edit.version, [],
            edit.architect,
            undefined,
            edit.name, edit.authors, edit.description,
            edit.info
        )

        await createProject(project)

        if (edit.image) {
            await project.changeImage(edit.image)
        }
        if (edit.background) {
            await project.changeImage(edit.background)
        }
    }

    async joinProject(url: string) {
        const project = await ProjectInstance.join(url)
        await createProject(project)
    }

    async deleteProject(identifier: string) {
        const project = this.getProject(identifier)
        if (await openBaseDialog(warnDialog(
            'Delete Project',
            `Are you sure to delete permanently the project "${project.name}"?\nThe process can not be reverted!`
        ))) {
            await deleteProject(identifier)
        }
    }
}