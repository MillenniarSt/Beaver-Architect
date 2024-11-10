import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { extend } from 'angular-three';
import * as THREE from 'three';
import { EditGraph } from '../render/edit-graph.component';

extend(THREE)

export type SceneData = {
  elements: ElementView[]
}

export type ElementView = {
  id: string,
  objects: SceneObject[]
}

export type SceneObject = {
  position: [number, number, number],
  size?: [number, number, number],
  rotation?: [number, number, number],

  models: string[]
}

export type ElementNode = {
  id: string,
  label: string,
  isGroup?: boolean,
  children?: ElementNode[]
}

export type SceneUpdate = {
  id: string,
  mode?: 'push' | 'delete'

  view?: ElementView
}

@Injectable()
export class SceneService<Update extends SceneUpdate> {

  data: SceneData = {
    elements: []
  }

  private updatesMessageSource = new BehaviorSubject<Update[]>([])
  updatesMessage = this.updatesMessageSource.asObservable()

  update(updates: Update[]) {
    this.updatesMessageSource.next(updates)
  }

  onUpdate(onUpdate: (element: Update) => void, mode?: 'push' | 'delete') {
    this.updatesMessage.subscribe((updates) => {
      updates.forEach((update) => {
        if(update.mode === mode) {
          onUpdate(update)
        }
      })
    })
  }

  private editGraphMessageSource = new BehaviorSubject<EditGraph | undefined>(undefined)
  editGraphMessage = this.editGraphMessageSource.asObservable()

  updateEditGraph(editGraph?: EditGraph) {
    this.editGraphMessageSource.next(editGraph)
  }

  selection: string[] = []

  private selectionMessageSource = new BehaviorSubject<string[]>([])
  selectionMessage = this.selectionMessageSource.asObservable()

  clearSelection() {
    this.selection = []
    this.updateSelection()
  }

  setSelection(selection: string[]) {
    this.selection = selection
    this.updateSelection()
  }

  select(selected: string) {
    this.selection = [selected]
    this.updateSelection()
  }

  selectOrClear(selected: string) {
    if(this.selection.includes(selected)) {
      this.clearSelection()
    } else {
      this.select(selected)
    }
  }

  addToSelection(selected: string) {
    if(!this.selection.includes(selected)) {
      this.selection.push(selected)
      this.updateSelection()
    }
  }

  removeToSelection(selected: string) {
    const index = this.selection.indexOf(selected)
    if (index !== -1) {
      this.selection = this.selection.splice(index, 1)
      this.updateSelection()
    }
  }

  addOrRemoveToSelection(selected: string) {
    if (this.selection.includes(selected)) {
      this.removeToSelection(selected)
    } else {
      this.addToSelection(selected)
    }
  }

  updateSelection() {
    this.selectionMessageSource.next(this.selection)
  }

  setSelectionNoUpdates(selection: string[]) {
    this.selection = selection
  }
}