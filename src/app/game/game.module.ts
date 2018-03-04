import { NgModule, APP_INITIALIZER } from '@angular/core';

import { L10nConfig, LocalizationModule, ProviderType } from 'angular-l10n';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';

import { SearchResultsModule } from '../search-results/search-results.module';
import { SettingsModule } from '../settings/settings.module';
import { SharedModule } from '../shared/shared.module';
import { TitlesModule } from '../titles/titles.module';

import { GameComponent } from './game.component';
import { GameRoutingModule } from './game-routing.module';
import { GameService } from './game.service';

const l10nConfig: L10nConfig = {
  translation: {
    providers: [
      { type: ProviderType.Static, prefix: './assets/locale-game-' }
    ],
    missingValue: 'No key'
  }
};

@NgModule({
  providers: [
    GameService
  ],
  declarations: [
    GameComponent
  ],
  imports: [
    LocalizationModule.forChild(l10nConfig),
    NgbModule,
    ClipboardModule,
    SharedModule,
    GameRoutingModule,
    SearchResultsModule,
    SettingsModule.forChild(),
    TitlesModule
  ]
})
export class GameModule { }
