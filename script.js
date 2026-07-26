/* ============================================
   IPUC LA FONDA - SCRIPT.JS v20.0 PRO ULTIMATE
   Web App Profesional - Sistema Completo
   Incluye: Radio, Streaming, Gamificación, IA, Logros
   VERSION CORREGIDA - SIN ERRORES
   ============================================ */

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
var CONFIG = {
    VERSION: '20.0',
    VERSION_NAME: 'PRO ULTIMATE',
    TITULOS_PAGINAS: {
        'inicio': 'Inicio',
        'horarios': 'Horarios',
        'asistencia': 'Asistencia',
        'noticias': 'Noticias',
        'eventos': 'Eventos',
        'publicaciones': 'Publicaciones',
        'perfil': 'Mi Perfil',
        'configuracion': 'Configuración',
        'gestion-reportes': 'Gestión de Reportes',
        'mis-reportes': 'Mis Reportes',
        'dashboard': 'Dashboard',
        'sistema': 'Sistema',
        'peticiones': 'Peticiones',
        'biblioteca': 'Biblioteca',
        'podcast': 'Podcast',
        'galeria': 'Galería',
        'chat': 'Chat',
        'directorio': 'Directorio',
        'donaciones': 'Donaciones',
        'devocional': 'Devocional',
        'encuestas': 'Encuestas',
        'radio': 'Radio en Vivo',
        'streaming': 'Transmisión en Vivo',
        'mapa': 'Ubicación',
        'oracion': 'Cadena de Oración',
        'grupos': 'Grupos y Células',
        'lectura-biblica': 'Plan de Lectura',
        'concordancia': 'Concordancia Bíblica',
        'himnario': 'Himnario',
        'diario-espiritual': 'Diario Espiritual',
        'logros': 'Logros',
        'trivia': 'Trivia Bíblica',
        'juegos': 'Juegos',
        'ranking': 'Ranking',
        'playlist': 'Playlist de Adoración',
        'blog': 'Blog/Noticias',
        'muro-bendiciones': 'Muro de Bendiciones',
        'recursos': 'Recursos',
        'ofrendas': 'Ofrendas',
        'informes': 'Informes PDF',
        'admin-dashboard': 'Dashboard Admin',
        'analiticas': 'Analíticas',
        'gestion-usuarios': 'Gestión de Usuarios',
        'gestion-eventos': 'Gestión de Eventos',
        'gestion-noticias': 'Gestión de Noticias'
    },
    VERSES: [
        { verse: 'Porque de tal manera amó Dios al mundo...', ref: 'Juan 3:16' },
        { verse: 'Jehová es mi pastor; nada me faltará.', ref: 'Salmo 23:1' },
        { verse: 'Todo lo puedo en Cristo que me fortalece.', ref: 'Filipenses 4:13' },
        { verse: 'El Señor es mi luz y mi salvación; ¿de quién temeré?', ref: 'Salmo 27:1' },
        { verse: 'No temas, porque yo estoy contigo...', ref: 'Isaías 41:10' }
    ]
};

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================
var APP_STATE = {
    currentPage: 'inicio',
    usuario: null,
    token: null,
    rol: null,
    tema: 'light',
    sidebarOpen: false,
    sidebarLocked: false,
    notificationsOpen: false,
    reportsPanelOpen: false,
    userDropdownOpen: false,
    fabMenuOpen: false,
    searchBarOpen: false,
    radioPanelOpen: false,
    streamingPanelOpen: false,
    qrPanelOpen: false,
    assistantOpen: false,
    contadorInterval: null,
    fechaInterval: null,
    notificacionesNoLeidas: 0,
    reportsPendientes: 0,
    pendingConfirmation: null,
    isLoading: false,
    isOnline: navigator.onLine,
    idioma: 'es',
    publicaciones: [],
    reportes: [],
    eventos: [],
    peticiones: [],
    oraciones: [],
    bendiciones: [],
    logrosDesbloqueados: [],
    nivel: 1,
    xp: 0,
    xpSiguiente: 100,
    radioPlaying: false,
    radioCurrentStation: 0,
    gameScore: 0,
    gameLevel: 1,
    gameCurrentQuestion: 0,
    gameCorrect: 0,
    gameInProgress: false,
    currentGameQuestions: [],
    streamingActive: false,
    viewersCount: 0,
    chatMessages: [],
    usuariosActivos: 5,
    totalMiembros: 100,
    totalOraciones: 50,
    playlistCurrent: 0,
    lecturasCompletadas: 0,
    lecturasTotal: 365,
    diaryEntries: [],
    qrGenerated: false,
    isAdmin: false
};

// ============================================
// TOASTS Y NOTIFICACIONES
// ============================================
function showToast(mensaje, tipo, duracion) {
    tipo = tipo || 'info';
    duracion = duracion || 3000;
    var c = document.getElementById('toast-container');
    if (!c) return;
    var t = document.createElement('div');
    t.className = 'toast ' + tipo;
    var iconos = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    t.innerHTML = (iconos[tipo] || '📌') + ' ' + (mensaje || '');
    c.appendChild(t);
    setTimeout(function() {
        if (t.parentNode) {
            t.classList.add('toast-hide');
            setTimeout(function() { if (t.parentNode) t.remove(); }, 300);
        }
    }, duracion);
}

// ============================================
// TEMAS Y APARIENCIA
// ============================================
function toggleTema() {
    APP_STATE.tema = APP_STATE.tema === 'light' ? 'dark' : 'light';
    aplicarTema(APP_STATE.tema);
    try { localStorage.setItem('ipuc20_tema', APP_STATE.tema); } catch (e) {}
    showToast('Tema cambiado a ' + (APP_STATE.tema === 'dark' ? 'oscuro' : 'claro'), 'info');
}

function aplicarTema(t) {
    try {
        document.documentElement.setAttribute('data-theme', t);
        var icon = document.querySelector('#theme-toggle i');
        if (icon) icon.className = t === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
    } catch (e) {}
}

// ============================================
// IDIOMAS
// ============================================
function cambiarIdioma(lang) {
    var idiomas = { es: 'ES', en: 'EN', pt: 'PT', fr: 'FR', de: 'DE' };
    if (!idiomas[lang]) return;
    APP_STATE.idioma = lang;
    try { localStorage.setItem('ipuc20_idioma', lang); } catch (e) {}
    var btns = document.querySelectorAll('.lang-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.toggle('active', btns[i].getAttribute('data-lang') === lang);
    }
    showToast('Idioma cambiado a ' + lang.toUpperCase(), 'info');
}

// ============================================
// NAVEGACIÓN
// ============================================
function navegarA(page) {
    if (!page || APP_STATE.isLoading) return;
    APP_STATE.currentPage = page;
    APP_STATE.isLoading = true;

    var items = document.querySelectorAll('.nav-item[data-page]');
    for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle('active', items[i].getAttribute('data-page') === page);
    }

    var titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = CONFIG.TITULOS_PAGINAS[page] || page;

    var bc = document.getElementById('breadcrumb-current');
    if (bc) bc.textContent = CONFIG.TITULOS_PAGINAS[page] || page;

    cargarPagina(page);
    if (window.innerWidth < 1024) cerrarSidebar();
    APP_STATE.isLoading = false;
    cerrarPaneles();
}

function cerrarPaneles() {
    var paneles = ['radio-quick-panel', 'streaming-panel', 'qr-panel', 'reports-quick-panel', 'notification-panel'];
    for (var i = 0; i < paneles.length; i++) {
        var p = document.getElementById(paneles[i]);
        if (p && !p.classList.contains('hidden')) p.classList.add('hidden');
    }
    APP_STATE.radioPanelOpen = false;
    APP_STATE.streamingPanelOpen = false;
    APP_STATE.qrPanelOpen = false;
    APP_STATE.reportsPanelOpen = false;
    APP_STATE.notificationsOpen = false;
}

// ============================================
// APLICACIÓN PRINCIPAL
// ============================================
function mostrarApp() {
    var w = document.getElementById('welcome-screen');
    var a = document.getElementById('app');
    var f = document.getElementById('fab-main');
    if (w) w.classList.add('hidden');
    if (a) a.classList.remove('hidden');
    if (f) f.classList.remove('hidden');
    actualizarSidebarUsuario();
    navegarA('inicio');
    iniciarContador();
    actualizarBadgeReportes();
    actualizarEstadisticas();
    cargarVersiculoDelDia();
    cargarPlaylist();
    iniciarRadio();
}

function mostrarBienvenida() {
    var a = document.getElementById('app');
    var w = document.getElementById('welcome-screen');
    if (a) a.classList.add('hidden');
    if (w) w.classList.remove('hidden');
}

// ============================================
// SIDEBAR
// ============================================
function toggleSidebar() { APP_STATE.sidebarOpen ? cerrarSidebar() : abrirSidebar(); }

function abrirSidebar() {
    APP_STATE.sidebarOpen = true;
    var s = document.getElementById('sidebar');
    var o = document.getElementById('sidebar-overlay');
    if (s) s.classList.add('open');
    if (o) o.classList.remove('hidden');
}

function cerrarSidebar() {
    if (APP_STATE.sidebarLocked) return;
    APP_STATE.sidebarOpen = false;
    var s = document.getElementById('sidebar');
    var o = document.getElementById('sidebar-overlay');
    if (s) s.classList.remove('open');
    if (o) o.classList.add('hidden');
}

function manejarResponsiveSidebar() {
    if (window.innerWidth >= 1024) {
        APP_STATE.sidebarLocked = true;
        var s = document.getElementById('sidebar');
        if (s) s.classList.add('open');
        var o = document.getElementById('sidebar-overlay');
        if (o) o.classList.add('hidden');
    } else {
        APP_STATE.sidebarLocked = false;
        if (!APP_STATE.sidebarOpen) {
            var sb = document.getElementById('sidebar');
            if (sb) sb.classList.remove('open');
        }
    }
}

function actualizarSidebarUsuario() {
    if (!APP_STATE.usuario) return;
    var m = document.getElementById('user-mini');
    if (!m) return;
    var img = m.querySelector('img');
    var nm = m.querySelector('.user-name');
    var rl = m.querySelector('.user-role');
    var lvl = document.getElementById('user-level');
    var xpBar = document.getElementById('user-xp-bar');

    if (img) img.src = APP_STATE.usuario.foto || 'assets/avatars/default.png';
    if (nm) nm.textContent = APP_STATE.usuario.nombre || 'Usuario';
    if (rl) {
        var roles = { admin: '👑 Administrador', invitado: '👤 Invitado', usuario: '👤 Miembro' };
        rl.textContent = roles[APP_STATE.rol] || 'Miembro';
    }
    if (lvl) lvl.textContent = 'Lv.' + APP_STATE.nivel;
    if (xpBar) {
        var porcentaje = Math.min((APP_STATE.xp / APP_STATE.xpSiguiente) * 100, 100);
        xpBar.style.width = porcentaje + '%';
    }

    var am = document.getElementById('admin-menu');
    if (am) am.classList.toggle('hidden', APP_STATE.rol !== 'admin');
}

// ============================================
// RADIO EN VIVO
// ============================================
function iniciarRadio() {
    var radioToggle = document.getElementById('radio-toggle');
    if (radioToggle) {
        radioToggle.addEventListener('click', function() { toggleRadioPanel(); });
    }

    var radioPlay = document.getElementById('radio-play-toggle');
    if (radioPlay) {
        radioPlay.addEventListener('click', function() { toggleRadio(); });
    }

    var radioPlayMain = document.getElementById('radio-play-main');
    if (radioPlayMain) {
        radioPlayMain.addEventListener('click', function() { toggleRadio(); });
    }

    var radioPrev = document.getElementById('radio-prev');
    if (radioPrev) {
        radioPrev.addEventListener('click', function() { cambiarEstacionRadio(-1); });
    }

    var radioNext = document.getElementById('radio-next');
    if (radioNext) {
        radioNext.addEventListener('click', function() { cambiarEstacionRadio(1); });
    }

    cargarPlaylist();
}

function toggleRadioPanel() {
    APP_STATE.radioPanelOpen = !APP_STATE.radioPanelOpen;
    var p = document.getElementById('radio-quick-panel');
    if (p) p.classList.toggle('hidden', !APP_STATE.radioPanelOpen);
    if (APP_STATE.radioPanelOpen) {
        cerrarOtrosPaneles('radio');
    }
}

function toggleRadio() {
    APP_STATE.radioPlaying = !APP_STATE.radioPlaying;
    var icon1 = document.querySelector('#radio-play-toggle i');
    var icon2 = document.querySelector('#radio-play-main i');
    var status = document.getElementById('radio-status');

    if (APP_STATE.radioPlaying) {
        if (icon1) icon1.className = 'bx bx-pause-circle';
        if (icon2) icon2.className = 'bx bx-pause-circle';
        if (status) status.textContent = '🔴 En Vivo';
        showToast('Radio iniciada', 'success');
        iniciarAnimacionRadio(true);
    } else {
        if (icon1) icon1.className = 'bx bx-play-circle';
        if (icon2) icon2.className = 'bx bx-play-circle';
        if (status) status.textContent = '⏸️ Pausa';
        iniciarAnimacionRadio(false);
    }
}

function cambiarEstacionRadio(direccion) {
    var stations = [
        { name: 'Radio IPUC', url: 'https://radio.ipuc.com/stream', genre: 'Cristiana' },
        { name: 'Alabanza Global', url: 'https://alabanza.com/stream', genre: 'Alabanza' },
        { name: 'Adoración Profunda', url: 'https://adoracion.com/stream', genre: 'Adoración' }
    ];
    APP_STATE.radioCurrentStation = (APP_STATE.radioCurrentStation + direccion + stations.length) % stations.length;
    var stationName = document.querySelector('.radio-station');
    if (stationName) stationName.textContent = stations[APP_STATE.radioCurrentStation].name;
    showToast('Cambiando a ' + stations[APP_STATE.radioCurrentStation].name, 'info');
    if (APP_STATE.radioPlaying) {
        // Reiniciar la radio con nueva estación
    }
}

function iniciarAnimacionRadio(active) {
    var waves = document.querySelectorAll('.radio-wave span');
    for (var i = 0; i < waves.length; i++) {
        waves[i].style.animationPlayState = active ? 'running' : 'paused';
    }
}

function cargarPlaylist() {
    var list = document.querySelector('#playlist-songs');
    if (!list) return;
    var songs = [
        { title: 'Santo Espíritu', artist: 'IPUC LA FONDA', duration: '4:32' },
        { title: 'Alabanzas al Rey', artist: 'IPUC LA FONDA', duration: '5:15' },
        { title: 'Adoración Profunda', artist: 'IPUC LA FONDA', duration: '6:08' },
        { title: 'Glorioso Día', artist: 'IPUC LA FONDA', duration: '4:45' },
        { title: 'Cordero de Dios', artist: 'IPUC LA FONDA', duration: '5:20' },
        { title: 'Grande es el Señor', artist: 'IPUC LA FONDA', duration: '4:55' }
    ];
    var html = '';
    for (var i = 0; i < songs.length; i++) {
        html += '<li data-index="' + i + '" onclick="reproducirCancion(' + i + ')">' +
            '<i class="bx bx-play-circle"></i> ' + songs[i].title + ' - ' + songs[i].artist +
            '</li>';
    }
    list.innerHTML = html;
}

