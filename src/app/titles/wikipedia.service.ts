import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { LocalStorage } from '../shared/localstorage.decorator';

class WikipediaError extends Error {
  constructor(message: string) {
    super(`[Wikipedia] ${message}`);
    Object.setPrototypeOf(this, WikipediaError.prototype);
  }
}

interface WikipediaResponse {
  query: {
    mostviewed: [{
      ns: number;
      title: string;
    }];
    random: [{
      title: string;
    }];
  };
}

@Injectable()
export class WikipediaService {

  @LocalStorage({}, 'wikipediaMostViewedTitles') private mostViewedTitles: { [languageCode: string]: string[] };
  @LocalStorage({}, 'wikipediaRandomTitles') private randomTitles: { [languageCode: string]: string[] };

  private url = (languageCode: string) => `https://${languageCode}.wikipedia.org/w/api.php`;

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
      };
      if (this.mostViewedTitles[languageCode].length >= limit) {
        complete();
      } else {
        // https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bmostviewed
        // https://www.mediawiki.org/wiki/Extension:PageViewInfo
        const pvimparams = new HttpParams({
          fromObject: {
            action: 'query',
            format: 'json',
            list: 'mostviewed',
            pvimlimit: '500',
            origin: '*'
          }
        });
        this.http.get<WikipediaResponse>(this.url(languageCode), { params: pvimparams }).subscribe(response => {
          response.query.mostviewed.forEach(mostviewed => {
            if (mostviewed.ns === 0 && this.validateTitle(mostviewed.title)) {
              this.mostViewedTitles[languageCode].push(mostviewed.title);
            }
          });
          if (this.mostViewedTitles[languageCode].length < limit) {
            console.error('Insufficient most viewed titles:', this.mostViewedTitles[languageCode].length);
            observer.error(new WikipediaError('Unable to load most viewed titles'));
          } else {
            complete();
          }
        }, (error: HttpErrorResponse) => observer.error(this.handleHttpErrorResponse(error)));
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
      };
      if (this.randomTitles[languageCode].length >= limit) {
        complete();
      } else {
        // https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brandom
        // https://www.mediawiki.org/wiki/API:Random
        const rnparams = new HttpParams({
          fromObject: {
            action: 'query',
            format: 'json',
            list: 'random',
            rnnamespace: '0',
            rnlimit: '10',
            origin: '*'
          }
        });
        this.http.get<WikipediaResponse>(this.url(languageCode), { params: rnparams }).subscribe(response => {
          response.query.random.forEach(random => {
            if (this.validateTitle(random.title)) {
              this.randomTitles[languageCode].push(random.title);
            }
          });
          if (this.randomTitles[languageCode].length < limit) {
            console.error('Insufficient random titles:', this.randomTitles[languageCode].length);
            observer.error(new WikipediaError('Unable to load random titles'));
          } else {
            complete();
          }
        }, (error: HttpErrorResponse) => observer.error(this.handleHttpErrorResponse(error)));
      }
    });
  }

  private validateTitle(title: string): boolean {
    return title !== 'Hauptseite' && title !== 'Main Page';
  }

  private handleHttpErrorResponse(error: HttpErrorResponse) {
    if (error.error instanceof Error) {
      console.error('An error occurred:', error.error.message);
      return new WikipediaError(`An error occurred: ${error.error.message}`);
    } else {
      console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
      return new WikipediaError(`Backend returned code ${error.status}`);
    }
  }

}
