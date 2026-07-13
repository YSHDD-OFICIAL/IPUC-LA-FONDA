// ============================================
// IPUC LA FONDA - SCRIPT.JS v5.0 COMPLETO Y PROFESIONAL
// Web App Profesional - Todas las secciones funcionales
// Autenticación LOCAL con Database v5.0
// CORREGIDO: Funciones globales, DB, temas
// "Donde el Espíritu Santo se mueve"
// ============================================

// ============================================
// INICIALIZACIÓN DE BASE DE DATOS
// ============================================
let db;
try {
    if (typeof Database !== 'undefined') {
        db = new Database();
        db.inicializarDatos();
        console.log('✅ DB inicializada desde script.js');
    } else {
        console.warn('⚠️ Database no disponible');
    }
} catch (e) {
    console.error('❌ Error al crear DB:', e);
}

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
// FUNCIONES DE TEMA (DEBEN DEFINIRSE PRIMERO)
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
    if (diff < 3600000) return `Hace ${Math.floor(diff/60000)} min`; 
    if (diff < 86400000) return `Hace ${Math.floor(diff/3600000)} h`; 
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }); 
}

// ============================================
// FUNCIONES DE MODAL Y CONFIRMACIÓN
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
    const m = document.getElementById('modal'), b = document.getElementById('modal-body'), t = document.getElementById('modal-title'), f = document.getElementById('modal-footer');
    if (!m || !b) return; if (t) t.textContent = 'Iniciar Sesión'; if (f) f.classList.add('hidden');
    b.innerHTML = `<form id="login-form"><div class="form-group"><label>Usuario o Correo</label><input type="text" class="form-input" id="login-usuario" placeholder="Ingresa tu usuario o correo" required></div><div class="form-group"><label>Contraseña</label><div style="position:relative;"><input type="password" class="form-input" id="login-password" placeholder="Ingresa tu contraseña" required><button type="button" class="btn-icon" onclick="togglePassword('login-password')" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);"><i class="bx bx-show"></i></button></div></div><button type="submit" class="btn-primary" style="width:100%;"><i class="bx bx-log-in"></i> Iniciar Sesión</button></form><p style="text-align:center;margin-top:16px;"><a href="#" onclick="mostrarRegistro()" style="color:var(--azul-primario);">¿No tienes cuenta? Regístrate aquí</a></p>`;
    m.classList.remove('hidden');
    document.getElementById('login-form').addEventListener('submit', function(e) { e.preventDefault(); const u = document.getElementById('login-usuario').value.trim(), p = document.getElementById('login-password').value; if (!u || !p) return showToast('Completa los campos','warning'); realizarLogin(u, p); });
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
    const m = document.getElementById('modal'), b = document.getElementById('modal-body'), t = document.getElementById('modal-title'), f = document.getElementById('modal-footer');
    if (!m || !b) return; if (t) t.textContent = 'Crear Cuenta'; if (f) f.classList.add('hidden');
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
    const ahora = new Date(); const domingo = new Date(ahora); domingo.setDate(ahora.getDate() + ((7 - ahora.getDay()) % 7)); domingo.setHours(10,0,0,0); if (domingo <= ahora) domingo.setDate(domingo.getDate() + 7);
    const diff = Math.max(0, (domingo - ahora) / 1000);
    if (els.t) els.t.textContent = 'Culto Dominical - Domingo';
    if (els.d) els.d.textContent = String(Math.floor(diff/86400)).padStart(2,'0');
    if (els.h) els.h.textContent = String(Math.floor((diff%86400)/3600)).padStart(2,'0');
    if (els.m) els.m.textContent = String(Math.floor((diff%3600)/60)).padStart(2,'0');
    if (els.s) els.s.textContent = String(Math.floor(diff%60)).padStart(2,'0');
}
function actualizarFechaHora() {
    const a = new Date();
    const fe = document.getElementById('fecha-actual'); if (fe) fe.textContent = a.toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    const ho = document.getElementById('hora-actual'); if (ho) ho.textContent = a.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
function iniciarActualizacionFecha() { if (APP_STATE.fechaInterval) clearInterval(APP_STATE.fechaInterval); actualizarFechaHora(); APP_STATE.fechaInterval = setInterval(actualizarFechaHora, 1000); }
function cargarVersiculoDiario() { const c = document.getElementById('versiculo-content'); if (!c) return; const v = CONFIG.VERSICULOS[new Date().getDay() % CONFIG.VERSICULOS.length]; c.innerHTML = `<p>"${v.texto}"</p><p style="font-weight:700;color:var(--azul-primario);">${v.referencia}</p>`; }

// ============================================
// ACCIONES
// ============================================
function confirmarAsistencia(e) { const t = document.querySelector('input[name="tipo-asistente"]:checked')?.value || 'Hermano'; showToast(`✅ Asistencia: ${e} (${t})`, 'success'); }
function compartirVersiculo() { const v = CONFIG.VERSICULOS[new Date().getDay() % CONFIG.VERSICULOS.length]; if (navigator.share) navigator.share({ title: 'IPUC LA FONDA', text: `"${v.texto}" - ${v.referencia}` }).catch(()=>{}); else { navigator.clipboard?.writeText(`"${v.texto}" - ${v.referencia}`); showToast('📋 Copiado', 'info'); } }
function toggleNotificaciones() { APP_STATE.notificationsOpen = !APP_STATE.notificationsOpen; const p = document.getElementById('notification-panel'); if (!p) return; APP_STATE.notificationsOpen ? (p.classList.remove('hidden'), cargarNotificaciones()) : p.classList.add('hidden'); }
function toggleSearchBar() { APP_STATE.searchBarOpen = !APP_STATE.searchBarOpen; const b = document.getElementById('search-bar'); if (!b) return; APP_STATE.searchBarOpen ? (b.classList.remove('hidden'), document.getElementById('global-search-input')?.focus()) : b.classList.add('hidden'); }
function toggleFabMenu() { APP_STATE.fabMenuOpen = !APP_STATE.fabMenuOpen; document.getElementById('fab-menu')?.classList.toggle('hidden', !APP_STATE.fabMenuOpen); }
function toggleUserDropdown() { APP_STATE.userDropdownOpen = !APP_STATE.userDropdownOpen; document.getElementById('user-dropdown')?.classList.toggle('hidden', !APP_STATE.userDropdownOpen); }

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
window.db = db;

console.log(`✅ IPUC LA FONDA v${CONFIG.VERSION} - Cargado correctamente`);
