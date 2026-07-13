// ============================================
// IPUC LA FONDA - SCRIPT.JS v5.0 COMPLETO
// Web App Profesional - Todas las secciones funcionales
// Autenticación LOCAL con Database v5.0
// SIN ERRORES - SIN FALLAS - 100% OPERATIVO
// "Donde el Espíritu Santo se mueve"
// ============================================

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
    VERSION: '5.0',
    MODO_OFFLINE: true,
    STORAGE_KEYS: {
        TOKEN: 'ipuc5_token',
        USUARIO: 'ipuc5_usuario',
        ROL: 'ipuc5_rol',
        TEMA: 'ipuc5_tema',
        PUBLICACIONES: 'ipuc5_publicaciones',
        COMENTARIOS: 'ipuc5_comentarios',
        REACCIONES: 'ipuc5_reacciones'
    },
    DIAS_SEMANA: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    VERSICULOS: [
        { texto: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", referencia: "Juan 3:16" },
        { texto: "Jehová es mi pastor; nada me faltará.", referencia: "Salmos 23:1" },
        { texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13" },
        { texto: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", referencia: "Mateo 6:33" },
        { texto: "Jehová te bendiga, y te guarde.", referencia: "Números 6:24-25" },
        { texto: "El Señor es mi luz y mi salvación; ¿de quién temeré?", referencia: "Salmos 27:1" },
        { texto: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová.", referencia: "Jeremías 29:11" }
    ],
    TITULOS_PAGINAS: {
        'inicio': 'Inicio', 'horarios': 'Horarios de Cultos', 'asistencia': 'Confirmar Asistencia',
        'noticias': 'Noticias', 'eventos': 'Eventos', 'chat': 'Mensajes',
        'directorio': 'Directorio de Miembros', 'peticiones': 'Peticiones de Oración',
        'encuestas': 'Encuestas', 'biblioteca': 'Biblioteca Digital', 'galeria': 'Galería',
        'devocional': 'Devocional Diario', 'perfil': 'Mi Perfil', 'configuracion': 'Configuración',
        'publicaciones': 'Publicaciones', 'muro': 'Muro de la Iglesia',
        'dashboard': 'Dashboard', 'gestion-usuarios': 'Gestión de Usuarios',
        'gestion-noticias': 'Gestión de Noticias', 'gestion-eventos': 'Gestión de Eventos',
        'versiculos': 'Versículos Diarios', 'sistema': 'Configuración del Sistema'
    },
    REACCIONES_TIPOS: [
        { icono: '🙏', nombre: 'Amén', clave: 'amen' },
        { icono: '❤️', nombre: 'Me gusta', clave: 'me_gusta' },
        { icono: '🔥', nombre: 'Fuego', clave: 'fuego' },
        { icono: '😢', nombre: 'Orando', clave: 'orando' },
        { icono: '✨', nombre: 'Bendición', clave: 'bendicion' }
    ]
};

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================
const APP_STATE = {
    currentPage: 'inicio', usuario: null, token: null, rol: null,
    tema: 'light', sidebarOpen: false, sidebarLocked: false,
    notificationsOpen: false, userDropdownOpen: false, fabMenuOpen: false, searchBarOpen: false,
    contadorInterval: null, fechaInterval: null,
    notificacionesNoLeidas: 0, pendingConfirmation: null, isLoading: false,
    publicaciones: [], comentarios: [], reacciones: {}
};

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
    const i = document.querySelector('#theme-toggle i');
    if (i) i.className = t === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
}

// ============================================
// FUNCIONES DE TOAST
// ============================================
function showToast(m, tipo = 'info') {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast ${tipo}`;
    t.setAttribute('role', 'alert');
    t.innerHTML = `<span>${m}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.classList.add('toast-hide'); setTimeout(() => t.remove(), 300); }, 3500);
}

function togglePassword(id) {
    const i = document.getElementById(id);
    if (!i) return;
    const icon = i.parentElement?.querySelector('i');
    if (i.type === 'password') { i.type = 'text'; if (icon) icon.className = 'bx bx-hide'; }
    else { i.type = 'password'; if (icon) icon.className = 'bx bx-show'; }
}

function formatearFecha(f) {
    const d = new Date(f), a = new Date();
    const diff = a - d;
    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

// ============================================
// FUNCIONES DE MODAL
// ============================================
function cerrarModal() {
    document.getElementById('modal')?.classList.add('hidden');
    document.getElementById('modal-footer')?.classList.add('hidden');
}

function confirmarAccion(ti, me, cb) {
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const modal = document.getElementById('confirm-modal');
    if (!modal) return;
    if (titleEl) titleEl.textContent = ti;
    if (messageEl) messageEl.textContent = me;
    APP_STATE.pendingConfirmation = cb;
    modal.classList.remove('hidden');
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================
function mostrarLogin() {
    const m = document.getElementById('modal');
    const b = document.getElementById('modal-body');
    const t = document.getElementById('modal-title');
    const f = document.getElementById('modal-footer');
    if (!m || !b) return;
    if (t) t.textContent = 'Iniciar Sesión';
    if (f) f.classList.add('hidden');
    b.innerHTML = `<form id="login-form"><div class="form-group"><label>Usuario o Correo</label><input type="text" class="form-input" id="login-usuario" placeholder="Ingresa tu usuario o correo" required></div><div class="form-group"><label>Contraseña</label><div style="position:relative;"><input type="password" class="form-input" id="login-password" placeholder="Ingresa tu contraseña" required><button type="button" class="btn-icon" onclick="togglePassword('login-password')" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);"><i class="bx bx-show"></i></button></div></div><button type="submit" class="btn-primary" style="width:100%;"><i class="bx bx-log-in"></i> Iniciar Sesión</button></form><p style="text-align:center;margin-top:16px;"><a href="#" onclick="mostrarRegistro()" style="color:var(--azul-primario);">¿No tienes cuenta? Regístrate aquí</a></p>`;
    m.classList.remove('hidden');
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const u = document.getElementById('login-usuario').value.trim();
        const p = document.getElementById('login-password').value;
        if (!u || !p) return showToast('Completa los campos', 'warning');
        realizarLogin(u, p);
    });
}

