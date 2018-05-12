import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './game/game.module#GameModule' },
  { path: 'custom', loadChildren: './custom/custom.module#CustomModule' },
  { path: 'settings', loadChildren: './settings/settings.module#SettingsModule' },
  { path: 'impressum', loadChildren: './impressum/impressum.module#ImpressumModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
