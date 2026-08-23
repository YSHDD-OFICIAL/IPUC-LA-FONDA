/* ============================================
   IPUC LA FONDA - SCRIPT.JS v20.0 PRO ULTIMATE
   Web App Profesional - Sistema Completo
   Incluye: Radio, Streaming, Gamificación, IA, Logros
   VERSION CORREGIDA - SIN ERRORES
   ============================================ */

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
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
        'chat': 'Chat Global',
        'directorio': 'Directorio',
        'donaciones': 'Donaciones',
        'devocional': 'Devocional Diario',
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
        { verse: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.', ref: 'Juan 3:16' },
        { verse: 'Jehová es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar.', ref: 'Salmo 23:1-2' },
        { verse: 'Todo lo puedo en Cristo que me fortalece.', ref: 'Filipenses 4:13' },
        { verse: 'El Señor es mi luz y mi salvación; ¿de quién temeré? El Señor es la fortaleza de mi vida; ¿de quién he de atemorizarme?', ref: 'Salmo 27:1' },
        { verse: 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te fortalezco.', ref: 'Isaías 41:10' },
        { verse: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.', ref: 'Mateo 11:28' },
        { verse: 'La fe es la certeza de lo que se espera, la convicción de lo que no se ve.', ref: 'Hebreos 11:1' },
        { verse: 'Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.', ref: 'Salmo 46:1' }
    ],
    RADIO_STATIONS: [
        { name: 'Radio IPUC', url: 'https://radio.ipuc.com/stream', genre: 'Cristiana' },
        { name: 'Alabanza Global', url: 'https://alabanza.com/stream', genre: 'Alabanza' },
        { name: 'Adoración Profunda', url: 'https://adoracion.com/stream', genre: 'Adoración' },
        { name: 'Palabra Viva', url: 'https://palabra.com/stream', genre: 'Predicación' }
    ],
    PLAYLIST: [
        { title: 'Santo Espíritu', artist: 'IPUC LA FONDA', duration: '4:32' },
        { title: 'Alabanzas al Rey', artist: 'IPUC LA FONDA', duration: '5:15' },
        { title: 'Adoración Profunda', artist: 'IPUC LA FONDA', duration: '6:08' },
        { title: 'Glorioso Día', artist: 'IPUC LA FONDA', duration: '4:45' },
        { title: 'Cordero de Dios', artist: 'IPUC LA FONDA', duration: '5:20' },
        { title: 'Grande es el Señor', artist: 'IPUC LA FONDA', duration: '4:55' },
        { title: 'Tu Fidelidad', artist: 'IPUC LA FONDA', duration: '5:10' },
        { title: 'Dios de Milagros', artist: 'IPUC LA FONDA', duration: '4:40' }
    ],
    ACHIEVEMENTS: [
        { id: 'first_prayer', name: 'Primera Oración', icon: '🙏', desc: 'Envía tu primera petición de oración' },
        { id: 'bible_reader', name: 'Lector de la Biblia', icon: '📖', desc: 'Completa 10 lecturas bíblicas' },
        { id: 'testimony', name: 'Comparte Testimonio', icon: '💬', desc: 'Comparte en el muro de bendiciones' },
        { id: 'event_creator', name: 'Creador de Eventos', icon: '📅', desc: 'Crea tu primer evento' },
        { id: 'radio_listener', name: 'Radio Oyente', icon: '🎵', desc: 'Escucha la radio por primera vez' },
        { id: 'trivia_master', name: 'Maestro de Trivia', icon: '🧠', desc: 'Gana 50 puntos en trivia' },
        { id: 'social_butterfly', name: 'Mariposa Social', icon: '🦋', desc: 'Envía 10 mensajes en el chat' },
        { id: 'generous', name: 'Corazón Generoso', icon: '💝', desc: 'Realiza tu primera donación' }
    ],
    TRIVIA_QUESTIONS: [
        { question: '¿Quién construyó el arca?', options: ['Moisés', 'Noé', 'Abraham', 'David'], answer: 1 },
        { question: '¿Cuántos libros tiene la Biblia?', options: ['66', '73', '39', '27'], answer: 0 },
        { question: '¿Quién fue el primer rey de Israel?', options: ['David', 'Salomón', 'Saúl', 'Josué'], answer: 2 },
        { question: '¿En qué ciudad nació Jesús?', options: ['Jerusalén', 'Belén', 'Nazaret', 'Cafarnaúm'], answer: 1 },
        { question: '¿Quién dividió el Mar Rojo?', options: ['Josué', 'Moisés', 'Abraham', 'Elías'], answer: 1 },
        { question: '¿Cuántos discípulos tuvo Jesús?', options: ['7', '10', '12', '14'], answer: 2 },
        { question: '¿Cuál es el primer libro de la Biblia?', options: ['Éxodo', 'Génesis', 'Levítico', 'Números'], answer: 1 },
        { question: '¿Quién fue arrojado al foso de los leones?', options: ['José', 'Daniel', 'Isaías', 'Jeremías'], answer: 1 },
        { question: '¿Qué apóstol negó a Jesús tres veces?', options: ['Juan', 'Santiago', 'Pedro', 'Andrés'], answer: 2 },
        { question: '¿Cuál es el mandamiento más grande?', options: ['No matar', 'Amar a Dios', 'Honrar padres', 'No robar'], answer: 1 }
    ]
};

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================
const APP_STATE = {
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
// UTILIDADES GENERALES
// ============================================
function showToast(mensaje, tipo = 'info', duracion = 3000) {
    const c = document.getElementById('toast-container');
    if (!c) return;
    
    const t = document.createElement('div');
    t.className = `toast ${tipo}`;
    
    const iconos = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    t.innerHTML = `${iconos[tipo] || '📌'} ${mensaje || ''}`;
    
    c.appendChild(t);
    
    setTimeout(() => {
        if (t.parentNode) {
            t.classList.add('toast-hide');
            setTimeout(() => { if (t.parentNode) t.remove(); }, 300);
        }
    }, duracion);
}

function escapeHtml(text) {
    if (!text || typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generarId(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

function formatearFecha(fecha) {
    try {
        const d = new Date(fecha);
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

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// GESTIÓN DE TEMAS
// ============================================
function toggleTema() {
    APP_STATE.tema = APP_STATE.tema === 'light' ? 'dark' : 'light';
    aplicarTema(APP_STATE.tema);
    try { localStorage.setItem('ipuc20_tema', APP_STATE.tema); } catch (e) {}
    showToast(`Tema cambiado a ${APP_STATE.tema === 'dark' ? 'oscuro' : 'claro'}`, 'info');
}

function aplicarTema(tema) {
    try {
        document.documentElement.setAttribute('data-theme', tema);
        const icon = document.querySelector('#theme-toggle i');
        if (icon) icon.className = tema === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
    } catch (e) {}
}

// ============================================
// GESTIÓN DE IDIOMAS
// ============================================
function cambiarIdioma(lang) {
    const idiomas = { es: 'ES', en: 'EN', pt: 'PT', fr: 'FR', de: 'DE' };
    if (!idiomas[lang]) return;
    
    APP_STATE.idioma = lang;
    try { localStorage.setItem('ipuc20_idioma', lang); } catch (e) {}
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    
    showToast(`Idioma cambiado a ${lang.toUpperCase()}`, 'info');
}

// ============================================
// NAVEGACIÓN
// ============================================
function navegarA(page) {
    if (!page || APP_STATE.isLoading) return;
    
    APP_STATE.currentPage = page;
    APP_STATE.isLoading = true;
    
    // Actualizar items activos del sidebar
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-page') === page);
    });
    
    // Actualizar título de la página
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = CONFIG.TITULOS_PAGINAS[page] || page;
    
    const bc = document.getElementById('breadcrumb-current');
    if (bc) bc.textContent = CONFIG.TITULOS_PAGINAS[page] || page;
    
    // Cargar contenido de la página
    cargarPagina(page);
    
    // Cerrar sidebar en móvil
    if (window.innerWidth < 1024) cerrarSidebar();
    
    // Cerrar paneles abiertos
    cerrarPaneles();
    
    APP_STATE.isLoading = false;
    
    // Actualizar fecha en header
    actualizarFechaHeader();
}

function cargarPagina(page) {
    const container = document.getElementById('page-content');
    if (!container) return;
    
    container.innerHTML = '<div class="page-loader"><div class="spinner"></div><p>Cargando...</p></div>';
    
    setTimeout(() => {
        const paginas = {
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
        
        const fn = paginas[page];
        if (fn) {
            fn(container);
        } else {
            container.innerHTML = `<div class="card fade-in"><h2>${CONFIG.TITULOS_PAGINAS[page] || page}</h2><p style="text-align:center;padding:40px;">Sección en desarrollo</p></div>`;
        }
    }, 150);
}

function actualizarFechaHeader() {
    const dateElement = document.getElementById('header-date');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date().toLocaleDateString('es-CO', options);
        dateElement.textContent = today.charAt(0).toUpperCase() + today.slice(1);
    }
}

// ============================================
// GESTIÓN DE PANELES
// ============================================
function cerrarPaneles() {
    const paneles = ['radio-quick-panel', 'streaming-panel', 'qr-panel', 'reports-quick-panel', 'notification-panel'];
    paneles.forEach(id => {
        const p = document.getElementById(id);
        if (p && !p.classList.contains('hidden')) p.classList.add('hidden');
    });
    
    APP_STATE.radioPanelOpen = false;
    APP_STATE.streamingPanelOpen = false;
    APP_STATE.qrPanelOpen = false;
    APP_STATE.reportsPanelOpen = false;
    APP_STATE.notificationsOpen = false;
}

function cerrarOtrosPaneles(excepto) {
    const paneles = {
        'radio': 'radio-quick-panel',
        'streaming': 'streaming-panel',
        'qr': 'qr-panel',
        'reports': 'reports-quick-panel'
    };
    
    Object.keys(paneles).forEach(key => {
        if (key !== excepto) {
            const p = document.getElementById(paneles[key]);
            if (p && !p.classList.contains('hidden')) p.classList.add('hidden');
        }
    });
}

// ============================================
// GESTIÓN DE SIDEBAR
// ============================================
function toggleSidebar() {
    if (APP_STATE.sidebarOpen) cerrarSidebar();
    else abrirSidebar();
}

function abrirSidebar() {
    APP_STATE.sidebarOpen = true;
    const s = document.getElementById('sidebar');
    const o = document.getElementById('sidebar-overlay');
    if (s) s.classList.add('open');
    if (o) o.classList.remove('hidden');
}

function cerrarSidebar() {
    if (APP_STATE.sidebarLocked) return;
    APP_STATE.sidebarOpen = false;
    const s = document.getElementById('sidebar');
    const o = document.getElementById('sidebar-overlay');
    if (s) s.classList.remove('open');
    if (o) o.classList.add('hidden');
}

function manejarResponsiveSidebar() {
    if (window.innerWidth >= 1024) {
        APP_STATE.sidebarLocked = true;
        const s = document.getElementById('sidebar');
        if (s) s.classList.add('open');
        const o = document.getElementById('sidebar-overlay');
        if (o) o.classList.add('hidden');
    } else {
        APP_STATE.sidebarLocked = false;
        if (!APP_STATE.sidebarOpen) {
            const sb = document.getElementById('sidebar');
            if (sb) sb.classList.remove('open');
        }
    }
}

// ============================================
// GESTIÓN DE USUARIO
// ============================================
function actualizarSidebarUsuario() {
    const m = document.getElementById('user-mini');
    if (!m) return;
    
    const img = m.querySelector('img');
    const nm = m.querySelector('.user-name');
    const rl = m.querySelector('.user-role');
    const lvl = document.getElementById('user-level');
    const xpBar = document.getElementById('user-xp-bar');
    
    if (APP_STATE.usuario) {
        if (img) img.src = APP_STATE.usuario.foto || 'assets/avatars/default.png';
        if (nm) nm.textContent = APP_STATE.usuario.nombre || 'Usuario';
        
        const roles = { admin: '👑 Administrador', invitado: '👤 Invitado', usuario: '👤 Miembro' };
        if (rl) rl.textContent = roles[APP_STATE.rol] || 'Miembro';
    } else {
        if (img) img.src = 'assets/avatars/default.png';
        if (nm) nm.textContent = 'Visitante';
        if (rl) rl.textContent = 'Sin sesión';
    }
    
    if (lvl) lvl.textContent = `Lv.${APP_STATE.nivel}`;
    if (xpBar) {
        const porcentaje = Math.min((APP_STATE.xp / APP_STATE.xpSiguiente) * 100, 100);
        xpBar.style.width = `${porcentaje}%`;
    }
    
    const am = document.getElementById('admin-menu');
    if (am) am.classList.toggle('hidden', APP_STATE.rol !== 'admin');
}

function continuarComoInvitado() {
    APP_STATE.rol = 'invitado';
    APP_STATE.token = `guest_${Date.now()}`;
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
    
    mostrarBienvenida();
    showToast('Sesión cerrada', 'info');
}

function login(email, password) {
    if (email === 'admin@ipuc.com' && password === 'admin123') {
        return {
            success: true,
            token: `token_${Date.now()}`,
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
            token: `token_${Date.now()}`,
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

// ============================================
// GESTIÓN DE APP (MOSTRAR/OCULTAR)
// ============================================
function mostrarApp() {
    const w = document.getElementById('welcome-screen');
    const a = document.getElementById('app');
    const f = document.getElementById('fab-main');
    
    if (w) w.classList.add('hidden');
    if (a) a.classList.remove('hidden');
    if (f) f.classList.remove('hidden');
    
    actualizarSidebarUsuario();
    navegarA('inicio');
    iniciarContador();
    actualizarBadgeReportes();
    actualizarEstadisticas();
    cargarVersiculoDelDia();
    actualizarFechaHeader();
}

function mostrarBienvenida() {
    const a = document.getElementById('app');
    const w = document.getElementById('welcome-screen');
    if (a) a.classList.add('hidden');
    if (w) w.classList.remove('hidden');
}

// ============================================
// GESTIÓN DE RADIO
// ============================================
function toggleRadioPanel() {
    APP_STATE.radioPanelOpen = !APP_STATE.radioPanelOpen;
    const p = document.getElementById('radio-quick-panel');
    if (p) p.classList.toggle('hidden', !APP_STATE.radioPanelOpen);
    if (APP_STATE.radioPanelOpen) cerrarOtrosPaneles('radio');
}

function toggleRadio() {
    APP_STATE.radioPlaying = !APP_STATE.radioPlaying;
    
    const icon1 = document.querySelector('#radio-play-toggle i');
    const icon2 = document.querySelector('#radio-play-main i');
    const status = document.getElementById('radio-status');
    
    if (APP_STATE.radioPlaying) {
        if (icon1) icon1.className = 'bx bx-pause-circle';
        if (icon2) icon2.className = 'bx bx-pause-circle';
        if (status) status.textContent = '🔴 En Vivo';
        showToast('Radio iniciada', 'success');
        iniciarAnimacionRadio(true);
        desbloquearLogro('radio_listener');
    } else {
        if (icon1) icon1.className = 'bx bx-play-circle';
        if (icon2) icon2.className = 'bx bx-play-circle';
        if (status) status.textContent = '⏸️ Pausa';
        iniciarAnimacionRadio(false);
    }
}

function cambiarEstacionRadio(direccion) {
    const stations = CONFIG.RADIO_STATIONS;
    APP_STATE.radioCurrentStation = (APP_STATE.radioCurrentStation + direccion + stations.length) % stations.length;
    
    const stationName = document.querySelector('.radio-station');
    if (stationName) stationName.textContent = stations[APP_STATE.radioCurrentStation].name;
    
    showToast(`Cambiando a ${stations[APP_STATE.radioCurrentStation].name}`, 'info');
}

function iniciarAnimacionRadio(active) {
    const waves = document.querySelectorAll('.radio-wave span');
    waves.forEach(wave => {
        wave.style.animationPlayState = active ? 'running' : 'paused';
    });
}

function reproducirCancion(index) {
    APP_STATE.playlistCurrent = index;
    
    document.querySelectorAll('#playlist-songs li').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    
    const song = CONFIG.PLAYLIST[index];
    if (!song) return;
    
    const playing = document.getElementById('radio-playing');
    const artist = document.getElementById('radio-artist');
    
    if (playing) playing.textContent = song.title;
    if (artist) artist.textContent = song.artist;
    
    showToast(`Reproduciendo: ${song.title}`, 'info');
    if (!APP_STATE.radioPlaying) toggleRadio();
}

// ============================================
// GESTIÓN DE STREAMING
// ============================================
function toggleStreamingPanel() {
    APP_STATE.streamingPanelOpen = !APP_STATE.streamingPanelOpen;
    const p = document.getElementById('streaming-panel');
    if (p) p.classList.toggle('hidden', !APP_STATE.streamingPanelOpen);
    if (APP_STATE.streamingPanelOpen) {
        cerrarOtrosPaneles('streaming');
        actualizarStreaming();
    }
}

function actualizarStreaming() {
    APP_STATE.viewersCount = Math.floor(Math.random() * 100) + 20;
    const viewers = document.getElementById('viewers-count');
    if (viewers) viewers.textContent = APP_STATE.viewersCount;
}

// ============================================
// GESTIÓN DE QR
// ============================================
function toggleQRPanel() {
    APP_STATE.qrPanelOpen = !APP_STATE.qrPanelOpen;
    const p = document.getElementById('qr-panel');
    if (p) p.classList.toggle('hidden', !APP_STATE.qrPanelOpen);
    if (APP_STATE.qrPanelOpen) {
        cerrarOtrosPaneles('qr');
        generarQR();
    }
}

function generarQR() {
    if (APP_STATE.qrGenerated) return;
    
    try {
        const container = document.getElementById('qr-code');
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
// GESTIÓN DE VERSÍCULOS
// ============================================
function cargarVersiculoDelDia() {
    const verses = CONFIG.VERSES;
    const index = new Date().getDate() % verses.length;
    const verse = verses[index];
    
    const verseText = document.getElementById('daily-verse');
    const verseRef = document.getElementById('daily-verse-ref');
    
    if (verseText) verseText.textContent = `"${verse.verse}"`;
    if (verseRef) verseRef.textContent = verse.ref;
}

function compartirVersiculo() {
    const verses = CONFIG.VERSES;
    const v = verses[Math.floor(Math.random() * verses.length)];
    const texto = `"${v.verse}" - ${v.ref}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Versículo del Día',
            text: texto,
            url: window.location.href
        }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(() => {
            showToast('📖 Versículo copiado al portapapeles', 'success');
        }).catch(() => {});
    } else {
        showToast(`📖 ${texto}`, 'info', 5000);
    }
}

// ============================================
// GESTIÓN DE TRIVIA Y JUEGOS
// ============================================
function iniciarTrivia() {
    APP_STATE.gameInProgress = true;
    APP_STATE.gameScore = 0;
    APP_STATE.gameLevel = 1;
    APP_STATE.gameCorrect = 0;
    APP_STATE.gameCurrentQuestion = 0;
    
    APP_STATE.currentGameQuestions = [...CONFIG.TRIVIA_QUESTIONS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
    
    const modal = document.getElementById('game-modal');
    if (modal) modal.classList.remove('hidden');
    
    mostrarPreguntaTrivia();
}

function mostrarPreguntaTrivia() {
    const questions = APP_STATE.currentGameQuestions;
    
    if (APP_STATE.gameCurrentQuestion >= questions.length) {
        finalizarTrivia();
        return;
    }
    
    const q = questions[APP_STATE.gameCurrentQuestion];
    const container = document.getElementById('game-body');
    
    if (!container) return;
    
    let html = `
        <div class="game-container">
            <div class="game-score">
                <span>Puntuación: <strong>${APP_STATE.gameScore}</strong></span>
                <span>Pregunta: <strong>${APP_STATE.gameCurrentQuestion + 1}/${questions.length}</strong></span>
                <span>Nivel: <strong>${APP_STATE.gameLevel}</strong></span>
            </div>
            <div class="game-question">${q.question}</div>
            <div class="game-options">`;
    
    q.options.forEach((option, i) => {
        const letter = String.fromCharCode(65 + i);
        html += `<button class="game-option" data-index="${i}" onclick="responderTrivia(${i})">${letter}. ${option}</button>`;
    });
    
    html += `
            </div>
            <div class="game-result" id="game-result"></div>
        </div>`;
    
    container.innerHTML = html;
}

function responderTrivia(index) {
    if (APP_STATE.gameInProgress === false) return;
    
    const questions = APP_STATE.currentGameQuestions;
    const q = questions[APP_STATE.gameCurrentQuestion];
    const result = document.getElementById('game-result');
    const options = document.querySelectorAll('.game-option');
    
    options.forEach((option, i) => {
        option.style.pointerEvents = 'none';
        if (i === q.answer) option.classList.add('correct');
        if (i === index && index !== q.answer) option.classList.add('incorrect');
    });
    
    if (index === q.answer) {
        const points = 10 + (APP_STATE.gameLevel * 2);
        APP_STATE.gameScore += points;
        APP_STATE.gameCorrect++;
        if (result) result.textContent = `✅ ¡Correcto! +${points} puntos`;
        showToast('✅ ¡Correcto!', 'success');
    } else {
        if (result) result.textContent = `❌ Incorrecto. La respuesta era: ${q.options[q.answer]}`;
        showToast('❌ Incorrecto', 'error');
    }
    
    APP_STATE.gameCurrentQuestion++;
    
    setTimeout(() => {
        if (APP_STATE.gameCurrentQuestion < questions.length) {
            mostrarPreguntaTrivia();
        } else {
            finalizarTrivia();
        }
    }, 2000);
}

function finalizarTrivia() {
    const container = document.getElementById('game-body');
    if (!container) return;
    
    const totalQuestions = APP_STATE.currentGameQuestions.length;
    const porcentaje = Math.round((APP_STATE.gameCorrect / totalQuestions) * 100);
    const mensaje = porcentaje >= 80 ? '🏆 ¡Excelente!' : porcentaje >= 60 ? '👍 ¡Bien hecho!' : '📚 ¡Sigue practicando!';
    
    container.innerHTML = `
        <div class="game-container" style="text-align:center;padding:20px;">
            <h3>${mensaje}</h3>
            <p>Puntuación: <strong>${APP_STATE.gameScore}</strong></p>
            <p>Correctas: ${APP_STATE.gameCorrect}/${totalQuestions} (${porcentaje}%)</p>
            <button class="btn-primary" onclick="iniciarTrivia()" style="margin-top:16px;">🔄 Jugar de nuevo</button>
        </div>`;
    
    if (APP_STATE.gameScore >= 50) {
        desbloquearLogro('trivia_master');
    }
    
    if (APP_STATE.gameScore > 0) {
        agregarXP(APP_STATE.gameScore);
    }
    
    APP_STATE.gameInProgress = false;
}

// ============================================
// GESTIÓN DE LOGROS Y XP
// ============================================
function desbloquearLogro(id) {
    if (APP_STATE.logrosDesbloqueados.includes(id)) return;
    
    const achievement = CONFIG.ACHIEVEMENTS.find(a => a.id === id);
    if (!achievement) return;
    
    APP_STATE.logrosDesbloqueados.push(id);
    showToast(`🏆 ¡Logro desbloqueado! ${achievement.icon} ${achievement.name}`, 'success', 4000);
    actualizarLogros();
    agregarXP(20);
}

function actualizarLogros() {
    const count = APP_STATE.logrosDesbloqueados.length;
    const badge = document.getElementById('achievements-count');
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
        showToast(`🎉 ¡Subiste al nivel ${APP_STATE.nivel}!`, 'success');
    }
    actualizarSidebarUsuario();
}

// ============================================
// ASISTENTE VIRTUAL
// ============================================
function toggleAsistente() {
    APP_STATE.assistantOpen = !APP_STATE.assistantOpen;
    const a = document.getElementById('assistant');
    if (a) a.classList.toggle('hidden', !APP_STATE.assistantOpen);
    if (APP_STATE.assistantOpen && APP_STATE.fabMenuOpen) toggleFabMenu();
}

function enviarMensajeAsistente() {
    const input = document.getElementById('assistant-input');
    if (!input || !input.value.trim()) return;
    
    const mensaje = input.value.trim();
    input.value = '';
    
    agregarMensajeAsistente('user', mensaje);
    
    setTimeout(() => {
        const respuesta = procesarPreguntaAsistente(mensaje);
        agregarMensajeAsistente('bot', respuesta);
    }, 500);
}

function agregarMensajeAsistente(tipo, mensaje) {
    const container = document.getElementById('assistant-messages');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = `assistant-msg ${tipo}`;
    const icon = tipo === 'bot' ? 'bx bx-bot' : 'bx bx-user';
    div.innerHTML = `<i class="${icon}"></i><div class="msg-content"><p>${mensaje}</p></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function procesarPreguntaAsistente(pregunta) {
    const p = pregunta.toLowerCase();
    
    if (p.includes('versículo') || p.includes('versiculo') || p.includes('biblia')) {
        const v = CONFIG.VERSES[Math.floor(Math.random() * CONFIG.VERSES.length)];
        return `📖 "${v.verse}" - ${v.ref}`;
    }
    
    if (p.includes('oración') || p.includes('oracion') || p.includes('rezar') || p.includes('peticion')) {
        return '🙏 "Señor, te pedimos que bendigas a todos los que están orando. Que tu Espíritu Santo nos guíe y nos dé paz. Amén."';
    }
    
    if (p.includes('evento') || p.includes('culto') || p.includes('horario') || p.includes('reunion')) {
        return '📅 Nuestros cultos son: Domingo 10:00 AM, Martes 6:00 PM y Viernes 6:00 PM. ¡Te esperamos!';
    }
    
    if (p.includes('música') || p.includes('musica') || p.includes('radio') || p.includes('cancion') || p.includes('alabanza')) {
        return '🎵 Puedes escuchar nuestra radio en vivo desde la sección "Radio" del menú. ¡Alabanzas para el Señor!';
    }
    
    if (p.includes('donación') || p.includes('donar') || p.includes('ofrenda') || p.includes('diezmo')) {
        return '💝 Puedes hacer tus donaciones desde la sección "Donaciones" en el menú principal. ¡Dios bendiga tu generosidad!';
    }
    
    if (p.includes('juego') || p.includes('trivia') || p.includes('jugar')) {
        return '🎮 Tenemos Trivia Bíblica y más juegos en la sección "Juegos". ¡Diviértete aprendiendo!';
    }
    
    if (p.includes('testimonio') || p.includes('bendicion') || p.includes('bendición')) {
        return '🕊️ Puedes compartir tu testimonio en el "Muro de Bendiciones" de la sección Comunidad.';
    }
    
    if (p.includes('hola') || p.includes('buenos dias') || p.includes('buenas tardes') || p.includes('buenas noches')) {
        return '¡Hola! Soy tu asistente virtual de IPUC LA FONDA. ¿Cómo puedo ayudarte hoy? 🙏';
    }
    
    if (p.includes('gracias')) {
        return '¡De nada! Estoy aquí para ayudarte. ¡Dios te bendiga! 🙏✨';
    }
    
    if (p.includes('ayuda') || p.includes('help')) {
        return '🤖 Puedo ayudarte con: versículos, oración, eventos, música, donaciones, juegos, testimonios, grupos o información general de la iglesia.';
    }
    
    return '🤔 No estoy seguro de entender tu pregunta. Puedes preguntarme sobre: versículos, oración, eventos, música, donaciones, juegos, testimonios o grupos. ¿En qué puedo ayudarte?';
}

// ============================================
// GESTIÓN DE REPORTES
// ============================================
function abrirModalReporte() {
    const m = document.getElementById('report-modal');
    if (!m) return;
    
    const f = document.getElementById('report-form');
    if (f) f.reset();
    
    cambiarTipoReporte('usuario');
    m.classList.remove('hidden');
}

function cerrarModalReporte() {
    const m = document.getElementById('report-modal');
    if (m) m.classList.add('hidden');
}

function cambiarTipoReporte(tipo) {
    const u = document.getElementById('report-user-group');
    const d = document.getElementById('report-date-range');
    const m = document.getElementById('report-ministerio-group');
    
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
    
    const d = document.getElementById('report-descripcion');
    if (!d || !d.value.trim()) {
        showToast('La descripción es obligatoria', 'warning');
        return;
    }
    
    const tipo = document.querySelector('input[name="report-type"]:checked');
    const urg = document.querySelector('input[name="report-urgencia"]:checked');
    const mot = document.getElementById('report-motivo');
    const fileInput = document.getElementById('report-attachment');
    
    const reporte = {
        id: generarId('rpt'),
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
    
    APP_STATE.reportes.unshift(reporte);
    
    actualizarBadgeReportes();
    cerrarModalReporte();
    showToast('Reporte generado exitosamente', 'success');
    
    if (APP_STATE.currentPage === 'gestion-reportes' || APP_STATE.currentPage === 'mis-reportes') {
        navegarA(APP_STATE.currentPage);
    }
}

function actualizarBadgeReportes() {
    let count = 0;
    APP_STATE.reportes.forEach(r => {
        if (r.estado === 'pendiente') count++;
    });
    
    APP_STATE.reportsPendientes = count;
    
    const b = document.getElementById('reports-badge');
    if (b) {
        b.textContent = count;
        b.classList.toggle('hidden', count === 0);
    }
    
    const p = document.getElementById('pending-reports');
    if (p) {
        p.textContent = count;
        p.classList.toggle('hidden', count === 0);
    }
}

function cambiarEstadoReporte(id, estado) {
    const reporte = APP_STATE.reportes.find(r => r.id === id);
    if (!reporte) return;
    
    reporte.estado = estado;
    if (estado === 'resuelto' || estado === 'desestimado') {
        reporte.fecha_resolucion = new Date().toISOString();
    }
    
    actualizarBadgeReportes();
    showToast(`Estado actualizado a: ${estado}`, 'success');
    
    if (APP_STATE.currentPage === 'gestion-reportes') {
        navegarA('gestion-reportes');
    }
}

function verDetalleReporte(id) {
    const reporte = APP_STATE.reportes.find(r => r.id === id);
    if (!reporte) {
        showToast('Reporte no encontrado', 'error');
        return;
    }
    
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    if (!modal || !title || !body) return;
    
    title.textContent = '📋 Detalle del Reporte';
    body.innerHTML = `
        <div style="padding:8px 0;">
            <p><strong>ID:</strong> ${reporte.id.substring(0, 12)}</p>
            <p><strong>Estado:</strong> <span class="badge estado-${reporte.estado}">${reporte.estado}</span></p>
            <p><strong>Tipo:</strong> <span class="badge tipo-${reporte.tipo}">${reporte.tipo}</span></p>
            <p><strong>Urgencia:</strong> <span class="urgencia-${reporte.urgencia}">${reporte.urgencia}</span></p>
            <p><strong>Reportado por:</strong> ${reporte.reportado_por ? reporte.reportado_por.nombre : 'Anónimo'}</p>
            <p><strong>Fecha:</strong> ${formatearFecha(reporte.fecha)}</p>
            <hr style="margin:12px 0;">
            <p><strong>Motivo:</strong> ${reporte.motivo || 'No especificado'}</p>
            <p><strong>Descripción:</strong></p>
            <p style="background:var(--gris-claro);padding:12px;border-radius:8px;margin:4px 0;">${escapeHtml(reporte.descripcion)}</p>
            ${reporte.adjuntos ? `<p><strong>Adjuntos:</strong> ${reporte.adjuntos} archivo(s)</p>` : ''}
        </div>`;
    
    modal.classList.remove('hidden');
}

function cargarReportesRecientes() {
    const c = document.getElementById('recent-reports-list');
    if (!c) return;
    
    const rec = APP_STATE.reportes.slice(0, 5);
    
    if (rec.length === 0) {
        c.innerHTML = '<div class="report-empty"><p>No hay reportes recientes</p></div>';
        return;
    }
    
    c.innerHTML = rec.map(r => `
        <div class="reporte-mini" onclick="verDetalleReporte('${r.id}')">
            <span class="badge estado-${r.estado || 'pendiente'}">${r.estado || 'pendiente'}</span>
            <span class="badge tipo-${r.tipo || 'general'}">${r.tipo || 'general'}</span>
            <p style="font-size:0.85rem;margin:4px 0;">${escapeHtml((r.descripcion || '').substring(0, 60))}...</p>
            <small>${formatearFecha(r.fecha)}</small>
        </div>
    `).join('');
}

function togglePanelReportes() {
    APP_STATE.reportsPanelOpen = !APP_STATE.reportsPanelOpen;
    const p = document.getElementById('reports-quick-panel');
    if (p) p.classList.toggle('hidden', !APP_STATE.reportsPanelOpen);
    
    if (APP_STATE.reportsPanelOpen) {
        cargarReportesRecientes();
        cerrarOtrosPaneles('reports');
    }
}

// ============================================
// BÚSQUEDA GLOBAL
// ============================================
function toggleSearchBar() {
    APP_STATE.searchBarOpen = !APP_STATE.searchBarOpen;
    const b = document.getElementById('search-bar');
    if (b) b.classList.toggle('hidden', !APP_STATE.searchBarOpen);
    
    if (APP_STATE.searchBarOpen) {
        const input = document.getElementById('global-search-input');
        if (input) setTimeout(() => input.focus(), 100);
    }
}

function realizarBusqueda(query) {
    const results = document.getElementById('search-results');
    if (!results) return;
    
    if (!query || query.length < 2) {
        results.innerHTML = '';
        return;
    }
    
    const q = query.toLowerCase();
    let resultados = [];
    
    // Buscar en páginas
    Object.keys(CONFIG.TITULOS_PAGINAS).forEach(page => {
        if (CONFIG.TITULOS_PAGINAS[page].toLowerCase().includes(q)) {
            resultados.push({ type: 'page', id: page, name: CONFIG.TITULOS_PAGINAS[page], icon: '📄' });
        }
    });
    
    // Buscar en versículos
    CONFIG.VERSES.forEach((v, i) => {
        if (v.verse.toLowerCase().includes(q) || v.ref.toLowerCase().includes(q)) {
            resultados.push({ type: 'verse', id: `verse_${i}`, name: `${v.verse} - ${v.ref}`, icon: '📖' });
        }
    });
    
    // Buscar en playlist
    CONFIG.PLAYLIST.forEach((s, i) => {
        if (s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)) {
            resultados.push({ type: 'song', id: `song_${i}`, name: `${s.title} - ${s.artist}`, icon: '🎵' });
        }
    });
    
    if (resultados.length === 0) {
        results.innerHTML = '<p style="padding:12px;color:var(--gris-texto);">No se encontraron resultados</p>';
        return;
    }
    
    results.innerHTML = resultados.slice(0, 10).map(r => `
        <div style="padding:8px 12px;cursor:pointer;border-radius:8px;margin:2px 0;"
             onmouseover="this.style.background='var(--gris-claro)'"
             onmouseout="this.style.background='transparent'"
             onclick="seleccionarResultadoBusqueda('${r.type}','${r.id}')">
            ${r.icon} ${escapeHtml(r.name)}
        </div>
    `).join('');
}

function seleccionarResultadoBusqueda(type, id) {
    const searchBar = document.getElementById('search-bar');
    if (searchBar) searchBar.classList.add('hidden');
    APP_STATE.searchBarOpen = false;
    
    if (type === 'page') {
        navegarA(id);
    } else if (type === 'verse') {
        const index = parseInt(id.split('_')[1]);
        showToast(`📖 ${CONFIG.VERSES[index].verse}`, 'info', 5000);
    } else if (type === 'song') {
        const index = parseInt(id.split('_')[1]);
        reproducirCancion(index);
    }
}

// ============================================
// NOTIFICACIONES
// ============================================
function toggleNotificaciones() {
    APP_STATE.notificationsOpen = !APP_STATE.notificationsOpen;
    const p = document.getElementById('notification-panel');
    if (p) p.classList.toggle('hidden', !APP_STATE.notificationsOpen);
    
    if (APP_STATE.notificationsOpen) {
        actualizarNotificaciones();
        const badge = document.querySelector('.badge-notifications');
        if (badge) {
            badge.textContent = '0';
            badge.classList.add('hidden');
        }
        APP_STATE.notificacionesNoLeidas = 0;
    }
}

function actualizarNotificaciones() {
    const list = document.getElementById('notification-list');
    if (!list) return;
    
    const notificaciones = [
        { icon: '📅', title: 'Nuevo Evento', desc: 'Culto de Adoración este domingo', time: 'Hace 2 horas', type: 'evento' },
        { icon: '🙏', title: 'Petición de Oración', desc: 'María pide oración por su familia', time: 'Hace 4 horas', type: 'oracion' },
        { icon: '📢', title: 'Anuncio', desc: 'Retiro de Jóvenes - 15 de agosto', time: 'Hace 1 día', type: 'sistema' },
        { icon: '🎵', title: 'Nueva Canción', desc: '"Santo Espíritu" disponible en la radio', time: 'Hace 2 días', type: 'sistema' }
    ];
    
    list.innerHTML = notificaciones.map(n => `
        <div class="card" style="padding:12px;margin-bottom:8px;border-left:4px solid var(--azul-primario);">
            <div style="display:flex;gap:10px;align-items:start;">
                <span style="font-size:1.5rem;">${n.icon}</span>
                <div style="flex:1;">
                    <strong>${n.title}</strong>
                    <p style="font-size:0.9rem;margin:2px 0;">${n.desc}</p>
                    <small style="color:var(--gris-texto);">${n.time}</small>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// ESTADÍSTICAS EN TIEMPO REAL
// ============================================
function actualizarEstadisticas() {
    APP_STATE.usuariosActivos = Math.floor(Math.random() * 20) + 5;
    const online = document.getElementById('online-users');
    if (online) online.textContent = APP_STATE.usuariosActivos;
    
    APP_STATE.totalMiembros = Math.floor(Math.random() * 500) + 100;
    const members = document.getElementById('total-members');
    if (members) members.textContent = APP_STATE.totalMiembros;
    
    APP_STATE.totalOraciones = Math.floor(Math.random() * 200) + 50;
    const prayers = document.getElementById('prayers-count');
    if (prayers) prayers.textContent = APP_STATE.totalOraciones;
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
    const dd = document.getElementById('contador-dias');
    const hh = document.getElementById('contador-horas');
    const mm = document.getElementById('contador-minutos');
    const ss = document.getElementById('contador-segundos');
    
    if (!dd && !hh) return;
    
    try {
        const ahora = new Date();
        const dom = new Date(ahora);
        const diasHastaDomingo = (7 - ahora.getDay()) % 7;
        dom.setDate(ahora.getDate() + (diasHastaDomingo === 0 ? 7 : diasHastaDomingo));
        dom.setHours(10, 0, 0, 0);
        
        if (dom <= ahora) dom.setDate(dom.getDate() + 7);
        
        const diff = Math.max(0, (dom - ahora) / 1000);
        
        if (dd) dd.textContent = String(Math.floor(diff / 86400)).padStart(2, '0');
        if (hh) hh.textContent = String(Math.floor((diff % 86400) / 3600)).padStart(2, '0');
        if (mm) mm.textContent = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        if (ss) ss.textContent = String(Math.floor(diff % 60)).padStart(2, '0');
    } catch (e) {}
}

// ============================================
// MODALES Y CONFIRMACIONES
// ============================================
function cerrarModal() {
    const m = document.getElementById('modal');
    if (m) m.classList.add('hidden');
    const footer = document.getElementById('modal-footer');
    if (footer) {
        footer.classList.add('hidden');
        footer.innerHTML = '';
    }
}

function confirmarAccion(titulo, mensaje, callback) {
    const t = document.getElementById('confirm-title');
    const m = document.getElementById('confirm-message');
    const modal = document.getElementById('confirm-modal');
    
    if (!modal) return;
    
    if (t) t.textContent = titulo || '¿Estás seguro?';
    if (m) m.textContent = mensaje || '';
    
    APP_STATE.pendingConfirmation = callback;
    modal.classList.remove('hidden');
}

// ============================================
// PÁGINAS - IMPLEMENTACIONES COMPLETAS
// ============================================
function cargarInicio(c) {
    const isAdmin = APP_STATE.rol === 'admin';
    
    c.innerHTML = `
        <div class="fade-in">
            <!-- Contador Regresivo -->
            <div class="card" style="text-align:center;border-left:4px solid var(--dorado);">
                <h3>⛪ Próximo Culto Dominical</h3>
                <div style="display:flex;justify-content:center;gap:16px;margin:16px 0;flex-wrap:wrap;">
                    <div style="text-align:center;"><span style="font-size:1.5rem;font-weight:700;" id="contador-dias">00</span><br><small>Días</small></div>
                    <div style="text-align:center;"><span style="font-size:1.5rem;font-weight:700;" id="contador-horas">00</span><br><small>Horas</small></div>
                    <div style="text-align:center;"><span style="font-size:1.5rem;font-weight:700;" id="contador-minutos">00</span><br><small>Minutos</small></div>
                    <div style="text-align:center;"><span style="font-size:1.5rem;font-weight:700;" id="contador-segundos">00</span><br><small>Segundos</small></div>
                </div>
                <span class="badge estado-proximo">🔔 PRÓXIMO CULTO</span>
            </div>
            
            <!-- Banner Principal -->
            <div class="card" style="text-align:center;border-left:4px solid var(--dorado);">
                <h3>🎉 IPUC LA FONDA v${CONFIG.VERSION} ${CONFIG.VERSION_NAME}</h3>
                <p>"Donde el Espíritu Santo se mueve"</p>
                <div style="margin-top:8px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">
                    ${isAdmin ? '<span class="badge estado-resuelto">👑 Admin</span>' : ''}
                    <span class="badge">Lv.${APP_STATE.nivel}</span>
                    <span class="badge">🎯 ${APP_STATE.logrosDesbloqueados.length} logros</span>
                </div>
            </div>
            
            <!-- Accesos Rápidos -->
            <div class="card">
                <h3>⚡ Accesos Rápidos</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:8px;">
                    <button class="btn-outline btn-sm" onclick="navegarA('asistencia')">✅ Asistencia</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('publicaciones')">📝 Publicar</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('eventos')">📅 Eventos</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('oracion')">🙏 Oración</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('devocional')">📖 Devocional</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('radio')">🎵 Radio</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('trivia')">🧠 Trivia</button>
                    ${isAdmin ? '<button class="btn-outline btn-sm" onclick="navegarA(\'admin-dashboard\')">📊 Admin</button>' : ''}
                </div>
            </div>
            
            <!-- Estadísticas -->
            <div class="card">
                <h3>📊 Estadísticas</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;text-align:center;">
                    <div><strong style="font-size:1.5rem;">${APP_STATE.usuariosActivos}</strong><p style="font-size:0.75rem;">En Línea</p></div>
                    <div><strong style="font-size:1.5rem;">${APP_STATE.totalMiembros}</strong><p style="font-size:0.75rem;">Miembros</p></div>
                    <div><strong style="font-size:1.5rem;">${APP_STATE.totalOraciones}</strong><p style="font-size:0.75rem;">Oraciones</p></div>
                    <div><strong style="font-size:1.5rem;">${APP_STATE.reportsPendientes}</strong><p style="font-size:0.75rem;">Reportes</p></div>
                </div>
            </div>
        </div>`;
    
    iniciarContador();
}

function cargarHorarios(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>🕐 Horarios de Cultos</h2>
            <div class="card"><h3>⛪ Domingo</h3><p>Culto Dominical - 10:00 AM</p></div>
            <div class="card"><h3>🔥 Martes</h3><p>Culto de Oración - 6:00 PM</p></div>
            <div class="card"><h3>🎵 Viernes</h3><p>Culto de Jóvenes - 6:00 PM</p></div>
            <div class="card"><h3>📖 Sábado</h3><p>Escuela Bíblica - 4:00 PM</p></div>
        </div>`;
}

function cargarAsistencia(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>✅ Confirmar Asistencia</h2>
            <div class="card" style="text-align:center;padding:30px;">
                <h3>Próximo Culto</h3>
                <p style="font-size:1.2rem;">Domingo 10:00 AM</p>
                <button class="btn-primary btn-sm" onclick="confirmarAsistencia()" style="margin-top:12px;">✅ Confirmar Asistencia</button>
            </div>
            <div class="card">
                <h3>Mi Asistencia</h3>
                <p>Has confirmado tu asistencia <strong>3</strong> veces este mes</p>
                <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
                    <span class="badge estado-resuelto">✅ 1er Domingo</span>
                    <span class="badge estado-resuelto">✅ 2do Domingo</span>
                    <span class="badge estado-pendiente">⏳ Próximo</span>
                </div>
            </div>
        </div>`;
}

function confirmarAsistencia() {
    showToast('✅ Asistencia confirmada para el próximo culto', 'success');
}

function cargarNoticias(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>📰 Noticias</h2>
            <div class="card"><h3>📢 Anuncio Importante</h3><p>Nuevo horario de cultos a partir del próximo mes</p><small>${formatearFecha(new Date())}</small></div>
            <div class="card"><h3>🎉 Celebración de Aniversario</h3><p>Celebraremos el aniversario de la iglesia el próximo domingo</p><small>${formatearFecha(new Date(Date.now() - 86400000))}</small></div>
        </div>`;
}

function cargarEventos(c) {
    const eventos = APP_STATE.eventos || [];
    const proximos = eventos
        .filter(e => new Date(e.fecha) >= new Date())
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>📅 Eventos</h2>
            ${APP_STATE.rol === 'admin' ? '<button class="btn-primary btn-sm" onclick="abrirModalEvento()" style="margin-bottom:12px;">➕ Crear Evento</button>' : ''}
            ${proximos.length === 0 ? 
                '<div class="card"><p>No hay eventos próximos</p></div>' :
                proximos.map(e => `
                    <div class="card">
                        <h3>${escapeHtml(e.titulo)}</h3>
                        <p>${escapeHtml(e.desc || '')}</p>
                        <small>📅 ${formatearFecha(e.fecha)}${e.hora ? ` ⏰ ${e.hora}` : ''}${e.lugar ? ` 📍 ${e.lugar}` : ''}</small>
                    </div>
                `).join('')
            }
        </div>`;
}

function cargarPublicaciones(c) {
    const pub = APP_STATE.publicaciones || [];
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>📝 Publicaciones</h2>
            ${APP_STATE.usuario ? `
                <div class="card">
                    <textarea class="form-input" id="pub-contenido" rows="3" placeholder="¿Qué quieres compartir?"></textarea>
                    <button class="btn-primary btn-sm" onclick="crearPubLocal()" style="margin-top:8px;">Publicar</button>
                </div>` : ''}
            ${pub.length === 0 ? 
                '<div class="card"><p>No hay publicaciones</p></div>' :
                pub.map(p => `
                    <div class="card">
                        <p><strong>${escapeHtml(p.autor || 'Anónimo')}</strong></p>
                        <p>${escapeHtml(p.contenido || '')}</p>
                        <small>${formatearFecha(p.fecha)}</small>
                    </div>
                `).join('')
            }
        </div>`;
}

function crearPubLocal() {
    const txt = document.getElementById('pub-contenido');
    if (!txt || !txt.value.trim()) {
        showToast('Escribe algo para publicar', 'warning');
        return;
    }
    if (!APP_STATE.usuario) {
        showToast('Inicia sesión para publicar', 'warning');
        return;
    }
    
    APP_STATE.publicaciones.unshift({
        id: generarId('pub'),
        usuario_id: APP_STATE.usuario.id || 0,
        autor: APP_STATE.usuario.nombre || 'Anónimo',
        contenido: txt.value.trim(),
        fecha: new Date().toISOString()
    });
    
    txt.value = '';
    showToast('📝 Publicación creada', 'success');
    navegarA('publicaciones');
}

function cargarPerfil(c) {
    if (!APP_STATE.usuario) {
        c.innerHTML = '<div class="fade-in"><h2>👤 Perfil</h2><div class="card"><p>Inicia sesión para ver tu perfil</p></div></div>';
        return;
    }
    
    const u = APP_STATE.usuario;
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>👤 Mi Perfil</h2>
            <div class="card" style="text-align:center;">
                <img src="${u.foto || 'assets/avatars/default.png'}" style="width:80px;height:80px;border-radius:50%;margin-bottom:12px;object-fit:cover;">
                <h3>${u.nombre || ''} ${u.apellidos || ''}</h3>
                <p>@${u.usuario || ''}</p>
                <p>${u.correo || ''}</p>
                <p>📌 ${u.ministerio || 'General'}</p>
                <div style="margin-top:8px;display:flex;gap:8px;justify-content:center;">
                    <span class="badge">Lv.${APP_STATE.nivel}</span>
                    <span class="badge">🏆 ${APP_STATE.logrosDesbloqueados.length} logros</span>
                </div>
            </div>
            <button class="btn-danger btn-sm" onclick="confirmarAccion('Cerrar sesión?','',cerrarSesion)">🚪 Cerrar Sesión</button>
        </div>`;
}

function cargarConfiguracion(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>⚙️ Configuración</h2>
            <div class="card">
                <h3>🎨 Apariencia</h3>
                <button class="btn-secondary btn-sm" onclick="toggleTema()">${APP_STATE.tema === 'dark' ? '☀️ Cambiar a Claro' : '🌙 Cambiar a Oscuro'}</button>
            </div>
            <div class="card">
                <h3>🌐 Idioma</h3>
                <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px;">
                    ${['es', 'en', 'pt', 'fr', 'de'].map(lang => `
                        <button class="lang-btn ${APP_STATE.idioma === lang ? 'active' : ''}" onclick="cambiarIdioma('${lang}')">${lang.toUpperCase()}</button>
                    `).join('')}
                </div>
            </div>
            <div class="card">
                <h3>📱 Aplicación</h3>
                <p><strong>Versión:</strong> ${CONFIG.VERSION} ${CONFIG.VERSION_NAME}</p>
                <p><strong>Modo:</strong> ${APP_STATE.isOnline ? '🟢 Online' : '🔴 Offline'}</p>
            </div>
            ${APP_STATE.usuario ? '<button class="btn-danger btn-sm" onclick="confirmarAccion(\'Cerrar sesión?\',\'\',cerrarSesion)">🚪 Cerrar Sesión</button>' : ''}
        </div>`;
}

function cargarGestionReportes(c) {
    const reportes = APP_STATE.reportes || [];
    const pendientes = reportes.filter(r => r.estado === 'pendiente').length;
    const resueltos = reportes.filter(r => r.estado === 'resuelto').length;
    const desestimados = reportes.filter(r => r.estado === 'desestimado').length;
    
    c.innerHTML = `
        <div class="fade-in">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h2>📋 Gestión de Reportes</h2>
                <button class="btn-primary btn-sm" onclick="abrirModalReporte()">Nuevo Reporte</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">
                <div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">${reportes.length}</p><p style="font-size:0.75rem;">Total</p></div>
                <div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">${pendientes}</p><p style="font-size:0.75rem;">Pendientes</p></div>
                <div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">${resueltos}</p><p style="font-size:0.75rem;">Resueltos</p></div>
                <div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">${desestimados}</p><p style="font-size:0.75rem;">Desestimados</p></div>
            </div>
            ${reportes.length === 0 ? 
                '<div class="card" style="text-align:center;padding:40px;"><p>No hay reportes registrados</p></div>' :
                reportes.map(r => `
                    <div class="card" style="margin-bottom:8px;border-left:4px solid ${r.urgencia === 'critica' ? 'var(--error)' : r.urgencia === 'alta' ? 'var(--advertencia)' : 'var(--info)'};">
                        <div style="display:flex;justify-content:space-between;align-items:start;">
                            <div style="flex:1;">
                                <span class="badge estado-${r.estado || 'pendiente'}" style="margin-right:6px;">${r.estado || 'pendiente'}</span>
                                <span class="badge tipo-${r.tipo || 'general'}">${r.tipo || 'general'}</span>
                                <p style="font-size:0.9rem;margin:4px 0;">${escapeHtml((r.descripcion || '').substring(0, 100))}...</p>
                                <small>Reportado por: ${r.reportado_por ? r.reportado_por.nombre : 'Anónimo'} - ${formatearFecha(r.fecha)}</small>
                            </div>
                            <div style="display:flex;gap:4px;">
                                <button class="btn-primary btn-sm" onclick="verDetalleReporte('${r.id}')" title="Ver"><i class="bx bx-show"></i></button>
                                ${r.estado === 'pendiente' ? `<button class="btn-success btn-sm" onclick="cambiarEstadoReporte('${r.id}','en_revision')" title="Revisar"><i class="bx bx-check"></i></button>` : ''}
                                ${r.estado === 'en_revision' ? `<button class="btn-success btn-sm" onclick="cambiarEstadoReporte('${r.id}','resuelto')" title="Resolver"><i class="bx bx-check-double"></i></button>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')
            }
        </div>`;
}

function cargarMisReportes(c) {
    if (!APP_STATE.usuario) {
        c.innerHTML = '<div class="fade-in"><h2>Mis Reportes</h2><div class="card"><p>Inicia sesión para ver tus reportes</p></div></div>';
        return;
    }
    
    const mis = APP_STATE.reportes.filter(r => r.reportado_por && r.reportado_por.id === APP_STATE.usuario.id);
    
    c.innerHTML = `
        <div class="fade-in">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h2>Mis Reportes</h2>
                <button class="btn-primary btn-sm" onclick="abrirModalReporte()">Nuevo Reporte</button>
            </div>
            ${mis.length === 0 ? 
                '<div class="card" style="text-align:center;padding:40px;"><p>No has generado ningún reporte</p></div>' :
                mis.map(r => `
                    <div class="card" style="margin-bottom:8px;">
                        <span class="badge estado-${r.estado || 'pendiente'}">${r.estado || 'pendiente'}</span>
                        <span class="badge tipo-${r.tipo || 'general'}">${r.tipo || 'general'}</span>
                        <p style="font-size:0.9rem;">${escapeHtml((r.descripcion || '').substring(0, 100))}...</p>
                        <small>${formatearFecha(r.fecha)}</small>
                    </div>
                `).join('')
            }
        </div>`;
}

function cargarSistema(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>🖥️ Sistema</h2>
            <div class="card">
                <p><strong>Versión:</strong> ${CONFIG.VERSION} ${CONFIG.VERSION_NAME}</p>
                <p><strong>Modo:</strong> ${APP_STATE.isOnline ? '🟢 Online' : '🔴 Offline'}</p>
                <p><strong>Tema:</strong> ${APP_STATE.tema}</p>
                <p><strong>Idioma:</strong> ${APP_STATE.idioma.toUpperCase()}</p>
                <p><strong>Usuario:</strong> ${APP_STATE.usuario ? APP_STATE.usuario.nombre : 'Invitado'}</p>
                <p><strong>Nivel:</strong> ${APP_STATE.nivel}</p>
                <p><strong>XP:</strong> ${APP_STATE.xp} / ${APP_STATE.xpSiguiente}</p>
            </div>
        </div>`;
}

function cargarPeticiones(c) {
    const peticiones = APP_STATE.peticiones || [];
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>🙏 Peticiones de Oración</h2>
            <div class="card">
                <div class="form-group">
                    <label>Motivo de Oración</label>
                    <textarea class="form-input" id="pet-motivo" rows="2" placeholder="Motivo de oración..."></textarea>
                </div>
                <button class="btn-primary btn-sm" onclick="crearPeticionLocal()">Enviar Petición</button>
            </div>
            ${peticiones.length === 0 ? 
                '<div class="card"><p>No hay peticiones</p></div>' :
                peticiones.map(p => `
                    <div class="card">
                        <p><strong>${escapeHtml(p.nombre || 'Anónimo')}</strong></p>
                        <p>${escapeHtml(p.motivo || '')}</p>
                        <small>${formatearFecha(p.fecha)}</small>
                    </div>
                `).join('')
            }
        </div>`;
}

function crearPeticionLocal() {
    const m = document.getElementById('pet-motivo');
    if (!m || !m.value.trim()) {
        showToast('Escribe un motivo', 'warning');
        return;
    }
    if (!APP_STATE.usuario) {
        showToast('Inicia sesión', 'warning');
        return;
    }
    
    APP_STATE.peticiones.unshift({
        id: generarId('pet'),
        nombre: APP_STATE.usuario.nombre || 'Anónimo',
        motivo: m.value.trim(),
        fecha: new Date().toISOString()
    });
    
    m.value = '';
    showToast('🙏 Petición enviada', 'success');
    desbloquearLogro('first_prayer');
    navegarA('peticiones');
}

// Páginas adicionales
function cargarDashboard(c) {
    c.innerHTML = '<div class="fade-in"><h2>📊 Dashboard</h2><div class="card"><p>Panel de Administración</p><p>Bienvenido al panel de control de IPUC LA FONDA</p></div></div>';
}

function cargarRadio(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>🎵 Radio en Vivo</h2>
            <div class="card" style="text-align:center;">
                <button class="btn-radio btn-radio-main" onclick="toggleRadio()" style="width:64px;height:64px;font-size:2.5rem;border-radius:50%;background:var(--azul-primario);color:var(--blanco);">
                    <i class="bx ${APP_STATE.radioPlaying ? 'bx-pause-circle' : 'bx-play-circle'}"></i>
                </button>
                <h3 style="margin-top:12px;">Radio IPUC LA FONDA</h3>
                <p>Alabanzas de Adoración</p>
                <button class="btn-primary btn-sm" onclick="toggleRadioPanel()" style="margin-top:12px;">📻 Abrir Reproductor</button>
            </div>
        </div>`;
}

function cargarStreaming(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>📺 Transmisión en Vivo</h2>
            <div class="card" style="text-align:center;">
                <div style="background:var(--gris-oscuro);border-radius:12px;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;color:var(--blanco);">
                    <div>
                        <i class="bx bx-video-recording" style="font-size:4rem;opacity:0.3;"></i>
                        <p>Próxima transmisión en vivo</p>
                    </div>
                </div>
                <button class="btn-primary btn-sm" onclick="toggleStreamingPanel()" style="margin-top:12px;">📺 Abrir Transmisión</button>
            </div>
        </div>`;
}

function cargarMapa(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>📍 Ubicación</h2>
            <div class="card" style="height:400px;display:flex;align-items:center;justify-content:center;background:var(--gris-claro);border-radius:12px;">
                <div style="text-align:center;">
                    <i class="bx bx-map" style="font-size:3rem;color:var(--gris-texto);"></i>
                    <p>Mapa interactivo de la iglesia</p>
                    <p style="font-size:0.8rem;color:var(--gris-texto);">Dirección: Colombia</p>
                    <button class="btn-primary btn-sm" onclick="showToast('Abriendo mapa...','info')">Ver en Google Maps</button>
                </div>
            </div>
        </div>`;
}

function cargarOracion(c) {
    const oraciones = APP_STATE.oraciones || [];
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>🙏 Cadena de Oración</h2>
            <div class="card">
                <form id="prayer-form-local" onsubmit="enviarOracionLocal(event)">
                    <div class="form-group">
                        <label>Tu Nombre</label>
                        <input type="text" id="prayer-name-local" class="form-input" placeholder="Anónimo o tu nombre">
                    </div>
                    <div class="form-group">
                        <label>Petición de Oración *</label>
                        <textarea id="prayer-request-local" class="form-input" rows="3" placeholder="Comparte tu petición..." required></textarea>
                    </div>
                    <button type="submit" class="btn-primary btn-block"><i class="bx bx-send"></i> Enviar Oración</button>
                </form>
            </div>
            ${oraciones.length === 0 ? 
                '<div class="card"><p style="text-align:center;color:var(--gris-texto);">No hay peticiones de oración aún</p></div>' :
                oraciones.map(o => `
                    <div class="card">
                        <p><strong>${o.nombre || 'Anónimo'}</strong></p>
                        <p>${escapeHtml(o.motivo || '')}</p>
                        <small>${formatearFecha(o.fecha)}</small>
                    </div>
                `).join('')
            }
        </div>`;
}

function enviarOracionLocal(e) {
    if (e) e.preventDefault();
    
    const nombre = document.getElementById('prayer-name-local');
    const motivo = document.getElementById('prayer-request-local');
    
    if (!motivo || !motivo.value.trim()) {
        showToast('Escribe tu petición', 'warning');
        return;
    }
    
    APP_STATE.oraciones.unshift({
        id: generarId('oracion'),
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
    c.innerHTML = `
        <div class="fade-in">
            <h2>👥 Grupos y Células</h2>
            <div class="card">
                <h3>Grupos disponibles</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
                    <div style="padding:12px;border:1px solid var(--gris-medio);border-radius:8px;"><strong>Jóvenes</strong><p style="font-size:0.85rem;">Líder: Juan P.</p><small>Viernes 6:00 PM</small></div>
                    <div style="padding:12px;border:1px solid var(--gris-medio);border-radius:8px;"><strong>Damas</strong><p style="font-size:0.85rem;">Líder: María G.</p><small>Miércoles 4:00 PM</small></div>
                </div>
            </div>
        </div>`;
}

function cargarLecturaBiblica(c) {
    const progreso = Math.round((APP_STATE.lecturasCompletadas / APP_STATE.lecturasTotal) * 100);
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>📖 Plan de Lectura</h2>
            <div class="card">
                <h3>Biblia en un año</h3>
                <div style="margin:12px 0;">
                    <strong>Progreso: ${APP_STATE.lecturasCompletadas}/${APP_STATE.lecturasTotal}</strong>
                    <div style="height:8px;background:var(--gris-medio);border-radius:4px;margin-top:4px;overflow:hidden;">
                        <div style="height:100%;width:${progreso}%;background:linear-gradient(90deg,var(--azul-primario),var(--dorado));border-radius:4px;transition:width 0.5s;"></div>
                    </div>
                </div>
                <button class="btn-primary btn-sm" onclick="marcarLecturaCompletada()" style="margin-top:8px;">✅ Marcar como leído</button>
            </div>
        </div>`;
}

function marcarLecturaCompletada() {
    APP_STATE.lecturasCompletadas++;
    showToast('📖 Lectura marcada como completada', 'success');
    if (APP_STATE.lecturasCompletadas >= 10) desbloquearLogro('bible_reader');
    navegarA('lectura-biblica');
}

function cargarConcordancia(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>🔍 Concordancia Bíblica</h2>
            <div class="card">
                <div class="form-group">
                    <label>Buscar palabra en la Biblia</label>
                    <div style="display:flex;gap:8px;">
                        <input type="text" id="concordancia-input" class="form-input" placeholder="Ej: amor, fe, esperanza..." onkeypress="if(event.key==='Enter')buscarConcordancia()">
                        <button class="btn-primary" onclick="buscarConcordancia()">Buscar</button>
                    </div>
                </div>
                <div id="concordancia-resultados"><p style="color:var(--gris-texto);">Ingresa una palabra para buscar</p></div>
            </div>
        </div>`;
}

function buscarConcordancia() {
    const input = document.getElementById('concordancia-input');
    if (!input || !input.value.trim()) {
        showToast('Ingresa una palabra', 'warning');
        return;
    }
    
    const query = input.value.trim().toLowerCase();
    const resultados = CONFIG.VERSES.filter(v => 
        v.verse.toLowerCase().includes(query) || v.ref.toLowerCase().includes(query)
    );
    
    const container = document.getElementById('concordancia-resultados');
    if (!container) return;
    
    if (resultados.length === 0) {
        container.innerHTML = `<p style="color:var(--gris-texto);">No se encontraron versículos con "${query}"</p>`;
        return;
    }
    
    container.innerHTML = resultados.map(v => `
        <div style="padding:8px;border-bottom:1px solid var(--gris-medio);">"${v.verse}" - ${v.ref}</div>
    `).join('');
}

function cargarHimnario(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>🎵 Himnario</h2>
            <div class="card">
                <h3>Canciones de alabanza</h3>
                <div style="margin-top:12px;">
                    ${CONFIG.PLAYLIST.map((s, i) => `
                        <div style="padding:8px;border-bottom:1px solid var(--gris-medio);display:flex;justify-content:space-between;align-items:center;">
                            <span><strong>${s.title}</strong> - ${s.artist}</span>
                            <button class="btn-outline btn-sm" onclick="reproducirCancion(${i})">🎵 Escuchar</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;
}

function cargarDiarioEspiritual(c) {
    const entries = APP_STATE.diaryEntries || [];
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>📝 Diario Espiritual</h2>
            <div class="card">
                <form onsubmit="guardarEntradaDiario(event)">
                    <div class="form-group">
                        <label>Fecha</label>
                        <input type="date" id="diario-fecha" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label>Reflexión del día</label>
                        <textarea id="diario-contenido" class="form-input" rows="4" placeholder="Escribe tu reflexión espiritual..." required></textarea>
                    </div>
                    <button type="submit" class="btn-primary btn-block">Guardar Reflexión</button>
                </form>
            </div>
            ${entries.length === 0 ? 
                '<div class="card"><p style="color:var(--gris-texto);">No hay entradas en tu diario</p></div>' :
                entries.map(e => `
                    <div class="card"><strong>${formatearFecha(e.fecha)}</strong><p>${escapeHtml(e.contenido)}</p></div>
                `).join('')
            }
        </div>`;
}

function guardarEntradaDiario(e) {
    if (e) e.preventDefault();
    
    const fecha = document.getElementById('diario-fecha');
    const contenido = document.getElementById('diario-contenido');
    
    if (!contenido || !contenido.value.trim()) {
        showToast('Escribe tu reflexión', 'warning');
        return;
    }
    
    APP_STATE.diaryEntries.unshift({
        fecha: fecha ? fecha.value : new Date().toISOString(),
        contenido: contenido.value.trim()
    });
    
    if (contenido) contenido.value = '';
    showToast('📝 Reflexión guardada', 'success');
    navegarA('diario-espiritual');
}

function cargarLogros(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>🏆 Logros Desbloqueados</h2>
            <div class="card">
                <p>Has desbloqueado <strong>${APP_STATE.logrosDesbloqueados.length}</strong> de ${CONFIG.ACHIEVEMENTS.length} logros</p>
                <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;">
                    ${CONFIG.ACHIEVEMENTS.map(a => {
                        const unlocked = APP_STATE.logrosDesbloqueados.includes(a.id);
                        return `
                            <div style="text-align:center;padding:12px;border:2px solid ${unlocked ? 'var(--oro)' : 'var(--gris-medio)'};border-radius:8px;background:${unlocked ? 'var(--dorado-claro)' : 'transparent'};opacity:${unlocked ? '1' : '0.6'};">
                                <div style="font-size:2rem;">${a.icon}</div>
                                <strong style="font-size:0.85rem;">${a.name}</strong>
                                ${unlocked ? '<span style="color:var(--exito);font-size:0.7rem;display:block;">✅ Desbloqueado</span>' : '<span style="color:var(--gris-texto);font-size:0.7rem;display:block;">🔒 Bloqueado</span>'}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>`;
}

function cargarTrivia(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>🧠 Trivia Bíblica</h2>
            <div class="card" style="text-align:center;padding:30px;">
                <p style="font-size:1.2rem;">Pon a prueba tu conocimiento bíblico</p>
                <button class="btn-primary btn-lg" onclick="iniciarTrivia()" style="margin-top:16px;">🎮 Jugar Ahora</button>
            </div>
            <div class="card">
                <h3>Estadísticas</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;text-align:center;">
                    <div><strong style="font-size:1.5rem;">${APP_STATE.gameScore}</strong><p>Puntos</p></div>
                    <div><strong style="font-size:1.5rem;">${APP_STATE.gameCorrect}</strong><p>Correctas</p></div>
                    <div><strong style="font-size:1.5rem;">${APP_STATE.nivel}</strong><p>Nivel</p></div>
                </div>
            </div>
        </div>`;
}

function cargarJuegos(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>🎮 Juegos Bíblicos</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA('trivia')">
                    <div style="font-size:3rem;">🧠</div><h3>Trivia Bíblica</h3><p>Preguntas y respuestas</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="showToast('Próximamente...','info')">
                    <div style="font-size:3rem;">🔍</div><h3>Busca la Palabra</h3><p>Encuentra versículos</p>
                </div>
            </div>
        </div>`;
}

function cargarRanking(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>🏅 Ranking</h2>
            <div class="card">
                <h3>Top 5 - Gamificación</h3>
                <div style="margin-top:12px;">
                    <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--gris-medio);"><span>🥇 1. Usuario1</span><span>1500 pts</span></div>
                    <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--gris-medio);"><span>🥈 2. Usuario2</span><span>1200 pts</span></div>
                    <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--gris-medio);"><span>🥉 3. Usuario3</span><span>1000 pts</span></div>
                </div>
            </div>
            ${APP_STATE.usuario ? `
                <div class="card" style="border-left:4px solid var(--dorado);">
                    <p><strong>Tu posición:</strong> #${Math.floor(Math.random() * 20) + 1}</p>
                    <p><strong>Puntos:</strong> ${APP_STATE.xp} XP</p>
                    <p><strong>Nivel:</strong> ${APP_STATE.nivel}</p>
                </div>` : ''}
        </div>`;
}

function cargarPlaylistPage(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>🎵 Playlist de Adoración</h2>
            <div class="card">
                <h3>Lista de reproducción</h3>
                ${CONFIG.PLAYLIST.map((s, i) => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--gris-medio);">
                        <div><strong>${s.title}</strong><br><span style="font-size:0.85rem;color:var(--gris-texto);">${s.artist}</span></div>
                        <div><span style="font-size:0.85rem;color:var(--gris-texto);">${s.duration}</span> 
                        <button class="btn-outline btn-sm" onclick="reproducirCancion(${i})">▶️</button></div>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function cargarBlog(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>📝 Blog/Noticias</h2>
            <div class="card">
                <h3>Últimas publicaciones</h3>
                <div style="padding:12px;border-bottom:1px solid var(--gris-medio);">
                    <h4>Anuncio: Nuevo Horario de Cultos</h4>
                    <p style="font-size:0.85rem;color:var(--gris-texto);">A partir del próximo domingo, los cultos serán a las 10:00 AM...</p>
                    <small>${formatearFecha(new Date())}</small>
                </div>
            </div>
        </div>`;
}

function cargarMuroBendiciones(c) {
    const bendiciones = APP_STATE.bendiciones || [];
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>🕊️ Muro de Bendiciones</h2>
            <div class="card">
                <form onsubmit="enviarBendicion(event)">
                    <div class="form-group">
                        <textarea id="bendicion-input" class="form-input" rows="2" placeholder="Comparte tu testimonio o bendición..." required></textarea>
                    </div>
                    <button type="submit" class="btn-primary btn-sm">🕊️ Compartir Bendición</button>
                </form>
            </div>
            ${bendiciones.length === 0 ? 
                '<div class="card"><p style="color:var(--gris-texto);">No hay bendiciones compartidas aún</p></div>' :
                bendiciones.map(b => `
                    <div class="card"><p><strong>${b.nombre || 'Anónimo'}</strong></p><p>${escapeHtml(b.mensaje)}</p><small>${formatearFecha(b.fecha)}</small></div>
                `).join('')
            }
        </div>`;
}

function enviarBendicion(e) {
    if (e) e.preventDefault();
    
    const input = document.getElementById('bendicion-input');
    if (!input || !input.value.trim()) {
        showToast('Escribe tu bendición', 'warning');
        return;
    }
    
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
    c.innerHTML = `
        <div class="fade-in">
            <h2>📚 Recursos Cristianos</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA('biblioteca')"><div style="font-size:2.5rem;">📖</div><h3>Biblioteca Digital</h3></div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA('podcast')"><div style="font-size:2.5rem;">🎙️</div><h3>Podcast</h3></div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA('himnario')"><div style="font-size:2.5rem;">🎵</div><h3>Himnario</h3></div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA('concordancia')"><div style="font-size:2.5rem;">🔍</div><h3>Concordancia</h3></div>
            </div>
        </div>`;
}

function cargarOfrendas(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>💳 Ofrendas y Donaciones</h2>
            <div class="card" style="text-align:center;padding:30px;">
                <div style="font-size:3rem;">💝</div>
                <h3>Ofrenda para la Iglesia</h3>
                <p>"Cada uno dé como propuso en su corazón, no con tristeza ni por necesidad, porque Dios ama al dador alegre."</p>
                <p style="font-size:0.9rem;color:var(--gris-texto);">2 Corintios 9:7</p>
                <button class="btn-primary btn-lg" onclick="showToast('Sistema de pagos disponible pronto','info')" style="margin-top:16px;">💳 Donar Ahora</button>
            </div>
        </div>`;
}

function cargarInformes(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>📊 Informes PDF</h2>
            <div class="card">
                <h3>Generar Informes</h3>
                <div style="margin-top:12px;">
                    <div style="padding:8px;border-bottom:1px solid var(--gris-medio);display:flex;justify-content:space-between;align-items:center;">
                        <span>📋 Reporte de Asistencia</span>
                        <button class="btn-outline btn-sm" onclick="showToast('Generando PDF...','info')">📥 Descargar</button>
                    </div>
                    <div style="padding:8px;border-bottom:1px solid var(--gris-medio);display:flex;justify-content:space-between;align-items:center;">
                        <span>📊 Estadísticas de Miembros</span>
                        <button class="btn-outline btn-sm" onclick="showToast('Generando PDF...','info')">📥 Descargar</button>
                    </div>
                </div>
            </div>
        </div>`;
}

// Páginas administrativas
function cargarAdminDashboard(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p>⛔ Acceso restringido a administradores</p></div>';
        return;
    }
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>📊 Dashboard Administrativo</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px;">
                <div class="card" style="text-align:center;border-left:4px solid var(--azul-primario);"><strong style="font-size:1.8rem;">${APP_STATE.totalMiembros}</strong><p>Miembros</p></div>
                <div class="card" style="text-align:center;border-left:4px solid var(--exito);"><strong style="font-size:1.8rem;">${APP_STATE.usuariosActivos}</strong><p>En Línea</p></div>
                <div class="card" style="text-align:center;border-left:4px solid var(--advertencia);"><strong style="font-size:1.8rem;">${APP_STATE.reportsPendientes}</strong><p>Reportes Pendientes</p></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="card">
                    <h4>📋 Acciones Rápidas</h4>
                    <button class="btn-primary btn-sm btn-block" onclick="navegarA('gestion-usuarios')" style="margin:4px 0;">👥 Gestionar Usuarios</button>
                    <button class="btn-primary btn-sm btn-block" onclick="navegarA('gestion-reportes')" style="margin:4px 0;">📋 Gestionar Reportes</button>
                    <button class="btn-primary btn-sm btn-block" onclick="navegarA('gestion-eventos')" style="margin:4px 0;">📅 Gestionar Eventos</button>
                </div>
                <div class="card">
                    <h4>📊 Estadísticas</h4>
                    <p><strong>Versión:</strong> ${CONFIG.VERSION} ${CONFIG.VERSION_NAME}</p>
                    <p><strong>Reportes totales:</strong> ${APP_STATE.reportes.length}</p>
                    <p><strong>Logros desbloqueados:</strong> ${APP_STATE.logrosDesbloqueados.length}</p>
                </div>
            </div>
        </div>`;
}

function cargarGestionUsuarios(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p>⛔ Acceso restringido</p></div>';
        return;
    }
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>👥 Gestión de Usuarios</h2>
            <div class="card">
                <h3>Usuarios Registrados</h3>
                <div style="margin-top:12px;">
                    <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--gris-medio);">
                        <span><strong>Administrador</strong> - admin@ipuc.com</span><span class="badge estado-resuelto">Admin</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--gris-medio);">
                        <span><strong>Usuario1</strong> - usuario1@email.com</span><span class="badge">Usuario</span>
                    </div>
                </div>
            </div>
        </div>`;
}

function cargarGestionEventos(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p>⛔ Acceso restringido</p></div>';
        return;
    }
    
    const eventos = APP_STATE.eventos || [];
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>📅 Gestión de Eventos</h2>
            <button class="btn-primary btn-sm" onclick="abrirModalEvento()" style="margin-bottom:12px;">➕ Crear Evento</button>
            ${eventos.length === 0 ? 
                '<div class="card"><p>No hay eventos programados</p></div>' :
                eventos.map(e => `
                    <div class="card">
                        <h4>${escapeHtml(e.titulo)}</h4>
                        <p>${escapeHtml(e.desc || '')}</p>
                        <small>${e.fecha} ${e.hora || ''} - ${e.lugar || ''}</small>
                        <div style="margin-top:8px;">
                            <button class="btn-danger btn-sm" onclick="eliminarEvento('${e.id}')">🗑️ Eliminar</button>
                        </div>
                    </div>
                `).join('')
            }
        </div>`;
}

function abrirModalEvento() {
    const modal = document.getElementById('event-modal');
    if (modal) modal.classList.remove('hidden');
}

function eliminarEvento(id) {
    confirmarAccion('Eliminar Evento', '¿Estás seguro de eliminar este evento?', () => {
        APP_STATE.eventos = APP_STATE.eventos.filter(e => e.id !== id);
        showToast('Evento eliminado', 'info');
        navegarA('gestion-eventos');
    });
}

function cargarGestionNoticias(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p>⛔ Acceso restringido</p></div>';
        return;
    }
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>📝 Gestión de Noticias</h2>
            <div class="card">
                <form onsubmit="publicarNoticia(event)">
                    <div class="form-group"><label>Título</label><input type="text" id="noticia-titulo" class="form-input" placeholder="Título de la noticia" required></div>
                    <div class="form-group"><label>Contenido</label><textarea id="noticia-contenido" class="form-input" rows="4" placeholder="Contenido de la noticia..." required></textarea></div>
                    <button type="submit" class="btn-primary">📢 Publicar Noticia</button>
                </form>
            </div>
        </div>`;
}

function publicarNoticia(e) {
    if (e) e.preventDefault();
    
    const titulo = document.getElementById('noticia-titulo');
    const contenido = document.getElementById('noticia-contenido');
    
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
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>📊 Analíticas</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="card"><h4>📈 Visitas</h4><p style="font-size:2rem;">1,234</p><p>Este mes</p></div>
                <div class="card"><h4>👥 Usuarios Activos</h4><p style="font-size:2rem;">${APP_STATE.usuariosActivos}</p><p>Ahora</p></div>
                <div class="card"><h4>📋 Reportes</h4><p style="font-size:2rem;">${APP_STATE.reportes.length}</p><p>Totales</p></div>
                <div class="card"><h4>🏆 Logros</h4><p style="font-size:2rem;">${APP_STATE.logrosDesbloqueados.length}</p><p>Desbloqueados</p></div>
            </div>
        </div>`;
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
    const msgs = APP_STATE.chatMessages || [];
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>💬 Chat Global</h2>
            <div class="card" style="height:300px;overflow-y:auto;background:var(--gris-claro);border-radius:8px;padding:12px;margin-bottom:12px;" id="chat-messages">
                ${msgs.length === 0 ? 
                    '<p style="color:var(--gris-texto);text-align:center;">No hay mensajes</p>' :
                    msgs.map(m => `
                        <div style="padding:8px;margin-bottom:4px;border-radius:8px;background:var(--blanco);">
                            <strong>${escapeHtml(m.autor)}</strong>: ${escapeHtml(m.mensaje)}
                        </div>
                    `).join('')
                }
            </div>
            <div style="display:flex;gap:8px;">
                <input type="text" id="chat-input" class="form-input" placeholder="Escribe un mensaje..." onkeypress="if(event.key==='Enter')enviarMensajeChat()">
                <button class="btn-primary" onclick="enviarMensajeChat()">Enviar</button>
            </div>
        </div>`;
}

function enviarMensajeChat() {
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim()) return;
    if (!APP_STATE.usuario) { 
        showToast('Inicia sesión para chatear', 'warning'); 
        return; 
    }
    
    APP_STATE.chatMessages.push({
        autor: APP_STATE.usuario.nombre || 'Anónimo',
        mensaje: input.value.trim(),
        fecha: new Date().toISOString()
    });
    
    if (APP_STATE.chatMessages.length >= 10) desbloquearLogro('social_butterfly');
    
    input.value = '';
    navegarA('chat');
}

function cargarDirectorio(c) {
    c.innerHTML = '<div class="fade-in"><h2>📋 Directorio</h2><div class="card"><p>Miembros de la iglesia próximamente</p></div></div>';
}

function cargarDonaciones(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2>💝 Donaciones</h2>
            <div class="card" style="text-align:center;padding:30px;">
                <div style="font-size:3rem;">💝</div>
                <h3>Sistema de Donaciones</h3>
                <p>"Dios ama al dador alegre"</p>
                <button class="btn-primary btn-lg" onclick="realizarDonacion()" style="margin-top:12px;">💳 Donar</button>
            </div>
        </div>`;
}

function realizarDonacion() {
    showToast('💝 ¡Gracias por tu donación!', 'success');
    desbloquearLogro('generous');
}

function cargarDevocional(c) {
    const verses = CONFIG.VERSES;
    const v = verses[new Date().getDate() % verses.length];
    
    c.innerHTML = `
        <div class="fade-in">
            <h2>📖 Devocional Diario</h2>
            <div class="card" style="text-align:center;padding:30px;">
                <p style="font-style:italic;font-size:1.3rem;">"${v.verse}"</p>
                <p style="font-weight:700;margin-top:12px;">— ${v.ref} —</p>
                <button class="btn-primary btn-sm" onclick="compartirVersiculo()" style="margin-top:16px;">📤 Compartir Versículo</button>
            </div>
        </div>`;
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Cargar tema
    try {
        const t = localStorage.getItem('ipuc20_tema') || 'light';
        APP_STATE.tema = t;
        aplicarTema(t);
    } catch (e) {}
    
    // Cargar idioma
    try {
        APP_STATE.idioma = localStorage.getItem('ipuc20_idioma') || 'es';
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === APP_STATE.idioma);
        });
    } catch (e) {}
    
    // Cargar sesión
    const token = localStorage.getItem('ipuc20_token');
    const udata = localStorage.getItem('ipuc20_usuario');
    const rol = localStorage.getItem('ipuc20_rol');
    
    // Mostrar splash y luego cargar app
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            splash.style.transition = 'opacity 0.5s';
            setTimeout(() => {
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
    window.addEventListener('online', () => {
        APP_STATE.isOnline = true;
        showToast('🟢 Conexión restablecida', 'success');
    });
    window.addEventListener('offline', () => {
        APP_STATE.isOnline = false;
        showToast('🔴 Sin conexión a internet', 'error');
    });
});

// ============================================
// EVENTOS DEL DOM
// ============================================
function inicializarEventos() {
    // Sidebar
    document.getElementById('menu-toggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('close-sidebar')?.addEventListener('click', cerrarSidebar);
    document.getElementById('sidebar-overlay')?.addEventListener('click', cerrarSidebar);
    
    // Navegación
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) navegarA(page);
        });
    });
    
    // Botones header
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTema);
    document.getElementById('notifications-toggle')?.addEventListener('click', toggleNotificaciones);
    document.getElementById('reports-quick-toggle')?.addEventListener('click', togglePanelReportes);
    document.getElementById('search-toggle')?.addEventListener('click', toggleSearchBar);
    document.getElementById('qr-toggle')?.addEventListener('click', toggleQRPanel);
    document.getElementById('radio-toggle')?.addEventListener('click', toggleRadioPanel);
    
    // Search
    document.getElementById('search-close')?.addEventListener('click', () => {
        document.getElementById('search-bar')?.classList.add('hidden');
        APP_STATE.searchBarOpen = false;
    });
    
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            realizarBusqueda(this.value);
        }, 300));
    }
    
    // FAB
    document.getElementById('fab-main')?.addEventListener('click', toggleFabMenu);
    
    document.querySelectorAll('.fab-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            if (action === 'reporte') abrirModalReporte();
            else if (action === 'oracion') navegarA('oracion');
            else if (action === 'musica') navegarA('radio');
            else if (action === 'evento') {
                if (APP_STATE.rol === 'admin') abrirModalEvento();
                else navegarA('eventos');
            }
            else if (action === 'donacion') navegarA('ofrendas');
            else if (action === 'juego') navegarA('trivia');
            else if (action === 'asistente') toggleAsistente();
            
            toggleFabMenu();
        });
    });
    
    // Usuario
    document.getElementById('user-mini')?.addEventListener('click', toggleUserDropdown);
    document.getElementById('btn-logout')?.addEventListener('click', function(e) {
        e.preventDefault();
        confirmarAccion('Cerrar sesión?', '', cerrarSesion);
    });
    document.getElementById('btn-guest')?.addEventListener('click', continuarComoInvitado);
    
    // Auth forms
    document.getElementById('show-register')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form-container')?.classList.add('hidden');
        document.getElementById('register-form-container')?.classList.remove('hidden');
    });
    
    document.getElementById('show-login')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('register-form-container')?.classList.add('hidden');
        document.getElementById('login-form-container')?.classList.remove('hidden');
    });
    
    // Confirm modal
    document.getElementById('confirm-cancel')?.addEventListener('click', () => {
        document.getElementById('confirm-modal')?.classList.add('hidden');
        APP_STATE.pendingConfirmation = null;
    });
    
    document.getElementById('confirm-accept')?.addEventListener('click', () => {
        if (APP_STATE.pendingConfirmation) {
            APP_STATE.pendingConfirmation();
            APP_STATE.pendingConfirmation = null;
        }
        document.getElementById('confirm-modal')?.classList.add('hidden');
    });
    
    // Report modal
    document.getElementById('report-form')?.addEventListener('submit', generarReporte);
    document.getElementById('btn-cancel-report')?.addEventListener('click', cerrarModalReporte);
    
    document.querySelectorAll('input[name="report-type"]').forEach(radio => {
        radio.addEventListener('change', function() {
            cambiarTipoReporte(this.value);
        });
    });
    
    // Report actions
    document.querySelectorAll('.report-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-report');
            
            if (action === 'usuario' || action === 'contenido') {
                abrirModalReporte();
                const radio = document.querySelector(`input[value="${action}"]`);
                if (radio) radio.checked = true;
                cambiarTipoReporte(action);
            } else if (action === 'asistencia') navegarA('asistencia');
            else if (action === 'financiero') navegarA('donaciones');
            
            togglePanelReportes();
        });
    });
    
    // Close panels
    document.getElementById('close-reports-quick')?.addEventListener('click', () => {
        document.getElementById('reports-quick-panel')?.classList.add('hidden');
        APP_STATE.reportsPanelOpen = false;
    });
    
    document.getElementById('close-notifications')?.addEventListener('click', () => {
        document.getElementById('notification-panel')?.classList.add('hidden');
        APP_STATE.notificationsOpen = false;
    });
    
    document.getElementById('close-radio-quick')?.addEventListener('click', () => {
        document.getElementById('radio-quick-panel')?.classList.add('hidden');
        APP_STATE.radioPanelOpen = false;
    });
    
    document.getElementById('close-streaming')?.addEventListener('click', () => {
        document.getElementById('streaming-panel')?.classList.add('hidden');
        APP_STATE.streamingPanelOpen = false;
    });
    
    document.getElementById('close-qr')?.addEventListener('click', () => {
        document.getElementById('qr-panel')?.classList.add('hidden');
        APP_STATE.qrPanelOpen = false;
    });
    
    document.getElementById('close-assistant')?.addEventListener('click', () => {
        document.getElementById('assistant')?.classList.add('hidden');
        APP_STATE.assistantOpen = false;
    });
    
    // Radio controls
    document.getElementById('radio-play-toggle')?.addEventListener('click', toggleRadio);
    document.getElementById('radio-play-main')?.addEventListener('click', toggleRadio);
    document.getElementById('radio-prev')?.addEventListener('click', () => cambiarEstacionRadio(-1));
    document.getElementById('radio-next')?.addEventListener('click', () => cambiarEstacionRadio(1));
    
    // Assistant
    document.getElementById('assistant-send')?.addEventListener('click', enviarMensajeAsistente);
    document.getElementById('assistant-input')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') enviarMensajeAsistente();
    });
    
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = document.getElementById('assistant-input');
            if (input) {
                input.value = this.textContent;
                enviarMensajeAsistente();
            }
        });
    });
    
    // Modals backdrop
    document.getElementById('modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) cerrarModal();
    });
    
    document.getElementById('confirm-modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) {
            this.classList.add('hidden');
            APP_STATE.pendingConfirmation = null;
        }
    });
    
    document.getElementById('report-modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) cerrarModalReporte();
    });
    
    document.getElementById('event-modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) this.classList.add('hidden');
    });
    
    document.getElementById('game-modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) {
            this.classList.add('hidden');
            APP_STATE.gameInProgress = false;
        }
    });
    
    // Event form
    document.getElementById('event-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const titulo = document.getElementById('event-title');
        const fecha = document.getElementById('event-date');
        
        if (!titulo || !titulo.value.trim()) {
            showToast('Ingresa un título', 'warning');
            return;
        }
        if (!fecha || !fecha.value) {
            showToast('Selecciona una fecha', 'warning');
            return;
        }
        
        APP_STATE.eventos.push({
            id: generarId('evt'),
            titulo: titulo.value.trim(),
            desc: document.getElementById('event-desc')?.value.trim() || '',
            fecha: fecha.value,
            hora: document.getElementById('event-time')?.value || '',
            lugar: document.getElementById('event-location')?.value.trim() || '',
            tipo: document.getElementById('event-type')?.value || 'culto'
        });
        
        showToast('✅ Evento creado', 'success');
        document.getElementById('event-modal').classList.add('hidden');
        desbloquearLogro('event_creator');
        navegarA('eventos');
    });
    
    // Login form
    document.getElementById('login-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email');
        const pass = document.getElementById('login-password');
        
        if (email && pass && email.value && pass.value) {
            const resultado = login(email.value, pass.value);
            
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
                showToast(`👋 Bienvenido ${resultado.usuario.nombre}`, 'success');
            } else {
                showToast(resultado.error || 'Error al iniciar sesión', 'error');
            }
        }
    });
    
    // Register form
    document.getElementById('register-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('reg-nombre');
        const email = document.getElementById('reg-email');
        const pass = document.getElementById('reg-password');
        
        if (nombre && email && pass && nombre.value && email.value && pass.value) {
            const resultado = registro({
                nombre: nombre.value,
                correo: email.value,
                password: pass.value,
                usuario: email.value.split('@')[0],
                ministerio: 'General'
            });
            
            if (resultado.success) {
                showToast('✅ Registro exitoso. Inicia sesión', 'success');
                document.getElementById('register-form-container')?.classList.add('hidden');
                document.getElementById('login-form-container')?.classList.remove('hidden');
            } else {
                showToast(resultado.error || 'Error al registrar', 'error');
            }
        }
    });
    
    // Captcha refresh
    document.getElementById('captcha-refresh')?.addEventListener('click', function() {
        const captcha = document.getElementById('captcha-text');
        if (captcha) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            captcha.textContent = code;
        }
    });
    
    // Toggle password
    document.getElementById('toggle-password')?.addEventListener('click', function() {
        const passwordInput = document.getElementById('login-password');
        if (passwordInput) {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.querySelector('i').className = 'bx bx-hide';
            } else {
                passwordInput.type = 'password';
                this.querySelector('i').className = 'bx bx-show';
            }
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarPaneles();
            cerrarModal();
            cerrarModalReporte();
            document.getElementById('event-modal')?.classList.add('hidden');
            document.getElementById('game-modal')?.classList.add('hidden');
        }
        
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            toggleSearchBar();
        }
    });
    
    // Click outside
    document.addEventListener('click', function(e) {
        if (APP_STATE.userDropdownOpen && !e.target.closest('#user-mini') && !e.target.closest('#user-dropdown')) {
            document.getElementById('user-dropdown')?.classList.add('hidden');
            APP_STATE.userDropdownOpen = false;
        }
        
        if (APP_STATE.fabMenuOpen && !e.target.closest('#fab-main') && !e.target.closest('#fab-menu')) {
            document.getElementById('fab-menu')?.classList.add('hidden');
            APP_STATE.fabMenuOpen = false;
        }
        
        if (APP_STATE.assistantOpen && !e.target.closest('#assistant') && !e.target.closest('.fab-item[data-action="asistente"]')) {
            document.getElementById('assistant')?.classList.add('hidden');
            APP_STATE.assistantOpen = false;
        }
    });
    
    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            if (lang) cambiarIdioma(lang);
        });
    });
}

