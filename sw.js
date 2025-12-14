const CACHE_NAME = 'wmebem-v2'; // Incremented version
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/tools.js',
  '/wmebem_logo.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Network First strategy for core application files
  // This ensures updates to tools.js or app.js are seen immediately
  if (url.pathname.endsWith('tools.js') || 
      url.pathname.endsWith('app.js') || 
      url.pathname.endsWith('index.html') || 
      url.pathname === '/') {
    
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // Clone the response to put in cache
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return response;
        })
        .catch(() => {
          // If network fails, fall back to cache
          return caches.match(e.request);
        })
    );
  } else {
    // Cache First strategy for images, fonts, and other assets
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request))
    );
  }
});