function reproducirCancion(index) {
    APP_STATE.playlistCurrent = index;
    var items = document.querySelectorAll('#playlist-songs li');
    for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle('active', i === index);
    }
    var songs = [
        { title: 'Santo Espíritu', artist: 'IPUC LA FONDA' },
        { title: 'Alabanzas al Rey', artist: 'IPUC LA FONDA' },
        { title: 'Adoración Profunda', artist: 'IPUC LA FONDA' },
        { title: 'Glorioso Día', artist: 'IPUC LA FONDA' },
        { title: 'Cordero de Dios', artist: 'IPUC LA FONDA' },
        { title: 'Grande es el Señor', artist: 'IPUC LA FONDA' }
    ];
    var song = songs[index];
    var playing = document.getElementById('radio-playing');
    var artist = document.getElementById('radio-artist');
    if (playing) playing.textContent = song.title;
    if (artist) artist.textContent = song.artist;
    showToast('Reproduciendo: ' + song.title, 'info');
    if (!APP_STATE.radioPlaying) toggleRadio();
}

function cerrarOtrosPaneles(excepto) {
    var paneles = {
        'radio': 'radio-quick-panel',
        'streaming': 'streaming-panel',
        'qr': 'qr-panel',
        'reports': 'reports-quick-panel'
    };
    for (var key in paneles) {
        if (key !== excepto) {
            var p = document.getElementById(paneles[key]);
            if (p && !p.classList.contains('hidden')) p.classList.add('hidden');
        }
    }
}

// ============================================
// STREAMING EN VIVO
// ============================================
function toggleStreamingPanel() {
    APP_STATE.streamingPanelOpen = !APP_STATE.streamingPanelOpen;
    var p = document.getElementById('streaming-panel');
    if (p) p.classList.toggle('hidden', !APP_STATE.streamingPanelOpen);
    if (APP_STATE.streamingPanelOpen) {
        cerrarOtrosPaneles('streaming');
        actualizarStreaming();
    }
}

function actualizarStreaming() {
    APP_STATE.viewersCount = Math.floor(Math.random() * 100) + 20;
    var viewers = document.getElementById('viewers-count');
    if (viewers) viewers.textContent = APP_STATE.viewersCount;
}

// ============================================
// QR CODE
// ============================================
function toggleQRPanel() {
    APP_STATE.qrPanelOpen = !APP_STATE.qrPanelOpen;
    var p = document.getElementById('qr-panel');
    if (p) p.classList.toggle('hidden', !APP_STATE.qrPanelOpen);
    if (APP_STATE.qrPanelOpen) {
        cerrarOtrosPaneles('qr');
        generarQR();
    }
}

