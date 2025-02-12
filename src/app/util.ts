// Paths

export const projectsDir = 'projects'
export const architectsDir = 'architects'

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