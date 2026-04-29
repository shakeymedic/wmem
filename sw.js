const CACHE_NAME = 'emevidence-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/tools.js',
  '/updates.js',
  '/wmebem_logo.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
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

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Network First for core app files — ensures updates are always seen
  if (
    url.pathname.endsWith('tools.js') ||
    url.pathname.endsWith('updates.js') ||
    url.pathname.endsWith('app.js') ||
    url.pathname.endsWith('index.html') ||
    url.pathname === '/'
  ) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Cache First for images and other static assets
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request))
    );
  }
});