function generarQR() {
    if (APP_STATE.qrGenerated) return;
    try {
        var container = document.getElementById('qr-code');
        if (container && typeof QRCode !== 'undefined') {
            new QRCode(container, {
                text: 'https://ipuclafonda.netlify.app/',
                width: 150,
                height: 150,
                colorDark: '#1a237e',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
            APP_STATE.qrGenerated = true;
        }
    } catch (e) {
        console.log('QR Code no disponible');
    }
}

// ============================================
// VERSÍCULO DEL DÍA
// ============================================
function cargarVersiculoDelDia() {
    var verses = CONFIG.VERSES;
    var index = new Date().getDate() % verses.length;
    var verse = verses[index];

    var verseText = document.getElementById('daily-verse');
    var verseRef = document.getElementById('daily-verse-ref');

    if (verseText) verseText.textContent = '"' + verse.verse + '"';
    if (verseRef) verseRef.textContent = verse.ref;
}

// ============================================
// JUEGOS Y TRIVIA BÍBLICA
// ============================================
function iniciarTrivia() {
    APP_STATE.gameInProgress = true;
    APP_STATE.gameScore = 0;
    APP_STATE.gameLevel = 1;
    APP_STATE.gameCorrect = 0;
    APP_STATE.gameCurrentQuestion = 0;

    var questions = [
        { question: '¿Quién construyó el arca?', options: ['Moisés', 'Noé', 'Abraham', 'David'], answer: 1 },
        { question: '¿Cuántos libros tiene la Biblia?', options: ['66', '73', '39', '27'], answer: 0 },
        { question: '¿Quién fue el primer rey de Israel?', options: ['David', 'Salomón', 'Saúl', 'Josué'], answer: 2 },
        { question: '¿En qué ciudad nació Jesús?', options: ['Jerusalén', 'Belén', 'Nazaret', 'Cafarnaúm'], answer: 1 },
        { question: '¿Quién dividió el Mar Rojo?', options: ['Josué', 'Moisés', 'Abraham', 'Elías'], answer: 1 },
        { question: '¿Cuántos discípulos tuvo Jesús?', options: ['7', '10', '12', '14'], answer: 2 }
    ];

    APP_STATE.currentGameQuestions = questions.sort(function() {
        return Math.random() - 0.5;
    }).slice(0, 6);

    mostrarPreguntaTrivia();
}

function mostrarPreguntaTrivia() {
    var questions = APP_STATE.currentGameQuestions;
    if (APP_STATE.gameCurrentQuestion >= questions.length) {
        finalizarTrivia();
        return;
    }

    var q = questions[APP_STATE.gameCurrentQuestion];
    var container = document.getElementById('game-body');
    if (!container) {
        var modal = document.getElementById('game-modal');
        if (modal) modal.classList.remove('hidden');
        container = document.getElementById('game-body');
        if (!container) return;
    }

    var html = '<div class="game-container">' +
        '<div class="game-score">' +
        '<span>Puntuación: <strong>' + APP_STATE.gameScore + '</strong></span>' +
        '<span>Pregunta: <strong>' + (APP_STATE.gameCurrentQuestion + 1) + '/' + questions.length + '</strong></span>' +
        '</div>' +
        '<div class="game-question">' + q.question + '</div>' +
        '<div class="game-options">';

    for (var i = 0; i < q.options.length; i++) {
        var letter = String.fromCharCode(65 + i);
        html += '<button class="game-option" data-index="' + i + '" onclick="responderTrivia(' + i + ')">' +
            letter + '. ' + q.options[i] + '</button>';
    }

    html += '</div><div class="game-result" id="game-result"></div></div>';
    container.innerHTML = html;

    var modal = document.getElementById('game-modal');
    if (modal) modal.classList.remove('hidden');
}

function responderTrivia(index) {
    var questions = APP_STATE.currentGameQuestions;
    var q = questions[APP_STATE.gameCurrentQuestion];
    var result = document.getElementById('game-result');
    var options = document.querySelectorAll('.game-option');

    for (var i = 0; i < options.length; i++) {
        options[i].style.pointerEvents = 'none';
        if (i === q.answer) options[i].classList.add('correct');
        if (i === index && index !== q.answer) options[i].classList.add('incorrect');
    }

    if (index === q.answer) {
        APP_STATE.gameScore += 10 + (APP_STATE.gameLevel * 2);
        APP_STATE.gameCorrect++;
        if (result) result.textContent = '✅ ¡Correcto! +' + (10 + APP_STATE.gameLevel * 2) + ' puntos';
        showToast('✅ ¡Correcto!', 'success');
    } else {
        if (result) result.textContent = '❌ Incorrecto. La respuesta era: ' + q.options[q.answer];
        showToast('❌ Incorrecto', 'error');
    }

    APP_STATE.gameCurrentQuestion++;

    setTimeout(function() {
        if (APP_STATE.gameCurrentQuestion < questions.length) {
            mostrarPreguntaTrivia();
        } else {
            finalizarTrivia();
        }
    }, 2000);
}

function finalizarTrivia() {
    var container = document.getElementById('game-body');
    if (!container) return;

    var porcentaje = Math.round((APP_STATE.gameCorrect / APP_STATE.currentGameQuestions.length) * 100);
    var mensaje = porcentaje >= 80 ? '🏆 ¡Excelente!' : porcentaje >= 60 ? '👍 ¡Bien hecho!' : '📚 ¡Sigue practicando!';

    container.innerHTML = '<div class="game-container" style="text-align:center;padding:20px;">' +
        '<h3>' + mensaje + '</h3>' +
        '<p>Puntuación: <strong>' + APP_STATE.gameScore + '</strong></p>' +
        '<p>Correctas: ' + APP_STATE.gameCorrect + '/' + APP_STATE.currentGameQuestions.length + ' (' + porcentaje + '%)</p>' +
        '<button class="btn-primary" onclick="iniciarTrivia()" style="margin-top:16px;">🔄 Jugar de nuevo</button>' +
        '</div>';

    if (APP_STATE.gameScore > 0) {
        var xpGanada = APP_STATE.gameScore;
        agregarXP(xpGanada);
    }

    APP_STATE.gameInProgress = false;
}

// ============================================
// LOGROS Y GAMIFICACIÓN
// ============================================
function desbloquearLogro(id) {
    if (APP_STATE.logrosDesbloqueados.includes(id)) return;

    var achievements = [
        { id: 'first_prayer', name: 'Primera Oración', icon: '🙏' },
        { id: 'bible_reader', name: 'Lector de la Biblia', icon: '📖' },
        { id: 'testimony', name: 'Comparte Testimonio', icon: '💬' },
        { id: 'event_creator', name: 'Creador de Eventos', icon: '📅' },
        { id: 'radio_listener', name: 'Radio Oyente', icon: '🎵' },
        { id: 'trivia_master', name: 'Maestro de Trivia', icon: '🧠' }
    ];

    var achievement = achievements.find(function(a) { return a.id === id; });
    if (!achievement) return;

    APP_STATE.logrosDesbloqueados.push(id);
    showToast('🏆 ¡Logro desbloqueado! ' + achievement.icon + ' ' + achievement.name, 'success', 4000);
    actualizarLogros();
}

function actualizarLogros() {
    var count = APP_STATE.logrosDesbloqueados.length;
    var badge = document.getElementById('achievements-count');
    if (badge) {
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
    }
}

function agregarXP(cantidad) {
    APP_STATE.xp += cantidad;
    while (APP_STATE.xp >= APP_STATE.xpSiguiente) {
        APP_STATE.xp -= APP_STATE.xpSiguiente;
        APP_STATE.nivel++;
        APP_STATE.xpSiguiente = Math.floor(APP_STATE.xpSiguiente * 1.5);
        showToast('🎉 ¡Subiste al nivel ' + APP_STATE.nivel + '!', 'success');
    }
    actualizarSidebarUsuario();
}

// ============================================
// ASISTENTE VIRTUAL
// ============================================
function toggleAsistente() {
    APP_STATE.assistantOpen = !APP_STATE.assistantOpen;
    var a = document.getElementById('assistant');
    if (a) a.classList.toggle('hidden', !APP_STATE.assistantOpen);
    if (APP_STATE.assistantOpen) {
        if (APP_STATE.fabMenuOpen) toggleFabMenu();
    }
}

function enviarMensajeAsistente() {
    var input = document.getElementById('assistant-input');
    if (!input || !input.value.trim()) return;

    var mensaje = input.value.trim();
    input.value = '';

    agregarMensajeAsistente('user', mensaje);

    setTimeout(function() {
        var respuesta = procesarPreguntaAsistente(mensaje);
        agregarMensajeAsistente('bot', respuesta);
    }, 500);
}

function agregarMensajeAsistente(tipo, mensaje) {
    var container = document.getElementById('assistant-messages');
    if (!container) return;

    var div = document.createElement('div');
    div.className = 'assistant-msg ' + tipo;
    var icon = tipo === 'bot' ? 'bx bx-bot' : 'bx bx-user';
    div.innerHTML = '<i class="' + icon + '"></i><div class="msg-content"><p>' + mensaje + '</p></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function procesarPreguntaAsistente(pregunta) {
    var p = pregunta.toLowerCase();

    if (p.includes('versículo') || p.includes('versiculo') || p.includes('biblia')) {
        var verses = CONFIG.VERSES;
        var v = verses[Math.floor(Math.random() * verses.length)];
        return '📖 "' + v.verse + '" - ' + v.ref;
    }

    if (p.includes('oración') || p.includes('oracion') || p.includes('rezar')) {
        return '🙏 "Señor, te pedimos que bendigas a todos los que están orando. Que tu Espíritu Santo nos guíe y nos dé paz. Amén."';
    }

    if (p.includes('evento') || p.includes('culto') || p.includes('horario')) {
        return '📅 Nuestros cultos son: Domingo 10:00 AM, Martes 6:00 PM y Viernes 6:00 PM. ¡Te esperamos!';
    }

    if (p.includes('música') || p.includes('musica') || p.includes('radio')) {
        return '🎵 Puedes escuchar nuestra radio en vivo desde la sección "Radio" del menú. ¡Alabanzas para el Señor!';
    }

    if (p.includes('donación') || p.includes('donar') || p.includes('ofrenda')) {
        return '💝 Puedes hacer tus donaciones desde la sección "Donaciones" en el menú principal. ¡Dios bendiga tu generosidad!';
    }

    if (p.includes('hola') || p.includes('buenos dias') || p.includes('buenas')) {
        return '¡Hola! Soy tu asistente virtual de IPUC LA FONDA. ¿Cómo puedo ayudarte hoy? 🙏';
    }

    if (p.includes('gracias')) {
        return '¡De nada! Estoy aquí para ayudarte. ¡Dios te bendiga! 🙏✨';
    }

    return '🤔 No estoy seguro de entender tu pregunta. Puedes preguntarme sobre: versículos, oración, eventos, música, donaciones, testimonios, grupos o juegos. ¿En qué puedo ayudarte?';
}

// ============================================
// ESTADÍSTICAS EN TIEMPO REAL
// ============================================
function actualizarEstadisticas() {
    APP_STATE.usuariosActivos = Math.floor(Math.random() * 20) + 5;
    var online = document.getElementById('online-users');
    if (online) online.textContent = APP_STATE.usuariosActivos;

    APP_STATE.totalMiembros = Math.floor(Math.random() * 500) + 100;
    var members = document.getElementById('total-members');
    if (members) members.textContent = APP_STATE.totalMiembros;

    APP_STATE.totalOraciones = Math.floor(Math.random() * 200) + 50;
    var prayers = document.getElementById('prayers-count');
    if (prayers) prayers.textContent = APP_STATE.totalOraciones;
}

// ============================================
// REPORTES
// ============================================
function abrirModalReporte() {
    var m = document.getElementById('report-modal');
    if (!m) return;
    var f = document.getElementById('report-form');
    if (f) f.reset();
    cambiarTipoReporte('usuario');
    m.classList.remove('hidden');
}

function cerrarModalReporte() {
    var m = document.getElementById('report-modal');
    if (m) m.classList.add('hidden');
}

function cambiarTipoReporte(tipo) {
    var u = document.getElementById('report-user-group');
    var d = document.getElementById('report-date-range');
    var m = document.getElementById('report-ministerio-group');

    if (u) u.style.display = 'none';
    if (d) d.style.display = 'none';
    if (m) m.style.display = 'none';

    if (tipo === 'usuario' || tipo === 'contenido' || tipo === 'abuso') {
        if (u) u.style.display = 'block';
    }
    if (tipo === 'asistencia' || tipo === 'financiero') {
        if (d) d.style.display = 'grid';
    }
    if (tipo === 'ministerio') {
        if (m) m.style.display = 'block';
        if (d) d.style.display = 'grid';
    }
}

function generarReporte(e) {
    if (e) e.preventDefault();
    if (!APP_STATE.usuario) {
        showToast('Inicia sesión para generar un reporte', 'warning');
        return;
    }

    var d = document.getElementById('report-descripcion');
    if (!d || !d.value.trim()) {
        showToast('La descripción es obligatoria', 'warning');
        return;
    }

    var tipo = document.querySelector('input[name="report-type"]:checked');
    var urg = document.querySelector('input[name="report-urgencia"]:checked');
    var mot = document.getElementById('report-motivo');
    var fileInput = document.getElementById('report-attachment');

    var reporte = {
        id: generarId(),
        tipo: tipo ? tipo.value : 'usuario',
        reportado_por: {
            id: APP_STATE.usuario.id || 0,
            nombre: APP_STATE.usuario.nombre || 'Anónimo',
            email: APP_STATE.usuario.correo || ''
        },
        descripcion: d.value.trim(),
        motivo: mot ? mot.value : '',
        urgencia: urg ? urg.value : 'baja',
        estado: 'pendiente',
        fecha: new Date().toISOString(),
        adjuntos: fileInput && fileInput.files.length > 0 ? fileInput.files.length : 0
    };

    if (APP_STATE.reportes) {
        APP_STATE.reportes.unshift(reporte);
    } else {
        APP_STATE.reportes = [reporte];
    }

    actualizarBadgeReportes();
    cerrarModalReporte();
    showToast('Reporte generado exitosamente', 'success');

    if (APP_STATE.currentPage === 'gestion-reportes' || APP_STATE.currentPage === 'mis-reportes') {
        navegarA(APP_STATE.currentPage);
    }
}

function actualizarBadgeReportes() {
    var c = 0;
    if (APP_STATE.reportes) {
        for (var i = 0; i < APP_STATE.reportes.length; i++) {
            if (APP_STATE.reportes[i] && APP_STATE.reportes[i].estado === 'pendiente') c++;
        }
    }
    APP_STATE.reportsPendientes = c;

    var b = document.getElementById('reports-badge');
    if (b) {
        b.textContent = c;
        b.classList.toggle('hidden', c === 0);
    }
    var p = document.getElementById('pending-reports');
    if (p) {
        p.textContent = c;
        p.classList.toggle('hidden', c === 0);
    }
}

function cambiarEstadoReporte(id, estado) {
    if (!APP_STATE.reportes) return;

    for (var i = 0; i < APP_STATE.reportes.length; i++) {
        if (APP_STATE.reportes[i].id === id) {
            APP_STATE.reportes[i].estado = estado;
            if (estado === 'resuelto' || estado === 'desestimado') {
                APP_STATE.reportes[i].fecha_resolucion = new Date().toISOString();
            }
            break;
        }
    }

    actualizarBadgeReportes();
    showToast('Estado actualizado a: ' + estado, 'success');

    if (APP_STATE.currentPage === 'gestion-reportes') {
        navegarA('gestion-reportes');
    }
}

function verDetalleReporte(id) {
    if (!APP_STATE.reportes) {
        showToast('No hay reportes', 'info');
        return;
    }

    var reporte = null;
    for (var i = 0; i < APP_STATE.reportes.length; i++) {
        if (APP_STATE.reportes[i].id === id) {
            reporte = APP_STATE.reportes[i];
            break;
        }
    }

    if (!reporte) {
        showToast('Reporte no encontrado', 'error');
        return;
    }

    var modal = document.getElementById('modal');
    var title = document.getElementById('modal-title');
    var body = document.getElementById('modal-body');

    if (!modal || !title || !body) return;

    title.textContent = '📋 Detalle del Reporte';
    body.innerHTML = '<div style="padding:8px 0;">' +
        '<p><strong>ID:</strong> ' + reporte.id.substring(0, 12) + '</p>' +
        '<p><strong>Estado:</strong> <span class="badge estado-' + reporte.estado + '">' + reporte.estado + '</span></p>' +
        '<p><strong>Tipo:</strong> <span class="badge tipo-' + reporte.tipo + '">' + reporte.tipo + '</span></p>' +
        '<p><strong>Urgencia:</strong> <span class="urgencia-' + reporte.urgencia + '">' + reporte.urgencia + '</span></p>' +
        '<p><strong>Reportado por:</strong> ' + (reporte.reportado_por ? reporte.reportado_por.nombre : 'Anónimo') + '</p>' +
        '<p><strong>Fecha:</strong> ' + formatearFecha(reporte.fecha) + '</p>' +
        '<hr style="margin:12px 0;">' +
        '<p><strong>Motivo:</strong> ' + (reporte.motivo || 'No especificado') + '</p>' +
        '<p><strong>Descripción:</strong></p>' +
        '<p style="background:var(--gris-claro);padding:12px;border-radius:8px;margin:4px 0;">' + escapeHtml(reporte.descripcion) + '</p>' +
        (reporte.adjuntos ? '<p><strong>Adjuntos:</strong> ' + reporte.adjuntos + ' archivo(s)</p>' : '') +
        '</div>';

    modal.classList.remove('hidden');
}

function cargarReportesRecientes() {
    var c = document.getElementById('recent-reports-list');
    if (!c) return;

    var rec = APP_STATE.reportes ? APP_STATE.reportes.slice(0, 5) : [];
    if (rec.length === 0) {
        c.innerHTML = '<div class="report-empty"><p>No hay reportes recientes</p></div>';
        return;
    }

    var h = '';
    for (var i = 0; i < rec.length; i++) {
        var r = rec[i];
        h += '<div class="reporte-mini" onclick="verDetalleReporte(\'' + r.id + '\')">' +
            '<span class="badge estado-' + (r.estado || 'pendiente') + '">' + (r.estado || 'pendiente') + '</span> ' +
            '<span class="badge tipo-' + (r.tipo || 'general') + '">' + (r.tipo || 'general') + '</span>' +
            '<p style="font-size:0.85rem;margin:4px 0;">' + escapeHtml((r.descripcion || '').substring(0, 60)) + '...</p>' +
            '<small>' + formatearFecha(r.fecha) + '</small>' +
            '</div>';
    }
    c.innerHTML = h;
}

// ============================================
// BÚSQUEDA
// ============================================
function toggleSearchBar() {
    APP_STATE.searchBarOpen = !APP_STATE.searchBarOpen;
    var b = document.getElementById('search-bar');
    if (b) b.classList.toggle('hidden', !APP_STATE.searchBarOpen);
    if (APP_STATE.searchBarOpen) {
        var input = document.getElementById('global-search-input');
        if (input) setTimeout(function() { input.focus(); }, 100);
    }
}

function realizarBusqueda(query) {
    var results = document.getElementById('search-results');
    if (!results) return;

    if (!query || query.length < 2) {
        results.innerHTML = '';
        return;
    }

    var q = query.toLowerCase();
    var resultados = [];

    // Buscar en páginas
    for (var page in CONFIG.TITULOS_PAGINAS) {
        if (CONFIG.TITULOS_PAGINAS[page].toLowerCase().includes(q)) {
            resultados.push({ type: 'page', id: page, name: CONFIG.TITULOS_PAGINAS[page] });
        }
    }

    // Buscar en versículos
    for (var i = 0; i < CONFIG.VERSES.length; i++) {
        var v = CONFIG.VERSES[i];
        if (v.verse.toLowerCase().includes(q) || v.ref.toLowerCase().includes(q)) {
            resultados.push({ type: 'verse', id: 'verse_' + i, name: v.verse + ' - ' + v.ref });
        }
    }

    if (resultados.length === 0) {
        results.innerHTML = '<p style="padding:12px;color:var(--gris-texto);">No se encontraron resultados</p>';
        return;
    }

    var html = '';
    for (var k = 0; k < Math.min(resultados.length, 8); k++) {
        var r = resultados[k];
        var icon = r.type === 'page' ? '📄' : r.type === 'verse' ? '📖' : '🎵';
        html += '<div style="padding:8px 12px;cursor:pointer;border-radius:8px;margin:2px 0;" ' +
            'onmouseover="this.style.background=\'var(--gris-claro)\'" ' +
            'onmouseout="this.style.background=\'transparent\'" ' +
            'onclick="seleccionarResultadoBusqueda(\'' + r.type + '\',\'' + r.id + '\')">' +
            icon + ' ' + escapeHtml(r.name) +
            '</div>';
    }
    results.innerHTML = html;
}

function seleccionarResultadoBusqueda(type, id) {
    var searchBar = document.getElementById('search-bar');
    if (searchBar) searchBar.classList.add('hidden');
    APP_STATE.searchBarOpen = false;

    if (type === 'page') {
        navegarA(id);
    } else if (type === 'verse') {
        showToast('📖 ' + CONFIG.VERSES[parseInt(id.split('_')[1])].verse, 'info');
    }
}

// ============================================
// NOTIFICACIONES
// ============================================
function toggleNotificaciones() {
    APP_STATE.notificationsOpen = !APP_STATE.notificationsOpen;
    var p = document.getElementById('notification-panel');
    if (p) p.classList.toggle('hidden', !APP_STATE.notificationsOpen);
    if (APP_STATE.notificationsOpen) {
        actualizarNotificaciones();
        var badge = document.querySelector('.badge-notifications');
        if (badge) {
            badge.textContent = '0';
            badge.classList.add('hidden');
        }
        APP_STATE.notificacionesNoLeidas = 0;
    }
}

function actualizarNotificaciones() {
    var list = document.getElementById('notification-list');
    if (!list) return;

    var notificaciones = [
        { icon: '📅', title: 'Nuevo Evento', desc: 'Culto de Adoración este domingo', time: 'Hace 2 horas', type: 'evento' },
        { icon: '🙏', title: 'Petición de Oración', desc: 'María pide oración por su familia', time: 'Hace 4 horas', type: 'oracion' },
        { icon: '📢', title: 'Anuncio', desc: 'Retiro de Jóvenes - 15 de agosto', time: 'Hace 1 día', type: 'sistema' },
        { icon: '🎵', title: 'Nueva Canción', desc: '"Santo Espíritu" disponible en la radio', time: 'Hace 2 días', type: 'sistema' }
    ];

    var html = '';
    for (var i = 0; i < notificaciones.length; i++) {
        var n = notificaciones[i];
        html += '<div class="card" style="padding:12px;margin-bottom:8px;border-left:4px solid var(--azul-primario);">' +
            '<div style="display:flex;gap:10px;align-items:start;">' +
            '<span style="font-size:1.5rem;">' + n.icon + '</span>' +
            '<div style="flex:1;">' +
            '<strong>' + n.title + '</strong>' +
            '<p style="font-size:0.9rem;margin:2px 0;">' + n.desc + '</p>' +
            '<small style="color:var(--gris-texto);">' + n.time + '</small>' +
            '</div>' +
            '</div>' +
            '</div>';
    }

    if (notificaciones.length === 0) {
        html = '<div class="notification-empty"><i class="bx bx-bell-off"></i><p>No tienes notificaciones</p></div>';
    }

    list.innerHTML = html;
}

// ============================================
// MODALES Y CONFIRMACIONES
// ============================================
function cerrarModal() {
    var m = document.getElementById('modal');
    if (m) m.classList.add('hidden');
    var footer = document.getElementById('modal-footer');
    if (footer) {
        footer.classList.add('hidden');
        footer.innerHTML = '';
    }
}

function confirmarAccion(titulo, mensaje, callback) {
    var t = document.getElementById('confirm-title');
    var m = document.getElementById('confirm-message');
    var modal = document.getElementById('confirm-modal');
    if (!modal) return;
    if (t) t.textContent = titulo || '¿Estás seguro?';
    if (m) m.textContent = mensaje || '';
    APP_STATE.pendingConfirmation = callback;
    modal.classList.remove('hidden');
}

// ============================================
// PUBLICACIONES (NUEVO - FIX PARA EL ERROR)
// ============================================
function crearPubLocal() {
    var txt = document.getElementById('pub-contenido');
    if (!txt || !txt.value.trim()) {
        showToast('Escribe algo para publicar', 'warning');
        return;
    }
    if (!APP_STATE.usuario) {
        showToast('Inicia sesión para publicar', 'warning');
        return;
    }

    var pub = {
        id: 'pub_' + Date.now(),
        usuario_id: APP_STATE.usuario.id || 0,
        autor: APP_STATE.usuario.nombre || 'Anónimo',
        contenido: txt.value.trim(),
        fecha: new Date().toISOString()
    };

    APP_STATE.publicaciones.unshift(pub);
    txt.value = '';
    showToast('📝 Publicación creada', 'success');
    navegarA('publicaciones');
}

function crearPeticionLocal() {
    var m = document.getElementById('pet-motivo');
    if (!m || !m.value.trim()) {
        showToast('Escribe un motivo', 'warning');
        return;
    }
    if (!APP_STATE.usuario) {
        showToast('Inicia sesión', 'warning');
        return;
    }

    if (!APP_STATE.peticiones) APP_STATE.peticiones = [];
    APP_STATE.peticiones.unshift({
        id: 'pet_' + Date.now(),
        nombre: APP_STATE.usuario.nombre || 'Anónimo',
        motivo: m.value.trim(),
        fecha: new Date().toISOString()
    });
    m.value = '';
    showToast('🙏 Petición enviada', 'success');
    desbloquearLogro('first_prayer');
    navegarA('peticiones');
}

// ============================================
// CONTADOR REGRESIVO
// ============================================
function iniciarContador() {
    if (APP_STATE.contadorInterval) clearInterval(APP_STATE.contadorInterval);
    actualizarContador();
    APP_STATE.contadorInterval = setInterval(actualizarContador, 1000);
}

function actualizarContador() {
    var dd = document.getElementById('contador-dias');
    var hh = document.getElementById('contador-horas');
    var mm = document.getElementById('contador-minutos');
    var ss = document.getElementById('contador-segundos');
    if (!dd && !hh) return;

    try {
        var ahora = new Date();
        var dom = new Date(ahora);
        dom.setDate(ahora.getDate() + ((7 - ahora.getDay()) % 7));
        dom.setHours(10, 0, 0, 0);
        if (dom <= ahora) dom.setDate(dom.getDate() + 7);
        var diff = Math.max(0, (dom - ahora) / 1000);
        if (dd) dd.textContent = String(Math.floor(diff / 86400)).padStart(2, '0');
        if (hh) hh.textContent = String(Math.floor((diff % 86400) / 3600)).padStart(2, '0');
        if (mm) mm.textContent = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        if (ss) ss.textContent = String(Math.floor(diff % 60)).padStart(2, '0');
    } catch (e) {}
}

// ============================================
// UTILIDADES
// ============================================
function formatearFecha(f) {
    try {
        var d = new Date(f);
        if (isNaN(d.getTime())) return 'Fecha inválida';
        return d.toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Fecha inválida';
    }
}

function escapeHtml(t) {
    if (!t || typeof t !== 'string') return '';
    var d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
}

function generarId() {
    return 'rpt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

function compartirVersiculo() {
    var verses = CONFIG.VERSES;
    var v = verses[Math.floor(Math.random() * verses.length)];
    var texto = '"' + v.verse + '" - ' + v.ref;

    if (navigator.share) {
        navigator.share({
            title: 'Versículo del Día',
            text: texto,
            url: window.location.href
        }).catch(function() {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(function() {
            showToast('📖 Versículo copiado al portapapeles', 'success');
        }).catch(function() {});
    } else {
        showToast('📖 ' + texto, 'info', 5000);
    }
}

function toggleFabMenu() {
    APP_STATE.fabMenuOpen = !APP_STATE.fabMenuOpen;
    var m = document.getElementById('fab-menu');
    if (m) m.classList.toggle('hidden', !APP_STATE.fabMenuOpen);
}

function toggleUserDropdown() {
    APP_STATE.userDropdownOpen = !APP_STATE.userDropdownOpen;
    var d = document.getElementById('user-dropdown');
    if (d) d.classList.toggle('hidden', !APP_STATE.userDropdownOpen);
}

function togglePanelReportes() {
    APP_STATE.reportsPanelOpen = !APP_STATE.reportsPanelOpen;
    var p = document.getElementById('reports-quick-panel');
    if (p) p.classList.toggle('hidden', !APP_STATE.reportsPanelOpen);
    if (APP_STATE.reportsPanelOpen) {
        cargarReportesRecientes();
        cerrarOtrosPaneles('reports');
    }
}

// ============================================
// AUTENTICACIÓN
// ============================================
function login(email, password) {
    if (email === 'admin@ipuc.com' && password === 'admin123') {
        return {
            success: true,
            token: 'token_' + Date.now(),
            usuario: {
                id: 1,
                nombre: 'Administrador',
                correo: email,
                usuario: 'admin',
                rol: 'admin',
                foto: 'assets/avatars/default.png',
                ministerio: 'Pastoral'
            },
            rol: 'admin'
        };
    }

    if (email && password && password.length >= 6) {
        return {
            success: true,
            token: 'token_' + Date.now(),
            usuario: {
                id: 2,
                nombre: email.split('@')[0],
                correo: email,
                usuario: email.split('@')[0],
                rol: 'usuario',
                foto: 'assets/avatars/default.png',
                ministerio: 'General'
            },
            rol: 'usuario'
        };
    }

    return { success: false, error: 'Credenciales inválidas' };
}

function registro(datos) {
    if (datos.nombre && datos.correo && datos.password && datos.password.length >= 8) {
        return {
            success: true,
            usuario: {
                id: Date.now(),
                nombre: datos.nombre,
                correo: datos.correo,
                usuario: datos.usuario || datos.correo.split('@')[0],
                rol: 'usuario',
                foto: 'assets/avatars/default.png',
                ministerio: datos.ministerio || 'General'
            }
        };
    }
    return { success: false, error: 'Datos inválidos o contraseña muy corta' };
}

function continuarComoInvitado() {
    APP_STATE.rol = 'invitado';
    APP_STATE.token = 'guest_' + Date.now();
    APP_STATE.usuario = {
        id: 0,
        nombre: 'Invitado',
        usuario: 'invitado',
        correo: 'invitado@ipuc.com',
        foto: 'assets/avatars/default.png',
        ministerio: 'Visitante',
        verificado: false
    };
    actualizarSidebarUsuario();
    mostrarApp();
    showToast('Navegando como invitado', 'info');
}

function cerrarSesion() {
    try {
        localStorage.removeItem('ipuc20_token');
        localStorage.removeItem('ipuc20_usuario');
        localStorage.removeItem('ipuc20_rol');
    } catch (e) {}

    APP_STATE.token = null;
    APP_STATE.usuario = null;
    APP_STATE.rol = null;

    if (APP_STATE.contadorInterval) clearInterval(APP_STATE.contadorInterval);
    if (APP_STATE.fechaInterval) clearInterval(APP_STATE.fechaInterval);

    mostrarBienvenida();
    showToast('Sesión cerrada', 'info');
}

// ============================================
// CARGA DE PÁGINAS (RESUMEN)
// ============================================
function cargarPagina(page) {
    var c = document.getElementById('page-content');
    if (!c) return;

    c.innerHTML = '<div class="page-loader"><div class="spinner"></div><p>Cargando...</p></div>';

    setTimeout(function() {
        var paginas = {
            'inicio': cargarInicio,
            'horarios': cargarHorarios,
            'asistencia': cargarAsistencia,
            'noticias': cargarNoticias,
            'eventos': cargarEventos,
            'publicaciones': cargarPublicaciones,
            'perfil': cargarPerfil,
            'configuracion': cargarConfiguracion,
            'gestion-reportes': cargarGestionReportes,
            'mis-reportes': cargarMisReportes,
            'dashboard': cargarDashboard,
            'sistema': cargarSistema,
            'peticiones': cargarPeticiones,
            'biblioteca': cargarBiblioteca,
            'podcast': cargarPodcast,
            'galeria': cargarGaleria,
            'chat': cargarChat,
            'directorio': cargarDirectorio,
            'donaciones': cargarDonaciones,
            'devocional': cargarDevocional,
            'radio': cargarRadio,
            'streaming': cargarStreaming,
            'mapa': cargarMapa,
            'oracion': cargarOracion,
            'grupos': cargarGrupos,
            'lectura-biblica': cargarLecturaBiblica,
            'concordancia': cargarConcordancia,
            'himnario': cargarHimnario,
            'diario-espiritual': cargarDiarioEspiritual,
            'logros': cargarLogros,
            'trivia': cargarTrivia,
            'juegos': cargarJuegos,
            'ranking': cargarRanking,
            'playlist': cargarPlaylistPage,
            'blog': cargarBlog,
            'muro-bendiciones': cargarMuroBendiciones,
            'recursos': cargarRecursos,
            'ofrendas': cargarOfrendas,
            'informes': cargarInformes,
            'admin-dashboard': cargarAdminDashboard,
            'analiticas': cargarAnaliticas,
            'gestion-usuarios': cargarGestionUsuarios,
            'gestion-eventos': cargarGestionEventos,
            'gestion-noticias': cargarGestionNoticias
        };

        var fn = paginas[page];
        if (fn) fn(c);
        else c.innerHTML = '<div class="card fade-in"><h2>' + (CONFIG.TITULOS_PAGINAS[page] || page) + '</h2><p style="text-align:center;padding:40px;">Sección en desarrollo</p></div>';
    }, 150);
}

// ============================================
// PÁGINAS - IMPLEMENTACIONES BÁSICAS
// ============================================
function cargarInicio(c) {
    var isAdmin = APP_STATE.rol === 'admin';
    c.innerHTML = '<div class="fade-in">' +
        '<div class="contador-container"><div class="contador-titulo">⛪ Próximo Culto Dominical</div>' +
        '<div class="contador-tiempo">' +
        '<div class="contador-item"><span class="contador-numero" id="contador-dias">00</span><span class="contador-etiqueta">Días</span></div>' +
        '<div class="contador-item"><span class="contador-numero" id="contador-horas">00</span><span class="contador-etiqueta">Horas</span></div>' +
        '<div class="contador-item"><span class="contador-numero" id="contador-minutos">00</span><span class="contador-etiqueta">Minutos</span></div>' +
        '<div class="contador-item"><span class="contador-numero" id="contador-segundos">00</span><span class="contador-etiqueta">Segundos</span></div>' +
        '</div><div class="contador-estado estado-proximo" id="contador-estado">🔔 PRÓXIMO CULTO</div></div>' +

        '<div class="card" style="text-align:center;border-left:4px solid var(--dorado);">' +
        '<h3>🎉 IPUC LA FONDA v' + CONFIG.VERSION + ' ' + CONFIG.VERSION_NAME + '</h3>' +
        '<p>"Donde el Espíritu Santo se mueve"</p>' +
        '<div style="margin-top:8px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">' +
        (isAdmin ? '<span class="badge estado-resuelto">👑 Admin</span>' : '') +
        '<span class="badge">Lv.' + APP_STATE.nivel + '</span>' +
        '<span class="badge">🎯 ' + APP_STATE.logrosDesbloqueados.length + ' logros</span>' +
        '</div></div>' +

        '<div class="card"><h3>⚡ Accesos Rápidos</h3>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:8px;">' +
        '<button class="btn-outline btn-sm" onclick="navegarA(\'asistencia\')">✅ Asistencia</button>' +
        '<button class="btn-outline btn-sm" onclick="navegarA(\'publicaciones\')">📝 Publicar</button>' +
        '<button class="btn-outline btn-sm" onclick="navegarA(\'eventos\')">📅 Eventos</button>' +
        '<button class="btn-outline btn-sm" onclick="navegarA(\'oracion\')">🙏 Oración</button>' +
        '<button class="btn-outline btn-sm" onclick="navegarA(\'devocional\')">📖 Devocional</button>' +
        '<button class="btn-outline btn-sm" onclick="navegarA(\'radio\')">🎵 Radio</button>' +
        '<button class="btn-outline btn-sm" onclick="navegarA(\'trivia\')">🧠 Trivia</button>' +
        (isAdmin ? '<button class="btn-outline btn-sm" onclick="navegarA(\'admin-dashboard\')">📊 Admin</button>' : '') +
        '</div></div>' +

        '<div class="card"><h3>📊 Estadísticas</h3>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;text-align:center;">' +
        '<div><strong style="font-size:1.5rem;">' + APP_STATE.usuariosActivos + '</strong><p style="font-size:0.75rem;">En Línea</p></div>' +
        '<div><strong style="font-size:1.5rem;">' + APP_STATE.totalMiembros + '</strong><p style="font-size:0.75rem;">Miembros</p></div>' +
        '<div><strong style="font-size:1.5rem;">' + APP_STATE.totalOraciones + '</strong><p style="font-size:0.75rem;">Oraciones</p></div>' +
        '<div><strong style="font-size:1.5rem;">' + APP_STATE.reportsPendientes + '</strong><p style="font-size:0.75rem;">Reportes</p></div>' +
        '</div></div></div>';
    iniciarContador();
}

function cargarHorarios(c) {
    c.innerHTML = '<div class="fade-in"><h2>🕐 Horarios de Cultos</h2>' +
        '<div class="card"><h3>⛪ Domingo</h3><p>Culto Dominical - 10:00 AM</p></div>' +
        '<div class="card"><h3>🔥 Martes</h3><p>Culto de Oración - 6:00 PM</p></div>' +
        '<div class="card"><h3>🎵 Viernes</h3><p>Culto de Jóvenes - 6:00 PM</p></div>' +
        '<div class="card"><h3>📖 Sábado</h3><p>Escuela Bíblica - 4:00 PM</p></div>' +
        '</div>';
}

function cargarAsistencia(c) {
    c.innerHTML = '<div class="fade-in"><h2>✅ Confirmar Asistencia</h2>' +
        '<div class="card" style="text-align:center;padding:30px;">' +
        '<h3>Próximo Culto</h3><p style="font-size:1.2rem;">Domingo 10:00 AM</p>' +
        '<button class="btn-primary btn-sm" onclick="confirmarAsistencia()" style="margin-top:12px;">✅ Confirmar Asistencia</button>' +
        '</div>' +
        '<div class="card"><h3>Mi Asistencia</h3>' +
        '<p>Has confirmado tu asistencia <strong>3</strong> veces este mes</p>' +
        '<div style="margin-top:8px;display:flex;gap:8px;">' +
        '<span class="badge estado-resuelto">✅ 1er Domingo</span>' +
        '<span class="badge estado-resuelto">✅ 2do Domingo</span>' +
        '<span class="badge estado-pendiente">⏳ Próximo</span>' +
        '</div></div></div>';
}

function confirmarAsistencia() {
    showToast('✅ Asistencia confirmada para el próximo culto', 'success');
}

function cargarNoticias(c) {
    c.innerHTML = '<div class="fade-in"><h2>📰 Noticias</h2>' +
        '<div class="card"><h3>📢 Anuncio Importante</h3><p>Nuevo horario de cultos a partir del próximo mes</p><small>' + formatearFecha(new Date()) + '</small></div>' +
        '<div class="card"><h3>🎉 Celebración de Aniversario</h3><p>Celebraremos el aniversario de la iglesia el próximo domingo</p><small>' + formatearFecha(new Date(Date.now() - 86400000)) + '</small></div>' +
        '</div>';
}

function cargarEventos(c) {
    var eventos = APP_STATE.eventos || [];
    var proximos = eventos.filter(function(e) {
        return new Date(e.fecha) >= new Date();
    }).sort(function(a, b) {
        return new Date(a.fecha) - new Date(b.fecha);
    });

    c.innerHTML = '<div class="fade-in"><h2>📅 Eventos</h2>' +
        (APP_STATE.rol === 'admin' ? '<button class="btn-primary btn-sm" onclick="abrirModalEvento()" style="margin-bottom:12px;">➕ Crear Evento</button>' : '') +
        (proximos.length === 0 ? '<div class="card"><p>No hay eventos próximos</p></div>' :
        proximos.map(function(e) {
            return '<div class="card"><h3>' + escapeHtml(e.titulo) + '</h3>' +
                '<p>' + escapeHtml(e.desc || '') + '</p>' +
                '<small>📅 ' + formatearFecha(e.fecha) + (e.hora ? ' ⏰ ' + e.hora : '') + (e.lugar ? ' 📍 ' + e.lugar : '') + '</small>' +
                '</div>';
        }).join('')) +
        '</div>';
}

function cargarPublicaciones(c) {
    var pub = APP_STATE.publicaciones || [];
    c.innerHTML = '<div class="fade-in"><h2>📝 Publicaciones</h2>' +
        (APP_STATE.usuario ? '<div class="card"><textarea class="form-input" id="pub-contenido" rows="3" placeholder="¿Qué quieres compartir?"></textarea>' +
        '<button class="btn-primary btn-sm" onclick="crearPubLocal()" style="margin-top:8px;">Publicar</button></div>' : '') +
        (pub.length === 0 ? '<div class="card"><p>No hay publicaciones</p></div>' :
        pub.map(function(p) {
            return '<div class="card"><p><strong>' + escapeHtml(p.autor || 'Anónimo') + '</strong></p>' +
                '<p>' + escapeHtml(p.contenido || '') + '</p>' +
                '<small>' + formatearFecha(p.fecha) + '</small></div>';
        }).join('')) +
        '</div>';
}

function cargarPerfil(c) {
    if (!APP_STATE.usuario) {
        c.innerHTML = '<div class="fade-in"><h2>👤 Perfil</h2><div class="card"><p>Inicia sesión para ver tu perfil</p></div></div>';
        return;
    }
    var u = APP_STATE.usuario;
    c.innerHTML = '<div class="fade-in"><h2>👤 Mi Perfil</h2>' +
        '<div class="card" style="text-align:center;">' +
        '<img src="' + (u.foto || 'assets/avatars/default.png') + '" style="width:80px;height:80px;border-radius:50%;margin-bottom:12px;object-fit:cover;">' +
        '<h3>' + (u.nombre || '') + ' ' + (u.apellidos || '') + '</h3>' +
        '<p>@' + (u.usuario || '') + '</p>' +
        '<p>' + (u.correo || '') + '</p>' +
        '<p>📌 ' + (u.ministerio || 'General') + '</p>' +
        '<div style="margin-top:8px;display:flex;gap:8px;justify-content:center;">' +
        '<span class="badge">Lv.' + APP_STATE.nivel + '</span>' +
        '<span class="badge">🏆 ' + APP_STATE.logrosDesbloqueados.length + ' logros</span>' +
        '</div></div>' +
        '<button class="btn-danger btn-sm" onclick="confirmarAccion(\'Cerrar sesión?\',\'\',cerrarSesion)">🚪 Cerrar Sesión</button>' +
        '</div>';
}

function cargarConfiguracion(c) {
    c.innerHTML = '<div class="fade-in"><h2>⚙️ Configuración</h2>' +
        '<div class="card"><h3>🎨 Apariencia</h3>' +
        '<button class="btn-secondary btn-sm" onclick="toggleTema()">' + (APP_STATE.tema === 'dark' ? '☀️ Cambiar a Claro' : '🌙 Cambiar a Oscuro') + '</button>' +
        '</div>' +
        '<div class="card"><h3>🌐 Idioma</h3>' +
        '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px;">' +
        '<button class="lang-btn ' + (APP_STATE.idioma === 'es' ? 'active' : '') + '" onclick="cambiarIdioma(\'es\')">🇪🇸 ES</button>' +
        '<button class="lang-btn ' + (APP_STATE.idioma === 'en' ? 'active' : '') + '" onclick="cambiarIdioma(\'en\')">🇬🇧 EN</button>' +
        '<button class="lang-btn ' + (APP_STATE.idioma === 'pt' ? 'active' : '') + '" onclick="cambiarIdioma(\'pt\')">🇵🇹 PT</button>' +
        '<button class="lang-btn ' + (APP_STATE.idioma === 'fr' ? 'active' : '') + '" onclick="cambiarIdioma(\'fr\')">🇫🇷 FR</button>' +
        '<button class="lang-btn ' + (APP_STATE.idioma === 'de' ? 'active' : '') + '" onclick="cambiarIdioma(\'de\')">🇩🇪 DE</button>' +
        '</div></div>' +
        '<div class="card"><h3>📱 Aplicación</h3>' +
        '<p><strong>Versión:</strong> ' + CONFIG.VERSION + ' ' + CONFIG.VERSION_NAME + '</p>' +
        '<p><strong>Modo:</strong> ' + (APP_STATE.isOnline ? '🟢 Online' : '🔴 Offline') + '</p>' +
        '</div>' +
        (APP_STATE.usuario ? '<button class="btn-danger btn-sm" onclick="confirmarAccion(\'Cerrar sesión?\',\'\',cerrarSesion)">🚪 Cerrar Sesión</button>' : '') +
        '</div>';
}

function cargarSistema(c) {
    c.innerHTML = '<div class="fade-in"><h2>🖥️ Sistema</h2>' +
        '<div class="card"><p><strong>Versión:</strong> ' + CONFIG.VERSION + ' ' + CONFIG.VERSION_NAME + '</p>' +
        '<p><strong>Modo:</strong> ' + (APP_STATE.isOnline ? '🟢 Online' : '🔴 Offline') + '</p>' +
        '<p><strong>Tema:</strong> ' + APP_STATE.tema + '</p>' +
        '<p><strong>Idioma:</strong> ' + APP_STATE.idioma.toUpperCase() + '</p>' +
        '<p><strong>Usuario:</strong> ' + (APP_STATE.usuario ? APP_STATE.usuario.nombre : 'Invitado') + '</p>' +
        '<p><strong>Nivel:</strong> ' + APP_STATE.nivel + '</p>' +
        '<p><strong>XP:</strong> ' + APP_STATE.xp + ' / ' + APP_STATE.xpSiguiente + '</p>' +
        '</div></div>';
}

function cargarPeticiones(c) {
    var peticiones = APP_STATE.peticiones || [];
    c.innerHTML = '<div class="fade-in"><h2>🙏 Peticiones de Oración</h2>' +
        '<div class="card"><div class="form-group"><label>Motivo de Oración</label>' +
        '<textarea class="form-input" id="pet-motivo" rows="2" placeholder="Motivo de oración..."></textarea></div>' +
        '<button class="btn-primary btn-sm" onclick="crearPeticionLocal()">Enviar Petición</button></div>' +
        (peticiones.length === 0 ? '<div class="card"><p>No hay peticiones</p></div>' :
        peticiones.map(function(p) {
            return '<div class="card"><p><strong>' + escapeHtml(p.nombre || 'Anónimo') + '</strong></p>' +
                '<p>' + escapeHtml(p.motivo || '') + '</p>' +
                '<small>' + formatearFecha(p.fecha) + '</small></div>';
        }).join('')) +
        '</div>';
}

function cargarGestionReportes(c) {
    var h = '<div class="fade-in"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    h += '<h2>📋 Gestión de Reportes</h2>';
    h += '<button class="btn-primary btn-sm" onclick="abrirModalReporte()">Nuevo Reporte</button></div>';
    h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">';
    h += '<div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">' + (APP_STATE.reportes ? APP_STATE.reportes.length : 0) + '</p><p style="font-size:0.75rem;">Total</p></div>';
    h += '<div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">' + APP_STATE.reportsPendientes + '</p><p style="font-size:0.75rem;">Pendientes</p></div>';
    h += '<div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">' + (APP_STATE.reportes ? APP_STATE.reportes.filter(function(r){return r.estado==='resuelto';}).length : 0) + '</p><p style="font-size:0.75rem;">Resueltos</p></div>';
    h += '<div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">' + (APP_STATE.reportes ? APP_STATE.reportes.filter(function(r){return r.estado==='desestimado';}).length : 0) + '</p><p style="font-size:0.75rem;">Desestimados</p></div>';
    h += '</div>';
    if (!APP_STATE.reportes || APP_STATE.reportes.length === 0) {
        h += '<div class="card" style="text-align:center;padding:40px;"><p>No hay reportes registrados</p></div>';
    } else {
        for (var i = 0; i < APP_STATE.reportes.length; i++) {
            var r = APP_STATE.reportes[i];
            h += '<div class="card" style="margin-bottom:8px;border-left:4px solid ' + (r.urgencia === 'critica' ? 'var(--error)' : r.urgencia === 'alta' ? 'var(--advertencia)' : 'var(--info)') + ';">';
            h += '<div style="display:flex;justify-content:space-between;align-items:start;">';
            h += '<div style="flex:1;">';
            h += '<span class="badge estado-' + (r.estado || 'pendiente') + '" style="margin-right:6px;">' + (r.estado || 'pendiente') + '</span>';
            h += '<span class="badge tipo-' + (r.tipo || 'general') + '">' + (r.tipo || 'general') + '</span>';
            h += '<p style="font-size:0.9rem;margin:4px 0;">' + escapeHtml((r.descripcion || '').substring(0, 100)) + '...</p>';
            h += '<small>Reportado por: ' + (r.reportado_por ? r.reportado_por.nombre : 'Anónimo') + ' - ' + formatearFecha(r.fecha) + '</small>';
            h += '</div><div style="display:flex;gap:4px;">';
            h += '<button class="btn-primary btn-sm" onclick="verDetalleReporte(\'' + r.id + '\')" title="Ver"><i class="bx bx-show"></i></button>';
            if (r.estado === 'pendiente') h += '<button class="btn-success btn-sm" onclick="cambiarEstadoReporte(\'' + r.id + '\',\'en_revision\')" title="Revisar"><i class="bx bx-check"></i></button>';
            if (r.estado === 'en_revision') h += '<button class="btn-success btn-sm" onclick="cambiarEstadoReporte(\'' + r.id + '\',\'resuelto\')" title="Resolver"><i class="bx bx-check-double"></i></button>';
            h += '</div></div></div>';
        }
    }
    h += '</div>';
    c.innerHTML = h;
}

function cargarMisReportes(c) {
    if (!APP_STATE.usuario) {
        c.innerHTML = '<div class="fade-in"><h2>Mis Reportes</h2><div class="card"><p>Inicia sesión para ver tus reportes</p></div></div>';
        return;
    }
    var mis = [];
    if (APP_STATE.reportes) {
        for (var i = 0; i < APP_STATE.reportes.length; i++) {
            if (APP_STATE.reportes[i].reportado_por && APP_STATE.reportes[i].reportado_por.id === APP_STATE.usuario.id) {
                mis.push(APP_STATE.reportes[i]);
            }
        }
    }
    var h = '<div class="fade-in"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    h += '<h2>Mis Reportes</h2><button class="btn-primary btn-sm" onclick="abrirModalReporte()">Nuevo Reporte</button></div>';
    if (mis.length === 0) h += '<div class="card" style="text-align:center;padding:40px;"><p>No has generado ningún reporte</p></div>';
    else {
        for (var j = 0; j < mis.length; j++) {
            var r = mis[j];
            h += '<div class="card" style="margin-bottom:8px;">';
            h += '<span class="badge estado-' + (r.estado || 'pendiente') + '">' + (r.estado || 'pendiente') + '</span> ';
            h += '<span class="badge tipo-' + (r.tipo || 'general') + '">' + (r.tipo || 'general') + '</span>';
            h += '<p style="font-size:0.9rem;">' + escapeHtml((r.descripcion || '').substring(0, 100)) + '...</p>';
            h += '<small>' + formatearFecha(r.fecha) + '</small></div>';
        }
    }
    h += '</div>';
    c.innerHTML = h;
}

function cargarDashboard(c) {
    c.innerHTML = '<div class="fade-in"><h2>📊 Dashboard</h2><div class="card"><p>Panel de Administración</p><p>Bienvenido al panel de control de IPUC LA FONDA</p></div></div>';
}

// Páginas adicionales (simplificadas)
function cargarRadio(c) {
    c.innerHTML = '<div class="fade-in"><h2>🎵 Radio en Vivo</h2>' +
        '<div class="card" style="text-align:center;">' +
        '<button class="btn-radio btn-radio-main" onclick="toggleRadio()" style="width:64px;height:64px;font-size:2.5rem;border-radius:50%;background:var(--azul-primario);color:var(--blanco);">' +
        '<i class="bx ' + (APP_STATE.radioPlaying ? 'bx-pause-circle' : 'bx-play-circle') + '"></i></button>' +
        '<h3 style="margin-top:12px;">Radio IPUC LA FONDA</h3>' +
        '<p>Alabanzas de Adoración</p>' +
        '<button class="btn-primary btn-sm" onclick="toggleRadioPanel()" style="margin-top:12px;">📻 Abrir Reproductor</button>' +
        '</div></div>';
}

function cargarStreaming(c) {
    c.innerHTML = '<div class="fade-in"><h2>📺 Transmisión en Vivo</h2>' +
        '<div class="card" style="text-align:center;">' +
        '<div style="background:var(--gris-oscuro);border-radius:12px;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;color:var(--blanco);">' +
        '<div><i class="bx bx-video-recording" style="font-size:4rem;opacity:0.3;"></i>' +
        '<p>Próxima transmisión en vivo</p></div></div>' +
        '<button class="btn-primary btn-sm" onclick="toggleStreamingPanel()" style="margin-top:12px;">📺 Abrir Transmisión</button>' +
        '</div></div>';
}

function cargarMapa(c) {
    c.innerHTML = '<div class="fade-in"><h2>📍 Ubicación</h2>' +
        '<div class="card" style="height:400px;display:flex;align-items:center;justify-content:center;background:var(--gris-claro);border-radius:12px;">' +
        '<div style="text-align:center;"><i class="bx bx-map" style="font-size:3rem;color:var(--gris-texto);"></i>' +
        '<p>Mapa interactivo de la iglesia</p>' +
        '<p style="font-size:0.8rem;color:var(--gris-texto);">Dirección: Colombia</p>' +
        '<button class="btn-primary btn-sm" onclick="showToast(\'Abriendo mapa...\',\'info\')">Ver en Google Maps</button></div></div></div>';
}

function cargarOracion(c) {
    var oraciones = APP_STATE.oraciones || [];
    c.innerHTML = '<div class="fade-in"><h2>🙏 Cadena de Oración</h2>' +
        '<div class="card"><form id="prayer-form-local" onsubmit="enviarOracionLocal(event)">' +
        '<div class="form-group"><label>Tu Nombre</label>' +
        '<input type="text" id="prayer-name-local" class="form-input" placeholder="Anónimo o tu nombre"></div>' +
        '<div class="form-group"><label>Petición de Oración *</label>' +
        '<textarea id="prayer-request-local" class="form-input" rows="3" placeholder="Comparte tu petición..." required></textarea></div>' +
        '<button type="submit" class="btn-primary btn-block"><i class="bx bx-send"></i> Enviar Oración</button>' +
        '</form></div>' +
        (oraciones.length === 0 ? '<div class="card"><p style="text-align:center;color:var(--gris-texto);">No hay peticiones de oración aún</p></div>' :
        oraciones.map(function(o) {
            return '<div class="card"><p><strong>' + (o.nombre || 'Anónimo') + '</strong></p><p>' + escapeHtml(o.motivo || '') + '</p><small>' + formatearFecha(o.fecha) + '</small></div>';
        }).join('')) +
        '</div>';
}

function enviarOracionLocal(e) {
    if (e) e.preventDefault();
    var nombre = document.getElementById('prayer-name-local');
    var motivo = document.getElementById('prayer-request-local');
    if (!motivo || !motivo.value.trim()) {
        showToast('Escribe tu petición', 'warning');
        return;
    }
    if (!APP_STATE.oraciones) APP_STATE.oraciones = [];
    APP_STATE.oraciones.unshift({
        id: 'oracion_' + Date.now(),
        nombre: nombre ? nombre.value.trim() || 'Anónimo' : 'Anónimo',
        motivo: motivo.value.trim(),
        fecha: new Date().toISOString()
    });
    if (nombre) nombre.value = '';
    if (motivo) motivo.value = '';
    showToast('🙏 Oración enviada', 'success');
    desbloquearLogro('first_prayer');
    navegarA('oracion');
}

function cargarGrupos(c) {
    c.innerHTML = '<div class="fade-in"><h2>👥 Grupos y Células</h2>' +
        '<div class="card"><h3>Grupos disponibles</h3>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">' +
        '<div style="padding:12px;border:1px solid var(--gris-medio);border-radius:8px;"><strong>Jóvenes</strong><p style="font-size:0.85rem;">Líder: Juan P.</p><small>Viernes 6:00 PM</small></div>' +
        '<div style="padding:12px;border:1px solid var(--gris-medio);border-radius:8px;"><strong>Damas</strong><p style="font-size:0.85rem;">Líder: María G.</p><small>Miércoles 4:00 PM</small></div>' +
        '</div></div></div>';
}

function cargarLecturaBiblica(c) {
    var progreso = Math.round((APP_STATE.lecturasCompletadas / APP_STATE.lecturasTotal) * 100);
    c.innerHTML = '<div class="fade-in"><h2>📖 Plan de Lectura</h2>' +
        '<div class="card"><h3>Biblia en un año</h3>' +
        '<div style="margin:12px 0;"><strong>Progreso: ' + APP_STATE.lecturasCompletadas + '/' + APP_STATE.lecturasTotal + '</strong>' +
        '<div style="height:8px;background:var(--gris-medio);border-radius:4px;margin-top:4px;overflow:hidden;">' +
        '<div style="height:100%;width:' + progreso + '%;background:linear-gradient(90deg,var(--azul-primario),var(--dorado));border-radius:4px;transition:width 0.5s;"></div>' +
        '</div></div>' +
        '<button class="btn-primary btn-sm" onclick="marcarLecturaCompletada()" style="margin-top:8px;">✅ Marcar como leído</button>' +
        '</div></div>';
}

function marcarLecturaCompletada() {
    APP_STATE.lecturasCompletadas++;
    showToast('📖 Lectura marcada como completada', 'success');
    if (APP_STATE.lecturasCompletadas >= 10) desbloquearLogro('bible_reader');
    navegarA('lectura-biblica');
}

function cargarConcordancia(c) {
    c.innerHTML = '<div class="fade-in"><h2>🔍 Concordancia Bíblica</h2>' +
        '<div class="card"><div class="form-group"><label>Buscar palabra en la Biblia</label>' +
        '<div style="display:flex;gap:8px;">' +
        '<input type="text" id="concordancia-input" class="form-input" placeholder="Ej: amor, fe, esperanza..." onkeypress="if(event.key===\'Enter\')buscarConcordancia()">' +
        '<button class="btn-primary" onclick="buscarConcordancia()">Buscar</button>' +
        '</div></div>' +
        '<div id="concordancia-resultados"><p style="color:var(--gris-texto);">Ingresa una palabra para buscar</p></div></div></div>';
}

function buscarConcordancia() {
    var input = document.getElementById('concordancia-input');
    if (!input || !input.value.trim()) {
        showToast('Ingresa una palabra', 'warning');
        return;
    }
    var query = input.value.trim().toLowerCase();
    var resultados = CONFIG.VERSES.filter(function(v) {
        return v.verse.toLowerCase().includes(query) || v.ref.toLowerCase().includes(query);
    });
    var container = document.getElementById('concordancia-resultados');
    if (!container) return;
    if (resultados.length === 0) {
        container.innerHTML = '<p style="color:var(--gris-texto);">No se encontraron versículos con "' + query + '"</p>';
        return;
    }
    container.innerHTML = resultados.map(function(v) {
        return '<div style="padding:8px;border-bottom:1px solid var(--gris-medio);">' +
            '"' + v.verse + '" - ' + v.ref +
            '</div>';
    }).join('');
}

function cargarHimnario(c) {
    var songs = [
        { title: 'Santo Espíritu', artist: 'IPUC LA FONDA' },
        { title: 'Alabanzas al Rey', artist: 'IPUC LA FONDA' },
        { title: 'Adoración Profunda', artist: 'IPUC LA FONDA' },
        { title: 'Glorioso Día', artist: 'IPUC LA FONDA' }
    ];
    c.innerHTML = '<div class="fade-in"><h2>🎵 Himnario</h2>' +
        '<div class="card"><h3>Canciones de alabanza</h3>' +
        '<div style="margin-top:12px;">' +
        songs.map(function(s, i) {
            return '<div style="padding:8px;border-bottom:1px solid var(--gris-medio);display:flex;justify-content:space-between;align-items:center;">' +
                '<span><strong>' + s.title + '</strong> - ' + s.artist + '</span>' +
                '<button class="btn-outline btn-sm" onclick="reproducirCancion(' + i + ')">🎵 Escuchar</button>' +
                '</div>';
        }).join('') +
        '</div></div></div>';
}

function cargarDiarioEspiritual(c) {
    var entries = APP_STATE.diaryEntries || [];
    c.innerHTML = '<div class="fade-in"><h2>📝 Diario Espiritual</h2>' +
        '<div class="card"><form onsubmit="guardarEntradaDiario(event)">' +
        '<div class="form-group"><label>Fecha</label><input type="date" id="diario-fecha" class="form-input" value="' + new Date().toISOString().split('T')[0] + '"></div>' +
        '<div class="form-group"><label>Reflexión del día</label><textarea id="diario-contenido" class="form-input" rows="4" placeholder="Escribe tu reflexión espiritual..." required></textarea></div>' +
        '<button type="submit" class="btn-primary btn-block">Guardar Reflexión</button>' +
        '</form></div>' +
        (entries.length === 0 ? '<div class="card"><p style="color:var(--gris-texto);">No hay entradas en tu diario</p></div>' :
        entries.map(function(e) {
            return '<div class="card"><strong>' + formatearFecha(e.fecha) + '</strong><p>' + escapeHtml(e.contenido) + '</p></div>';
        }).join('')) +
        '</div>';
}

function guardarEntradaDiario(e) {
    if (e) e.preventDefault();
    var fecha = document.getElementById('diario-fecha');
    var contenido = document.getElementById('diario-contenido');
    if (!contenido || !contenido.value.trim()) {
        showToast('Escribe tu reflexión', 'warning');
        return;
    }
    if (!APP_STATE.diaryEntries) APP_STATE.diaryEntries = [];
    APP_STATE.diaryEntries.unshift({
        fecha: fecha ? fecha.value : new Date().toISOString(),
        contenido: contenido.value.trim()
    });
    if (contenido) contenido.value = '';
    showToast('📝 Reflexión guardada', 'success');
    navegarA('diario-espiritual');
}

function cargarLogros(c) {
    c.innerHTML = '<div class="fade-in"><h2>🏆 Logros Desbloqueados</h2>' +
        '<div class="card"><p>Has desbloqueado <strong>' + APP_STATE.logrosDesbloqueados.length + '</strong> logros</p>' +
        '<div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;">' +
        [
            { id: 'first_prayer', name: 'Primera Oración', icon: '🙏' },
            { id: 'bible_reader', name: 'Lector de la Biblia', icon: '📖' },
            { id: 'testimony', name: 'Comparte Testimonio', icon: '💬' },
            { id: 'event_creator', name: 'Creador de Eventos', icon: '📅' },
            { id: 'radio_listener', name: 'Radio Oyente', icon: '🎵' },
            { id: 'trivia_master', name: 'Maestro de Trivia', icon: '🧠' }
        ].map(function(a) {
            var unlocked = APP_STATE.logrosDesbloqueados.includes(a.id);
            return '<div style="text-align:center;padding:12px;border:2px solid ' + (unlocked ? 'var(--oro)' : 'var(--gris-medio)') + ';border-radius:8px;background:' + (unlocked ? 'var(--dorado-claro)' : 'transparent') + ';opacity:' + (unlocked ? '1' : '0.6') + ';">' +
                '<div style="font-size:2rem;">' + a.icon + '</div>' +
                '<strong style="font-size:0.85rem;">' + a.name + '</strong>' +
                (unlocked ? '<span style="color:var(--exito);font-size:0.7rem;display:block;">✅ Desbloqueado</span>' : '<span style="color:var(--gris-texto);font-size:0.7rem;display:block;">🔒 Bloqueado</span>') +
                '</div>';
        }).join('') +
        '</div></div></div>';
}

function cargarTrivia(c) {
    c.innerHTML = '<div class="fade-in"><h2>🧠 Trivia Bíblica</h2>' +
        '<div class="card" style="text-align:center;padding:30px;">' +
        '<p style="font-size:1.2rem;">Pon a prueba tu conocimiento bíblico</p>' +
        '<button class="btn-primary btn-lg" onclick="iniciarTrivia()" style="margin-top:16px;">🎮 Jugar Ahora</button>' +
        '</div>' +
        '<div class="card"><h3>Estadísticas</h3>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;text-align:center;">' +
        '<div><strong style="font-size:1.5rem;">' + APP_STATE.gameScore + '</strong><p>Puntos</p></div>' +
        '<div><strong style="font-size:1.5rem;">' + APP_STATE.gameCorrect + '</strong><p>Correctas</p></div>' +
        '<div><strong style="font-size:1.5rem;">' + APP_STATE.nivel + '</strong><p>Nivel</p></div>' +
        '</div></div></div>';
}

function cargarJuegos(c) {
    c.innerHTML = '<div class="fade-in"><h2>🎮 Juegos Bíblicos</h2>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
        '<div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA(\'trivia\')">' +
        '<div style="font-size:3rem;">🧠</div><h3>Trivia Bíblica</h3><p>Preguntas y respuestas</p></div>' +
        '<div class="card" style="text-align:center;cursor:pointer;" onclick="showToast(\'Próximamente...\',\'info\')">' +
        '<div style="font-size:3rem;">🔍</div><h3>Busca la Palabra</h3><p>Encuentra versículos</p></div>' +
        '</div></div>';
}

function cargarRanking(c) {
    c.innerHTML = '<div class="fade-in"><h2>🏅 Ranking</h2>' +
        '<div class="card"><h3>Top 5 - Gamificación</h3>' +
        '<div style="margin-top:12px;">' +
        '<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--gris-medio);"><span>🥇 1. Usuario1</span><span>1500 pts</span></div>' +
        '<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--gris-medio);"><span>🥈 2. Usuario2</span><span>1200 pts</span></div>' +
        '<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--gris-medio);"><span>🥉 3. Usuario3</span><span>1000 pts</span></div>' +
        '</div></div>' +
        (APP_STATE.usuario ? '<div class="card" style="border-left:4px solid var(--dorado);"><p><strong>Tu posición:</strong> #' + (Math.floor(Math.random() * 20) + 1) + '</p>' +
            '<p><strong>Puntos:</strong> ' + APP_STATE.xp + ' XP</p>' +
            '<p><strong>Nivel:</strong> ' + APP_STATE.nivel + '</p></div>' : '') +
        '</div>';
}

function cargarPlaylistPage(c) {
    var songs = [
        { title: 'Santo Espíritu', artist: 'IPUC LA FONDA', duration: '4:32' },
        { title: 'Alabanzas al Rey', artist: 'IPUC LA FONDA', duration: '5:15' },
        { title: 'Adoración Profunda', artist: 'IPUC LA FONDA', duration: '6:08' },
        { title: 'Glorioso Día', artist: 'IPUC LA FONDA', duration: '4:45' }
    ];
    c.innerHTML = '<div class="fade-in"><h2>🎵 Playlist de Adoración</h2>' +
        '<div class="card"><h3>Lista de reproducción</h3>' +
        songs.map(function(s, i) {
            return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--gris-medio);">' +
                '<div><strong>' + s.title + '</strong><br><span style="font-size:0.85rem;color:var(--gris-texto);">' + s.artist + '</span></div>' +
                '<div><span style="font-size:0.85rem;color:var(--gris-texto);">' + s.duration + '</span> ' +
                '<button class="btn-outline btn-sm" onclick="reproducirCancion(' + i + ')">▶️</button></div></div>';
        }).join('') +
        '</div></div>';
}

function cargarBlog(c) {
    c.innerHTML = '<div class="fade-in"><h2>📝 Blog/Noticias</h2>' +
        '<div class="card"><h3>Últimas publicaciones</h3>' +
        '<div style="padding:12px;border-bottom:1px solid var(--gris-medio);"><h4>Anuncio: Nuevo Horario de Cultos</h4>' +
        '<p style="font-size:0.85rem;color:var(--gris-texto);">A partir del próximo domingo, los cultos serán a las 10:00 AM...</p>' +
        '<small>' + formatearFecha(new Date()) + '</small></div>' +
        '</div></div>';
}

function cargarMuroBendiciones(c) {
    var bendiciones = APP_STATE.bendiciones || [];
    c.innerHTML = '<div class="fade-in"><h2>🕊️ Muro de Bendiciones</h2>' +
        '<div class="card"><form onsubmit="enviarBendicion(event)">' +
        '<div class="form-group"><textarea id="bendicion-input" class="form-input" rows="2" placeholder="Comparte tu testimonio o bendición..." required></textarea></div>' +
        '<button type="submit" class="btn-primary btn-sm">🕊️ Compartir Bendición</button>' +
        '</form></div>' +
        (bendiciones.length === 0 ? '<div class="card"><p style="color:var(--gris-texto);">No hay bendiciones compartidas aún</p></div>' :
        bendiciones.map(function(b) {
            return '<div class="card"><p><strong>' + (b.nombre || 'Anónimo') + '</strong></p><p>' + escapeHtml(b.mensaje) + '</p><small>' + formatearFecha(b.fecha) + '</small></div>';
        }).join('')) +
        '</div>';
}

function enviarBendicion(e) {
    if (e) e.preventDefault();
    var input = document.getElementById('bendicion-input');
    if (!input || !input.value.trim()) {
        showToast('Escribe tu bendición', 'warning');
        return;
    }
    if (!APP_STATE.bendiciones) APP_STATE.bendiciones = [];
    APP_STATE.bendiciones.unshift({
        nombre: APP_STATE.usuario ? APP_STATE.usuario.nombre : 'Anónimo',
        mensaje: input.value.trim(),
        fecha: new Date().toISOString()
    });
    input.value = '';
    showToast('🕊️ Bendición compartida', 'success');
    desbloquearLogro('testimony');
    navegarA('muro-bendiciones');
}

function cargarRecursos(c) {
    c.innerHTML = '<div class="fade-in"><h2>📚 Recursos Cristianos</h2>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
        '<div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA(\'biblioteca\')">' +
        '<div style="font-size:2.5rem;">📖</div><h3>Biblioteca Digital</h3></div>' +
        '<div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA(\'podcast\')">' +
        '<div style="font-size:2.5rem;">🎙️</div><h3>Podcast</h3></div>' +
        '<div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA(\'himnario\')">' +
        '<div style="font-size:2.5rem;">🎵</div><h3>Himnario</h3></div>' +
        '<div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA(\'concordancia\')">' +
        '<div style="font-size:2.5rem;">🔍</div><h3>Concordancia</h3></div>' +
        '</div></div>';
}

function cargarOfrendas(c) {
    c.innerHTML = '<div class="fade-in"><h2>💳 Ofrendas y Donaciones</h2>' +
        '<div class="card" style="text-align:center;padding:30px;">' +
        '<div style="font-size:3rem;">💝</div><h3>Ofrenda para la Iglesia</h3>' +
        '<p>"Cada uno dé como propuso en su corazón, no con tristeza ni por necesidad, porque Dios ama al dador alegre."</p>' +
        '<p style="font-size:0.9rem;color:var(--gris-texto);">2 Corintios 9:7</p>' +
        '<button class="btn-primary btn-lg" onclick="showToast(\'Sistema de pagos disponible pronto\',\'info\')" style="margin-top:16px;">💳 Donar Ahora</button>' +
        '</div></div>';
}

function cargarInformes(c) {
    c.innerHTML = '<div class="fade-in"><h2>📊 Informes PDF</h2>' +
        '<div class="card"><h3>Generar Informes</h3>' +
        '<div style="margin-top:12px;">' +
        '<div style="padding:8px;border-bottom:1px solid var(--gris-medio);display:flex;justify-content:space-between;align-items:center;">' +
        '<span>📋 Reporte de Asistencia</span>' +
        '<button class="btn-outline btn-sm" onclick="showToast(\'Generando PDF...\',\'info\')">📥 Descargar</button></div>' +
        '<div style="padding:8px;border-bottom:1px solid var(--gris-medio);display:flex;justify-content:space-between;align-items:center;">' +
        '<span>📊 Estadísticas de Miembros</span>' +
        '<button class="btn-outline btn-sm" onclick="showToast(\'Generando PDF...\',\'info\')">📥 Descargar</button></div>' +
        '</div></div></div>';
}

// Páginas administrativas
function cargarAdminDashboard(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p>⛔ Acceso restringido a administradores</p></div>';
        return;
    }
    c.innerHTML = '<div class="fade-in"><h2>📊 Dashboard Administrativo</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px;">' +
        '<div class="card" style="text-align:center;border-left:4px solid var(--azul-primario);"><strong style="font-size:1.8rem;">' + APP_STATE.totalMiembros + '</strong><p>Miembros</p></div>' +
        '<div class="card" style="text-align:center;border-left:4px solid var(--exito);"><strong style="font-size:1.8rem;">' + APP_STATE.usuariosActivos + '</strong><p>En Línea</p></div>' +
        '<div class="card" style="text-align:center;border-left:4px solid var(--advertencia);"><strong style="font-size:1.8rem;">' + APP_STATE.reportsPendientes + '</strong><p>Reportes Pendientes</p></div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
        '<div class="card"><h4>📋 Acciones Rápidas</h4>' +
        '<button class="btn-primary btn-sm btn-block" onclick="navegarA(\'gestion-usuarios\')" style="margin:4px 0;">👥 Gestionar Usuarios</button>' +
        '<button class="btn-primary btn-sm btn-block" onclick="navegarA(\'gestion-reportes\')" style="margin:4px 0;">📋 Gestionar Reportes</button>' +
        '<button class="btn-primary btn-sm btn-block" onclick="navegarA(\'gestion-eventos\')" style="margin:4px 0;">📅 Gestionar Eventos</button>' +
        '</div>' +
        '<div class="card"><h4>📊 Estadísticas</h4>' +
        '<p><strong>Versión:</strong> ' + CONFIG.VERSION + ' ' + CONFIG.VERSION_NAME + '</p>' +
        '<p><strong>Reportes totales:</strong> ' + (APP_STATE.reportes ? APP_STATE.reportes.length : 0) + '</p>' +
        '<p><strong>Logros desbloqueados:</strong> ' + APP_STATE.logrosDesbloqueados.length + '</p>' +
        '</div></div></div>';
}

function cargarGestionUsuarios(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p>⛔ Acceso restringido</p></div>';
        return;
    }
    c.innerHTML = '<div class="fade-in"><h2>👥 Gestión de Usuarios</h2>' +
        '<div class="card"><h3>Usuarios Registrados</h3>' +
        '<div style="margin-top:12px;">' +
        '<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--gris-medio);">' +
        '<span><strong>Administrador</strong> - admin@ipuc.com</span><span class="badge estado-resuelto">Admin</span></div>' +
        '<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--gris-medio);">' +
        '<span><strong>Usuario1</strong> - usuario1@email.com</span><span class="badge">Usuario</span></div>' +
        '</div></div></div>';
}

function cargarGestionEventos(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p>⛔ Acceso restringido</p></div>';
        return;
    }
    var eventos = APP_STATE.eventos || [];
    c.innerHTML = '<div class="fade-in"><h2>📅 Gestión de Eventos</h2>' +
        '<button class="btn-primary btn-sm" onclick="abrirModalEvento()" style="margin-bottom:12px;">➕ Crear Evento</button>' +
        (eventos.length === 0 ? '<div class="card"><p>No hay eventos programados</p></div>' :
        eventos.map(function(e) {
            return '<div class="card"><h4>' + escapeHtml(e.titulo) + '</h4>' +
                '<p>' + escapeHtml(e.desc || '') + '</p>' +
                '<small>' + e.fecha + ' ' + (e.hora || '') + ' - ' + (e.lugar || '') + '</small>' +
                '<div style="margin-top:8px;"><button class="btn-danger btn-sm" onclick="eliminarEvento(\'' + e.id + '\')">🗑️ Eliminar</button></div>' +
                '</div>';
        }).join('')) +
        '</div>';
}

function abrirModalEvento() {
    var modal = document.getElementById('event-modal');
    if (modal) modal.classList.remove('hidden');
}

function eliminarEvento(id) {
    confirmarAccion('Eliminar Evento', '¿Estás seguro de eliminar este evento?', function() {
        if (APP_STATE.eventos) {
            APP_STATE.eventos = APP_STATE.eventos.filter(function(e) { return e.id !== id; });
        }
        showToast('Evento eliminado', 'info');
        navegarA('gestion-eventos');
    });
}

function cargarGestionNoticias(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p>⛔ Acceso restringido</p></div>';
        return;
    }
    c.innerHTML = '<div class="fade-in"><h2>📝 Gestión de Noticias</h2>' +
        '<div class="card"><form onsubmit="publicarNoticia(event)">' +
        '<div class="form-group"><label>Título</label><input type="text" id="noticia-titulo" class="form-input" placeholder="Título de la noticia" required></div>' +
        '<div class="form-group"><label>Contenido</label><textarea id="noticia-contenido" class="form-input" rows="4" placeholder="Contenido de la noticia..." required></textarea></div>' +
        '<button type="submit" class="btn-primary">📢 Publicar Noticia</button>' +
        '</form></div></div>';
}

