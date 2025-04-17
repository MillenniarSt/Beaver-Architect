import { ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { BuilderNode } from '../../../nodes/builder';
import { NgFor } from '@angular/common';
import { BuilderSocket } from '../../../sockets';

@Component({
    imports: [NgFor],
    templateUrl: './builder.component.html'
})
export class BuilderComponent implements OnChanges {

    @Input() data!: BuilderNode
    @Input() emit!: (data: any) => void
    @Input() rendered!: () => void

    seed = 0

    constructor(private cdr: ChangeDetectorRef) {
        this.cdr.detach()
    }

    ngOnChanges(): void {
        this.cdr.detectChanges()
        requestAnimationFrame(() => this.rendered())
        this.seed++
    }

    get builderOutputs(): { label: string }[] {
        let outputs: { label: string }[] = []
        Object.entries(this.data.outputs).forEach(([key, output]) => {
            if(output?.socket instanceof BuilderSocket) {
                outputs.push({
                    label: output.label ?? 'Undefined'
                })
            }
        })
        return outputs
    }
}