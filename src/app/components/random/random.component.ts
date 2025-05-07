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

import { ChangeDetectorRef, Component, ComponentRef, EventEmitter, Input, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { Random, Seed } from '../../../client/project/random';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'random',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './random.component.html'
})
export class RandomComponent {

  @ViewChild('editor', { read: ViewContainerRef, static: true }) private editor!: ViewContainerRef
  @ViewChild('result', { read: ViewContainerRef, static: true }) private result!: ViewContainerRef

  private editorRef?: ComponentRef<any>
  private resultRef?: ComponentRef<any>

  private _random!: Random

  @Input()
  set random(value: Random) {
    this._random = value
    this._data = undefined
    if (value?.editor) {
      this.loadRandom(value)
    }
  }

  get random(): any {
    return this._random
  }

  private _seed: Seed = new Seed()

  @Input()
  set seed(value: Seed) {
    this._seed = value
    this.refreshResult()
  }

  get seed(): Seed {
    return this._seed
  }

  private _editable: boolean = true

  @Input()
  set editable(value: boolean) {
    this._editable = value
    if (this.editorRef) {
      this.editorRef.setInput('editable', value)
    }
  }

  get editable(): boolean {
    return this._editable
  }

  private _data: any

  @Input()
  set data(value: any) {
    this._data = value
    if (this.editorRef) {
      this.editorRef.setInput('data', value)
      this.refreshResult()
    }
  }

  get data(): any {
    return this._data
  }

  @Output() edit = new EventEmitter<any>()

  constructor(private cdr: ChangeDetectorRef) { }

  loadRandom(random: Random) {
    this.editor.clear()
    this.editorRef = this.editor.createComponent(random.editor)
    this.editorRef.setInput('editable', this.editable)
    this.editorRef.setInput('collection', random.collection)
    if(this.data) {
      this.editorRef.setInput('data', this.data)
    }
    this.editorRef.instance.edit.subscribe((val: number) => {
      this.change(val)
    })

    this.result.clear()
    this.resultRef = this.result.createComponent(random.result)
    this.refreshResult()
  }

  refreshResult(resetSeed?: boolean) {
    if(resetSeed) {
      this.seed = new Seed()
      this.cdr.detectChanges()
    }
    if(this.resultRef) {
      this.resultRef.setInput('collection', this.random.collection)
      if(this.data) {
        this.resultRef.setInput('data', this.random.evaluate(this.seed, this.data))
      }
    }
  }

  change(data: any) {
    console.log('Emit', data)
    this.edit.emit(data)
  }
}
