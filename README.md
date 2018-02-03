# Shit Is Hot

## Install

Install [Node.js® and npm](https://nodejs.org/en/download/) if they are not already on your machine. `brew install node` is recommended on macOS.

```
npm install
```

## Start

```
npm run start
```

The run script `start` executes `ng serve` with `open` option.

The `ng serve` command launches the server, watches your files, and rebuilds the app as you make changes to those files.

Using the `--open` (or just `-o`) option will automatically open your browser on `[http://localhost:4200/](http://localhost:4200/)`.

## Deploy

This project is hosted on GitHub Pages and uses [angular-cli-ghpages](https://github.com/angular-schule/angular-cli-ghpages) to publish it.

```
npm run deploy
```

The run script `deploy` executes
- `ng build` with `prod` environment and base-href `shitishot` (change it if your repository name is different),
- `echo "shitishot.de" > dist/CNAME` (see [FAQ of angular-cli-ghpages](https://github.com/angular-schule/angular-cli-ghpages/wiki/FAQ#my-cname-file-is-deleted-on-every-publish-specific-to-github-pages-only)), and
- `ngh` (short for `angular-cli-ghpages`) to publish the output at `dist` into the `gh-pages` branch.

## Scripts

```json
"scripts": {
  "ng": "ng",
  "start": "ng serve --open",
  "deploy": "ng build --prod --base-href \"/shitishot/\" && echo \"shitishot.de\" > dist/CNAME && ngh",
  "lint": "ng lint"
}
```
