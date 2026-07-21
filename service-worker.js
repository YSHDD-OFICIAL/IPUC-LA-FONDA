// ============================================
// IPUC LA FONDA - SERVICE WORKER PWA v18.0 PRO ULTIMATE
// Instalable como App Nativa | Offline | Push | Sincronización
// Incluye: Soporte para Reportes, Notificaciones Mejoradas
// VERSIÓN INTERNACIONAL - OPTIMIZADO - COMPLETO
// "Donde el Espíritu Santo se mueve"
// ============================================

const CACHE_NAME = 'ipuc-la-fonda-v18.0';
const RUNTIME_CACHE = 'ipuc-runtime-v18.0';
const IMAGE_CACHE = 'ipuc-images-v18.0';
const API_CACHE = 'ipuc-api-v18.0';
const OFFLINE_CACHE = 'ipuc-offline-v18.0';
const AUDIO_CACHE = 'ipuc-audio-v18.0';
const VIDEO_CACHE = 'ipuc-video-v18.0';
const FONT_CACHE = 'ipuc-fonts-v18.0';
// NUEVO v18: Caché para reportes
const REPORTS_CACHE = 'ipuc-reports-v18.0';
const SYNC_CACHE = 'ipuc-sync-v18.0';

const VERSION = '18.0';
const MAX_AGE = 30 * 24 * 60 * 60; // 30 días en segundos
const MAX_IMAGE_AGE = 7 * 24 * 60 * 60; // 7 días para imágenes
const MAX_AUDIO_AGE = 90 * 24 * 60 * 60; // 90 días para audio
const MAX_VIDEO_AGE = 30 * 24 * 60 * 60; // 30 días para video
const MAX_REPORTS_AGE = 1 * 24 * 60 * 60; // 1 día para reportes

// ============================================
// ASSETS A PRECACHEAR - VERSIÓN COMPLETA v18.0
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
    
    // NUEVO v18: Iconos para reportes
    '/assets/icons/report-icon.png',
    '/assets/icons/moderate-icon.png',
    
    // Splash screens
    '/assets/splash/light-splash.png',
    '/assets/splash/dark-splash.png',
    
    // Sonidos de notificación
    '/assets/sounds/notification.mp3',
    '/assets/sounds/amen.mp3',
    '/assets/sounds/bell.mp3',
    '/assets/sounds/report-alert.mp3'
];

// ============================================
// PATRONES DE CACHÉ v18.0
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
        /\/assets\/sounds\//i,
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
    ],
    // NUEVO v18: Patrones para reportes
    reports: [
        /\/api\/reports\//i,
        /\/reports\//i,
        /\/reporte\//i
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
    // NUEVO v18: Priorizar caché de reportes
    if (matchPattern(url, CACHE_PATTERNS.reports)) return REPORTS_CACHE;
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
        case REPORTS_CACHE: return MAX_REPORTS_AGE;
        case API_CACHE: return 60; // 1 minuto para APIs
        default: return MAX_AGE;
    }
}

// ============================================
// INSTALACIÓN v18.0
// ============================================
self.addEventListener('install', function(event) {
    console.log('📦 SW v' + VERSION + ': Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                var results = [];
                var total = PRECACHE_ASSETS.length;
                var completed = 0;
                
                // Precachear en lotes para mejor rendimiento
                var batchSize = 5;
                var batches = [];
                for (var i = 0; i < PRECACHE_ASSETS.length; i += batchSize) {
                    batches.push(PRECACHE_ASSETS.slice(i, i + batchSize));
                }
                
                function processBatch(batchIndex) {
                    if (batchIndex >= batches.length) {
                        var failed = results.filter(function(r) { return !r.success; });
                        if (failed.length > 0) {
                            console.warn('SW: ' + failed.length + ' assets failed to cache');
                        }
                        return self.skipWaiting();
                    }
                    
                    var batch = batches[batchIndex];
                    var promises = batch.map(function(url) {
                        return fetch(url, { 
                            mode: 'no-cors', 
                            cache: 'no-cache',
                            headers: { 
                                'Cache-Control': 'no-cache',
                                'Pragma': 'no-cache'
                            }
                        })
                        .then(function(response) {
                            if (response && (response.status === 200 || response.type === 'opaque')) {
                                return cache.put(url, response).then(function() {
                                    results.push({ url: url, success: true });
                                    completed++;
                                });
                            } else {
                                results.push({ url: url, success: false, status: response ? response.status : null });
                                completed++;
                            }
                        })
                        .catch(function() {
                            results.push({ url: url, success: false });
                            completed++;
                        });
                    });
                    
                    return Promise.all(promises).then(function() {
                        // Notificar progreso
                        var progress = Math.round((completed / total) * 100);
                        self.clients.matchAll({ type: 'window' }).then(function(clients) {
                            clients.forEach(function(client) {
                                try {
                                    client.postMessage({
                                        type: 'SW_INSTALL_PROGRESS',
                                        progress: progress,
                                        total: total,
                                        completed: completed,
                                        version: VERSION
                                    });
                                } catch {}
                            });
                        });
                        
                        return processBatch(batchIndex + 1);
                    });
                }
                
                return processBatch(0);
            })
            .catch(function(error) {
                console.error('SW: Install error', error);
                return self.skipWaiting();
            })
    );
});

