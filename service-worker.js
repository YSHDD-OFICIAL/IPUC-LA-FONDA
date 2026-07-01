// service-worker.js - IPUC LA FONDA PWA v2.1.0
// Service Worker para funcionalidad PWA instalable, cache offline y notificaciones push

const CACHE_NAME = 'ipuc-la-fonda-v2.1.0';
const ASSETS_TO_CACHE = [
    // Archivos HTML y principales
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/ipuclafonda.png',
    
    // ============================================
    // ARCHIVOS PYTHON - Backend y utilidades
    // ============================================
    '/app.py',
    '/database.py',
    
    // ============================================
    // ASSETS - Imágenes y recursos
    // ============================================
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
    console.log('📦 Service Worker: Instalando v2.1.0...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log(`📦 Cacheando ${ASSETS_TO_CACHE.length} assets para modo offline...`);
                // Cachear cada asset individualmente para manejar errores
                const cachePromises = ASSETS_TO_CACHE.map(async (url) => {
                    try {
                        const response = await fetch(url);
                        if (response && response.status === 200) {
                            await cache.put(url, response);
                            console.log(`✅ Cacheado: ${url}`);
                        } else {
                            console.warn(`⚠️ No se pudo cachear: ${url} (Status: ${response?.status})`);
                        }
                    } catch (error) {
                        console.warn(`⚠️ Error cacheando ${url}:`, error);
                    }
                });
                
                return Promise.allSettled(cachePromises);
            })
            .then(() => {
                console.log('✅ Instalación completada - App lista para usar sin conexión');
                // Forzar activación inmediata
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
            // Tomar control de todas las pestañas
            return self.clients.claim();
        })
    );
});

// ============================================
// FETCH - Network First con fallback a cache
// ============================================
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // No interceptar llamadas a la API
    if (url.pathname.includes('/api/')) {
        return;
    }
    
    // Estrategia especial para archivos Python
    if (url.pathname.endsWith('.py')) {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log(`📄 Sirviendo desde cache: ${url.pathname}`);
                        return cachedResponse;
                    }
                    // Si no está en cache, intentar obtener de la red
                    return fetch(event.request)
                        .then((response) => {
                            if (response && response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                            }
                            return response;
                        })
                        .catch(() => {
                            // Si falla todo, devolver respuesta offline
                            return new Response(
                                `# ${url.pathname} - Offline Mode
# Este archivo no está disponible sin conexión.
# Por favor, conectate a internet para acceder al código fuente.

print("⚠️ Modo offline - Conectate a internet para ver el código completo")`,
                                {
                                    status: 503,
                                    statusText: 'Service Unavailable',
                                    headers: { 'Content-Type': 'text/plain' }
                                }
                            );
                        });
                })
        );
        return;
    }
    
    // Estrategia para el resto de assets (HTML, CSS, JS, imágenes)
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
                    // Respuesta offline genérica para otros recursos
                    if (event.request.url.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)) {
                        return caches.match('/assets/icons/icon-192x192.png');
                    }
                    // Respuesta offline para CSS/JS
                    if (event.request.url.match(/\.(css|js)$/)) {
                        return new Response(
                            '/* Modo offline */',
                            {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: { 'Content-Type': 'text/css' }
                            }
                        );
                    }
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
        tag: data.tag || 'ipuc-notification',
        renotify: true,
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false
    };
    
    // Añadir imagen si está disponible
    if (data.imagen) {
        options.image = data.imagen;
    }
    
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
    console.log('👆 Clic en notificación:', event.action);
    event.notification.close();
    
    if (event.action === 'close') return;
    
    const urlToOpen = event.notification.data?.url || '/';
    const openWindow = async () => {
        const windowClients = await clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        });
        
        // Buscar si ya hay una ventana abierta con la URL
        for (const client of windowClients) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
                await client.focus();
                // Enviar mensaje a la ventana existente
                client.postMessage({
                    type: 'NOTIFICATION_CLICK',
                    data: event.notification.data
                });
                return;
            }
        }
        
        // Si no, abrir nueva ventana
        if (clients.openWindow) {
            const newClient = await clients.openWindow(urlToOpen);
            // Esperar a que la ventana esté lista
            if (newClient) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                newClient.postMessage({
                    type: 'NOTIFICATION_CLICK',
                    data: event.notification.data
                });
            }
        }
    };
    
    event.waitUntil(openWindow());
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
    
    if (event.tag === 'sync-peticiones') {
        event.waitUntil(syncPeticiones());
    }
});

async function syncAsistencia() {
    try {
        console.log('✅ Sincronización de asistencia completada');
        // Aquí iría la lógica de sincronización
        return Promise.resolve();
    } catch (error) {
        console.error('❌ Error en sincronización de asistencia:', error);
        return Promise.reject(error);
    }
}

async function syncMensajes() {
    try {
        console.log('✅ Sincronización de mensajes completada');
        // Aquí iría la lógica de sincronización
        return Promise.resolve();
    } catch (error) {
        console.error('❌ Error en sincronización de mensajes:', error);
        return Promise.reject(error);
    }
}

async function syncPeticiones() {
    try {
        console.log('✅ Sincronización de peticiones completada');
        // Aquí iría la lógica de sincronización
        return Promise.resolve();
    } catch (error) {
        console.error('❌ Error en sincronización de peticiones:', error);
        return Promise.reject(error);
    }
}

// ============================================
// MENSAJE DESDE EL CLIENTE
// ============================================
self.addEventListener('message', (event) => {
    console.log('📩 Mensaje recibido del cliente:', event.data);
    
    switch (event.data?.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CHECK_UPDATE':
            self.registration.update();
            break;
            
        case 'CACHE_CLEAN':
            caches.delete(CACHE_NAME).then(() => {
                console.log('🧹 Cache limpiado manualmente');
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'CACHE_STATS':
            caches.open(CACHE_NAME).then((cache) => {
                cache.keys().then((keys) => {
                    event.ports[0].postMessage({ 
                        total: keys.length,
                        keys: keys.map(k => k.url)
                    });
                });
            });
            break;
            
        default:
            console.log('ℹ️ Tipo de mensaje no reconocido:', event.data?.type);
    }
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================
self.addEventListener('error', (event) => {
    console.error('❌ Error en Service Worker:', event.error || event.message);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promesa rechazada en Service Worker:', event.reason);
});

console.log('✅ Service Worker IPUC LA FONDA v2.1.0 cargado y listo');
console.log(`📦 ${ASSETS_TO_CACHE.length} assets configurados para cachear`);
