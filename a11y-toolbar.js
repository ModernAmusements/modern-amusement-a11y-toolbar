/**
 * Modern Amusement Accessibility Toolbar
 * =======================================
 * White-label, dependency-free accessibility toolbar for any website.
 *
 * - 13 accessibility toggles + font scaling + reset
 * - Themeable: colors, fonts, position, labels (i18n), toggles
 * - White-label: no branding by default; optional "credit" block
 * - Persists preferences in localStorage
 * - Desktop panel + mobile bottom sheet, keyboard and screen-reader aware
 * - Same-origin iframes and open Shadow DOM are covered
 * - Font scaling works on rem- and px-based sites (auto mode)
 * - Preserves a site's own root CSS filter when inverting/grayscaling
 *
 * Quick start:
 *   <link rel="stylesheet" href="a11y-toolbar.css">
 *   <script>window.A11yToolbarConfig = { colors: { accent: '#0a7d55' } };</script>
 *   <script src="a11y-toolbar.js" defer></script>
 *
 * Manual control:
 *   A11yToolbar.init({ ... });   A11yToolbar.destroy();   A11yToolbar.open();
 *
 * License: free for non-profit organizations; commercial use requires a
 * commercial license. See LICENSE.
 *
 * @version 1.1.0
 * @author  Shady Tawfik — Modern Amusement — https://modern-amusement.dev/de
 */
