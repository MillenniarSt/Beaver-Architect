import { ApplicationConfig } from "@angular/core";
import { provideRouter, withHashLocation } from "@angular/router";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { routes } from "./app.routes";
import { BeaverTheme } from "./app.theme";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: BeaverTheme
      }
    })
  ]
}