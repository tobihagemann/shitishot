import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { L10nResolver } from '../shared/l10n-resolver.service';
import { SharedModule } from '../shared/shared.module';

import { GameComponent } from './game.component';

const routes: Routes = [
  {
    path: '',
    component: GameComponent,
    resolve: { l10n: L10nResolver }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule]
})
export class GameRoutingModule { }
