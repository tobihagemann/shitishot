import { Injectable } from '@angular/core';

import { LocaleService } from 'angular-l10n';

import { LocalStorage } from '../shared/localstorage.decorator';

export interface Locale {
  text: string;
  languageCode: string;
  countryCode: string;
}

export enum WordTitleSource {
  Wikipedia = 'Wikipedia'
}

export enum WordSearchResultsSource {
  Google = 'Google'
}

@Injectable()
export class SettingsService {

  private locales: Locale[] = [
    { text: 'Deutsch', languageCode: 'de', countryCode: 'DE' },
    { text: 'English', languageCode: 'en', countryCode: 'US' }
  ];
  private locale: Locale;

  @LocalStorage(WordTitleSource.Wikipedia) wordTitleSource: WordTitleSource;
  @LocalStorage(WordSearchResultsSource.Google) wordSearchResultsSource: WordSearchResultsSource;

  constructor(private localeService: LocaleService) {
    this.locale = this.locales.find(language => language.languageCode == this.localeService.getCurrentLanguage());
  }

  getLocales() {
    return this.locales;
  }

  getLocale() {
    return this.locale;
  }

  setLocale(locale: Locale) {
    this.locale = locale;
    this.localeService.setDefaultLocale(locale.languageCode, locale.countryCode);
  }

  getWordTitleSource() {
    return this.wordTitleSource;
  }

  setWordTitleSource(source: WordTitleSource) {
    this.wordTitleSource = source;
  }

  getWordSearchResultsSource() {
    return this.wordSearchResultsSource;
  }

  setWordSearchResultsSource(source: WordSearchResultsSource) {
    this.wordSearchResultsSource = source;
  }

}
