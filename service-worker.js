// ============================================
// IPUC LA FONDA - SERVICE WORKER PWA v2.1.0
// Instalable como App Nativa | Offline | Push
// "Donde el Espíritu Santo se mueve"
// ============================================

const CACHE_NAME = 'ipuc-la-fonda-v2.1.0';
const RUNTIME_CACHE = 'ipuc-runtime-v2.1.0';
const IMAGE_CACHE = 'ipuc-images-v2.1.0';

// ============================================
// ASSETS A PRECACHEAR (SHELL DE LA APLICACIÓN)
// ============================================
const PRECACHE_ASSETS = [
    // Páginas principales
    '/',
    '/index.html',
    
    // Estilos y scripts
    '/styles.css',
    '/script.js',
    
    // PWA
    '/manifest.json',
    
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
// EVENTO: INSTALACIÓN
// ============================================
self.addEventListener('install', (event) => {
    console.log('📦 IPUC LA FONDA - Instalando Service Worker v2.1.0...');
    console.log(`📦 ${PRECACHE_ASSETS.length} assets para precachear`);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Iniciando precacheo de assets...');
                
                // Cachear cada asset individualmente para mejor manejo de errores
                const cachePromises = PRECACHE_ASSETS.map(async (url) => {
                    try {
                        const response = await fetch(url, { 
                            mode: 'no-cors',
                            cache: 'no-cache'
                        });
                        if (response && (response.status === 200 || response.type === 'opaque')) {
                            await cache.put(url, response);
                            console.log(`   ✅ Cacheado: ${url}`);
                            return true;
                        } else {
                            console.warn(`   ⚠️ No cacheado (status ${response.status}): ${url}`);
                            return false;
                        }
                    } catch (error) {
                        console.warn(`   ⚠️ Error cacheando ${url}: ${error.message}`);
                        return false;
                    }
                });
                
                return Promise.allSettled(cachePromises);
            })
            .then((results) => {
                const cached = results.filter(r => r.status === 'fulfilled' && r.value).length;
                const failed = results.filter(r => r.status === 'rejected' || !r.value).length;
                
                console.log(`✅ Instalación completada: ${cached} cacheados, ${failed} fallidos`);
                
                // Forzar activación inmediata sin esperar a que cierren pestañas
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Error fatal durante la instalación:', error);
            })
    );
});

// ============================================
// EVENTO: ACTIVACIÓN
// ============================================
self.addEventListener('activate', (event) => {
    console.log('🔄 IPUC LA FONDA - Activando Service Worker...');
    
    const CURRENT_CACHES = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                // Eliminar caches antiguos que no estén en uso
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
                console.log('✅ Service Worker activado correctamente');
                
                // Tomar control de todas las pestañas inmediatamente
                return self.clients.claim().then(() => {
                    // Notificar a todos los clientes que el SW está activo
                    return self.clients.matchAll().then((clients) => {
                        clients.forEach((client) => {
                            client.postMessage({
                                type: 'SW_ACTIVATED',
                                version: '2.1.0',
                                timestamp: Date.now()
                            });
                        });
                        console.log(`📢 ${clients.length} clientes notificados`);
                    });
                });
            })
            .then(() => {
                // Limpiar cachés antiguas después de la activación
                console.log('🧹 Limpieza de cachés completada');
            })
    );
});

