import { HttpClient, HttpErrorResponse, HttpParameterCodec, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

class CustomHttpUrlEncodingCodec implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }
  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }
  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }
  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}

export class AllOriginsError extends Error {
  httpCode: number;
  constructor(message: string, httpCode: number = -1) {
    super(`[AllOrigins] ${message}`);
    Object.setPrototypeOf(this, AllOriginsError.prototype);
    this.httpCode = httpCode;
  }
}

interface AllOriginsResponse {
  contents: string;
  status: {
    http_code: number;
  };
}

@Injectable()
export class AllOriginsService {

  // https://medium.freecodecamp.org/client-side-web-scraping-with-javascript-using-jquery-and-regex-5b57a271cb86
  // https://multiverso.me/AllOrigins/
  private url = 'https://ssl.setolabs.com/allorigins/get';

  constructor(private http: HttpClient) { }

  /**
   * Get contents of specified URL via All Origins to bypass cross-origin bullshit.
   * @param url URL
   */
  getContents(url: string): Observable<string> {
    return Observable.create((observer: Observer<string>) => {
      const params = new HttpParams({
        fromObject: {
          url: url
        },
        encoder: new CustomHttpUrlEncodingCodec()
      });
      this.http.get<AllOriginsResponse>(this.url, { params: params }).subscribe(response => {
        if (response.contents) {
          observer.next(response.contents);
          observer.complete();
        } else if (response.status && response.status.http_code) {
          observer.error(new AllOriginsError('Unable to load contents', response.status.http_code));
        } else {
          observer.error(new AllOriginsError('Unable to load contents'));
        }
      }, (error: HttpErrorResponse) => observer.error(this.handleHttpErrorResponse(error)));
    });
  }

  private handleHttpErrorResponse(error: HttpErrorResponse) {
    if (error.error instanceof Error) {
      console.error('An error occurred:', error.error.message);
      return new AllOriginsError(`An error occurred: ${error.error.message}`);
    } else {
      console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
      return new AllOriginsError(`Backend returned code ${error.status}`);
    }
  }

}
