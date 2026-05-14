const CACHE = 'sayiad-v3';
const PRECACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/config.js',
  '/js/api.js',
  '/js/auth.js',
  '/js/router.js',
  '/js/utils.js',
  '/js/translations.js',
  '/js/app.js',
  '/js/background.js',
  '/pages/home.js',
  '/pages/login.js',
  '/pages/register.js',
  '/pages/products.js',
  '/pages/product-detail.js',
  '/pages/auctions.js',
  '/pages/auction-detail.js',
  '/pages/cart.js',
  '/pages/checkout.js',
  '/pages/dashboard.js',
  '/pages/verify-email.js',
  '/pages/shipping.js',
  '/pages/seller-profile.js',
  '/pages/order-detail.js',
  '/pages/admin.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => { if (k !== CACHE) return caches.delete(k); }))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Same-origin static assets
  if (url.origin === location.origin) {
    const path = url.pathname;
    // API calls: let them pass through normally
    if (path.startsWith('/api/')) return;
    // Static assets: cache-first
    e.respondWith(
      caches.open(CACHE).then((c) => c.match(request).then((r) => r || fetch(request)))
    );
    return;
  }

  // CDN: cache-first with network update
  if (url.origin === 'https://cdnjs.cloudflare.com' || url.origin === 'https://ka-f.fontawesome.com') {
    e.respondWith(
      caches.open(CACHE).then((c) => c.match(request).then((r) => r || fetch(request).then((res) => { c.put(request, res.clone()); return res; })))
    );
    return;
  }
});
