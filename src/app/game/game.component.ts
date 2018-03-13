import { Component, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscriber } from 'rxjs/Subscriber';
import { Subscription } from 'rxjs/Subscription';

import { NgbPopover, NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';

import { LocalStorage } from '../shared/localstorage.decorator';

import { Game } from './game';
import { GameService } from './game.service';
import { TutorialState } from './tutorial-state.enum';
import { Word } from './word';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  providers: [NgbPopoverConfig]
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

  alertMessage: string;

  loadingGame = false;
  loadingGameProgress = -1;
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

  @LocalStorage(true) showTutorial: boolean;
  @LocalStorage(TutorialState.NextTitle) tutorialState: TutorialState;
  @ViewChildren(NgbPopover) popovers: QueryList<NgbPopover>;
  @ViewChild('nextTitlePopover') nextTitlePopover: NgbPopover;
  @ViewChild('titlesPopover') titlesPopover: NgbPopover;
  @ViewChild('showResultsPopover') showResultsPopover: NgbPopover;
  @ViewChild('newGamePopover') newGamePopover: NgbPopover;
  @ViewChild('customGamePopover') customGamePopover: NgbPopover;
  @ViewChild('copyURLPopover') copyURLPopover: NgbPopover;
  @ViewChild('sortTitlesPopoverContent') sortTitlesPopoverContent: TemplateRef<any>;
  @ViewChild('evaluateResultsPopoverContent0') evaluateResultsPopoverContent0: TemplateRef<any>;
  @ViewChild('evaluateResultsPopoverContent1') evaluateResultsPopoverContent1: TemplateRef<any>;
  @ViewChild('evaluateResultsPopoverContent2') evaluateResultsPopoverContent2: TemplateRef<any>;
  @ViewChild('evaluateResultsPopoverContent3') evaluateResultsPopoverContent3: TemplateRef<any>;
  @ViewChild('evaluateResultsPopoverContent4') evaluateResultsPopoverContent4: TemplateRef<any>;
  @ViewChild('evaluateResultsPopoverContent5') evaluateResultsPopoverContent5: TemplateRef<any>;

  constructor(private route: ActivatedRoute, private router: Router, private location: Location, private popoverConfig: NgbPopoverConfig, private gameService: GameService) {
    popoverConfig.triggers = '';
    // https://github.com/timruffles/ios-html5-drag-drop-shim/issues/77#issuecomment-261772175
    window.addEventListener('touchmove', () => { });
  }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      const titles = this.getTitlesFromFragment(fragment);
      if (titles || !this.game) {
        this.newGame(titles);
      } else if (this.showTutorial) {
        this.openCurrentTutorialPopover();
      }
    });
  }

  getTitlesFromFragment(fragment: string) {
    this.location.replaceState('');
    if (fragment) {
      const unwrappedFragment = this.unwrapFragment(fragment);
      if (unwrappedFragment) {
        const titles = unwrappedFragment['t'] ? unwrappedFragment['t'].split(',') : null;
        if (titles) {
          return titles;
        }
      }
    }
    return null;
  }

  newGame(titles: string[] = null) {
    this.loadingGame = true;
    if (this.loadingGameSubscription) {
      this.loadingGameSubscription.unsubscribe();
    }
    const progressObserver = new Subscriber<number>(progress => this.loadingGameProgress = progress);
    this.loadingGameSubscription = this.gameService.newGame(this.limit, titles, progressObserver).finally(() => {
      this.loadingGameProgress = -1;
      this.loadingGame = false;
      if (this.showTutorial) {
        this.tutorialState = TutorialState.NextTitle;
        this.openCurrentTutorialPopover()
      }
    }).subscribe(game => this.initGame(game), (error: Error) => {
      this.alertMessage = error.message;
      this.resetGame();
    });
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

  resetGame() {
    this.game = null;
    this.sortedWords = null;
    this.remainingTitles = null;
    this.nextTitle = null;
    this.titles = null;
    this.searchResults = null;
    this.results = null;
  }

  drawNextTitle() {
    if (this.remainingTitles.length > 0) {
      this.nextTitle = this.remainingTitles.splice(0, 1)[0];
      this.remainingTitles = this.remainingTitles; // persist remaining titles
    } else {
      this.nextTitle = null;
      this.finishNextTitleBreakTutorialState();
      this.finishSortTitlesTutorialState();
      this.finishSortTitlesBreakTutorialState();
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
    this.finishShowResultsTutorialState();
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
    this.finishNextTitleTutorialState();
    this.finishSortTitlesTutorialState();
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
      this.finishNextTitleBreakTutorialState();
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
    this.finishSortTitlesTutorialState();
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

  // URL Fragment

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

  // Tutorial

  openCurrentTutorialPopover() {
    if (this.showTutorial) {
      setTimeout(() => {
        const popover = this.currentTutorialPopover();
        if (popover) {
          popover.open();
        }
      }, 1);
    }
  }

  currentTutorialPopover() {
    switch (this.tutorialState) {
      case TutorialState.NextTitle:
        return this.nextTitlePopover;
      case TutorialState.NextTitleBreak:
        return null;
      case TutorialState.SortTitles:
        return this.titlesPopover;
      case TutorialState.SortTitlesBreak:
        return null;
      case TutorialState.ShowResults:
        return this.showResultsPopover;
      case TutorialState.EvaluateResults:
        return this.titlesPopover;
      case TutorialState.NewGame:
        return this.newGamePopover;
      case TutorialState.CustomGame:
        return this.customGamePopover;
      case TutorialState.CopyURL:
        return this.copyURLPopover;
    }
  }

  closeTutorialPopovers() {
    this.popovers.forEach(popover => popover.close());
  }

  nextTitlePopoverPlacement() {
    return window.innerWidth >= 576 ? 'right' : 'bottom';
  }

  titlesPopoverPlacement() {
    return this.tutorialState == TutorialState.SortTitles ? 'top' : 'bottom';
  }

  showResultsPopoverPlacement() {
    return window.innerWidth >= 576 ? 'right' : 'top';
  }

  newGamePopoverPlacement() {
    return window.innerWidth >= 576 ? 'left' : 'top';
  }

  customGamePopoverPlacement() {
    return window.innerWidth >= 576 ? 'right' : 'top';
  }

  titlesPopoverContent() {
    if (this.tutorialState == TutorialState.SortTitles) {
      return this.sortTitlesPopoverContent;
    } else if (this.tutorialState == TutorialState.EvaluateResults) {
      return this.evaluateResultsPopoverContent();
    }
  }

  evaluateResultsPopoverContent() {
    const numberOfMatches = this.results.reduce((pre, cur) => { if (cur) { pre++; } return pre; }, 0);
    switch (numberOfMatches) {
      case 0:
        return this.evaluateResultsPopoverContent0;
      case 1:
        return this.evaluateResultsPopoverContent1;
      case 2:
        return this.evaluateResultsPopoverContent2;
      case 3:
        return this.evaluateResultsPopoverContent3;
      case 4:
        return this.evaluateResultsPopoverContent4;
      case 5:
        return this.evaluateResultsPopoverContent5;
      default:
        return null;
    }
  }

  setNextTutorialState(state: TutorialState) {
    this.tutorialState = state;
    this.closeTutorialPopovers();
    this.openCurrentTutorialPopover();
  }

  finishNextTitleTutorialState() {
    if (this.tutorialState == TutorialState.NextTitle) {
      this.setNextTutorialState(TutorialState.NextTitleBreak);
    }
  }

  finishNextTitleBreakTutorialState() {
    if (this.tutorialState == TutorialState.NextTitleBreak) {
      this.setNextTutorialState(TutorialState.SortTitles);
    }
  }

  finishSortTitlesTutorialState() {
    if (this.tutorialState == TutorialState.SortTitles) {
      this.setNextTutorialState(TutorialState.SortTitlesBreak);
    }
  }

  finishSortTitlesBreakTutorialState() {
    if (this.tutorialState == TutorialState.SortTitlesBreak) {
      this.setNextTutorialState(TutorialState.ShowResults);
    }
  }

  finishShowResultsTutorialState() {
    if (this.tutorialState == TutorialState.ShowResults) {
      this.setNextTutorialState(TutorialState.EvaluateResults);
    }
  }

  finishEvaluateResultsTutorialState() {
    if (this.tutorialState == TutorialState.EvaluateResults) {
      this.setNextTutorialState(TutorialState.NewGame);
    }
  }

  finishNewGameTutorialState() {
    if (this.tutorialState == TutorialState.NewGame) {
      this.setNextTutorialState(TutorialState.CustomGame);
    }
  }

  finishCustomGameTutorialState() {
    if (this.tutorialState == TutorialState.CustomGame) {
      this.setNextTutorialState(TutorialState.CopyURL);
    }
  }

  finishCopyURLTutorialState() {
    if (this.tutorialState == TutorialState.CopyURL) {
      this.finishTutorial()
    }
  }

  finishTutorial() {
    this.showTutorial = false;
    this.tutorialState = TutorialState.NextTitle;
    this.closeTutorialPopovers();
  }

}
