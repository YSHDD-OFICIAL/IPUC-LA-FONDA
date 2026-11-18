/* ============================================
   IPUC LA FONDA - SCRIPT.JS v22.1 PRO ULTIMATE
   Web App Profesional - Sistema Completo
   + Persistencia total, Respaldo y Recuperación
   "Donde el Espíritu Santo se mueve"
   ============================================ */

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
    VERSION: '22.1',
    VERSION_NAME: 'PRO ULTIMATE',
    CONTACTO: {
        whatsapp: ''
    },
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
        'gestion-noticias': 'Gestión de Noticias',
        'modo-oracion': 'Modo Oración',
        'notas-rapidas': 'Notas Rápidas',
        'ministerios': 'Ministerios',
        'lideres': 'Líderes',
        'voluntariado': 'Voluntariado',
        'eventos-sociales': 'Eventos Sociales',
        'memorizacion': 'Memorización',
        'estudios-biblicos': 'Estudios Bíblicos',
        'desafios': 'Desafíos',
        'insignias': 'Insignias',
        'archivo-streaming': 'Archivo Streaming',
        'wallpapers': 'Wallpapers',
        'descargas': 'Descargas',
        'documentos': 'Documentos',
        'suscripciones': 'Suscripciones',
        'carrito': 'Carrito',
        'exportar-datos': 'Exportar Datos',
        'historial': 'Historial',
        'auditoria': 'Auditoría',
        'backup': 'Copias de Seguridad',
        'permisos': 'Permisos',
        'favoritos': 'Favoritos',
        'tema': 'Temas'
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
        { id: 'first_prayer', name: 'Primera Oración', icon: 'bx bx-pray', desc: 'Envía tu primera petición de oración' },
        { id: 'bible_reader', name: 'Lector de la Biblia', icon: 'bx bx-book-reader', desc: 'Completa 10 lecturas bíblicas' },
        { id: 'testimony', name: 'Comparte Testimonio', icon: 'bx bx-message-dots', desc: 'Comparte en el muro de bendiciones' },
        { id: 'event_creator', name: 'Creador de Eventos', icon: 'bx bx-calendar-plus', desc: 'Crea tu primer evento' },
        { id: 'radio_listener', name: 'Radio Oyente', icon: 'bx bx-radio-circle-marked', desc: 'Escucha la radio por primera vez' },
        { id: 'trivia_master', name: 'Maestro de Trivia', icon: 'bx bx-brain', desc: 'Gana 50 puntos en trivia' },
        { id: 'social_butterfly', name: 'Mariposa Social', icon: 'bx bx-chat', desc: 'Envía 10 mensajes en el chat' },
        { id: 'generous', name: 'Corazón Generoso', icon: 'bx bx-donate-heart', desc: 'Realiza tu primera donación' }
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
    ],
    MINISTERIOS: [
        { nombre: 'Alabanza y Adoración', lider: 'Juan Díaz', integrantes: 24, reunion: 'Jueves 7:00 PM' },
        { nombre: 'Intercesión', lider: 'María López', integrantes: 18, reunion: 'Miércoles 6:00 AM' },
        { nombre: 'Jóvenes', lider: 'Carlos Ruiz', integrantes: 35, reunion: 'Sábado 5:00 PM' },
        { nombre: 'Niños', lider: 'Ana Torres', integrantes: 40, reunion: 'Domingo 9:00 AM' },
        { nombre: 'Damas', lider: 'Sofía Ramírez', integrantes: 30, reunion: 'Martes 3:00 PM' },
        { nombre: 'Caballeros', lider: 'David Martínez', integrantes: 22, reunion: 'Viernes 7:00 PM' }
    ],
    LIDERES: [
        { nombre: 'Pr. Carlos Martínez', rol: 'Pastor Principal', ministerio: 'Pastoral' },
        { nombre: 'Pra. Elena Martínez', rol: 'Pastora', ministerio: 'Pastoral' },
        { nombre: 'Juan Díaz', rol: 'Líder de Alabanza', ministerio: 'Alabanza' },
        { nombre: 'María López', rol: 'Coordinadora', ministerio: 'Intercesión' },
        { nombre: 'Carlos Ruiz', rol: 'Líder de Jóvenes', ministerio: 'Jóvenes' }
    ],
    EVENTOS_SOCIALES: [
        { titulo: 'Picnic Familiar', fecha: '2026-09-15', lugar: 'Parque Central', descripcion: 'Tarde de convivencia familiar' },
        { titulo: 'Noche de Talentos', fecha: '2026-09-28', lugar: 'Templo Principal', descripcion: 'Muestra de talentos de la congregación' },
        { titulo: 'Feria de Salud', fecha: '2026-10-10', lugar: 'Plaza Principal', descripcion: 'Jornada de salud gratuita' }
    ],
    ESTUDIOS_BIBLICOS: [
        { titulo: 'El Libro de Romanos', nivel: 'Avanzado', duracion: '12 semanas', descripcion: 'Estudio profundo de la carta a los Romanos' },
        { titulo: 'Fundamentos de la Fe', nivel: 'Básico', duracion: '8 semanas', descripcion: 'Principios básicos de la fe cristiana' },
        { titulo: 'Profecías Bíblicas', nivel: 'Intermedio', duracion: '10 semanas', descripcion: 'Estudio de las profecías' }
    ],
    DESAFIOS: [
        { titulo: 'Leer 5 capítulos esta semana', tipo: 'lectura', puntos: 50 },
        { titulo: 'Orar por 7 días seguidos', tipo: 'oracion', puntos: 70 },
        { titulo: 'Compartir 3 testimonios', tipo: 'testimonio', puntos: 60 },
        { titulo: 'Invitar a 2 amigos a la iglesia', tipo: 'evangelismo', puntos: 100 }
    ],
    WALLPAPERS: [
        { titulo: 'Versículo Juan 3:16', descripcion: 'Fondo con versículo bíblico' },
        { titulo: 'Paisaje de Adoración', descripcion: 'Fondo con temática de adoración' },
        { titulo: 'Cruz de Gloria', descripcion: 'Fondo con la cruz' }
    ],
    DOCUMENTOS: [
        { titulo: 'Manual de Miembros', tipo: 'PDF', tamano: '2.5 MB' },
        { titulo: 'Reglamento Interno', tipo: 'PDF', tamano: '1.8 MB' },
        { titulo: 'Guía de Ministerios', tipo: 'DOC', tamano: '3.2 MB' }
    ],
    SUSCRIPCIONES: [
        { plan: 'Básico', precio: '$0', caracteristicas: ['Acceso a devocionales', 'Radio en vivo', 'Chat básico'] },
        { plan: 'Premium', precio: '$5/mes', caracteristicas: ['Todo lo básico', 'Estudios avanzados', 'Sin anuncios', 'Descargas ilimitadas'] },
        { plan: 'Familia', precio: '$12/mes', caracteristicas: ['Todo lo premium', 'Hasta 5 miembros', 'Soporte prioritario'] }
    ],
    PRODUCTOS: [
        { id: 'p1', nombre: 'Biblia de Estudio IPUC', precio: 45000, icono: 'bx bx-book-heart', categoria: 'Libros' },
        { id: 'p2', nombre: 'Camiseta "Donde el Espíritu se mueve"', precio: 35000, icono: 'bx bxs-tshirt', categoria: 'Ropa' },
        { id: 'p3', nombre: 'Taza IPUC La Fonda', precio: 20000, icono: 'bx bx-coffee', categoria: 'Accesorios' },
        { id: 'p4', nombre: 'CD Alabanza y Adoración', precio: 15000, icono: 'bx bx-disc', categoria: 'Música' },
        { id: 'p5', nombre: 'Libreta de Oración', precio: 12000, icono: 'bx bx-notepad', categoria: 'Papelería' },
        { id: 'p6', nombre: 'Gorra Bordada IPUC', precio: 28000, icono: 'bx bx-like', categoria: 'Ropa' }
    ],
    VIDEOS: [
        { id: 'v1', titulo: 'Culto Dominical en Vivo', categoria: 'Cultos', url: '', miniatura: 'assets/streaming/live-placeholder.jpg' },
        { id: 'v2', titulo: 'Serie: Fundamentos de la Fe', categoria: 'Enseñanza', url: '', miniatura: 'assets/wallpapers/wallpaper-1.jpg' },
        { id: 'v3', titulo: 'Alabanza y Adoración', categoria: 'Música', url: '', miniatura: 'assets/wallpapers/wallpaper-2.jpg' },
        { id: 'v4', titulo: 'Testimonios de Fe', categoria: 'Testimonios', url: '', miniatura: 'assets/streaming/live-placeholder.jpg' }
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
    isAdmin: false,
    notasRapidas: [],
    favoritos: [],
    historialAcciones: [],
    modoOracion: false,
    modoConcentracion: false,
    carrito: [],
    suscripcionActual: null
};

// ============================================
// UTILIDADES GENERALES
// ============================================
function showToast(mensaje, tipo = 'info', duracion = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;

    const iconos = {
        success: '<i class="bx bx-check-circle"></i>',
        error: '<i class="bx bx-x-circle"></i>',
        warning: '<i class="bx bx-error"></i>',
        info: '<i class="bx bx-info-circle"></i>'
    };
    toast.innerHTML = `${iconos[tipo] || iconos.info} ${mensaje || ''}`;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('toast-hide');
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 300);
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

function registrarHistorial(accion, modulo) {
    APP_STATE.historialAcciones.unshift({
        id: generarId('hist'),
        accion,
        modulo,
        fecha: new Date().toISOString(),
        usuario: APP_STATE.usuario ? APP_STATE.usuario.nombre : 'Invitado'
    });
    if (APP_STATE.historialAcciones.length > 100) {
        APP_STATE.historialAcciones.length = 100;
    }
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
    const idiomas = { es: 'ES', en: 'EN', pt: 'PT', fr: 'FR', de: 'DE', it: 'IT' };
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

    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-page') === page);
    });

    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = CONFIG.TITULOS_PAGINAS[page] || page;

    const bc = document.getElementById('breadcrumb-current');
    if (bc) bc.textContent = CONFIG.TITULOS_PAGINAS[page] || page;

    cargarPagina(page);

    if (window.innerWidth < 1024) cerrarSidebar();

    cerrarPaneles();

    registrarHistorial('Navegó a ' + page, page);

    APP_STATE.isLoading = false;
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
            'gestion-noticias': cargarGestionNoticias,
            'modo-oracion': cargarModoOracion,
            'notas-rapidas': cargarNotasRapidas,
            'ministerios': cargarMinisterios,
            'lideres': cargarLideres,
            'voluntariado': cargarVoluntariado,
            'eventos-sociales': cargarEventosSociales,
            'memorizacion': cargarMemorizacion,
            'estudios-biblicos': cargarEstudiosBiblicos,
            'testimonios': cargarTestimonios,
            'tienda': cargarTienda,
            'videos': cargarVideos,
            'desafios': cargarDesafios,
            'insignias': cargarInsignias,
            'archivo-streaming': cargarArchivoStreaming,
            'wallpapers': cargarWallpapers,
            'descargas': cargarDescargas,
            'documentos': cargarDocumentos,
            'suscripciones': cargarSuscripciones,
            'carrito': cargarCarrito,
            'exportar-datos': cargarExportarDatos,
            'historial': cargarHistorial,
            'auditoria': cargarAuditoria,
            'backup': cargarBackup,
            'permisos': cargarPermisos,
            'favoritos': cargarFavoritos,
            'tema': cargarTema
        };

        const fn = paginas[page];
        if (fn) {
            fn(container);
        } else {
            container.innerHTML = `<div class="card fade-in"><h2>${CONFIG.TITULOS_PAGINAS[page] || page}</h2><p style="text-align:center;padding:40px;">Contenido disponible</p></div>`;
        }
    }, 150);
}

