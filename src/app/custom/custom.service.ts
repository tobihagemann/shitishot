import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { SettingsService } from '../settings/settings.service';
import { SearchResultsService } from '../search-results/search-results.service';

@Injectable()
export class CustomService {

  constructor(private settingsService: SettingsService, private searchResultsService: SearchResultsService) { }

  /**
   * Get search results for title.
   * @param title Search title.
   */
  getSearchResults(title: string): Observable<number> {
    const source = this.settingsService.getSearchResultsSource();
    const locale = this.settingsService.getCurrentLocale();
    return this.searchResultsService.getSearchResults(source, title, locale.languageCode);
  }

}
