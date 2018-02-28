import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { AllOriginsService } from './allorigins.service';

@Injectable()
export class BingService {

  // Since I couldn't find an API that isn't deprecated or doesn't have ridiculous limitations, we're scraping this bad boy.
  private url = (query: string, languageCode: string, countryCode: string) => `https://www.bing.com/search?q=${encodeURIComponent(query)}&setLang=${languageCode}&cc=${countryCode}`;

  // https://stackoverflow.com/a/25761750/1759462
  private groupingSeparator = (languageCode: string) => (12345).toLocaleString(languageCode).match(/12(.*)345/)[1];
  // https://stackoverflow.com/a/16148273/1759462
  private localizedNumberPattern = (groupingSeparator: string) => new RegExp(`\\d{1,3}(${groupingSeparator}\\d{3})*`);

  constructor(private allOriginsService: AllOriginsService) { }

  /**
   * Get number of search results on Bing.
   * @param query Search query.
   * @param languageCode Language code, see [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
   * @param countryCode Country code, see [Country codes](https://docs.microsoft.com/en-us/rest/api/cognitiveservices/bing-web-api-v7-reference#countrycodes).
   */
  getSearchResults(query: string, languageCode: string, countryCode: string): Observable<number> {
    return Observable.create((observer: Observer<number>) => {
      this.allOriginsService.getContents(this.url(query, languageCode, countryCode)).subscribe(contents => {
        const parser = new DOMParser();
        const parsedContents = parser.parseFromString(contents, 'text/html');
        const count = parsedContents.getElementsByClassName('sb_count');
        if (count && count[0]) {
          const groupingSeparator = this.groupingSeparator(languageCode);
          const localizedSearchResults = this.localizedNumberPattern(groupingSeparator).exec(count[0].innerHTML)[0];
          const localizedSearchResultsWithoutSeparator = localizedSearchResults.replace(new RegExp(`\\${groupingSeparator}`, 'g'), '');
          observer.next(parseInt(localizedSearchResultsWithoutSeparator));
          observer.complete();
        } else {
          observer.error(-1);
          observer.complete();
        }
      }, (err: number) => {
        observer.error(err);
        observer.complete();
      });
    });
  }

}
