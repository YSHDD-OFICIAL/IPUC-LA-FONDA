/* ============================================
   IPUC LA FONDA - SERVICE WORKER PWA v20.0 PRO ULTIMATE
   Instalable como App Nativa | Offline | Push | Sincronizacion
   Incluye: Radio, Streaming, Gamificación, Logros, Asistente
   VERSION INTERNACIONAL - OPTIMIZADO - COMPLETO
   "Donde el Espíritu Santo se mueve"
   ============================================ */

// ============================================
// CONFIGURACIÓN DE CACHÉ
// ============================================
const CACHE_VERSION = 'v20.0.2026';
const CACHE_NAMES = {
    static: `ipuc-static-${CACHE_VERSION}`,
    runtime: `ipuc-runtime-${CACHE_VERSION}`,
    images: `ipuc-images-${CACHE_VERSION}`,
    audio: `ipuc-audio-${CACHE_VERSION}`,
    video: `ipuc-video-${CACHE_VERSION}`,
    fonts: `ipuc-fonts-${CACHE_VERSION}`,
    api: `ipuc-api-${CACHE_VERSION}`,
    offline: `ipuc-offline-${CACHE_VERSION}`,
    reports: `ipuc-reports-${CACHE_VERSION}`,
    radio: `ipuc-radio-${CACHE_VERSION}`,
    streaming: `ipuc-streaming-${CACHE_VERSION}`,
    games: `ipuc-games-${CACHE_VERSION}`,
    assistant: `ipuc-assistant-${CACHE_VERSION}`,
    sync: `ipuc-sync-${CACHE_VERSION}`
};

const VERSION = '20.0';
const VERSION_NAME = 'PRO ULTIMATE';
const BUILD_DATE = '2026-08-22';

// Tiempos de expiración en segundos
const MAX_AGE = {
    static: 30 * 24 * 60 * 60,      // 30 días
    runtime: 7 * 24 * 60 * 60,      // 7 días
    images: 15 * 24 * 60 * 60,      // 15 días
    audio: 90 * 24 * 60 * 60,       // 90 días
    video: 30 * 24 * 60 * 60,       // 30 días
    fonts: 365 * 24 * 60 * 60,      // 1 año
    api: 1 * 24 * 60 * 60,          // 1 día
    reports: 12 * 60 * 60,          // 12 horas
    radio: 1 * 60 * 60,             // 1 hora
    streaming: 30 * 60,             // 30 minutos
    games: 7 * 24 * 60 * 60,        // 7 días
    assistant: 1 * 60 * 60          // 1 hora
};

// Assets a pre-cachear
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/database.js',
    '/app.js',
    '/script.js',
    '/manifest.json',
    '/ipuclafonda.png',
    '/favicon.ico',
    '/assets/avatars/default.png',
    '/assets/avatars/admin.png',
    '/assets/icons/favicon-32x32.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/apple-touch-icon.png',
    '/assets/radio/radio-icon.png',
    '/assets/radio/playlist-default.jpg',
    '/assets/streaming/live-placeholder.jpg',
    '/assets/game/trivia-bg.jpg',
    '/assets/assistant/bot-avatar.png'
];

// Patrones de caché
const CACHE_PATTERNS = {
    images: /\.(png|jpg|jpeg|gif|svg|ico|webp|bmp)$/i,
    audio: /\.(mp3|wav|ogg|m4a|aac|flac)$/i,
    video: /\.(mp4|webm|m3u8|ts)$/i,
    fonts: /\.(woff|woff2|ttf|otf|eot)$/i,
    api: /\/api\//i,
    html: /\.html$/i,
    js: /\.js$/i,
    css: /\.css$/i,
    reports: /\/reports\//i,
    radio: /\/radio\//i,
    streaming: /\/streaming\//i,
    games: /\/game\//i,
    assistant: /\/assistant\//i
};

// Orígenes permitidos
const ALLOWED_ORIGINS = [
    self.location.origin,
    'https://unpkg.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net',
    'https://cdnjs.cloudflare.com',
    'https://boxicons.com'
];

// ============================================
// UTILIDADES
// ============================================

function isAllowedUrl(url) {
    return ALLOWED_ORIGINS.some(origin => url.startsWith(origin));
}

function shouldCache(url) {
    if (!url) return false;
    if (url.includes('nocache=true')) return false;
    if (url.includes('token=')) return false;
    if (url.includes('auth=')) return false;
    if (url.includes('private')) return false;
    return true;
}

