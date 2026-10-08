# Changelog

All notable changes to this project are documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
