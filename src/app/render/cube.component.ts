import { NgFor } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { extend } from 'angular-three';
import * as THREE from 'three';
import { RenderCube } from '../services/render.service';

extend(THREE)

@Component({
    selector: 'cube',
    standalone: true,
    template: `
        <ngt-mesh [position]="render.pos" [rotation]="render.rotation" [material]="render.materials">
            <ngt-box-geometry [args]="render.size" (attached)="onAttached($event.node)"/>
        </ngt-mesh>
    `,
    imports: [NgFor],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CubeComponent {

    @Input() render!: RenderCube

    onAttached(geometry: THREE.BoxGeometry) {
        if(this.render.uvs) {
            const uvAttribute = geometry.attributes['uv']
            const uv = uvAttribute.array
    
            this.render.uvs.forEach((value, i) => {
                uv[i] = value
            })
    
            uvAttribute.needsUpdate = true
        }
    }
}