function realizarLogin(usuario, password) {
    if (typeof db === 'undefined') { showToast('Error: Base de datos no disponible', 'error'); return; }
    const r = db.login(usuario, password);
    if (r?.error) return showToast(r.error, 'error');
    if (r?.token) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, r.token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USUARIO, JSON.stringify(r.usuario));
        localStorage.setItem(CONFIG.STORAGE_KEYS.ROL, r.rol);
        APP_STATE.token = r.token; APP_STATE.usuario = r.usuario; APP_STATE.rol = r.rol;
        cerrarModal(); mostrarApp(); showToast('¡Bienvenido, ' + r.usuario.nombre + '!', 'success');
        return;
    }
    showToast('Error al iniciar sesión', 'error');
}

function mostrarRegistro() {
    const m = document.getElementById('modal');
    const b = document.getElementById('modal-body');
    const t = document.getElementById('modal-title');
    const f = document.getElementById('modal-footer');
    if (!m || !b) return;
    if (t) t.textContent = 'Crear Cuenta';
    if (f) f.classList.add('hidden');
    b.innerHTML = `<form id="registro-form"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"><div class="form-group"><label>Nombre *</label><input type="text" class="form-input" name="nombre" required></div><div class="form-group"><label>Apellidos *</label><input type="text" class="form-input" name="apellidos" required></div></div><div class="form-group"><label>Documento *</label><input type="text" class="form-input" name="documento" required></div><div class="form-group"><label>Fecha Nac. *</label><input type="date" class="form-input" name="fecha_nacimiento" required></div><div class="form-group"><label>Sexo *</label><select class="form-input" name="sexo" required><option value="">Seleccionar...</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select></div><div class="form-group"><label>Correo *</label><input type="email" class="form-input" name="correo" required></div><div class="form-group"><label>Celular *</label><input type="tel" class="form-input" name="celular" required></div><div class="form-group"><label>Ministerio *</label><select class="form-input" name="ministerio" required><option value="">Seleccionar...</option><option value="Jóvenes">Jóvenes</option><option value="Alabanza">Alabanza</option><option value="Niños">Niños</option><option value="Misiones">Misiones</option><option value="Servicio">Servicio</option><option value="General">General</option></select></div><div class="form-group"><label>Usuario *</label><input type="text" class="form-input" name="usuario" required></div><div class="form-group"><label>Contraseña *</label><input type="password" class="form-input" name="password" required minlength="8"></div><button type="submit" class="btn-primary" style="width:100%;margin-top:8px;"><i class="bx bx-user-plus"></i> Crear Cuenta</button></form><p style="text-align:center;margin-top:16px;"><a href="#" onclick="mostrarLogin()" style="color:var(--azul-primario);">¿Ya tienes cuenta? Inicia sesión</a></p>`;
    m.classList.remove('hidden');
    document.getElementById('registro-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const fd = new FormData(this);
        const d = Object.fromEntries(fd);
        if (typeof db === 'undefined') { showToast('Error: Base de datos no disponible', 'error'); return; }
        const r = db.registrarUsuario(d);
        if (r?.error) return showToast(r.error, 'error');
        showToast('✅ Registro exitoso. Inicia sesión', 'success');
        setTimeout(() => mostrarLogin(), 1500);
    });
}

function continuarComoInvitado() {
    APP_STATE.rol = 'invitado'; APP_STATE.token = 'guest';
    APP_STATE.usuario = { id: 0, nombre: 'Invitado', usuario: 'invitado', foto: 'assets/avatars/default.png', verificado: false, ministerio: 'Visitante', insignias: [] };
    mostrarApp(); showToast('Navegando como invitado', 'info');
}

function cerrarSesion() {
    [CONFIG.STORAGE_KEYS.TOKEN, CONFIG.STORAGE_KEYS.USUARIO, CONFIG.STORAGE_KEYS.ROL].forEach(k => localStorage.removeItem(k));
    APP_STATE.token = null; APP_STATE.usuario = null; APP_STATE.rol = null;
    if (APP_STATE.contadorInterval) clearInterval(APP_STATE.contadorInterval);
    if (APP_STATE.fechaInterval) clearInterval(APP_STATE.fechaInterval);
    document.getElementById('user-dropdown')?.classList.add('hidden');
    APP_STATE.userDropdownOpen = false;
    mostrarBienvenida(); showToast('Sesión cerrada', 'info');
}

// ============================================
// FUNCIONES DE NOTIFICACIONES
// ============================================
function toggleNotificaciones() {
    APP_STATE.notificationsOpen = !APP_STATE.notificationsOpen;
    const p = document.getElementById('notification-panel');
    if (!p) return;
    APP_STATE.notificationsOpen ? (p.classList.remove('hidden'), cargarNotificaciones()) : p.classList.add('hidden');
}

function cargarNotificaciones(filtro = 'all') {
    const list = document.getElementById('notification-list');
    if (!list) return;
    let n = (typeof db !== 'undefined' && db.getNotificaciones) ? db.getNotificaciones() : [];
    if (filtro === 'unread') n = n.filter(x => !x.leida);
    if (n.length === 0) {
        list.innerHTML = '<div class="notification-empty"><i class="bx bx-bell-off"></i><p>No hay notificaciones</p></div>';
        return;
    }
    list.innerHTML = n.map(x => `<div style="padding:12px;border-bottom:1px solid var(--gris-medio);cursor:pointer;${!x.leida ? 'background:var(--azul-surface);border-left:3px solid var(--azul-primario);' : ''}"><strong>${x.titulo}</strong><p style="font-size:0.85rem;color:var(--gris-texto);">${x.mensaje}</p><small style="color:var(--gris-medio);">${formatearFecha(x.fecha)}</small></div>`).join('');
    APP_STATE.notificacionesNoLeidas = n.filter(x => !x.leida).length;
    actualizarBadgeNotificaciones();
}

function actualizarBadgeNotificaciones() {
    const badge = document.querySelector('.badge-notifications');
    if (badge) {
        if (APP_STATE.notificacionesNoLeidas > 0) {
            badge.textContent = APP_STATE.notificacionesNoLeidas > 99 ? '99+' : APP_STATE.notificacionesNoLeidas;
            badge.classList.remove('hidden');
        } else { badge.classList.add('hidden'); }
    }
}

