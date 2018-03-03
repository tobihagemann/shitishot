import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { BingService } from './bing.service';
import { GoogleService } from './google.service';
import { SearchResultsSource } from './source.enum';

@Injectable()
export class SearchResultsService {

  constructor(private googleService: GoogleService, private bingService: BingService) { }

  /**
   * Get search results for title from given source.
   * @param source Source for search results.
   * @param title Search title.
   * @param languageCode Language code.
   */
  getSearchResults(source: SearchResultsSource, title: string, languageCode: string): Observable<number> {
    switch (source) {
      case SearchResultsSource.Google:
        return this.googleService.getSearchResults(title, languageCode);
      case SearchResultsSource.Bing:
        return this.bingService.getSearchResults(title, languageCode)
      default:
        return this.googleService.getSearchResults(title, languageCode);
    }
  }

}
