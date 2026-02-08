// Nama cache dinamik menggunakan timestamp untuk memaksa update fail baru
const CACHE_NAME = 'inklusif-pro-cache-v' + Date.now();
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
];

// 1. Proses Install - Simpan aset ke dalam memori (Cache)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Memaksa Service Worker baru aktif serta-merta
});

// 2. Proses Activate - Buang cache versi lama untuk jimat ruang telefon
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Memadam cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Ambil alih kawalan halaman serta-merta
});

// 3. Proses Fetch - Strategi Stale-While-Revalidate (Laju & Auto Update)
self.addEventListener('fetch', (event) => {
  // Hanya simpan request jenis GET. Request POST (Simpan Cloud/History) tidak di-cache.
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Jika dapat data baru dari internet, simpan dalam cache
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Jika offline sepenuhnya, gunakan apa yang ada dalam cache
        return cachedResponse;
      });

      // Pulangkan respon dari cache dahulu (sepantas kilat), update berlaku di belakang tabir
      return cachedResponse || fetchPromise;
    })
  );
});