/* ============================================
   IPUC LA FONDA - SCRIPT.JS v18.0 PRO ULTIMATE
   Web App Profesional - Sistema Completo
   VERSION CORREGIDA - SIN ERRORES
   ============================================ */

var CONFIG = {
    VERSION: '18.0',
    TITULOS_PAGINAS: {
        'inicio': 'Inicio', 'horarios': 'Horarios', 'asistencia': 'Asistencia',
        'noticias': 'Noticias', 'eventos': 'Eventos', 'publicaciones': 'Publicaciones',
        'perfil': 'Mi Perfil', 'configuracion': 'Configuracion',
        'gestion-reportes': 'Gestion de Reportes', 'mis-reportes': 'Mis Reportes',
        'dashboard': 'Dashboard', 'sistema': 'Sistema', 'peticiones': 'Peticiones',
        'biblioteca': 'Biblioteca', 'podcast': 'Podcast', 'galeria': 'Galeria',
        'chat': 'Chat', 'directorio': 'Directorio', 'donaciones': 'Donaciones',
        'devocional': 'Devocional', 'encuestas': 'Encuestas'
    }
};

var APP_STATE = {
    currentPage: 'inicio', usuario: null, token: null, rol: null, tema: 'light',
    sidebarOpen: false, sidebarLocked: false, notificationsOpen: false,
    reportsPanelOpen: false, userDropdownOpen: false, fabMenuOpen: false,
    searchBarOpen: false, contadorInterval: null, fechaInterval: null,
    notificacionesNoLeidas: 0, reportsPendientes: 0, pendingConfirmation: null,
    isLoading: false, publicaciones: [], reportes: [],
    isOnline: navigator.onLine, idioma: 'es'
};

function showToast(mensaje, tipo, duracion) {
    tipo = tipo || 'info'; duracion = duracion || 3000;
    var c = document.getElementById('toast-container');
    if (!c) return;
    var t = document.createElement('div');
    t.className = 'toast ' + tipo;
    t.textContent = mensaje || '';
    c.appendChild(t);
    setTimeout(function() { if (t.parentNode) { t.classList.add('toast-hide'); setTimeout(function() { if (t.parentNode) t.remove(); }, 300); } }, duracion);
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
    for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('active', btns[i].getAttribute('data-lang') === lang);
}

function navegarA(page) {
    if (!page || APP_STATE.isLoading) return;
    APP_STATE.currentPage = page;
    APP_STATE.isLoading = true;
    var items = document.querySelectorAll('.nav-item[data-page]');
    for (var i = 0; i < items.length; i++) items[i].classList.toggle('active', items[i].getAttribute('data-page') === page);
    var titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = CONFIG.TITULOS_PAGINAS[page] || page;
    var bc = document.getElementById('breadcrumb-current');
    if (bc) bc.textContent = CONFIG.TITULOS_PAGINAS[page] || page;
    cargarPagina(page);
    if (window.innerWidth < 1024) cerrarSidebar();
    APP_STATE.isLoading = false;
}

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
}

function mostrarBienvenida() {
    var a = document.getElementById('app');
    var w = document.getElementById('welcome-screen');
    if (a) a.classList.add('hidden');
    if (w) w.classList.remove('hidden');
}

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
        if (!APP_STATE.sidebarOpen) { var sb = document.getElementById('sidebar'); if (sb) sb.classList.remove('open'); }
    }
}

function actualizarSidebarUsuario() {
    if (!APP_STATE.usuario) return;
    var m = document.getElementById('user-mini');
    if (!m) return;
    var img = m.querySelector('img');
    var nm = m.querySelector('.user-name');
    var rl = m.querySelector('.user-role');
    if (img) img.src = APP_STATE.usuario.foto || 'assets/avatars/default.png';
    if (nm) nm.textContent = APP_STATE.usuario.nombre || 'Usuario';
    if (rl) { var roles = { admin: 'Administrador', invitado: 'Invitado', usuario: 'Miembro' }; rl.textContent = roles[APP_STATE.rol] || 'Miembro'; }
    var am = document.getElementById('admin-menu');
    if (am) am.classList.toggle('hidden', APP_STATE.rol !== 'admin');
}

