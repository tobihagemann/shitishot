import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { SearchResultsService } from '../search-results/search-results.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class CustomService {

  constructor(private settingsService: SettingsService, private searchResultsService: SearchResultsService) { }

  /**
   * Get search results for title.
   * @param title Search title.
   */
  getSearchResults(title: string): Observable<number> {
    return Observable.create((observer: Observer<number>) => {
      const source = this.settingsService.getSearchResultsSource();
      const locale = this.settingsService.getCurrentLocale();
      this.searchResultsService.getSearchResults(source, title, locale.languageCode).subscribe(searchResults => {
        observer.next(searchResults);
        observer.complete();
      }, (error: Error) => {
        console.error(`Unable to get number of search results for: ${title}`);
        observer.error(error);
      });
    });
  }

}