// ============================================
// FUNCIONES DE PÁGINAS
// ============================================

function cargarInicio(c) {
    const isAdmin = APP_STATE.rol === 'admin';

    c.innerHTML = `
        <div class="fade-in">
            <div class="card" style="text-align:center;border-left:4px solid var(--dorado);">
                <h3><i class="bx bx-church"></i> Próximo Culto Dominical</h3>
                <div style="display:flex;justify-content:center;gap:16px;margin:16px 0;flex-wrap:wrap;">
                    <div style="text-align:center;"><span style="font-size:1.5rem;font-weight:700;" id="contador-dias">00</span><br><small>Días</small></div>
                    <div style="text-align:center;"><span style="font-size:1.5rem;font-weight:700;" id="contador-horas">00</span><br><small>Horas</small></div>
                    <div style="text-align:center;"><span style="font-size:1.5rem;font-weight:700;" id="contador-minutos">00</span><br><small>Minutos</small></div>
                    <div style="text-align:center;"><span style="font-size:1.5rem;font-weight:700;" id="contador-segundos">00</span><br><small>Segundos</small></div>
                </div>
                <span class="badge estado-proximo"><i class="bx bx-bell"></i> PRÓXIMO CULTO</span>
            </div>

            <div class="card" style="text-align:center;border-left:4px solid var(--dorado);">
                <h3><i class="bx bx-star"></i> IPUC LA FONDA v${CONFIG.VERSION} ${CONFIG.VERSION_NAME}</h3>
                <p>"Donde el Espíritu Santo se mueve"</p>
                <div style="margin-top:8px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">
                    ${isAdmin ? '<span class="badge estado-resuelto"><i class="bx bx-crown"></i> Admin</span>' : ''}
                    <span class="badge"><i class="bx bx-level-up"></i> Lv.${APP_STATE.nivel}</span>
                    <span class="badge"><i class="bx bx-trophy"></i> ${APP_STATE.logrosDesbloqueados.length} logros</span>
                </div>
            </div>

            <div class="card">
                <h3><i class="bx bx-zap"></i> Accesos Rápidos</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:8px;">
                    <button class="btn-outline btn-sm" onclick="navegarA('asistencia')"><i class="bx bx-check-shield"></i> Asistencia</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('publicaciones')"><i class="bx bx-pencil"></i> Publicar</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('eventos')"><i class="bx bx-calendar-event"></i> Eventos</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('oracion')"><i class="bx bx-pray"></i> Oración</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('devocional')"><i class="bx bx-book-reader"></i> Devocional</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('radio')"><i class="bx bx-radio-circle-marked"></i> Radio</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('trivia')"><i class="bx bx-brain"></i> Trivia</button>
                    ${isAdmin ? '<button class="btn-outline btn-sm" onclick="navegarA(\'admin-dashboard\')"><i class="bx bx-line-chart"></i> Admin</button>' : ''}
                </div>
            </div>

            <div class="card">
                <h3><i class="bx bx-stats"></i> Estadísticas</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;text-align:center;">
                    <div><strong style="font-size:1.5rem;">${APP_STATE.usuariosActivos}</strong><p style="font-size:0.75rem;"><i class="bx bx-wifi"></i> En Línea</p></div>
                    <div><strong style="font-size:1.5rem;">${APP_STATE.totalMiembros}</strong><p style="font-size:0.75rem;"><i class="bx bx-group"></i> Miembros</p></div>
                    <div><strong style="font-size:1.5rem;">${APP_STATE.totalOraciones}</strong><p style="font-size:0.75rem;"><i class="bx bx-pray"></i> Oraciones</p></div>
                    <div><strong style="font-size:1.5rem;">${APP_STATE.reportsPendientes}</strong><p style="font-size:0.75rem;"><i class="bx bx-file"></i> Reportes</p></div>
                </div>
            </div>
        </div>`;

    iniciarContador();
}

function cargarHorarios(c) {
    const horarios = [
        { dia: 'Domingo', cultos: ['Culto Dominical - 10:00 AM', 'Escuela Dominical - 9:00 AM'] },
        { dia: 'Martes', cultos: ['Culto de Oración - 6:00 PM'] },
        { dia: 'Miércoles', cultos: ['Reunión de Damas - 3:00 PM'] },
        { dia: 'Jueves', cultos: ['Ensayo de Alabanza - 7:00 PM'] },
        { dia: 'Viernes', cultos: ['Culto de Jóvenes - 6:00 PM', 'Reunión de Caballeros - 7:00 PM'] },
        { dia: 'Sábado', cultos: ['Escuela Bíblica - 4:00 PM', 'Reunión de Intercesión - 6:00 AM'] }
    ];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-time-five"></i> Horarios de Cultos</h2>
            ${horarios.map(h => `
                <div class="card">
                    <h3><i class="bx bx-calendar"></i> ${h.dia}</h3>
                    ${h.cultos.map(culto => `<p><i class="bx bx-clock"></i> ${culto}</p>`).join('')}
                </div>
            `).join('')}
        </div>`;
}

function cargarAsistencia(c) {
    const asistencias = [
        { fecha: '2026-08-16', evento: 'Culto Dominical', estado: 'Asistió' },
        { fecha: '2026-08-09', evento: 'Culto Dominical', estado: 'Asistió' },
        { fecha: '2026-08-02', evento: 'Culto Dominical', estado: 'Asistió' }
    ];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-check-shield"></i> Confirmar Asistencia</h2>
            <div class="card" style="text-align:center;padding:30px;">
                <h3><i class="bx bx-church"></i> Próximo Culto</h3>
                <p style="font-size:1.2rem;">Domingo 10:00 AM</p>
                <button class="btn-primary btn-sm" onclick="confirmarAsistencia()" style="margin-top:12px;">
                    <i class="bx bx-check"></i> Confirmar Asistencia
                </button>
            </div>
            <div class="card">
                <h3><i class="bx bx-history"></i> Mi Historial de Asistencia</h3>
                ${asistencias.map(a => `
                    <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--gris-medio);">
                        <span><strong>${a.evento}</strong> - ${a.fecha}</span>
                        <span class="badge estado-resuelto"><i class="bx bx-check"></i> ${a.estado}</span>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function confirmarAsistencia() {
    showToast('Asistencia confirmada para el próximo culto', 'success');
    registrarHistorial('Confirmó asistencia', 'Asistencia');
    agregarXP(10);
}

function cargarNoticias(c) {
    const noticias = window.db ? window.db.getNoticias() : [];
    const mostrar = noticias.length > 0 ? noticias : [
        { titulo: 'Anuncio Importante', contenido: 'Nuevo horario de cultos a partir del próximo mes', fecha_publicacion: new Date().toISOString() },
        { titulo: 'Celebración de Aniversario', contenido: 'Celebraremos el aniversario de la iglesia el próximo domingo', fecha_publicacion: new Date(Date.now() - 86400000).toISOString() }
    ];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-news"></i> Noticias</h2>
            ${mostrar.map(n => `
                <div class="card">
                    <h3><i class="bx bx-megaphone"></i> ${escapeHtml(n.titulo)}</h3>
                    <p>${escapeHtml(n.contenido)}</p>
                    <small><i class="bx bx-time"></i> ${formatearFecha(n.fecha_publicacion || n.fecha)}</small>
                </div>
            `).join('')}
        </div>`;
}

function cargarEventos(c) {
    const eventos = APP_STATE.eventos || [];
    const proximos = eventos
        .filter(e => new Date(e.fecha) >= new Date())
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-calendar-event"></i> Eventos</h2>
            ${APP_STATE.rol === 'admin' ? '<button class="btn-primary btn-sm" onclick="abrirModalEvento()" style="margin-bottom:12px;"><i class="bx bx-plus"></i> Crear Evento</button>' : ''}
            ${proximos.length === 0 ?
                '<div class="card"><p><i class="bx bx-info-circle"></i> No hay eventos próximos</p></div>' :
                proximos.map(e => `
                    <div class="card">
                        <h3><i class="bx bx-calendar-star"></i> ${escapeHtml(e.titulo)}</h3>
                        <p>${escapeHtml(e.descripcion || '')}</p>
                        <small><i class="bx bx-calendar"></i> ${formatearFecha(e.fecha)}${e.hora ? ` <i class="bx bx-time"></i> ${e.hora}` : ''}${e.lugar ? ` <i class="bx bx-map"></i> ${e.lugar}` : ''}</small>
                    </div>
                `).join('')
            }
        </div>`;
}

function cargarPublicaciones(c) {
    const pub = APP_STATE.publicaciones || [];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-pencil"></i> Publicaciones</h2>
            ${APP_STATE.usuario ? `
                <div class="card">
                    <textarea class="form-input" id="pub-contenido" rows="3" placeholder="¿Qué quieres compartir?"></textarea>
                    <button class="btn-primary btn-sm" onclick="crearPubLocal()" style="margin-top:8px;"><i class="bx bx-send"></i> Publicar</button>
                </div>` : ''}
            ${pub.length === 0 ?
                '<div class="card"><p><i class="bx bx-info-circle"></i> No hay publicaciones</p></div>' :
                pub.map(p => `
                    <div class="card">
                        <p><strong><i class="bx bx-user"></i> ${escapeHtml(p.autor || 'Anónimo')}</strong></p>
                        <p>${escapeHtml(p.contenido || '')}</p>
                        <small><i class="bx bx-time"></i> ${formatearFecha(p.fecha)}</small>
                    </div>
                `).join('')
            }
        </div>`;
}

// ═══ v22.1: Persistir en DB ═══
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

    const r = Storage.persistirPublicacion({
        usuario_id: APP_STATE.usuario.id || 0,
        autor: APP_STATE.usuario.nombre || 'Anónimo',
        contenido: txt.value.trim()
    });

    if (r.success) {
        txt.value = '';
        showToast('Publicación creada', 'success');
        registrarHistorial('Creó publicación', 'Publicaciones');
        navegarA('publicaciones');
    } else {
        showToast('Error al publicar: ' + (r.error || 'desconocido'), 'error');
    }
}

function cargarPerfil(c) {
    if (!APP_STATE.usuario) {
        c.innerHTML = '<div class="fade-in"><h2><i class="bx bx-user"></i> Perfil</h2><div class="card"><p><i class="bx bx-info-circle"></i> Inicia sesión para ver tu perfil</p></div></div>';
        return;
    }

    const u = APP_STATE.usuario;

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-user-circle"></i> Mi Perfil</h2>
            <div class="card" style="text-align:center;">
                <img src="${u.foto || 'assets/avatars/default.png'}" style="width:80px;height:80px;border-radius:50%;margin-bottom:12px;object-fit:cover;">
                <h3>${u.nombre || ''} ${u.apellidos || ''}</h3>
                <p>@${u.usuario || ''}</p>
                <p><i class="bx bx-envelope"></i> ${u.correo || ''}</p>
                <p><i class="bx bx-building-house"></i> ${u.ministerio || 'General'}</p>
                <div style="margin-top:8px;display:flex;gap:8px;justify-content:center;">
                    <span class="badge"><i class="bx bx-level-up"></i> Lv.${APP_STATE.nivel}</span>
                    <span class="badge"><i class="bx bx-trophy"></i> ${APP_STATE.logrosDesbloqueados.length} logros</span>
                    <span class="badge"><i class="bx bx-star"></i> ${APP_STATE.xp} XP</span>
                </div>
            </div>
            <button class="btn-danger btn-sm" onclick="confirmarAccion('Cerrar sesión?','',cerrarSesion)"><i class="bx bx-log-out"></i> Cerrar Sesión</button>
        </div>`;
}

