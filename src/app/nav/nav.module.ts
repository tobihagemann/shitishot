import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { L10nConfig, LocalizationModule, ProviderType } from 'angular-l10n';
import { NavComponent } from './nav.component';

const l10nConfig: L10nConfig = {
  translation: {
    providers: [
      { type: ProviderType.Static, prefix: './assets/locale-' }
    ],
    missingValue: 'No key'
  }
};

@NgModule({
  declarations: [
    NavComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    LocalizationModule.forChild(l10nConfig)
  ],
  exports: [
    NavComponent
  ]
})
export class NavModule { }
