import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core'
import * as THREE from 'three'
import { NgFor, NgSwitch, NgSwitchCase } from '@angular/common'
import { NgtArgs } from 'angular-three'

export type EditGraph = {
  modes?: EditGraphModes,
  dimension: { pos: [number, number, number], size: [number, number, number] }
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
    return new THREE.Vector3(
      this.data.dimension.pos[0] + (this.data.dimension.size[0] / 2), 
      this.data.dimension.pos[1] + (this.data.dimension.size[1] / 2), 
      this.data.dimension.pos[2] + (this.data.dimension.size[2] / 2)
    )
  }

  setupControls() {
    this.moveControls = []

    this.moveControls.push(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), this.center, 0.8, '#ed0c15', 0.3, 0.15))
    this.moveControls.push(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), this.center, 0.8, '#1cd715', 0.3, 0.15))
    this.moveControls.push(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), this.center, 0.8, '#0825db', 0.3, 0.15))

    this.moveControls.forEach((moveControl) => {
      (moveControl.line.material as THREE.Material).depthTest = false;
      (moveControl.cone.material as THREE.Material).depthTest = false;
    })
  }
}
