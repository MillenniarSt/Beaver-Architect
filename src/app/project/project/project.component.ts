import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ProjectBar, types } from '../types';
import { SidebarsComponent } from '../sidebar/sidebars.component';
import { AngularSplitModule } from 'angular-split';
import { NgClass, NgIf } from '@angular/common';
import { ServerService } from '../../services/http/server.service';
import { ProjectService } from '../../services/project.service';
import { PagesComponent } from "../page/pages.component";
import { RenderModelData, RenderService } from '../../services/render.service';
import { openProgress } from '../../progress/progress';
import { PluginDirection, PluginsService } from '../../services/http/plugin.service';
import { Project } from '../../../types';

@Component({
  selector: 'project',
  standalone: true,
  imports: [NgIf, AngularSplitModule, SidebarsComponent, PagesComponent, NgClass],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ProjectComponent {

  constructor(
    private server: ServerService, 
    private plugins: PluginsService, 
    private electron: ElectronService, 
    private cdRef: ChangeDetectorRef, 
    private ps: ProjectService, 
    private render: RenderService
  ) { }

  isSidebarExtended: boolean = true
  sidebarIndex: number = 0

  ngOnInit() {
    this.electron.ipcRenderer.once('project:get', (e, identifier) => {
      this.server.get(`projects/${identifier}`, {}, this, (project: Project) => {
        this.ps._project = project
        this.ps._projectType = types[project.type]

        const process = `load_project:${project.identifier}`
        openProgress(process, {
          title: `Loading ${project.name}`,
          description: 'Funziona per favore',
          autoClose: true,
        }, [
          {
            label: 'Starting Plugins',
            started: true,
            subtasks: [
              { label: 'Initializing' },
              { label: 'Textures', weigth: 5 },
              { label: 'Objects', weigth: 5 }
            ]
          }
        ], async (update) => {
          await this.plugins.ensurePlugins(this.electron)
          this.plugins.setArchitect(project.architect)

          this.plugins.post(PluginDirection.ARCHITECT, 'project/open', project, this, () => {
            update({
              index: 0,
              progress: 1
            })

            this.plugins.get(PluginDirection.ARCHITECT, 'render/textures', {}, this, async (textures: Record<string, string>) => {
              const entries = Object.entries(textures)
              for(let i = 0; i < entries.length; i++) {
                const [key, texture] = entries[i]
                await this.render.loadTexture(key, texture)
                update({
                  index: 0,
                  progress: i / (entries.length -1)
                })
              }

              this.plugins.get(PluginDirection.ARCHITECT, 'render/objects', {}, this, async (objects: Record<string, RenderModelData>) => {
                const entries = Object.entries(objects)
                for(let i = 0; i < entries.length; i++) {
                  const [key, object] = entries[i]
                  await this.render.loadModel(key, object)
                  update({
                    index: 0,
                    progress: i / (entries.length -1)
                  })
                }
              })
            })
          })
        }).then((process) => {
          this.cdRef.detectChanges()
        })
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
