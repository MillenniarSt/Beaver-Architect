import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, OnInit, Type } from '@angular/core';
import { extend, NgtCanvas, NgtArgs, NGT_STORE } from 'angular-three';
import * as THREE from 'three';
import { SceneObject, SceneService } from '../../../services/scene.service';
import { OrbitControls } from 'three-stdlib';
import { ProjectService } from '../../../services/project.service';
import { PluginDirection, PluginsService } from '../../../services/http/plugin.service';
import { NgFor, NgIf } from '@angular/common';
import { ServerService } from '../../../services/http/server.service';
import { FormComponent, FormDataInput, FormDataOutput } from "../../../components/form/form.component";
import { AngularSplitModule } from 'angular-split';
import { SceneObjectComponent } from '../../../render/object.component';
import { GridComponent } from '../../../render/grid.component';
import { ObjectManagerComponent, ObjectManagerData, ObjectManagerModes } from '../../../render/object-manager.component';

extend(THREE)
extend({ OrbitControls })

@Component({
  selector: 'page-schematic',
  standalone: true,
  imports: [NgtCanvas, NgIf, FormComponent, AngularSplitModule],
  templateUrl: './schematic.component.html',
  styleUrl: './schematic.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [SceneService<string>]
})
export class SchematicComponent implements OnInit {

  @Input() index!: number

  path!: string
  formDataInput: FormDataInput[] = []

  sceneGraph?: Type<SceneGraph>

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService, private scene: SceneService<string>, private plugins: PluginsService, private server: ServerService) { }

  ngOnInit(): void {
    this.path = this.ps.getPage(this.index).data.path
    this.server.get('file/read-json', { path: this.path }, this, (data) => {
      this.plugins.post(PluginDirection.ARCHITECT, 'data-pack/schematics/open', { path: this.path, data: data }, this, (sceneData) => {
        this.scene.data = sceneData
        this.sceneGraph = SceneGraph
        this.cdr.detectChanges()
      })
    })

    this.scene.selectionMessage.subscribe((selection: string[]) => {
      if (selection.length > 0) {
        this.plugins.get(
          PluginDirection.ARCHITECT,
          'data-pack/schematics/select-data',
          { path: this.path, selection: selection[0] },
          this,
          (data) => {
            this.formDataInput = data.form
            this.scene.editSelection(selection[0], data.sceneEdit)
            this.cdr.detectChanges()
          }
        )
      } else {
        this.cdr.detectChanges()
      }
    })
  }

  isLoaded(): boolean {
    return this.sceneGraph !== undefined
  }

  editSelection(changes: FormDataOutput) {
    this.plugins.post(PluginDirection.ARCHITECT, 'data-pack/schematics/edit-selection', {
      path: this.path,
      selection: this.scene.selection[0],
      changes: changes
    }, this, (data) => {
      if(data.file) {
        this.server.post('file/write-json', { path: this.path, data: data.file })
      }
      if(data.form) {
        this.formDataInput = data.form
        this.cdr.detectChanges()
      }
      if(data.render) {
        this.scene.update(data.render)
      }
      if(data.sceneEdit !== null) {
        this.scene.editSelection(data.sceneEdit)
      }
    })
  }
}

@Component({
  selector: 'editable-object',
  standalone: true,
  template: `
    <scene-object [object]="object" (click)="click($event)"/>
    <object-manager *ngIf="edit" [center]="centerEdit()"></object-manager>
  `,
  imports: [SceneObjectComponent, NgIf, ObjectManagerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditableObject implements OnInit {

  @Input() object!: SceneObject

  edit?: ObjectManagerData

  constructor(private scene: SceneService<string>, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.scene.editSelectionMessage.subscribe((edit) => {
      if(edit && edit.object === this.object.id) {
        this.edit = edit.data
        this.cdr.detectChanges()
      } else if(this.edit) {
        this.edit = undefined
        this.cdr.detectChanges()
      }
    })
  }

  centerEdit(): THREE.Vector3 {
    return this.edit!.center ? new THREE.Vector3(this.edit!.center[0], this.edit!.center[1], this.edit!.center[2]) : new THREE.Vector3(0, 0, 0)
  }

  click(object: SceneObject) {
    this.scene.select(object.id)
  }
}

@Component({
  standalone: true,
  template: `
    <ngt-orbit-controls *args="[camera, glDom]"/>
    <editable-object *ngFor="let object of objects" [object]="object"/>
    <grid></grid>
  `,
  imports: [NgtArgs, NgFor, GridComponent, EditableObject],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
class SceneGraph implements OnInit {

  private readonly store = inject(NGT_STORE)
  readonly camera = this.store.get('camera')
  readonly glDom = this.store.get('gl', 'domElement')

  objects: SceneObject[]

  constructor(private scene: SceneService<string>) {
    this.objects = this.scene.data.objects
  }

  ngOnInit(): void {
    this.scene.camera = this.camera
  }
}