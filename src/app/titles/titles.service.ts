import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { TitlesSource } from './source.enum';
import { WikipediaService } from './wikipedia.service';

@Injectable()
export class TitlesService {

  constructor(private wikipediaService: WikipediaService) { }

  /**
   * Get titles from given source.
   * @param source Source for titles.
   * @param limit Limit how many titles will be returned.
   * @param languageCode Language code.
   */
  getTitles(source: TitlesSource, limit: number, languageCode: string): Observable<string[]> {
    switch (source) {
      case TitlesSource.WikipediaMostViewed:
        return this.wikipediaService.getMostViewedTitles(limit, languageCode);
      case TitlesSource.WikipediaRandom:
        return this.wikipediaService.getRandomTitles(limit, languageCode);
      default:
        return this.wikipediaService.getMostViewedTitles(limit, languageCode);
    }
  }

}
