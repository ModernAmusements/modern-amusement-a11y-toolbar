'use strict';

/**
 * Zero-dependency static file server for the test suite.
 * Serves the repository root so tests can load ../a11y-toolbar.js etc.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const MIME = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.txt': 'text/plain; charset=utf-8',
	'.md': 'text/markdown; charset=utf-8'
};

function start(port) {
	const server = http.createServer((req, res) => {
		let urlPath;
		try {
			urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
		} catch (e) {
			urlPath = '/';
		}
		let filePath = path.join(ROOT, urlPath);
		if (urlPath.endsWith('/')) filePath = path.join(filePath, 'index.html');
		if (!filePath.startsWith(ROOT)) {
			res.writeHead(403);
			res.end('Forbidden');
			return;
		}
		fs.stat(filePath, (err, stat) => {
			if (err || !stat.isFile()) {
				res.writeHead(404);
				res.end('Not found');
				return;
			}
			res.writeHead(200, {
				'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
			});
			fs.createReadStream(filePath).pipe(res);
		});
	});
	return new Promise((resolve) => {
		server.listen(port || 0, '127.0.0.1', () => {
			resolve({ server: server, port: server.address().port });
		});
	});
}

module.exports = { start };
