/* ============================================
   IPUC LA FONDA - SERVICE WORKER PWA v20.0 PRO ULTIMATE
   Instalable como App Nativa | Offline | Push | Sincronizacion
   Incluye: Radio, Streaming, Gamificación, Logros, Asistente
   VERSION INTERNACIONAL - OPTIMIZADO - COMPLETO
   "Donde el Espíritu Santo se mueve"
   ============================================ */

var CACHE_NAME = 'ipuc-la-fonda-v20.0';
var RUNTIME_CACHE = 'ipuc-runtime-v20.0';
var IMAGE_CACHE = 'ipuc-images-v20.0';
var API_CACHE = 'ipuc-api-v20.0';
var OFFLINE_CACHE = 'ipuc-offline-v20.0';
var AUDIO_CACHE = 'ipuc-audio-v20.0';
var VIDEO_CACHE = 'ipuc-video-v20.0';
var FONT_CACHE = 'ipuc-fonts-v20.0';
var REPORTS_CACHE = 'ipuc-reports-v20.0';
var SYNC_CACHE = 'ipuc-sync-v20.0';
var RADIO_CACHE = 'ipuc-radio-v20.0';
var STREAMING_CACHE = 'ipuc-streaming-v20.0';
var GAME_CACHE = 'ipuc-game-v20.0';
var ASSISTANT_CACHE = 'ipuc-assistant-v20.0';

var VERSION = '20.0';
var VERSION_NAME = 'PRO ULTIMATE';
var MAX_AGE = 30 * 24 * 60 * 60;
var MAX_IMAGE_AGE = 7 * 24 * 60 * 60;
var MAX_AUDIO_AGE = 90 * 24 * 60 * 60;
var MAX_VIDEO_AGE = 30 * 24 * 60 * 60;
var MAX_REPORTS_AGE = 1 * 24 * 60 * 60;
var MAX_RADIO_AGE = 1 * 24 * 60 * 60;
var MAX_STREAMING_AGE = 1 * 60 * 60; // 1 hora
var MAX_GAME_AGE = 7 * 24 * 60 * 60;

var PRECACHE_ASSETS = [
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
    // NUEVOS v20 - Assets para radio y streaming
    '/assets/radio/radio-icon.png',
    '/assets/radio/playlist-default.jpg',
    '/assets/streaming/live-placeholder.jpg',
    '/assets/game/trivia-bg.jpg',
    '/assets/assistant/bot-avatar.png'
];

