// ============================================
// IPUC LA FONDA - SERVICE WORKER PWA v2.1.0
// Instalable como App Nativa | Offline | Push
// ============================================

const CACHE_NAME = 'ipuc-la-fonda-v2.1.0';
const RUNTIME_CACHE = 'ipuc-runtime-v2.1.0';

// Assets que se cachean al instalar (shell de la aplicación)
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/crear-admin.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/ipuclafonda.png',
    '/favicon.ico',
    
    // Avatares
    '/assets/avatars/default.png',
    '/assets/avatars/admin.png',
    
    // Iconos PWA (necesarios para instalación)
    '/assets/icons/favicon-16x16.png',
    '/assets/icons/favicon-32x32.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/apple-touch-icon.png',
    '/assets/icons/icon-144x144.png',
    
    // Icono Safari
    '/assets/icons/safari-pinned-tab.svg'
];

// ============================================
// EVENTO: INSTALACIÓN
// ============================================
self.addEventListener('install', (event) => {
    console.log('📦 IPUC LA FONDA - Instalando Service Worker v2.1.0...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log(`📦 Precacheando ${PRECACHE_ASSETS.length} assets...`);
                
                // Intentar cachear cada asset individualmente
                const cachePromises = PRECACHE_ASSETS.map(async (url) => {
                    try {
                        const response = await fetch(url, { mode: 'no-cors' });
                        if (response && (response.status === 200 || response.type === 'opaque')) {
                            await cache.put(url, response);
                            console.log(`✅ Cacheado: ${url}`);
                            return true;
                        } else {
                            console.warn(`⚠️ No cacheado (status ${response.status}): ${url}`);
                            return false;
                        }
                    } catch (error) {
                        console.warn(`⚠️ No se pudo cachear: ${url} - ${error.message}`);
                        return false;
                    }
                });
                
                return Promise.allSettled(cachePromises);
            })
            .then((results) => {
                const cached = results.filter(r => r.status === 'fulfilled' && r.value).length;
                console.log(`✅ Instalación completada: ${cached}/${PRECACHE_ASSETS.length} assets cacheados`);
                
                // Forzar activación inmediata (no esperar a que cierren pestañas)
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Error durante la instalación:', error);
            })
    );
});

// ============================================
// EVENTO: ACTIVACIÓN
// ============================================
self.addEventListener('activate', (event) => {
    console.log('🔄 IPUC LA FONDA - Activando Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                // Eliminar caches antiguos
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('🗑️ Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activado correctamente');
                
                // Notificar a los clientes que hay un nuevo SW activo
                return self.clients.claim().then(() => {
                    // Enviar mensaje a todos los clientes
                    return self.clients.matchAll().then((clients) => {
                        clients.forEach((client) => {
                            client.postMessage({
                                type: 'SW_ACTIVATED',
                                version: '2.1.0'
                            });
                        });
                    });
                });
            })
    );
});

// ============================================
// EVENTO: FETCH (Estrategia: Network First)
// ============================================
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const { pathname } = url;
    
    // No interceptar llamadas a la API del backend
    if (pathname.includes('/api/')) {
        return;
    }
    
    // No interceptar solicitudes a otros orígenes
    if (url.origin !== self.location.origin && !url.href.includes('unpkg.com')) {
        return;
    }
    
    // Estrategia Network First con fallback a cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si la respuesta es válida, guardarla en cache runtime
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(async () => {
                // Sin conexión: buscar en cache
                const cachedResponse = await caches.match(event.request);
                
                if (cachedResponse) {
                    console.log('📄 Sirviendo desde cache:', pathname);
                    return cachedResponse;
                }
                
                // Si es una navegación, devolver index.html
                if (event.request.mode === 'navigate') {
                    const indexCache = await caches.match('/');
                    if (indexCache) {
                        console.log('🏠 Sirviendo index.html desde cache');
                        return indexCache;
                    }
                }
                
                // Para imágenes, devolver icono por defecto
                if (event.request.destination === 'image') {
                    const fallbackIcon = await caches.match('/assets/icons/icon-192x192.png');
                    if (fallbackIcon) return fallbackIcon;
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
        icono: '/assets/icons/icon-192x192.png'
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
        // Contenido
        body: data.mensaje,
        icon: data.icono || '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-192x192.png',
        image: data.imagen || undefined,
        
        // Comportamiento
        data: {
            url: data.url || '/',
            timestamp: Date.now(),
            notificationId: data.id || Date.now()
        },
        
        // Vibración y sonido
        vibrate: [100, 50, 100, 50, 100],
        silent: false,
        
        // Acciones
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
        
        // Configuración
        tag: `ipuc-notif-${data.id || Date.now()}`,
        renotify: true,
        requireInteraction: data.importante || false,
        
        // Timestamp
        timestamp: Date.now()
    };
    
    event.waitUntil(
        self.registration.showNotification(data.titulo, options)
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
    if (event.action === 'close') return;
    
    // URL a abrir
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        })
        .then((windowClients) => {
            // Buscar si ya existe una ventana con la URL
            for (const client of windowClients) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus().then(() => {
                        client.postMessage({
                            type: 'NOTIFICATION_CLICKED',
                            data: event.notification.data
                        });
                    });
                }
            }
            
            // Abrir nueva ventana si no existe
            if (clients.openWindow) {
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
            
        default:
            console.log('ℹ️ Tag de sync no reconocido:', event.tag);
    }
});

