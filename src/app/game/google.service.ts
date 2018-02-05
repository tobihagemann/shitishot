import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

interface GoogleResponse {
  contents: string;
}

@Injectable()
export class GoogleService {

  // Since I couldn't find an API that isn't deprecated or doesn't have ridiculous limitations, we're scraping this bad boy.
  // Due to cross-origin bullshit, we're using All Origins to bypass that.
  // https://medium.freecodecamp.org/client-side-web-scraping-with-javascript-using-jquery-and-regex-5b57a271cb86
  private url = 'https://allorigins.me/get';
  private params = (language: string, query: string) => {
    return new HttpParams({
      fromObject: {
        url: 'https://www.google.com/search?q=' + encodeURIComponent(query) + '&hl=' + language
      }
    });
  };

  // https://stackoverflow.com/a/25761750/1759462
  private groupingSeparator = (language: string) => {
    return (12345).toLocaleString(language).match(/12(.*)345/)[1];
  };
  // https://stackoverflow.com/a/16148273/1759462
  private localizedNumberPattern = (groupingSeparator: string) => {
    return new RegExp(`\\d{1,3}(${groupingSeparator}\\d{3})*`);
  };

  constructor(private http: HttpClient) { }

  /**
   * Get number of search results on Google.
   * @param query Search query.
   * @param languageCode Language code, see [Google Web Interface and Search Language Codes](https://sites.google.com/site/tomihasa/google-language-codes).
   */
  getSearchResults(query: string, languageCode: string): Observable<number> {
    return Observable.create((observer: Observer<number>) => {
      this.http.get<GoogleResponse>(this.url, { params: this.params(languageCode, query) })
        .subscribe(response => {
          const parser = new DOMParser();
          const parsedContents = parser.parseFromString(response.contents, 'text/html');
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
