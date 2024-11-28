import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { Subject } from 'rxjs';
import { NgFor } from '@angular/common';
import { architectsDir } from '../../../paths';
import { MaterialItem, StyleMaterialComponent } from './style-material.component';

export type Material = {
  id: string,
  weight: number,
  size?: number
}

@Component({
  selector: 'page-style',
  standalone: true,
  imports: [NgFor, StyleMaterialComponent],
  templateUrl: './style.component.html',
  styleUrl: './style.component.css'
})
export class StyleComponent implements OnInit, OnDestroy {

  @Input() index!: number

  ref!: string

  patterns: { id: string, materials: Material[] }[] = []

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService) { }

  private destroy$ = new Subject<void>()

  ngOnInit(): void {
    const path = this.ps.getPage(this.index).data.path
    this.ref = path.substring(17, path.lastIndexOf('.'))
    this.ps.server.request('data-pack/styles/open', { ref: this.ref }).then((data) => {
      console.log(data)
      this.patterns = data.patterns
      this.cdr.detectChanges()
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  get materialsItems(): { id: string, materials: MaterialItem[] }[] {
    return this.patterns.map((pattern) => {
      let totalWeight = 0
      pattern.materials.forEach((material) => totalWeight += material.weight)
      return {
        id: pattern.id, materials: pattern.materials.map((material) => {
          return {
            id: material.id,
            weight: material.weight,
            size: material.size,
            icon: `${architectsDir}\\${this.ps.architectData.identifier}\\resources\\materials\\${material.id}`,
            percent: material.weight / totalWeight * 100
          }
        })
      }
    })
  }

  trackByFn(index: number, item: any): string {
    return item.id;
  }
}
