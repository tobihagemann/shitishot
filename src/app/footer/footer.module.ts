import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { L10nConfig, LocalizationModule, ProviderType } from 'angular-l10n';
import { SettingsModule } from '../settings/settings.module';

import { FooterComponent } from './footer.component';

const l10nConfig: L10nConfig = {
  translation: {
    providers: [
      { type: ProviderType.Static, prefix: './assets/locale-footer-' }
    ],
    missingValue: 'No key'
  }
};

@NgModule({
  declarations: [
    FooterComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    LocalizationModule.forChild(l10nConfig),
    SettingsModule
  ],
  exports: [
    FooterComponent
  ]
})
export class FooterModule { }
