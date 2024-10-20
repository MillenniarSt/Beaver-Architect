import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'dialog-error',
  standalone: true,
  imports: [NgIf],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorDialogComponent implements OnInit {

  constructor(private electron: ElectronService, private cdRef: ChangeDetectorRef) { }

  name: string = ''
  message: string = ''
  stack: string = ''
  errno?: string
  syscall?: string
  url?: string

  hasReport: boolean = false

  ngOnInit() {
    this.electron.ipcRenderer.once('dialog:get', (e, data) => {
      const { err, url } = data

      this.name = err.name ?? 'Error'
      this.message = err.message ?? 'Un unexpected error occurred on the application'
      this.stack = err.stack ?? 'No stack found'
      this.errno = err.errno
      this.syscall = err.syscall
      this.url = url

      this.cdRef.detectChanges()
    });
  }

  report() {
    //TODO
  }

  close() {
    this.electron.ipcRenderer.invoke('dialog:close')
  }
}
