import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';

import { L10nConfig, LocalizationModule, ProviderType } from 'angular-l10n';

import { GameComponent } from './game.component';
import { GameRoutingModule } from './game-routing.module';
import { GameService } from './game.service';
import { GoogleService } from './google.service';
import { WikipediaService } from './wikipedia.service';

const l10nConfig: L10nConfig = {
  translation: {
    providers: [
      { type: ProviderType.Static, prefix: './assets/locale-' },
      { type: ProviderType.Static, prefix: './assets/locale-game-' }
    ],
    missingValue: 'No key'
  }
};

@NgModule({
  providers: [
    GameService,
    GoogleService,
    WikipediaService
  ],
  declarations: [
    GameComponent
  ],
  imports: [
    CommonModule,
    LocalizationModule.forChild(l10nConfig),
    GameRoutingModule
  ],
})
export class GameModule { }
