# CONTEXT — Modern Amusement Accessibility Toolbar

> **Single source of truth für dieses Produkt-Repo.** Immer zuerst lesen.
> Stand: 2026-10-09 (Session-Ende, v1.2.0) · Nächste Aktualisierung nach jeder Session Pflicht.
> Letzter Stand: v1.2.1 — Brutalist-Theme + Bielefeld-Layout-Primitives, Alliance No.1 (Brandfont), Logo in Nav, vertikale Linien (branding.svg), 89/89+, CI grün.

---

## 1. Projekt

| | |
|---|---|
| **Produkt** | White-Label Accessibility Toolbar — dependency-frei (Vanilla JS + CSS), alle 13 Werkzeuge selbst gehostet |
| **Repo** | `github.com/ModernAmusements/modern-amusement-a11y-toolbar` (PUBLIC) |
| **Lokal** | `~/Desktop/modern-amusement-a11y-toolbar` |
| **Lizenz** | Dual: **frei für gemeinnützige Organisationen**, kommerzielle Lizenz für alle anderen (siehe `LICENSE`) |
| **Autor/Halter** | Shady Tawfik — Modern Amusement (https://modern-amusement.dev/de) |
| **Version** | 1.2.0 (`CHANGELOG.md`) — Tags für CDN noch zu setzen |

## 2. Struktur

- `a11y-toolbar.js` — UMD-Library: Auto-Init (`A11yToolbarConfig`), JS-API (`init/destroy/open/close/getPrefs/setPrefs/reset/toggle`), Scope-Engine (same-origin iframes + open Shadow DOM via `adoptedStyleSheets`, CSP-safe), Font-Scaling auto (root/zoom), Base-Filter-Erhalt, Fokus-Trap, RTL-, Storage- & Edge-Case-Härtung.
- `a11y-toolbar.css` — Default-Theme **minimal/brutalistisch**, alle Tokens als CSS-Vars (`--a11y-*`), self-hosted Alliance No.1 `@font-face` (Markenfont).
- `config.example.js` — Dokumentierte Beispiel-Konfiguration.
- `demo/index.html` — Brutalist-Demo-Seite (Bielefeld-Layout-Primitives) + Config-Playground (Customizer, EN/DE-Labels).
- `docs/` — `MA-A11Y-POSTER.png`, `ma_a11y-wordmark.svg`, `ma_a11y-logo.svg`, `favicon.svg`, Screenshots.
- `fonts/` — `bricolage-grotesque/` + `opendyslexic/` (beide SIL OFL 1.1, je `OFL.txt`).
- `tests/` — 5 Suiten + `static-server.js`, `helpers.js`, `fixtures/`.
- `.github/workflows/tests.yml` — CI (npm test, Chrome for Testing via `@puppeteer/browsers`).
- `opencode.json` + `.opencode/agents/` — lokale OpenCode-Agents (aus dem Modern-Amusement-Pool kopiert, **gitignored** über `.opencode/` — niemals committen). Registriert: webdev-expert (primary), seo/accessibility/performance/security/qa/devops/content/ux/projektmanagement/site-rebuilder/wcag/lottie.

## 3. Design-Entscheidungen (fixiert)

1. **Farben (User):** Text `#4B1800`, Hintergrund `#F1ECE8`. Palette ergänzt aus dem Poster: Akzent `#754D3A`, Hover `#DCD1CB`, Rahmen `#C7B7AE`.
2. **Layout:** Bielefeld-Primitives aus `Bielefeld_Scrape` (`agents/CSS_LAYOUT_AGENT.md`, `_vars.css`, `index.css`, `browser.css`): Section-Header (Badge-Pill + Titel + harte Unterlinie), Zeilen-Rows mit `4px`-Linksakzent, Grid-Stat-Karten, Tabellen mit Zeilenlinien, Floating-Nav, Hero-Side-by-Side. **Umsetzung minimal/brutalistisch: kein Glass, Radius 0 (nur Badge-Pill 99px), harte 2px-Linien, harte Offset-Schatten (Panel 8px, Controls 3px).**
3. **Font:** **Alliance No.1** (Markenfont Modern Amusement, selbst gehostet Regular + Bold aus `MA_WEBSITE/public/fonts`, Ordner `fonts/alliance/`) als Default-UI-Font — bewusst NICHT Bricolage und nicht die Bielefeld-`Alliance`-Kopien (kein OFL; MA-Font nur mit dieser Software, nicht weiterlizensierbar). Typo-Tokens: tracking `-0.02em`, Titel/Trigger 700, Labels 600, `font-val` Mono **zwischen zwei vertikalen Linien**; Layout-Sprache = hart vertikale Linien (Referenz `branding.svg` im Root).
4. **White-Label:** kein Credit default (`credit: false`), alles konfigurierbar (`colors/fonts/position/labels/toggles/fontScale/scope/offset/zIndex`).
5. **Scope-Engine:** Feature-Klassen in same-origin iframes + open Shadow DOM; `adoptedStyleSheets` (umgeht `style-src`-CSP), `attachShadow`-Patch + MutationObserver für dynamische Roots; Cleanup bei `destroy()`. **Cross-Origin-iframes & geschlossene Shadow Roots = Browser-Limit, dokumentiert** (nicht fixbar).
6. **Font-Scaling:** `fontScale.mode` `auto|root|zoom` — rem-Seiten per Root-Font-Size, px-Seiten per CSS `zoom`; Bereich 80–200 % (WCAG 1.4.4).
7. **Stacking:** Default `zIndex: 2147483000`; Site-Root-`filter` wird bei invert/grayscale erfasst und komponiert (`--a11y-base-filter`), nicht überschrieben.
8. **Edge-Cases gehärtet:** init vor `<body>`, Doppel-Init, `toggles: []`, fehlender `trigger`-Selektor, kaputter/blockierter Storage (opaque-origin = natürlicher Private-Mode-Test), Fokus-Trap, RTL (`text-align: start`, `direction` erbt), Kontrast-Styles für Formular-Controls.

## 4. Sessions

### Session 2026-10-08/09 (Erstellung bis v1.2.0, Commits `d3984ab`→`e99c8d0`)
- **v1.0.0** (`d3984ab`): Scaffold, UMD-Library, themebare CSS, Dual-License, README EN, Demo.
- **Tests/CI** (`e713d8b`, `6391397`): 5 Suiten, Chrome-Detection (`CHROME_PATH`, system Chrome, Puppeteer-Cache), GitHub Actions grün.
- **v1.1.0** (`c72cb36`): px-Sites via Zoom, iframes + Shadow DOM, Base-Filter-Erhalt, `scope`-Option, Scope-Tests. → ALLE Integration-Caveats behoben bzw. dokumentiert.
- **v1.2.0** (`e99c8d0`): **Brutalist-Theme** (User-Vorgabe: "minimal and brutalistik, hard vertical lines, no glass"), Bielefeld-Layout-Umbau von Toolbar + Demo, Edge-Case-Suite, Poster/Wordmark/Logo/Favicon (User-Assets), README EN+DE.
- **v1.2.1** (ungecommittet Stand Session): Font-Swap auf **Alliance No.1** (aus `MA_WEBSITE/public/fonts`), Logo in der Demo-Navigation (Logo + vertikale Linie + Wordmark), vertikale Linien als Layout-Sprache (`branding.svg` im Root), `font-val` zwischen zwei vertikalen Rules, Tests aktualisiert.
- Teststand: **config 7/7, browser 44/44, api 10/10, scope 15/15, edge 13/13 = 89/89**, CI success.

## 5. Offen / Nächste Schritte

1. **WordPress-Plugin-Wrapper** (Settings-Seite für Farben/Schriften, Enqueue der zwei Dateien) — vom User als nächster Schritt angefragt.
2. **npm-Publish** + **Git-Tags** (`v1.2.0`) für CDN-Pinning (jsDelivr), `package.json` ist bereit.
3. Optional: GTM-Template, README-GIF der Toolbar, `docs/BIELEFELD-LAYOUT-REPORT.md` aus dem Explore-Agent-Report ablegen.
4. Screenshots bei Theme-Änderungen regenerieren (`/var/folders/.../opencode/a11y-shots.js`-Muster).

## 6. Quick-Commands

```bash
npm test                 # 5 Suiten (config, browser, api, scope, edge)
npm run demo             # npx serve -> /demo/
CHROME_PATH=... npm test # falls Chrome nicht gefunden wird
```

- Chrome-Erkennung: `tests/helpers.js#findChrome` (env `CHROME_PATH` → system Chrome → Puppeteer-Cache).
- CI installiert Chrome via `npx @puppeteer/browsers install chrome@stable`.
- Konventionen: konventionelle englische Commits, Changelog pflegen, Version in `package.json` + `a11y-toolbar.js` (`VERSION`) + `CHANGELOG.md` synchron.
- **Keine Credentials** im Repo (öffentlich!). Assets in `docs/` gehören zum Branding von Modern Amusement.