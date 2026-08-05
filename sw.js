// WELO Service Worker — PWA offline + cache
const CACHE_NAME = 'welo-v17';
const ASSETS = [
  '/WELO/index.html',
  '/WELO/landing.html',
  '/WELO/css/app.css',
  '/WELO/css/mascot.css',
  '/WELO/css/onboarding.css',
  '/WELO/js/analytics.js',
  '/WELO/js/consent.js',
  '/WELO/js/install-prompt.js',
  '/WELO/js/push-notifications.js',
  '/WELO/js/share-results.js',
  '/WELO/js/feedback.js',
  '/WELO/js/time-capsule.js',
  '/WELO/js/gratitude.js',
  '/WELO/js/data.js',
  '/WELO/js/app.js',
  '/WELO/js/games.js',
  '/WELO/js/games-extra.js',
  '/WELO/js/plans.js',
  '/WELO/js/blog.js',
  '/WELO/js/mood-sync.js',
  '/WELO/js/couple-sync.js',
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

// Push notification received from server
self.addEventListener('push', e => {
  let data = { title: 'WELO', body: '¡Tu reto diario te espera! 🎯', icon: '/WELO/icons/icon-192.svg' };
  
  try {
    if (e.data) {
      const payload = e.data.json();
      data = { ...data, ...payload };
    }
  } catch (err) {
    // Use defaults if parse fails
  }

  const options = {
    body: data.body,
    icon: data.icon || '/WELO/icons/icon-192.svg',
    badge: '/WELO/icons/icon-192.svg',
    vibrate: [100, 50, 100],
    tag: data.tag || 'welo-notification',
    renotify: true,
    data: {
      url: data.url || '/WELO/index.html'
    }
  };

  e.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// User clicked on notification
self.addEventListener('notificationclick', e => {
  e.notification.close();
  
  const url = e.notification.data && e.notification.data.url 
    ? e.notification.data.url 
    : '/WELO/index.html';

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If app is already open, focus it
      for (let client of clientList) {
        if (client.url.includes('/WELO/') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(url);
    })
  );
});
