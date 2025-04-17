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

import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectBar } from '../display';
import { NgClass, NgComponentOutlet, NgFor, NgIf } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ProjectService } from '../../services/project.service';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { Project } from '../../../client/project/project';

@Component({
  selector: 'sidebars',
  standalone: true,
  imports: [NgFor, NgComponentOutlet, NgClass, AvatarModule, PanelModule, CardModule],
  templateUrl: './sidebars.component.html',
  styleUrl: './sidebars.component.css'
})
export class SidebarsComponent {

  @Input() bars: ProjectBar[] = []

  @Input() selectIndex: number = 0

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService) { }

  select(index: number): void {
    this.selectIndex = index
    this.cdr.detectChanges()
  }

  get project(): Project {
    return this.ps.project
  }
}
