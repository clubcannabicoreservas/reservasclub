const CACHE_NAME = "club-cache-v3";

const urlsToCache = [
  "./",
  "./index.html",
  "./css/style.css",
  "./css/panel.css",
  "./js/admin.js",
  "./js/login.js",
  "./js/cambiarclave.js",
  "./manifest.json",
  "./img/logoclub.png"
];

// 🔥 INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Cacheando archivos...");
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error("Error cacheando:", err))
  );
});

// 🔥 ACTIVATE
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (!cacheWhitelist.includes(cache)) {
            console.log("Borrando cache viejo:", cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// 🔥 FETCH
self.addEventListener("fetch", (event) => {

  // 🚫 ignorar requests que no sean GET
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {

        // ⚠️ evitar cachear respuestas inválidas
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const clone = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });

        return response;

      })
      .catch(() => {

        // 🔁 fallback a cache
        return caches.match(event.request)
          .then((response) => {

            // ⚠️ fallback opcional si no hay nada
            if (response) return response;

            // 👉 si querés, podés devolver una página offline acá
            if (event.request.destination === "document") {
              return caches.match("./index.html");
            }

          });

      })
  );

});