# Changelog

All notable changes to this project are documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.3.0] — 2026-10-09

### Added
- **White-label default theme** `whitelabel.css`: neutral black/white/gray palette, 1px wireframe outlines, no offset shadows, square badge, monochrome highlights — load after `a11y-toolbar.css`. The tool keeps its bundled **Alliance No.1** font; generic host-page button typography cannot leak into the panel.
- White-label design system `globals.css` (root) with a full **native form-control layer**: every browser input type and control (text/search/number, date/time family, color, file, range, checkbox, radio, select, textarea, buttons, fieldset, progress, meter) restyled via `:where()` (specificity 0) including WebKit/Firefox pseudo-elements (calendar picker, file picker, spinners, search cancel, slider track/thumb, color swatches), disabled/checked/focus states and autofill. Date/time inputs keep their native picker affordance; `appearance: none` is deliberately not applied there.
- Content-element base typography and layout (headings, copy, links, lists, quotes, code, table, figures, `details/summary`, `address`, `hgroup`, `menu`, `dialog`, `canvas`, `iframe`, embedded media).
- New `demo/whitelabel.html`: logo + wordmark header, hero, stats grid, test areas mirroring every toolbar mode (motion, dark surface, color swatches, reading comfort, keyboard focus, links/headings), a **30 + 50 = 80-element inventory**, native control gallery and the live config playground.
- Self-hosted `@font-face` for Alliance No.1 in `globals.css` — the white-label demo makes no Google Fonts request.

### Changed
- `package.json` ships `whitelabel.css`.
- README documents the white-label theme (EN/DE).

### Fixed
- `.a11y-btn-sm` keeps a full content box under host-page button padding (explicit `padding: 0` in the white-label theme).

## [1.2.1] — 2026-10-09

### Changed
- Default UI font is now **Alliance No.1** (Modern Amusement brand font, self-hosted Regular + Bold; weighs 100–600 / 700–900) instead of Bricolage Grotesque — per user request (fonts from `MA_WEBSITE/public/fonts`).
- Demo site: body/headings use Alliance No.1, brand logo added to the top navigation next to the wordmark (logo + vertical rule + wordmark + vertical rule + label), vertical divider in the navbar, vertical rule in the hero (per `branding.svg` layout).
- Toolbar: the font-size value now sits between two vertical 2px rules (branding layout); toggle rows keep the 4px left accent.
- `branding.svg` (root) documents the target layout; CONTEXT.md/LICENSing notes Alliance No.1 as proprietary MA brand font (not re-licenseable).

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
