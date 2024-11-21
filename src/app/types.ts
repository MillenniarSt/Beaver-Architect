export type Project = {
    identifier: string

    type: string
    architect: string

    name: string
    authors: string
    description: string
}

export type Architect = {
    identifier: string,
    version: string,

    name: string,
    icon: string,
    port: number
}