// ============================================
// ACTIVACIÓN v18.0
// ============================================
self.addEventListener('activate', function(event) {
    var CURRENT_CACHES = [
        CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, 
        API_CACHE, OFFLINE_CACHE, AUDIO_CACHE, 
        VIDEO_CACHE, FONT_CACHE, REPORTS_CACHE, SYNC_CACHE
    ];

    console.log('🔄 SW v' + VERSION + ': Activando...');

    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (CURRENT_CACHES.indexOf(cacheName) === -1) {
                            console.log('🗑️ SW: Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(function() {
                // Crear todos los cachés necesarios
                return Promise.all(
                    CURRENT_CACHES.map(function(cacheName) {
                        return caches.open(cacheName);
                    })
                );
            })
            .then(function() {
                // Notificar a clientes sobre la activación
                return self.clients.matchAll({ 
                    type: 'window',
                    includeUncontrolled: true 
                }).then(function(clients) {
                    clients.forEach(function(client) {
                        try {
                            client.postMessage({
                                type: 'SW_ACTIVATED',
                                version: VERSION,
                                timestamp: Date.now(),
                                cacheName: CACHE_NAME,
                                caches: CURRENT_CACHES
                            });
                        } catch {}
                    });
                });
            })
            .then(function() {
                return self.clients.claim();
            })
            .then(function() {
                console.log('✅ SW v' + VERSION + ': Activado correctamente');
            })
            .catch(function(error) {
                console.error('SW: Activation error', error);
            })
    );
});

