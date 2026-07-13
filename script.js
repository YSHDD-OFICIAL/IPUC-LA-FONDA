// ============================================
// IPUC LA FONDA - SCRIPT.JS v5.0
// Web App Profesional Completa
// Autenticación LOCAL con Database v5.0
// Todas las secciones, botones, enlaces y funciones
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
        TEMA: 'ipuc5_tema'
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
        'dashboard': 'Dashboard', 'gestion-usuarios': 'Gestión de Usuarios',
        'gestion-noticias': 'Gestión de Noticias', 'gestion-eventos': 'Gestión de Eventos',
        'versiculos': 'Versículos Diarios', 'sistema': 'Configuración del Sistema'
    }
};

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================
const APP_STATE = {
    currentPage: 'inicio', usuario: null, token: null, rol: null,
    tema: 'light', sidebarOpen: false, sidebarLocked: false,
    notificationsOpen: false, userDropdownOpen: false, fabMenuOpen: false, searchBarOpen: false,
    contadorInterval: null, fechaInterval: null,
    notificacionesNoLeidas: 0, pendingConfirmation: null, isLoading: false
};

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log(`🚀 IPUC LA FONDA v${CONFIG.VERSION} - Inicializando...`);
    inicializarApp();
});

function inicializarApp() {
    try {
        // Tema
        const temaGuardado = localStorage.getItem(CONFIG.STORAGE_KEYS.TEMA) || 'light';
        APP_STATE.tema = temaGuardado;
        aplicarTema(temaGuardado);

        // Sesión
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
        const usuarioData = localStorage.getItem(CONFIG.STORAGE_KEYS.USUARIO);
        const rol = localStorage.getItem(CONFIG.STORAGE_KEYS.ROL);
        let usuario = null;
        try { usuario = usuarioData ? JSON.parse(usuarioData) : null; } catch (e) {}

        // Splash
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

        // Notificaciones
        APP_STATE.notificacionesNoLeidas = db?.getNoLeidas?.() || 0;
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
        db?.marcarTodasLeidas?.(); APP_STATE.notificacionesNoLeidas = 0;
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
            toggleFabMenu();
        });
    });

    document.getElementById('btn-logout')?.addEventListener('click', (e) => {
        e.preventDefault(); confirmarAccion('¿Cerrar sesión?', 'Serás redirigido al inicio.', cerrarSesion);
    });

    document.getElementById('btn-login')?.addEventListener('click', mostrarLogin);
    document.getElementById('btn-register')?.addEventListener('click', mostrarRegistro);
    document.getElementById('btn-continue-guest')?.addEventListener('click', continuarComoInvitado);

    // Modales
    document.getElementById('modal')?.addEventListener('click', function(e) { if (e.target.classList.contains('modal-backdrop')) cerrarModal(); });
    document.querySelector('.modal-close')?.addEventListener('click', cerrarModal);
    document.getElementById('confirm-cancel')?.addEventListener('click', () => document.getElementById('confirm-modal')?.classList.add('hidden'));
    document.getElementById('confirm-accept')?.addEventListener('click', () => {
        if (APP_STATE.pendingConfirmation) { APP_STATE.pendingConfirmation(); APP_STATE.pendingConfirmation = null; }
        document.getElementById('confirm-modal')?.classList.add('hidden');
    });
    document.getElementById('confirm-modal')?.addEventListener('click', function(e) { if (e.target.classList.contains('modal-backdrop')) this.classList.add('hidden'); });

    // Escape y clics fuera
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
    const t = CONFIG.TITULOS_PAGINAS[page] || page;
    document.getElementById('page-title').textContent = t;
    document.getElementById('breadcrumb-current').textContent = t;
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
    c.innerHTML = `
        <div class="fade-in">
            <div class="contador-container">
                <div class="contador-titulo" id="contador-titulo">Cargando próximo culto...</div>
                <div class="contador-tiempo">
                    <div class="contador-item"><span class="contador-numero" id="contador-dias">00</span><span class="contador-etiqueta">Días</span></div>
                    <div class="contador-item"><span class="contador-numero" id="contador-horas">00</span><span class="contador-etiqueta">Horas</span></div>
                    <div class="contador-item"><span class="contador-numero" id="contador-minutos">00</span><span class="contador-etiqueta">Minutos</span></div>
                    <div class="contador-item"><span class="contador-numero" id="contador-segundos">00</span><span class="contador-etiqueta">Segundos</span></div>
                </div>
                <div class="contador-estado estado-proximo" id="contador-estado">PRÓXIMO CULTO</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:16px;">
                <div class="card card-glass"><div style="display:flex;align-items:center;gap:10px;"><div style="width:44px;height:44px;border-radius:50%;background:var(--azul-primario);display:flex;align-items:center;justify-content:center;color:white;font-size:1.3rem;"><i class="bx bx-calendar"></i></div><div><div style="font-size:0.7rem;opacity:0.7;">Fecha</div><div style="font-weight:700;" id="fecha-actual"></div></div></div></div>
                <div class="card card-glass"><div style="display:flex;align-items:center;gap:10px;"><div style="width:44px;height:44px;border-radius:50%;background:var(--dorado);display:flex;align-items:center;justify-content:center;color:var(--azul-primario);font-size:1.3rem;"><i class="bx bx-time"></i></div><div><div style="font-size:0.7rem;opacity:0.7;">Hora</div><div style="font-weight:700;" id="hora-actual"></div></div></div></div>
            </div>
            <div class="card" style="border-left:4px solid var(--dorado);"><h3><i class="bx bx-bible" style="color:var(--dorado);"></i> Versículo del Día</h3><div id="versiculo-content" style="font-style:italic;font-size:1rem;line-height:1.8;margin-top:8px;">Cargando...</div></div>
            <div class="card" style="margin-top:12px;"><h3>Accesos Rápidos</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:8px;">
                <button class="btn-outline btn-sm" onclick="navegarA('asistencia')"><i class="bx bx-check-shield"></i> Asistencia</button>
                <button class="btn-outline btn-sm" onclick="navegarA('peticiones')"><i class="bx bx-pray"></i> Oración</button>
                <button class="btn-outline btn-sm" onclick="navegarA('biblioteca')"><i class="bx bx-book-open"></i> Biblioteca</button>
                <button class="btn-outline btn-sm" onclick="navegarA('devocional')"><i class="bx bx-bible"></i> Devocional</button>
            </div></div>
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
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-time-five"></i> Horarios de Cultos</h2><div style="display:grid;gap:10px;margin-top:16px;">
        ${h.map((d, i) => `<div class="card" style="border-left:4px solid ${i === da ? 'var(--azul-primario)' : 'var(--gris-medio)'};"><div style="display:flex;justify-content:space-between;align-items:center;"><div><h3>${d.dia} ${i === da ? '<span style="background:var(--azul-primario);color:white;padding:2px 8px;border-radius:10px;font-size:0.7rem;">HOY</span>' : ''}</h3>${d.cultos.length ? d.cultos.map(x => `<p style="color:var(--gris-texto);">${x.nombre} - ${x.hora}</p>`).join('') : '<p style="color:var(--gris-texto);">No hay culto</p>'}</div>${d.cultos.length ? '<button class="btn-primary btn-sm" onclick="navegarA(\'asistencia\')">Asistir</button>' : ''}</div></div>`).join('')}
    </div></div>`;
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
// PÁGINAS SECUNDARIAS (CON DATOS REALES)
// ============================================
function cargarNoticias(c) {
    const noticias = db?.getNoticias?.()?.filter(n => n.estado === 'publicado') || [];
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-news"></i> Noticias</h2>${noticias.length === 0 ? '<div class="card"><p style="text-align:center;padding:30px;">No hay noticias</p></div>' : noticias.slice(0,10).map(n => `<div class="card"><h3>${n.titulo}</h3><p style="color:var(--gris-texto);">${n.contenido?.substring(0,150)}...</p><small>${formatearFecha(n.fecha_publicacion)}</small></div>`).join('')}</div>`;
}
function cargarEventos(c) {
    const eventos = db?.getEventos?.() || [];
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-calendar-star"></i> Eventos</h2>${eventos.length === 0 ? '<div class="card"><p style="text-align:center;padding:30px;">No hay eventos</p></div>' : eventos.map(e => `<div class="card"><h3>${e.titulo}</h3><p>📅 ${e.fecha} ${e.hora ? '🕐 '+e.hora : ''} | 📍 ${e.lugar||'IPUC LA FONDA'}</p></div>`).join('')}</div>`;
}
function cargarChat(c) { c.innerHTML = '<div class="fade-in"><h2><i class="bx bx-chat"></i> Mensajes</h2><div class="card"><p style="text-align:center;padding:30px;">Chat en desarrollo</p></div></div>'; }
function cargarDirectorio(c) {
    const usuarios = db?.cargar?.('usuarios')?.usuarios || [];
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-group"></i> Directorio</h2>${usuarios.length === 0 ? '<div class="card"><p style="text-align:center;padding:30px;">No hay miembros</p></div>' : usuarios.map(u => `<div class="card" style="display:flex;align-items:center;gap:12px;"><img src="${u.foto||'assets/avatars/default.png'}" style="width:48px;height:48px;border-radius:50%;"><div><strong>${u.nombre} ${u.apellidos||''}</strong><p style="font-size:0.8rem;color:var(--gris-texto);">${u.ministerio||'General'} ${u.verificado?'✅':''}</p></div></div>`).join('')}</div>`;
}
function cargarPeticiones(c) {
    const peticiones = db?.getPeticiones?.() || [];
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-pray"></i> Peticiones</h2>${APP_STATE.usuario ? `<div class="card" style="margin-bottom:16px;"><h3>Nueva Petición</h3><form id="form-peticion"><div class="form-group"><input type="text" class="form-input" id="motivo-peticion" placeholder="Motivo" required></div><button type="submit" class="btn-primary btn-sm"><i class="bx bx-send"></i> Enviar</button></form></div>` : ''}${peticiones.length === 0 ? '<div class="card"><p style="text-align:center;padding:20px;">No hay peticiones</p></div>' : peticiones.map(p => `<div class="card"><strong>🙏 ${p.motivo}</strong><p style="font-size:0.85rem;color:var(--gris-texto);">Por: ${p.nombre} | ${formatearFecha(p.fecha)}</p></div>`).join('')}</div>`;
    document.getElementById('form-peticion')?.addEventListener('submit', function(e) {
        e.preventDefault(); const m = document.getElementById('motivo-peticion').value.trim();
        if (!m) return showToast('Ingresa un motivo', 'warning');
        db?.addPeticion?.({ nombre: APP_STATE.usuario.nombre, usuario_id: APP_STATE.usuario.id, motivo: m });
        showToast('✅ Petición enviada', 'success'); cargarPeticiones(c);
    });
}
function cargarEncuestas(c) { c.innerHTML = '<div class="fade-in"><h2><i class="bx bx-poll"></i> Encuestas</h2><div class="card"><p style="text-align:center;padding:30px;">No hay encuestas</p></div></div>'; }
function cargarBiblioteca(c) { c.innerHTML = '<div class="fade-in"><h2><i class="bx bx-book-open"></i> Biblioteca</h2><div class="card"><p style="text-align:center;padding:30px;">Próximamente</p></div></div>'; }
function cargarGaleria(c) { c.innerHTML = '<div class="fade-in"><h2><i class="bx bx-images"></i> Galería</h2><div class="card"><p style="text-align:center;padding:30px;">Próximamente</p></div></div>'; }

