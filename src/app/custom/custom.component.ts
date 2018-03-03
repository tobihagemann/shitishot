import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { Word } from '../game/word';

import { CustomService } from './custom.service';

@Component({
  selector: 'app-custom',
  templateUrl: './custom.component.html'
})
export class CustomComponent implements OnInit {

  readonly limit = 5;

  words: Word[] = [];
  titleSubscriptions: Subscription[] = [];
  titleObservers: { [index: number]: Observer<string> } = {};

  constructor(private route: ActivatedRoute, private router: Router, private location: Location, private customService: CustomService) { }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => this.initWords(this.getTitlesFromFragment(fragment)));
  }

  initWords(titles: string[] = null) {
    this.resetWords();
    var indexOffset = 0;
    // Truncate titles if the number of titles is beyond the limit.
    if (titles && titles.length > this.limit) {
      titles.length = this.limit;
    }
    // Process titles that should be used.
    if (titles) {
      this.processTitles(titles, indexOffset);
      indexOffset += titles.length;
    }
    // Fill with empty titles if necessary and process them.
    const emptyTitlesLimit = titles ? this.limit - titles.length : this.limit;
    if (emptyTitlesLimit > 0) {
      const emptyTitles = new Array(emptyTitlesLimit).fill('');
      this.processTitles(emptyTitles, indexOffset);
      indexOffset += emptyTitlesLimit;
    }
  }

  processTitles(titles: string[], indexOffset: number) {
    titles.forEach((title, index) => {
      this.addWord(new Word(title, -1));
      this.titleObservers[indexOffset + index].next(title);
    });
  }

  resetWords() {
    this.words = [];
    this.titleSubscriptions.forEach(subscription => subscription.unsubscribe());
    this.titleSubscriptions = [];
  }

  addWord(word: Word) {
    const index = this.words.length;
    this.words.push(word);
    this.titleSubscriptions.push(Observable.create((observer: Observer<string>) => this.titleObservers[index] = observer)
      .debounceTime(1000)
      .distinctUntilChanged()
      .subscribe(title => {
        if (title.length > 0) {
          this.customService.getSearchResults(title).subscribe(searchResults => word.searchResults = searchResults, (err: number) => word.searchResults = -1);
        } else {
          word.searchResults = -1;
        }
      }));
  }

  getTitlesFromFragment(fragment: string) {
    this.location.replaceState('custom');
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

  onTitleChange(index: number, title: string) {
    this.titleObservers[index].next(title);
  }

  playGame() {
    this.router.navigate([''], {
      fragment: this.wrapFragment(this.words.map(word => word.title))
    });
  }

  reset() {
    this.initWords();
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
