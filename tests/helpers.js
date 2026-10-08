'use strict';

/**
 * Shared test helpers: Chrome detection and a tiny reporter.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function findChrome() {
	if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
		return process.env.CHROME_PATH;
	}

	const candidates = [
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		'/Applications/Chromium.app/Contents/MacOS/Chromium',
		'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
		'/usr/bin/google-chrome',
		'/usr/bin/google-chrome-stable',
		'/usr/bin/chromium',
		'/usr/bin/chromium-browser',
		'/snap/bin/chromium',
		'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
		'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
	];
	for (const candidate of candidates) {
		if (fs.existsSync(candidate)) return candidate;
	}

	/* Chrome for Testing installed via @puppeteer/browsers (default cache). */
	const cacheRoots = [
		path.join(os.homedir(), '.cache', 'puppeteer', 'chrome'),
		path.join(os.homedir(), 'Library', 'Caches', 'puppeteer', 'chrome')
	];
	const relative = [
		path.join('chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
		path.join('chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
		path.join('chrome-linux64', 'chrome'),
		path.join('chrome-linux', 'chrome'),
		path.join('chrome-win64', 'chrome.exe'),
		path.join('chrome-win32', 'chrome.exe')
	];
	for (const root of cacheRoots) {
		if (!fs.existsSync(root)) continue;
		for (const dir of fs.readdirSync(root)) {
			for (const rel of relative) {
				const candidate = path.join(root, dir, rel);
				if (fs.existsSync(candidate)) return candidate;
			}
		}
	}

	return null;
}

function createReporter(name) {
	const results = [];
	return {
		log(check, ok, extra) {
			results.push({ check: check, ok: !!ok });
			console.log((ok ? 'PASS ' : 'FAIL ') + check + (extra ? ' — ' + extra : ''));
		},
		finish() {
			const failed = results.filter((r) => !r.ok);
			console.log('\n' + name + ': ' + (results.length - failed.length) + '/' + results.length + ' checks passed');
			if (failed.length) process.exitCode = 1;
			return failed.length === 0;
		}
	};
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { findChrome, createReporter, sleep };
