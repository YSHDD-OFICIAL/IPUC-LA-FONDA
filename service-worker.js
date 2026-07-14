// ============================================
// IPUC LA FONDA - SERVICE WORKER PWA v5.1
// Instalable como App Nativa | Offline | Push
// MEJORADO - OPTIMIZADO - 100% OPERATIVO
// "Donde el Espíritu Santo se mueve"
// ============================================

const CACHE_NAME = 'ipuc-la-fonda-v5.1';
const RUNTIME_CACHE = 'ipuc-runtime-v5.1';
const IMAGE_CACHE = 'ipuc-images-v5.1';
const API_CACHE = 'ipuc-api-v5.1';
const OFFLINE_CACHE = 'ipuc-offline-v5.1';

const VERSION = '5.1';
const MAX_AGE = 30 * 24 * 60 * 60; // 30 días en segundos

// ============================================
// ASSETS A PRECACHEAR
// ============================================
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/database.js',
    '/app.js',
    '/script.js',
    '/manifest.json',
    '/service-worker.js',
    '/ipuclafonda.png',
    '/assets/avatars/default.png',
    '/assets/avatars/admin.png',
    '/assets/icons/favicon-16x16.png',
    '/assets/icons/favicon-32x32.png',
    '/assets/icons/icon-144x144.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/apple-touch-icon.png',
    '/assets/icons/safari-pinned-tab.svg'
];

// ============================================
// UTILIDADES
// ============================================
function shouldCache(url) {
    if (url.includes('nocache=true') || url.includes('_=')) return false;
    if (url.includes('/admin/') && !url.includes('/admin/login')) return false;
    return true;
}

function isImageRequest(url) {
    return url.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|bmp|tiff)$/i) || 
           (url.includes('/assets/') && !url.includes('.js'));
}

function isApiRequest(url) {
    return url.includes('/api/') || url.includes('?api');
}

function isHtmlRequest(url) {
    return url.endsWith('.html') || url.endsWith('/') || 
           url.includes('/page/') || url.includes('/view/');
}

// ============================================
// INSTALACIÓN
// ============================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                const results = [];
                for (const url of PRECACHE_ASSETS) {
                    try {
                        const response = await fetch(url, { 
                            mode: 'no-cors', 
                            cache: 'no-cache',
                            headers: { 'Cache-Control': 'no-cache' }
                        });
                        if (response && (response.status === 200 || response.type === 'opaque')) {
                            await cache.put(url, response);
                            results.push({ url, success: true });
                        } else {
                            results.push({ url, success: false });
                        }
                    } catch {
                        results.push({ url, success: false });
                    }
                }
                return self.skipWaiting();
            })
    );
});

// ============================================
// ACTIVACIÓN
// ============================================
self.addEventListener('activate', (event) => {
    const CURRENT_CACHES = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, API_CACHE, OFFLINE_CACHE];

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (!CURRENT_CACHES.includes(cacheName)) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(async () => {
                const clients = await self.clients.matchAll({ 
                    type: 'window',
                    includeUncontrolled: true 
                });
                for (const client of clients) {
                    try {
                        client.postMessage({
                            type: 'SW_ACTIVATED',
                            version: VERSION,
                            timestamp: Date.now()
                        });
                    } catch {}
                }
                return self.clients.claim();
            })
    );
});

