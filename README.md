**English** | [繁體中文](README.zh-TW.md)

# 🎬 Movies Watchlist

A movie search app built with vanilla HTML, CSS, and JavaScript. Search any title via the [OMDb API](https://www.omdbapi.com/), view full details, and save favorites to a personal watchlist that persists in the browser.

**[Live demo →](https://nathanc90.github.io/movies-watchlist/)**

## Features

- **Search** thousands of movies by title, with paginated results
- **Detail view** — click any movie for its plot, genre, runtime, cast, director, and IMDb rating
- **Watchlist** — add or remove movies with one click; saved locally via `localStorage`, no account needed
- **Dark mode** — toggle persists across visits
- **Responsive** — usable from mobile to desktop

## Tech stack

Plain HTML5, CSS3, and JavaScript (ES6+) — no frameworks, no build step. Data comes from the [OMDb API](https://www.omdbapi.com/).

## Running locally

This is a static site, so any local server works:

```bash
npx serve .
```

Then open the printed `localhost` URL. To use your own OMDb API key, swap the `API_KEY` constant at the top of [`shared.js`](shared.js) — free keys are available instantly at [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx).

## Project structure

```
index.html       search page
watchlist.html   saved movies page
shared.js        storage, movie cards, modal, dark mode — shared by both pages
index.js         search + pagination
watchlist.js     watchlist rendering
styles.css       all styling
images/          icons and assets
```

## Stranger chat (`chat/`)

A separate WooTalk-style app: click 開始聊天 to be randomly paired with an anonymous stranger for a 1-on-1 text chat, with a typing indicator and leave/rematch. Zero dependencies, a Node server using Server-Sent Events. It needs a running server, so it isn't part of the GitHub Pages site.

```bash
node chat/server.mjs   # http://localhost:3000 (set PORT to change)
node chat/test.mjs     # self-check
```

## Credits

Movie data and posters courtesy of [OMDb API](https://www.omdbapi.com/). Originally started as a solo project for [Scrimba](https://scrimba.com/)'s API module.
