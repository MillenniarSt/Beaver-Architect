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
  node?: ElementNode
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

  path!: string

  formDataInput: FormDataInput[] = []
  nodes: ElementNode[] = []

  sceneGraph?: Type<SceneGraph>

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService, private scene: SceneService<SchematicUpdate>) { }

  private destroy$ = new Subject<void>()

  ngOnInit(): void {
    this.path = this.ps.getPage(this.index).data.path
    this.ps.server.request('file/read-json', { path: this.path }).then((data) => {
      this.ps.architect.request('data-pack/schematics/open', { path: this.path, data: data }).then((data) => {
        this.nodes = data.nodes
        this.scene.data = data.view
        this.sceneGraph = SceneGraph
        this.cdr.detectChanges()
      })
    })

    this.ps.architect.listen('data-pack/schematics/update', (data) => {
      if(data.path === this.path) {
        this.scene.update(data.updates)
      }
    }, this.destroy$)
    this.ps.architect.listen('data-pack/schematics/update-client', (data) => {
      if(data.path === this.path) {
        if(data.form) {
          this.formDataInput = data.form
        }
        if(data.editGraph) {
          this.scene.updateEditGraph(data.editGraph)
        }
      }
    }, this.destroy$)
    this.ps.architect.listen('data-pack/schematics/update-file', (data) => {
      if(data.path === this.path) {
        this.ps.server.send('file/write-json', { path: this.path, data: data.file })
      }
    }, this.destroy$)

    this.scene.onUpdate((update) => {
      if(update.id === this.scene.selection[0]) {
        this.formDataInput = []
      }
    }, 'delete')

    this.scene.selectionMessage.subscribe((selection: string[]) => {
      if (selection.length > 0) {
        this.ps.architect.request(
          'data-pack/schematics/selection',
          { path: this.path, selection: selection }
        ).then((data) => {
          this.formDataInput = data.form
          this.scene.updateEditGraph(data.editGraph)
          this.cdr.detectChanges()
        })
      } else {
        this.formDataInput = []
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
    this.ps.architect.send('data-pack/schematics/update-form', {
      path: this.path,
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
    this.elements = this.scene.data.elements
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