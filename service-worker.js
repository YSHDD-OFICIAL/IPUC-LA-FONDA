/* ============================================
   IPUC LA FONDA - SERVICE WORKER PWA v18.0 PRO ULTIMATE
   Instalable como App Nativa | Offline | Push | Sincronizacion
   Incluye: Soporte para Reportes, Notificaciones Mejoradas
   VERSION INTERNACIONAL - OPTIMIZADO - COMPLETO
   "Donde el Espiritu Santo se mueve"
   ============================================ */

var CACHE_NAME = 'ipuc-la-fonda-v18.0';
var RUNTIME_CACHE = 'ipuc-runtime-v18.0';
var IMAGE_CACHE = 'ipuc-images-v18.0';
var API_CACHE = 'ipuc-api-v18.0';
var OFFLINE_CACHE = 'ipuc-offline-v18.0';
var AUDIO_CACHE = 'ipuc-audio-v18.0';
var VIDEO_CACHE = 'ipuc-video-v18.0';
var FONT_CACHE = 'ipuc-fonts-v18.0';
var REPORTS_CACHE = 'ipuc-reports-v18.0';
var SYNC_CACHE = 'ipuc-sync-v18.0';

var VERSION = '18.0';
var MAX_AGE = 30 * 24 * 60 * 60;
var MAX_IMAGE_AGE = 7 * 24 * 60 * 60;
var MAX_AUDIO_AGE = 90 * 24 * 60 * 60;
var MAX_VIDEO_AGE = 30 * 24 * 60 * 60;
var MAX_REPORTS_AGE = 1 * 24 * 60 * 60;

var PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/database.js',
    '/app.js',
    '/script.js',
    '/manifest.json',
    '/service-worker.js',
    '/ipuclafonda.png',
    '/favicon.ico',
    '/assets/avatars/default.png',
    '/assets/avatars/admin.png',
    '/assets/icons/favicon-32x32.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/apple-touch-icon.png'
];

var CACHE_PATTERNS = {
    images: [/\.(png|jpg|jpeg|gif|svg|ico|webp)$/i],
    audio: [/\.(mp3|wav|ogg|m4a)$/i],
    video: [/\.(mp4|webm)$/i],
    fonts: [/\.(woff|woff2|ttf|otf)$/i],
    api: [/\/api\//i],
    html: [/\.html$/i],
    js: [/\.js$/i],
    css: [/\.css$/i],
    reports: [/\/reports\//i, /\/reporte\//i]
};

function shouldCache(url) {
    if (!url) return false;
    if (url.indexOf('nocache=true') !== -1) return false;
    return true;
}

function matchPattern(url, patterns) {
    for (var i = 0; i < patterns.length; i++) {
        var pattern = patterns[i];
        if (typeof pattern === 'string') {
            if (url.indexOf(pattern) !== -1) return true;
        } else if (pattern instanceof RegExp) {
            if (pattern.test(url)) return true;
        }
    }
    return false;
}

function getCacheForRequest(url) {
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

// ============================================
// INSTALACION
// ============================================
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            var promises = [];
            for (var i = 0; i < PRECACHE_ASSETS.length; i++) {
                (function(url) {
                    promises.push(
                        fetch(url, { mode: 'no-cors', cache: 'no-cache' })
                            .then(function(response) {
                                if (response && (response.status === 200 || response.type === 'opaque')) {
                                    return cache.put(url, response);
                                }
                            })
                            .catch(function() {})
                    );
                })(PRECACHE_ASSETS[i]);
            }
            return Promise.all(promises).then(function() {
                return self.skipWaiting();
            });
        })
    );
});

