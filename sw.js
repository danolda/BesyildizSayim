// Service Worker
// Şimdilik sadece uygulamanın yüklenebilir (installable) olmasını sağlamak için temel bir yapı kuruyoruz.
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
});

self.addEventListener('fetch', (event) => {
  // Şimdilik ağ isteklerine müdahale etmiyoruz, sadece geçmelerine izin veriyoruz.
  event.respondWith(fetch(event.request));
});