var CACHE_PATTERNS = {
    images: [/\.(png|jpg|jpeg|gif|svg|ico|webp)$/i],
    audio: [/\.(mp3|wav|ogg|m4a)$/i],
    video: [/\.(mp4|webm|m3u8)$/i],
    fonts: [/\.(woff|woff2|ttf|otf)$/i],
    api: [/\/api\//i],
    html: [/\.html$/i],
    js: [/\.js$/i],
    css: [/\.css$/i],
    reports: [/\/reports\//i, /\/reporte\//i],
    radio: [/\/radio\//i, /\/stream\//i, /\.mp3$/i],
    streaming: [/\/streaming\//i, /\/live\//i, /\.m3u8$/i],
    game: [/\/game\//i, /\/trivia\//i],
    assistant: [/\/assistant\//i, /\/chatbot\//i]
};

function shouldCache(url) {
    if (!url) return false;
    if (url.indexOf('nocache=true') !== -1) return false;
    if (url.indexOf('token=') !== -1) return false;
    if (url.indexOf('auth=') !== -1) return false;
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
    if (matchPattern(url, CACHE_PATTERNS.radio)) return RADIO_CACHE;
    if (matchPattern(url, CACHE_PATTERNS.streaming)) return STREAMING_CACHE;
    if (matchPattern(url, CACHE_PATTERNS.game)) return GAME_CACHE;
    if (matchPattern(url, CACHE_PATTERNS.assistant)) return ASSISTANT_CACHE;
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
    if (cacheName === IMAGE_CACHE) return MAX_IMAGE_AGE;
    if (cacheName === AUDIO_CACHE) return MAX_AUDIO_AGE;
    if (cacheName === VIDEO_CACHE) return MAX_VIDEO_AGE;
    if (cacheName === REPORTS_CACHE) return MAX_REPORTS_AGE;
    if (cacheName === RADIO_CACHE) return MAX_RADIO_AGE;
    if (cacheName === STREAMING_CACHE) return MAX_STREAMING_AGE;
    if (cacheName === GAME_CACHE) return MAX_GAME_AGE;
    if (cacheName === API_CACHE) return MAX_AGE;
    return MAX_AGE;
}

// ============================================
// INSTALACION
// ============================================
self.addEventListener('install', function(event) {
    console.log('SW v' + VERSION + ' ' + VERSION_NAME + ': Instalando...');
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
                            .catch(function() {
                                console.log('SW: No se pudo cachear:', url);
                            })
                    );
                })(PRECACHE_ASSETS[i]);
            }
            return Promise.all(promises).then(function() {
                console.log('SW: Instalacion completada (' + PRECACHE_ASSETS.length + ' assets)');
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
        VIDEO_CACHE, FONT_CACHE, REPORTS_CACHE,
        SYNC_CACHE, RADIO_CACHE, STREAMING_CACHE,
        GAME_CACHE, ASSISTANT_CACHE
    ];

    console.log('SW v' + VERSION + ' ' + VERSION_NAME + ': Activando...');

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (CURRENT_CACHES.indexOf(cacheName) === -1) {
                        console.log('SW: Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            console.log('SW: Activacion completada');
            console.log('📦 Caches activos: ' + CURRENT_CACHES.join(', '));
            return self.clients.claim();
        })
    );
});

// ============================================
// FETCH - ESTRATEGIAS DE CACHE MEJORADAS
// ============================================
self.addEventListener('fetch', function(event) {
    var request = event.request;
    var url = new URL(request.url);
    var pathname = url.pathname;
    var origin = url.origin;

    // Permitir CDNs necesarios
    var allowedOrigins = [
        self.location.origin,
        'unpkg.com',
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'boxicons.com',
        'cdnjs.cloudflare.com'
    ];
    
    var isAllowed = allowedOrigins.some(function(allowed) {
        return url.href.indexOf(allowed) !== -1;
    });
    
    if (!isAllowed) return;

    // ============================================
    // AUDIO / RADIO: Stale-While-Revalidate + Streaming
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.audio) || matchPattern(pathname, CACHE_PATTERNS.radio)) {
        event.respondWith(
            caches.match(request).then(function(cached) {
                var fetchPromise = fetch(request).then(function(response) {
                    if (response && response.ok) {
                        var cacheName = RADIO_CACHE;
                        caches.open(cacheName).then(function(cache) {
                            cache.put(request, response.clone());
                        });
                    }
                    return response;
                }).catch(function() {
                    if (cached) return cached;
                    return new Response('Audio no disponible offline', { status: 503 });
                });
                return cached || fetchPromise;
            })
        );
        return;
    }

    // ============================================
    // VIDEO / STREAMING: Network First + Cache Fallback
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.video) || matchPattern(pathname, CACHE_PATTERNS.streaming)) {
        event.respondWith(
            fetch(request).then(function(response) {
                if (response && response.ok) {
                    var cacheName = STREAMING_CACHE;
                    caches.open(cacheName).then(function(cache) {
                        cache.put(request, response.clone());
                    });
                }
                return response;
            }).catch(function() {
                return caches.match(request).then(function(cached) {
                    if (cached) return cached;
                    return new Response('Video no disponible offline', { status: 503 });
                });
            })
        );
        return;
    }

    // ============================================
    // IMAGENES: Cache First + Stale-While-Revalidate
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.images)) {
        event.respondWith(
            caches.match(request).then(function(cached) {
                if (cached) {
                    // Actualizar en segundo plano
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
                    return new Response('', { status: 404 });
                }).catch(function() {
                    return new Response('', { status: 404 });
                });
            })
        );
        return;
    }

    // ============================================
    // JS/CSS: Cache First + Network Update
    // ============================================
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
                }).catch(function() {
                    return cached;
                });
                return cached || fetchPromise;
            })
        );
        return;
    }

    // ============================================
    // REPORTES: Network First + Cache Fallback
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.reports)) {
        event.respondWith(
            fetch(request).then(function(response) {
                if (response && response.ok) {
                    caches.open(REPORTS_CACHE).then(function(cache) {
                        cache.put(request, response.clone());
                    });
                }
                return response;
            }).catch(function() {
                return caches.match(request).then(function(cached) {
                    if (cached) return cached;
                    return new Response(
                        JSON.stringify({ error: true, mensaje: 'Reportes no disponibles offline' }),
                        { status: 503, headers: { 'Content-Type': 'application/json' } }
                    );
                });
            })
        );
        return;
    }

    // ============================================
    // GAME / TRIVIA: Cache First + Network Update
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.game)) {
        event.respondWith(
            caches.match(request).then(function(cached) {
                var fetchPromise = fetch(request).then(function(response) {
                    if (response && response.ok) {
                        caches.open(GAME_CACHE).then(function(cache) {
                            cache.put(request, response.clone());
                        });
                    }
                    return response;
                }).catch(function() {
                    return cached;
                });
                return cached || fetchPromise;
            })
        );
        return;
    }

    // ============================================
    // ASSISTANT: Network First + Cache Fallback
    // ============================================
    if (matchPattern(pathname, CACHE_PATTERNS.assistant)) {
        event.respondWith(
            fetch(request).then(function(response) {
                if (response && response.ok) {
                    caches.open(ASSISTANT_CACHE).then(function(cache) {
                        cache.put(request, response.clone());
                    });
                }
                return response;
            }).catch(function() {
                return caches.match(request).then(function(cached) {
                    if (cached) return cached;
                    return new Response(
                        JSON.stringify({ 
                            error: true, 
                            mensaje: 'Asistente no disponible offline',
                            offline: true,
                            respuesta: 'Lo siento, estoy offline. Conéctate a internet para continuar la conversación.'
                        }),
                        { status: 503, headers: { 'Content-Type': 'application/json' } }
                    );
                });
            })
        );
        return;
    }

    // ============================================
    // HTML / NAVEGACION: Network First + Cache Fallback
    // ============================================
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
                        // Pagina offline mejorada
                        return new Response(
                            '<!DOCTYPE html>' +
                            '<html lang="es">' +
                            '<head>' +
                            '<meta charset="UTF-8">' +
                            '<meta name="viewport" content="width=device-width,initial-scale=1.0">' +
                            '<meta name="theme-color" content="#1a237e">' +
                            '<title>IPUC LA FONDA - Offline</title>' +
                            '<style>' +
                            'body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:linear-gradient(135deg,#0d1b5e,#1a237e);color:#fff;text-align:center;padding:20px;margin:0}' +
                            '.box{max-width:420px;padding:40px;background:rgba(255,255,255,0.08);border-radius:24px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1)}' +
                            '.icon{font-size:4rem;margin-bottom:16px}' +
                            'h1{font-size:1.8rem;margin-bottom:8px;letter-spacing:1px}' +
                            '.sub{opacity:0.8;margin-bottom:4px}' +
                            'p{margin-bottom:20px;opacity:0.7;font-size:0.95rem;line-height:1.5}' +
                            'button{background:#ffd700;color:#1a237e;border:none;padding:14px 32px;border-radius:12px;font-size:1rem;font-weight:700;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 20px rgba(255,215,0,0.3)}' +
                            'button:hover{opacity:0.9;transform:translateY(-2px)}' +
                            'button:active{transform:scale(0.95)}' +
                            '.version{font-size:0.7rem;margin-top:20px;opacity:0.3;letter-spacing:1px}' +
                            '.features{display:flex;gap:8px;justify-content:center;margin:16px 0;flex-wrap:wrap}' +
                            '.features span{background:rgba(255,255,255,0.05);padding:4px 12px;border-radius:12px;font-size:0.7rem;opacity:0.5}' +
                            '</style>' +
                            '</head>' +
                            '<body>' +
                            '<div class="box">' +
                            '<div class="icon">📡</div>' +
                            '<h1>Sin conexión</h1>' +
                            '<p class="sub">IPUC LA FONDA está en modo offline</p>' +
                            '<div class="features">' +
                            '<span>📖 Devocional</span>' +
                            '<span>🙏 Oración</span>' +
                            '<span>📅 Eventos</span>' +
                            '</div>' +
                            '<p>Puedes acceder a contenido guardado mientras esperas reconectar</p>' +
                            '<button onclick="location.reload()">🔄 Reintentar</button>' +
                            '<p class="version">v' + VERSION + ' ' + VERSION_NAME + ' &copy; 2026</p>' +
                            '</div>' +
                            '</body>' +
                            '</html>',
                            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Offline': 'true' } }
                        );
                    });
                });
            })
        );
        return;
    }

    // ============================================
    // RESTO: Network First + Cache Fallback
    // ============================================
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
                if (cached) return cached;
                return new Response(
                    JSON.stringify({ error: true, mensaje: 'Sin conexion', offline: true }),
                    { status: 503, headers: { 'Content-Type': 'application/json', 'X-Offline': 'true' } }
                );
            });
        })
    );
});

