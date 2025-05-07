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

import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Type, ViewEncapsulation } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { baseErrorDialog, openBaseDialog, openInputDialog } from '../../../dialog/dialogs';
import { NgClass, NgFor } from '@angular/common';
import { StyleComponent } from '../../page/data-pack/style/style.component';
import { ListUpdateObject, MappedResourceReference, ResourceReference } from '../../../../client/project/engineer/engineer';
import { idToLabel } from '../../../../client/util';
import { Project } from '../../../../client/project/project';
import { Subject } from 'rxjs';
import { ComponentComponent } from '../../page/data-pack/component/component.component';

type FolderType = {
  title: string,
  label: string,
  id: string,
  icon: string,
  component: Type<any>
}

type DataPackTreeNode = TreeNode<{ ref: ResourceReference }>

@Component({
  selector: 'app-data-pack',
  standalone: true,
  imports: [TreeModule, NgFor, NgClass],
  templateUrl: './data-pack.component.html',
  styleUrl: './data-pack.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DataPackComponent implements OnInit, OnDestroy {

  @Input() selectedProject!: Project

  folders: FolderType[] = [
    {
      title: 'Components',
      label: 'Component',
      id: 'component',
      icon: 'assets/icon/component.svg',
      component: ComponentComponent
    },
    {
      title: 'Styles',
      label: 'Style',
      id: 'style',
      icon: 'assets/icon/style.svg',
      component: StyleComponent
    }
  ]
  selectedFolder: FolderType = this.folders[0]

  tree: DataPackTreeNode[] = []

  get treeRoot(): DataPackTreeNode {
    return this.tree[0]
  }

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService) { }

  private destroy$ = new Subject<void>()

  ngOnInit(): void {
    this.load()

    this.folders.forEach((folder) => {
      this.ps.project.server.listenUntil(`data-pack/${folder.id}/update`, (data: ListUpdateObject[]) => data.forEach((update) => {
        if(folder === this.selectedFolder) {
          if(update.mode === 'push') {
            this.addFile(new ResourceReference(update.id))
          } else if(update.mode === 'delete') {
            this.removeFile(new ResourceReference(update.id))
          }
        }
      }), this.destroy$)
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  load(): void {
    this.ps.project.server.request(`data-pack/${this.selectedFolder.id}/get-all`, { project: this.selectedProject.identifier }).then((data: string[]) => {
      this.tree = [{
        label: this.selectedFolder.title,
        icon: 'pi pi-folder',
        expanded: true,
        data: { ref: new ResourceReference({ pack: this.selectedProject.identifier, location: '' }) },
        type: 'dir',
        children: this.loadDir(ResourceReference.map(data.map((ref) => new ResourceReference(ref))))
      }]

      this.cdr.detectChanges()
    })
  }

  loadDir(references: MappedResourceReference[]): DataPackTreeNode[] {
    references = references.sort((a, b) => a.children ? -1 : 1)
    return references.map((reference) => {
      return {
        label: idToLabel(reference.name),
        icon: reference.children !== null ? 'pi pi-folder' : undefined,
        data: { ref: reference.ref },
        type: reference.children !== null ? 'dir' : 'file',
        children: reference.children !== null ? this.loadDir(reference.children) : undefined
      }
    })
  }

  displayName(name: string): string {
    return name.charAt(0).toLocaleUpperCase() + name.substring(1, name.lastIndexOf('.')).replace('_', ' ')
  }

  buildRef(folder: ResourceReference, name: string): ResourceReference {
    return new ResourceReference({ pack: folder.pack, location: `${folder.location === '' ? '' : `${folder.location}/`}${name.trim().toLowerCase().replace(' ', '_')}` })
  }

  getParentNode(ref: ResourceReference): DataPackTreeNode {
    if(ref.location.includes('/')) {
      return this.getFolderNode(ref.folder)
    } else {
      return this.treeRoot
    }
  }

  getNode(ref: ResourceReference): DataPackTreeNode {
    return this.getParentNode(ref).children!.find((node) => node.data!.ref.equals(ref) && node.type === 'file')!
  }

  getFolderNode(ref: ResourceReference): DataPackTreeNode {
    let folder = this.getParentNode(ref).children!.find((node) => node.data!.ref.equals(ref) && node.type === 'dir')
    if(!folder) {
      folder = this.addDir(ref)
    }
    return folder
  }

  title(): string {
    return this.ps.project.name
  }

  selectFolder(folder: FolderType) {
    this.selectedFolder = folder
    this.load()
  }

  nodeExpand(event: any) {
    this.cdr.detectChanges()
  }

  nodeCollapse(event: any) {
    this.cdr.detectChanges()
  }

  openFile(node: DataPackTreeNode) {
    this.ps.openPage({
      path: `${this.selectedFolder.id}:${node.data!.ref.location}`,
      icon: this.selectedFolder.icon,
      label: node.label!,
      data: {
        ref: node.data!.ref
      },
      component: this.selectedFolder.component
    })
  }

  async newEngineer(folder: ResourceReference) {
    let file = (await openInputDialog({
      title: `new ${this.selectedFolder.label}`,
      message: 'The file will be saved as lower_case_no_space.json',
      placeholder: `new_${this.selectedFolder.id}`
    })).value
    console.log(file)

    const ref = this.buildRef(folder, file)

    if(!(await this.ps.project.server.request(`data-pack/${this.selectedFolder.id}/exists`, { ref: ref.toJson() }))) {
      await this.ps.project.server.request(`data-pack/${this.selectedFolder.id}/create`, { ref: ref.toJson() })
    } else {
      openBaseDialog(baseErrorDialog('File Exists', `Could not create new ${this.selectedFolder.id} '${file}', it already exists in the folder ${folder.location}`))
    }
  }

  async newDir(parentFolder: ResourceReference) {
    let folder = (await openInputDialog({
      title: 'New Folder',
      message: 'The folder will be saved as lower_case_no_space',
      placeholder: 'New Folder'
    })).value

    const ref = this.buildRef(parentFolder, folder)

    this.addDir(ref)
  }

  async deleteEngineer(ref: ResourceReference) {
    this.ps.project.server.send(`data-pack/${this.selectedFolder.id}/delete`, { ref: ref })
  }

  addFile(ref: ResourceReference): DataPackTreeNode {
    const parent = this.getParentNode(ref)
    const file: DataPackTreeNode = {
      label: ref.name,
      data: { ref: ref },
      type: 'file'
    }
    parent.children = [...parent.children!, file]
    this.cdr.detectChanges()
    return file
  }

  addDir(ref: ResourceReference): DataPackTreeNode {
    const parent = this.getParentNode(ref)
    const dir: DataPackTreeNode = {
      label: ref.name,
      icon: 'pi pi-folder',
      data: { ref: ref },
      type: 'dir',
      children: []
    }
    parent.children = [...parent.children!, dir]
    this.cdr.detectChanges()
    return dir
  }

  removeFile(ref: ResourceReference) {
    const parent = this.getParentNode(ref)
    parent.children!.splice(parent.children!.findIndex((child) => child.data!.ref.equals(ref) && child.children === undefined), 1)
    this.cdr.detectChanges()
  }
}