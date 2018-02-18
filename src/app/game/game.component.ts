import { Component } from '@angular/core';

import { LocaleService } from 'angular-l10n';

import { LocalStorage } from '../shared/localstorage.decorator';

import { GameService } from './game.service';
import { Word } from './word';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {

  @LocalStorage([]) words: Word[];
  @LocalStorage() sortedWords: Word[];
  @LocalStorage() remainingTitles: string[];
  @LocalStorage() nextTitle: string;
  @LocalStorage() titles: string[];
  @LocalStorage() searchResults: number[];
  @LocalStorage([]) results: boolean[];

  private fixedTitles: string[];
  private dragOverTitleIndex = -1;

  constructor(private localeService: LocaleService, private gameService: GameService) {
    // https://github.com/timruffles/ios-html5-drag-drop-shim/issues/77#issuecomment-261772175
    window.addEventListener('touchmove', () => { });
  }

  newGame() {
    const language = this.localeService.getCurrentLanguage();
    this.gameService.newGame(5, language)
      .subscribe(words => this.initGame(words), (err: number) => {
        // TODO: proper error handling
      });
  }

  initGame(words: Word[]) {
    this.words = words;
    this.sortedWords = words.slice(0).sort((word1, word2) => word1.searchResults - word2.searchResults);
    this.remainingTitles = words.map(word => word.title);
    this.titles = new Array(words.length).fill(null);
    this.searchResults = this.sortedWords.map(word => word.searchResults);
    this.results = [];
    this.drawNextTitle();
  }

  drawNextTitle() {
    if (this.remainingTitles.length > 0) {
      this.nextTitle = this.remainingTitles.pop();
      this.remainingTitles = this.remainingTitles; // persist reminaing titles
    } else {
      this.nextTitle = null;
    }
  }

  updateTitle(title: string, index: number, direction: number) {
    if (this.titles[index] == null) {
      this.titles[index] = title;
      return;
    }
    const foo = this.moveTitles(title, index, direction);
    if (!foo) {
      this.moveTitles(title, index, -direction);
    }
  }

  moveTitles(title: string, index: number, direction: number): boolean {
    for (let i = index; i >= 0 && i < this.titles.length; i += direction) {
      if (this.titles[i] == null) {
        for (let j = i; j != index; j -= direction) {
          this.titles[j] = this.titles[j - direction];
        }
        this.titles[index] = title;
        return true;
      }
    }
    return false;
  }

  showResults() {
    const results: boolean[] = [];
    this.titles.forEach((title, index) => {
      results.push(this.sortedWords[index].title == title);
    });
    this.results = results;
  }

  // Drag & Drop – Next Title

  onNextTitleDragStart(event) {
    event.dataTransfer.effectAllowed = 'move';
    this.fixedTitles = this.titles.slice(0);
  }

  onNextTitleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    this.fixedTitles.forEach((fixedTitle, fixedIndex) => {
      this.titles[fixedIndex] = fixedTitle;
    });
    this.dragOverTitleIndex = -1;
  }

  onNextTitleDragEnd(event) {
    const didDropOnTitle = this.dragOverTitleIndex != -1 && event.dataTransfer.dropEffect != 'none';
    this.dragOverTitleIndex = -1;
    this.titles = this.titles; // persist titles
    if (didDropOnTitle) {
      this.drawNextTitle();
    }
  }

  // Drag & Drop – Title

  onTitleDragStart(event, index: number) {
    event.dataTransfer.effectAllowed = 'move';
    this.fixedTitles = this.titles.slice(0);
  }

  onTitleDragOver(event, index: number) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    this.fixedTitles.forEach((fixedTitle, fixedIndex) => {
      this.titles[fixedIndex] = fixedTitle;
    });
    this.dragOverTitleIndex = index;
    this.updateTitle(this.nextTitle, index, -1); // TODO: set preferred direction
  }

  onTitleDragEnd(event) {
    this.dragOverTitleIndex = -1;
    this.titles = this.titles; // persist titles
  }

  // Drag & Drop – Common

  preventDefaultEvent(event) {
    // https://github.com/timruffles/ios-html5-drag-drop-shim#polyfill-requires-dragenter-listener
    event.preventDefault();
  }

}