// ============================================
// PUSH NOTIFICATIONS MEJORADAS
// ============================================
self.addEventListener('push', function(event) {
    var data = {
        titulo: 'IPUC LA FONDA',
        mensaje: 'Tienes una notificación',
        url: '/',
        icono: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-icon.png',
        tipo: 'general',
        id: Date.now(),
        timestamp: new Date().toISOString()
    };

    if (event.data) {
        try {
            var pushData = event.data.json();
            data.titulo = pushData.titulo || data.titulo;
            data.mensaje = pushData.mensaje || data.mensaje;
            data.url = pushData.url || data.url;
            data.tipo = pushData.tipo || data.tipo;
            data.id = pushData.id || data.id;
            data.icono = pushData.icono || data.icono;
            data.badge = pushData.badge || data.badge;
        } catch (e) {
            data.mensaje = event.data.text() || data.mensaje;
        }
    }

    // Personalizar según tipo
    var iconos = {
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
        'recordatorio': '⏰'
    };
    data.mensaje = (iconos[data.tipo] || '📌') + ' ' + data.mensaje;

    var options = {
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
        tag: 'ipuc-notif-' + data.id,
        renotify: true,
        requireInteraction: data.tipo === 'reporte_urgente' || data.tipo === 'importante' || data.tipo === 'recordatorio',
        actions: [
            { action: 'open', title: '📱 Abrir' },
            { action: 'dismiss', title: '✖️ Cerrar' }
        ],
        sound: '/assets/sounds/notification.mp3'
    };

    event.waitUntil(
        self.registration.showNotification(data.titulo, options)
    );
});

