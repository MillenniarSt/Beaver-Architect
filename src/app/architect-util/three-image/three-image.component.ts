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

import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, Injectable, OnInit, ViewEncapsulation } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { TreeModule } from 'primeng/tree';
import { ProgressBarModule } from 'primeng/progressbar';
import { RenderModel, RenderModelData, RenderService } from '../../services/render.service';
import { NGT_STORE, NgtCanvas } from 'angular-three';
import { CubeComponent } from '../../render/cube.component';

export type ThreeImageGenerator = {
  label: string
  size: [number, number]
  camera: {
    pos: [number, number, number]
    rotation: [number, number, number]
  }
  textures: [string, string][],
  images: ThreeImage[]
}

export type ThreeImage = {
  render: RenderModelData
  path: string
}

@Injectable()
export class GeneratorService extends RenderService {

  generator!: ThreeImageGenerator

  index: number = -1
  listener: () => void = () => { }

  createModel(data: RenderModelData): Promise<RenderModel> {
    return RenderModel.load(data, this)
  }

  next(): ThreeImage {
    this.index++
    this.listener()
    return this.generator.images[this.index]
  }
}

@Component({
  selector: 'three-image',
  standalone: true,
  imports: [TreeModule, ProgressBarModule, NgtCanvas, NgIf],
  templateUrl: './three-image.component.html',
  styleUrl: './three-image.component.css',
  encapsulation: ViewEncapsulation.None,
  providers: [GeneratorService]
})
export class ThreeImageComponent implements OnInit {

  generator!: ThreeImageGenerator

  textureIndex: number = 0

  sceneGraph = SceneGraph

  constructor(private electron: ElectronService, private cdr: ChangeDetectorRef, private render: GeneratorService) { }

  ngOnInit(): void {
    this.electron.ipcRenderer.once('three-image:get', (e, data) => {
      this.generator = data
      this.render.generator = this.generator
      this.render.listener = () => this.cdr.detectChanges()
      this.cdr.detectChanges()

      for (this.textureIndex = 0; this.textureIndex < this.generator.textures.length; this.textureIndex++) {
        this.render.loadTexture(this.generator.textures[this.textureIndex][0], this.generator.textures[this.textureIndex][1])
        this.cdr.detectChanges()
      }
    })
  }

  end(completed: boolean) {
    this.electron.ipcRenderer.invoke('three-image:close', {
      index: this.render.index,
      completed: completed
    })
  }

  get texturesProgress(): number {
    return (this.generator.textures.length - 1) / this.textureIndex
  }

  get modelsProgress(): number {
    return (this.generator.images.length - 1) / this.render.index
  }

  get progress(): number {
    return (this.texturesProgress + this.modelsProgress) / 2
  }
}

@Component({
  standalone: true,
  template: `
    <ng-template *ngIf="model">
      <cube *ngFor="let cube of model!.cubes" [render]="cube" />
    </ng-template>
  `,
  imports: [CubeComponent, NgIf, NgFor],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
class SceneGraph implements OnInit {

  private readonly store = inject(NGT_STORE)
  readonly camera = this.store.get('camera')

  model?: RenderModel

  constructor(private render: GeneratorService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.next()
  }

  async next() {
    const image = this.render.next()
    this.model = await this.render.createModel(image.render)
    this.cdr.detectChanges()
  }
}