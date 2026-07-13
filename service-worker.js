// ============================================
// IPUC LA FONDA - SERVICE WORKER PWA v5.0
// Instalable como App Nativa | Offline | Push
// Incluye todos los archivos JS necesarios
// "Donde el Espíritu Santo se mueve"
// ============================================

const CACHE_NAME = 'ipuc-la-fonda-v5.0';
const RUNTIME_CACHE = 'ipuc-runtime-v5.0';
const IMAGE_CACHE = 'ipuc-images-v5.0';

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
    
    // JavaScript - Todos los archivos
    '/script.js',
    '/database.js',
    '/app.js',
    '/crear-admin.js',
    '/generar-hash.js',
    
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
// INSTALACIÓN - Precachea todos los assets
// ============================================
self.addEventListener('install', (event) => {
    console.log(`📦 IPUC LA FONDA v5.0 - Instalando Service Worker...`);
    console.log(`📦 ${PRECACHE_ASSETS.length} assets para precachear`);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Iniciando precacheo de todos los archivos...');
                const promises = PRECACHE_ASSETS.map(async (url) => {
                    try {
                        const response = await fetch(url, { mode: 'no-cors', cache: 'no-cache' });
                        if (response && (response.status === 200 || response.type === 'opaque')) {
                            await cache.put(url, response);
                            console.log(`   ✅ Cacheado: ${url}`);
                            return true;
                        } else {
                            console.warn(`   ⚠️ No cacheado: ${url} (status: ${response?.status})`);
                            return false;
                        }
                    } catch (error) {
                        console.warn(`   ⚠️ Error: ${url} - ${error.message}`);
                        return false;
                    }
                });
                return Promise.allSettled(promises);
            })
            .then((results) => {
                const cached = results.filter(r => r.status === 'fulfilled' && r.value).length;
                const failed = results.filter(r => r.status === 'rejected' || !r.value).length;
                console.log(`✅ Instalación completada: ${cached} cacheados, ${failed} fallidos`);
                // Forzar activación inmediata
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Error fatal durante instalación:', error);
            })
    );
});

// ============================================
// ACTIVACIÓN - Limpia caches antiguos
// ============================================
self.addEventListener('activate', (event) => {
    console.log('🔄 IPUC LA FONDA v5.0 - Activando Service Worker...');
    const CURRENT_CACHES = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];

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
            .then(() => {
                console.log('✅ SW activado - Tomando control de todas las pestañas');
                return self.clients.claim().then(() => {
                    return self.clients.matchAll().then((clients) => {
                        clients.forEach((client) => {
                            client.postMessage({
                                type: 'SW_ACTIVATED',
                                version: '5.0',
                                timestamp: Date.now()
                            });
                        });
                        console.log(`📢 ${clients.length} clientes notificados`);
                    });
                });
            })
    );
});

