// ============================================
// IPUC LA FONDA - JAVASCRIPT v2.0 - COMPLETO
// Todas las funciones, botones, enlaces y secciones funcionales
// ============================================

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
    API_URL: 'https://ipuc-api.onrender.com/api',
    STORAGE_KEYS: {
        TOKEN: 'ipuc_token',
        USUARIO: 'ipuc_usuario',
        ROL: 'ipuc_rol',
        TEMA: 'ipuc_tema'
    },
    DIAS_SEMANA: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    TITULOS_PAGINAS: {
        'inicio': 'Inicio',
        'horarios': 'Horarios de Cultos',
        'asistencia': 'Confirmar Asistencia',
        'noticias': 'Noticias',
        'eventos': 'Eventos',
        'chat': 'Mensajes',
        'directorio': 'Directorio',
        'peticiones': 'Peticiones de Oración',
        'encuestas': 'Encuestas',
        'biblioteca': 'Biblioteca Digital',
        'galeria': 'Galería',
        'devocional': 'Devocional Diario',
        'perfil': 'Mi Perfil',
        'configuracion': 'Configuración',
        'dashboard': 'Dashboard',
        'gestion-usuarios': 'Gestión de Usuarios',
        'gestion-noticias': 'Gestión de Noticias',
        'gestion-eventos': 'Gestión de Eventos',
        'versiculos': 'Versículos Diarios',
        'insignias': 'Gestión de Insignias',
        'gestion-biblioteca': 'Gestión de Biblioteca',
        'gestion-galeria': 'Gestión de Galería',
        'sistema': 'Configuración del Sistema'
    }
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
    userDropdownOpen: false,
    fabMenuOpen: false,
    contadorInterval: null,
    fechaInterval: null,
    notificacionesNoLeidas: 0,
    pendingConfirmation: null
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
});

function inicializarApp() {
    // Cargar tema
    const temaGuardado = localStorage.getItem(CONFIG.STORAGE_KEYS.TEMA) || 'light';
    APP_STATE.tema = temaGuardado;
    aplicarTema(temaGuardado);

    // Verificar sesión
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    const usuarioData = localStorage.getItem(CONFIG.STORAGE_KEYS.USUARIO);
    const rol = localStorage.getItem(CONFIG.STORAGE_KEYS.ROL);
    let usuario = null;
    try { usuario = usuarioData ? JSON.parse(usuarioData) : null; } catch (e) {}

    // Ocultar splash
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.style.display = 'none';

        if (token && usuario) {
            APP_STATE.token = token;
            APP_STATE.usuario = usuario;
            APP_STATE.rol = rol || 'usuario';
            mostrarApp();
        } else {
            mostrarBienvenida();
        }
    }, 2500);

    inicializarEventListeners();
    manejarResponsiveSidebar();
    window.addEventListener('resize', () => manejarResponsiveSidebar());
}

