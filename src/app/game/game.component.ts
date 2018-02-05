import { Component } from '@angular/core';

import { LocaleService } from 'angular-l10n';

import { GameService } from './game.service';
import { Word } from './word';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent {

  private _words: Word[];
  get words() {
    if (this._words) {
      return this._words;
    }
    const words: Word[] = JSON.parse(localStorage.getItem('words'));
    if (words) {
      this._words = words;
      return this._words;
    } else {
      return [];
    }
  }
  set words(words: Word[]) {
    this._words = words;
    localStorage.setItem('words', JSON.stringify(words));
  }

  constructor(private localeService: LocaleService, private gameService: GameService) { }

  newGame() {
    const language = this.localeService.getCurrentLanguage();
    this.gameService.newGame(5, language)
      .subscribe(words => {
        this.words = words;
      }, (err: number) => {
        // TODO: proper error handling
      });
  }

}
