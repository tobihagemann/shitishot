import { Injectable } from '@angular/core';

import { LocaleService, TranslationService } from 'angular-l10n';

import { LocalStorage } from '../shared/localstorage.decorator';
import { TitlesSource } from '../titles/source.enum';
import { SearchResultsSource } from '../search-results/source.enum';

export interface Locale {
  languageCode: string;
  countryCode: string;
  text: string;
}

@Injectable()
export class SettingsService {

  private locales: Locale[] = [
    { languageCode: 'de', countryCode: 'DE', text: 'Deutsch' },
    { languageCode: 'en', countryCode: 'US', text: 'English' }
  ];
  private currentLocale: Locale;

  @LocalStorage(TitlesSource.WikipediaMostViewed) private titlesSource: TitlesSource;
  @LocalStorage(SearchResultsSource.Google) private searchResultsSource: SearchResultsSource;

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

  getTitlesSource() {
    return this.titlesSource;
  }

  setTitlesSource(source: TitlesSource) {
    this.titlesSource = source;
  }

  getSearchResultsSource() {
    return this.searchResultsSource;
  }

  setSearchResultsSource(source: SearchResultsSource) {
    this.searchResultsSource = source;
  }

}
