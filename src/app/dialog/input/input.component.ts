import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [NgIf, NgClass, FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputDialogComponent implements OnInit {

  constructor(private electron: ElectronService, private cdRef: ChangeDetectorRef) { }

  color: string = 'info'
  icon: string = 'assets/icon/info.svg'
  title: string = ''
  message: string = ''
  placeholder: string = ''
  value: string = ''

  ngOnInit() {
    this.electron.ipcRenderer.once('dialog:get', (e, data) => {
      this.color = data.color ?? 'info'
      this.icon = data.icon ?? 'assets/icon/info.svg'
      this.title = data.title ?? 'Untitled'
      this.message = data.message ?? 'Insert a value'
      this.value = data.initial ?? ''
      this.placeholder = data.placeholder ?? ''

      this.cdRef.detectChanges()
    });
  }

  send() {
    this.electron.ipcRenderer.invoke('dialog:close', this.value)
  }

  close() {
    this.electron.ipcRenderer.invoke('dialog:close')
  }
}
