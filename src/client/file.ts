import { convertFileSrc } from "@tauri-apps/api/core"
import { BaseDirectory, exists as fs_exists, mkdir as fs_mkdir, remove as fs_remove, readTextFile as fs_readText, writeTextFile as fs_writeText, copyFile as fs_copyFile, readDir as fs_readDir, rename as fs_rename } from "@tauri-apps/plugin-fs"
import { appDir } from "./instance/instance"

const separator = '\\'

export const resourcesDir = 'resources'
export const projectsDir = 'projects'
export const architectsDir = 'architects'

export function joinPath(...names: string[]): string {
    return names.join(separator)
}

export function resourcePath(...names: string[]): string {
    return convertFileSrc(joinPath(appDir(), ...names))
}

export function absoluteResourcePath(...names: string[]): string {
    return convertFileSrc(joinPath(...names))
}

export function fullPath(...names: string[]): string {
    return joinPath(appDir(), ...names)
}

export async function read(path: string) {
    return JSON.parse(await fs_readText(path, { baseDir: BaseDirectory.AppData }))
}

export function readText(path: string) {
    return fs_readText(path, { baseDir: BaseDirectory.AppData })
}

export async function readAsset(...names: string[]) {
    return (await fetch(joinPath('assets', ...names))).json()
}

export async function readOrGet(path: string, data: {}) {
    if(await exists(path))
        return await read(path)
    return data
}

export async function readOrCreate(path: string, data: {}) {
    if(await exists(path))
        return await read(path)
    await write(path, data)
    return data
}

export function write(path: string, data: {}) {
    return fs_writeText(path, JSON.stringify(data), { baseDir: BaseDirectory.AppData })
}

export function writeText(path: string, data: string) {
    return fs_writeText(path, data, { baseDir: BaseDirectory.AppData })
}

export function exists(path: string) {
    return fs_exists(path, { baseDir: BaseDirectory.AppData })
}

export function mkdir(path: string) {
    return fs_mkdir(path, { baseDir: BaseDirectory.AppData, recursive: true })
}

export async function ensureDir(path: string) {
    if(!await exists(path)) {
        await mkdir(path)
    }
}

export function readDir(path: string) {
    return fs_readDir(path, { baseDir: BaseDirectory.AppData })
}

export function rename(path: string, newPath: string) {
    return fs_rename(path, newPath, { oldPathBaseDir: BaseDirectory.AppData, newPathBaseDir: BaseDirectory.AppData })
}

export function remove(path: string) {
    return fs_remove(path, { baseDir: BaseDirectory.AppData })
}

export function removeDir(path: string) {
    return fs_remove(path, { baseDir: BaseDirectory.AppData, recursive: true })
}

export function copy(path: string, dest: string) {
    return fs_copyFile(path, dest, { toPathBaseDir: BaseDirectory.AppData, fromPathBaseDir: BaseDirectory.AppData })
}

export function copyFromPc(path: string, dest: string) {
    console.log(path)
    return fs_copyFile(path, dest, { toPathBaseDir: BaseDirectory.AppData })
}