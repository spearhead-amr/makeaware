# Makeaware officail website

Using stories and data sharing to empower people in the fight against antimicrobial resistance.

## Development

### branches

#### main

It is the official branch that is the online website:
https://github.com/spearhead-amr/makeaware

#### dev

Old repo built during the project

#### dev-final

Final and updated version of the repo

### Merging process

The `dev` or the `dev-final` branches once are merged into the `main` branch will update the website visible at https://github.com/spearhead-amr/makeaware

### Dev-final structure and organization

#### assets folder

It contains the **css**, **fonts**, **js** and **stylus** files.

#### components folder

It contains the partial html files like **header.hml**, **footer.html** etc. that are included in the other pages

#### .html pages

The website pages are stored in the root path of the repo, and are named after the page title itself. Example: `stories.html` corresponds to the url `https://github.com/spearhead-amr/makeaware/stories.html`

#### style

## Development environment setup

1. Install [Node.js](https://nodejs.org)
2. Install all the packages listed in `package.json` by running `$ npm install` in the terminal

## Build and serve (gulp)

Start the local server by running `gulp` in the terminal. It will build the `assets/css/main.css` file from the stylus files, and serve the website locally, usually at `localhost:3000`.

Every time the stylus files are changed, the `main.css` is updated and the page refreshed.