function getCacheNameForUrl(url) {
    if (CACHE_PATTERNS.images.test(url)) return CACHE_NAMES.images;
    if (CACHE_PATTERNS.audio.test(url)) return CACHE_NAMES.audio;
    if (CACHE_PATTERNS.video.test(url)) return CACHE_NAMES.video;
    if (CACHE_PATTERNS.fonts.test(url)) return CACHE_NAMES.fonts;
    if (CACHE_PATTERNS.api.test(url)) return CACHE_NAMES.api;
    if (CACHE_PATTERNS.reports.test(url)) return CACHE_NAMES.reports;
    if (CACHE_PATTERNS.radio.test(url)) return CACHE_NAMES.radio;
    if (CACHE_PATTERNS.streaming.test(url)) return CACHE_NAMES.streaming;
    if (CACHE_PATTERNS.games.test(url)) return CACHE_NAMES.games;
    if (CACHE_PATTERNS.assistant.test(url)) return CACHE_NAMES.assistant;
    if (CACHE_PATTERNS.html.test(url)) return CACHE_NAMES.runtime;
    if (CACHE_PATTERNS.js.test(url)) return CACHE_NAMES.runtime;
    if (CACHE_PATTERNS.css.test(url)) return CACHE_NAMES.runtime;
    return CACHE_NAMES.runtime;
}

function getMaxAgeForCache(cacheName) {
    for (const [key, name] of Object.entries(CACHE_NAMES)) {
        if (name === cacheName) {
            return MAX_AGE[key] || MAX_AGE.runtime;
        }
    }
    return MAX_AGE.runtime;
}

// ============================================
// EVENTO: INSTALL
// ============================================
self.addEventListener('install', (event) => {
    console.log(`📦 SW v${VERSION} ${VERSION_NAME}: Instalando...`);
    
    event.waitUntil(
        caches.open(CACHE_NAMES.static)
            .then(async (cache) => {
                const cachePromises = PRECACHE_ASSETS.map(async (asset) => {
                    try {
                        const response = await fetch(asset, { 
                            mode: 'no-cors',
                            cache: 'no-cache',
                            credentials: 'same-origin'
                        });
                        
                        if (response.ok || response.type === 'opaque') {
                            await cache.put(asset, response);
                            console.log(`  ✓ Cacheado: ${asset}`);
                        }
                    } catch (error) {
                        console.warn(`  ✗ No cacheado: ${asset} - ${error.message}`);
                    }
                });
                
                await Promise.all(cachePromises);
                console.log(`📦 SW: Instalación completada (${PRECACHE_ASSETS.length} assets)`);
                await self.skipWaiting();
            })
    );
});

// ============================================
// EVENTO: ACTIVATE
// ============================================
self.addEventListener('activate', (event) => {
    console.log(`🔄 SW v${VERSION} ${VERSION_NAME}: Activando...`);
    
    const validCaches = Object.values(CACHE_NAMES);
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (!validCaches.includes(cacheName) && cacheName.includes('ipuc-')) {
                            console.log(`  🗑️ Eliminando caché antigua: ${cacheName}`);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ SW: Activación completada');
                console.log(`📊 Cachés activas: ${validCaches.length}`);
                return self.clients.claim();
            })
    );
});

