import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

interface YandexResponse {
  yandexsearch: {
    response: {
      found: [{
        _attributes: {
          priority: string;
        };
        _text: number;
      }]
    }
  };
}

@Injectable()
export class YandexService {

  private url = 'https://ssl.setolabs.com/yandex/search';
  private params = (query: string) => new HttpParams({
    fromObject: {
      query: encodeURIComponent(query.trim().replace(/\s\s+/g, ' ').toLowerCase()).replace(/%20/g, '+')
    }
  });

  constructor(private http: HttpClient) { }

  /**
  * Get number of search results on Google.
  * @param query Search query.
  * @param languageCode Language code, see [Google Web Interface and Search Language Codes](https://sites.google.com/site/tomihasa/google-language-codes).
  */
  getSearchResults(query: string): Observable<number> {
    return Observable.create((observer: Observer<number>) => {
      this.http.get<YandexResponse>(this.url, { params: this.params(query) }).subscribe(response => {
        if (response.yandexsearch && response.yandexsearch.response && response.yandexsearch.response.found[0] && response.yandexsearch.response.found[0]._text) {
          observer.next(response.yandexsearch.response.found[0]._text);
          observer.complete();
        } else {
          observer.error(-1);
        }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.error('An error occurred:', err.error.message);
        } else {
          console.error(`Backend returned code ${err.status}, body was: ${err.error}`);
        }
        observer.error(err.status);
      });
    });
  }

}
