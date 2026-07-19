// ============================================
// IPUC LA FONDA - SERVICE WORKER PWA v15.0 PRO ULTIMATE
// Instalable como App Nativa | Offline | Push | Sincronización
// VERSIÓN INTERNACIONAL - OPTIMIZADO - COMPLETO
// "Where the Holy Spirit moves"
// ============================================

const CACHE_NAME = 'ipuc-la-fonda-v15.0';
const RUNTIME_CACHE = 'ipuc-runtime-v15.0';
const IMAGE_CACHE = 'ipuc-images-v15.0';
const API_CACHE = 'ipuc-api-v15.0';
const OFFLINE_CACHE = 'ipuc-offline-v15.0';
const AUDIO_CACHE = 'ipuc-audio-v15.0';
const VIDEO_CACHE = 'ipuc-video-v15.0';
const FONT_CACHE = 'ipuc-fonts-v15.0';

const VERSION = '15.0';
const MAX_AGE = 30 * 24 * 60 * 60; // 30 días en segundos
const MAX_IMAGE_AGE = 7 * 24 * 60 * 60; // 7 días para imágenes
const MAX_AUDIO_AGE = 90 * 24 * 60 * 60; // 90 días para audio
const MAX_VIDEO_AGE = 30 * 24 * 60 * 60; // 30 días para video

// ============================================
// ASSETS A PRECACHEAR - VERSIÓN COMPLETA
// ============================================
const PRECACHE_ASSETS = [
    // HTML
    '/',
    '/index.html',
    
    // CSS
    '/styles.css',
    
    // JavaScript
    '/database.js',
    '/app.js',
    '/script.js',
    
    // PWA
    '/manifest.json',
    '/service-worker.js',
    '/browserconfig.xml',
    
    // Imágenes principales
    '/ipuclafonda.png',
    '/favicon.ico',
    
    // Avatares
    '/assets/avatars/default.png',
    '/assets/avatars/admin.png',
    '/assets/avatars/user.png',
    
    // Iconos
    '/assets/icons/favicon-16x16.png',
    '/assets/icons/favicon-32x32.png',
    '/assets/icons/icon-48x48.png',
    '/assets/icons/icon-72x72.png',
    '/assets/icons/icon-96x96.png',
    '/assets/icons/icon-128x128.png',
    '/assets/icons/icon-144x144.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-256x256.png',
    '/assets/icons/icon-384x384.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/apple-touch-icon.png',
    '/assets/icons/safari-pinned-tab.svg',
    '/assets/icons/maskable-icon.png',
    '/assets/icons/badge-icon.png',
    '/assets/icons/monochrome-icon.svg',
    
    // Splash screens
    '/assets/splash/light-splash.png',
    '/assets/splash/dark-splash.png',
    
    // Sonidos de notificación
    '/assets/sounds/notification.mp3',
    '/assets/sounds/amen.mp3',
    '/assets/sounds/bell.mp3'
];

// ============================================
// PATRONES DE CACHÉ
// ============================================
const CACHE_PATTERNS = {
    images: [
        /\.(png|jpg|jpeg|gif|svg|ico|webp|bmp|tiff)$/i,
        /\/assets\/(images|img|icons|avatars|splash)\//i,
        /\/api\/image\//i
    ],
    audio: [
        /\.(mp3|wav|ogg|m4a|flac|aac)$/i,
        /\/assets\/audio\//i,
        /\/api\/audio\//i
    ],
    video: [
        /\.(mp4|webm|ogg|mov|avi|mkv)$/i,
        /\/assets\/video\//i,
        /\/api\/video\//i
    ],
    fonts: [
        /\.(woff|woff2|ttf|otf|eot)$/i,
        /\/fonts\//i,
        /\/assets\/fonts\//i
    ],
    api: [
        /\/api\//i,
        /\?api=/i,
        /\/data\//i
    ],
    html: [
        /\.html$/i,
        /\/(page|view|section|module)\//i
    ],
    js: [
        /\.js$/i,
        /\/(app|database|script|bundle)\//i
    ],
    css: [
        /\.css$/i,
        /\/(styles|css|theme)\//i
    ]
};

// ============================================
// UTILIDADES
// ============================================
function shouldCache(url) {
    if (!url) return false;
    if (url.includes('nocache=true') || url.includes('_=')) return false;
    if (url.includes('/admin/') && !url.includes('/admin/login')) return false;
    if (url.includes('/logout') || url.includes('/login')) return true;
    return true;
}