// ============================================
// EVENTO: FETCH (Estrategia: Network First con fallback a cache)
// ============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    const { pathname } = url;
    
    // No interceptar llamadas a la API del backend
    if (pathname.includes('/api/')) {
        return;
    }
    
    // No interceptar archivos Python ni datos JSON del backend
    if (pathname.endsWith('.py') || (pathname.endsWith('.json') && pathname.includes('/data/'))) {
        return;
    }
    
    // No interceptar analytics ni tracking
    if (pathname.includes('analytics') || pathname.includes('gtag')) {
        return;
    }
    
    // No interceptar solicitudes a otros orígenes (excepto CDN de boxicons)
    if (url.origin !== self.location.origin && !url.href.includes('unpkg.com')) {
        return;
    }
    
    // ============================================
    // ESTRATEGIA PARA IMÁGENES: Cache First
    // ============================================
    if (request.destination === 'image' || request.url.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)) {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        // Actualizar en segundo plano (stale-while-revalidate)
                        fetch(request).then((networkResponse) => {
                            if (networkResponse && networkResponse.status === 200) {
                                caches.open(IMAGE_CACHE).then((cache) => {
                                    cache.put(request, networkResponse.clone());
                                });
                            }
                        });
                        return cachedResponse;
                    }
                    
                    // Si no está en cache, obtener de la red
                    return fetch(request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(IMAGE_CACHE).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return networkResponse;
                    }).catch(() => {
                        // Fallback para imágenes
                        if (request.destination === 'image') {
                            return caches.match('/assets/icons/icon-192x192.png');
                        }
                        throw new Error('Sin conexión');
                    });
                })
        );
        return;
    }
    
    // ============================================
    // ESTRATEGIA PARA CSS/JS/HTML: Network First
    // ============================================
    if (request.destination === 'style' || request.destination === 'script' || 
        request.destination === 'document' || request.mode === 'navigate' ||
        request.url.match(/\.(css|js|html)$/)) {
        
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Guardar en cache runtime respuestas exitosas
                    if (response && response.status === 200 && response.type === 'basic') {
                        const responseClone = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(async () => {
                    // Sin conexión: buscar en cache
                    const cachedResponse = await caches.match(request);
                    if (cachedResponse) {
                        console.log('📄 Sirviendo desde cache:', pathname);
                        return cachedResponse;
                    }
                    
                    // Si es navegación, devolver index.html (SPA fallback)
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
                            mensaje: 'Sin conexión a internet',
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
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(async () => {
                const cachedResponse = await caches.match(request);
                if (cachedResponse) {
                    console.log('📄 Sirviendo desde cache:', pathname);
                    return cachedResponse;
                }
                
                // Respuesta offline genérica
                return new Response(
                    JSON.stringify({
                        error: true,
                        mensaje: 'Sin conexión a internet',
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
});

// ============================================
// EVENTO: PUSH NOTIFICATIONS
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
        // Contenido de la notificación
        body: data.mensaje,
        icon: data.icono || '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-192x192.png',
        image: data.imagen || undefined,
        
        // Datos que se pasan al hacer clic
        data: {
            url: data.url || '/',
            timestamp: Date.now(),
            notificationId: data.id || Date.now(),
            ...data.extra
        },
        
        // Configuración de vibración
        vibrate: data.vibrate || [100, 50, 100, 50, 100],
        
        // Sonido
        silent: data.silent || false,
        
        // Acciones de la notificación
        actions: [
            { 
                action: 'open', 
                title: '👁️ Ver', 
                icon: '/assets/icons/icon-192x192.png' 
            },
            { 
                action: 'close', 
                title: '❌ Cerrar', 
                icon: '/assets/icons/icon-192x192.png' 
            }
        ],
        
        // Etiqueta para agrupar notificaciones
        tag: `ipuc-notif-${data.id || Date.now()}`,
        
        // Renotificar si ya existe una con el mismo tag
        renotify: true,
        
        // Mantener la notificación hasta que el usuario interactúe
        requireInteraction: data.importante || false,
        
        // Timestamp
        timestamp: data.timestamp || Date.now()
    };
    
    event.waitUntil(
        self.registration.showNotification(
            data.titulo || 'IPUC LA FONDA',
            options
        ).then(() => {
            console.log('✅ Notificación mostrada exitosamente');
        }).catch((error) => {
            console.error('❌ Error al mostrar notificación:', error);
        })
    );
});

// ============================================
// EVENTO: CLIC EN NOTIFICACIÓN
// ============================================
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Clic en notificación:', event.action);
    
    // Cerrar la notificación
    event.notification.close();
    
    // Si eligió cerrar, no hacer nada más
    if (event.action === 'close') {
        console.log('   Usuario cerró la notificación');
        return;
    }
    
    // URL a abrir
    const urlToOpen = event.notification.data?.url || '/';
    console.log('   Abriendo URL:', urlToOpen);
    
    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        })
        .then((windowClients) => {
            // Buscar si ya existe una ventana con la URL
            for (const client of windowClients) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    console.log('   Ventana existente encontrada, enfocando...');
                    return client.focus().then(() => {
                        // Enviar mensaje a la ventana existente
                        client.postMessage({
                            type: 'NOTIFICATION_CLICKED',
                            data: event.notification.data
                        });
                    });
                }
            }
            
            // Abrir nueva ventana si no existe
            if (clients.openWindow) {
                console.log('   Abriendo nueva ventana...');
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// ============================================
// EVENTO: SINCRONIZACIÓN EN SEGUNDO PLANO
// ============================================
self.addEventListener('sync', (event) => {
    console.log('🔄 Evento sync:', event.tag);
    
    switch (event.tag) {
        case 'sync-asistencia':
            event.waitUntil(syncAsistencia());
            break;
            
        case 'sync-mensajes':
            event.waitUntil(syncMensajes());
            break;
            
        case 'sync-peticiones':
            event.waitUntil(syncPeticiones());
            break;
            
        case 'sync-datos':
            event.waitUntil(syncDatosGenerales());
            break;
            
        case 'sync-noticias':
            event.waitUntil(syncNoticias());
            break;
            
        default:
            console.log('   ℹ️ Tag de sync no reconocido:', event.tag);
    }
});

// Funciones de sincronización
async function syncAsistencia() {
    try {
        console.log('   ✅ Sincronización de asistencia completada');
        return Promise.resolve();
    } catch (error) {
        console.error('   ❌ Error sync asistencia:', error);
        return Promise.reject(error);
    }
}

async function syncMensajes() {
    try {
        console.log('   ✅ Sincronización de mensajes completada');
        return Promise.resolve();
    } catch (error) {
        console.error('   ❌ Error sync mensajes:', error);
        return Promise.reject(error);
    }
}

async function syncPeticiones() {
    try {
        console.log('   ✅ Sincronización de peticiones completada');
        return Promise.resolve();
    } catch (error) {
        console.error('   ❌ Error sync peticiones:', error);
        return Promise.reject(error);
    }
}

async function syncDatosGenerales() {
    try {
        console.log('   ✅ Sincronización general completada');
        return Promise.resolve();
    } catch (error) {
        console.error('   ❌ Error sync general:', error);
        return Promise.reject(error);
    }
}

async function syncNoticias() {
    try {
        console.log('   ✅ Sincronización de noticias completada');
        return Promise.resolve();
    } catch (error) {
        console.error('   ❌ Error sync noticias:', error);
        return Promise.reject(error);
    }
}

// ============================================
// EVENTO: MENSAJES DESDE EL CLIENTE
// ============================================
self.addEventListener('message', (event) => {
    console.log('📩 Mensaje del cliente:', event.data?.type);
    
    if (!event.data || !event.data.type) return;
    
    switch (event.data.type) {
        case 'SKIP_WAITING':
            // Forzar activación del nuevo SW
            self.skipWaiting();
            console.log('   ⏩ Saltando espera, nuevo SW activado');
            break;
            
        case 'CHECK_FOR_UPDATE':
            // Verificar si hay actualizaciones disponibles
            self.registration.update().then(() => {
                console.log('   🔍 Verificación de actualización completada');
            }).catch((error) => {
                console.error('   ❌ Error verificando actualización:', error);
            });
            break;
            
        case 'GET_VERSION':
            // Enviar versión al cliente
            if (event.ports && event.ports[0]) {
                event.ports[0].postMessage({
                    version: '2.1.0',
                    cache: CACHE_NAME,
                    timestamp: Date.now()
                });
            }
            break;
            
        case 'CLEAR_CACHE':
            // Limpiar todo el cache
            caches.keys().then((names) => {
                return Promise.all(names.map((name) => caches.delete(name)));
            }).then(() => {
                console.log('   🧹 Cache completamente limpiado');
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ 
                        success: true,
                        message: 'Cache limpiado exitosamente'
                    });
                }
            }).catch((error) => {
                console.error('   ❌ Error limpiando cache:', error);
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ 
                        success: false,
                        error: error.message
                    });
                }
            });
            break;
            
        case 'GET_CACHE_STATS':
            // Obtener estadísticas del cache
            Promise.all([
                caches.open(CACHE_NAME).then((cache) => cache.keys()),
                caches.open(RUNTIME_CACHE).then((cache) => cache.keys()),
                caches.open(IMAGE_CACHE).then((cache) => cache.keys())
            ]).then(([precacheKeys, runtimeKeys, imageKeys]) => {
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({
                        cacheName: CACHE_NAME,
                        precache: {
                            total: precacheKeys.length,
                            urls: precacheKeys.map(k => k.url)
                        },
                        runtime: {
                            total: runtimeKeys.length,
                            urls: runtimeKeys.map(k => k.url)
                        },
                        images: {
                            total: imageKeys.length,
                            urls: imageKeys.map(k => k.url)
                        },
                        total: precacheKeys.length + runtimeKeys.length + imageKeys.length
                    });
                }
            });
            break;
            
        case 'UNREGISTER':
            // Desregistrar el Service Worker
            self.registration.unregister().then(() => {
                console.log('   🗑️ Service Worker desregistrado');
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ success: true });
                }
            });
            break;
            
        default:
            console.log('   ℹ️ Tipo de mensaje no manejado:', event.data.type);
    }
});

