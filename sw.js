// WELO Service Worker — PWA offline + cache
// Works on both GitHub Pages (/WELO/) and Vercel (/)
const CACHE_NAME = 'welo-v18';

// Detect base path dynamically
const BASE = self.location.pathname.includes('/WELO/') ? '/WELO/' : '/';

const FILES = [
  'index.html',
  'landing.html',
  'css/app.css',
  'css/mascot.css',
  'css/onboarding.css',
  'js/analytics.js',
  'js/consent.js',
  'js/install-prompt.js',
  'js/push-notifications.js',
  'js/share-results.js',
  'js/feedback.js',
  'js/time-capsule.js',
  'js/gratitude.js',
  'js/data.js',
  'js/app.js',
  'js/games.js',
  'js/games-extra.js',
  'js/plans.js',
  'js/blog.js',
  'js/mood-sync.js',
  'js/couple-sync.js',
  'js/onboarding.js',
  'js/mascot.js',
  'js/memories.js',
  'js/preferences.js',
  'js/dailymatch.js',
  'js/articles.js',
  'js/supabase.js',
  'js/lumi-brain.js'
];

const ASSETS = FILES.map(f => BASE + f);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// Push notification received
self.addEventListener('push', e => {
  let data = { title: 'WELO', body: '¡Tu reto diario te espera! 🎯', icon: BASE + 'icons/icon-192.svg' };

  try {
    if (e.data) {
      const payload = e.data.json();
      data = { ...data, ...payload };
    }
  } catch (err) {}

  const options = {
    body: data.body,
    icon: data.icon || BASE + 'icons/icon-192.svg',
    badge: BASE + 'icons/icon-192.svg',
    vibrate: [100, 50, 100],
    tag: data.tag || 'welo-notification',
    renotify: true,
    data: { url: data.url || BASE + 'index.html' }
  };

  e.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click — open app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data && e.notification.data.url ? e.notification.data.url : BASE + 'index.html';

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (let client of clientList) {
        if ('focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
