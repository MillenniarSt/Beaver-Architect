import { NgFor } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from '@angular/core';
import * as THREE from 'three';
import { RenderCube } from '../services/render.service';
import { NgtThreeEvent } from 'angular-three';

@Component({
    selector: 'cube',
    standalone: true,
    template: `
        <ngt-mesh [position]="render.pos" [rotation]="render.rotation" [material]="render.materials" (click)="clickEvent($event)">
            <ngt-box-geometry [args]="render.size" (attached)="onAttached($event.node)"/>
        </ngt-mesh>
    `,
    imports: [NgFor],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CubeComponent {

    @Input() render!: RenderCube

    @Output() click = new EventEmitter<void>()

    onAttached(geometry: THREE.BoxGeometry) {
        if (this.render.uvs) {
            const uvAttribute = geometry.attributes['uv']
            const uv = uvAttribute.array

            this.render.uvs.forEach((value, i) => {
                uv[i] = value
            })

            uvAttribute.needsUpdate = true
        }
    }

    /*private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();*/

    clickEvent(event: NgtThreeEvent<MouseEvent>) {
        /*this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Esegui il raycasting per ottenere l'intersezione con la mesh
        this.raycaster.setFromCamera(this.mouse, event.camera);
        const intersects = this.raycaster.intersectObject(event.object, true);

        if (intersects.length > 0) {
            const intersection = intersects[0];

            // Punto nello spazio
            const point = intersection.point;

            // Direzione perpendicolare alla faccia cliccata
            const normal = intersection.face?.normal.clone().applyMatrix4(intersection.object.matrixWorld).normalize();

            console.log('Punto cliccato nello spazio:', point);
            console.log('Normale della faccia cliccata:', normal);
        }*/

        this.click.emit()
    }
}
