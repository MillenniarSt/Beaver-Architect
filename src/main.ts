import { bootstrapApplication } from '@angular/platform-browser'
import { AppComponent } from './app/app.component'
import { provideRouter, withHashLocation } from '@angular/router'
import { routes } from './app/app.routes'
import { ElectronService, NgxElectronModule } from 'ngx-electron'
import { provideHttpClient } from '@angular/common/http'
import { importProvidersFrom } from '@angular/core'

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    importProvidersFrom(NgxElectronModule),
    ElectronService
  ]
}).catch(err => console.error(err))