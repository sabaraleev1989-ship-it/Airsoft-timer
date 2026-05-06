const CACHE_NAME = 'scorptimer-v1';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'logo3.png',
  'logo6.png',
  'siren.mp3',
  'siren1.mp3',
  'siren2.mp3',
  'siren3.mp3',
  'start.mp3',
  'kras.mp3',
  'sinie.mp3',
  'zelen.mp3',
  'zeltie.mp3',
  'bel.mp3'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
