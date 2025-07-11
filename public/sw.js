const CACHE_NAME = 'roofgenius-field-v1';
const OFFLINE_URL = '/offline.html';

const CRITICAL_CACHE = [
  '/',
  '/offline.html',
  '/dashboard',
  '/field/report',
  '/field-apps',
  '/tools',
  '/estimate/new',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CRITICAL_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME).map(cacheName => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(response => {
            if (response) return response;
            if (event.request.url.includes('/api/critical/')) {
              queueFailedRequest(event.request);
            }
            return new Response(
              JSON.stringify({ error: 'Offline', message: 'Data will sync when connection restored' }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() => {
          if (event.request.destination === 'document') {
            return caches.match(OFFLINE_URL);
          }
        })
      );
    })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-failed-requests') {
    event.waitUntil(syncFailedRequests());
  }
});

self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'Important update from MyRoofGenius',
    icon: 'https://via.placeholder.com/192',
    badge: 'https://via.placeholder.com/72',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/', priority: data.priority || 'normal' },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  event.waitUntil(self.registration.showNotification(data.title || 'MyRoofGenius Alert', options));
});

async function queueFailedRequest(request) {
  const queue = await getFailedRequestQueue();
  queue.push({
    url: request.url,
    method: request.method,
    headers: [...request.headers],
    body: await request.text(),
    timestamp: Date.now()
  });
  await saveFailedRequestQueue(queue);
}

async function syncFailedRequests() {
  const queue = await getFailedRequestQueue();
  const failed = [];
  for (const req of queue) {
    try {
      await fetch(req.url, { method: req.method, headers: req.headers, body: req.body });
    } catch (error) {
      failed.push(req);
    }
  }
  await saveFailedRequestQueue(failed);
}
