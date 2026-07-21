// ============================================
// IPUC LA FONDA - SCRIPT.JS v18.0 CORREGIDO
// Funciones críticas corregidas
// ============================================

// CORREGIDO: Inicialización segura de APP_STATE
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

// CORREGIDO: cargarArray con validación completa
function cargarArray(key) {
    try {
        if (!key || typeof key !== 'string') return [];
        const data = localStorage.getItem(key);
        if (!data || data === 'null' || data === 'undefined' || data === '') return [];
        const parsed = JSON.parse(data);
        // Si es un objeto con array interno, extraer el array
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            for (const val of Object.values(parsed)) {
                if (Array.isArray(val)) return val;
            }
            return [];
        }
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.warn('Error cargando array:', key, e.message);
        return [];
    }
}

// CORREGIDO: cargarObjeto con validación completa
function cargarObjeto(key) {
    try {
        if (!key || typeof key !== 'string') return {};
        const data = localStorage.getItem(key);
        if (!data || data === 'null' || data === 'undefined' || data === '') return {};
        const parsed = JSON.parse(data);
        return (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) ? parsed : {};
    } catch (e) {
        console.warn('Error cargando objeto:', key, e.message);
        return {};
    }
}

// CORREGIDO: Obtener DB de forma segura
function getDB() {
    try {
        if (typeof window !== 'undefined' && window.db && typeof window.db.cargar === 'function') {
            return window.db;
        }
        if (typeof db !== 'undefined' && db && typeof db.cargar === 'function') {
            return db;
        }
        return null;
    } catch (e) {
        return null;
    }
}

// CORREGIDO: showToast con verificación de elementos
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

// CORREGIDO: toggleTema seguro
function toggleTema() {
    APP_STATE.tema = APP_STATE.tema === 'light' ? 'dark' : 'light';
    aplicarTema(APP_STATE.tema);
    try {
        localStorage.setItem('ipuc18_tema', APP_STATE.tema);
    } catch (e) {}
}

// CORREGIDO: aplicarTema seguro
function aplicarTema(t) {
    try {
        document.documentElement.setAttribute('data-theme', t);
        const icon = document.querySelector('#theme-toggle i');
        if (icon) icon.className = t === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = t === 'dark' ? '#1a1a2e' : '#1a237e';
    } catch (e) {}
}

// CORREGIDO: navegarA con validación
function navegarA(page) {
    if (!page || APP_STATE.isLoading) return;
    APP_STATE.currentPage = page;
    APP_STATE.isLoading = true;
    
    document.querySelectorAll('.nav-item[data-page]').forEach(function(el) {
        el.classList.toggle('active', el.getAttribute('data-page') === page);
    });
    
    const titulo = (CONFIG && CONFIG.TITULOS_PAGINAS && CONFIG.TITULOS_PAGINAS[page]) || page;
    const titleEl = document.getElementById('page-title');
    const breadcrumb = document.getElementById('breadcrumb-current');
    if (titleEl) titleEl.textContent = titulo;
    if (breadcrumb) breadcrumb.textContent = titulo;
    
    cargarPagina(page);
    if (window.innerWidth < 1024) cerrarSidebar();
    APP_STATE.isLoading = false;
}

// CORREGIDO: toggleSidebar seguro
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

// CORREGIDO: mostrarApp seguro
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

// CORREGIDO: mostrarBienvenida seguro
function mostrarBienvenida() {
    const app = document.getElementById('app');
    const welcome = document.getElementById('welcome-screen');
    const fab = document.getElementById('fab-main');
    if (app) app.classList.add('hidden');
    if (welcome) welcome.classList.remove('hidden');
    if (fab) fab.classList.add('hidden');
}

// CORREGIDO: continuarComoInvitado
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

// CORREGIDO: cerrarSesion
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

// CORREGIDO: confirmarAccion
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

// CORREGIDO: cerrarModal
function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.add('hidden');
    const footer = document.getElementById('modal-footer');
    if (footer) footer.classList.add('hidden');
}

// CORREGIDO: toggleSearchBar
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

// CORREGIDO: toggleFabMenu
function toggleFabMenu() {
    APP_STATE.fabMenuOpen = !APP_STATE.fabMenuOpen;
    const menu = document.getElementById('fab-menu');
    if (menu) menu.classList.toggle('hidden', !APP_STATE.fabMenuOpen);
}

// CORREGIDO: toggleUserDropdown
function toggleUserDropdown() {
    APP_STATE.userDropdownOpen = !APP_STATE.userDropdownOpen;
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.toggle('hidden', !APP_STATE.userDropdownOpen);
}

// CORREGIDO: toggleNotificaciones
function toggleNotificaciones() {
    APP_STATE.notificationsOpen = !APP_STATE.notificationsOpen;
    const panel = document.getElementById('notification-panel');
    if (panel) panel.classList.toggle('hidden', !APP_STATE.notificationsOpen);
}

// CORREGIDO: togglePanelReportes
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

// CORREGIDO: cambiarIdioma
function cambiarIdioma(lang) {
    const idiomas = { es: 'ES', en: 'EN', pt: 'PT', fr: 'FR', de: 'DE', it: 'IT' };
    if (!idiomas[lang]) return;
    APP_STATE.idioma = lang;
    try {
        localStorage.setItem('ipuc18_idioma', lang);
    } catch (e) {}
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
}

// CORREGIDO: formatearFecha
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

