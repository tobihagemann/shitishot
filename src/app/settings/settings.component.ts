import { Component, OnInit } from '@angular/core';

import { LocaleService } from 'angular-l10n';

interface Locale {
  text: string;
  languageCode: string;
  countryCode: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  currentLocale: Locale;
  locales: Locale[] = [
    { text: 'Deutsch', languageCode: 'de', countryCode: 'DE' },
    { text: 'English', languageCode: 'en', countryCode: 'US' }
  ];

  constructor(private localeService: LocaleService) { }

  ngOnInit() {
    this.currentLocale = this.locales.find(language => language.languageCode == this.localeService.getCurrentLanguage());
  }

  changeLocale(locale: Locale) {
    this.localeService.setDefaultLocale(locale.languageCode, locale.countryCode);
  }

}