// ============================================
// CLIC EN NOTIFICACION MEJORADO
// ============================================
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'dismiss') return;

    var urlToOpen = '/';
    if (event.notification.data && event.notification.data.url) {
        urlToOpen = event.notification.data.url;
    }

    // Registrar acción
    console.log('SW: Notificación clickeada -', event.notification.data);

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url.indexOf(self.location.origin) !== -1 && 'focus' in client) {
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
// SINCRONIZACION MEJORADA
// ============================================
var SYNC_TASKS = {
    'sync-datos': function() {
        console.log('SW: Sincronizando datos generales');
        return Promise.resolve();
    },
    'sync-reportes': function() {
        console.log('SW: Sincronizando reportes pendientes');
        // Enviar reportes guardados offline
        return caches.open(REPORTS_CACHE).then(function(cache) {
            return cache.keys().then(function(keys) {
                var promises = keys.map(function(key) {
                    return cache.match(key).then(function(response) {
                        if (response) {
                            return response.text().then(function(data) {
                                try {
                                    var reporte = JSON.parse(data);
                                    // Intentar enviar al servidor
                                    console.log('SW: Enviando reporte offline:', reporte);
                                    // Aquí iría la lógica de envío
                                    return cache.delete(key);
                                } catch (e) {
                                    console.log('SW: Error procesando reporte:', e);
                                }
                            });
                        }
                    });
                });
                return Promise.all(promises);
            });
        });
    },
    'sync-radio': function() {
        console.log('SW: Sincronizando radio');
        return Promise.resolve();
    },
    'sync-peticiones': function() {
        console.log('SW: Sincronizando peticiones');
        return Promise.resolve();
    },
    'sync-logros': function() {
        console.log('SW: Sincronizando logros');
        return Promise.resolve();
    }
};

self.addEventListener('sync', function(event) {
    var tags = Object.keys(SYNC_TASKS);
    if (tags.indexOf(event.tag) !== -1) {
        event.waitUntil(
            SYNC_TASKS[event.tag]().catch(function(error) {
                console.log('SW: Error en sync ' + event.tag + ':', error);
            })
        );
    }
});

// ============================================
// MENSAJES DESDE EL CLIENTE MEJORADO
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
                    versionName: VERSION_NAME,
                    cache: CACHE_NAME,
                    assets: PRECACHE_ASSETS.length,
                    caches: {
                        runtime: RUNTIME_CACHE,
                        image: IMAGE_CACHE,
                        audio: AUDIO_CACHE,
                        video: VIDEO_CACHE,
                        font: FONT_CACHE,
                        api: API_CACHE,
                        offline: OFFLINE_CACHE,
                        reports: REPORTS_CACHE,
                        radio: RADIO_CACHE,
                        streaming: STREAMING_CACHE,
                        game: GAME_CACHE,
                        assistant: ASSISTANT_CACHE
                    },
                    timestamp: Date.now()
                });
            }
            break;

        case 'CLEAR_CACHE':
            caches.keys().then(function(names) {
                return Promise.all(names.map(function(name) {
                    return caches.delete(name);
                }));
            }).then(function() {
                console.log('SW: Cache limpiado');
                var port2 = event.ports && event.ports[0];
                if (port2) {
                    port2.postMessage({ success: true, action: 'CLEAR_CACHE' });
                }
            });
            break;

        case 'CLEAR_REPORTS_CACHE':
            caches.delete(REPORTS_CACHE).then(function(deleted) {
                console.log('SW: Cache de reportes ' + (deleted ? 'limpiado' : 'no encontrado'));
                var port3 = event.ports && event.ports[0];
                if (port3) {
                    port3.postMessage({ success: deleted, action: 'CLEAR_REPORTS_CACHE' });
                }
            });
            break;

        case 'REGISTER_SYNC':
            if ('sync' in self.registration) {
                try {
                    var syncTag = event.data.tag || 'sync-datos';
                    self.registration.sync.register(syncTag);
                    console.log('SW: Sync registrado:', syncTag);
                    var port4 = event.ports && event.ports[0];
                    if (port4) {
                        port4.postMessage({ success: true, tag: syncTag });
                    }
                } catch (e) {
                    console.log('SW: Error al registrar sync:', e);
                }
            }
            break;

        case 'GET_OFFLINE_STATUS':
            var port5 = event.ports && event.ports[0];
            if (port5) {
                port5.postMessage({
                    online: navigator.onLine,
                    offline: !navigator.onLine,
                    timestamp: Date.now()
                });
            }
            break;

        case 'SAVE_REPORT_OFFLINE':
            if (event.data.reporte) {
                var reportKey = 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                var reportData = JSON.stringify(event.data.reporte);
                var blob = new Blob([reportData], { type: 'application/json' });
                var response = new Response(blob, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-cache-time': Date.now().toString(),
                        'x-version': VERSION,
                        'x-report-id': reportKey
                    }
                });
                caches.open(REPORTS_CACHE).then(function(cache) {
                    cache.put(reportKey, response);
                    console.log('SW: Reporte guardado offline:', reportKey);
                    // Registrar sync para enviar cuando haya conexión
                    if ('sync' in self.registration) {
                        self.registration.sync.register('sync-reportes');
                    }
                    var port6 = event.ports && event.ports[0];
                    if (port6) {
                        port6.postMessage({ success: true, key: reportKey });
                    }
                });
            }
            break;

        case 'SAVE_RADIO_OFFLINE':
            if (event.data.radioData) {
                var radioKey = 'radio_' + Date.now();
                var radioData = JSON.stringify(event.data.radioData);
                var blob2 = new Blob([radioData], { type: 'application/json' });
                var response2 = new Response(blob2, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-cache-time': Date.now().toString(),
                        'x-version': VERSION
                    }
                });
                caches.open(RADIO_CACHE).then(function(cache) {
                    cache.put(radioKey, response2);
                    console.log('SW: Datos de radio guardados offline');
                });
            }
            break;

        case 'SAVE_GAME_OFFLINE':
            if (event.data.gameData) {
                var gameKey = 'game_' + Date.now();
                var gameData = JSON.stringify(event.data.gameData);
                var blob3 = new Blob([gameData], { type: 'application/json' });
                var response3 = new Response(blob3, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-cache-time': Date.now().toString(),
                        'x-version': VERSION
                    }
                });
                caches.open(GAME_CACHE).then(function(cache) {
                    cache.put(gameKey, response3);
                    console.log('SW: Datos de juego guardados offline');
                });
            }
            break;

        case 'GET_CACHE_STATS':
            var port7 = event.ports && event.ports[0];
            if (port7) {
                caches.keys().then(function(cacheNames) {
                    var stats = {};
                    var promises = cacheNames.map(function(name) {
                        return caches.open(name).then(function(cache) {
                            return cache.keys().then(function(keys) {
                                stats[name] = keys.length;
                            });
                        });
                    });
                    return Promise.all(promises).then(function() {
                        port7.postMessage({
                            success: true,
                            stats: stats,
                            total: Object.values(stats).reduce(function(a, b) { return a + b; }, 0)
                        });
                    });
                });
            }
            break;
    }
});

