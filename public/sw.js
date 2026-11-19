/* CircuitQuest service worker — offline-first for static assets,
 * network-first for pages with a friendly offline fallback.
 * Registered in production only (see ServiceWorkerRegister). */
const VERSION = 'cq-v1';
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;

/* immutable assets: cache-first forever (hashed filenames or versioned by us) */
const PRECACHE = [
  '/manifest.json',
  '/offline.html',
  '/logo.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-192.png',
  '/icons/maskable-512.png',
];

const isStaticAsset = (url) =>
  url.pathname.startsWith('/_next/static/') ||
  url.pathname.startsWith('/images/') ||
  url.pathname.startsWith('/fonts/') ||
  url.pathname.startsWith('/icons/');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // pages (navigations): network first, fall back to cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(PAGE_CACHE).then((c) => c.put(request, copy));
          return resp;
        })
        .catch(() =>
          caches.match(request).then((hit) => hit || caches.match('/offline.html')),
        ),
    );
    return;
  }

  // immutable static assets: cache first
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((resp) => {
            const copy = resp.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
            return resp;
          }),
      ),
    );
  }
});
