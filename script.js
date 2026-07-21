// ============================================
// IPUC LA FONDA - SCRIPT.JS v18.0 PRO ULTIMATE
// Web App Profesional - Sistema Completo
// Incluye: Reportes, Administración, Comunidad
// VERSIÓN ESTABLE - OPTIMIZADA
// ============================================

// ============================================
// CONFIGURACIÓN GLOBAL v18.0
// ============================================
const CONFIG = {
    VERSION: '18.0',
    MODO_OFFLINE: true,
    STORAGE_KEYS: {
        TOKEN: 'ipuc18_token',
        USUARIO: 'ipuc18_usuario',
        ROL: 'ipuc18_rol',
        TEMA: 'ipuc18_tema',
        PUBLICACIONES: 'ipuc18_publicaciones',
        COMENTARIOS: 'ipuc18_comentarios',
        REACCIONES: 'ipuc18_reacciones',
        NOTIFICACIONES: 'ipuc18_notificaciones',
        ASISTENCIAS: 'ipuc18_asistencias',
        EVENTOS: 'ipuc18_eventos',
        NOTICIAS: 'ipuc18_noticias',
        PETICIONES: 'ipuc18_peticiones',
        ENCUESTAS: 'ipuc18_encuestas',
        BIBLIOTECA: 'ipuc18_biblioteca',
        GALERIA: 'ipuc18_galeria',
        PODCAST: 'ipuc18_podcast',
        CHAT: 'ipuc18_chat',
        DIRECTORIO: 'ipuc18_directorio',
        // NUEVO v18: Sistema de Reportes
        REPORTES: 'ipuc18_reportes',
        REPORTES_PENDIENTES: 'ipuc18_reportes_pendientes',
        REPORTES_CONFIG: 'ipuc18_reportes_config'
    },
    DIAS_SEMANA: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    TITULOS_PAGINAS: {
        'inicio': 'Inicio',
        'horarios': 'Horarios de Cultos',
        'asistencia': 'Confirmar Asistencia',
        'noticias': 'Noticias',
        'eventos': 'Eventos',
        'chat': 'Chat Global',
        'directorio': 'Directorio de Miembros',
        'peticiones': 'Peticiones de Oración',
        'encuestas': 'Encuestas',
        'biblioteca': 'Biblioteca Digital',
        'galeria': 'Galería',
        'devocional': 'Devocional Diario',
        'perfil': 'Mi Perfil',
        'configuracion': 'Configuración',
        'publicaciones': 'Publicaciones',
        'podcast': 'Podcast',
        'analytics': 'Analytics',
        'dashboard': 'Dashboard',
        'gestion-usuarios': 'Gestión de Usuarios',
        'gestion-noticias': 'Gestión de Noticias',
        'gestion-eventos': 'Gestión de Eventos',
        'versiculos': 'Versículos Diarios',
        'sistema': 'Configuración del Sistema',
        'seguridad': 'Seguridad',
        'grupos': 'Grupos',
        'videos': 'Videos',
        'logs': 'Logs',
        // NUEVO v18: Páginas de Reportes
        'gestion-reportes': 'Gestión de Reportes',
        'mis-reportes': 'Mis Reportes',
        'reporte-asistencia': 'Reporte de Asistencia',
        'reporte-financiero': 'Reporte Financiero',
        'reporte-ministerios': 'Reporte de Ministerios',
        'reporte-crecimiento': 'Reporte de Crecimiento',
        'reporte-moderacion': 'Reporte de Moderación'
    },
    REACCIONES_TIPOS: [
        { icono: 'bx bxs-hands', nombre: 'Amén', clave: 'amen' },
        { icono: 'bx bxs-heart', nombre: 'Me gusta', clave: 'me_gusta' },
        { icono: 'bx bxs-fire', nombre: 'Fuego', clave: 'fuego' },
        { icono: 'bx bxs-pray', nombre: 'Orando', clave: 'orando' },
        { icono: 'bx bxs-star', nombre: 'Bendición', clave: 'bendicion' }
    ],
    // NUEVO v18: Configuración de Reportes
    REPORTES_CONFIG: {
        MAX_REPORTES_PENDIENTES: 50,
        TIEMPO_RESOLUCION_HORAS: 72,
        NIVELES_URGENCIA: ['baja', 'media', 'alta', 'critica'],
        ESTADOS_REPORTE: ['pendiente', 'en_revision', 'resuelto', 'desestimado'],
        TIPOS_REPORTE: ['usuario', 'contenido', 'asistencia', 'financiero', 'ministerio']
    }
};

// ============================================
// ESTADO DE LA APLICACIÓN v18.0
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
    contadorInterval: null,
    fechaInterval: null,
    notificacionesNoLeidas: 0,
    reportsPendientes: 0,
    pendingConfirmation: null,
    isLoading: false,
    publicaciones: [],
    comentarios: [],
    reacciones: {},
    notificaciones: [],
    asistencias: [],
    eventos: [],
    noticias: [],
    peticiones: [],
    encuestas: [],
    biblioteca: [],
    galeria: [],
    podcast: [],
    chat: [],
    directorio: [],
    reportes: [],
    isOnline: navigator.onLine,
    idioma: 'es'
};

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================
function formatearFecha(f) {
    try {
        const d = new Date(f);
        if (isNaN(d.getTime())) return 'Fecha inválida';
        const ahora = new Date();
        const diff = ahora - d;
        if (diff < 60000) return 'Ahora mismo';
        if (diff < 3600000) return 'Hace ' + Math.floor(diff / 60000) + ' min';
        if (diff < 86400000) return 'Hace ' + Math.floor(diff / 3600000) + ' h';
        if (diff < 604800000) return 'Hace ' + Math.floor(diff / 86400000) + ' d';
        return d.toLocaleDateString('es-CO', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Fecha inválida';
    }
}

function formatearFechaCorta(f) {
    try {
        const d = new Date(f);
        if (isNaN(d.getTime())) return '--';
        return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return '--';
    }
}

function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// ============================================
// FUNCIONES DE IDIOMA
// ============================================
function cambiarIdioma(lang) {
    const idiomas = {
        es: 'ES', en: 'EN', pt: 'PT', fr: 'FR', de: 'DE', it: 'IT'
    };
    if (!idiomas[lang]) return;
    APP_STATE.idioma = lang;
    localStorage.setItem('ipuc18_idioma', lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    showToast('🌐 Idioma: ' + idiomas[lang], 'info');
}

// ============================================
// FUNCIONES DE TEMA
// ============================================
function toggleTema() {
    APP_STATE.tema = APP_STATE.tema === 'light' ? 'dark' : 'light';
    aplicarTema(APP_STATE.tema);
    localStorage.setItem(CONFIG.STORAGE_KEYS.TEMA, APP_STATE.tema);
}

function aplicarTema(t) {
    document.documentElement.setAttribute('data-theme', t);
    const icon = document.querySelector('#theme-toggle i');
    if (icon) icon.className = t === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = t === 'dark' ? '#1a1a2e' : '#1a237e';
}

// ============================================
// FUNCIONES DE TOAST
// ============================================
function showToast(mensaje, tipo, duracion) {
    tipo = tipo || 'info';
    duracion = duracion || 3500;
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const iconos = {
        success: 'bx bxs-check-circle',
        error: 'bx bxs-error-circle',
        warning: 'bx bxs-error',
        info: 'bx bxs-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = 'toast ' + tipo;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <i class="${iconos[tipo] || 'bx bxs-info-circle'}"></i>
        <span>${mensaje}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 300);
    }, duracion);
}

// ============================================
// FUNCIONES DE MODAL
// ============================================
function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.add('hidden');
    const footer = document.getElementById('modal-footer');
    if (footer) footer.classList.add('hidden');
}

