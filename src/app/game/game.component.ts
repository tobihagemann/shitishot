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
  @LocalStorage([]) remainingTitles: string[];
  @LocalStorage() nextTitle: string;
  @LocalStorage([]) titles: string[];
  @LocalStorage([]) searchResults: number[];

  private nextTitleDragging = false;
  private dragEnterTitleIndex = -1;

  constructor(private localeService: LocaleService, private gameService: GameService) {
    // https://github.com/timruffles/ios-html5-drag-drop-shim/issues/77#issuecomment-261772175
    window.addEventListener('touchmove', () => { });
  }

  newGame() {
    const language = this.localeService.getCurrentLanguage();
    this.gameService.newGame(5, language)
      .subscribe(words => {
        this.words = words;
        this.initGame(words);
      }, (err: number) => {
        // TODO: proper error handling
      });
  }

  initGame(words: Word[]) {
    const sortedWords = words.slice().sort((word1, word2) => word1.searchResults - word2.searchResults);
    this.titles = new Array(words.length);
    this.searchResults = sortedWords.map(word => word.searchResults);
    this.remainingTitles = words.map(word => word.title);
    this.nextStep();
  }

  nextStep() {
    if (this.remainingTitles.length > 0) {
      this.nextTitle = this.remainingTitles.pop();
    } else {
      // TODO: finish game
    }
  }

  onNextTitleDragStart(event) {
    this.nextTitleDragging = true;
    event.dataTransfer.effectAllowed = 'move';
  }

  onNextTitleDragEnd(event) {
    this.nextTitleDragging = false;
    this.dragEnterTitleIndex = -1;
    console.log(event);
  }

  onTitleDragStart(event, index) {
    event.dataTransfer.effectAllowed = 'move';
  }

  onTitleDragEnter(event, index) {
    this.dragEnterTitleIndex = index;
    this.titles[index] = this.nextTitle;
    console.log(event);
  }

  onTitleDragLeave(event, index) {
  }

  onTitleDrop(event, index) {
  }

  onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  preventDefaultEvent(event) {
    // https://github.com/timruffles/ios-html5-drag-drop-shim#polyfill-requires-dragenter-listener
    event.preventDefault();
  }

}
