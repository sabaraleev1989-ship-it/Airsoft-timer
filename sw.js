const CACHE_NAME = 'scorptimer-v2';
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
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function(response) {
      return response || fetch(event.request).then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaqueredirect') {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clonedResponse);
          });
        }
        return networkResponse;
      }).catch(function() {
        return caches.match(event.request);
      });
    })
  );
});
