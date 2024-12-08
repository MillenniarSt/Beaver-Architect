import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'hidden-input',
  standalone: true,
  imports: [],
  template: `
    <input #inputField type="text" class="input-void" [placeholder]="placeholder" [value]="value" (keyup.enter)="onEnter(inputField.value)" (blur)="onBlur()">
  `
})
export class HiddenInputComponent implements AfterViewInit {

  @Output() submit = new EventEmitter<string>()
  @Output() clickOutside = new EventEmitter<void>()

  @Input() value: string = ''
  @Input() placeholder: string = ''

  @ViewChild('inputField') inputField!: ElementRef<HTMLInputElement>

  private isInitialized = false

  constructor(private elRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.inputField.nativeElement.focus()
    setTimeout(() => {
      this.isInitialized = true
    })
  }

  onEnter(value: string) {
    this.submit.emit(value)
  }

  onBlur() {
    this.clickOutside.emit()
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (this.isInitialized && !this.elRef.nativeElement.contains(event.target)) {
      this.clickOutside.emit()
    }
  }
}
