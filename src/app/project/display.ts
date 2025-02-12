//             _____
//         ___/     \___        |  |
//      ##/  _.- _.-    \##  -  |  |                       -
//      ##\#=_  '    _=#/##  |  |  |  /---\  |      |      |   ===\  |  __
//      ##   \\#####//   ##  |  |  |  |___/  |===\  |===\  |   ___|  |==/
//      ##       |       ##  |  |  |  |      |   |  |   |  |  /   |  |
//      ##       |       ##  |  \= \= \====  |   |  |   |  |  \___/  |
//      ##\___   |   ___/
//      ##    \__|__/
//

import { Type } from "@angular/core"
import { DataPackComponent } from "./sidebar/data-pack/data-pack.component"

export type ProjectDisplay = {
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
export const display: ProjectDisplay = {
    sidebars: [
        {
            icon: 'assets/icon/data-pack.svg',
            component: DataPackComponent
        }
    ]
}