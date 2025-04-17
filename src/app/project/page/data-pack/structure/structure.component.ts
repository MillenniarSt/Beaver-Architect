import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ProjectService } from '../../../../services/project.service';
import { StructureEngineerEditor } from './rete/editor';
import { BuilderNode } from './rete/nodes/builder';
import { getBuilderType } from './types';

@Component({
  imports: [],
  templateUrl: './structure.component.html',
  styleUrl: './structure.component.css'
})
export class StructureComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild("rete") container!: ElementRef

  @Input() index!: number
  ref!: string

  protected editor!: StructureEngineerEditor

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService, private injector: Injector) { }

  ngOnInit(): void {
    const path = this.ps.getPage(this.index).data.path
    this.ref = path.substring(21, path.lastIndexOf('.'))
  }

  ngAfterViewInit(): void {
    this.editor = new StructureEngineerEditor(this.container.nativeElement, this.injector)
  }

  ngOnDestroy(): void {
    this.editor.area.destroy()
  }

  addBuilder() {
    this.editor.addBuilder(new BuilderNode(getBuilderType('flexPrism')))
  }
}