// sw.js - Service Worker para Agro Pro
const CACHE_NAME = 'agro-pro-v2';
const urlsToCache = [
  './',
  './index.html',
  './app.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Cacheando arquivos');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  console.log('[Service Worker] Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Retorna do cache se encontrado
      if (response) {
        return response;
      }
      // Senão, busca na rede
      return fetch(event.request).then(response => {
        // Verifica se é uma resposta válida
        if (!response || response.status !== 200) {
          return response;
        }
        // Clona e salva no cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

// Push notifications (opcional)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização no Agro Pro',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%231a4373"/%3E%3Ctext x="50" y="68" font-size="50" text-anchor="middle" fill="white"%3E🚜%3C/text%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%231a4373"/%3E%3C/svg%3E',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(
    self.registration.showNotification('Agro Pro', options)
  );
});