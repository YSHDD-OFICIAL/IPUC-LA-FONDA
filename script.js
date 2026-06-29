// script.js - JavaScript Principal IPUC LA FONDA
// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
    API_URL: 'http://localhost:5000/api',
    STORAGE_KEYS: {
        TOKEN: 'ipuc_token',
        USUARIO: 'ipuc_usuario',
        TEMA: 'ipuc_tema',
        ROL: 'ipuc_rol'
    },
    PAGES: [
        'inicio', 'horarios', 'asistencia', 'noticias', 'eventos', 
        'chat', 'biblioteca', 'galeria', 'perfil', 'configuracion',
        'dashboard', 'usuarios', 'versiculos'
    ]
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
    notificationsOpen: false,
    contadorInterval: null,
    mensajesNoLeidos: 0,
    notificacionesNoLeidas: 0,
    socket: null
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
});

function inicializarApp() {
    // Verificar sesión existente
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    const usuario = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USUARIO) || 'null');
    const tema = localStorage.getItem(CONFIG.STORAGE_KEYS.TEMA) || 'light';
    
    APP_STATE.tema = tema;
    document.documentElement.setAttribute('data-theme', tema);
    
    // Ocultar splash después de la animación
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        
        if (token && usuario) {
            APP_STATE.token = token;
            APP_STATE.usuario = usuario;
            APP_STATE.rol = usuario.rol || 'usuario';
            mostrarApp();
        } else {
            mostrarBienvenida();
        }
    }, 2500);
    
    // Inicializar event listeners
    inicializarEventListeners();
}

function inicializarEventListeners() {
    // Menú lateral
    document.getElementById('menu-toggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('close-sidebar')?.addEventListener('click', cerrarSidebar);
    
    // Navegación
    document.querySelectorAll('.nav-item').forEach(item => {
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
    
    // Botones de bienvenida
    document.getElementById('btn-login')?.addEventListener('click', mostrarLogin);
    document.getElementById('btn-register')?.addEventListener('click', mostrarRegistro);
    
    // Modal
    document.querySelector('.modal-close')?.addEventListener('click', cerrarModal);
    document.getElementById('modal')?.addEventListener('click', function(e) {
        if (e.target === this) cerrarModal();
    });
    
    // Cerrar sidebar al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (APP_STATE.sidebarOpen && 
            !e.target.closest('.sidebar') && 
            !e.target.closest('#menu-toggle')) {
            cerrarSidebar();
        }
    });
}

// ============================================
// NAVEGACIÓN
// ============================================
function mostrarApp() {
    document.getElementById('welcome-screen')?.classList.add('hidden');
    document.getElementById('app')?.classList.remove('hidden');
    
    actualizarSidebar();
    actualizarHeader();
    navegarA('inicio');
    iniciarContadorRegresivo();
    cargarNotificaciones();
}

function mostrarBienvenida() {
    document.getElementById('app')?.classList.add('hidden');
    document.getElementById('welcome-screen')?.classList.remove('hidden');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    APP_STATE.sidebarOpen = !APP_STATE.sidebarOpen;
    
    if (APP_STATE.sidebarOpen) {
        sidebar.classList.add('open');
        crearOverlay();
    } else {
        sidebar.classList.remove('open');
        removerOverlay();
    }
}

function cerrarSidebar() {
    APP_STATE.sidebarOpen = false;
    document.getElementById('sidebar')?.classList.remove('open');
    removerOverlay();
}

function crearOverlay() {
    if (!document.querySelector('.sidebar-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', cerrarSidebar);
        document.body.appendChild(overlay);
    }
}

function removerOverlay() {
    document.querySelector('.sidebar-overlay')?.remove();
}

function navegarA(page) {
    if (!CONFIG.PAGES.includes(page)) return;
    
    APP_STATE.currentPage = page;
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    // Actualizar título
    const titulos = {
        inicio: 'Inicio',
        horarios: 'Horarios de Cultos',
        asistencia: 'Confirmar Asistencia',
        noticias: 'Noticias',
        eventos: 'Eventos',
        chat: 'Mensajes',
        biblioteca: 'Biblioteca Digital',
        galeria: 'Galería',
        perfil: 'Mi Perfil',
        configuracion: 'Configuración',
        dashboard: 'Dashboard',
        usuarios: 'Administrar Usuarios',
        versiculos: 'Versículos Diarios'
    };
    
    document.getElementById('page-title').textContent = titulos[page] || page;
    
    // Cargar contenido de la página
    cargarPagina(page);
    
    // Cerrar sidebar en móvil
    if (window.innerWidth < 768) {
        cerrarSidebar();
    }
}