// ============================================
// DEVOCIONAL, PERFIL, CONFIGURACIÓN
// ============================================
function cargarDevocional(c) {
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-bible"></i> Devocional Diario</h2><div class="card" style="border-left:4px solid var(--dorado);text-align:center;padding:30px;"><div id="versiculo-content" style="font-style:italic;font-size:1.1rem;">Cargando...</div></div><button class="btn-primary" style="margin-top:12px;width:100%;" onclick="compartirVersiculo()"><i class="bx bx-share-alt"></i> Compartir</button></div>`;
    cargarVersiculoDiario();
}
function cargarPerfil(c) {
    if (!APP_STATE.usuario) return; const u = APP_STATE.usuario;
    c.innerHTML = `<div class="fade-in"><div style="text-align:center;padding:30px;background:linear-gradient(135deg,var(--azul-primario),var(--azul-claro));color:white;border-radius:var(--borde-radius);margin-bottom:16px;"><img src="${u.foto||'assets/avatars/default.png'}" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--dorado);"><h2>${u.nombre} ${u.apellidos||''}</h2><p>@${u.usuario}</p>${u.verificado?'<span style="background:var(--info);padding:4px 12px;border-radius:20px;font-size:0.8rem;">✅ Verificado</span>':''}</div><div class="card"><h3>Información</h3><p><strong>Correo:</strong> ${u.correo||'N/A'}</p><p><strong>Celular:</strong> ${u.celular||'N/A'}</p><p><strong>Ministerio:</strong> ${u.ministerio||'N/A'}</p><p><strong>Rol:</strong> ${APP_STATE.rol==='admin'?'Administrador':'Miembro'}</p></div></div>`;
}
function cargarConfiguracion(c) {
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-cog"></i> Configuración</h2><div class="card"><h3>Apariencia</h3><button class="btn-secondary btn-sm" onclick="toggleTema()" style="margin-top:8px;"><i class="bx ${APP_STATE.tema==='dark'?'bx-sun':'bx-moon'}"></i> ${APP_STATE.tema==='dark'?'Modo Claro':'Modo Oscuro'}</button></div><div class="card" style="margin-top:12px;"><h3>Acerca de</h3><p style="color:var(--gris-texto);">IPUC LA FONDA v${CONFIG.VERSION}</p><p style="color:var(--gris-texto);">"Donde el Espíritu Santo se mueve"</p></div>${APP_STATE.usuario?`<div class="card" style="margin-top:12px;border-left:4px solid var(--error);"><h3 style="color:var(--error);">Cerrar Sesión</h3><button class="btn-danger btn-sm" onclick="confirmarAccion('¿Cerrar sesión?','Serás redirigido al inicio.',cerrarSesion)" style="margin-top:8px;"><i class="bx bx-log-out"></i> Cerrar Sesión</button></div>`:''}</div>`;
}

