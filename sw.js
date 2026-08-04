// WELO Service Worker — PWA offline + cache
const CACHE_NAME = 'welo-v7';
const ASSETS = [
  '/WELO/index.html',
  '/WELO/landing.html',
  '/WELO/css/app.css',
  '/WELO/css/mascot.css',
  '/WELO/css/onboarding.css',
  '/WELO/js/analytics.js',
  '/WELO/js/data.js',
  '/WELO/js/app.js',
  '/WELO/js/games.js',
  '/WELO/js/games-extra.js',
  '/WELO/js/plans.js',
  '/WELO/js/blog.js',
  '/WELO/js/onboarding.js',
  '/WELO/js/mascot.js',
  '/WELO/js/memories.js',
  '/WELO/js/preferences.js',
  '/WELO/js/dailymatch.js',
  '/WELO/js/articles.js',
  '/WELO/js/supabase.js',
  '/WELO/js/lumi-brain.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting(); // Activate new SW immediately
});

// Clean old caches on activation
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // Take control of all open tabs
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
