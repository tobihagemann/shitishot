import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { AllOriginsService } from './allorigins.service';

@Injectable()
export class GoogleService {

  // Since I couldn't find an API that isn't deprecated or doesn't have ridiculous limitations, we're scraping this bad boy.
  private url = (query: string, languageCode: string) => `https://www.google.com/search?q=${encodeURIComponent(query.trim().replace(/\s\s+/g, ' ').toLowerCase()).replace(/%20/g, '+')}&hl=${languageCode}`;

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
          const searchResults = /\d{1,3}(.\d{3})*/.exec(resultStats.innerHTML)[0];
          const searchResultsWithoutSeparators = searchResults.replace(/[^0-9]/g, '');
          observer.next(parseInt(searchResultsWithoutSeparators));
          observer.complete();
        } else {
          this.getSearchResultsFromSecondPage(query, languageCode, observer);
        }
      }, (err: number) => {
        observer.error(err);
        observer.complete();
      });
    });
  }

  private getSearchResultsFromSecondPage(query: string, languageCode: string, observer: Observer<number>) {
    const url = `${this.url(query, languageCode)}&start=10`; // get page 2 directly
    this.allOriginsService.getContents(url).subscribe(contents => {
      const parser = new DOMParser();
      const parsedContents = parser.parseFromString(contents, 'text/html');
      const resultStats = parsedContents.getElementById('resultStats');
      if (resultStats) {
        const numberPattern = /\d{1,3}(.\d{3})*/g;
        numberPattern.exec(resultStats.innerHTML); // skip first number because it's the page number
        const searchResults = numberPattern.exec(resultStats.innerHTML)[0]; // second number is actually the number of search results
        const searchResultsWithoutSeparator = searchResults.replace(/[^0-9]/g, '');
        observer.next(parseInt(searchResultsWithoutSeparator));
        observer.complete();
      } else {
        observer.error(-1);
        observer.complete();
      }
    }, (err: number) => {
      observer.error(err);
      observer.complete();
    });
  }

}