function publicarNoticia(e) {
    if (e) e.preventDefault();
    var titulo = document.getElementById('noticia-titulo');
    var contenido = document.getElementById('noticia-contenido');
    if (!titulo || !contenido || !titulo.value.trim() || !contenido.value.trim()) {
        showToast('Completa todos los campos', 'warning');
        return;
    }
    showToast('📢 Noticia publicada', 'success');
    titulo.value = '';
    contenido.value = '';
}

function cargarAnaliticas(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p>⛔ Acceso restringido</p></div>';
        return;
    }
    c.innerHTML = '<div class="fade-in"><h2>📊 Analíticas</h2>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
        '<div class="card"><h4>📈 Visitas</h4><p style="font-size:2rem;">1,234</p><p>Este mes</p></div>' +
        '<div class="card"><h4>👥 Usuarios Activos</h4><p style="font-size:2rem;">' + APP_STATE.usuariosActivos + '</p><p>Ahora</p></div>' +
        '<div class="card"><h4>📋 Reportes</h4><p style="font-size:2rem;">' + (APP_STATE.reportes ? APP_STATE.reportes.length : 0) + '</p><p>Totales</p></div>' +
        '<div class="card"><h4>🏆 Logros</h4><p style="font-size:2rem;">' + APP_STATE.logrosDesbloqueados.length + '</p><p>Desbloqueados</p></div>' +
        '</div></div>';
}