function actualizarSidebar() {
    const userMini = document.getElementById('user-mini');
    const adminMenu = document.getElementById('admin-menu');
    
    if (APP_STATE.usuario) {
        userMini.querySelector('img').src = APP_STATE.usuario.foto || 'assets/avatars/default.png';
        userMini.querySelector('.user-name').textContent = APP_STATE.usuario.nombre;
        userMini.querySelector('.user-role').textContent = APP_STATE.rol === 'admin' ? 'Administrador' : 'Miembro';
        
        // Mostrar menú admin si es administrador
        if (APP_STATE.rol === 'admin') {
            adminMenu.classList.remove('hidden');
        }
    }
}

function actualizarHeader() {
    // Actualizar foto de perfil en el header
    const themeIcon = document.querySelector('#theme-toggle i');
    if (APP_STATE.tema === 'dark') {
        themeIcon.className = 'bx bx-sun';
    } else {
        themeIcon.className = 'bx bx-moon';
    }
}

// ============================================
// CARGAR PÁGINAS
// ============================================
function cargarPagina(page) {
    const content = document.getElementById('page-content');
    
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
        case 'noticias':
            cargarNoticias(content);
            break;
        case 'eventos':
            cargarEventos(content);
            break;
        case 'chat':
            cargarChat(content);
            break;
        case 'biblioteca':
            cargarBiblioteca(content);
            break;
        case 'galeria':
            cargarGaleria(content);
            break;
        case 'perfil':
            cargarPerfil(content);
            break;
        case 'configuracion':
            cargarConfiguracion(content);
            break;
        case 'dashboard':
            cargarDashboard(content);
            break;
        case 'usuarios':
            cargarUsuarios(content);
            break;
        case 'versiculos':
            cargarVersiculos(content);
            break;
        default:
            content.innerHTML = '<p>Página no encontrada</p>';
    }
}

// ============================================
// PÁGINA DE INICIO
// ============================================
async function cargarInicio(container) {
    container.innerHTML = `
        <div class="fade-in">
            ${crearContadorRegresivo()}
            
            <div class="stats-grid">
                <div class="stat-card card-glass">
                    <div class="stat-icon blue">
                        <i class="bx bx-calendar"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-label">Fecha</div>
                        <div class="stat-number" id="fecha-actual"></div>
                    </div>
                </div>
                
                <div class="stat-card card-glass">
                    <div class="stat-icon gold">
                        <i class="bx bx-time"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-label">Hora</div>
                        <div class="stat-number" id="hora-actual"></div>
                    </div>
                </div>
                
                <div class="stat-card card-glass">
                    <div class="stat-icon green">
                        <i class="bx bx-group"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-label">Asistencia Hoy</div>
                        <div class="stat-number" id="asistencia-hoy">--</div>
                    </div>
                </div>
            </div>
            
            <div class="card" id="versiculo-diario">
                <h3><i class="bx bx-bible"></i> Versículo del Día</h3>
                <div id="versiculo-content">Cargando...</div>
            </div>
            
            <div class="card" id="proximo-evento">
                <h3><i class="bx bx-calendar-event"></i> Próximo Evento</h3>
                <div id="evento-content">Cargando...</div>
            </div>
            
            <div class="card" id="ultimas-noticias">
                <h3><i class="bx bx-news"></i> Últimas Noticias</h3>
                <div id="noticias-content">Cargando...</div>
            </div>
        </div>
    `;
    
    // Actualizar fecha y hora
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 1000);
    
    // Cargar versículo del día
    cargarVersiculoDiario();
    
    // Cargar próximos eventos
    cargarProximoEvento();
    
    // Cargar noticias recientes
    cargarNoticiasRecientes();
    
    // Cargar estadísticas de asistencia
    cargarEstadisticasAsistencia();
}

