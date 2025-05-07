import { v4 } from "uuid";
import { IdAlreadyExists, KeyNotRegistered } from "../errors";
import { architectsDir, copy, ensureDir, exists, joinPath, mkdir, projectsDir, read, readAsset, readDir, readOrCreate, readOrGet, removeDir, resourcesDir } from "../file";
import { User } from "../connection/user";
import { ArchitectInstance } from "./architect";
import { ProjectInstance } from "./project";
import { appDataDir } from "@tauri-apps/api/path";
import { Icons, Lang } from "./resources";

let dir!: string

let localUser!: User

export const architects: ArchitectInstance[] = []
export const projects: ProjectInstance[] = []

export const LANG = new Lang('en_us')
export const ICONS = new Icons(joinPath(resourcesDir, 'icon'))

export async function initInstance() {
    dir = await appDataDir()

    ensureDir(resourcesDir)
    ensureDir(architectsDir)
    ensureDir(projectsDir)

    localUser = User.fromJson(await readOrCreate('user.json', new User(v4(), {
        name: 'User',
        bio: 'Hy, I\'m using Beaver Architect'
    }).toJson()))

    LANG.load(await readAsset('lang', `${LANG.language}.json`))
    LANG.load(await readOrGet(joinPath(resourcesDir, 'lang', `${LANG.language}.json`), {}))
    ICONS.load(await readAsset('icon', 'icons.json'))
    ICONS.load(await readOrGet(joinPath(resourcesDir, 'icons.json'), {}))

    const architectDirs = await readDir(architectsDir)
    for (let i = 0; i < architectDirs.length; i++) {
        architects.push(await ArchitectInstance.load(architectDirs[i].name))
    }

    const projectDirs = await readDir(projectsDir)
    for (let i = 0; i < projectDirs.length; i++) {
        projects.push(await ProjectInstance.load(projectDirs[i].name))
    }
}

export function appDir(): string {
    return dir
}

export function getLocalUser(): User {
    return localUser
}

export function getArchitectInstance(identifier: string): ArchitectInstance {
    const architect = architects.find((architect) => architect.identifier === identifier)
    if(!architect) {
        throw new KeyNotRegistered(identifier, 'Architect')
    }
    return architect
}

export function getProjectInstance(identifier: string): ProjectInstance {
    const project = projects.find((project) => project.identifier === identifier)
    if(!project) {
        throw new KeyNotRegistered(identifier, 'Project')
    }
    return project
}

export async function createProject(project: ProjectInstance) {
    if (await exists(project.dir)) {
        throw new IdAlreadyExists(project.identifier)
    }

    await mkdir(project.dir)
    await project.save()
    await mkdir(project.architectDir)
    await copy(project.architect.exe, joinPath(project.architectDir, 'architect.exe'))

    projects.push(project)
}

export async function deleteProject(identifier: string) {
    const project = getProjectInstance(identifier)
    
    removeDir(project.dir)

    projects.splice(projects.findIndex((pj) => pj === project), 1)
}