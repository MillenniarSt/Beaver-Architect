import { Component } from '@angular/core';

export type TagObject = {
  identifier: string,
  weigth: number,
  data?: {}
}

@Component({
  selector: 'page-style',
  standalone: true,
  imports: [],
  templateUrl: './style.component.html',
  styleUrl: './style.component.css'
})
export class StyleComponent {

  name: string = ''
  materials: string[][] = []
  tags: Record<string, TagObject[]> = {}
}
