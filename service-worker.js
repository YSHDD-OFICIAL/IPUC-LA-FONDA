// service-worker.js - IPUC LA FONDA PWA v2.0
const CACHE_NAME = 'ipuc-la-fonda-v2.0.0';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/ipuclafonda.png',
    '/assets/avatars/default.png',
    '/assets/avatars/admin.png',
    '/assets/icons/favicon-16x16.png',
    '/assets/icons/favicon-32x32.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/apple-touch-icon.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Cacheando assets...');
                return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
                    console.warn('Algunos assets no se pudieron cachear:', err);
                });
            })
            .then(() => {
                console.log('✅ Service Worker: Instalación completada');
                return self.skipWaiting();
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker: Activando...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker: Activado');
            return self.clients.claim();
        })
    );
});

// Estrategia de cache: Network First con fallback a cache
self.addEventListener('fetch', (event) => {
    // No interceptar llamadas a la API
    if (event.request.url.includes('/api/')) {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si la respuesta es válida, actualizar cache
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si falla la red, buscar en cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Si no está en cache y es navegación, mostrar página principal
                    if (event.request.mode === 'navigate') {
                        return caches.match('/');
                    }
                    // Respuesta offline
                    return new Response(
                        JSON.stringify({ 
                            error: 'Sin conexión', 
                            mensaje: 'No hay conexión a internet. Algunas funciones no están disponibles.' 
                        }),
                        {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );
                });
            })
    );
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
    console.log('📨 Notificación push recibida');
    
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { titulo: 'IPUC LA FONDA', mensaje: event.data.text() };
        }
    }
    
    const options = {
        body: data.mensaje || 'Nueva notificación de IPUC LA FONDA',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
            dateOfArrival: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: 'Ver'
            },
            {
                action: 'close',
                title: 'Cerrar'
            }
        ],
        tag: 'ipuc-notification',
        renotify: true
    };
    
    event.waitUntil(
        self.registration.showNotification(
            data.titulo || 'IPUC LA FONDA',
            options
        )
    );
});

// Manejar clic en notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Clic en notificación');
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((windowClients) => {
            // Buscar si ya hay una ventana abierta
            for (const client of windowClients) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Si no, abrir nueva ventana
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Manejar sincronización en segundo plano
self.addEventListener('sync', (event) => {
    console.log('🔄 Sincronización en segundo plano:', event.tag);
    
    if (event.tag === 'sync-asistencia') {
        event.waitUntil(syncAsistencia());
    }
});

// Función para sincronizar asistencia pendiente
async function syncAsistencia() {
    try {
        // Obtener datos pendientes de IndexedDB (si se implementa)
        console.log('✅ Sincronización de asistencia completada');
        return Promise.resolve();
    } catch (error) {
        console.error('❌ Error en sincronización:', error);
        return Promise.reject(error);
    }
}

// Mensaje cuando el Service Worker toma control
self.addEventListener('controllerchange', () => {
    console.log('🔄 Service Worker: Nuevo controlador activo');
});

console.log('✅ Service Worker IPUC LA FONDA v2.0.0 cargado');