// Páginas placeholder
function cargarBiblioteca(c) {
    c.innerHTML = '<div class="fade-in"><h2>📚 Biblioteca Digital</h2><div class="card"><p>Recursos cristianos disponibles próximamente</p></div></div>';
}
function cargarPodcast(c) {
    c.innerHTML = '<div class="fade-in"><h2>🎙️ Podcast</h2><div class="card"><p>Episodios de podcast próximamente</p></div></div>';
}
function cargarGaleria(c) {
    c.innerHTML = '<div class="fade-in"><h2>🖼️ Galería</h2><div class="card"><p>Imágenes de la iglesia próximamente</p></div></div>';
}
function cargarChat(c) {
    var msgs = APP_STATE.chatMessages || [];
    c.innerHTML = '<div class="fade-in"><h2>💬 Chat Global</h2>' +
        '<div class="card" style="height:300px;overflow-y:auto;background:var(--gris-claro);border-radius:8px;padding:12px;margin-bottom:12px;" id="chat-messages">' +
        (msgs.length === 0 ? '<p style="color:var(--gris-texto);text-align:center;">No hay mensajes</p>' :
        msgs.map(function(m) {
            return '<div style="padding:8px;margin-bottom:4px;border-radius:8px;background:var(--blanco);">' +
                '<strong>' + escapeHtml(m.autor) + '</strong>: ' + escapeHtml(m.mensaje) +
                '</div>';
        }).join('')) +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
        '<input type="text" id="chat-input" class="form-input" placeholder="Escribe un mensaje..." onkeypress="if(event.key===\'Enter\')enviarMensajeChat()">' +
        '<button class="btn-primary" onclick="enviarMensajeChat()">Enviar</button>' +
        '</div></div>';
}
function enviarMensajeChat() {
    var input = document.getElementById('chat-input');
    if (!input || !input.value.trim()) return;
    if (!APP_STATE.usuario) { showToast('Inicia sesión para chatear', 'warning'); return; }
    if (!APP_STATE.chatMessages) APP_STATE.chatMessages = [];
    APP_STATE.chatMessages.push({
        autor: APP_STATE.usuario.nombre || 'Anónimo',
        mensaje: input.value.trim(),
        fecha: new Date().toISOString()
    });
    input.value = '';
    navegarA('chat');
}
function cargarDirectorio(c) {
    c.innerHTML = '<div class="fade-in"><h2>📋 Directorio</h2><div class="card"><p>Miembros de la iglesia próximamente</p></div></div>';
}
function cargarDonaciones(c) {
    c.innerHTML = '<div class="fade-in"><h2>💝 Donaciones</h2><div class="card" style="text-align:center;padding:30px;"><div style="font-size:3rem;">💝</div><h3>Sistema de Donaciones</h3><p>"Dios ama al dador alegre"</p><button class="btn-primary btn-lg" onclick="showToast(\'Sistema de donaciones disponible pronto\',\'info\')" style="margin-top:12px;">💳 Donar</button></div></div>';
}
function cargarDevocional(c) {
    var verses = CONFIG.VERSES;
    var v = verses[new Date().getDate() % verses.length];
    c.innerHTML = '<div class="fade-in"><h2>📖 Devocional Diario</h2>' +
        '<div class="card" style="text-align:center;padding:30px;">' +
        '<p style="font-style:italic;font-size:1.3rem;">"' + v.verse + '"</p>' +
        '<p style="font-weight:700;margin-top:12px;">— ' + v.ref + ' —</p>' +
        '<button class="btn-primary btn-sm" onclick="compartirVersiculo()" style="margin-top:16px;">📤 Compartir Versículo</button>' +
        '</div></div>';
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Cargar tema
    try {
        var t = localStorage.getItem('ipuc20_tema') || 'light';
        APP_STATE.tema = t;
        aplicarTema(t);
    } catch (e) {}

    try {
        APP_STATE.idioma = localStorage.getItem('ipuc20_idioma') || 'es';
        var langBtns = document.querySelectorAll('.lang-btn');
        for (var i = 0; i < langBtns.length; i++) {
            langBtns[i].classList.toggle('active', langBtns[i].getAttribute('data-lang') === APP_STATE.idioma);
        }
    } catch (e) {}

    // Cargar sesión
    var token = localStorage.getItem('ipuc20_token');
    var udata = localStorage.getItem('ipuc20_usuario');
    var rol = localStorage.getItem('ipuc20_rol');

    // Mostrar splash y luego cargar app
    setTimeout(function() {
        var splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            splash.style.transition = 'opacity 0.5s';
            setTimeout(function() {
                if (splash) splash.style.display = 'none';
            }, 500);
        }

        if (token && udata) {
            try {
                APP_STATE.token = token;
                APP_STATE.usuario = JSON.parse(udata);
                APP_STATE.rol = rol || 'usuario';
                mostrarApp();
            } catch (e) {
                mostrarBienvenida();
            }
        } else {
            mostrarBienvenida();
        }
    }, 1500);

    inicializarEventos();
    manejarResponsiveSidebar();

    window.addEventListener('resize', manejarResponsiveSidebar);
    window.addEventListener('online', function() {
        APP_STATE.isOnline = true;
        showToast('🟢 Conexión restablecida', 'success');
    });
    window.addEventListener('offline', function() {
        APP_STATE.isOnline = false;
        showToast('🔴 Sin conexión a internet', 'error');
    });
});

