/* ============================================
   IPUC LA FONDA - SCRIPT.JS v18.0 PRO ULTIMATE
   Web App Profesional - Sistema Completo
   Incluye: Reportes, Administracion, Comunidad
   VERSION ESTABLE - SIN ERRORES
   ============================================ */

var CONFIG = {
    VERSION: '18.0',
    TITULOS_PAGINAS: {
        'inicio': 'Inicio',
        'horarios': 'Horarios de Cultos',
        'asistencia': 'Confirmar Asistencia',
        'noticias': 'Noticias',
        'eventos': 'Eventos',
        'chat': 'Chat Global',
        'directorio': 'Directorio',
        'peticiones': 'Peticiones de Oracion',
        'encuestas': 'Encuestas',
        'biblioteca': 'Biblioteca Digital',
        'galeria': 'Galeria',
        'devocional': 'Devocional Diario',
        'perfil': 'Mi Perfil',
        'configuracion': 'Configuracion',
        'publicaciones': 'Publicaciones',
        'podcast': 'Podcast',
        'gestion-reportes': 'Gestion de Reportes',
        'mis-reportes': 'Mis Reportes',
        'dashboard': 'Dashboard',
        'sistema': 'Sistema',
        'seguridad': 'Seguridad'
    }
};

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

function showToast(mensaje, tipo, duracion) {
    tipo = tipo || 'info';
    duracion = duracion || 3500;
    var container = document.getElementById('toast-container');
    if (!container) return;
    var iconos = { success: 'bx bxs-check-circle', error: 'bx bxs-error-circle', warning: 'bx bxs-error', info: 'bx bxs-info-circle' };
    var toast = document.createElement('div');
    toast.className = 'toast ' + tipo;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = '<i class="' + (iconos[tipo] || 'bx bxs-info-circle') + '"></i><span>' + (mensaje || '') + '</span>';
    container.appendChild(toast);
    setTimeout(function() {
        if (toast && toast.parentNode) {
            toast.classList.add('toast-hide');
            setTimeout(function() { if (toast && toast.parentNode) toast.remove(); }, 300);
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
        var icon = document.querySelector('#theme-toggle i');
        if (icon) icon.className = t === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
    } catch (e) {}
}

function cambiarIdioma(lang) {
    var idiomas = { es: 'ES', en: 'EN', pt: 'PT', fr: 'FR' };
    if (!idiomas[lang]) return;
    APP_STATE.idioma = lang;
    try { localStorage.setItem('ipuc18_idioma', lang); } catch (e) {}
    var btns = document.querySelectorAll('.lang-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.toggle('active', btns[i].getAttribute('data-lang') === lang);
    }
}

function navegarA(page) {
    if (!page || APP_STATE.isLoading) return;
    APP_STATE.currentPage = page;
    APP_STATE.isLoading = true;
    var items = document.querySelectorAll('.nav-item[data-page]');
    for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle('active', items[i].getAttribute('data-page') === page);
    }
    var titulo = (CONFIG.TITULOS_PAGINAS[page]) || page;
    var titleEl = document.getElementById('page-title');
    var breadcrumb = document.getElementById('breadcrumb-current');
    if (titleEl) titleEl.textContent = titulo;
    if (breadcrumb) breadcrumb.textContent = titulo;
    cargarPagina(page);
    if (window.innerWidth < 1024) cerrarSidebar();
    APP_STATE.isLoading = false;
}

function mostrarApp() {
    var welcome = document.getElementById('welcome-screen');
    var app = document.getElementById('app');
    var fab = document.getElementById('fab-main');
    if (welcome) welcome.classList.add('hidden');
    if (app) app.classList.remove('hidden');
    if (fab) fab.classList.remove('hidden');
    actualizarSidebarUsuario();
    navegarA('inicio');
    iniciarContadorRegresivo();
    actualizarBadgeReportes();
}

function mostrarBienvenida() {
    var app = document.getElementById('app');
    var welcome = document.getElementById('welcome-screen');
    if (app) app.classList.add('hidden');
    if (welcome) welcome.classList.remove('hidden');
}

function toggleSidebar() { APP_STATE.sidebarOpen ? cerrarSidebar() : abrirSidebar(); }

function abrirSidebar() {
    APP_STATE.sidebarOpen = true;
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.remove('hidden');
}

function cerrarSidebar() {
    if (APP_STATE.sidebarLocked) return;
    APP_STATE.sidebarOpen = false;
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.add('hidden');
}

function manejarResponsiveSidebar() {
    if (window.innerWidth >= 1024) {
        APP_STATE.sidebarLocked = true;
        var sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.add('open');
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
    var mini = document.getElementById('user-mini');
    if (!mini) return;
    var img = mini.querySelector('img');
    var name = mini.querySelector('.user-name');
    var role = mini.querySelector('.user-role');
    if (img) img.src = APP_STATE.usuario.foto || 'assets/avatars/default.png';
    if (name) name.textContent = APP_STATE.usuario.nombre || 'Usuario';
    if (role) {
        var roles = { admin: 'Administrador', invitado: 'Invitado', usuario: 'Miembro' };
        role.textContent = roles[APP_STATE.rol] || 'Miembro';
    }
    var adminMenu = document.getElementById('admin-menu');
    if (adminMenu) adminMenu.classList.toggle('hidden', APP_STATE.rol !== 'admin');
}

function toggleSearchBar() {
    APP_STATE.searchBarOpen = !APP_STATE.searchBarOpen;
    var bar = document.getElementById('search-bar');
    if (bar) bar.classList.toggle('hidden', !APP_STATE.searchBarOpen);
}

function toggleFabMenu() {
    APP_STATE.fabMenuOpen = !APP_STATE.fabMenuOpen;
    var menu = document.getElementById('fab-menu');
    if (menu) menu.classList.toggle('hidden', !APP_STATE.fabMenuOpen);
}

function toggleUserDropdown() {
    APP_STATE.userDropdownOpen = !APP_STATE.userDropdownOpen;
    var dd = document.getElementById('user-dropdown');
    if (dd) dd.classList.toggle('hidden', !APP_STATE.userDropdownOpen);
}

function toggleNotificaciones() {
    APP_STATE.notificationsOpen = !APP_STATE.notificationsOpen;
    var panel = document.getElementById('notification-panel');
    if (panel) panel.classList.toggle('hidden', !APP_STATE.notificationsOpen);
}

function togglePanelReportes() {
    APP_STATE.reportsPanelOpen = !APP_STATE.reportsPanelOpen;
    var panel = document.getElementById('reports-quick-panel');
    if (panel) panel.classList.toggle('hidden', !APP_STATE.reportsPanelOpen);
}

function cerrarModal() {
    var modal = document.getElementById('modal');
    if (modal) modal.classList.add('hidden');
}

function confirmarAccion(titulo, mensaje, callback, tipo) {
    tipo = tipo || 'warning';
    var titleEl = document.getElementById('confirm-title');
    var msgEl = document.getElementById('confirm-message');
    var modal = document.getElementById('confirm-modal');
    if (!modal) return;
    if (titleEl) titleEl.textContent = titulo || 'Estas seguro?';
    if (msgEl) msgEl.textContent = mensaje || '';
    APP_STATE.pendingConfirmation = callback;
    modal.classList.remove('hidden');
}

function continuarComoInvitado() {
    APP_STATE.rol = 'invitado';
    APP_STATE.token = 'guest_' + Date.now();
    APP_STATE.usuario = { id: 0, nombre: 'Invitado', usuario: 'invitado', correo: 'invitado@ipuc.com', foto: 'assets/avatars/default.png', verificado: false, ministerio: 'Visitante' };
    actualizarSidebarUsuario();
    mostrarApp();
    showToast('Navegando como invitado', 'info');
}

function cerrarSesion() {
    try { localStorage.removeItem('ipuc18_token'); localStorage.removeItem('ipuc18_usuario'); localStorage.removeItem('ipuc18_rol'); } catch (e) {}
    APP_STATE.token = null; APP_STATE.usuario = null; APP_STATE.rol = null;
    if (APP_STATE.contadorInterval) clearInterval(APP_STATE.contadorInterval);
    if (APP_STATE.fechaInterval) clearInterval(APP_STATE.fechaInterval);
    mostrarBienvenida();
    showToast('Sesion cerrada', 'info');
}

function formatearFecha(f) {
    try {
        var d = new Date(f);
        if (isNaN(d.getTime())) return 'Fecha invalida';
        var ahora = new Date(), diff = ahora - d;
        if (diff < 60000) return 'Ahora mismo';
        if (diff < 3600000) return 'Hace ' + Math.floor(diff / 60000) + ' min';
        if (diff < 86400000) return 'Hace ' + Math.floor(diff / 3600000) + ' h';
        return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return 'Fecha invalida'; }
}

function escapeHtml(texto) {
    if (!texto || typeof texto !== 'string') return '';
    var div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function generarId() { return 'rpt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9); }

function iniciarContadorRegresivo() {
    if (APP_STATE.contadorInterval) clearInterval(APP_STATE.contadorInterval);
    actualizarContador();
    APP_STATE.contadorInterval = setInterval(actualizarContador, 1000);
}

function actualizarContador() {
    var d = document.getElementById('contador-dias');
    var h = document.getElementById('contador-horas');
    if (!d && !h) return;
    try {
        var ahora = new Date();
        var domingo = new Date(ahora);
        domingo.setDate(ahora.getDate() + ((7 - ahora.getDay()) % 7));
        domingo.setHours(10, 0, 0, 0);
        if (domingo <= ahora) domingo.setDate(domingo.getDate() + 7);
        var diff = Math.max(0, (domingo - ahora) / 1000);
        if (d) d.textContent = String(Math.floor(diff / 86400)).padStart(2, '0');
        if (h) h.textContent = String(Math.floor((diff % 86400) / 3600)).padStart(2, '0');
    } catch (e) {}
}

// ============================================
// FUNCIONES DE REPORTES
// ============================================

function abrirModalReporte() {
    var modal = document.getElementById('report-modal');
    if (!modal) return;
    var form = document.getElementById('report-form');
    if (form) form.reset();
    modal.classList.remove('hidden');
}

function cerrarModalReporte() {
    var modal = document.getElementById('report-modal');
    if (modal) modal.classList.add('hidden');
}

function cambiarTipoReporte(tipo) {
    var userGroup = document.getElementById('report-user-group');
    var dateRange = document.getElementById('report-date-range');
    var ministerioGroup = document.getElementById('report-ministerio-group');
    if (userGroup) userGroup.style.display = 'none';
    if (dateRange) dateRange.style.display = 'none';
    if (ministerioGroup) ministerioGroup.style.display = 'none';
    if (tipo === 'usuario' || tipo === 'contenido') { if (userGroup) userGroup.style.display = 'block'; }
    if (tipo === 'asistencia' || tipo === 'financiero') { if (dateRange) dateRange.style.display = 'grid'; }
    if (tipo === 'ministerio') { if (ministerioGroup) ministerioGroup.style.display = 'block'; if (dateRange) dateRange.style.display = 'grid'; }
}

function buscarUsuarioReporte(query) {
    var container = document.getElementById('report-user-results');
    if (!container) return;
    if (!query || query.length < 2) { container.classList.add('hidden'); return; }
    container.innerHTML = '<p style="padding:12px;">Resultados para: ' + escapeHtml(query) + '</p>';
    container.classList.remove('hidden');
}

function seleccionarUsuarioReporte(id, nombre, correo) {
    var input = document.getElementById('report-user');
    var container = document.getElementById('report-user-results');
    if (input) input.value = nombre;
    if (container) container.classList.add('hidden');
}

function generarReporte(e) {
    if (e) e.preventDefault();
    if (!APP_STATE.usuario) { showToast('Debes iniciar sesion', 'warning'); return; }
    var descripcion = document.getElementById('report-descripcion');
    if (!descripcion || !descripcion.value.trim()) { showToast('La descripcion es obligatoria', 'warning'); return; }
    var tipo = document.querySelector('input[name="report-type"]:checked');
    var urgencia = document.querySelector('input[name="report-urgencia"]:checked');
    var reporte = {
        id: generarId(),
        tipo: tipo ? tipo.value : 'usuario',
        reportado_por: { id: APP_STATE.usuario.id || 0, nombre: APP_STATE.usuario.nombre || 'Anonimo', email: APP_STATE.usuario.correo || '' },
        descripcion: descripcion.value.trim(),
        motivo: (document.getElementById('report-motivo') || {}).value || '',
        urgencia: urgencia ? urgencia.value : 'baja',
        estado: 'pendiente',
        fecha: new Date().toISOString(),
        historial: [{ estado: 'pendiente', fecha: new Date().toISOString(), usuario: APP_STATE.usuario.nombre || 'Usuario', comentario: 'Reporte creado' }]
    };
    APP_STATE.reportes.unshift(reporte);
    try { if (window.db) window.db.addReporte(reporte); } catch (err) {}
    actualizarBadgeReportes();
    cerrarModalReporte();
    showToast('Reporte generado exitosamente', 'success');
    if (APP_STATE.currentPage === 'gestion-reportes') navegarA('gestion-reportes');
}

function actualizarBadgeReportes() {
    var count = 0;
    for (var i = 0; i < APP_STATE.reportes.length; i++) { if (APP_STATE.reportes[i] && APP_STATE.reportes[i].estado === 'pendiente') count++; }
    APP_STATE.reportsPendientes = count;
    var badge = document.getElementById('reports-badge');
    if (badge) { badge.textContent = count; badge.classList.toggle('hidden', count === 0); }
}

function verDetalleReporte(id) { showToast('Viendo reporte #' + id.substring(0, 8), 'info'); }

function cambiarEstadoReporte(id, nuevoEstado) {
    for (var i = 0; i < APP_STATE.reportes.length; i++) {
        if (APP_STATE.reportes[i].id === id) {
            APP_STATE.reportes[i].estado = nuevoEstado;
            if (nuevoEstado === 'resuelto' || nuevoEstado === 'desestimado') APP_STATE.reportes[i].fecha_resolucion = new Date().toISOString();
            break;
        }
    }
    actualizarBadgeReportes();
    showToast('Estado actualizado', 'success');
}

function filtrarReportes() { if (APP_STATE.currentPage === 'gestion-reportes') navegarA('gestion-reportes'); }

// ============================================
// CARGA DE PAGINAS
// ============================================

function cargarPagina(page) {
    var container = document.getElementById('page-content');
    if (!container) return;
    container.innerHTML = '<div class="page-loader"><div class="spinner"></div><p>Cargando...</p></div>';
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
            'sistema': cargarSistema
        };
        var fn = paginas[page];
        if (fn) { fn(container); }
        else { container.innerHTML = '<div class="card fade-in"><h2>' + page + '</h2><p style="text-align:center;padding:40px;">Seccion en desarrollo</p></div>'; }
    }, 150);
}

function cargarInicio(c) {
    c.innerHTML = '<div class="fade-in">' +
        '<div class="contador-container">' +
            '<div class="contador-titulo">Culto Dominical</div>' +
            '<div class="contador-tiempo">' +
                '<div class="contador-item"><span class="contador-numero" id="contador-dias">00</span><span class="contador-etiqueta">Dias</span></div>' +
                '<div class="contador-item"><span class="contador-numero" id="contador-horas">00</span><span class="contador-etiqueta">Horas</span></div>' +
                '<div class="contador-item"><span class="contador-numero" id="contador-minutos">00</span><span class="contador-etiqueta">Minutos</span></div>' +
                '<div class="contador-item"><span class="contador-numero" id="contador-segundos">00</span><span class="contador-etiqueta">Segundos</span></div>' +
            '</div>' +
            '<div class="contador-estado estado-proximo" id="contador-estado">PROXIMO CULTO</div>' +
        '</div>' +
        '<div class="card"><h3>Bienvenido a IPUC LA FONDA</h3><p>Donde el Espiritu Santo se mueve</p></div>' +
        '<div class="card"><h3>Accesos Rapidos</h3>' +
            '<button class="btn-outline btn-sm" onclick="navegarA(\'asistencia\')">Asistencia</button> ' +
            '<button class="btn-outline btn-sm" onclick="navegarA(\'publicaciones\')">Publicar</button> ' +
            '<button class="btn-outline btn-sm" onclick="navegarA(\'eventos\')">Eventos</button>' +
        '</div>' +
    '</div>';
    iniciarContadorRegresivo();
}

function cargarHorarios(c) {
    var horarios = [
        { dia: 'Domingo', cultos: [{ nombre: 'Culto Dominical', hora: '10:00 AM - 12:00 PM' }] },
        { dia: 'Martes', cultos: [{ nombre: 'Culto de Oracion', hora: '6:00 PM - 8:30 PM' }] },
        { dia: 'Viernes', cultos: [{ nombre: 'Culto de Jovenes', hora: '6:00 PM - 8:30 PM' }] }
    ];
    var html = '<div class="fade-in"><h2>Horarios de Cultos</h2>';
    for (var i = 0; i < horarios.length; i++) {
        var d = horarios[i];
        html += '<div class="card"><h3>' + d.dia + '</h3>';
        for (var j = 0; j < d.cultos.length; j++) {
            html += '<p>' + d.cultos[j].nombre + ' - ' + d.cultos[j].hora + '</p>';
        }
        html += '</div>';
    }
    html += '</div>';
    c.innerHTML = html;
}

function cargarAsistencia(c) {
    c.innerHTML = '<div class="fade-in"><h2>Confirmar Asistencia</h2>' +
        '<div class="card" style="text-align:center;padding:30px;">' +
            '<i class="bx bx-calendar-check" style="font-size:3rem;color:var(--azul-primario);"></i>' +
            '<h3>Proximo Culto</h3>' +
            '<button class="btn-primary btn-sm" onclick="showToast(\'Asistencia confirmada\',\'success\')">Confirmar Asistencia</button>' +
        '</div></div>';
}

function cargarNoticias(c) {
    c.innerHTML = '<div class="fade-in"><h2>Noticias</h2><div class="card"><p>No hay noticias publicadas</p></div></div>';
}

function cargarEventos(c) {
    c.innerHTML = '<div class="fade-in"><h2>Eventos</h2><div class="card"><p>No hay eventos programados</p></div></div>';
}

function cargarPublicaciones(c) {
    c.innerHTML = '<div class="fade-in"><h2>Publicaciones</h2>' +
        '<div class="card"><textarea class="form-input" id="pub-contenido" placeholder="Que quieres compartir?" rows="3"></textarea>' +
        '<button class="btn-primary btn-sm" onclick="crearPublicacionLocal()" style="margin-top:8px;">Publicar</button></div>' +
        '<div class="card"><p>No hay publicaciones</p></div></div>';
}

function crearPublicacionLocal() {
    var contenido = document.getElementById('pub-contenido');
    if (!contenido || !contenido.value.trim()) { showToast('Escribe algo', 'warning'); return; }
    if (!APP_STATE.usuario) { showToast('Inicia sesion', 'warning'); return; }
    var pub = {
        id: 'pub_' + Date.now(),
        usuario_id: APP_STATE.usuario.id,
        autor: APP_STATE.usuario.nombre,
        contenido: contenido.value.trim(),
        fecha: new Date().toISOString(),
        reacciones: { amen: 0, me_gusta: 0, fuego: 0, orando: 0, bendicion: 0 },
        comentarios_count: 0
    };
    APP_STATE.publicaciones.unshift(pub);
    try { if (window.db) window.db.addPublicacion(pub); } catch (e) {}
    showToast('Publicacion creada', 'success');
    navegarA('publicaciones');
}

function cargarPerfil(c) {
    if (!APP_STATE.usuario) { c.innerHTML = '<div class="fade-in"><div class="card"><h2>Perfil</h2><p>Inicia sesion para ver tu perfil</p></div></div>'; return; }
    var u = APP_STATE.usuario;
    c.innerHTML = '<div class="fade-in"><h2>Mi Perfil</h2>' +
        '<div class="card"><p><strong>Nombre:</strong> ' + (u.nombre || '') + '</p>' +
        '<p><strong>Usuario:</strong> @' + (u.usuario || '') + '</p>' +
        '<p><strong>Correo:</strong> ' + (u.correo || '') + '</p></div>' +
        '<button class="btn-danger btn-sm" onclick="confirmarAccion(\'Cerrar sesion?\',\'Seras redirigido.\',cerrarSesion,\'danger\')">Cerrar Sesion</button></div>';
}

function cargarConfiguracion(c) {
    c.innerHTML = '<div class="fade-in"><h2>Configuracion</h2>' +
        '<div class="card"><h3>Tema</h3><button class="btn-secondary btn-sm" onclick="toggleTema()">Cambiar Tema</button></div>' +
        '<div class="card"><h3>Idioma</h3>' +
            '<button class="btn-outline btn-sm" onclick="cambiarIdioma(\'es\')">ES</button> ' +
            '<button class="btn-outline btn-sm" onclick="cambiarIdioma(\'en\')">EN</button>' +
        '</div>' +
        '<div class="card"><p>IPUC LA FONDA v' + CONFIG.VERSION + '</p></div></div>';
}

function cargarGestionReportes(c) {
    var html = '<div class="fade-in"><h2>Gestion de Reportes</h2>';
    html += '<button class="btn-primary btn-sm" onclick="abrirModalReporte()">Nuevo Reporte</button>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:16px 0;">';
    html += '<div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">' + APP_STATE.reportes.length + '</p><p>Total</p></div>';
    html += '<div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">' + APP_STATE.reportsPendientes + '</p><p>Pendientes</p></div>';
    html += '</div>';
    if (APP_STATE.reportes.length === 0) {
        html += '<div class="card"><p>No hay reportes</p></div>';
    } else {
        for (var i = 0; i < APP_STATE.reportes.length; i++) {
            var r = APP_STATE.reportes[i];
            html += '<div class="card" style="margin-bottom:8px;border-left:4px solid var(--azul-primario);">';
            html += '<span class="badge estado-' + (r.estado || 'pendiente') + '">' + (r.estado || 'pendiente') + '</span> ';
            html += '<span class="badge tipo-' + (r.tipo || 'general') + '">' + (r.tipo || 'general') + '</span>';
            html += '<p>' + escapeHtml((r.descripcion || '').substring(0, 100)) + '...</p>';
            html += '<small>' + formatearFecha(r.fecha) + '</small>';
            html += '<div><button class="btn-primary btn-sm" onclick="verDetalleReporte(\'' + r.id + '\')">Ver</button></div>';
            html += '</div>';
        }
    }
    html += '</div>';
    c.innerHTML = html;
}

function cargarMisReportes(c) {
    if (!APP_STATE.usuario) { c.innerHTML = '<div class="fade-in"><div class="card"><h2>Mis Reportes</h2><p>Inicia sesion</p></div></div>'; return; }
    var misReportes = [];
    for (var i = 0; i < APP_STATE.reportes.length; i++) {
        if (APP_STATE.reportes[i].reportado_por && APP_STATE.reportes[i].reportado_por.id === APP_STATE.usuario.id) {
            misReportes.push(APP_STATE.reportes[i]);
        }
    }
    var html = '<div class="fade-in"><h2>Mis Reportes</h2>';
    html += '<button class="btn-primary btn-sm" onclick="abrirModalReporte()">Nuevo Reporte</button>';
    if (misReportes.length === 0) { html += '<div class="card"><p>No has generado reportes</p></div>'; }
    else {
        for (var j = 0; j < misReportes.length; j++) {
            var r = misReportes[j];
            html += '<div class="card"><span class="badge estado-' + (r.estado || 'pendiente') + '">' + (r.estado || 'pendiente') + '</span><p>' + escapeHtml((r.descripcion || '').substring(0, 100)) + '...</p></div>';
        }
    }
    html += '</div>';
    c.innerHTML = html;
}

function cargarDashboard(c) { c.innerHTML = '<div class="fade-in"><h2>Dashboard</h2><div class="card"><p>Panel de administracion</p></div></div>'; }
function cargarSistema(c) { c.innerHTML = '<div class="fade-in"><h2>Sistema</h2><div class="card"><p>IPUC LA FONDA v' + CONFIG.VERSION + '</p></div></div>'; }

// ============================================
// INICIALIZACION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    try { var t = localStorage.getItem('ipuc18_tema') || 'light'; APP_STATE.tema = t; aplicarTema(t); } catch (e) {}
    try { APP_STATE.idioma = localStorage.getItem('ipuc18_idioma') || 'es'; } catch (e) {}

    var token = localStorage.getItem('ipuc18_token');
    var usuarioData = localStorage.getItem('ipuc18_usuario');
    var rol = localStorage.getItem('ipuc18_rol');

    setTimeout(function() {
        var splash = document.getElementById('splash-screen');
        if (splash) { splash.style.opacity = '0'; splash.style.transition = 'opacity 0.5s'; setTimeout(function() { if (splash) splash.style.display = 'none'; }, 500); }
        if (token && usuarioData) {
            try { APP_STATE.token = token; APP_STATE.usuario = JSON.parse(usuarioData); APP_STATE.rol = rol || 'usuario'; mostrarApp(); } catch (e) { mostrarBienvenida(); }
        } else { mostrarBienvenida(); }
    }, 2000);

    inicializarEventListeners();
    manejarResponsiveSidebar();
    window.addEventListener('resize', manejarResponsiveSidebar);
});