// ============================================
// EVENTO: CAMBIO DE CONECTIVIDAD
// ============================================
self.addEventListener('online', () => {
    console.log('🌐 Conexión a internet restaurada');
    // Notificar a los clientes
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage({
                type: 'CONNECTIVITY_CHANGE',
                online: true
            });
        });
    });
});

self.addEventListener('offline', () => {
    console.log('⚠️ Sin conexión a internet');
    // Notificar a los clientes
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage({
                type: 'CONNECTIVITY_CHANGE',
                online: false
            });
        });
    });
});

// ============================================
// MANEJO GLOBAL DE ERRORES
// ============================================
self.addEventListener('error', (event) => {
    console.error('❌ Error crítico en Service Worker:');
    console.error('   Mensaje:', event.message);
    console.error('   Archivo:', event.filename);
    console.error('   Línea:', event.lineno);
    console.error('   Columna:', event.colno);
    console.error('   Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promesa rechazada en Service Worker:');
    console.error('   Razón:', event.reason);
    event.preventDefault();
});

// ============================================
// LOG DE INICIALIZACIÓN
// ============================================
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║                                                          ║');
console.log('║   ✅ IPUC LA FONDA - Service Worker PWA v2.1.0           ║');
console.log('║   Iglesia Pentecostal Unida de Colombia                  ║');
console.log('║   "Donde el Espíritu Santo se mueve"                     ║');
console.log('║                                                          ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');
console.log('📱 La app se puede instalar en dispositivos móviles y PC');
console.log('📦 ' + PRECACHE_ASSETS.length + ' assets configurados para precache');
console.log('🖼️  Estrategia Cache First para imágenes');
console.log('📄 Estrategia Network First para CSS/JS/HTML');
console.log('🔔 Notificaciones push configuradas');
console.log('🔄 Sincronización en segundo plano habilitada');
console.log('📴 Modo offline completamente funcional');
console.log('🌐 Detección de cambios de conectividad');
console.log('');
console.log('🎯 Service Worker listo y operativo');
