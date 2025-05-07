import { AfterViewInit, ChangeDetectorRef, Component as NgComponent, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Page, ProjectService } from '../../../../services/project.service';
import { ComponentEditor } from './editor';
import { BuilderNode } from '../../../../../client/rete/nodes/builder';
import { ResourceReference } from '../../../../../client/project/engineer/engineer';
import { Component } from '../../../../../client/project/engineer/component';
import { getProject } from '../../../../../client/project/project';

@NgComponent({
  imports: [],
  templateUrl: './component.component.html',
  styleUrl: './component.component.css'
})
export class ComponentComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild("rete") container!: ElementRef

  @Input() page!: Page<{ ref: ResourceReference }>

  component: Component = Component.LOADING

  protected editor!: ComponentEditor

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService, private injector: Injector) { }

  ngOnInit(): void {
    this.ps.project.server.request('data-pack/component/get', { ref: this.page.data.ref.toJson() }).then((data: any) => {
      this.component = Component.fromJson(this.page.data.ref, data)
      this.cdr.detectChanges()
    })
  }

  ngAfterViewInit(): void {
    if(!this.isLoading) {
      this.editor = new ComponentEditor(this.component, this.container.nativeElement, this.injector)
    }
  }

  ngOnDestroy(): void {
    this.editor.area.destroy()
  }

  get isLoading(): boolean {
    return this.component === Component.LOADING
  }

  addBuilder() {
    this.editor.addBuilder(new BuilderNode(getProject().BUILDERS.get('flexPrism')))
  }
}