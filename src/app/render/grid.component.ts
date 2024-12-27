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

import { NgFor } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { NgtArgs } from 'angular-three';
import * as THREE from 'three';

@Component({
  selector: 'grid',
  standalone: true,
  imports: [NgFor, NgtArgs],
  template: `
    <ngt-grid-helper [args]="[size, divisions, '#00000000', color]"/>

    <ng-container *ngFor="let arrow of arrows">
      <ngt-primitive *args="[arrow]"></ngt-primitive>
    </ng-container>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GridComponent implements OnInit {

  @Input() size: number = 100
  @Input() divisions: number = this.size / 2
  @Input() color: string = '#efefef'

  arrows: THREE.ArrowHelper[] = [];

  ngOnInit(): void {
    this.arrows.push(this.createArrow(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-this.size / 16, 0, 0), this.size / 8, '#ed0c15'))
    this.arrows.push(this.createArrow(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -this.size / 16, 0), this.size / 8, '#1cd715'))
    this.arrows.push(this.createArrow(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -this.size / 16), this.size / 8, '#0825db'))
  }

  createArrow(dir: THREE.Vector3, origin: THREE.Vector3, length: number, color: string): THREE.ArrowHelper {
    return new THREE.ArrowHelper(dir, origin, length, color, 0.3, 0.15)
  }
}