// ============================================
// ACTIVACION
// ============================================
self.addEventListener('activate', function(event) {
    var CURRENT_CACHES = [
        CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE,
        API_CACHE, OFFLINE_CACHE, AUDIO_CACHE,
        VIDEO_CACHE, FONT_CACHE, REPORTS_CACHE, SYNC_CACHE
    ];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (CURRENT_CACHES.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// ============================================
// FETCH - ESTRATEGIAS DE CACHE
// ============================================
self.addEventListener('fetch', function(event) {
    var request = event.request;
    var url = new URL(request.url);
    var pathname = url.pathname;
    var origin = url.origin;

    if (origin !== self.location.origin &&
        url.href.indexOf('unpkg.com') === -1 &&
        url.href.indexOf('fonts.googleapis.com') === -1 &&
        url.href.indexOf('fonts.gstatic.com') === -1 &&
        url.href.indexOf('boxicons.com') === -1) {
        return;
    }

    // IMAGENES: Cache First
    if (matchPattern(pathname, CACHE_PATTERNS.images)) {
        event.respondWith(
            caches.match(request).then(function(cached) {
                if (cached) {
                    fetch(request).then(function(response) {
                        if (response && response.ok) {
                            caches.open(IMAGE_CACHE).then(function(cache) {
                                cache.put(request, response);
                            });
                        }
                    }).catch(function() {});
                    return cached;
                }
                return fetch(request).then(function(response) {
                    if (response && response.ok) {
                        var respClone = response.clone();
                        caches.open(IMAGE_CACHE).then(function(cache) {
                            cache.put(request, respClone);
                        });
                        return response;
                    }
                    return cached || new Response('', { status: 404 });
                }).catch(function() {
                    return cached || new Response('', { status: 404 });
                });
            })
        );
        return;
    }

    // JS/CSS: Cache First + Update
    if (matchPattern(pathname, CACHE_PATTERNS.js) || matchPattern(pathname, CACHE_PATTERNS.css)) {
        event.respondWith(
            caches.match(request).then(function(cached) {
                var fetchPromise = fetch(request).then(function(response) {
                    if (response && response.ok) {
                        caches.open(RUNTIME_CACHE).then(function(cache) {
                            cache.put(request, response.clone());
                        });
                    }
                    return response;
                }).catch(function() { return cached; });
                return cached || fetchPromise;
            })
        );
        return;
    }

    // HTML / NAVEGACION: Network First + Cache Fallback
    if (request.mode === 'navigate' || matchPattern(pathname, CACHE_PATTERNS.html)) {
        event.respondWith(
            fetch(request).then(function(response) {
                if (response && response.ok) {
                    caches.open(RUNTIME_CACHE).then(function(cache) {
                        cache.put(request, response.clone());
                    });
                    return response;
                }
                throw new Error('No response');
            }).catch(function() {
                return caches.match(request).then(function(cached) {
                    if (cached) return cached;
                    return caches.match('/').then(function(index) {
                        if (index) return index;
                        return new Response(
                            '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="theme-color" content="#1a237e"><title>IPUC LA FONDA - Offline</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1a237e;color:#fff;text-align:center;padding:20px;margin:0}.offline-box{max-width:400px;padding:30px;background:rgba(255,255,255,0.1);border-radius:20px}h1{font-size:1.5rem;margin-bottom:10px}p{margin-bottom:20px;opacity:0.8}button{background:#ffd700;color:#1a237e;border:none;padding:12px 24px;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer}button:hover{opacity:0.9}</style></head><body><div class="offline-box"><h1>Sin conexion</h1><p>IPUC LA FONDA esta en modo offline</p><button onclick="location.reload()">Reintentar</button><p style="font-size:0.7rem;margin-top:15px;opacity:0.5">v' + VERSION + ' &copy; 2026</p></div></body></html>',
                            { status: 503, headers: { 'Content-Type': 'text/html', 'X-Offline': 'true' } }
                        );
                    });
                });
            })
        );
        return;
    }

    // RESTO: Network First + Cache Fallback
    event.respondWith(
        fetch(request).then(function(response) {
            if (response && response.ok && shouldCache(pathname)) {
                var cacheName = getCacheForRequest(pathname);
                caches.open(cacheName).then(function(cache) {
                    cache.put(request, response.clone());
                });
            }
            return response;
        }).catch(function() {
            return caches.match(request).then(function(cached) {
                return cached || new Response(
                    JSON.stringify({ error: true, mensaje: 'Sin conexion', offline: true }),
                    { status: 503, headers: { 'Content-Type': 'application/json', 'X-Offline': 'true' } }
                );
            });
        })
    );
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', function(event) {
    var data = {
        titulo: 'IPUC LA FONDA',
        mensaje: 'Tienes una notificacion',
        url: '/',
        icono: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-icon.png',
        tipo: 'general',
        id: Date.now()
    };

    if (event.data) {
        try {
            var pushData = event.data.json();
            data.titulo = pushData.titulo || data.titulo;
            data.mensaje = pushData.mensaje || data.mensaje;
            data.url = pushData.url || data.url;
            data.tipo = pushData.tipo || data.tipo;
            data.id = pushData.id || data.id;
        } catch (e) {
            data.mensaje = event.data.text() || data.mensaje;
        }
    }

    if (data.tipo === 'reporte') {
        data.mensaje = '📋 ' + data.mensaje;
    }

    var options = {
        body: data.mensaje,
        icon: data.icono,
        badge: data.badge,
        data: {
            url: data.url,
            notificationId: data.id,
            tipo: data.tipo,
            fecha: new Date().toISOString()
        },
        vibrate: [100, 50, 100],
        tag: 'ipuc-notif-' + data.id,
        renotify: true,
        requireInteraction: data.tipo === 'reporte' || data.tipo === 'importante',
        actions: [
            { action: 'open', title: 'Abrir' },
            { action: 'close', title: 'Cerrar' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.titulo, options)
    );
});

// ============================================
// CLIC EN NOTIFICACION
// ============================================
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    if (event.action === 'close') return;

    var urlToOpen = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url.indexOf(self.location.origin) !== -1 && 'focus' in client) {
                    client.focus();
                    if (urlToOpen !== '/') client.navigate(urlToOpen);
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
// SINCRONIZACION
// ============================================
self.addEventListener('sync', function(event) {
    if (event.tag === 'sync-datos' || event.tag === 'sync-reportes') {
        event.waitUntil(
            Promise.resolve().then(function() {
                // Intentar sincronizar datos pendientes
                return true;
            })
        );
    }
});

// ============================================
// MENSAJES DESDE EL CLIENTE
// ============================================
self.addEventListener('message', function(event) {
    if (!event.data || !event.data.type) return;

    switch (event.data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
        case 'GET_VERSION':
            var port = event.ports && event.ports[0];
            if (port) {
                port.postMessage({
                    version: VERSION,
                    cache: CACHE_NAME,
                    assets: PRECACHE_ASSETS.length
                });
            }
            break;
        case 'CLEAR_CACHE':
            caches.keys().then(function(names) {
                return Promise.all(names.map(function(name) { return caches.delete(name); }));
            });
            break;
        case 'REGISTER_SYNC':
            if ('sync' in self.registration) {
                try {
                    self.registration.sync.register(event.data.tag || 'sync-datos');
                } catch (e) {}
            }
            break;
    }
});

// ============================================
// DETECCION DE CONECTIVIDAD
// ============================================
self.addEventListener('online', function() {
    self.clients.matchAll({ type: 'window' }).then(function(clients) {
        for (var i = 0; i < clients.length; i++) {
            try {
                clients[i].postMessage({ type: 'CONNECTIVITY_CHANGE', online: true });
            } catch (e) {}
        }
    });
});

self.addEventListener('offline', function() {
    self.clients.matchAll({ type: 'window' }).then(function(clients) {
        for (var i = 0; i < clients.length; i++) {
            try {
                clients[i].postMessage({ type: 'CONNECTIVITY_CHANGE', online: false });
            } catch (e) {}
        }
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
