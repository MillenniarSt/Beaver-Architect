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

import { NgClass, NgComponentOutlet, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, Type } from '@angular/core';
import { openBaseDialog } from '../../dialog/dialogs';
import { Page, ProjectService } from '../../services/project.service';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'pages',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, NgComponentOutlet, TabViewModule],
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.css'
})
export class PagesComponent implements OnInit {

  selectedIndex: number = 0

  constructor(private cdr: ChangeDetectorRef, private ps: ProjectService) { }

  get pages(): Page[] {
    return this.ps.pages
  }

  ngOnInit(): void {
    this.ps.pagesMessage.subscribe((message) => {
      console.log(message)
      if(message.openPage) {
        this.ps.pages.push(message.openPage)
      }
      if(message.selectPage !== undefined) {
        this.selectedIndex = message.selectPage
      }
      this.cdr.detectChanges()
    })
  }

  select(index: number) {
    this.selectedIndex = index
    this.cdr.detectChanges()
  }

  closePage(index: number) {
    const page = this.pages[index]
    if (page.isSaved === false && page.save) {
      openBaseDialog({
        icon: 'assets/icon/warning.svg',
        severity: 'info',
        title: 'Unsaved Changes',
        message: 'There are unsaved changes, do you want to save ',
        buttons: [
          { label: 'Yes', severity: 'info', focus: true, id: 1 },
          { label: 'No' }
        ]
      }).then((i) => {
        if (i) {
          page.save!()
        }
        this.selectedIndex = Math.max(this.selectedIndex -1, 0)
        this.pages.splice(index, 1)
        this.cdr.detectChanges()
      })
    } else {
      this.selectedIndex = Math.max(this.selectedIndex -1, 0)
      this.pages.splice(index, 1)
      this.cdr.detectChanges()
    }
  }
}