// service-worker.js - Service Worker para PWA
const CACHE_NAME = 'ipuc-la-fonda-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/assets/logo/logo.png',
    '/assets/logo/logo-mini.png',
    '/assets/logo/icon-192.png',
    '/assets/logo/icon-512.png',
    '/assets/avatars/default.png',
    '/assets/avatars/admin.png',
    '/assets/img/templo.jpg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache abierto');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Estrategia de cache: Network First, luego cache
self.addEventListener('fetch', (event) => {
    // No interceptar llamadas a la API
    if (event.request.url.includes('/api/')) {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si la respuesta es válida, actualizar cache
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                }
                return response;
            })
            .catch(() => {
                // Si falla la red, buscar en cache
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Si no está en cache, mostrar página offline
                        if (event.request.mode === 'navigate') {
                            return caches.match('/');
                        }
                        return new Response('Sin conexión', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Nueva notificación de IPUC LA FONDA',
        icon: '/assets/logo/icon-192.png',
        badge: '/assets/logo/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver detalles',
                icon: '/assets/logo/icon-192.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/assets/logo/icon-192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('IPUC LA FONDA', options)
    );
});

// Manejar clic en notificaciones
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});