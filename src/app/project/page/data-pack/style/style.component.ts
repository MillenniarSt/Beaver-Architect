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
import { CardModule } from 'primeng/card';
import { RandomRegistry, RandomTypeRegistry, Seed } from '../../../../../client/register/random';
import { Icon } from '../../../../../client/instance/resources';
import { IconComponent } from "../../../../components/simple/icon.component";

@Component({
  standalone: true,
  imports: [NgIf, NgFor, NgClass, CardModule, SelectModule, SelectButtonModule, SplitterModule, PanelModule, FormsModule, DropdownModule, InputNumberModule, InputIconModule, IconFieldModule, InputTextModule, HiddenInputComponent, SearchBarComponent, ToolbarModule, ButtonModule, RandomComponent, IconComponent],
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
    randomTypeOption: { label: string, code: RandomTypeRegistry }
    randomOption?: { label: string, code: RandomRegistry }
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
                    rule.data.type ? this.ps.project.RANDOM_TYPES.get(rule.data.type) : this.selected.rule.type,
                    null,
                    undefined,
                    rule.data.fixed ?? this.selected.rule.fixed,
                    rule.data.fromImplementations ? rule.data.fromImplementations.map((ref) => new ResourceReference(ref)) : this.selected.rule.fromImplementations
                  ) : new StyleRule(
                    rule.data.type ? this.ps.project.RANDOM_TYPES.get(rule.data.type) : this.selected.rule.type,
                    rule.data.random?.type ? this.ps.project.RANDOMS.get(rule.data.random.type) : this.selected.rule.random,
                    rule.data.random?.data ?? this.selected.rule.data,
                    rule.data.fixed ?? this.selected.rule.fixed,
                    rule.data.fromImplementations ? rule.data.fromImplementations.map((ref) => new ResourceReference(ref)) : this.selected.rule.fromImplementations
                  )
                  this.selected.abstractOption = this.selected.rule.isAbstract ? this.ABSTRACT_OPTION : this.DEFINED_OPTION
                  this.selected.randomTypeOption = { label: this.selected.rule.type.label, code: this.selected.rule.type }
                  this.selected.randomOption = this.selected.rule.isAbstract ? undefined : { label: this.selected.rule.random!.label, code: this.selected.rule.random! }
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

  randomTypeOptions(): { label: string, code: RandomTypeRegistry }[] {
    return this.ps.project.RANDOM_TYPES.getAll().map((type) => {
      return { label: type.label, code: type }
    })
  }

  randomOptions(type: RandomTypeRegistry): { label: string, code: RandomRegistry }[] {
    return type.randomList.map((random) => {
      return { label: random.label, code: random }
    })
  }

  displayId(name: string): string {
    return idToLabel(name)
  }

  iconOfRule(id: string): Icon {
    return this.style.rules.get(id)!.type.icon
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
        randomTypeOption: { label: rule.type.label, code: rule.type },
        randomOption: rule.isAbstract ? undefined : { label: rule.random!.label, code: rule.random! },
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

  evaluateRule(id: string) {
    return (seed: Seed) => this.ps.project.server.request('data-pack/style/evaluate-rule', { ref: this.style.ref, id: id, seed: seed.current })
  }

  renameRule(id: string, newId: string) {
    this.ps.project.server.send('data-pack/style/rename-rule', { ref: this.style.ref, id: id, newId: newId })
  }

  editRule(id: string, changes: { isAbstract?: boolean, type?: RandomTypeRegistry, fixed?: boolean, random?: RandomRegistry }) {
    this.ps.project.server.send('data-pack/style/edit-rule', { ref: this.style.ref, id: id, changes: { isAbstract: changes.isAbstract, type: changes.type?.id, fixed: changes.fixed, random: changes.random?.id } })
  }

  changeRuleRandom(id: string, random: RandomRegistry) {
    if(this.style.rules.get(id)!.random !== random) {
      this.editRule(id, { random })
    }
  }

  transformRuleRandom(id: string, constant: boolean) {
    this.editRule(id, { random: constant ? this.style.rules.get(id)!.type.constant : this.style.rules.get(id)!.type.randomList[0] })
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