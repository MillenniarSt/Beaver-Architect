import { NgFor } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CubeComponent } from './cube.component';
import { SceneObject } from '../services/scene.service';
import { RenderCube, RenderService } from '../services/render.service';

@Component({
  selector: 'scene-object',
  standalone: true,
  imports: [NgFor, CubeComponent],
  template: `
    <cube *ngFor="let cube of cubes" [render]="cube" (click)="clickPart($event)"/>
  `
})
export class SceneObjectComponent implements OnInit {

  @Input() object!: SceneObject

  @Output() click = new EventEmitter<number>()

  cubes: RenderCube[] = []

  constructor(private render: RenderService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.object.models.forEach((modelRef) => {
      const model = this.render.getModel(modelRef)
      if (model) {
        this.cubes = [...this.cubes, ...model.cubes.map((cube) => cube.modify(this.object.position, this.object.size, this.object.rotation))]
      } else {
        console.log(`Can not find model: ${modelRef}`)
      }
    })

    this.cdr.detectChanges()
  }

  clickPart(button: number) {
    this.click.emit(button)
  }
}
