# AGENTS.md — Modern Amusement Accessibility Toolbar

> **Immer zuerst lesen:** `CONTEXT.md` (Single source of truth, Sessions, Design-Entscheidungen, Offenes).
> Wichtigste Regeln: White-Label (kein Default-Credit), Brutalist-Theme (kein Glass, harte Linien), Bricolage Grotesque (OFL), Dual-License, Repo ist PUBLIC (keine Credentials, keine fremdlizenzierten Fonts).

## Projekt

White-label, dependency-freie Accessibility-Toolbar (Vanilla JS + CSS) für jede Website. Frei für gemeinnützige Organisationen; kommerzielle Nutzung braucht Lizenz (siehe `LICENSE`). Autor: Shady Tawfik — Modern Amusement.

## Quick-Commands

```bash
npm test                 # 5 Suiten: config, browser, api, scope, edge (89 Checks)
npm test:browser         # einzelne Suite
npm run demo             # npx serve . → http://localhost:3000/demo/
CHROME_PATH=... npm test # falls Chrome nicht automatisch gefunden wird
```

- Browser-Tests laufen in echtem Chrome (auto-detect: `CHROME_PATH` → system Chrome → Puppeteer-Cache, siehe `tests/helpers.js`).
- CI (`tests.yml`) installiert Chrome for Testing via `@puppeteer/browsers`.

## Struktur

| Pfad | Zweck |
|---|---|
| `a11y-toolbar.js` | UMD-Library (Auto-Init + API + Scope-Engine) |
| `a11y-toolbar.css` | Brutalist-Default-Theme, CSS-Vars `--a11y-*` |
| `config.example.js` | Beispiel-Konfiguration |
| `demo/index.html` | Brutalist-Demo + Config-Playground |
| `docs/`, `fonts/` | Branding-Assets (Poster/Wordmark/Logo/Favicon), Bricolage Grotesque + OpenDyslexic (OFL) |
| `tests/` | 5 Suiten + helpers + fixtures |
| `.github/workflows/tests.yml` | CI |

## Wichtigste Konventionen

1. **Design:** minimal/brutalistisch — keine Glass-Effekte (`backdrop-filter`), keine Rundungen außer Badge-Pill (99px), harte 2px-Linien, harte Offset-Schatten, Palette `#4B1800`/`#F1ECE8`/`#754D3A`/`#DCD1CB`/`#C7B7AE`.
2. **Typo:** Bricolage Grotesque (OFL, 200–800) als Default; kein Uppercase, keine positive Letter-Spacing; `-0.02em` Base-Tracking.
3. **White-Label:** kein Credit default; alle Texte/Farben/Fonts über Konfiguration/CSS-Vars.
4. **Versionen synchron halten:** `package.json` ↔ `a11y-toolbar.js` (`VERSION`) ↔ `CHANGELOG.md`.
5. Nach Theme-/Markup-Änderungen `tests/browser.test.js` prüfen UND Screenshots (`docs/`) neu generieren (Puppeteer-Muster).
6. Repo ist **public**: niemals Credentials committen; nur OFL/permissiv lizenzierte Fonts/Assets einbinden.
7. Commits englisch, conventional-style, nur wenn vom User beauftragt.