// ================================
// Ducksinthepool.com Service Worker
// ================================

const CACHE_NAME = "ducks-cache-v2";
const ASSETS = [
  "/",                // root
  "/index.html",
  "/dashboard.js",
  "/links.json",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Cache core files on install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Clean up old caches on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Serve cached content first, then network fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(
      (response) => response || fetch(event.request)
    )
  );
});
