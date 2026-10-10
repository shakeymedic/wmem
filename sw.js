// Bump CACHE_NAME whenever the list of pre-cached files changes; old caches are deleted on activate
const CACHE_NAME = 'emevidence-v5';
const ASSETS = [
  '/',
  '/index.html',
  '/privacy.html',
  '/styles.css',
  '/theme-init.js',
  '/app.js',
  '/tools.js',
  '/updates.js',
  '/subscribe.js',
  '/vendor/fuse.min.js',
  '/fonts/inter-latin-wght-normal.woff2',
  '/icons/logo-128.png?v=2',
  '/icons/logo-128.webp?v=2',
  '/icons/logo-256.png?v=2',
  '/icons/logo-256.webp?v=2',
  '/icons/icon-192.png?v=2',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    // cache: 'reload' skips the browser's HTTP cache, so a new version never re-caches old files
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' }))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Remove old caches on activation
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function putInCache(request, response) {
  if (response && response.ok) {
    const clone = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
  }
  return response;
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Only handle our own GET requests; Drive, Loops and the tool sites go straight to the network
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Fonts and images rarely change: serve from cache, refresh in the background
  if (/\.(png|jpe?g|webp|svg|ico|woff2)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const network = fetch(e.request)
          .then((res) => putInCache(e.request, res))
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Pages, scripts and styles: network first so updates are seen straight away; cache when offline
  e.respondWith(
    fetch(e.request)
      .then((res) => putInCache(e.request, res))
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
