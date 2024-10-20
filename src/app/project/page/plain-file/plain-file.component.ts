import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ProjectService } from '../../../services/project.service';
import { ServerService } from '../../../services/http/server.service';
import { dir } from '../../../../paths';

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

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService, private server: ServerService) { }

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
    if(this.oldIndex !== this.index) {
      this.loadText()
    }
  }

  loadText(): void {
    this.server.get('file/read-text', { path: this.path.substring(dir.length +1) }, this, (text) => {
      this.text = text

      this.oldIndex = this.index
      this.ps.getPage(this.index).save = this.save

      this.cdr.detectChanges()
    })
  }

  change() {
    this.ps.getPage(this.index).isSaved = false
    this.cdr.detectChanges()
  }

  save(): void {
    this.server.post('file/write-text', { path: this.path.substring(dir.length +1), data: this.text }, this, () => {
      this.ps.getPage(this.index).isSaved = true
      this.cdr.detectChanges()
    })
  }
}