// CORREGIDO: compartirVersiculo
function compartirVersiculo() {
    const versiculos = [
        { texto: "Porque de tal manera amó Dios al mundo...", referencia: "Juan 3:16" },
        { texto: "Jehová es mi pastor; nada me faltará.", referencia: "Salmos 23:1" },
        { texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13" }
    ];
    const v = versiculos[new Date().getDay() % versiculos.length];
    const texto = '"' + v.texto + '" - ' + v.referencia;
    
    if (navigator.share) {
        navigator.share({ title: 'IPUC LA FONDA - Versículo', text: texto }).catch(function() {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(function() {
            showToast('📋 Versículo copiado', 'success');
        }).catch(function() {
            showToast('No se pudo copiar', 'error');
        });
    }
}

// CORREGIDO: actualizarSidebarUsuario
function actualizarSidebarUsuario() {
    if (!APP_STATE.usuario) return;
    const mini = document.getElementById('user-mini');
    if (!mini) return;
    
    const img = mini.querySelector('img');
    const name = mini.querySelector('.user-name');
    const role = mini.querySelector('.user-role');
    const status = mini.querySelector('.user-status');
    
    if (img) img.src = (APP_STATE.usuario && APP_STATE.usuario.foto) || 'assets/avatars/default.png';
    if (name) name.textContent = (APP_STATE.usuario && APP_STATE.usuario.nombre) || 'Usuario';
    if (role) {
        const roles = { admin: 'Administrador', invitado: 'Invitado', usuario: 'Miembro' };
        role.textContent = roles[APP_STATE.rol] || 'Miembro';
    }
    if (status) status.className = 'user-status ' + (APP_STATE.isOnline ? 'online' : 'offline');
    
    const adminMenu = document.getElementById('admin-menu');
    if (adminMenu) adminMenu.classList.toggle('hidden', APP_STATE.rol !== 'admin');
}

// CORREGIDO: manejarResponsiveSidebar
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

// CORREGIDO: generarId
function generarId() {
    return 'rpt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

// CORREGIDO: escapeHtml
function escapeHtml(texto) {
    if (!texto || typeof texto !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// ============================================
// INICIALIZACIÓN CORREGIDA
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 IPUC LA FONDA v18.0 - Inicializando...');
    
    // Cargar tema
    try {
        const temaGuardado = localStorage.getItem('ipuc18_tema') || 'light';
        APP_STATE.tema = temaGuardado;
        aplicarTema(temaGuardado);
    } catch (e) {}

    // Cargar idioma
    try {
        const idiomaGuardado = localStorage.getItem('ipuc18_idioma') || 'es';
        APP_STATE.idioma = idiomaGuardado;
    } catch (e) {}

    // Cargar datos con validación
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
    
    // Cargar reportes
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

    // Verificar sesión
    const token = localStorage.getItem('ipuc18_token');
    const usuarioData = localStorage.getItem('ipuc18_usuario');
    const rol = localStorage.getItem('ipuc18_rol');

    // Mostrar splash y luego la app
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
                console.warn('Error al restaurar sesión:', e);
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
// INICIALIZAR EVENT LISTENERS - CORREGIDO
// ============================================
function inicializarEventListeners() {
    // Sidebar
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', cerrarSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', cerrarSidebar);

    // Navegación
    document.querySelectorAll('.nav-item[data-page]').forEach(function(item) {
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

    // Panel de reportes
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

    // Búsqueda
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

    // FAB
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
                case 'compartir': compartirVersiculo(); break;
            }
            toggleFabMenu();
        });
    });

    // User dropdown
    const userMini = document.getElementById('user-mini');
    if (userMini) userMini.addEventListener('click', toggleUserDropdown);
    
    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            confirmarAccion('¿Cerrar sesión?', 'Serás redirigido al inicio.', cerrarSesion, 'danger');
        });
    }

    // Welcome screen
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

    // Idioma
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            if (lang) cambiarIdioma(lang);
        });
    });

    // Reportes - Búsqueda de usuario
    const reportUser = document.getElementById('report-user');
    if (reportUser) {
        reportUser.addEventListener('input', function() {
            buscarUsuarioReporte(this.value);
        });
    }

    // Cambio de tipo de reporte
    document.querySelectorAll('input[name="report-type"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            cambiarTipoReporte(this.value);
        });
    });

    // Formulario de reporte
    const reportForm = document.getElementById('report-form');
    if (reportForm) {
        reportForm.addEventListener('submit', generarReporte);
    }
    
    const cancelReport = document.getElementById('btn-cancel-report');
    if (cancelReport) {
        cancelReport.addEventListener('click', cerrarModalReporte);
    }

    // Acciones rápidas de reportes
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

    // Modal backdrop
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

    // Cerrar modales con backdrop
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
            if (e.target.classList.contains('modal-backdrop')) {
                viewReportModal.classList.add('hidden');
            }
        });
    }

    // Teclado
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
            if (modal && !modal.classList.contains('hidden')) {
                cerrarModal();
            }
            const rModal = document.getElementById('report-modal');
            if (rModal && !rModal.classList.contains('hidden')) {
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
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown) dropdown.classList.add('hidden');
            APP_STATE.userDropdownOpen = false;
        }
        if (APP_STATE.fabMenuOpen &&
            !e.target.closest('#fab-main') &&
            !e.target.closest('#fab-menu')) {
            const menu = document.getElementById('fab-menu');
            if (menu) menu.classList.add('hidden');
            APP_STATE.fabMenuOpen = false;
        }
    });

    // Filtros de notificaciones
    document.querySelectorAll('.notification-filters .filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.notification-filters .filter-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
        });
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
window.compartirVersiculo = compartirVersiculo;
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

// Reportes
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

console.log('✅ SCRIPT.JS v18.0 CORREGIDO - Cargado correctamente');
