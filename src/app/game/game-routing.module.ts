import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavComponent } from '../nav/nav.component';
import { NavModule } from '../nav/nav.module';
import { L18nResolver } from '../shared/l18n-resolver.service';

import { GameComponent } from './game.component';

const routes: Routes = [
  {
    path: '',
    component: NavComponent,
    resolve: { void: L18nResolver },
    children: [
      { path: '', component: GameComponent }
    ]
  }
];

@NgModule({
  providers: [L18nResolver],
  imports: [RouterModule.forChild(routes), NavModule],
  exports: [RouterModule]
})
export class GameRoutingModule { }
