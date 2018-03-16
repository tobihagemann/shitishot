import { SearchResultsSource } from "../search-results/source.enum";

import { Word } from "./word";

export class Game {
  words: Word[];
  languageCode: string;
  searchResultsSource: SearchResultsSource

  constructor(words: Word[], languageCode: string, searchResultsSource: SearchResultsSource) {
    this.words = words;
    this.languageCode = languageCode;
    this.searchResultsSource = searchResultsSource;
  }
}
