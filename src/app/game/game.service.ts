import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SearchResultsService } from '../search-results/search-results.service';
import { SearchResultsSource } from '../search-results/source.enum';
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
   * @param languageCode Language code that should be used. If `null`, language code will be derived from the language that's set in the settings.
   * @param source Source for search results that should be used. If `null`, source will be the one that's set in the settings.
   * @param progressObserver Progress observer, calls next for each word until the limit is reached.
   */
  newGame(limit: number, titles?: string[], languageCode?: string, source?: SearchResultsSource, progressObserver?: Observer<number>): Observable<Game> {
    if (limit < 0) {
      limit = 5;
    }
    const locale = languageCode ? this.settingsService.getLocale(languageCode) : this.settingsService.getCurrentLocale();
    const searchResultsSource = source || this.settingsService.getSearchResultsSource();
    return Observable.create((observer: Observer<Game>) => {
      const words: { [index: number]: Word } = {};
      let indexOffset = 0;
      // Truncate titles if the number of titles is beyond the limit.
      if (titles && titles.length > limit) {
        titles.length = limit;
      }
      // Process titles that should be used.
      if (titles) {
        this.processTitles(limit, titles, locale, searchResultsSource, indexOffset, words, observer, progressObserver);
        indexOffset += titles.length;
      }
      // Get more titles if necessary and process them.
      const getTitlesLimit = titles ? limit - titles.length : limit;
      if (getTitlesLimit > 0) {
        const titlesSource = this.settingsService.getTitlesSource();
        this.titlesService.getTitles(titlesSource, getTitlesLimit, locale.languageCode).subscribe(remainingTitles => {
          this.processTitles(limit, remainingTitles, locale, searchResultsSource, indexOffset, words, observer, progressObserver);
          indexOffset += remainingTitles.length;
        }, (error: Error) => {
          console.error('Unable to get titles');
          observer.error(error);
        });
      }
    });
  }

  private processTitles(limit: number, titles: string[], locale: Locale, searchResultsSource: SearchResultsSource, indexOffset: number, words: { [index: number]: Word }, observer: Observer<Game>, progressObserver?: Observer<number>) {
    let progress = indexOffset;
    titles.forEach((title, index) => this.searchResultsService.getSearchResults(searchResultsSource, title, locale.languageCode).pipe(finalize(() => {
      if (progressObserver) {
        progress++;
        progressObserver.next(progress);
      }
      if (Object.keys(words).length === limit) {
        if (progressObserver) {
          progressObserver.complete();
        }
        observer.next(new Game(Object.values(words), locale.languageCode, searchResultsSource));
        observer.complete();
      }
    })).subscribe(searchResults => {
      words[indexOffset + index] = new Word(title, searchResults);
    }, (error: Error) => {
      words[indexOffset + index] = new Word(title, -1);
      console.error(`Unable to get number of search results for: ${title}`);
      observer.error(error);
    }));
  }

}
