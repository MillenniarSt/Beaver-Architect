import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { Subject } from 'rxjs';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { architectsDir } from '../../../paths';
import { SplitterModule } from 'primeng/splitter';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';

export type Pattern = {
  id: string
}

export type PatternItem = {
  id: string,
  materials: Material[]
}

export type Material = {
  id: string,
  weight: number,
  size?: number,

  icon: string,
  percent: number
}

@Component({
  selector: 'page-style',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, SplitterModule, NgStyle, FormsModule, DropdownModule, InputNumberModule],
  templateUrl: './style.component.html',
  styleUrl: './style.component.css'
})
export class StyleComponent implements OnInit, OnDestroy {

  @Input() index!: number
  ref!: string

  patterns: Pattern[] = []

  selected?: PatternItem

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService) { }

  private destroy$ = new Subject<void>()

  ngOnInit(): void {
    const path = this.ps.getPage(this.index).data.path
    this.ref = path.substring(17, path.lastIndexOf('.'))
    this.ps.server.request('data-pack/styles/get', { ref: this.ref }).then((data) => {
      this.patterns = data.patterns
      this.cdr.detectChanges()
    })

    this.ps.server.listen('data-pack/styles/update', (data) => {
      console.log('Update', data)
      if (data.ref === this.ref) {
        data.updates.map((update: any) => {
          if (update.mode === 'push') {
            this.patterns.push({ id: update.id })
          } else if (update.mode === 'delete') {
            this.patterns.splice(this.patterns.findIndex((pattern) => pattern.id === update.id), 1)
          } else {
            if (update.materials && this.selected?.id === update.id) {
              this.ps.server.request('data-pack/styles/get-pattern', { ref: this.ref, pattern: update.id })
            }
          }
        })
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

  createPattern() {
    this.ps.server.send('data-pack/styles/create-pattern', { ref: this.ref, id: 'pattern' })
  }

  deletePattern(id: string) {
    this.ps.server.send('data-pack/styles/delete-pattern', { ref: this.ref, id: id })
  }

  select(id?: string) {
    if (!id || this.selected?.id === id) {
      this.selected = undefined
      this.cdr.detectChanges()
    } else {
      this.selected = { id: id, materials: [] }
      this.ps.server.request('data-pack/styles/get-pattern', { ref: this.ref, pattern: id })
      this.cdr.detectChanges()
    }
  }

  isSelected(id: string): boolean {
    return id === this.selected?.id
  }

  trackByFn(index: number, item: any): string {
    return item.id;
  }
}