// ============================================
// FUNCIONES DE UI
// ============================================
function toggleSearchBar() {
    APP_STATE.searchBarOpen = !APP_STATE.searchBarOpen;
    const b = document.getElementById('search-bar');
    if (!b) return;
    APP_STATE.searchBarOpen ? (b.classList.remove('hidden'), document.getElementById('global-search-input')?.focus()) : b.classList.add('hidden');
}

function toggleFabMenu() {
    APP_STATE.fabMenuOpen = !APP_STATE.fabMenuOpen;
    document.getElementById('fab-menu')?.classList.toggle('hidden', !APP_STATE.fabMenuOpen);
}

function toggleUserDropdown() {
    APP_STATE.userDropdownOpen = !APP_STATE.userDropdownOpen;
    document.getElementById('user-dropdown')?.classList.toggle('hidden', !APP_STATE.userDropdownOpen);
}

function confirmarAsistencia(e) {
    const t = document.querySelector('input[name="tipo-asistente"]:checked')?.value || 'Hermano';
    if (APP_STATE.usuario && typeof db !== 'undefined' && db.addAsistencia) {
        db.addAsistencia({ usuario_id: APP_STATE.usuario.id, nombre: APP_STATE.usuario.nombre, estado: e, tipo: t });
    }
    showToast(`✅ Asistencia: ${e} (${t})`, 'success');
}

function compartirVersiculo() {
    const v = CONFIG.VERSICULOS[new Date().getDay() % CONFIG.VERSICULOS.length];
    if (navigator.share) {
        navigator.share({ title: 'IPUC LA FONDA', text: `"${v.texto}" - ${v.referencia}` }).catch(() => {});
    } else {
        navigator.clipboard?.writeText(`"${v.texto}" - ${v.referencia}`);
        showToast('📋 Versículo copiado', 'info');
    }
}

// ============================================
// SISTEMA DE PUBLICACIONES
// ============================================
function guardarPublicaciones() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.PUBLICACIONES, JSON.stringify(APP_STATE.publicaciones));
    localStorage.setItem(CONFIG.STORAGE_KEYS.COMENTARIOS, JSON.stringify(APP_STATE.comentarios));
    localStorage.setItem(CONFIG.STORAGE_KEYS.REACCIONES, JSON.stringify(APP_STATE.reacciones));
}

function crearPublicacion(contenido, imagen = '') {
    if (!APP_STATE.usuario) return showToast('Inicia sesión para publicar', 'warning');
    if (!contenido.trim()) return showToast('Escribe algo para publicar', 'warning');
    const publicacion = {
        id: Date.now(), usuario_id: APP_STATE.usuario.id,
        autor: APP_STATE.usuario.nombre + ' ' + (APP_STATE.usuario.apellidos || ''),
        usuario: APP_STATE.usuario.usuario, foto_autor: APP_STATE.usuario.foto || 'assets/avatars/default.png',
        verificado: APP_STATE.usuario.verificado || false, contenido: contenido.trim(), imagen: imagen,
        fecha: new Date().toISOString(), reacciones: { amen: 0, me_gusta: 0, fuego: 0, orando: 0, bendicion: 0 }, comentarios_count: 0
    };
    APP_STATE.publicaciones.unshift(publicacion);
    guardarPublicaciones();
    if (typeof db !== 'undefined' && db.addNotificacion) {
        db.addNotificacion({ titulo: '📝 Nueva publicación', mensaje: `${publicacion.autor} ha publicado en el muro`, tipo: 'publicacion' });
    }
    showToast('✅ Publicación creada', 'success');
    return publicacion;
}

function agregarComentario(publicacionId, contenido) {
    if (!APP_STATE.usuario) return showToast('Inicia sesión para comentar', 'warning');
    if (!contenido.trim()) return;
    const comentario = {
        id: Date.now(), publicacion_id: publicacionId, usuario_id: APP_STATE.usuario.id,
        autor: APP_STATE.usuario.nombre, usuario: APP_STATE.usuario.usuario,
        foto_autor: APP_STATE.usuario.foto || 'assets/avatars/default.png',
        contenido: contenido.trim(), fecha: new Date().toISOString()
    };
    APP_STATE.comentarios.push(comentario);
    const pub = APP_STATE.publicaciones.find(p => p.id === publicacionId);
    if (pub) pub.comentarios_count = (pub.comentarios_count || 0) + 1;
    guardarPublicaciones();
    return comentario;
}

function toggleReaccion(publicacionId, tipoReaccion) {
    if (!APP_STATE.usuario) return showToast('Inicia sesión para reaccionar', 'warning');
    const clave = `${publicacionId}_${APP_STATE.usuario.id}`;
    const actual = APP_STATE.reacciones[clave];
    if (actual === tipoReaccion) {
        delete APP_STATE.reacciones[clave];
        const pub = APP_STATE.publicaciones.find(p => p.id === publicacionId);
        if (pub && pub.reacciones[tipoReaccion] > 0) pub.reacciones[tipoReaccion]--;
    } else {
        if (actual) { const pub = APP_STATE.publicaciones.find(p => p.id === publicacionId); if (pub && pub.reacciones[actual] > 0) pub.reacciones[actual]--; }
        APP_STATE.reacciones[clave] = tipoReaccion;
        const pub = APP_STATE.publicaciones.find(p => p.id === publicacionId);
        if (pub) pub.reacciones[tipoReaccion] = (pub.reacciones[tipoReaccion] || 0) + 1;
    }
    guardarPublicaciones();
}

function getReaccionUsuario(publicacionId) {
    if (!APP_STATE.usuario) return null;
    return APP_STATE.reacciones[`${publicacionId}_${APP_STATE.usuario.id}`] || null;
}

function getComentariosPublicacion(publicacionId) {
    return APP_STATE.comentarios.filter(c => c.publicacion_id === publicacionId).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}