function confirmarAccion(titulo, mensaje, callback, tipo) {
    tipo = tipo || 'warning';
    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-message');
    const modal = document.getElementById('confirm-modal');
    if (!modal) return;
    
    if (titleEl) titleEl.textContent = titulo;
    if (msgEl) msgEl.textContent = mensaje;
    
    const acceptBtn = document.getElementById('confirm-accept');
    if (acceptBtn) acceptBtn.className = tipo === 'danger' ? 'btn-danger' : 'btn-primary';
    
    APP_STATE.pendingConfirmation = callback;
    modal.classList.remove('hidden');
}

// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================
function mostrarApp() {
    const welcome = document.getElementById('welcome-screen');
    const app = document.getElementById('app');
    const fab = document.getElementById('fab-main');
    if (welcome) welcome.classList.add('hidden');
    if (app) app.classList.remove('hidden');
    if (fab) fab.classList.remove('hidden');
    actualizarSidebarUsuario();
    navegarA('inicio');
    iniciarContadorRegresivo();
    iniciarActualizacionFecha();
    actualizarBadgeReportes();
}

function mostrarBienvenida() {
    const app = document.getElementById('app');
    const welcome = document.getElementById('welcome-screen');
    const fab = document.getElementById('fab-main');
    if (app) app.classList.add('hidden');
    if (welcome) welcome.classList.remove('hidden');
    if (fab) fab.classList.add('hidden');
}

function toggleSidebar() {
    APP_STATE.sidebarOpen ? cerrarSidebar() : abrirSidebar();
}

function abrirSidebar() {
    APP_STATE.sidebarOpen = true;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.remove('hidden');
}

function cerrarSidebar() {
    if (APP_STATE.sidebarLocked) return;
    APP_STATE.sidebarOpen = false;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.add('hidden');
}

function manejarResponsiveSidebar() {
    if (window.innerWidth >= 1024) {
        APP_STATE.sidebarLocked = true;
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('hidden');
    } else {
        APP_STATE.sidebarLocked = false;
        if (!APP_STATE.sidebarOpen) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.remove('open');
        }
    }
}

function navegarA(page) {
    if (!page || APP_STATE.isLoading) return;
    APP_STATE.currentPage = page;
    APP_STATE.isLoading = true;
    
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-page') === page);
    });
    
    const titulo = CONFIG.TITULOS_PAGINAS[page] || page;
    const titleEl = document.getElementById('page-title');
    const breadcrumb = document.getElementById('breadcrumb-current');
    if (titleEl) titleEl.textContent = titulo;
    if (breadcrumb) breadcrumb.textContent = titulo;
    
    cargarPagina(page);
    if (window.innerWidth < 1024) cerrarSidebar();
    APP_STATE.isLoading = false;
}

function actualizarSidebarUsuario() {
    if (!APP_STATE.usuario) return;
    const mini = document.getElementById('user-mini');
    if (mini) {
        const img = mini.querySelector('img');
        const name = mini.querySelector('.user-name');
        const role = mini.querySelector('.user-role');
        const status = mini.querySelector('.user-status');
        if (img) img.src = APP_STATE.usuario.foto || 'assets/avatars/default.png';
        if (name) name.textContent = APP_STATE.usuario.nombre || 'Usuario';
        if (role) {
            const roles = { admin: 'Administrador', invitado: 'Invitado', usuario: 'Miembro' };
            role.textContent = roles[APP_STATE.rol] || 'Miembro';
        }
        if (status) status.className = 'user-status ' + (APP_STATE.isOnline ? 'online' : 'offline');
    }
    const adminMenu = document.getElementById('admin-menu');
    if (adminMenu) adminMenu.classList.toggle('hidden', APP_STATE.rol !== 'admin');
}

// ============================================
// CONTADOR, FECHA, VERSÍCULO
// ============================================
function iniciarContadorRegresivo() {
    if (APP_STATE.contadorInterval) clearInterval(APP_STATE.contadorInterval);
    actualizarContador();
    APP_STATE.contadorInterval = setInterval(actualizarContador, 1000);
}

function actualizarContador() {
    const d = document.getElementById('contador-dias');
    const h = document.getElementById('contador-horas');
    const m = document.getElementById('contador-minutos');
    const s = document.getElementById('contador-segundos');
    const t = document.getElementById('contador-titulo');
    const e = document.getElementById('contador-estado');
    if (!d && !t) return;
    
    try {
        const ahora = new Date();
        const domingo = new Date(ahora);
        domingo.setDate(ahora.getDate() + ((7 - ahora.getDay()) % 7));
        domingo.setHours(10, 0, 0, 0);
        if (domingo <= ahora) domingo.setDate(domingo.getDate() + 7);
        
        const diff = Math.max(0, (domingo - ahora) / 1000);
        const dias = Math.floor(diff / 86400);
        const horas = Math.floor((diff % 86400) / 3600);
        const minutos = Math.floor((diff % 3600) / 60);
        const segundos = Math.floor(diff % 60);
        
        if (t) t.textContent = 'Culto Dominical - Domingo';
        if (d) d.textContent = String(dias).padStart(2, '0');
        if (h) h.textContent = String(horas).padStart(2, '0');
        if (m) m.textContent = String(minutos).padStart(2, '0');
        if (s) s.textContent = String(segundos).padStart(2, '0');
        if (e) {
            e.textContent = diff > 0 ? 'PRÓXIMO CULTO' : '¡CULTO EN CURSO!';
            e.className = 'contador-estado ' + (diff > 0 ? 'estado-proximo' : 'estado-activo');
        }
    } catch (_) {}
}

function iniciarActualizacionFecha() {
    if (APP_STATE.fechaInterval) clearInterval(APP_STATE.fechaInterval);
    actualizarFechaHora();
    APP_STATE.fechaInterval = setInterval(actualizarFechaHora, 1000);
}

