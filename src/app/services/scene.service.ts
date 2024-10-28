import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { extend } from 'angular-three';
import * as THREE from 'three';
import { ObjectManagerData, ObjectManagerModes } from '../render/object-manager.component';

extend(THREE)

export type SceneData = {
  objects: SceneObject[]
}

export type SceneUpdate = {
  id: string,
  object: SceneObject
}

export type SceneObject = {
  id: string,

  position: [number, number, number],
  size?: [number, number, number],
  rotation?: [number, number, number],

  models: string[],

  center?: [number, number, number]
}

@Injectable()
export class SceneService<Selectable extends Object> {

  camera!: THREE.Camera

  data: SceneData = {
    objects: []
  }

  private updatesMessageSource = new BehaviorSubject<SceneUpdate[]>([])
  updatesMessage = this.updatesMessageSource.asObservable()

  update(updates: SceneUpdate[]) {
    this.updatesMessageSource.next(updates)
  }

  selection: Selectable[] = []

  private selectionMessageSource = new BehaviorSubject<Selectable[]>([])
  selectionMessage = this.selectionMessageSource.asObservable()

  private editSelectionMessageSource = new BehaviorSubject<{ object: string, data: ObjectManagerData} | undefined>(undefined)
  editSelectionMessage = this.editSelectionMessageSource.asObservable()

  editSelection(object?: string, data?: ObjectManagerData) {
    this.editSelectionMessageSource.next(object && data ? {object, data} : undefined)
  }

  clearSelection() {
    this.selection = []
    this.updateSelection()
  }

  setSelection(selection: Selectable[]) {
    this.selection = selection
    this.updateSelection()
  }

  select(selected: Selectable) {
    this.selection = [selected]
    this.updateSelection()
  }

  addOrRemoveToSelection(selected: Selectable) {
    if(this.selection.includes(selected)) {
      this.removeToSelection(selected)
    } else {
      this.addToSelection(selected)
    }
  }

  addToSelection(selected: Selectable) {
    this.selection.push(selected)
    this.updateSelection()
  }

  removeToSelection(selected: Selectable) {
    const index = this.selection.indexOf(selected)
    if (index !== -1) {
      this.selection = this.selection.splice(index, 1)
      this.updateSelection()
    }
  }

  updateSelection() {
    this.selectionMessageSource.next(this.selection)
  }

  setSelectionNoUpdates(selection: Selectable[]) {
    this.selection = selection
  }
}

function calculateDimensionOf(object: SceneObject): {
  min: number[],
  max: number[]
} {
  let dim = {
    min: [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE],
    max: [Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE]
  }

  

  return dim
}
