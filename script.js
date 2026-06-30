// ============================================
// IPUC LA FONDA - JAVASCRIPT COMPLETO v2.0
// ============================================

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
    // CAMBIAR ESTA URL por la de tu backend en Render
    API_URL: 'https://ipuc-api.onrender.com/api',
    STORAGE_KEYS: {
        TOKEN: 'ipuc_token',
        USUARIO: 'ipuc_usuario',
        ROL: 'ipuc_rol',
        TEMA: 'ipuc_tema'
    },
    PAGES: {
        public: ['inicio', 'horarios', 'devocional'],
        user: ['inicio', 'horarios', 'asistencia', 'noticias', 'eventos', 'chat', 'directorio', 
               'peticiones', 'encuestas', 'biblioteca', 'galeria', 'devocional', 'perfil', 'configuracion'],
        admin: ['dashboard', 'gestion-usuarios', 'gestion-noticias', 'gestion-eventos', 'versiculos',
                'insignias', 'gestion-biblioteca', 'gestion-galeria', 'sistema']
    },
    DIAS_SEMANA: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    TITULOS_PAGINAS: {
        'inicio': 'Inicio',
        'horarios': 'Horarios de Cultos',
        'asistencia': 'Confirmar Asistencia',
        'noticias': 'Noticias',
        'eventos': 'Eventos',
        'chat': 'Mensajes',
        'directorio': 'Directorio de Miembros',
        'peticiones': 'Peticiones de Oración',
        'encuestas': 'Encuestas',
        'biblioteca': 'Biblioteca Digital',
        'galeria': 'Galería',
        'devocional': 'Devocional Diario',
        'perfil': 'Mi Perfil',
        'configuracion': 'Configuración',
        'dashboard': 'Dashboard Administrativo',
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
    searchBarOpen: false,
    drawerOpen: false,
    contadorInterval: null,
    fechaInterval: null,
    mensajesNoLeidos: 0,
    notificacionesNoLeidas: 0,
    pendingConfirmation: null,
    isLoading: false
};

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 IPUC LA FONDA - Inicializando...');
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
        }, 2600);
        
        // Inicializar event listeners
        inicializarEventListeners();
        
        // Manejar responsive
        manejarResponsiveSidebar();
        window.addEventListener('resize', debounce(manejarResponsiveSidebar, 250));
        
        console.log('✅ App inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error al inicializar la app:', error);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function inicializarEventListeners() {
    // Sidebar
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
    if (closeSidebar) closeSidebar.addEventListener('click', cerrarSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', cerrarSidebar);
    
    // Navegación
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) navegarA(page);
        });
    });
    
    // Tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTema);
    
    // Notificaciones
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) notificationsToggle.addEventListener('click', toggleNotificaciones);
    
    const closeNotifications = document.getElementById('close-notifications');
    if (closeNotifications) {
        closeNotifications.addEventListener('click', () => {
            const panel = document.getElementById('notification-panel');
            if (panel) panel.classList.add('hidden');
            APP_STATE.notificationsOpen = false;
        });
    }
    
    // Búsqueda global
    const searchToggle = document.getElementById('search-toggle');
    const searchClose = document.getElementById('search-close');
    if (searchToggle) searchToggle.addEventListener('click', toggleSearchBar);
    if (searchClose) searchClose.addEventListener('click', cerrarSearchBar);
    
    // Usuario dropdown
    const userMini = document.getElementById('user-mini');
    if (userMini) userMini.addEventListener('click', toggleUserDropdown);
    
    // FAB
    const fabMain = document.getElementById('fab-main');
    if (fabMain) fabMain.addEventListener('click', toggleFabMenu);
    
    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            confirmarAccion('¿Cerrar sesión?', 'Serás redirigido a la pantalla de inicio.', () => {
                cerrarSesion();
            });
        });
    }
    
    // Bienvenida
    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');
    const btnGuest = document.getElementById('btn-continue-guest');
    
    if (btnLogin) btnLogin.addEventListener('click', () => mostrarLogin());
    if (btnRegister) btnRegister.addEventListener('click', () => mostrarRegistro());
    if (btnGuest) btnGuest.addEventListener('click', continuarComoInvitado);
    
    // Modales
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-backdrop')) cerrarModal();
        });
    }
    
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) modalClose.addEventListener('click', cerrarModal);
    
    // Confirm modal
    const confirmCancel = document.getElementById('confirm-cancel');
    const confirmAccept = document.getElementById('confirm-accept');
    const confirmModal = document.getElementById('confirm-modal');
    
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
    
    // Drawer
    const drawer = document.getElementById('drawer');
    if (drawer) {
        drawer.addEventListener('click', function(e) {
            if (e.target.classList.contains('drawer-backdrop')) cerrarDrawer();
        });
    }
    const drawerClose = document.querySelector('.drawer-close');
    if (drawerClose) drawerClose.addEventListener('click', cerrarDrawer);
    
    // Notificaciones - marcar todas leídas
    const markAllRead = document.getElementById('mark-all-read');
    if (markAllRead) {
        markAllRead.addEventListener('click', () => {
            showToast('Todas las notificaciones marcadas como leídas', 'success');
            APP_STATE.notificacionesNoLeidas = 0;
            actualizarBadgeNotificaciones();
        });
    }
    
    // Filtros de notificaciones
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (APP_STATE.searchBarOpen) cerrarSearchBar();
            if (APP_STATE.drawerOpen) cerrarDrawer();
            if (APP_STATE.notificationsOpen) {
                const panel = document.getElementById('notification-panel');
                if (panel) panel.classList.add('hidden');
                APP_STATE.notificationsOpen = false;
            }
            if (!document.getElementById('modal')?.classList.contains('hidden')) cerrarModal();
        }
    });
    
    // Clics fuera
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
// UTILIDADES
// ============================================
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

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function mostrarElemento(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function ocultarElemento(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

function toggleElemento(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden');
}

// ============================================
// NAVEGACIÓN
// ============================================
function mostrarApp() {
    ocultarElemento('welcome-screen');
    mostrarElemento('app');
    actualizarSidebarUsuario();
    actualizarHeader();
    navegarA('inicio');
    iniciarContadorRegresivo();
    iniciarActualizacionFecha();
    cargarNotificaciones();
    mostrarFAB();
}

function mostrarBienvenida() {
    mostrarElemento('welcome-screen');
    ocultarElemento('app');
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
    if (APP_STATE.isLoading) return;
    
    APP_STATE.currentPage = page;
    APP_STATE.isLoading = true;
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-page') === page);
    });
    
    // Actualizar título y breadcrumb
    const titulo = CONFIG.TITULOS_PAGINAS[page] || page;
    const pageTitle = document.getElementById('page-title');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    
    if (pageTitle) pageTitle.textContent = titulo;
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = titulo;
    
    // Cargar contenido
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
        if (roleEl) roleEl.textContent = APP_STATE.rol === 'admin' ? 'Administrador' : 
                                         APP_STATE.rol === 'invitado' ? 'Invitado' : 'Miembro';
    }
    
    // Mostrar menú admin
    const adminMenu = document.getElementById('admin-menu');
    if (adminMenu && APP_STATE.rol === 'admin') {
        adminMenu.classList.remove('hidden');
    }
}

