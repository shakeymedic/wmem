self.addEventListener('fetch', (e) => {
  // For API calls or critical files, try network first
  if (e.request.url.includes('tools.js') || e.request.url.includes('index.html')) {
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
    // For images/static assets, use cache first
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request))
    );
  }
});
