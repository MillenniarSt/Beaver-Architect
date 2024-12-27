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

import { Injectable } from '@angular/core';
import { Material, MeshBasicMaterial, NearestFilter, SRGBColorSpace, Texture, TextureLoader } from 'three';

@Injectable()
export class RenderService {

  protected readonly loader = new TextureLoader()

  protected models: Record<string, RenderModel> = {}
  protected textures: Record<string, Texture> = {}

  clear() {
    this.models = {}
  }

  async loadModel(key: string, data: RenderModelData): Promise<void> {
    this.models[key] = await RenderModel.load(data, this)
  }

  async loadTexture(key: string, path: string): Promise<void> {
    return new Promise((resolve) => {
      this.loader.load(path, (texture) => {
        texture.minFilter = NearestFilter
        texture.magFilter = NearestFilter
        texture.colorSpace = SRGBColorSpace

        this.textures[key] = texture
        resolve()
      })
    })
  }

  getModel(key: string): RenderModel {
    return this.models[key]
  }

  getTexture(key: string): Texture {
    return this.textures[key]
  }
}

export type RenderModelData = {
  cubes?: RenderCubeData[]
}

export class RenderModel {

  constructor(
    readonly cubes: RenderCube[]
  ) { }

  static async load(json: RenderModelData, render: RenderService): Promise<RenderModel> {
    const cubes = []

    if (json.cubes) {
      for(let i = 0; i < json.cubes.length; i++) {
        cubes.push(await RenderCube.load(json.cubes[i], render))
      }
    }

    return new RenderModel(cubes)
  }
}

export abstract class RenderShape {

  constructor(
    readonly pos: [number, number, number],
    readonly rotation: [number, number, number],

    readonly materials: Material[],
    readonly uvs: number[]
  ) { }
}

export type MaterialData = {
  texture: string,
  color?: number,
  uv: [number, number, number, number, number, number, number, number]
}

export type RenderCubeData = {
  pos: [number, number, number],
  size: [number, number, number],
  rotation: [number, number, number],
  faces: [
    MaterialData?,
    MaterialData?,
    MaterialData?,
    MaterialData?,
    MaterialData?,
    MaterialData?
  ]
}

export class RenderCube extends RenderShape {

  constructor(
    pos: [number, number, number],
    readonly size: [number, number, number],
    rotation: [number, number, number],

    materials: Material[],
    uvs: number[]
  ) {
    super(pos, rotation, materials, uvs)
  }

  static async load(json: RenderCubeData, render: RenderService): Promise<RenderCube> {
    const materials = []
    const uvs = []
    for (let i = 0; i < 6; i++) {
      const face = json.faces[i]
      if (face) {
        materials[i] = new MeshBasicMaterial({ 
          map: render.getTexture(face.texture),
          color: face.color
        })
        uvs.push(...face.uv)
      }
    }

    return new RenderCube(
      json.pos,
      json.size,
      json.rotation,
      materials,
      uvs
    )
  }

  modify(pos: [number, number, number], size?: [number, number, number], rotation?: [number, number, number]): RenderCube {
    return new RenderCube(
      [this.pos[0] + pos[0], this.pos[1] + pos[1], this.pos[2] + pos[2]],
      size ? [this.size[0] * size[0], this.size[1] * size[1], this.size[2] * size[2]] : this.size,
      rotation ? [this.rotation[0] * rotation[0], this.rotation[1] * rotation[1], this.rotation[2] * rotation[2]] : this.rotation,
      this.materials,
      this.uvs
    )
  }
}