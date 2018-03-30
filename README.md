# :fire: The Shit Is Hot
[![Twitter](https://img.shields.io/badge/twitter-@tobihagemann-blue.svg?style=flat)](https://twitter.com/tobihagemann)
![The Shit Is Hot](shitishot.jpg)

This project is inspired by the segment [Der Scheiß ist heiß](https://www.youtube.com/watch?v=upm6SfYuGX4) on [NEO MAGAZIN ROYALE](https://www.zdf.de/comedy/neo-magazin-mit-jan-boehmermann/). It's derived from _The Price Is Right_ but in this game, you have to guess how many hits the shown words generate in a search engine and then place them in the correct order.

You can play _The Shit Is Hot_ at [shitishot.de](https://shitishot.de).

## Made With

- [Angular](https://angular.io/), project set up with [Angular CLI](https://cli.angular.io/)
- [Bootstrap](https://getbootstrap.com/) with [ng-bootstrap](https://ng-bootstrap.github.io/) directives
- [angular-l10n](https://robisim74.github.io/angular-l10n/)
- [HTML5 Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) with [mobile-drag-drop](http://timruffles.github.io/mobile-drag-drop/demo/) polyfill
- [ngx-clipboard](https://maxisam.github.io/ngx-clipboard/)
- [Font Awesome](https://fontawesome.com/)

Words for new games are generated via Wikipedia. Search results come from Yandex, Google (experimental), and Bing (experimental). Google and Bing are experimental because web scraping is used.

Thanks to Wikipedia's open API, it can be used purely client-side. However, the numbers of search results are (and have to be) retrieved from a backend. The server applications used are:

- [Yandex Search API](https://github.com/tobihagemann/yandex-search-api)
- [All Origins](https://multiverso.me/AllOrigins/)

## Install
Install [Node.js® and npm](https://nodejs.org/en/download/) if they are not already on your machine. `brew install node` is recommended on macOS.

```
npm install
```

## Start
```
npm run start
```

The run script `start` executes `ng serve` with `open` and `aot` options.

The `ng serve` command launches the server, watches your files, and rebuilds the app as you make changes to those files.

Using the `--open` (or just `-o`) option will automatically open your browser on `http://localhost:4200/`.

Using the `--aot` ([Ahead-of-Time](https://angular.io/guide/aot-compiler)) option will compile the app at build time.

## Deploy
This project is hosted on GitHub Pages with a custom domain and uses [angular-cli-ghpages](https://github.com/angular-schule/angular-cli-ghpages) to publish it.

```
npm run deploy
```

The run script `deploy` executes
- `npm install` to ensure dependencies are installed (and in the correction version),
- `ng build` with `prod` environment,
- writing `shitishot.de` into `dist/CNAME` for using a custom domain (see [FAQ of angular-cli-ghpages](https://github.com/angular-schule/angular-cli-ghpages/wiki/FAQ#my-cname-file-is-deleted-on-every-publish-specific-to-github-pages-only)), and
- `ngh` (short for `angular-cli-ghpages`) to publish the output at `dist` into the `gh-pages` branch.

## Scripts
```json
"scripts": {
  "ng": "ng",
  "start": "ng serve --open --aot",
  "deploy": "npm install && ng build --prod && echo \"shitishot.de\" > dist/CNAME && ngh",
  "lint": "ng lint"
}
```

## License
Distributed under the MIT license. See the LICENSE file for more info.
