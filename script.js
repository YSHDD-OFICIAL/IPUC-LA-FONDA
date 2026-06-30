// ============================================
// IPUC LA FONDA - JAVASCRIPT PROFESIONAL v2.0
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
    const usuario = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USUARIO) || 'null');
    const rol = localStorage.getItem(CONFIG.STORAGE_KEYS.ROL);
    
    // Ocultar splash después de la animación
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
    }, 2600);
    
    // Inicializar event listeners globales
    inicializarEventListeners();
    
    // Detectar tamaño de pantalla para sidebar
    manejarResponsiveSidebar();
    window.addEventListener('resize', manejarResponsiveSidebar);
}

// ============================================
// EVENT LISTENERS GLOBALES
// ============================================
function inicializarEventListeners() {
    // Menú toggle
    document.getElementById('menu-toggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('close-sidebar')?.addEventListener('click', cerrarSidebar);
    document.getElementById('sidebar-overlay')?.addEventListener('click', cerrarSidebar);
    
    // Navegación
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) navegarA(page);
        });
    });
    
    // Tema
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTema);
    
    // Notificaciones
    document.getElementById('notifications-toggle')?.addEventListener('click', toggleNotificaciones);
    document.getElementById('close-notifications')?.addEventListener('click', () => {
        document.getElementById('notification-panel').classList.add('hidden');
        APP_STATE.notificationsOpen = false;
    });
    
    // Búsqueda global
    document.getElementById('search-toggle')?.addEventListener('click', toggleSearchBar);
    document.getElementById('search-close')?.addEventListener('click', cerrarSearchBar);
    
    // Usuario dropdown
    document.getElementById('user-mini')?.addEventListener('click', toggleUserDropdown);
    
    // FAB
    document.getElementById('fab-main')?.addEventListener('click', toggleFabMenu);
    
    // Cerrar sesión
    document.getElementById('btn-logout')?.addEventListener('click', (e) => {
        e.preventDefault();
        cerrarSesion();
    });
    
    // Bienvenida
    document.getElementById('btn-login')?.addEventListener('click', mostrarLogin);
    document.getElementById('btn-register')?.addEventListener('click', mostrarRegistro);
    document.getElementById('btn-continue-guest')?.addEventListener('click', continuarComoInvitado);
    
    // Modal
    document.querySelector('.modal-close')?.addEventListener('click', cerrarModal);
    document.getElementById('modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) cerrarModal();
    });
    
    // Confirm modal
    document.getElementById('confirm-cancel')?.addEventListener('click', () => {
        document.getElementById('confirm-modal').classList.add('hidden');
    });
    document.getElementById('confirm-accept')?.addEventListener('click', () => {
        if (APP_STATE.pendingConfirmation) {
            APP_STATE.pendingConfirmation();
            APP_STATE.pendingConfirmation = null;
        }
        document.getElementById('confirm-modal').classList.add('hidden');
    });
    
    // Drawer close
    document.querySelector('.drawer-close')?.addEventListener('click', cerrarDrawer);
    document.querySelector('.drawer-backdrop')?.addEventListener('click', cerrarDrawer);
    
    // Filtros de notificaciones
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtrarNotificaciones(this.dataset.filter);
        });
    });
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (APP_STATE.searchBarOpen) cerrarSearchBar();
            if (APP_STATE.drawerOpen) cerrarDrawer();
            if (APP_STATE.notificationsOpen) {
                document.getElementById('notification-panel').classList.add('hidden');
                APP_STATE.notificationsOpen = false;
            }
            if (!document.getElementById('modal').classList.contains('hidden')) cerrarModal();
        }
    });
    
    // Clic fuera para cerrar elementos
    document.addEventListener('click', (e) => {
        // Cerrar user dropdown
        if (APP_STATE.userDropdownOpen && !e.target.closest('#user-mini') && !e.target.closest('#user-dropdown')) {
            document.getElementById('user-dropdown').classList.add('hidden');
            APP_STATE.userDropdownOpen = false;
        }
        // Cerrar FAB menu
        if (APP_STATE.fabMenuOpen && !e.target.closest('#fab-main') && !e.target.closest('#fab-menu')) {
            document.getElementById('fab-menu').classList.add('hidden');
            APP_STATE.fabMenuOpen = false;
        }
    });
}

