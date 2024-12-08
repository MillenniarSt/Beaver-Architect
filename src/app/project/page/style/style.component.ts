import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Material, MaterialGroup, ProjectService } from '../../../services/project.service';
import { Subject } from 'rxjs';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { architectsDir } from '../../../paths';
import { SplitterModule } from 'primeng/splitter';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { FormDataOutput } from '../../../components/form/form.component';
import { HiddenInputComponent } from "../../../components/simple/hidden-input.component";
import { ElementPickerComponent } from "../../../components/element-picker/element-picker.component";
import { SearchBarComponent } from "../../../components/simple/search-bar.component";

export type StyleImplementation = {
  pack?: string,
  location: string
}

export type Pattern = {
  id: string,
  type: string
}

export type PatternItem = {
  id: string,
  type: string,
  materials: MaterialItem[]
}

export type MaterialItem = {
  id: string,
  weight: number,
  size?: number,

  icon: string,
  percent: number
}

@Component({
  selector: 'page-style',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, SplitterModule, NgStyle, FormsModule, DropdownModule, InputNumberModule, InputIconModule, IconFieldModule, InputTextModule, HiddenInputComponent, ElementPickerComponent, SearchBarComponent],
  templateUrl: './style.component.html',
  styleUrl: './style.component.css'
})
export class StyleComponent implements OnInit, OnDestroy {

  readonly patternTypes = [
    { name: 'Basic', code: 'basic' }
  ]

  @Input() index!: number
  ref!: string

  isAbstract: boolean = false
  implementations: StyleImplementation[] = []
  patterns: Pattern[] = []

  possibleImplementations: StyleImplementation[] = []

  implementationResearch: string = ''

  newPattern?: string
  selected?: PatternItem
  editing?: {
    label: string
  }

