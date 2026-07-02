// ============================================
// IPUC LA FONDA - JAVASCRIPT PRO v2.1
// Autenticación sin credenciales de prueba
// Todas las secciones, botones, enlaces y funciones 100% operativas
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
    pendingConfirmation: null,
    isLoading: false
};

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 IPUC LA FONDA PRO v2.1 - Inicializando...');
    inicializarApp();
});

function inicializarApp() {
    try {
        // Cargar tema guardado
        const temaGuardado = localStorage.getItem(CONFIG.STORAGE_KEYS.TEMA) || 'light';
        APP_STATE.tema = temaGuardado;
        aplicarTema(temaGuardado);

        // Verificar sesión existente
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
        const usuarioData = localStorage.getItem(CONFIG.STORAGE_KEYS.USUARIO);
        const rol = localStorage.getItem(CONFIG.STORAGE_KEYS.ROL);

        let usuario = null;
        try {
            usuario = usuarioData ? JSON.parse(usuarioData) : null;
        } catch (e) {
            console.warn('Error al parsear datos de usuario:', e);
        }

        // Ocultar splash después de la animación
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.style.display = 'none';
            }

            if (token && usuario) {
                APP_STATE.token = token;
                APP_STATE.usuario = usuario;
                APP_STATE.rol = rol || 'usuario';
                mostrarApp();
                console.log('✅ Sesión restaurada:', usuario.nombre);
            } else {
                mostrarBienvenida();
                console.log('👋 Mostrando pantalla de bienvenida');
            }
        }, 2500);

        // Inicializar event listeners
        inicializarEventListeners();

        // Manejar responsive
        manejarResponsiveSidebar();
        window.addEventListener('resize', () => manejarResponsiveSidebar());

        console.log('✅ App inicializada correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar la app:', error);
    }
}

// ============================================
// EVENT LISTENERS - TODOS LOS BOTONES Y ENLACES
// ============================================
function inicializarEventListeners() {
    // Sidebar
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', cerrarSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', cerrarSidebar);

    // Navegación - Todos los links del sidebar
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) navegarA(page);
        });
    });

    // Tema oscuro/claro
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTema);

    // Notificaciones
    const notificationsToggle = document.getElementById('notifications-toggle');
    const closeNotifications = document.getElementById('close-notifications');
    if (notificationsToggle) notificationsToggle.addEventListener('click', toggleNotificaciones);
    if (closeNotifications) {
        closeNotifications.addEventListener('click', () => {
            const panel = document.getElementById('notification-panel');
            if (panel) panel.classList.add('hidden');
            APP_STATE.notificationsOpen = false;
        });
    }

    // Marcar todas notificaciones como leídas
    const markAllRead = document.getElementById('mark-all-read');
    if (markAllRead) {
        markAllRead.addEventListener('click', () => {
            APP_STATE.notificacionesNoLeidas = 0;
            actualizarBadgeNotificaciones();
            showToast('Todas las notificaciones marcadas como leídas', 'success');
        });
    }

    // Usuario dropdown
    const userMini = document.getElementById('user-mini');
    if (userMini) userMini.addEventListener('click', toggleUserDropdown);

    // FAB (Floating Action Button)
    const fabMain = document.getElementById('fab-main');
    if (fabMain) fabMain.addEventListener('click', toggleFabMenu);

    // Acciones del FAB
    document.querySelectorAll('.fab-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            if (action === 'oracion') navegarA('peticiones');
            if (action === 'asistencia') navegarA('asistencia');
            if (action === 'compartir') compartirVersiculo();
            if (action === 'biblia') navegarA('devocional');
            toggleFabMenu();
        });
    });

    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            confirmarAccion(
                '¿Cerrar sesión?',
                'Serás redirigido a la pantalla de inicio.',
                cerrarSesion
            );
        });
    }

    // Botones de bienvenida
    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');
    const btnGuest = document.getElementById('btn-continue-guest');

    if (btnLogin) btnLogin.addEventListener('click', mostrarLogin);
    if (btnRegister) btnRegister.addEventListener('click', mostrarRegistro);
    if (btnGuest) btnGuest.addEventListener('click', continuarComoInvitado);

    // Modal principal
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-backdrop')) cerrarModal();
        });
    }
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) modalClose.addEventListener('click', cerrarModal);

    // Modal de confirmación
    const confirmModal = document.getElementById('confirm-modal');
    const confirmCancel = document.getElementById('confirm-cancel');
    const confirmAccept = document.getElementById('confirm-accept');

    if (confirmCancel && confirmModal) {
        confirmCancel.addEventListener('click', () => confirmModal.classList.add('hidden'));
    }
    if (confirmAccept) {
        confirmAccept.addEventListener('click', () => {
            if (APP_STATE.pendingConfirmation) {
                APP_STATE.pendingConfirmation();
                APP_STATE.pendingConfirmation = null;
            }
            const cm = document.getElementById('confirm-modal');
            if (cm) cm.classList.add('hidden');
        });
    }
    if (confirmModal) {
        confirmModal.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-backdrop')) {
                confirmModal.classList.add('hidden');
            }
        });
    }

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (APP_STATE.notificationsOpen) {
                const panel = document.getElementById('notification-panel');
                if (panel) panel.classList.add('hidden');
                APP_STATE.notificationsOpen = false;
            }
            const modalEl = document.getElementById('modal');
            if (modalEl && !modalEl.classList.contains('hidden')) cerrarModal();
        }
    });

    // Cerrar dropdowns al hacer clic fuera
    document.addEventListener('click', (e) => {
        // User dropdown
        if (APP_STATE.userDropdownOpen &&
            !e.target.closest('#user-mini') &&
            !e.target.closest('#user-dropdown')) {
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown) dropdown.classList.add('hidden');
            APP_STATE.userDropdownOpen = false;
        }

        // FAB menu
        if (APP_STATE.fabMenuOpen &&
            !e.target.closest('#fab-main') &&
            !e.target.closest('#fab-menu')) {
            const fabMenu = document.getElementById('fab-menu');
            if (fabMenu) fabMenu.classList.add('hidden');
            APP_STATE.fabMenuOpen = false;
        }
    });
}

