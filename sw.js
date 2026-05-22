// ─────────────────────────────────────────────────────────────
// SAYIAD SERVICE WORKER
// Strategy:
//   HTML + JS + CSS  → Network-first  (always latest on deploy)
//   Images + Fonts   → Cache-first    (stable assets)
//   API calls        → Bypass SW entirely
// To deploy: increment CACHE_VERSION by 1.
// ─────────────────────────────────────────────────────────────

const CACHE_VERSION = "sayiad-v10";

const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/config.js",
  "/js/api.js",
  "/js/auth.js",
  "/js/router.js",
  "/js/utils.js",
  "/js/translations.js",
  "/js/app.js",
  "/js/background.js",
  "/js/signalr.js",
  "/pages/home.js",
  "/pages/login.js",
  "/pages/register.js",
  "/pages/forgot-password.js",
  "/pages/reset-password.js",
  "/pages/products.js",
  "/pages/product-detail.js",
  "/pages/auctions.js",
  "/pages/auction-detail.js",
  "/pages/cart.js",
  "/pages/checkout.js",
  "/pages/dashboard.js",
  "/pages/verify-email.js",
  "/pages/shipping.js",
  "/pages/seller-profile.js",
  "/pages/order-detail.js",
  "/pages/admin.js",
  "/pages/terms.js",
  "/pages/privacy.js",
  "/pages/subscriptions.js",
  "/pages/auction-requests.js",
  "/pages/auction-requests-review.js",
  "/pages/auctioneer-analytics.js",
  "/pages/profile.js",
  "/pages/wallet.js",
];

// ── INSTALL: pre-cache all app shell assets ──────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: delete all old caches ─────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── FETCH: tiered caching strategy ───────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1. API calls: bypass SW entirely — never cache API responses
  if (
    url.origin !== location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/hubs/")
  ) {
    return; // Let the browser handle it directly
  }

  // 2. Images and fonts: Cache-first (stable, rarely change)
  const isStaticAsset =
    url.pathname.startsWith("/img/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/assets/") ||
    /\.(png|jpg|jpeg|webp|gif|svg|ico|woff|woff2|ttf|otf)$/i.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // 3. HTML, JS, CSS: Network-first
  //    Always try the network. Fall back to cache ONLY when offline.
  //    This is what guarantees users see new deployments without hard refresh.
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Clone immediately while body is still fresh, before returning it.
        const responseToCache = networkResponse.ok
          ? networkResponse.clone()
          : null;
        if (responseToCache) {
          const cacheKey = url.pathname === "/" ? "/index.html" : url.pathname;
          caches.open(CACHE_VERSION).then((cache) => cache.put(cacheKey, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed (user is offline): serve from cache
        const cacheKey = url.pathname === "/" ? "/index.html" : url.pathname;
        return caches
          .open(CACHE_VERSION)
          .then((cache) => cache.match(cacheKey))
          .then(
            (cached) =>
              cached ||
              new Response(
                "<h1 style='font-family:sans-serif;text-align:center;padding:40px'>You are offline</h1>",
                {
                  headers: { "Content-Type": "text/html" },
                  status: 503,
                }
              )
          );
      })
  );
});

// ── MESSAGE: allow pages to trigger SW update check ──────────
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