function actualizarFechaHora() {
    try {
        const a = new Date();
        const fe = document.getElementById('fecha-actual');
        const ho = document.getElementById('hora-actual');
        if (fe) {
            fe.textContent = a.toLocaleDateString('es-CO', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        }
        if (ho) {
            ho.textContent = a.toLocaleTimeString('es-CO', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        }
    } catch (_) {}
}

function cargarVersiculoDiario() {
    const container = document.getElementById('versiculo-content');
    if (!container) return;
    
    const versiculos = [
        { texto: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", referencia: "Juan 3:16" },
        { texto: "Jehová es mi pastor; nada me faltará.", referencia: "Salmos 23:1" },
        { texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13" },
        { texto: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", referencia: "Mateo 6:33" },
        { texto: "Jehová te bendiga, y te guarde.", referencia: "Números 6:24-25" },
        { texto: "El Señor es mi luz y mi salvación; ¿de quién temeré?", referencia: "Salmos 27:1" },
        { texto: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal.", referencia: "Jeremías 29:11" }
    ];
    
    const v = versiculos[new Date().getDay() % versiculos.length];
    container.innerHTML = `
        <p style="font-style:italic;font-size:1.1rem;line-height:1.8;">"${v.texto}"</p>
        <p style="font-weight:700;color:var(--azul-primario);margin-top:8px;">${v.referencia}</p>
    `;
}

// ============================================
// FUNCIONES UI
// ============================================
function toggleSearchBar() {
    APP_STATE.searchBarOpen = !APP_STATE.searchBarOpen;
    const bar = document.getElementById('search-bar');
    if (bar) {
        bar.classList.toggle('hidden', !APP_STATE.searchBarOpen);
        if (APP_STATE.searchBarOpen) {
            const input = document.getElementById('global-search-input');
            if (input) setTimeout(() => input.focus(), 100);
        }
    }
}

function toggleFabMenu() {
    APP_STATE.fabMenuOpen = !APP_STATE.fabMenuOpen;
    const menu = document.getElementById('fab-menu');
    if (menu) menu.classList.toggle('hidden', !APP_STATE.fabMenuOpen);
}

function toggleUserDropdown() {
    APP_STATE.userDropdownOpen = !APP_STATE.userDropdownOpen;
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.toggle('hidden', !APP_STATE.userDropdownOpen);
}

function toggleNotificaciones() {
    APP_STATE.notificationsOpen = !APP_STATE.notificationsOpen;
    const panel = document.getElementById('notification-panel');
    if (panel) panel.classList.toggle('hidden', !APP_STATE.notificationsOpen);
}

// ============================================
// SISTEMA DE REPORTES v18.0
// ============================================

/**
 * Abre el panel de reportes rápidos
 */
function togglePanelReportes() {
    APP_STATE.reportsPanelOpen = !APP_STATE.reportsPanelOpen;
    const panel = document.getElementById('reports-quick-panel');
    if (panel) {
        panel.classList.toggle('hidden', !APP_STATE.reportsPanelOpen);
        if (APP_STATE.reportsPanelOpen) {
            cargarReportesRecientes();
        }
    }
}

/**
 * Abre el modal para generar un nuevo reporte
 */
function abrirModalReporte() {
    const modal = document.getElementById('report-modal');
    if (!modal) return;
    
    document.getElementById('report-modal-title').innerHTML = '<i class="bx bx-file"></i> Generar Nuevo Reporte';
    
    // Resetear formulario
    const form = document.getElementById('report-form');
    if (form) form.reset();
    
    // Mostrar campos por defecto (reporte de usuario)
    cambiarTipoReporte('usuario');
    
    modal.classList.remove('hidden');
}

/**
 * Cierra el modal de reportes
 */
function cerrarModalReporte() {
    const modal = document.getElementById('report-modal');
    if (modal) modal.classList.add('hidden');
}

/**
 * Cambia dinámicamente los campos según el tipo de reporte
 */
function cambiarTipoReporte(tipo) {
    const userGroup = document.getElementById('report-user-group');
    const dateRange = document.getElementById('report-date-range');
    const ministerioGroup = document.getElementById('report-ministerio-group');
    const motivoGroup = document.getElementById('report-motivo').parentElement;
    
    // Resetear visibilidad
    if (userGroup) userGroup.style.display = 'none';
    if (dateRange) dateRange.style.display = 'none';
    if (ministerioGroup) ministerioGroup.style.display = 'none';
    if (motivoGroup) motivoGroup.style.display = 'block';
    
    switch(tipo) {
        case 'usuario':
            if (userGroup) userGroup.style.display = 'block';
            if (motivoGroup) motivoGroup.style.display = 'block';
            break;
        case 'contenido':
            if (userGroup) userGroup.style.display = 'block';
            if (motivoGroup) motivoGroup.style.display = 'block';
            break;
        case 'asistencia':
            if (dateRange) dateRange.style.display = 'grid';
            if (motivoGroup) motivoGroup.style.display = 'none';
            break;
        case 'financiero':
            if (dateRange) dateRange.style.display = 'grid';
            if (motivoGroup) motivoGroup.style.display = 'none';
            break;
        case 'ministerio':
            if (ministerioGroup) ministerioGroup.style.display = 'block';
            if (dateRange) dateRange.style.display = 'grid';
            if (motivoGroup) motivoGroup.style.display = 'none';
            break;
    }
}

/**
 * Busca usuarios para reportar
 */
function buscarUsuarioReporte(query) {
    const resultsContainer = document.getElementById('report-user-results');
    if (!resultsContainer) return;
    
    if (!query || query.length < 2) {
        resultsContainer.classList.add('hidden');
        return;
    }
    
    // Simular búsqueda de usuarios
    const usuarios = [
        { id: 1, nombre: 'Luis Esteban Potosi', email: 'esteban@ipuc.com' },
        { id: 2, nombre: 'Maria Gonzalez', email: 'maria@ipuc.com' },
        { id: 3, nombre: 'Carlos Rodriguez', email: 'carlos@ipuc.com' }
    ];
    
    const resultados = usuarios.filter(u => 
        u.nombre.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    );
    
    if (resultados.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No se encontraron usuarios</p>';
    } else {
        resultsContainer.innerHTML = resultados.map(u => `
            <div class="search-result-item" onclick="seleccionarUsuarioReporte(${u.id}, '${u.nombre}', '${u.email}')">
                <i class="bx bx-user"></i>
                <div>
                    <strong>${u.nombre}</strong>
                    <small>${u.email}</small>
                </div>
            </div>
        `).join('');
    }
    
    resultsContainer.classList.remove('hidden');
}

/**
 * Selecciona un usuario para el reporte
 */
function seleccionarUsuarioReporte(id, nombre, email) {
    const input = document.getElementById('report-user');
    const resultsContainer = document.getElementById('report-user-results');
    
    if (input) {
        input.value = nombre;
        input.setAttribute('data-user-id', id);
        input.setAttribute('data-user-email', email);
    }
    if (resultsContainer) resultsContainer.classList.add('hidden');
}

/**
 * Genera y guarda un nuevo reporte
 */
function generarReporte(e) {
    e.preventDefault();
    
    if (!APP_STATE.usuario) {
        showToast('Debes iniciar sesión para generar reportes', 'warning');
        return;
    }
    
    const tipo = document.querySelector('input[name="report-type"]:checked')?.value || 'usuario';
    const descripcion = document.getElementById('report-descripcion')?.value;
    const urgencia = document.querySelector('input[name="report-urgencia"]:checked')?.value || 'baja';
    
    if (!descripcion || !descripcion.trim()) {
        showToast('La descripción es obligatoria', 'warning');
        return;
    }
    
    // Construir objeto de reporte
    const reporte = {
        id: generarId(),
        tipo: tipo,
        reportado_por: {
            id: APP_STATE.usuario.id,
            nombre: APP_STATE.usuario.nombre,
            email: APP_STATE.usuario.correo
        },
        descripcion: descripcion.trim(),
        urgencia: urgencia,
        estado: 'pendiente',
        fecha: new Date().toISOString(),
        fecha_resolucion: null,
        notas_admin: '',
        historial: [{
            estado: 'pendiente',
            fecha: new Date().toISOString(),
            usuario: APP_STATE.usuario.nombre,
            comentario: 'Reporte creado'
        }]
    };
    
    // Agregar datos específicos según tipo
    switch(tipo) {
        case 'usuario':
        case 'contenido':
            const userInput = document.getElementById('report-user');
            reporte.usuario_reportado = {
                id: userInput?.getAttribute('data-user-id'),
                nombre: userInput?.value,
                email: userInput?.getAttribute('data-user-email')
            };
            reporte.motivo = document.getElementById('report-motivo')?.value;
            break;
        case 'asistencia':
        case 'financiero':
            reporte.fecha_desde = document.getElementById('report-date-from')?.value;
            reporte.fecha_hasta = document.getElementById('report-date-to')?.value;
            break;
        case 'ministerio':
            reporte.ministerio = document.getElementById('report-ministerio')?.value;
            reporte.fecha_desde = document.getElementById('report-date-from')?.value;
            reporte.fecha_hasta = document.getElementById('report-date-to')?.value;
            break;
    }
    
    // Guardar reporte
    APP_STATE.reportes.unshift(reporte);
    localStorage.setItem(CONFIG.STORAGE_KEYS.REPORTES, JSON.stringify(APP_STATE.reportes));
    
    // Actualizar contadores
    actualizarBadgeReportes();
    
    // Agregar notificación
    agregarNotificacion(
        'reporte_creado',
        'Reporte generado exitosamente',
        `Tu reporte #${reporte.id.substring(0, 8)} ha sido registrado.`
    );
    
    // Cerrar modal y mostrar confirmación
    cerrarModalReporte();
    showToast('✅ Reporte generado exitosamente', 'success');
    
    // Recargar página actual si es gestión de reportes
    if (APP_STATE.currentPage === 'gestion-reportes') {
        navegarA('gestion-reportes');
    }
}

/**
 * Carga la página de gestión de reportes (admin)
 */
function cargarGestionReportes(container) {
    if (!container) container = document.getElementById('page-content');
    if (!container) return;
    
    APP_STATE.reportes = cargarArray(CONFIG.STORAGE_KEYS.REPORTES);
    
    // Filtros
    const filtroEstado = '<select id="filtro-estado-reportes" onchange="filtrarReportes()">' +
        '<option value="todos">Todos los estados</option>' +
        '<option value="pendiente">Pendientes</option>' +
        '<option value="en_revision">En Revisión</option>' +
        '<option value="resuelto">Resueltos</option>' +
        '<option value="desestimado">Desestimados</option>' +
        '</select>';
    
    const filtroTipo = '<select id="filtro-tipo-reportes" onchange="filtrarReportes()">' +
        '<option value="todos">Todos los tipos</option>' +
        '<option value="usuario">Usuarios</option>' +
        '<option value="contenido">Contenido</option>' +
        '<option value="asistencia">Asistencia</option>' +
        '<option value="financiero">Financiero</option>' +
        '<option value="ministerio">Ministerios</option>' +
        '</select>';
    
    container.innerHTML = `
        <div class="fade-in">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
                <h2><i class="bx bx-file"></i> Gestión de Reportes</h2>
                <div style="display:flex;gap:8px;">
                    <button class="btn-primary btn-sm" onclick="abrirModalReporte()">
                        <i class="bx bx-plus"></i> Nuevo Reporte
                    </button>
                </div>
            </div>
            
            <!-- Filtros -->
            <div class="card" style="margin-bottom:16px;">
                <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
                    <div>
                        <label style="font-size:0.8rem;">Estado:</label>
                        ${filtroEstado}
                    </div>
                    <div>
                        <label style="font-size:0.8rem;">Tipo:</label>
                        ${filtroTipo}
                    </div>
                    <div>
                        <label style="font-size:0.8rem;">Urgencia:</label>
                        <select id="filtro-urgencia-reportes" onchange="filtrarReportes()">
                            <option value="todos">Todas</option>
                            <option value="critica">Crítica</option>
                            <option value="alta">Alta</option>
                            <option value="media">Media</option>
                            <option value="baja">Baja</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Estadísticas rápidas -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:16px;">
                ${crearStatCard('Pendientes', APP_STATE.reportes.filter(r => r.estado === 'pendiente').length, 'warning')}
                ${crearStatCard('En Revisión', APP_STATE.reportes.filter(r => r.estado === 'en_revision').length, 'info')}
                ${crearStatCard('Resueltos', APP_STATE.reportes.filter(r => r.estado === 'resuelto').length, 'success')}
                ${crearStatCard('Total', APP_STATE.reportes.length, 'primary')}
            </div>
            
            <!-- Lista de reportes -->
            <div id="lista-reportes-admin">
                ${renderizarListaReportes(APP_STATE.reportes)}
            </div>
        </div>
    `;
}

/**
 * Crea una tarjeta de estadística
 */
function crearStatCard(titulo, valor, tipo) {
    const colores = {
        primary: 'var(--azul-primario)',
        success: 'var(--exito)',
        warning: 'var(--advertencia)',
        info: 'var(--info)',
        danger: 'var(--error)'
    };
    return `
        <div class="card" style="text-align:center;border-left:4px solid ${colores[tipo] || colores.primary};">
            <p style="font-size:1.5rem;font-weight:700;color:${colores[tipo] || colores.primary};">${valor}</p>
            <p style="font-size:0.75rem;color:var(--gris-texto);">${titulo}</p>
        </div>
    `;
}

/**
 * Renderiza la lista de reportes con filtros
 */
function renderizarListaReportes(reportes) {
    if (!reportes || reportes.length === 0) {
        return `
            <div class="card" style="text-align:center;padding:40px;">
                <i class="bx bx-file-blank" style="font-size:3rem;color:var(--gris-medio);"></i>
                <p style="margin-top:12px;color:var(--gris-texto);">No hay reportes registrados</p>
            </div>
        `;
    }
    
    return reportes.map(reporte => {
        const urgenciaClass = `urgencia-${reporte.urgencia || 'baja'}`;
        const estadoClass = `estado-${reporte.estado || 'pendiente'}`;
        
        return `
            <div class="card reporte-card" style="margin-bottom:12px;border-left:4px solid ${getColorUrgencia(reporte.urgencia)};">
                <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;">
                    <div style="flex:1;">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                            <span class="badge ${urgenciaClass}">${(reporte.urgencia || 'baja').toUpperCase()}</span>
                            <span class="badge ${estadoClass}">${(reporte.estado || 'pendiente').replace('_', ' ').toUpperCase()}</span>
                            <span class="badge tipo-${reporte.tipo}">${reporte.tipo.toUpperCase()}</span>
                        </div>
                        <p style="font-size:0.9rem;margin:4px 0;">${escapeHtml(reporte.descripcion?.substring(0, 150) || 'Sin descripción')}${(reporte.descripcion?.length > 150) ? '...' : ''}</p>
                        <div style="display:flex;gap:12px;font-size:0.75rem;color:var(--gris-texto);">
                            <span><i class="bx bx-user"></i> Reportado por: ${reporte.reportado_por?.nombre || 'Anónimo'}</span>
                            <span><i class="bx bx-calendar"></i> ${formatearFecha(reporte.fecha)}</span>
                            ${reporte.usuario_reportado ? `<span><i class="bx bx-user-voice"></i> Reportado: ${reporte.usuario_reportado.nombre}</span>` : ''}
                        </div>
                    </div>
                    <div style="display:flex;gap:4px;">
                        <button class="btn-primary btn-sm" onclick="verDetalleReporte('${reporte.id}')" title="Ver detalle">
                            <i class="bx bx-show"></i>
                        </button>
                        ${reporte.estado === 'pendiente' ? `
                            <button class="btn-success btn-sm" onclick="cambiarEstadoReporte('${reporte.id}', 'en_revision')" title="Revisar">
                                <i class="bx bx-check"></i>
                            </button>
                        ` : ''}
                        ${reporte.estado === 'en_revision' ? `
                            <button class="btn-success btn-sm" onclick="cambiarEstadoReporte('${reporte.id}', 'resuelto')" title="Resolver">
                                <i class="bx bx-check-double"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Obtiene el color según la urgencia
 */
function getColorUrgencia(urgencia) {
    const colores = {
        critica: 'var(--error)',
        alta: 'var(--advertencia)',
        media: 'var(--info)',
        baja: 'var(--exito)'
    };
    return colores[urgencia] || 'var(--gris-medio)';
}

/**
 * Filtra los reportes según los criterios seleccionados
 */
function filtrarReportes() {
    const estado = document.getElementById('filtro-estado-reportes')?.value || 'todos';
    const tipo = document.getElementById('filtro-tipo-reportes')?.value || 'todos';
    const urgencia = document.getElementById('filtro-urgencia-reportes')?.value || 'todos';
    
    let reportesFiltrados = [...APP_STATE.reportes];
    
    if (estado !== 'todos') {
        reportesFiltrados = reportesFiltrados.filter(r => r.estado === estado);
    }
    if (tipo !== 'todos') {
        reportesFiltrados = reportesFiltrados.filter(r => r.tipo === tipo);
    }
    if (urgencia !== 'todos') {
        reportesFiltrados = reportesFiltrados.filter(r => r.urgencia === urgencia);
    }
    
    const container = document.getElementById('lista-reportes-admin');
    if (container) {
        container.innerHTML = renderizarListaReportes(reportesFiltrados);
    }
}

/**
 * Muestra el detalle completo de un reporte
 */
function verDetalleReporte(id) {
    const reporte = APP_STATE.reportes.find(r => r.id === id);
    if (!reporte) {
        showToast('Reporte no encontrado', 'error');
        return;
    }
    
    const modal = document.getElementById('view-report-modal');
    const body = document.getElementById('view-report-body');
    const footer = document.getElementById('view-report-footer');
    const title = document.getElementById('view-report-title');
    
    if (!modal || !body) return;
    
    title.innerHTML = `<i class="bx bx-file"></i> Reporte #${id.substring(0, 8)}`;
    
    body.innerHTML = `
        <div class="reporte-detalle">
            <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
                <span class="badge urgencia-${reporte.urgencia || 'baja'}">${(reporte.urgencia || 'baja').toUpperCase()}</span>
                <span class="badge estado-${reporte.estado || 'pendiente'}">${(reporte.estado || 'pendiente').replace('_', ' ').toUpperCase()}</span>
                <span class="badge tipo-${reporte.tipo}">${reporte.tipo.toUpperCase()}</span>
            </div>
            
            <div class="form-section">
                <h4><i class="bx bx-info-circle"></i> Información General</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                        <strong>Reportado por:</strong>
                        <p>${reporte.reportado_por?.nombre || 'Anónimo'}</p>
                        <small>${reporte.reportado_por?.email || ''}</small>
                    </div>
                    <div>
                        <strong>Fecha:</strong>
                        <p>${formatearFecha(reporte.fecha)}</p>
                    </div>
                </div>
                ${reporte.usuario_reportado ? `
                    <div style="margin-top:12px;">
                        <strong>Usuario Reportado:</strong>
                        <p>${reporte.usuario_reportado.nombre} (${reporte.usuario_reportado.email})</p>
                    </div>
                ` : ''}
                ${reporte.motivo ? `
                    <div style="margin-top:12px;">
                        <strong>Motivo:</strong>
                        <p>${reporte.motivo}</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="form-section">
                <h4><i class="bx bx-detail"></i> Descripción</h4>
                <p style="white-space:pre-wrap;">${escapeHtml(reporte.descripcion || 'Sin descripción')}</p>
            </div>
            
            ${reporte.fecha_desde ? `
                <div class="form-section">
                    <h4><i class="bx bx-calendar"></i> Período</h4>
                    <p>Desde: ${reporte.fecha_desde} Hasta: ${reporte.fecha_hasta || 'Actual'}</p>
                </div>
            ` : ''}
            
            <div class="form-section">
                <h4><i class="bx bx-history"></i> Historial de Cambios</h4>
                <div class="historial-cambios">
                    ${(reporte.historial || []).map(h => `
                        <div style="padding:8px;border-bottom:1px solid var(--gris-medio);">
                            <strong>${h.estado.replace('_', ' ')}</strong>
                            <small style="color:var(--gris-texto);">por ${h.usuario} - ${formatearFecha(h.fecha)}</small>
                            ${h.comentario ? `<p style="font-size:0.85rem;">${h.comentario}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    // Footer con acciones
    footer.innerHTML = `
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${reporte.estado === 'pendiente' ? `
                <button class="btn-primary btn-sm" onclick="cambiarEstadoReporte('${reporte.id}', 'en_revision')">
                    <i class="bx bx-check"></i> Marcar en Revisión
                </button>
            ` : ''}
            ${reporte.estado === 'en_revision' ? `
                <button class="btn-success btn-sm" onclick="cambiarEstadoReporte('${reporte.id}', 'resuelto')">
                    <i class="bx bx-check-double"></i> Marcar Resuelto
                </button>
            ` : ''}
            ${reporte.estado !== 'desestimado' ? `
                <button class="btn-danger btn-sm" onclick="cambiarEstadoReporte('${reporte.id}', 'desestimado')">
                    <i class="bx bx-x"></i> Desestimar
                </button>
            ` : ''}
            <button class="btn-secondary btn-sm" onclick="document.getElementById('view-report-modal').classList.add('hidden')">
                <i class="bx bx-x"></i> Cerrar
            </button>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

/**
 * Cambia el estado de un reporte
 */
function cambiarEstadoReporte(id, nuevoEstado) {
    const reporte = APP_STATE.reportes.find(r => r.id === id);
    if (!reporte) return;
    
    const estadoAnterior = reporte.estado;
    reporte.estado = nuevoEstado;
    
    if (nuevoEstado === 'resuelto' || nuevoEstado === 'desestimado') {
        reporte.fecha_resolucion = new Date().toISOString();
    }
    
    // Agregar al historial
    if (!reporte.historial) reporte.historial = [];
    reporte.historial.push({
        estado: nuevoEstado,
        fecha: new Date().toISOString(),
        usuario: APP_STATE.usuario?.nombre || 'Admin',
        comentario: `Cambio de estado: ${estadoAnterior} → ${nuevoEstado}`
    });
    
    // Guardar cambios
    localStorage.setItem(CONFIG.STORAGE_KEYS.REPORTES, JSON.stringify(APP_STATE.reportes));
    actualizarBadgeReportes();
    
    showToast(`Reporte ${nuevoEstado.replace('_', ' ')}`, 'success');
    
    // Actualizar vista
    verDetalleReporte(id);
    if (APP_STATE.currentPage === 'gestion-reportes') {
        cargarGestionReportes();
    }
}

/**
 * Actualiza el badge de reportes pendientes
 */
function actualizarBadgeReportes() {
    APP_STATE.reportes = cargarArray(CONFIG.STORAGE_KEYS.REPORTES);
    APP_STATE.reportsPendientes = APP_STATE.reportes.filter(r => r.estado === 'pendiente').length;
    
    // Actualizar badge en cabecera
    const badgeHeader = document.getElementById('reports-badge');
    if (badgeHeader) {
        badgeHeader.textContent = APP_STATE.reportsPendientes;
        badgeHeader.classList.toggle('hidden', APP_STATE.reportsPendientes === 0);
    }
    
    // Actualizar contador en sidebar
    const pendingReports = document.getElementById('pending-reports');
    if (pendingReports) {
        pendingReports.textContent = APP_STATE.reportsPendientes;
        pendingReports.classList.toggle('hidden', APP_STATE.reportsPendientes === 0);
    }
}

/**
 * Carga los reportes recientes en el panel rápido
 */
function cargarReportesRecientes() {
    const container = document.getElementById('recent-reports-list');
    if (!container) return;
    
    const recientes = APP_STATE.reportes.slice(0, 5);
    
    if (recientes.length === 0) {
        container.innerHTML = `
            <div class="report-empty">
                <i class="bx bx-file-blank"></i>
                <p>No hay reportes recientes</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recientes.map(r => `
        <div class="reporte-mini" onclick="verDetalleReporte('${r.id}')" style="cursor:pointer;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="badge tipo-${r.tipo}">${r.tipo}</span>
                <span class="badge estado-${r.estado}">${r.estado}</span>
            </div>
            <p style="font-size:0.8rem;margin:4px 0;">${r.descripcion?.substring(0, 60) || 'Sin descripción'}...</p>
            <small style="color:var(--gris-texto);">${formatearFechaCorta(r.fecha)}</small>
        </div>
    `).join('');
}

/**
 * Agrega una notificación al sistema
 */
function agregarNotificacion(tipo, titulo, mensaje) {
    if (!Array.isArray(APP_STATE.notificaciones)) APP_STATE.notificaciones = [];
    
    const notificacion = {
        id: generarId(),
        tipo: tipo,
        titulo: titulo,
        mensaje: mensaje,
        fecha: new Date().toISOString(),
        leida: false
    };
    
    APP_STATE.notificaciones.unshift(notificacion);
    APP_STATE.notificacionesNoLeidas = APP_STATE.notificaciones.filter(n => !n.leida).length;
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.NOTIFICACIONES, JSON.stringify(APP_STATE.notificaciones));
    
    // Actualizar badge de notificaciones
    const badge = document.querySelector('.badge-notifications');
    if (badge) {
        badge.textContent = APP_STATE.notificacionesNoLeidas;
        badge.classList.toggle('hidden', APP_STATE.notificacionesNoLeidas === 0);
    }
}

// ============================================
// CARGA DE PÁGINAS PRINCIPALES
// ============================================

/**
 * Carga la página según la ruta
 */
function cargarPagina(page) {
    const container = document.getElementById('page-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="page-loader">
            <div class="spinner"></div>
            <p>Cargando ${CONFIG.TITULOS_PAGINAS[page] || page}...</p>
        </div>
    `;
    
    setTimeout(() => {
        try {
            switch (page) {
                case 'inicio': cargarInicio(container); break;
                case 'horarios': cargarHorarios(container); break;
                case 'asistencia': cargarAsistencia(container); break;
                case 'noticias': cargarNoticias(container); break;
                case 'eventos': cargarEventos(container); break;
                case 'chat': cargarChat(container); break;
                case 'directorio': cargarDirectorio(container); break;
                case 'peticiones': cargarPeticiones(container); break;
                case 'encuestas': cargarEncuestas(container); break;
                case 'biblioteca': cargarBiblioteca(container); break;
                case 'galeria': cargarGaleria(container); break;
                case 'devocional': cargarDevocional(container); break;
                case 'perfil': cargarPerfil(container); break;
                case 'configuracion': cargarConfiguracion(container); break;
                case 'publicaciones': cargarPublicaciones(container); break;
                case 'podcast': cargarPodcast(container); break;
                case 'analytics': cargarAnalytics(container); break;
                case 'dashboard': cargarDashboard(container); break;
                case 'gestion-usuarios': cargarGestionUsuarios(container); break;
                case 'gestion-noticias': cargarGestionNoticias(container); break;
                case 'gestion-eventos': cargarGestionEventos(container); break;
                case 'versiculos': cargarVersiculos(container); break;
                case 'sistema': cargarSistema(container); break;
                case 'seguridad': cargarSeguridad(container); break;
                // NUEVO v18: Páginas de reportes
                case 'gestion-reportes': cargarGestionReportes(container); break;
                case 'mis-reportes': cargarMisReportes(container); break;
                case 'reporte-asistencia': abrirModalReporte(); navegarA('inicio'); break;
                case 'reporte-financiero': abrirModalReporte(); navegarA('inicio'); break;
                case 'reporte-ministerios': abrirModalReporte(); navegarA('inicio'); break;
                case 'reporte-crecimiento': cargarReporteCrecimiento(container); break;
                case 'reporte-moderacion': cargarReporteModeracion(container); break;
                default:
                    container.innerHTML = `
                        <div class="card fade-in">
                            <h2>${CONFIG.TITULOS_PAGINAS[page] || page}</h2>
                            <p style="text-align:center;padding:40px;color:var(--gris-texto);">
                                <i class="bx bx-construction" style="font-size:3rem;display:block;margin-bottom:16px;"></i>
                                Sección en desarrollo
                            </p>
                        </div>
                    `;
            }
        } catch (e) {
            console.error('Error cargando página:', e);
            container.innerHTML = `
                <div class="card fade-in" style="border-left:4px solid var(--error);">
                    <h2>Error al cargar</h2>
                    <p style="text-align:center;padding:20px;color:var(--error);">
                        <i class="bx bx-error-circle" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
                        ${e.message || 'Error desconocido'}
                    </p>
                </div>
            `;
        }
    }, 150);
}

/**
 * Página: Mis Reportes
 */
function cargarMisReportes(container) {
    if (!APP_STATE.usuario) {
        container.innerHTML = `
            <div class="fade-in">
                <div class="card" style="text-align:center;padding:40px;">
                    <i class="bx bx-user-circle" style="font-size:4rem;color:var(--gris-medio);"></i>
                    <h3>Inicia sesión para ver tus reportes</h3>
                </div>
            </div>
        `;
        return;
    }
    
    const misReportes = APP_STATE.reportes.filter(r => 
        r.reportado_por?.id === APP_STATE.usuario.id
    );
    
    container.innerHTML = `
        <div class="fade-in">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
                <h2><i class="bx bx-file"></i> Mis Reportes</h2>
                <button class="btn-primary btn-sm" onclick="abrirModalReporte()">
                    <i class="bx bx-plus"></i> Nuevo Reporte
                </button>
            </div>
            
            ${misReportes.length === 0 ? `
                <div class="card" style="text-align:center;padding:40px;">
                    <i class="bx bx-file-blank" style="font-size:3rem;color:var(--gris-medio);"></i>
                    <p style="margin-top:12px;color:var(--gris-texto);">No has generado ningún reporte</p>
                </div>
            ` : renderizarListaReportes(misReportes)}
        </div>
    `;
}

/**
 * Página: Reporte de Crecimiento
 */
function cargarReporteCrecimiento(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-trending-up"></i> Reporte de Crecimiento</h2>
            <div class="card">
                <h3>Estadísticas de Crecimiento Espiritual</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:16px;">
                    ${crearStatCard('Bautismos', 0, 'info')}
                    ${crearStatCard('Nuevos Miembros', 0, 'success')}
                    ${crearStatCard('Cursos Completados', 0, 'warning')}
                    ${crearStatCard('Mentorías Activas', 0, 'primary')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Página: Reporte de Moderación
 */
function cargarReporteModeracion(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-shield"></i> Reporte de Moderación</h2>
            <div class="card">
                <h3>Actividad de Moderación</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:16px;">
                    ${crearStatCard('Contenido Revisado', 0, 'info')}
                    ${crearStatCard('Advertencias', 0, 'warning')}
                    ${crearStatCard('Suspensiones', 0, 'danger')}
                    ${crearStatCard('Apelaciones', 0, 'primary')}
                </div>
            </div>
        </div>
    `;
}

// ============================================
// FUNCIONES DE ALMACENAMIENTO
// ============================================
function cargarArray(key) {
    try {
        const data = localStorage.getItem(key);
        if (!data) return [];
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function cargarObjeto(key) {
    try {
        const data = localStorage.getItem(key);
        if (!data) return {};
        const parsed = JSON.parse(data);
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
        return {};
    }
}

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 IPUC LA FONDA v' + CONFIG.VERSION + ' - Inicializando...');
    
    // Cargar tema
    const temaGuardado = localStorage.getItem(CONFIG.STORAGE_KEYS.TEMA) || 'light';
    APP_STATE.tema = temaGuardado;
    aplicarTema(temaGuardado);

    // Cargar idioma
    const idiomaGuardado = localStorage.getItem('ipuc18_idioma') || 'es';
    APP_STATE.idioma = idiomaGuardado;
    cambiarIdioma(idiomaGuardado);

    // Cargar datos con validación
    APP_STATE.publicaciones = cargarArray(CONFIG.STORAGE_KEYS.PUBLICACIONES);
    APP_STATE.comentarios = cargarArray(CONFIG.STORAGE_KEYS.COMENTARIOS);
    APP_STATE.reacciones = cargarObjeto(CONFIG.STORAGE_KEYS.REACCIONES);
    APP_STATE.asistencias = cargarArray(CONFIG.STORAGE_KEYS.ASISTENCIAS);
    APP_STATE.eventos = cargarArray(CONFIG.STORAGE_KEYS.EVENTOS);
    APP_STATE.noticias = cargarArray(CONFIG.STORAGE_KEYS.NOTICIAS);
    APP_STATE.peticiones = cargarArray(CONFIG.STORAGE_KEYS.PETICIONES);
    APP_STATE.encuestas = cargarArray(CONFIG.STORAGE_KEYS.ENCUESTAS);
    APP_STATE.biblioteca = cargarArray(CONFIG.STORAGE_KEYS.BIBLIOTECA);
    APP_STATE.galeria = cargarArray(CONFIG.STORAGE_KEYS.GALERIA);
    APP_STATE.podcast = cargarArray(CONFIG.STORAGE_KEYS.PODCAST);
    APP_STATE.chat = cargarArray(CONFIG.STORAGE_KEYS.CHAT);
    APP_STATE.directorio = cargarArray(CONFIG.STORAGE_KEYS.DIRECTORIO);
    
    // NUEVO v18: Cargar reportes
    APP_STATE.reportes = cargarArray(CONFIG.STORAGE_KEYS.REPORTES);
    APP_STATE.reportsPendientes = APP_STATE.reportes.filter(r => r.estado === 'pendiente').length;

    // Verificar sesión
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    const usuarioData = localStorage.getItem(CONFIG.STORAGE_KEYS.USUARIO);
    const rol = localStorage.getItem(CONFIG.STORAGE_KEYS.ROL);

    // Mostrar splash y luego la app
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            splash.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 500);
        }
        
        if (token && usuarioData) {
            try {
                APP_STATE.token = token;
                APP_STATE.usuario = JSON.parse(usuarioData);
                APP_STATE.rol = rol || 'usuario';
                mostrarApp();
                actualizarBadgeReportes();
            } catch (e) {
                console.error('Error al restaurar sesión:', e);
                mostrarBienvenida();
            }
        } else {
            mostrarBienvenida();
        }
    }, 2000);

    // Inicializar event listeners
    inicializarEventListeners();
    manejarResponsiveSidebar();
    
    // Eventos de conexión
    window.addEventListener('resize', manejarResponsiveSidebar);
    window.addEventListener('online', () => {
        APP_STATE.isOnline = true;
        actualizarSidebarUsuario();
        showToast('✅ Conexión restaurada', 'success');
    });
    window.addEventListener('offline', () => {
        APP_STATE.isOnline = false;
        actualizarSidebarUsuario();
        showToast('⚠️ Sin conexión a internet', 'warning');
    });
    
    console.log('✅ IPUC LA FONDA v' + CONFIG.VERSION + ' - Inicialización completa');
    console.log('📊 Sistema de Reportes activo');
    console.log('👤 Usuario:', APP_STATE.usuario?.nombre || 'No autenticado');
    console.log('🔒 Rol:', APP_STATE.rol || 'Ninguno');
});

// ============================================
// INICIALIZACIÓN DE EVENT LISTENERS
// ============================================
function inicializarEventListeners() {
    // Sidebar
    document.getElementById('menu-toggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('close-sidebar')?.addEventListener('click', cerrarSidebar);
    document.getElementById('sidebar-overlay')?.addEventListener('click', cerrarSidebar);

    // Navegación
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navegarA(this.getAttribute('data-page'));
        });
    });

    // Tema
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTema);
    
    // Notificaciones
    document.getElementById('notifications-toggle')?.addEventListener('click', toggleNotificaciones);
    document.getElementById('close-notifications')?.addEventListener('click', () => {
        document.getElementById('notification-panel')?.classList.add('hidden');
        APP_STATE.notificationsOpen = false;
    });

    // NUEVO v18: Panel de reportes
    document.getElementById('reports-quick-toggle')?.addEventListener('click', togglePanelReportes);
    document.getElementById('close-reports-quick')?.addEventListener('click', () => {
        document.getElementById('reports-quick-panel')?.classList.add('hidden');
        APP_STATE.reportsPanelOpen = false;
    });

    // Búsqueda
    document.getElementById('search-toggle')?.addEventListener('click', toggleSearchBar);
    document.getElementById('search-close')?.addEventListener('click', () => {
        document.getElementById('search-bar')?.classList.add('hidden');
        APP_STATE.searchBarOpen = false;
    });

    // Búsqueda de usuarios en reportes
    document.getElementById('report-user')?.addEventListener('input', function() {
        buscarUsuarioReporte(this.value);
    });

    // Cambio de tipo de reporte
    document.querySelectorAll('input[name="report-type"]').forEach(radio => {
        radio.addEventListener('change', function() {
            cambiarTipoReporte(this.value);
        });
    });

    // Formulario de reporte
    document.getElementById('report-form')?.addEventListener('submit', generarReporte);
    document.getElementById('btn-cancel-report')?.addEventListener('click', cerrarModalReporte);

    // Acciones rápidas de reportes
    document.querySelectorAll('.report-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-report');
            switch(action) {
                case 'usuario':
                case 'contenido':
                    abrirModalReporte();
                    document.querySelector(`input[value="${action}"]`).checked = true;
                    cambiarTipoReporte(action);
                    break;
                case 'asistencia':
                    navegarA('reporte-asistencia');
                    break;
                case 'financiero':
                    navegarA('reporte-financiero');
                    break;
            }
            togglePanelReportes();
        });
    });

    // User dropdown
    document.getElementById('user-mini')?.addEventListener('click', toggleUserDropdown);
    
    // FAB
    document.getElementById('fab-main')?.addEventListener('click', toggleFabMenu);
    document.querySelectorAll('.fab-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            switch (action) {
                case 'reporte': abrirModalReporte(); break;
                case 'oracion': navegarA('peticiones'); break;
                case 'musica': navegarA('radio'); break;
                case 'evento': navegarA('eventos'); break;
                case 'donacion': navegarA('donaciones'); break;
                case 'compartir': compartirVersiculo(); break;
            }
            toggleFabMenu();
        });
    });

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', function(e) {
        e.preventDefault();
        confirmarAccion('¿Cerrar sesión?', 'Serás redirigido al inicio.', cerrarSesion, 'danger');
    });

    // Modal
    document.getElementById('modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) cerrarModal();
    });
    document.querySelector('.modal-close')?.addEventListener('click', cerrarModal);

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

    // Cerrar modales con backdrop
    document.getElementById('confirm-modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) {
            this.classList.add('hidden');
            APP_STATE.pendingConfirmation = null;
        }
    });
    document.getElementById('report-modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) cerrarModalReporte();
    });
    document.getElementById('view-report-modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) {
            this.classList.add('hidden');
        }
    });

    // Teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (APP_STATE.notificationsOpen) {
                document.getElementById('notification-panel')?.classList.add('hidden');
                APP_STATE.notificationsOpen = false;
            }
            if (APP_STATE.reportsPanelOpen) {
                document.getElementById('reports-quick-panel')?.classList.add('hidden');
                APP_STATE.reportsPanelOpen = false;
            }
            if (APP_STATE.searchBarOpen) {
                document.getElementById('search-bar')?.classList.add('hidden');
                APP_STATE.searchBarOpen = false;
            }
            if (!document.getElementById('modal')?.classList.contains('hidden')) {
                cerrarModal();
            }
            if (!document.getElementById('report-modal')?.classList.contains('hidden')) {
                cerrarModalReporte();
            }
        }
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            toggleSearchBar();
        }
    });

    // Cerrar dropdowns al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (APP_STATE.userDropdownOpen &&
            !e.target.closest('#user-mini') &&
            !e.target.closest('#user-dropdown')) {
            document.getElementById('user-dropdown')?.classList.add('hidden');
            APP_STATE.userDropdownOpen = false;
        }
        if (APP_STATE.fabMenuOpen &&
            !e.target.closest('#fab-main') &&
            !e.target.closest('#fab-menu')) {
            document.getElementById('fab-menu')?.classList.add('hidden');
            APP_STATE.fabMenuOpen = false;
        }
    });

    // Idioma
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            if (lang) cambiarIdioma(lang);
        });
    });

    // Welcome screen
    document.getElementById('btn-guest')?.addEventListener('click', continuarComoInvitado);
    document.getElementById('btn-login')?.addEventListener('click', mostrarLogin);
    document.getElementById('btn-register')?.addEventListener('click', mostrarRegistro);
    document.getElementById('show-register')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form-container').classList.add('hidden');
        document.getElementById('register-form-container').classList.remove('hidden');
    });
    document.getElementById('show-login')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('register-form-container').classList.add('hidden');
        document.getElementById('login-form-container').classList.remove('hidden');
    });

    // Filtros de notificaciones
    document.querySelectorAll('.notification-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.notification-filters .filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================
function continuarComoInvitado() {
    APP_STATE.rol = 'invitado';
    APP_STATE.token = 'guest_' + Date.now();
    APP_STATE.usuario = {
        id: 0,
        nombre: 'Invitado',
        usuario: 'invitado',
        correo: 'invitado@ipuc.com',
        foto: 'assets/avatars/default.png',
        verificado: false,
        ministerio: 'Visitante'
    };
    actualizarSidebarUsuario();
    mostrarApp();
    showToast('👋 Navegando como invitado', 'info');
}

function cerrarSesion() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USUARIO);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.ROL);
    APP_STATE.token = null;
    APP_STATE.usuario = null;
    APP_STATE.rol = null;
    if (APP_STATE.contadorInterval) clearInterval(APP_STATE.contadorInterval);
    if (APP_STATE.fechaInterval) clearInterval(APP_STATE.fechaInterval);
    document.getElementById('user-dropdown')?.classList.add('hidden');
    APP_STATE.userDropdownOpen = false;
    mostrarBienvenida();
    showToast('👋 Sesión cerrada', 'info');
}