function matchPattern(url, patterns) {
    return patterns.some(pattern => {
        if (typeof pattern === 'string') {
            return url.includes(pattern);
        }
        if (pattern instanceof RegExp) {
            return pattern.test(url);
        }
        return false;
    });
}

function getCacheForRequest(url) {
    if (matchPattern(url, CACHE_PATTERNS.images)) return IMAGE_CACHE;
    if (matchPattern(url, CACHE_PATTERNS.audio)) return AUDIO_CACHE;
    if (matchPattern(url, CACHE_PATTERNS.video)) return VIDEO_CACHE;
    if (matchPattern(url, CACHE_PATTERNS.fonts)) return FONT_CACHE;
    if (matchPattern(url, CACHE_PATTERNS.api)) return API_CACHE;
    if (matchPattern(url, CACHE_PATTERNS.html)) return RUNTIME_CACHE;
    if (matchPattern(url, CACHE_PATTERNS.js)) return RUNTIME_CACHE;
    if (matchPattern(url, CACHE_PATTERNS.css)) return RUNTIME_CACHE;
    return RUNTIME_CACHE;
}

function getMaxAgeForCache(cacheName) {
    switch (cacheName) {
        case IMAGE_CACHE: return MAX_IMAGE_AGE;
        case AUDIO_CACHE: return MAX_AUDIO_AGE;
        case VIDEO_CACHE: return MAX_VIDEO_AGE;
        case FONT_CACHE: return MAX_AGE;
        case API_CACHE: return 60; // 1 minuto para APIs
        default: return MAX_AGE;
    }
}

// ============================================
// INSTALACIÓN
// ============================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                const results = [];
                const total = PRECACHE_ASSETS.length;
                let completed = 0;
                
                for (const url of PRECACHE_ASSETS) {
                    try {
                        const response = await fetch(url, { 
                            mode: 'no-cors', 
                            cache: 'no-cache',
                            headers: { 
                                'Cache-Control': 'no-cache',
                                'Pragma': 'no-cache'
                            }
                        });
                        
                        if (response && (response.status === 200 || response.type === 'opaque')) {
                            await cache.put(url, response);
                            results.push({ url, success: true });
                        } else {
                            results.push({ url, success: false, status: response?.status });
                        }
                    } catch (error) {
                        results.push({ url, success: false, error: error.message });
                    }
                    
                    completed++;
                    // Notificar progreso cada 10%
                    if (completed % Math.ceil(total / 10) === 0 || completed === total) {
                        const clients = await self.clients.matchAll({ type: 'window' });
                        for (const client of clients) {
                            try {
                                client.postMessage({
                                    type: 'SW_INSTALL_PROGRESS',
                                    progress: Math.round((completed / total) * 100),
                                    total,
                                    completed
                                });
                            } catch {}
                        }
                    }
                }
                
                const failed = results.filter(r => !r.success);
                if (failed.length > 0) {
                    console.warn(`SW: ${failed.length} assets failed to cache`);
                }
                
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('SW: Install error', error);
                return self.skipWaiting();
            })
    );
});

// ============================================
// ACTIVACIÓN
// ============================================
self.addEventListener('activate', (event) => {
    const CURRENT_CACHES = [
        CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, 
        API_CACHE, OFFLINE_CACHE, AUDIO_CACHE, 
        VIDEO_CACHE, FONT_CACHE
    ];

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (!CURRENT_CACHES.includes(cacheName)) {
                            return caches.delete(cacheName)
                                .then(() => {
                                    console.log(`SW: Cache eliminado: ${cacheName}`);
                                })
                                .catch(() => {});
                        }
                    })
                );
            })
            .then(async () => {
                // Crear cachés necesarios
                for (const cache of CURRENT_CACHES) {
                    try {
                        await caches.open(cache);
                    } catch {}
                }
                
                // Notificar a clientes
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
                            cacheName: CACHE_NAME,
                            caches: CURRENT_CACHES
                        });
                    } catch {}
                }
                return self.clients.claim();
            })
            .then(() => {
                console.log(`SW: Activado v${VERSION}`);
            })
            .catch((error) => {
                console.error('SW: Activation error', error);
            })
    );
});