function manejarResponsiveSidebar() {
    if (window.innerWidth >= 1024) {
        APP_STATE.sidebarLocked = true;
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('sidebar-overlay').classList.add('hidden');
    } else {
        APP_STATE.sidebarLocked = false;
        if (!APP_STATE.sidebarOpen) {
            document.getElementById('sidebar').classList.remove('open');
        }
    }
}

// ============================================
// NAVEGACIÓN
// ============================================
function mostrarApp() {
    document.getElementById('welcome-screen')?.classList.add('hidden');
    document.getElementById('app')?.classList.remove('hidden');
    
    actualizarSidebarUsuario();
    actualizarHeader();
    navegarA('inicio');
    iniciarContadorRegresivo();
    iniciarActualizacionFecha();
    cargarNotificaciones();
    mostrarFAB();
}

function mostrarBienvenida() {
    document.getElementById('app')?.classList.add('hidden');
    document.getElementById('welcome-screen')?.classList.remove('hidden');
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
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').classList.remove('hidden');
}

function cerrarSidebar() {
    if (APP_STATE.sidebarLocked) return;
    APP_STATE.sidebarOpen = false;
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.add('hidden');
}

function navegarA(page) {
    APP_STATE.currentPage = page;
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    // Actualizar título y breadcrumb
    const titulos = {
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
        'insignias': 'Insignias',
        'gestion-biblioteca': 'Gestión Biblioteca',
        'gestion-galeria': 'Gestión Galería',
        'sistema': 'Sistema'
    };
    
    document.getElementById('page-title').textContent = titulos[page] || page;
    document.getElementById('breadcrumb-current').textContent = titulos[page] || page;
    
    // Cargar contenido
    cargarPagina(page);
    
    // Cerrar sidebar en móvil
    if (window.innerWidth < 1024) {
        cerrarSidebar();
    }
}

