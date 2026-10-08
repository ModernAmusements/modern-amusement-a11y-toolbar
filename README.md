# Modern Amusement Accessibility Toolbar

**A dependency-free, white-label accessibility toolbar for any website.**
Free for non-profit organizations. Commercial use requires a commercial license (see [LICENSE](LICENSE)).

[Demonstration & config playground →](demo/index.html) (open locally: `npx serve .` and visit `/demo/`)

| Desktop panel | Mobile bottom sheet |
|---|---|
| ![Desktop panel](docs/screenshot-desktop.png) | ![Mobile bottom sheet](docs/screenshot-mobile.png) |

---

## Why

Many accessibility overlays cost non-profits money every month, phone home, or carry their own branding. This toolbar is:

- **100% self-hosted** — no external requests, no tracking, no telemetry, works offline.
- **White-label** — no branding by default, all labels and colors are yours.
- **Themeable** — colors, fonts, position, radius, labels, and which tools appear are all configurable.
- **Accessible itself** — keyboard operable, ARIA states, focus management, mobile bottom sheet, reduced-motion aware.

## Features

| Tool | Effect |
|---|---|
| High contrast | Black/white/blue palette with strong outlines (real color overrides, not a CSS filter) |
| Dark mode | Inverts the page (root-level filter, toolbar stays readable) |
| Remove colors | Full grayscale |
| Underline links | Forces underlines on all links |
| Highlight links | Yellow highlight on all links |
| Highlight headings | Yellow highlight on all headings |
| More letter spacing | +0.12em tracking |
| More line height | 1.9 line-height |
| Strong focus outline | High-visibility focus ring |
| Big cursor | 32px cursor everywhere |
| Reading guide | Yellow line that follows the pointer |
| Pause animations | Stops animations, transitions and smooth scrolling |
| Dyslexia-friendly font | Switches text to OpenDyslexic (bundled) or your own font |
| Font size | −/+ in configurable steps (80–150% by default) |
| Reset | Restores all defaults |

Preferences are stored in `localStorage` (key configurable) and applied before first paint on return visits.

## Quick start

```html
<link rel="stylesheet" href="a11y-toolbar.css">
<script>
  window.A11yToolbarConfig = {
    colors: { accent: '#0a7d55', surface: '#ffffff' },
    fonts:  { ui: "'Inter', system-ui, sans-serif" }
  };
</script>
<script src="a11y-toolbar.js" defer></script>
```

That's it — the toolbar auto-initializes and renders a floating trigger button (bottom-left by default). No build step, no dependencies.

To use the bundled OpenDyslexic font for the dyslexia toggle:

```html
<link rel="stylesheet" href="fonts/opendyslexic/opendyslexic.css">
```

To disable auto-init and control it yourself:

```js
window.A11yToolbarConfig = { autoInit: false };
// later:
A11yToolbar.init({ position: 'right' });
```

### Use an existing button as the trigger

```js
A11yToolbar.init({ trigger: '#my-a11y-button' });
```

## Configuration

Every key is optional. Full example: [`config.example.js`](config.example.js).