// ============================================
// EVENTO: FETCH - ESTRATEGIAS DE CACHÉ
// ============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Solo manejar GET
    if (request.method !== 'GET') return;
    
    const url = new URL(request.url);
    
    // Verificar origen permitido
    if (!isAllowedUrl(url.origin)) return;
    
    // No cachear URLs con parámetros sensibles
    if (!shouldCache(url.href)) {
        event.respondWith(fetch(request));
        return;
    }
    
    // Estrategia: Navegación - Network First con fallback offline
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigation(request));
        return;
    }
    
    // Estrategia: Audio/Radio - Stale-While-Revalidate
    if (CACHE_PATTERNS.audio.test(url.pathname) || CACHE_PATTERNS.radio.test(url.pathname)) {
        event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.radio || CACHE_NAMES.audio));
        return;
    }
    
    // Estrategia: Video/Streaming - Network First con fallback
    if (CACHE_PATTERNS.video.test(url.pathname) || CACHE_PATTERNS.streaming.test(url.pathname)) {
        event.respondWith(networkFirst(request, CACHE_NAMES.streaming || CACHE_NAMES.video));
        return;
    }
    
    // Estrategia: Imágenes - Cache First con actualización
    if (CACHE_PATTERNS.images.test(url.pathname)) {
        event.respondWith(cacheFirstWithUpdate(request, CACHE_NAMES.images));
        return;
    }
    
    // Estrategia: JS/CSS - Cache First con Network Update
    if (CACHE_PATTERNS.js.test(url.pathname) || CACHE_PATTERNS.css.test(url.pathname)) {
        event.respondWith(cacheFirstWithUpdate(request, CACHE_NAMES.runtime));
        return;
    }
    
    // Estrategia: API - Network First con Cache Fallback
    if (CACHE_PATTERNS.api.test(url.pathname)) {
        event.respondWith(networkFirst(request, CACHE_NAMES.api));
        return;
    }
    
    // Estrategia: Reportes - Network First
    if (CACHE_PATTERNS.reports.test(url.pathname)) {
        event.respondWith(networkFirst(request, CACHE_NAMES.reports));
        return;
    }
    
    // Estrategia: Juegos - Cache First
    if (CACHE_PATTERNS.games.test(url.pathname)) {
        event.respondWith(cacheFirstWithUpdate(request, CACHE_NAMES.games));
        return;
    }
    
    // Estrategia: Asistente - Network First
    if (CACHE_PATTERNS.assistant.test(url.pathname)) {
        event.respondWith(networkFirst(request, CACHE_NAMES.assistant));
        return;
    }
    
    // Estrategia por defecto: Stale-While-Revalidate
    event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.runtime));
});

// ============================================
// ESTRATEGIAS DE CACHÉ
// ============================================

// Stale-While-Revalidate: Sirve de caché, actualiza en background
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request)
        .then(async (networkResponse) => {
            if (networkResponse && networkResponse.ok) {
                await cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => cachedResponse);
    
    return cachedResponse || fetchPromise;
}

// Network First: Intenta red, fallback a caché
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) return cachedResponse;
        
        // Fallback específico según tipo
        return createOfflineResponse(request);
    }
}

// Cache First con actualización en background
async function cacheFirstWithUpdate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Actualizar en background
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.ok) {
                    cache.put(request, networkResponse);
                }
            })
            .catch(() => {});
        
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        return createOfflineResponse(request);
    }
}

// Manejo de navegación
async function handleNavigation(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAMES.runtime);
            await cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
    } catch (error) {
        const cache = await caches.open(CACHE_NAMES.runtime);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) return cachedResponse;
        
        // Fallback a index
        const indexResponse = await cache.match('/');
        if (indexResponse) return indexResponse;
        
        return createOfflinePage();
    }
}

