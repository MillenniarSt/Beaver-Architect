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

import { ChangeDetectorRef, Component, OnInit, Type, ViewEncapsulation } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { baseErrorDialog, openBaseDialog, openInputDialog } from '../../../dialog/dialogs';
import { NgClass, NgFor } from '@angular/common';
import { StyleComponent } from '../../page/data-pack/style/style.component';
import { StructureComponent } from '../../page/data-pack/structure/structure.component';
import { MappedResourceReference, ResourceReference } from '../../../../client/project/engineer/engineer';
import { idToLabel } from '../../../../client/util';

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
export class DataPackComponent implements OnInit {

  folders: FolderType[] = [
    {
      title: 'Structures',
      label: 'Structure',
      id: 'structure',
      icon: 'assets/icon/structure.svg',
      component: StructureComponent
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

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService) { }

  ngOnInit(): void {
    this.load()
  }

  load(): void {
    this.ps.project.server.request(`data-pack/${this.selectedFolder.id}/get-all`).then((data: string[]) => {
      this.tree = [{
        label: this.selectedFolder.title,
        icon: 'pi pi-folder',
        expanded: true,
        data: { ref: new ResourceReference('') },
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
    return new ResourceReference(`${folder.location}/${name.trim().toLowerCase().replace(' ', '_')}`)
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

  async newFile(node: DataPackTreeNode, folder: ResourceReference) {
    let file = (await openInputDialog({
      title: `new ${this.selectedFolder.label}`,
      message: 'The file will be saved as lower_case_no_space.json',
      placeholder: `new_${this.selectedFolder.id}`
    })).value
    console.log(file)

    const ref = this.buildRef(folder, file)

    if(!(await this.ps.project.server.request(`data-pack/${this.selectedFolder.id}/exists`, { ref: ref.toJson() }))) {
      await this.ps.project.server.request(`data-pack/${this.selectedFolder.id}/create`, { ref: ref.toJson() })
      this.addFile(node, { ref: ref, name: idToLabel(ref.location), children: null })
    } else {
      openBaseDialog(baseErrorDialog('File Exists', `Could not create new ${this.selectedFolder.id} '${file}', it already exists in the folder ${folder.location}`))
    }
  }

  async newDir(node: DataPackTreeNode, parentFolder: ResourceReference) {
    let folder = (await openInputDialog({
      title: 'New Folder',
      message: 'The folder will be saved as lower_case_no_space',
      placeholder: 'New Folder'
    })).value

    const ref = this.buildRef(parentFolder, folder)

    this.addFile(node, {
      ref: ref,
      name: idToLabel(ref.location),
      children: []
    })
  }

  addFile(node: DataPackTreeNode, mapped: MappedResourceReference) {
    node.children = [...node.children ?? [], {
      label: this.displayName(mapped.name),
      icon: mapped.children !== null ? 'pi pi-folder' : undefined,
      data: { ref: mapped.ref },
      type: mapped.children !== null ? 'dir' : 'file',
      children: mapped.children !== null ? this.loadDir(mapped.children) : undefined
    }]
    this.cdr.detectChanges()
  }
}