import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { LocalStorage } from '../shared/localstorage.decorator';

interface WikipediaResponse {
  query: {
    mostviewed: [{
      ns: number,
      title: string;
    }];
    random: [{
      title: string;
    }];
  }
}

@Injectable()
export class WikipediaService {

  private url = (languageCode: string) => `https://${languageCode}.wikipedia.org/w/api.php`;
  // https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bmostviewed
  // https://www.mediawiki.org/wiki/Extension:PageViewInfo
  private pvimparams = new HttpParams({
    fromObject: {
      action: 'query',
      format: 'json',
      list: 'mostviewed',
      pvimlimit: '500',
      origin: '*'
    }
  });
  // https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brandom
  // https://www.mediawiki.org/wiki/API:Random
  private rnparams = new HttpParams({
    fromObject: {
      action: 'query',
      format: 'json',
      list: 'random',
      rnnamespace: '0',
      rnlimit: '10',
      origin: '*'
    }
  });

  @LocalStorage({}, 'wikipediaMostViewedTitles') private mostViewedTitles: { [languageCode: string]: string[] };
  @LocalStorage({}, 'wikipediaRandomTitles') private randomTitles: { [languageCode: string]: string[] };

  constructor(private http: HttpClient) { }

  /**
   * Get titles of most viewed articles on Wikipedia.
   * @param limit Limit how many titles will be returned.
   * @param languageCode Language code, see [List of Wikipedias](https://en.wikipedia.org/wiki/List_of_Wikipedias).
   */
  getMostViewedTitles(limit: number, languageCode: string): Observable<string[]> {
    if (!this.mostViewedTitles[languageCode]) {
      this.mostViewedTitles[languageCode] = [];
    }
    return Observable.create((observer: Observer<string[]>) => {
      const complete = () => {
        const titles: string[] = [];
        for (let index = 0; index < limit; index++) {
          titles.push(this.mostViewedTitles[languageCode].splice(0, 1)[0]);
        }
        this.mostViewedTitles = this.mostViewedTitles; // persist most viewed titles
        observer.next(titles);
        observer.complete();
      }
      if (this.mostViewedTitles[languageCode].length >= limit) {
        complete();
      } else {
        this.http.get<WikipediaResponse>(this.url(languageCode), { params: this.pvimparams }).subscribe(response => {
          response.query.mostviewed.forEach(mostviewed => {
            if (mostviewed.ns == 0 && this.validateTitle(mostviewed.title)) {
              this.mostViewedTitles[languageCode].push(mostviewed.title);
            }
          });
          complete();
        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.error('An error occurred:', err.error.message);
          } else {
            console.error(`Backend returned code ${err.status}, body was: ${err.error}`);
          }
          observer.error(err.status);
        });
      }
    });
  }

  /**
   * Get titles of random articles on Wikipedia.
   * @param limit Limit how many titles will be returned.
   * @param languageCode Language code, see [List of Wikipedias](https://en.wikipedia.org/wiki/List_of_Wikipedias).
   */
  getRandomTitles(limit: number, languageCode: string): Observable<string[]> {
    if (!this.randomTitles[languageCode]) {
      this.randomTitles[languageCode] = [];
    }
    return Observable.create((observer: Observer<string[]>) => {
      const complete = () => {
        const titles: string[] = [];
        for (let index = 0; index < limit; index++) {
          titles.push(this.randomTitles[languageCode].splice(0, 1)[0]);
        }
        this.randomTitles = this.randomTitles; // persist random titles
        observer.next(titles);
        observer.complete();
      }
      if (this.randomTitles[languageCode].length >= limit) {
        complete();
      } else {
        this.http.get<WikipediaResponse>(this.url(languageCode), { params: this.rnparams }).subscribe(response => {
          response.query.random.forEach(random => {
            if (this.validateTitle(random.title)) {
              this.randomTitles[languageCode].push(random.title);
            }
          });
          complete();
        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.error('An error occurred:', err.error.message);
          } else {
            console.error(`Backend returned code ${err.status}, body was: ${err.error}`);
          }
          observer.error(err.status);
        });
      }
    });
  }

  private validateTitle(title: string): boolean {
    return title != 'Hauptseite' && title != 'Main Page';
  }

}
