'use strict';

/**
 * Scope test suite: font-scale mode detection (root vs zoom),
 * same-origin iframe propagation, open Shadow DOM support and
 * preservation of a site's own root filter.
 *
 *   node tests/scope.test.js
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
	const report = createReporter('scope');
	const browser = await puppeteer.launch({
		executablePath: chromePath,
		headless: 'new',
		args: ['--no-sandbox']
	});

	try {
		const page = await browser.newPage();
		page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
		await page.setViewport({ width: 1200, height: 800 });
		const clearStorage = () => page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* ignore */ } });

		/* ---------------- px-based site -> zoom mode ---------------- */
		await page.setContent('<!DOCTYPE html><html><head><meta charset="utf-8">' +
			'<link rel="stylesheet" href="' + base + '/a11y-toolbar.css">' +
			'<style>html, body, p, a, span, h1, h2, h3, h4, h5, h6, button, td, label, blockquote, li { font-size: 16px; }</style>' +
			'</head><body>' +
			'<p id="px-p">Pixel based text</p><a href="#">link</a>' +
			'<div id="px-box" style="width:100px;height:10px"></div>' +
			'<script>window.A11yToolbarConfig = { autoInit: false };</script>' +
			'<script src="' + base + '/a11y-toolbar.js"></script>' +
			'</body></html>', { waitUntil: 'load' });

		await page.evaluate(() => window.A11yToolbar.init());
		await page.evaluate(() => window.A11yToolbar.setPrefs({ fontScale: 110 }));
		const zoomMode = await page.evaluate(() => ({
			zoom: document.documentElement.style.zoom,
			fontSize: document.documentElement.style.fontSize,
			boxWidth: Math.round(document.getElementById('px-box').getBoundingClientRect().width)
		}));
		report.log('px-based site: auto-switches to zoom', zoomMode.zoom === '1.1' && zoomMode.fontSize === '' && zoomMode.boxWidth === 110, JSON.stringify(zoomMode));
		await page.evaluate(() => window.A11yToolbar.destroy());

		/* ---------------- rem-based site -> root font-size ---------------- */
		await clearStorage();
		await page.setContent('<!DOCTYPE html><html><head><meta charset="utf-8">' +
			'<link rel="stylesheet" href="' + base + '/a11y-toolbar.css">' +
			'</head><body><p id="rem-p">Rem based text</p>' +
			'<script>window.A11yToolbarConfig = { autoInit: false };</script>' +
			'<script src="' + base + '/a11y-toolbar.js"></script>' +
			'</body></html>', { waitUntil: 'load' });

		await page.evaluate(() => window.A11yToolbar.init());
		await page.evaluate(() => window.A11yToolbar.setPrefs({ fontScale: 120 }));
		const rootMode = await page.evaluate(() => ({
			zoom: document.documentElement.style.zoom,
			fontSize: document.documentElement.style.fontSize
		}));
		report.log('rem-based site: uses root font-size', rootMode.fontSize === '120%' && rootMode.zoom === '', JSON.stringify(rootMode));
		await page.evaluate(() => window.A11yToolbar.destroy());

		/* ---------------- same-origin iframe propagation ---------------- */
		await clearStorage();
		await page.goto(base + '/tests/fixtures/iframe-parent.html', { waitUntil: 'networkidle0' });
		await page.evaluate(() => new Promise((resolve) => {
			const frame = document.getElementById('fr');
			if (frame.contentDocument && frame.contentDocument.readyState === 'complete') return resolve();
			frame.addEventListener('load', resolve);
		}));

		await page.evaluate(() => window.A11yToolbar.init());
		await page.evaluate(() => window.A11yToolbar.toggle('contrast'));
		await sleep(50);
		const frameState = await page.evaluate(() => {
			const doc = document.getElementById('fr').contentDocument;
			return {
				className: doc.documentElement.className,
				injected: (doc.adoptedStyleSheets && doc.adoptedStyleSheets.length > 0) || !!doc.querySelector('style[data-a11y-injected]'),
				textColor: getComputedStyle(doc.getElementById('frame-text')).color,
				boxBg: getComputedStyle(doc.getElementById('frame-box')).backgroundColor
			};
		});
		report.log('iframe: feature class propagated', frameState.className.indexOf('a11y-contrast') !== -1, frameState.className);
		report.log('iframe: feature CSS injected', frameState.injected);
		report.log('iframe: contrast applies inside frame', frameState.textColor === 'rgb(0, 0, 0)' && frameState.boxBg === 'rgba(0, 0, 0, 0)', frameState.textColor + ' / ' + frameState.boxBg);

		await page.evaluate(() => window.A11yToolbar.toggle('contrast'));
		await sleep(50);
		const frameOff = await page.evaluate(() => document.getElementById('fr').contentDocument.documentElement.className);
		report.log('iframe: class removed when toggled off', frameOff.indexOf('a11y-contrast') === -1, frameOff);

		await page.evaluate(() => window.A11yToolbar.toggle('contrast'));
		await sleep(50);
		await page.evaluate(() => window.A11yToolbar.destroy());
		const frameClean = await page.evaluate(() => {
			const doc = document.getElementById('fr').contentDocument;
			return {
				className: doc.documentElement.className,
				injected: (doc.adoptedStyleSheets && doc.adoptedStyleSheets.length > 0) || !!doc.querySelector('style[data-a11y-injected]')
			};
		});
		report.log('iframe: destroy cleans frame', frameClean.className.indexOf('a11y-') === -1 && !frameClean.injected, JSON.stringify(frameClean));

		/* ---------------- open Shadow DOM ---------------- */
		await clearStorage();
		await page.setContent('<!DOCTYPE html><html><head><meta charset="utf-8">' +
			'<link rel="stylesheet" href="' + base + '/a11y-toolbar.css">' +
			'</head><body>' +
			'<div id="host1"></div><button id="add-host">add</button>' +
			'<script>' +
			'var host1 = document.getElementById("host1");' +
			'var sr1 = host1.attachShadow({ mode: "open" });' +
			'sr1.innerHTML = "<style>#box{background:rgb(255,0,0);color:rgb(0,0,255)}#lnk{text-decoration:none;color:rgb(0,0,255)}</style><div id=\\"box\\">Shadow text <a id=\\"lnk\\" href=\\"#\\">link</a></div>";' +
			'document.getElementById("add-host").addEventListener("click", function () {' +
			'  var host2 = document.createElement("div");' +
			'  document.body.appendChild(host2);' +
			'  var sr2 = host2.attachShadow({ mode: "open" });' +
			'  sr2.innerHTML = "<p id=\\"p2\\">dynamic</p>";' +
			'});' +
			'</script>' +
			'<script>window.A11yToolbarConfig = { autoInit: false };</script>' +
			'<script src="' + base + '/a11y-toolbar.js"></script>' +
			'</body></html>', { waitUntil: 'load' });

		await page.evaluate(() => window.A11yToolbar.init());
		const shadowInjected = await page.evaluate(() => {
			const sr = document.getElementById('host1').shadowRoot;
			return (sr.adoptedStyleSheets && sr.adoptedStyleSheets.length > 0) || !!sr.querySelector('style[data-a11y-injected]');
		});
		report.log('shadow DOM: initial scan injects styles', shadowInjected);

		await page.evaluate(() => window.A11yToolbar.toggle('contrast'));
		await sleep(50);
		const shadowState = await page.evaluate(() => {
			const sr = document.getElementById('host1').shadowRoot;
			return {
				bg: getComputedStyle(sr.getElementById('box')).backgroundColor,
				color: getComputedStyle(sr.getElementById('box')).color
			};
		});
		report.log('shadow DOM: contrast applies inside open root', shadowState.bg === 'rgba(0, 0, 0, 0)' && shadowState.color === 'rgb(0, 0, 0)', JSON.stringify(shadowState));

		await page.evaluate(() => window.A11yToolbar.toggle('contrast'));
		await page.evaluate(() => window.A11yToolbar.toggle('underlineLinks'));
		await sleep(50);
		const shadowLink = await page.evaluate(() => getComputedStyle(document.getElementById('host1').shadowRoot.getElementById('lnk')).textDecorationLine);
		report.log('shadow DOM: underline links applies', shadowLink.includes('underline'), shadowLink);
		await page.evaluate(() => window.A11yToolbar.toggle('underlineLinks'));

		/* dynamically created shadow root (attachShadow patch) */
		await page.click('#add-host');
		await sleep(250);
		const dynamicInjected = await page.evaluate(() => {
			const hosts = document.querySelectorAll('body > div');
			const host = hosts[hosts.length - 1];
			return !!(host.shadowRoot && ((host.shadowRoot.adoptedStyleSheets && host.shadowRoot.adoptedStyleSheets.length > 0) || host.shadowRoot.querySelector('style[data-a11y-injected]')));
		});
		report.log('shadow DOM: attachShadow patch covers new roots', dynamicInjected);

		await page.evaluate(() => window.A11yToolbar.destroy());
		const shadowClean = await page.evaluate(() => {
			const sr = document.getElementById('host1').shadowRoot;
			return (sr.adoptedStyleSheets && sr.adoptedStyleSheets.length > 0) || !!sr.querySelector('style[data-a11y-injected]');
		});
		report.log('shadow DOM: destroy removes injected styles', !shadowClean);

		/* ---------------- site root filter is preserved ---------------- */
		await clearStorage();
		await page.setContent('<!DOCTYPE html><html><head><meta charset="utf-8">' +
			'<link rel="stylesheet" href="' + base + '/a11y-toolbar.css">' +
			'<style>html { filter: sepia(1); }</style>' +
			'</head><body><p>Filtered site</p>' +
			'<script>window.A11yToolbarConfig = { autoInit: false };</script>' +
			'<script src="' + base + '/a11y-toolbar.js"></script>' +
			'</body></html>', { waitUntil: 'load' });

		await page.evaluate(() => window.A11yToolbar.init());
		await page.evaluate(() => window.A11yToolbar.toggle('invert'));
		await sleep(50);
		const composed = await page.evaluate(() => getComputedStyle(document.documentElement).filter);
		report.log('site filter: composed with invert', composed.includes('sepia') && composed.includes('invert'), composed);

		await page.evaluate(() => window.A11yToolbar.toggle('invert'));
		await sleep(50);
		const restored = await page.evaluate(() => getComputedStyle(document.documentElement).filter);
		report.log('site filter: restored after toggle off', restored.includes('sepia') && !restored.includes('invert'), restored);

		/* grayscale path too */
		await page.evaluate(() => window.A11yToolbar.toggle('grayscale'));
		await sleep(50);
		const composedGray = await page.evaluate(() => getComputedStyle(document.documentElement).filter);
		report.log('site filter: composed with grayscale', composedGray.includes('sepia') && composedGray.includes('grayscale'), composedGray);
	} finally {
		await browser.close();
		server.close();
	}

	report.finish();
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
