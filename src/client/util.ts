export interface ToJson {

    toJson(): {}
}

export interface FromJson {

    mapFromJson(json: any): Object
}

export interface Equals {

    equals(other: Equals): boolean
}

export interface ToKey {

    toKey(): string
}

// String Utils ID -> Label : Label -> ID

export function idToLabel(id: string): string {
    return id.charAt(0).toLocaleUpperCase() + id.substring(1).replace('_', ' ')
}

export function identifierToLabel(identifier: string): string {
    return identifier.charAt(0).toLocaleUpperCase() + identifier.substring(1).replace('.', ' ')
}

export function fileToLabel(file: string): string {
    file = file.substring(file.lastIndexOf('\\') + 1)
    file = file.substring(file.lastIndexOf('/') + 1)
    return file.charAt(0).toLocaleUpperCase() + file.substring(1, file.lastIndexOf('.')).replace('_', ' ')
}

export function labelToId(label: string): string {
    return label.trim().toLowerCase().replace(' ', '_')
}

export function labelToIdentifier(label: string): string {
    return label.trim().toLowerCase().replace(' ', '.')
}

export function labelToFile(label: string, extension: string = 'json', dir?: string): string {
    return `${dir ? dir : ''}${label.trim().toLowerCase().replace(' ', '_')}.${extension}`
}

// Map

export function mapToEntries<K, V>(map: Map<K, V>): [K, V][] {
    return Array.from(map.entries())
}

export function itemsOfMap<T>(map: Map<any, T>): T[] {
    return mapToEntries(map).map(([key, value]) => value)
}

export function mapToRecord<T, V>(map: Map<string, T>, transformItem: (item: T) => V): Record<string, V> {
    return Object.fromEntries(mapToEntries(map).map(([key, item]) => [key, transformItem(item)]))
}

export function mapToJson<T extends ToJson>(map: Map<string, T>): Record<string, {}> {
    return Object.fromEntries(mapToEntries(map).map(([key, item]) => [key, item.toJson()]))
}

export function mapFromJson<T>(json: any, itemFromJson: (json: any) => T): Map<string, T> {
    return new Map(Object.entries(json).map(([key, item]) => [key, itemFromJson(item)]))
}

// Record

export function parseRecord<T, R>(record: Record<any, T>, parse: (value: T) => R): Record<any, R> {
    return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, parse(value)]))
}

export function recordToJson<T extends ToJson>(record: Record<string, T>): Record<string, {}> {
    return Object.fromEntries(Object.entries(record).map(([key, item]) => [key, item.toJson()]))
}

export function recordFromJson<T>(json: any, itemFromJson: (json: any) => T): Record<string, T> {
    return Object.fromEntries(Object.entries(json).map(([key, item]) => [key, itemFromJson(item)]))
}

// List

export function joinBiLists<T>(biList: T[][]): T[] {
    let list: T[] = []
    biList.forEach((singleList) => list.push(...singleList))
    return list
}