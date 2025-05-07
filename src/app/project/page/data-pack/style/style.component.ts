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
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
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
import { SearchBarComponent } from "../../../../components/simple/search-bar.component";
import { PanelModule } from 'primeng/panel';
import { ListUpdateObject, ResourceReference } from '../../../../../client/project/engineer/engineer';
import { Style, StyleRule, StyleUpdate } from '../../../../../client/project/engineer/style';
import { idToLabel, labelToId, mapToEntries } from '../../../../../client/util';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RandomComponent } from "../../../../components/random/random.component";
import { RANDOM_TYPES, RandomType } from '../../../../../client/project/random';
import { CardModule } from 'primeng/card';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, NgClass, CardModule, SelectModule, SelectButtonModule, SplitterModule, PanelModule, FormsModule, DropdownModule, InputNumberModule, InputIconModule, IconFieldModule, InputTextModule, HiddenInputComponent, SearchBarComponent, ToolbarModule, ButtonModule, RandomComponent],
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

    abstractOption: { label: string, code: boolean }
    randomTypeOption: { label: string, code: string }
    randomOption?: { label: string, code: string }
    fixedOption: { label: string, code: boolean }
  }

  readonly ABSTRACT_OPTION = { label: 'Abstract', code: true }
  readonly DEFINED_OPTION = { label: 'Defined', code: false }

  readonly VARIABLE_OPTION: { label: string, code: boolean } = { label: 'Variable', code: false }
  readonly FIXED_OPTION: { label: string, code: boolean } = { label: 'Fixed', code: true }

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
              if(rule.mode === 'push') {
                this.style.rules.set(rule.id, StyleRule.fromJson(rule.data!))
              } else if(rule.mode === 'delete') {
                this.style.rules.delete(rule.id)
                if(this.selected?.id === rule.id) {
                  this.select(null)
                }
              } else if(rule.data) {
                if(rule.id === this.selected?.id) {
                  this.selected.rule = rule.data.random === null ? new StyleRule(
                    rule.data.type ?? this.selected.rule.type,
                    null,
                    undefined,
                    rule.data.fixed ?? this.selected.rule.fixed,
                    rule.data.fromImplementations ? rule.data.fromImplementations.map((ref) => new ResourceReference(ref)) : this.selected.rule.fromImplementations
                  ) : new StyleRule(
                    rule.data.type ?? this.selected.rule.type,
                    rule.data.random?.typeId ?? this.selected.rule.randomName,
                    rule.data.random?.data ?? this.selected.rule.data,
                    rule.data.fixed ?? this.selected.rule.fixed,
                    rule.data.fromImplementations ? rule.data.fromImplementations.map((ref) => new ResourceReference(ref)) : this.selected.rule.fromImplementations
                  )
                  this.selected.abstractOption = this.selected.rule.isAbstract ? this.ABSTRACT_OPTION : this.DEFINED_OPTION
                  this.selected.randomTypeOption = { label: this.selected.rule.randomType.label, code: this.selected.rule.type }
                  this.selected.randomOption = this.selected.rule.isAbstract ? undefined : { label: this.selected.rule.random.label, code: this.selected.rule.randomName! }
                  this.selected.fixedOption = this.selected.rule.fixed ? this.FIXED_OPTION : this.VARIABLE_OPTION
                  this.style.rules.set(rule.id, this.selected.rule)
                }
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

  randomTypeOptions(): { label: string, code: string }[] {
    return Object.entries(RANDOM_TYPES).map(([key, type]) => {
      return { label: type.label, code: key }
    })
  }

  randomOptions(type: string): { label: string, code: string }[] {
    return Object.entries(RANDOM_TYPES[type].randoms).map(([key, random]) => {
      return { label: random.label, code: key }
    })
  }

  displayId(name: string): string {
    return idToLabel(name)
  }

  iconOfRule(id: string): string {
    return this.style.rules.get(id)!.randomType.icon
  }

  iconOfRandomType(name: string): string {
    return RandomType.get(name).icon
  }

  hasRuleDependencies(id: string): boolean {
    return this.style.rules.get(id)!.fromImplementations.length > 0
  }

  displayRuleDependencies(id: string): string {
    return this.style.rules.get(id)!.fromImplementations.map((ref) => ref.toString()).join(', ')
  }

  edit(changes: {}) {
    this.ps.project.server.send('data-pack/style/edit', { ref: this.style.ref, changes: changes })
  }

  searchForImplementations(research?: string) {
    this.implementationResearch = research ?? this.implementationResearch
    this.ps.project.server.request('data-pack/style/possible-implementations', { ref: this.style.ref, research: labelToId(this.implementationResearch.trim()) }).then((data: any) => {
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
      const rule = this.style.rules.get(ruleId)!
      this.selected = { 
        id: ruleId, 
        rule: rule,
        abstractOption: rule.isAbstract ? this.ABSTRACT_OPTION : this.DEFINED_OPTION,
        randomTypeOption: { label: rule.randomType.label, code: rule.type },
        randomOption: rule.isAbstract ? undefined : { label: rule.random.label, code: rule.randomName! },
        fixedOption: rule.fixed ? this.FIXED_OPTION : this.VARIABLE_OPTION
      }
    } else {
      this.selected = undefined
    }
    this.cdr.detectChanges()
  }

  createRule(id: string) {
    this.setNewRule(undefined)
    this.ps.project.server.send('data-pack/style/create-rule', { ref: this.style.ref, id: labelToId(id), type: 'boolean' })
  }

  deleteRule(id: string) {
    this.setNewRule(undefined)
    this.ps.project.server.send('data-pack/style/delete-rule', { ref: this.style.ref, id })
  }

  renameRule(id: string, newId: string) {
    this.ps.project.server.send('data-pack/style/rename-rule', { ref: this.style.ref, id: id, newId: newId })
  }

  editRule(id: string, changes: { isAbstract?: boolean, type?: string, fixed?: boolean, random?: string }) {
    this.ps.project.server.send('data-pack/style/edit-rule', { ref: this.style.ref, id: id, changes: changes })
  }

  changeRuleRandom(id: string, random: string) {
    console.log(this.style.rules.get(id)!.randomName, random)
    if(this.style.rules.get(id)!.randomName !== random) {
      this.editRule(id, { random })
    }
  }

  transformRuleRandom(id: string, constant: boolean) {
    const type = RandomType.get(this.style.rules.get(id)!.type)
    this.editRule(id, { random: constant ? 'constant' : Object.keys(type.randoms)[1] })
  }

  editRuleRandom(id: string, data: any) {
    this.ps.project.server.send('data-pack/style/edit-rule-random', { ref: this.style.ref, id: id, data: data })
  }

  trackByFn(index: number, item: any): string {
    return item.id;
  }

  toNumber(string: string): number {
    return Number(string)
  }
}