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
  private currentLocale: Locale;

  @LocalStorage(WordTitleSource.WikipediaMostViewed) private wordTitleSource: WordTitleSource;
  @LocalStorage(WordSearchResultsSource.Google) private wordSearchResultsSource: WordSearchResultsSource;

  constructor(private localeService: LocaleService, translationService: TranslationService) {
    this.currentLocale = this.getLocale(this.localeService.getCurrentLanguage());
  }

  getLocales() {
    return this.locales;
  }

  getLocale(languageCode: string) {
    return this.locales.find(locale => locale.languageCode == languageCode) || this.currentLocale;
  }

  getCurrentLocale() {
    return this.currentLocale;
  }

  setCurrentLocale(locale: Locale) {
    this.currentLocale = locale;
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
