import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { ProgressBarModule } from 'primeng/progressbar';

type Task = {
  label: string,
  weigth: number,
  progress?: number,
  currentSubtask: number,
  currentSubtaskProgress: number,
  subtasks: {
    label: string
    weigth: number
  }[]
}

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [TreeModule, ProgressBarModule, NgFor, NgIf],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ProgressComponent implements OnInit {

  process: string = 'undefined'

  title: string = 'Undefined'
  description: string = ''
  cancellable: boolean = true
  autoClose: boolean = false

  tasks: Task[] = []

  tasksTree: TreeNode[] = []

  progress: number = 0
  completed: number[] = []

  constructor(private electron: ElectronService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.electron.ipcRenderer.once('progress:get', (e, data) => {

      this.process = data.process
      this.title = data.display.title
      this.description = data.display.description ?? ''
      this.cancellable = data.display.cancellable ?? true
      this.autoClose = data.display.autoClose ?? false

      this.tasks = data.tasks.map((task: any) => {
        return {
          label: task.label,
          weigth: task.weigth ?? 1,
          progress: task.started === true ? 0 : undefined,
          currentSubtask: 0,
          currentSubtaskProgress: 0,
          subtasks: task.subtasks.map((subtask: any) => {
            return {
              label: subtask.label,
              weigth: subtask.weigth ?? 1
            }
          })
        }
      })

      this.tasksTree = this.tasks.map((task) => {
        return {
          label: task.label,
          expanded: true,
          type: task.progress !== undefined ? 'progress' : 'uncompleted',
          children: task.subtasks.map((subtask, i) => {
            return {
              label: subtask.label,
              type: task.progress != undefined && i === 0 ? 'progress' : 'uncompleted'
            }
          })
        }
      })

      this.cdr.detectChanges()
    })

    this.electron.ipcRenderer.on('progress:update-win', (e, data) => {
      const task = this.tasks[data.index]

      if (data.progress >= 1) {
        this.tasksTree[data.index].children![task.currentSubtask].type = 'completed'

        task.currentSubtask++
        task.currentSubtaskProgress = 0

        if (task.currentSubtask >= task.subtasks.length) {
          this.tasksTree[data.index].type = 'completed'

          this.completed.push(data.index)

          if (this.autoClose && this.completed.length >= this.tasks.length) {
            this.end()
          }
        } else {
          this.tasksTree[data.index].children![task.currentSubtask].type = 'progress'
        }
      } else {
        task.currentSubtaskProgress = data.progress

        this.tasksTree[data.index].type = 'progress'
        this.tasksTree[data.index].children![task.currentSubtask].type = 'progress'
      }

      this.updateTasksProgress()

      this.cdr.detectChanges()
    })
  }

  end() {
    this.electron.ipcRenderer.invoke('progress:close', {
      process: this.process,
      isCancelled: this.completed.length === this.tasks.length,
      completed: this.completed
    })
  }

  updateTasksProgress(): void {
    let weigth = 0
    let weigthCompleted = 0

    this.tasks.forEach((task) => {
      this.updateTaskProgress(task)

      weigth += task.weigth
      weigthCompleted += task.weigth * (task.progress ?? 0)
    })

    this.progress = weigthCompleted / weigth
  }

  updateTaskProgress(task: Task) {
    if(!task.progress && task.currentSubtask === 0 && task.currentSubtaskProgress === 0) {
      return
    }

    if(task.currentSubtask === task.subtasks.length) {
      task.progress = 1
      return
    }
    
    let weigth = 0
    let weigthCompleted = task.subtasks[task.currentSubtask].weigth * task.currentSubtaskProgress

    task.subtasks.forEach((subtask, i) => {
      weigth += subtask.weigth
      if (i < task.currentSubtask) {
        weigthCompleted += subtask.weigth
      }
    })

    task.progress = weigthCompleted / weigth
  }

  displayTaskProgress(task: Task): number {
    return Math.round(task.progress! * 100)
  }

  nodeExpand(event: any) {
    this.cdr.detectChanges();
  }

  nodeCollapse(event: any) {
    this.cdr.detectChanges();
  }
}