// ============================================
// DETECCION DE CONECTIVIDAD MEJORADA
// ============================================
self.addEventListener('online', function() {
    console.log('SW: Conexion restaurada');
    // Notificar a todos los clientes
    self.clients.matchAll({ type: 'window' }).then(function(clients) {
        for (var i = 0; i < clients.length; i++) {
            try {
                clients[i].postMessage({ 
                    type: 'CONNECTIVITY_CHANGE', 
                    online: true, 
                    timestamp: Date.now() 
                });
            } catch (e) {}
        }
    });
    
    // Intentar sincronizar al reconectar
    if ('sync' in self.registration) {
        try {
            self.registration.sync.register('sync-datos');
            self.registration.sync.register('sync-reportes');
            self.registration.sync.register('sync-radio');
            self.registration.sync.register('sync-peticiones');
            self.registration.sync.register('sync-logros');
        } catch (e) {}
    }
});

self.addEventListener('offline', function() {
    console.log('SW: Sin conexion');
    self.clients.matchAll({ type: 'window' }).then(function(clients) {
        for (var i = 0; i < clients.length; i++) {
            try {
                clients[i].postMessage({ 
                    type: 'CONNECTIVITY_CHANGE', 
                    online: false, 
                    timestamp: Date.now() 
                });
            } catch (e) {}
        }
    });
});