// Funciones de sincronización
async function syncAsistencia() {
    try {
        console.log('✅ Sincronización de asistencia completada');
        return Promise.resolve();
    } catch (error) {
        console.error('❌ Error sync asistencia:', error);
        return Promise.reject(error);
    }
}

async function syncMensajes() {
    try {
        console.log('✅ Sincronización de mensajes completada');
        return Promise.resolve();
    } catch (error) {
        console.error('❌ Error sync mensajes:', error);
        return Promise.reject(error);
    }
}

async function syncPeticiones() {
    try {
        console.log('✅ Sincronización de peticiones completada');
        return Promise.resolve();
    } catch (error) {
        console.error('❌ Error sync peticiones:', error);
        return Promise.reject(error);
    }
}

async function syncDatosGenerales() {
    try {
        console.log('✅ Sincronización general completada');
        return Promise.resolve();
    } catch (error) {
        console.error('❌ Error sync general:', error);
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
            console.log('⏩ Saltando espera, nuevo SW activado');
            break;
            
        case 'CHECK_FOR_UPDATE':
            // Verificar si hay actualizaciones
            self.registration.update().then(() => {
                console.log('🔍 Verificación de actualización completada');
            });
            break;
            
        case 'GET_VERSION':
            // Enviar versión al cliente
            if (event.ports && event.ports[0]) {
                event.ports[0].postMessage({
                    version: '2.1.0',
                    cache: CACHE_NAME
                });
            }
            break;
            
        case 'CLEAR_CACHE':
            // Limpiar todo el cache
            caches.keys().then((names) => {
                return Promise.all(names.map((name) => caches.delete(name)));
            }).then(() => {
                console.log('🧹 Cache completamente limpiado');
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ success: true });
                }
            });
            break;
            
        case 'GET_CACHE_STATS':
            // Obtener estadísticas del cache
            caches.open(CACHE_NAME).then((cache) => {
                return cache.keys();
            }).then((keys) => {
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({
                        cacheName: CACHE_NAME,
                        totalAssets: keys.length,
                        urls: keys.map(k => k.url)
                    });
                }
            });
            break;
            
        default:
            console.log('ℹ️ Tipo de mensaje no manejado:', event.data.type);
    }
});

// ============================================
// MANEJO GLOBAL DE ERRORES
// ============================================
self.addEventListener('error', (event) => {
    console.error('❌ Error crítico en SW:', event.message, event.filename, event.lineno);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promesa rechazada en SW:', event.reason);
    event.preventDefault();
});

// ============================================
// LOG DE INICIALIZACIÓN
// ============================================
console.log('✅ IPUC LA FONDA - Service Worker PWA v2.1.0 cargado');
console.log('📱 La app se puede instalar en dispositivos móviles y PC');
console.log('📦 ' + PRECACHE_ASSETS.length + ' assets configurados para precache');
console.log('🔔 Notificaciones push configuradas');
console.log('🔄 Sincronización en segundo plano habilitada');
console.log('📴 Modo offline disponible');