// ============================================
// FETCH - ESTRATEGIAS DE CACHÉ AVANZADAS v18.0
// ============================================
self.addEventListener('fetch', function(event) {
    var request = event.request;
    var url = new URL(request.url);
    var pathname = url.pathname;
    var origin = url.origin;

    // No interceptar solicitudes a otros orígenes (excepto CDNs)
    if (origin !== self.location.origin && 
        !url.href.includes('unpkg.com') && 
        !url.href.includes('fonts.googleapis.com') &&
        !url.href.includes('fonts.gstatic.com') &&
        !url.href.includes('boxicons.com') &&
        !url.href.includes('cdn.jsdelivr.net')) {
        return;
    }

    // No interceptar solicitudes de sistema
    if (pathname.includes('/admin/') && !pathname.includes('/admin/login')) {
        return;
    }

    // ============================================
    // 1. REPORTES: Network First + Cache Fallback (NUEVO v18)
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.reports)) {
        event.respondWith(
            fetch(request)
                .then(function(response) {
                    if (response && response.ok) {
                        var responseToCache = response.clone();
                        caches.open(REPORTS_CACHE).then(function(cache) {
                            var headers = new Headers(responseToCache.headers);
                            headers.set('x-cache-time', Date.now().toString());
                            headers.set('x-version', VERSION);
                            var cachedResponse = new Response(responseToCache.body, {
                                status: responseToCache.status,
                                statusText: responseToCache.statusText,
                                headers: headers
                            });
                            cache.put(request, cachedResponse);
                        });
                        return response;
                    }
                    throw new Error('Network response no válida');
                })
                .catch(function() {
                    return caches.match(request).then(function(cached) {
                        if (cached) {
                            // Verificar si el caché aún es válido
                            var cacheTime = cached.headers.get('x-cache-time');
                            if (cacheTime && (Date.now() - parseInt(cacheTime)) < (MAX_REPORTS_AGE * 1000)) {
                                return cached;
                            }
                        }
                        // Devolver respuesta offline para reportes
                        return new Response(
                            JSON.stringify({
                                success: false,
                                error: 'Sin conexión para cargar reportes',
                                offline: true,
                                timestamp: Date.now(),
                                version: VERSION
                            }),
                            {
                                status: 503,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-Offline': 'true',
                                    'X-Cache-Status': 'offline'
                                }
                            }
                        );
                    });
                })
        );
        return;
    }

    // ============================================
    // 2. IMÁGENES: Cache First + Stale-While-Revalidate
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.images)) {
        event.respondWith(
            caches.open(IMAGE_CACHE).then(function(cache) {
                return cache.match(request).then(function(cached) {
                    if (cached) {
                        var cacheTime = cached.headers.get('x-cache-time');
                        if (cacheTime && (Date.now() - parseInt(cacheTime)) < (MAX_IMAGE_AGE * 1000)) {
                            // Stale-While-Revalidate
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
                });
            })
        );
        return;
    }

    // ============================================
    // 3. AUDIO: Cache First
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
                        return cached || new Response('', { status: 404 });
                    }).catch(function() {
                        return cached || new Response('', { status: 404 });
                    });
                });
            })
        );
        return;
    }

    // ============================================
    // 4. VIDEO: Cache First
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.video)) {
        event.respondWith(
            caches.open(VIDEO_CACHE).then(function(cache) {
                return cache.match(request).then(function(cached) {
                    if (cached) return cached;
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
                        return new Response('', { status: 404 });
                    }).catch(function() {
                        return cached || new Response('', { status: 404 });
                    });
                });
            })
        );
        return;
    }

    // ============================================
    // 5. FUENTES: Cache First + Update
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
                    return fetch(request).then(function(response) {
                        if (response && response.ok) {
                            cache.put(request, response.clone());
                            return response;
                        }
                        return new Response('', { status: 404 });
                    });
                });
            })
        );
        return;
    }

    // ============================================
    // 6. APIs: Network First + Cache Fallback
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.api)) {
        event.respondWith(
            fetch(request)
                .then(function(response) {
                    if (response && response.ok) {
                        caches.open(API_CACHE).then(function(cache) {
                            cache.put(request, response.clone());
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
    // 7. HTML / NAVEGACIÓN: Network First + Cache Fallback
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
                            
                            // Página offline personalizada v18.0
                            return new Response(
                                '<!DOCTYPE html>' +
                                '<html lang="es-CO">' +
                                '<head>' +
                                    '<meta charset="UTF-8">' +
                                    '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">' +
                                    '<meta name="theme-color" content="#1a237e">' +
                                    '<meta name="apple-mobile-web-app-capable" content="yes">' +
                                    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">' +
                                    '<title>IPUC LA FONDA v' + VERSION + ' - Modo Offline</title>' +
                                    '<style>' +
                                        '* { margin: 0; padding: 0; box-sizing: border-box; }' +
                                        'body { ' +
                                            'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;' +
                                            'display: flex;' +
                                            'justify-content: center;' +
                                            'align-items: center;' +
                                            'min-height: 100vh;' +
                                            'min-height: 100dvh;' +
                                            'background: linear-gradient(135deg, #0d1b5e 0%, #1a237e 50%, #283593 100%);' +
                                            'color: #ffffff;' +
                                            'text-align: center;' +
                                            'padding: 20px;' +
                                        '}' +
                                        '.offline-container { ' +
                                            'max-width: 420px; ' +
                                            'width: 100%;' +
                                            'padding: 40px 30px; ' +
                                            'background: rgba(255,255,255,0.06); ' +
                                            'border-radius: 24px; ' +
                                            'backdrop-filter: blur(20px); ' +
                                            '-webkit-backdrop-filter: blur(20px);' +
                                            'border: 1px solid rgba(255,255,255,0.12); ' +
                                            'box-shadow: 0 20px 60px rgba(0,0,0,0.3);' +
                                        '}' +
                                        '.offline-logo { ' +
                                            'width: 80px; height: 80px; ' +
                                            'margin: 0 auto 20px; ' +
                                            'border-radius: 50%; ' +
                                            'background: rgba(255,255,255,0.1); ' +
                                            'display: flex; ' +
                                            'align-items: center; ' +
                                            'justify-content: center; ' +
                                            'font-size: 2.5rem; ' +
                                        '}' +
                                        '.offline-icon { font-size: 3.5rem; margin-bottom: 16px; opacity: 0.7; }' +
                                        '.offline-title { font-size: 1.6rem; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }' +
                                        '.offline-subtitle { font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 6px; }' +
                                        '.offline-text { color: rgba(255,255,255,0.55); margin-bottom: 28px; line-height: 1.7; font-size: 0.9rem; }' +
                                        '.offline-actions { display: flex; flex-direction: column; gap: 10px; }' +
                                        '.btn-retry {' +
                                            'background: linear-gradient(135deg, #ffd700, #ffc107);' +
                                            'color: #1a237e;' +
                                            'border: none;' +
                                            'padding: 14px 28px;' +
                                            'border-radius: 14px;' +
                                            'font-size: 1rem;' +
                                            'font-weight: 700;' +
                                            'cursor: pointer;' +
                                            'transition: all 0.3s ease;' +
                                            'font-family: inherit;' +
                                            'width: 100%;' +
                                        '}' +
                                        '.btn-retry:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3); }' +
                                        '.btn-offline {' +
                                            'background: rgba(255,255,255,0.08);' +
                                            'color: #ffffff;' +
                                            'border: 1px solid rgba(255,255,255,0.15);' +
                                            'padding: 12px 24px;' +
                                            'border-radius: 14px;' +
                                            'font-size: 0.9rem;' +
                                            'cursor: pointer;' +
                                            'transition: all 0.3s ease;' +
                                            'font-family: inherit;' +
                                            'width: 100%;' +
                                        '}' +
                                        '.btn-offline:hover { background: rgba(255,255,255,0.12); }' +
                                        '.offline-verse { ' +
                                            'margin-top: 20px; ' +
                                            'padding: 16px; ' +
                                            'background: rgba(255,255,255,0.04); ' +
                                            'border-radius: 12px; ' +
                                            'border-left: 3px solid #ffd700;' +
                                            'text-align: left;' +
                                        '}' +
                                        '.offline-verse p { font-style: italic; font-size: 0.85rem; opacity: 0.7; margin-bottom: 4px; }' +
                                        '.offline-verse .ref { font-weight: 700; font-size: 0.75rem; color: #ffd700; }' +
                                        '.offline-version { margin-top: 20px; font-size: 0.7rem; color: rgba(255,255,255,0.25); }' +
                                        '.offline-pulse { animation: pulse 2s ease-in-out infinite; }' +
                                        '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }' +
                                        '@media (max-width: 480px) {' +
                                            '.offline-container { padding: 24px 18px; }' +
                                            '.offline-title { font-size: 1.3rem; }' +
                                            '.offline-icon { font-size: 2.8rem; }' +
                                            '.offline-logo { width: 60px; height: 60px; font-size: 2rem; }' +
                                        '}' +
                                        '@media (prefers-color-scheme: dark) {' +
                                            '.offline-container { background: rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.06); }' +
                                        '}' +
                                    '</style>' +
                                '</head>' +
                                '<body>' +
                                    '<div class="offline-container">' +
                                        '<div class="offline-logo">🙏</div>' +
                                        '<h1 class="offline-title">Sin conexión</h1>' +
                                        '<p class="offline-subtitle">IPUC LA FONDA v' + VERSION + ' está en modo offline</p>' +
                                        '<p class="offline-text">Verifica tu conexión a internet para acceder a todo el contenido, incluyendo reportes y notificaciones.</p>' +
                                        '<div class="offline-actions">' +
                                            '<button class="btn-retry" onclick="location.reload()">' +
                                                '🔄 Reintentar conexión' +
                                            '</button>' +
                                            '<button class="btn-offline" onclick="this.closest(\'.offline-text\').textContent = \'Estamos orando por ti. ¡Dios te bendiga! 🙏\'; this.style.display=\'none\';">' +
                                                '🙏 Está bien, seguir offline' +
                                            '</button>' +
                                        '</div>' +
                                        '<div class="offline-verse">' +
                                            '<p>"Jehová es mi pastor; nada me faltará."</p>' +
                                            '<p class="ref">Salmos 23:1</p>' +
                                        '</div>' +
                                        '<div class="offline-version">v' + VERSION + ' PRO &copy; 2026 IPUC LA FONDA International</div>' +
                                    '</div>' +
                                '</body>' +
                                '</html>',
                                {
                                    status: 503,
                                    headers: {
                                        'Content-Type': 'text/html; charset=utf-8',
                                        'X-Offline': 'true',
                                        'X-Version': VERSION
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
    // 8. JS/CSS: Cache First + Update
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
    // 9. RESTO: Network First + Cache Fallback
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
});

// ============================================
// PUSH NOTIFICATIONS PREMIUM v18.0
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
            { action: 'open', title: '📱 Abrir', icon: '/assets/icons/icon-192x192.png' },
            { action: 'close', title: '✕ Cerrar', icon: '/assets/icons/icon-192x192.png' }
        ]
    };
    
    // Personalizar según tipo (NUEVO v18: soporte para reportes)
    switch (data.tipo) {
        case 'oracion':
            options.body = '🕯️ ' + data.mensaje;
            break;
        case 'evento':
            options.body = '📅 ' + data.mensaje;
            break;
        case 'publicacion':
            options.body = '📝 ' + data.mensaje;
            break;
        case 'musica':
            options.body = '🎵 ' + data.mensaje;
            break;
        case 'reporte':
            options.body = '📋 ' + data.mensaje;
            options.requireInteraction = true;
            options.priority = 'high';
            break;
        case 'reporte_urgente':
            options.body = '🚨 ' + data.mensaje;
            options.requireInteraction = true;
            options.priority = 'high';
            options.vibrate = [200, 100, 200, 100, 200, 100, 200];
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
// CLIC EN NOTIFICACIÓN v18.0
// ============================================
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'close') return;
    
    var urlToOpen = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';
    var notificationId = event.notification.data ? event.notification.data.notificationId : null;
    var tipo = event.notification.data ? event.notification.data.tipo : 'general';
    
    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        })
        .then(function(windowClients) {
            // Buscar si ya hay una ventana abierta
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
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
                    // Navegar a la URL específica
                    if (urlToOpen !== '/') {
                        client.navigate(urlToOpen);
                    }
                    return;
                }
            }
            // Abrir nueva ventana
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen).then(function(newClient) {
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
                        }, 800);
                    }
                });
            }
        })
    );
});

