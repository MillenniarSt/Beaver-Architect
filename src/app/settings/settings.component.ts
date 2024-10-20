import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ServerService } from '../services/http/server.service';
import { NgClass, NgFor, NgIf } from '@angular/common';

type Settings = Record<string, {
  name: string,
  settings: {}
}>

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgClass, NgFor, NgIf],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {

  settings: Settings | undefined

  selectedGroup: string = 'appearance'

  constructor(private cdr: ChangeDetectorRef, private server: ServerService) { }

  ngOnInit(): void {
    this.server.get('settings', {}, this, (settings) => {
      this.settings = settings

      this.cdr.detectChanges()
    })
  }

  get groups(): { id: string, name: string }[] {
    return Object.entries(this.settings!).map((group) => {
      return {
        id: group[0],
        name: group[1].name
      }
    })
  }

  selectGroup(id: string) {
    this.selectedGroup = id
    this.cdr.detectChanges()
  }
}
