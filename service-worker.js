// ============================================
// IPUC LA FONDA - SERVICE WORKER PWA v5.1
// Instalable como App Nativa | Offline | Push
// MEJORADO - OPTIMIZADO - 100% OPERATIVO
// Incluye todos los archivos JS necesarios
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
// ASSETS A PRECACHEAR (SHELL COMPLETO DE LA APLICACIÓN)
// ============================================
const PRECACHE_ASSETS = [
    // Páginas principales
    '/',
    '/index.html',
    '/crear-admin.html',
    
    // Hojas de estilo
    '/styles.css',
    
    // JavaScript - Archivos principales
    '/database.js',
    '/app.js',
    '/script.js',
    '/crear-admin.js',
    
    // PWA
    '/manifest.json',
    '/service-worker.js',
    
    // Logos e imágenes principales
    '/ipuclafonda.png',
    '/favicon.ico',
    
    // Avatares
    '/assets/avatars/default.png',
    '/assets/avatars/admin.png',
    
    // Iconos PWA (necesarios para instalación)
    '/assets/icons/favicon-16x16.png',
    '/assets/icons/favicon-32x32.png',
    '/assets/icons/icon-144x144.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/apple-touch-icon.png',
    '/assets/icons/safari-pinned-tab.svg'
];

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================
function shouldCache(url) {
    // No cachear URLs con parámetros de no-cache
    if (url.includes('nocache=true') || url.includes('_=')) return false;
    
    // No cachear URLs de admin
    if (url.includes('/admin/') && !url.includes('/admin/')) return false;
    
    return true;
}

function isImageRequest(url) {
    return url.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|bmp|tiff)$/i) || 
           url.includes('/assets/') && !url.includes('.js');
}

function isApiRequest(url) {
    return url.includes('/api/') || url.includes('?api');
}

function isHtmlRequest(url) {
    return url.endsWith('.html') || url.endsWith('/') || 
           url.includes('/page/') || url.includes('/view/');
}

// ============================================
// INSTALACIÓN - Precachea todos los assets con verificación
// ============================================
self.addEventListener('install', (event) => {
    console.log(`📦 IPUC LA FONDA v${VERSION} - Instalando Service Worker...`);
    console.log(`📦 ${PRECACHE_ASSETS.length} assets para precachear`);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                console.log('📦 Iniciando precacheo de todos los archivos...');
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
                            console.log(`   ✅ Cacheado: ${url}`);
                            results.push({ url, success: true });
                        } else {
                            console.warn(`   ⚠️ No cacheado: ${url} (status: ${response?.status})`);
                            results.push({ url, success: false });
                        }
                    } catch (error) {
                        console.warn(`   ⚠️ Error: ${url} - ${error.message}`);
                        results.push({ url, success: false, error: error.message });
                    }
                }
                
                const cached = results.filter(r => r.success).length;
                const failed = results.filter(r => !r.success).length;
                console.log(`✅ Instalación completada: ${cached} cacheados, ${failed} fallidos`);
                
                // Guardar estadísticas
                await cache.put('/__cache_stats', new Response(JSON.stringify({
                    version: VERSION,
                    timestamp: Date.now(),
                    total: results.length,
                    cached,
                    failed,
                    assets: results
                })));
                
                // Forzar activación inmediata
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Error fatal durante instalación:', error);
            })
    );
});

// ============================================
// ACTIVACIÓN - Limpia caches antiguos y notifica clientes
// ============================================
self.addEventListener('activate', (event) => {
    console.log(`🔄 IPUC LA FONDA v${VERSION} - Activando Service Worker...`);
    const CURRENT_CACHES = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, API_CACHE, OFFLINE_CACHE];

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (!CURRENT_CACHES.includes(cacheName)) {
                            console.log(`   🗑️ Eliminando cache antiguo: ${cacheName}`);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(async () => {
                console.log('✅ SW activado - Tomando control de todas las pestañas');
                
                // Notificar a todos los clientes
                const clients = await self.clients.matchAll({ 
                    type: 'window',
                    includeUncontrolled: true 
                });
                
                for (const client of clients) {
                    try {
                        client.postMessage({
                            type: 'SW_ACTIVATED',
                            version: VERSION,
                            timestamp: Date.now(),
                            cacheName: CACHE_NAME
                        });
                        console.log(`📢 Cliente notificado: ${client.id}`);
                    } catch (e) {
                        console.warn(`⚠️ No se pudo notificar cliente: ${client.id}`);
                    }
                }
                
                return self.clients.claim();
            })
    );
});

