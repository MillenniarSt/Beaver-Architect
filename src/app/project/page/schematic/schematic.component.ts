import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, OnInit, Type } from '@angular/core';
import { extend, NgtCanvas, NgtArgs, NGT_STORE } from 'angular-three';
import * as THREE from 'three';
import { CubeComponent } from '../../../render/cube.component';
import { RenderCube, RenderService } from '../../../services/render.service';
import { SceneObject, SceneService } from '../../../services/scene.service';
import { OrbitControls } from 'three-stdlib';
import { ProjectService } from '../../../services/project.service';
import { PluginDirection, PluginsService } from '../../../services/http/plugin.service';
import { ElectronService } from 'ngx-electron';
import { NgFor, NgIf } from '@angular/common';

extend(THREE)
extend({ OrbitControls })

@Component({
  selector: 'page-schematic',
  standalone: true,
  imports: [NgtCanvas, NgIf],
  templateUrl: './schematic.component.html',
  styleUrl: './schematic.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [SceneService]
})
export class SchematicComponent implements OnInit {

  @Input() index!: number

  selectObjects: SceneObject[] = [{
    position: [0, 0, 0],
    key: 'test',
    properties: {
      'string': 'String',
      'combo': 'option',
      'number': 0,
      'boolean': true
    },
    models: []
  }]

  sceneGraph?: Type<SceneGraph>

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService, private scene: SceneService, private plugins: PluginsService, private electron: ElectronService) { }

  ngOnInit(): void {
    this.electron.ipcRenderer.invoke('file:read', this.ps.getPage(this.index).data.path).then((data) => {
      this.plugins.post(PluginDirection.ARCHITECT, 'render/schematic', JSON.parse(data), this, (sceneData) => {
        this.scene.data = sceneData
        this.sceneGraph = SceneGraph
        this.cdr.detectChanges()
      })
    })
  }

  isLoaded(): boolean {
    return this.sceneGraph !== undefined
  }
}

@Component({
  standalone: true,
  template: `
    <ngt-orbit-controls *args="[camera, glDom]"/>
    <cube *ngFor="let cube of cubes" [render]="cube"/>
  `,
  imports: [CubeComponent, NgtArgs, NgFor],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
class SceneGraph implements OnInit {

  private readonly store = inject(NGT_STORE)
  readonly camera = this.store.get('camera')
  readonly glDom = this.store.get('gl', 'domElement')

  cubes: RenderCube[] = []

  constructor(private scene: SceneService, private render: RenderService) { }

  ngOnInit(): void {
    this.scene.data.objects.forEach((object) => {
      object.models.forEach((modelRef) => {
        const model = this.render.getModel(modelRef)
        if(model) {
          this.cubes = [...this.cubes, ...model.cubes.map((cube) => cube.modify(object.position, object.size, object.rotation))]
        }
      })
    })
  }
}