function actualizarFechaHora() {
    const ahora = new Date();
    const fecha = document.getElementById('fecha-actual');
    const hora = document.getElementById('hora-actual');
    
    if (fecha) {
        fecha.textContent = ahora.toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    if (hora) {
        hora.textContent = ahora.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// ============================================
// CONTADOR REGRESIVO
// ============================================
function crearContadorRegresivo() {
    return `
        <div class="contador-container">
            <div class="contador-titulo" id="contador-titulo">Cargando próximo culto...</div>
            <div class="contador-tiempo" id="contador-tiempo">
                <div class="contador-item">
                    <div class="contador-numero" id="dias">00</div>
                    <div class="contador-etiqueta">Días</div>
                </div>
                <div class="contador-item">
                    <div class="contador-numero" id="horas">00</div>
                    <div class="contador-etiqueta">Horas</div>
                </div>
                <div class="contador-item">
                    <div class="contador-numero" id="minutos">00</div>
                    <div class="contador-etiqueta">Minutos</div>
                </div>
                <div class="contador-item">
                    <div class="contador-numero" id="segundos">00</div>
                    <div class="contador-etiqueta">Segundos</div>
                </div>
            </div>
            <div class="contador-estado" id="contador-estado"></div>
        </div>
    `;
}

function iniciarContadorRegresivo() {
    if (APP_STATE.contadorInterval) {
        clearInterval(APP_STATE.contadorInterval);
    }
    
    APP_STATE.contadorInterval = setInterval(actualizarContador, 1000);
    actualizarContador();
}

async function actualizarContador() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/cultos/proximo`);
        const data = await response.json();
        
        const titulo = document.getElementById('contador-titulo');
        const estado = document.getElementById('contador-estado');
        
        if (data.estado === 'sin_cultos') {
            if (titulo) titulo.textContent = 'No hay cultos programados';
            return;
        }
        
        const segundosRestantes = data.segundos_restantes || 0;
        
        if (titulo) {
            titulo.textContent = `${data.nombre} - ${data.dia} ${data.fecha}`;
        }
        
        if (estado) {
            estado.textContent = data.estado === 'en_curso' ? 'CULTO EN CURSO' : 'PRÓXIMO CULTO';
            estado.className = `contador-estado ${data.estado === 'en_curso' ? 'estado-curso' : 'estado-proximo'}`;
        }
        
        // Actualizar contador
        const dias = Math.floor(segundosRestantes / 86400);
        const horas = Math.floor((segundosRestantes % 86400) / 3600);
        const minutos = Math.floor((segundosRestantes % 3600) / 60);
        const segundos = Math.floor(segundosRestantes % 60);
        
        document.getElementById('dias').textContent = String(dias).padStart(2, '0');
        document.getElementById('horas').textContent = String(horas).padStart(2, '0');
        document.getElementById('minutos').textContent = String(minutos).padStart(2, '0');
        document.getElementById('segundos').textContent = String(segundos).padStart(2, '0');
        
    } catch (error) {
        console.error('Error al actualizar contador:', error);
    }
}

// ============================================
// AUTENTICACIÓN
// ============================================
function mostrarLogin() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2>Iniciar Sesión</h2>
        <form id="login-form">
            <div class="form-group">
                <label>Usuario o Correo</label>
                <input type="text" class="form-input" name="usuario" required>
            </div>
            <div class="form-group">
                <label>Contraseña</label>
                <div style="position: relative;">
                    <input type="password" class="form-input" name="password" id="login-password" required>
                    <button type="button" class="btn-icon" onclick="togglePassword('login-password')" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%);">
                        <i class="bx bx-show"></i>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="recordar"> Recordarme
                </label>
            </div>
            <button type="submit" class="btn-primary">Iniciar Sesión</button>
        </form>
        <p style="text-align: center; margin-top: 16px;">
            <a href="#" onclick="mostrarRegistro()">¿No tienes cuenta? Regístrate</a>
        </p>
        <p style="text-align: center;">
            <a href="#" onclick="recuperarPassword()">¿Olvidaste tu contraseña?</a>
        </p>
    `;
    
    modal.classList.remove('hidden');
    
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const datos = {
            usuario: formData.get('usuario'),
            password: formData.get('password')
        };
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(datos)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Guardar sesión
                localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, data.token);
                localStorage.setItem(CONFIG.STORAGE_KEYS.USUARIO, JSON.stringify(data.usuario));
                localStorage.setItem(CONFIG.STORAGE_KEYS.ROL, data.rol);
                
                APP_STATE.token = data.token;
                APP_STATE.usuario = data.usuario;
                APP_STATE.rol = data.rol;
                
                cerrarModal();
                mostrarApp();
                showToast('Inicio de sesión exitoso', 'success');
            } else {
                showToast(data.error || 'Error al iniciar sesión', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        }
    });
}

