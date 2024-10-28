import { NgFor } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CubeComponent } from './cube.component';
import { SceneObject, SceneService } from '../services/scene.service';
import { RenderCube, RenderService } from '../services/render.service';

@Component({
  selector: 'scene-object',
  standalone: true,
  imports: [NgFor, CubeComponent],
  template: `
    <cube *ngFor="let cube of cubes" [render]="cube" (click)="clickPart()"/>
  `
})
export class SceneObjectComponent implements OnInit {

  @Input() object!: SceneObject

  @Output() click = new EventEmitter<SceneObject>()

  cubes: RenderCube[] = []

  constructor(private render: RenderService, private scene: SceneService<any>, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.scene.updatesMessage.subscribe((updates) => {
      updates.forEach((update) => {
        if(update.id === this.object.id) {
          console.log(update.object)
          this.loadObject(update.object, true)
        }
      })
    })

    this.loadObject(this.object, false)
  }

  loadObject(object: SceneObject, update: boolean) {
    this.object = object
    this.cubes = []

    this.object.models.forEach((modelRef) => {
      const model = this.render.getModel(modelRef)
      if (model) {
        this.cubes = [...this.cubes, ...model.cubes.map((cube) => cube.modify(this.object.position, this.object.size, this.object.rotation))]
      } else {
        console.log(`Can not find model: ${modelRef}`)
      }
    })

    if(update) {
      this.cdr.detectChanges()
    }
  }

  clickPart() {
    this.click.emit(this.object)
  }
}
