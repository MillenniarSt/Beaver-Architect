import { Injectable } from '@angular/core';

export type SceneData = {
  objects: SceneObject[]
}

export type SceneObject = {
  position: [number, number, number],
  size?: [number, number, number],
  rotation?: [number, number, number],

  key?: string,
  properties?: Record<string, any>,

  models: string[]
}

@Injectable()
export class SceneService {

  data: SceneData = {
    objects: []
  }
}
