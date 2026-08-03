// WELO Service Worker — PWA offline + cache
const CACHE_NAME = 'welo-v1';
const ASSETS = [
  '/WELO/index.html',
  '/WELO/landing.html',
  '/WELO/css/app.css',
  '/WELO/css/mascot.css',
  '/WELO/js/data.js',
  '/WELO/js/app.js',
  '/WELO/js/games.js',
  '/WELO/js/plans.js',
  '/WELO/js/blog.js',
  '/WELO/js/onboarding.js',
  '/WELO/js/mascot.js',
  '/WELO/js/memories.js',
  '/WELO/js/preferences.js',
  '/WELO/js/dailymatch.js',
  '/WELO/js/articles.js',
  '/WELO/js/supabase.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