(function (root, factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = factory(root);
	} else if (typeof define === 'function' && define.amd) {
		define([], function () { return factory(root); });
	} else {
		root.A11yToolbar = factory(root);
	}
})(typeof self !== 'undefined' ? self : this, function (root) {
	'use strict';

	var VERSION = '1.2.1';

	var TOGGLE_IDS = [
		'contrast',
		'invert',
		'grayscale',
		'underlineLinks',
		'highlightLinks',
		'highlightHeadings',
		'letterSpacing',
		'lineHeight',
		'focusRing',
		'bigCursor',
		'readingGuide',
		'pauseAnimations',
		'dyslexiaFont'
	];

	var TOGGLE_DEFS = {
		contrast:         { icon: 'contrast',  cls: 'a11y-contrast' },
		invert:           { icon: 'moon',      cls: 'a11y-invert', exclusive: 'grayscale' },
		grayscale:        { icon: 'droplet',   cls: 'a11y-grayscale', exclusive: 'invert' },
		underlineLinks:   { icon: 'underline', cls: 'a11y-underline-links' },
		highlightLinks:   { icon: 'link',      cls: 'a11y-highlight-links' },
		highlightHeadings:{ icon: 'heading',   cls: 'a11y-highlight-headings' },
		letterSpacing:    { icon: 'type',      cls: 'a11y-letter-spacing' },
		lineHeight:       { icon: 'lines',     cls: 'a11y-line-height' },
		focusRing:        { icon: 'focus',     cls: 'a11y-focus-ring' },
		bigCursor:        { icon: 'cursor',    cls: 'a11y-big-cursor' },
		readingGuide:     { icon: 'ruler',     cls: 'a11y-reading-guide-el' },
		pauseAnimations:  { icon: 'pause',     cls: 'a11y-no-animation' },
		dyslexiaFont:     { icon: 'book',      cls: 'a11y-dyslexia' }
	};

	var ICONS = {
		contrast: '<circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z"/>',
		moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
		droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
		underline: '<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>',
		link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
		heading: '<path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/>',
		type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
		lines: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
		focus: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/>',
		cursor: '<path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/>',
		ruler: '<path d="M21.3 8.7l-6-6L3.7 14.3a2.02 2.02 0 0 0 0 2.83l3.17 3.17a2.02 2.02 0 0 0 2.83 0L21.3 11.5a2 2 0 0 0 0-2.83z"/><path d="M14.7 14.5l-4-4"/><path d="M18.7 10.5l-4-4"/><path d="M22.7 6.5l-4-4"/>',
		pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
		book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
		accessibility: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>'
	};

	var DEFAULT_LABELS = {
		open: 'Open accessibility',
		triggerText: 'Accessibility',
		title: 'Accessibility',
		close: 'Close',
		fontSize: 'Font size',
		fontDecrease: 'Decrease font size',
		fontIncrease: 'Increase font size',
		reset: 'Reset',
		resetAria: 'Reset all settings',
		credit: 'Developed by',
		toggles: {
			contrast: 'High contrast',
			invert: 'Dark mode',
			grayscale: 'Remove colors',
			underlineLinks: 'Underline links',
			highlightLinks: 'Highlight links',
			highlightHeadings: 'Highlight headings',
			letterSpacing: 'More letter spacing',
			lineHeight: 'More line height',
			focusRing: 'Strong focus outline',
			bigCursor: 'Big cursor',
			readingGuide: 'Reading guide',
			pauseAnimations: 'Pause animations',
			dyslexiaFont: 'Dyslexia-friendly font'
		}
	};

	/* Config color key -> CSS custom property. */
	var COLOR_VARS = {
		accent: '--a11y-accent',
		accentText: '--a11y-accent-text',
		surface: '--a11y-surface',
		surfaceHover: '--a11y-surface-hover',
		text: '--a11y-text',
		textMuted: '--a11y-text-muted',
		border: '--a11y-border',
		focus: '--a11y-focus',
		highlight: '--a11y-highlight',
		highlightText: '--a11y-highlight-text',
		readingGuide: '--a11y-reading-guide',
		readingGuideBg: '--a11y-reading-guide-bg',
		backdrop: '--a11y-backdrop',
		radius: '--a11y-radius',
		radiusSm: '--a11y-radius-sm'
	};

	var FONT_VARS = {
		ui: '--a11y-font-ui',
		dyslexia: '--a11y-font-dyslexia'
	};

	var LAYOUT_VARS = [
		'--a11y-z',
		'--a11y-side',
		'--a11y-trigger-bottom',
		'--a11y-panel-bottom',
		'--a11y-base-filter'
	];

	/* ----------------------------------------------------------------
	 * Small utilities
	 * ---------------------------------------------------------------- */

	function isPlainObject(value) {
		return !!value && typeof value === 'object' && !Array.isArray(value);
	}

	function extend(target) {
		for (var i = 1; i < arguments.length; i++) {
			var src = arguments[i];
			if (!isPlainObject(src)) continue;
			for (var key in src) {
				if (Object.prototype.hasOwnProperty.call(src, key)) {
					target[key] = src[key];
				}
			}
		}
		return target;
	}

	function extendDeep(target, source) {
		if (!isPlainObject(source)) return target;
		for (var key in source) {
			if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
			var value = source[key];
			if (isPlainObject(value)) {
				if (!isPlainObject(target[key])) target[key] = {};
				extendDeep(target[key], value);
			} else {
				target[key] = value;
			}
		}
		return target;
	}

	function clamp(value, min, max) {
		value = Number(value);
		if (isNaN(value)) return min;
		return Math.min(max, Math.max(min, value));
	}

	function el(tag, attrs, children) {
		var node = document.createElement(tag);
		if (attrs) {
			for (var key in attrs) {
				if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue;
				var value = attrs[key];
				if (value === null || value === undefined) continue;
				if (key === 'text') node.textContent = String(value);
				else if (key === 'class') node.className = String(value);
				else if (key === 'style') node.setAttribute('style', String(value));
				else node.setAttribute(key, String(value));
			}
		}
		if (children) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				if (child === null || child === undefined || child === false) continue;
				node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
			}
		}
		return node;
	}

	function iconSvg(key) {
		var ns = 'http://www.w3.org/2000/svg';
		var svg = document.createElementNS(ns, 'svg');
		svg.setAttribute('width', '18');
		svg.setAttribute('height', '18');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('fill', 'none');
		svg.setAttribute('stroke', 'currentColor');
		svg.setAttribute('stroke-width', '2');
		svg.setAttribute('stroke-linecap', 'round');
		svg.setAttribute('stroke-linejoin', 'round');
		svg.setAttribute('aria-hidden', 'true');
		svg.setAttribute('focusable', 'false');
		svg.innerHTML = ICONS[key] || ICONS.accessibility;
		return svg;
	}

	/* ----------------------------------------------------------------
	 * Module state
	 * ---------------------------------------------------------------- */

	var state = null;

	function normalizeConfig(options) {
		var config = extendDeep({
			autoInit: true,
			storageKey: 'a11y_toolbar_prefs',
			position: 'left',
			zIndex: 2147483000,
			trigger: null,
			credit: false,
			toggles: TOGGLE_IDS.slice(),
			fontScale: { step: 10, min: 80, max: 200, start: 100, mode: 'auto' },
			scope: { iframes: true, shadowDom: true },
			colors: {},
			fonts: {},
			offset: { side: '1.5rem', triggerBottom: '1.5rem', panelBottom: '5.5rem' },
			labels: {},
			onOpen: null,
			onClose: null,
			onChange: null
		}, options || {});

		if (config.position !== 'right') config.position = 'left';

		config.labels = extendDeep(extendDeep({}, DEFAULT_LABELS), options && options.labels);

		config.toggles = (config.toggles || []).filter(function (id) {
			return TOGGLE_IDS.indexOf(id) !== -1;
		});

		config.fontScale.min = clamp(config.fontScale.min, 40, 200);
		config.fontScale.max = clamp(config.fontScale.max, config.fontScale.min, 300);
		config.fontScale.start = clamp(config.fontScale.start, config.fontScale.min, config.fontScale.max);
		config.fontScale.step = clamp(config.fontScale.step, 1, 100);
		if (config.fontScale.mode !== 'root' && config.fontScale.mode !== 'zoom') {
			config.fontScale.mode = 'auto';
		}

		if (!isPlainObject(config.scope)) config.scope = {};
		config.scope.iframes = config.scope.iframes !== false;
		config.scope.shadowDom = config.scope.shadowDom !== false;

		return config;
	}

	function defaultPrefs() {
		var prefs = { fontScale: state.config.fontScale.start };
		TOGGLE_IDS.forEach(function (id) { prefs[id] = false; });
		return prefs;
	}

	function loadPrefs() {
		var prefs = defaultPrefs();
		try {
			var raw = window.localStorage.getItem(state.config.storageKey);
			if (!raw) return prefs;
			var parsed = JSON.parse(raw);
			if (!isPlainObject(parsed)) return prefs;
			TOGGLE_IDS.forEach(function (id) {
				if (typeof parsed[id] === 'boolean') prefs[id] = parsed[id];
			});
			if (typeof parsed.fontScale === 'number') {
				prefs.fontScale = clamp(parsed.fontScale, state.config.fontScale.min, state.config.fontScale.max);
			}
			if (prefs.invert && prefs.grayscale) prefs.grayscale = false;
		} catch (e) { /* storage unavailable or corrupt - use defaults */ }
		return prefs;
	}

	function savePrefs() {
		try {
			window.localStorage.setItem(state.config.storageKey, JSON.stringify(state.prefs));
		} catch (e) { /* storage unavailable (private mode) - ignore */ }
	}

	/* ----------------------------------------------------------------
	 * Theming (CSS variables on <html>)
	 * ---------------------------------------------------------------- */

	function applyTheme(config) {
		var root = document.documentElement;
		var key;

		root.setAttribute('data-a11y-position', config.position);

		for (key in COLOR_VARS) {
			if (!Object.prototype.hasOwnProperty.call(COLOR_VARS, key)) continue;
			if (config.colors && config.colors[key]) {
				root.style.setProperty(COLOR_VARS[key], config.colors[key]);
			}
		}

		for (key in FONT_VARS) {
			if (!Object.prototype.hasOwnProperty.call(FONT_VARS, key)) continue;
			if (config.fonts && config.fonts[key]) {
				root.style.setProperty(FONT_VARS[key], config.fonts[key]);
			}
		}

		root.style.setProperty('--a11y-z', String(config.zIndex));
		if (config.offset.side) root.style.setProperty('--a11y-side', config.offset.side);
		if (config.offset.triggerBottom) root.style.setProperty('--a11y-trigger-bottom', config.offset.triggerBottom);
		if (config.offset.panelBottom) root.style.setProperty('--a11y-panel-bottom', config.offset.panelBottom);
	}

	function removeTheme() {
		var root = document.documentElement;
		var key;
		for (key in COLOR_VARS) {
			if (Object.prototype.hasOwnProperty.call(COLOR_VARS, key)) root.style.removeProperty(COLOR_VARS[key]);
		}
		for (key in FONT_VARS) {
			if (Object.prototype.hasOwnProperty.call(FONT_VARS, key)) root.style.removeProperty(FONT_VARS[key]);
		}
		LAYOUT_VARS.forEach(function (name) { root.style.removeProperty(name); });
	}

	/* ----------------------------------------------------------------
	 * Scope support: same-origin iframes + open Shadow DOM, font-scale
	 * mode (root font-size vs CSS zoom) and preservation of a site's
	 * own root filter.
	 * ---------------------------------------------------------------- */

	var CURSOR_URI = 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M5 2l22 13-10 2-4 8z" fill="black" stroke="white" stroke-width="2"/></svg>\') 4 2, auto';

	/* Condensed feature CSS injected into same-origin iframe documents
	   (selector: html) and open shadow roots (selector: :host-context(html)).
	   Invert and grayscale are intentionally not repeated: the root filter of
	   the top document already covers iframe boxes and shadow content. */
	function scopeCss(kind) {
		function s(cls) {
			return kind === 'shadow' ? ':host-context(html.' + cls + ')' : 'html.' + cls;
		}
		var headings = [s('a11y-highlight-headings') + ' h1'].concat(
			['h2', 'h3', 'h4', 'h5', 'h6'].map(function (h) { return s('a11y-highlight-headings') + ' ' + h; })
		).join(', ');
		var spacing = [s('a11y-letter-spacing') + ' body'].concat(
			['p', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(function (t) { return s('a11y-letter-spacing') + ' ' + t; })
		).join(', ');
		var lines = [s('a11y-line-height') + ' body'].concat(
			['p', 'li', 'span'].map(function (t) { return s('a11y-line-height') + ' ' + t; })
		).join(', ');
		var dyslexic = [s('a11y-dyslexia') + ' body',
			s('a11y-dyslexia') + ' *:not(svg):not(svg *)'].join(', ');

		return [
			s('a11y-contrast') + ' *:not(style) { background-color: transparent !important; background-image: none !important; color: #000000 !important; border-color: #000000 !important; box-shadow: none !important; text-shadow: none !important; }',
			s('a11y-contrast') + ' a { color: #0000ee !important; text-decoration: underline !important; }',
			s('a11y-contrast') + ' img { border: 1px solid #000000 !important; }',
			s('a11y-contrast') + ' :is(input, textarea, select, button) { background-color: #ffffff !important; color: #000000 !important; border: 2px solid #000000 !important; }',
			s('a11y-underline-links') + ' a { text-decoration: underline !important; text-underline-offset: 3px; }',
			s('a11y-highlight-links') + ' a { background-color: #ffff00 !important; color: #000000 !important; text-decoration: underline !important; }',
			headings + ' { background-color: #ffff00 !important; color: #000000 !important; box-shadow: 0 0 0 4px #ffff00 !important; }',
			spacing + ' { letter-spacing: 0.12em !important; }',
			lines + ' { line-height: 1.9 !important; }',
			s('a11y-focus-ring') + ' :is(a, button, input, textarea, select, summary, [tabindex]) { outline: 3px solid #0000ee !important; outline-offset: 3px !important; }',
			s('a11y-big-cursor') + ' * { cursor: ' + CURSOR_URI + ' !important; }',
			s('a11y-no-animation') + ' * { animation-duration: 0.001s !important; animation-iteration-count: 1 !important; transition-duration: 0.001s !important; scroll-behavior: auto !important; }',
			dyslexic + ' { font-family: var(--a11y-font-dyslexia, "OpenDyslexic", sans-serif) !important; }'
		].join('\n');
	}

	function getScopeSheet(doc, kind) {
		var map = state.scopeSheets[kind];
		if (!map) return null;
		var sheet = map.get(doc);
		if (sheet) return sheet;
		var win = doc.defaultView || root;
		if (typeof win.CSSStyleSheet !== 'function') return null;
		try {
			sheet = new win.CSSStyleSheet();
			sheet.replaceSync(state.scopeCss[kind]);
		} catch (e) {
			return null;
		}
		map.set(doc, sheet);
		state.createdSheets.push(sheet);
		return sheet;
	}

	function isOurSheet(sheet) {
		return state.createdSheets.indexOf(sheet) !== -1;
	}

	/* Prefer constructed stylesheets (adoptedStyleSheets): they are not
	   subject to the style-src CSP of the target document. Fall back to a
	   <style> element where the CSSStyleSheet constructor is unavailable. */
	function injectScopeStyles(target, kind) {
		try {
			var isDocument = target.nodeType === 9;
			var doc = isDocument ? target : (target.ownerDocument || document);
			var sheet = getScopeSheet(doc, kind);
			if (sheet) {
				var adopted = null;
				try { adopted = target.adoptedStyleSheets; } catch (e) { adopted = null; }
				if (adopted && typeof adopted.indexOf === 'function') {
					if (adopted.indexOf(sheet) === -1) {
						target.adoptedStyleSheets = adopted.concat([sheet]);
					}
					return;
				}
			}
			var host = isDocument ? (target.head || target.documentElement) : target;
			if (!host || typeof host.appendChild !== 'function') return;
			if (typeof target.querySelector === 'function' && target.querySelector('style[data-a11y-injected]')) return;
			var style = doc.createElement('style');
			style.setAttribute('data-a11y-injected', '');
			style.textContent = state.scopeCss[kind];
			host.appendChild(style);
		} catch (e) { /* cross-origin or detached node - ignore */ }
	}

	function removeScopeStyles(target) {
		try {
			var adopted = target.adoptedStyleSheets;
			if (adopted && adopted.length) {
				var filtered = [];
				for (var i = 0; i < adopted.length; i++) {
					if (!isOurSheet(adopted[i])) filtered.push(adopted[i]);
				}
				if (filtered.length !== adopted.length) target.adoptedStyleSheets = filtered;
			}
		} catch (e) { /* ignore */ }
		try {
			var injected = target.querySelector && target.querySelector('style[data-a11y-injected]');
			if (injected && injected.parentNode) injected.parentNode.removeChild(injected);
		} catch (e) { /* ignore */ }
	}

	function syncFrame(frame) {
		if (!state || !state.config.scope.iframes) return;
		try {
			var doc = frame.contentDocument;
			if (!doc || !doc.documentElement) return;
			injectScopeStyles(doc, 'frame');
			var rootEl = doc.documentElement;
			TOGGLE_IDS.forEach(function (id) {
				var def = TOGGLE_DEFS[id];
				if (def && id !== 'readingGuide') rootEl.classList.toggle(def.cls, !!state.prefs[id]);
			});
			applyFontScaleTo(rootEl);
			if (state.config.fonts && state.config.fonts.dyslexia) {
				rootEl.style.setProperty('--a11y-font-dyslexia', state.config.fonts.dyslexia);
			}
		} catch (e) { /* cross-origin frame - cannot be styled by design */ }
	}

	function syncFrames() {
		if (!state || !state.config.scope.iframes) return;
		var frames = document.querySelectorAll('iframe');
		for (var i = 0; i < frames.length; i++) syncFrame(frames[i]);
	}

	function cleanupFrame(frame) {
		try {
			var doc = frame.contentDocument;
			if (!doc || !doc.documentElement) return;
			var rootEl = doc.documentElement;
			TOGGLE_IDS.forEach(function (id) {
				var def = TOGGLE_DEFS[id];
				if (def && id !== 'readingGuide') rootEl.classList.remove(def.cls);
			});
			rootEl.style.fontSize = '';
			rootEl.style.zoom = '';
			removeScopeStyles(doc);
		} catch (e) { /* ignore */ }
	}

	function processShadowRoot(shadowRoot) {
		if (!state || !state.config.scope.shadowDom) return;
		if (!shadowRoot || shadowRoot.nodeType !== 11) return;
		injectScopeStyles(shadowRoot, 'shadow');
	}

	function forEachShadowRoot(callback) {
		function walk(scope) {
			if (!scope || typeof scope.querySelectorAll !== 'function') return;
			var els = scope.querySelectorAll('*');
			for (var i = 0; i < els.length; i++) {
				var shadowRoot = els[i].shadowRoot;
				if (shadowRoot) {
					callback(shadowRoot);
					walk(shadowRoot);
				}
			}
		}
		walk(document);
	}

	function scanNodeForScopes(node) {
		if (!state || !node) return;
		if (node.nodeType === 1) {
			if (state.config.scope.shadowDom && node.shadowRoot) processShadowRoot(node.shadowRoot);
			if (state.config.scope.iframes && node.tagName === 'IFRAME') syncFrame(node);
		}
		if (typeof node.querySelectorAll !== 'function') return;
		var els = node.querySelectorAll('*');
		for (var i = 0; i < els.length; i++) {
			var el = els[i];
			if (state.config.scope.shadowDom && el.shadowRoot) processShadowRoot(el.shadowRoot);
			if (state.config.scope.iframes && el.tagName === 'IFRAME') syncFrame(el);
		}
	}

	function scheduleScopeScan(nodes) {
		if (!state) return;
		for (var i = 0; i < nodes.length; i++) state.pendingNodes.push(nodes[i]);
		if (state.scanScheduled) return;
		state.scanScheduled = true;
		root.setTimeout(function () {
			if (!state) return;
			state.scanScheduled = false;
			var pending = state.pendingNodes.splice(0, state.pendingNodes.length);
			for (var j = 0; j < pending.length; j++) scanNodeForScopes(pending[j]);
		}, 120);
	}

	function startScopeObserver() {
		if (!state.config.scope.shadowDom && !state.config.scope.iframes) return;
		if (typeof root.MutationObserver !== 'function') return;
		state.observer = new root.MutationObserver(function (mutations) {
			var added = [];
			for (var i = 0; i < mutations.length; i++) {
				var nodes = mutations[i].addedNodes;
				for (var j = 0; j < nodes.length; j++) added.push(nodes[j]);
			}
			if (added.length) scheduleScopeScan(added);
		});
		state.observer.observe(document.documentElement, { childList: true, subtree: true });
	}

	function patchAttachShadow() {
		if (!state.config.scope.shadowDom) return;
		var proto = root.Element && root.Element.prototype;
		if (!proto || typeof proto.attachShadow !== 'function') return;
		var original = proto.attachShadow;
		var wrapper = function (init) {
			var shadowRoot = original.apply(this, arguments);
			if (init && init.mode === 'open' && state && state.config.scope.shadowDom) {
				try { processShadowRoot(shadowRoot); } catch (e) { /* ignore */ }
			}
			return shadowRoot;
		};
		state.bound.attachShadowOriginal = original;
		state.bound.attachShadowWrapper = wrapper;
		proto.attachShadow = wrapper;
	}

	function unpatchAttachShadow() {
		var proto = root.Element && root.Element.prototype;
		if (!proto || !state.bound.attachShadowOriginal || !state.bound.attachShadowWrapper) return;
		if (proto.attachShadow === state.bound.attachShadowWrapper) {
			proto.attachShadow = state.bound.attachShadowOriginal;
		}
	}

	/* Font scaling: root font-size for rem/em-based sites, CSS zoom for
	   px-based sites (auto-detected), configurable via fontScale.mode. */
	function detectFontScaleMode() {
		var configured = state.config.fontScale.mode;
		if (configured === 'root' || configured === 'zoom') return configured;

		var probes = document.querySelectorAll('p, li, a, span, h1, h2, h3, h4, h5, h6, button, td, label, blockquote');
		var sample = [];
		for (var i = 0; i < probes.length && sample.length < 12; i++) {
			var candidate = probes[i];
			if (candidate.closest && candidate.closest('#a11y-toolbar, .a11y-trigger')) continue;
			sample.push(candidate);
		}
		if (!sample.length) return 'root';

		var before = [];
		for (i = 0; i < sample.length; i++) before.push(root.getComputedStyle(sample[i]).fontSize);

		var rootEl = document.documentElement;
		var prev = rootEl.style.fontSize;
		rootEl.style.fontSize = '110%';
		void rootEl.offsetWidth;

		var changed = false;
		for (i = 0; i < sample.length; i++) {
			if (root.getComputedStyle(sample[i]).fontSize !== before[i]) { changed = true; break; }
		}
		rootEl.style.fontSize = prev;

		return changed ? 'root' : 'zoom';
	}

	function applyFontScaleTo(targetRoot) {
		var scale = state.prefs.fontScale;
		if (state.fontScaleMode === 'zoom') {
			targetRoot.style.fontSize = '';
			targetRoot.style.zoom = scale === 100 ? '' : String(scale / 100);
		} else {
			targetRoot.style.zoom = '';
			targetRoot.style.fontSize = scale + '%';
		}
	}

	/* Preserve a site's own filter on <html> when invert/grayscale is active:
	   the site's computed filter is captured while no toolbar filter is
	   applied and composed in via --a11y-base-filter. */
	function captureBaseFilter() {
		if (!state) return;
		var current = root.getComputedStyle(document.documentElement).filter;
		state.baseFilter = (current && current !== 'none') ? current : null;
	}

	function syncBaseFilter() {
		var rootEl = document.documentElement;
		if ((state.prefs.invert || state.prefs.grayscale) && state.baseFilter) {
			rootEl.style.setProperty('--a11y-base-filter', state.baseFilter);
		} else {
			rootEl.style.removeProperty('--a11y-base-filter');
		}
	}

	/* ----------------------------------------------------------------
	 * DOM construction
	 * ---------------------------------------------------------------- */

	function buildTrigger() {
		var config = state.config;
		var trigger = null;

		if (config.trigger) {
			trigger = typeof config.trigger === 'string'
				? document.querySelector(config.trigger)
				: config.trigger;
			if (trigger) {
				trigger.setAttribute('aria-controls', 'a11y-toolbar');
				trigger.setAttribute('aria-expanded', 'false');
				if (!trigger.getAttribute('aria-label') && !(trigger.textContent || '').trim()) {
					trigger.setAttribute('aria-label', config.labels.open);
				}
				state.nodes.externalTrigger = true;
			}
		}

		if (!trigger) {
			trigger = el('button', {
				id: 'a11y-trigger',
				'class': 'a11y-trigger',
				type: 'button',
				'aria-label': config.labels.open,
				'aria-controls': 'a11y-toolbar',
				'aria-expanded': 'false'
			}, [
				iconSvg('accessibility'),
				el('span', { 'class': 'a11y-trigger-label', text: config.labels.triggerText })
			]);
			document.body.appendChild(trigger);
			state.nodes.autoTrigger = true;
		}

		state.nodes.trigger = trigger;
		state.bound.triggerClick = function () { togglePanel(); };
		trigger.addEventListener('click', state.bound.triggerClick);
	}

	function buildPanel() {
		var config = state.config;
		var labels = config.labels;

		var panel = el('div', {
			id: 'a11y-toolbar',
			'class': 'a11y-toolbar',
			role: 'dialog',
			'aria-label': labels.title,
			'aria-hidden': 'true'
		});

		panel.appendChild(el('div', { 'class': 'a11y-drag-handle', 'aria-hidden': 'true' }));

		var closeBtn = el('button', {
			id: 'a11y-close',
			'class': 'a11y-close-btn',
			type: 'button',
			'aria-label': labels.close,
			text: '\u00d7'
		});
		panel.appendChild(el('div', { 'class': 'a11y-header' }, [
			el('div', { 'class': 'a11y-heading' }, [
				el('span', { 'class': 'a11y-badge', 'aria-hidden': 'true' }, [iconSvg('accessibility')]),
				el('span', { 'class': 'a11y-title', text: labels.title })
			]),
			closeBtn
		]));

		var fontDown = el('button', {
			id: 'a11y-font-down',
			'class': 'a11y-btn-sm',
			type: 'button',
			'aria-label': labels.fontDecrease,
			text: '\u2212'
		});
		var fontVal = el('span', { id: 'a11y-font-size-val', 'class': 'a11y-font-val', text: '100%' });
		var fontUp = el('button', {
			id: 'a11y-font-up',
			'class': 'a11y-btn-sm',
			type: 'button',
			'aria-label': labels.fontIncrease,
			text: '+'
		});
		panel.appendChild(el('div', { 'class': 'a11y-group' }, [
			el('span', { 'class': 'a11y-label', text: labels.fontSize }),
			el('div', { 'class': 'a11y-font-controls' }, [fontDown, fontVal, fontUp])
		]));

		var grid = el('div', { 'class': 'a11y-toggle-grid' });
		var toggleButtons = {};
		config.toggles.forEach(function (id) {
			var def = TOGGLE_DEFS[id];
			if (!def) return;
			var btn = el('button', {
				id: 'a11y-toggle-' + id,
				'class': 'a11y-toggle-btn',
				type: 'button',
				'aria-pressed': 'false'
			}, [
				iconSvg(def.icon),
				el('span', { text: labels.toggles[id] || id })
			]);
			toggleButtons[id] = btn;
			grid.appendChild(el('div', { 'class': 'a11y-group' }, [btn]));
		});
		panel.appendChild(grid);

		var resetBtn = el('button', {
			id: 'a11y-reset',
			'class': 'a11y-reset-btn',
			type: 'button',
			'aria-label': labels.resetAria,
			text: labels.reset
		});
		panel.appendChild(el('div', { 'class': 'a11y-group a11y-group--bordered' }, [resetBtn]));

		if (config.credit && (config.credit.name || config.credit.logo)) {
			var creditLink = el('a', {
				href: config.credit.url || '#',
				target: '_blank',
				rel: 'noopener noreferrer',
				'aria-label': config.credit.name || ''
			});
			if (config.credit.logo) {
				creditLink.appendChild(el('img', {
					'class': 'a11y-credit-logo',
					src: config.credit.logo,
					alt: config.credit.name || ''
				}));
			} else {
				creditLink.appendChild(el('span', { 'class': 'a11y-credit-name', text: config.credit.name }));
			}
			panel.appendChild(el('div', { 'class': 'a11y-credit' }, [
				el('span', { text: config.credit.text || labels.credit }),
				creditLink
			]));
		}

		var backdrop = el('div', {
			id: 'a11y-backdrop',
			'class': 'a11y-backdrop',
			'aria-hidden': 'true'
		});

		document.body.appendChild(backdrop);
		document.body.appendChild(panel);

		state.nodes.panel = panel;
		state.nodes.backdrop = backdrop;
		state.nodes.fontVal = fontVal;
		state.nodes.toggleButtons = toggleButtons;
		state.nodes.closeBtn = closeBtn;
		state.nodes.fontDown = fontDown;
		state.nodes.fontUp = fontUp;
		state.nodes.resetBtn = resetBtn;

		state.bound.closeClick = function () { closePanel(); };
		state.bound.backdropClick = function () { closePanel(); };
		state.bound.panelKeydown = function (e) {
			if (e.key === 'Escape') {
				closePanel();
				return;
			}
			if (e.key !== 'Tab') return;
			/* Focus trap: keep keyboard focus inside the open panel. */
			var focusables = panel.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
			if (!focusables.length) return;
			var first = focusables[0];
			var last = focusables[focusables.length - 1];
			var active = document.activeElement;
			var inside = panel.contains(active);
			if (e.shiftKey) {
				if (active === first || !inside) {
					e.preventDefault();
					last.focus();
				}
			} else if (active === last || !inside) {
				e.preventDefault();
				first.focus();
			}
		};
		state.bound.fontDownClick = function () {
			state.prefs.fontScale = clamp(state.prefs.fontScale - config.fontScale.step, config.fontScale.min, config.fontScale.max);
			savePrefs();
			applyPrefs();
		};
		state.bound.fontUpClick = function () {
			state.prefs.fontScale = clamp(state.prefs.fontScale + config.fontScale.step, config.fontScale.min, config.fontScale.max);
			savePrefs();
			applyPrefs();
		};
		state.bound.resetClick = function () {
			state.prefs = defaultPrefs();
			savePrefs();
			applyPrefs();
		};

		closeBtn.addEventListener('click', state.bound.closeClick);
		backdrop.addEventListener('click', state.bound.backdropClick);
		panel.addEventListener('keydown', state.bound.panelKeydown);
		fontDown.addEventListener('click', state.bound.fontDownClick);
		fontUp.addEventListener('click', state.bound.fontUpClick);
		resetBtn.addEventListener('click', state.bound.resetClick);

		state.bound.toggleClicks = {};
		config.toggles.forEach(function (id) {
			var btn = toggleButtons[id];
			if (!btn) return;
			state.bound.toggleClicks[id] = function () { togglePref(id); };
			btn.addEventListener('click', state.bound.toggleClicks[id]);
		});
	}

	function buildReadingGuide() {
		var guide = document.getElementById('a11y-reading-guide-el');
		if (!guide) {
			guide = el('div', {
				id: 'a11y-reading-guide-el',
				'class': 'a11y-reading-guide-el',
				'aria-hidden': 'true'
			});
			document.body.appendChild(guide);
		}
		state.nodes.guide = guide;
		state.bound.guideMove = function (e) {
			if (!guide.classList.contains('is-active')) return;
			guide.style.top = (e.clientY - 5) + 'px';
		};
		document.addEventListener('mousemove', state.bound.guideMove);
	}

	/* ----------------------------------------------------------------
	 * Behavior
	 * ---------------------------------------------------------------- */

	function applyPrefs() {
		var prefs = state.prefs;
		var rootEl = document.documentElement;
		var buttons = state.nodes.toggleButtons || {};

		applyFontScaleTo(rootEl);
		syncBaseFilter();

		TOGGLE_IDS.forEach(function (id) {
			var def = TOGGLE_DEFS[id];
			if (id === 'readingGuide') {
				if (state.nodes.guide) state.nodes.guide.classList.toggle('is-active', !!prefs[id]);
			} else if (def) {
				rootEl.classList.toggle(def.cls, !!prefs[id]);
			}
			if (buttons[id]) buttons[id].setAttribute('aria-pressed', String(!!prefs[id]));
		});

		if (state.nodes.fontVal) state.nodes.fontVal.textContent = prefs.fontScale + '%';

		syncFrames();

		if (typeof state.config.onChange === 'function') {
			state.config.onChange(getPrefs());
		}
	}

	function togglePref(id) {
		if (!state || !TOGGLE_DEFS[id]) return;
		var filterWasActive = state.prefs.invert || state.prefs.grayscale;
		var next = !state.prefs[id];
		if (next && !filterWasActive && (id === 'invert' || id === 'grayscale')) {
			captureBaseFilter();
		}
		state.prefs[id] = next;
		if (next && TOGGLE_DEFS[id].exclusive) {
			state.prefs[TOGGLE_DEFS[id].exclusive] = false;
		}
		savePrefs();
		applyPrefs();
	}

	function togglePanel() {
		if (!state) return;
		if (state.nodes.panel.getAttribute('aria-hidden') === 'false') closePanel();
		else openPanel();
	}

	function openPanel() {
		if (!state || state.nodes.panel.getAttribute('aria-hidden') === 'false') return;
		state.nodes.panel.setAttribute('aria-hidden', 'false');
		state.nodes.backdrop.setAttribute('aria-hidden', 'false');
		state.nodes.trigger.setAttribute('aria-expanded', 'true');
		document.body.classList.add('a11y-sheet-open');
		state.nodes.panel.scrollTop = 0;
		var focusTarget = state.nodes.closeBtn || state.nodes.panel;
		/* The panel is visibility:hidden until the attr change + transition have
		   been applied by the browser. Focusing while hidden is ignored, so we
		   defer the focus briefly (rAF + timeout covers all engines). */
		var focusPanel = function () {
			try { focusTarget.focus(); } catch (e) { /* ignore */ }
		};
		if (typeof root.requestAnimationFrame === 'function') {
			root.requestAnimationFrame(function () {
				root.setTimeout(focusPanel, 60);
			});
		} else {
			root.setTimeout(focusPanel, 60);
		}
		if (typeof state.config.onOpen === 'function') state.config.onOpen();
	}

	function closePanel() {
		if (!state || state.nodes.panel.getAttribute('aria-hidden') === 'true') return;
		state.nodes.panel.setAttribute('aria-hidden', 'true');
		state.nodes.backdrop.setAttribute('aria-hidden', 'true');
		state.nodes.trigger.setAttribute('aria-expanded', 'false');
		document.body.classList.remove('a11y-sheet-open');
		state.nodes.trigger.focus();
		if (typeof state.config.onClose === 'function') state.config.onClose();
	}

	/* ----------------------------------------------------------------
	 * Public API
	 * ---------------------------------------------------------------- */

	function init(options) {
		if (typeof document === 'undefined') return api; /* non-DOM environment */
		if (document.readyState === 'loading' && !document.body) {
			/* Called from a <head> script before the body exists: defer. */
			var pending = options;
			var onReady = function () {
				document.removeEventListener('DOMContentLoaded', onReady);
				init(pending);
			};
			document.addEventListener('DOMContentLoaded', onReady);
			return api;
		}
		if (state) destroy();
		var config = normalizeConfig(options);
		state = {
			config: config,
			prefs: null,
			nodes: {},
			bound: {},
			baseFilter: null,
			fontScaleMode: 'root',
			scopeCss: { frame: scopeCss('frame'), shadow: scopeCss('shadow') },
			scopeSheets: {
				frame: (typeof WeakMap === 'function') ? new WeakMap() : null,
				shadow: (typeof WeakMap === 'function') ? new WeakMap() : null
			},
			createdSheets: [],
			pendingNodes: [],
			scanScheduled: false,
			observer: null
		};
		applyTheme(config);
		buildTrigger();
		buildPanel();
		buildReadingGuide();
		state.prefs = loadPrefs();
		captureBaseFilter();
		state.fontScaleMode = detectFontScaleMode();
		applyPrefs();
		patchAttachShadow();
		startScopeObserver();
		forEachShadowRoot(processShadowRoot);
		state.bound.frameLoad = function (e) {
			var target = e.target;
			if (target && target.tagName === 'IFRAME') syncFrame(target);
		};
		document.addEventListener('load', state.bound.frameLoad, true);
		return api;
	}

	function destroy() {
		if (!state) return;
		var root = document.documentElement;
		var bound = state.bound;
		var nodes = state.nodes;
		var config = state.config;

		if (state.observer) state.observer.disconnect();
		if (bound.frameLoad) document.removeEventListener('load', bound.frameLoad, true);
		unpatchAttachShadow();

		if (config.scope.iframes) {
			var frames = document.querySelectorAll('iframe');
			for (var f = 0; f < frames.length; f++) cleanupFrame(frames[f]);
		}
		forEachShadowRoot(removeScopeStyles);

		TOGGLE_IDS.forEach(function (id) {
			var def = TOGGLE_DEFS[id];
			if (def && id !== 'readingGuide') root.classList.remove(def.cls);
		});
		document.body.classList.remove('a11y-sheet-open');
		root.style.fontSize = '';
		root.style.zoom = '';
		root.removeAttribute('data-a11y-position');
		removeTheme();

		if (bound.guideMove) document.removeEventListener('mousemove', bound.guideMove);

		if (nodes.trigger && bound.triggerClick) nodes.trigger.removeEventListener('click', bound.triggerClick);
		if (nodes.trigger) nodes.trigger.setAttribute('aria-expanded', 'false');
		if (nodes.externalTrigger && nodes.trigger) {
			nodes.trigger.removeAttribute('aria-controls');
			nodes.trigger.removeAttribute('aria-expanded');
		}

		if (nodes.closeBtn && bound.closeClick) nodes.closeBtn.removeEventListener('click', bound.closeClick);
		if (nodes.backdrop && bound.backdropClick) nodes.backdrop.removeEventListener('click', bound.backdropClick);
		if (nodes.panel && bound.panelKeydown) nodes.panel.removeEventListener('keydown', bound.panelKeydown);
		if (nodes.fontDown && bound.fontDownClick) nodes.fontDown.removeEventListener('click', bound.fontDownClick);
		if (nodes.fontUp && bound.fontUpClick) nodes.fontUp.removeEventListener('click', bound.fontUpClick);
		if (nodes.resetBtn && bound.resetClick) nodes.resetBtn.removeEventListener('click', bound.resetClick);
		if (bound.toggleClicks && nodes.toggleButtons) {
			config.toggles.forEach(function (id) {
				var btn = nodes.toggleButtons[id];
				if (btn && bound.toggleClicks[id]) btn.removeEventListener('click', bound.toggleClicks[id]);
			});
		}

		if (nodes.autoTrigger && nodes.trigger && nodes.trigger.parentNode) {
			nodes.trigger.parentNode.removeChild(nodes.trigger);
		}
		if (nodes.panel && nodes.panel.parentNode) nodes.panel.parentNode.removeChild(nodes.panel);
		if (nodes.backdrop && nodes.backdrop.parentNode) nodes.backdrop.parentNode.removeChild(nodes.backdrop);
		if (nodes.guide && nodes.guide.parentNode) nodes.guide.parentNode.removeChild(nodes.guide);

		state = null;
	}

	function getPrefs() {
		return state ? JSON.parse(JSON.stringify(state.prefs)) : null;
	}

	function setPrefs(partial) {
		if (!state || !isPlainObject(partial)) return api;
		var prefs = state.prefs;
		var filterWasActive = prefs.invert || prefs.grayscale;
		TOGGLE_IDS.forEach(function (id) {
			if (typeof partial[id] === 'boolean') prefs[id] = partial[id];
		});
		if (typeof partial.fontScale === 'number') {
			prefs.fontScale = clamp(partial.fontScale, state.config.fontScale.min, state.config.fontScale.max);
		}
		if (prefs.invert && prefs.grayscale) prefs.grayscale = false;
		if (!filterWasActive && (prefs.invert || prefs.grayscale)) captureBaseFilter();
		savePrefs();
		applyPrefs();
		return api;
	}

	function reset() {
		if (!state) return api;
		state.prefs = defaultPrefs();
		savePrefs();
		applyPrefs();
		return api;
	}

	var api = {
		version: VERSION,
		init: init,
		destroy: destroy,
		open: openPanel,
		close: closePanel,
		togglePanel: togglePanel,
		getPrefs: getPrefs,
		setPrefs: setPrefs,
		reset: reset,
		toggle: togglePref
	};

	/* ----------------------------------------------------------------
	 * Auto-init
	 * ---------------------------------------------------------------- */

	function boot() {
		var config = root.A11yToolbarConfig;
		if (config === false) return; /* disabled - manual init only */
		if (config && config.autoInit === false) return;
		init(config || {});
	}

	if (typeof document !== 'undefined') {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', boot);
		} else {
			boot();
		}
	}

	return api;
});
