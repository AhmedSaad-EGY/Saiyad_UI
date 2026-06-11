const CACHE = "sayiad-__SW_VERSION__";

self.addEventListener("install", () => {
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
            if (response.ok) cache.put(request, response.clone()).catch(() => { /* cache full or storage quota */ });
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
          caches.open(CACHE).then((cache) => cache.put(key, response.clone())).catch(() => { /* cache full or storage quota */ });
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
                `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Sayiad — Offline</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
         background:#0b1120;color:#e2e8f0;display:flex;align-items:center;
         justify-content:center;min-height:100vh;text-align:center;padding:1.5rem}
    .card{background:#1a2744;border-radius:1.25rem;padding:2.5rem 2rem;max-width:400px;width:100%}
    .icon{font-size:3.5rem;margin-bottom:1rem;opacity:.6}
    h1{font-size:1.5rem;font-weight:700;margin-bottom:.75rem}
    p{font-size:.9rem;opacity:.65;line-height:1.6;margin-bottom:1.5rem}
    a{display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;
      padding:.625rem 1.5rem;border-radius:.75rem;font-weight:600;font-size:.875rem}
    a:hover{background:#0284c7}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🎣</div>
    <div dir="auto" style="text-align: center; font-family: sans-serif;">
      <h1 lang="ar">لا يوجد اتصال بالإنترنت</h1>
      <h1 lang="en">No Internet Connection</h1>
      <p lang="ar">يرجى التحقق من الشبكة وإعادة المحاولة لاحقاً.</p>
      <p lang="en">Please check your network and try again later.</p>
    </div>
    <a href="/" onclick="location.reload();return false;">Retry</a>
  </div>
</body>
</html>`,
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
