import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavComponent } from '../nav/nav.component';
import { NavModule } from '../nav/nav.module';
import { L10nResolver } from '../shared/l10n-resolver.service';

import { GameComponent } from './game.component';

const routes: Routes = [
  {
    path: '',
    component: NavComponent,
    resolve: { l10n: L10nResolver },
    children: [
      { path: '', component: GameComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), NavModule],
  exports: [RouterModule]
})
export class GameRoutingModule { }