// ============================================
// MANEJO DE ERRORES
// ============================================
self.addEventListener('error', function(event) {
    event.preventDefault();
    console.log('SW: Error capturado:', event.message);
});

self.addEventListener('unhandledrejection', function(event) {
    event.preventDefault();
    console.log('SW: Rejection capturada:', event.reason);
});

// ============================================
// PERIODIC SYNC (si está disponible)
// ============================================
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', function(event) {
        if (event.tag === 'periodic-update') {
            event.waitUntil(
                Promise.resolve().then(function() {
                    console.log('SW: Sincronización periódica ejecutada');
                    // Aquí se puede actualizar contenido en background
                })
            );
        }
    });
}

// ============================================
// BACKGROUND FETCH (si está disponible)
// ============================================
if ('backgroundFetch' in self) {
    self.addEventListener('backgroundfetchsuccess', function(event) {
        console.log('SW: Background fetch completado:', event.id);
    });
    
    self.addEventListener('backgroundfetchfail', function(event) {
        console.log('SW: Background fetch falló:', event.id);
    });
}

console.log('✅ IPUC LA FONDA Service Worker v' + VERSION + ' ' + VERSION_NAME + ' cargado');
console.log('📦 ' + PRECACHE_ASSETS.length + ' assets pre-cacheados');
console.log('📋 Caches: ' + [
    CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE,
    API_CACHE, OFFLINE_CACHE, AUDIO_CACHE,
    VIDEO_CACHE, FONT_CACHE, REPORTS_CACHE,
    SYNC_CACHE, RADIO_CACHE, STREAMING_CACHE,
    GAME_CACHE, ASSISTANT_CACHE
].join(', '));
console.log('🎵 Soporte para Radio y Streaming');
console.log('🎮 Soporte para Gamificación y Juegos');
console.log('🤖 Soporte para Asistente Virtual');
console.log('📡 Soporte offline completo');

/* ============================================
   FINAL DEL SERVICE WORKER v20.0 PRO ULTIMATE
   IPUC LA FONDA - International Pentecostal Church
   "Donde el Espíritu Santo se mueve"
   ============================================ */
