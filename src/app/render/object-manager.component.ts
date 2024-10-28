import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core'
import * as THREE from 'three'
import { NgFor, NgSwitch, NgSwitchCase } from '@angular/common'
import { NgtArgs } from 'angular-three'
import { SceneService } from '../services/scene.service'

export type ObjectManagerData = {
  modes?: ObjectManagerModes,
  mode: ObjectManagerMode,
  center?: [number, number, number],
  size?: [number, number, number]
}

export type ObjectManagerModes = {
  move?: [number, number, number],
  resize?: [number, number, number],
  rotate?: [number, number, number]
}

export type ObjectManagerMode = 'move' | 'resize' | 'rotate'

@Component({
  selector: 'object-manager',
  standalone: true,
  imports: [NgFor, NgtArgs, NgSwitch, NgSwitchCase],
  template: `
    <ng-container [ngSwitch]="mode">
      <ng-container *ngSwitchCase="'move'">
        <ng-container *ngFor="let moveControl of moveControls">
          <ngt-primitive *args="[moveControl]"></ngt-primitive>
        </ng-container>
      </ng-container>
    </ng-container>
    <ngt-mesh [ref]="planeRef" [visible]="false">
      <ngt-plane-geometry></ngt-plane-geometry>
      <ngt-mesh-basic-material></ngt-mesh-basic-material>
    </ngt-mesh>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ObjectManagerComponent implements OnInit {

  @ViewChild('planeRef', { static: true }) planeRef!: ElementRef

  @Input() modes: ObjectManagerModes = {
    move: [1, 1, 1]
  }
  @Input() mode: ObjectManagerMode = 'move'
  @Input() center: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  @Input() size: THREE.Vector3 = new THREE.Vector3(0.8, 0.8, 0.8)

  @Output() onMove = new EventEmitter<[number, number, number]>()
  @Output() onResize = new EventEmitter<[number, number, number]>()
  @Output() onRotate = new EventEmitter<[number, number, number]>()

  moveControls: THREE.ArrowHelper[] = []

  constructor(private scene: SceneService<any>) { }

  ngOnInit(): void {
    this.moveControls.push(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), this.center, this.size.x, '#ed0c15', 0.3, 0.15))
    this.moveControls.push(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), this.center, this.size.y, '#1cd715', 0.3, 0.15))
    this.moveControls.push(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), this.center, this.size.z, '#0825db', 0.3, 0.15))

    this.moveControls.forEach((moveControl) => {
      (moveControl.line.material as THREE.Material).depthTest = false;
      (moveControl.cone.material as THREE.Material).depthTest = false;
    })
  }

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  selectedArrow: THREE.ArrowHelper | null = null

  @HostListener('document:mousedown', ['$event'])
  onPointerDown(event: MouseEvent): void {
    console.log('down')
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.scene.camera)
    const intersects = this.raycaster.intersectObjects(this.moveControls, true)

    if (intersects.length > 0) {
      this.selectedArrow = intersects[0].object.parent as THREE.ArrowHelper
    }
  }

  @HostListener('document:mouseup')
  onPointerUp(): void {
    this.selectedArrow = null
  }

  @HostListener('document:mousemove', ['$event'])
  onPointerMove(event: MouseEvent): void {
    if (this.selectedArrow) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      this.raycaster.setFromCamera(this.mouse, this.scene.camera)
      const intersects = this.raycaster.intersectObject(this.planeRef.nativeElement, true)

      if (intersects.length > 0) {
        const point = intersects[0].point
        this.selectedArrow.position.copy(point)

        console.log([point.x, point.y, point.z])
        this.onMove.emit([point.x, point.y, point.z])
      }
    }
  }
}
