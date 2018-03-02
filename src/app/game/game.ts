import { Word } from "./word";

export class Game {
  languageCode: string;
  words: Word[];

  constructor(languageCode: string, words: Word[]) {
    this.languageCode = languageCode;
    this.words = words;
  }
}
