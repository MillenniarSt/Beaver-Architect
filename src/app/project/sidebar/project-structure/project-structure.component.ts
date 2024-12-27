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

import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { ProjectService } from '../../../services/project.service';
import { NgIf } from '@angular/common';
import { baseErrorDialog, openBaseDialog, openInputDialog } from '../../../dialog/dialogs';
import { PlainFileComponent } from '../../page/plain-file/plain-file.component';

type File = {
  name: string,
  path: string,
  children?: File[]
}

@Component({
  selector: 'project-structure',
  standalone: true,
  imports: [TreeModule, NgIf],
  templateUrl: './project-structure.component.html',
  styleUrl: './project-structure.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ProjectStructureComponent implements OnInit {

  @Input() tree: TreeNode[] = []

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService) { }

  ngOnInit(): void {
    this.loadProject()
  }

  loadProject(): void {
    this.ps.server.request('file/map-dir', { path: '' }).then((data) => {
      this.tree = this.loadDir(data)

      this.cdr.detectChanges()
    })
  }

  loadDir(files: File[]): TreeNode[] {
    files = files.sort((a, b) => a.children ? -1 : 1)
    return files.map((file) => {
      return {
        label: file.name,
        icon: file.children !== undefined ? 'pi pi-folder' : 'pi pi-file',
        data: {
          path: file.path
        },
        type: file.children !== undefined ? 'dir' : 'file',
        children: file.children !== undefined ? this.loadDir(file.children) : undefined
      }
    })
  }

  title(): string {
    return this.ps.project.name
  }

  nodeExpand(event: any) {
    this.cdr.detectChanges();
  }

  nodeCollapse(event: any) {
    this.cdr.detectChanges();
  }

  openFile(node: TreeNode) {
    this.ps.openPage({
      path: node.data.path,
      icon: 'assets/icon/file.svg',
      label: node.label!,
      data: {
        name: node.label,
        path: node.data.path
      },
      component: PlainFileComponent
    })
  }

  async newFile(node: TreeNode, folder: string) {
    let file = await openInputDialog({
      title: 'New File',
      message: 'The file should be lower_case_no_space.json',
      placeholder: 'new_file'
    })

    const path = `${folder}\\${file}`

    if(!(await this.ps.server.request('file/exists', { path: path }))) {
      this.ps.server.send('file/write-text', { path: path, data: '' })
      this.addFile(node, {
        name: file,
        path: path
      })
    } else {
      openBaseDialog(baseErrorDialog('File Exists', `Could not create new file ${file}, it already exists in the folder ${folder}`))
    }
  }

  async newDir(node: TreeNode, parentFolder: string) {
    let folder = await openInputDialog({
      title: 'New Folder',
      message: 'The folder should be lower_case_no_space',
      placeholder: 'new_folder'
    })

    const path = `${parentFolder}\\${folder}`

    if(!(await this.ps.server.request('file/exists', { path: path }))) {
      this.ps.server.send('file/mkdirs', { path: path })
      this.addFile(node, {
        name: folder,
        path: path,
        children: []
      })
    } else {
      openBaseDialog(baseErrorDialog('Folder Exists', `Could not create new folder ${folder}, it already exists in the folder ${parentFolder}`))
    }
  }

  addFile(node: TreeNode, file: File) {
    node.children = [...node.children ?? [], {
      label: file.name,
      icon: file.children !== undefined ? 'pi pi-folder' : 'pi pi-file',
      data: {
        path: file.path
      },
      type: file.children !== undefined ? 'dir' : 'file',
      children: file.children !== undefined ? this.loadDir(file.children) : undefined
    }]
  }
}