| Key | Type | Default | Description |
|---|---|---|---|
| `autoInit` | boolean | `true` | Auto-init on DOM ready when `window.A11yToolbarConfig` is set |
| `storageKey` | string | `'a11y_toolbar_prefs'` | localStorage key |
| `position` | `'left' \| 'right'` | `'left'` | Docking side of trigger and panel |
| `zIndex` | number | `99998` | Base z-index (trigger +1, backdrop −1) |
| `trigger` | selector/element | `null` | Use an existing element instead of the generated button |
| `credit` | object/false | `false` | Optional attribution `{ text, name, url, logo }` |
| `toggles` | string[] | all 13 | Which tools to show, in order |
| `fontScale` | object | `{ step: 10, min: 80, max: 150, start: 100 }` | Font scaling |
| `colors` | object | — | See [Theming](#theming) |
| `fonts` | object | — | `ui` and `dyslexia` font-family strings |
| `offset` | object | `{ side: '1.5rem', triggerBottom: '1.5rem', panelBottom: '5.5rem' }` | Spacing |
| `labels` | object | English | All UI strings (see below) |
| `onOpen`, `onClose`, `onChange` | function | `null` | Callbacks |

Toggle ids: `contrast`, `invert`, `grayscale`, `underlineLinks`, `highlightLinks`, `highlightHeadings`, `letterSpacing`, `lineHeight`, `focusRing`, `bigCursor`, `readingGuide`, `pauseAnimations`, `dyslexiaFont`.

## Theming

Colors can be set in the JS config (`colors`) **or** as plain CSS custom properties — useful for CSS-only theming and CMS theme settings:

```css
:root {
  --a11y-accent: #6d28d9;            /* active buttons, borders, hover */
  --a11y-accent-text: #ffffff;
  --a11y-surface: #ffffff;           /* panel background */
  --a11y-surface-hover: #f4f1fb;     /* button background */
  --a11y-text: #1a1a1a;
  --a11y-text-muted: #5c5c5c;
  --a11y-border: #e2e2e2;
  --a11y-focus: #6d28d9;             /* focus-ring mode */
  --a11y-highlight: #ffff00;         /* highlight modes */
  --a11y-highlight-text: #000000;
  --a11y-reading-guide: #ffd54f;
  --a11y-reading-guide-bg: rgba(255, 213, 79, 0.35);
  --a11y-backdrop: rgba(0, 0, 0, 0.4);
  --a11y-radius: 12px;
  --a11y-radius-sm: 8px;
  --a11y-font-ui: 'Inter', system-ui, sans-serif;
  --a11y-font-dyslexia: 'OpenDyslexic', sans-serif;
  --a11y-z: 99998;
  --a11y-side: 1.5rem;
  --a11y-trigger-bottom: 1.5rem;
  --a11y-panel-bottom: 5.5rem;
  /* advanced: high-contrast palette */
  --a11y-contrast-bg: #ffffff;
  --a11y-contrast-text: #000000;
  --a11y-contrast-link: #0000ee;
  --a11y-contrast-link-hover: #551a8b;
}
```

For a custom font, load it yourself (`@font-face` or a font service) and point `fonts.ui` / `fonts.dyslexia` (or the CSS variables) at it.

## Labels / i18n

All strings are configurable. Defaults are English; the full set:

```js
labels: {
  open: 'Open accessibility',        // trigger aria-label
  triggerText: 'Accessibility',      // visible trigger text
  title: 'Accessibility',            // panel title
  close: 'Close',
  fontSize: 'Font size',
  fontDecrease: 'Decrease font size',
  fontIncrease: 'Increase font size',
  reset: 'Reset',
  resetAria: 'Reset all settings',
  credit: 'Developed by',
  toggles: {
    contrast: 'High contrast',
    invert: 'Dark mode',
    grayscale: 'Remove colors',
    underlineLinks: 'Underline links',
    highlightLinks: 'Highlight links',
    highlightHeadings: 'Highlight headings',
    letterSpacing: 'More letter spacing',
    lineHeight: 'More line height',
    focusRing: 'Strong focus outline',
    bigCursor: 'Big cursor',
    readingGuide: 'Reading guide',
    pauseAnimations: 'Pause animations',
    dyslexiaFont: 'Dyslexia-friendly font'
  }
}
```

A full German label set is in [`config.example.js`](config.example.js).

## JavaScript API

| Method | Description |
|---|---|
| `A11yToolbar.init(options)` | Initialize (destroys a previous instance first) |
| `A11yToolbar.destroy()` | Remove DOM, classes, listeners and theme variables |
| `A11yToolbar.open()` / `.close()` / `.togglePanel()` | Control the panel |
| `A11yToolbar.getPrefs()` | Current preferences (copy) |
| `A11yToolbar.setPrefs(partial)` | Update preferences programmatically |
| `A11yToolbar.reset()` | Reset all preferences |
| `A11yToolbar.toggle(id)` | Toggle a single feature |
| `A11yToolbar.version` | Library version |

## Browser support

Chrome/Edge, Firefox, Safari (current and previous major versions), iOS Safari, Android Chrome. Uses `localStorage`, CSS custom properties, `:is()`/`:not(selector list)` and inline SVG — no polyfills needed for any supported browser. Without JavaScript the toolbar simply doesn't render; content remains fully accessible.

## Accessibility notes

- The panel is a labelled `dialog`, the trigger exposes `aria-expanded`/`aria-controls`, toggles use `aria-pressed`.
- Escape closes, backdrop closes, focus is moved into the panel and returned to the trigger.
- `prefers-reduced-motion` removes the toolbar's own transitions.
- High contrast uses genuine color overrides so the fixed panel never breaks (a `filter` on a wrapper would).
- The tool does not replace a WCAG-conformant website — it complements it.

## License

Dual license: **free for registered non-profit organizations**; any other use requires a commercial license. See [LICENSE](LICENSE).

Bundled OpenDyslexic font: SIL Open Font License 1.1 — [fonts/opendyslexic/OFL.txt](fonts/opendyslexic/OFL.txt).

---

Made by [Modern Amusement](https://modern-amusement.dev/de).