function actualizarSidebarUsuario() {
    if (!APP_STATE.usuario) return;
    
    const userMini = document.getElementById('user-mini');
    if (userMini) {
        userMini.querySelector('img').src = APP_STATE.usuario.foto || 'assets/avatars/default.png';
        userMini.querySelector('.user-name').textContent = APP_STATE.usuario.nombre;
        userMini.querySelector('.user-role').textContent = APP_STATE.rol === 'admin' ? 'Administrador' : 'Miembro';
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
    content.innerHTML = '<div class="page-loader"><div class="spinner"></div><p>Cargando...</p></div>';
    
    // Simular carga (en producción, cargaría contenido dinámico)
    setTimeout(() => {
        switch(page) {
            case 'inicio':
                cargarInicio(content);
                break;
            case 'horarios':
                cargarHorarios(content);
                break;
            default:
                content.innerHTML = `
                    <div class="card fade-in">
                        <div class="card-header">
                            <h2 class="card-title">${document.getElementById('page-title').textContent}</h2>
                        </div>
                        <p>Contenido de la página en desarrollo.</p>
                    </div>
                `;
        }
    }, 300);
}

function cargarInicio(container) {
    container.innerHTML = `
        <div class="fade-in">
            ${crearContadorRegresivoHTML()}
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div class="card card-glass">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--azul-primario); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">
                            <i class="bx bx-calendar"></i>
                        </div>
                        <div>
                            <div style="font-size: 0.8rem; opacity: 0.7;">Fecha</div>
                            <div style="font-weight: 700;" id="fecha-actual"></div>
                        </div>
                    </div>
                </div>
                
                <div class="card card-glass">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--dorado); display: flex; align-items: center; justify-content: center; color: var(--azul-primario); font-size: 1.5rem;">
                            <i class="bx bx-time"></i>
                        </div>
                        <div>
                            <div style="font-size: 0.8rem; opacity: 0.7;">Hora</div>
                            <div style="font-weight: 700;" id="hora-actual"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card" id="versiculo-card">
                <div class="card-header">
                    <h3><i class="bx bx-bible"></i> Versículo del Día</h3>
                </div>
                <div id="versiculo-content" style="font-style: italic; font-size: 1.1rem; line-height: 1.8;">
                    Cargando versículo...
                </div>
            </div>
        </div>
    `;
    
    actualizarFechaHora();
    if (!APP_STATE.fechaInterval) {
        APP_STATE.fechaInterval = setInterval(actualizarFechaHora, 1000);
    }
    cargarVersiculoDiario();
}

function crearContadorRegresivoHTML() {
    return `
        <div class="contador-container">
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
    `;
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
    try {
        const response = await fetch(`${CONFIG.API_URL}/cultos/proximo`);
        const data = await response.json();
        
        if (data.estado === 'sin_cultos') {
            const titulo = document.getElementById('contador-titulo');
            if (titulo) titulo.textContent = 'No hay cultos programados';
            return;
        }
        
        const segundos = Math.max(0, data.segundos_restantes || 0);
        const dias = Math.floor(segundos / 86400);
        const horas = Math.floor((segundos % 86400) / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segs = Math.floor(segundos % 60);
        
        const titulo = document.getElementById('contador-titulo');
        const estado = document.getElementById('contador-estado');
        
        if (titulo && data.nombre) {
            titulo.textContent = `${data.nombre} - ${data.dia || ''}`;
        }
        
        if (estado) {
            if (data.estado === 'en_curso') {
                estado.textContent = '🔴 CULTO EN CURSO';
                estado.className = 'contador-estado estado-curso';
            } else {
                estado.textContent = '🟢 PRÓXIMO CULTO';
                estado.className = 'contador-estado estado-proximo';
            }
        }
        
        document.getElementById('contador-dias').textContent = String(dias).padStart(2, '0');
        document.getElementById('contador-horas').textContent = String(horas).padStart(2, '0');
        document.getElementById('contador-minutos').textContent = String(minutos).padStart(2, '0');
        document.getElementById('contador-segundos').textContent = String(segs).padStart(2, '0');
        
    } catch (error) {
        console.log('Contador: usando datos locales (sin conexión al backend)');
        // Datos de respaldo offline
        const ahora = new Date();
        const domingo = new Date(ahora);
        domingo.setDate(ahora.getDate() + ((7 - ahora.getDay()) % 7));
        domingo.setHours(10, 0, 0, 0);
        const diff = Math.max(0, (domingo - ahora) / 1000);
        
        const dias = Math.floor(diff / 86400);
        const horas = Math.floor((diff % 86400) / 3600);
        const minutos = Math.floor((diff % 3600) / 60);
        const segundos = Math.floor(diff % 60);
        
        const titulo = document.getElementById('contador-titulo');
        if (titulo) titulo.textContent = 'Culto Dominical - Domingo';
        
        document.getElementById('contador-dias').textContent = String(dias).padStart(2, '0');
        document.getElementById('contador-horas').textContent = String(horas).padStart(2, '0');
        document.getElementById('contador-minutos').textContent = String(minutos).padStart(2, '0');
        document.getElementById('contador-segundos').textContent = String(segundos).padStart(2, '0');
    }
}

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
        if (data.versiculo) {
            container.innerHTML = `
                <p style="font-size: 1.1rem; margin-bottom: 8px;">"${data.versiculo.texto}"</p>
                <p style="font-weight: 700; color: var(--azul-primario);">${data.versiculo.referencia}</p>
                <span style="font-size: 0.75rem; background: var(--dorado-claro); color: var(--dorado-oscuro); padding: 2px 10px; border-radius: 12px;">${data.versiculo.tipo}</span>
            `;
        }
    } catch (error) {
        container.innerHTML = `
            <p>"Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito..."</p>
            <p style="font-weight: 700; color: var(--azul-primario);">Juan 3:16</p>
        `;
    }
}

