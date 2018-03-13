import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { L10nConfig, LocalizationModule, ProviderType } from 'angular-l10n';

import { SharedModule } from '../shared/shared.module';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { SettingsService } from './settings.service';

const l10nConfig: L10nConfig = {
  translation: {
    providers: [
      { type: ProviderType.Static, prefix: './assets/locale-settings-' },
      { type: ProviderType.Static, prefix: './assets/locale-titles-' },
      { type: ProviderType.Static, prefix: './assets/locale-search-results-' }
    ],
    missingValue: 'No key'
  }
};

@NgModule({
  declarations: [
    SettingsComponent
  ],
  imports: [
    FormsModule,
    LocalizationModule.forChild(l10nConfig),
    SharedModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SettingsModule,
      providers: [SettingsService]
    };
  }

  static forChild(): ModuleWithProviders {
    return {
      ngModule: SettingsModule
    };
  }

}
