# Changelog

All notable changes to this project are documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.2.0] — 2026-10-08

### Added
- Default theme per Modern Amusement / Bielefeld design tokens, rendered **minimal / brutalist**: warm-brown solid palette (background `#F1ECE8`, text `#4B1800`, accent `#754D3A`, hover `#DCD1CB`, borders `#C7B7AE`), hard `2px` lines, square corners (badge pill `99px` only), hard offset shadows, line-separated toggle rows with a `4px` left accent, section-header layout (badge + title + hard bottom line). No glass.
- Bundled **Bricolage Grotesque** variable font (SIL OFL 1.1, 200–800, latin + latin-ext) as the default UI font, with the full Bielefeld typography tokens (tracking `-0.02em`, weights 600/600/500, mono stack for the size value, antialiasing).
- Assets: poster, wordmark, logo and favicon added to `docs/` and `demo/`; poster shown in the README.
- Edge-case hardening: deferred init when called before the body exists, focus trap inside the open panel, RTL-safe `text-align: start`, contrasting styles for form controls in high-contrast mode.
- New test suite `tests/edge.test.js` (early init, double init, empty toggles, missing trigger, corrupt/out-of-range/blocked storage, focus trap, RTL, form-control contrast, degenerate fontScale).

## [1.1.0] — 2026-10-08

### Added
- Font scaling `mode` option (`auto` | `root` | `zoom`): px-based sites now scale via CSS zoom, rem/em-based sites via root font-size. `auto` detects the site's approach. Default `max` raised to 200% (WCAG 1.4.4).
- `scope` option: visual modes now propagate to same-origin iframes and open Shadow DOM roots (`scope: { iframes, shadowDom }`, both default `true`).
- Root filter preservation: a site's own CSS filter on `<html>` is captured and composed with invert/grayscale instead of being replaced.
- New tests: `tests/scope.test.js` (zoom mode, iframe and Shadow DOM propagation, base-filter composition).

### Changed
- Default `zIndex` raised from `99998` to `2147483000` so the toolbar reliably sits above page overlays; still fully configurable.

## [1.0.0] — 2026-10-08

### Added
- Initial release.
- 13 accessibility tools: high contrast, dark mode, grayscale, underline links, highlight links, highlight headings, letter spacing, line height, focus outline, big cursor, reading guide, pause animations, dyslexia-friendly font.
- Font scaling (−/+ steps, configurable min/max) and reset.
- White-label configuration: colors, fonts, position, offsets, z-index, labels (i18n), toggle selection, optional credit block.
- Desktop panel and mobile bottom sheet with backdrop, drag handle and safe-area support.
- Preferences persisted in `localStorage`.
- Auto-init, manual JS API (`init`, `destroy`, `open`, `close`, `getPrefs`, `setPrefs`, `reset`, `toggle`).
- Bundled self-hosted OpenDyslexic font (SIL OFL 1.1) with optional CSS.
- Demo page / live config playground.
- Test suite: Node smoke test, full browser UI suite and API suite (Puppeteer), plus a GitHub Actions workflow that runs them on every push and pull request.
- Bilingual README (English / German).
