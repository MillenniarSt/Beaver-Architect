import { ChangeDetectorRef, Component, OnInit, Type, ViewEncapsulation } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { SchematicComponent } from '../../page/schematic/schematic.component';
import { baseErrorDialog, openBaseDialog, openInputDialog } from '../../../dialog/dialogs';
import { NgClass, NgFor } from '@angular/common';
import { StyleComponent } from '../../page/style/style.component';
import { PluginDirection, PluginsService } from '../../../services/http/plugin.service';
import { ServerService } from '../../../services/http/server.service';

type File = {
  name: string,
  path: string,
  children?: File[]
}

type FolderType = {
  title: string,
  folder: string,
  icon: string,
  component: Type<any>
}

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
      title: 'Schematics',
      folder: 'schematics',
      icon: 'assets/icon/schematic.svg',
      component: SchematicComponent
    },
    {
      title: 'Styles',
      folder: 'styles',
      icon: 'assets/icon/style.svg',
      component: StyleComponent
    }
  ]
  selectedFolder: FolderType = this.folders[0]

  tree: TreeNode[] = []

  constructor(private cdr: ChangeDetectorRef, private server: ServerService, private ps: ProjectService, private plugins: PluginsService) { }

  ngOnInit(): void {
    this.load()
  }

  load(): void {
    const mainDir = `projects\\${this.ps.project.identifier}\\data_pack\\${this.selectedFolder.folder}`

    this.server.get('file/read-all-dir', { path: mainDir, relPaths: 'true' }, this, (entries) => {
      this.tree = [{
        label: this.selectedFolder.title,
        icon: 'pi pi-folder',
        expanded: true,
        data: {
          name: this.selectedFolder.folder,
          path: mainDir
        },
        type: 'dir',
        children: this.loadDir(entries)
      }]

      this.cdr.detectChanges()
    })
  }

  loadDir(files: File[]): TreeNode[] {
    files = files.sort((a, b) => a.children ? -1 : 1)
    return files.map((file) => {
      return {
        label: this.displayName(file.name),
        icon: file.children !== undefined ? 'pi pi-folder' : undefined,
        data: {
          name: file.name,
          path: file.path
        },
        type: file.children !== undefined ? 'dir' : 'file',
        children: file.children !== undefined ? this.loadDir(file.children) : undefined
      }
    })
  }

  displayName(name: string): string {
    return name.charAt(0).toLocaleUpperCase() + name.substring(1, name.lastIndexOf('.')).replace('_', ' ')
  }

  fileName(name: string, extension: string = ''): string {
    return name.trim().toLowerCase().replace(' ', '_') + extension
  }

  title(): string {
    return this.ps.project.name
  }

  selectFolder(folder: FolderType) {
    this.selectedFolder = folder
    this.load()
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
      icon: this.selectedFolder.icon,
      label: node.label!,
      data: {
        path: node.data.path
      },
      component: this.selectedFolder.component
    })
  }

  async newFile(node: TreeNode, folder: string) {
    let file = await openInputDialog({
      title: 'New File',
      message: 'The file will be saved as lower_case_no_space.json',
      placeholder: 'new_file'
    })

    file = this.fileName(file, '.json')
    const path = `${folder}\\${file}`

    this.server.get('file/exists', { path: path }, this, (exists) => {
      if (!exists) {
        this.plugins.get(PluginDirection.ARCHITECT, 'data-pack/schematics/new', {}, this, async (data) => {
          this.server.post('file/write-json', { path: path, data: data }, this, () => {
            this.addFile(node, {
              name: file,
              path: path
            })
          })
        })
        
      } else {
        openBaseDialog(baseErrorDialog('File Exists', `Could not create new file ${file}, it already exists in the folder ${folder}`))
      }
    })
  }

  async newDir(node: TreeNode, parentFolder: string) {
    let folder = await openInputDialog({
      title: 'New Folder',
      message: 'The folder will be saved as lower_case_no_space',
      placeholder: 'New Folder'
    })

    folder = this.fileName(folder)
    const path = `${parentFolder}\\${folder}`

    this.server.get('file/exists', { path: path }, this, (exists) => {
      if (!exists) {
        this.server.post('file/mkdirs', { path: path }, this, () => {
          this.addFile(node, {
            name: folder,
            path: path,
            children: []
          })
        })
      } else {
        openBaseDialog(baseErrorDialog('Folder Exists', `Could not create new folder ${folder}, it already exists in the folder ${parentFolder}`))
      }
    })
  }

  addFile(node: TreeNode, file: File) {
    node.children = [...node.children ?? [], {
      label: this.displayName(file.name),
      icon: file.children !== undefined ? 'pi pi-folder' : undefined,
      data: {
        name: file.name,
        path: file.path
      },
      type: file.children !== undefined ? 'dir' : 'file',
      children: file.children !== undefined ? this.loadDir(file.children) : undefined
    }]
    this.cdr.detectChanges()
  }
}