import { Component } from '@angular/core';
import { SettingsService } from '../settings/settings.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  constructor(private settingsService: SettingsService) { }

  getTitlesSource() {
    return this.settingsService.getTitlesSource();
  }

  getSearchResultsSource() {
    return this.settingsService.getSearchResultsSource();
  }

}