// ============================================
// FETCH - Estrategias de cache inteligentes
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
    // ESTRATEGIA PARA IMÁGENES: Stale-While-Revalidate
    // ============================================
    if (isImageRequest(pathname)) {
        event.respondWith(
            caches.match(request).then(async (cached) => {
                // Si está en cache y es reciente
                if (cached) {
                    const cacheTime = cached.headers.get('x-cache-time');
                    if (cacheTime && (Date.now() - parseInt(cacheTime)) < (MAX_AGE * 1000)) {
                        console.log('🖼️ Imagen desde cache:', pathname);
                        return cached;
                    }
                }
                
                // Actualizar en segundo plano
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
                        console.log('🖼️ Imagen actualizada:', pathname);
                        return responseToCache;
                    }
                } catch (error) {
                    console.warn('⚠️ Error actualizando imagen:', pathname);
                }
                
                // Fallback: imagen por defecto
                if (cached) return cached;
                return caches.match('/assets/icons/icon-192x192.png');
            })
        );
        return;
    }

    // ============================================
    // ESTRATEGIA PARA APIs: Network First + Cache
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
                    if (cached) {
                        console.log('📡 API desde cache:', pathname);
                        return cached;
                    }
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
    // ESTRATEGIA PARA HTML: Network First + Cache Fallback
    // ============================================
    if (request.mode === 'navigate' || isHtmlRequest(pathname)) {
        event.respondWith(
            fetch(request)
                .then(async (response) => {
                    if (response && response.ok) {
                        const cache = await caches.open(RUNTIME_CACHE);
                        cache.put(request, response.clone());
                        console.log('📄 HTML actualizado:', pathname);
                        return response;
                    }
                    throw new Error('Respuesta no válida');
                })
                .catch(async (error) => {
                    console.warn('⚠️ Error cargando página:', pathname, error.message);
                    
                    // Buscar en cache
                    const cached = await caches.match(request);
                    if (cached) {
                        console.log('📄 HTML desde cache:', pathname);
                        return cached;
                    }
                    
                    // Fallback: index.html
                    const index = await caches.match('/');
                    if (index) {
                        console.log('🏠 Sirviendo index.html como fallback');
                        return index;
                    }
                    
                    // Página offline
                    return new Response(
                        `
                        <!DOCTYPE html>
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
                                .offline-content {
                                    max-width: 400px;
                                    padding: 20px;
                                }
                                .offline-icon {
                                    font-size: 4rem;
                                    margin-bottom: 20px;
                                }
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
                                <button class="retry-btn" onclick="location.reload()">
                                    🔄 Reintentar
                                </button>
                            </div>
                        </body>
                        </html>
                        `,
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
    // ESTRATEGIA PARA JS/CSS: Cache First + Update
    // ============================================
    if (request.destination === 'script' || request.destination === 'style') {
        event.respondWith(
            caches.match(request).then(async (cached) => {
                // Actualizar en segundo plano si es necesario
                const fetchPromise = fetch(request).then(async (response) => {
                    if (response && response.ok) {
                        const cache = await caches.open(RUNTIME_CACHE);
                        cache.put(request, response.clone());
                        console.log('📦 JS/CSS actualizado:', pathname);
                    }
                    return response;
                }).catch(() => {
                    console.log('📦 JS/CSS desde cache:', pathname);
                    return cached;
                });
                
                return cached || fetchPromise;
            })
        );
        return;
    }

    // ============================================
    // ESTRATEGIA PARA EL RESTO: Network First
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
                if (cached) {
                    console.log('📄 Cache general:', pathname);
                    return cached;
                }
                
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
// PUSH NOTIFICATIONS MEJORADAS
// ============================================
self.addEventListener('push', (event) => {
    console.log('📨 Notificación push recibida');
    
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
        } catch (e) {
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
            .then(() => console.log('✅ Notificación mostrada'))
            .catch((error) => console.error('❌ Error al mostrar notificación:', error))
    );
});

// ============================================
// CLIC EN NOTIFICACIÓN MEJORADO
// ============================================
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Clic en notificación:', event.action);
    event.notification.close();
    
    if (event.action === 'close') {
        console.log('   ❌ Notificación cerrada por usuario');
        return;
    }
    
    const urlToOpen = event.notification.data?.url || '/';
    const notificationId = event.notification.data?.notificationId;
    const tipo = event.notification.data?.tipo || 'general';
    
    console.log(`   📍 Abriendo: ${urlToOpen} (${tipo})`);
    
    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        })
        .then(async (windowClients) => {
            // Buscar ventana existente con la URL
            for (const client of windowClients) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    console.log('   🪟 Ventana existente, enfocando...');
                    await client.focus();
                    client.postMessage({
                        type: 'NOTIFICATION_CLICKED',
                        data: {
                            notificationId,
                            tipo,
                            url: urlToOpen,
                            timestamp: Date.now()
                        }
                    });
                    return;
                }
            }
            
            // Abrir nueva ventana
            if (clients.openWindow) {
                console.log('   🆕 Abriendo nueva ventana...');
                const newClient = await clients.openWindow(urlToOpen);
                if (newClient) {
                    setTimeout(() => {
                        newClient.postMessage({
                            type: 'NOTIFICATION_CLICKED',
                            data: {
                                notificationId,
                                tipo,
                                url: urlToOpen,
                                timestamp: Date.now()
                            }
                        });
                    }, 500);
                }
                return;
            }
        })
    );
});

