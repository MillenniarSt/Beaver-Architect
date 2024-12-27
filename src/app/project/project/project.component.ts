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

import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ProjectBar, types } from '../types';
import { SidebarsComponent } from '../sidebar/sidebars.component';
import { AngularSplitModule } from 'angular-split';
import { NgClass, NgIf } from '@angular/common';
import { Material, ProjectService } from '../../services/project.service';
import { PagesComponent } from "../page/pages.component";
import { RenderModelData, RenderService } from '../../services/render.service';
import { openProgress } from '../../progress/progress';

@Component({
  selector: 'project',
  standalone: true,
  imports: [NgIf, AngularSplitModule, SidebarsComponent, PagesComponent, NgClass],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
  encapsulation: ViewEncapsulation.None,
  providers: [ProjectService, RenderService]
})
export class ProjectComponent {

  constructor(
    private electron: ElectronService,
    private cdRef: ChangeDetectorRef,
    private ps: ProjectService,
    private render: RenderService
  ) { }

  isSidebarExtended: boolean = true
  sidebarIndex: number = 0

  ngOnInit() {
    this.electron.ipcRenderer.once('project:get', async (e, { identifier, url, isLocal }) => {
      const process = `load_project:${identifier}`
      openProgress(process, {
        title: `Loading ${identifier}`,
        description: 'Funziona per favore',
        autoClose: true,
      }, [
        {
          label: 'Starting Server',
          started: true,
          subtasks: isLocal ? [
            { label: 'Opening' },
            { label: 'Connecting' }
          ] : [
            { label: 'Connecting' }
          ]
        },
        {
          label: 'Starting Architect',
          subtasks: [
            { label: 'Initializing' },
            { label: 'Materials', weight: 2 },
            { label: 'Textures', weight: 5 },
            { label: 'Objects', weight: 5 }
          ]
        },
        {
          label: 'Loading Builders',
          subtasks: [
            { label: 'Schematics' },
            { label: 'Styles' }
          ]
        },
      ], async (update) => {
        if(isLocal) {
          await new Promise<void>((resolve) => {
            this.electron.ipcRenderer.once('project:open-server', () => {
              resolve()
            })
          })
          update({
            index: 0,
            progress: 1
          })
        }

        await this.ps.server.connect(url)
        update({
          index: 0,
          progress: 0.8
        })

        const project = await this.ps.server.request('get')
        this.ps._project = project
        this.ps._projectType = types[project.type]
        this.ps._architectData = project.architect
        update({
          index: 0,
          progress: 1
        })

        this.electron.ipcRenderer.on('server:send', (event, data) => {
          this.ps.server.send(data.path, data.data)
        })

        update({
          index: 1,
          progress: 0
        })
        if(!isLocal) {
          this.electron.ipcRenderer.invoke('project:open-architect', { 
            identifier: project.architect.identifier, 
            project: project.identifier, 
            port: project.architect.port,
            server: url
          })
          update({
            index: 1,
            progress: 0.4
          })
        }
        await this.ps.architect.connectLocal(project.architect.port, isLocal ? undefined : this.ps.server)
        await this.ps.architect.request('define', { side: 'client' })
        if(!isLocal) {
          await this.ps.architect.request('define', { side: 'server', isRemote: true })
        }
        update({
          index: 1,
          progress: 0.6
        })

        await this.ps.architect.request('open-project')
        update({
          index: 1,
          progress: 1
        })

        const materialsData = await this.ps.architect.request('data-pack/materials/get')
        this.ps.materialGroups = materialsData.groups.map((group: any) => {
          return {
            label: group.label,
            icon: group.icon,
            children: group.materials
          }
        })
        this.ps.materials = Object.fromEntries(materialsData.materials.map((material: Material) => [material.id, material]))
        update({
          index: 1,
          progress: 1
        }) 

        const textures: Record<string, string> = await this.ps.architect.request('render/textures')

        const entries = Object.entries(textures)
        for (let i = 0; i < entries.length; i++) {
          const [key, texture] = entries[i]
          await this.render.loadTexture(key, texture)
          update({
            index: 1,
            progress: i / (entries.length - 1)
          })
        }

        const objects: Record<string, RenderModelData> = await this.ps.architect.request('render/objects')

        const objectEntries = Object.entries(objects)
        for (let i = 0; i < objectEntries.length; i++) {
          const [key, object] = objectEntries[i]
          await this.render.loadModel(key, object)
          update({
            index: 1,
            progress: i / (objectEntries.length - 1)
          })
        }

        update({
          index: 2,
          progress: 0
        })
        await this.ps.server.channel('init', {}, (data) => update({
          index: 2,
          progress: data
        }))
      }).then((process) => {
        this.cdRef.detectChanges()
      })
    });
  }

  isLoaded(): boolean {
    return this.ps._project !== undefined && this.ps._projectType !== undefined
  }

  extendSidebar(index: number) {
    this.isSidebarExtended = index !== -1
    this.sidebarIndex = index
    this.cdRef.detectChanges()
  }

  sidebars(): ProjectBar[] {
    return this.ps.projectType.sidebars
  }
}
