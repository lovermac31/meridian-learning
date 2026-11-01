/* books.jurassicenglish.com API on Jay's server: runs the storybooks app's own api/book.js unchanged.
   Usage: node books-api-server.cjs <release-dir> [port]   (listens on 127.0.0.1 only; nginx proxies /api/book here)
   The handler reads api/_auth.json and api/_content/*.json next to itself, exactly as on Vercel. */
'use strict';
const http = require('http'), path = require('path');
const release = path.resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || process.env.PORT || 3110);
const handler = require(path.join(release, 'api', 'book.js'));

http.createServer(async (req, res) => {
  const route = new URL(req.url, 'http://local').pathname;
  // Same routes Vercel serves for the function; everything else under /api/ is nginx's 404.
  if (route !== '/api/book' && route !== '/api/book.js') {
    res.statusCode = 404; res.setHeader('Content-Type', 'text/plain; charset=utf-8'); return res.end('Not Found');
  }
  try { await handler(req, res); }
  catch (e) {
    console.error(JSON.stringify({ at: new Date().toISOString(), error: String(e && e.message || e) }));
    if (!res.headersSent) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json; charset=utf-8'); }
    res.end('{"error":"server"}');
  }
}).listen(port, '127.0.0.1', () => console.log(`books api: ${release} on 127.0.0.1:${port}`));