// ============================================
// PÁGINAS ADMIN
// ============================================
function cargarDashboard(c) {
    const s = db?.getEstadisticas?.() || {};
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-line-chart"></i> Dashboard</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px;">${['👥 Usuarios','✅ Asistencia','📅 Eventos','📰 Noticias','🙏 Peticiones','🔔 Sin leer'].map((t,i) => `<div class="card" style="text-align:center;"><h3>${t}</h3><p style="font-size:2rem;font-weight:700;">${[s.usuarios,s.asistencia,s.eventos,s.noticias,s.peticiones,s.noLeidas][i]||0}</p></div>`).join('')}</div></div>`;
}
function cargarGestionUsuarios(c) {
    const u = db?.cargar?.('usuarios')?.usuarios || [];
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-user-voice"></i> Gestión de Usuarios</h2><p>Total: ${u.length}</p>${u.map(x => `<div class="card" style="display:flex;align-items:center;gap:12px;"><img src="${x.foto||'assets/avatars/default.png'}" style="width:40px;height:40px;border-radius:50%;"><div style="flex:1;"><strong>${x.nombre} ${x.apellidos||''}</strong><p style="font-size:0.75rem;">@${x.usuario} | ${x.estado}</p></div></div>`).join('')}</div>`;
}
function cargarGestionNoticias(c) {
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-edit-alt"></i> Gestión de Noticias</h2><div class="card"><h3>Nueva Noticia</h3><form id="form-noticia"><div class="form-group"><input type="text" class="form-input" id="titulo-noticia" placeholder="Título" required></div><div class="form-group"><textarea class="form-input" id="contenido-noticia" placeholder="Contenido" rows="4" required></textarea></div><button type="submit" class="btn-primary btn-sm"><i class="bx bx-plus"></i> Publicar</button></form></div></div>`;
    document.getElementById('form-noticia')?.addEventListener('submit', function(e) { e.preventDefault(); const t=document.getElementById('titulo-noticia').value.trim(), co=document.getElementById('contenido-noticia').value.trim(); if(!t||!co) return showToast('Completa los campos','warning'); db?.addNoticia?.({titulo:t,contenido:co,autor_id:APP_STATE.usuario.id,autor_nombre:APP_STATE.usuario.nombre}); showToast('✅ Publicada','success'); this.reset(); });
}
function cargarGestionEventos(c) {
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-calendar-edit"></i> Gestión de Eventos</h2><div class="card"><h3>Nuevo Evento</h3><form id="form-evento"><div class="form-group"><input type="text" class="form-input" id="titulo-evento" placeholder="Título" required></div><div class="form-group"><input type="date" class="form-input" id="fecha-evento" required></div><div class="form-group"><input type="time" class="form-input" id="hora-evento"></div><div class="form-group"><input type="text" class="form-input" id="lugar-evento" placeholder="Lugar"></div><button type="submit" class="btn-primary btn-sm"><i class="bx bx-plus"></i> Crear</button></form></div></div>`;
    document.getElementById('form-evento')?.addEventListener('submit', function(e) { e.preventDefault(); const ev={titulo:document.getElementById('titulo-evento').value.trim(),fecha:document.getElementById('fecha-evento').value,hora:document.getElementById('hora-evento').value,lugar:document.getElementById('lugar-evento').value.trim()||'IPUC LA FONDA',organizador_id:APP_STATE.usuario.id}; if(!ev.titulo||!ev.fecha) return showToast('Título y fecha obligatorios','warning'); db?.addEvento?.(ev); showToast('✅ Evento creado','success'); this.reset(); });
}
function cargarVersiculos(c) {
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-bookmark-plus"></i> Versículos</h2>${CONFIG.VERSICULOS.map(v => `<div class="card"><p style="font-style:italic;">"${v.texto}"</p><p style="font-weight:700;color:var(--azul-primario);">${v.referencia}</p></div>`).join('')}</div>`;
}
function cargarSistema(c) {
    const s = db?.getEstadisticas?.() || {};
    c.innerHTML = `<div class="fade-in"><h2><i class="bx bx-server"></i> Sistema</h2><div class="card"><h3>Información</h3><p>Versión: ${CONFIG.VERSION}</p><p>Modo: Offline (localStorage)</p><p>Usuarios: ${s.usuarios||0}</p></div><div class="card" style="margin-top:12px;border-left:4px solid var(--error);"><h3 style="color:var(--error);">Zona de Peligro</h3><button class="btn-danger btn-sm" onclick="confirmarAccion('¿Limpiar datos?','Se eliminará todo.',()=>{db?.limpiarTodo?.();showToast('✅ Datos limpiados','success');setTimeout(()=>location.reload(),1500);})" style="margin-top:8px;"><i class="bx bx-trash"></i> Limpiar Base de Datos</button></div></div>`;
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
    document.getElementById('fecha-actual').textContent = a.toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    document.getElementById('hora-actual').textContent = a.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
function iniciarActualizacionFecha() { if (APP_STATE.fechaInterval) clearInterval(APP_STATE.fechaInterval); actualizarFechaHora(); APP_STATE.fechaInterval = setInterval(actualizarFechaHora, 1000); }
function cargarVersiculoDiario() { const c = document.getElementById('versiculo-content'); if (!c) return; const v = CONFIG.VERSICULOS[new Date().getDay() % CONFIG.VERSICULOS.length]; c.innerHTML = `<p>"${v.texto}"</p><p style="font-weight:700;color:var(--azul-primario);">${v.referencia}</p>`; }

// ============================================
// AUTENTICACIÓN (USA DATABASE v5.0)
// ============================================
function mostrarLogin() {
    const m = document.getElementById('modal'), b = document.getElementById('modal-body'), t = document.getElementById('modal-title'), f = document.getElementById('modal-footer');
    if (!m || !b) return; if (t) t.textContent = 'Iniciar Sesión'; if (f) f.classList.add('hidden');
    b.innerHTML = `<form id="login-form"><div class="form-group"><label>Usuario o Correo</label><input type="text" class="form-input" id="login-usuario" placeholder="Ingresa tu usuario" required></div><div class="form-group"><label>Contraseña</label><div style="position:relative;"><input type="password" class="form-input" id="login-password" placeholder="Ingresa tu contraseña" required><button type="button" class="btn-icon" onclick="togglePassword('login-password')" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);"><i class="bx bx-show"></i></button></div></div><button type="submit" class="btn-primary" style="width:100%;"><i class="bx bx-log-in"></i> Iniciar Sesión</button></form><p style="text-align:center;margin-top:16px;"><a href="#" onclick="mostrarRegistro()" style="color:var(--azul-primario);">¿No tienes cuenta? Regístrate</a></p>`;
    m.classList.remove('hidden');
    document.getElementById('login-form').addEventListener('submit', function(e) { e.preventDefault(); const u = document.getElementById('login-usuario').value.trim(), p = document.getElementById('login-password').value; if (!u || !p) return showToast('Completa los campos','warning'); realizarLogin(u, p); });
}

function realizarLogin(usuario, password) {
    const r = db?.login?.(usuario, password);
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
    document.getElementById('registro-form').addEventListener('submit', function(e) { e.preventDefault(); const fd = new FormData(this); const d = Object.fromEntries(fd); const r = db?.registrarUsuario?.(d); if (r?.error) return showToast(r.error, 'error'); showToast('✅ Registro exitoso. Inicia sesión', 'success'); setTimeout(() => mostrarLogin(), 1500); });
}

function continuarComoInvitado() { APP_STATE.rol = 'invitado'; APP_STATE.token = 'guest'; APP_STATE.usuario = { id: 0, nombre: 'Invitado', usuario: 'invitado', foto: 'assets/avatars/default.png', verificado: false, ministerio: 'Visitante', insignias: [] }; mostrarApp(); showToast('Navegando como invitado', 'info'); }
function guardarSesion(data) { localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, data.token); localStorage.setItem(CONFIG.STORAGE_KEYS.USUARIO, JSON.stringify(data.usuario)); localStorage.setItem(CONFIG.STORAGE_KEYS.ROL, data.rol); APP_STATE.token = data.token; APP_STATE.usuario = data.usuario; APP_STATE.rol = data.rol; }
function cerrarSesion() { [CONFIG.STORAGE_KEYS.TOKEN, CONFIG.STORAGE_KEYS.USUARIO, CONFIG.STORAGE_KEYS.ROL].forEach(k => localStorage.removeItem(k)); APP_STATE.token = null; APP_STATE.usuario = null; APP_STATE.rol = null; if (APP_STATE.contadorInterval) clearInterval(APP_STATE.contadorInterval); if (APP_STATE.fechaInterval) clearInterval(APP_STATE.fechaInterval); document.getElementById('user-dropdown')?.classList.add('hidden'); mostrarBienvenida(); showToast('Sesión cerrada', 'info'); }

