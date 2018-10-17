import { Injectable } from '@angular/core';
import { Observable, Observer, of, throwError, zip } from 'rxjs';
import { catchError, delay, finalize, map, mergeMap } from 'rxjs/operators';
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
    return this.getCompleteTitles(limit, locale, titles).pipe(
      mergeMap(completeTitles => this.getWords(completeTitles, locale, searchResultsSource, progressObserver)),
      map(words => new Game(words, locale.languageCode, searchResultsSource))
    );
  }

  private getCompleteTitles(limit: number, locale: Locale, titles?: string[]) {
    // Make sure titles always exists.
    if (!titles) {
      titles = [];
    }
    // Truncate titles if the number of titles is beyond the limit.
    if (titles.length > limit) {
      titles.length = limit;
    }
    // Finish if titles is already at the limit.
    if (titles.length === limit) {
      return of(titles);
    }
    // Get remaining titles.
    const titlesSource = this.settingsService.getTitlesSource();
    return this.titlesService.getTitles(titlesSource, limit - titles.length, locale.languageCode).pipe(
      map(remainingTitles => [...titles, ...remainingTitles]),
      catchError(_ => throwError(new Error('Unable to get titles')))
    );
  }

  private getWords(titles: string[], locale: Locale, source: SearchResultsSource, progressObserver?: Observer<number>) {
    let progress = 0;
    let rateLimitingDelay = 0;
    const getWords = titles.map(title => {
      const getWord = of(null).pipe(
        delay(rateLimitingDelay), // Adding delay for rate limiting to prevent HTTP error 429 from backend.
        mergeMap(_ => this.getWordByLoadingSearchResults(title, locale, source)),
        finalize(() => {
          if (progressObserver) {
            progress++;
            progressObserver.next(progress);
          }
        })
      );
      rateLimitingDelay += 1000;
      return getWord;
    });
    return zip(...getWords).pipe(
      finalize(() => {
        if (progressObserver) {
          progressObserver.complete();
        }
      })
    );
  }

  private getWordByLoadingSearchResults(title: string, locale: Locale, source: SearchResultsSource) {
    return this.searchResultsService.getSearchResults(source, title, locale.languageCode).pipe(
      map(searchResults => new Word(title, searchResults)),
      catchError((error: Error) => {
        console.error(`Unable to get number of search results for: ${title}, error: ${error.message}`);
        return of(new Word(title, -1));
      })
    );
  }

}