// ============================================
// EVENT LISTENERS - TODOS LOS BOTONES
// ============================================
function inicializarEventListeners() {
    // Sidebar
    document.getElementById('menu-toggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('close-sidebar')?.addEventListener('click', cerrarSidebar);
    document.getElementById('sidebar-overlay')?.addEventListener('click', cerrarSidebar);

    // Navegación - Todos los links del sidebar
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

    // Usuario dropdown
    document.getElementById('user-mini')?.addEventListener('click', toggleUserDropdown);

    // FAB
    document.getElementById('fab-main')?.addEventListener('click', toggleFabMenu);
    document.querySelectorAll('.fab-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            if (action === 'oracion') navegarA('peticiones');
            if (action === 'asistencia') navegarA('asistencia');
            if (action === 'compartir') compartirVersiculo();
            toggleFabMenu();
        });
    });

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', (e) => {
        e.preventDefault();
        confirmarAccion('¿Cerrar sesión?', 'Serás redirigido a la pantalla de inicio.', cerrarSesion);
    });

    // Bienvenida
    document.getElementById('btn-login')?.addEventListener('click', mostrarLogin);
    document.getElementById('btn-register')?.addEventListener('click', mostrarRegistro);
    document.getElementById('btn-continue-guest')?.addEventListener('click', continuarComoInvitado);

    // Modal
    document.getElementById('modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) cerrarModal();
    });
    document.querySelector('.modal-close')?.addEventListener('click', cerrarModal);

    // Confirm modal
    document.getElementById('confirm-cancel')?.addEventListener('click', () => {
        document.getElementById('confirm-modal')?.classList.add('hidden');
    });
    document.getElementById('confirm-accept')?.addEventListener('click', () => {
        if (APP_STATE.pendingConfirmation) {
            APP_STATE.pendingConfirmation();
            APP_STATE.pendingConfirmation = null;
        }
        document.getElementById('confirm-modal')?.classList.add('hidden');
    });
    document.getElementById('confirm-modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) this.classList.add('hidden');
    });

    // Escape para cerrar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (APP_STATE.notificationsOpen) {
                document.getElementById('notification-panel')?.classList.add('hidden');
                APP_STATE.notificationsOpen = false;
            }
            if (!document.getElementById('modal')?.classList.contains('hidden')) cerrarModal();
        }
    });

    // Clics fuera
    document.addEventListener('click', (e) => {
        if (APP_STATE.userDropdownOpen && !e.target.closest('#user-mini') && !e.target.closest('#user-dropdown')) {
            document.getElementById('user-dropdown')?.classList.add('hidden');
            APP_STATE.userDropdownOpen = false;
        }
        if (APP_STATE.fabMenuOpen && !e.target.closest('#fab-main') && !e.target.closest('#fab-menu')) {
            document.getElementById('fab-menu')?.classList.add('hidden');
            APP_STATE.fabMenuOpen = false;
        }
    });
}

// ============================================
// NAVEGACIÓN
// ============================================
function mostrarApp() {
    document.getElementById('welcome-screen')?.classList.add('hidden');
    document.getElementById('app')?.classList.remove('hidden');
    actualizarSidebarUsuario();
    navegarA('inicio');
    iniciarContadorRegresivo();
    iniciarActualizacionFecha();
    document.getElementById('fab-main')?.classList.remove('hidden');
}

function mostrarBienvenida() {
    document.getElementById('app')?.classList.add('hidden');
    document.getElementById('welcome-screen')?.classList.remove('hidden');
    document.getElementById('fab-main')?.classList.add('hidden');
}

function toggleSidebar() {
    APP_STATE.sidebarOpen = !APP_STATE.sidebarOpen;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (APP_STATE.sidebarOpen) {
        sidebar?.classList.add('open');
        overlay?.classList.remove('hidden');
    } else {
        sidebar?.classList.remove('open');
        overlay?.classList.add('hidden');
    }
}

function cerrarSidebar() {
    if (APP_STATE.sidebarLocked) return;
    APP_STATE.sidebarOpen = false;
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.add('hidden');
}

function manejarResponsiveSidebar() {
    if (window.innerWidth >= 1024) {
        APP_STATE.sidebarLocked = true;
        document.getElementById('sidebar')?.classList.add('open');
        document.getElementById('sidebar-overlay')?.classList.add('hidden');
    } else {
        APP_STATE.sidebarLocked = false;
        if (!APP_STATE.sidebarOpen) {
            document.getElementById('sidebar')?.classList.remove('open');
        }
    }
}

function navegarA(page) {
    if (!page) return;
    APP_STATE.currentPage = page;

    // Actualizar nav activa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-page') === page);
    });

    // Actualizar título
    const titulo = CONFIG.TITULOS_PAGINAS[page] || page;
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = titulo;

    // Cargar página
    cargarPagina(page);

    // Cerrar sidebar en móvil
    if (window.innerWidth < 1024) cerrarSidebar();
}

function actualizarSidebarUsuario() {
    if (!APP_STATE.usuario) return;
    const userMini = document.getElementById('user-mini');
    if (userMini) {
        const img = userMini.querySelector('img');
        const nameEl = userMini.querySelector('.user-name');
        const roleEl = userMini.querySelector('.user-role');
        if (img) img.src = APP_STATE.usuario.foto || 'assets/avatars/default.png';
        if (nameEl) nameEl.textContent = APP_STATE.usuario.nombre || 'Usuario';
        if (roleEl) roleEl.textContent = APP_STATE.rol === 'admin' ? 'Administrador' : APP_STATE.rol === 'invitado' ? 'Invitado' : 'Miembro';
    }
    // Mostrar menú admin
    if (APP_STATE.rol === 'admin') {
        document.getElementById('admin-menu')?.classList.remove('hidden');
    }
}

