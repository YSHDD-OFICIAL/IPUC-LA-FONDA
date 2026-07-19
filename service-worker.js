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
    return patterns.some(function(pattern) {
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
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                var results = [];
                var total = PRECACHE_ASSETS.length;
                var completed = 0;
                
                for (var i = 0; i < PRECACHE_ASSETS.length; i++) {
                    var url = PRECACHE_ASSETS[i];
                    (function(url) {
                        try {
                            fetch(url, { 
                                mode: 'no-cors', 
                                cache: 'no-cache',
                                headers: { 
                                    'Cache-Control': 'no-cache',
                                    'Pragma': 'no-cache'
                                }
                            })
                            .then(function(response) {
                                if (response && (response.status === 200 || response.type === 'opaque')) {
                                    cache.put(url, response);
                                    results.push({ url: url, success: true });
                                } else {
                                    results.push({ url: url, success: false, status: response ? response.status : null });
                                }
                                completed++;
                                if (completed % Math.ceil(total / 10) === 0 || completed === total) {
                                    self.clients.matchAll({ type: 'window' }).then(function(clients) {
                                        for (var j = 0; j < clients.length; j++) {
                                            try {
                                                clients[j].postMessage({
                                                    type: 'SW_INSTALL_PROGRESS',
                                                    progress: Math.round((completed / total) * 100),
                                                    total: total,
                                                    completed: completed
                                                });
                                            } catch {}
                                        }
                                    });
                                }
                            })
                            .catch(function() {
                                results.push({ url: url, success: false });
                                completed++;
                            });
                        } catch {
                            results.push({ url: url, success: false });
                            completed++;
                        }
                    })(url);
                }
                
                var failed = results.filter(function(r) { return !r.success; });
                if (failed.length > 0) {
                    console.warn('SW: ' + failed.length + ' assets failed to cache');
                }
                
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.error('SW: Install error', error);
                return self.skipWaiting();
            })
    );
});

// ============================================
// ACTIVACIÓN
// ============================================
self.addEventListener('activate', function(event) {
    var CURRENT_CACHES = [
        CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, 
        API_CACHE, OFFLINE_CACHE, AUDIO_CACHE, 
        VIDEO_CACHE, FONT_CACHE
    ];

    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (CURRENT_CACHES.indexOf(cacheName) === -1) {
                            return caches.delete(cacheName)
                                .then(function() {
                                    console.log('SW: Cache eliminado: ' + cacheName);
                                })
                                .catch(function() {});
                        }
                    })
                );
            })
            .then(function() {
                // Crear cachés necesarios
                for (var i = 0; i < CURRENT_CACHES.length; i++) {
                    (function(cache) {
                        try {
                            caches.open(cache);
                        } catch {}
                    })(CURRENT_CACHES[i]);
                }
                
                // Notificar a clientes
                self.clients.matchAll({ 
                    type: 'window',
                    includeUncontrolled: true 
                }).then(function(clients) {
                    for (var j = 0; j < clients.length; j++) {
                        try {
                            clients[j].postMessage({
                                type: 'SW_ACTIVATED',
                                version: VERSION,
                                timestamp: Date.now(),
                                cacheName: CACHE_NAME,
                                caches: CURRENT_CACHES
                            });
                        } catch {}
                    }
                });
                return self.clients.claim();
            })
            .then(function() {
                console.log('SW: Activado v' + VERSION);
            })
            .catch(function(error) {
                console.error('SW: Activation error', error);
            })
    );
});