// ============================================
// FETCH - ESTRATEGIAS DE CACHE
// ============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    const { pathname, origin } = url;

    // No interceptar solicitudes a otros orígenes
    if (origin !== self.location.origin && !url.href.includes('unpkg.com')) {
        return;
    }

    // No interceptar solicitudes de sistema
    if (pathname.includes('/admin/') && !pathname.includes('/admin/login')) {
        return;
    }

    // ============================================
    // IMÁGENES: Stale-While-Revalidate
    // ============================================
    if (isImageRequest(pathname)) {
        event.respondWith(
            caches.match(request).then(async (cached) => {
                if (cached) {
                    const cacheTime = cached.headers.get('x-cache-time');
                    if (cacheTime && (Date.now() - parseInt(cacheTime)) < (MAX_AGE * 1000)) {
                        return cached;
                    }
                }
                try {
                    const networkResponse = await fetch(request);
                    if (networkResponse && networkResponse.ok) {
                        const cache = await caches.open(IMAGE_CACHE);
                        const headers = new Headers(networkResponse.headers);
                        headers.set('x-cache-time', Date.now().toString());
                        const responseToCache = new Response(networkResponse.body, {
                            status: networkResponse.status,
                            statusText: networkResponse.statusText,
                            headers: headers
                        });
                        cache.put(request, responseToCache.clone());
                        return responseToCache;
                    }
                } catch {}
                return cached || caches.match('/assets/icons/icon-192x192.png');
            })
        );
        return;
    }

    // ============================================
    // APIs: Network First + Cache
    // ============================================
    if (isApiRequest(pathname)) {
        event.respondWith(
            fetch(request)
                .then(async (response) => {
                    if (response && response.ok) {
                        const cache = await caches.open(API_CACHE);
                        cache.put(request, response.clone());
                        return response;
                    }
                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(request);
                    if (cached) return cached;
                    return new Response(
                        JSON.stringify({
                            error: true,
                            mensaje: 'Sin conexión a internet',
                            offline: true,
                            timestamp: Date.now()
                        }),
                        {
                            status: 503,
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Offline': 'true'
                            }
                        }
                    );
                })
        );
        return;
    }

    // ============================================
    // HTML: Network First + Cache Fallback
    // ============================================
    if (request.mode === 'navigate' || isHtmlRequest(pathname)) {
        event.respondWith(
            fetch(request)
                .then(async (response) => {
                    if (response && response.ok) {
                        const cache = await caches.open(RUNTIME_CACHE);
                        cache.put(request, response.clone());
                        return response;
                    }
                    throw new Error('Respuesta no válida');
                })
                .catch(async () => {
                    const cached = await caches.match(request);
                    if (cached) return cached;
                    const index = await caches.match('/');
                    if (index) return index;
                    
                    return new Response(
                        `<!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>IPUC LA FONDA - Offline</title>
                            <style>
                                body { 
                                    font-family: Arial, sans-serif;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    height: 100vh;
                                    margin: 0;
                                    background: #1a237e;
                                    color: white;
                                    text-align: center;
                                }
                                .offline-content { max-width: 400px; padding: 20px; }
                                .offline-icon { font-size: 4rem; margin-bottom: 20px; }
                                .retry-btn {
                                    background: #ffd700;
                                    color: #1a237e;
                                    border: none;
                                    padding: 12px 30px;
                                    border-radius: 25px;
                                    font-size: 1.1rem;
                                    cursor: pointer;
                                    margin-top: 20px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="offline-content">
                                <div class="offline-icon">📶</div>
                                <h1>Sin conexión</h1>
                                <p>IPUC LA FONDA está en modo offline.<br>Revisa tu conexión a internet.</p>
                                <button class="retry-btn" onclick="location.reload()">🔄 Reintentar</button>
                            </div>
                        </body>
                        </html>`,
                        {
                            status: 503,
                            headers: {
                                'Content-Type': 'text/html',
                                'X-Offline': 'true'
                            }
                        }
                    );
                })
        );
        return;
    }

    // ============================================
    // JS/CSS: Cache First + Update
    // ============================================
    if (request.destination === 'script' || request.destination === 'style') {
        event.respondWith(
            caches.match(request).then(async (cached) => {
                const fetchPromise = fetch(request).then(async (response) => {
                    if (response && response.ok) {
                        const cache = await caches.open(RUNTIME_CACHE);
                        cache.put(request, response.clone());
                    }
                    return response;
                }).catch(() => cached);
                return cached || fetchPromise;
            })
        );
        return;
    }

    // ============================================
    // RESTO: Network First
    // ============================================
    event.respondWith(
        fetch(request)
            .then(async (response) => {
                if (response && response.ok && shouldCache(pathname)) {
                    const cache = await caches.open(RUNTIME_CACHE);
                    cache.put(request, response.clone());
                }
                return response;
            })
            .catch(async () => {
                const cached = await caches.match(request);
                if (cached) return cached;
                return new Response(
                    JSON.stringify({
                        error: true,
                        mensaje: 'Sin conexión a internet',
                        offline: true,
                        timestamp: Date.now()
                    }),
                    {
                        status: 503,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Offline': 'true'
                        }
                    }
                );
            })
    );
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
    let data = {
        titulo: 'IPUC LA FONDA',
        mensaje: 'Tienes una nueva notificación',
        url: '/',
        icono: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-192x192.png',
        importante: false,
        tipo: 'general',
        id: Date.now()
    };
    
    if (event.data) {
        try {
            const pushData = event.data.json();
            data = { ...data, ...pushData };
        } catch {
            data.mensaje = event.data.text() || data.mensaje;
        }
    }
    
    const options = {
        body: data.mensaje,
        icon: data.icono || '/assets/icons/icon-192x192.png',
        badge: data.badge || '/assets/icons/icon-192x192.png',
        image: data.imagen || undefined,
        data: {
            url: data.url || '/',
            timestamp: Date.now(),
            notificationId: data.id,
            tipo: data.tipo
        },
        vibrate: data.importante ? [200, 100, 200] : [100, 50, 100],
        silent: data.silent || false,
        actions: [
            { action: 'open', title: '👁️ Ver', icon: '/assets/icons/icon-192x192.png' },
            { action: 'close', title: '❌ Cerrar', icon: '/assets/icons/icon-192x192.png' }
        ],
        tag: `ipuc-notif-${data.id}`,
        renotify: true,
        requireInteraction: data.importante || false,
        timestamp: data.timestamp || Date.now(),
        priority: data.importante ? 'high' : 'normal'
    };
    
    event.waitUntil(
        self.registration.showNotification(data.titulo, options)
    );
});