// ============================================
// EVENTOS DEL DOM
// ============================================
function inicializarEventos() {
    // Sidebar
    var mt = document.getElementById('menu-toggle');
    if (mt) mt.addEventListener('click', toggleSidebar);
    var cs = document.getElementById('close-sidebar');
    if (cs) cs.addEventListener('click', cerrarSidebar);
    var so = document.getElementById('sidebar-overlay');
    if (so) so.addEventListener('click', cerrarSidebar);

    // Navegación
    var items = document.querySelectorAll('.nav-item[data-page]');
    for (var i = 0; i < items.length; i++) {
        items[i].addEventListener('click', function(e) {
            e.preventDefault();
            var p = this.getAttribute('data-page');
            if (p) navegarA(p);
        });
    }

    // Botones header
    var tt = document.getElementById('theme-toggle');
    if (tt) tt.addEventListener('click', toggleTema);
    var nt = document.getElementById('notifications-toggle');
    if (nt) nt.addEventListener('click', toggleNotificaciones);
    var rt = document.getElementById('reports-quick-toggle');
    if (rt) rt.addEventListener('click', togglePanelReportes);
    var st = document.getElementById('search-toggle');
    if (st) st.addEventListener('click', toggleSearchBar);
    var qr = document.getElementById('qr-toggle');
    if (qr) qr.addEventListener('click', toggleQRPanel);

    // Search
    var sc = document.getElementById('search-close');
    if (sc) sc.addEventListener('click', function() {
        var b = document.getElementById('search-bar');
        if (b) b.classList.add('hidden');
        APP_STATE.searchBarOpen = false;
    });

    var searchInput = document.getElementById('global-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            realizarBusqueda(this.value);
        });
    }

    // FAB
    var fm = document.getElementById('fab-main');
    if (fm) fm.addEventListener('click', toggleFabMenu);

    var fabItems = document.querySelectorAll('.fab-item');
    for (var j = 0; j < fabItems.length; j++) {
        fabItems[j].addEventListener('click', function() {
            var action = this.getAttribute('data-action');
            if (action === 'reporte') abrirModalReporte();
            else if (action === 'oracion') navegarA('oracion');
            else if (action === 'musica') navegarA('radio');
            else if (action === 'evento') {
                if (APP_STATE.rol === 'admin') abrirModalEvento();
                else navegarA('eventos');
            } else if (action === 'donacion') navegarA('ofrendas');
            else if (action === 'juego') navegarA('trivia');
            else if (action === 'asistente') toggleAsistente();
            toggleFabMenu();
        });
    }

    // Usuario
    var um = document.getElementById('user-mini');
    if (um) um.addEventListener('click', toggleUserDropdown);
    var bl = document.getElementById('btn-logout');
    if (bl) bl.addEventListener('click', function(e) {
        e.preventDefault();
        confirmarAccion('Cerrar sesión?', '', cerrarSesion);
    });
    var bg = document.getElementById('btn-guest');
    if (bg) bg.addEventListener('click', continuarComoInvitado);

    // Auth forms
    var sr = document.getElementById('show-register');
    if (sr) sr.addEventListener('click', function(e) {
        e.preventDefault();
        var lf = document.getElementById('login-form-container');
        var rf = document.getElementById('register-form-container');
        if (lf) lf.classList.add('hidden');
        if (rf) rf.classList.remove('hidden');
    });
    var sl = document.getElementById('show-login');
    if (sl) sl.addEventListener('click', function(e) {
        e.preventDefault();
        var lf = document.getElementById('login-form-container');
        var rf = document.getElementById('register-form-container');
        if (rf) rf.classList.add('hidden');
        if (lf) lf.classList.remove('hidden');
    });

    // Confirm modal
    var cc = document.getElementById('confirm-cancel');
    if (cc) cc.addEventListener('click', function() {
        var m = document.getElementById('confirm-modal');
        if (m) m.classList.add('hidden');
        APP_STATE.pendingConfirmation = null;
    });
    var ca = document.getElementById('confirm-accept');
    if (ca) ca.addEventListener('click', function() {
        if (APP_STATE.pendingConfirmation) {
            APP_STATE.pendingConfirmation();
            APP_STATE.pendingConfirmation = null;
        }
        var m = document.getElementById('confirm-modal');
        if (m) m.classList.add('hidden');
    });

    // Report modal
    var rf = document.getElementById('report-form');
    if (rf) rf.addEventListener('submit', generarReporte);
    var cr = document.getElementById('btn-cancel-report');
    if (cr) cr.addEventListener('click', cerrarModalReporte);

    var reportTypes = document.querySelectorAll('input[name="report-type"]');
    for (var k = 0; k < reportTypes.length; k++) {
        reportTypes[k].addEventListener('change', function() {
            cambiarTipoReporte(this.value);
        });
    }

    // Report actions
    var reportActions = document.querySelectorAll('.report-action-btn');
    for (var m = 0; m < reportActions.length; m++) {
        reportActions[m].addEventListener('click', function() {
            var action = this.getAttribute('data-report');
            if (action === 'usuario' || action === 'contenido') {
                abrirModalReporte();
                var radio = document.querySelector('input[value="' + action + '"]');
                if (radio) radio.checked = true;
                cambiarTipoReporte(action);
            } else if (action === 'asistencia') navegarA('asistencia');
            else if (action === 'financiero') navegarA('donaciones');
            togglePanelReportes();
        });
    }

    // Close panels
    var closeReports = document.getElementById('close-reports-quick');
    if (closeReports) closeReports.addEventListener('click', function() {
        var p = document.getElementById('reports-quick-panel');
        if (p) p.classList.add('hidden');
        APP_STATE.reportsPanelOpen = false;
    });
    var closeNotif = document.getElementById('close-notifications');
    if (closeNotif) closeNotif.addEventListener('click', function() {
        var p = document.getElementById('notification-panel');
        if (p) p.classList.add('hidden');
        APP_STATE.notificationsOpen = false;
    });
    var closeRadio = document.getElementById('close-radio-quick');
    if (closeRadio) closeRadio.addEventListener('click', function() {
        var p = document.getElementById('radio-quick-panel');
        if (p) p.classList.add('hidden');
        APP_STATE.radioPanelOpen = false;
    });
    var closeStreaming = document.getElementById('close-streaming');
    if (closeStreaming) closeStreaming.addEventListener('click', function() {
        var p = document.getElementById('streaming-panel');
        if (p) p.classList.add('hidden');
        APP_STATE.streamingPanelOpen = false;
    });
    var closeQR = document.getElementById('close-qr');
    if (closeQR) closeQR.addEventListener('click', function() {
        var p = document.getElementById('qr-panel');
        if (p) p.classList.add('hidden');
        APP_STATE.qrPanelOpen = false;
    });
    var closeAssistant = document.getElementById('close-assistant');
    if (closeAssistant) closeAssistant.addEventListener('click', function() {
        var a = document.getElementById('assistant');
        if (a) a.classList.add('hidden');
        APP_STATE.assistantOpen = false;
    });

    // Modals
    var modal = document.getElementById('modal');
    if (modal) modal.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) cerrarModal();
    });
    var modalClose = document.querySelector('.modal-close');
    if (modalClose) modalClose.addEventListener('click', cerrarModal);

    var confirmModal = document.getElementById('confirm-modal');
    if (confirmModal) confirmModal.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) {
            confirmModal.classList.add('hidden');
            APP_STATE.pendingConfirmation = null;
        }
    });

    var reportModal = document.getElementById('report-modal');
    if (reportModal) reportModal.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) cerrarModalReporte();
    });

    var eventModal = document.getElementById('event-modal');
    if (eventModal) {
        eventModal.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-backdrop')) {
                eventModal.classList.add('hidden');
            }
        });
        var closeEvent = eventModal.querySelector('.modal-close');
        if (closeEvent) closeEvent.addEventListener('click', function() {
            eventModal.classList.add('hidden');
        });
        var cancelEvent = document.getElementById('btn-cancel-event');
        if (cancelEvent) cancelEvent.addEventListener('click', function() {
            eventModal.classList.add('hidden');
        });
    }

    var gameModal = document.getElementById('game-modal');
    if (gameModal) {
        gameModal.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-backdrop')) {
                gameModal.classList.add('hidden');
                APP_STATE.gameInProgress = false;
            }
        });
        var closeGame = gameModal.querySelector('.modal-close');
        if (closeGame) closeGame.addEventListener('click', function() {
            gameModal.classList.add('hidden');
            APP_STATE.gameInProgress = false;
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarPaneles();
            var m = document.getElementById('modal');
            if (m && !m.classList.contains('hidden')) cerrarModal();
            var rm = document.getElementById('report-modal');
            if (rm && !rm.classList.contains('hidden')) cerrarModalReporte();
            var em = document.getElementById('event-modal');
            if (em && !em.classList.contains('hidden')) em.classList.add('hidden');
            var gm = document.getElementById('game-modal');
            if (gm && !gm.classList.contains('hidden')) gm.classList.add('hidden');
        }
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            toggleSearchBar();
        }
    });

    // Click outside
    document.addEventListener('click', function(e) {
        if (APP_STATE.userDropdownOpen && !e.target.closest('#user-mini') && !e.target.closest('#user-dropdown')) {
            var d = document.getElementById('user-dropdown');
            if (d) d.classList.add('hidden');
            APP_STATE.userDropdownOpen = false;
        }
        if (APP_STATE.fabMenuOpen && !e.target.closest('#fab-main') && !e.target.closest('#fab-menu')) {
            var f = document.getElementById('fab-menu');
            if (f) f.classList.add('hidden');
            APP_STATE.fabMenuOpen = false;
        }
        if (APP_STATE.assistantOpen && !e.target.closest('#assistant') && !e.target.closest('.fab-item[data-action="asistente"]')) {
            var a = document.getElementById('assistant');
            if (a && !a.classList.contains('hidden')) {
                a.classList.add('hidden');
                APP_STATE.assistantOpen = false;
            }
        }
    });

    // Language buttons
    var langBtns = document.querySelectorAll('.lang-btn');
    for (var n = 0; n < langBtns.length; n++) {
        langBtns[n].addEventListener('click', function() {
            var l = this.getAttribute('data-lang');
            if (l) cambiarIdioma(l);
        });
    }

    // Login form
    var loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var email = document.getElementById('login-email');
        var pass = document.getElementById('login-password');
        if (email && pass && email.value && pass.value) {
            var resultado = login(email.value, pass.value);
            if (resultado.success) {
                APP_STATE.token = resultado.token;
                APP_STATE.usuario = resultado.usuario;
                APP_STATE.rol = resultado.rol;
                try {
                    localStorage.setItem('ipuc20_token', resultado.token);
                    localStorage.setItem('ipuc20_usuario', JSON.stringify(resultado.usuario));
                    localStorage.setItem('ipuc20_rol', resultado.rol);
                } catch (err) {}
                mostrarApp();
                showToast('👋 Bienvenido ' + resultado.usuario.nombre, 'success');
            } else {
                showToast(resultado.error || 'Error al iniciar sesión', 'error');
            }
        }
    });

    // Register form
    var registerForm = document.getElementById('register-form');
    if (registerForm) registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var nombre = document.getElementById('reg-nombre');
        var email = document.getElementById('reg-email');
        var pass = document.getElementById('reg-password');
        if (nombre && email && pass && nombre.value && email.value && pass.value) {
            var resultado = registro({
                nombre: nombre.value,
                correo: email.value,
                password: pass.value,
                usuario: email.value.split('@')[0],
                ministerio: 'General'
            });
            if (resultado.success) {
                showToast('✅ Registro exitoso. Inicia sesión', 'success');
                var rf = document.getElementById('register-form-container');
                var lf = document.getElementById('login-form-container');
                if (rf) rf.classList.add('hidden');
                if (lf) lf.classList.remove('hidden');
            } else {
                showToast(resultado.error || 'Error al registrar', 'error');
            }
        }
    });

    // Event form
    var eventForm = document.getElementById('event-form');
    if (eventForm) {
        eventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var titulo = document.getElementById('event-title');
            var fecha = document.getElementById('event-date');
            if (!titulo || !titulo.value.trim()) {
                showToast('Ingresa un título', 'warning');
                return;
            }
            if (!fecha || !fecha.value) {
                showToast('Selecciona una fecha', 'warning');
                return;
            }
            if (!APP_STATE.eventos) APP_STATE.eventos = [];
            APP_STATE.eventos.push({
                id: 'evt_' + Date.now(),
                titulo: titulo.value.trim(),
                desc: document.getElementById('event-desc') ? document.getElementById('event-desc').value.trim() : '',
                fecha: fecha.value,
                hora: document.getElementById('event-time') ? document.getElementById('event-time').value : '',
                lugar: document.getElementById('event-location') ? document.getElementById('event-location').value.trim() : '',
                tipo: document.getElementById('event-type') ? document.getElementById('event-type').value : 'culto'
            });
            showToast('✅ Evento creado', 'success');
            document.getElementById('event-modal').classList.add('hidden');
            navegarA('eventos');
        });
    }

    // Captcha refresh
    var captchaRefresh = document.getElementById('captcha-refresh');
    if (captchaRefresh) {
        captchaRefresh.addEventListener('click', function() {
            var captcha = document.getElementById('captcha-text');
            if (captcha) {
                var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                var code = '';
                for (var i = 0; i < 6; i++) {
                    code += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                captcha.textContent = code;
            }
        });
    }
}

