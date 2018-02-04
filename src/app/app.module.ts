import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { L10nConfig, L10nLoader, TranslationModule, StorageStrategy, ProviderType } from 'angular-l10n';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NavComponent } from './nav/nav.component';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

const l10nConfig: L10nConfig = {
  locale: {
    languages: [
      { code: 'en', dir: 'ltr' },
      { code: 'de', dir: 'ltr' }
    ],
    language: 'en',
    storage: StorageStrategy.Cookie
  },
  translation: {
    providers: [
      { type: ProviderType.Static, prefix: './assets/locale-' }
    ],
    caching: true,
    missingValue: 'No key'
  }
};

export function initL10n(l10nLoader: L10nLoader): Function {
  return () => l10nLoader.load();
}

@NgModule({
  providers: [
    Title,
    { provide: APP_INITIALIZER, useFactory: initL10n, deps: [L10nLoader], multi: true }
  ],
  declarations: [
    NavComponent,
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslationModule.forRoot(l10nConfig),
    NgbModule.forRoot(),
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(private l10nLoader: L10nLoader) {
    this.l10nLoader.load();
  }

}
