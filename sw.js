const CACHE = "sayiad-v4";
const PRECACHE = [
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
  "/pages/home.js",
  "/pages/login.js",
  "/pages/register.js",
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
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((k) => {
            if (k !== CACHE) return caches.delete(k);
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  e.respondWith(
    caches
      .open(CACHE)
      .then((c) =>
        c
          .match(request)
          .then(
            (r) =>
              r ||
              fetch(request).catch(() => new Response("", { status: 503 })),
          ),
      ),
  );
});