// ============================================
// SINCRONIZACIÓN EN SEGUNDO PLANO v18.0
// ============================================
self.addEventListener('sync', function(event) {
    var syncHandlers = {
        'sync-datos': function() {
            return self._syncGenericData('datos');
        },
        'sync-asistencia': function() {
            return self._syncGenericData('asistencia');
        },
        'sync-mensajes': function() {
            return self._syncGenericData('mensajes');
        },
        'sync-peticiones': function() {
            return self._syncGenericData('peticiones');
        },
        'sync-publicaciones': function() {
            return self._syncGenericData('publicaciones');
        },
        'sync-noticias': function() {
            return self._syncGenericData('noticias');
        },
        'sync-encuestas': function() {
            return self._syncGenericData('encuestas');
        },
        'sync-podcast': function() {
            return self._syncGenericData('podcast');
        },
        'sync-donaciones': function() {
            return self._syncGenericData('donaciones');
        },
        'sync-favoritos': function() {
            return self._syncGenericData('favoritos');
        },
        // NUEVO v18: Sincronización de reportes
        'sync-reportes': function() {
            return self._syncGenericData('reportes');
        }
    };
    
    if (syncHandlers[event.tag]) {
        event.waitUntil(
            Promise.resolve(syncHandlers[event.tag]())
                .catch(function(error) {
                    console.log('SW: Error en sync ' + event.tag, error);
                })
        );
    }
});