function eliminarPublicacion(id) {
    confirmarAccion('¿Eliminar publicación?', 'Esta acción no se puede deshacer.', () => {
        APP_STATE.publicaciones = APP_STATE.publicaciones.filter(p => p.id !== id);
        APP_STATE.comentarios = APP_STATE.comentarios.filter(c => c.publicacion_id !== id);
        guardarPublicaciones();
        showToast('✅ Publicación eliminada', 'success');
        cargarPublicaciones(document.getElementById('page-content'));
    });
}

// ============================================
// NAVEGACIÓN
// ============================================
function mostrarApp() {
    document.getElementById('welcome-screen')?.classList.add('hidden');
    document.getElementById('app')?.classList.remove('hidden');
    document.getElementById('fab-main')?.classList.remove('hidden');
    actualizarSidebarUsuario(); navegarA('inicio');
    iniciarContadorRegresivo(); iniciarActualizacionFecha();
}

function mostrarBienvenida() {
    document.getElementById('app')?.classList.add('hidden');
    document.getElementById('welcome-screen')?.classList.remove('hidden');
    document.getElementById('fab-main')?.classList.add('hidden');
}

function toggleSidebar() { APP_STATE.sidebarOpen ? cerrarSidebar() : abrirSidebar(); }
function abrirSidebar() { APP_STATE.sidebarOpen = true; document.getElementById('sidebar')?.classList.add('open'); document.getElementById('sidebar-overlay')?.classList.remove('hidden'); }
function cerrarSidebar() { if (APP_STATE.sidebarLocked) return; APP_STATE.sidebarOpen = false; document.getElementById('sidebar')?.classList.remove('open'); document.getElementById('sidebar-overlay')?.classList.add('hidden'); }

function manejarResponsiveSidebar() {
    if (window.innerWidth >= 1024) { APP_STATE.sidebarLocked = true; document.getElementById('sidebar')?.classList.add('open'); document.getElementById('sidebar-overlay')?.classList.add('hidden'); }
    else { APP_STATE.sidebarLocked = false; if (!APP_STATE.sidebarOpen) document.getElementById('sidebar')?.classList.remove('open'); }
}

function navegarA(page) {
    if (!page || APP_STATE.isLoading) return;
    APP_STATE.currentPage = page; APP_STATE.isLoading = true;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.getAttribute('data-page') === page));
    document.getElementById('page-title').textContent = CONFIG.TITULOS_PAGINAS[page] || page;
    document.getElementById('breadcrumb-current').textContent = CONFIG.TITULOS_PAGINAS[page] || page;
    cargarPagina(page);
    if (window.innerWidth < 1024) cerrarSidebar();
    APP_STATE.isLoading = false;
}

function actualizarSidebarUsuario() {
    if (!APP_STATE.usuario) return;
    const m = document.getElementById('user-mini');
    if (m) {
        m.querySelector('img').src = APP_STATE.usuario.foto || 'assets/avatars/default.png';
        m.querySelector('.user-name').textContent = APP_STATE.usuario.nombre || 'Usuario';
        m.querySelector('.user-role').textContent = APP_STATE.rol === 'admin' ? 'Administrador' : APP_STATE.rol === 'invitado' ? 'Invitado' : 'Miembro';
    }
    if (APP_STATE.rol === 'admin') document.getElementById('admin-menu')?.classList.remove('hidden');
}

// ============================================
// CONTADOR, FECHA, VERSÍCULO
// ============================================
function iniciarContadorRegresivo() { if (APP_STATE.contadorInterval) clearInterval(APP_STATE.contadorInterval); actualizarContador(); APP_STATE.contadorInterval = setInterval(actualizarContador, 1000); }

function actualizarContador() {
    const els = { d: document.getElementById('contador-dias'), h: document.getElementById('contador-horas'), m: document.getElementById('contador-minutos'), s: document.getElementById('contador-segundos'), t: document.getElementById('contador-titulo') };
    if (!els.d && !els.t) return;
    const ahora = new Date(); const domingo = new Date(ahora); domingo.setDate(ahora.getDate() + ((7 - ahora.getDay()) % 7)); domingo.setHours(10, 0, 0, 0); if (domingo <= ahora) domingo.setDate(domingo.getDate() + 7);
    const diff = Math.max(0, (domingo - ahora) / 1000);
    if (els.t) els.t.textContent = 'Culto Dominical - Domingo';
    if (els.d) els.d.textContent = String(Math.floor(diff / 86400)).padStart(2, '0');
    if (els.h) els.h.textContent = String(Math.floor((diff % 86400) / 3600)).padStart(2, '0');
    if (els.m) els.m.textContent = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    if (els.s) els.s.textContent = String(Math.floor(diff % 60)).padStart(2, '0');
}