function cargarConfiguracion(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-cog"></i> Configuración</h2>
            <div class="card">
                <h3><i class="bx bx-palette"></i> Apariencia</h3>
                <button class="btn-secondary btn-sm" onclick="toggleTema()">
                    <i class="bx bx-${APP_STATE.tema === 'dark' ? 'sun' : 'moon'}"></i>
                    ${APP_STATE.tema === 'dark' ? 'Cambiar a Claro' : 'Cambiar a Oscuro'}
                </button>
            </div>
            <div class="card">
                <h3><i class="bx bx-globe"></i> Idioma</h3>
                <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px;">
                    ${['es', 'en', 'pt', 'fr', 'de', 'it'].map(lang => `
                        <button class="lang-btn ${APP_STATE.idioma === lang ? 'active' : ''}" onclick="cambiarIdioma('${lang}')">${lang.toUpperCase()}</button>
                    `).join('')}
                </div>
            </div>
            <div class="card">
                <h3><i class="bx bx-phone"></i> Aplicación</h3>
                <p><strong>Versión:</strong> ${CONFIG.VERSION} ${CONFIG.VERSION_NAME}</p>
                <p><strong>Modo:</strong> ${APP_STATE.isOnline ? '<i class="bx bx-wifi"></i> Online' : '<i class="bx bx-wifi-off"></i> Offline'}</p>
                <p><strong>Usuario:</strong> ${APP_STATE.usuario ? APP_STATE.usuario.nombre : 'Invitado'}</p>
            </div>
            ${APP_STATE.usuario ? '<button class="btn-danger btn-sm" onclick="confirmarAccion(\'Cerrar sesión?\',\'\',cerrarSesion)"><i class="bx bx-log-out"></i> Cerrar Sesión</button>' : ''}
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
                <h2><i class="bx bx-file"></i> Gestión de Reportes</h2>
                <button class="btn-primary btn-sm" onclick="abrirModalReporte()"><i class="bx bx-plus"></i> Nuevo Reporte</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">
                <div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">${reportes.length}</p><p style="font-size:0.75rem;">Total</p></div>
                <div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">${pendientes}</p><p style="font-size:0.75rem;">Pendientes</p></div>
                <div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">${resueltos}</p><p style="font-size:0.75rem;">Resueltos</p></div>
                <div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">${desestimados}</p><p style="font-size:0.75rem;">Desestimados</p></div>
            </div>
            ${reportes.length === 0 ?
                '<div class="card" style="text-align:center;padding:40px;"><p><i class="bx bx-info-circle"></i> No hay reportes registrados</p></div>' :
                reportes.map(r => `
                    <div class="card" style="margin-bottom:8px;border-left:4px solid ${r.urgencia === 'critica' ? 'var(--error)' : r.urgencia === 'alta' ? 'var(--advertencia)' : 'var(--info)'};">
                        <div style="display:flex;justify-content:space-between;align-items:start;">
                            <div style="flex:1;">
                                <span class="badge estado-${r.estado || 'pendiente'}" style="margin-right:6px;">${r.estado || 'pendiente'}</span>
                                <span class="badge tipo-${r.tipo || 'general'}">${r.tipo || 'general'}</span>
                                <p style="font-size:0.9rem;margin:4px 0;">${escapeHtml((r.descripcion || '').substring(0, 100))}...</p>
                                <small>Reportado por: ${r.reportado_por ? r.reportado_por.nombre : 'Anónimo'} - ${formatearFecha(r.fecha)}</small>
                            </div>
                        </div>
                    </div>
                `).join('')
            }
        </div>`;
}

function cargarMisReportes(c) {
    if (!APP_STATE.usuario) {
        c.innerHTML = '<div class="fade-in"><h2><i class="bx bx-file"></i> Mis Reportes</h2><div class="card"><p><i class="bx bx-info-circle"></i> Inicia sesión para ver tus reportes</p></div></div>';
        return;
    }

    const mis = APP_STATE.reportes.filter(r => r.reportado_por && r.reportado_por.id === APP_STATE.usuario.id);

    c.innerHTML = `
        <div class="fade-in">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h2><i class="bx bx-file"></i> Mis Reportes</h2>
                <button class="btn-primary btn-sm" onclick="abrirModalReporte()"><i class="bx bx-plus"></i> Nuevo Reporte</button>
            </div>
            ${mis.length === 0 ?
                '<div class="card" style="text-align:center;padding:40px;"><p><i class="bx bx-info-circle"></i> No has generado ningún reporte</p></div>' :
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

function cargarDashboard(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-line-chart"></i> Dashboard</h2>
            <div class="card">
                <h3><i class="bx bx-user"></i> Bienvenido ${APP_STATE.usuario ? APP_STATE.usuario.nombre : 'Invitado'}</h3>
                <p>Panel de control de IPUC LA FONDA</p>
                <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;">
                    <div style="text-align:center;padding:12px;background:var(--gris-claro);border-radius:8px;">
                        <strong style="font-size:1.5rem;">${APP_STATE.nivel}</strong>
                        <p>Nivel</p>
                    </div>
                    <div style="text-align:center;padding:12px;background:var(--gris-claro);border-radius:8px;">
                        <strong style="font-size:1.5rem;">${APP_STATE.xp}</strong>
                        <p>XP Total</p>
                    </div>
                    <div style="text-align:center;padding:12px;background:var(--gris-claro);border-radius:8px;">
                        <strong style="font-size:1.5rem;">${APP_STATE.logrosDesbloqueados.length}</strong>
                        <p>Logros</p>
                    </div>
                </div>
            </div>
        </div>`;
}

function cargarSistema(c) {
    const estado = window.db ? window.db.getEstadoSistema() : {};
    const integridad = window.db ? window.db.verificarIntegridad() : {};

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-server"></i> Sistema</h2>
            <div class="card">
                <p><strong><i class="bx bx-info-circle"></i> Versión:</strong> ${CONFIG.VERSION} ${CONFIG.VERSION_NAME}</p>
                <p><strong><i class="bx bx-wifi"></i> Modo:</strong> ${APP_STATE.isOnline ? 'Online' : 'Offline'}</p>
                <p><strong><i class="bx bx-palette"></i> Tema:</strong> ${APP_STATE.tema}</p>
                <p><strong><i class="bx bx-globe"></i> Idioma:</strong> ${APP_STATE.idioma.toUpperCase()}</p>
                <p><strong><i class="bx bx-user"></i> Usuario:</strong> ${APP_STATE.usuario ? APP_STATE.usuario.nombre : 'Invitado'}</p>
                <p><strong><i class="bx bx-level-up"></i> Nivel:</strong> ${APP_STATE.nivel}</p>
                <p><strong><i class="bx bx-star"></i> XP:</strong> ${APP_STATE.xp} / ${APP_STATE.xpSiguiente}</p>
            </div>
            ${estado.espacioFormateado ? `
            <div class="card">
                <h3><i class="bx bx-data"></i> Estado de la Base de Datos</h3>
                <p><strong>Colecciones:</strong> ${estado.totalColecciones}</p>
                <p><strong>Espacio usado:</strong> ${estado.espacioFormateado}</p>
                <p><strong>Papelera:</strong> ${estado.papeleraCount} elementos</p>
                <p><strong>Código maestro:</strong> ${estado.codigoMaestroGenerado ? '✅ Generado' : '❌ No generado'}</p>
                <p><strong>Integridad:</strong> ${integridad.valido ? '✅ OK' : '⚠️ Revisar'}</p>
            </div>` : ''}
        </div>`;
}

function cargarPeticiones(c) {
    const peticiones = APP_STATE.peticiones || [];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-pray"></i> Peticiones de Oración</h2>
            <div class="card">
                <div class="form-group">
                    <label>Motivo de Oración</label>
                    <textarea class="form-input" id="pet-motivo" rows="2" placeholder="Motivo de oración..."></textarea>
                </div>
                <button class="btn-primary btn-sm" onclick="crearPeticionLocal()"><i class="bx bx-send"></i> Enviar Petición</button>
            </div>
            ${peticiones.length === 0 ?
                '<div class="card"><p><i class="bx bx-info-circle"></i> No hay peticiones</p></div>' :
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

// ═══ v22.1: Persistir en DB ═══
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

    const r = Storage.persistirPeticion({
        usuario_id: APP_STATE.usuario.id || 0,
        nombre: APP_STATE.usuario.nombre || 'Anónimo',
        motivo: m.value.trim()
    });

    if (r.success) {
        m.value = '';
        showToast('Petición enviada', 'success');
        desbloquearLogro('first_prayer');
        navegarA('peticiones');
    } else {
        showToast('Error al enviar: ' + (r.error || 'desconocido'), 'error');
    }
}

function cargarBiblioteca(c) {
    const recursos = [
        { titulo: 'La Biblia', tipo: 'Libro Sagrado', descripcion: 'Sagradas Escrituras' },
        { titulo: 'Comentario Bíblico', tipo: 'Referencia', descripcion: 'Comentarios y explicaciones' },
        { titulo: 'Diccionario Bíblico', tipo: 'Referencia', descripcion: 'Definiciones bíblicas' }
    ];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-book-open"></i> Biblioteca Digital</h2>
            ${recursos.map(r => `
                <div class="card">
                    <h3><i class="bx bx-book"></i> ${r.titulo}</h3>
                    <p><span class="badge badge-info">${r.tipo}</span></p>
                    <p>${r.descripcion}</p>
                    <button class="btn-outline btn-sm" onclick="showToast('Leyendo: ${r.titulo}','info')"><i class="bx bx-book-reader"></i> Leer</button>
                </div>
            `).join('')}
        </div>`;
}

function cargarPodcast(c) {
    const episodios = [
        { titulo: 'Episodio 1: La Fe', duracion: '25:30', descripcion: 'Reflexión sobre la fe' },
        { titulo: 'Episodio 2: La Esperanza', duracion: '30:15', descripcion: 'Reflexión sobre la esperanza' },
        { titulo: 'Episodio 3: El Amor', duracion: '28:45', descripcion: 'Reflexión sobre el amor' }
    ];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-microphone"></i> Podcast</h2>
            ${episodios.map(e => `
                <div class="card">
                    <h3>${e.titulo}</h3>
                    <p>${e.descripcion}</p>
                    <small><i class="bx bx-time"></i> ${e.duracion}</small>
                    <br>
                    <button class="btn-primary btn-sm" onclick="showToast('Reproduciendo podcast','info')"><i class="bx bx-play"></i> Reproducir</button>
                </div>
            `).join('')}
        </div>`;
}

function cargarGaleria(c) {
    const albumes = [
        { titulo: 'Cultos Dominicales', cantidad: 120, descripcion: 'Fotos de cultos' },
        { titulo: 'Bautismos', cantidad: 45, descripcion: 'Ceremonias de bautismo' },
        { titulo: 'Eventos Especiales', cantidad: 80, descripcion: 'Convenciones y retiros' }
    ];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-images"></i> Galería</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                ${albumes.map(a => `
                    <div class="card" style="text-align:center;cursor:pointer;" onclick="showToast('Abriendo: ${a.titulo}','info')">
                        <div style="font-size:3rem;"><i class="bx bx-photo-album"></i></div>
                        <h3>${a.titulo}</h3>
                        <p>${a.descripcion}</p>
                        <span class="badge badge-info">${a.cantidad} fotos</span>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function cargarChat(c) {
    const msgs = APP_STATE.chatMessages || [];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-chat"></i> Chat Global</h2>
            <div class="card" style="height:300px;overflow-y:auto;background:var(--gris-claro);border-radius:8px;padding:12px;margin-bottom:12px;" id="chat-messages">
                ${msgs.length === 0 ?
                    '<p style="color:var(--gris-texto);text-align:center;"><i class="bx bx-chat"></i> No hay mensajes</p>' :
                    msgs.map(m => `
                        <div style="padding:8px;margin-bottom:4px;border-radius:8px;background:var(--blanco);">
                            <strong><i class="bx bx-user"></i> ${escapeHtml(m.usuario || m.autor)}</strong>: ${escapeHtml(m.mensaje)}
                        </div>
                    `).join('')
                }
            </div>
            <div style="display:flex;gap:8px;">
                <input type="text" id="chat-input" class="form-input" placeholder="Escribe un mensaje..." onkeypress="if(event.key==='Enter')enviarMensajeChat()">
                <button class="btn-primary" onclick="enviarMensajeChat()"><i class="bx bx-send"></i> Enviar</button>
            </div>
        </div>`;
}

// ═══ v22.1: Persistir en DB ═══
function enviarMensajeChat() {
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim()) return;
    if (!APP_STATE.usuario) {
        showToast('Inicia sesión para chatear', 'warning');
        return;
    }

    const r = Storage.persistirMensajeChat({
        usuario_id: APP_STATE.usuario.id || 0,
        autor: APP_STATE.usuario.nombre || 'Anónimo',
        mensaje: input.value.trim()
    });

    if (r.success) {
        if (APP_STATE.chatMessages.length >= 10) desbloquearLogro('social_butterfly');
        input.value = '';
        navegarA('chat');
    } else {
        showToast('Error al enviar mensaje', 'error');
    }
}

function cargarDirectorio(c) {
    const miembros = window.db ? window.db.getDirectorio() : [
        { nombre: 'Juan Díaz', ministerio: 'Alabanza', cargo: 'Líder' },
        { nombre: 'María López', ministerio: 'Intercesión', cargo: 'Coordinadora' },
        { nombre: 'Carlos Ruiz', ministerio: 'Jóvenes', cargo: 'Líder' },
        { nombre: 'Ana Torres', ministerio: 'Niños', cargo: 'Maestra' },
        { nombre: 'Sofía Ramírez', ministerio: 'Damas', cargo: 'Líder' }
    ];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-list-ul"></i> Directorio</h2>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>Nombre</th><th>Ministerio</th><th>Cargo</th></tr></thead>
                    <tbody>
                        ${miembros.map(m => `
                            <tr>
                                <td><i class="bx bx-user"></i> ${m.nombre}</td>
                                <td>${m.ministerio}</td>
                                <td><span class="badge badge-info">${m.cargo}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
}

function cargarDonaciones(c) {
    const donaciones = window.db ? window.db.getDonaciones() : [];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-donate-heart"></i> Donaciones</h2>
            <div class="card" style="text-align:center;padding:30px;">
                <div style="font-size:3rem;"><i class="bx bx-heart"></i></div>
                <h3>Sistema de Donaciones</h3>
                <p>"Dios ama al dador alegre"</p>
                <button class="btn-primary btn-lg" onclick="realizarDonacion()" style="margin-top:12px;"><i class="bx bx-money"></i> Donar</button>
            </div>
            ${donaciones.length > 0 ? `
            <div class="card">
                <h3><i class="bx bx-history"></i> Últimas donaciones</h3>
                ${donaciones.slice(0, 10).map(d => `
                    <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--gris-medio);">
                        <span>${d.usuario_nombre || 'Anónimo'} - ${d.concepto}</span>
                        <span>$${d.monto} (${formatearFecha(d.fecha)})</span>
                    </div>
                `).join('')}
            </div>` : ''}
        </div>`;
}

function cargarDevocional(c) {
    const verses = CONFIG.VERSES;
    const v = verses[new Date().getDate() % verses.length];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-book-reader"></i> Devocional Diario</h2>
            <div class="card" style="text-align:center;padding:30px;">
                <p style="font-style:italic;font-size:1.3rem;">"${v.verse}"</p>
                <p style="font-weight:700;margin-top:12px;">— ${v.ref} —</p>
                <button class="btn-primary btn-sm" onclick="compartirVersiculo()" style="margin-top:16px;"><i class="bx bx-share-alt"></i> Compartir Versículo</button>
            </div>
        </div>`;
}

function cargarRadio(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-radio-circle-marked"></i> Radio en Vivo</h2>
            <div class="card" style="text-align:center;">
                <button class="btn-radio btn-radio-main" onclick="toggleRadio()" style="width:64px;height:64px;font-size:2.5rem;border-radius:50%;background:var(--azul-primario);color:var(--blanco);">
                    <i class="bx ${APP_STATE.radioPlaying ? 'bx-pause-circle' : 'bx-play-circle'}"></i>
                </button>
                <h3 style="margin-top:12px;">Radio IPUC LA FONDA</h3>
                <p>Alabanzas de Adoración</p>
                <button class="btn-primary btn-sm" onclick="toggleRadioPanel()" style="margin-top:12px;"><i class="bx bx-radio"></i> Abrir Reproductor</button>
            </div>
        </div>`;
}

function cargarStreaming(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-video-recording"></i> Transmisión en Vivo</h2>
            <div class="card" style="text-align:center;">
                <div style="background:var(--gris-oscuro);border-radius:12px;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;color:var(--blanco);">
                    <div>
                        <i class="bx bx-video-recording" style="font-size:4rem;opacity:0.3;"></i>
                        <p>Transmisión en vivo disponible</p>
                    </div>
                </div>
                <button class="btn-primary btn-sm" onclick="toggleStreamingPanel()" style="margin-top:12px;"><i class="bx bx-play"></i> Ver Transmisión</button>
            </div>
        </div>`;
}

function cargarMapa(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-map"></i> Ubicación</h2>
            <div class="card" style="height:400px;display:flex;align-items:center;justify-content:center;background:var(--gris-claro);border-radius:12px;">
                <div style="text-align:center;">
                    <i class="bx bx-map" style="font-size:3rem;color:var(--gris-texto);"></i>
                    <p><strong>IPUC LA FONDA</strong></p>
                    <p>Dirección: Cali, Valle del Cauca, Colombia</p>
                    <p><i class="bx bx-phone"></i> +57 312 881 3818</p>
                    <button class="btn-primary btn-sm" onclick="showToast('Abriendo mapa...','info')"><i class="bx bx-navigation"></i> Ver en Google Maps</button>
                </div>
            </div>
        </div>`;
}

function cargarOracion(c) {
    const oraciones = APP_STATE.oraciones || [];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-pray"></i> Cadena de Oración</h2>
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
                '<div class="card"><p style="text-align:center;color:var(--gris-texto);"><i class="bx bx-info-circle"></i> No hay peticiones de oración aún</p></div>' :
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

// ═══ v22.1: Persistir en DB ═══
function enviarOracionLocal(e) {
    if (e) e.preventDefault();

    const nombre = document.getElementById('prayer-name-local');
    const motivo = document.getElementById('prayer-request-local');

    if (!motivo || !motivo.value.trim()) {
        showToast('Escribe tu petición', 'warning');
        return;
    }

    const r = Storage.persistirOracion({
        usuario_id: APP_STATE.usuario?.id || 0,
        nombre: nombre ? nombre.value.trim() || 'Anónimo' : 'Anónimo',
        motivo: motivo.value.trim()
    });

    if (r.success) {
        if (nombre) nombre.value = '';
        if (motivo) motivo.value = '';
        showToast('Oración enviada', 'success');
        desbloquearLogro('first_prayer');
        navegarA('oracion');
    } else {
        showToast('Error al enviar oración', 'error');
    }
}

function cargarGrupos(c) {
    const grupos = [
        { nombre: 'Jóvenes', lider: 'Carlos Ruiz', horario: 'Sábado 5:00 PM', integrantes: 35 },
        { nombre: 'Damas', lider: 'Sofía Ramírez', horario: 'Martes 3:00 PM', integrantes: 30 },
        { nombre: 'Caballeros', lider: 'David Martínez', horario: 'Viernes 7:00 PM', integrantes: 22 },
        { nombre: 'Intercesión', lider: 'María López', horario: 'Miércoles 6:00 AM', integrantes: 18 }
    ];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-group"></i> Grupos y Células</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;">
                ${grupos.map(g => `
                    <div class="card">
                        <h3><i class="bx bx-group"></i> ${g.nombre}</h3>
                        <p><strong>Líder:</strong> ${g.lider}</p>
                        <p><strong>Horario:</strong> ${g.horario}</p>
                        <p><strong>Integrantes:</strong> ${g.integrantes}</p>
                        <button class="btn-outline btn-sm" onclick="showToast('Uniéndote a ${g.nombre}...','info')"><i class="bx bx-user-plus"></i> Unirse</button>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function cargarLecturaBiblica(c) {
    const progreso = Math.round((APP_STATE.lecturasCompletadas / APP_STATE.lecturasTotal) * 100);
    const libros = [
        { nombre: 'Génesis', capitulos: 50, leidos: 0 },
        { nombre: 'Éxodo', capitulos: 40, leidos: 0 },
        { nombre: 'Salmos', capitulos: 150, leidos: 0 },
        { nombre: 'Mateo', capitulos: 28, leidos: 0 },
        { nombre: 'Juan', capitulos: 21, leidos: 0 }
    ];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-book"></i> Plan de Lectura</h2>
            <div class="card">
                <h3>Biblia en un año</h3>
                <div style="margin:12px 0;">
                    <strong>Progreso: ${APP_STATE.lecturasCompletadas}/${APP_STATE.lecturasTotal}</strong>
                    <div style="height:8px;background:var(--gris-medio);border-radius:4px;margin-top:4px;overflow:hidden;">
                        <div style="height:100%;width:${progreso}%;background:linear-gradient(90deg,var(--azul-primario),var(--dorado));border-radius:4px;transition:width 0.5s;"></div>
                    </div>
                </div>
                <button class="btn-primary btn-sm" onclick="marcarLecturaCompletada()" style="margin-top:8px;"><i class="bx bx-check"></i> Marcar como leído</button>
            </div>
            <div class="card">
                <h3>Libros de la Biblia</h3>
                ${libros.map(l => `
                    <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--gris-medio);">
                        <span><i class="bx bx-book"></i> ${l.nombre}</span>
                        <span>${l.leidos}/${l.capitulos} capítulos</span>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function marcarLecturaCompletada() {
    APP_STATE.lecturasCompletadas++;
    showToast('Lectura marcada como completada', 'success');
    if (APP_STATE.lecturasCompletadas >= 10) desbloquearLogro('bible_reader');

    if (APP_STATE.usuario && APP_STATE.usuario.id && window.db) {
        window.db.marcarLecturaCompletada(APP_STATE.usuario.id);
    }
    navegarA('lectura-biblica');
}

function cargarConcordancia(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-search-alt"></i> Concordancia Bíblica</h2>
            <div class="card">
                <div class="form-group">
                    <label>Buscar palabra en la Biblia</label>
                    <div style="display:flex;gap:8px;">
                        <input type="text" id="concordancia-input" class="form-input" placeholder="Ej: amor, fe, esperanza..." onkeypress="if(event.key==='Enter')buscarConcordancia()">
                        <button class="btn-primary" onclick="buscarConcordancia()"><i class="bx bx-search"></i> Buscar</button>
                    </div>
                </div>
                <div id="concordancia-resultados"><p style="color:var(--gris-texto);"><i class="bx bx-info-circle"></i> Ingresa una palabra para buscar</p></div>
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
        container.innerHTML = `<p style="color:var(--gris-texto);"><i class="bx bx-info-circle"></i> No se encontraron versículos con "${query}"</p>`;
        return;
    }

    container.innerHTML = resultados.map(v => `
        <div style="padding:8px;border-bottom:1px solid var(--gris-medio);">
            <i class="bx bx-book-reader"></i> "${v.verse}" - ${v.ref}
        </div>
    `).join('');
}

function cargarHimnario(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-music"></i> Himnario</h2>
            <div class="card">
                <h3>Canciones de alabanza</h3>
                <div style="margin-top:12px;">
                    ${CONFIG.PLAYLIST.map((s, i) => `
                        <div style="padding:8px;border-bottom:1px solid var(--gris-medio);display:flex;justify-content:space-between;align-items:center;">
                            <span><i class="bx bx-music"></i> <strong>${s.title}</strong> - ${s.artist}</span>
                            <button class="btn-outline btn-sm" onclick="reproducirCancion(${i})"><i class="bx bx-play"></i> Escuchar</button>
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
            <h2><i class="bx bx-notepad"></i> Diario Espiritual</h2>
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
                    <button type="submit" class="btn-primary btn-block"><i class="bx bx-save"></i> Guardar Reflexión</button>
                </form>
            </div>
            ${entries.length === 0 ?
                '<div class="card"><p style="color:var(--gris-texto);"><i class="bx bx-info-circle"></i> No hay entradas en tu diario</p></div>' :
                entries.map(e => `
                    <div class="card"><strong>${formatearFecha(e.fecha)}</strong><p>${escapeHtml(e.contenido)}</p></div>
                `).join('')
            }
        </div>`;
}

// ═══ v22.1: Persistir en DB ═══
function guardarEntradaDiario(e) {
    if (e) e.preventDefault();

    const fecha = document.getElementById('diario-fecha');
    const contenido = document.getElementById('diario-contenido');

    if (!contenido || !contenido.value.trim()) {
        showToast('Escribe tu reflexión', 'warning');
        return;
    }

    const r = Storage.persistirEntradaDiario({
        usuario_id: APP_STATE.usuario?.id || 0,
        fecha: fecha ? fecha.value : new Date().toISOString().split('T')[0],
        contenido: contenido.value.trim()
    });

    if (r.success) {
        if (contenido) contenido.value = '';
        showToast('Reflexión guardada', 'success');
        navegarA('diario-espiritual');
    } else {
        showToast('Error al guardar', 'error');
    }
}

function cargarLogros(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-trophy"></i> Logros Desbloqueados</h2>
            <div class="card">
                <p>Has desbloqueado <strong>${APP_STATE.logrosDesbloqueados.length}</strong> de ${CONFIG.ACHIEVEMENTS.length} logros</p>
                <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;">
                    ${CONFIG.ACHIEVEMENTS.map(a => {
                        const unlocked = APP_STATE.logrosDesbloqueados.includes(a.id);
                        return `
                            <div style="text-align:center;padding:12px;border:2px solid ${unlocked ? 'var(--oro)' : 'var(--gris-medio)'};border-radius:8px;background:${unlocked ? 'var(--dorado-claro)' : 'transparent'};opacity:${unlocked ? '1' : '0.6'};">
                                <div style="font-size:2rem;"><i class="bx ${a.icon}"></i></div>
                                <strong style="font-size:0.85rem;">${a.name}</strong>
                                ${unlocked ? '<span style="color:var(--exito);font-size:0.7rem;display:block;"><i class="bx bx-check-circle"></i> Desbloqueado</span>' : '<span style="color:var(--gris-texto);font-size:0.7rem;display:block;"><i class="bx bx-lock-alt"></i> Bloqueado</span>'}
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
            <h2><i class="bx bx-brain"></i> Trivia Bíblica</h2>
            <div class="card" style="text-align:center;padding:30px;">
                <p style="font-size:1.2rem;">Pon a prueba tu conocimiento bíblico</p>
                <button class="btn-primary btn-lg" onclick="iniciarTrivia()" style="margin-top:16px;"><i class="bx bx-game"></i> Jugar Ahora</button>
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
            <h2><i class="bx bx-game"></i> Juegos Bíblicos</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                <div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA('trivia')">
                    <div style="font-size:3rem;"><i class="bx bx-brain"></i></div>
                    <h3>Trivia Bíblica</h3>
                    <p>Preguntas y respuestas</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="iniciarTrivia()">
                    <div style="font-size:3rem;"><i class="bx bx-question-mark"></i></div>
                    <h3>Quiz Rápido</h3>
                    <p>Preguntas rápidas</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="showToast('Memorización disponible en la sección Espiritual','info')">
                    <div style="font-size:3rem;"><i class="bx bx-book"></i></div>
                    <h3>Memorizar</h3>
                    <p>Aprende versículos</p>
                </div>
            </div>
        </div>`;
}

function cargarRanking(c) {
    const ranking = window.db ? window.db.getRanking() : [];
    const lista = ranking.length > 0 ? ranking : [
        { nombre: 'Usuario1', puntos: 1500 },
        { nombre: 'Usuario2', puntos: 1200 },
        { nombre: 'Usuario3', puntos: 1000 }
    ];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-medal"></i> Ranking</h2>
            <div class="card">
                <h3>Top 5 - Gamificación</h3>
                <div style="margin-top:12px;">
                    ${lista.slice(0, 5).map((r, i) => `
                        <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--gris-medio);">
                            <span><i class="bx bx-medal"></i> ${i + 1}. ${r.nombre}</span>
                            <span><i class="bx bx-star"></i> ${r.puntos} pts</span>
                        </div>
                    `).join('')}
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
            <h2><i class="bx bx-playlist"></i> Playlist de Adoración</h2>
            <div class="card">
                <h3>Lista de reproducción</h3>
                ${CONFIG.PLAYLIST.map((s, i) => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--gris-medio);">
                        <div><strong>${s.title}</strong><br><span style="font-size:0.85rem;color:var(--gris-texto);">${s.artist}</span></div>
                        <div><span style="font-size:0.85rem;color:var(--gris-texto);">${s.duration}</span>
                        <button class="btn-outline btn-sm" onclick="reproducirCancion(${i})"><i class="bx bx-play"></i></button></div>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function cargarBlog(c) {
    const posts = window.db ? window.db.getNoticias() : [];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-news"></i> Blog/Noticias</h2>
            ${posts.length === 0 ?
                '<div class="card"><p style="text-align:center;color:var(--gris-texto);"><i class="bx bx-info-circle"></i> No hay publicaciones</p></div>' :
                posts.map(p => `
                    <div class="card">
                        <h3><i class="bx bx-article"></i> ${escapeHtml(p.titulo)}</h3>
                        <p>${escapeHtml(p.contenido)}</p>
                        <small><i class="bx bx-time"></i> ${formatearFecha(p.fecha_publicacion || p.fecha)}</small>
                    </div>
                `).join('')
            }
        </div>`;
}

function cargarMuroBendiciones(c) {
    const bendiciones = APP_STATE.bendiciones || [];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-star"></i> Muro de Bendiciones</h2>
            <div class="card">
                <form onsubmit="enviarBendicion(event)">
                    <div class="form-group">
                        <textarea id="bendicion-input" class="form-input" rows="2" placeholder="Comparte tu testimonio o bendición..." required></textarea>
                    </div>
                    <button type="submit" class="btn-primary btn-sm"><i class="bx bx-send"></i> Compartir Bendición</button>
                </form>
            </div>
            ${bendiciones.length === 0 ?
                '<div class="card"><p style="color:var(--gris-texto);"><i class="bx bx-info-circle"></i> No hay bendiciones compartidas aún</p></div>' :
                bendiciones.map(b => `
                    <div class="card"><p><strong>${b.nombre || 'Anónimo'}</strong></p><p>${escapeHtml(b.mensaje)}</p><small>${formatearFecha(b.fecha)}</small></div>
                `).join('')
            }
        </div>`;
}

// ═══ v22.1: Persistir en DB ═══
function enviarBendicion(e) {
    if (e) e.preventDefault();

    const input = document.getElementById('bendicion-input');
    if (!input || !input.value.trim()) {
        showToast('Escribe tu bendición', 'warning');
        return;
    }

    const r = Storage.persistirBendicion({
        usuario_id: APP_STATE.usuario?.id || 0,
        nombre: APP_STATE.usuario ? APP_STATE.usuario.nombre : 'Anónimo',
        mensaje: input.value.trim()
    });

    if (r.success) {
        input.value = '';
        showToast('Bendición compartida', 'success');
        desbloquearLogro('testimony');
        navegarA('muro-bendiciones');
    } else {
        showToast('Error al compartir', 'error');
    }
}

function cargarRecursos(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-book-open"></i> Recursos Cristianos</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                <div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA('biblioteca')">
                    <div style="font-size:2.5rem;"><i class="bx bx-book-open"></i></div>
                    <h3>Biblioteca Digital</h3>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA('podcast')">
                    <div style="font-size:2.5rem;"><i class="bx bx-microphone"></i></div>
                    <h3>Podcast</h3>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA('himnario')">
                    <div style="font-size:2.5rem;"><i class="bx bx-music"></i></div>
                    <h3>Himnario</h3>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="navegarA('concordancia')">
                    <div style="font-size:2.5rem;"><i class="bx bx-search-alt"></i></div>
                    <h3>Concordancia</h3>
                </div>
            </div>
        </div>`;
}

function cargarOfrendas(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-money"></i> Ofrendas y Donaciones</h2>
            <div class="card" style="text-align:center;padding:30px;">
                <div style="font-size:3rem;"><i class="bx bx-donate-heart"></i></div>
                <h3>Ofrenda para la Iglesia</h3>
                <p>"Cada uno dé como propuso en su corazón, no con tristeza ni por necesidad, porque Dios ama al dador alegre."</p>
                <p style="font-size:0.9rem;color:var(--gris-texto);">2 Corintios 9:7</p>
                <button class="btn-primary btn-lg" onclick="realizarDonacion()" style="margin-top:16px;"><i class="bx bx-money"></i> Donar Ahora</button>
            </div>
        </div>`;
}

function cargarInformes(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-file-pdf"></i> Informes PDF</h2>
            <div class="card">
                <h3>Generar Informes</h3>
                <div style="margin-top:12px;">
                    <div style="padding:8px;border-bottom:1px solid var(--gris-medio);display:flex;justify-content:space-between;align-items:center;">
                        <span><i class="bx bx-file"></i> Reporte de Asistencia</span>
                        <button class="btn-outline btn-sm" onclick="showToast('Generando PDF...','info')"><i class="bx bx-download"></i> Descargar</button>
                    </div>
                    <div style="padding:8px;border-bottom:1px solid var(--gris-medio);display:flex;justify-content:space-between;align-items:center;">
                        <span><i class="bx bx-stats"></i> Estadísticas de Miembros</span>
                        <button class="btn-outline btn-sm" onclick="showToast('Generando PDF...','info')"><i class="bx bx-download"></i> Descargar</button>
                    </div>
                    <div style="padding:8px;display:flex;justify-content:space-between;align-items:center;">
                        <span><i class="bx bx-money"></i> Reporte Financiero</span>
                        <button class="btn-outline btn-sm" onclick="showToast('Generando PDF...','info')"><i class="bx bx-download"></i> Descargar</button>
                    </div>
                </div>
            </div>
        </div>`;
}

function cargarAdminDashboard(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p><i class="bx bx-shield"></i> Acceso restringido a administradores</p></div>';
        return;
    }

    const estado = window.db ? window.db.getEstadoSistema() : {};

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-line-chart"></i> Dashboard Administrativo</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px;">
                <div class="card" style="text-align:center;border-left:4px solid var(--azul-primario);"><strong style="font-size:1.8rem;">${APP_STATE.totalMiembros}</strong><p>Miembros</p></div>
                <div class="card" style="text-align:center;border-left:4px solid var(--exito);"><strong style="font-size:1.8rem;">${APP_STATE.usuariosActivos}</strong><p>En Línea</p></div>
                <div class="card" style="text-align:center;border-left:4px solid var(--advertencia);"><strong style="font-size:1.8rem;">${APP_STATE.reportsPendientes}</strong><p>Reportes Pendientes</p></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="card">
                    <h4><i class="bx bx-list-check"></i> Acciones Rápidas</h4>
                    <button class="btn-primary btn-sm btn-block" onclick="navegarA('gestion-usuarios')" style="margin:4px 0;"><i class="bx bx-user-voice"></i> Gestionar Usuarios</button>
                    <button class="btn-primary btn-sm btn-block" onclick="navegarA('gestion-reportes')" style="margin:4px 0;"><i class="bx bx-file"></i> Gestionar Reportes</button>
                    <button class="btn-primary btn-sm btn-block" onclick="navegarA('gestion-eventos')" style="margin:4px 0;"><i class="bx bx-calendar-edit"></i> Gestionar Eventos</button>
                    <button class="btn-primary btn-sm btn-block" onclick="navegarA('auditoria')" style="margin:4px 0;"><i class="bx bx-clipboard"></i> Ver Auditoría</button>
                    <button class="btn-primary btn-sm btn-block" onclick="navegarA('backup')" style="margin:4px 0;"><i class="bx bx-cloud-download"></i> Copias de Seguridad</button>
                </div>
                <div class="card">
                    <h4><i class="bx bx-stats"></i> Estado de la DB</h4>
                    <p><strong>Versión:</strong> ${CONFIG.VERSION} ${CONFIG.VERSION_NAME}</p>
                    <p><strong>Colecciones:</strong> ${estado.totalColecciones || 0}</p>
                    <p><strong>Espacio usado:</strong> ${estado.espacioFormateado || '0 B'}</p>
                    <p><strong>Papelera:</strong> ${estado.papeleraCount || 0}</p>
                    <p><strong>Código maestro:</strong> ${estado.codigoMaestroGenerado ? '✅' : '❌'}</p>
                </div>
            </div>
        </div>`;
}

function cargarAnaliticas(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p><i class="bx bx-shield"></i> Acceso restringido</p></div>';
        return;
    }

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-stats"></i> Analíticas</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                <div class="card"><h4><i class="bx bx-trending-up"></i> Visitas</h4><p style="font-size:2rem;">1,234</p><p>Este mes</p></div>
                <div class="card"><h4><i class="bx bx-user"></i> Usuarios Activos</h4><p style="font-size:2rem;">${APP_STATE.usuariosActivos}</p><p>Ahora</p></div>
                <div class="card"><h4><i class="bx bx-file"></i> Reportes</h4><p style="font-size:2rem;">${APP_STATE.reportes.length}</p><p>Totales</p></div>
                <div class="card"><h4><i class="bx bx-trophy"></i> Logros</h4><p style="font-size:2rem;">${APP_STATE.logrosDesbloqueados.length}</p><p>Desbloqueados</p></div>
            </div>
        </div>`;
}

function cargarGestionUsuarios(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p><i class="bx bx-shield"></i> Acceso restringido</p></div>';
        return;
    }

    // ═══ v22.1: Leer usuarios reales desde DB ═══
    const usuarios = window.db
        ? [...(window.db.cargar('administradores').administradores || []),
           ...(window.db.cargar('usuarios').usuarios || [])]
        : [];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-user-voice"></i> Gestión de Usuarios</h2>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th></tr></thead>
                    <tbody>
                        ${usuarios.length === 0 ?
                            '<tr><td colspan="4" style="text-align:center;padding:20px;">No hay usuarios registrados</td></tr>' :
                            usuarios.map(u => `
                                <tr>
                                    <td><i class="bx bx-user"></i> ${escapeHtml(u.nombre)} ${escapeHtml(u.apellidos || '')}</td>
                                    <td>${escapeHtml(u.correo)}</td>
                                    <td><span class="badge badge-${u.rol === 'admin' ? 'danger' : 'info'}">${u.rol}</span></td>
                                    <td><span class="badge estado-${u.estado === 'activo' ? 'resuelto' : 'desestimado'}">${u.estado}</span></td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>`;
}

function cargarGestionEventos(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p><i class="bx bx-shield"></i> Acceso restringido</p></div>';
        return;
    }

    const eventos = APP_STATE.eventos || [];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-calendar-edit"></i> Gestión de Eventos</h2>
            <button class="btn-primary btn-sm" onclick="abrirModalEvento()" style="margin-bottom:12px;"><i class="bx bx-plus"></i> Crear Evento</button>
            ${eventos.length === 0 ?
                '<div class="card"><p><i class="bx bx-info-circle"></i> No hay eventos programados</p></div>' :
                eventos.map(e => `
                    <div class="card">
                        <h4><i class="bx bx-calendar-event"></i> ${escapeHtml(e.titulo)}</h4>
                        <p>${escapeHtml(e.descripcion || '')}</p>
                        <small>${e.fecha} ${e.hora || ''} - ${e.lugar || ''}</small>
                        <div style="margin-top:8px;">
                            <button class="btn-danger btn-sm" onclick="eliminarEvento('${e.id}')"><i class="bx bx-trash"></i> Eliminar</button>
                        </div>
                    </div>
                `).join('')
            }
        </div>`;
}

function eliminarEvento(id) {
    confirmarAccion('¿Eliminar evento?', 'Se moverá a la papelera por 30 días', () => {
        const r = Storage.eliminarConRespaldo('eventos', id, APP_STATE.usuario?.nombre || 'Admin');
        if (r.success) {
            APP_STATE.eventos = window.db.getEventos();
            showToast('Evento eliminado (recuperable en papelera)', 'success');
            navegarA('gestion-eventos');
        } else {
            showToast('Error: ' + r.error, 'error');
        }
    });
}

function cargarGestionNoticias(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p><i class="bx bx-shield"></i> Acceso restringido</p></div>';
        return;
    }

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-edit-alt"></i> Gestión de Noticias</h2>
            <div class="card">
                <form onsubmit="publicarNoticia(event)">
                    <div class="form-group"><label>Título</label><input type="text" id="noticia-titulo" class="form-input" placeholder="Título de la noticia" required></div>
                    <div class="form-group"><label>Contenido</label><textarea id="noticia-contenido" class="form-input" rows="4" placeholder="Contenido de la noticia..." required></textarea></div>
                    <button type="submit" class="btn-primary"><i class="bx bx-megaphone"></i> Publicar Noticia</button>
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
    if (window.db) {
        const r = window.db.addNoticia({
            titulo: titulo.value.trim(),
            contenido: contenido.value.trim(),
            autor: APP_STATE.usuario?.nombre || 'Admin'
        });
        if (r.success) {
            showToast('Noticia publicada', 'success');
            titulo.value = '';
            contenido.value = '';
            navegarA('gestion-noticias');
        }
    }
}

function cargarModoOracion(c) {
    APP_STATE.modoOracion = true;
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-moon"></i> Modo Oración</h2>
            <div class="card" style="text-align:center;padding:40px;">
                <div style="font-size:4rem;"><i class="bx bx-pray"></i></div>
                <h3>Momento de Oración</h3>
                <p>Dedica este tiempo para orar y meditar</p>
                <div style="margin-top:20px;">
                    <button class="btn-primary btn-lg" onclick="showToast('Iniciando sesión de oración...','info')"><i class="bx bx-play"></i> Iniciar Oración</button>
                </div>
                <div style="margin-top:12px;">
                    <button class="btn-outline btn-sm" onclick="APP_STATE.modoOracion = false; navegarA('inicio')"><i class="bx bx-exit"></i> Salir del Modo Oración</button>
                </div>
            </div>
        </div>`;
}

function cargarNotasRapidas(c) {
    const notas = APP_STATE.notasRapidas || [];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-pencil"></i> Notas Rápidas</h2>
            <div class="card">
                <div class="form-group">
                    <textarea id="nota-rapida-input" class="form-input" rows="3" placeholder="Escribe una nota rápida..."></textarea>
                </div>
                <button class="btn-primary btn-sm" onclick="agregarNotaRapida()"><i class="bx bx-plus"></i> Agregar Nota</button>
            </div>
            ${notas.length === 0 ?
                '<div class="card"><p><i class="bx bx-info-circle"></i> No hay notas</p></div>' :
                notas.map(n => `
                    <div class="card">
                        <p>${escapeHtml(n.contenido)}</p>
                        <small>${formatearFecha(n.fecha)}</small>
                        <button class="btn-danger btn-sm" onclick="eliminarNotaRapida('${n.id}')"><i class="bx bx-trash"></i></button>
                    </div>
                `).join('')
            }
        </div>`;
}

function agregarNotaRapida() {
    const input = document.getElementById('nota-rapida-input');
    if (!input || !input.value.trim()) {
        showToast('Escribe una nota', 'warning');
        return;
    }
    APP_STATE.notasRapidas.unshift({
        id: generarId('nota'),
        contenido: input.value.trim(),
        fecha: new Date().toISOString()
    });
    input.value = '';
    showToast('Nota guardada', 'success');
    navegarA('notas-rapidas');
}

function eliminarNotaRapida(id) {
    APP_STATE.notasRapidas = APP_STATE.notasRapidas.filter(n => n.id !== id);
    showToast('Nota eliminada', 'info');
    navegarA('notas-rapidas');
}

function cargarMinisterios(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-building-house"></i> Ministerios</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;">
                ${CONFIG.MINISTERIOS.map(m => `
                    <div class="card">
                        <h3><i class="bx bx-building-house"></i> ${m.nombre}</h3>
                        <p><strong><i class="bx bx-user-pin"></i> Líder:</strong> ${m.lider}</p>
                        <p><strong><i class="bx bx-group"></i> Integrantes:</strong> ${m.integrantes}</p>
                        <p><strong><i class="bx bx-time"></i> Reunión:</strong> ${m.reunion}</p>
                        <button class="btn-outline btn-sm" onclick="showToast('Solicitando unirse a ${m.nombre}...','info')"><i class="bx bx-user-plus"></i> Unirse</button>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function cargarLideres(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-user-pin"></i> Líderes</h2>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>Nombre</th><th>Rol</th><th>Ministerio</th></tr></thead>
                    <tbody>
                        ${CONFIG.LIDERES.map(l => `
                            <tr>
                                <td><i class="bx bx-user"></i> ${l.nombre}</td>
                                <td>${l.rol}</td>
                                <td><span class="badge badge-info">${l.ministerio}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
}

function cargarVoluntariado(c) {
    const areas = [
        { nombre: 'Alabanza', descripcion: 'Únete al equipo de música', vacantes: 3 },
        { nombre: 'Niños', descripcion: 'Ayuda en la escuela dominical', vacantes: 5 },
        { nombre: 'Bienvenida', descripcion: 'Recibe a los visitantes', vacantes: 4 },
        { nombre: 'Medios', descripcion: 'Ayuda con sonido y video', vacantes: 2 }
    ];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-hand"></i> Voluntariado</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;">
                ${areas.map(a => `
                    <div class="card">
                        <h3><i class="bx bx-hand"></i> ${a.nombre}</h3>
                        <p>${a.descripcion}</p>
                        <p><span class="badge badge-warning">${a.vacantes} vacantes</span></p>
                        <button class="btn-primary btn-sm" onclick="showToast('Postulando a ${a.nombre}...','success')"><i class="bx bx-check"></i> Postularme</button>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function cargarEventosSociales(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-party"></i> Eventos Sociales</h2>
            ${CONFIG.EVENTOS_SOCIALES.map(e => `
                <div class="card">
                    <h3><i class="bx bx-party"></i> ${e.titulo}</h3>
                    <p>${e.descripcion}</p>
                    <small><i class="bx bx-calendar"></i> ${formatearFecha(e.fecha)} | <i class="bx bx-map"></i> ${e.lugar}</small>
                    <br>
                    <button class="btn-outline btn-sm" onclick="showToast('Inscrito a ${e.titulo}','success')"><i class="bx bx-check"></i> Asistir</button>
                </div>
            `).join('')}
        </div>`;
}

function cargarMemorizacion(c) {
    const versiculosMemorizar = CONFIG.VERSES.slice(0, 4);

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-brain"></i> Memorización</h2>
            <div class="card">
                <h3>Versículos para memorizar</h3>
                ${versiculosMemorizar.map((v, i) => `
                    <div style="padding:12px;border-bottom:1px solid var(--gris-medio);">
                        <p><strong>${i + 1}. "${v.verse}"</strong></p>
                        <p>— ${v.ref}</p>
                        <button class="btn-outline btn-sm" onclick="showToast('¡Memorizado! +10 XP','success'); agregarXP(10);"><i class="bx bx-check"></i> Marcar como memorizado</button>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function cargarEstudiosBiblicos(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-book-content"></i> Estudios Bíblicos</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;">
                ${CONFIG.ESTUDIOS_BIBLICOS.map(e => `
                    <div class="card">
                        <h3><i class="bx bx-book-content"></i> ${e.titulo}</h3>
                        <p><span class="badge badge-info">Nivel: ${e.nivel}</span></p>
                        <p><strong>Duración:</strong> ${e.duracion}</p>
                        <p>${e.descripcion}</p>
                        <button class="btn-primary btn-sm" onclick="showToast('Inscrito a: ${e.titulo}','success')"><i class="bx bx-check"></i> Inscribirme</button>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function cargarTestimonios(c) {
    const testimonios = window.db ? window.db.getTestimonios() : [];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-message-dots"></i> Testimonios</h2>
            ${testimonios.length === 0 ?
                '<div class="card"><p style="text-align:center;color:var(--gris-texto);"><i class="bx bx-info-circle"></i> No hay testimonios compartidos</p></div>' :
                testimonios.map(t => `
                    <div class="card">
                        <h3><i class="bx bx-quote-left"></i> ${escapeHtml(t.titulo)}</h3>
                        <p>${escapeHtml(t.contenido)}</p>
                        <small>— ${escapeHtml(t.autor)} | ${formatearFecha(t.fecha)}</small>
                    </div>
                `).join('')
            }
        </div>`;
}

function cargarDesafios(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-target-lock"></i> Desafíos</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;">
                ${CONFIG.DESAFIOS.map(d => `
                    <div class="card">
                        <h3><i class="bx bx-target-lock"></i> ${d.titulo}</h3>
                        <p><span class="badge badge-info">${d.tipo}</span></p>
                        <p><strong>Recompensa:</strong> ${d.puntos} puntos</p>
                        <button class="btn-primary btn-sm" onclick="showToast('Desafío aceptado!','success'); agregarXP(${d.puntos});"><i class="bx bx-play"></i> Aceptar Desafío</button>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function cargarInsignias(c) {
    const insignias = window.db ? window.db.getInsignias() : [
        { nombre: 'Nuevo Miembro', icono: 'bx-user-plus' },
        { nombre: 'Miembro Activo', icono: 'bx-star' },
        { nombre: 'Líder', icono: 'bx-crown' },
        { nombre: 'Cuenta Verificada', icono: 'bx-badge-check' },
        { nombre: 'Orador Constante', icono: 'bx-pray' }
    ];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-badge-check"></i> Insignias</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                ${insignias.map(i => `
                    <div class="card" style="text-align:center;">
                        <div style="font-size:2.5rem;"><i class="bx ${i.icono}"></i></div>
                        <h3>${i.nombre}</h3>
                        <span class="badge estado-resuelto"><i class="bx bx-check"></i> Disponible</span>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function cargarArchivoStreaming(c) {
    const transmisiones = [
        { titulo: 'Culto Dominical - 16 de agosto', fecha: '2026-08-16', duracion: '2:30:00' },
        { titulo: 'Culto de Oración - 11 de agosto', fecha: '2026-08-11', duracion: '1:45:00' },
        { titulo: 'Culto de Jóvenes - 8 de agosto', fecha: '2026-08-08', duracion: '2:00:00' }
    ];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-archive"></i> Archivo Streaming</h2>
            ${transmisiones.map(t => `
                <div class="card">
                    <h3><i class="bx bx-video"></i> ${t.titulo}</h3>
                    <p><i class="bx bx-calendar"></i> ${formatearFecha(t.fecha)}</p>
                    <p><i class="bx bx-time"></i> ${t.duracion}</p>
                    <button class="btn-primary btn-sm" onclick="showToast('Reproduciendo: ${t.titulo}','info')"><i class="bx bx-play"></i> Ver</button>
                </div>
            `).join('')}
        </div>`;
}

function cargarWallpapers(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-image"></i> Wallpapers</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                ${CONFIG.WALLPAPERS.map(w => `
                    <div class="card" style="text-align:center;">
                        <div style="font-size:3rem;color:var(--azul-primario);"><i class="bx bx-image"></i></div>
                        <h3>${w.titulo}</h3>
                        <p>${w.descripcion}</p>
                        <button class="btn-outline btn-sm" onclick="showToast('Descargando wallpaper...','info')"><i class="bx bx-download"></i> Descargar</button>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function cargarDescargas(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-download"></i> Descargas</h2>
            <div class="card">
                <h3>Archivos disponibles</h3>
                <div style="padding:8px;border-bottom:1px solid var(--gris-medio);display:flex;justify-content:space-between;">
                    <span><i class="bx bx-bible"></i> Biblia Digital PDF</span>
                    <button class="btn-outline btn-sm" onclick="showToast('Descargando...','info')"><i class="bx bx-download"></i></button>
                </div>
                <div style="padding:8px;border-bottom:1px solid var(--gris-medio);display:flex;justify-content:space-between;">
                    <span><i class="bx bx-book"></i> Guía de Estudio</span>
                    <button class="btn-outline btn-sm" onclick="showToast('Descargando...','info')"><i class="bx bx-download"></i></button>
                </div>
                <div style="padding:8px;display:flex;justify-content:space-between;">
                    <span><i class="bx bx-music"></i> Cancionero</span>
                    <button class="btn-outline btn-sm" onclick="showToast('Descargando...','info')"><i class="bx bx-download"></i></button>
                </div>
            </div>
        </div>`;
}

function cargarDocumentos(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-file-doc"></i> Documentos</h2>
            ${CONFIG.DOCUMENTOS.map(d => `
                <div class="card" style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <h3><i class="bx bx-file-doc"></i> ${d.titulo}</h3>
                        <p><span class="badge badge-info">${d.tipo}</span> ${d.tamano}</p>
                    </div>
                    <button class="btn-primary btn-sm" onclick="showToast('Descargando ${d.titulo}','info')"><i class="bx bx-download"></i></button>
                </div>
            `).join('')}
        </div>`;
}

function cargarSuscripciones(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-credit-card"></i> Suscripciones</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;">
                ${CONFIG.SUSCRIPCIONES.map(s => `
                    <div class="card" style="text-align:center;${s.plan === 'Premium' ? 'border:2px solid var(--dorado);' : ''}">
                        ${s.plan === 'Premium' ? '<span class="badge badge-warning">Recomendado</span>' : ''}
                        <h3>${s.plan}</h3>
                        <p style="font-size:2rem;font-weight:700;color:var(--azul-primario);">${s.precio}</p>
                        <ul style="text-align:left;padding:16px 0;">
                            ${s.caracteristicas.map(f => `<li style="padding:4px 0;"><i class="bx bx-check" style="color:var(--exito);"></i> ${f}</li>`).join('')}
                        </ul>
                        <button class="btn-primary btn-block" onclick="suscribirse('${s.plan}')">
                            <i class="bx bx-crown"></i> Suscribirme
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function cargarTienda(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-store-alt"></i> Tienda Cristiana</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                ${CONFIG.PRODUCTOS.map(p => `
                    <div class="card" style="text-align:center;">
                        <div style="font-size:3rem;color:var(--azul-primario);"><i class="bx ${p.icono}"></i></div>
                        <h3>${p.nombre}</h3>
                        <p><span class="badge badge-info">${p.categoria}</span></p>
                        <p style="font-size:1.3rem;font-weight:700;color:var(--azul-primario);">$${p.precio.toLocaleString('es-CO')}</p>
                        <button class="btn-primary btn-sm btn-block" onclick="agregarAlCarrito('${p.id}')"><i class="bx bx-cart-add"></i> Agregar al carrito</button>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function cargarVideos(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-video"></i> Videos</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;">
                ${CONFIG.VIDEOS.map(v => `
                    <div class="card" style="cursor:pointer;" onclick="showToast('Reproduciendo: ${v.titulo}','info')">
                        <div style="aspect-ratio:16/9;background:var(--gris-oscuro);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--blanco);margin-bottom:8px;">
                            <i class="bx bx-play-circle" style="font-size:3rem;opacity:0.7;"></i>
                        </div>
                        <h3>${v.titulo}</h3>
                        <span class="badge badge-info">${v.categoria}</span>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function cargarCarrito(c) {
    const carrito = APP_STATE.carrito || [];
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-cart"></i> Carrito</h2>
            ${carrito.length === 0 ?
                '<div class="card"><p style="text-align:center;color:var(--gris-texto);"><i class="bx bx-cart"></i> Tu carrito está vacío</p></div>' :
                `<div class="card">
                    ${carrito.map(item => `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid var(--gris-medio);">
                            <span>${item.nombre} x${item.cantidad}</span>
                            <span>$${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                        </div>
                    `).join('')}
                    <div style="padding:16px 0;text-align:right;">
                        <strong style="font-size:1.3rem;">Total: $${total.toLocaleString('es-CO')}</strong>
                    </div>
                    <button class="btn-primary btn-block" onclick="finalizarPedido()"><i class="bx bx-check"></i> Finalizar Pedido</button>
                </div>`
            }
        </div>`;
}

function cargarExportarDatos(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-export"></i> Exportar Datos</h2>
            <div class="card">
                <h3><i class="bx bx-file"></i> Formatos disponibles</h3>
                <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
                    <button class="btn-primary" onclick="Storage.descargarRespaldo()"><i class="bx bx-download"></i> Descargar respaldo completo (.json)</button>
                    <button class="btn-secondary" onclick="navegarA('backup')"><i class="bx bx-cloud-download"></i> Ir a Copias de Seguridad</button>
                </div>
            </div>
        </div>`;
}

function cargarHistorial(c) {
    const historial = APP_STATE.historialAcciones || [];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-history"></i> Historial de Acciones</h2>
            ${historial.length === 0 ?
                '<div class="card"><p style="text-align:center;color:var(--gris-texto);"><i class="bx bx-info-circle"></i> No hay acciones registradas</p></div>' :
                historial.map(h => `
                    <div class="card" style="margin-bottom:8px;">
                        <p><strong>${escapeHtml(h.accion)}</strong></p>
                        <small>${escapeHtml(h.usuario)} - ${formatearFecha(h.fecha)}</small>
                    </div>
                `).join('')
            }
        </div>`;
}

function cargarAuditoria(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p><i class="bx bx-shield"></i> Acceso restringido</p></div>';
        return;
    }

    const logs = window.db ? window.db.getLogs(50) : [];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-clipboard"></i> Auditoría</h2>
            ${logs.length === 0 ?
                '<div class="card"><p style="text-align:center;color:var(--gris-texto);"><i class="bx bx-info-circle"></i> No hay registros de auditoría</p></div>' :
                logs.map(l => `
                    <div class="card" style="margin-bottom:8px;">
                        <p>${escapeHtml(l.accion || l.mensaje || '')}</p>
                        <small>${formatearFecha(l.fecha)} - ${l.usuario || 'Sistema'}</small>
                    </div>
                `).join('')
            }
        </div>`;
}

// ═══ v22.1: Página de Copias de Seguridad ═══
function cargarBackup(c) {
    if (!window.Storage) {
        c.innerHTML = `
            <div class="card">
                <h3><i class="bx bx-error-circle"></i> Módulo de respaldo no disponible</h3>
                <p>Verifica que <code>storage.js</code> esté incluido en el HTML.</p>
            </div>`;
        return;
    }
    c.innerHTML = Storage.renderPanelBackup();
    Storage.bindPanelBackup();
}

function cargarPermisos(c) {
    if (APP_STATE.rol !== 'admin') {
        c.innerHTML = '<div class="card"><p><i class="bx bx-shield"></i> Acceso restringido</p></div>';
        return;
    }

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-lock-open-alt"></i> Permisos</h2>
            <div class="card">
                <h3><i class="bx bx-shield"></i> Roles del sistema</h3>
                <div style="padding:8px;border-bottom:1px solid var(--gris-medio);">
                    <strong>Admin:</strong> Acceso total (usuarios, reportes, eventos, backups)
                </div>
                <div style="padding:8px;border-bottom:1px solid var(--gris-medio);">
                    <strong>Usuario:</strong> Puede publicar, orar, chatear, participar en gamificación
                </div>
                <div style="padding:8px;">
                    <strong>Invitado:</strong> Solo puede ver contenido público
                </div>
            </div>
        </div>`;
}

function cargarFavoritos(c) {
    const favoritos = APP_STATE.favoritos || [];

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-heart"></i> Favoritos</h2>
            ${favoritos.length === 0 ?
                '<div class="card"><p style="text-align:center;color:var(--gris-texto);"><i class="bx bx-heart"></i> Aún no tienes favoritos</p></div>' :
                favoritos.map(f => `
                    <div class="card">
                        <p>${escapeHtml(f.titulo || '')}</p>
                    </div>
                `).join('')
            }
        </div>`;
}

function cargarTema(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-palette"></i> Temas</h2>
            <div class="card">
                <h3>Selecciona tu tema</h3>
                <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;">
                    <button class="btn-secondary" onclick="APP_STATE.tema='light';aplicarTema('light')">
                        <i class="bx bx-sun"></i> Claro
                    </button>
                    <button class="btn-secondary" onclick="APP_STATE.tema='dark';aplicarTema('dark')">
                        <i class="bx bx-moon"></i> Oscuro
                    </button>
                </div>
            </div>
        </div>`;
}

// ============================================
// FUNCIONES AUXILIARES: LOGROS, XP, MODALES
// ============================================

function desbloquearLogro(logroId) {
    const logro = CONFIG.ACHIEVEMENTS.find(a => a.id === logroId);
    if (!logro) return;
    if (APP_STATE.logrosDesbloqueados.includes(logroId)) return;

    APP_STATE.logrosDesbloqueados.push(logroId);
    agregarXP(25);
    showToast(`🏆 Logro desbloqueado: ${logro.name}`, 'success');

    if (APP_STATE.usuario?.id && window.db) {
        window.db.desbloquearLogro(APP_STATE.usuario.id, logroId, {
            nombre: logro.name,
            descripcion: logro.desc,
            xp: 25
        });
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

    const bar = document.getElementById('user-xp-bar');
    if (bar) {
        bar.style.width = ((APP_STATE.xp / APP_STATE.xpSiguiente) * 100) + '%';
    }
}

function confirmarAccion(titulo, mensaje, callback) {
    const modal = document.getElementById('confirm-modal');
    if (!modal) { if (confirm(titulo + '\n\n' + mensaje)) callback(); return; }

    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-message');
    if (titleEl) titleEl.textContent = titulo;
    if (msgEl) msgEl.textContent = mensaje;

    modal.classList.remove('hidden');

    const aceptar = document.getElementById('confirm-accept');
    const cancelar = document.getElementById('confirm-cancel');

    const handlerAceptar = () => {
        modal.classList.add('hidden');
        aceptar.removeEventListener('click', handlerAceptar);
        cancelar.removeEventListener('click', handlerCancelar);
        callback();
    };
    const handlerCancelar = () => {
        modal.classList.add('hidden');
        aceptar.removeEventListener('click', handlerAceptar);
        cancelar.removeEventListener('click', handlerCancelar);
    };

    aceptar.addEventListener('click', handlerAceptar);
    cancelar.addEventListener('click', handlerCancelar);
}

function cerrarPaneles() {
    ['streaming-panel', 'radio-quick-panel', 'qr-panel', 'reports-quick-panel', 'notification-panel', 'user-dropdown', 'fab-menu', 'search-bar', 'assistant']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
}

function cerrarSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
    APP_STATE.sidebarOpen = false;
}

function abrirSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.add('open');
    APP_STATE.sidebarOpen = true;
}

function actualizarFechaHeader() {
    const el = document.getElementById('header-date');
    if (!el) return;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('es-CO', options);
    el.textContent = today.charAt(0).toUpperCase() + today.slice(1);
}

function iniciarContador() {
    const actualizar = () => {
        const ahora = new Date();
        const proximoDomingo = new Date(ahora);
        proximoDomingo.setDate(ahora.getDate() + ((7 - ahora.getDay()) % 7 || 7));
        proximoDomingo.setHours(10, 0, 0, 0);

        const diff = proximoDomingo - ahora;
        const dias = Math.floor(diff / 86400000);
        const horas = Math.floor((diff % 86400000) / 3600000);
        const minutos = Math.floor((diff % 3600000) / 60000);
        const segundos = Math.floor((diff % 60000) / 1000);

        const el = (id) => document.getElementById(id);
        if (el('contador-dias')) el('contador-dias').textContent = String(dias).padStart(2, '0');
        if (el('contador-horas')) el('contador-horas').textContent = String(horas).padStart(2, '0');
        if (el('contador-minutos')) el('contador-minutos').textContent = String(minutos).padStart(2, '0');
        if (el('contador-segundos')) el('contador-segundos').textContent = String(segundos).padStart(2, '0');
    };
    actualizar();
    if (APP_STATE.contadorInterval) clearInterval(APP_STATE.contadorInterval);
    APP_STATE.contadorInterval = setInterval(actualizar, 1000);
}

// Placeholder para funciones de modales/acciones
function abrirModalEvento() { const m = document.getElementById('event-modal'); if (m) m.classList.remove('hidden'); }
function abrirModalReporte() { const m = document.getElementById('report-modal'); if (m) m.classList.remove('hidden'); }
function toggleRadio() { APP_STATE.radioPlaying = !APP_STATE.radioPlaying; showToast(APP_STATE.radioPlaying ? 'Radio encendida' : 'Radio apagada', 'info'); navegarA('radio'); }
function toggleRadioPanel() { const p = document.getElementById('radio-quick-panel'); if (p) p.classList.toggle('hidden'); }
function toggleStreamingPanel() { const p = document.getElementById('streaming-panel'); if (p) p.classList.toggle('hidden'); }
function reproducirCancion(i) { showToast('Reproduciendo: ' + CONFIG.PLAYLIST[i].title, 'info'); }
function compartirVersiculo() { showToast('Versículo copiado al portapapeles', 'success'); }
function realizarDonacion() { showToast('Sistema de donaciones próximamente', 'info'); }
function iniciarTrivia() {
    const m = document.getElementById('game-modal');
    if (m) m.classList.remove('hidden');
}
function agregarAlCarrito(id) {
    const prod = CONFIG.PRODUCTOS.find(p => p.id === id);
    if (!prod) return;
    const existente = APP_STATE.carrito.find(x => x.id === id);
    if (existente) existente.cantidad++;
    else APP_STATE.carrito.push({ ...prod, cantidad: 1 });
    showToast(prod.nombre + ' agregado al carrito', 'success');
}
function finalizarPedido() { showToast('Pedido finalizado. Te contactaremos pronto.', 'success'); APP_STATE.carrito = []; navegarA('carrito'); }
function suscribirse(plan) { APP_STATE.suscripcionActual = plan; showToast('Suscripción ' + plan + ' activada', 'success'); }
function cerrarSesion() {
    APP_STATE.usuario = null;
    APP_STATE.token = null;
    APP_STATE.rol = null;
    APP_STATE.isAdmin = false;
    try {
        localStorage.removeItem('ipuc20_sesion');
    } catch (e) {}
    showToast('Sesión cerrada', 'info');
    setTimeout(() => location.reload(), 500);
}

// ============================================
// ═══ v22.1: STORAGE INIT + MODAL CÓDIGO MAESTRO ═══
// ============================================

function inicializarStorage() {
    if (!window.Storage || !window.db) {
        console.warn('⚠️ Storage o DB no disponibles');
        return;
    }
    try {
        Storage.sincronizarAppState();
        console.log('✅ Storage inicializado y APP_STATE sincronizado');
    } catch (e) {
        console.error('❌ Error inicializando Storage:', e);
    }
}

function mostrarModalCodigoMaestro(codigo) {
    const modal = document.getElementById('master-code-modal');
    if (!modal) {
        alert(
            '⚠️ GUARDA ESTE CÓDIGO DE RECUPERACIÓN\n\n' +
            'Código: ' + codigo + '\n\n' +
            'Lo necesitarás si olvidas tu contraseña o se borran los datos.\n\n' +
            'Guárdalo en un lugar seguro.'
        );
        return;
    }

    const display = document.getElementById('master-code-display');
    if (display) display.textContent = codigo;

    modal.classList.remove('hidden');

    const btnCopiar = document.getElementById('btn-copy-master-code');
    const btnDescargar = document.getElementById('btn-download-master-code');
    const btnConfirmar = document.getElementById('btn-confirm-master-code');

    if (btnCopiar && !btnCopiar.dataset.bound) {
        btnCopiar.dataset.bound = 'true';
        btnCopiar.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(codigo);
                showToast('Código copiado', 'success');
            } catch (e) {
                showToast('No se pudo copiar. Cópialo manualmente.', 'warning');
            }
        });
    }

    if (btnDescargar && !btnDescargar.dataset.bound) {
        btnDescargar.dataset.bound = 'true';
        btnDescargar.addEventListener('click', () => {
            const contenido =
                '========================================\n' +
                'IPUC LA FONDA - CÓDIGO MAESTRO\n' +
                '========================================\n\n' +
                'Código: ' + codigo + '\n\n' +
                'Fecha: ' + new Date().toLocaleString('es-CO') + '\n\n' +
                '⚠️ IMPORTANTE:\n' +
                'Guarda este código en un lugar seguro.\n' +
                'Lo necesitarás si olvidas la contraseña del administrador\n' +
                'o si se borran los datos del navegador.\n\n' +
                'No compartas este código con nadie.\n';

            const blob = new Blob([contenido], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'IPUC_codigo_maestro.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    if (btnConfirmar && !btnConfirmar.dataset.bound) {
        btnConfirmar.dataset.bound = 'true';
        btnConfirmar.addEventListener('click', () => {
            modal.classList.add('hidden');
            showToast('Código guardado. ¡Bienvenido!', 'success');
        });
    }
}

window.mostrarModalCodigoMaestro = mostrarModalCodigoMaestro;

// ═══ ARRANQUE ═══
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarStorage, 600);

    // Conectar botones globales
    const toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.addEventListener('click', toggleTema);

    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) menuToggle.addEventListener('click', abrirSidebar);

    const closeSidebar = document.getElementById('close-sidebar');
    if (closeSidebar) closeSidebar.addEventListener('click', cerrarSidebar);

    // Navegación por hash y clicks
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            navegarA(page);
            if (window.location.hash !== '#' + page) {
                window.location.hash = page;
            }
        });
    });

    // Botón de logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        confirmarAccion('¿Cerrar sesión?', '', cerrarSesion);
    });
});

// Re-sincronizar al iniciar sesión
window.addEventListener('ipuc:login', () => {
    setTimeout(inicializarStorage, 300);
});

// Manejar hash al cargar
window.addEventListener('hashchange', () => {
    const page = window.location.hash.replace('#', '');
    if (page && CONFIG.TITULOS_PAGINAS[page]) {
        navegarA(page);
    }
});

console.log('✅ script.js v22.1 cargado con Storage integrado');
