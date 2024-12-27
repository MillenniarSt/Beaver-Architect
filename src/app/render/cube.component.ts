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

import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as THREE from 'three';
import { RenderCube } from '../services/render.service';
import { NgtArgs, NgtThreeEvent } from 'angular-three';

@Component({
    selector: 'cube',
    standalone: true,
    template: `
        <ngt-primitive *args="[cube]"></ngt-primitive>
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CubeComponent implements OnInit {

    @Input() render!: RenderCube

    @Output() click = new EventEmitter<number>()

    cube!: THREE.Mesh

    ngOnInit(): void {
        this.cube = new THREE.Mesh(
            new THREE.BoxGeometry(this.render.size[0], this.render.size[1], this.render.size[2]),
            this.render.materials
        )
        this.cube.position.set(this.render.pos[0], this.render.pos[1], this.render.pos[2])
        this.cube.rotation.set(this.render.rotation[0], this.render.rotation[1], this.render.rotation[2])
        const uvAttribute = this.cube.geometry.getAttribute('uv')
        uvAttribute.array.set(this.render.uvs)
        uvAttribute.needsUpdate = true
    }
}
