const CACHE_NAME = 'scorptimer-v3';
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'sw.js',
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
  'bel.mp3',
  'orange.mp3',
  'zahvat.mp3'
];

// Установка — кэшируем все файлы
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Кэширую все файлы...');
      return cache.addAll(urlsToCache).catch(function(err) {
        console.error('Ошибка кэширования:', err);
      });
    })
  );
  // Активируем новый SW сразу
  self.skipWaiting();
});

// Активация — удаляем старые кэши
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  // Берём контроль над всеми клиентами
  self.clients.claim();
});

// Перехват запросов — сначала кэш, потом сеть
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Возвращаем из кэша, если есть
      if (response) {
        return response;
      }
      // Если нет в кэше — пробуем сеть
      return fetch(event.request).then(function(networkResponse) {
        // Кэшируем новые файлы для будущего офлайн-доступа
        if (networkResponse && networkResponse.status === 200) {
          var clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clonedResponse);
          });
        }
        return networkResponse;
      }).catch(function() {
        // Если сеть недоступна и файла нет в кэше — возвращаем index.html
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
        return new Response('Офлайн — файл не в кэше', { status: 503 });
      });
    })
  );
});