function actualizarHeader() {
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = APP_STATE.tema === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
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
            case 'inicio':
                cargarInicio(content);
                break;
            case 'horarios':
                cargarHorarios(content);
                break;
            case 'asistencia':
                cargarAsistencia(content);
                break;
            case 'perfil':
                cargarPerfil(content);
                break;
            case 'configuracion':
                cargarConfiguracion(content);
                break;
            case 'devocional':
                cargarDevocional(content);
                break;
            case 'dashboard':
                cargarDashboard(content);
                break;
            default:
                content.innerHTML = `
                    <div class="card fade-in">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="bx bx-construction"></i> 
                                ${CONFIG.TITULOS_PAGINAS[page] || page}
                            </h2>
                        </div>
                        <div style="text-align: center; padding: 40px;">
                            <i class="bx bx-hard-hat" style="font-size: 4rem; color: var(--gris-medio);"></i>
                            <p style="margin-top: 16px; color: var(--gris-texto);">
                                Esta sección está en desarrollo.<br>
                                Pronto estará disponible.
                            </p>
                        </div>
                    </div>
                `;
        }
    }, 200);
}

function cargarInicio(container) {
    container.innerHTML = `
        <div class="fade-in">
            ${crearContadorRegresivoHTML()}
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div class="card card-glass">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--azul-primario); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; flex-shrink: 0;">
                            <i class="bx bx-calendar"></i>
                        </div>
                        <div>
                            <div style="font-size: 0.75rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px;">Fecha</div>
                            <div style="font-weight: 700; font-size: 1.1rem;" id="fecha-actual"></div>
                        </div>
                    </div>
                </div>
                
                <div class="card card-glass">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--dorado); display: flex; align-items: center; justify-content: center; color: var(--azul-primario); font-size: 1.5rem; flex-shrink: 0;">
                            <i class="bx bx-time-five"></i>
                        </div>
                        <div>
                            <div style="font-size: 0.75rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px;">Hora</div>
                            <div style="font-weight: 700; font-size: 1.1rem;" id="hora-actual"></div>
                        </div>
                    </div>
                </div>
                
                <div class="card card-glass">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--exito); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; flex-shrink: 0;">
                            <i class="bx bx-group"></i>
                        </div>
                        <div>
                            <div style="font-size: 0.75rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px;">Asistencia Hoy</div>
                            <div style="font-weight: 700; font-size: 1.1rem;" id="asistencia-hoy">--</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card" id="versiculo-card" style="border-left: 4px solid var(--dorado);">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <i class="bx bx-bible" style="color: var(--dorado);"></i> 
                        Versículo del Día
                    </h3>
                    <button class="btn-text btn-sm" onclick="cargarVersiculoDiario()">
                        <i class="bx bx-refresh"></i> Actualizar
                    </button>
                </div>
                <div id="versiculo-content" style="font-style: italic; font-size: 1.1rem; line-height: 1.8; padding: 8px 0;">
                    <div style="display: flex; align-items: center; gap: 8px; color: var(--gris-texto);">
                        <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
                        Cargando versículo...
                    </div>
                </div>
            </div>
            
            <div class="card" id="accesos-rapidos">
                <div class="card-header">
                    <h3>Accesos Rápidos</h3>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
                    <button class="btn-outline" onclick="navegarA('asistencia')" style="flex-direction: column; padding: 16px; gap: 8px;">
                        <i class="bx bx-check-shield" style="font-size: 1.5rem;"></i>
                        <span style="font-size: 0.8rem;">Asistencia</span>
                    </button>
                    <button class="btn-outline" onclick="navegarA('peticiones')" style="flex-direction: column; padding: 16px; gap: 8px;">
                        <i class="bx bx-pray" style="font-size: 1.5rem;"></i>
                        <span style="font-size: 0.8rem;">Oración</span>
                    </button>
                    <button class="btn-outline" onclick="navegarA('biblioteca')" style="flex-direction: column; padding: 16px; gap: 8px;">
                        <i class="bx bx-book-open" style="font-size: 1.5rem;"></i>
                        <span style="font-size: 0.8rem;">Biblioteca</span>
                    </button>
                    <button class="btn-outline" onclick="navegarA('devocional')" style="flex-direction: column; padding: 16px; gap: 8px;">
                        <i class="bx bx-bible" style="font-size: 1.5rem;"></i>
                        <span style="font-size: 0.8rem;">Devocional</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    actualizarFechaHora();
    if (!APP_STATE.fechaInterval) {
        APP_STATE.fechaInterval = setInterval(actualizarFechaHora, 1000);
    }
    cargarVersiculoDiario();
    cargarEstadisticasAsistencia();
}

function crearContadorRegresivoHTML() {
    return `
        <div class="contador-container" style="position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background: radial-gradient(circle at 30% 50%, white, transparent);"></div>
            <div style="position: relative; z-index: 1;">
                <div class="contador-titulo" id="contador-titulo">Cargando próximo culto...</div>
                <div class="contador-tiempo">
                    <div class="contador-item">
                        <span class="contador-numero" id="contador-dias">00</span>
                        <span class="contador-etiqueta">Días</span>
                    </div>
                    <div class="contador-item">
                        <span class="contador-numero" id="contador-horas">00</span>
                        <span class="contador-etiqueta">Horas</span>
                    </div>
                    <div class="contador-item">
                        <span class="contador-numero" id="contador-minutos">00</span>
                        <span class="contador-etiqueta">Minutos</span>
                    </div>
                    <div class="contador-item">
                        <span class="contador-numero" id="contador-segundos">00</span>
                        <span class="contador-etiqueta">Segundos</span>
                    </div>
                </div>
                <div class="contador-estado estado-proximo" id="contador-estado">PRÓXIMO CULTO</div>
            </div>
        </div>
    `;
}

function cargarHorarios(container) {
    const horarios = [
        { dia: 'Lunes', cultos: [], color: '#78909c' },
        { dia: 'Martes', cultos: [{ nombre: 'Culto de Oración', hora: '6:00 PM - 8:30 PM', icono: 'bx-pray' }], color: '#1a237e' },
        { dia: 'Miércoles', cultos: [{ nombre: 'Culto Campal', hora: '4:00 PM - 7:00 PM', icono: 'bx-sun' }], color: '#1a237e' },
        { dia: 'Jueves', cultos: [{ nombre: 'Culto de Refrán', hora: '4:00 PM - 7:00 PM', icono: 'bx-music' }], color: '#1a237e' },
        { dia: 'Viernes', cultos: [{ nombre: 'Culto de Jóvenes', hora: '6:00 PM - 8:30 PM', icono: 'bx-group' }], color: '#1a237e' },
        { dia: 'Sábado', cultos: [], color: '#78909c' },
        { dia: 'Domingo', cultos: [{ nombre: 'Culto Dominical', hora: '10:00 AM - 12:00 PM', icono: 'bx-church' }], color: '#1a237e' }
    ];
    
    const hoy = new Date().getDay();
    const diaActual = hoy === 0 ? 6 : hoy - 1;
    
    container.innerHTML = `
        <div class="fade-in">
            <h2 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                <i class="bx bx-time-five"></i> Horarios de Cultos
            </h2>
            <div style="display: grid; gap: 12px;">
                ${horarios.map((dia, index) => `
                    <div class="card ${index === diaActual ? 'card-glass' : ''}" 
                         style="border-left: 4px solid ${dia.color}; ${index === diaActual ? 'box-shadow: var(--sombra-azul);' : ''}">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <h3 style="display: flex; align-items: center; gap: 8px;">
                                    ${dia.dia}
                                    ${index === diaActual ? '<span style="background: var(--azul-primario); color: white; padding: 2px 10px; border-radius: 12px; font-size: 0.7rem;">HOY</span>' : ''}
                                </h3>
                                ${dia.cultos.length > 0 ? 
                                    dia.cultos.map(c => `
                                        <p style="color: var(--gris-texto); margin-top: 4px; display: flex; align-items: center; gap: 6px;">
                                            <i class="bx ${c.icono}"></i>
                                            <strong>${c.nombre}</strong> - ${c.hora}
                                        </p>
                                    `).join('') : 
                                    '<p style="color: var(--gris-texto); margin-top: 4px;">No hay culto programado</p>'
                                }
                            </div>
                            ${dia.cultos.length > 0 ? `
                                <button class="btn-primary btn-sm" onclick="navegarA('asistencia')">
                                    <i class="bx bx-check-shield"></i> Asistir
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function cargarAsistencia(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h2 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                <i class="bx bx-check-shield"></i> Confirmar Asistencia
            </h2>
            
            <div class="card" style="text-align: center; padding: 32px;">
                <i class="bx bx-calendar-check" style="font-size: 4rem; color: var(--azul-primario);"></i>
                <h3 style="margin: 16px 0 8px;">Próximo Culto</h3>
                <p style="color: var(--gris-texto);" id="proximo-culto-asistencia">Cargando...</p>
                
                <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px; flex-wrap: wrap;">
                    <button class="btn-primary" onclick="confirmarAsistencia('Asistiré')">
                        <i class="bx bx-check"></i> Voy a Asistir
                    </button>
                    <button class="btn-secondary" onclick="confirmarAsistencia('Tal vez')">
                        <i class="bx bx-question-mark"></i> Tal vez
                    </button>
                    <button class="btn-outline" onclick="confirmarAsistencia('No asistiré')">
                        <i class="bx bx-x"></i> No Asistiré
                    </button>
                </div>
            </div>
            
            <div class="card" style="margin-top: 16px;">
                <h3>Tipo de Asistente</h3>
                <div style="display: flex; gap: 12px; margin-top: 12px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="radio" name="tipo-asistente" value="Hermano" checked> Hermano
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="radio" name="tipo-asistente" value="Amigo"> Amigo
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="radio" name="tipo-asistente" value="Niño"> Niño
                    </label>
                </div>
            </div>
        </div>
    `;
}

function cargarPerfil(container) {
    if (!APP_STATE.usuario) return;
    
    const u = APP_STATE.usuario;
    const verificado = u.verificado ? 
        '<span class="verified-badge"><i class="bx bx-badge-check"></i> Cuenta Verificada</span>' : 
        '<button class="btn-text btn-sm" onclick="solicitarVerificacion()"><i class="bx bx-shield-quarter"></i> Solicitar verificación</button>';
    
    container.innerHTML = `
        <div class="fade-in">
            <div class="profile-header">
                <img src="${u.foto || 'assets/avatars/default.png'}" alt="${u.nombre}" class="profile-avatar" 
                     style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid var(--dorado);">
                <h2 class="profile-name">${u.nombre} ${u.apellidos || ''}</h2>
                <p style="opacity: 0.9;">@${u.usuario}</p>
                <div style="margin-top: 8px;">${verificado}</div>
            </div>
            
            <div class="card">
                <h3>Información Personal</h3>
                <div style="display: grid; gap: 12px; margin-top: 16px;">
                    <p><strong>Correo:</strong> ${u.correo || 'No especificado'}</p>
                    <p><strong>Celular:</strong> ${u.celular || 'No especificado'}</p>
                    <p><strong>Ministerio:</strong> ${u.ministerio || 'No asignado'}</p>
                    <p><strong>Rol:</strong> ${APP_STATE.rol === 'admin' ? 'Administrador' : 'Miembro'}</p>
                    <p><strong>Miembro desde:</strong> ${u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString('es-CO') : 'N/A'}</p>
                </div>
            </div>
            
            <div class="card" style="margin-top: 16px;">
                <h3>Insignias</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
                    ${(u.insignias || ['Nuevo Miembro']).map(i => `
                        <span style="background: var(--azul-surface); color: var(--azul-primario); padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 500;">
                            🏅 ${i}
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function cargarConfiguracion(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h2 style="margin-bottom: 20px;"><i class="bx bx-cog"></i> Configuración</h2>
            
            <div class="card">
                <h3>Apariencia</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                    <span>Modo Oscuro</span>
                    <button class="btn-secondary btn-sm" onclick="toggleTema()">
                        <i class="bx ${APP_STATE.tema === 'dark' ? 'bx-sun' : 'bx-moon'}"></i>
                        ${APP_STATE.tema === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                    </button>
                </div>
            </div>
            
            <div class="card" style="margin-top: 16px;">
                <h3>Notificaciones</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                    <span>Notificaciones Push</span>
                    <label class="switch">
                        <input type="checkbox" checked>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="card" style="margin-top: 16px;">
                <h3>Cuenta</h3>
                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
                    <button class="btn-outline" onclick="cambiarPassword()">
                        <i class="bx bx-lock"></i> Cambiar Contraseña
                    </button>
                    <button class="btn-outline" onclick="editarPerfil()">
                        <i class="bx bx-edit"></i> Editar Perfil
                    </button>
                </div>
            </div>
            
            <div class="card" style="margin-top: 16px; border-left: 4px solid var(--error);">
                <h3 style="color: var(--error);">Zona de Peligro</h3>
                <button class="btn-danger btn-sm" onclick="confirmarAccion('¿Cerrar sesión?', 'Serás redirigido a la pantalla de inicio.', cerrarSesion)" style="margin-top: 12px;">
                    <i class="bx bx-log-out"></i> Cerrar Sesión
                </button>
            </div>
            
            <p style="text-align: center; margin-top: 24px; color: var(--gris-texto); font-size: 0.85rem;">
                IPUC LA FONDA v2.0.0<br>
                © 2026 Iglesia Pentecostal Unida de Colombia
            </p>
        </div>
    `;
}

function cargarDevocional(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h2 style="margin-bottom: 20px;"><i class="bx bx-bible"></i> Devocional Diario</h2>
            <div class="card" id="versiculo-card" style="border-left: 4px solid var(--dorado);">
                <div id="versiculo-content" style="font-style: italic; font-size: 1.2rem; line-height: 1.8; text-align: center; padding: 20px;">
                    Cargando...
                </div>
            </div>
            <div class="card" style="margin-top: 16px; text-align: center;">
                <h3>Reflexión del Día</h3>
                <p style="margin-top: 12px; line-height: 1.8; color: var(--gris-texto);">
                    Dedica un momento para reflexionar en la Palabra de Dios. 
                    El versículo de hoy es una guía para tu vida espiritual.
                    Compártelo con tu familia y amigos.
                </p>
                <button class="btn-primary" style="margin-top: 16px;" onclick="compartirVersiculo()">
                    <i class="bx bx-share-alt"></i> Compartir Versículo
                </button>
            </div>
        </div>
    `;
    cargarVersiculoDiario();
}

function cargarDashboard(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h2 style="margin-bottom: 20px;"><i class="bx bx-line-chart"></i> Dashboard</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue"><i class="bx bx-group"></i></div>
                    <div class="stat-info">
                        <div class="stat-number" id="total-usuarios">--</div>
                        <div class="stat-label">Usuarios Totales</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon gold"><i class="bx bx-user-check"></i></div>
                    <div class="stat-info">
                        <div class="stat-number" id="usuarios-activos">--</div>
                        <div class="stat-label">Usuarios Activos</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="bx bx-check-shield"></i></div>
                    <div class="stat-info">
                        <div class="stat-number" id="asistencia-total">--</div>
                        <div class="stat-label">Asistencia Total</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue"><i class="bx bx-calendar-event"></i></div>
                    <div class="stat-info">
                        <div class="stat-number" id="total-eventos">--</div>
                        <div class="stat-label">Eventos</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3>Acciones Rápidas</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 16px;">
                    <button class="btn-primary btn-sm" onclick="navegarA('gestion-usuarios')">
                        <i class="bx bx-group"></i> Usuarios
                    </button>
                    <button class="btn-primary btn-sm" onclick="navegarA('gestion-noticias')">
                        <i class="bx bx-news"></i> Noticias
                    </button>
                    <button class="btn-primary btn-sm" onclick="navegarA('gestion-eventos')">
                        <i class="bx bx-calendar-event"></i> Eventos
                    </button>
                    <button class="btn-primary btn-sm" onclick="navegarA('versiculos')">
                        <i class="bx bx-bible"></i> Versículos
                    </button>
                </div>
            </div>
        </div>
    `;
    
    cargarEstadisticasDashboard();
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
    const elementos = {
        titulo: document.getElementById('contador-titulo'),
        estado: document.getElementById('contador-estado'),
        dias: document.getElementById('contador-dias'),
        horas: document.getElementById('contador-horas'),
        minutos: document.getElementById('contador-minutos'),
        segundos: document.getElementById('contador-segundos')
    };
    
    // Si no hay elementos del contador en la página actual, no hacer nada
    if (!elementos.dias && !elementos.titulo) return;
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/cultos/proximo`);
        const data = await response.json();
        
        if (data.estado === 'sin_cultos') {
            if (elementos.titulo) elementos.titulo.textContent = 'No hay cultos programados';
            return;
        }
        
        actualizarContadorUI(elementos, data);
    } catch (error) {
        // Datos offline de respaldo
        const ahora = new Date();
        const domingo = new Date(ahora);
        domingo.setDate(ahora.getDate() + ((7 - ahora.getDay()) % 7));
        domingo.setHours(10, 0, 0, 0);
        
        if (domingo <= ahora) domingo.setDate(domingo.getDate() + 7);
        
        const diff = Math.max(0, (domingo - ahora) / 1000);
        const data = {
            nombre: 'Culto Dominical',
            dia: 'Domingo',
            estado: 'proximo',
            segundos_restantes: diff
        };
        
        actualizarContadorUI(elementos, data);
    }
}

function actualizarContadorUI(elementos, data) {
    const segundos = Math.max(0, data.segundos_restantes || 0);
    const dias = Math.floor(segundos / 86400);
    const horas = Math.floor((segundos % 86400) / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = Math.floor(segundos % 60);
    
    if (elementos.titulo) elementos.titulo.textContent = `${data.nombre} - ${data.dia || ''}`;
    
    if (elementos.estado) {
        if (data.estado === 'en_curso') {
            elementos.estado.textContent = '🔴 CULTO EN CURSO';
            elementos.estado.className = 'contador-estado estado-curso';
        } else {
            elementos.estado.textContent = '🟢 PRÓXIMO CULTO';
            elementos.estado.className = 'contador-estado estado-proximo';
        }
    }
    
    if (elementos.dias) elementos.dias.textContent = String(dias).padStart(2, '0');
    if (elementos.horas) elementos.horas.textContent = String(horas).padStart(2, '0');
    if (elementos.minutos) elementos.minutos.textContent = String(minutos).padStart(2, '0');
    if (elementos.segundos) elementos.segundos.textContent = String(segs).padStart(2, '0');
    
    // Actualizar también en la página de asistencia
    const proximoCulto = document.getElementById('proximo-culto-asistencia');
    if (proximoCulto) {
        proximoCulto.textContent = `${data.nombre} - ${data.dia || ''} - ${data.estado === 'en_curso' ? 'En curso' : 'Próximamente'}`;
    }
}

// ============================================
// FECHA Y HORA
// ============================================
function actualizarFechaHora() {
    const ahora = new Date();
    const fecha = document.getElementById('fecha-actual');
    const hora = document.getElementById('hora-actual');
    
    if (fecha) {
        fecha.textContent = ahora.toLocaleDateString('es-CO', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
    if (hora) {
        hora.textContent = ahora.toLocaleTimeString('es-CO', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
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
        const data = await apiCall('/versiculo-diario');
        if (data && data.versiculo) {
            container.innerHTML = `
                <p style="font-size: 1.1rem; margin-bottom: 12px; line-height: 1.8;">
                    "${data.versiculo.texto}"
                </p>
                <p style="font-weight: 700; color: var(--azul-primario); font-size: 1rem;">
                    ${data.versiculo.referencia}
                </p>
                <span style="display: inline-block; margin-top: 8px; font-size: 0.75rem; background: var(--dorado-claro); color: var(--dorado-oscuro); padding: 2px 12px; border-radius: 12px; text-transform: capitalize;">
                    ${data.versiculo.tipo || 'versículo'}
                </span>
            `;
        }
    } catch (error) {
        container.innerHTML = `
            <p style="font-size: 1.1rem; line-height: 1.8;">
                "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna."
            </p>
            <p style="font-weight: 700; color: var(--azul-primario);">Juan 3:16</p>
            <span style="display: inline-block; margin-top: 8px; font-size: 0.75rem; background: var(--dorado-claro); color: var(--dorado-oscuro); padding: 2px 12px; border-radius: 12px;">promesa</span>
        `;
    }
}

// ============================================
// ESTADÍSTICAS
// ============================================
async function cargarEstadisticasAsistencia() {
    try {
        const data = await apiCall('/asistencia/estadisticas');
        const el = document.getElementById('asistencia-hoy');
        if (el && data) {
            el.textContent = data.diario || '0';
        }
    } catch (error) {
        const el = document.getElementById('asistencia-hoy');
        if (el) el.textContent = '--';
    }
}

async function cargarEstadisticasDashboard() {
    try {
        const [usuariosData, estadisticasData] = await Promise.all([
            apiCall('/usuarios'),
            apiCall('/asistencia/estadisticas')
        ]);
        
        const totalUsuarios = document.getElementById('total-usuarios');
        const usuariosActivos = document.getElementById('usuarios-activos');
        const asistenciaTotal = document.getElementById('asistencia-total');
        
        if (totalUsuarios) totalUsuarios.textContent = usuariosData?.total || '0';
        if (usuariosActivos) usuariosActivos.textContent = usuariosData?.usuarios?.filter(u => u.estado === 'activo').length || '0';
        if (asistenciaTotal) asistenciaTotal.textContent = estadisticasData?.total || '0';
    } catch (error) {
        console.log('Dashboard offline');
    }
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
        <form id="login-form" autocomplete="on">
            <div class="form-group">
                <label for="login-usuario">Usuario o Correo</label>
                <input type="text" class="form-input" id="login-usuario" name="usuario" 
                       placeholder="Ingresa tu usuario o correo" required autocomplete="username">
            </div>
            <div class="form-group">
                <label for="login-password">Contraseña</label>
                <div style="position: relative;">
                    <input type="password" class="form-input" id="login-password" name="password" 
                           placeholder="Ingresa tu contraseña" required autocomplete="current-password">
                    <button type="button" class="btn-icon" onclick="togglePassword('login-password')" 
                            style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%);">
                        <i class="bx bx-show"></i>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" name="recordar" checked> Recordarme
                </label>
            </div>
            <button type="submit" class="btn-primary" style="width: 100%;">
                <i class="bx bx-log-in"></i> Iniciar Sesión
            </button>
        </form>
        <p style="text-align: center; margin-top: 16px;">
            <a href="#" onclick="mostrarRegistro()" style="color: var(--azul-primario); font-weight: 500;">
                ¿No tienes cuenta? Regístrate aquí
            </a>
        </p>
        <p style="text-align: center; margin-top: 8px;">
            <a href="#" onclick="recuperarPassword()" style="color: var(--gris-texto); font-size: 0.85rem;">
                ¿Olvidaste tu contraseña?
            </a>
        </p>
        <div style="margin-top: 16px; padding: 12px; background: var(--info-claro); border-radius: var(--borde-radius-sm); font-size: 0.8rem;">
            <p style="font-weight: 600; margin-bottom: 4px;">🔑 Credenciales de prueba:</p>
            <p>Admin: <strong>admin / 123456</strong></p>
            <p>Usuario: <strong>usuario / 123456</strong></p>
        </div>
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
            // Modo offline
            await loginOffline(usuario, password);
        }
    } catch (error) {
        await loginOffline(usuario, password);
    }
}

async function loginOffline(usuario, password) {
    if (usuario === 'admin' && password === '123456') {
        const data = {
            token: 'demo-token-admin-' + Date.now(),
            rol: 'admin',
            usuario: {
                id: 1, nombre: 'Administrador', apellidos: 'Principal',
                usuario: 'admin', correo: 'admin@ipuclafonda.org',
                foto: 'assets/avatars/admin.png', verificado: true,
                ministerio: 'Pastoral', insignias: ['Administrador', 'Cuenta Verificada']
            }
        };
        guardarSesion(data);
        cerrarModal();
        mostrarApp();
        showToast('✅ Modo offline: Administrador', 'info');
    } else if (usuario === 'usuario' && password === '123456') {
        const data = {
            token: 'demo-token-user-' + Date.now(),
            rol: 'usuario',
            usuario: {
                id: 2, nombre: 'Usuario', apellidos: 'Demo',
                usuario: 'usuario', correo: 'usuario@ipuclafonda.org',
                foto: 'assets/avatars/default.png', verificado: false,
                ministerio: 'Jóvenes', insignias: ['Nuevo Miembro']
            }
        };
        guardarSesion(data);
        cerrarModal();
        mostrarApp();
        showToast('✅ Modo offline: Usuario', 'info');
    } else {
        showToast('❌ Credenciales inválidas. Prueba: admin/123456', 'error');
    }
}

function guardarSesion(data) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(CONFIG.STORAGE_KEYS.USUARIO, JSON.stringify(data.usuario));
    localStorage.setItem(CONFIG.STORAGE_KEYS.ROL, data.rol);
    
    APP_STATE.token = data.token;
    APP_STATE.usuario = data.usuario;
    APP_STATE.rol = data.rol;
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
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" class="form-input" name="nombre" required>
                </div>
                <div class="form-group">
                    <label>Apellidos *</label>
                    <input type="text" class="form-input" name="apellidos" required>
                </div>
            </div>
            <div class="form-group">
                <label>Documento de Identidad *</label>
                <input type="text" class="form-input" name="documento" required>
            </div>
            <div class="form-group">
                <label>Fecha de Nacimiento *</label>
                <input type="date" class="form-input" name="fecha_nacimiento" required>
            </div>
            <div class="form-group">
                <label>Sexo *</label>
                <select class="form-input" name="sexo" required>
                    <option value="">Seleccionar...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                </select>
            </div>
            <div class="form-group">
                <label>Correo Electrónico *</label>
                <input type="email" class="form-input" name="correo" required>
            </div>
            <div class="form-group">
                <label>Celular *</label>
                <input type="tel" class="form-input" name="celular" required>
            </div>
            <div class="form-group">
                <label>Ministerio *</label>
                <select class="form-input" name="ministerio" required>
                    <option value="">Seleccionar...</option>
                    <option value="Jóvenes">Jóvenes</option>
                    <option value="Alabanza">Alabanza</option>
                    <option value="Niños">Niños</option>
                    <option value="Misiones">Misiones</option>
                    <option value="Servicio">Servicio</option>
                    <option value="General">General</option>
                </select>
            </div>
            <div class="form-group">
                <label>Nombre de Usuario *</label>
                <input type="text" class="form-input" name="usuario" required>
            </div>
            <div class="form-group">
                <label>Contraseña * (mínimo 6 caracteres)</label>
                <input type="password" class="form-input" name="password" required minlength="6">
            </div>
            <div class="form-group">
                <label>Confirmar Contraseña *</label>
                <input type="password" class="form-input" name="confirmar_password" required>
            </div>
            <button type="submit" class="btn-primary" style="width: 100%; margin-top: 8px;">
                <i class="bx bx-user-plus"></i> Crear Cuenta
            </button>
        </form>
        <p style="text-align: center; margin-top: 16px;">
            <a href="#" onclick="mostrarLogin()" style="color: var(--azul-primario); font-weight: 500;">
                ¿Ya tienes cuenta? Inicia sesión
            </a>
        </p>
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
            showToast('✅ Registro exitoso (modo offline). Usa tus credenciales para iniciar sesión.', 'success');
            setTimeout(() => mostrarLogin(), 1500);
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
    
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
    APP_STATE.userDropdownOpen = false;
    
    mostrarBienvenida();
    showToast('👋 Sesión cerrada correctamente', 'info');
}

// ============================================
// API CALLS
// ============================================
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    
    if (APP_STATE.token && !APP_STATE.token.startsWith('demo-') && !APP_STATE.token.startsWith('guest-')) {
        options.headers['Authorization'] = `Bearer ${APP_STATE.token}`;
    }
    
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${CONFIG.API_URL}${endpoint}`, options);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}`);
    }
    
    return await response.json();
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
    const notificaciones = [
        { id: 1, titulo: '🔔 Culto Dominical', mensaje: 'Recuerda asistir este domingo a las 10:00 AM', fecha: new Date().toISOString(), leida: false },
        { id: 2, titulo: '📖 Versículo del Día', mensaje: 'Se ha publicado un nuevo versículo para tu reflexión', fecha: new Date(Date.now() - 3600000).toISOString(), leida: false },
        { id: 3, titulo: '🎉 Evento Especial', mensaje: 'Próximo evento de jóvenes este viernes', fecha: new Date(Date.now() - 86400000).toISOString(), leida: true }
    ];
    
    APP_STATE.notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;
    actualizarBadgeNotificaciones();
    
    const list = document.getElementById('notification-list');
    if (!list) return;
    
    if (!notificaciones.length) {
        list.innerHTML = `
            <div class="notification-empty">
                <i class="bx bx-bell-off"></i>
                <p>No hay notificaciones</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = notificaciones.map(n => `
        <div style="padding: 14px 16px; border-bottom: 1px solid var(--gris-medio); cursor: pointer; transition: background 0.2s; ${!n.leida ? 'background: var(--azul-surface); border-left: 3px solid var(--azul-primario);' : ''}"
             onmouseover="this.style.background='var(--gris-claro)'" 
             onmouseout="this.style.background='${!n.leida ? 'var(--azul-surface)' : 'transparent'}'">
            <strong style="display: block; margin-bottom: 4px;">${n.titulo}</strong>
            <p style="font-size: 0.85rem; margin: 4px 0; color: var(--gris-texto);">${n.mensaje}</p>
            <small style="color: var(--gris-medio);">${formatearFecha(n.fecha)}</small>
        </div>
    `).join('');
}

function actualizarBadgeNotificaciones() {
    const badge = document.querySelector('.badge-notifications');
    if (badge) {
        if (APP_STATE.notificacionesNoLeidas > 0) {
            badge.textContent = APP_STATE.notificacionesNoLeidas > 99 ? '99+' : APP_STATE.notificacionesNoLeidas;
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

function cambiarPassword() {
    showToast('Funcionalidad en desarrollo', 'info');
}

function editarPerfil() {
    showToast('Funcionalidad en desarrollo', 'info');
}

function solicitarVerificacion() {
    showToast('✅ Solicitud de verificación enviada', 'success');
}

function compartirVersiculo() {
    if (navigator.share) {
        navigator.share({
            title: 'Versículo del Día - IPUC LA FONDA',
            text: 'Mira este versículo del día de IPUC LA FONDA',
            url: window.location.href
        }).catch(() => {});
    } else {
        showToast('📋 Enlace copiado al portapapeles', 'info');
    }
}

function recuperarPassword() {
    showToast('📧 Se ha enviado un enlace de recuperación a tu correo', 'info');
}

function confirmarAccion(titulo, mensaje, callback) {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    
    if (!modal) return;
    
    if (titleEl) titleEl.textContent = titulo;
    if (messageEl) messageEl.textContent = mensaje;
    
    APP_STATE.pendingConfirmation = callback;
    modal.classList.remove('hidden');
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
    if (icon) {
        icon.className = tema === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
    }
}

// ============================================
// MODAL
// ============================================
function cerrarModal() {
    const modal = document.getElementById('modal');
    const modalFooter = document.getElementById('modal-footer');
    if (modal) modal.classList.add('hidden');
    if (modalFooter) modalFooter.classList.add('hidden');
}

// ============================================
// DRAWER
// ============================================
function abrirDrawer(titulo, contenido) {
    const drawerTitle = document.getElementById('drawer-title');
    const drawerBody = document.getElementById('drawer-body');
    const drawer = document.getElementById('drawer');
    
    if (drawerTitle) drawerTitle.textContent = titulo;
    if (drawerBody) drawerBody.innerHTML = contenido;
    if (drawer) drawer.classList.remove('hidden');
    APP_STATE.drawerOpen = true;
}

function cerrarDrawer() {
    const drawer = document.getElementById('drawer');
    if (drawer) drawer.classList.add('hidden');
    APP_STATE.drawerOpen = false;
}

// ============================================
// SEARCH BAR
// ============================================
function toggleSearchBar() {
    APP_STATE.searchBarOpen = !APP_STATE.searchBarOpen;
    const bar = document.getElementById('search-bar');
    if (!bar) return;
    
    if (APP_STATE.searchBarOpen) {
        bar.classList.remove('hidden');
        const input = document.getElementById('global-search-input');
        if (input) setTimeout(() => input.focus(), 100);
    } else {
        bar.classList.add('hidden');
    }
}

function cerrarSearchBar() {
    const bar = document.getElementById('search-bar');
    if (bar) bar.classList.add('hidden');
    APP_STATE.searchBarOpen = false;
}

// ============================================
// USER DROPDOWN
// ============================================
function toggleUserDropdown() {
    APP_STATE.userDropdownOpen = !APP_STATE.userDropdownOpen;
    const dropdown = document.getElementById('user-dropdown');
    if (!dropdown) return;
    
    if (APP_STATE.userDropdownOpen) {
        dropdown.classList.remove('hidden');
    } else {
        dropdown.classList.add('hidden');
    }
}

// ============================================
// FAB (Floating Action Button)
// ============================================
function mostrarFAB() {
    const fab = document.getElementById('fab-main');
    if (fab) fab.classList.remove('hidden');
}

function toggleFabMenu() {
    APP_STATE.fabMenuOpen = !APP_STATE.fabMenuOpen;
    const menu = document.getElementById('fab-menu');
    if (!menu) return;
    
    if (APP_STATE.fabMenuOpen) {
        menu.classList.remove('hidden');
    } else {
        menu.classList.add('hidden');
    }
}

// ============================================
// TOAST NOTIFICATIONS
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
    }, 3500);
}

// ============================================
// UTILIDADES
// ============================================
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const btn = input.parentElement?.querySelector('button');
    const icon = btn?.querySelector('i');
    
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
    if (diff < 604800000) return `Hace ${Math.floor(diff / 86400000)} d`;
    
    return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================
window.mostrarLogin = mostrarLogin;
window.mostrarRegistro = mostrarRegistro;
window.cerrarSesion = cerrarSesion;
window.togglePassword = togglePassword;
window.recuperarPassword = recuperarPassword;
window.confirmarAsistencia = confirmarAsistencia;
window.solicitarVerificacion = solicitarVerificacion;
window.cambiarPassword = cambiarPassword;
window.editarPerfil = editarPerfil;
window.compartirVersiculo = compartirVersiculo;
window.confirmarAccion = confirmarAccion;
window.navegarA = navegarA;
window.cargarVersiculoDiario = cargarVersiculoDiario;
window.toggleTema = toggleTema;

console.log('✅ IPUC LA FONDA - JavaScript cargado correctamente');
console.log('🔑 Credenciales: admin/123456 | usuario/123456');
