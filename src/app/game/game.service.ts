import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/operator/finally';

import { SearchResultsService } from '../search-results/search-results.service';
import { Locale, SettingsService } from '../settings/settings.service';
import { TitlesService } from '../titles/titles.service';

import { Game } from './game';
import { Word } from './word';

@Injectable()
export class GameService {

  constructor(private settingsService: SettingsService, private titlesService: TitlesService, private searchResultsService: SearchResultsService) { }

  /**
   * Begin a new game.
   * @param limit Limit how many words will be returned. Defaults to 5 if limit is negative.
   * @param titles Titles that should be used. If `null`, titles will be loaded from the source that's set in the settings. If the number of titles is below the limit, additional titles will be loaded from the source. If the number of titles is beyond the limit, only the titles up to the limit will be used.
   * @param progressObserver Progress observer, calls next for each word until the limit is reached.
   */
  newGame(limit: number, titles: string[] = null, progressObserver: Observer<number> = null): Observable<Game> {
    if (limit < 0) {
      limit = 5;
    }
    const locale = this.settingsService.getCurrentLocale();
    return Observable.create((observer: Observer<Game>) => {
      const words: { [index: number]: Word } = {};
      var indexOffset = 0;
      // Truncate titles if the number of titles is beyond the limit.
      if (titles && titles.length > limit) {
        titles.length = limit;
      }
      // Process titles that should be used.
      if (titles) {
        this.processTitles(limit, titles, indexOffset, locale, words, observer, progressObserver);
        indexOffset += titles.length;
      }
      // Get more titles if necessary and process them.
      const getTitlesLimit = titles ? limit - titles.length : limit;
      if (getTitlesLimit > 0) {
        const source = this.settingsService.getTitlesSource();
        this.titlesService.getTitles(source, getTitlesLimit, locale.languageCode).subscribe(titles => {
          this.processTitles(limit, titles, indexOffset, locale, words, observer, progressObserver);
          indexOffset += titles.length;
        }, (error: Error) => {
          console.error('Unable to get titles');
          observer.error(error);
        });
      }
    });
  }

  private processTitles(limit: number, titles: string[], indexOffset: number, locale: Locale, words: { [index: number]: Word }, observer: Observer<Game>, progressObserver: Observer<number> = null) {
    var progress = indexOffset;
    const source = this.settingsService.getSearchResultsSource();
    titles.forEach((title, index) => this.searchResultsService.getSearchResults(source, title, locale.languageCode).finally(() => {
      if (progressObserver) {
        progress++;
        progressObserver.next(progress);
      }
      if (Object.keys(words).length == limit) {
        if (progressObserver) {
          progressObserver.complete();
        }
        observer.next(new Game(locale.languageCode, Object.values(words)));
        observer.complete();
      }
    }).subscribe(searchResults => {
      words[indexOffset + index] = new Word(title, searchResults);
    }, (error: Error) => {
      words[indexOffset + index] = new Word(title, -1);
      console.error(`Unable to get number of search results for: ${title}`);
      observer.error(error);
    }));
  }

}
