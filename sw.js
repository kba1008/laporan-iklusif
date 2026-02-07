const CACHE_NAME = 'laporan-pro-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap'
];

// 1. Install Service Worker & Cache Aset Utama
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 2. Strategy: Network First untuk API, Cache First untuk UI
self.addEventListener('fetch', event => {
  // Jangan cache request ke Groq API
  if (event.request.url.includes('api.groq.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Untuk fail lain, cuba cache dulu, kalau tiada baru fetch network
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});