import { Component, OnInit } from '@angular/core';

import { Language, LocaleService } from 'angular-l10n';

interface Language {
  text: string;
  code: string;
}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html'
})
export class NavComponent implements OnInit {

  @Language() lang: string;
  currentLanguage: Language;
  languages: Language[] = [
    { text: 'Deutsch', code: 'de' },
    { text: 'English', code: 'en' }
  ];

  constructor(private localeService: LocaleService) { }

  ngOnInit() {
    this.currentLanguage = this.languages.find(language => language.code == this.localeService.getCurrentLanguage());
  }

  selectLanguage(language: Language) {
    this.currentLanguage = language;
    this.localeService.setCurrentLanguage(language.code);
  }

}
