import { Routes } from '@angular/router';
import { HomeComponent } from './home/home/home.component';
import { BaseDialogComponent } from './dialog/base/base.component';
import { ErrorDialogComponent } from './dialog/error/error.component';
import { InputDialogComponent } from './dialog/input/input.component';
import { ProjectComponent } from './project/project/project.component';
import { ProgressComponent } from './progress/progress.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },

    { path: 'project', component: ProjectComponent },

    { path: 'settings', component: SettingsComponent },
    { path: 'progress', component: ProgressComponent },

    { path: 'dialog/base', component: BaseDialogComponent },
    { path: 'dialog/error', component: ErrorDialogComponent },
    { path: 'dialog/input', component: InputDialogComponent }
];