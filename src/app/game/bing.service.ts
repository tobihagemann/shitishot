import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

interface BingResponse {
  contents: string;
}

@Injectable()
export class BingService {

  // Since I couldn't find an API that isn't deprecated or doesn't have ridiculous limitations, we're scraping this bad boy.
  // Due to cross-origin bullshit, we're using All Origins to bypass that.
  // https://medium.freecodecamp.org/client-side-web-scraping-with-javascript-using-jquery-and-regex-5b57a271cb86
  private url = 'https://allorigins.me/get';
  private params = (query: string, languageCode: string, countryCode: string) => new HttpParams({
    fromObject: {
      url: `https://www.bing.com/search?q=${encodeURIComponent(query)}&setLang=${languageCode}&cc=${countryCode}`
    }
  });

  // https://stackoverflow.com/a/25761750/1759462
  private groupingSeparator = (language: string) => (12345).toLocaleString(language).match(/12(.*)345/)[1];
  // https://stackoverflow.com/a/16148273/1759462
  private localizedNumberPattern = (groupingSeparator: string) => new RegExp(`\\d{1,3}(${groupingSeparator}\\d{3})*`);

  constructor(private http: HttpClient) { }

  /**
   * Get number of search results on Bing.
   * @param query Search query.
   * @param languageCode Language code, see [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
   * @param countryCode Country code, see [Country codes](https://docs.microsoft.com/en-us/rest/api/cognitiveservices/bing-web-api-v7-reference#countrycodes).
   */
  getSearchResults(query: string, languageCode: string, countryCode: string): Observable<number> {
    return Observable.create((observer: Observer<number>) => {
      this.http.get<BingResponse>(this.url, { params: this.params(query, languageCode, countryCode) }).subscribe(response => {
        const parser = new DOMParser();
        const parsedContents = parser.parseFromString(response.contents, 'text/html');
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
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.error('An error occurred:', err.error.message);
        } else {
          console.error(`Backend returned code ${err.status}, body was: ${err.error}`);
        }
        observer.error(err.status);
        observer.complete();
      });
    });
  }

}
