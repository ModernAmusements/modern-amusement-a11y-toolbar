# Changelog

All notable changes to this project are documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
