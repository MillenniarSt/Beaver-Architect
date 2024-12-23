import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Material, MaterialGroup, ProjectService } from '../../../services/project.service';
import { max, Subject } from 'rxjs';
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
  type: string,
  fromImplementations: string[]
}

export type PatternItem = {
  id: string,
  type: string,
  fromImplementations: string[],
  materials: MaterialItem[],
  preview?: string[][]
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
  materials: Material[]

  @Input() index!: number
  ref!: string

  isAbstract: boolean = false
  implementations: StyleImplementation[] = []
  patterns: Pattern[] = []

  possibleImplementations: StyleImplementation[] = []

  implementationResearch: string = ''

  newPattern?: string
  selected?: PatternItem
  zoom: number = 5
  editing?: {
    label: string
  }

  editingMaterialIndex?: number

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService) {
    this.materials = Object.entries(this.ps.materials).map((entry) => entry[1])
  }

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
      data.forEach((style: { ref: string, update: any }) => {
        if (style.ref === this.ref) {
          this.isAbstract = style.update.isAbstract ?? this.isAbstract

          if (style.update.implementations) {
            style.update.implementations.forEach((implementation: any) => {
              if (implementation.mode === 'push') {
                this.implementations.push(implementation.data)
              } else if (implementation.mode === 'delete') {
                this.implementations.splice(this.implementations.findIndex((imp) => imp.pack === implementation.pack && imp.location === implementation.location), 1)
              }
              this.searchForImplementations()
            })
          }

          if (style.update.patterns) {
            style.update.patterns.forEach((pattern: any) => {
              if (pattern.mode === 'push') {
                this.patterns.push({ id: pattern.id, type: pattern.data.type, fromImplementations: pattern.data.fromImplementations })
              } else if (pattern.mode === 'delete') {
                this.patterns.splice(this.patterns.findIndex((pt) => pt.id === pattern.id), 1)
                if (pattern.id === this.selected?.id) {
                  this.selected = undefined
                }
              } else if (pattern.data) {
                if (pattern.data.id) {
                  this.patterns.find((p) => p.id === pattern.id)!.id = pattern.data.id
                  if (this.selected && pattern.id === this.selected.id) {
                    this.selected.id = pattern.data.id
                  }
                }
                if (pattern.data.type) {
                  this.patterns.find((p) => p.id === pattern.id)!.type = pattern.data.type
                  if (this.selected && pattern.id === this.selected.id) {
                    this.selected.type = pattern.data.type
                  }
                }
                if (pattern.data.materials && this.selected!.id === pattern.id) {
                  this.updatePattern(pattern.id)
                }
              }
            })
          }
          this.cdr.detectChanges()
        }
      })
    }, this.destroy$)
  }

  async updatePattern(id: string) {
    const data = await this.ps.server.request('data-pack/styles/get-pattern', { ref: this.ref, id: id })
    if (this.selected && this.selected.id === id) {
      let totalWeight = 0
      data.materials.forEach((material: any) => totalWeight += material.weight)
      this.selected.materials = data.materials.map((material: any) => {
        return {
          id: material.id,
          weight: material.weight,
          size: material.size,
          icon: this.ps.materials[material.id].icon,
          percent: material.weight / totalWeight * 100
        }
      })
      this.cdr.detectChanges()

      this.updatePatternPreview(id)
    }
  }

  async updatePatternPreview(id: string | undefined = this.selected?.id) {
    if (this.selected && this.selected.id === id) {
      const previewData = await this.ps.server.request('data-pack/styles/generate-pattern', { ref: this.ref, pattern: id, size: [1, this.zoom, this.zoom * 4] })
      const preview = await this.ps.architect.request('data-pack/materials/textures', { materials: previewData[0] })
      this.selected.preview = preview
      this.cdr.detectChanges()
    }
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

  setZoom(zoom: number) {
    this.zoom = Math.max(zoom, 1)
    this.updatePatternPreview()
  }

  textureOpacity(index: number): number {
    if (index <= this.zoom) {
      return 0
    } else if (index >= this.zoom * 2.5) {
      return 1
    }
    return (this.zoom * 1.5 / (index - this.zoom)) + ((Math.random() * 0.4) - 0.2)
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
      this.selected = { id: pattern.id, type: pattern.type, fromImplementations: pattern.fromImplementations, materials: [] }
      this.updatePattern(pattern.id)
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
    if (material === null) {
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
}