'use strict';

/**
 * Edge-case test suite: early init, double init, empty toggle lists,
 * missing trigger, corrupt/blocked storage, focus trap, RTL pages,
 * contrast on form controls and degenerate fontScale config.
 *
 *   node tests/edge.test.js
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
	const report = createReporter('edge');
	const browser = await puppeteer.launch({
		executablePath: chromePath,
		headless: 'new',
		args: ['--no-sandbox']
	});

	const pageShell = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
		'<link rel="stylesheet" href="' + base + '/a11y-toolbar.css">' +
		'<script>window.A11yToolbarConfig = { autoInit: false };</script>' +
		'<script src="' + base + '/a11y-toolbar.js"></script>';

	try {
		const page = await browser.newPage();
		const errors = [];
		page.on('pageerror', (e) => errors.push(String(e)));
		await page.setViewport({ width: 1200, height: 800 });
		const clearStorage = () => page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* ignore */ } });

		/* ---------------- init called from a <head> script ---------------- */
		await clearStorage();
		await page.setContent(pageShell +
			'<script>window.A11yToolbar.init({ toggles: ["contrast"] });</script>' +
			'</head><body><p>early init</p></body></html>', { waitUntil: 'load' });
		const early = await page.evaluate(() => ({
			trigger: !!document.getElementById('a11y-trigger'),
			panel: !!document.getElementById('a11y-toolbar'),
			toggles: document.querySelectorAll('.a11y-toggle-btn').length
		}));
		report.log('init before body exists is deferred', early.trigger && early.panel && early.toggles === 1, JSON.stringify(early));
		await page.evaluate(() => window.A11yToolbar.destroy());

		/* ---------------- double init keeps a single instance ---------------- */
		await clearStorage();
		await page.setContent(pageShell + '</head><body><p>double init</p></body></html>', { waitUntil: 'load' });
		await page.evaluate(() => {
			window.A11yToolbar.init({});
			window.A11yToolbar.init({ position: 'right' });
		});
		const single = await page.evaluate(() => ({
			panels: document.querySelectorAll('#a11y-toolbar').length,
			triggers: document.querySelectorAll('#a11y-trigger').length,
			position: document.documentElement.getAttribute('data-a11y-position')
		}));
		report.log('double init keeps a single instance', single.panels === 1 && single.triggers === 1 && single.position === 'right', JSON.stringify(single));
		await page.evaluate(() => window.A11yToolbar.destroy());

		/* ---------------- empty toggle list ---------------- */
		await clearStorage();
		await page.setContent(pageShell + '</head><body><p>no toggles</p></body></html>', { waitUntil: 'load' });
		await page.evaluate(() => window.A11yToolbar.init({ toggles: [] }));
		const emptyToggles = await page.evaluate(() => ({
			toggles: document.querySelectorAll('.a11y-toggle-btn').length,
			fontUp: !!document.getElementById('a11y-font-up'),
			reset: !!document.getElementById('a11y-reset'),
			close: !!document.getElementById('a11y-close')
		}));
		report.log('empty toggles: panel keeps font/reset/close', emptyToggles.toggles === 0 && emptyToggles.fontUp && emptyToggles.reset && emptyToggles.close, JSON.stringify(emptyToggles));
		await page.evaluate(() => window.A11yToolbar.destroy());

		/* ---------------- missing trigger selector -> auto trigger ---------------- */
		await clearStorage();
		await page.setContent(pageShell + '</head><body><button id="real-trigger">real</button></body></html>', { waitUntil: 'load' });
		await page.evaluate(() => window.A11yToolbar.init({ trigger: '#does-not-exist' }));
		const fallbackTrigger = await page.evaluate(() => !!document.getElementById('a11y-trigger'));
		report.log('missing trigger selector falls back to auto trigger', fallbackTrigger);
		await page.evaluate(() => window.A11yToolbar.destroy());

		/* ---------------- corrupt stored prefs -> defaults ---------------- */
		await page.goto(base + '/tests/fixtures/storage-parent.html', { waitUntil: 'networkidle0' });
		await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* ignore */ } });
		await page.evaluate(() => localStorage.setItem('a11y_toolbar_prefs', '{{{ not json ### @$%'));
		await page.evaluate(() => window.A11yToolbar.init({}));
		const corrupt = await page.evaluate(() => ({
			fontSize: document.documentElement.style.fontSize,
			contrast: document.documentElement.classList.contains('a11y-contrast')
		}));
		report.log('corrupt stored prefs fall back to defaults', corrupt.fontSize === '100%' && corrupt.contrast === false, JSON.stringify(corrupt));
		await page.evaluate(() => window.A11yToolbar.destroy());

		/* ---------------- out-of-range / wrong-typed stored prefs ---------------- */
		await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* ignore */ } });
		await page.evaluate(() => localStorage.setItem('a11y_toolbar_prefs',
			JSON.stringify({ fontScale: 9999, contrast: 'yes', readingGuide: 1 })));
		await page.evaluate(() => window.A11yToolbar.init({ fontScale: { min: 80, max: 200, step: 20, start: 100 } }));
		const clamped = await page.evaluate(() => ({
			fontSize: document.documentElement.style.fontSize,
			contrast: document.documentElement.classList.contains('a11y-contrast'),
			guide: document.getElementById('a11y-reading-guide-el').classList.contains('is-active')
		}));
		report.log('out-of-range/typed prefs are clamped and sanitized', clamped.fontSize === '200%' && clamped.contrast === false && clamped.guide === false, JSON.stringify(clamped));
		await page.evaluate(() => window.A11yToolbar.destroy());
		await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* ignore */ } });

		/* ---------------- blocked localStorage (private-mode simulation) ----------------
		   setContent creates an opaque-origin document where localStorage access
		   throws a SecurityError by design - exactly the private-mode scenario. */
		await page.setContent(pageShell + '</head><body><p>no storage</p></body></html>', { waitUntil: 'load' });
		await page.evaluate(() => window.A11yToolbar.init({}));
		await page.evaluate(() => window.A11yToolbar.toggle('contrast'));
		await page.evaluate(() => window.A11yToolbar.setPrefs({ fontScale: 120 }));
		const blocked = await page.evaluate(() => ({
			contrast: document.documentElement.classList.contains('a11y-contrast'),
			fontSize: document.documentElement.style.fontSize
		}));
		report.log('blocked localStorage: toolbar still works', blocked.contrast && (blocked.fontSize === '120%' || blocked.fontSize === ''), JSON.stringify(blocked));
		await page.evaluate(() => window.A11yToolbar.destroy());

		/* ---------------- focus trap ---------------- */
		await page.setContent(pageShell + '</head><body><a href="#">page link 1</a><a href="#">page link 2</a><button>page button</button></body></html>', { waitUntil: 'load' });
		await page.evaluate(() => window.A11yToolbar.init({}));
		await page.evaluate(() => window.A11yToolbar.open());
		await sleep(300);

		/* wrap: Shift+Tab on the first control goes to the last */
		const firstId = await page.evaluate(() => document.activeElement && document.activeElement.id);
		await page.keyboard.down('Shift');
		await page.keyboard.press('Tab');
		await page.keyboard.up('Shift');
		const wrapped = await page.evaluate(() => document.activeElement && document.activeElement.id);
		report.log('focus trap wraps Shift+Tab to last control', firstId === 'a11y-close' && wrapped === 'a11y-reset', firstId + ' -> ' + wrapped);

		/* containment: tabbing around never leaves the panel */
		let trapped = true;
		for (let i = 0; i < 30; i++) {
			await page.keyboard.press('Tab');
			const ok = await page.evaluate(() => document.getElementById('a11y-toolbar').contains(document.activeElement));
			if (!ok) { trapped = false; break; }
		}
		report.log('focus trap keeps focus inside the panel', trapped);

		await page.evaluate(() => window.A11yToolbar.destroy());

		/* ---------------- RTL page ---------------- */
		await clearStorage();
		await page.setContent('<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8">' +
			'<link rel="stylesheet" href="' + base + '/a11y-toolbar.css">' +
			'<script>window.A11yToolbarConfig = { autoInit: false };</script>' +
			'<script src="' + base + '/a11y-toolbar.js"></script>' +
			'</head><body><p>رتي</p></body></html>', { waitUntil: 'load' });
		await page.evaluate(() => window.A11yToolbar.init({}));
		const rtl = await page.evaluate(() => ({
			direction: getComputedStyle(document.querySelector('.a11y-toggle-btn')).direction,
			textAlign: getComputedStyle(document.querySelector('.a11y-toggle-btn')).textAlign
		}));
		report.log('RTL: panel inherits rtl, logical start alignment', rtl.direction === 'rtl' && rtl.textAlign === 'start', JSON.stringify(rtl));
		await page.evaluate(() => window.A11yToolbar.destroy());

		/* ---------------- contrast styles form controls ---------------- */
		await clearStorage();
		await page.setContent(pageShell + '</head><body>' +
			'<input id="txt" type="text" value="x">' +
			'<button id="btn" type="button">go</button></body></html>', { waitUntil: 'load' });
		await page.evaluate(() => window.A11yToolbar.init({}));
		await page.evaluate(() => window.A11yToolbar.toggle('contrast'));
		await sleep(30);
		const controls = await page.evaluate(() => ({
			inputBg: getComputedStyle(document.getElementById('txt')).backgroundColor,
			inputBorder: getComputedStyle(document.getElementById('txt')).borderTopWidth,
			btnBg: getComputedStyle(document.getElementById('btn')).backgroundColor
		}));
		report.log('contrast: form controls stay visible', controls.inputBg === 'rgb(255, 255, 255)' && controls.inputBorder === '2px' && controls.btnBg === 'rgb(255, 255, 255)', JSON.stringify(controls));
		await page.evaluate(() => window.A11yToolbar.destroy());

		/* ---------------- degenerate fontScale (min > max) ---------------- */
		await clearStorage();
		await page.setContent(pageShell + '</head><body><p>degenerate</p></body></html>', { waitUntil: 'load' });
		await page.evaluate(() => window.A11yToolbar.init({ fontScale: { min: 150, max: 100, start: 100, step: 10 } }));
		const degenerate = await page.evaluate(() => ({
			fontSize: document.documentElement.style.fontSize,
			mode: document.documentElement.style.zoom
		}));
		await page.evaluate(() => window.A11yToolbar.setPrefs({ fontScale: 200 }));
		const degenerateAfter = await page.evaluate(() => document.documentElement.style.fontSize);
		report.log('degenerate fontScale config does not crash', degenerate.fontSize === '150%' && degenerateAfter === '150%' && !degenerate.mode, JSON.stringify(degenerate) + ' -> ' + degenerateAfter);

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