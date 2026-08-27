const VERSION = 'takeout-tidy-v1';
const SHELL = ['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/assets/icon.svg', '/assets/hero-paper-archive-640.webp', '/assets/hero-paper-archive.webp', '/assets/hero-paper-archive.jpg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then(async (cache) => {
    await Promise.all(SHELL.map(async (url) => {
      const response = await fetch(url, { cache: 'reload' });
      if (!response.ok) throw new Error(`Could not precache ${url}`);
      await cache.put(url, response);
    }));
  }));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone(); caches.open(VERSION).then((cache) => cache.put(event.request, copy)); return response;
    }).catch(async () => (await caches.match(event.request, { ignoreVary: true })) || (await caches.match('/', { ignoreVary: true })) || caches.match('/offline.html', { ignoreVary: true })));
    return;
  }
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(VERSION).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});
