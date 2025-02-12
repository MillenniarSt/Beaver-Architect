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

import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { ProgressBarModule } from 'primeng/progressbar';
import { emit, listen, once } from '@tauri-apps/api/event';
import { CardModule } from 'primeng/card'
import { TaskState } from './process';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';

type Task = {
  label: string
  state: TaskState
  subtasks: Task[]
}

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [TreeModule, ButtonModule, ProgressBarModule, CardModule, PanelModule, NgFor, NgIf],
  templateUrl: './process.component.html',
  styleUrl: './process.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ProcessComponent implements OnInit {

  process: string = 'undefined'

  title: string = 'Undefined'
  description: string = ''
  cancellable: boolean = true

  tasksTree: TreeNode[] = []

  progress: number = 0
  taskProgress: (number | null)[] = []

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    once<any>('process:get', (event) => {
      const data = event.payload

      this.process = data.process
      this.title = data.options.title
      this.description = data.options.description ?? ''
      this.cancellable = data.options.cancellable ?? true

      this.taskProgress = new Array(data.tasks.length).fill(null)

      this.tasksTree = this.buildTaskNodes(data.tasks)

      this.cdr.detectChanges()
    })

    listen<{ progress: number, task: { index: number, progress: number }, subtask?: { location: number[], state: TaskState } }>('process:update', (event) => {
      this.progress = event.payload.progress
      this.taskProgress[event.payload.task.index] = event.payload.task.progress

      if (event.payload.subtask) {
        let task = this.tasksTree[event.payload.subtask.location[0]]
        event.payload.subtask.location.slice(1).forEach((loc) => {
          if (task.type !== TaskState.COMPLETED) {
            task.type = TaskState.EXECUTING
          }
          task = task.children![loc]
        })
        task.type = event.payload.subtask.state
      }

      this.cdr.detectChanges()
    })

    emit('process:ready')
  }

  buildTaskNodes(tasks: Task[], expanded: boolean = true): TreeNode[] {
    return tasks.map((task) => {
      return {
        label: task.label,
        expanded: expanded,
        type: TaskState.UNDONE,
        children: this.buildTaskNodes(task.subtasks, false)
      }
    })
  }

  displayTaskProgress(progress: number): number {
    return Math.round(progress! * 100)
  }

  end() {
    emit('process:close')
  }

  nodeExpand(event: any) {
    this.cdr.detectChanges();
  }

  nodeCollapse(event: any) {
    this.cdr.detectChanges();
  }
}
