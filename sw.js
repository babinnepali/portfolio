// sw.js (Service Worker)

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('portfolio-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/index.js',
        '/public/hero.jpg',
      ]);
    })
  );
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
