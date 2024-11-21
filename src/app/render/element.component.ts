import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from "@angular/core"
import { SceneObjectComponent } from "./object.component"
import { NgFor } from "@angular/common"
import { ElementView, SceneService, SceneUpdate } from "../services/scene.service"

@Component({
    selector: 'element',
    standalone: true,
    template: `
      <scene-object *ngFor="let object of element.objects" [object]="object" (click)="click($event)"/>
      <element *ngFor="let element of element.children ?? []" [element]="element"/>
    `,
    imports: [SceneObjectComponent, NgFor],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ElementComponent implements OnInit {

    @Input() element!: ElementView

    constructor(private scene: SceneService<SceneUpdate>, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        console.log('Init Element', this.element.id)
        this.scene.onUpdate((update) => {
            if (update.id === this.element.id) {
                if (update.view) {
                    this.element = update.view
                    this.cdr.detectChanges()
                }
            }
        })
    }

    click(button: number) {
        this.scene.select(this.element.id)
    }
}