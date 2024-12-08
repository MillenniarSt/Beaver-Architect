import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchBarComponent } from "../simple/search-bar.component";

export type PGroup = {
  label: string,
  icon: string,
  children: PElement[]
}

export type PElement = {
  id: string,
  label: string,
  icon: string
}

@Component({
  selector: 'element-picker',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, SearchBarComponent],
  templateUrl: './element-picker.component.html',
  styleUrl: './element-picker.component.css'
})
export class ElementPickerComponent {

  @Output() pick = new EventEmitter<PElement | null>()

  @Input() groups: PGroup[] = []
  @Input() elements: PElement[] = []
  @Input() research: string = ''

  @Input() value?: string | null
  @Input() nullable: boolean = false

  groupIndex: number = -1

  constructor(private cdr: ChangeDetectorRef) { }

  setGroup(index: number) {
    this.groupIndex = index
    this.cdr.detectChanges()
  }

  getElements(): PElement[] {
    return (this.groupIndex < 0 ? this.elements : this.groups[this.groupIndex].children).filter((element) => element.label.toLocaleLowerCase().includes(this.research.trim().toLocaleLowerCase()))
  }

  search(research: string) {
    this.research = research
    this.cdr.detectChanges()
  }

  click(element: PElement | null) {
    if(this.value !== undefined) {
      this.value = element ? element.id : null
      this.cdr.detectChanges()
    }
    this.pick.emit(element)
  }

  trackByFn(index: number, item: any): string {
    return item.id;
  }
}
