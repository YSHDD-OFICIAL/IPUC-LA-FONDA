/* ============================================
   IPUC LA FONDA - SCRIPT.JS v22.1 PRO PREMIUM
   Web App Profesional - Sistema Completo
   + Persistencia total, Respaldo, Recuperación
   + Cuenta Oficial y Cambio de Contraseña
   "Donde el Espíritu Santo se mueve"
   ============================================ */

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
    VERSION: '22.1',                        // ═══ v22.2 ═══
    VERSION_NAME: 'PRO PREMIUM',            // ═══ v22.2 ═══
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

// ═══════════════════════════════════════════════════════════
// ═══ v22.2: PERFIL CON CAMBIO DE CONTRASEÑA Y CUENTA OFICIAL ═══
// ═══════════════════════════════════════════════════════════

function cargarPerfil(c) {
    if (!APP_STATE.usuario) {
        c.innerHTML = '<div class="fade-in"><h2><i class="bx bx-user"></i> Perfil</h2><div class="card"><p><i class="bx bx-info-circle"></i> Inicia sesión para ver tu perfil</p></div></div>';
        return;
    }

    const u = APP_STATE.usuario;
    const esOficial = u.esCuentaOficial === true;
    const passwordCambiada = u.passwordCambiada === true;

    // ═══ v22.2: Advertencia para cuenta oficial con contraseña por defecto ═══
    const advertenciaOficial = (esOficial && !passwordCambiada) ? `
        <div class="backup-alert warning" style="margin-bottom:12px;">
            <i class="bx bx-error-circle"></i>
            <div>
                <strong>⚠️ Cuenta Oficial sin contraseña personalizada</strong>
                <p style="margin-top:4px;font-size:0.85rem;">
                    Estás usando la contraseña por defecto. Cámbiala antes de desplegar a producción.
                </p>
            </div>
        </div>
    ` : '';

    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-user-circle"></i> Mi Perfil</h2>

            ${advertenciaOficial}

            <div class="card" style="text-align:center;">
                <img src="${u.foto || 'assets/avatars/default.png'}" style="width:80px;height:80px;border-radius:50%;margin-bottom:12px;object-fit:cover;">
                <h3>
                    ${u.nombre || ''} ${u.apellidos || ''}
                    ${esOficial ? '<span class="badge" style="position:static;background:var(--dorado);color:var(--azul-primario);margin-left:4px;">👑 Oficial</span>' : ''}
                </h3>
                <p>@${u.usuario || ''}</p>
                <p><i class="bx bx-envelope"></i> ${u.correo || ''}</p>
                <p><i class="bx bx-building-house"></i> ${u.ministerio || 'General'}</p>
                <div style="margin-top:8px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                    <span class="badge"><i class="bx bx-level-up"></i> Lv.${APP_STATE.nivel}</span>
                    <span class="badge"><i class="bx bx-trophy"></i> ${APP_STATE.logrosDesbloqueados.length} logros</span>
                    <span class="badge"><i class="bx bx-star"></i> ${APP_STATE.xp} XP</span>
                </div>
            </div>

            <div class="card">
                <h3><i class="bx bx-shield-alt"></i> Seguridad</h3>
                <p style="font-size:0.9rem;color:var(--gris-texto);margin-bottom:12px;">
                    Cambia tu contraseña periódicamente para mantener tu cuenta segura.
                </p>
                <button class="btn-primary btn-sm" onclick="mostrarModalCambiarPassword()">
                    <i class="bx bx-key"></i> Cambiar Contraseña
                </button>
            </div>

            <button class="btn-danger btn-sm" onclick="confirmarAccion('Cerrar sesión?','',cerrarSesion)" style="margin-top:8px;">
                <i class="bx bx-log-out"></i> Cerrar Sesión
            </button>
        </div>`;
}

// ============================================
// ═══ v22.2: MODAL DE CAMBIO DE CONTRASEÑA ═══
// ============================================

function mostrarModalCambiarPassword() {
    if (!APP_STATE.usuario) {
        showToast('Inicia sesión para cambiar tu contraseña', 'warning');
        return;
    }

    // Eliminar modal anterior si existe
    const anterior = document.getElementById('modal-cambiar-password');
    if (anterior) anterior.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-cambiar-password';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="cerrarModalCambiarPassword()"></div>
        <div class="modal-container modal-sm">
            <div class="modal-header">
                <h2><i class="bx bx-key"></i> Cambiar Contraseña</h2>
                <button class="modal-close btn-icon" onclick="cerrarModalCambiarPassword()" aria-label="Cerrar">
                    <i class="bx bx-x"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="form-cambiar-password" onsubmit="handleCambiarPassword(event)">
                    <div class="form-group">
                        <label for="cp-actual"><i class="bx bx-lock-alt"></i> Contraseña actual *</label>
                        <div class="input-wrapper">
                            <i class="bx bx-lock-alt"></i>
                            <input type="password" id="cp-actual" class="form-input" placeholder="Tu contraseña actual" required autocomplete="current-password">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="cp-nueva"><i class="bx bx-lock"></i> Nueva contraseña *</label>
                        <div class="input-wrapper">
                            <i class="bx bx-lock"></i>
                            <input type="password" id="cp-nueva" class="form-input" placeholder="Mínimo 8 caracteres" required minlength="8" autocomplete="new-password" oninput="validarPasswordNueva()">
                        </div>
                        <div id="cp-fuerza" class="password-strength" style="display:none;">
                            <span class="strength-bar"></span>
                            <span class="strength-bar"></span>
                            <span class="strength-bar"></span>
                            <span class="strength-bar"></span>
                            <span class="strength-text">Débil</span>
                        </div>
                        <small class="form-hint">Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números</small>
                    </div>
                    <div class="form-group">
                        <label for="cp-confirmar"><i class="bx bx-check-shield"></i> Confirmar nueva contraseña *</label>
                        <div class="input-wrapper">
                            <i class="bx bx-check-shield"></i>
                            <input type="password" id="cp-confirmar" class="form-input" placeholder="Repite la nueva contraseña" required minlength="8" autocomplete="new-password">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="cerrarModalCambiarPassword()">
                            <i class="bx bx-x"></i> Cancelar
                        </button>
                        <button type="submit" class="btn-primary" id="cp-submit">
                            <i class="bx bx-check"></i> Cambiar Contraseña
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Auto-focus en el primer campo
    setTimeout(() => {
        const primer = document.getElementById('cp-actual');
        if (primer) primer.focus();
    }, 100);
}

function cerrarModalCambiarPassword() {
    const modal = document.getElementById('modal-cambiar-password');
    if (modal) modal.remove();
}

function validarPasswordNueva() {
    const input = document.getElementById('cp-nueva');
    const fuerza = document.getElementById('cp-fuerza');
    if (!input || !fuerza) return;

    const valor = input.value;
    if (valor.length === 0) {
        fuerza.style.display = 'none';
        return;
    }

    fuerza.style.display = 'flex';

    let puntos = 0;
    if (valor.length >= 8) puntos++;
    if (valor.length >= 12) puntos++;
    if (/[A-Z]/.test(valor)) puntos++;
    if (/[0-9]/.test(valor)) puntos++;
    if (/[^A-Za-z0-9]/.test(valor)) puntos++;

    const barras = fuerza.querySelectorAll('.strength-bar');
    const texto = fuerza.querySelector('.strength-text');

    barras.forEach((b, i) => {
        b.classList.toggle('active', i < puntos);
    });

    const niveles = ['Débil', 'Débil', 'Media', 'Buena', 'Fuerte', 'Excelente'];
    texto.textContent = niveles[puntos] || 'Débil';
}

async function handleCambiarPassword(event) {
    event.preventDefault();

    const actual = document.getElementById('cp-actual').value;
    const nueva = document.getElementById('cp-nueva').value;
    const confirmar = document.getElementById('cp-confirmar').value;
    const submitBtn = document.getElementById('cp-submit');

    // Validaciones
    if (!actual || !nueva || !confirmar) {
        showToast('Completa todos los campos', 'warning');
        return;
    }

    if (nueva.length < 8) {
        showToast('La nueva contraseña debe tener al menos 8 caracteres', 'error');
        return;
    }

    if (nueva !== confirmar) {
        showToast('Las contraseñas no coinciden', 'error');
        return;
    }

    if (actual === nueva) {
        showToast('La nueva contraseña debe ser diferente a la actual', 'warning');
        return;
    }

    if (!APP_STATE.usuario || !APP_STATE.usuario.id) {
        showToast('No hay usuario activo', 'error');
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Procesando...';
    }

    try {
        const r = window.db.cambiarPassword(APP_STATE.usuario.id, actual, nueva);

        if (r.success) {
            showToast('✅ ' + r.mensaje, 'success');

            // Actualizar estado local
            APP_STATE.usuario.passwordCambiada = true;

            // Si es cuenta oficial, mostrar mensaje especial
            if (r.esOficial) {
                setTimeout(() => {
                    showToast('👑 Cuenta oficial protegida con contraseña personalizada', 'success', 5000);
                }, 1500);
            }

            cerrarModalCambiarPassword();

            // Recargar la página actual para reflejar cambios
            setTimeout(() => {
                navegarA(APP_STATE.currentPage || 'perfil');
            }, 500);
        } else {
            showToast('❌ ' + r.error, 'error');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bx bx-check"></i> Cambiar Contraseña';
            }
        }
    } catch (e) {
        showToast('Error inesperado: ' + e.message, 'error');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bx bx-check"></i> Cambiar Contraseña';
        }
    }
}

// ============================================
// RESTO DE FUNCIONES DE PÁGINAS
// ============================================

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
            ${APP_STATE.usuario ? `
            <div class="card">
                <h3><i class="bx bx-shield-alt"></i> Seguridad</h3>
                <button class="btn-primary btn-sm" onclick="mostrarModalCambiarPassword()">
                    <i class="bx bx-key"></i> Cambiar Contraseña
                </button>
            </div>` : ''}
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
            </div>
            ${estado.cuentaOficial ? `
            <div class="card">
                <h3><i class="bx bx-crown"></i> Cuenta Oficial</h3>
                <p><strong>Estado:</strong> ${estado.cuentaOficial.existe ? '✅ Activa' : '❌ No existe'}</p>
                <p><strong>Seguridad:</strong> ${estado.cuentaOficial.tieneAdvertencia ? '⚠️ Contraseña por defecto' : '✅ Personalizada'}</p>
                <p style="font-size:0.9rem;color:var(--gris-texto);">${estado.cuentaOficial.mensaje}</p>
            </div>` : ''}
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

// Continúa con el resto de funciones (cargarPeticiones, cargarBiblioteca, etc.)
// ... [Idénticas a la versión v22.1 del mensaje anterior] ...
// Para no duplicar 1500+ líneas, aquí van las mismas que ya tienes.

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

// ============================================
// ═══ v22.2: INICIALIZACIÓN CON STORAGE ═══
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

    const toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.addEventListener('click', toggleTema);

    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) menuToggle.addEventListener('click', abrirSidebar);

    const closeSidebar = document.getElementById('close-sidebar');
    if (closeSidebar) closeSidebar.addEventListener('click', cerrarSidebar);

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

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        confirmarAccion('¿Cerrar sesión?', '', cerrarSesion);
    });
});

window.addEventListener('ipuc:login', () => {
    setTimeout(inicializarStorage, 300);
});

window.addEventListener('hashchange', () => {
    const page = window.location.hash.replace('#', '');
    if (page && CONFIG.TITULOS_PAGINAS[page]) {
        navegarA(page);
    }
});

console.log('✅ script.js v22.1 cargado con Storage integrado + cambio de contraseña');
console.log('🔑 Función cambiarMiPassword() disponible');
console.log('👑 Cuenta oficial: ipuclafonda@gmail.com');
