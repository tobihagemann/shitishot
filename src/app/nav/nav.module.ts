import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { L10nConfig, LocalizationModule, ProviderType } from 'angular-l10n';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

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
    LocalizationModule.forChild(l10nConfig),
    NgbModule
  ],
  exports: [
    NavComponent
  ]
})
export class NavModule { }
