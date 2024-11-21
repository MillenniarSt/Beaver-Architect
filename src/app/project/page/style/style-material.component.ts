import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { NgFor, NgStyle } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

export type MaterialItem = {
  id: string,
  weight: number,
  size?: number,

  icon: string,
  percent: number
}

@Component({
  selector: 'page-style-material',
  standalone: true,
  imports: [NgFor, NgStyle, FormsModule, DropdownModule, InputNumberModule],
  templateUrl: './style-material.component.html'
})
export class StyleMaterialComponent {

  @Input() id!: string
  @Input() materials: MaterialItem[] = []

  @Input() ref!: string

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService) { }

  displayId(id: string): string {
    return id.charAt(0).toLocaleUpperCase() + id.substring(1).replace('_', ' ')
  }

  materialPercentWidth(percent: number): string {
    return `w-[${Math.round(percent)}%]`
  }

  trackByFn(index: number, item: any): string {
    return item.id;
  }
}
