export type Project = {
    identifier: string

    type: string
    architect: string

    name: string
    authors: string
    description: string
    info?: string

    image?: string
    background?: string
}

export type Architect = {
    identifier: string

    name: string,
    info?: string,

    port: number
}

export type Plugin = {
    identifier: string

    name: string,
    info?: string,

    port: number
}