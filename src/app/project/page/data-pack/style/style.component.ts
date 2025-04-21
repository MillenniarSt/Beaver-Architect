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

import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Page, ProjectService } from '../../../../services/project.service';
import { Subject } from 'rxjs';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { HiddenInputComponent } from "../../../../components/simple/hidden-input.component";
import { ElementPickerComponent } from "../../../../components/element-picker/element-picker.component";
import { SearchBarComponent } from "../../../../components/simple/search-bar.component";
import { PanelModule } from 'primeng/panel';
import { ListUpdateObject, ResourceReference } from '../../../../../client/project/engineer/engineer';
import { Style, StyleRule, StyleUpdate } from '../../../../../client/project/engineer/style';
import { mapToEntries } from '../../../../../client/util';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, NgClass, SplitterModule, PanelModule, FormsModule, DropdownModule, InputNumberModule, InputIconModule, IconFieldModule, InputTextModule, HiddenInputComponent, SearchBarComponent],
  templateUrl: './style.component.html',
  styleUrl: './style.component.css'
})
export class StyleComponent implements OnInit, OnDestroy {

  @Input() page!: Page<{ ref: ResourceReference }>

  style: Style = Style.LOADING

  possibleImplementations: ResourceReference[] = []

  implementationResearch: string = ''

  newRule?: string
  selected?: {
    id: string
    rule: StyleRule
  }

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService) { }

  private destroy$ = new Subject<void>()

  ngOnInit(): void {
    this.ps.project.server.request('data-pack/style/get', { ref: this.page.data.ref.toJson() }).then((data: any) => {
      this.style = Style.fromJson(this.page.data.ref, data)
      this.searchForImplementations()
    })

    this.ps.project.server.listenUntil('data-pack/style/update', (data: ListUpdateObject<StyleUpdate>[]) => {
      data.forEach((style) => {
        if (style.id === this.style.ref.toString()) {
          const update = style.data!
          console.log(update)

          this.style.isAbstract = update.isAbstract ?? this.style.isAbstract

          if (update.implementations) {
            update.implementations.forEach((implementation) => {
              if (implementation.mode === 'push') {
                this.style.implementations.push(new ResourceReference(implementation.id!))
              } else if (implementation.mode === 'delete') {
                const ref = new ResourceReference(implementation.id!)
                this.style.implementations.splice(this.style.implementations.findIndex((imp) => imp.equals(ref)), 1)
              }
              this.searchForImplementations()
            })
          }

          if (update.rules) {
            update.rules.forEach((rule) => {
              if (rule.mode === 'push') {
                this.style.rules.set(rule.id, StyleRule.fromJson(rule.data!))
              } else if (rule.mode === 'delete') {
                this.style.rules.delete(rule.id)
                if(this.selected?.id === rule.id) {
                  this.select(null)
                }
              } else if (rule.data) {
                
              }
            })
          }
          this.cdr.detectChanges()
        }
      })
    }, this.destroy$)
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  rulesIds(): string[] {
    return mapToEntries(this.style.rules).map(([id, rule]) => id)
  }

  displayId(name: string): string {
    return name.charAt(0).toLocaleUpperCase() + name.substring(1).replace('_', ' ')
  }

  idName(name: string): string {
    return name.trim().toLowerCase().replace(' ', '_')
  }

  edit(changes: {}) {
    this.ps.project.server.send('data-pack/style/edit', { ref: this.style.ref, changes: changes })
  }

  searchForImplementations(research?: string) {
    this.implementationResearch = research ?? this.implementationResearch
    this.ps.project.server.request('data-pack/style/possible-implementations', { ref: this.style.ref, research: this.idName(this.implementationResearch.trim()) }).then((data: any) => {
      this.possibleImplementations = data
      this.cdr.detectChanges()
    })
  }

  pushImplementation(implementation: ResourceReference) {
    this.ps.project.server.send('data-pack/style/push-implementation', { ref: this.style.ref, implementation: { pack: implementation.pack, location: implementation.location } })
  }

  deleteImplementation(implementation: ResourceReference) {
    this.ps.project.server.send('data-pack/style/delete-implementation', { ref: this.style.ref, implementation: { pack: implementation.pack, location: implementation.location } })
  }

  setNewRule(value?: string) {
    this.newRule = value
    this.cdr.detectChanges()
  }

  select(ruleId: string | null) {
    if(ruleId) {
      this.selected = { id: ruleId, rule: this.style.rules.get(ruleId)! }
    } else {
      this.selected = undefined
    }
    this.cdr.detectChanges()
  }

  createRule(id: string) {
    this.setNewRule(undefined)
    this.ps.project.server.send('data-pack/style/create-rule', { ref: this.style.ref, id: this.idName(id), type: 'number' })
  }

  deleteRule(id: string) {
    this.setNewRule(undefined)
    this.ps.project.server.send('data-pack/style/delete-rule', { ref: this.style.ref, id })
  }

  trackByFn(index: number, item: any): string {
    return item.id;
  }

  toNumber(string: string): number {
    return Number(string)
  }
}