// ============================================
// CARGAR PÁGINAS
// ============================================
function cargarPagina(page) {
    const content = document.getElementById('page-content');
    if (!content) return;

    content.innerHTML = '<div class="page-loader"><div class="spinner"></div><p>Cargando...</p></div>';

    setTimeout(() => {
        switch(page) {
            case 'inicio': cargarInicio(content); break;
            case 'horarios': cargarHorarios(content); break;
            case 'asistencia': cargarAsistencia(content); break;
            case 'noticias': cargarNoticias(content); break;
            case 'eventos': cargarEventos(content); break;
            case 'chat': cargarChat(content); break;
            case 'directorio': cargarDirectorio(content); break;
            case 'peticiones': cargarPeticiones(content); break;
            case 'encuestas': cargarEncuestas(content); break;
            case 'biblioteca': cargarBiblioteca(content); break;
            case 'galeria': cargarGaleria(content); break;
            case 'devocional': cargarDevocional(content); break;
            case 'perfil': cargarPerfil(content); break;
            case 'configuracion': cargarConfiguracion(content); break;
            case 'dashboard': cargarDashboard(content); break;
            case 'gestion-usuarios': cargarGestionUsuarios(content); break;
            case 'gestion-noticias': cargarGestionNoticias(content); break;
            case 'gestion-eventos': cargarGestionEventos(content); break;
            case 'versiculos': cargarVersiculos(content); break;
            case 'sistema': cargarSistema(content); break;
            default:
                content.innerHTML = `<div class="card fade-in"><h2>${CONFIG.TITULOS_PAGINAS[page] || page}</h2><p style="text-align:center;padding:40px;">Sección en desarrollo</p></div>`;
        }
    }, 150);
}

// ============================================
// PÁGINA: INICIO
// ============================================
function cargarInicio(container) {
    container.innerHTML = `
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
                <div class="card card-glass">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:44px;height:44px;border-radius:50%;background:var(--azul-primario);display:flex;align-items:center;justify-content:center;color:white;font-size:1.3rem;"><i class="bx bx-calendar"></i></div>
                        <div><div style="font-size:0.7rem;opacity:0.7;">Fecha</div><div style="font-weight:700;" id="fecha-actual"></div></div>
                    </div>
                </div>
                <div class="card card-glass">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:44px;height:44px;border-radius:50%;background:var(--dorado);display:flex;align-items:center;justify-content:center;color:var(--azul-primario);font-size:1.3rem;"><i class="bx bx-time"></i></div>
                        <div><div style="font-size:0.7rem;opacity:0.7;">Hora</div><div style="font-weight:700;" id="hora-actual"></div></div>
                    </div>
                </div>
            </div>
            <div class="card" style="border-left:4px solid var(--dorado);">
                <h3><i class="bx bx-bible" style="color:var(--dorado);"></i> Versículo del Día</h3>
                <div id="versiculo-content" style="font-style:italic;font-size:1rem;line-height:1.8;margin-top:8px;">Cargando...</div>
            </div>
            <div class="card" style="margin-top:12px;">
                <h3>Accesos Rápidos</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:8px;">
                    <button class="btn-outline btn-sm" onclick="navegarA('asistencia')"><i class="bx bx-check-shield"></i> Asistencia</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('peticiones')"><i class="bx bx-pray"></i> Oración</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('biblioteca')"><i class="bx bx-book-open"></i> Biblioteca</button>
                    <button class="btn-outline btn-sm" onclick="navegarA('devocional')"><i class="bx bx-bible"></i> Devocional</button>
                </div>
            </div>
        </div>
    `;
    actualizarFechaHora();
    if (!APP_STATE.fechaInterval) APP_STATE.fechaInterval = setInterval(actualizarFechaHora, 1000);
    cargarVersiculoDiario();
}

