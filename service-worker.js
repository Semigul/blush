const CACHE = 'blush-bluff-v3';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './icon.svg', './assets/roles/brow-stylist.png', './assets/roles/drama-queen.png', './assets/roles/gloss-mute.png', './assets/roles/lookalike-artist.png', './assets/roles/precision-liner.png', './assets/roles/shade-reader.png', './assets/roles/smudge-wolf.png', './assets/roles/topcoat-guardian.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