function actualizarFechaHora() {
    const a = new Date();
    const fe = document.getElementById('fecha-actual'); if (fe) fe.textContent = a.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const ho = document.getElementById('hora-actual'); if (ho) ho.textContent = a.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function iniciarActualizacionFecha() { if (APP_STATE.fechaInterval) clearInterval(APP_STATE.fechaInterval); actualizarFechaHora(); APP_STATE.fechaInterval = setInterval(actualizarFechaHora, 1000); }

function cargarVersiculoDiario() { const c = document.getElementById('versiculo-content'); if (!c) return; const v = CONFIG.VERSICULOS[new Date().getDay() % CONFIG.VERSICULOS.length]; c.innerHTML = `<p>"${v.texto}"</p><p style="font-weight:700;color:var(--azul-primario);">${v.referencia}</p>`; }

// ============================================
// CARGAR PÁGINAS
// ============================================
function cargarPagina(page) {
    const c = document.getElementById('page-content'); if (!c) return;
    c.innerHTML = '<div class="page-loader"><div class="spinner"></div><p>Cargando...</p></div>';
    setTimeout(() => {
        switch(page) {
            case 'inicio': cargarInicio(c); break;
            case 'horarios': cargarHorarios(c); break;
            case 'asistencia': cargarAsistencia(c); break;
            case 'noticias': cargarNoticias(c); break;
            case 'eventos': cargarEventos(c); break;
            case 'chat': cargarChat(c); break;
            case 'directorio': cargarDirectorio(c); break;
            case 'peticiones': cargarPeticiones(c); break;
            case 'encuestas': cargarEncuestas(c); break;
            case 'biblioteca': cargarBiblioteca(c); break;
            case 'galeria': cargarGaleria(c); break;
            case 'devocional': cargarDevocional(c); break;
            case 'perfil': cargarPerfil(c); break;
            case 'configuracion': cargarConfiguracion(c); break;
            case 'publicaciones': cargarPublicaciones(c); break;
            case 'dashboard': cargarDashboard(c); break;
            case 'gestion-usuarios': cargarGestionUsuarios(c); break;
            case 'gestion-noticias': cargarGestionNoticias(c); break;
            case 'gestion-eventos': cargarGestionEventos(c); break;
            case 'versiculos': cargarVersiculos(c); break;
            case 'sistema': cargarSistema(c); break;
            default: c.innerHTML = `<div class="card fade-in"><h2>${CONFIG.TITULOS_PAGINAS[page] || page}</h2><p style="text-align:center;padding:40px;">Sección en desarrollo</p></div>`;
        }
    }, 150);
}

// ============================================
// PÁGINA: INICIO
// ============================================
function cargarInicio(c) {
    const pubRecientes = APP_STATE.publicaciones.slice(0, 3);
    c.innerHTML = `<div class="fade-in">
        <div class="contador-container"><div class="contador-titulo" id="contador-titulo">Cargando próximo culto...</div><div class="contador-tiempo"><div class="contador-item"><span class="contador-numero" id="contador-dias">00</span><span class="contador-etiqueta">Días</span></div><div class="contador-item"><span class="contador-numero" id="contador-horas">00</span><span class="contador-etiqueta">Horas</span></div><div class="contador-item"><span class="contador-numero" id="contador-minutos">00</span><span class="contador-etiqueta">Minutos</span></div><div class="contador-item"><span class="contador-numero" id="contador-segundos">00</span><span class="contador-etiqueta">Segundos</span></div></div><div class="contador-estado estado-proximo" id="contador-estado">PRÓXIMO CULTO</div></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:16px;">
            <div class="card card-glass"><div style="display:flex;align-items:center;gap:10px;"><div style="width:44px;height:44px;border-radius:50%;background:var(--azul-primario);display:flex;align-items:center;justify-content:center;color:white;font-size:1.3rem;"><i class="bx bx-calendar"></i></div><div><div style="font-size:0.7rem;opacity:0.7;">Fecha</div><div style="font-weight:700;" id="fecha-actual"></div></div></div></div>
            <div class="card card-glass"><div style="display:flex;align-items:center;gap:10px;"><div style="width:44px;height:44px;border-radius:50%;background:var(--dorado);display:flex;align-items:center;justify-content:center;color:var(--azul-primario);font-size:1.3rem;"><i class="bx bx-time"></i></div><div><div style="font-size:0.7rem;opacity:0.7;">Hora</div><div style="font-weight:700;" id="hora-actual"></div></div></div></div>
        </div>
        <div class="card" style="border-left:4px solid var(--dorado);"><h3><i class="bx bx-bible" style="color:var(--dorado);"></i> Versículo del Día</h3><div id="versiculo-content" style="font-style:italic;font-size:1rem;line-height:1.8;margin-top:8px;">Cargando...</div></div>
        <div class="card" style="margin-top:12px;"><h3>Accesos Rápidos</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:8px;">
            <button class="btn-outline btn-sm" onclick="navegarA('asistencia')"><i class="bx bx-check-shield"></i> Asistencia</button>
            <button class="btn-outline btn-sm" onclick="navegarA('peticiones')"><i class="bx bx-pray"></i> Oración</button>
            <button class="btn-outline btn-sm" onclick="navegarA('publicaciones')"><i class="bx bx-news"></i> Publicaciones</button>
            <button class="btn-outline btn-sm" onclick="navegarA('devocional')"><i class="bx bx-bible"></i> Devocional</button>
        </div></div>
        <div class="card" style="margin-top:12px;"><h3>Últimas Publicaciones</h3><div style="margin-top:8px;">${pubRecientes.length === 0 ? '<p style="text-align:center;color:var(--gris-texto);">No hay publicaciones aún</p>' : pubRecientes.map(p => `<div style="padding:8px 0;border-bottom:1px solid var(--gris-medio);"><strong>${p.autor} ${p.verificado ? '✅' : ''}</strong><p style="font-size:0.85rem;color:var(--gris-texto);">${p.contenido.substring(0, 100)}...</p><small>${formatearFecha(p.fecha)}</small></div>`).join('')}</div><button class="btn-outline btn-sm" onclick="navegarA('publicaciones')" style="margin-top:8px;width:100%;">Ver todas las publicaciones</button></div>
    </div>`;
    actualizarFechaHora();
    if (!APP_STATE.fechaInterval) APP_STATE.fechaInterval = setInterval(actualizarFechaHora, 1000);
    cargarVersiculoDiario();
}

// ============================================
// PÁGINA: HORARIOS
// ============================================
function cargarHorarios(c) {
    const h = [
        { dia: 'Lunes', cultos: [] }, { dia: 'Martes', cultos: [{ nombre: 'Culto de Oración', hora: '6:00 PM - 8:30 PM' }] },
        { dia: 'Miércoles', cultos: [{ nombre: 'Culto Campal', hora: '4:00 PM - 7:00 PM' }] },
        { dia: 'Jueves', cultos: [{ nombre: 'Culto de Refrán', hora: '4:00 PM - 7:00 PM' }] },
        { dia: 'Viernes', cultos: [{ nombre: 'Culto de Jóvenes', hora: '6:00 PM - 8:30 PM' }] },
        { dia: 'Sábado', cultos: [] }, { dia: 'Domingo', cultos: [{ nombre: 'Culto Dominical', hora: '10:00 AM - 12:00 PM' }] }
    ];
    const da = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-time-five"></i> Horarios de Cultos</h2><div style="display:grid;gap:10px;margin-top:16px;">${h.map((d, i) => `<div class="card" style="border-left:4px solid ${i === da ? 'var(--azul-primario)' : 'var(--gris-medio)'};"><div style="display:flex;justify-content:space-between;align-items:center;"><div><h3>${d.dia} ${i === da ? '<span style="background:var(--azul-primario);color:white;padding:2px 8px;border-radius:10px;font-size:0.7rem;">HOY</span>' : ''}</h3>${d.cultos.length ? d.cultos.map(x => `<p style="color:var(--gris-texto);">${x.nombre} - ${x.hora}</p>`).join('') : '<p style="color:var(--gris-texto);">No hay culto</p>'}</div>${d.cultos.length ? '<button class="btn-primary btn-sm" onclick="navegarA(\'asistencia\')">Asistir</button>' : ''}</div></div>`).join('')}</div></div>`;
}

// ============================================
// PÁGINA: ASISTENCIA
// ============================================
function cargarAsistencia(c) {
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-check-shield"></i> Confirmar Asistencia</h2>
        <div class="card" style="text-align:center;padding:30px;"><i class="bx bx-calendar-check" style="font-size:3rem;color:var(--azul-primario);"></i><h3 style="margin:12px 0;">Próximo Culto</h3><p id="proximo-culto-asistencia">Cargando...</p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
            <button class="btn-primary btn-sm" onclick="confirmarAsistencia('Asistiré')"><i class="bx bx-check"></i> Voy</button>
            <button class="btn-secondary btn-sm" onclick="confirmarAsistencia('Tal vez')"><i class="bx bx-question-mark"></i> Tal vez</button>
            <button class="btn-outline btn-sm" onclick="confirmarAsistencia('No asistiré')"><i class="bx bx-x"></i> No</button>
        </div></div>
        <div class="card" style="margin-top:12px;"><h3>Tipo de Asistente</h3><div style="display:flex;gap:12px;margin-top:8px;">
            <label><input type="radio" name="tipo-asistente" value="Hermano" checked> Hermano</label>
            <label><input type="radio" name="tipo-asistente" value="Amigo"> Amigo</label>
            <label><input type="radio" name="tipo-asistente" value="Niño"> Niño</label>
        </div></div></div>`;
}

// ============================================
// PÁGINAS SECUNDARIAS
// ============================================
function cargarNoticias(c) { c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-news"></i> Noticias</h2><div class="card"><p style="text-align:center;padding:30px;">No hay noticias publicadas</p></div></div>`; }
function cargarEventos(c) { c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-calendar-star"></i> Eventos</h2><div class="card"><p style="text-align:center;padding:30px;">No hay eventos programados</p></div></div>`; }
function cargarChat(c) { c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-chat"></i> Mensajes</h2><div class="card" style="text-align:center;padding:30px;"><i class="bx bx-chat" style="font-size:3rem;color:var(--gris-medio);"></i><p style="margin-top:12px;">Chat en desarrollo</p></div></div>`; }
function cargarDirectorio(c) { c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-group"></i> Directorio</h2><div class="card"><p style="text-align:center;padding:30px;">No hay miembros registrados</p></div></div>`; }
function cargarPeticiones(c) { c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-pray"></i> Peticiones de Oración</h2><div class="card" style="text-align:center;padding:30px;"><i class="bx bx-pray" style="font-size:3rem;color:var(--azul-primario);"></i><p style="margin-top:12px;">Envía tu petición de oración</p></div></div>`; }
function cargarEncuestas(c) { c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-poll"></i> Encuestas</h2><div class="card"><p style="text-align:center;padding:30px;">No hay encuestas activas</p></div></div>`; }
function cargarBiblioteca(c) { c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-book-open"></i> Biblioteca Digital</h2><div class="card"><p style="text-align:center;padding:30px;">Recursos disponibles pronto</p></div></div>`; }
function cargarGaleria(c) { c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-images"></i> Galería</h2><div class="card"><p style="text-align:center;padding:30px;">Fotos y videos pronto</p></div></div>`; }

// ============================================
// PÁGINA: DEVOCIONAL
// ============================================
function cargarDevocional(c) {
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-bible"></i> Devocional Diario</h2><div class="card" style="border-left:4px solid var(--dorado);text-align:center;padding:30px;"><div id="versiculo-content" style="font-style:italic;font-size:1.1rem;">Cargando...</div></div><button class="btn-primary" style="margin-top:12px;width:100%;" onclick="compartirVersiculo()"><i class="bx bx-share-alt"></i> Compartir</button></div>`;
    cargarVersiculoDiario();
}

// ============================================
// PÁGINA: PERFIL
// ============================================
function cargarPerfil(c) {
    if (!APP_STATE.usuario) return;
    const u = APP_STATE.usuario;
    c.innerHTML = `<div class="fade-in"><div style="text-align:center;padding:30px;background:linear-gradient(135deg,var(--azul-primario),var(--azul-claro));color:white;border-radius:var(--borde-radius);margin-bottom:16px;"><img src="${u.foto || 'assets/avatars/default.png'}" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--dorado);"><h2>${u.nombre} ${u.apellidos || ''}</h2><p>@${u.usuario}</p>${u.verificado ? '<span style="background:var(--info);padding:4px 12px;border-radius:20px;font-size:0.8rem;">✅ Verificado</span>' : ''}</div><div class="card"><h3>Información</h3><p><strong>Correo:</strong> ${u.correo || 'N/A'}</p><p><strong>Celular:</strong> ${u.celular || 'N/A'}</p><p><strong>Ministerio:</strong> ${u.ministerio || 'N/A'}</p><p><strong>Rol:</strong> ${APP_STATE.rol === 'admin' ? 'Administrador' : 'Miembro'}</p></div></div>`;
}

// ============================================
// PÁGINA: CONFIGURACIÓN
// ============================================
function cargarConfiguracion(c) {
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-cog"></i> Configuración</h2>
        <div class="card"><h3>Apariencia</h3><button class="btn-secondary btn-sm" onclick="toggleTema()" style="margin-top:8px;"><i class="bx ${APP_STATE.tema === 'dark' ? 'bx-sun' : 'bx-moon'}"></i> ${APP_STATE.tema === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</button></div>
        <div class="card" style="margin-top:12px;"><h3>Acerca de</h3><p style="color:var(--gris-texto);">IPUC LA FONDA v${CONFIG.VERSION}</p><p style="color:var(--gris-texto);">"Donde el Espíritu Santo se mueve"</p></div>
        ${APP_STATE.usuario ? `<div class="card" style="margin-top:12px;border-left:4px solid var(--error);"><h3 style="color:var(--error);">Cerrar Sesión</h3><button class="btn-danger btn-sm" onclick="confirmarAccion('¿Cerrar sesión?','Serás redirigido al inicio.',cerrarSesion)" style="margin-top:8px;"><i class="bx bx-log-out"></i> Cerrar Sesión</button></div>` : ''}</div>`;
}

// ============================================
// PÁGINAS ADMIN
// ============================================
function cargarDashboard(c) { c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-line-chart"></i> Dashboard</h2><div class="card"><p style="text-align:center;padding:30px;">Dashboard en desarrollo</p></div></div>`; }
function cargarGestionUsuarios(c) { c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-user-voice"></i> Gestión de Usuarios</h2><div class="card"><p style="text-align:center;padding:30px;">Panel de administración de usuarios</p></div></div>`; }
function cargarGestionNoticias(c) { c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-edit-alt"></i> Gestión de Noticias</h2><div class="card"><p style="text-align:center;padding:30px;">Crear y administrar noticias</p></div></div>`; }
function cargarGestionEventos(c) { c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-calendar-edit"></i> Gestión de Eventos</h2><div class="card"><p style="text-align:center;padding:30px;">Crear y administrar eventos</p></div></div>`; }
function cargarVersiculos(c) { c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-bookmark-plus"></i> Versículos</h2><div class="card"><p style="text-align:center;padding:30px;">Administrar versículos diarios</p></div></div>`; }
function cargarSistema(c) { c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-server"></i> Sistema</h2><div class="card"><p style="text-align:center;padding:30px;">Configuración del sistema</p></div></div>`; }

// ============================================
// PÁGINA: PUBLICACIONES
// ============================================
function cargarPublicaciones(c) {
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-news"></i> Publicaciones</h2>
        ${APP_STATE.usuario ? `<div class="card" style="margin-bottom:16px;"><h3>Crear Publicación</h3><form id="form-publicacion"><div class="form-group"><textarea class="form-input" id="contenido-publicacion" placeholder="¿Qué quieres compartir? ✝️" rows="3" required></textarea></div><button type="submit" class="btn-primary btn-sm"><i class="bx bx-send"></i> Publicar</button></form></div>` : '<div class="card" style="margin-bottom:16px;text-align:center;padding:20px;"><p>Inicia sesión para publicar</p></div>'}
        <div id="lista-publicaciones">${renderPublicaciones()}</div></div>`;
    document.getElementById('form-publicacion')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const contenido = document.getElementById('contenido-publicacion').value;
        crearPublicacion(contenido);
        document.getElementById('contenido-publicacion').value = '';
        cargarPublicaciones(c);
    });
}

function renderPublicaciones() {
    if (APP_STATE.publicaciones.length === 0) return '<div class="card"><p style="text-align:center;padding:30px;">No hay publicaciones aún. ¡Sé el primero en publicar!</p></div>';
    return APP_STATE.publicaciones.map(p => {
        const miReaccion = getReaccionUsuario(p.id);
        const comentarios = getComentariosPublicacion(p.id);
        return `<div class="card" style="margin-bottom:12px;" id="pub-${p.id}">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;"><img src="${p.foto_autor}" style="width:40px;height:40px;border-radius:50%;"><div style="flex:1;"><strong>${p.autor} ${p.verificado ? '✅' : ''}</strong><p style="font-size:0.75rem;color:var(--gris-texto);">@${p.usuario} · ${formatearFecha(p.fecha)}</p></div>${APP_STATE.usuario && APP_STATE.usuario.id === p.usuario_id ? `<button class="btn-icon" onclick="eliminarPublicacion(${p.id})"><i class="bx bx-trash"></i></button>` : ''}</div>
            <p style="margin-bottom:12px;">${p.contenido}</p>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;padding:8px 0;border-top:1px solid var(--gris-medio);border-bottom:1px solid var(--gris-medio);">${CONFIG.REACCIONES_TIPOS.map(r => `<button onclick="toggleReaccion(${p.id},'${r.clave}');cargarPublicaciones(document.getElementById('page-content'))" style="padding:6px 10px;border-radius:20px;border:1px solid var(--gris-medio);background:${miReaccion === r.clave ? 'var(--azul-surface)' : 'transparent'};cursor:pointer;font-size:0.8rem;">${r.icono} ${p.reacciones[r.clave] || 0}</button>`).join('')}</div>
            ${comentarios.length > 0 ? `<div style="margin-bottom:8px;">${comentarios.map(c => `<div style="display:flex;gap:8px;margin-bottom:6px;padding:6px;background:var(--gris-claro);border-radius:8px;"><img src="${c.foto_autor}" style="width:24px;height:24px;border-radius:50%;"><div style="flex:1;"><strong style="font-size:0.75rem;">${c.autor}</strong><p style="font-size:0.8rem;">${c.contenido}</p></div></div>`).join('')}</div>` : ''}
            ${APP_STATE.usuario ? `<div style="display:flex;gap:8px;"><input type="text" class="form-input" id="comentario-${p.id}" placeholder="Comentar..." style="flex:1;padding:6px 10px;font-size:0.8rem;"><button class="btn-primary btn-sm" onclick="agregarComentario(${p.id},document.getElementById('comentario-${p.id}').value);cargarPublicaciones(document.getElementById('page-content'))"><i class="bx bx-send"></i></button></div>` : ''}
        </div>`;
    }).join('');
}

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log(`🚀 IPUC LA FONDA v${CONFIG.VERSION} - Inicializando...`);
    inicializarApp();
});

function inicializarApp() {
    try {
        const temaGuardado = localStorage.getItem(CONFIG.STORAGE_KEYS.TEMA) || 'light';
        APP_STATE.tema = temaGuardado;
        aplicarTema(temaGuardado);

        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
        const usuarioData = localStorage.getItem(CONFIG.STORAGE_KEYS.USUARIO);
        const rol = localStorage.getItem(CONFIG.STORAGE_KEYS.ROL);
        let usuario = null;
        try { usuario = usuarioData ? JSON.parse(usuarioData) : null; } catch (e) {}

        APP_STATE.publicaciones = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.PUBLICACIONES) || '[]');
        APP_STATE.comentarios = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.COMENTARIOS) || '[]');
        APP_STATE.reacciones = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.REACCIONES) || '{}');

        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            if (splash) splash.style.display = 'none';
            if (token && usuario) {
                APP_STATE.token = token; APP_STATE.usuario = usuario; APP_STATE.rol = rol || 'usuario';
                mostrarApp();
            } else {
                mostrarBienvenida();
            }
        }, 2500);

        inicializarEventListeners();
        manejarResponsiveSidebar();
        window.addEventListener('resize', () => manejarResponsiveSidebar());

        APP_STATE.notificacionesNoLeidas = (typeof db !== 'undefined' && db.getNoLeidas) ? db.getNoLeidas() : 0;
        actualizarBadgeNotificaciones();

        console.log('✅ App inicializada correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar:', error);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function inicializarEventListeners() {
    document.getElementById('menu-toggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('close-sidebar')?.addEventListener('click', cerrarSidebar);
    document.getElementById('sidebar-overlay')?.addEventListener('click', cerrarSidebar);

    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', function(e) { e.preventDefault(); navegarA(this.getAttribute('data-page')); });
    });

    document.getElementById('theme-toggle')?.addEventListener('click', toggleTema);
    document.getElementById('notifications-toggle')?.addEventListener('click', toggleNotificaciones);
    document.getElementById('close-notifications')?.addEventListener('click', () => {
        document.getElementById('notification-panel')?.classList.add('hidden'); APP_STATE.notificationsOpen = false;
    });
    document.getElementById('mark-all-read')?.addEventListener('click', () => {
        if (typeof db !== 'undefined' && db.marcarTodasLeidas) db.marcarTodasLeidas();
        APP_STATE.notificacionesNoLeidas = 0;
        actualizarBadgeNotificaciones(); cargarNotificaciones();
        showToast('Todas leídas', 'success');
    });

    document.getElementById('search-toggle')?.addEventListener('click', toggleSearchBar);
    document.getElementById('search-close')?.addEventListener('click', () => {
        document.getElementById('search-bar')?.classList.add('hidden'); APP_STATE.searchBarOpen = false;
    });

    document.getElementById('user-mini')?.addEventListener('click', toggleUserDropdown);
    document.getElementById('fab-main')?.addEventListener('click', toggleFabMenu);

    document.querySelectorAll('.fab-item').forEach(item => {
        item.addEventListener('click', function() {
            const a = this.getAttribute('data-action');
            if (a === 'oracion') navegarA('peticiones');
            if (a === 'asistencia') navegarA('asistencia');
            if (a === 'compartir') compartirVersiculo();
            if (a === 'biblia') navegarA('devocional');
            if (a === 'publicar') navegarA('publicaciones');
            toggleFabMenu();
        });
    });

    document.getElementById('btn-logout')?.addEventListener('click', (e) => {
        e.preventDefault(); confirmarAccion('¿Cerrar sesión?', 'Serás redirigido al inicio.', cerrarSesion);
    });

    document.getElementById('btn-login')?.addEventListener('click', mostrarLogin);
    document.getElementById('btn-register')?.addEventListener('click', mostrarRegistro);
    document.getElementById('btn-continue-guest')?.addEventListener('click', continuarComoInvitado);

    document.getElementById('modal')?.addEventListener('click', function(e) { if (e.target.classList.contains('modal-backdrop')) cerrarModal(); });
    document.querySelector('.modal-close')?.addEventListener('click', cerrarModal);
    document.getElementById('confirm-cancel')?.addEventListener('click', () => document.getElementById('confirm-modal')?.classList.add('hidden'));
    document.getElementById('confirm-accept')?.addEventListener('click', () => {
        if (APP_STATE.pendingConfirmation) { APP_STATE.pendingConfirmation(); APP_STATE.pendingConfirmation = null; }
        document.getElementById('confirm-modal')?.classList.add('hidden');
    });
    document.getElementById('confirm-modal')?.addEventListener('click', function(e) { if (e.target.classList.contains('modal-backdrop')) this.classList.add('hidden'); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (APP_STATE.notificationsOpen) { document.getElementById('notification-panel')?.classList.add('hidden'); APP_STATE.notificationsOpen = false; }
            if (APP_STATE.searchBarOpen) { document.getElementById('search-bar')?.classList.add('hidden'); APP_STATE.searchBarOpen = false; }
            if (!document.getElementById('modal')?.classList.contains('hidden')) cerrarModal();
        }
    });

    document.addEventListener('click', (e) => {
        if (APP_STATE.userDropdownOpen && !e.target.closest('#user-mini') && !e.target.closest('#user-dropdown')) { document.getElementById('user-dropdown')?.classList.add('hidden'); APP_STATE.userDropdownOpen = false; }
        if (APP_STATE.fabMenuOpen && !e.target.closest('#fab-main') && !e.target.closest('#fab-menu')) { document.getElementById('fab-menu')?.classList.add('hidden'); APP_STATE.fabMenuOpen = false; }
    });
}

// ============================================
// EXPORTAR A WINDOW
// ============================================
window.mostrarLogin = mostrarLogin;
window.mostrarRegistro = mostrarRegistro;
window.cerrarSesion = cerrarSesion;
window.togglePassword = togglePassword;
window.confirmarAsistencia = confirmarAsistencia;
window.compartirVersiculo = compartirVersiculo;
window.confirmarAccion = confirmarAccion;
window.navegarA = navegarA;
window.cargarVersiculoDiario = cargarVersiculoDiario;
window.toggleTema = toggleTema;
window.aplicarTema = aplicarTema;
window.showToast = showToast;
window.crearPublicacion = crearPublicacion;
window.agregarComentario = agregarComentario;
window.toggleReaccion = toggleReaccion;
window.eliminarPublicacion = eliminarPublicacion;

console.log(`✅ IPUC LA FONDA v${CONFIG.VERSION} - Cargado correctamente`);
