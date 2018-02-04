import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { GoogleService } from './google.service';
import { WikipediaService } from './wikipedia.service';
import { Word } from './word';

@Injectable()
export class GameService {

  constructor(private googleService: GoogleService, private wikipediaService: WikipediaService) { }

  /**
   * Begin a new game.
   * @param limit Limit how many words will be returned.
   * @param languageCode Language code, see [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
   */
  newGame(limit: number, languageCode: string): Observable<Word[]> {
    return Observable.create((observer: Observer<Word[]>) => {
      this.wikipediaService.getRandomTitles(limit, languageCode)
        .subscribe(titles => {
          const words: Word[] = [];
          titles.forEach(title => this.googleService.getSearchResults(title, languageCode)
            .subscribe(searchResults => {
              words.push(new Word(title, searchResults));
            }, (err: string) => {
              // TODO: proper error handling
              console.error(err);
            })
          );
          observer.next(words);
          observer.complete();
        });
    });
  }

}