  editingMaterialIndex?: number

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService) { }

  private destroy$ = new Subject<void>()

  ngOnInit(): void {
    const path = this.ps.getPage(this.index).data.path
    this.ref = path.substring(17, path.lastIndexOf('.'))
    this.ps.server.request('data-pack/styles/get', { ref: this.ref }).then((data) => {
      this.patterns = data.patterns
      this.implementations = data.implementations
      this.isAbstract = data.isAbstract
      this.searchForImplementations()
    })

    this.ps.server.listen('data-pack/styles/update', (data) => {
      console.log('Update', data)
      if (data.ref === this.ref) {
        this.isAbstract = data.update.isAbstract ?? this.isAbstract

        if(data.update.implementations) {
          data.update.implementations.forEach((implementation: any) => {
            if(implementation.mode === 'push') {
              this.implementations.push(implementation.data)
            } else if(implementation.mode === 'delete') {
              this.implementations.splice(this.implementations.findIndex((imp) => imp.pack === implementation.pack && imp.location === implementation.location), 1)
            }
            this.searchForImplementations()
          })
        }

        if(data.update.patterns) {
          data.update.patterns.forEach((pattern: any) => {
            if (pattern.mode === 'push') {
              this.patterns.push({ id: pattern.id, type: pattern.type })
            } else if (pattern.mode === 'delete') {
              this.patterns.splice(this.patterns.findIndex((pt) => pt.id === pattern.id), 1)
              if(pattern.id === this.selected?.id) {
                this.selected = undefined
              }
            } else {
              if(pattern.newId) {
                this.patterns.find((pattern) => pattern.id === pattern.id)!.id = pattern.newId
                if(this.selected && pattern.id === this.selected.id) {
                  this.selected.id = pattern.newId
                }
              }
              if(pattern.type) {
                this.patterns.find((pattern) => pattern.id === pattern.id)!.type = pattern.type
                if(this.selected && pattern.id === this.selected.id) {
                  this.selected.type = pattern.type
                }
              }
              if (pattern.materials && this.selected?.id === pattern.id) {
                this.ps.server.request('data-pack/styles/get-pattern', { ref: this.ref, pattern: pattern.id })
              }
            }
          })
        }
        this.cdr.detectChanges()
      }
    }, this.destroy$)

    this.ps.server.listen('data-pack/styles/update-client', (data) => {
      console.log('Update Client', data)
      if (data.ref === this.ref) {
        if (this.selected && data.client.materials) {
          let totalWeight = 0
          data.client.materials.forEach((material: any) => totalWeight += material.weight)
          this.selected.materials = data.client.materials.map((material: any) => {
            return {
              id: material.id,
              weight: material.weight,
              size: material.size,
              icon: `${architectsDir}\\${this.ps.architectData.identifier}\\resources\\materials\\${material.id}`,
              percent: material.weight / totalWeight * 100
            }
          })
          console.log(this.selected.materials)
        }
        this.cdr.detectChanges()
      }
    }, this.destroy$)
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  displayId(name: string): string {
    return name.charAt(0).toLocaleUpperCase() + name.substring(1).replace('_', ' ')
  }

  idName(name: string): string {
    return name.trim().toLowerCase().replace(' ', '_')
  }

  materialLabel(id: string): string {
    return this.ps.materials[id].label
  }

  edit(changes: {}) {
    this.ps.server.send('data-pack/styles/edit', { ref: this.ref, changes: changes })
  }

  searchForImplementations(research?: string) {
    this.implementationResearch = research ?? this.implementationResearch
    this.ps.server.request('data-pack/styles/possible-implementations', { ref: this.ref, research: this.idName(this.implementationResearch.trim()) }).then((data) => {
      this.possibleImplementations = data
      this.cdr.detectChanges()
    })
  }

  pushImplementation(implementation: StyleImplementation) {
    this.ps.server.send('data-pack/styles/push-implementation', { ref: this.ref, implementation: { pack: implementation.pack, location: implementation.location } })
  }

  deleteImplementation(implementation: StyleImplementation) {
    this.ps.server.send('data-pack/styles/delete-implementation', { ref: this.ref, implementation: { pack: implementation.pack, location: implementation.location } })
  }

  setNewPattern(value?: string) {
    this.newPattern = value
    this.cdr.detectChanges()
  }

  createPattern(id: string) {
    this.setNewPattern(undefined)
    this.ps.server.send('data-pack/styles/create-pattern', { ref: this.ref, id: this.idName(id) })
  }

  editPattern() {
    this.ps.server.send('data-pack/styles/edit-pattern', { ref: this.ref, id: this.selected!.id, changes: { id: this.idName(this.editing!.label) } })
    this.editing = undefined
    this.cdr.detectChanges()
  }

  deletePattern(id: string) {
    this.ps.server.send('data-pack/styles/delete-pattern', { ref: this.ref, id: id })
  }

  select(pattern?: Pattern) {
    this.editing = undefined
    if (!pattern || this.selected?.id === pattern.id) {
      this.selected = undefined
      this.cdr.detectChanges()
    } else {
      this.selected = { id: pattern.id, type: pattern.type, materials: [] }
      this.ps.server.request('data-pack/styles/get-pattern', { ref: this.ref, pattern: pattern.id })
      this.cdr.detectChanges()
    }
  }

  isSelected(id: string): boolean {
    return id === this.selected?.id
  }

  startEditEditing() {
    this.editing = {
      label: this.displayId(this.selected!.id)
    }
    this.cdr.detectChanges()
  }

  trackByFn(index: number, item: any): string {
    return item.id;
  }

  addMaterial() {
    this.ps.server.send('data-pack/styles/add-material', { ref: this.ref, pattern: this.selected!.id })
  }

  changeMaterial(index: number, material: Material | null) {
    if(material === null) {
      this.deleteMaterial(index)
    } else {
      this.editMaterial(index, { id: material.id })
    }
  }

  editMaterial(index: number, changes: FormDataOutput) {
    this.ps.server.send('data-pack/styles/edit-material', { ref: this.ref, pattern: this.selected!.id, index: index, changes: changes })
  }

  deleteMaterial(index: number) {
    this.ps.server.send('data-pack/styles/delete-material', { ref: this.ref, pattern: this.selected!.id, index: index })
  }

  clickMaterial(index: number) {
    this.editingMaterialIndex = this.editingMaterialIndex === index ? undefined : index
    this.cdr.detectChanges()
  }

  get editingMaterial(): MaterialItem {
    return this.selected!.materials[this.editingMaterialIndex!]
  }

  toNumber(string: string): number {
    return Number(string)
  }

  get groups(): MaterialGroup[] {
    return this.ps.materialGroups
  }

  get materials(): Material[] {
    return Object.entries(this.ps.materials).map((entry) => entry[1])
  }
}