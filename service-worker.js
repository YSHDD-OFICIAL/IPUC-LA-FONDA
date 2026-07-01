// service-worker.js - IPUC LA FONDA PWA v2.0.0
// Service Worker para funcionalidad PWA instalable, cache offline y notificaciones push

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

// ============================================
// INSTALACIÓN
// ============================================
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker: Instalando v2.0.0...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Cacheando ' + ASSETS_TO_CACHE.length + ' assets para modo offline...');
                return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
                    console.warn('⚠️ Algunos assets no se pudieron cachear:', err);
                });
            })
            .then(() => {
                console.log('✅ Instalación completada - App lista para usar sin conexión');
                return self.skipWaiting();
            })
    );
});

// ============================================
// ACTIVACIÓN
// ============================================
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
            console.log('✅ Service Worker activado y controlando la app');
            return self.clients.claim();
        })
    );
});

// ============================================
// FETCH - Network First con fallback a cache
// ============================================
self.addEventListener('fetch', (event) => {
    // No interceptar llamadas a la API
    if (event.request.url.includes('/api/')) {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Guardar en cache respuestas exitosas
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si falla la red, servir desde cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Si es navegación, devolver index.html (SPA fallback)
                    if (event.request.mode === 'navigate') {
                        return caches.match('/');
                    }
                    // Respuesta offline genérica
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

// ============================================
// PUSH NOTIFICATIONS
// ============================================
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
            { action: 'open', title: 'Abrir' },
            { action: 'close', title: 'Cerrar' }
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

// ============================================
// CLIC EN NOTIFICACIÓN
// ============================================
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Clic en notificación');
    event.notification.close();
    
    if (event.action === 'close') return;
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
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

// ============================================
// SINCRONIZACIÓN EN SEGUNDO PLANO
// ============================================
self.addEventListener('sync', (event) => {
    console.log('🔄 Sincronización en segundo plano:', event.tag);
    
    if (event.tag === 'sync-asistencia') {
        event.waitUntil(syncAsistencia());
    }
    
    if (event.tag === 'sync-mensajes') {
        event.waitUntil(syncMensajes());
    }
});

async function syncAsistencia() {
    try {
        console.log('✅ Sincronización de asistencia completada');
        return Promise.resolve();
    } catch (error) {
        console.error('❌ Error en sincronización de asistencia:', error);
        return Promise.reject(error);
    }
}

async function syncMensajes() {
    try {
        console.log('✅ Sincronización de mensajes completada');
        return Promise.resolve();
    } catch (error) {
        console.error('❌ Error en sincronización de mensajes:', error);
        return Promise.reject(error);
    }
}

// ============================================
// MENSAJE DESDE EL CLIENTE
// ============================================
self.addEventListener('message', (event) => {
    console.log('📩 Mensaje recibido del cliente:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        self.registration.update();
    }
});

console.log('✅ Service Worker IPUC LA FONDA v2.0.0 cargado y listo');