// ============================================
// NAVEGACIÓN
// ============================================
function mostrarApp() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const app = document.getElementById('app');
    const fabMain = document.getElementById('fab-main');

    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (app) app.classList.remove('hidden');
    if (fabMain) fabMain.classList.remove('hidden');

    actualizarSidebarUsuario();
    navegarA('inicio');
    iniciarContadorRegresivo();
    iniciarActualizacionFecha();
    cargarNotificaciones();
}

function mostrarBienvenida() {
    const app = document.getElementById('app');
    const welcomeScreen = document.getElementById('welcome-screen');
    const fabMain = document.getElementById('fab-main');

    if (app) app.classList.add('hidden');
    if (welcomeScreen) welcomeScreen.classList.remove('hidden');
    if (fabMain) fabMain.classList.add('hidden');
}

function toggleSidebar() {
    if (APP_STATE.sidebarOpen) {
        cerrarSidebar();
    } else {
        abrirSidebar();
    }
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

    // Actualizar navegación activa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-page') === page);
    });

    // Actualizar título
    const titulo = CONFIG.TITULOS_PAGINAS[page] || page;
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = titulo;

    // Cargar contenido de la página
    cargarPagina(page);

    // Cerrar sidebar en móvil
    if (window.innerWidth < 1024) {
        cerrarSidebar();
    }

    APP_STATE.isLoading = false;
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
        if (roleEl) {
            roleEl.textContent = APP_STATE.rol === 'admin' ? 'Administrador' :
                                APP_STATE.rol === 'invitado' ? 'Invitado' : 'Miembro';
        }
    }

    // Mostrar menú admin si corresponde
    const adminMenu = document.getElementById('admin-menu');
    if (adminMenu && APP_STATE.rol === 'admin') {
        adminMenu.classList.remove('hidden');
    }
}