function inicializarEventListeners() {
    var menuToggle = document.getElementById('menu-toggle');
    var closeSidebarBtn = document.getElementById('close-sidebar');
    var sidebarOverlay = document.getElementById('sidebar-overlay');
    if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', cerrarSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', cerrarSidebar);

    var items = document.querySelectorAll('.nav-item[data-page]');
    for (var i = 0; i < items.length; i++) {
        items[i].addEventListener('click', function(e) { e.preventDefault(); var p = this.getAttribute('data-page'); if (p) navegarA(p); });
    }

    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTema);

    var notifToggle = document.getElementById('notifications-toggle');
    if (notifToggle) notifToggle.addEventListener('click', toggleNotificaciones);

    var reportsToggle = document.getElementById('reports-quick-toggle');
    if (reportsToggle) reportsToggle.addEventListener('click', togglePanelReportes);

    var searchToggle = document.getElementById('search-toggle');
    if (searchToggle) searchToggle.addEventListener('click', toggleSearchBar);

    var fabMain = document.getElementById('fab-main');
    if (fabMain) fabMain.addEventListener('click', toggleFabMenu);

    var userMini = document.getElementById('user-mini');
    if (userMini) userMini.addEventListener('click', toggleUserDropdown);

    var btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.addEventListener('click', function(e) { e.preventDefault(); confirmarAccion('Cerrar sesion?', 'Seras redirigido.', cerrarSesion, 'danger'); });

    var btnGuest = document.getElementById('btn-guest');
    if (btnGuest) btnGuest.addEventListener('click', continuarComoInvitado);

    var confirmCancel = document.getElementById('confirm-cancel');
    if (confirmCancel) confirmCancel.addEventListener('click', function() { var m = document.getElementById('confirm-modal'); if (m) m.classList.add('hidden'); APP_STATE.pendingConfirmation = null; });

    var confirmAccept = document.getElementById('confirm-accept');
    if (confirmAccept) confirmAccept.addEventListener('click', function() { if (APP_STATE.pendingConfirmation) { APP_STATE.pendingConfirmation(); APP_STATE.pendingConfirmation = null; } var m = document.getElementById('confirm-modal'); if (m) m.classList.add('hidden'); });

    var reportForm = document.getElementById('report-form');
    if (reportForm) reportForm.addEventListener('submit', generarReporte);

    var cancelReport = document.getElementById('btn-cancel-report');
    if (cancelReport) cancelReport.addEventListener('click', cerrarModalReporte);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (APP_STATE.notificationsOpen) { var p = document.getElementById('notification-panel'); if (p) p.classList.add('hidden'); APP_STATE.notificationsOpen = false; }
            if (APP_STATE.searchBarOpen) { var b = document.getElementById('search-bar'); if (b) b.classList.add('hidden'); APP_STATE.searchBarOpen = false; }
        }
    });

    document.addEventListener('click', function(e) {
        if (APP_STATE.userDropdownOpen && !e.target.closest('#user-mini') && !e.target.closest('#user-dropdown')) { var d = document.getElementById('user-dropdown'); if (d) d.classList.add('hidden'); APP_STATE.userDropdownOpen = false; }
        if (APP_STATE.fabMenuOpen && !e.target.closest('#fab-main') && !e.target.closest('#fab-menu')) { var m = document.getElementById('fab-menu'); if (m) m.classList.add('hidden'); APP_STATE.fabMenuOpen = false; }
    });
}

// Exportar a window
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