function mostrarRegistro() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2>Registro de Miembro</h2>
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
                <label>Fecha de Nacimiento</label>
                <input type="date" class="form-input" name="fecha_nacimiento" required>
            </div>
            <div class="form-group">
                <label>Sexo</label>
                <select class="form-input" name="sexo" required>
                    <option value="">Seleccionar...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                </select>
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
                <label>Ministerio</label>
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
                <label>Usuario</label>
                <input type="text" class="form-input" name="usuario" required>
            </div>
            <div class="form-group">
                <label>Contraseña</label>
                <input type="password" class="form-input" name="password" required>
            </div>
            <div class="form-group">
                <label>Confirmar Contraseña</label>
                <input type="password" class="form-input" name="confirmar_password" required>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="terminos" required> 
                    Acepto los términos y condiciones
                </label>
            </div>
            <button type="submit" class="btn-primary">Registrarse</button>
        </form>
        <p style="text-align: center; margin-top: 16px;">
            <a href="#" onclick="mostrarLogin()">¿Ya tienes cuenta? Inicia sesión</a>
        </p>
    `;
    
    modal.classList.remove('hidden');
    
    document.getElementById('registro-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const password = formData.get('password');
        const confirmar = formData.get('confirmar_password');
        
        if (password !== confirmar) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }
        
        const datos = Object.fromEntries(formData);
        delete datos.confirmar_password;
        delete datos.terminos;
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/registro`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(datos)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showToast('Registro exitoso. Ahora puedes iniciar sesión', 'success');
                setTimeout(() => mostrarLogin(), 1500);
            } else {
                showToast(data.error || 'Error en el registro', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        }
    });
}

function cerrarSesion() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USUARIO);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.ROL);
    
    APP_STATE.token = null;
    APP_STATE.usuario = null;
    APP_STATE.rol = null;
    
    if (APP_STATE.contadorInterval) {
        clearInterval(APP_STATE.contadorInterval);
    }
    
    mostrarBienvenida();
    showToast('Sesión cerrada', 'info');
}

// ============================================
// API CALLS
// ============================================
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (APP_STATE.token) {
        options.headers['Authorization'] = `Bearer ${APP_STATE.token}`;
    }
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error en la solicitud');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// NOTIFICACIONES
// ============================================
function toggleNotificaciones() {
    const panel = document.getElementById('notification-panel');
    
    if (!panel) {
        crearPanelNotificaciones();
    }
    
    APP_STATE.notificationsOpen = !APP_STATE.notificationsOpen;
    document.getElementById('notification-panel').classList.toggle('open');
}

function crearPanelNotificaciones() {
    const panel = document.createElement('div');
    panel.id = 'notification-panel';
    panel.className = 'notification-panel';
    panel.innerHTML = `
        <div class="notification-header">
            <h3>Notificaciones</h3>
            <button class="btn-icon" onclick="marcarTodasLeidas()">
                <i class="bx bx-check-double"></i>
            </button>
        </div>
        <div id="notification-list">
            <p style="text-align: center; padding: 20px;">Cargando notificaciones...</p>
        </div>
    `;
    
    document.body.appendChild(panel);
}

async function cargarNotificaciones() {
    try {
        const data = await apiCall('/notificaciones');
        actualizarListaNotificaciones(data.notificaciones);
    } catch (error) {
        console.error('Error al cargar notificaciones:', error);
    }
}

function actualizarListaNotificaciones(notificaciones) {
    const list = document.getElementById('notification-list');
    
    if (!list) return;
    
    if (!notificaciones || notificaciones.length === 0) {
        list.innerHTML = '<p style="text-align: center; padding: 20px;">No hay notificaciones</p>';
        return;
    }
    
    list.innerHTML = notificaciones.map(notif => `
        <div class="notification-item ${notif.leida ? '' : 'unread'}" onclick="marcarComoLeida(${notif.id})">
            <div class="notification-title">${notif.titulo}</div>
            <div class="notification-message">${notif.mensaje}</div>
            <div class="time">${formatearFecha(notif.fecha)}</div>
        </div>
    `).join('');
    
    // Actualizar badge
    const noLeidas = notificaciones.filter(n => !n.leida).length;
    APP_STATE.notificacionesNoLeidas = noLeidas;
    actualizarBadgeNotificaciones();
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
// UTILIDADES
// ============================================
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'bx bx-hide';
    } else {
        input.type = 'password';
        icon.className = 'bx bx-show';
    }
}

function toggleTema() {
    APP_STATE.tema = APP_STATE.tema === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', APP_STATE.tema);
    localStorage.setItem(CONFIG.STORAGE_KEYS.TEMA, APP_STATE.tema);
    actualizarHeader();
}

function cerrarModal() {
    document.getElementById('modal').classList.add('hidden');
}

function showToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const diff = ahora - fecha;
    
    if (diff < 60000) return 'Ahora mismo';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} minutos`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} horas`;
    
    return fecha.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarPassword(password) {
    return password.length >= 6;
}

// ============================================
// PWA
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registrado:', registration.scope);
            })
            .catch(error => {
                console.log('Error al registrar ServiceWorker:', error);
            });
    });
}

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================
window.mostrarLogin = mostrarLogin;
window.mostrarRegistro = mostrarRegistro;
window.cerrarSesion = cerrarSesion;
window.togglePassword = togglePassword;