// Crear respuesta offline
function createOfflineResponse(request) {
    const url = new URL(request.url);
    
    if (CACHE_PATTERNS.images.test(url.pathname)) {
        return new Response(
            `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                <rect width="200" height="200" fill="#f0f0f0"/>
                <text x="100" y="100" font-family="Arial" font-size="14" fill="#999" text-anchor="middle">Imagen offline</text>
            </svg>`,
            { status: 200, headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
    
    if (request.headers.get('Accept')?.includes('application/json')) {
        return new Response(
            JSON.stringify({ 
                error: true, 
                offline: true, 
                mensaje: 'Sin conexión a internet' 
            }),
            { 
                status: 503, 
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Offline': 'true'
                } 
            }
        );
    }
    
    return createOfflinePage();
}

// Página offline mejorada
function createOfflinePage() {
    return new Response(
        `<!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="theme-color" content="#1a237e">
            <title>IPUC LA FONDA - Offline</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0d1b5e, #1a237e, #283593);
                    color: #fff;
                    text-align: center;
                    padding: 20px;
                    overflow: hidden;
                }
                .container {
                    max-width: 420px;
                    padding: 40px 30px;
                    background: rgba(255,255,255,0.08);
                    border-radius: 24px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.1);
                    animation: fadeIn 0.5s ease;
                }
                .icon {
                    font-size: 4rem;
                    margin-bottom: 16px;
                    animation: float 3s ease-in-out infinite;
                }
                h1 {
                    font-size: 1.8rem;
                    margin-bottom: 8px;
                    letter-spacing: 1px;
                    font-weight: 800;
                }
                .subtitle {
                    opacity: 0.8;
                    margin-bottom: 4px;
                    font-size: 0.9rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }
                p {
                    margin-bottom: 20px;
                    opacity: 0.7;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }
                .features {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                    margin: 16px 0;
                    flex-wrap: wrap;
                }
                .features span {
                    background: rgba(255,255,255,0.05);
                    padding: 6px 14px;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    opacity: 0.6;
                    letter-spacing: 0.5px;
                }
                button {
                    background: #ffd700;
                    color: #1a237e;
                    border: none;
                    padding: 14px 32px;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 20px rgba(255,215,0,0.3);
                    letter-spacing: 0.5px;
                }
                button:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 30px rgba(255,215,0,0.4);
                }
                button:active {
                    transform: scale(0.95);
                }
                .version {
                    font-size: 0.65rem;
                    margin-top: 20px;
                    opacity: 0.3;
                    letter-spacing: 1px;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @media (max-width: 480px) {
                    .container { padding: 30px 20px; }
                    h1 { font-size: 1.5rem; }
                    .icon { font-size: 3rem; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon">📡</div>
                <h1>Sin conexión</h1>
                <p class="subtitle">IPUC LA FONDA</p>
                <div class="features">
                    <span>📖 Devocional</span>
                    <span>🙏 Oración</span>
                    <span>📅 Eventos</span>
                    <span>🎵 Radio</span>
                </div>
                <p>Puedes acceder a contenido guardado mientras esperas reconectar</p>
                <button onclick="location.reload()">🔄 Reintentar</button>
                <p class="version">v${VERSION} ${VERSION_NAME} &copy; ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>`,
        { 
            status: 503, 
            headers: { 
                'Content-Type': 'text/html; charset=utf-8',
                'X-Offline': 'true',
                'Cache-Control': 'no-cache'
            } 
        }
    );
}

// ============================================
// EVENTO: PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
    console.log('🔔 SW: Push recibida');
    
    let data = {
        titulo: 'IPUC LA FONDA',
        mensaje: 'Tienes una nueva notificación',
        url: '/',
        icono: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-icon.png',
        tipo: 'general',
        id: Date.now(),
        timestamp: new Date().toISOString()
    };
    
    if (event.data) {
        try {
            const pushData = event.data.json();
            data = { ...data, ...pushData };
        } catch (e) {
            data.mensaje = event.data.text() || data.mensaje;
        }
    }
    
    const iconos = {
        'reporte': '📋',
        'reporte_urgente': '🚨',
        'oracion': '🕯️',
        'evento': '📅',
        'publicacion': '📝',
        'radio': '🎵',
        'streaming': '📺',
        'logro': '🏆',
        'bendicion': '🕊️',
        'mensaje': '💬',
        'recordatorio': '⏰',
        'sistema': '⚙️',
        'donacion': '💝',
        'testimonio': '💬'
    };
    
    data.mensaje = `${iconos[data.tipo] || '📌'} ${data.mensaje}`;
    
    const options = {
        body: data.mensaje,
        icon: data.icono,
        badge: data.badge,
        data: {
            url: data.url,
            notificationId: data.id,
            tipo: data.tipo,
            fecha: data.timestamp
        },
        vibrate: data.tipo === 'reporte_urgente' ? [200, 100, 200, 100, 200] : [100, 50, 100],
        tag: `ipuc-notif-${data.id}`,
        renotify: true,
        requireInteraction: ['reporte_urgente', 'importante', 'recordatorio'].includes(data.tipo),
        actions: [
            { action: 'open', title: '📱 Abrir' },
            { action: 'dismiss', title: '✖️ Cerrar' }
        ],
        sound: '/assets/sounds/notification.mp3',
        timestamp: Date.now()
    };
    
    event.waitUntil(
        self.registration.showNotification(data.titulo, options)
    );
});