// ============================================
// FETCH - ESTRATEGIAS DE CACHÉ AVANZADAS
// ============================================
self.addEventListener('fetch', function(event) {
    var request = event.request;
    var url = new URL(request.url);
    var pathname = url.pathname;
    var origin = url.origin;
    var search = url.search;

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
            caches.open(IMAGE_CACHE).then(function(cache) {
                return cache.match(request).then(function(cached) {
                    if (cached) {
                        var cacheTime = cached.headers.get('x-cache-time');
                        if (cacheTime && (Date.now() - parseInt(cacheTime)) < (MAX_IMAGE_AGE * 1000)) {
                            // Devolver caché y actualizar en segundo plano
                            fetch(request).then(function(response) {
                                if (response && response.ok) {
                                    var headers = new Headers(response.headers);
                                    headers.set('x-cache-time', Date.now().toString());
                                    var responseToCache = new Response(response.body, {
                                        status: response.status,
                                        statusText: response.statusText,
                                        headers: headers
                                    });
                                    cache.put(request, responseToCache);
                                }
                            }).catch(function() {});
                            return cached;
                        }
                    }
                    
                    try {
                        return fetch(request).then(function(networkResponse) {
                            if (networkResponse && networkResponse.ok) {
                                var headers = new Headers(networkResponse.headers);
                                headers.set('x-cache-time', Date.now().toString());
                                var responseToCache = new Response(networkResponse.body, {
                                    status: networkResponse.status,
                                    statusText: networkResponse.statusText,
                                    headers: headers
                                });
                                cache.put(request, responseToCache.clone());
                                return responseToCache;
                            }
                            throw new Error('Network response no válida');
                        }).catch(function() {
                            if (cached) return cached;
                            // Fallback a imagen por defecto
                            return caches.match('/assets/icons/icon-192x192.png') || 
                                   new Response('', { status: 404 });
                        });
                    } catch {
                        if (cached) return cached;
                        return caches.match('/assets/icons/icon-192x192.png') || 
                               new Response('', { status: 404 });
                    }
                });
            })
        );
        return;
    }

    // ============================================
    // 2. AUDIO: Cache First (música, podcast)
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.audio)) {
        event.respondWith(
            caches.open(AUDIO_CACHE).then(function(cache) {
                return cache.match(request).then(function(cached) {
                    if (cached) {
                        var cacheTime = cached.headers.get('x-cache-time');
                        if (cacheTime && (Date.now() - parseInt(cacheTime)) < (MAX_AUDIO_AGE * 1000)) {
                            return cached;
                        }
                    }
                    try {
                        return fetch(request).then(function(response) {
                            if (response && response.ok) {
                                var headers = new Headers(response.headers);
                                headers.set('x-cache-time', Date.now().toString());
                                var responseToCache = new Response(response.body, {
                                    status: response.status,
                                    statusText: response.statusText,
                                    headers: headers
                                });
                                cache.put(request, responseToCache.clone());
                                return responseToCache;
                            }
                        }).catch(function() {
                            return cached || new Response('', { status: 404 });
                        });
                    } catch {
                        return cached || new Response('', { status: 404 });
                    }
                });
            })
        );
        return;
    }

    // ============================================
    // 3. VIDEO: Cache First
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.video)) {
        event.respondWith(
            caches.open(VIDEO_CACHE).then(function(cache) {
                return cache.match(request).then(function(cached) {
                    if (cached) {
                        var cacheTime = cached.headers.get('x-cache-time');
                        if (cacheTime && (Date.now() - parseInt(cacheTime)) < (MAX_VIDEO_AGE * 1000)) {
                            return cached;
                        }
                    }
                    try {
                        return fetch(request).then(function(response) {
                            if (response && response.ok) {
                                var headers = new Headers(response.headers);
                                headers.set('x-cache-time', Date.now().toString());
                                var responseToCache = new Response(response.body, {
                                    status: response.status,
                                    statusText: response.statusText,
                                    headers: headers
                                });
                                cache.put(request, responseToCache.clone());
                                return responseToCache;
                            }
                        }).catch(function() {
                            return cached || new Response('', { status: 404 });
                        });
                    } catch {
                        return cached || new Response('', { status: 404 });
                    }
                });
            })
        );
        return;
    }

    // ============================================
    // 4. FUENTES: Cache First + Stale-While-Revalidate
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.fonts)) {
        event.respondWith(
            caches.open(FONT_CACHE).then(function(cache) {
                return cache.match(request).then(function(cached) {
                    if (cached) {
                        fetch(request).then(function(response) {
                            if (response && response.ok) {
                                cache.put(request, response);
                            }
                        }).catch(function() {});
                        return cached;
                    }
                    try {
                        return fetch(request).then(function(response) {
                            if (response && response.ok) {
                                cache.put(request, response.clone());
                                return response;
                            }
                        }).catch(function() {
                            return cached || new Response('', { status: 404 });
                        });
                    } catch {
                        return cached || new Response('', { status: 404 });
                    }
                });
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
                .then(function(response) {
                    if (response && response.ok) {
                        caches.open(API_CACHE).then(function(cache) {
                            var responseToCache = response.clone();
                            cache.put(request, responseToCache);
                        });
                        return response;
                    }
                    throw new Error('Network response no válida');
                })
                .catch(function() {
                    return caches.match(request).then(function(cached) {
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
                    });
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
                .then(function(response) {
                    if (response && response.ok) {
                        caches.open(RUNTIME_CACHE).then(function(cache) {
                            cache.put(request, response.clone());
                        });
                        return response;
                    }
                    throw new Error('Respuesta no válida');
                })
                .catch(function() {
                    return caches.match(request).then(function(cached) {
                        if (cached) return cached;
                        return caches.match('/').then(function(index) {
                            if (index) return index;
                            
                            // Página offline personalizada
                            return new Response(
                                '<!DOCTYPE html>' +
                                '<html lang="es-CO">' +
                                '<head>' +
                                    '<meta charset="UTF-8">' +
                                    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
                                    '<meta name="theme-color" content="#1a237e">' +
                                    '<title>IPUC LA FONDA - Offline</title>' +
                                    '<style>' +
                                        '* { margin: 0; padding: 0; box-sizing: border-box; }' +
                                        'body { ' +
                                            'font-family: \'Inter\', \'Segoe UI\', system-ui, sans-serif;' +
                                            'display: flex;' +
                                            'justify-content: center;' +
                                            'align-items: center;' +
                                            'min-height: 100vh;' +
                                            'background: linear-gradient(135deg, #0d1b5e, #1a237e, #283593);' +
                                            'color: #ffffff;' +
                                            'text-align: center;' +
                                            'padding: 20px;' +
                                        '}' +
                                        '.offline-container { max-width: 400px; padding: 30px; background: rgba(255,255,255,0.05); border-radius: 24px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }' +
                                        '.offline-icon { font-size: 4rem; margin-bottom: 16px; opacity: 0.6; }' +
                                        '.offline-title { font-size: 1.8rem; font-weight: 700; margin-bottom: 8px; }' +
                                        '.offline-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-bottom: 8px; }' +
                                        '.offline-text { color: rgba(255,255,255,0.6); margin-bottom: 24px; line-height: 1.6; font-size: 0.95rem; }' +
                                        '.offline-actions { display: flex; flex-direction: column; gap: 10px; }' +
                                        '.btn-retry {' +
                                            'background: #ffd700;' +
                                            'color: #1a237e;' +
                                            'border: none;' +
                                            'padding: 12px 24px;' +
                                            'border-radius: 12px;' +
                                            'font-size: 1rem;' +
                                            'font-weight: 600;' +
                                            'cursor: pointer;' +
                                            'transition: all 0.3s ease;' +
                                            'font-family: inherit;' +
                                        '}' +
                                        '.btn-retry:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3); }' +
                                        '.btn-offline {' +
                                            'background: rgba(255,255,255,0.1);' +
                                            'color: #ffffff;' +
                                            'border: 1px solid rgba(255,255,255,0.15);' +
                                            'padding: 10px 24px;' +
                                            'border-radius: 12px;' +
                                            'font-size: 0.9rem;' +
                                            'cursor: pointer;' +
                                            'transition: all 0.3s ease;' +
                                            'font-family: inherit;' +
                                        '}' +
                                        '.btn-offline:hover { background: rgba(255,255,255,0.15); }' +
                                        '.offline-version { margin-top: 16px; font-size: 0.7rem; color: rgba(255,255,255,0.3); }' +
                                        '.offline-pulse { animation: pulse 2s ease-in-out infinite; }' +
                                        '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }' +
                                        '@media (max-width: 480px) {' +
                                            '.offline-container { padding: 20px; }' +
                                            '.offline-title { font-size: 1.4rem; }' +
                                            '.offline-icon { font-size: 3rem; }' +
                                        '}' +
                                    '</style>' +
                                    '<link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">' +
                                '</head>' +
                                '<body>' +
                                    '<div class="offline-container">' +
                                        '<div class="offline-icon"><i class="bx bx-wifi-off"></i></div>' +
                                        '<h1 class="offline-title">Sin conexión</h1>' +
                                        '<p class="offline-subtitle">IPUC LA FONDA está en modo offline</p>' +
                                        '<p class="offline-text">Verifica tu conexión a internet para acceder a todo el contenido.</p>' +
                                        '<div class="offline-actions">' +
                                            '<button class="btn-retry" onclick="location.reload()">' +
                                                '<i class="bx bx-refresh"></i> Reintentar' +
                                            '</button>' +
                                            '<button class="btn-offline" onclick="document.querySelector(\'.offline-text\').textContent = \'Estamos orando por ti. ¡Dios te bendiga! 🙏\'">' +
                                                '<i class="bx bx-pray"></i> Está bien, seguir offline' +
                                            '</button>' +
                                        '</div>' +
                                        '<div class="offline-version">v' + VERSION + ' &copy; 2026 IPUC LA FONDA</div>' +
                                    '</div>' +
                                '</body>' +
                                '</html>',
                                {
                                    status: 503,
                                    headers: {
                                        'Content-Type': 'text/html',
                                        'X-Offline': 'true'
                                    }
                                }
                            );
                        });
                    });
                })
        );
        return;
    }

    // ============================================
    // 7. JS/CSS: Cache First + Update
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.js) || matchPattern(pathname, CACHE_PATTERNS.css)) {
        event.respondWith(
            caches.match(request).then(function(cached) {
                var fetchPromise = fetch(request)
                    .then(function(response) {
                        if (response && response.ok) {
                            caches.open(RUNTIME_CACHE).then(function(cache) {
                                cache.put(request, response.clone());
                            });
                        }
                        return response;
                    })
                    .catch(function() { return cached; });
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
            .then(function(response) {
                if (response && response.ok && shouldCache(pathname)) {
                    var cacheName = getCacheForRequest(pathname);
                    caches.open(cacheName).then(function(cache) {
                        cache.put(request, response.clone());
                    });
                }
                return response;
            })
            .catch(function() {
                return caches.match(request).then(function(cached) {
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
                });
            })
    );
});

// ============================================
// PUSH NOTIFICATIONS PREMIUM
// ============================================
self.addEventListener('push', function(event) {
    var data = {
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
            var pushData = event.data.json();
            for (var key in pushData) {
                data[key] = pushData[key];
            }
        } catch {
            data.mensaje = event.data.text() || data.mensaje;
        }
    }
    
    var options = {
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
        tag: 'ipuc-notif-' + data.id,
        renotify: true,
        requireInteraction: data.importante || false,
        timestamp: data.timestamp || Date.now(),
        priority: data.importante ? 'high' : 'normal',
        actions: [
            { action: 'open', title: 'Abrir', icon: '/assets/icons/icon-192x192.png' },
            { action: 'share', title: 'Compartir', icon: '/assets/icons/icon-192x192.png' },
            { action: 'close', title: 'Cerrar', icon: '/assets/icons/icon-192x192.png' }
        ]
    };
    
    // Personalizar según tipo
    switch (data.tipo) {
        case 'oracion':
            options.body = '🕯️ ' + data.mensaje;
            options.actions = [
                { action: 'open', title: 'Orar', icon: '/assets/icons/icon-192x192.png' },
                { action: 'close', title: 'Cerrar', icon: '/assets/icons/icon-192x192.png' }
            ];
            break;
        case 'evento':
            options.body = '📅 ' + data.mensaje;
            options.actions = [
                { action: 'open', title: 'Confirmar', icon: '/assets/icons/icon-192x192.png' },
                { action: 'close', title: 'Cerrar', icon: '/assets/icons/icon-192x192.png' }
            ];
            break;
        case 'publicacion':
            options.body = '📝 ' + data.mensaje;
            options.actions = [
                { action: 'open', title: 'Ver', icon: '/assets/icons/icon-192x192.png' },
                { action: 'close', title: 'Cerrar', icon: '/assets/icons/icon-192x192.png' }
            ];
            break;
        case 'musica':
            options.body = '🎵 ' + data.mensaje;
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
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'close') return;
    
    if (event.action === 'share') {
        var shareData = {
            title: 'IPUC LA FONDA',
            text: event.notification.body || 'Where the Holy Spirit moves',
            url: event.notification.data && event.notification.data.url ? event.notification.data.url : 'https://ipuclafonda.netlify.app/'
        };
        
        if (navigator.share) {
            navigator.share(shareData).catch(function() {});
        }
        return;
    }
    
    var urlToOpen = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';
    var notificationId = event.notification.data ? event.notification.data.notificationId : null;
    var tipo = event.notification.data ? event.notification.data.tipo : 'general';
    
    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        })
        .then(function(windowClients) {
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    client.focus();
                    client.postMessage({
                        type: 'NOTIFICATION_CLICKED',
                        data: { 
                            notificationId: notificationId, 
                            tipo: tipo, 
                            url: urlToOpen, 
                            timestamp: Date.now(),
                            action: event.action || 'open'
                        }
                    });
                    return;
                }
            }
            if (clients.openWindow) {
                clients.openWindow(urlToOpen).then(function(newClient) {
                    if (newClient) {
                        setTimeout(function() {
                            newClient.postMessage({
                                type: 'NOTIFICATION_CLICKED',
                                data: { 
                                    notificationId: notificationId, 
                                    tipo: tipo, 
                                    url: urlToOpen, 
                                    timestamp: Date.now(),
                                    action: event.action || 'open'
                                }
                            });
                        }, 500);
                    }
                });
            }
        })
    );
});

