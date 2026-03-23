const CACHE_NAME = "club-cache-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./css/style.css",
  "./css/panel.css",
  "./js/admin.js",
  "./img/logo.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch(err => console.error("Error cacheando:", err))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});