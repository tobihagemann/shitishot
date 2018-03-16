import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { L10nConfig, LocalizationModule, ProviderType } from 'angular-l10n';

import { SearchResultsModule } from '../search-results/search-results.module';

import { CustomRoutingModule } from './custom-routing.module';
import { CustomComponent } from './custom.component';
import { CustomService } from './custom.service';

const l10nConfig: L10nConfig = {
  translation: {
    providers: [
      { type: ProviderType.Static, prefix: './assets/locale-custom-' }
    ],
    missingValue: 'No key'
  }
};

@NgModule({
  providers: [
    CustomService
  ],
  declarations: [
    CustomComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    LocalizationModule.forChild(l10nConfig),
    CustomRoutingModule,
    SearchResultsModule
  ]
})
export class CustomModule { }
