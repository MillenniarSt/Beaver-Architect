import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'plain-file',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './plain-file.component.html',
  styleUrl: './plain-file.component.css'
})
export class PlainFileComponent implements OnInit, OnChanges {

  @Input() index!: number

  oldIndex?: number
  text: string = 'Reading...'

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService) { }

  get name(): string {
    return this.ps.getPage(this.index).data.name
  }

  get path(): string {
    return this.ps.getPage(this.index).data.path
  }

  get isSaved(): boolean {
    return this.ps.getPage(this.index).isSaved ?? true
  }

  ngOnInit(): void {
    this.loadText()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.oldIndex !== this.index) {
      this.loadText()
    }
  }

  async loadText() {
    this.text = await this.ps.server.request('file/read-text', { path: this.path })

    this.oldIndex = this.index
    this.ps.getPage(this.index).save = this.save

    this.cdr.detectChanges()
  }

  change() {
    this.ps.getPage(this.index).isSaved = false
    this.cdr.detectChanges()
  }

  save(): void {
    this.ps.server.send('file/write-text', { path: this.path, data: this.text })

    this.ps.getPage(this.index).isSaved = true
    this.cdr.detectChanges()
  }
}
