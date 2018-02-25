import { Injectable } from '@angular/core';

import { LocaleService } from 'angular-l10n';

export interface Locale {
  text: string;
  languageCode: string;
  countryCode: string;
}

@Injectable()
export class SettingsService {

  private locales: Locale[] = [
    { text: 'Deutsch', languageCode: 'de', countryCode: 'DE' },
    { text: 'English', languageCode: 'en', countryCode: 'US' }
  ];
  private locale: Locale;

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

}
