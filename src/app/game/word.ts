export class Word {
  title: string;
  searchResults: number;

  constructor(title: string, searchResults: number) {
    this.title = title;
    this.searchResults = searchResults;
  }
}
