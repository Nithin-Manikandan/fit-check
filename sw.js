// Offline cache: the app itself, plus the AI library once it has been loaded.
const V = 'fitcheck-v1';
const SHELL = ['./', 'index.html', 'css/style.css', 'manifest.webmanifest', 'icons/icon.svg',
  'js/app.js', 'js/catalog.js', 'js/color.js', 'js/db.js', 'js/demo.js', 'js/images.js', 'js/layout.js', 'js/ml.js', 'js/pipeline.js', 'js/stylist.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isLib = url.hostname === 'cdn.jsdelivr.net';
  if (!sameOrigin && !isLib) return; // model files are cached by transformers.js itself
  e.respondWith((async () => {
    const cache = await caches.open(V);
    const hit = await cache.match(req);
    const refresh = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; });
    if (hit) { if (sameOrigin) refresh.catch(() => {}); return hit; } // app: show cached, update in background
    return refresh;
  })());
});
