import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { LocalStorage } from '../shared/localstorage.decorator';

import { Game } from './game';
import { GameService } from './game.service';
import { Word } from './word';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  readonly limit = 5;

  @LocalStorage() game: Game;
  @LocalStorage() sortedWords: Word[];
  @LocalStorage() remainingTitles: string[];
  @LocalStorage() nextTitle: string;
  @LocalStorage() titles: string[];
  @LocalStorage() searchResults: number[];
  @LocalStorage([]) results: boolean[];

  loadingGame = false;
  private loadingGameSubscription: Subscription;

  private fixedTitles: string[];
  private draggedTitle: string;
  private draggedTitleIndex = -1;
  private dragOverTitleIndex = -1;
  private dragEnterLeaveCounter = 0;

  url = () => `${window.location.href}#${this.wrapFragment(this.game.words.map(word => word.title))}`;
  private _urlIsCopied: boolean;
  get urlIsCopied() {
    return this._urlIsCopied;
  }
  private urlIsCopiedTimeoutId: number;
  set urlIsCopied(urlIsCopied) {
    this._urlIsCopied = urlIsCopied;
    clearTimeout(this.urlIsCopiedTimeoutId);
    if (urlIsCopied) {
      this.urlIsCopiedTimeoutId = setTimeout(() => this.urlIsCopied = false, 3000);
    }
  }

  constructor(private route: ActivatedRoute, private router: Router, private location: Location, private gameService: GameService) {
    // https://github.com/timruffles/ios-html5-drag-drop-shim/issues/77#issuecomment-261772175
    window.addEventListener('touchmove', () => { });
  }

  ngOnInit() {
    if (!this.game && !window.location.hash) {
      this.newGame();
    }
    this.route.fragment.subscribe(fragment => this.handleFragment(fragment));
  }

  handleFragment(fragment: string) {
    this.location.replaceState('');
    if (fragment) {
      const unwrappedFragment = this.unwrapFragment(fragment);
      if (unwrappedFragment) {
        const titles = unwrappedFragment['t'] ? unwrappedFragment['t'].split(',') : null;
        if (titles) {
          this.newGame(titles);
        }
      }
    }
  }

  newGame(titles: string[] = null) {
    this.loadingGame = true;
    if (this.loadingGameSubscription) {
      this.loadingGameSubscription.unsubscribe();
    }
    this.loadingGameSubscription = this.gameService.newGame(this.limit, titles).subscribe(game => this.initGame(game), (err: number) => {
      // TODO: proper error handling
    }, () => this.loadingGame = false);
  }

  initGame(game: Game) {
    this.game = game;
    this.sortedWords = game.words.slice(0).sort((word1, word2) => word1.searchResults - word2.searchResults);
    this.remainingTitles = game.words.map(word => word.title);
    this.titles = new Array(game.words.length).fill(null);
    this.searchResults = this.sortedWords.map(word => word.searchResults);
    this.results = [];
    this.drawNextTitle();
  }

  drawNextTitle() {
    if (this.remainingTitles.length > 0) {
      this.nextTitle = this.remainingTitles.splice(0, 1)[0];
      this.remainingTitles = this.remainingTitles; // persist remaining titles
    } else {
      this.nextTitle = null;
    }
  }

  updateTitle(title: string, index: number, direction: number) {
    if (this.titles[index] == null) {
      this.titles[index] = title;
      return;
    }
    if (!this.moveTitles(title, index, direction)) {
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

  customGame() {
    this.router.navigate(['custom'], {
      fragment: this.wrapFragment(this.game.words.map(word => word.title))
    });
  }

  // Drag & Drop – Next Title

  onNextTitleDragStart(event) {
    event.dataTransfer.setData('text/plain', this.nextTitle);
    event.dataTransfer.effectAllowed = 'move';
    this.fixedTitles = this.titles.slice(0);
    this.draggedTitle = this.nextTitle;
    this.draggedTitleIndex = -1;
  }

  onNextTitleDragEnter(event) {
    // https://github.com/timruffles/ios-html5-drag-drop-shim#polyfill-requires-dragenter-listener
    event.preventDefault();
    this.dragEnterLeaveCounter++;
  }

  onNextTitleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    this.fixedTitles.forEach((fixedTitle, fixedIndex) => {
      this.titles[fixedIndex] = fixedTitle;
    });
    this.dragOverTitleIndex = -1;
  }

  onNextTitleDragLeave() {
    this.dragEnterLeaveCounter--;
    if (this.dragEnterLeaveCounter == 0) {
      this.fixedTitles.forEach((fixedTitle, fixedIndex) => {
        this.titles[fixedIndex] = fixedTitle;
      });
      this.dragOverTitleIndex = -1;
    }
  }

  onNextTitleDragEnd() {
    const didDropOverTitle = this.dragOverTitleIndex != -1;
    this.draggedTitle = null;
    this.draggedTitleIndex = -1;
    this.dragOverTitleIndex = -1;
    this.dragEnterLeaveCounter = 0;
    this.titles = this.titles; // persist titles
    if (didDropOverTitle) {
      this.drawNextTitle();
    }
  }

  onNextTitleDrop(event) {
    event.preventDefault();
  }

  // Drag & Drop – Title

  onTitleDragStart(event, index: number) {
    event.dataTransfer.setData('text/plain', this.titles[index]);
    event.dataTransfer.effectAllowed = 'move';
    this.fixedTitles = this.titles.slice(0);
    this.draggedTitle = this.titles[index];
    this.draggedTitleIndex = index;
  }

  onTitleDragEnter(event) {
    // https://github.com/timruffles/ios-html5-drag-drop-shim#polyfill-requires-dragenter-listener
    event.preventDefault();
    this.dragEnterLeaveCounter++;
  }

  onTitleDragOver(event, index: number) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    this.fixedTitles.forEach((fixedTitle, fixedIndex) => {
      this.titles[fixedIndex] = this.draggedTitleIndex != fixedIndex ? fixedTitle : null;
    });
    this.dragOverTitleIndex = index;
    const targetRect = event.target.getBoundingClientRect();
    const direction = window.innerWidth >= 576
      ? (targetRect.right - event.clientX < event.clientX - targetRect.left ? -1 : 1)
      : (targetRect.bottom - event.clientY < event.clientY - targetRect.top ? -1 : 1);
    this.updateTitle(this.draggedTitle, index, direction);
  }

  onTitleDragLeave() {
    this.dragEnterLeaveCounter--;
    if (this.dragEnterLeaveCounter == 0) {
      this.fixedTitles.forEach((fixedTitle, fixedIndex) => {
        this.titles[fixedIndex] = fixedTitle;
      });
      this.dragOverTitleIndex = -1;
    }
  }

  onTitleDragEnd() {
    this.draggedTitle = null;
    this.draggedTitleIndex = -1;
    this.dragOverTitleIndex = -1;
    this.dragEnterLeaveCounter = 0;
    this.titles = this.titles; // persist titles
  }

  onTitleDrop(event) {
    event.preventDefault();
  }

  // URL Fragment Utilities

  unwrapFragment(fragment: string): { [key: string]: string } {
    // https://stackoverflow.com/a/5647103/1759462
    return fragment
      .split('&')
      .map(el => el.split('='))
      .reduce((pre, cur) => { pre[cur[0]] = decodeURIComponent(cur[1]); return pre; }, {});
  }

  wrapFragment(titles: string[]): string {
    const fragment: { [key: string]: string } = {};
    if (titles) {
      fragment['t'] = titles.map(title => encodeURIComponent(title)).join(',');
    }
    return Object.entries(fragment)
      .map(query => `${query[0]}=${query[1]}`)
      .join('&');
  }

}
