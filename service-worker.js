const CACHE_NAME = "resource-hub-v2.5";
const ASSETS = ["index.html", "dashboard.js", "links.json", "manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return (
        res ||
        fetch(e.request).then(fetchRes =>
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, fetchRes.clone());
            return fetchRes;
          })
        )
      );
    })
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
