import { Game } from '../game/game';
import { SearchResultsSource } from '../search-results/source.enum';

export class Fragment {
  titles: string[];
  languageCode: string;
  source: SearchResultsSource;

  static createFromGame(game: Game) {
    return new Fragment(game.words.map(word => word.title), game.languageCode, game.source);
  }

  static createFromFragment(fragment?: string) {
    const fragmentObj = new Fragment();
    if (!fragment) {
      return fragmentObj;
    }
    // https://stackoverflow.com/a/5647103/1759462
    const unwrappedFragment = fragment
      .split('&')
      .map(el => el.split('='))
      .reduce((pre, cur) => { pre[cur[0]] = cur[1]; return pre; }, {});
    if (unwrappedFragment['t']) {
      fragmentObj.titles = unwrappedFragment['t'].split(',').map(title => decodeURIComponent(title));
    }
    if (unwrappedFragment['l']) {
      fragmentObj.languageCode = decodeURIComponent(unwrappedFragment['l']);
    }
    if (unwrappedFragment['s']) {
      fragmentObj.source = SearchResultsSource[decodeURIComponent(unwrappedFragment['s'])];
    }
    return fragmentObj;
  }

  constructor(titles?: string[], languageCode?: string, source?: SearchResultsSource) {
    this.titles = titles;
    this.languageCode = languageCode;
    this.source = source;
  }

  toString() {
    const fragment: { [key: string]: string } = {};
    if (this.titles) {
      fragment['t'] = this.titles.map(title => encodeURIComponent(title)).join(',');
    }
    if (this.languageCode) {
      fragment['l'] = encodeURIComponent(this.languageCode);
    }
    if (this.source) {
      fragment['s'] = encodeURIComponent(this.source);
    }
    return Object.entries(fragment)
      .map(entry => `${entry[0]}=${entry[1]}`)
      .join('&');
  }
}