// ============================================
// SINCRONIZACIÓN EN SEGUNDO PLANO
// ============================================
self.addEventListener('sync', function(event) {
    var syncHandlers = {
        'sync-asistencia': function() {
            return self._syncData('asistencia');
        },
        'sync-mensajes': function() {
            return self._syncData('mensajes');
        },
        'sync-peticiones': function() {
            return self._syncData('peticiones');
        },
        'sync-datos': function() {
            return self._syncData('datos');
        },
        'sync-noticias': function() {
            return self._syncData('noticias');
        },
        'sync-publicaciones': function() {
            return self._syncData('publicaciones');
        },
        'sync-encuestas': function() {
            return self._syncData('encuestas');
        },
        'sync-podcast': function() {
            return self._syncData('podcast');
        },
        'sync-donaciones': function() {
            return self._syncData('donaciones');
        },
        'sync-favoritos': function() {
            return self._syncData('favoritos');
        }
    };
    
    if (syncHandlers[event.tag]) {
        event.waitUntil(Promise.resolve(syncHandlers[event.tag]()));
    }
});

// ============================================
// MENSAJES DESDE EL CLIENTE
// ============================================
self.addEventListener('message', function(event) {
    if (!event.data || !event.data.type) return;
    
    var responsePort = event.ports && event.ports[0] ? event.ports[0] : null;
    
    switch (event.data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting().then(function() {
                self.clients.matchAll({ type: 'window' }).then(function(clients) {
                    clients.forEach(function(client) {
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
            self.registration.update().catch(function() {});
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
            caches.keys().then(function(names) {
                return Promise.all(names.map(function(name) { return caches.delete(name); }));
            }).then(function() {
                if (responsePort) {
                    responsePort.postMessage({ 
                        success: true, 
                        message: 'Cache limpiado', 
                        timestamp: Date.now() 
                    });
                }
            }).catch(function(error) {
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
                caches.delete(event.data.cacheName).then(function(deleted) {
                    if (responsePort) {
                        responsePort.postMessage({ 
                            success: deleted, 
                            cacheName: event.data.cacheName 
                        });
                    }
                }).catch(function(error) {
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
                caches.open(CACHE_NAME).then(function(cache) { return cache.keys(); }),
                caches.open(RUNTIME_CACHE).then(function(cache) { return cache.keys(); }),
                caches.open(IMAGE_CACHE).then(function(cache) { return cache.keys(); }),
                caches.open(AUDIO_CACHE).then(function(cache) { return cache.keys(); }),
                caches.open(VIDEO_CACHE).then(function(cache) { return cache.keys(); }),
                caches.open(FONT_CACHE).then(function(cache) { return cache.keys(); }),
                caches.open(API_CACHE).then(function(cache) { return cache.keys(); }),
                caches.open(OFFLINE_CACHE).then(function(cache) { return cache.keys(); })
            ]).then(function(results) {
                if (responsePort) {
                    responsePort.postMessage({
                        cacheName: CACHE_NAME,
                        version: VERSION,
                        stats: {
                            precache: { total: results[0].length },
                            runtime: { total: results[1].length },
                            images: { total: results[2].length },
                            audio: { total: results[3].length },
                            video: { total: results[4].length },
                            fonts: { total: results[5].length },
                            api: { total: results[6].length },
                            offline: { total: results[7].length }
                        },
                        total: results[0].length + results[1].length + results[2].length + 
                                results[3].length + results[4].length + results[5].length + 
                                results[6].length + results[7].length,
                        timestamp: Date.now()
                    });
                }
            }).catch(function() {
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
            var isOnline = navigator.onLine;
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
                    .then(function(response) {
                        if (response && response.ok) {
                            caches.open(RUNTIME_CACHE).then(function(cache) {
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
                    .catch(function(error) {
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
self.addEventListener('online', function() {
    self.clients.matchAll({ type: 'window' }).then(function(clients) {
        clients.forEach(function(client) {
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

self.addEventListener('offline', function() {
    self.clients.matchAll({ type: 'window' }).then(function(clients) {
        clients.forEach(function(client) {
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
self.addEventListener('error', function(event) {
    // Silenciar errores del service worker
    event.preventDefault();
});

self.addEventListener('unhandledrejection', function(event) {
    // Silenciar promesas rechazadas no manejadas
    event.preventDefault();
});

// ============================================
// FUNCIONES DE SINCRONIZACIÓN
// ============================================
self._syncData = function(tipo) {
    try {
        var key = 'ipuc15_sync_' + tipo;
        return self._getPendingData(key).then(function(pending) {
            if (pending && pending.length > 0) {
                for (var i = 0; i < pending.length; i++) {
                    var item = pending[i];
                    try {
                        fetch(item.url, {
                            method: item.method || 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(item.data)
                        }).then(function(response) {
                            if (response && response.ok) {
                                self._removePendingData(key, item.id);
                            }
                        }).catch(function() {});
                    } catch {}
                }
            }
        }).catch(function() {});
    } catch {}
};

self._getPendingData = function(key) {
    try {
        return self._getFromCache('sync_data', key).then(function(data) {
            return data || [];
        }).catch(function() { return []; });
    } catch {
        return Promise.resolve([]);
    }
};

self._removePendingData = function(key, id) {
    try {
        return self._getPendingData(key).then(function(data) {
            var filtered = data.filter(function(item) { return item.id !== id; });
            return self._saveToCache('sync_data', key, filtered);
        }).catch(function() {});
    } catch {}
};

self._getFromCache = function(cacheName, key) {
    try {
        return caches.open(cacheName).then(function(cache) {
            return cache.match(key).then(function(response) {
                if (response) {
                    return response.json();
                }
                return null;
            }).catch(function() { return null; });
        }).catch(function() { return null; });
    } catch {
        return Promise.resolve(null);
    }
};

self._saveToCache = function(cacheName, key, data) {
    try {
        return caches.open(cacheName).then(function(cache) {
            var response = new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            });
            return cache.put(key, response);
        }).catch(function() {});
    } catch {}
};

// ============================================
// REGISTRO DE SW
// ============================================
console.log('✅ IPUC LA FONDA Service Worker v' + VERSION + ' cargado');
console.log('📦 ' + PRECACHE_ASSETS.length + ' assets pre-cacheados');
console.log('🔄 Estrategias de caché avanzadas activas');
console.log('📢 Push notifications configuradas');
console.log('🔄 Sincronización en segundo plano activa');
