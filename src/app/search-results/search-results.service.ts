import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { BingService } from './bing.service';
import { GoogleService } from './google.service';
import { SearchResultsSource } from './source.enum';
import { YandexService } from './yandex.service';

@Injectable()
export class SearchResultsService {

  constructor(private yandexService: YandexService, private googleService: GoogleService, private bingService: BingService) { }

  /**
   * Get search results for title from given source.
   * @param source Source for search results.
   * @param title Search title.
   * @param languageCode Language code.
   */
  getSearchResults(source: SearchResultsSource, title: string, languageCode: string): Observable<number> {
    const beautify = map((value: number) => {
      var count = 0;
      while (value > 999) {
        value = Math.floor(value / 10);
        count++;
      }
      while (count > 0) {
        value = value * 10;
        count--;
      }
      return value;
    });
    switch (source) {
      case SearchResultsSource.Yandex:
        return this.yandexService.getSearchResults(title).pipe(beautify);
      case SearchResultsSource.Google:
        return this.googleService.getSearchResults(title, languageCode).pipe(beautify);
      case SearchResultsSource.Bing:
        return this.bingService.getSearchResults(title, languageCode).pipe(beautify);
      default:
        return this.yandexService.getSearchResults(title).pipe(beautify);
    }
  }

}