// ============================================
// EXPORTAR FUNCIONES A WINDOW
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
window.cambiarEstacionRadio = cambiarEstacionRadio;
window.iniciarTrivia = iniciarTrivia;
window.responderTrivia = responderTrivia;
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
window.realizarDonacion = realizarDonacion;
window.login = login;
window.registro = registro;
window.cerrarPaneles = cerrarPaneles;
window.enviarMensajeAsistente = enviarMensajeAsistente;

console.log('✅ IPUC LA FONDA v' + CONFIG.VERSION + ' ' + CONFIG.VERSION_NAME + ' - Script cargado exitosamente');
console.log('📌 ' + Object.keys(CONFIG.TITULOS_PAGINAS).length + ' páginas disponibles');
console.log('🏆 ' + CONFIG.ACHIEVEMENTS.length + ' logros configurados');
console.log('🧠 ' + CONFIG.TRIVIA_QUESTIONS.length + ' preguntas de trivia');
console.log('🎵 ' + CONFIG.PLAYLIST.length + ' canciones en playlist');
console.log('📻 ' + CONFIG.RADIO_STATIONS.length + ' estaciones de radio');

/* ============================================
   FINAL DEL SCRIPT v20.0 PRO ULTIMATE
   IPUC LA FONDA - International Pentecostal Church
   "Donde el Espíritu Santo se mueve"
   ============================================ */
