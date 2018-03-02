import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Locale, SettingsService, WordSearchResultsSource, WordTitleSource } from '../settings/settings.service';

import { BingService } from './bing.service';
import { Game } from './game';
import { GoogleService } from './google.service';
import { WikipediaService } from './wikipedia.service';
import { Word } from './word';

@Injectable()
export class GameService {

  constructor(private settingsService: SettingsService, private googleService: GoogleService, private bingService: BingService, private wikipediaService: WikipediaService) { }

  /**
   * Begin a new game.
   * @param limit Limit how many words will be returned. Defaults to 5 if limit is negative.
   * @param languageCode Language code, see [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes). If `null`, current language will be used.
   * @param titles Titles that should be used. If `null`, titles will be loaded from the source that's set in the settings. If the number of titles is below the limit, additional titles will be loaded from the source. If the number of titles is beyond the limit, only the titles up to the limit will be used.
   */
  newGame(limit: number, languageCode: string = null, titles: string[] = null): Observable<Game> {
    if (limit < 0) {
      limit = 5;
    }
    const locale = languageCode
      ? this.settingsService.getLocale(languageCode)
      : this.settingsService.getCurrentLocale();
    return Observable.create((observer: Observer<Game>) => {
      const words: Word[] = [];
      // Truncate titles if the number of titles is beyond the limit.
      if (titles && titles.length > limit) {
        titles.length = limit;
      }
      // Process titles that should be used.
      if (titles) {
        this.newGameStep(locale, titles, words, limit, observer);
      }
      // Get more titles if necessary and process them.
      const getTitlesLimit = titles ? limit - titles.length : limit;
      if (getTitlesLimit > 0) {
        this.getTitles(getTitlesLimit, locale).subscribe(titles => this.newGameStep(locale, titles, words, limit, observer), (err: number) => {
          console.error('Unable to get titles');
          observer.error(-1);
          observer.complete();
        });
      }
    });
  }

  private newGameStep(locale: Locale, titles: string[], words: Word[], limit: number, observer: Observer<Game>) {
    titles.forEach(title => this.getSearchResults(title, locale).subscribe(searchResults => {
      words.push(new Word(title, searchResults));
    }, (err: number) => {
      console.error(`Unable to get number of search results for: ${title}`);
      words.push(new Word(title, -1));
    }, () => {
      if (words.length == limit) {
        observer.next(new Game(locale.languageCode, words));
        observer.complete();
      }
    }));
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
