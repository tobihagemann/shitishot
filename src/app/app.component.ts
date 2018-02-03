import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { LocaleService, TranslationService, Language } from 'angular-l10n';

interface Language {
  text: string;
  code: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  @Language() lang: string;
  currentLanguage: Language;
  languages: Language[] = [
    { text: 'Deutsch', code: 'de' },
    { text: 'English', code: 'en' }
  ];

  constructor(private titleService: Title, private localeService: LocaleService, private translationService: TranslationService) { }

  ngOnInit() {
    this.currentLanguage = this.languages.find(language => language.code == this.localeService.getCurrentLanguage());
    this.translationService.translationChanged().subscribe(() => this.titleService.setTitle(this.translationService.translate('Title')));
  }

  selectLanguage(language: Language) {
    this.currentLanguage = language;
    this.localeService.setCurrentLanguage(language.code);
  }

}
