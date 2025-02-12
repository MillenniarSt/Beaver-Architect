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
import { display, ProjectBar } from './display';
import { SidebarsComponent } from './sidebar/sidebars.component';
import { NgIf } from '@angular/common';
import { Material, Project, ProjectService } from '../services/project.service';
import { PagesComponent } from "./page/pages.component";
import { RenderModelData, RenderService } from '../services/render.service';
import { emit, once } from '@tauri-apps/api/event';
import { ChannelTask, ForEachTask, Process, SingleTask, TaskGroup } from '../process/process';
import { SplitterModule } from 'primeng/splitter'
import { convertFileSrc } from '@tauri-apps/api/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { appDataDir } from '@tauri-apps/api/path';
import { projectsDir } from '../util';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { ToastModule } from 'primeng/toast';
import '../components/form/inputs/import'

@Component({
  selector: 'project',
  standalone: true,
  imports: [NgIf, SplitterModule, SidebarsComponent, PagesComponent, Menubar, AvatarModule, ToastModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
  encapsulation: ViewEncapsulation.None,
  providers: [ProjectService, RenderService, MessageService]
})
export class ProjectComponent {

  constructor(
    private cdRef: ChangeDetectorRef,
    private ps: ProjectService,
    private render: RenderService,
    private message: MessageService
  ) { }

  sidebarIndex: number = 0

  menuItems: MenuItem[] = [
    {
      label: 'Project',
      icon: 'pi pi-folder-open',
      items: [
        { label: 'Project Settings' },
        { separator: true },
        { label: 'Open new Project' },
        { label: 'Return to Home' },
        { label: 'Exit' }
      ]
    },
    {
      label: 'Online',
      icon: 'pi pi-users',
      items: [
        { label: 'Open online' },
        { separator: true },
        { label: 'Users' },
        { label: 'Invite user' }
      ]
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog'
    }
  ]

  ngOnInit() {
    this.ps.server.listen('message', (message: any) => {
      this.showMessage(message.severity, message.summary, message.detail)
    })

    once<{ identifier: string, url: string, isLocal: boolean, isPublic: boolean }>('project:get', async (event) => {
      const identifier = event.payload.identifier
      const isLocal = event.payload.isLocal

      const process = new Process(`load_project:${identifier}`, {
        title: `Loading ${identifier}`,
        description: 'Funziona per favore',
        autoClose: true
      }, [
        new TaskGroup('Server', 1, [
          new SingleTask('Opening', 1, async () => {
            if (isLocal) {
              //await this.ps.openServer(identifier, Number(event.payload.url.substring(event.payload.url.lastIndexOf(':') +1)))
            }
          }),
          new SingleTask('Connecting', 2, async () => {
            await this.ps.server.connect(event.payload.url)

            const project = await this.ps.server.request('get')
            this.ps._project = project
            this.ps._architectData = project.architect

            this.ps.project.image = convertFileSrc(`${await appDataDir()}\\${projectsDir}\\${project.identifier}\\image.png`)
            this.ps.project.background = convertFileSrc(`${await appDataDir()}\\${projectsDir}\\${project.identifier}\\background.png`)
          })
        ]),

        new TaskGroup('Architect', 4, [
          new TaskGroup('Initializing', 1, [
            new SingleTask('Opening', 2, async () => {
              if (!isLocal) {
                // TODO open process
              }
            }),
            new SingleTask('Connecting', 1, async () => {
              await this.ps.architect.connectLocal(this.ps.architectData.port, isLocal ? undefined : this.ps.server)
              await this.ps.architect.request('define', { side: 'client' })
              if (!isLocal) {
                await this.ps.architect.request('define', { side: 'server', isRemote: true })
              }
            }),
            new SingleTask('Loading Configs', 8, async () => {
              await this.ps.architect.request('load/configs')
            }),
            new SingleTask('Loading Project', 4, async () => {
              console.log('request')
              await this.ps.architect.request('load/project', this.ps.project)
              console.log('answer')
            })
          ]),
          new TaskGroup('Render', 6, [
            new SingleTask('Materials', 1, async () => {
              const materialsData = await this.ps.architect.request('data-pack/materials/get')
              this.ps.materialGroups = materialsData.groups.map((group: any) => {
                return {
                  label: group.label,
                  icon: group.icon,
                  children: group.materials.map((material: Material) => {
                    material.icon = convertFileSrc(material.icon)
                    return material
                  })
                }
              })
              this.ps.materials = Object.fromEntries(materialsData.materials.map((material: Material) => {
                material.icon = convertFileSrc(material.icon)
                return [material.id, material]
              }))
            }),
            new TaskGroup<{ textures: Record<string, string> }>('Textures', 3, [
              new SingleTask('Collecting', 1, async (data) => {
                data.textures = await this.ps.architect.request('render/textures')
              }),
              new ForEachTask('Loading', 4, (data) => Object.entries(data.textures), ([key, texture]) =>
                this.render.loadTexture(key, texture)
              )
            ]),
            new TaskGroup<{ objects: Record<string, RenderModelData> }>('Objects', 4, [
              new SingleTask('Collecting', 1, async (data) => {
                data.objects = await this.ps.architect.request('render/objects')
              }),
              new ForEachTask('Loading', 3, (data) => Object.entries(data.objects), ([key, object]) =>
                this.render.loadModel(key, object)
              )
            ])
          ])
        ]),
        new TaskGroup('Builders', 4, [
          //new ChannelTask('Async', 1, this.ps.server, 'init')
          // TODO Implement Sync with Server
        ])
      ], () => {
        console.log('finish')
        this.cdRef.detectChanges()
      })

      await process.start()

      await process.executeTask(0)
      process.executeTask(1)
      process.executeTask(2)
    })

    emit('project:ready')
  }

  showMessage(severity: string, summary: string, detail: string) {
    this.message.add({ severity, summary, detail, life: severity === 'warn' || severity === 'error' ? 5000 : 3000 })
  }

  isLoaded(): boolean {
    return this.ps._project !== undefined
  }

  get project(): Project {
    return this.ps.project
  }

  sidebars(): ProjectBar[] {
    return display.sidebars
  }

  minimize() {
    getCurrentWebviewWindow().minimize()
  }

  async maximize() {
    const win = getCurrentWebviewWindow()
    if (await win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }

  close() {
    this.ps.close()
  }
}
