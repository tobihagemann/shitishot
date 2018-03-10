import { Component } from '@angular/core';

import { SearchResultsSource } from '../search-results/source.enum';
import { TitlesSource } from '../titles/source.enum';

import { Locale, SettingsService } from './settings.service';

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
    return this.settingsService.getCurrentLocale();
  }
  set currentLocale(locale: Locale) {
    this.settingsService.setCurrentLocale(locale);
  }

  get titlesSources() {
    return Object.values(TitlesSource);
  }
  get titlesSource() {
    return this.settingsService.getTitlesSource();
  }
  set titlesSource(source: TitlesSource) {
    this.settingsService.setTitlesSource(source);
  }

  get searchResultsSources() {
    return Object.values(SearchResultsSource);
  }
  get searchResultsSource() {
    return this.settingsService.getSearchResultsSource();
  }
  set searchResultsSource(source: SearchResultsSource) {
    this.settingsService.setSearchResultsSource(source);
  }

  private _tutorialIsReset: boolean;
  get tutorialIsReset() {
    return this._tutorialIsReset;
  }
  private tutorialIsResetTimeoutId: number;
  set tutorialIsReset(tutorialIsReset) {
    this._tutorialIsReset = tutorialIsReset;
    clearTimeout(this.tutorialIsResetTimeoutId);
    if (tutorialIsReset) {
      this.tutorialIsResetTimeoutId = setTimeout(() => this.tutorialIsReset = false, 3000);
    }
  }

  constructor(private settingsService: SettingsService) { }

  resetTutorial() {
    localStorage.removeItem('showTutorial');
    localStorage.removeItem('tutorialState');
    this.tutorialIsReset = true;
  }

}
