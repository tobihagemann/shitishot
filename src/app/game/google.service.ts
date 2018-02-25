import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { AllOriginsService } from './allorigins.service';

@Injectable()
export class GoogleService {

  // Since I couldn't find an API that isn't deprecated or doesn't have ridiculous limitations, we're scraping this bad boy.
  private url = (query: string, languageCode: string) => `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=${languageCode}&lr=lang_${languageCode}`;

  // https://stackoverflow.com/a/25761750/1759462
  private groupingSeparator = (language: string) => (12345).toLocaleString(language).match(/12(.*)345/)[1];
  // https://stackoverflow.com/a/16148273/1759462
  private localizedNumberPattern = (groupingSeparator: string) => new RegExp(`\\d{1,3}(${groupingSeparator}\\d{3})*`);

  constructor(private allOriginsService: AllOriginsService) { }

  /**
   * Get number of search results on Google.
   * @param query Search query.
   * @param languageCode Language code, see [Google Web Interface and Search Language Codes](https://sites.google.com/site/tomihasa/google-language-codes).
   */
  getSearchResults(query: string, languageCode: string): Observable<number> {
    return Observable.create((observer: Observer<number>) => {
      this.allOriginsService.getContents(this.url(query, languageCode)).subscribe(contents => {
        const parser = new DOMParser();
        const parsedContents = parser.parseFromString(contents, 'text/html');
        const resultStats = parsedContents.getElementById('resultStats');
        if (resultStats) {
          const groupingSeparator = this.groupingSeparator(languageCode);
          const localizedSearchResults = this.localizedNumberPattern(groupingSeparator).exec(resultStats.innerHTML)[0];
          const localizedSearchResultsWithoutSeparator = localizedSearchResults.replace(new RegExp(`\\${groupingSeparator}`, 'g'), '');
          observer.next(parseInt(localizedSearchResultsWithoutSeparator));
          observer.complete();
        } else {
          // TODO: try to get search results in page 2
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
