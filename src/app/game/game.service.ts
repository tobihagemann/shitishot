import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { SettingsService, WordSearchResultsSource, WordTitleSource } from '../settings/settings.service';

import { GoogleService } from './google.service';
import { WikipediaService } from './wikipedia.service';
import { Word } from './word';

@Injectable()
export class GameService {

  constructor(private settingsService: SettingsService, private googleService: GoogleService, private wikipediaService: WikipediaService) { }

  /**
   * Begin a new game.
   * @param limit Limit how many words will be returned.
   * @param languageCode Language code, see [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
   */
  newGame(): Observable<Word[]> {
    const limit = 5;
    const languageCode = this.settingsService.getLocale().languageCode;
    return Observable.create((observer: Observer<Word[]>) => {
      this.getRandomTitles(limit, languageCode).subscribe(titles => {
        const words: Word[] = [];
        titles.forEach(title => this.getSearchResults(title, languageCode).subscribe(searchResults => {
          words.push(new Word(title, searchResults));
          this.newGameStep(observer, words, limit);
        }, (err: number) => {
          console.error(`Unable to get number of search results for: ${title}`);
          words.push(new Word(title, -1));
          this.newGameStep(observer, words, limit);
        }));
      }, (err: number) => {
        console.error('Unable to get random titles');
        observer.error(-1);
        observer.complete();
      });
    });
  }

  private newGameStep(observer: Observer<Word[]>, words: Word[], limit: number) {
    if (words.length == limit) {
      observer.next(words);
      observer.complete();
    }
  }

  private getRandomTitles(limit: number, languageCode: string) {
    switch (this.settingsService.getWordTitleSource()) {
      case WordTitleSource.Wikipedia:
        return this.wikipediaService.getRandomTitles(limit, languageCode);
    }
  }

  private getSearchResults(title: string, languageCode: string) {
    switch (this.settingsService.getWordSearchResultsSource()) {
      case WordSearchResultsSource.Google:
        return this.googleService.getSearchResults(title, languageCode);
    }
  }

}
