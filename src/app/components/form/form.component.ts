//             _____
//         ___/     \___        |  |
//      ##/  _.- _.-    \##  -  |  |                       -
//      ##\#=_  '    _=#/##  |  |  |  /---\  |      |      |   ===\  |  __
//      ##   \\#####//   ##  |  |  |  |___/  |===\  |===\  |   ___|  |==/
//      ##       |       ##  |  |  |  |      |   |  |   |  |  /   |  |
//      ##       |       ##  |  \= \= \====  |   |  |   |  |  \___/  |
//      ##\___   |   ___/
//      ##    \__|__/
//

import { NgComponentOutlet, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormDataInput } from './inputs/inputs';
import { Fluid } from 'primeng/fluid'

@Component({
  selector: 'form-util',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, NgComponentOutlet, Fluid],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit {

  @Input() formData!: FormDataInput

  @Output() edit = new EventEmitter<any>()

  form: FormGroup = new FormGroup({})

  ngOnInit() {
    this.form = this.formData.buildFormGroup()
  }

  trackById(index: number, item: any): string {
    return item.id
  }
}