function toggleSearchBar() {
    APP_STATE.searchBarOpen = !APP_STATE.searchBarOpen;
    var b = document.getElementById('search-bar');
    if (b) b.classList.toggle('hidden', !APP_STATE.searchBarOpen);
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
function toggleNotificaciones() {
    APP_STATE.notificationsOpen = !APP_STATE.notificationsOpen;
    var p = document.getElementById('notification-panel');
    if (p) p.classList.toggle('hidden', !APP_STATE.notificationsOpen);
}
function togglePanelReportes() {
    APP_STATE.reportsPanelOpen = !APP_STATE.reportsPanelOpen;
    var p = document.getElementById('reports-quick-panel');
    if (p) p.classList.toggle('hidden', !APP_STATE.reportsPanelOpen);
}

function cerrarModal() {
    var m = document.getElementById('modal');
    if (m) m.classList.add('hidden');
}
function confirmarAccion(titulo, mensaje, callback, tipo) {
    tipo = tipo || 'warning';
    var t = document.getElementById('confirm-title');
    var m = document.getElementById('confirm-message');
    var modal = document.getElementById('confirm-modal');
    if (!modal) return;
    if (t) t.textContent = titulo || 'Estas seguro?';
    if (m) m.textContent = mensaje || '';
    APP_STATE.pendingConfirmation = callback;
    modal.classList.remove('hidden');
}

function continuarComoInvitado() {
    APP_STATE.rol = 'invitado';
    APP_STATE.token = 'guest_' + Date.now();
    APP_STATE.usuario = { id: 0, nombre: 'Invitado', usuario: 'invitado', correo: 'invitado@ipuc.com', foto: 'assets/avatars/default.png', ministerio: 'Visitante', verificado: false };
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
        return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return 'Fecha invalida'; }
}

function escapeHtml(t) {
    if (!t || typeof t !== 'string') return '';
    var d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
}

