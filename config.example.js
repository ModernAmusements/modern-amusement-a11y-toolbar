/**
 * Modern Amusement Accessibility Toolbar — example configuration.
 *
 * Copy this file, adapt the values and include it BEFORE a11y-toolbar.js:
 *
 *   <link rel="stylesheet" href="a11y-toolbar.css">
 *   <script src="config.js"></script>
 *   <script src="a11y-toolbar.js" defer></script>
 *
 * Every key is optional. The values below are the built-in defaults unless
 * noted otherwise.
 */
window.A11yToolbarConfig = {
	/* Set to false to disable auto-init (then call A11yToolbar.init()). */
	autoInit: true,

	/* localStorage key used to persist visitor preferences. */
	storageKey: 'a11y_toolbar_prefs',

	/* Where the trigger and panel dock: 'left' or 'right'. */
	position: 'left',

	/* Base z-index of the toolbar (trigger is +1, backdrop -1). */
	zIndex: 99998,

	/* Use an existing element as the trigger instead of the generated button.
	   Accepts a CSS selector or an element. */
	trigger: null,

	/* Optional attribution block inside the panel. false = hidden (white-label
	   default). Provide `logo` OR `name`. */
	credit: false,
	// credit: {
	// 	text: 'Developed by',
	// 	name: 'Your Organization',
	// 	url: 'https://example.org',
	// 	logo: 'https://example.org/logo.svg'
	// },

	/* Which toggles to show and in which order (default: all 13).
	   Available: contrast, invert, grayscale, underlineLinks, highlightLinks,
	   highlightHeadings, letterSpacing, lineHeight, focusRing, bigCursor,
	   readingGuide, pauseAnimations, dyslexiaFont */
	toggles: [
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
	],

	/* Font size step controls (percent of the root font size). */
	fontScale: { step: 10, min: 80, max: 150, start: 100 },

	/* Brand colors — applied as CSS custom properties on <html>. */
	colors: {
		accent: '#e8622c',          /* active buttons, borders, hover */
		accentText: '#ffffff',      /* text on accent */
		surface: '#ffffff',         /* panel background */
		surfaceHover: '#f1ece1',    /* button background */
		text: '#1a1a1a',
		textMuted: '#5c5c5c',
		border: '#e2e2e2',
		focus: '#16294f',           /* focus-ring mode outline */
		highlight: '#ffff00',       /* link/heading highlight mode */
		highlightText: '#000000',
		readingGuide: '#ffd54f',    /* reading guide borders */
		readingGuideBg: 'rgba(255, 213, 79, 0.35)',
		backdrop: 'rgba(0, 0, 0, 0.4)',
		radius: '12px',
		radiusSm: '8px'
	},

	/* Fonts. Load your webfont separately (e.g. @font-face) and reference it
	   here. OpenDyslexic ships with the toolbar (fonts/opendyslexic/). */
	fonts: {
		ui: '',        /* panel/settings font-family; empty = system stack */
		dyslexia: ''   /* dyslexia mode font-family; empty = OpenDyslexic stack */
	},

	/* Spacing of trigger/panel. */
	offset: { side: '1.5rem', triggerBottom: '1.5rem', panelBottom: '5.5rem' },

	/* Text overrides (i18n). Every key is optional; see README for the full
	   list. Example: German. */
	labels: {
		open: 'Barrierefreiheit öffnen',
		triggerText: 'Barrierefreiheit',
		title: 'Barrierefreiheit',
		close: 'Schließen',
		fontSize: 'Schriftgröße',
		fontDecrease: 'Schrift verkleinern',
		fontIncrease: 'Schrift vergrößern',
		reset: 'Zurücksetzen',
		resetAria: 'Alle Einstellungen zurücksetzen',
		credit: 'Entwickelt von',
		toggles: {
			contrast: 'Hoher Kontrast',
			invert: 'Dunkles Design',
			grayscale: 'Farben entfernen',
			underlineLinks: 'Links unterstreichen',
			highlightLinks: 'Links hervorheben',
			highlightHeadings: 'Überschriften markieren',
			letterSpacing: 'Mehr Buchstabenabstand',
			lineHeight: 'Größerer Zeilenabstand',
			focusRing: 'Deutlicher Fokusrahmen',
			bigCursor: 'Große Mauszeiger',
			readingGuide: 'Lesehilfe (Zeilenmarker)',
			pauseAnimations: 'Animationen stoppen',
			dyslexiaFont: 'Dyslexie-freundliche Schrift'
		}
	},

	/* Callbacks (optional). */
	onOpen: null,
	onClose: null,
	onChange: null
};