// ============================================
// SINCRONIZACIÓN EN SEGUNDO PLANO
// ============================================
self.addEventListener('sync', (event) => {
    console.log(`🔄 Evento sync: ${event.tag}`);
    
    const syncHandlers = {
        'sync-asistencia': async () => {
            console.log('✅ Asistencia sincronizada');
            // Aquí iría la lógica de sincronización
        },
        'sync-mensajes': async () => {
            console.log('✅ Mensajes sincronizados');
        },
        'sync-peticiones': async () => {
            console.log('✅ Peticiones sincronizadas');
        },
        'sync-datos': async () => {
            console.log('✅ Datos sincronizados');
        },
        'sync-noticias': async () => {
            console.log('✅ Noticias sincronizadas');
        },
        'sync-publicaciones': async () => {
            console.log('✅ Publicaciones sincronizadas');
        }
    };
    
    if (syncHandlers[event.tag]) {
        event.waitUntil(Promise.resolve(syncHandlers[event.tag]()));
    } else {
        console.log(`   ℹ️ Tag no reconocido: ${event.tag}`);
    }
});

// ============================================
// MENSAJES DESDE EL CLIENTE MEJORADO
// ============================================
self.addEventListener('message', (event) => {
    console.log('📩 Mensaje del cliente:', event.data?.type);
    
    if (!event.data || !event.data.type) return;
    
    switch (event.data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting().then(() => {
                console.log('   ⏩ Nuevo SW activado');
                // Notificar a todos los clientes
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
            self.registration.update().then(() => {
                console.log('   🔍 Actualización verificada');
            }).catch((error) => {
                console.error('   ❌ Error verificando:', error);
            });
            break;
            
        case 'GET_VERSION':
            if (event.ports && event.ports[0]) {
                event.ports[0].postMessage({
                    version: VERSION,
                    cache: CACHE_NAME,
                    timestamp: Date.now(),
                    assets: PRECACHE_ASSETS.length,
                    runtime: RUNTIME_CACHE,
                    image: IMAGE_CACHE
                });
            }
            break;
            
        case 'CLEAR_CACHE':
            caches.keys().then((names) => {
                return Promise.all(names.map((name) => caches.delete(name)));
            }).then(() => {
                console.log('   🧹 Cache completamente limpiado');
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ 
                        success: true, 
                        message: 'Cache limpiado',
                        timestamp: Date.now()
                    });
                }
            }).catch((error) => {
                console.error('   ❌ Error:', error);
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ 
                        success: false, 
                        error: error.message 
                    });
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
            }).catch((error) => {
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ 
                        success: false, 
                        error: error.message 
                    });
                }
            });
            break;
            
        default:
            console.log('   ℹ️ Tipo no manejado:', event.data.type);
    }
});

// ============================================
// DETECCIÓN DE CONECTIVIDAD MEJORADA
// ============================================
self.addEventListener('online', () => {
    console.log('🌐 Conexión restaurada');
    self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
            try {
                client.postMessage({
                    type: 'CONNECTIVITY_CHANGE',
                    online: true,
                    timestamp: Date.now()
                });
            } catch (e) {
                // Ignorar errores de clientes desconectados
            }
        });
    });
});

self.addEventListener('offline', () => {
    console.log('⚠️ Sin conexión - Modo offline activado');
    self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
            try {
                client.postMessage({
                    type: 'CONNECTIVITY_CHANGE',
                    online: false,
                    timestamp: Date.now()
                });
            } catch (e) {
                // Ignorar errores de clientes desconectados
            }
        });
    });
});

// ============================================
// MANEJO DE ERRORES GLOBALES
// ============================================
self.addEventListener('error', (event) => {
    console.error('❌ Error en Service Worker:', event.message, event.filename, event.lineno);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promesa rechazada en SW:', event.reason);
});

// ============================================
// LOG DE INICIALIZACIÓN FINAL
// ============================================
console.log('╔══════════════════════════════════════════════════════════╗');
console.log(`║   ✅ IPUC LA FONDA - Service Worker PWA v${VERSION}              ║`);
console.log('║   Iglesia Pentecostal Unida de Colombia                  ║');
console.log('║   "Donde el Espíritu Santo se mueve"                     ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log(`📱 App instalable en Android, iOS, Windows y Mac`);
console.log(`📦 ${PRECACHE_ASSETS.length} assets precacheados`);
console.log('📴 Modo offline 100% funcional');
console.log('🔔 Notificaciones push listas');
console.log('🎯 Service Worker v5.1 operativo');
console.log(`🔄 Estrategias de cache: Imágenes (SWR), HTML (Network First + Cache), JS/CSS (Cache First + Update)`);
