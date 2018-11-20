# Splinter
JavaScript library for split HTML text into words and characters.
Ideal for creating text animation on a page.

[![License: MIT](https://img.shields.io/github/license/XAHTEP26/splinter.js.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/splinter.js.svg)](https://www.npmjs.com/package/splinter.js)

## Features
- No dependencies
- Lightweight
- Easy setup

## Installation

### NPM

```
npm install splinter.js
```

### CDN
#### jsDelivr
```html
<script src="https://cdn.jsdelivr.net/npm/splinter.js@latest/build/splinter.min.js"></script>
```

#### unpkg
```html
<script src="https://unpkg.com/splinter.js"></script>
```

### Direct download
Download [latest release](https://github.com/XAHTEP26/splinter.js/releases/latest) and include the script on your page:
```html
<script src="splinter.min.js"></script>
```

## Usage
```html
<div class="content">
  <!-- Text -->
</div>

<script>
const splinter = new Splinter('.content', { mode: 'chars' });
const words = splinter.words; // Array of words
const chars = splinter.chars; // Array of characters
const elements = splinter.elements; // Array of other DOM elements
</script>
```

[Live Demo](https://codepen.io/XAHTEP26/pen/GwEqZw)

## License
[The MIT License](LICENSE)
