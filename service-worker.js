const CACHE_NAME = 'pokedex-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/responsive.css',
  '/css/themes.css',
  '/js/api.js',
  '/js/pokeapi.js',
  '/js/ui.js',
  '/js/app.js',
  '/js/touch-gestures.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Estrategia de caché: Network first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, clonarla y almacenarla en caché
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Si la red falla, intentar desde caché
        return caches.match(event.request);
      })
  );
});

// Caché de imágenes de Pokémon
self.addEventListener('fetch', event => {
  if (event.request.url.includes('raw.githubusercontent.com/PokeAPI/sprites')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          const responseToCache = fetchResponse.clone();
          caches.open('pokemon-images').then(cache => {
            cache.put(event.request, responseToCache);
          });
          return fetchResponse;
        });
      })
    );
  }
});