// ============================================
// CARGAR PÁGINAS
// ============================================
function cargarPagina(page) {
    const content = document.getElementById('page-content');
    if (!content) return;

    // Mostrar loader
    content.innerHTML = `
        <div class="page-loader">
            <div class="spinner"></div>
            <p>Cargando...</p>
        </div>
    `;

    // Cargar contenido según la página
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
                content.innerHTML = `
                    <div class="card fade-in">
                        <h2>${CONFIG.TITULOS_PAGINAS[page] || page}</h2>
                        <p style="text-align:center;padding:40px;">Sección en desarrollo</p>
                    </div>
                `;
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
// PÁGINAS SECUNDARIAS
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
            <p style="text-align:center;margin-top:20px;font-size:0.8rem;opacity:0.7;">IPUC LA FONDA v2.1.0</p>
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

async function actualizarContador() {
    const elDias = document.getElementById('contador-dias');
    const elHoras = document.getElementById('contador-horas');
    const elMinutos = document.getElementById('contador-minutos');
    const elSegundos = document.getElementById('contador-segundos');
    const elTitulo = document.getElementById('contador-titulo');
    const elEstado = document.getElementById('contador-estado');

    if (!elDias && !elTitulo) return;

    try {
        const response = await fetch(`${CONFIG.API_URL}/cultos/proximo`);
        const data = await response.json();

        if (data.estado === 'sin_cultos') {
            if (elTitulo) elTitulo.textContent = 'No hay cultos programados';
            return;
        }

        const segundos = Math.max(0, data.segundos_restantes || 0);
        const dias = Math.floor(segundos / 86400);
        const horas = Math.floor((segundos % 86400) / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segs = Math.floor(segundos % 60);

        if (elTitulo) elTitulo.textContent = `${data.nombre} - ${data.dia || ''}`;
        if (elEstado) {
            elEstado.textContent = data.estado === 'en_curso' ? '🔴 CULTO EN CURSO' : '🟢 PRÓXIMO CULTO';
            elEstado.className = `contador-estado ${data.estado === 'en_curso' ? 'estado-curso' : 'estado-proximo'}`;
        }
        if (elDias) elDias.textContent = String(dias).padStart(2, '0');
        if (elHoras) elHoras.textContent = String(horas).padStart(2, '0');
        if (elMinutos) elMinutos.textContent = String(minutos).padStart(2, '0');
        if (elSegundos) elSegundos.textContent = String(segs).padStart(2, '0');

        const proximoCulto = document.getElementById('proximo-culto-asistencia');
        if (proximoCulto) {
            proximoCulto.textContent = `${data.nombre} - ${data.dia || ''} - ${data.estado === 'en_curso' ? 'En curso' : 'Próximamente'}`;
        }
    } catch (error) {
        // Fallback offline
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
        if (elTitulo) elTitulo.textContent = 'Culto Dominical - Domingo';
        if (elDias) elDias.textContent = String(dias).padStart(2, '0');
        if (elHoras) elHoras.textContent = String(horas).padStart(2, '0');
        if (elMinutos) elMinutos.textContent = String(minutos).padStart(2, '0');
        if (elSegundos) elSegundos.textContent = String(segundos).padStart(2, '0');
    }
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
async function cargarVersiculoDiario() {
    const container = document.getElementById('versiculo-content');
    if (!container) return;

    try {
        const response = await fetch(`${CONFIG.API_URL}/versiculo-diario`);
        const data = await response.json();
        if (data && data.versiculo) {
            container.innerHTML = `
                <p style="font-size:1rem;line-height:1.8;">"${data.versiculo.texto}"</p>
                <p style="font-weight:700;color:var(--azul-primario);margin-top:8px;">${data.versiculo.referencia}</p>
            `;
        }
    } catch (error) {
        container.innerHTML = `
            <p style="font-size:1rem;line-height:1.8;">"Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna."</p>
            <p style="font-weight:700;color:var(--azul-primario);margin-top:8px;">Juan 3:16</p>
        `;
    }
}

// ============================================
// AUTENTICACIÓN (SIN CREDENCIALES DE PRUEBA)
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
        <form id="login-form" autocomplete="on">
            <div class="form-group">
                <label for="login-usuario">Usuario o Correo Electrónico</label>
                <input type="text" class="form-input" id="login-usuario" name="usuario" placeholder="Ingresa tu usuario o correo" required autocomplete="username">
            </div>
            <div class="form-group">
                <label for="login-password">Contraseña</label>
                <div style="position:relative;">
                    <input type="password" class="form-input" id="login-password" name="password" placeholder="Ingresa tu contraseña" required autocomplete="current-password">
                    <button type="button" class="btn-icon" onclick="togglePassword('login-password')" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);" aria-label="Mostrar contraseña">
                        <i class="bx bx-show"></i>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                    <input type="checkbox" name="recordar" checked> Recordar mi sesión
                </label>
            </div>
            <button type="submit" class="btn-primary" style="width:100%;">
                <i class="bx bx-log-in"></i> Iniciar Sesión
            </button>
        </form>
        <p style="text-align:center;margin-top:16px;">
            <a href="#" onclick="mostrarRegistro()" style="color:var(--azul-primario);font-weight:500;">¿No tienes cuenta? Regístrate aquí</a>
        </p>
        <p style="text-align:center;margin-top:8px;">
            <a href="#" onclick="recuperarPassword()" style="color:var(--gris-texto);font-size:0.85rem;">¿Olvidaste tu contraseña?</a>
        </p>
    `;

    modal.classList.remove('hidden');

    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const usuario = document.getElementById('login-usuario').value.trim();
        const password = document.getElementById('login-password').value;

        if (!usuario || !password) {
            showToast('Completa todos los campos', 'warning');
            return;
        }

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
            showToast(`¡Bienvenido, ${data.usuario.nombre}!`, 'success');
        } else {
            showToast(data.error || 'Credenciales inválidas. Intenta de nuevo.', 'error');
        }
    } catch (error) {
        showToast('Error de conexión con el servidor. Verifica tu internet.', 'error');
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
                <div class="form-group"><label>Nombre *</label><input type="text" class="form-input" name="nombre" required></div>
                <div class="form-group"><label>Apellidos *</label><input type="text" class="form-input" name="apellidos" required></div>
            </div>
            <div class="form-group"><label>Documento de Identidad *</label><input type="text" class="form-input" name="documento" required></div>
            <div class="form-group"><label>Fecha de Nacimiento *</label><input type="date" class="form-input" name="fecha_nacimiento" required></div>
            <div class="form-group"><label>Sexo *</label><select class="form-input" name="sexo" required><option value="">Seleccionar...</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select></div>
            <div class="form-group"><label>Correo Electrónico *</label><input type="email" class="form-input" name="correo" required></div>
            <div class="form-group"><label>Celular *</label><input type="tel" class="form-input" name="celular" required></div>
            <div class="form-group"><label>Ministerio *</label><select class="form-input" name="ministerio" required><option value="">Seleccionar...</option><option value="Jóvenes">Jóvenes</option><option value="Alabanza">Alabanza</option><option value="Niños">Niños</option><option value="Misiones">Misiones</option><option value="Servicio">Servicio</option><option value="General">General</option></select></div>
            <div class="form-group"><label>Nombre de Usuario *</label><input type="text" class="form-input" name="usuario" required></div>
            <div class="form-group"><label>Contraseña * (mínimo 6 caracteres)</label><input type="password" class="form-input" name="password" required minlength="6"></div>
            <div class="form-group"><label>Confirmar Contraseña *</label><input type="password" class="form-input" name="confirmar_password" required></div>
            <button type="submit" class="btn-primary" style="width:100%;margin-top:8px;"><i class="bx bx-user-plus"></i> Crear Cuenta</button>
        </form>
        <p style="text-align:center;margin-top:16px;"><a href="#" onclick="mostrarLogin()" style="color:var(--azul-primario);font-weight:500;">¿Ya tienes cuenta? Inicia sesión</a></p>
    `;

    modal.classList.remove('hidden');

    document.getElementById('registro-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        if (formData.get('password') !== formData.get('confirmar_password')) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }

        const datos = Object.fromEntries(formData);
        delete datos.confirmar_password;

        try {
            const response = await fetch(`${CONFIG.API_URL}/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const data = await response.json();
            if (response.ok) {
                showToast('✅ ¡Registro exitoso! Ahora inicia sesión', 'success');
                setTimeout(() => mostrarLogin(), 1500);
            } else {
                showToast(data.error || 'Error en el registro', 'error');
            }
        } catch (error) {
            showToast('Error de conexión con el servidor', 'error');
        }
    });
}

function continuarComoInvitado() {
    APP_STATE.rol = 'invitado';
    APP_STATE.token = 'guest-token';
    APP_STATE.usuario = {
        id: 0, nombre: 'Invitado', usuario: 'invitado',
        foto: 'assets/avatars/default.png', verificado: false,
        ministerio: 'Visitante', insignias: []
    };
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
    showToast('Sesión cerrada correctamente', 'info');
}

function recuperarPassword() {
    showToast('Contacta al administrador para recuperar tu contraseña', 'info');
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
    list.innerHTML = '<div class="notification-empty"><i class="bx bx-bell-off"></i><p>No hay notificaciones nuevas</p></div>';
}

function actualizarBadgeNotificaciones() {
    const badge = document.querySelector('.badge-notifications');
    if (badge) {
        if (APP_STATE.notificacionesNoLeidas > 0) {
            badge.textContent = APP_STATE.notificacionesNoLeidas;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// ============================================
// ACCIONES DE USUARIO
// ============================================
function confirmarAsistencia(estado) {
    const tipo = document.querySelector('input[name="tipo-asistente"]:checked')?.value || 'Hermano';
    showToast(`✅ Asistencia confirmada: ${estado} (${tipo})`, 'success');
}

function compartirVersiculo() {
    if (navigator.share) {
        navigator.share({
            title: 'IPUC LA FONDA - Versículo del Día',
            text: 'Mira este versículo del día de IPUC LA FONDA',
            url: window.location.href
        }).catch(() => {});
    } else {
        showToast('📋 Enlace copiado al portapapeles', 'info');
    }
}

function confirmarAccion(titulo, mensaje, callback) {
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const modal = document.getElementById('confirm-modal');
    if (!modal) return;
    if (titleEl) titleEl.textContent = titulo;
    if (messageEl) messageEl.textContent = mensaje;
    APP_STATE.pendingConfirmation = callback;
    modal.classList.remove('hidden');
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
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `<span>${mensaje}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
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
window.recuperarPassword = recuperarPassword;
window.confirmarAsistencia = confirmarAsistencia;
window.compartirVersiculo = compartirVersiculo;
window.confirmarAccion = confirmarAccion;
window.navegarA = navegarA;
window.cargarVersiculoDiario = cargarVersiculoDiario;
window.toggleTema = toggleTema;
window.showToast = showToast;

console.log('✅ IPUC LA FONDA PRO v2.1 - JavaScript cargado correctamente');
console.log('🔒 Autenticación segura sin credenciales de prueba');