// ============================================
// MENSAJES DESDE EL CLIENTE v18.0
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
                        offline: OFFLINE_CACHE,
                        reports: REPORTS_CACHE
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
                        message: 'Cache limpiado correctamente', 
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
            
        case 'CLEAR_REPORTS_CACHE':
            caches.delete(REPORTS_CACHE).then(function(deleted) {
                if (responsePort) {
                    responsePort.postMessage({ 
                        success: deleted, 
                        cacheName: REPORTS_CACHE 
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
            
        case 'GET_CACHE_STATS':
            Promise.all([
                caches.open(CACHE_NAME).then(function(cache) { return cache.keys(); }),
                caches.open(RUNTIME_CACHE).then(function(cache) { return cache.keys(); }),
                caches.open(IMAGE_CACHE).then(function(cache) { return cache.keys(); }),
                caches.open(AUDIO_CACHE).then(function(cache) { return cache.keys(); }),
                caches.open(VIDEO_CACHE).then(function(cache) { return cache.keys(); }),
                caches.open(FONT_CACHE).then(function(cache) { return cache.keys(); }),
                caches.open(API_CACHE).then(function(cache) { return cache.keys(); }),
                caches.open(OFFLINE_CACHE).then(function(cache) { return cache.keys(); }),
                caches.open(REPORTS_CACHE).then(function(cache) { return cache.keys(); })
            ]).then(function(results) {
                if (responsePort) {
                    responsePort.postMessage({
                        version: VERSION,
                        cacheName: CACHE_NAME,
                        stats: {
                            precache: { total: results[0].length },
                            runtime: { total: results[1].length },
                            images: { total: results[2].length },
                            audio: { total: results[3].length },
                            video: { total: results[4].length },
                            fonts: { total: results[5].length },
                            api: { total: results[6].length },
                            offline: { total: results[7].length },
                            reports: { total: results[8].length }
                        },
                        total: results.reduce(function(acc, r) { return acc + r.length; }, 0),
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
                    var tag = event.data.tag || 'sync-datos';
                    self.registration.sync.register(tag).then(function() {
                        if (responsePort) {
                            responsePort.postMessage({ success: true, tag: tag });
                        }
                    }).catch(function(error) {
                        if (responsePort) {
                            responsePort.postMessage({ success: false, error: error.message });
                        }
                    });
                } catch (error) {
                    if (responsePort) {
                        responsePort.postMessage({ success: false, error: error.message });
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
            if (responsePort) {
                responsePort.postMessage({
                    online: navigator.onLine,
                    offline: !navigator.onLine,
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
                            responsePort.postMessage({ success: true, url: event.data.url });
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
            
        // NUEVO v18: Guardar reporte offline
        case 'SAVE_REPORT_OFFLINE':
            if (event.data.reporte) {
                var reportKey = 'report_' + Date.now();
                var reportData = JSON.stringify(event.data.reporte);
                var blob = new Blob([reportData], { type: 'application/json' });
                var response = new Response(blob, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-cache-time': Date.now().toString(),
                        'x-version': VERSION
                    }
                });
                
                caches.open(REPORTS_CACHE).then(function(cache) {
                    cache.put(reportKey, response).then(function() {
                        if (responsePort) {
                            responsePort.postMessage({ 
                                success: true, 
                                key: reportKey,
                                message: 'Reporte guardado offline'
                            });
                        }
                    });
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
    }
});

// ============================================
// DETECCIÓN DE CONECTIVIDAD v18.0
// ============================================
self.addEventListener('online', function() {
    console.log('🌐 SW: Conexión restaurada');
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
    
    // Intentar sincronizar datos pendientes
    if ('sync' in self.registration) {
        try {
            self.registration.sync.register('sync-datos');
            self.registration.sync.register('sync-reportes');
        } catch {}
    }
});

self.addEventListener('offline', function() {
    console.log('📡 SW: Sin conexión');
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
    event.preventDefault();
});

self.addEventListener('unhandledrejection', function(event) {
    event.preventDefault();
});

// ============================================
// FUNCIONES DE SINCRONIZACIÓN
// ============================================
self._syncGenericData = function(tipo) {
    try {
        var key = 'ipuc18_sync_' + tipo;
        return self._getPendingData(key).then(function(pending) {
            if (pending && pending.length > 0) {
                var syncPromises = pending.map(function(item) {
                    return fetch(item.url, {
                        method: item.method || 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Sync-Origin': 'service-worker'
                        },
                        body: JSON.stringify(item.data)
                    }).then(function(response) {
                        if (response && response.ok) {
                            return self._removePendingData(key, item.id);
                        }
                    }).catch(function() {
                        // Mantener en cola si falla
                    });
                });
                return Promise.all(syncPromises);
            }
        }).catch(function() {});
    } catch {
        return Promise.resolve();
    }
};

self._getPendingData = function(key) {
    try {
        return self._getFromCache(SYNC_CACHE, key).then(function(data) {
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
            return self._saveToCache(SYNC_CACHE, key, filtered);
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
// LOG DE INICIALIZACIÓN v18.0
// ============================================
console.log('✅ IPUC LA FONDA Service Worker v' + VERSION + ' PRO ULTIMATE cargado');
console.log('📦 ' + PRECACHE_ASSETS.length + ' assets pre-cacheados');