// ============================================
// TEMA, MODAL, NOTIFICACIONES, TOAST, UTILIDADES
// ============================================
function toggleTema() { APP_STATE.tema = APP_STATE.tema === 'light' ? 'dark' : 'light'; aplicarTema(APP_STATE.tema); localStorage.setItem(CONFIG.STORAGE_KEYS.TEMA, APP_STATE.tema); }
function aplicarTema(t) { document.documentElement.setAttribute('data-theme', t); const i = document.querySelector('#theme-toggle i'); if (i) i.className = t === 'dark' ? 'bx bx-sun' : 'bx bx-moon'; }
function cerrarModal() { document.getElementById('modal')?.classList.add('hidden'); document.getElementById('modal-footer')?.classList.add('hidden'); }
function toggleNotificaciones() { APP_STATE.notificationsOpen = !APP_STATE.notificationsOpen; const p = document.getElementById('notification-panel'); if (!p) return; APP_STATE.notificationsOpen ? (p.classList.remove('hidden'), cargarNotificaciones()) : p.classList.add('hidden'); }
function cargarNotificaciones(filtro = 'all') { const l = document.getElementById('notification-list'); if (!l) return; let n = db?.getNotificaciones?.() || []; if (filtro === 'unread') n = n.filter(x => !x.leida); l.innerHTML = n.length === 0 ? '<div class="notification-empty"><i class="bx bx-bell-off"></i><p>No hay notificaciones</p></div>' : n.map(x => `<div style="padding:12px;border-bottom:1px solid var(--gris-medio);${!x.leida?'background:var(--azul-surface);border-left:3px solid var(--azul-primario);':''}"><strong>${x.titulo}</strong><p style="font-size:0.85rem;">${x.mensaje}</p><small>${formatearFecha(x.fecha)}</small></div>`).join(''); APP_STATE.notificacionesNoLeidas = n.filter(x => !x.leida).length; actualizarBadgeNotificaciones(); }
function actualizarBadgeNotificaciones() { const b = document.querySelector('.badge-notifications'); if (b) { if (APP_STATE.notificacionesNoLeidas > 0) { b.textContent = APP_STATE.notificacionesNoLeidas > 99 ? '99+' : APP_STATE.notificacionesNoLeidas; b.classList.remove('hidden'); } else b.classList.add('hidden'); } }
function toggleSearchBar() { APP_STATE.searchBarOpen = !APP_STATE.searchBarOpen; const b = document.getElementById('search-bar'); if (!b) return; APP_STATE.searchBarOpen ? (b.classList.remove('hidden'), document.getElementById('global-search-input')?.focus()) : b.classList.add('hidden'); }
function confirmarAsistencia(e) { const t = document.querySelector('input[name="tipo-asistente"]:checked')?.value || 'Hermano'; if (APP_STATE.usuario && db) db.addAsistencia?.({ usuario_id: APP_STATE.usuario.id, nombre: APP_STATE.usuario.nombre, estado: e, tipo: t }); showToast(`✅ Asistencia: ${e} (${t})`, 'success'); }
function compartirVersiculo() { const v = CONFIG.VERSICULOS[new Date().getDay() % CONFIG.VERSICULOS.length]; if (navigator.share) navigator.share({ title: 'IPUC LA FONDA', text: `"${v.texto}" - ${v.referencia}` }).catch(() => {}); else { navigator.clipboard?.writeText(`"${v.texto}" - ${v.referencia}`); showToast('📋 Copiado', 'info'); } }
function confirmarAccion(t, m, cb) { document.getElementById('confirm-title').textContent = t; document.getElementById('confirm-message').textContent = m; APP_STATE.pendingConfirmation = cb; document.getElementById('confirm-modal')?.classList.remove('hidden'); }
function toggleFabMenu() { APP_STATE.fabMenuOpen = !APP_STATE.fabMenuOpen; document.getElementById('fab-menu')?.classList.toggle('hidden', !APP_STATE.fabMenuOpen); }
function toggleUserDropdown() { APP_STATE.userDropdownOpen = !APP_STATE.userDropdownOpen; document.getElementById('user-dropdown')?.classList.toggle('hidden', !APP_STATE.userDropdownOpen); }
function showToast(m, tipo = 'info') { const c = document.getElementById('toast-container'); if (!c) return; const t = document.createElement('div'); t.className = `toast ${tipo}`; t.setAttribute('role', 'alert'); t.innerHTML = `<span>${m}</span>`; c.appendChild(t); setTimeout(() => { t.classList.add('toast-hide'); setTimeout(() => t.remove(), 300); }, 3500); }
function togglePassword(id) { const i = document.getElementById(id); if (!i) return; const icon = i.parentElement?.querySelector('i'); if (i.type === 'password') { i.type = 'text'; if (icon) icon.className = 'bx bx-hide'; } else { i.type = 'password'; if (icon) icon.className = 'bx bx-show'; } }
function formatearFecha(f) { const d = new Date(f), a = new Date(); const diff = a - d; if (diff < 60000) return 'Ahora'; if (diff < 3600000) return `Hace ${Math.floor(diff/60000)} min`; if (diff < 86400000) return `Hace ${Math.floor(diff/3600000)} h`; return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }); }

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
window.showToast = showToast;

console.log(`✅ IPUC LA FONDA v${CONFIG.VERSION} - Cargado correctamente`);
console.log('🔒 Autenticación local con Database v5.0');
console.log('💡 Ejecuta crearAdmin() en la consola para crear el administrador');