function generarId() { return 'rpt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9); }

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

function compartirVersiculo() {
    var texto = '"Jehova es mi pastor; nada me faltara." - Salmos 23:1';
    if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(function() { showToast('Versiculo copiado', 'success'); }).catch(function() {});
    }
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
    if (tipo === 'usuario' || tipo === 'contenido') { if (u) u.style.display = 'block'; }
    if (tipo === 'asistencia' || tipo === 'financiero') { if (d) d.style.display = 'grid'; }
    if (tipo === 'ministerio') { if (m) m.style.display = 'block'; if (d) d.style.display = 'grid'; }
}
function buscarUsuarioReporte(query) {
    var c = document.getElementById('report-user-results');
    if (!c) return;
    if (!query || query.length < 2) { c.classList.add('hidden'); return; }
    c.innerHTML = '<p style="padding:12px;">Busqueda: ' + escapeHtml(query) + '</p>';
    c.classList.remove('hidden');
}
function seleccionarUsuarioReporte(id, nombre) {
    var i = document.getElementById('report-user');
    var c = document.getElementById('report-user-results');
    if (i) i.value = nombre;
    if (c) c.classList.add('hidden');
}
function generarReporte(e) {
    if (e) e.preventDefault();
    if (!APP_STATE.usuario) { showToast('Inicia sesion', 'warning'); return; }
    var d = document.getElementById('report-descripcion');
    if (!d || !d.value.trim()) { showToast('Descripcion obligatoria', 'warning'); return; }
    var tipo = document.querySelector('input[name="report-type"]:checked');
    var urg = document.querySelector('input[name="report-urgencia"]:checked');
    var mot = document.getElementById('report-motivo');
    var reporte = {
        id: generarId(),
        tipo: tipo ? tipo.value : 'usuario',
        reportado_por: { id: APP_STATE.usuario.id || 0, nombre: APP_STATE.usuario.nombre || 'Anonimo', email: APP_STATE.usuario.correo || '' },
        descripcion: d.value.trim(),
        motivo: mot ? mot.value : '',
        urgencia: urg ? urg.value : 'baja',
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
    var c = 0;
    for (var i = 0; i < APP_STATE.reportes.length; i++) { if (APP_STATE.reportes[i] && APP_STATE.reportes[i].estado === 'pendiente') c++; }
    APP_STATE.reportsPendientes = c;
    var b = document.getElementById('reports-badge');
    if (b) { b.textContent = c; b.classList.toggle('hidden', c === 0); }
    var p = document.getElementById('pending-reports');
    if (p) { p.textContent = c; p.classList.toggle('hidden', c === 0); }
}
function verDetalleReporte(id) { showToast('Viendo reporte #' + id.substring(0, 8), 'info'); }
function cambiarEstadoReporte(id, estado) {
    for (var i = 0; i < APP_STATE.reportes.length; i++) {
        if (APP_STATE.reportes[i].id === id) {
            APP_STATE.reportes[i].estado = estado;
            if (estado === 'resuelto' || estado === 'desestimado') APP_STATE.reportes[i].fecha_resolucion = new Date().toISOString();
            if (!APP_STATE.reportes[i].historial) APP_STATE.reportes[i].historial = [];
            APP_STATE.reportes[i].historial.push({ estado: estado, fecha: new Date().toISOString(), usuario: APP_STATE.usuario ? APP_STATE.usuario.nombre : 'Admin', comentario: 'Estado: ' + estado });
            break;
        }
    }
    try { if (window.db) window.db.cambiarEstadoReporte(id, estado); } catch (e) {}
    actualizarBadgeReportes();
    showToast('Estado actualizado', 'success');
}
function filtrarReportes() { if (APP_STATE.currentPage === 'gestion-reportes') navegarA('gestion-reportes'); }
function cargarReportesRecientes() {
    var c = document.getElementById('recent-reports-list');
    if (!c) return;
    var rec = APP_STATE.reportes.slice(0, 5);
    if (rec.length === 0) { c.innerHTML = '<div class="report-empty"><p>No hay reportes recientes</p></div>'; return; }
    var h = '';
    for (var i = 0; i < rec.length; i++) {
        var r = rec[i];
        h += '<div style="padding:8px;border:1px solid #ddd;border-radius:8px;margin-bottom:6px;cursor:pointer;" onclick="verDetalleReporte(\'' + r.id + '\')">';
        h += '<span class="badge estado-' + (r.estado || 'pendiente') + '">' + (r.estado || 'pendiente') + '</span> ';
        h += '<span class="badge tipo-' + (r.tipo || 'general') + '">' + (r.tipo || 'general') + '</span>';
        h += '<p style="font-size:0.8rem;">' + escapeHtml((r.descripcion || '').substring(0, 60)) + '...</p>';
        h += '<small>' + formatearFecha(r.fecha) + '</small></div>';
    }
    c.innerHTML = h;
}

// ============================================
// CARGA DE PAGINAS
// ============================================
function cargarPagina(page) {
    var c = document.getElementById('page-content');
    if (!c) return;
    c.innerHTML = '<div class="page-loader"><div class="spinner"></div><p>Cargando...</p></div>';
    setTimeout(function() {
        var paginas = {
            'inicio': cargarInicio, 'horarios': cargarHorarios, 'asistencia': cargarAsistencia,
            'noticias': cargarNoticias, 'eventos': cargarEventos, 'publicaciones': cargarPublicaciones,
            'perfil': cargarPerfil, 'configuracion': cargarConfiguracion,
            'gestion-reportes': cargarGestionReportes, 'mis-reportes': cargarMisReportes,
            'dashboard': cargarDashboard, 'sistema': cargarSistema,
            'peticiones': cargarPeticiones, 'biblioteca': cargarBiblioteca,
            'podcast': cargarPodcast, 'galeria': cargarGaleria,
            'chat': cargarChat, 'directorio': cargarDirectorio,
            'donaciones': cargarDonaciones, 'devocional': cargarDevocional
        };
        var fn = paginas[page];
        if (fn) fn(c);
        else c.innerHTML = '<div class="card fade-in"><h2>' + (CONFIG.TITULOS_PAGINAS[page] || page) + '</h2><p style="text-align:center;padding:40px;">Seccion en desarrollo</p></div>';
    }, 150);
}

function cargarInicio(c) {
    c.innerHTML = '<div class="fade-in">' +
        '<div class="contador-container"><div class="contador-titulo">Culto Dominical</div>' +
        '<div class="contador-tiempo">' +
        '<div class="contador-item"><span class="contador-numero" id="contador-dias">00</span><span class="contador-etiqueta">Dias</span></div>' +
        '<div class="contador-item"><span class="contador-numero" id="contador-horas">00</span><span class="contador-etiqueta">Horas</span></div>' +
        '<div class="contador-item"><span class="contador-numero" id="contador-minutos">00</span><span class="contador-etiqueta">Minutos</span></div>' +
        '<div class="contador-item"><span class="contador-numero" id="contador-segundos">00</span><span class="contador-etiqueta">Segundos</span></div>' +
        '</div><div class="contador-estado estado-proximo" id="contador-estado">PROXIMO CULTO</div></div>' +
        '<div class="card"><h3>IPUC LA FONDA v' + CONFIG.VERSION + '</h3><p>"Donde el Espiritu Santo se mueve"</p></div>' +
        '<div class="card"><h3>Accesos Rapidos</h3>' +
        '<button class="btn-outline btn-sm" onclick="navegarA(\'asistencia\')">Asistencia</button> ' +
        '<button class="btn-outline btn-sm" onclick="navegarA(\'publicaciones\')">Publicar</button> ' +
        '<button class="btn-outline btn-sm" onclick="navegarA(\'eventos\')">Eventos</button> ' +
        '<button class="btn-outline btn-sm" onclick="navegarA(\'peticiones\')">Peticiones</button> ' +
        '<button class="btn-outline btn-sm" onclick="navegarA(\'devocional\')">Devocional</button></div></div>';
    iniciarContador();
}

function cargarHorarios(c) {
    c.innerHTML = '<div class="fade-in"><h2>Horarios de Cultos</h2>' +
        '<div class="card"><h3>Domingo</h3><p>Culto Dominical - 10:00 AM</p></div>' +
        '<div class="card"><h3>Martes</h3><p>Culto de Oracion - 6:00 PM</p></div>' +
        '<div class="card"><h3>Viernes</h3><p>Culto de Jovenes - 6:00 PM</p></div></div>';
}

function cargarAsistencia(c) {
    c.innerHTML = '<div class="fade-in"><h2>Confirmar Asistencia</h2>' +
        '<div class="card" style="text-align:center;padding:30px;">' +
        '<h3>Proximo Culto</h3><p>Domingo 10:00 AM</p>' +
        '<button class="btn-primary btn-sm" onclick="showToast(\'Asistencia confirmada\',\'success\')">Confirmar Asistencia</button></div></div>';
}

function cargarNoticias(c) {
    var noticias = [];
    try { if (window.db) noticias = window.db.getNoticias(10); } catch (e) {}
    var h = '<div class="fade-in"><h2>Noticias</h2>';
    if (noticias.length === 0) h += '<div class="card"><p>No hay noticias publicadas</p></div>';
    else { for (var i = 0; i < noticias.length; i++) { h += '<div class="card"><h3>' + escapeHtml(noticias[i].titulo) + '</h3><p>' + escapeHtml(noticias[i].contenido || '').substring(0, 200) + '...</p></div>'; } }
    h += '</div>';
    c.innerHTML = h;
}

function cargarEventos(c) {
    var eventos = [];
    try { if (window.db) eventos = window.db.getEventos(); } catch (e) {}
    var h = '<div class="fade-in"><h2>Eventos</h2>';
    if (eventos.length === 0) h += '<div class="card"><p>No hay eventos programados</p></div>';
    else { for (var i = 0; i < eventos.length; i++) { h += '<div class="card"><h3>' + escapeHtml(eventos[i].titulo) + '</h3><p>' + (eventos[i].fecha || '') + '</p></div>'; } }
    h += '</div>';
    c.innerHTML = h;
}

function cargarPublicaciones(c) {
    var pub = [];
    try { if (window.db) pub = window.db.getPublicaciones(20); } catch (e) {}
    var h = '<div class="fade-in"><h2>Publicaciones</h2>';
    if (APP_STATE.usuario) {
        h += '<div class="card"><textarea class="form-input" id="pub-contenido" rows="3" placeholder="Que quieres compartir?"></textarea>' +
        '<button class="btn-primary btn-sm" onclick="crearPubLocal()" style="margin-top:8px;">Publicar</button></div>';
    }
    if (pub.length === 0) h += '<div class="card"><p>No hay publicaciones</p></div>';
    else { for (var i = 0; i < pub.length; i++) { h += '<div class="card"><p><strong>' + escapeHtml(pub[i].autor || 'Anonimo') + '</strong></p><p>' + escapeHtml(pub[i].contenido || '') + '</p><small>' + formatearFecha(pub[i].fecha) + '</small></div>'; } }
    h += '</div>';
    c.innerHTML = h;
}

function crearPubLocal() {
    var txt = document.getElementById('pub-contenido');
    if (!txt || !txt.value.trim()) { showToast('Escribe algo', 'warning'); return; }
    if (!APP_STATE.usuario) { showToast('Inicia sesion', 'warning'); return; }
    var pub = { id: 'pub_' + Date.now(), usuario_id: APP_STATE.usuario.id || 0, autor: APP_STATE.usuario.nombre, contenido: txt.value.trim(), fecha: new Date().toISOString(), reacciones: {}, comentarios_count: 0 };
    APP_STATE.publicaciones.unshift(pub);
    try { if (window.db) window.db.addPublicacion(pub); } catch (e) {}
    showToast('Publicado', 'success');
    navegarA('publicaciones');
}

function cargarPerfil(c) {
    if (!APP_STATE.usuario) { c.innerHTML = '<div class="fade-in"><h2>Perfil</h2><div class="card"><p>Inicia sesion para ver tu perfil</p></div></div>'; return; }
    var u = APP_STATE.usuario;
    c.innerHTML = '<div class="fade-in"><h2>Mi Perfil</h2>' +
        '<div class="card" style="text-align:center;">' +
        '<img src="' + (u.foto || 'assets/avatars/default.png') + '" style="width:80px;height:80px;border-radius:50%;margin-bottom:12px;">' +
        '<h3>' + (u.nombre || '') + ' ' + (u.apellidos || '') + '</h3>' +
        '<p>@' + (u.usuario || '') + '</p><p>' + (u.correo || '') + '</p><p>' + (u.ministerio || 'General') + '</p></div>' +
        '<button class="btn-danger btn-sm" onclick="confirmarAccion(\'Cerrar sesion?\',\'\',cerrarSesion,\'danger\')">Cerrar Sesion</button></div>';
}

function cargarConfiguracion(c) {
    c.innerHTML = '<div class="fade-in"><h2>Configuracion</h2>' +
        '<div class="card"><h3>Apariencia</h3><button class="btn-secondary btn-sm" onclick="toggleTema()">Cambiar Tema (' + (APP_STATE.tema === 'dark' ? 'Oscuro' : 'Claro') + ')</button></div>' +
        '<div class="card"><h3>Idioma</h3>' +
        '<button class="btn-outline btn-sm" onclick="cambiarIdioma(\'es\')">ES</button> ' +
        '<button class="btn-outline btn-sm" onclick="cambiarIdioma(\'en\')">EN</button> ' +
        '<button class="btn-outline btn-sm" onclick="cambiarIdioma(\'pt\')">PT</button> ' +
        '<button class="btn-outline btn-sm" onclick="cambiarIdioma(\'fr\')">FR</button></div>' +
        '<div class="card"><p>IPUC LA FONDA v' + CONFIG.VERSION + '</p><p>&copy; 2026</p></div>' +
        (APP_STATE.usuario ? '<button class="btn-danger btn-sm" onclick="confirmarAccion(\'Cerrar sesion?\',\'\',cerrarSesion,\'danger\')">Cerrar Sesion</button>' : '') +
        '</div>';
}

function cargarGestionReportes(c) {
    var h = '<div class="fade-in"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    h += '<h2>Gestion de Reportes</h2>';
    h += '<button class="btn-primary btn-sm" onclick="abrirModalReporte()">Nuevo Reporte</button></div>';
    h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">';
    h += '<div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">' + APP_STATE.reportes.length + '</p><p style="font-size:0.75rem;">Total</p></div>';
    h += '<div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">' + APP_STATE.reportsPendientes + '</p><p style="font-size:0.75rem;">Pendientes</p></div>';
    h += '<div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">' + APP_STATE.reportes.filter(function(r){return r.estado==='resuelto';}).length + '</p><p style="font-size:0.75rem;">Resueltos</p></div>';
    h += '<div class="card" style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">' + APP_STATE.reportes.filter(function(r){return r.estado==='desestimado';}).length + '</p><p style="font-size:0.75rem;">Desestimados</p></div>';
    h += '</div>';
    if (APP_STATE.reportes.length === 0) { h += '<div class="card" style="text-align:center;padding:40px;"><p>No hay reportes registrados</p></div>'; }
    else {
        for (var i = 0; i < APP_STATE.reportes.length; i++) {
            var r = APP_STATE.reportes[i];
            h += '<div class="card" style="margin-bottom:8px;border-left:4px solid ' + (r.urgencia === 'critica' ? 'var(--error)' : r.urgencia === 'alta' ? 'var(--advertencia)' : 'var(--info)') + ';">';
            h += '<div style="display:flex;justify-content:space-between;align-items:start;">';
            h += '<div style="flex:1;">';
            h += '<span class="badge estado-' + (r.estado || 'pendiente') + '" style="margin-right:6px;">' + (r.estado || 'pendiente') + '</span>';
            h += '<span class="badge tipo-' + (r.tipo || 'general') + '">' + (r.tipo || 'general') + '</span>';
            h += '<p style="font-size:0.9rem;margin:4px 0;">' + escapeHtml((r.descripcion || '').substring(0, 100)) + '...</p>';
            h += '<small>Reportado por: ' + (r.reportado_por ? r.reportado_por.nombre : 'Anonimo') + ' - ' + formatearFecha(r.fecha) + '</small>';
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
    if (!APP_STATE.usuario) { c.innerHTML = '<div class="fade-in"><h2>Mis Reportes</h2><div class="card"><p>Inicia sesion para ver tus reportes</p></div></div>'; return; }
    var mis = [];
    for (var i = 0; i < APP_STATE.reportes.length; i++) {
        if (APP_STATE.reportes[i].reportado_por && APP_STATE.reportes[i].reportado_por.id === APP_STATE.usuario.id) mis.push(APP_STATE.reportes[i]);
    }
    var h = '<div class="fade-in"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    h += '<h2>Mis Reportes</h2><button class="btn-primary btn-sm" onclick="abrirModalReporte()">Nuevo Reporte</button></div>';
    if (mis.length === 0) h += '<div class="card" style="text-align:center;padding:40px;"><p>No has generado ningun reporte</p></div>';
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

function cargarDashboard(c) { c.innerHTML = '<div class="fade-in"><h2>Dashboard</h2><div class="card"><p>Panel de Administracion</p><p>Bienvenido al panel de control de IPUC LA FONDA</p></div></div>'; }
function cargarSistema(c) { c.innerHTML = '<div class="fade-in"><h2>Sistema</h2><div class="card"><p><strong>Version:</strong> ' + CONFIG.VERSION + '</p><p><strong>Modo:</strong> ' + (APP_STATE.isOnline ? 'Online' : 'Offline') + '</p><p><strong>Tema:</strong> ' + APP_STATE.tema + '</p><p><strong>Idioma:</strong> ' + APP_STATE.idioma.toUpperCase() + '</p></div></div>'; }
function cargarPeticiones(c) { c.innerHTML = '<div class="fade-in"><h2>Peticiones de Oracion</h2><div class="card"><p>Comparte tus peticiones de oracion</p><textarea class="form-input" id="pet-motivo" rows="2" placeholder="Motivo de oracion..."></textarea><button class="btn-primary btn-sm" onclick="crearPeticionLocal()" style="margin-top:8px;">Enviar Peticion</button></div></div>'; }
function crearPeticionLocal() {
    var m = document.getElementById('pet-motivo');
    if (!m || !m.value.trim()) { showToast('Escribe un motivo', 'warning'); return; }
    if (!APP_STATE.usuario) { showToast('Inicia sesion', 'warning'); return; }
    try { if (window.db) window.db.addPeticion({ usuario_id: APP_STATE.usuario.id, nombre: APP_STATE.usuario.nombre, motivo: m.value.trim() }); } catch (e) {}
    showToast('Peticion enviada', 'success');
    navegarA('peticiones');
}
function cargarBiblioteca(c) { c.innerHTML = '<div class="fade-in"><h2>Biblioteca Digital</h2><div class="card"><p>Recursos cristianos disponibles</p><p>Proximamente...</p></div></div>'; }
function cargarPodcast(c) { c.innerHTML = '<div class="fade-in"><h2>Podcast</h2><div class="card"><p>Episodios de podcast</p><p>Proximamente...</p></div></div>'; }
function cargarGaleria(c) { c.innerHTML = '<div class="fade-in"><h2>Galeria</h2><div class="card"><p>Imagenes de la iglesia</p><p>Proximamente...</p></div></div>'; }
function cargarChat(c) { c.innerHTML = '<div class="fade-in"><h2>Chat Global</h2><div class="card"><p>Chat comunitario</p><p>Proximamente...</p></div></div>'; }
function cargarDirectorio(c) { c.innerHTML = '<div class="fade-in"><h2>Directorio</h2><div class="card"><p>Miembros de la iglesia</p><p>Proximamente...</p></div></div>'; }
function cargarDonaciones(c) { c.innerHTML = '<div class="fade-in"><h2>Donaciones</h2><div class="card"><p>Sistema de donaciones</p><p>Proximamente...</p></div></div>'; }
function cargarDevocional(c) {
    c.innerHTML = '<div class="fade-in"><h2>Devocional Diario</h2>' +
        '<div class="card" style="text-align:center;padding:30px;">' +
        '<p style="font-style:italic;font-size:1.2rem;">"Jehova es mi pastor; nada me faltara."</p>' +
        '<p style="font-weight:700;margin-top:12px;">Salmos 23:1</p>' +
        '<button class="btn-primary btn-sm" onclick="compartirVersiculo()" style="margin-top:16px;">Compartir Versiculo</button></div></div>';
}

// ============================================
// INICIALIZACION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    try { var t = localStorage.getItem('ipuc18_tema') || 'light'; APP_STATE.tema = t; aplicarTema(t); } catch (e) {}
    try { APP_STATE.idioma = localStorage.getItem('ipuc18_idioma') || 'es'; } catch (e) {}

    var token = localStorage.getItem('ipuc18_token');
    var udata = localStorage.getItem('ipuc18_usuario');
    var rol = localStorage.getItem('ipuc18_rol');

    setTimeout(function() {
        var splash = document.getElementById('splash-screen');
        if (splash) { splash.style.opacity = '0'; splash.style.transition = 'opacity 0.5s'; setTimeout(function() { if (splash) splash.style.display = 'none'; }, 500); }
        if (token && udata) {
            try { APP_STATE.token = token; APP_STATE.usuario = JSON.parse(udata); APP_STATE.rol = rol || 'usuario'; mostrarApp(); } catch (e) { mostrarBienvenida(); }
        } else { mostrarBienvenida(); }
    }, 2000);

    inicializarEventos();
    manejarResponsiveSidebar();
    window.addEventListener('resize', manejarResponsiveSidebar);
    window.addEventListener('online', function() { APP_STATE.isOnline = true; });
    window.addEventListener('offline', function() { APP_STATE.isOnline = false; });
});

function inicializarEventos() {
    var mt = document.getElementById('menu-toggle');
    if (mt) mt.addEventListener('click', toggleSidebar);
    var cs = document.getElementById('close-sidebar');
    if (cs) cs.addEventListener('click', cerrarSidebar);
    var so = document.getElementById('sidebar-overlay');
    if (so) so.addEventListener('click', cerrarSidebar);

    var items = document.querySelectorAll('.nav-item[data-page]');
    for (var i = 0; i < items.length; i++) {
        items[i].addEventListener('click', function(e) { e.preventDefault(); var p = this.getAttribute('data-page'); if (p) navegarA(p); });
    }

    var tt = document.getElementById('theme-toggle');
    if (tt) tt.addEventListener('click', toggleTema);
    var nt = document.getElementById('notifications-toggle');
    if (nt) nt.addEventListener('click', toggleNotificaciones);
    var rt = document.getElementById('reports-quick-toggle');
    if (rt) rt.addEventListener('click', togglePanelReportes);
    var st = document.getElementById('search-toggle');
    if (st) st.addEventListener('click', toggleSearchBar);
    var sc = document.getElementById('search-close');
    if (sc) sc.addEventListener('click', function() { var b = document.getElementById('search-bar'); if (b) b.classList.add('hidden'); APP_STATE.searchBarOpen = false; });
    var fm = document.getElementById('fab-main');
    if (fm) fm.addEventListener('click', toggleFabMenu);

    var fabItems = document.querySelectorAll('.fab-item');
    for (var j = 0; j < fabItems.length; j++) {
        fabItems[j].addEventListener('click', function() {
            var action = this.getAttribute('data-action');
            if (action === 'reporte') abrirModalReporte();
            else if (action === 'oracion') navegarA('peticiones');
            else if (action === 'musica') navegarA('podcast');
            else if (action === 'evento') navegarA('eventos');
            else if (action === 'donacion') navegarA('donaciones');
            else if (action === 'compartir') compartirVersiculo();
            toggleFabMenu();
        });
    }

    var um = document.getElementById('user-mini');
    if (um) um.addEventListener('click', toggleUserDropdown);
    var bl = document.getElementById('btn-logout');
    if (bl) bl.addEventListener('click', function(e) { e.preventDefault(); confirmarAccion('Cerrar sesion?', '', cerrarSesion, 'danger'); });
    var bg = document.getElementById('btn-guest');
    if (bg) bg.addEventListener('click', continuarComoInvitado);

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

    var cc = document.getElementById('confirm-cancel');
    if (cc) cc.addEventListener('click', function() { var m = document.getElementById('confirm-modal'); if (m) m.classList.add('hidden'); APP_STATE.pendingConfirmation = null; });
    var ca = document.getElementById('confirm-accept');
    if (ca) ca.addEventListener('click', function() { if (APP_STATE.pendingConfirmation) { APP_STATE.pendingConfirmation(); APP_STATE.pendingConfirmation = null; } var m = document.getElementById('confirm-modal'); if (m) m.classList.add('hidden'); });

    var rf = document.getElementById('report-form');
    if (rf) rf.addEventListener('submit', generarReporte);
    var cr = document.getElementById('btn-cancel-report');
    if (cr) cr.addEventListener('click', cerrarModalReporte);

    var reportTypes = document.querySelectorAll('input[name="report-type"]');
    for (var k = 0; k < reportTypes.length; k++) {
        reportTypes[k].addEventListener('change', function() { cambiarTipoReporte(this.value); });
    }

    var reportUser = document.getElementById('report-user');
    if (reportUser) reportUser.addEventListener('input', function() { buscarUsuarioReporte(this.value); });

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

    var closeReports = document.getElementById('close-reports-quick');
    if (closeReports) closeReports.addEventListener('click', function() { var p = document.getElementById('reports-quick-panel'); if (p) p.classList.add('hidden'); APP_STATE.reportsPanelOpen = false; });
    var closeNotif = document.getElementById('close-notifications');
    if (closeNotif) closeNotif.addEventListener('click', function() { var p = document.getElementById('notification-panel'); if (p) p.classList.add('hidden'); APP_STATE.notificationsOpen = false; });

    var modal = document.getElementById('modal');
    if (modal) modal.addEventListener('click', function(e) { if (e.target.classList.contains('modal-backdrop')) cerrarModal(); });
    var modalClose = document.querySelector('.modal-close');
    if (modalClose) modalClose.addEventListener('click', cerrarModal);

    var confirmModal = document.getElementById('confirm-modal');
    if (confirmModal) confirmModal.addEventListener('click', function(e) { if (e.target.classList.contains('modal-backdrop')) { confirmModal.classList.add('hidden'); APP_STATE.pendingConfirmation = null; } });

    var reportModal = document.getElementById('report-modal');
    if (reportModal) reportModal.addEventListener('click', function(e) { if (e.target.classList.contains('modal-backdrop')) cerrarModalReporte(); });

    var viewReportModal = document.getElementById('view-report-modal');
    if (viewReportModal) viewReportModal.addEventListener('click', function(e) { if (e.target.classList.contains('modal-backdrop')) viewReportModal.classList.add('hidden'); });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (APP_STATE.notificationsOpen) { var p = document.getElementById('notification-panel'); if (p) p.classList.add('hidden'); APP_STATE.notificationsOpen = false; }
            if (APP_STATE.reportsPanelOpen) { var rp = document.getElementById('reports-quick-panel'); if (rp) rp.classList.add('hidden'); APP_STATE.reportsPanelOpen = false; }
            if (APP_STATE.searchBarOpen) { var b = document.getElementById('search-bar'); if (b) b.classList.add('hidden'); APP_STATE.searchBarOpen = false; }
            var m = document.getElementById('modal');
            if (m && !m.classList.contains('hidden')) cerrarModal();
            var rm = document.getElementById('report-modal');
            if (rm && !rm.classList.contains('hidden')) cerrarModalReporte();
        }
        if (e.ctrlKey && e.key === 'k') { e.preventDefault(); toggleSearchBar(); }
    });

    document.addEventListener('click', function(e) {
        if (APP_STATE.userDropdownOpen && !e.target.closest('#user-mini') && !e.target.closest('#user-dropdown')) {
            var d = document.getElementById('user-dropdown'); if (d) d.classList.add('hidden'); APP_STATE.userDropdownOpen = false;
        }
        if (APP_STATE.fabMenuOpen && !e.target.closest('#fab-main') && !e.target.closest('#fab-menu')) {
            var f = document.getElementById('fab-menu'); if (f) f.classList.add('hidden'); APP_STATE.fabMenuOpen = false;
        }
    });

    var langBtns = document.querySelectorAll('.lang-btn');
    for (var n = 0; n < langBtns.length; n++) {
        langBtns[n].addEventListener('click', function() { var l = this.getAttribute('data-lang'); if (l) cambiarIdioma(l); });
    }

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
                localStorage.setItem('ipuc18_token', resultado.token);
                localStorage.setItem('ipuc18_usuario', JSON.stringify(resultado.usuario));
                localStorage.setItem('ipuc18_rol', resultado.rol);
                mostrarApp();
                showToast('Bienvenido ' + resultado.usuario.nombre, 'success');
            } else {
                showToast(resultado.error || 'Error al iniciar sesion', 'error');
            }
        }
    });

    var registerForm = document.getElementById('register-form');
    if (registerForm) registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var nombre = document.getElementById('reg-nombre');
        var email = document.getElementById('reg-email');
        var pass = document.getElementById('reg-password');
        if (nombre && email && pass && nombre.value && email.value && pass.value) {
            var resultado = registro({ nombre: nombre.value, correo: email.value, password: pass.value, usuario: email.value.split('@')[0], ministerio: 'General' });
            if (resultado.success) {
                showToast('Registro exitoso. Inicia sesion', 'success');
                document.getElementById('register-form-container').classList.add('hidden');
                document.getElementById('login-form-container').classList.remove('hidden');
            } else {
                showToast(resultado.error || 'Error al registrar', 'error');
            }
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
window.compartirVersiculo = compartirVersiculo;
window.crearPubLocal = crearPubLocal;
window.crearPeticionLocal = crearPeticionLocal;
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
window.cargarReportesRecientes = cargarReportesRecientes;
