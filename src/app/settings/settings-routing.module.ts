import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { L10nResolver } from '../shared/l10n-resolver.service';

import { SettingsComponent } from './settings.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    resolve: { l10n: L10nResolver }
  }
];

@NgModule({
  providers: [L10nResolver],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
