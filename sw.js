// Service Worker untuk Kasir Warung Pro
// CARA PAKAI: upload file ini ke folder/server yang SAMA dengan file HTML
// aplikasi (mis. taruh sw.js di sebelah warungpro_v6.html di GitHub Pages,
// Netlify, atau hosting lain). App akan otomatis mendeteksi dan
// menggunakannya untuk mode offline — tidak perlu edit kode apa pun.
//
// CATATAN: Service Worker tidak akan berfungsi jika file dibuka langsung
// dari file:// (double klik di HP/laptop tanpa web server). Ini batasan
// keamanan browser, bukan kekurangan kode ini.

const CACHE_NAME = 'kasirpro-v10';
const PRECACHE_URLS = [
  self.registration.scope // cache halaman utama (index/HTML aplikasi)
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Strategi: network-first dengan fallback ke cache.
// Ini cocok untuk app kasir — selalu coba ambil versi terbaru dulu,
// tapi kalau offline/internet putus, masih bisa pakai versi tersimpan.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
