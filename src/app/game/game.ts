import { SearchResultsSource } from "../search-results/source.enum";

import { Word } from "./word";

export class Game {
  words: Word[];
  languageCode: string;
  source: SearchResultsSource

  constructor(words: Word[], languageCode: string, source: SearchResultsSource) {
    this.words = words;
    this.languageCode = languageCode;
    this.source = source;
  }
}