// ============================================
// FETCH - ESTRATEGIAS DE CACHÉ AVANZADAS
// ============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    const { pathname, origin, search } = url;

    // No interceptar solicitudes a otros orígenes (excepto CDNs)
    if (origin !== self.location.origin && 
        !url.href.includes('unpkg.com') && 
        !url.href.includes('fonts.googleapis.com') &&
        !url.href.includes('fonts.gstatic.com') &&
        !url.href.includes('boxicons.com')) {
        return;
    }

    // No interceptar solicitudes de sistema
    if (pathname.includes('/admin/') && !pathname.includes('/admin/login')) {
        return;
    }

    // ============================================
    // 1. IMÁGENES: Cache First + Stale-While-Revalidate
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.images)) {
        event.respondWith(
            caches.open(IMAGE_CACHE).then(async (cache) => {
                const cached = await cache.match(request);
                if (cached) {
                    const cacheTime = cached.headers.get('x-cache-time');
                    if (cacheTime && (Date.now() - parseInt(cacheTime)) < (MAX_IMAGE_AGE * 1000)) {
                        // Devolver caché y actualizar en segundo plano
                        fetch(request).then(async (response) => {
                            if (response && response.ok) {
                                const headers = new Headers(response.headers);
                                headers.set('x-cache-time', Date.now().toString());
                                const responseToCache = new Response(response.body, {
                                    status: response.status,
                                    statusText: response.statusText,
                                    headers: headers
                                });
                                await cache.put(request, responseToCache);
                            }
                        }).catch(() => {});
                        return cached;
                    }
                }
                
                try {
                    const networkResponse = await fetch(request);
                    if (networkResponse && networkResponse.ok) {
                        const headers = new Headers(networkResponse.headers);
                        headers.set('x-cache-time', Date.now().toString());
                        const responseToCache = new Response(networkResponse.body, {
                            status: networkResponse.status,
                            statusText: networkResponse.statusText,
                            headers: headers
                        });
                        await cache.put(request, responseToCache.clone());
                        return responseToCache;
                    }
                    throw new Error('Network response no válida');
                } catch {
                    if (cached) return cached;
                    // Fallback a imagen por defecto
                    return caches.match('/assets/icons/icon-192x192.png') || 
                           new Response('', { status: 404 });
                }
            })
        );
        return;
    }

    // ============================================
    // 2. AUDIO: Cache First (música, podcast)
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.audio)) {
        event.respondWith(
            caches.open(AUDIO_CACHE).then(async (cache) => {
                const cached = await cache.match(request);
                if (cached) {
                    const cacheTime = cached.headers.get('x-cache-time');
                    if (cacheTime && (Date.now() - parseInt(cacheTime)) < (MAX_AUDIO_AGE * 1000)) {
                        return cached;
                    }
                }
                try {
                    const response = await fetch(request);
                    if (response && response.ok) {
                        const headers = new Headers(response.headers);
                        headers.set('x-cache-time', Date.now().toString());
                        const responseToCache = new Response(response.body, {
                            status: response.status,
                            statusText: response.statusText,
                            headers: headers
                        });
                        await cache.put(request, responseToCache.clone());
                        return responseToCache;
                    }
                } catch {}
                return cached || new Response('', { status: 404 });
            })
        );
        return;
    }

    // ============================================
    // 3. VIDEO: Cache First
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.video)) {
        event.respondWith(
            caches.open(VIDEO_CACHE).then(async (cache) => {
                const cached = await cache.match(request);
                if (cached) {
                    const cacheTime = cached.headers.get('x-cache-time');
                    if (cacheTime && (Date.now() - parseInt(cacheTime)) < (MAX_VIDEO_AGE * 1000)) {
                        return cached;
                    }
                }
                try {
                    const response = await fetch(request);
                    if (response && response.ok) {
                        const headers = new Headers(response.headers);
                        headers.set('x-cache-time', Date.now().toString());
                        const responseToCache = new Response(response.body, {
                            status: response.status,
                            statusText: response.statusText,
                            headers: headers
                        });
                        await cache.put(request, responseToCache.clone());
                        return responseToCache;
                    }
                } catch {}
                return cached || new Response('', { status: 404 });
            })
        );
        return;
    }

    // ============================================
    // 4. FUENTES: Cache First + Stale-While-Revalidate
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.fonts)) {
        event.respondWith(
            caches.open(FONT_CACHE).then(async (cache) => {
                const cached = await cache.match(request);
                if (cached) {
                    fetch(request).then(async (response) => {
                        if (response && response.ok) {
                            await cache.put(request, response);
                        }
                    }).catch(() => {});
                    return cached;
                }
                try {
                    const response = await fetch(request);
                    if (response && response.ok) {
                        await cache.put(request, response.clone());
                        return response;
                    }
                } catch {}
                return cached || new Response('', { status: 404 });
            })
        );
        return;
    }

    // ============================================
    // 5. APIs: Network First + Cache Fallback
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.api)) {
        event.respondWith(
            fetch(request)
                .then(async (response) => {
                    if (response && response.ok) {
                        const cache = await caches.open(API_CACHE);
                        const responseToCache = response.clone();
                        cache.put(request, responseToCache);
                        return response;
                    }
                    throw new Error('Network response no válida');
                })
                .catch(async () => {
                    const cached = await caches.match(request);
                    if (cached) return cached;
                    return new Response(
                        JSON.stringify({
                            error: true,
                            mensaje: 'Sin conexión a internet',
                            offline: true,
                            timestamp: Date.now(),
                            version: VERSION
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
    // 6. HTML / NAVEGACIÓN: Network First + Cache Fallback
    // ============================================
    if (request.mode === 'navigate' || matchPattern(pathname, CACHE_PATTERNS.html)) {
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
                    
                    // Página offline personalizada
                    return new Response(
                        `<!DOCTYPE html>
                        <html lang="es-CO">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <meta name="theme-color" content="#1a237e">
                            <title>IPUC LA FONDA - Offline</title>
                            <style>
                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                body { 
                                    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    min-block-size: 100vh;
                                    background: linear-gradient(135deg, #0d1b5e, #1a237e, #283593);
                                    color: #ffffff;
                                    text-align: center;
                                    padding: 20px;
                                }
                                .offline-container { max-inline-size: 400px; padding: 30px; background: rgba(255,255,255,0.05); border-radius: 24px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
                                .offline-icon { font-size: 4rem; margin-block-end: 16px; opacity: 0.6; }
                                .offline-title { font-size: 1.8rem; font-weight: 700; margin-block-end: 8px; }
                                .offline-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-block-end: 8px; }
                                .offline-text { color: rgba(255,255,255,0.6); margin-block-end: 24px; line-height: 1.6; font-size: 0.95rem; }
                                .offline-actions { display: flex; flex-direction: column; gap: 10px; }
                                .btn-retry {
                                    background: #ffd700;
                                    color: #1a237e;
                                    border: none;
                                    padding: 12px 24px;
                                    border-radius: 12px;
                                    font-size: 1rem;
                                    font-weight: 600;
                                    cursor: pointer;
                                    transition: all 0.3s ease;
                                    font-family: inherit;
                                }
                                .btn-retry:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3); }
                                .btn-offline {
                                    background: rgba(255,255,255,0.1);
                                    color: #ffffff;
                                    border: 1px solid rgba(255,255,255,0.15);
                                    padding: 10px 24px;
                                    border-radius: 12px;
                                    font-size: 0.9rem;
                                    cursor: pointer;
                                    transition: all 0.3s ease;
                                    font-family: inherit;
                                }
                                .btn-offline:hover { background: rgba(255,255,255,0.15); }
                                .offline-version { margin-block-start: 16px; font-size: 0.7rem; color: rgba(255,255,255,0.3); }
                                .offline-pulse { animation: pulse 2s ease-in-out infinite; }
                                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                                @media (max-inline-size: 480px) {
                                    .offline-container { padding: 20px; }
                                    .offline-title { font-size: 1.4rem; }
                                    .offline-icon { font-size: 3rem; }
                                }
                            </style>
                            <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">
                        </head>
                        <body>
                            <div class="offline-container">
                                <div class="offline-icon"><i class="bx bx-wifi-off"></i></div>
                                <h1 class="offline-title">Sin conexión</h1>
                                <p class="offline-subtitle">IPUC LA FONDA está en modo offline</p>
                                <p class="offline-text">Verifica tu conexión a internet para acceder a todo el contenido.</p>
                                <div class="offline-actions">
                                    <button class="btn-retry" onclick="location.reload()">
                                        <i class="bx bx-refresh"></i> Reintentar
                                    </button>
                                    <button class="btn-offline" onclick="document.querySelector('.offline-text').textContent = 'Estamos orando por ti. ¡Dios te bendiga! 🙏'">
                                        <i class="bx bx-pray"></i> Está bien, seguir offline
                                    </button>
                                </div>
                                <div class="offline-version">v${VERSION} &copy; 2026 IPUC LA FONDA</div>
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
    // 7. JS/CSS: Cache First + Update
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.js) || matchPattern(pathname, CACHE_PATTERNS.css)) {
        event.respondWith(
            caches.match(request).then(async (cached) => {
                const fetchPromise = fetch(request)
                    .then(async (response) => {
                        if (response && response.ok) {
                            const cache = await caches.open(RUNTIME_CACHE);
                            cache.put(request, response.clone());
                        }
                        return response;
                    })
                    .catch(() => cached);
                return cached || fetchPromise;
            })
        );
        return;
    }

    // ============================================
    // 8. RESTO: Network First + Cache Fallback
    // ============================================
    event.respondWith(
        fetch(request)
            .then(async (response) => {
                if (response && response.ok && shouldCache(pathname)) {
                    const cacheName = getCacheForRequest(pathname);
                    const cache = await caches.open(cacheName);
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
// PUSH NOTIFICATIONS PREMIUM
// ============================================
self.addEventListener('push', (event) => {
    let data = {
        titulo: 'IPUC LA FONDA',
        mensaje: 'Tienes una nueva notificación',
        url: '/',
        icono: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-icon.png',
        imagen: null,
        importante: false,
        tipo: 'general',
        id: Date.now(),
        timestamp: Date.now(),
        acciones: null,
        sonido: true,
        vibrar: true
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
        badge: data.badge || '/assets/icons/badge-icon.png',
        image: data.imagen || undefined,
        data: {
            url: data.url || '/',
            timestamp: data.timestamp || Date.now(),
            notificationId: data.id,
            tipo: data.tipo || 'general',
            fecha: new Date().toISOString()
        },
        vibrate: data.importante ? [200, 100, 200, 100, 200] : [100, 50, 100],
        silent: !(data.sonido !== false),
        actions: data.acciones || [
            { action: 'open', title: 'Ver', icon: '/assets/icons/icon-192x192.png' },
            { action: 'close', title: 'Cerrar', icon: '/assets/icons/icon-192x192.png' }
        ],
        tag: `ipuc-notif-${data.id}`,
        renotify: true,
        requireInteraction: data.importante || false,
        timestamp: data.timestamp || Date.now(),
        priority: data.importante ? 'high' : 'normal',
        data: { ...data, url: data.url },
        actions: [
            { action: 'open', title: 'Abrir', icon: '/assets/icons/icon-192x192.png' },
            { action: 'share', title: 'Compartir', icon: '/assets/icons/icon-192x192.png' },
            { action: 'close', title: 'Cerrar', icon: '/assets/icons/icon-192x192.png' }
        ]
    };
    
    // Personalizar según tipo
    switch (data.tipo) {
        case 'oracion':
            options.body = `🕯️ ${data.mensaje}`;
            options.actions = [
                { action: 'open', title: 'Orar', icon: '/assets/icons/icon-192x192.png' },
                { action: 'close', title: 'Cerrar', icon: '/assets/icons/icon-192x192.png' }
            ];
            break;
        case 'evento':
            options.body = `📅 ${data.mensaje}`;
            options.actions = [
                { action: 'open', title: 'Confirmar', icon: '/assets/icons/icon-192x192.png' },
                { action: 'close', title: 'Cerrar', icon: '/assets/icons/icon-192x192.png' }
            ];
            break;
        case 'publicacion':
            options.body = `📝 ${data.mensaje}`;
            options.actions = [
                { action: 'open', title: 'Ver', icon: '/assets/icons/icon-192x192.png' },
                { action: 'close', title: 'Cerrar', icon: '/assets/icons/icon-192x192.png' }
            ];
            break;
        case 'musica':
            options.body = `🎵 ${data.mensaje}`;
            options.actions = [
                { action: 'open', title: 'Escuchar', icon: '/assets/icons/icon-192x192.png' },
                { action: 'close', title: 'Cerrar', icon: '/assets/icons/icon-192x192.png' }
            ];
            break;
        case 'importante':
            options.requireInteraction = true;
            options.priority = 'high';
            break;
    }
    
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
    
    if (event.action === 'share') {
        const shareData = {
            title: 'IPUC LA FONDA',
            text: event.notification.body || 'Where the Holy Spirit moves',
            url: event.notification.data?.url || 'https://ipuclafonda.netlify.app/'
        };
        
        if (navigator.share) {
            navigator.share(shareData).catch(() => {});
        }
        return;
    }
    
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
                        data: { 
                            notificationId, 
                            tipo, 
                            url: urlToOpen, 
                            timestamp: Date.now(),
                            action: event.action || 'open'
                        }
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
                            data: { 
                                notificationId, 
                                tipo, 
                                url: urlToOpen, 
                                timestamp: Date.now(),
                                action: event.action || 'open'
                            }
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
        'sync-asistencia': async () => {
            await self._syncData('asistencia');
        },
        'sync-mensajes': async () => {
            await self._syncData('mensajes');
        },
        'sync-peticiones': async () => {
            await self._syncData('peticiones');
        },
        'sync-datos': async () => {
            await self._syncData('datos');
        },
        'sync-noticias': async () => {
            await self._syncData('noticias');
        },
        'sync-publicaciones': async () => {
            await self._syncData('publicaciones');
        },
        'sync-encuestas': async () => {
            await self._syncData('encuestas');
        },
        'sync-podcast': async () => {
            await self._syncData('podcast');
        },
        'sync-donaciones': async () => {
            await self._syncData('donaciones');
        },
        'sync-favoritos': async () => {
            await self._syncData('favoritos');
        }
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
    
    const responsePort = event.ports && event.ports[0] ? event.ports[0] : null;
    
    switch (event.data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting().then(() => {
                self.clients.matchAll({ type: 'window' }).then(clients => {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'SW_UPDATED',
                            version: VERSION,
                            timestamp: Date.now(),
                            cacheName: CACHE_NAME
                        });
                    });
                });
            });
            break;
            
        case 'CHECK_FOR_UPDATE':
            self.registration.update().catch(() => {});
            if (responsePort) {
                responsePort.postMessage({ 
                    success: true, 
                    message: 'Actualización verificada',
                    version: VERSION
                });
            }
            break;
            
        case 'GET_VERSION':
            if (responsePort) {
                responsePort.postMessage({
                    version: VERSION,
                    cache: CACHE_NAME,
                    timestamp: Date.now(),
                    assets: PRECACHE_ASSETS.length,
                    caches: {
                        runtime: RUNTIME_CACHE,
                        image: IMAGE_CACHE,
                        audio: AUDIO_CACHE,
                        video: VIDEO_CACHE,
                        font: FONT_CACHE,
                        api: API_CACHE,
                        offline: OFFLINE_CACHE
                    }
                });
            }
            break;
            
        case 'CLEAR_CACHE':
            caches.keys().then((names) => {
                return Promise.all(names.map((name) => caches.delete(name)));
            }).then(() => {
                if (responsePort) {
                    responsePort.postMessage({ 
                        success: true, 
                        message: 'Cache limpiado', 
                        timestamp: Date.now() 
                    });
                }
            }).catch((error) => {
                if (responsePort) {
                    responsePort.postMessage({ 
                        success: false, 
                        error: error.message 
                    });
                }
            });
            break;
            
        case 'CLEAR_CACHE_BY_NAME':
            if (event.data.cacheName) {
                caches.delete(event.data.cacheName).then((deleted) => {
                    if (responsePort) {
                        responsePort.postMessage({ 
                            success: deleted, 
                            cacheName: event.data.cacheName 
                        });
                    }
                }).catch((error) => {
                    if (responsePort) {
                        responsePort.postMessage({ 
                            success: false, 
                            error: error.message 
                        });
                    }
                });
            }
            break;
            
        case 'GET_CACHE_STATS':
            Promise.all([
                caches.open(CACHE_NAME).then((cache) => cache.keys()),
                caches.open(RUNTIME_CACHE).then((cache) => cache.keys()),
                caches.open(IMAGE_CACHE).then((cache) => cache.keys()),
                caches.open(AUDIO_CACHE).then((cache) => cache.keys()),
                caches.open(VIDEO_CACHE).then((cache) => cache.keys()),
                caches.open(FONT_CACHE).then((cache) => cache.keys()),
                caches.open(API_CACHE).then((cache) => cache.keys()),
                caches.open(OFFLINE_CACHE).then((cache) => cache.keys())
            ]).then(([precache, runtime, images, audio, video, fonts, api, offline]) => {
                if (responsePort) {
                    responsePort.postMessage({
                        cacheName: CACHE_NAME,
                        version: VERSION,
                        stats: {
                            precache: { total: precache.length },
                            runtime: { total: runtime.length },
                            images: { total: images.length },
                            audio: { total: audio.length },
                            video: { total: video.length },
                            fonts: { total: fonts.length },
                            api: { total: api.length },
                            offline: { total: offline.length }
                        },
                        total: precache.length + runtime.length + images.length + 
                                audio.length + video.length + fonts.length + api.length + offline.length,
                        timestamp: Date.now()
                    });
                }
            }).catch(() => {
                if (responsePort) {
                    responsePort.postMessage({ success: false, error: 'Error obteniendo estadísticas' });
                }
            });
            break;
            
        case 'REGISTER_SYNC':
            if ('sync' in self.registration) {
                try {
                    self.registration.sync.register(event.data.tag || 'sync-datos');
                    if (responsePort) {
                        responsePort.postMessage({ 
                            success: true, 
                            tag: event.data.tag || 'sync-datos' 
                        });
                    }
                } catch (error) {
                    if (responsePort) {
                        responsePort.postMessage({ 
                            success: false, 
                            error: error.message 
                        });
                    }
                }
            } else {
                if (responsePort) {
                    responsePort.postMessage({ 
                        success: false, 
                        error: 'Sync no soportado en este navegador' 
                    });
                }
            }
            break;
            
        case 'GET_OFFLINE_STATUS':
            const isOnline = navigator.onLine;
            if (responsePort) {
                responsePort.postMessage({
                    online: isOnline,
                    offline: !isOnline,
                    timestamp: Date.now()
                });
            }
            break;
            
        case 'PREFETCH_URL':
            if (event.data.url) {
                fetch(event.data.url, { cache: 'force-cache' })
                    .then((response) => {
                        if (response && response.ok) {
                            caches.open(RUNTIME_CACHE).then((cache) => {
                                cache.put(event.data.url, response);
                            });
                        }
                        if (responsePort) {
                            responsePort.postMessage({ 
                                success: true, 
                                url: event.data.url 
                            });
                        }
                    })
                    .catch((error) => {
                        if (responsePort) {
                            responsePort.postMessage({ 
                                success: false, 
                                url: event.data.url, 
                                error: error.message 
                            });
                        }
                    });
            }
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
self.addEventListener('error', (event) => {
    // Silenciar errores del service worker
    event.preventDefault();
});

self.addEventListener('unhandledrejection', (event) => {
    // Silenciar promesas rechazadas no manejadas
    event.preventDefault();
});

// ============================================
// FUNCIONES DE SINCRONIZACIÓN
// ============================================
self._syncData = async (tipo) => {
    try {
        // Obtener datos pendientes de localStorage
        const key = `ipuc15_sync_${tipo}`;
        const pending = await self._getPendingData(key);
        
        if (pending && pending.length > 0) {
            // Intentar sincronizar cada elemento
            for (const item of pending) {
                try {
                    const response = await fetch(item.url, {
                        method: item.method || 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(item.data)
                    });
                    
                    if (response && response.ok) {
                        // Eliminar de pendientes
                        await self._removePendingData(key, item.id);
                    }
                } catch {}
            }
        }
    } catch {}
};

self._getPendingData = async (key) => {
    try {
        const data = await self._getFromCache('sync_data', key);
        return data || [];
    } catch {
        return [];
    }
};

self._removePendingData = async (key, id) => {
    try {
        const data = await self._getPendingData(key);
        const filtered = data.filter(item => item.id !== id);
        await self._saveToCache('sync_data', key, filtered);
    } catch {}
};

self._getFromCache = async (cacheName, key) => {
    try {
        const cache = await caches.open(cacheName);
        const response = await cache.match(key);
        if (response) {
            return await response.json();
        }
        return null;
    } catch {
        return null;
    }
};

self._saveToCache = async (cacheName, key, data) => {
    try {
        const cache = await caches.open(cacheName);
        const response = new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
        await cache.put(key, response);
    } catch {}
};

// ============================================
// REGISTRO DE SW
// ============================================
console.log(`✅ IPUC LA FONDA Service Worker v${VERSION} cargado`);
console.log(`📦 ${PRECACHE_ASSETS.length} assets pre-cacheados`);
console.log(`🔄 Estrategias de caché avanzadas activas`);
console.log(`📢 Push notifications configuradas`);
console.log(`🔄 Sincronización en segundo plano activa`);
