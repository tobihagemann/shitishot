import { Component } from '@angular/core';

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
    return this.settingsService.getLocale();
  }
  set currentLocale(locale: Locale) {
    this.settingsService.setLocale(locale);
  }

  constructor(private settingsService: SettingsService) { }

}
