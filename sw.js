const CACHE_NAME = 'strikeball-v2';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'logo3.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // сразу активировать новый SW
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Удаляем старые кэши
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  return self.clients.claim(); // начинаем контролировать все вкладки
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
