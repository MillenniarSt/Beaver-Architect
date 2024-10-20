import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectBar } from '../types';
import { NgClass, NgComponentOutlet, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'sidebars',
  standalone: true,
  imports: [NgIf, NgFor, NgComponentOutlet, NgClass],
  templateUrl: './sidebars.component.html',
  styleUrl: './sidebars.component.css'
})
export class SidebarsComponent {

  @Input() bars: ProjectBar[] = []

  @Input() selectIndex: number = 0
  @Input() expanded: boolean = true

  @Output() extend = new EventEmitter<number>()

  constructor(private cdr: ChangeDetectorRef) { }

  select(index: number): void {
    if (this.expanded) {
      if (this.selectIndex === index) {
        this.extend.emit(-1)
      } else {
        this.selectIndex = index
        this.cdr.detectChanges()
      }
    } else {
      this.extend.emit(index)
    }
  }
}