// ============================================
// AUTENTICACIÓN
// ============================================
function mostrarLogin() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    
    modalTitle.textContent = 'Iniciar Sesión';
    modalBody.innerHTML = `
        <form id="login-form">
            <div class="form-group">
                <label>Usuario o Correo</label>
                <input type="text" class="form-input" name="usuario" placeholder="Ingresa tu usuario o correo" required autocomplete="username">
            </div>
            <div class="form-group">
                <label>Contraseña</label>
                <div style="position: relative;">
                    <input type="password" class="form-input" name="password" id="login-password" placeholder="Ingresa tu contraseña" required autocomplete="current-password">
                    <button type="button" class="btn-icon" onclick="togglePassword('login-password')" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%);">
                        <i class="bx bx-show"></i>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" name="recordar"> Recordarme
                </label>
            </div>
            <button type="submit" class="btn-primary" style="width: 100%;">Iniciar Sesión</button>
        </form>
        <p style="text-align: center; margin-top: 16px;">
            <a href="#" onclick="mostrarRegistro()" style="color: var(--azul-primario);">¿No tienes cuenta? Regístrate</a>
        </p>
        <p style="text-align: center;">
            <a href="#" onclick="recuperarPassword()" style="color: var(--gris-texto); font-size: 0.9rem;">¿Olvidaste tu contraseña?</a>
        </p>
    `;
    
    document.getElementById('modal-footer').classList.add('hidden');
    modal.classList.remove('hidden');
    
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario: formData.get('usuario'),
                    password: formData.get('password')
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, data.token);
                localStorage.setItem(CONFIG.STORAGE_KEYS.USUARIO, JSON.stringify(data.usuario));
                localStorage.setItem(CONFIG.STORAGE_KEYS.ROL, data.rol);
                
                APP_STATE.token = data.token;
                APP_STATE.usuario = data.usuario;
                APP_STATE.rol = data.rol;
                
                cerrarModal();
                mostrarApp();
                showToast('¡Bienvenido! Inicio de sesión exitoso', 'success');
            } else {
                showToast(data.error || 'Credenciales inválidas', 'error');
            }
        } catch (error) {
            // Modo offline: login simulado
            if (formData.get('usuario') === 'admin' && formData.get('password') === '123456') {
                const usuarioDemo = {
                    id: 1, nombre: 'Administrador', usuario: 'admin',
                    foto: 'assets/avatars/admin.png', verificado: true
                };
                localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, 'demo-token-admin');
                localStorage.setItem(CONFIG.STORAGE_KEYS.USUARIO, JSON.stringify(usuarioDemo));
                localStorage.setItem(CONFIG.STORAGE_KEYS.ROL, 'admin');
                APP_STATE.token = 'demo-token-admin';
                APP_STATE.usuario = usuarioDemo;
                APP_STATE.rol = 'admin';
                cerrarModal();
                mostrarApp();
                showToast('Modo offline: Administrador', 'warning');
            } else if (formData.get('usuario') === 'usuario' && formData.get('password') === '123456') {
                const usuarioDemo = {
                    id: 2, nombre: 'Usuario', usuario: 'usuario',
                    foto: 'assets/avatars/default.png', verificado: false
                };
                localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, 'demo-token-user');
                localStorage.setItem(CONFIG.STORAGE_KEYS.USUARIO, JSON.stringify(usuarioDemo));
                localStorage.setItem(CONFIG.STORAGE_KEYS.ROL, 'usuario');
                APP_STATE.token = 'demo-token-user';
                APP_STATE.usuario = usuarioDemo;
                APP_STATE.rol = 'usuario';
                cerrarModal();
                mostrarApp();
                showToast('Modo offline: Usuario', 'warning');
            } else {
                showToast('Error de conexión. Verifica tu internet o usa admin/123456', 'error');
            }
        }
    });
}

