import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Locale, SettingsService, WordSearchResultsSource, WordTitleSource } from '../settings/settings.service';

import { BingService } from './bing.service';
import { GoogleService } from './google.service';
import { WikipediaService } from './wikipedia.service';
import { Word } from './word';

@Injectable()
export class GameService {

  constructor(private settingsService: SettingsService, private googleService: GoogleService, private bingService: BingService, private wikipediaService: WikipediaService) { }

  /**
   * Begin a new game.
   * @param limit Limit how many words will be returned.
   * @param languageCode Language code, see [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
   */
  newGame(): Observable<Word[]> {
    const limit = 5;
    const locale = this.settingsService.getCurrentLocale();
    return Observable.create((observer: Observer<Word[]>) => {
      this.getTitles(limit, locale).subscribe(titles => {
        const words: Word[] = [];
        titles.forEach(title => this.getSearchResults(title, locale).subscribe(searchResults => {
          words.push(new Word(title, searchResults));
          this.newGameStep(observer, words, limit);
        }, (err: number) => {
          console.error(`Unable to get number of search results for: ${title}`);
          words.push(new Word(title, -1));
          this.newGameStep(observer, words, limit);
        }));
      }, (err: number) => {
        console.error('Unable to get titles');
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

  private getTitles(limit: number, locale: Locale) {
    switch (this.settingsService.getWordTitleSource()) {
      case WordTitleSource.WikipediaMostViewed:
        return this.wikipediaService.getMostViewedTitles(limit, locale.languageCode);
      case WordTitleSource.WikipediaRandom:
        return this.wikipediaService.getRandomTitles(limit, locale.languageCode);
      default:
        return this.wikipediaService.getMostViewedTitles(limit, locale.languageCode);
    }
  }

  private getSearchResults(title: string, locale: Locale) {
    switch (this.settingsService.getWordSearchResultsSource()) {
      case WordSearchResultsSource.Google:
        return this.googleService.getSearchResults(title, locale.languageCode);
      case WordSearchResultsSource.Bing:
        return this.bingService.getSearchResults(title, locale.languageCode, locale.countryCode)
      default:
        return this.googleService.getSearchResults(title, locale.languageCode);
    }
  }

}
