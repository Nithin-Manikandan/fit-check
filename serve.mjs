// Tiny local server so you can open the app on your phone over wifi.
//   node serve.mjs        (then open the "Phone" address on your phone)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = +process.env.PORT || 8080;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(data);
  });
}).listen(port, '0.0.0.0', () => {
  console.log(`\nFit Check running`);
  console.log(`  This computer: http://localhost:${port}`);
  for (const list of Object.values(os.networkInterfaces()))
    for (const n of list) if (n.family === 'IPv4' && !n.internal) console.log(`  Phone (same wifi): http://${n.address}:${port}`);
  console.log('');
});