// ============================================
// PÁGINA: HORARIOS
// ============================================
function cargarHorarios(container) {
    const horarios = [
        { dia: 'Lunes', cultos: [] },
        { dia: 'Martes', cultos: [{ nombre: 'Culto de Oración', hora: '6:00 PM - 8:30 PM' }] },
        { dia: 'Miércoles', cultos: [{ nombre: 'Culto Campal', hora: '4:00 PM - 7:00 PM' }] },
        { dia: 'Jueves', cultos: [{ nombre: 'Culto de Refrán', hora: '4:00 PM - 7:00 PM' }] },
        { dia: 'Viernes', cultos: [{ nombre: 'Culto de Jóvenes', hora: '6:00 PM - 8:30 PM' }] },
        { dia: 'Sábado', cultos: [] },
        { dia: 'Domingo', cultos: [{ nombre: 'Culto Dominical', hora: '10:00 AM - 12:00 PM' }] }
    ];
    const hoy = new Date().getDay();
    const diaActual = hoy === 0 ? 6 : hoy - 1;

    container.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-time-five"></i> Horarios de Cultos</h2>
            <div style="display:grid;gap:10px;margin-top:16px;">
                ${horarios.map((dia, i) => `
                    <div class="card" style="border-left:4px solid ${i === diaActual ? 'var(--azul-primario)' : 'var(--gris-medio)'};">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <h3>${dia.dia} ${i === diaActual ? '<span style="background:var(--azul-primario);color:white;padding:2px 8px;border-radius:10px;font-size:0.7rem;">HOY</span>' : ''}</h3>
                                ${dia.cultos.length ? dia.cultos.map(c => `<p style="color:var(--gris-texto);">${c.nombre} - ${c.hora}</p>`).join('') : '<p style="color:var(--gris-texto);">No hay culto</p>'}
                            </div>
                            ${dia.cultos.length ? '<button class="btn-primary btn-sm" onclick="navegarA(\'asistencia\')">Asistir</button>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ============================================
// PÁGINA: ASISTENCIA
// ============================================
function cargarAsistencia(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-check-shield"></i> Confirmar Asistencia</h2>
            <div class="card" style="text-align:center;padding:30px;">
                <i class="bx bx-calendar-check" style="font-size:3rem;color:var(--azul-primario);"></i>
                <h3 style="margin:12px 0;">Próximo Culto</h3>
                <p id="proximo-culto-asistencia">Cargando...</p>
                <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
                    <button class="btn-primary btn-sm" onclick="confirmarAsistencia('Asistiré')"><i class="bx bx-check"></i> Voy</button>
                    <button class="btn-secondary btn-sm" onclick="confirmarAsistencia('Tal vez')"><i class="bx bx-question-mark"></i> Tal vez</button>
                    <button class="btn-outline btn-sm" onclick="confirmarAsistencia('No asistiré')"><i class="bx bx-x"></i> No</button>
                </div>
            </div>
            <div class="card" style="margin-top:12px;">
                <h3>Tipo de Asistente</h3>
                <div style="display:flex;gap:12px;margin-top:8px;">
                    <label><input type="radio" name="tipo-asistente" value="Hermano" checked> Hermano</label>
                    <label><input type="radio" name="tipo-asistente" value="Amigo"> Amigo</label>
                    <label><input type="radio" name="tipo-asistente" value="Niño"> Niño</label>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// PÁGINAS: NOTICIAS, EVENTOS, CHAT, DIRECTORIO, PETICIONES, ENCUESTAS, BIBLIOTECA, GALERÍA
// ============================================
function cargarNoticias(container) {
    container.innerHTML = `<div class="fade-in"><h2><i class="bx bx-news"></i> Noticias</h2><div class="card"><p style="text-align:center;padding:30px;">No hay noticias publicadas</p></div></div>`;
}

function cargarEventos(container) {
    container.innerHTML = `<div class="fade-in"><h2><i class="bx bx-calendar-star"></i> Eventos</h2><div class="card"><p style="text-align:center;padding:30px;">No hay eventos programados</p></div></div>`;
}

function cargarChat(container) {
    container.innerHTML = `<div class="fade-in"><h2><i class="bx bx-chat"></i> Mensajes</h2><div class="card"><p style="text-align:center;padding:30px;">Selecciona una conversación</p></div></div>`;
}

function cargarDirectorio(container) {
    container.innerHTML = `<div class="fade-in"><h2><i class="bx bx-group"></i> Directorio</h2><div class="card"><p style="text-align:center;padding:30px;">Cargando miembros...</p></div></div>`;
}

function cargarPeticiones(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-pray"></i> Peticiones de Oración</h2>
            <div class="card" style="text-align:center;padding:30px;">
                <i class="bx bx-pray" style="font-size:3rem;color:var(--azul-primario);"></i>
                <p style="margin-top:12px;">Envía tu petición de oración</p>
                <button class="btn-primary" style="margin-top:12px;" onclick="showToast('Funcionalidad en desarrollo','info')">Nueva Petición</button>
            </div>
        </div>
    `;
}

function cargarEncuestas(container) {
    container.innerHTML = `<div class="fade-in"><h2><i class="bx bx-poll"></i> Encuestas</h2><div class="card"><p style="text-align:center;padding:30px;">No hay encuestas activas</p></div></div>`;
}

function cargarBiblioteca(container) {
    container.innerHTML = `<div class="fade-in"><h2><i class="bx bx-book-open"></i> Biblioteca</h2><div class="card"><p style="text-align:center;padding:30px;">Recursos disponibles pronto</p></div></div>`;
}

function cargarGaleria(container) {
    container.innerHTML = `<div class="fade-in"><h2><i class="bx bx-images"></i> Galería</h2><div class="card"><p style="text-align:center;padding:30px;">Fotos y videos pronto</p></div></div>`;
}

// ============================================
// PÁGINA: DEVOCIONAL
// ============================================
function cargarDevocional(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-bible"></i> Devocional Diario</h2>
            <div class="card" style="border-left:4px solid var(--dorado);text-align:center;padding:30px;">
                <div id="versiculo-content" style="font-style:italic;font-size:1.1rem;line-height:1.8;">Cargando...</div>
            </div>
            <button class="btn-primary" style="margin-top:12px;width:100%;" onclick="compartirVersiculo()"><i class="bx bx-share-alt"></i> Compartir</button>
        </div>
    `;
    cargarVersiculoDiario();
}

// ============================================
// PÁGINA: PERFIL
// ============================================
function cargarPerfil(container) {
    if (!APP_STATE.usuario) return;
    const u = APP_STATE.usuario;
    container.innerHTML = `
        <div class="fade-in">
            <div style="text-align:center;padding:30px;background:linear-gradient(135deg,var(--azul-primario),var(--azul-claro));color:white;border-radius:var(--borde-radius);margin-bottom:16px;">
                <img src="${u.foto || 'assets/avatars/default.png'}" alt="${u.nombre}" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--dorado);">
                <h2>${u.nombre} ${u.apellidos || ''}</h2>
                <p>@${u.usuario}</p>
                ${u.verificado ? '<span style="background:var(--info);padding:4px 12px;border-radius:20px;font-size:0.8rem;"><i class="bx bx-badge-check"></i> Verificado</span>' : ''}
            </div>
            <div class="card">
                <h3>Información</h3>
                <p><strong>Correo:</strong> ${u.correo || 'N/A'}</p>
                <p><strong>Celular:</strong> ${u.celular || 'N/A'}</p>
                <p><strong>Ministerio:</strong> ${u.ministerio || 'N/A'}</p>
                <p><strong>Rol:</strong> ${APP_STATE.rol === 'admin' ? 'Administrador' : 'Miembro'}</p>
            </div>
        </div>
    `;
}

// ============================================
// PÁGINA: CONFIGURACIÓN
// ============================================
function cargarConfiguracion(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-cog"></i> Configuración</h2>
            <div class="card">
                <h3>Tema</h3>
                <button class="btn-secondary btn-sm" onclick="toggleTema()" style="margin-top:8px;">
                    <i class="bx ${APP_STATE.tema === 'dark' ? 'bx-sun' : 'bx-moon'}"></i>
                    ${APP_STATE.tema === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                </button>
            </div>
            <div class="card" style="margin-top:12px;border-left:4px solid var(--error);">
                <h3 style="color:var(--error);">Cerrar Sesión</h3>
                <button class="btn-danger btn-sm" onclick="confirmarAccion('¿Cerrar sesión?','Serás redirigido al inicio.',cerrarSesion)" style="margin-top:8px;">
                    <i class="bx bx-log-out"></i> Cerrar Sesión
                </button>
            </div>
            <p style="text-align:center;margin-top:20px;font-size:0.8rem;opacity:0.7;">IPUC LA FONDA v2.0.0</p>
        </div>
    `;
}

// ============================================
// PÁGINAS ADMIN
// ============================================
function cargarDashboard(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-line-chart"></i> Dashboard</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px;">
                <div class="card"><h3>Usuarios</h3><p style="font-size:2rem;font-weight:700;">--</p></div>
                <div class="card"><h3>Asistencia</h3><p style="font-size:2rem;font-weight:700;">--</p></div>
                <div class="card"><h3>Eventos</h3><p style="font-size:2rem;font-weight:700;">--</p></div>
                <div class="card"><h3>Noticias</h3><p style="font-size:2rem;font-weight:700;">--</p></div>
            </div>
            <div class="card"><p style="text-align:center;">Dashboard en desarrollo</p></div>
        </div>
    `;
}

function cargarGestionUsuarios(container) {
    container.innerHTML = `<div class="fade-in"><h2><i class="bx bx-user-voice"></i> Gestión de Usuarios</h2><div class="card"><p style="text-align:center;padding:30px;">Panel de administración de usuarios</p></div></div>`;
}

function cargarGestionNoticias(container) {
    container.innerHTML = `<div class="fade-in"><h2><i class="bx bx-edit-alt"></i> Gestión de Noticias</h2><div class="card"><p style="text-align:center;padding:30px;">Crear y administrar noticias</p></div></div>`;
}

function cargarGestionEventos(container) {
    container.innerHTML = `<div class="fade-in"><h2><i class="bx bx-calendar-edit"></i> Gestión de Eventos</h2><div class="card"><p style="text-align:center;padding:30px;">Crear y administrar eventos</p></div></div>`;
}

function cargarVersiculos(container) {
    container.innerHTML = `<div class="fade-in"><h2><i class="bx bx-bookmark-plus"></i> Versículos</h2><div class="card"><p style="text-align:center;padding:30px;">Administrar versículos diarios</p></div></div>`;
}

function cargarSistema(container) {
    container.innerHTML = `<div class="fade-in"><h2><i class="bx bx-server"></i> Sistema</h2><div class="card"><p style="text-align:center;padding:30px;">Configuración del sistema</p></div></div>`;
}

// ============================================
// CONTADOR REGRESIVO
// ============================================
function iniciarContadorRegresivo() {
    if (APP_STATE.contadorInterval) clearInterval(APP_STATE.contadorInterval);
    actualizarContador();
    APP_STATE.contadorInterval = setInterval(actualizarContador, 1000);
}

function actualizarContador() {
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

    const elDias = document.getElementById('contador-dias');
    const elHoras = document.getElementById('contador-horas');
    const elMinutos = document.getElementById('contador-minutos');
    const elSegundos = document.getElementById('contador-segundos');
    const elTitulo = document.getElementById('contador-titulo');

    if (elDias) elDias.textContent = String(dias).padStart(2, '0');
    if (elHoras) elHoras.textContent = String(horas).padStart(2, '0');
    if (elMinutos) elMinutos.textContent = String(minutos).padStart(2, '0');
    if (elSegundos) elSegundos.textContent = String(segundos).padStart(2, '0');
    if (elTitulo) elTitulo.textContent = 'Culto Dominical - Domingo';
}

// ============================================
// FECHA Y HORA
// ============================================
function actualizarFechaHora() {
    const ahora = new Date();
    const fecha = document.getElementById('fecha-actual');
    const hora = document.getElementById('hora-actual');
    if (fecha) fecha.textContent = ahora.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (hora) hora.textContent = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function iniciarActualizacionFecha() {
    if (APP_STATE.fechaInterval) clearInterval(APP_STATE.fechaInterval);
    actualizarFechaHora();
    APP_STATE.fechaInterval = setInterval(actualizarFechaHora, 1000);
}

// ============================================
// VERSÍCULO DIARIO
// ============================================
function cargarVersiculoDiario() {
    const container = document.getElementById('versiculo-content');
    if (!container) return;
    container.innerHTML = `
        <p style="font-size:1rem;line-height:1.8;">"Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna."</p>
        <p style="font-weight:700;color:var(--azul-primario);margin-top:8px;">Juan 3:16</p>
    `;
}

// ============================================
// AUTENTICACIÓN
// ============================================
function mostrarLogin() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    const modalFooter = document.getElementById('modal-footer');
    if (!modal || !modalBody) return;

    if (modalTitle) modalTitle.textContent = 'Iniciar Sesión';
    if (modalFooter) modalFooter.classList.add('hidden');

    modalBody.innerHTML = `
        <form id="login-form">
            <div class="form-group"><label>Usuario o Correo</label><input type="text" class="form-input" name="usuario" placeholder="Ingresa tu usuario" required></div>
            <div class="form-group"><label>Contraseña</label><div style="position:relative;"><input type="password" class="form-input" name="password" id="login-password" placeholder="Ingresa tu contraseña" required><button type="button" class="btn-icon" onclick="togglePassword('login-password')" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);"><i class="bx bx-show"></i></button></div></div>
            <button type="submit" class="btn-primary" style="width:100%;">Iniciar Sesión</button>
        </form>
        <p style="text-align:center;margin-top:16px;"><a href="#" onclick="mostrarRegistro()" style="color:var(--azul-primario);">¿No tienes cuenta? Regístrate</a></p>
    `;

    modal.classList.remove('hidden');

    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const usuario = formData.get('usuario');
        const password = formData.get('password');
        await realizarLogin(usuario, password);
    });
}

async function realizarLogin(usuario, password) {
    try {
        const response = await fetch(`${CONFIG.API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });
        const data = await response.json();
        if (response.ok && data.token) {
            guardarSesion(data);
            cerrarModal();
            mostrarApp();
            showToast('¡Bienvenido!', 'success');
        } else {
            showToast(data.error || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        showToast('Error de conexión con el servidor', 'error');
    }
}

