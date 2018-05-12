import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { L10nResolver } from '../shared/l10n-resolver.service';
import { GameComponent } from './game.component';

const routes: Routes = [
  {
    path: '',
    component: GameComponent,
    resolve: { l10n: L10nResolver }
  }
];

@NgModule({
  providers: [L10nResolver],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
