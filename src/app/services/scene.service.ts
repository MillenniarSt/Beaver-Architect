import { Injectable } from '@angular/core';

export type SceneData = {
  objects: {
    models: {
      position: [number, number, number],
      size?: [number, number, number],
      rotation?: [number, number, number],
      key: string
    }[]
  }[]
}

@Injectable()
export class SceneService {

  data: SceneData = {
    objects: []
  }
}
