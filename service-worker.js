const CACHE = 'impianti-v2';
const FILES = [
  '/mappa-illuminazione/Mappa_Impianti.html',
  '/mappa-illuminazione/index.html'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(FILES); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      // Rete prima (tile mappa, Google Sheets), cache come fallback
      return fetch(e.request).then(function(response) {
        if(response && response.status===200 && e.request.url.indexOf('/mappa-illuminazione/')>=0) {
          var clone = response.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return response;
      }).catch(function(){ return cached; });
    })
  );
});
