import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ElementNode, SceneService } from '../../../services/scene.service';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { NgClass, NgIf } from '@angular/common';
import { SchematicUpdate } from './schematic.component';
import { ProjectService } from '../../../services/project.service';
import { DragDropModule } from 'primeng/dragdrop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'schematic-tree',
  standalone: true,
  imports: [TreeModule, NgClass, NgIf, DragDropModule, CommonModule],
  templateUrl: './schematic-tree.component.html',
  styleUrl: './schematic-tree.component.css',
  encapsulation: ViewEncapsulation.None
})
export class SchematicTreeComponent implements OnInit {

  @Input() ref!: string
  @Input() title: string = 'Schematic'
  @Input() nodes: ElementNode[] = []

  elementsTree: TreeNode[] = []
  private elementsMap: Map<string, TreeNode> = new Map()

  selection: string[]

  constructor(
    private cdr: ChangeDetectorRef,
    private ps: ProjectService,
    private scene: SceneService<SchematicUpdate>
  ) {
    this.selection = scene.selection
  }

  ngOnInit(): void {
    this.scene.onUpdate((update) => {
      if (update.node) {
        const node = this.buildElementNode(update.node)
        const parent = update.parent ? this.elementsMap.get(update.parent) : undefined
        if (parent) {
          parent.children!.push(node)
        } else {
          this.elementsTree.push(node)
        }
        this.cdr.detectChanges()
      }
    }, 'push')

    this.scene.onUpdate((update, id) => {
      const parent = this.elementsMap.get(id)!.parent
      if (parent) {
        parent.children!.splice(parent.children!.findIndex((child) => child.data === id), 1)
        this.cdr.detectChanges()
      } else {
        const index = this.elementsTree.findIndex((child) => child.data === id)
        if(index !== -1) {
          this.elementsTree.splice(this.elementsTree.findIndex((child) => child.data === id), 1)
          this.cdr.detectChanges()
        }
      }
      this.elementsMap.delete(id)
    }, 'delete')

    this.scene.onUpdate((update, id) => {
      if (update.node) {
        const node = this.elementsMap.get(id)!
        node.label = update.node.label
        node.type = update.node.isGroup ? 'group' : 'element'
        node.data = update.node.id
        node.children = update.node.children ? update.node.children.map((element) => this.buildElementNode(element)) : []
        this.cdr.detectChanges()
      }
      if (update.parent !== undefined) {
        const node = this.elementsMap.get(id)!
        const oldParentChildren = node.parent?.children ?? this.elementsTree
        oldParentChildren.splice(oldParentChildren.indexOf(node), 1)
        const parentChildren = update.parent ? this.elementsMap.get(update.parent)!.children : this.elementsTree
        parentChildren!.push(node)
        this.cdr.detectChanges()
      }
    })

    this.scene.selectionMessage.subscribe((selection) => {
      this.selection = selection
      this.cdr.detectChanges()
    })

    this.elementsTree = this.nodes.map((nodeRaw) => {
      const node = this.buildElementNode(nodeRaw)
      node.expanded = true
      return node
    })
    this.cdr.detectChanges()
  }

  dragged: TreeNode | undefined | null

  dragStart(node: TreeNode) {
    this.dragged = node
    console.log('drag', this.dragged)
  }

  drop(node: TreeNode) {
    console.log('drop', node, this.dragged)
    if (this.dragged) {
      this.ps.server.send('data-pack/schematics/move-elements', { ref: this.ref, ids: [this.dragged.data], parent: node.data })
      this.dragged = null
    }
  }

  dragEnd() {
    console.log('drag-end', this.dragged)
    this.dragged = null
  }

  private buildElementNode(element: ElementNode): TreeNode {
    this.elementsMap.set(element.id, element)
    return {
      label: element.label,
      type: element.isGroup ? 'group' : 'element',
      data: element.id,
      children: element.children ? element.children.map((element) => this.buildElementNode(element)) : []
    }
  }

  nodeExpand(event: any) {
    this.cdr.detectChanges()
  }

  nodeCollapse(event: any) {
    this.cdr.detectChanges()
  }

  isSelected(node: TreeNode): boolean {
    return this.selection.includes(node.data)
  }

  select(id: string) {
    this.scene.selectOrClear(id)
  }

  deleteElement(node: TreeNode) {
    this.scene.addToSelection(node.data)
    this.ps.server.send('data-pack/schematics/delete-elements', { ref: this.ref, ids: this.scene.selection })
  }

  inGroup(node: TreeNode) {
    this.scene.addToSelection(node.data)
    this.ps.server.send('data-pack/schematics/in-group', { ref: this.ref, ids: this.scene.selection, in: node.data })
  }
}