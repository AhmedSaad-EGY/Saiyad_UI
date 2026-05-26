const CACHE = "sayiad-__SW_VERSION__";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (
    url.origin !== location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/hubs/")
  ) {
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone()).catch(() => {});
            return response;
          });
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const key = url.pathname === "/" ? "/index.html" : url.pathname;
          caches.open(CACHE).then((cache) => cache.put(key, response.clone())).catch(() => {});
        }
        return response;
      })
      .catch(() => {
        const key = url.pathname === "/" ? "/index.html" : url.pathname;
        return caches.open(CACHE).then((cache) =>
          cache.match(key).then(
            (cached) =>
              cached ||
              new Response(
                "<h1 style='font-family:sans-serif;text-align:center;padding:40px'>You are offline</h1>",
                { headers: { "Content-Type": "text/html" }, status: 503 }
              )
          )
        );
      })
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
