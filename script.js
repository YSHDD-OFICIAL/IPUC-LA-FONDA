// ============================================
// IPUC LA FONDA - SCRIPT.JS v18.0 PRO ULTIMATE
// Web App Profesional - Sistema Completo
// Incluye: Reportes, Administración, Comunidad
// VERSIÓN ESTABLE - SIN ERRORES
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
        IDIOMA: 'ipuc18_idioma',
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
        REPORTES: 'ipuc18_reportes'
    },
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
        'gestion-reportes': 'Gestión de Reportes',
        'mis-reportes': 'Mis Reportes',
        'versiculos': 'Versículos Diarios',
        'sistema': 'Configuración del Sistema',
        'seguridad': 'Seguridad',
        'radio': 'Radio 24/7',
        'donaciones': 'Donaciones'
    },
    REACCIONES_TIPOS: [
        { icono: 'bx bxs-hands', nombre: 'Amén', clave: 'amen' },
        { icono: 'bx bxs-heart', nombre: 'Me gusta', clave: 'me_gusta' },
        { icono: 'bx bxs-fire', nombre: 'Fuego', clave: 'fuego' },
        { icono: 'bx bxs-pray', nombre: 'Orando', clave: 'orando' },
        { icono: 'bx bxs-star', nombre: 'Bendición', clave: 'bendicion' }
    ]
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
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    idioma: 'es'
};

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function cargarArray(key) {
    try {
        if (!key || typeof key !== 'string') return [];
        const data = localStorage.getItem(key);
        if (!data || data === 'null' || data === 'undefined' || data === '') return [];
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            for (const val of Object.values(parsed)) {
                if (Array.isArray(val)) return val;
            }
            return [];
        }
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function cargarObjeto(key) {
    try {
        if (!key || typeof key !== 'string') return {};
        const data = localStorage.getItem(key);
        if (!data || data === 'null' || data === 'undefined' || data === '') return {};
        const parsed = JSON.parse(data);
        return (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) ? parsed : {};
    } catch (e) {
        return {};
    }
}

function getDB() {
    try {
        if (typeof window !== 'undefined' && window.db && typeof window.db.cargar === 'function') {
            return window.db;
        }
        return null;
    } catch (e) {
        return null;
    }
}

function generarId() {
    return 'rpt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

function escapeHtml(texto) {
    if (!texto || typeof texto !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

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
        return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return 'Fecha inválida';
    }
}

// ============================================
// FUNCIONES DE UI
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
    toast.innerHTML = '<i class="' + (iconos[tipo] || 'bx bxs-info-circle') + '"></i><span>' + (mensaje || '') + '</span>';
    container.appendChild(toast);
    
    setTimeout(function() {
        if (toast && toast.parentNode) {
            toast.classList.add('toast-hide');
            setTimeout(function() { 
                if (toast && toast.parentNode) toast.remove(); 
            }, 300);
        }
    }, duracion);
}

function toggleTema() {
    APP_STATE.tema = APP_STATE.tema === 'light' ? 'dark' : 'light';
    aplicarTema(APP_STATE.tema);
    try { localStorage.setItem('ipuc18_tema', APP_STATE.tema); } catch (e) {}
}

function aplicarTema(t) {
    try {
        document.documentElement.setAttribute('data-theme', t);
        const icon = document.querySelector('#theme-toggle i');
        if (icon) icon.className = t === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = t === 'dark' ? '#1a1a2e' : '#1a237e';
    } catch (e) {}
}

function cambiarIdioma(lang) {
    const idiomas = { es: 'ES', en: 'EN', pt: 'PT', fr: 'FR', de: 'DE', it: 'IT' };
    if (!idiomas[lang]) return;
    APP_STATE.idioma = lang;
    try { localStorage.setItem('ipuc18_idioma', lang); } catch (e) {}
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
}

// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================

function navegarA(page) {
    if (!page || APP_STATE.isLoading) return;
    APP_STATE.currentPage = page;
    APP_STATE.isLoading = true;
    
    document.querySelectorAll('.nav-item[data-page]').forEach(function(el) {
        el.classList.toggle('active', el.getAttribute('data-page') === page);
    });
    
    const titulo = (CONFIG.TITULOS_PAGINAS && CONFIG.TITULOS_PAGINAS[page]) || page;
    const titleEl = document.getElementById('page-title');
    const breadcrumb = document.getElementById('breadcrumb-current');
    if (titleEl) titleEl.textContent = titulo;
    if (breadcrumb) breadcrumb.textContent = titulo;
    
    cargarPagina(page);
    if (window.innerWidth < 1024) cerrarSidebar();
    APP_STATE.isLoading = false;
}

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

function actualizarSidebarUsuario() {
    if (!APP_STATE.usuario) return;
    const mini = document.getElementById('user-mini');
    if (!mini) return;
    
    const img = mini.querySelector('img');
    const name = mini.querySelector('.user-name');
    const role = mini.querySelector('.user-role');
    const status = mini.querySelector('.user-status');
    
    if (img) img.src = (APP_STATE.usuario.foto) || 'assets/avatars/default.png';
    if (name) name.textContent = (APP_STATE.usuario.nombre) || 'Usuario';
    if (role) {
        const roles = { admin: 'Administrador', invitado: 'Invitado', usuario: 'Miembro' };
        role.textContent = roles[APP_STATE.rol] || 'Miembro';
    }
    if (status) status.className = 'user-status ' + (APP_STATE.isOnline ? 'online' : 'offline');
    
    const adminMenu = document.getElementById('admin-menu');
    if (adminMenu) adminMenu.classList.toggle('hidden', APP_STATE.rol !== 'admin');
}

// ============================================
// TOGGLES DE PANELES
// ============================================

function toggleSearchBar() {
    APP_STATE.searchBarOpen = !APP_STATE.searchBarOpen;
    const bar = document.getElementById('search-bar');
    if (bar) {
        bar.classList.toggle('hidden', !APP_STATE.searchBarOpen);
        if (APP_STATE.searchBarOpen) {
            const input = document.getElementById('global-search-input');
            if (input) setTimeout(function() { input.focus(); }, 100);
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

function togglePanelReportes() {
    APP_STATE.reportsPanelOpen = !APP_STATE.reportsPanelOpen;
    const panel = document.getElementById('reports-quick-panel');
    if (panel) {
        panel.classList.toggle('hidden', !APP_STATE.reportsPanelOpen);
        if (APP_STATE.reportsPanelOpen) cargarReportesRecientes();
    }
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
    if (titleEl) titleEl.textContent = titulo || '¿Estás seguro?';
    if (msgEl) msgEl.textContent = mensaje || '';
    
    const acceptBtn = document.getElementById('confirm-accept');
    if (acceptBtn) acceptBtn.className = tipo === 'danger' ? 'btn-danger' : 'btn-primary';
    
    APP_STATE.pendingConfirmation = callback;
    modal.classList.remove('hidden');
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
    try {
        localStorage.removeItem('ipuc18_token');
        localStorage.removeItem('ipuc18_usuario');
        localStorage.removeItem('ipuc18_rol');
    } catch (e) {}
    
    APP_STATE.token = null;
    APP_STATE.usuario = null;
    APP_STATE.rol = null;
    
    if (APP_STATE.contadorInterval) clearInterval(APP_STATE.contadorInterval);
    if (APP_STATE.fechaInterval) clearInterval(APP_STATE.fechaInterval);
    
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
    APP_STATE.userDropdownOpen = false;
    
    mostrarBienvenida();
    showToast('👋 Sesión cerrada', 'info');
}

// ============================================
// CONTADOR Y FECHA
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
    const e = document.getElementById('contador-estado');
    if (!d && !h) return;
    
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
        if (fe) fe.textContent = a.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (ho) ho.textContent = a.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (_) {}
}

// ============================================
// FUNCIONES DE REPORTES
// ============================================

function abrirModalReporte() {
    const modal = document.getElementById('report-modal');
    if (!modal) return;
    
    const title = document.getElementById('report-modal-title');
    if (title) title.innerHTML = '<i class="bx bx-file"></i> Generar Nuevo Reporte';
    
    const form = document.getElementById('report-form');
    if (form) form.reset();
    
    cambiarTipoReporte('usuario');
    modal.classList.remove('hidden');
}

function cerrarModalReporte() {
    const modal = document.getElementById('report-modal');
    if (modal) modal.classList.add('hidden');
}

function cambiarTipoReporte(tipo) {
    const userGroup = document.getElementById('report-user-group');
    const dateRange = document.getElementById('report-date-range');
    const ministerioGroup = document.getElementById('report-ministerio-group');
    
    if (userGroup) userGroup.style.display = 'none';
    if (dateRange) dateRange.style.display = 'none';
    if (ministerioGroup) ministerioGroup.style.display = 'none';
    
    switch(tipo) {
        case 'usuario':
        case 'contenido':
            if (userGroup) userGroup.style.display = 'block';
            break;
        case 'asistencia':
        case 'financiero':
            if (dateRange) dateRange.style.display = 'grid';
            break;
        case 'ministerio':
            if (ministerioGroup) ministerioGroup.style.display = 'block';
            if (dateRange) dateRange.style.display = 'grid';
            break;
    }
}

function buscarUsuarioReporte(query) {
    const resultsContainer = document.getElementById('report-user-results');
    if (!resultsContainer) return;
    
    if (!query || query.length < 2) {
        resultsContainer.classList.add('hidden');
        return;
    }
    
    const db = getDB();
    let usuarios = [];
    if (db) {
        const data = db.cargar('usuarios');
        usuarios = (data && data.usuarios) ? data.usuarios : [];
    }
    
    const resultados = usuarios.filter(u => 
        (u.nombre && u.nombre.toLowerCase().includes(query.toLowerCase())) ||
        (u.correo && u.correo.toLowerCase().includes(query.toLowerCase()))
    );
    
    if (resultados.length === 0) {
        resultsContainer.innerHTML = '<p style="padding:12px;text-align:center;color:var(--gris-texto);">No se encontraron usuarios</p>';
    } else {
        resultsContainer.innerHTML = resultados.slice(0, 5).map(u => `
            <div onclick="seleccionarUsuarioReporte('${u.id}', '${escapeHtml(u.nombre || '')}', '${escapeHtml(u.correo || '')}')" style="padding:10px;cursor:pointer;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--gris-medio);">
                <i class="bx bx-user"></i>
                <div>
                    <strong>${escapeHtml(u.nombre || 'Sin nombre')}</strong>
                    <small style="display:block;color:var(--gris-texto);">${escapeHtml(u.correo || '')}</small>
                </div>
            </div>
        `).join('');
    }
    
    resultsContainer.classList.remove('hidden');
}

function seleccionarUsuarioReporte(id, nombre, correo) {
    const input = document.getElementById('report-user');
    const resultsContainer = document.getElementById('report-user-results');
    
    if (input) {
        input.value = nombre;
        input.setAttribute('data-user-id', id);
        input.setAttribute('data-user-email', correo);
    }
    if (resultsContainer) resultsContainer.classList.add('hidden');
}

function generarReporte(e) {
    if (e) e.preventDefault();
    
    if (!APP_STATE.usuario) {
        showToast('Debes iniciar sesión para generar reportes', 'warning');
        return;
    }
    
    const tipo = document.querySelector('input[name="report-type"]:checked')?.value || 'usuario';
    const descripcion = document.getElementById('report-descripcion')?.value;
    const urgencia = document.querySelector('input[name="report-urgencia"]:checked')?.value || 'baja';
    const motivo = document.getElementById('report-motivo')?.value || '';
    
    if (!descripcion || !descripcion.trim()) {
        showToast('La descripción es obligatoria', 'warning');
        return;
    }
    
    const reporte = {
        id: generarId(),
        tipo: tipo,
        reportado_por: {
            id: APP_STATE.usuario.id || 0,
            nombre: APP_STATE.usuario.nombre || 'Anónimo',
            email: APP_STATE.usuario.correo || ''
        },
        descripcion: descripcion.trim(),
        motivo: motivo,
        urgencia: urgencia,
        estado: 'pendiente',
        fecha: new Date().toISOString(),
        fecha_resolucion: null,
        notas_admin: '',
        historial: [{
            estado: 'pendiente',
            fecha: new Date().toISOString(),
            usuario: APP_STATE.usuario.nombre || 'Usuario',
            comentario: 'Reporte creado'
        }]
    };
    
    if (tipo === 'usuario' || tipo === 'contenido') {
        const userInput = document.getElementById('report-user');
        reporte.usuario_reportado = {
            id: userInput?.getAttribute('data-user-id') || '',
            nombre: userInput?.value || '',
            email: userInput?.getAttribute('data-user-email') || ''
        };
    }
    
    if (tipo === 'asistencia' || tipo === 'financiero' || tipo === 'ministerio') {
        reporte.fecha_desde = document.getElementById('report-date-from')?.value || '';
        reporte.fecha_hasta = document.getElementById('report-date-to')?.value || '';
    }
    
    if (tipo === 'ministerio') {
        reporte.ministerio = document.getElementById('report-ministerio')?.value || '';
    }
    
    APP_STATE.reportes.unshift(reporte);
    
    try {
        const db = getDB();
        if (db) {
            db.addReporte(reporte);
        } else {
            const reportesGuardados = cargarArray('ipuc18_reportes');
            reportesGuardados.unshift(reporte);
            try {
                localStorage.setItem('ipuc18_reportes', JSON.stringify({ reportes: reportesGuardados.slice(0, 100), ultimo_id: reportesGuardados.length }));
            } catch (e) {}
        }
    } catch (err) {}
    
    actualizarBadgeReportes();
    cerrarModalReporte();
    showToast('✅ Reporte generado exitosamente', 'success');
    
    if (APP_STATE.currentPage === 'gestion-reportes') {
        navegarA('gestion-reportes');
    }
}

function actualizarBadgeReportes() {
    APP_STATE.reportsPendientes = APP_STATE.reportes.filter(function(r) { 
        return r && r.estado === 'pendiente'; 
    }).length;
    
    const badgeHeader = document.getElementById('reports-badge');
    if (badgeHeader) {
        badgeHeader.textContent = APP_STATE.reportsPendientes;
        badgeHeader.classList.toggle('hidden', APP_STATE.reportsPendientes === 0);
    }
    
    const pendingReports = document.getElementById('pending-reports');
    if (pendingReports) {
        pendingReports.textContent = APP_STATE.reportsPendientes;
        pendingReports.classList.toggle('hidden', APP_STATE.reportsPendientes === 0);
    }
}

function verDetalleReporte(id) {
    const reporte = APP_STATE.reportes.find(function(r) { return r.id === id; });
    if (!reporte) {
        showToast('Reporte no encontrado', 'error');
        return;
    }
    showToast('Viendo reporte #' + id.substring(0, 8), 'info');
}

function cambiarEstadoReporte(id, nuevoEstado) {
    const reporte = APP_STATE.reportes.find(function(r) { return r.id === id; });
    if (!reporte) return;
    
    reporte.estado = nuevoEstado;
    if (nuevoEstado === 'resuelto' || nuevoEstado === 'desestimado') {
        reporte.fecha_resolucion = new Date().toISOString();
    }
    if (!reporte.historial) reporte.historial = [];
    reporte.historial.push({
        estado: nuevoEstado,
        fecha: new Date().toISOString(),
        usuario: APP_STATE.usuario?.nombre || 'Admin',
        comentario: 'Estado actualizado'
    });
    
    try {
        const db = getDB();
        if (db) db.cambiarEstadoReporte(id, nuevoEstado);
    } catch (e) {}
    
    actualizarBadgeReportes();
    showToast('✅ Estado actualizado', 'success');
}

function filtrarReportes() {
    if (APP_STATE.currentPage === 'gestion-reportes') {
        navegarA('gestion-reportes');
    }
}

function cargarReportesRecientes() {
    const container = document.getElementById('recent-reports-list');
    if (!container) return;
    
    const recientes = APP_STATE.reportes.slice(0, 5);
    
    if (recientes.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--gris-texto);"><i class="bx bx-file-blank" style="font-size:2rem;"></i><p>No hay reportes recientes</p></div>';
        return;
    }
    
    container.innerHTML = recientes.map(function(r) {
        const tipoLabel = r.tipo || 'general';
        const estadoLabel = r.estado || 'pendiente';
        return '<div style="padding:8px;border:1px solid var(--gris-medio);border-radius:8px;margin-bottom:6px;cursor:pointer;" onclick="verDetalleReporte(\'' + r.id + '\')">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
                '<span class="badge tipo-' + tipoLabel + '">' + tipoLabel + '</span>' +
                '<span class="badge estado-' + estadoLabel + '">' + estadoLabel + '</span>' +
            '</div>' +
            '<p style="font-size:0.8rem;">' + escapeHtml((r.descripcion || '').substring(0, 60)) + '...</p>' +
            '<small style="color:var(--gris-texto);">' + formatearFecha(r.fecha) + '</small>' +
        '</div>';
    }).join('');
}

// ============================================
// CARGA DE PÁGINAS
// ============================================

function cargarPagina(page) {
    const container = document.getElementById('page-content');
    if (!container) return;
    
    container.innerHTML = '<div class="page-loader"><div class="spinner"></div><p>Cargando...</p></div>';
    
    setTimeout(function() {
        try {
            switch (page) {
                case 'inicio': cargarInicio(container); break;
                case 'horarios': cargarHorarios(container); break;
                case 'asistencia': cargarAsistencia(container); break;
                case 'noticias': cargarNoticias(container); break;
                case 'eventos': cargarEventos(container); break;
                case 'publicaciones': cargarPublicaciones(container); break;
                case 'perfil': cargarPerfil(container); break;
                case 'configuracion': cargarConfiguracion(container); break;
                case 'gestion-reportes': cargarGestionReportes(container); break;
                case 'mis-reportes': cargarMisReportes(container); break;
                default:
                    container.innerHTML = '<div class="card fade-in"><h2>' + (CONFIG.TITULOS_PAGINAS[page] || page) + '</h2><p style="text-align:center;padding:40px;color:var(--gris-texto);"><i class="bx bx-construction" style="font-size:3rem;display:block;margin-bottom:16px;"></i>Sección en desarrollo</p></div>';
            }
        } catch (e) {
            container.innerHTML = '<div class="card fade-in" style="border-left:4px solid var(--error);"><h2>Error</h2><p style="text-align:center;padding:20px;color:var(--error);">' + (e.message || 'Error desconocido') + '</p></div>';
        }
    }, 150);
}

function cargarInicio(c) {
    c.innerHTML = 
        '<div class="fade-in">' +
            '<div class="contador-container">' +
                '<div class="contador-titulo" id="contador-titulo">Culto Dominical</div>' +
                '<div class="contador-tiempo">' +
                    '<div class="contador-item"><span class="contador-numero" id="contador-dias">00</span><span class="contador-etiqueta">Días</span></div>' +
                    '<div class="contador-item"><span class="contador-numero" id="contador-horas">00</span><span class="contador-etiqueta">Horas</span></div>' +
                    '<div class="contador-item"><span class="contador-numero" id="contador-minutos">00</span><span class="contador-etiqueta">Minutos</span></div>' +
                    '<div class="contador-item"><span class="contador-numero" id="contador-segundos">00</span><span class="contador-etiqueta">Segundos</span></div>' +
                '</div>' +
                '<div class="contador-estado estado-proximo" id="contador-estado">PRÓXIMO CULTO</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:16px;">' +
                '<div class="card card-glass"><div style="display:flex;align-items:center;gap:10px;"><div style="width:44px;height:44px;border-radius:50%;background:var(--azul-primario);display:flex;align-items:center;justify-content:center;color:white;font-size:1.3rem;"><i class="bx bx-calendar"></i></div><div><div style="font-size:0.7rem;opacity:0.7;">Fecha</div><div style="font-weight:700;" id="fecha-actual"></div></div></div></div>' +
                '<div class="card card-glass"><div style="display:flex;align-items:center;gap:10px;"><div style="width:44px;height:44px;border-radius:50%;background:var(--dorado);display:flex;align-items:center;justify-content:center;color:var(--azul-primario);font-size:1.3rem;"><i class="bx bx-time"></i></div><div><div style="font-size:0.7rem;opacity:0.7;">Hora</div><div style="font-weight:700;" id="hora-actual"></div></div></div></div>' +
                '<div class="card card-glass"><div style="display:flex;align-items:center;gap:10px;"><div style="width:44px;height:44px;border-radius:50%;background:var(--exito);display:flex;align-items:center;justify-content:center;color:white;font-size:1.3rem;"><i class="bx bx-wifi"></i></div><div><div style="font-size:0.7rem;opacity:0.7;">Estado</div><div style="font-weight:700;">' + (APP_STATE.isOnline ? 'Conectado' : 'Desconectado') + '</div></div></div></div>' +
            '</div>' +
            '<div class="card" style="border-left:4px solid var(--dorado);"><h3><i class="bx bx-bible" style="color:var(--dorado);"></i> Versículo del Día</h3><div id="versiculo-content" style="font-style:italic;font-size:1rem;line-height:1.8;margin-top:8px;"><p>"Jehová es mi pastor; nada me faltará."</p><p style="font-weight:700;color:var(--azul-primario);margin-top:8px;">Salmos 23:1</p></div></div>' +
            '<div class="card" style="margin-top:12px;"><h3>Accesos Rápidos</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:8px;">' +
                '<button class="btn-outline btn-sm" onclick="navegarA(\'asistencia\')"><i class="bx bx-check-shield"></i> Asistencia</button>' +
                '<button class="btn-outline btn-sm" onclick="navegarA(\'peticiones\')"><i class="bx bx-pray"></i> Oración</button>' +
                '<button class="btn-outline btn-sm" onclick="navegarA(\'publicaciones\')"><i class="bx bx-news"></i> Publicar</button>' +
                '<button class="btn-outline btn-sm" onclick="navegarA(\'devocional\')"><i class="bx bx-bible"></i> Devocional</button>' +
                '<button class="btn-outline btn-sm" onclick="navegarA(\'eventos\')"><i class="bx bx-calendar-star"></i> Eventos</button>' +
                '<button class="btn-outline btn-sm" onclick="navegarA(\'podcast\')"><i class="bx bx-microphone"></i> Podcast</button>' +
            '</div></div>' +
        '</div>';
    
    actualizarFechaHora();
    if (!APP_STATE.fechaInterval) {
        APP_STATE.fechaInterval = setInterval(actualizarFechaHora, 1000);
    }
    iniciarContadorRegresivo();
}

function cargarHorarios(c) {
    const horarios = [
        { dia: 'Lunes', cultos: [] },
        { dia: 'Martes', cultos: [{ nombre: 'Culto de Oración', hora: '6:00 PM - 8:30 PM' }] },
        { dia: 'Miércoles', cultos: [{ nombre: 'Culto Campal', hora: '4:00 PM - 7:00 PM' }] },
        { dia: 'Jueves', cultos: [{ nombre: 'Culto de Refrán', hora: '4:00 PM - 7:00 PM' }] },
        { dia: 'Viernes', cultos: [{ nombre: 'Culto de Jóvenes', hora: '6:00 PM - 8:30 PM' }] },
        { dia: 'Sábado', cultos: [] },
        { dia: 'Domingo', cultos: [{ nombre: 'Culto Dominical', hora: '10:00 AM - 12:00 PM' }] }
    ];
    const diaActual = new Date().getDay();
    const idx = diaActual === 0 ? 6 : diaActual - 1;

    c.innerHTML = 
        '<div class="fade-in">' +
            '<h2><i class="bx bx-time-five"></i> Horarios de Cultos</h2>' +
            '<div style="display:grid;gap:10px;margin-top:16px;">' +
                horarios.map(function(d, i) {
                    return '<div class="card" style="border-left:4px solid ' + (i === idx ? 'var(--azul-primario)' : 'var(--gris-medio)') + ';">' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;">' +
                            '<div>' +
                                '<h3>' + d.dia + (i === idx ? ' <span style="background:var(--azul-primario);color:white;padding:2px 8px;border-radius:10px;font-size:0.7rem;">HOY</span>' : '') + '</h3>' +
                                (d.cultos.length ? d.cultos.map(function(x) {
                                    return '<div style="display:flex;align-items:center;gap:8px;color:var(--gris-texto);"><i class="bx bx-time" style="color:var(--azul-primario);"></i><span>' + x.nombre + ' - ' + x.hora + '</span></div>';
                                }).join('') : '<p style="color:var(--gris-texto);">No hay culto programado</p>') +
                            '</div>' +
                        '</div>' +
                    '</div>';
                }).join('') +
            '</div>' +
        '</div>';
}

function cargarAsistencia(c) {
    c.innerHTML = 
        '<div class="fade-in">' +
            '<h2><i class="bx bx-check-shield"></i> Confirmar Asistencia</h2>' +
            '<div class="card" style="text-align:center;padding:30px;">' +
                '<i class="bx bx-calendar-check" style="font-size:3rem;color:var(--azul-primario);"></i>' +
                '<h3 style="margin:12px 0;">Próximo Culto</h3>' +
                '<div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap;">' +
                    '<button class="btn-primary btn-sm" onclick="showToast(\'✅ Asistencia confirmada\', \'success\')"><i class="bx bx-check"></i> Voy</button>' +
                    '<button class="btn-secondary btn-sm" onclick="showToast(\'🤔 Quizás asista\', \'info\')"><i class="bx bx-question-mark"></i> Tal vez</button>' +
                    '<button class="btn-outline btn-sm" onclick="showToast(\'❌ No asistiré\', \'warning\')"><i class="bx bx-x"></i> No</button>' +
                '</div>' +
            '</div>' +
        '</div>';
}

function cargarNoticias(c) {
    const noticias = APP_STATE.noticias.length ? APP_STATE.noticias : [];
    
    c.innerHTML = 
        '<div class="fade-in">' +
            '<h2><i class="bx bx-news"></i> Noticias</h2>' +
            (noticias.length === 0 ? 
                '<div class="card"><p style="text-align:center;padding:30px;color:var(--gris-texto);">No hay noticias publicadas</p></div>' :
                noticias.map(function(n) {
                    return '<div class="card" style="margin-bottom:12px;border-left:4px solid var(--azul-primario);">' +
                        '<h3>' + (n.titulo || 'Sin título') + '</h3>' +
                        '<p style="font-size:0.85rem;color:var(--gris-texto);">' + (n.resumen || n.contenido || '') + '</p>' +
                        '<small style="color:var(--gris-medio);">' + formatearFecha(n.fecha_publicacion || n.fecha) + '</small>' +
                    '</div>';
                }).join('')
            ) +
        '</div>';
}

function cargarEventos(c) {
    const eventos = APP_STATE.eventos.length ? APP_STATE.eventos : [];
    
    c.innerHTML = 
        '<div class="fade-in">' +
            '<h2><i class="bx bx-calendar-star"></i> Eventos</h2>' +
            (eventos.length === 0 ? 
                '<div class="card"><p style="text-align:center;padding:30px;color:var(--gris-texto);">No hay eventos programados</p></div>' :
                eventos.map(function(e) {
                    return '<div class="card" style="margin-bottom:12px;border-left:4px solid var(--dorado);">' +
                        '<h3>' + (e.titulo || 'Evento') + '</h3>' +
                        '<p style="color:var(--gris-texto);">' + (e.descripcion || '') + '</p>' +
                        '<small style="color:var(--gris-medio);">' + (e.fecha || '') + ' ' + (e.hora_inicio || '') + '</small>' +
                    '</div>';
                }).join('')
            ) +
        '</div>';
}

function cargarPublicaciones(c) {
    const pub = APP_STATE.publicaciones.length ? APP_STATE.publicaciones : [];
    
    c.innerHTML = 
        '<div class="fade-in">' +
            '<h2><i class="bx bx-news"></i> Publicaciones</h2>' +
            (APP_STATE.usuario ? 
                '<div class="card" style="margin-bottom:16px;">' +
                    '<textarea class="form-input" id="contenido-publicacion" placeholder="¿Qué quieres compartir?" rows="3" maxlength="2000"></textarea>' +
                    '<button class="btn-primary btn-sm" onclick="crearPublicacionLocal()" style="margin-top:8px;"><i class="bx bx-send"></i> Publicar</button>' +
                '</div>' : ''
            ) +
            (pub.length === 0 ? 
                '<div class="card" style="text-align:center;padding:40px;"><i class="bx bx-news" style="font-size:3rem;color:var(--gris-medio);"></i><p style="margin-top:12px;color:var(--gris-texto);">No hay publicaciones aún</p></div>' :
                pub.map(function(p) {
                    return '<div class="card" style="margin-bottom:12px;">' +
                        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
                            '<img src="' + (p.foto_autor || 'assets/avatars/default.png') + '" style="width:40px;height:40px;border-radius:50%;">' +
                            '<div><strong>' + (p.autor || 'Anónimo') + '</strong><small style="display:block;color:var(--gris-texto);">' + formatearFecha(p.fecha) + '</small></div>' +
                        '</div>' +
                        '<p style="white-space:pre-wrap;">' + escapeHtml(p.contenido || '') + '</p>' +
                    '</div>';
                }).join('')
            ) +
        '</div>';
}

function crearPublicacionLocal() {
    const contenido = document.getElementById('contenido-publicacion')?.value;
    if (!contenido || !contenido.trim()) {
        showToast('Escribe algo para publicar', 'warning');
        return;
    }
    if (!APP_STATE.usuario) {
        showToast('Debes iniciar sesión', 'warning');
        return;
    }
    
    const publicacion = {
        id: 'pub_' + Date.now(),
        usuario_id: APP_STATE.usuario.id,
        autor: APP_STATE.usuario.nombre,
        usuario: APP_STATE.usuario.usuario,
        foto_autor: APP_STATE.usuario.foto || 'assets/avatars/default.png',
        contenido: contenido.trim(),
        fecha: new Date().toISOString(),
        reacciones: { amen: 0, me_gusta: 0, fuego: 0, orando: 0, bendicion: 0 },
        comentarios_count: 0
    };
    
    APP_STATE.publicaciones.unshift(publicacion);
    try {
        const db = getDB();
        if (db) {
            db.addPublicacion(publicacion);
        }
    } catch (e) {}
    
    showToast('✅ Publicación creada', 'success');
    navegarA('publicaciones');
}

function cargarPerfil(c) {
    if (!APP_STATE.usuario) {
        c.innerHTML = '<div class="fade-in"><div class="card" style="text-align:center;padding:40px;"><i class="bx bx-user-circle" style="font-size:4rem;color:var(--gris-medio);"></i><h3>Inicia sesión para ver tu perfil</h3></div></div>';
        return;
    }
    const u = APP_STATE.usuario;
    c.innerHTML = 
        '<div class="fade-in">' +
            '<div style="text-align:center;padding:30px;background:linear-gradient(135deg,var(--azul-primario),var(--azul-claro));color:white;border-radius:var(--borde-radius);margin-bottom:16px;">' +
                '<img src="' + (u.foto || 'assets/avatars/default.png') + '" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--dorado);">' +
                '<h2>' + (u.nombre || '') + '</h2>' +
                '<p>@' + (u.usuario || '') + '</p>' +
                '<span style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:0.8rem;">' + (u.ministerio || 'General') + '</span>' +
            '</div>' +
            '<div class="card"><h3>Información</h3><p><strong>Correo:</strong> ' + (u.correo || 'No registrado') + '</p><p><strong>Celular:</strong> ' + (u.celular || 'No registrado') + '</p></div>' +
            '<div class="card" style="margin-top:12px;border-left:4px solid var(--error);"><button class="btn-danger btn-sm" onclick="confirmarAccion(\'¿Cerrar sesión?\',\'Serás redirigido al inicio.\',cerrarSesion,\'danger\')"><i class="bx bx-log-out"></i> Cerrar Sesión</button></div>' +
        '</div>';
}

function cargarConfiguracion(c) {
    c.innerHTML = 
        '<div class="fade-in">' +
            '<h2><i class="bx bx-cog"></i> Configuración</h2>' +
            '<div class="card"><h3>Apariencia</h3><button class="btn-secondary btn-sm" onclick="toggleTema()"><i class="bx ' + (APP_STATE.tema === 'dark' ? 'bx-sun' : 'bx-moon') + '"></i> ' + (APP_STATE.tema === 'dark' ? 'Modo Claro' : 'Modo Oscuro') + '</button></div>' +
            '<div class="card" style="margin-top:12px;"><h3>Idioma</h3><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">' +
                ['es','en','pt','fr'].map(function(l) {
                    return '<button class="btn-outline btn-sm ' + (APP_STATE.idioma === l ? 'active' : '') + '" onclick="cambiarIdioma(\'' + l + '\')"><i class="bx bx-flag-alt"></i> ' + l.toUpperCase() + '</button>';
                }).join('') +
            '</div></div>' +
            '<div class="card" style="margin-top:12px;"><h3>Acerca de</h3><p><strong>IPUC LA FONDA</strong> v' + CONFIG.VERSION + '</p><p style="font-size:0.8rem;color:var(--gris-texto);">&copy; 2026 IPUC LA FONDA International</p></div>' +
            (APP_STATE.usuario ? '<div class="card" style="margin-top:12px;border-left:4px solid var(--error);"><button class="btn-danger btn-sm" onclick="confirmarAccion(\'¿Cerrar sesión?\',\'Serás redirigido al inicio.\',cerrarSesion,\'danger\')"><i class="bx bx-log-out"></i> Cerrar Sesión</button></div>' : '') +
        '</div>';
}

function cargarGestionReportes(c) {
    c.innerHTML = 
        '<div class="fade-in">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
                '<h2><i class="bx bx-file"></i> Gestión de Reportes</h2>' +
                '<button class="btn-primary btn-sm" onclick="abrirModalReporte()"><i class="bx bx-plus"></i> Nuevo</button>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:16px;">' +
                '<div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;color:var(--advertencia);">' + APP_STATE.reportes.filter(function(r){return r.estado==='pendiente';}).length + '</p><p style="font-size:0.75rem;">Pendientes</p></div>' +
                '<div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;color:var(--info);">' + APP_STATE.reportes.filter(function(r){return r.estado==='en_revision';}).length + '</p><p style="font-size:0.75rem;">En Revisión</p></div>' +
                '<div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;color:var(--exito);">' + APP_STATE.reportes.filter(function(r){return r.estado==='resuelto';}).length + '</p><p style="font-size:0.75rem;">Resueltos</p></div>' +
                '<div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;color:var(--azul-primario);">' + APP_STATE.reportes.length + '</p><p style="font-size:0.75rem;">Total</p></div>' +
            '</div>' +
            (APP_STATE.reportes.length === 0 ? 
                '<div class="card" style="text-align:center;padding:40px;"><i class="bx bx-file-blank" style="font-size:3rem;color:var(--gris-medio);"></i><p>No hay reportes</p></div>' :
                APP_STATE.reportes.map(function(r) {
                    return '<div class="card" style="margin-bottom:12px;border-left:4px solid ' + (r.urgencia === 'critica' ? 'var(--error)' : r.urgencia === 'alta' ? 'var(--advertencia)' : 'var(--info)') + ';">' +
                        '<div style="display:flex;justify-content:space-between;align-items:start;">' +
                            '<div style="flex:1;">' +
                                '<span class="badge estado-' + (r.estado || 'pendiente') + '" style="margin-right:6px;">' + (r.estado || 'pendiente') + '</span>' +
                                '<span class="badge tipo-' + (r.tipo || 'general') + '">' + (r.tipo || 'general') + '</span>' +
                                '<p style="font-size:0.9rem;margin:4px 0;">' + escapeHtml((r.descripcion || '').substring(0, 100)) + '...</p>' +
                                '<small style="color:var(--gris-texto);">' + formatearFecha(r.fecha) + '</small>' +
                            '</div>' +
                            '<div style="display:flex;gap:4px;">' +
                                '<button class="btn-primary btn-sm" onclick="verDetalleReporte(\'' + r.id + '\')"><i class="bx bx-show"></i></button>' +
                                (r.estado === 'pendiente' ? '<button class="btn-success btn-sm" onclick="cambiarEstadoReporte(\'' + r.id + '\',\'en_revision\')"><i class="bx bx-check"></i></button>' : '') +
                            '</div>' +
                        '</div>' +
                    '</div>';
                }).join('')
            ) +
        '</div>';
}

function cargarMisReportes(c) {
    if (!APP_STATE.usuario) {
        c.innerHTML = '<div class="fade-in"><div class="card" style="text-align:center;padding:40px;"><i class="bx bx-user-circle" style="font-size:4rem;color:var(--gris-medio);"></i><h3>Inicia sesión para ver tus reportes</h3></div></div>';
        return;
    }
    
    const misReportes = APP_STATE.reportes.filter(function(r) {
        return r.reportado_por && r.reportado_por.id === APP_STATE.usuario.id;
    });
    
    c.innerHTML = 
        '<div class="fade-in">' +
            '<h2><i class="bx bx-file"></i> Mis Reportes</h2>' +
            '<button class="btn-primary btn-sm" onclick="abrirModalReporte()" style="margin-bottom:16px;"><i class="bx bx-plus"></i> Nuevo Reporte</button>' +
            (misReportes.length === 0 ? 
                '<div class="card" style="text-align:center;padding:40px;"><i class="bx bx-file-blank" style="font-size:3rem;color:var(--gris-medio);"></i><p>No has generado ningún reporte</p></div>' :
                misReportes.map(function(r) {
                    return '<div class="card" style="margin-bottom:12px;">' +
                        '<span class="badge estado-' + (r.estado || 'pendiente') + '">' + (r.estado || 'pendiente') + '</span>' +
                        '<span class="badge tipo-' + (r.tipo || 'general') + '" style="margin-left:4px;">' + (r.tipo || 'general') + '</span>' +
                        '<p style="font-size:0.9rem;margin:4px 0;">' + escapeHtml((r.descripcion || '').substring(0, 100)) + '...</p>' +
                        '<small style="color:var(--gris-texto);">' + formatearFecha(r.fecha) + '</small>' +
                    '</div>';
                }).join('')
            ) +
        '</div>';
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 IPUC LA FONDA v18.0 - Inicializando...');
    
    try {
        const temaGuardado = localStorage.getItem('ipuc18_tema') || 'light';
        APP_STATE.tema = temaGuardado;
        aplicarTema(temaGuardado);
    } catch (e) {}

    try {
        const idiomaGuardado = localStorage.getItem('ipuc18_idioma') || 'es';
        APP_STATE.idioma = idiomaGuardado;
    } catch (e) {}

    APP_STATE.publicaciones = cargarArray('ipuc18_publicaciones');
    APP_STATE.comentarios = cargarArray('ipuc18_comentarios');
    APP_STATE.reacciones = cargarObjeto('ipuc18_reacciones');
    APP_STATE.asistencias = cargarArray('ipuc18_asistencias');
    APP_STATE.eventos = cargarArray('ipuc18_eventos');
    APP_STATE.noticias = cargarArray('ipuc18_noticias');
    APP_STATE.peticiones = cargarArray('ipuc18_peticiones');
    APP_STATE.encuestas = cargarArray('ipuc18_encuestas');
    APP_STATE.biblioteca = cargarArray('ipuc18_biblioteca');
    APP_STATE.galeria = cargarArray('ipuc18_galeria');
    APP_STATE.podcast = cargarArray('ipuc18_podcast');
    APP_STATE.chat = cargarArray('ipuc18_chat');
    APP_STATE.directorio = cargarArray('ipuc18_directorio');
    
    try {
        const db = getDB();
        if (db) {
            const reportesData = db.cargar('reportes');
            APP_STATE.reportes = (reportesData && reportesData.reportes) ? reportesData.reportes : [];
        } else {
            APP_STATE.reportes = cargarArray('ipuc18_reportes');
        }
        APP_STATE.reportsPendientes = APP_STATE.reportes.filter(function(r) { 
            return r && r.estado === 'pendiente'; 
        }).length;
    } catch (e) {
        APP_STATE.reportes = [];
        APP_STATE.reportsPendientes = 0;
    }

    const token = localStorage.getItem('ipuc18_token');
    const usuarioData = localStorage.getItem('ipuc18_usuario');
    const rol = localStorage.getItem('ipuc18_rol');

    setTimeout(function() {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            splash.style.transition = 'opacity 0.5s ease';
            setTimeout(function() {
                if (splash) splash.style.display = 'none';
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
                mostrarBienvenida();
            }
        } else {
            mostrarBienvenida();
        }
    }, 2000);

    inicializarEventListeners();
    manejarResponsiveSidebar();
    
    window.addEventListener('resize', manejarResponsiveSidebar);
    window.addEventListener('online', function() {
        APP_STATE.isOnline = true;
        actualizarSidebarUsuario();
    });
    window.addEventListener('offline', function() {
        APP_STATE.isOnline = false;
        actualizarSidebarUsuario();
    });
    
    console.log('✅ IPUC LA FONDA v18.0 - Inicialización completa');
});

// ============================================
// INICIALIZAR EVENT LISTENERS
// ============================================
function inicializarEventListeners() {
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', cerrarSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', cerrarSidebar);

    document.querySelectorAll('.nav-item[data-page]').forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) navegarA(page);
        });
    });

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTema);
    
    const notifToggle = document.getElementById('notifications-toggle');
    if (notifToggle) notifToggle.addEventListener('click', toggleNotificaciones);
    
    const closeNotif = document.getElementById('close-notifications');
    if (closeNotif) {
        closeNotif.addEventListener('click', function() {
            const panel = document.getElementById('notification-panel');
            if (panel) panel.classList.add('hidden');
            APP_STATE.notificationsOpen = false;
        });
    }

    const reportsToggle = document.getElementById('reports-quick-toggle');
    if (reportsToggle) reportsToggle.addEventListener('click', togglePanelReportes);
    
    const closeReports = document.getElementById('close-reports-quick');
    if (closeReports) {
        closeReports.addEventListener('click', function() {
            const panel = document.getElementById('reports-quick-panel');
            if (panel) panel.classList.add('hidden');
            APP_STATE.reportsPanelOpen = false;
        });
    }

    const searchToggle = document.getElementById('search-toggle');
    if (searchToggle) searchToggle.addEventListener('click', toggleSearchBar);
    
    const searchClose = document.getElementById('search-close');
    if (searchClose) {
        searchClose.addEventListener('click', function() {
            const bar = document.getElementById('search-bar');
            if (bar) bar.classList.add('hidden');
            APP_STATE.searchBarOpen = false;
        });
    }

    const fabMain = document.getElementById('fab-main');
    if (fabMain) fabMain.addEventListener('click', toggleFabMenu);
    
    document.querySelectorAll('.fab-item').forEach(function(item) {
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            switch (action) {
                case 'reporte': abrirModalReporte(); break;
                case 'oracion': navegarA('peticiones'); break;
                case 'musica': navegarA('radio'); break;
                case 'evento': navegarA('eventos'); break;
                case 'donacion': navegarA('donaciones'); break;
                case 'compartir': 
                    const texto = '"Jehová es mi pastor; nada me faltará." - Salmos 23:1';
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(texto).then(function() { showToast('📋 Versículo copiado', 'success'); }).catch(function() {});
                    }
                    break;
            }
            toggleFabMenu();
        });
    });

    const userMini = document.getElementById('user-mini');
    if (userMini) userMini.addEventListener('click', toggleUserDropdown);
    
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            confirmarAccion('¿Cerrar sesión?', 'Serás redirigido al inicio.', cerrarSesion, 'danger');
        });
    }

    const btnGuest = document.getElementById('btn-guest');
    if (btnGuest) btnGuest.addEventListener('click', continuarComoInvitado);
    
    const showRegister = document.getElementById('show-register');
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            const loginForm = document.getElementById('login-form-container');
            const registerForm = document.getElementById('register-form-container');
            if (loginForm) loginForm.classList.add('hidden');
            if (registerForm) registerForm.classList.remove('hidden');
        });
    }
    
    const showLogin = document.getElementById('show-login');
    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            const loginForm = document.getElementById('login-form-container');
            const registerForm = document.getElementById('register-form-container');
            if (registerForm) registerForm.classList.add('hidden');
            if (loginForm) loginForm.classList.remove('hidden');
        });
    }

    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            if (lang) cambiarIdioma(lang);
        });
    });

    const reportUser = document.getElementById('report-user');
    if (reportUser) {
        reportUser.addEventListener('input', function() {
            buscarUsuarioReporte(this.value);
        });
    }

    document.querySelectorAll('input[name="report-type"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            cambiarTipoReporte(this.value);
        });
    });

    const reportForm = document.getElementById('report-form');
    if (reportForm) reportForm.addEventListener('submit', generarReporte);
    
    const cancelReport = document.getElementById('btn-cancel-report');
    if (cancelReport) cancelReport.addEventListener('click', cerrarModalReporte);

    document.querySelectorAll('.report-action-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-report');
            switch(action) {
                case 'usuario':
                case 'contenido':
                    abrirModalReporte();
                    const radio = document.querySelector('input[value="' + action + '"]');
                    if (radio) radio.checked = true;
                    cambiarTipoReporte(action);
                    break;
                case 'asistencia': navegarA('asistencia'); break;
                case 'financiero': navegarA('donaciones'); break;
            }
            togglePanelReportes();
        });
    });

    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-backdrop')) cerrarModal();
        });
    }
    
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) modalClose.addEventListener('click', cerrarModal);

    const confirmCancel = document.getElementById('confirm-cancel');
    if (confirmCancel) {
        confirmCancel.addEventListener('click', function() {
            const confirmModal = document.getElementById('confirm-modal');
            if (confirmModal) confirmModal.classList.add('hidden');
            APP_STATE.pendingConfirmation = null;
        });
    }
    
    const confirmAccept = document.getElementById('confirm-accept');
    if (confirmAccept) {
        confirmAccept.addEventListener('click', function() {
            if (APP_STATE.pendingConfirmation) {
                APP_STATE.pendingConfirmation();
                APP_STATE.pendingConfirmation = null;
            }
            const confirmModal = document.getElementById('confirm-modal');
            if (confirmModal) confirmModal.classList.add('hidden');
        });
    }

    const confirmModal = document.getElementById('confirm-modal');
    if (confirmModal) {
        confirmModal.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-backdrop')) {
                confirmModal.classList.add('hidden');
                APP_STATE.pendingConfirmation = null;
            }
        });
    }
    
    const reportModal = document.getElementById('report-modal');
    if (reportModal) {
        reportModal.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-backdrop')) cerrarModalReporte();
        });
    }
    
    const viewReportModal = document.getElementById('view-report-modal');
    if (viewReportModal) {
        viewReportModal.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-backdrop')) viewReportModal.classList.add('hidden');
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (APP_STATE.notificationsOpen) {
                const panel = document.getElementById('notification-panel');
                if (panel) panel.classList.add('hidden');
                APP_STATE.notificationsOpen = false;
            }
            if (APP_STATE.reportsPanelOpen) {
                const panel = document.getElementById('reports-quick-panel');
                if (panel) panel.classList.add('hidden');
                APP_STATE.reportsPanelOpen = false;
            }
            if (APP_STATE.searchBarOpen) {
                const bar = document.getElementById('search-bar');
                if (bar) bar.classList.add('hidden');
                APP_STATE.searchBarOpen = false;
            }
            const modal = document.getElementById('modal');
            if (modal && !modal.classList.contains('hidden')) cerrarModal();
            const rModal = document.getElementById('report-modal');
            if (rModal && !rModal.classList.contains('hidden')) cerrarModalReporte();
        }
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            toggleSearchBar();
        }
    });

    document.addEventListener('click', function(e) {
        if (APP_STATE.userDropdownOpen && !e.target.closest('#user-mini') && !e.target.closest('#user-dropdown')) {
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown) dropdown.classList.add('hidden');
            APP_STATE.userDropdownOpen = false;
        }
        if (APP_STATE.fabMenuOpen && !e.target.closest('#fab-main') && !e.target.closest('#fab-menu')) {
            const menu = document.getElementById('fab-menu');
            if (menu) menu.classList.add('hidden');
            APP_STATE.fabMenuOpen = false;
        }
    });
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
window.continuarComoInvitado = continuarComoInvitado;
window.cerrarSesion = cerrarSesion;
window.cambiarIdioma = cambiarIdioma;
window.mostrarApp = mostrarApp;
window.mostrarBienvenida = mostrarBienvenida;
window.formatearFecha = formatearFecha;
window.escapeHtml = escapeHtml;
window.generarId = generarId;
window.crearPublicacionLocal = crearPublicacionLocal;

window.abrirModalReporte = abrirModalReporte;
window.cerrarModalReporte = cerrarModalReporte;
window.cambiarTipoReporte = cambiarTipoReporte;
window.buscarUsuarioReporte = buscarUsuarioReporte;
window.seleccionarUsuarioReporte = seleccionarUsuarioReporte;
window.generarReporte = generarReporte;
window.actualizarBadgeReportes = actualizarBadgeReportes;
window.verDetalleReporte = verDetalleReporte;
window.cambiarEstadoReporte = cambiarEstadoReporte;
window.filtrarReportes = filtrarReportes;

console.log('✅ SCRIPT.JS v18.0 PRO ULTIMATE - Cargado correctamente');
