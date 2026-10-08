'use strict';

/**
 * API test suite: manual init, external trigger, toggle subset,
 * destroy cleanup, re-init and full theming via the JS API.
 *
 *   node tests/api.test.js
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
	const report = createReporter('api');
	const browser = await puppeteer.launch({
		executablePath: chromePath,
		headless: 'new',
		args: ['--no-sandbox']
	});

	try {
		const page = await browser.newPage();
		page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
		await page.setViewport({ width: 1200, height: 800 });

		/* autoInit:false + external trigger + toggle subset */
		await page.setContent('<!DOCTYPE html><html><head>' +
			'<link rel="stylesheet" href="' + base + '/a11y-toolbar.css">' +
			'</head><body>' +
			'<button id="custom-trigger">A11y</button>' +
			'<script>window.A11yToolbarConfig = { autoInit: false };</script>' +
			'<script src="' + base + '/a11y-toolbar.js"></script>' +
			'</body></html>', { waitUntil: 'load' });

		const noAuto = await page.evaluate(() => ({
			api: typeof window.A11yToolbar,
			trigger: !!document.getElementById('a11y-trigger'),
			panel: !!document.getElementById('a11y-toolbar')
		}));
		report.log('autoInit:false -> API present, nothing rendered', noAuto.api === 'object' && !noAuto.trigger && !noAuto.panel, JSON.stringify(noAuto));

		const manual = await page.evaluate(() => {
			window.A11yToolbar.init({ trigger: '#custom-trigger', toggles: ['contrast', 'invert'], position: 'right' });
			return {
				customExpanded: document.getElementById('custom-trigger').getAttribute('aria-expanded'),
				customControls: document.getElementById('custom-trigger').getAttribute('aria-controls'),
				autoTrigger: !!document.getElementById('a11y-trigger'),
				toggleCount: document.querySelectorAll('.a11y-toggle-btn').length,
				panel: !!document.getElementById('a11y-toolbar')
			};
		});
		report.log('manual init with external trigger + toggle subset',
			manual.customExpanded === 'false' && manual.customControls === 'a11y-toolbar' && !manual.autoTrigger && manual.toggleCount === 2 && manual.panel,
			JSON.stringify(manual));

		await page.click('#custom-trigger');
		await sleep(300);
		const opened = await page.evaluate(() => document.getElementById('a11y-toolbar').getAttribute('aria-hidden') === 'false');
		report.log('external trigger opens panel', opened);

		await page.evaluate(() => window.A11yToolbar.toggle('contrast'));
		const contrastOn = await page.evaluate(() => document.documentElement.classList.contains('a11y-contrast'));
		const prefs = await page.evaluate(() => window.A11yToolbar.getPrefs());
		report.log('API toggle + getPrefs', contrastOn && prefs.contrast === true, JSON.stringify(prefs));

		/* setPrefs / reset */
		await page.evaluate(() => window.A11yToolbar.setPrefs({ fontScale: 120, invert: true }));
		const setPrefs = await page.evaluate(() => ({
			size: document.documentElement.style.fontSize,
			zoom: document.documentElement.style.zoom,
			invert: document.documentElement.classList.contains('a11y-invert')
		}));
		report.log('API setPrefs applies values', (setPrefs.size === '120%' || setPrefs.zoom === '1.2') && setPrefs.invert === true, JSON.stringify(setPrefs));

		await page.evaluate(() => window.A11yToolbar.reset());
		const resetPrefs = await page.evaluate(() => ({
			size: document.documentElement.style.fontSize,
			zoom: document.documentElement.style.zoom,
			invert: document.documentElement.classList.contains('a11y-invert')
		}));
		report.log('API reset restores defaults', (resetPrefs.size === '100%' || (resetPrefs.size === '' && resetPrefs.zoom === '')) && resetPrefs.invert === false, JSON.stringify(resetPrefs));

		/* destroy cleanup */
		await page.evaluate(() => window.A11yToolbar.destroy());
		const destroyed = await page.evaluate(() => ({
			panel: !!document.getElementById('a11y-toolbar'),
			guide: !!document.getElementById('a11y-reading-guide-el'),
			contrast: document.documentElement.classList.contains('a11y-contrast'),
			fontSize: document.documentElement.style.fontSize,
			posAttr: document.documentElement.getAttribute('data-a11y-position'),
			trigExpanded: document.getElementById('custom-trigger').getAttribute('aria-expanded'),
			trigControls: document.getElementById('custom-trigger').getAttribute('aria-controls')
		}));
		report.log('destroy removes everything + cleans external trigger',
			!destroyed.panel && !destroyed.guide && !destroyed.contrast && !destroyed.fontSize && !destroyed.posAttr && !destroyed.trigExpanded && !destroyed.trigControls,
			JSON.stringify(destroyed));

		/* re-init after destroy */
		await page.evaluate(() => window.A11yToolbar.init({}));
		const reinit = await page.evaluate(() => !!document.getElementById('a11y-trigger') && !!document.getElementById('a11y-toolbar'));
		report.log('re-init after destroy', reinit);

		/* full theming via init */
		await page.evaluate(() => {
			window.A11yToolbar.destroy();
			window.A11yToolbar.init({
				colors: { accent: '#b91c1c', radius: '2px' },
				fonts: { ui: 'Georgia, serif', dyslexia: 'Courier New, monospace' },
				labels: { title: 'Zugänglichkeit', triggerText: 'Zugang' },
				credit: { text: 'Made by', name: 'Test Org', url: 'https://example.org' }
			});
		});
		const custom = await page.evaluate(() => ({
			accent: getComputedStyle(document.querySelector('.a11y-badge')).backgroundColor,
			radius: getComputedStyle(document.getElementById('a11y-toolbar')).borderRadius,
			title: document.querySelector('.a11y-title').textContent,
			triggerText: document.querySelector('.a11y-trigger-label').textContent,
			font: getComputedStyle(document.querySelector('.a11y-title')).fontFamily,
			credit: !!document.querySelector('.a11y-credit')
		}));
		report.log('theming: accent/radius via config', custom.accent.includes('185, 28, 28') && custom.radius === '2px', custom.accent + ' / ' + custom.radius);
		report.log('theming: labels + credit + custom UI font',
			custom.title === 'Zugänglichkeit' && custom.triggerText === 'Zugang' && custom.font.includes('Georgia') && custom.credit,
			JSON.stringify(custom));
	} finally {
		await browser.close();
		server.close();
	}

	report.finish();
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