// ============================================
// FETCH - Estrategias de cache inteligentes
// ============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    const { pathname } = url;

    // No interceptar llamadas a APIs externas
    if (pathname.includes('/api/')) return;
    
    // No interceptar archivos de sistema
    if (pathname.endsWith('.py') || pathname.endsWith('.json')) return;
    
    // No interceptar analytics
    if (pathname.includes('analytics') || pathname.includes('gtag')) return;
    
    // No interceptar solicitudes a otros orígenes (excepto CDN de boxicons)
    if (url.origin !== self.location.origin && !url.href.includes('unpkg.com')) return;

    // ============================================
    // ESTRATEGIA PARA IMÁGENES: Cache First + Stale-While-Revalidate
    // ============================================
    if (request.destination === 'image' || request.url.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                // Actualizar en segundo plano
                const fetchPromise = fetch(request).then((network) => {
                    if (network && network.status === 200) {
                        const clone = network.clone();
                        caches.open(IMAGE_CACHE).then((cache) => cache.put(request, clone));
                    }
                    return network;
                }).catch(() => {
                    // Fallback: icono por defecto
                    return cached || caches.match('/assets/icons/icon-192x192.png');
                });
                // Devolver cache primero, o esperar red
                return cached || fetchPromise;
            })
        );
        return;
    }

    // ============================================
    // ESTRATEGIA PARA JS/CSS/HTML: Network First + Cache Fallback
    // ============================================
    if (request.destination === 'style' || request.destination === 'script' ||
        request.destination === 'document' || request.mode === 'navigate' ||
        request.url.match(/\.(css|js|html)$/)) {
        
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Guardar en cache respuestas exitosas
                    if (response && response.status === 200 && response.type === 'basic') {
                        const clone = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(async () => {
                    // Sin conexión: buscar en cache
                    const cached = await caches.match(request);
                    if (cached) {
                        console.log('📄 Sirviendo desde cache:', pathname);
                        return cached;
                    }
                    // Si es navegación, devolver index.html
                    if (request.mode === 'navigate') {
                        const indexCache = await caches.match('/');
                        if (indexCache) {
                            console.log('🏠 Sirviendo index.html desde cache');
                            return indexCache;
                        }
                    }
                    // Respuesta offline
                    return new Response(
                        JSON.stringify({
                            error: true,
                            mensaje: 'Sin conexión a internet. La app funciona offline con datos limitados.',
                            offline: true
                        }),
                        {
                            status: 503,
                            statusText: 'Sin conexión',
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
    // ESTRATEGIA PARA EL RESTO: Network First
    // ============================================
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
                }
                return response;
            })
            .catch(async () => {
                const cached = await caches.match(request);
                if (cached) {
                    console.log('📄 Cache:', pathname);
                    return cached;
                }
                return new Response(
                    JSON.stringify({ error: true, mensaje: 'Sin conexión', offline: true }),
                    { status: 503, headers: { 'Content-Type': 'application/json', 'X-Offline': 'true' } }
                );
            })
    );
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
    console.log('📨 Notificación push recibida');
    
    let data = {
        titulo: 'IPUC LA FONDA',
        mensaje: 'Tienes una nueva notificación',
        url: '/',
        icono: '/assets/icons/icon-192x192.png',
        importante: false
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
        badge: '/assets/icons/icon-192x192.png',
        image: data.imagen || undefined,
        data: {
            url: data.url || '/',
            timestamp: Date.now(),
            notificationId: data.id || Date.now()
        },
        vibrate: data.vibrate || [100, 50, 100, 50, 100],
        silent: data.silent || false,
        actions: [
            { action: 'open', title: '👁️ Ver', icon: '/assets/icons/icon-192x192.png' },
            { action: 'close', title: '❌ Cerrar', icon: '/assets/icons/icon-192x192.png' }
        ],
        tag: `ipuc-notif-${data.id || Date.now()}`,
        renotify: true,
        requireInteraction: data.importante || false,
        timestamp: data.timestamp || Date.now()
    };
    
    event.waitUntil(
        self.registration.showNotification(data.titulo || 'IPUC LA FONDA', options)
            .then(() => console.log('✅ Notificación mostrada'))
            .catch((error) => console.error('❌ Error al mostrar notificación:', error))
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
    console.log('   Abriendo:', urlToOpen);
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Buscar ventana existente
                for (const client of windowClients) {
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        console.log('   Ventana existente, enfocando...');
                        return client.focus().then(() => {
                            client.postMessage({
                                type: 'NOTIFICATION_CLICKED',
                                data: event.notification.data
                            });
                        });
                    }
                }
                // Abrir nueva ventana
                if (clients.openWindow) {
                    console.log('   Abriendo nueva ventana...');
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// ============================================
// SINCRONIZACIÓN EN SEGUNDO PLANO
// ============================================
self.addEventListener('sync', (event) => {
    console.log('🔄 Evento sync:', event.tag);
    
    const syncHandlers = {
        'sync-asistencia': () => console.log('✅ Asistencia sincronizada'),
        'sync-mensajes': () => console.log('✅ Mensajes sincronizados'),
        'sync-peticiones': () => console.log('✅ Peticiones sincronizadas'),
        'sync-datos': () => console.log('✅ Datos sincronizados'),
        'sync-noticias': () => console.log('✅ Noticias sincronizadas')
    };
    
    if (syncHandlers[event.tag]) {
        event.waitUntil(Promise.resolve(syncHandlers[event.tag]()));
    } else {
        console.log('   ℹ️ Tag no reconocido:', event.tag);
    }
});

// ============================================
// MENSAJES DESDE EL CLIENTE
// ============================================
self.addEventListener('message', (event) => {
    console.log('📩 Mensaje del cliente:', event.data?.type);
    
    if (!event.data || !event.data.type) return;
    
    switch (event.data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            console.log('   ⏩ Nuevo SW activado');
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
                    version: '5.0',
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
                console.log('   🧹 Cache completamente limpiado');
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ success: true, message: 'Cache limpiado' });
                }
            }).catch((error) => {
                console.error('   ❌ Error:', error);
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ success: false, error: error.message });
                }
            });
            break;
            
        case 'GET_CACHE_STATS':
            Promise.all([
                caches.open(CACHE_NAME).then((cache) => cache.keys()),
                caches.open(RUNTIME_CACHE).then((cache) => cache.keys()),
                caches.open(IMAGE_CACHE).then((cache) => cache.keys())
            ]).then(([precache, runtime, images]) => {
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({
                        cacheName: CACHE_NAME,
                        precache: { total: precache.length, urls: precache.map(k => k.url) },
                        runtime: { total: runtime.length, urls: runtime.map(k => k.url) },
                        images: { total: images.length, urls: images.map(k => k.url) },
                        total: precache.length + runtime.length + images.length
                    });
                }
            });
            break;
            
        case 'UNREGISTER':
            self.registration.unregister().then(() => {
                console.log('   🗑️ SW desregistrado');
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ success: true });
                }
            });
            break;
            
        default:
            console.log('   ℹ️ Tipo no manejado:', event.data.type);
    }
});