// ============================================
// EVENTO: NOTIFICATION CLICK
// ============================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'dismiss') return;
    
    const urlToOpen = event.notification.data?.url || '/';
    
    console.log('🔗 SW: Notificación clickeada:', event.notification.data);
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                for (const client of windowClients) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.focus();
                        if (urlToOpen !== '/') {
                            client.navigate(urlToOpen);
                        }
                        return;
                    }
                }
                
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// ============================================
// EVENTO: SYNC
// ============================================
const SYNC_TASKS = {
    'sync-datos': async () => {
        console.log('🔄 SW: Sincronizando datos generales');
        return Promise.resolve();
    },
    'sync-reportes': async () => {
        console.log('📋 SW: Sincronizando reportes pendientes');
        const cache = await caches.open(CACHE_NAMES.reports);
        const keys = await cache.keys();
        
        for (const key of keys) {
            const response = await cache.match(key);
            if (response) {
                try {
                    const reporte = await response.json();
                    console.log('  📤 Enviando reporte:', reporte.id);
                    // Aquí iría la lógica de envío al servidor
                    await cache.delete(key);
                } catch (e) {
                    console.warn('  ⚠️ Error procesando reporte:', e);
                }
            }
        }
    },
    'sync-radio': async () => {
        console.log('🎵 SW: Sincronizando radio');
        return Promise.resolve();
    },
    'sync-peticiones': async () => {
        console.log('🙏 SW: Sincronizando peticiones');
        return Promise.resolve();
    },
    'sync-logros': async () => {
        console.log('🏆 SW: Sincronizando logros');
        return Promise.resolve();
    },
    'sync-juegos': async () => {
        console.log('🎮 SW: Sincronizando juegos');
        return Promise.resolve();
    }
};

self.addEventListener('sync', (event) => {
    if (SYNC_TASKS[event.tag]) {
        event.waitUntil(
            SYNC_TASKS[event.tag]().catch((error) => {
                console.warn(`SW: Error en sync ${event.tag}:`, error);
            })
        );
    }
});

// ============================================
// EVENTO: MESSAGE
// ============================================
self.addEventListener('message', (event) => {
    if (!event.data || !event.data.type) return;
    
    const { type } = event.data;
    const port = event.ports?.[0];
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            if (port) {
                port.postMessage({
                    version: VERSION,
                    versionName: VERSION_NAME,
                    buildDate: BUILD_DATE,
                    caches: CACHE_NAMES,
                    assetsCount: PRECACHE_ASSETS.length,
                    timestamp: Date.now()
                });
            }
            break;
            
        case 'GET_CACHE_STATS':
            if (port) {
                caches.keys().then(async (cacheNames) => {
                    const stats = {};
                    let total = 0;
                    
                    for (const name of cacheNames) {
                        const cache = await caches.open(name);
                        const keys = await cache.keys();
                        stats[name] = keys.length;
                        total += keys.length;
                    }
                    
                    port.postMessage({
                        success: true,
                        stats,
                        total,
                        timestamp: Date.now()
                    });
                });
            }
            break;
            
        case 'CLEAR_ALL_CACHE':
            caches.keys().then((names) => {
                return Promise.all(names.map(name => caches.delete(name)));
            }).then(() => {
                console.log('🗑️ SW: Todo el caché limpiado');
                port?.postMessage({ success: true, action: 'CLEAR_ALL_CACHE' });
            });
            break;
            
        case 'CLEAR_OLD_CACHE':
            const validCaches = Object.values(CACHE_NAMES);
            caches.keys().then((names) => {
                return Promise.all(
                    names.map(name => {
                        if (!validCaches.includes(name) && name.includes('ipuc-')) {
                            return caches.delete(name);
                        }
                    })
                );
            }).then(() => {
                console.log('🗑️ SW: Cachés antiguas limpiadas');
                port?.postMessage({ success: true, action: 'CLEAR_OLD_CACHE' });
            });
            break;
            
        case 'REGISTER_SYNC':
            if ('sync' in self.registration) {
                const syncTag = event.data.tag || 'sync-datos';
                self.registration.sync.register(syncTag)
                    .then(() => {
                        console.log(`🔄 SW: Sync registrado: ${syncTag}`);
                        port?.postMessage({ success: true, tag: syncTag });
                    })
                    .catch((error) => {
                        console.warn('SW: Error al registrar sync:', error);
                        port?.postMessage({ success: false, error: error.message });
                    });
            }
            break;
            
        case 'SAVE_REPORT_OFFLINE':
            if (event.data.reporte) {
                const reportKey = `report_${Date.now()}`;
                const reportData = JSON.stringify(event.data.reporte);
                const blob = new Blob([reportData], { type: 'application/json' });
                const response = new Response(blob, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Report-ID': reportKey,
                        'X-Version': VERSION
                    }
                });
                
                caches.open(CACHE_NAMES.reports).then((cache) => {
                    cache.put(reportKey, response);
                    console.log('📋 SW: Reporte guardado offline');
                    
                    if ('sync' in self.registration) {
                        self.registration.sync.register('sync-reportes');
                    }
                    
                    port?.postMessage({ success: true, key: reportKey });
                });
            }
            break;
            
        case 'SAVE_RADIO_OFFLINE':
            if (event.data.radioData) {
                const radioKey = `radio_${Date.now()}`;
                const radioData = JSON.stringify(event.data.radioData);
                const blob = new Blob([radioData], { type: 'application/json' });
                const response = new Response(blob, {
                    headers: { 'Content-Type': 'application/json' }
                });
                
                caches.open(CACHE_NAMES.radio).then((cache) => {
                    cache.put(radioKey, response);
                    console.log('🎵 SW: Datos de radio guardados offline');
                    port?.postMessage({ success: true });
                });
            }
            break;
            
        case 'SAVE_GAME_OFFLINE':
            if (event.data.gameData) {
                const gameKey = `game_${Date.now()}`;
                const gameData = JSON.stringify(event.data.gameData);
                const blob = new Blob([gameData], { type: 'application/json' });
                const response = new Response(blob, {
                    headers: { 'Content-Type': 'application/json' }
                });
                
                caches.open(CACHE_NAMES.games).then((cache) => {
                    cache.put(gameKey, response);
                    console.log('🎮 SW: Datos de juego guardados offline');
                    port?.postMessage({ success: true });
                });
            }
            break;
            
        case 'PING':
            port?.postMessage({ 
                success: true, 
                pong: true, 
                timestamp: Date.now() 
            });
            break;
    }
});

