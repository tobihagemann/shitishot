import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavComponent } from '../nav/nav.component';
import { NavModule } from '../nav/nav.module';
import { L10nResolver } from '../shared/l10n-resolver.service';
import { SharedModule } from '../shared/shared.module';

import { SettingsComponent } from './settings.component';

const routes: Routes = [
  {
    path: '',
    component: NavComponent,
    resolve: { l10n: L10nResolver },
    children: [
      { path: '', component: SettingsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), NavModule, SharedModule],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
