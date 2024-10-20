import { Component, Type } from "@angular/core"
import { ProjectStructureComponent } from "./sidebar/project-structure/project-structure.component"
import { DataPackComponent } from "./sidebar/data-pack/data-pack.component"

export type ProjectType = {
    sidebars: ProjectBar[]
}

export type ProjectBar = {
    icon: string,
    component: Type<any>
}

/**
 * Define the base properties for every Project type
 * Other properties can be added by plugins based on the architect
 */
export const types: Record<string, ProjectType> = {
    world: {
        sidebars: [
            
        ]
    },

    structure: {
        sidebars: [
            
        ]
    },

    terrain: {
        sidebars: [
            
        ]
    },

    data_pack: {
        sidebars: [
            {
                icon: 'assets/icon/data-pack.svg',
                component: DataPackComponent
            },
            {
                icon: 'assets/icon/files.svg',
                component: ProjectStructureComponent
            }
        ]
    }
}