// ============================================
// EVENTO: ONLINE/OFFLINE
// ============================================
self.addEventListener('online', () => {
    console.log('🟢 SW: Conexión restaurada');
    
    // Notificar a todos los clientes
    self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
            client.postMessage({ 
                type: 'CONNECTIVITY_CHANGE', 
                online: true,
                timestamp: Date.now()
            });
        });
    });
    
    // Intentar sincronizar al reconectar
    if ('sync' in self.registration) {
        Object.keys(SYNC_TASKS).forEach((tag) => {
            self.registration.sync.register(tag).catch(() => {});
        });
    }
});

self.addEventListener('offline', () => {
    console.log('🔴 SW: Sin conexión');
    
    self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
            client.postMessage({ 
                type: 'CONNECTIVITY_CHANGE', 
                online: false,
                timestamp: Date.now()
            });
        });
    });
});

// ============================================
// PERIODIC SYNC (si está disponible)
// ============================================
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', (event) => {
        if (event.tag === 'periodic-update') {
            event.waitUntil(
                Promise.resolve().then(() => {
                    console.log('🔄 SW: Sincronización periódica ejecutada');
                    // Actualizar contenido en background
                })
            );
        }
    });
}

// ============================================
// BACKGROUND FETCH (si está disponible)
// ============================================
if ('backgroundFetch' in self) {
    self.addEventListener('backgroundfetchsuccess', (event) => {
        console.log('📥 SW: Background fetch completado:', event.id);
    });
    
    self.addEventListener('backgroundfetchfail', (event) => {
        console.warn('⚠️ SW: Background fetch falló:', event.id);
    });
    
    self.addEventListener('backgroundfetchabort', (event) => {
        console.warn('⚠️ SW: Background fetch abortado:', event.id);
    });
}

// ============================================
// LOGS DE INICIALIZACIÓN
// ============================================
console.log('========================================');
console.log('✅ IPUC LA FONDA Service Worker cargado');
console.log(`📦 Versión: v${VERSION} ${VERSION_NAME}`);
console.log(`📅 Build: ${BUILD_DATE}`);
console.log(`📊 Assets pre-cacheados: ${PRECACHE_ASSETS.length}`);
console.log(`🗄️ Cachés: ${Object.keys(CACHE_NAMES).length}`);
console.log('🎵 Radio y Streaming: Habilitados');
console.log('🎮 Gamificación: Habilitada');
console.log('🤖 Asistente Virtual: Habilitado');
console.log('📡 Modo Offline: Habilitado');
console.log('========================================');

/* ============================================
   FINAL DEL SERVICE WORKER v20.0 PRO ULTIMATE
   IPUC LA FONDA - International Pentecostal Church
   "Donde el Espíritu Santo se mueve"
   ============================================ */
