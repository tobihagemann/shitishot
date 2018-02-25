import { Injectable } from '@angular/core';

import { LocaleService, TranslationService } from 'angular-l10n';

import { LocalStorage } from '../shared/localstorage.decorator';

export interface Locale {
  languageCode: string;
  countryCode: string;
  text: string;
}

export enum WordTitleSource {
  WikipediaMostViewed = 'Wikipedia (Most Viewed)',
  WikipediaRandom = 'Wikipedia (Random)'
}

export enum WordSearchResultsSource {
  Google = 'Google',
  Bing = 'Bing'
}

@Injectable()
export class SettingsService {

  private locales: Locale[] = [
    { languageCode: 'de', countryCode: 'DE', text: 'Deutsch' },
    { languageCode: 'en', countryCode: 'US', text: 'English' }
  ];
  private locale: Locale;

  @LocalStorage(WordTitleSource.WikipediaMostViewed) private wordTitleSource: WordTitleSource;
  @LocalStorage(WordSearchResultsSource.Google) private wordSearchResultsSource: WordSearchResultsSource;

  constructor(private localeService: LocaleService, translationService: TranslationService) {
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
