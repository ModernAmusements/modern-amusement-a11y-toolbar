'use strict';

/**
 * README screenshot generator (Puppeteer pattern from the test suite).
 *
 *   node tests/screenshots.js
 *
 * Captures docs/screenshot-desktop.png (1440x900 @2x) and
 * docs/screenshot-mobile.png (390x844 @2x) of the white-label minimal theme
 * (demo/whitelabel.html) with the toolbar panel / bottom sheet open.
 * Verifies panel geometry, white-label computed styles and font before
 * writing each file. Chrome is auto-detected (or set CHROME_PATH).
 */

const path = require('path');
const puppeteer = require('puppeteer-core');
const { start } = require('./static-server');
const { findChrome, sleep } = require('./helpers');

const ROOT = path.resolve(__dirname, '..');
const PAGE = '/demo/whitelabel.html';

function log(check, ok, extra) {
	console.log((ok ? 'PASS ' : 'FAIL ') + check + (extra ? ' — ' + extra : ''));
	return ok;
}

async function openAndVerify(page, base, kind) {
	await page.goto(base + PAGE, { waitUntil: 'networkidle0' });
	await page.evaluate(() => document.fonts.ready);
	await page.click('#a11y-trigger');
	await sleep(500);

	return page.evaluate((kind) => {
		const panel = document.getElementById('a11y-toolbar');
		const trigger = document.getElementById('a11y-trigger');
		const style = getComputedStyle(panel);
		const rect = panel.getBoundingClientRect();
		const triggerRect = trigger.getBoundingClientRect();
		return {
			kind,
			open: panel.getAttribute('aria-hidden') === 'false' && style.visibility === 'visible',
			rect: { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
			inViewport: rect.top >= 0 && rect.left >= 0 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1,
			triggerInView: triggerRect.bottom <= innerHeight + 1 && triggerRect.right <= innerWidth + 1,
			surface: style.backgroundColor,
			text: getComputedStyle(document.querySelector('.a11y-title')).color,
			shadow: style.boxShadow,
			radius: style.borderRadius,
			font: getComputedStyle(document.querySelector('.a11y-title')).fontFamily,
			toggles: document.querySelectorAll('.a11y-toggle-btn').length,
			overflowX: document.documentElement.scrollWidth > innerWidth
		};
	}, kind);
}

function verifyState(label, state, kind) {
	let ok = true;
	ok = log(kind + ': panel open + visible', state.open, JSON.stringify(state.rect)) && ok;
	ok = log(kind + ': panel fully inside viewport', state.inViewport) && ok;
	ok = log(kind + ': trigger inside viewport', state.triggerInView) && ok;
	ok = log(kind + ': white-label surface (#fff)', state.surface === 'rgb(255, 255, 255)', state.surface) && ok;
	ok = log(kind + ': white-label text (#000)', state.text === 'rgb(0, 0, 0)', state.text) && ok;
	ok = log(kind + ': no offset shadow (1px wireframe)', state.shadow === 'none', state.shadow) && ok;
	ok = log(kind + ': square corners', state.radius === '0px', state.radius) && ok;
	ok = log(kind + ': Alliance No.1', state.font.includes('Alliance No.1'), state.font) && ok;
	ok = log(kind + ': 13 toggle rows', state.toggles === 13, String(state.toggles)) && ok;
	ok = log(kind + ': no horizontal overflow', !state.overflowX) && ok;
	ok = log(label, true, JSON.stringify(state.rect));
	return ok;
}

(async () => {
	const chromePath = findChrome();
	if (!chromePath) {
		console.error('No Chrome/Chromium found. Set CHROME_PATH to a browser binary.');
		process.exit(1);
	}

	const { server, port } = await start();
	const base = 'http://127.0.0.1:' + port;
	const browser = await puppeteer.launch({
		executablePath: chromePath,
		headless: 'new',
		args: ['--no-sandbox']
	});

	let ok = true;
	try {
		/* ------------------------------------------------ desktop */
		const page = await browser.newPage();
		page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
		await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
		const desktop = await openAndVerify(page, base, 'desktop');
		ok = verifyState('desktop geometry captured', desktop, 'desktop') && ok;
		if (desktop.open && desktop.inViewport) {
			await page.screenshot({ path: path.join(ROOT, 'docs', 'screenshot-desktop.png') });
			console.log('WROTE docs/screenshot-desktop.png (2880x1800)');
		} else {
			ok = false;
		}
		await page.close();

		/* ------------------------------------------------ mobile */
		const mobile = await browser.newPage();
		mobile.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
		await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
		const sheet = await openAndVerify(mobile, base, 'mobile');
		const sheetOk = sheet.rect.width <= 391 && sheet.rect.bottom <= 844 + 1 && sheet.rect.height > 200;
		ok = log('mobile: bottom sheet geometry', sheetOk, JSON.stringify(sheet.rect)) && ok;
		ok = verifyState('mobile geometry captured', sheet, 'mobile') && ok;
		if (sheet.open && sheetOk && sheet.inViewport) {
			await mobile.screenshot({ path: path.join(ROOT, 'docs', 'screenshot-mobile.png') });
			console.log('WROTE docs/screenshot-mobile.png (780x1688)');
		} else {
			ok = false;
		}
		await mobile.close();
	} finally {
		await browser.close();
		server.close();
	}

	if (!ok) {
		console.error('\nscreenshots: verification failed — files not written for failing views');
		process.exitCode = 1;
	} else {
		console.log('\nscreenshots: all checks passed');
	}
})();
