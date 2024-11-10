import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core'
import * as THREE from 'three'
import { NgFor, NgSwitch, NgSwitchCase } from '@angular/common'
import { NGT_STORE, NgtArgs } from 'angular-three'

export type EditGraph = {
  modes?: EditGraphModes,
  mode: EditGraphMode,
  dimension?: { pos: [number, number, number], size: [number, number, number] }
  center?: [number, number, number],
  size?: [number, number, number]
}

export type EditGraphModes = {
  move?: [number, number, number],
  resize?: [number, number, number],
  rotate?: [number, number, number]
}

export enum EditGraphMode {
  MOVE = 'move'
}

@Component({
  selector: 'edit-graph',
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
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditGraphComponent implements OnInit, OnChanges {

  private readonly store = inject(NGT_STORE)
  readonly camera = this.store.get('camera')

  @Input() data!: EditGraph
  @Input() mode: EditGraphMode = EditGraphMode.MOVE

  @Output() onMove = new EventEmitter<[number, number, number]>()
  @Output() onResize = new EventEmitter<[number, number, number]>()
  @Output() onRotate = new EventEmitter<[number, number, number]>()

  moveControls: THREE.ArrowHelper[] = []

  constructor() { }

  ngOnInit(): void {
    this.setupControls()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setupControls()
  }

  get center(): THREE.Vector3 {
    return this.data.center ? new THREE.Vector3(this.data.center[0], this.data.center[1], this.data.center[2]) : new THREE.Vector3(0, 0, 0)
  }

  get size(): [number, number, number] {
    return this.data.size ?? [0.8, 0.8, 0.8]
  }

  setupControls() {
    this.moveControls = []

    this.moveControls.push(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), this.center, this.size[0], '#ed0c15', 0.3, 0.15))
    this.moveControls.push(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), this.center, this.size[1], '#1cd715', 0.3, 0.15))
    this.moveControls.push(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), this.center, this.size[2], '#0825db', 0.3, 0.15))

    this.moveControls.forEach((moveControl) => {
      (moveControl.line.material as THREE.Material).depthTest = false;
      (moveControl.cone.material as THREE.Material).depthTest = false;
    })
  }

  /*raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  selectedArrow: THREE.ArrowHelper | null = null

  @HostListener('document:mousedown', ['$event'])
  onPointerDown(event: MouseEvent): void {
    if (event.button === 0) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      this.raycaster.setFromCamera(this.mouse, this.camera)
      this.moveControls.forEach((control) => {
        const intersects = this.raycaster.intersectObject(control, true)
  
        if (intersects.length > 0) {
          this.selectedArrow = intersects[0].object.parent as THREE.ArrowHelper
        }
        console.log('click')
      })
    }
  }

  @HostListener('document:mouseup')
  onPointerUp(): void {
    //this.selectedArrow = null
  }

  @HostListener('document:mousemove', ['$event'])
  onPointerMove(event: MouseEvent): void {
    if (this.selectedArrow) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      this.raycaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.raycaster.intersectObject(this.selectedArrow, true)

      if (intersects.length > 0) {
        const point = intersects[0].point
        this.selectedArrow.position.copy(point)

        this.onMove.emit([point.x, point.y, point.z])
      }
    }
  }*/
}
