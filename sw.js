const CACHE_NAME = 'smart-manager-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/output.css',
    '/js/main.js',
    '/assets/images/logo.jpg'
];

// Install Event: Cache Core Assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing Service Worker...', event);
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching core assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    // Force the waiting service worker to become the active service worker.
    self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating Service Worker...', event);
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Ensure that the Service Worker takes control of the page immediately.
    self.clients.claim();
});

// Fetch Event: Serve cached content when offline
self.addEventListener('fetch', (event) => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached response if found, else fetch from network
            return cachedResponse || fetch(event.request).catch(() => {
                // Optional: Can serve an offline.html page here if setup
                console.log('[Service Worker] Fetch failed; returning offline page instead.', event.request.url);
            });
        })
    );
});
