import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

class YandexError extends Error {
  constructor(message: string) {
    super(`[Yandex] ${message}`);
    Object.setPrototypeOf(this, YandexError.prototype);
  }
}

interface YandexResponse {
  yandexsearch: {
    response: {
      found: [{
        _text: number;
      }];
      results: {
        grouping: {
          'found-docs': [{
            _text: number;
          }];
        };
      };
    }
  };
}

@Injectable()
export class YandexService {

  private url = 'https://api.shitishot.de/yandex/search';

  constructor(private http: HttpClient) { }

  /**
  * Get number of search results on Yandex.
  * @param query Search query.
  */
  getSearchResults(query: string): Observable<number> {
    return Observable.create((observer: Observer<number>) => {
      const params = new HttpParams({
        fromObject: {
          query: query.trim().replace(/\s\s+/g, ' ').replace(/\s/g, '+').toLowerCase()
        }
      });
      this.http.get<YandexResponse>(this.url, { params: params }).subscribe(response => {
        if (response.yandexsearch && response.yandexsearch.response && response.yandexsearch.response.results && response.yandexsearch.response.results.grouping && response.yandexsearch.response.results.grouping['found-docs'] && response.yandexsearch.response.results.grouping['found-docs'][0] && response.yandexsearch.response.results.grouping['found-docs'][0]._text) {
          observer.next(response.yandexsearch.response.results.grouping['found-docs'][0]._text);
          observer.complete();
        } else if (response.yandexsearch && response.yandexsearch.response && response.yandexsearch.response.found && response.yandexsearch.response.found[0] && response.yandexsearch.response.found[0]._text) {
          observer.next(response.yandexsearch.response.found[0]._text);
          observer.complete();
        } else {
          observer.error(new YandexError('Unable to load search results'));
        }
      }, (error: HttpErrorResponse) => observer.error(this.handleHttpErrorResponse(error)));
    });
  }

  private handleHttpErrorResponse(error: HttpErrorResponse) {
    if (error.error instanceof Error) {
      console.error('An error occurred:', error.error.message);
      return new YandexError(`An error occurred: ${error.error.message}`);
    } else {
      console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
      return new YandexError(`Backend returned code ${error.status}`);
    }
  }

}
