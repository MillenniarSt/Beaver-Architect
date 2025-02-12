import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <main class="h-full">
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {

}