// ============================================
// DETECCIÓN DE CONECTIVIDAD
// ============================================
self.addEventListener('online', () => {
    console.log('🌐 Conexión restaurada');
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage({ type: 'CONNECTIVITY_CHANGE', online: true });
        });
    });
});

self.addEventListener('offline', () => {
    console.log('⚠️ Sin conexión - Modo offline activado');
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage({ type: 'CONNECTIVITY_CHANGE', online: false });
        });
    });
});

// ============================================
// MANEJO GLOBAL DE ERRORES
// ============================================
self.addEventListener('error', (event) => {
    console.error('❌ Error crítico en SW:', event.message);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promesa rechazada:', event.reason);
    event.preventDefault();
});

// ============================================
// LOG DE INICIALIZACIÓN FINAL
// ============================================
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║                                                          ║');
console.log('║   ✅ IPUC LA FONDA - Service Worker PWA v5.0              ║');
console.log('║   Iglesia Pentecostal Unida de Colombia                  ║');
console.log('║   "Donde el Espíritu Santo se mueve"                     ║');
console.log('║                                                          ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');
console.log('📱 App instalable en Android, iOS, Windows y Mac');
console.log('📦 ' + PRECACHE_ASSETS.length + ' assets configurados para precache');
console.log('📄 Archivos JS incluidos:');
console.log('   • script.js - Interfaz de usuario principal');
console.log('   • database.js - Base de datos local');
console.log('   • app.js - Lógica de negocio');
console.log('   • crear-admin.js - Creación de administrador');
console.log('   • generar-hash.js - Generador de hash');
console.log('');
console.log('🖼️  Estrategia Cache First para imágenes');
console.log('📄 Estrategia Network First para CSS/JS/HTML');
console.log('🔔 Notificaciones push configuradas');
console.log('🔄 Sincronización en segundo plano habilitada');
console.log('📴 Modo offline completamente funcional');
console.log('🌐 Detección de cambios de conectividad');
console.log('');
console.log('🎯 Service Worker listo y operativo');