function mostrarRegistro() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    
    modalTitle.textContent = 'Registro de Miembro';
    modalBody.innerHTML = `
        <form id="registro-form">
            <div class="form-group">
                <label>Nombre</label>
                <input type="text" class="form-input" name="nombre" required>
            </div>
            <div class="form-group">
                <label>Apellidos</label>
                <input type="text" class="form-input" name="apellidos" required>
            </div>
            <div class="form-group">
                <label>Documento</label>
                <input type="text" class="form-input" name="documento" required>
            </div>
            <div class="form-group">
                <label>Correo Electrónico</label>
                <input type="email" class="form-input" name="correo" required>
            </div>
            <div class="form-group">
                <label>Celular</label>
                <input type="tel" class="form-input" name="celular" required>
            </div>
            <div class="form-group">
                <label>Usuario</label>
                <input type="text" class="form-input" name="usuario" required>
            </div>
            <div class="form-group">
                <label>Contraseña</label>
                <input type="password" class="form-input" name="password" required minlength="6">
            </div>
            <div class="form-group">
                <label>Confirmar Contraseña</label>
                <input type="password" class="form-input" name="confirmar_password" required>
            </div>
            <button type="submit" class="btn-primary" style="width: 100%;">Registrarse</button>
        </form>
        <p style="text-align: center; margin-top: 16px;">
            <a href="#" onclick="mostrarLogin()" style="color: var(--azul-primario);">¿Ya tienes cuenta? Inicia sesión</a>
        </p>
    `;
    
    document.getElementById('modal-footer').classList.add('hidden');
    modal.classList.remove('hidden');
    
    document.getElementById('registro-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        if (formData.get('password') !== formData.get('confirmar_password')) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }
        
        try {
            const datos = Object.fromEntries(formData);
            delete datos.confirmar_password;
            
            const response = await fetch(`${CONFIG.API_URL}/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showToast('¡Registro exitoso! Ahora puedes iniciar sesión', 'success');
                setTimeout(() => mostrarLogin(), 1500);
            } else {
                showToast(data.error || 'Error en el registro', 'error');
            }
        } catch (error) {
            showToast('Registro exitoso (modo offline). Usa tus credenciales para iniciar sesión.', 'success');
            setTimeout(() => mostrarLogin(), 1500);
        }
    });
}

function continuarComoInvitado() {
    APP_STATE.rol = 'invitado';
    APP_STATE.usuario = { nombre: 'Invitado', foto: 'assets/avatars/default.png' };
    mostrarApp();
    showToast('Navegando como invitado', 'info');
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
    
    document.getElementById('user-dropdown').classList.add('hidden');
    APP_STATE.userDropdownOpen = false;
    
    mostrarBienvenida();
    showToast('Sesión cerrada correctamente', 'info');
}

// ============================================
// API CALLS
// ============================================
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    
    if (APP_STATE.token) {
        options.headers['Authorization'] = `Bearer ${APP_STATE.token}`;
    }
    
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${CONFIG.API_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error || 'Error en la solicitud');
    
    return data;
}

// ============================================
// NOTIFICACIONES
// ============================================
function toggleNotificaciones() {
    const panel = document.getElementById('notification-panel');
    APP_STATE.notificationsOpen = !APP_STATE.notificationsOpen;
    
    if (APP_STATE.notificationsOpen) {
        panel.classList.remove('hidden');
        cargarNotificaciones();
    } else {
        panel.classList.add('hidden');
    }
}

async function cargarNotificaciones() {
    // Datos de ejemplo
    const notificaciones = [
        { id: 1, titulo: 'Culto Dominical', mensaje: 'Recuerda asistir este domingo a las 10:00 AM', fecha: new Date().toISOString(), leida: false, tipo: 'anuncios' },
        { id: 2, titulo: 'Nuevo versículo', mensaje: 'Se ha publicado el versículo del día', fecha: new Date().toISOString(), leida: true, tipo: 'anuncios' }
    ];
    
    actualizarListaNotificaciones(notificaciones);
}

function actualizarListaNotificaciones(notificaciones) {
    const list = document.getElementById('notification-list');
    if (!list) return;
    
    if (!notificaciones.length) {
        list.innerHTML = '<div class="notification-empty"><i class="bx bx-bell-off"></i><p>No hay notificaciones</p></div>';
        return;
    }
    
    list.innerHTML = notificaciones.map(n => `
        <div class="notification-item" style="padding: 12px 16px; border-bottom: 1px solid var(--gris-medio); cursor: pointer; ${!n.leida ? 'background: var(--azul-surface);' : ''}">
            <strong>${n.titulo}</strong>
            <p style="font-size: 0.85rem; margin: 4px 0;">${n.mensaje}</p>
            <small style="color: var(--gris-texto);">${formatearFecha(n.fecha)}</small>
        </div>
    `).join('');
}

function filtrarNotificaciones(filtro) {
    // Implementar filtrado
    cargarNotificaciones();
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
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('modal-footer').classList.add('hidden');
}

// ============================================
// DRAWER
// ============================================
function abrirDrawer(titulo, contenido) {
    document.getElementById('drawer-title').textContent = titulo;
    document.getElementById('drawer-body').innerHTML = contenido;
    document.getElementById('drawer').classList.remove('hidden');
    APP_STATE.drawerOpen = true;
}

function cerrarDrawer() {
    document.getElementById('drawer').classList.add('hidden');
    APP_STATE.drawerOpen = false;
}

// ============================================
// SEARCH BAR
// ============================================
function toggleSearchBar() {
    APP_STATE.searchBarOpen = !APP_STATE.searchBarOpen;
    const bar = document.getElementById('search-bar');
    if (APP_STATE.searchBarOpen) {
        bar.classList.remove('hidden');
        document.getElementById('global-search-input').focus();
    } else {
        bar.classList.add('hidden');
    }
}

function cerrarSearchBar() {
    document.getElementById('search-bar').classList.add('hidden');
    APP_STATE.searchBarOpen = false;
}

// ============================================
// USER DROPDOWN
// ============================================
function toggleUserDropdown() {
    APP_STATE.userDropdownOpen = !APP_STATE.userDropdownOpen;
    const dropdown = document.getElementById('user-dropdown');
    if (APP_STATE.userDropdownOpen) {
        dropdown.classList.remove('hidden');
    } else {
        dropdown.classList.add('hidden');
    }
}

// ============================================
// FAB
// ============================================
function mostrarFAB() {
    document.getElementById('fab-main').classList.remove('hidden');
}

function toggleFabMenu() {
    APP_STATE.fabMenuOpen = !APP_STATE.fabMenuOpen;
    const menu = document.getElementById('fab-menu');
    if (APP_STATE.fabMenuOpen) {
        menu.classList.remove('hidden');
    } else {
        menu.classList.add('hidden');
    }
}

// ============================================
// TOAST
// ============================================
function showToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toast-container');
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
    const icon = input.parentElement.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'bx bx-hide';
    } else {
        input.type = 'password';
        icon.className = 'bx bx-show';
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

function recuperarPassword() {
    showToast('Funcionalidad en desarrollo. Contacta al administrador.', 'info');
}

// ============================================
// EXPORTAR A WINDOW
// ============================================
window.mostrarLogin = mostrarLogin;
window.mostrarRegistro = mostrarRegistro;
window.cerrarSesion = cerrarSesion;
window.togglePassword = togglePassword;
window.recuperarPassword = recuperarPassword;
