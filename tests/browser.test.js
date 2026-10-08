'use strict';

/**
 * Browser test suite: runs the demo page in real Chrome and verifies
 * every toolbar feature, the theme options, persistence and the mobile UI.
 *
 *   node tests/browser.test.js
 *
 * Chrome is auto-detected (or set CHROME_PATH).
 */

const puppeteer = require('puppeteer-core');
const { start } = require('./static-server');
const { findChrome, createReporter, sleep } = require('./helpers');

(async () => {
	const chromePath = findChrome();
	if (!chromePath) {
		console.error('No Chrome/Chromium found. Set CHROME_PATH to a browser binary.');
		process.exit(1);
	}

	const { server, port } = await start();
	const base = 'http://127.0.0.1:' + port;
	const report = createReporter('browser');
	const browser = await puppeteer.launch({
		executablePath: chromePath,
		headless: 'new',
		args: ['--no-sandbox']
	});

	try {
		/* ------------------------------------------------ desktop */
		const page = await browser.newPage();
		const errors = [];
		page.on('pageerror', (e) => errors.push(String(e)));
		page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
		await page.setViewport({ width: 1440, height: 900 });
		await page.goto(base + '/demo/', { waitUntil: 'networkidle0' });

		report.log('trigger rendered', !!(await page.$('#a11y-trigger')));

		const badgeColor = await page.$eval('.a11y-badge', (el) => getComputedStyle(el).backgroundColor);
		report.log('config accent applied', badgeColor.includes('117, 77, 58'), badgeColor);

	const brandTheme = await page.evaluate(() => ({
		surface: getComputedStyle(document.getElementById('a11y-toolbar')).backgroundColor,
		backdrop: getComputedStyle(document.getElementById('a11y-toolbar')).backdropFilter,
		text: getComputedStyle(document.querySelector('.a11y-title')).color,
		panelRadius: getComputedStyle(document.getElementById('a11y-toolbar')).borderRadius,
		toggleRadius: getComputedStyle(document.querySelector('.a11y-toggle-btn')).borderRadius
	}));
	const surfaceOk = brandTheme.surface === 'rgb(241, 236, 232)';
	report.log('default brand theme (#F1ECE8 solid / #4B1800 text)', surfaceOk && brandTheme.text === 'rgb(75, 24, 0)', JSON.stringify(brandTheme));
	report.log('no glass: solid surface without backdrop-filter', brandTheme.backdrop === 'none', brandTheme.backdrop);
	report.log('brutalist radius: panel 0 / toggles 0', brandTheme.panelRadius === '0px' && brandTheme.toggleRadius === '0px', brandTheme.panelRadius + ' / ' + brandTheme.toggleRadius);

	const badge = await page.$('.a11y-badge');
	report.log('section-header badge pill rendered', !!badge);
	const rowDividers = await page.evaluate(() => {
		const btns = document.querySelectorAll('.a11y-toggle-btn');
		const first = getComputedStyle(btns[0]);
		const last = getComputedStyle(btns[btns.length - 1]);
		return { firstUnder: first.borderBottomWidth, lastUnder: last.borderBottomWidth, left: first.borderLeftWidth };
	});
	report.log('toggle rows: line separators + left accent slot', rowDividers.firstUnder !== '0px' && rowDividers.lastUnder === '0px' && rowDividers.left === '4px', JSON.stringify(rowDividers));

	const uiFont = await page.evaluate(async () => {
		await document.fonts.ready;
		return {
			family: getComputedStyle(document.querySelector('.a11y-title')).fontFamily,
			loaded: document.fonts.check('16px "Alliance No.1"'),
			tracking: parseFloat(getComputedStyle(document.querySelector('.a11y-title')).letterSpacing),
			valBorders: [getComputedStyle(document.getElementById('a11y-font-size-val')).borderLeftWidth, getComputedStyle(document.getElementById('a11y-font-size-val')).borderRightWidth]
		};
	});
	report.log('default UI font is Alliance No.1 (brand)', uiFont.family.includes('Alliance No.1') && uiFont.loaded, uiFont.family);
	report.log('Bielefeld typography tracking applied (negative em)', !isNaN(uiFont.tracking) && uiFont.tracking < 0, String(uiFont.tracking));
	report.log('font value sits between vertical rules', uiFont.valBorders[0] === '2px' && uiFont.valBorders[1] === '2px', JSON.stringify(uiFont.valBorders));

		const triggerText = await page.$eval('#a11y-trigger .a11y-trigger-label', (el) => el.textContent);
		report.log('trigger text default EN', triggerText === 'Accessibility', triggerText);

		await page.click('#a11y-trigger');
		await sleep(400);
		const panelVisible = await page.$eval('#a11y-toolbar', (el) => el.getAttribute('aria-hidden') === 'false' && getComputedStyle(el).visibility === 'visible');
		report.log('panel opens', panelVisible);

		const toggleCount = await page.$$eval('.a11y-toggle-btn', (els) => els.length);
		report.log('13 toggles rendered', toggleCount === 13, String(toggleCount));

		const focused = await page.evaluate(() => document.activeElement && document.activeElement.id);
		report.log('focus moved into panel', focused === 'a11y-close', focused);

		/* --- contrast --- */
		await page.click('#a11y-toggle-contrast');
		const contrastOn = await page.evaluate(() => document.documentElement.classList.contains('a11y-contrast'));
		const contrastPressed = await page.$eval('#a11y-toggle-contrast', (el) => el.getAttribute('aria-pressed'));
		report.log('contrast: class + aria-pressed', contrastOn && contrastPressed === 'true');
		const bodyColor = await page.evaluate(() => getComputedStyle(document.querySelector('.demo-hero p')).color);
		report.log('contrast: page text becomes black', bodyColor === 'rgb(0, 0, 0)', bodyColor);
		const panelStillVisible = await page.$eval('#a11y-toolbar', (el) => getComputedStyle(el).visibility === 'visible');
		report.log('contrast: toolbar stays visible', panelStillVisible);
		await page.click('#a11y-toggle-contrast');

		/* --- invert + grayscale (mutual exclusion) --- */
		await page.click('#a11y-toggle-invert');
		await page.click('#a11y-toggle-grayscale');
		const excl = await page.evaluate(() => ({
			invert: document.documentElement.classList.contains('a11y-invert'),
			gray: document.documentElement.classList.contains('a11y-grayscale')
		}));
		report.log('invert/grayscale mutually exclusive', excl.gray === true && excl.invert === false, JSON.stringify(excl));
		const grayFilter = await page.evaluate(() => getComputedStyle(document.documentElement).filter);
		report.log('grayscale filter on <html>', grayFilter.includes('grayscale'), grayFilter);

		await page.click('#a11y-toggle-grayscale');
		await page.click('#a11y-toggle-invert');
		const invertNow = await page.evaluate(() => document.documentElement.classList.contains('a11y-invert'));
		const triggerFilter = await page.$eval('#a11y-trigger', (el) => getComputedStyle(el).filter);
		report.log('invert: toolbar re-inverted', invertNow && triggerFilter.includes('invert'), triggerFilter);
		await page.click('#a11y-toggle-invert');

		/* --- underline links --- */
		await page.click('#a11y-toggle-underlineLinks');
		const underline = await page.evaluate(() => getComputedStyle(document.querySelector('.demo-card a')).textDecorationLine);
		report.log('underline links: decoration applied', underline.includes('underline'), underline);
		await page.click('#a11y-toggle-underlineLinks');

		/* --- highlight links --- */
		await page.click('#a11y-toggle-highlightLinks');
		const linkBg = await page.evaluate(() => getComputedStyle(document.querySelector('.demo-card a')).backgroundColor);
		report.log('highlight links: yellow background', linkBg === 'rgb(255, 255, 0)', linkBg);
		await page.click('#a11y-toggle-highlightLinks');

		/* --- highlight headings --- */
		await page.click('#a11y-toggle-highlightHeadings');
		const h2Bg = await page.evaluate(() => getComputedStyle(document.querySelector('h2')).backgroundColor);
		report.log('highlight headings: yellow background', h2Bg === 'rgb(255, 255, 0)', h2Bg);
		await page.click('#a11y-toggle-highlightHeadings');

		/* --- letter spacing --- */
		const spacingBefore = parseFloat(await page.evaluate(() => getComputedStyle(document.querySelector('.demo-hero p')).letterSpacing));
		await page.click('#a11y-toggle-letterSpacing');
		const spacingAfter = parseFloat(await page.evaluate(() => getComputedStyle(document.querySelector('.demo-hero p')).letterSpacing));
		report.log('letter spacing: increased', !isNaN(spacingAfter) && spacingAfter > spacingBefore, spacingBefore + ' -> ' + spacingAfter);
		await page.click('#a11y-toggle-letterSpacing');

		/* --- line height --- */
		const lineBefore = await page.evaluate(() => getComputedStyle(document.querySelector('.demo-hero p')).lineHeight);
		await page.click('#a11y-toggle-lineHeight');
		const lineAfter = await page.evaluate(() => getComputedStyle(document.querySelector('.demo-hero p')).lineHeight);
		report.log('line height: increased', lineBefore !== lineAfter && parseFloat(lineAfter) > parseFloat(lineBefore), lineBefore + ' -> ' + lineAfter);
		await page.click('#a11y-toggle-lineHeight');

		/* --- focus ring --- */
		await page.click('#a11y-toggle-focusRing');
		const outline = await page.evaluate(() => getComputedStyle(document.querySelector('.demo-btn')).outlineWidth);
		report.log('focus ring: 3px outline', outline === '3px', outline);
		await page.click('#a11y-toggle-focusRing');

		/* --- big cursor --- */
		await page.click('#a11y-toggle-bigCursor');
		const cursor = await page.evaluate(() => getComputedStyle(document.querySelector('.demo-hero p')).cursor);
		report.log('big cursor: custom cursor applied', cursor.indexOf('url(') === 0, cursor.slice(0, 40));
		await page.click('#a11y-toggle-bigCursor');

		/* --- reading guide --- */
		await page.click('#a11y-toggle-readingGuide');
		const guideOk = await page.evaluate(() => {
			const el = document.getElementById('a11y-reading-guide-el');
			return !!el && el.classList.contains('is-active') && getComputedStyle(el).display !== 'none';
		});
		report.log('reading guide: active', guideOk);
		await page.click('#a11y-toggle-readingGuide');

		/* --- pause animations (inject an animated element) --- */
		await page.click('#a11y-toggle-pauseAnimations');
		const paused = await page.evaluate(() => {
			const div = document.createElement('div');
			div.id = 'test-anim';
			div.style.animation = 'spin 10s linear infinite';
			document.body.appendChild(div);
			const duration = getComputedStyle(div).animationDuration;
			div.remove();
			return duration;
		});
		report.log('pause animations: duration clamped', paused === '0.001s', paused);
		await page.click('#a11y-toggle-pauseAnimations');

		/* --- dyslexia font --- */
		await page.click('#a11y-toggle-dyslexiaFont');
		const dysFont = await page.evaluate(() => getComputedStyle(document.querySelector('.demo-hero p')).fontFamily);
		report.log('dyslexia font: page uses OpenDyslexic', dysFont.toLowerCase().includes('opendyslexic'), dysFont);
		const toolbarFont = await page.evaluate(() => getComputedStyle(document.querySelector('.a11y-title')).fontFamily);
		report.log('dyslexia font: toolbar excluded', !toolbarFont.toLowerCase().includes('opendyslexic'), toolbarFont);
		await page.click('#a11y-toggle-dyslexiaFont');

		/* --- font size --- */
		await page.click('#a11y-font-up');
		const rootSize = await page.evaluate(() => document.documentElement.style.fontSize);
		report.log('font scale: up to 110%', rootSize === '110%', rootSize);
		await page.click('#a11y-font-down');

		/* --- persistence --- */
		await page.click('#a11y-toggle-readingGuide');
		await page.click('#a11y-font-up');
		const stored = await page.evaluate(() => localStorage.getItem('a11y_toolbar_prefs'));
		report.log('prefs stored in localStorage', !!stored && stored.includes('"fontScale":110'), stored ? stored.slice(0, 80) : 'null');

		await page.reload({ waitUntil: 'networkidle0' });
		const persisted = await page.evaluate(() => ({
			size: document.documentElement.style.fontSize,
			guide: document.getElementById('a11y-reading-guide-el').classList.contains('is-active'),
			pressed: document.getElementById('a11y-toggle-readingGuide').getAttribute('aria-pressed')
		}));
		report.log('prefs persist after reload', persisted.size === '110%' && persisted.guide === true && persisted.pressed === 'true', JSON.stringify(persisted));

		/* --- reset + escape --- */
		await page.click('#a11y-trigger');
		await sleep(400);
		await page.click('#a11y-reset');
		await sleep(200);
		const afterReset = await page.evaluate(() => ({
			size: document.documentElement.style.fontSize,
			guide: document.getElementById('a11y-reading-guide-el').classList.contains('is-active')
		}));
		report.log('reset clears all prefs', afterReset.size === '100%' && afterReset.guide === false, JSON.stringify(afterReset));

		await page.keyboard.press('Escape');
		await sleep(300);
		const closed = await page.$eval('#a11y-toolbar', (el) => el.getAttribute('aria-hidden') === 'true');
		report.log('Escape closes panel', closed);

		/* --- config playground --- */
		await page.evaluate(() => document.getElementById('cfg-toggle').click());
		await sleep(350);
		await page.$eval('#c-accent', (el) => { el.value = '#6d28d9'; });
		await page.select('#c-position', 'right');
		await page.select('#c-language', 'en');
		await page.evaluate(() => document.getElementById('cfg-apply').click());
		await sleep(350);
		const accentApplied = await page.$eval('.a11y-badge', (el) => getComputedStyle(el).backgroundColor);
		const posAttr = await page.evaluate(() => document.documentElement.getAttribute('data-a11y-position'));
		const triggerRect = await page.$eval('#a11y-trigger', (el) => { const r = el.getBoundingClientRect(); return { left: r.left, vw: innerWidth }; });
		report.log('playground: accent re-themed live', accentApplied.includes('109, 40, 217'), accentApplied);
		report.log('playground: position switches right', posAttr === 'right' && triggerRect.left > triggerRect.vw / 2, JSON.stringify(triggerRect));

		await page.select('#c-language', 'de');
		await page.evaluate(() => document.getElementById('cfg-apply').click());
		await sleep(350);
		const deText = await page.$eval('#a11y-trigger .a11y-trigger-label', (el) => el.textContent);
		const deTitle = await page.$eval('.a11y-title', (el) => el.textContent);
		report.log('playground: German labels', deText === 'Barrierefreiheit' && deTitle === 'Barrierefreiheit', deText + ' / ' + deTitle);

		/* ------------------------------------------------ mobile */
		const mobile = await browser.newPage();
		await mobile.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
		await mobile.goto(base + '/demo/', { waitUntil: 'networkidle0' });
		const triggerSize = await mobile.$eval('#a11y-trigger', (el) => {
			const r = el.getBoundingClientRect();
			return { w: Math.round(r.width), h: Math.round(r.height), radius: getComputedStyle(el).borderRadius };
		});
		report.log('mobile: trigger is 48px square (brutalist)', triggerSize.w === 48 && triggerSize.h === 48 && triggerSize.radius === '0px', JSON.stringify(triggerSize));

		await mobile.click('#a11y-trigger');
		await sleep(450);
		const sheet = await mobile.$eval('#a11y-toolbar', (el) => {
			const r = el.getBoundingClientRect();
			return { w: Math.round(r.width), bottomGap: Math.round(innerHeight - r.bottom), left: Math.round(r.left) };
		});
		report.log('mobile: full-width bottom sheet', sheet.w === 390 && sheet.bottomGap === 0 && sheet.left === 0, JSON.stringify(sheet));

		const gridLayout = await mobile.$eval('.a11y-toggle-grid', (el) => ({ display: getComputedStyle(el).display, direction: getComputedStyle(el).flexDirection }));
		report.log('mobile: toggle rows stay single column', gridLayout.display === 'flex' && gridLayout.direction === 'column', JSON.stringify(gridLayout));

		const backdropVisible = await mobile.$eval('#a11y-backdrop', (el) => getComputedStyle(el).display !== 'none');
		report.log('mobile: backdrop visible', backdropVisible);

		const backdropHit = await mobile.evaluate(() => {
			const el = document.elementFromPoint(195, 80);
			return el ? el.id || el.className : null;
		});
		await mobile.mouse.click(195, 80);
		await sleep(350);
		const sheetClosed = await mobile.$eval('#a11y-toolbar', (el) => el.getAttribute('aria-hidden') === 'true');
		report.log('mobile: backdrop closes sheet', backdropHit === 'a11y-backdrop' && sheetClosed, 'hit=' + backdropHit + ' closed=' + sheetClosed);

		report.log('zero console/page errors', errors.length === 0, errors.join(' | ').slice(0, 300));
	} finally {
		await browser.close();
		server.close();
	}

	report.finish();
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