// ============================================
// CLIC EN NOTIFICACIÓN
// ============================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'close') return;
    
    const urlToOpen = event.notification.data?.url || '/';
    const notificationId = event.notification.data?.notificationId;
    const tipo = event.notification.data?.tipo || 'general';
    
    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        })
        .then(async (windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    await client.focus();
                    client.postMessage({
                        type: 'NOTIFICATION_CLICKED',
                        data: { notificationId, tipo, url: urlToOpen, timestamp: Date.now() }
                    });
                    return;
                }
            }
            if (clients.openWindow) {
                const newClient = await clients.openWindow(urlToOpen);
                if (newClient) {
                    setTimeout(() => {
                        newClient.postMessage({
                            type: 'NOTIFICATION_CLICKED',
                            data: { notificationId, tipo, url: urlToOpen, timestamp: Date.now() }
                        });
                    }, 500);
                }
            }
        })
    );
});

// ============================================
// SINCRONIZACIÓN EN SEGUNDO PLANO
// ============================================
self.addEventListener('sync', (event) => {
    const syncHandlers = {
        'sync-asistencia': async () => {},
        'sync-mensajes': async () => {},
        'sync-peticiones': async () => {},
        'sync-datos': async () => {},
        'sync-noticias': async () => {},
        'sync-publicaciones': async () => {}
    };
    
    if (syncHandlers[event.tag]) {
        event.waitUntil(Promise.resolve(syncHandlers[event.tag]()));
    }
});

// ============================================
// MENSAJES DESDE EL CLIENTE
// ============================================
self.addEventListener('message', (event) => {
    if (!event.data || !event.data.type) return;
    
    switch (event.data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting().then(() => {
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'SW_UPDATED',
                            version: VERSION,
                            timestamp: Date.now()
                        });
                    });
                });
            });
            break;
            
        case 'CHECK_FOR_UPDATE':
            self.registration.update().catch(() => {});
            break;
            
        case 'GET_VERSION':
            if (event.ports && event.ports[0]) {
                event.ports[0].postMessage({
                    version: VERSION,
                    cache: CACHE_NAME,
                    timestamp: Date.now(),
                    assets: PRECACHE_ASSETS.length
                });
            }
            break;
            
        case 'CLEAR_CACHE':
            caches.keys().then((names) => {
                return Promise.all(names.map((name) => caches.delete(name)));
            }).then(() => {
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ success: true, message: 'Cache limpiado' });
                }
            }).catch((error) => {
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ success: false, error: error.message });
                }
            });
            break;
            
        case 'GET_CACHE_STATS':
            Promise.all([
                caches.open(CACHE_NAME).then((cache) => cache.keys()),
                caches.open(RUNTIME_CACHE).then((cache) => cache.keys()),
                caches.open(IMAGE_CACHE).then((cache) => cache.keys()),
                caches.open(API_CACHE).then((cache) => cache.keys())
            ]).then(([precache, runtime, images, api]) => {
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({
                        cacheName: CACHE_NAME,
                        version: VERSION,
                        precache: { total: precache.length },
                        runtime: { total: runtime.length },
                        images: { total: images.length },
                        api: { total: api.length },
                        total: precache.length + runtime.length + images.length + api.length,
                        timestamp: Date.now()
                    });
                }
            }).catch(() => {});
            break;
    }
});

// ============================================
// DETECCIÓN DE CONECTIVIDAD
// ============================================
self.addEventListener('online', () => {
    self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
            try {
                client.postMessage({
                    type: 'CONNECTIVITY_CHANGE',
                    online: true,
                    timestamp: Date.now()
                });
            } catch {}
        });
    });
});

self.addEventListener('offline', () => {
    self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
            try {
                client.postMessage({
                    type: 'CONNECTIVITY_CHANGE',
                    online: false,
                    timestamp: Date.now()
                });
            } catch {}
        });
    });
});

// ============================================
// MANEJO DE ERRORES
// ============================================
self.addEventListener('error', () => {});
self.addEventListener('unhandledrejection', () => {});