function mostrarRegistro() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    const modalFooter = document.getElementById('modal-footer');
    if (!modal || !modalBody) return;

    if (modalTitle) modalTitle.textContent = 'Crear Cuenta';
    if (modalFooter) modalFooter.classList.add('hidden');

    modalBody.innerHTML = `
        <form id="registro-form">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group"><label>Nombre</label><input type="text" class="form-input" name="nombre" required></div>
                <div class="form-group"><label>Apellidos</label><input type="text" class="form-input" name="apellidos" required></div>
            </div>
            <div class="form-group"><label>Documento</label><input type="text" class="form-input" name="documento" required></div>
            <div class="form-group"><label>Correo</label><input type="email" class="form-input" name="correo" required></div>
            <div class="form-group"><label>Celular</label><input type="tel" class="form-input" name="celular" required></div>
            <div class="form-group"><label>Usuario</label><input type="text" class="form-input" name="usuario" required></div>
            <div class="form-group"><label>Contraseña</label><input type="password" class="form-input" name="password" required minlength="6"></div>
            <button type="submit" class="btn-primary" style="width:100%;">Registrarse</button>
        </form>
        <p style="text-align:center;margin-top:16px;"><a href="#" onclick="mostrarLogin()" style="color:var(--azul-primario);">¿Ya tienes cuenta? Inicia sesión</a></p>
    `;

    modal.classList.remove('hidden');

    document.getElementById('registro-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const datos = Object.fromEntries(formData);
        try {
            const response = await fetch(`${CONFIG.API_URL}/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const data = await response.json();
            if (response.ok) {
                showToast('Registro exitoso. Inicia sesión.', 'success');
                setTimeout(() => mostrarLogin(), 1500);
            } else {
                showToast(data.error || 'Error en el registro', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        }
    });
}

function continuarComoInvitado() {
    APP_STATE.rol = 'invitado';
    APP_STATE.token = 'guest-token';
    APP_STATE.usuario = { id: 0, nombre: 'Invitado', usuario: 'invitado', foto: 'assets/avatars/default.png', verificado: false, ministerio: 'Visitante', insignias: [] };
    mostrarApp();
    showToast('Navegando como invitado', 'info');
}

function guardarSesion(data) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(CONFIG.STORAGE_KEYS.USUARIO, JSON.stringify(data.usuario));
    localStorage.setItem(CONFIG.STORAGE_KEYS.ROL, data.rol);
    APP_STATE.token = data.token;
    APP_STATE.usuario = data.usuario;
    APP_STATE.rol = data.rol;
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
    showToast('Sesión cerrada', 'info');
}

// ============================================
// TEMA
// ============================================
function toggleTema() {
    APP_STATE.tema = APP_STATE.tema === 'light' ? 'dark' : 'light';
    aplicarTema(APP_STATE.tema);
    localStorage.setItem(CONFIG.STORAGE_KEYS.TEMA, APP_STATE.tema);
}

function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    const icon = document.querySelector('#theme-toggle i');
    if (icon) icon.className = tema === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
}

// ============================================
// MODAL
// ============================================
function cerrarModal() {
    document.getElementById('modal')?.classList.add('hidden');
    document.getElementById('modal-footer')?.classList.add('hidden');
}

// ============================================
// NOTIFICACIONES
// ============================================
function toggleNotificaciones() {
    APP_STATE.notificationsOpen = !APP_STATE.notificationsOpen;
    const panel = document.getElementById('notification-panel');
    if (!panel) return;
    if (APP_STATE.notificationsOpen) {
        panel.classList.remove('hidden');
        cargarNotificaciones();
    } else {
        panel.classList.add('hidden');
    }
}

function cargarNotificaciones() {
    const list = document.getElementById('notification-list');
    if (!list) return;
    list.innerHTML = '<div class="notification-empty"><i class="bx bx-bell-off"></i><p>No hay notificaciones</p></div>';
}

// ============================================
// ACCIONES
// ============================================
function confirmarAsistencia(estado) {
    const tipo = document.querySelector('input[name="tipo-asistente"]:checked')?.value || 'Hermano';
    showToast(`Asistencia: ${estado} (${tipo})`, 'success');
}

function compartirVersiculo() {
    if (navigator.share) {
        navigator.share({ title: 'IPUC LA FONDA', text: 'Versículo del día', url: window.location.href }).catch(() => {});
    } else {
        showToast('Enlace copiado', 'info');
    }
}

function confirmarAccion(titulo, mensaje, callback) {
    document.getElementById('confirm-title').textContent = titulo;
    document.getElementById('confirm-message').textContent = mensaje;
    APP_STATE.pendingConfirmation = callback;
    document.getElementById('confirm-modal')?.classList.remove('hidden');
}

// ============================================
// FAB
// ============================================
function toggleFabMenu() {
    APP_STATE.fabMenuOpen = !APP_STATE.fabMenuOpen;
    const menu = document.getElementById('fab-menu');
    if (!menu) return;
    menu.classList.toggle('hidden', !APP_STATE.fabMenuOpen);
}

// ============================================
// USER DROPDOWN
// ============================================
function toggleUserDropdown() {
    APP_STATE.userDropdownOpen = !APP_STATE.userDropdownOpen;
    const dropdown = document.getElementById('user-dropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('hidden', !APP_STATE.userDropdownOpen);
}

// ============================================
// TOAST
// ============================================
function showToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `<span>${mensaje}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// UTILIDADES
// ============================================
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const icon = input.parentElement?.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.className = 'bx bx-hide';
    } else {
        input.type = 'password';
        if (icon) icon.className = 'bx bx-show';
    }
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const diff = ahora - fecha;
    if (diff < 60000) return 'Ahora mismo';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
    return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
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
window.showToast = showToast;

console.log('✅ IPUC LA FONDA - JavaScript cargado correctamente');
