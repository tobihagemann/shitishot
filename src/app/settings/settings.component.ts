import { Component } from '@angular/core';

import { Locale, SettingsService, WordSearchResultsSource, WordTitleSource } from './settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  get locales() {
    return this.settingsService.getLocales();
  }
  get currentLocale() {
    return this.settingsService.getLocale();
  }
  set currentLocale(locale: Locale) {
    this.settingsService.setLocale(locale);
  }

  get wordTitleSources() {
    return Object.values(WordTitleSource);
  }
  get wordTitleSource() {
    return this.settingsService.getWordTitleSource();
  }
  set wordTitleSource(source: WordTitleSource) {
    this.settingsService.setWordTitleSource(source);
  }

  get wordSearchResultsSources() {
    return Object.values(WordSearchResultsSource);
  }
  get wordSearchResultsSource() {
    return this.settingsService.getWordSearchResultsSource();
  }
  set wordSearchResultsSource(source: WordSearchResultsSource) {
    this.settingsService.setWordSearchResultsSource(source);
  }

  constructor(private settingsService: SettingsService) { }

}
