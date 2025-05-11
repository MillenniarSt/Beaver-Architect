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
import { getCurrentWebviewWindow, WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { ToastModule } from 'primeng/toast';
import '../components/form/inputs/import'
import { Project } from '../../client/project/project';
import { getProjectInstance, initInstance } from '../../client/instance/instance';
import { baseErrorDialog, openBaseDialog } from '../dialog/dialogs';

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
				{ label: 'Return to Home', command: () => this.returnToHome()},
				{ label: 'Exit', command: () => this.close() }
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
		once<{ identifier: string, isPublic: boolean }>('project:get', async (event) => {
			await initInstance()

			const project = await Project.fromInstance(getProjectInstance(event.payload.identifier), event.payload.isPublic)

			this.ps._project = project
			project.server.onClose = async () => {
				await openBaseDialog(baseErrorDialog('Server Closed', 'Connection with the Server closed, the Project will be closed'))
				this.returnToHome()
			}
			project.server.onError = async () => {
				await openBaseDialog(baseErrorDialog('Connection Failed', 'Unexpected error encountered in the Server connection, the Project will be closed'))
				this.returnToHome()
			}
			project.architect.server.onClose = async () => {
				await openBaseDialog(baseErrorDialog('Architect Closed', 'Connection with the Architect closed, the Project will be closed'))
				this.returnToHome()
			}
			project.architect.server.onError = async () => {
				await openBaseDialog(baseErrorDialog('Architect Connection Failed', 'Unexpected error encountered in the Architect connection, the Project will be closed'))
				this.returnToHome()
			}

			this.ps.project.server.listen('message', (message: any) => {
				this.showMessage(message.severity, message.summary, message.detail)
			})

			if (await project.load()) {
				this.isLoaded = true
				this.cdRef.detectChanges()
			} else {
				this.returnToHome()
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

	returnToHome() {
		const home = new WebviewWindow('main', {
			title: 'Beaver Architect',
			width: 900,
			height: 600,
			center: true
		})
		home.once('tauri://created', () => this.close())
	}
}
