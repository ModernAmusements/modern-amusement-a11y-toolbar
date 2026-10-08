'use strict';

/**
 * Node smoke test: the UMD module must be importable without a DOM
 * (guards, API surface, version sync with package.json).
 *
 *   node tests/config.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const A11yToolbar = require(path.join(__dirname, '..', 'a11y-toolbar.js'));
const pkg = require(path.join(__dirname, '..', 'package.json'));

let passed = 0;
let failed = 0;

function check(name, fn) {
	try {
		fn();
		passed++;
		console.log('PASS ' + name);
	} catch (e) {
		failed++;
		console.log('FAIL ' + name + ' — ' + e.message);
	}
}

check('module imports without a DOM', () => {
	assert.strictEqual(typeof A11yToolbar, 'object');
});

check('version matches package.json', () => {
	assert.strictEqual(A11yToolbar.version, pkg.version);
});

check('public API surface is complete', () => {
	['init', 'destroy', 'open', 'close', 'togglePanel', 'getPrefs', 'setPrefs', 'reset', 'toggle'].forEach((method) => {
		assert.strictEqual(typeof A11yToolbar[method], 'function', 'missing method: ' + method);
	});
});

check('getPrefs is null before init (no crash)', () => {
	assert.strictEqual(A11yToolbar.getPrefs(), null);
});

check('safe no-op API calls before init', () => {
	A11yToolbar.open();
	A11yToolbar.close();
	A11yToolbar.destroy();
	A11yToolbar.reset();
	A11yToolbar.toggle('contrast');
	assert.strictEqual(A11yToolbar.getPrefs(), null);
});

check('package files list includes distributables', () => {
	['a11y-toolbar.js', 'a11y-toolbar.css', 'LICENSE'].forEach((file) => {
		assert.ok(pkg.files.indexOf(file) !== -1 || file === 'LICENSE', 'missing in package.json files: ' + file);
	});
});

check('config.example.js is valid and complete', () => {
	const source = fs.readFileSync(path.join(__dirname, '..', 'config.example.js'), 'utf8');
	const sandbox = { window: {} };
	vm.runInNewContext(source, sandbox);
	const config = sandbox.window.A11yToolbarConfig;
	assert.ok(config && typeof config === 'object', 'no A11yToolbarConfig exported');
	assert.strictEqual(config.toggles.length, 13, 'expected 13 toggles');
	assert.strictEqual(config.fontScale.max, 200, 'expected 200% max font scale');
	assert.strictEqual(config.fontScale.mode, 'auto', 'expected auto font scale mode');
	assert.ok(config.scope && config.scope.iframes === true && config.scope.shadowDom === true, 'expected scope defaults');
	assert.ok(typeof config.colors.accent === 'string', 'expected accent color');
});

console.log('\nconfig: ' + passed + '/' + (passed + failed) + ' checks passed');
if (failed) process.exitCode = 1;
