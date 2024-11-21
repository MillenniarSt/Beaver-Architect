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

  materials: Record<string, Material[]> = {
    test: [
      {
        id: 'oak',
        weight: 1
      },
      {
        id: 'spruce',
        weight: 2
      }
    ]
  }

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService) { }

  private destroy$ = new Subject<void>()

  ngOnInit(): void {
    const path = this.ps.getPage(this.index).data.path
    this.ref = path.substring(17, path.lastIndexOf('.'))
    console.log(this.materialsItems)
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  get materialsItems(): { id: string, materials: MaterialItem[] }[] {
    return Object.entries(this.materials).map((entry) => {
      let totalWeight = 0
      entry[1].forEach((material) => totalWeight += material.weight)
      return {
        id: entry[0], materials: entry[1].map((material) => {
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
