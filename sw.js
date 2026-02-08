const CACHE_NAME = 'inklusif-pro-v' + Date.now(); // Versi dinamik untuk force update
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// 1. Install - Simpan fail asas ke dalam cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Memaksa SW baru aktif serta-merta
});

// 2. Activate - Buang cache lama untuk jimat ruang
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Membuang cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Ambil alih kawalan halaman serta-merta
});

// 3. Fetch - Strategi Stale-While-Revalidate (Auto Update Latar Belakang)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Simpan versi terbaru ke dalam cache untuk kegunaan akan datang
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // Jika offline dan tiada dalam cache, paparkan ralat (opsional)
      });

      // Pulangkan respon dari cache dahulu (laju), update berlaku di belakang tabir
      return cachedResponse || fetchPromise;
    })
  );
});