// ============================================
// EXPORTAR A WINDOW
// ============================================
window.CONFIG = CONFIG;
window.APP_STATE = APP_STATE;
window.navegarA = navegarA;
window.toggleTema = toggleTema;
window.aplicarTema = aplicarTema;
window.showToast = showToast;
window.cerrarModal = cerrarModal;
window.confirmarAccion = confirmarAccion;
window.toggleSidebar = toggleSidebar;
window.cerrarSidebar = cerrarSidebar;
window.toggleSearchBar = toggleSearchBar;
window.toggleFabMenu = toggleFabMenu;
window.toggleUserDropdown = toggleUserDropdown;
window.toggleNotificaciones = toggleNotificaciones;
window.togglePanelReportes = togglePanelReportes;
window.toggleRadioPanel = toggleRadioPanel;
window.toggleStreamingPanel = toggleStreamingPanel;
window.toggleQRPanel = toggleQRPanel;
window.toggleAsistente = toggleAsistente;
window.continuarComoInvitado = continuarComoInvitado;
window.cerrarSesion = cerrarSesion;
window.cambiarIdioma = cambiarIdioma;
window.mostrarApp = mostrarApp;
window.mostrarBienvenida = mostrarBienvenida;
window.formatearFecha = formatearFecha;
window.escapeHtml = escapeHtml;
window.generarId = generarId;
window.compartirVersiculo = compartirVersiculo;
window.crearPubLocal = crearPubLocal;
window.crearPeticionLocal = crearPeticionLocal;
window.abrirModalReporte = abrirModalReporte;
window.cerrarModalReporte = cerrarModalReporte;
window.cambiarTipoReporte = cambiarTipoReporte;
window.generarReporte = generarReporte;
window.actualizarBadgeReportes = actualizarBadgeReportes;
window.verDetalleReporte = verDetalleReporte;
window.cambiarEstadoReporte = cambiarEstadoReporte;
window.cargarReportesRecientes = cargarReportesRecientes;
window.reproducirCancion = reproducirCancion;
window.toggleRadio = toggleRadio;
window.iniciarTrivia = iniciarTrivia;
window.desbloquearLogro = desbloquearLogro;
window.agregarXP = agregarXP;
window.enviarOracionLocal = enviarOracionLocal;
window.enviarBendicion = enviarBendicion;
window.guardarEntradaDiario = guardarEntradaDiario;
window.marcarLecturaCompletada = marcarLecturaCompletada;
window.buscarConcordancia = buscarConcordancia;
window.abrirModalEvento = abrirModalEvento;
window.eliminarEvento = eliminarEvento;
window.publicarNoticia = publicarNoticia;
window.confirmarAsistencia = confirmarAsistencia;
window.enviarMensajeChat = enviarMensajeChat;
window.realizarBusqueda = realizarBusqueda;
window.seleccionarResultadoBusqueda = seleccionarResultadoBusqueda;
window.login = login;
window.registro = registro;
window.cerrarPaneles = cerrarPaneles;

console.log('✅ IPUC LA FONDA v' + CONFIG.VERSION + ' ' + CONFIG.VERSION_NAME + ' - Script cargado');
console.log('📌 ' + Object.keys(window).filter(function(k) {
    return typeof window[k] === 'function' && k.startsWith('cargar');
}).length + ' páginas disponibles');

/* ============================================
   FINAL DEL SCRIPT v20.0 PRO ULTIMATE
   IPUC LA FONDA - International Pentecostal Church
   "Donde el Espíritu Santo se mueve"
   ============================================ */
