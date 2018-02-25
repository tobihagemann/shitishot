import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

interface WikipediaResponse {
  query: {
    random: [{
      title: string;
    }];
  }
}

@Injectable()
export class WikipediaService {

  // https://www.mediawiki.org/wiki/API:Random
  private url = (language: string) => `https://${language}.wikipedia.org/w/api.php`;
  private params = (limit: number) => new HttpParams({
    fromObject: {
      action: 'query',
      format: 'json',
      list: 'random',
      rnnamespace: '0',
      rnlimit: String(Math.min(Math.max(1, limit), 10)),
      origin: '*'
    }
  });

  constructor(private http: HttpClient) { }

  /**
   * Get titles of random articles on Wikipedia.
   * @param limit Limit how many random titles will be returned (between 1 and 10).
   * @param languageCode Language code, see [List of Wikipedias](https://en.wikipedia.org/wiki/List_of_Wikipedias).
   */
  getRandomTitles(limit: number, languageCode: string): Observable<string[]> {
    return Observable.create((observer: Observer<string[]>) => {
      this.http.get<WikipediaResponse>(this.url(languageCode), { params: this.params(limit) }).subscribe(response => {
        const titles: string[] = [];
        response.query.random.forEach(random => titles.push(random.title));
        observer.next(titles);
        observer.complete();
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
