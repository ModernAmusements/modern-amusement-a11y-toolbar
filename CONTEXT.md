# CONTEXT — Modern Amusement Accessibility Toolbar

> **Single source of truth für dieses Produkt-Repo.** Immer zuerst lesen.
> Stand: 2026-10-09 (Session: White-Label-Default + Deploy, v1.3.0) · Nächste Aktualisierung nach jeder Session Pflicht.
> Letzter Stand: v1.3.0 — `whitelabel.css` (neutrales Default-Theme, ausschließlich Alliance No.1), `globals.css` (Native-Input-Layer + Content-Elemente), `demo/whitelabel.html` (80-Elemente-Inventar + Playground), 90/90, CI grün, Tag `v1.3.0`.

---

## 1. Projekt

| | |
|---|---|
| **Produkt** | White-Label Accessibility Toolbar — dependency-frei (Vanilla JS + CSS), alle 13 Werkzeuge selbst gehostet |
| **Repo** | `github.com/ModernAmusements/modern-amusement-a11y-toolbar` (PUBLIC) |
| **Lokal** | `~/Desktop/modern-amusement-a11y-toolbar` |
| **Lizenz** | Dual: **frei für gemeinnützige Organisationen**, kommerzielle Lizenz für alle anderen (siehe `LICENSE`) |
| **Autor/Halter** | Shady Tawfik — Modern Amusement (https://modern-amusement.dev/de) |
| **Version** | 1.3.0 (`CHANGELOG.md`), Tag `v1.3.0` für CDN-Pinning |

## 2. Struktur

- `a11y-toolbar.js` — UMD-Library: Auto-Init (`A11yToolbarConfig`), JS-API (`init/destroy/open/close/getPrefs/setPrefs/reset/toggle`), Scope-Engine (same-origin iframes + open Shadow DOM via `adoptedStyleSheets`, CSP-safe), Font-Scaling auto (root/zoom), Base-Filter-Erhalt, Fokus-Trap, RTL-, Storage- & Edge-Case-Härtung.
- `a11y-toolbar.css` — Default-Theme **minimal/brutalistisch**, alle Tokens als CSS-Vars (`--a11y-*`), self-hosted Alliance No.1 `@font-face` (Markenfont).
- `whitelabel.css` — neutrales White-Label-Default-Theme (Schwarz/Weiß/Grau, 1px-Konturen, keine Offset-Schatten, eckiges Badge, monochrome Highlights; ausschließlich Alliance No.1). Tool-Buttons werden explizit von generischen Host-Button-Styles abgeschirmt.
- `globals.css` — White-Label-Designsystem im Root (aus Neo-Cuneiform übernommen): Tokens, `@font-face` Alliance No.1 (self-hosted, kein Google-Fonts-Request), vollständiger Native-Input-Override-Layer via `:where()`, Content-Elemente (30 + 50 = 80 Tags); Basis für `demo/whitelabel.html`.
- `config.example.js` — Dokumentierte Beispiel-Konfiguration.
- `demo/index.html` — Brutalist-Demo (MA-Theme) + Config-Playground (Customizer, EN/DE).
- `demo/whitelabel.html` — White-Label-Demo: Logo/Wordmark-Header, Hero, Stats, A11y-Testflächen, 80-Elemente-Inventar (30 + 50), Native-Control-Galerie, Config-Playground (Thema: `whitelabel.css`).
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
9. **White-Label-Default (v1.3.0):** `whitelabel.css` leitet Palette/Geometrie aus den Root-Tokens (`globals.css`) ab — Schwarz/Weiß/Grau, 1px-Linien, keine Offset-Schatten, eckiges Badge, monochrome Highlights/Lesehilfe. Das Tool behält **Alliance No.1** (kein IBM Plex); ein expliziter Schild (`.a11y-toolbar button`, `.a11y-trigger` → `font-family`/`text-transform: none`) verhindert, dass generische Host-Button-Styles ins Panel lecken. `--a11y-font-mono` zeigt ebenfalls auf Alliance.
10. **Root-Designsystem `globals.css`:** Native-Input-Layer + Content-Elemente komplett via `:where()` (Specificity 0), damit `.filter-input`/`.btn`/Inline-Styles gewinnen; alle Vendor-Pseudos abgedeckt (Kalender-Picker, File-Button, Spinner, Search-Cancel, Range-Thumb/Track, Color-Swatches, Progress/Meter); date/time behalten native Picker (`appearance: none` dort bewusst NICHT gesetzt); ausschließlich Alliance No.1.

## 4. Sessions

### Session 2026-10-09 (White-Label-Default + Deploy, v1.3.0)
- Root-Dateien (`globals.css`, `layout.tsx`, `page.tsx` aus Neo-Cuneiform) als White-Label-Basis übernommen; `globals.css` um Native-Input-Layer, Content-Elemente (80 Tags), `@font-face` Alliance erweitert.
- `whitelabel.css` als neutrales Tool-Theme erstellt (aus Root-Tokens); `demo/whitelabel.html` mit Logo/Wordmark-Header, Hero, Stats, A11y-Testflächen (Motion, Dark Surface, Farbfelder, Lesekomfort, Fokus, Links/Headings), 30+50-Elemente-Inventar, Control-Galerie und portiertem Config-Playground.
- „Nur Alliance No.1": Google-Fonts-Import entfernt; `--font-sans`/`--font-mono` (Seite) und `--a11y-font-ui`/`--a11y-font-mono` (Tool) = Alliance.
- Fixes im Review: `appearance: none` von date/time entfernt (mobile Picker-Affordanz), `.a11y-btn-sm`-Padding-Squish, kaputtes Section-Header-Markup in der Demo.
- Review: 90/90 Tests, Puppeteer-Audits (Computed Styles, Vendor-Pseudos via CSSOM, Overflow desktop/390px, Font-Check, Playground-Smoke). Deploy v1.3.0 + Tag.
- Hinweis: `layout.tsx`/`page.tsx` bleiben **untracked** (Next.js-Quellen aus Neo-Cuneiform, nicht Teil des Produkt-Repos).

### Session 2026-10-08/09 (Erstellung bis v1.2.0, Commits `d3984ab`→`e99c8d0`)
- **v1.0.0** (`d3984ab`): Scaffold, UMD-Library, themebare CSS, Dual-License, README EN, Demo.
- **Tests/CI** (`e713d8b`, `6391397`): 5 Suiten, Chrome-Detection (`CHROME_PATH`, system Chrome, Puppeteer-Cache), GitHub Actions grün.
- **v1.1.0** (`c72cb36`): px-Sites via Zoom, iframes + Shadow DOM, Base-Filter-Erhalt, `scope`-Option, Scope-Tests. → ALLE Integration-Caveats behoben bzw. dokumentiert.
- **v1.2.0** (`e99c8d0`): **Brutalist-Theme** (User-Vorgabe: "minimal and brutalistik, hard vertical lines, no glass"), Bielefeld-Layout-Umbau von Toolbar + Demo, Edge-Case-Suite, Poster/Wordmark/Logo/Favicon (User-Assets), README EN+DE.
- **v1.2.1** (ungecommittet Stand Session): Font-Swap auf **Alliance No.1** (aus `MA_WEBSITE/public/fonts`), Logo in der Demo-Navigation (Logo + vertikale Linie + Wordmark), vertikale Linien als Layout-Sprache (`branding.svg` im Root), `font-val` zwischen zwei vertikalen Rules, Tests aktualisiert.
- Teststand: **config 7/7, browser 44/44, api 10/10, scope 15/15, edge 13/13 = 89/89**, CI success.

## 5. Offen / Nächste Schritte

1. **WordPress-Plugin-Wrapper** (Settings-Seite für Farben/Schriften, Enqueue der Dateien inkl. optionalem `whitelabel.css`) — vom User als nächster Schritt angefragt.
2. **npm-Publish** (`package.json` ist bereit, `whitelabel.css` wird mitgeliefert); CDN-Pinning-Tag `v1.3.0` ist gesetzt.
3. Optional: GTM-Template, README-GIF der Toolbar, `docs/BIELEFELD-LAYOUT-REPORT.md` aus dem Explore-Agent-Report ablegen.
4. Screenshots bei Theme-Änderungen regenerieren; Haupt-Demo unverändert (v1.3.0), optional Shots für `demo/whitelabel.html`.
5. `layout.tsx`/`page.tsx` (Neo-Cuneiform-Kopien) sind untracked — bewusst nicht committen; löschen, wenn die Referenz nicht mehr gebraucht wird.

## 6. Quick-Commands

```bash
npm test                 # 5 Suiten (config, browser, api, scope, edge)
npm run demo             # npx serve -> /demo/ · /demo/whitelabel.html (White-Label-Default, 80 Elemente)
CHROME_PATH=... npm test # falls Chrome nicht gefunden wird
```

- Chrome-Erkennung: `tests/helpers.js#findChrome` (env `CHROME_PATH` → system Chrome → Puppeteer-Cache).
- CI installiert Chrome via `npx @puppeteer/browsers install chrome@stable`.
- Konventionen: konventionelle englische Commits, Changelog pflegen, Version in `package.json` + `a11y-toolbar.js` (`VERSION`) + `CHANGELOG.md` synchron.
- **Keine Credentials** im Repo (öffentlich!). Assets in `docs/` gehören zum Branding von Modern Amusement.