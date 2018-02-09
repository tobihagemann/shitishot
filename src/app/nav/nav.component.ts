import { Component, OnInit } from '@angular/core';

import { LocaleService } from 'angular-l10n';

interface Locale {
  text: string;
  languageCode: string;
  countryCode: string;
}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  currentLocale: Locale;
  locales: Locale[] = [
    { text: 'Deutsch', languageCode: 'de', countryCode: 'DE' },
    { text: 'English', languageCode: 'en', countryCode: 'US' }
  ];

  constructor(private localeService: LocaleService) { }

  ngOnInit() {
    this.currentLocale = this.locales.find(language => language.languageCode == this.localeService.getCurrentLanguage());
  }

  selectLocale(locale: Locale) {
    this.currentLocale = locale;
    this.localeService.setDefaultLocale(locale.languageCode, locale.countryCode);
  }

}
