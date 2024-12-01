import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, OnDestroy, OnInit, Type } from '@angular/core';
import { extend, NgtCanvas, NgtArgs, NGT_STORE } from 'angular-three';
import * as THREE from 'three';
import { ElementNode, ElementView, SceneService } from '../../../services/scene.service';
import { OrbitControls } from 'three-stdlib';
import { ProjectService } from '../../../services/project.service';
import { NgFor, NgIf } from '@angular/common';
import { FormComponent, FormDataInput, FormDataOutput } from "../../../components/form/form.component";
import { AngularSplitModule } from 'angular-split';
import { GridComponent } from '../../../render/grid.component';
import { SchematicTreeComponent } from './schematic-tree.component';
import { ElementComponent } from '../../../render/element.component';
import { Subject } from 'rxjs';
import { EditGraph, EditGraphComponent } from '../../../render/edit-graph.component';

extend(THREE)
extend({ OrbitControls })

export type SchematicUpdate = {
  id: string,
  mode?: 'push' | 'delete',
  parent?: string,

  view?: ElementView,
  node?: ElementNode,
  editGraph?: boolean,
  form?: boolean
}

@Component({
  selector: 'page-schematic',
  standalone: true,
  imports: [NgtCanvas, NgIf, FormComponent, AngularSplitModule, SchematicTreeComponent],
  templateUrl: './schematic.component.html',
  styleUrl: './schematic.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [SceneService<SchematicUpdate>]
})
export class SchematicComponent implements OnInit, OnDestroy {

  @Input() index!: number

  ref!: string

  formDataInput: FormDataInput[] = []
  nodes: ElementNode[] = []

  sceneGraph?: Type<SceneGraph>

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService, private scene: SceneService<SchematicUpdate>) { }

  private destroy$ = new Subject<void>()

  ngOnInit(): void {
    const path = this.ps.getPage(this.index).data.path
    this.ref = path.substring(21, path.lastIndexOf('.'))
    this.ps.server.request('data-pack/schematics/get', { ref: this.ref }).then((data) => {
      console.log('Init', data)
      this.nodes = data.tree
      this.scene.elements = data.view
      this.sceneGraph = SceneGraph
      this.cdr.detectChanges()
    })

    this.ps.server.listen('data-pack/schematics/update', (data) => {
      console.log('Update', data)
      if (data.ref === this.ref) {
        this.scene.update(data.updates)
      }
    }, this.destroy$)
    this.ps.server.listen('data-pack/schematics/update-client', (data) => {
      console.log('Update Client', data)
      if (data.ref === this.ref) {
        if (data.client.form) {
          this.formDataInput = data.client.form
          this.cdr.detectChanges()
        }
        if (data.client.editGraph) {
          this.scene.updateEditGraph(data.client.editGraph)
        }
      }
    }, this.destroy$)

    this.scene.onUpdate((update) => {
      if (update.id === this.scene.selection[0]) {
        if (update.editGraph || update.form) {
          this.ps.server.send('data-pack/schematics/selection-data', { ref: this.ref, selection: this.scene.selection, form: update.form, editGraph: update.editGraph })
        }
      }
    })
    this.scene.onUpdate((update) => {
      if (update.id === this.scene.selection[0]) {
        this.formDataInput = []
        this.scene.updateEditGraph(undefined)
        this.cdr.detectChanges()
      }
    }, 'delete')

    this.scene.selectionMessage.subscribe((selection: string[]) => {
      if (selection.length > 0) {
        this.ps.server.send('data-pack/schematics/selection-data', { ref: this.ref, selection: selection, form: true, editGraph: true })
      } else {
        this.formDataInput = []
        this.cdr.detectChanges()
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  get title(): string {
    return this.ps.getPage(this.index).label
  }

  isLoaded(): boolean {
    return this.sceneGraph !== undefined
  }

  editSelection(updates: FormDataOutput) {
    this.ps.server.send('data-pack/schematics/update-form', {
      ref: this.ref,
      selection: this.scene.selection,
      updates: updates
    })
  }
}

@Component({
  standalone: true,
  template: `
    <ngt-orbit-controls *args="[camera, glDom]"/>
    <element *ngFor="let element of elements" [element]="element"/>
    <edit-graph *ngIf="editGraph" [data]="editGraph"/>
    <grid></grid>
  `,
  imports: [NgtArgs, NgIf, NgFor, GridComponent, ElementComponent, EditGraphComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
class SceneGraph implements OnInit {

  private readonly store = inject(NGT_STORE)
  readonly camera = this.store.get('camera')
  readonly glDom = this.store.get('gl', 'domElement')

  elements: ElementView[]
  editGraph?: EditGraph

  constructor(private scene: SceneService<SchematicUpdate>, private cdr: ChangeDetectorRef) {
    this.elements = this.scene.elements
  }

  ngOnInit(): void {
    console.log('Init')
    this.scene.onUpdate((element) => {
      if (element.view) {
        this.elements.push(element.view)
        this.cdr.detectChanges()
      }
    }, 'push')

    this.scene.onUpdate((element) => {
      this.elements.splice(this.elements.findIndex((e) => e.id === element.id), 1)
      this.cdr.detectChanges()
    }, 'delete')

    this.scene.editGraphMessage.subscribe((editGraph) => {
      this.editGraph = editGraph
      this.cdr.detectChanges()
    })
  }
}