// ============================================
// FUNCIONES DE UTILIDAD ADICIONALES
// ============================================
function compartirVersiculo() {
    const versiculos = [
        { texto: "Porque de tal manera amó Dios al mundo...", referencia: "Juan 3:16" },
        { texto: "Jehová es mi pastor; nada me faltará.", referencia: "Salmos 23:1" },
        { texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13" }
    ];
    const v = versiculos[new Date().getDay() % versiculos.length];
    const texto = `"${v.texto}" - ${v.referencia}`;
    
    if (navigator.share) {
        navigator.share({ title: 'IPUC LA FONDA - Versículo', text: texto })
            .catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(texto)
            .then(() => showToast('📋 Versículo copiado', 'success'))
            .catch(() => showToast('No se pudo copiar', 'error'));
    }
}

// ============================================
// EXPORTAR A WINDOW
// ============================================
window.CONFIG = CONFIG;
window.APP_STATE = APP_STATE;
window.showToast = showToast;
window.navegarA = navegarA;
window.toggleTema = toggleTema;
window.cambiarIdioma = cambiarIdioma;
window.cerrarSesion = cerrarSesion;
window.continuarComoInvitado = continuarComoInvitado;
window.confirmarAccion = confirmarAccion;
window.compartirVersiculo = compartirVersiculo;
window.formatearFecha = formatearFecha;

// NUEVO v18: Exportar funciones de reportes
window.abrirModalReporte = abrirModalReporte;
window.cerrarModalReporte = cerrarModalReporte;
window.cambiarTipoReporte = cambiarTipoReporte;
window.buscarUsuarioReporte = buscarUsuarioReporte;
window.seleccionarUsuarioReporte = seleccionarUsuarioReporte;
window.generarReporte = generarReporte;
window.cargarGestionReportes = cargarGestionReportes;
window.verDetalleReporte = verDetalleReporte;
window.cambiarEstadoReporte = cambiarEstadoReporte;
window.actualizarBadgeReportes = actualizarBadgeReportes;
window.togglePanelReportes = togglePanelReportes;
window.filtrarReportes = filtrarReportes;

// ============================================
// ESTILOS ADICIONALES PARA REPORTES
// ============================================
const reportStyles = document.createElement('style');
reportStyles.textContent = `
    /* Badges de urgencia */
    .urgencia-critica { background: #ff4444; color: white; }
    .urgencia-alta { background: #ff8800; color: white; }
    .urgencia-media { background: #ffbb33; color: #333; }
    .urgencia-baja { background: #00C851; color: white; }
    
    /* Badges de estado */
    .estado-pendiente { background: #ffbb33; color: #333; }
    .estado-en_revision { background: #33b5e5; color: white; }
    .estado-resuelto { background: #00C851; color: white; }
    .estado-desestimado { background: #999; color: white; }
    
    /* Badges de tipo */
    .tipo-usuario { background: #4285f4; color: white; }
    .tipo-contenido { background: #ea4335; color: white; }
    .tipo-asistencia { background: #34a853; color: white; }
    .tipo-financiero { background: #fbbc05; color: #333; }
    .tipo-ministerio { background: #9c27b0; color: white; }
    
    /* Animaciones */
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fadeInUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    .toast { animation: slideInRight 0.3s ease; }
    .toast-hide { animation: slideOutRight 0.3s ease; }
    .fab-menu { animation: fadeInUp 0.3s ease; }
    
    /* Tarjetas de reporte */
    .reporte-card {
        transition: all 0.3s ease;
    }
    .reporte-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    /* Resultados de búsqueda */
    .search-results-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--fondo-card);
        border: 1px solid var(--gris-medio);
        border-radius: 8px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
    }
    .search-result-item {
        padding: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: background 0.2s;
    }
    .search-result-item:hover {
        background: var(--gris-claro);
    }
    
    /* Panel de reportes rápidos */
    .reports-quick-panel {
        position: fixed;
        top: 60px;
        right: 20px;
        width: 350px;
        max-width: 90vw;
        background: var(--fondo-card);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 1001;
        animation: fadeInUp 0.3s ease;
    }
    
    /* Modal de reporte */
    .report-type-selector {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 8px;
    }
    .report-type-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        border: 2px solid var(--gris-medio);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
    }
    .report-type-option:hover {
        border-color: var(--azul-primario);
        background: var(--azul-surface);
    }
    .report-type-option input[type="radio"]:checked + i + span {
        color: var(--azul-primario);
        font-weight: 600;
    }
    
    /* Selector de urgencia */
    .urgency-selector {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }
    .urgency-option {
        cursor: pointer;
    }
    .urgency-badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s;
    }
    .urgency-option input[type="radio"]:checked + .urgency-badge {
        transform: scale(1.1);
        font-weight: 600;
    }
`;
document.head.appendChild(reportStyles);

console.log('✅ IPUC LA FONDA v18.0 PRO ULTIMATE - Cargado completamente');
console.log('📊 Sistema de Reportes integrado y funcional');
console.log('🔒 Sistema de autenticación activo');
