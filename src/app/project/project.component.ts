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
import { ProjectService } from '../services/project.service';
import { PagesComponent } from "./page/pages.component";
import { RenderService } from '../services/render.service';
import { emit, once } from '@tauri-apps/api/event';
import { SplitterModule } from 'primeng/splitter'
import { MenuItem, MessageService } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { ToastModule } from 'primeng/toast';
import '../components/form/inputs/import'
import { Project } from '../../client/project/project';
import { getProjectInstance, initInstance } from '../../client/instance/instance';

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

	public isLoaded: boolean = false

	ngOnInit() {
		this.ps.project.server.listen('message', (message: any) => {
			this.showMessage(message.severity, message.summary, message.detail)
		})

		once<{ identifier: string, url?: string, isPublic: boolean }>('project:get', async (event) => {
			await initInstance()

			const project = event.payload.url ?
				await Project.fromRemoteInstance(getProjectInstance(event.payload.identifier), event.payload.url) :
				await Project.fromLocalInstance(getProjectInstance(event.payload.identifier))

			if (await project.load()) {
				this.isLoaded = true
			} else {
				this.ps.close()
			}
		})

		emit('project:ready')
	}

	showMessage(severity: string, summary: string, detail: string) {
		this.message.add({ severity, summary, detail, life: severity === 'warn' || severity === 'error' ? 5000 : 3000 })
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
