import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

interface AllOriginsResponse {
  contents: string;
}

@Injectable()
export class AllOriginsService {

  // https://medium.freecodecamp.org/client-side-web-scraping-with-javascript-using-jquery-and-regex-5b57a271cb86
  // https://multiverso.me/AllOrigins/
  private url = 'https://allorigins.me/get';
  private params = (url: string) => new HttpParams({
    fromObject: {
      url: url
    }
  });

  constructor(private http: HttpClient) { }

  /**
   * Get contents of specified URL via All Origins to bypass cross-origin bullshit.
   * @param url URL
   */
  getContents(url: string): Observable<string> {
    return Observable.create((observer: Observer<string>) => {
      this.http.get<AllOriginsResponse>(this.url, { params: this.params(url) }).subscribe(response => {
        observer.next(response.contents);
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
