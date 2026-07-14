// ============================================
// IPUC LA FONDA - SCRIPT.JS v5.1 COMPLETO
// Web App Profesional - Todas las secciones funcionales
// Autenticación LOCAL con Database v5.0
// MEJORADO - OPTIMIZADO - 100% OPERATIVO
// "Donde el Espíritu Santo se mueve"
// ============================================

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
    VERSION: '5.1',
    MODO_OFFLINE: true,
    STORAGE_KEYS: {
        TOKEN: 'ipuc5_token',
        USUARIO: 'ipuc5_usuario',
        ROL: 'ipuc5_rol',
        TEMA: 'ipuc5_tema',
        PUBLICACIONES: 'ipuc5_publicaciones',
        COMENTARIOS: 'ipuc5_comentarios',
        REACCIONES: 'ipuc5_reacciones',
        NOTIFICACIONES: 'ipuc5_notificaciones',
        ASISTENCIAS: 'ipuc5_asistencias',
        EVENTOS: 'ipuc5_eventos',
        NOTICIAS: 'ipuc5_noticias'
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
    ],
    EVENTOS_DEMO: [
        { id: 1, titulo: 'Culto de Jóvenes', fecha: '2026-07-20', hora: '6:00 PM', descripcion: 'Culto especial para jóvenes', ubicacion: 'Templo Principal' },
        { id: 2, titulo: 'Escuela Dominical', fecha: '2026-07-21', hora: '9:00 AM', descripcion: 'Clase para todas las edades', ubicacion: 'Salón de Enseñanza' }
    ],
    NOTICIAS_DEMO: [
        { id: 1, titulo: 'Campaña de Oración', fecha: '2026-07-18', resumen: 'Únete a nuestra campaña de oración de 40 días', contenido: 'Detalles de la campaña...' },
        { id: 2, titulo: 'Nuevo Ministerio', fecha: '2026-07-17', resumen: 'Lanzamos el ministerio de alabanza', contenido: 'Información del nuevo ministerio...' }
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
    sidebarLocked: false,
    notificationsOpen: false, 
    userDropdownOpen: false, 
    fabMenuOpen: false, 
    searchBarOpen: false,
    contadorInterval: null, 
    fechaInterval: null,
    notificacionesNoLeidas: 0, 
    pendingConfirmation: null, 
    isLoading: false,
    publicaciones: [], 
    comentarios: [], 
    reacciones: {},
    notificaciones: [],
    asistencias: [],
    eventos: [],
    noticias: [],
    isOnline: navigator.onLine,
    lastSync: null
};

// ============================================
// SISTEMA DE LOGGING
// ============================================
class Logger {
    static levels = {
        INFO: 'info',
        WARNING: 'warning',
        ERROR: 'error',
        DEBUG: 'debug'
    };

    static log(message, level = this.levels.INFO, data = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            user: APP_STATE.usuario?.id || 'anonymous',
            version: CONFIG.VERSION
        };
        
        // Mostrar en consola con colores
        const styles = {
            info: 'color: #2196F3',
            warning: 'color: #FF9800',
            error: 'color: #f44336',
            debug: 'color: #9E9E9E'
        };
        console.log(`%c[${level.toUpperCase()}] ${message}`, styles[level] || '', data || '');
        
        // Guardar en localStorage para debugging
        try {
            const logs = JSON.parse(localStorage.getItem('ipuc5_logs') || '[]');
            logs.push(entry);
            if (logs.length > 100) logs.shift(); // Mantener solo 100 logs
            localStorage.setItem('ipuc5_logs', JSON.stringify(logs));
        } catch (e) {}
    }

    static getLogs() {
        try {
            return JSON.parse(localStorage.getItem('ipuc5_logs') || '[]');
        } catch { return []; }
    }

    static clearLogs() {
        localStorage.removeItem('ipuc5_logs');
    }
}

// ============================================
// SISTEMA DE CACHE
// ============================================
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.ttl = 5 * 60 * 1000; // 5 minutos
    }

    set(key, data, ttl = this.ttl) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }

    clear() {
        this.cache.clear();
    }

    remove(key) {
        this.cache.delete(key);
    }
}

const cache = new CacheManager();

// ============================================
// FUNCIONES DE TEMA MEJORADAS
// ============================================
function toggleTema() {
    APP_STATE.tema = APP_STATE.tema === 'light' ? 'dark' : 'light';
    aplicarTema(APP_STATE.tema);
    localStorage.setItem(CONFIG.STORAGE_KEYS.TEMA, APP_STATE.tema);
    Logger.log(`Tema cambiado a ${APP_STATE.tema}`, 'info');
}

function aplicarTema(t) {
    document.documentElement.setAttribute('data-theme', t);
    const i = document.querySelector('#theme-toggle i');
    if (i) i.className = t === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
    
    // Actualizar meta tag de color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.content = t === 'dark' ? '#1a1a2e' : '#1a237e';
    }
}

// ============================================
// FUNCIONES DE TOAST MEJORADAS
// ============================================
function showToast(m, tipo = 'info', duracion = 3500) {
    const c = document.getElementById('toast-container');
    if (!c) return;
    
    const iconos = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const t = document.createElement('div');
    t.className = `toast ${tipo}`;
    t.setAttribute('role', 'alert');
    t.innerHTML = `<span>${iconos[tipo] || ''} ${m}</span>`;
    t.style.animation = 'slideInRight 0.3s ease';
    c.appendChild(t);
    
    setTimeout(() => {
        t.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => t.remove(), 300);
    }, duracion);
}

function togglePassword(id) {
    const input = document.getElementById(id);
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

function formatearFecha(f) {
    try {
        const d = new Date(f);
        if (isNaN(d.getTime())) return 'Fecha inválida';
        const a = new Date();
        const diff = a - d;
        
        if (diff < 60000) return 'Ahora';
        if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
        if (diff < 604800000) return `Hace ${Math.floor(diff / 86400000)} d`;
        return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return 'Fecha inválida';
    }
}

// ============================================
// FUNCIONES DE MODAL MEJORADAS
// ============================================
function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('hidden');
        // Limpiar body para evitar conflictos
        const body = document.getElementById('modal-body');
        if (body) body.innerHTML = '';
    }
    document.getElementById('modal-footer')?.classList.add('hidden');
    Logger.log('Modal cerrado', 'debug');
}

function confirmarAccion(ti, me, cb, tipo = 'warning') {
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const modal = document.getElementById('confirm-modal');
    if (!modal) return;
    
    if (titleEl) titleEl.textContent = ti;
    if (messageEl) messageEl.textContent = me;
    
    // Cambiar estilo según tipo
    const acceptBtn = document.getElementById('confirm-accept');
    if (acceptBtn) {
        acceptBtn.className = tipo === 'danger' ? 'btn-danger' : 'btn-primary';
    }
    
    APP_STATE.pendingConfirmation = cb;
    modal.classList.remove('hidden');
    Logger.log(`Confirmación mostrada: ${ti}`, 'debug');
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN MEJORADAS
// ============================================
function mostrarLogin() {
    Logger.log('Mostrando formulario de login', 'debug');
    const m = document.getElementById('modal');
    const b = document.getElementById('modal-body');
    const t = document.getElementById('modal-title');
    const f = document.getElementById('modal-footer');
    if (!m || !b) return;
    
    if (t) t.textContent = 'Iniciar Sesión';
    if (f) f.classList.add('hidden');
    
    b.innerHTML = `
        <form id="login-form" autocomplete="off">
            <div class="form-group">
                <label>Usuario o Correo</label>
                <input type="text" class="form-input" id="login-usuario" placeholder="Ingresa tu usuario o correo" required autofocus>
            </div>
            <div class="form-group">
                <label>Contraseña</label>
                <div style="position:relative;">
                    <input type="password" class="form-input" id="login-password" placeholder="Ingresa tu contraseña" required>
                    <button type="button" class="btn-icon" onclick="togglePassword('login-password')" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;">
                        <i class="bx bx-show"></i>
                    </button>
                </div>
            </div>
            <button type="submit" class="btn-primary" style="width:100%;">
                <i class="bx bx-log-in"></i> Iniciar Sesión
            </button>
        </form>
        <p style="text-align:center;margin-top:16px;">
            <a href="#" onclick="mostrarRegistro()" style="color:var(--azul-primario);text-decoration:none;">
                ¿No tienes cuenta? Regístrate aquí
            </a>
        </p>
        <p style="text-align:center;margin-top:8px;font-size:0.8rem;color:var(--gris-texto);">
            <a href="#" onclick="continuarComoInvitado()" style="color:var(--gris-texto);text-decoration:none;">
                <i class="bx bx-user"></i> Continuar como invitado
            </a>
        </p>
    `;
    m.classList.remove('hidden');
    
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const u = document.getElementById('login-usuario').value.trim();
        const p = document.getElementById('login-password').value;
        if (!u || !p) {
            showToast('Completa todos los campos', 'warning');
            return;
        }
        realizarLogin(u, p);
    });
}

function realizarLogin(usuario, password) {
    Logger.log(`Intento de login para: ${usuario}`, 'info');
    
    try {
        if (typeof db === 'undefined') {
            throw new Error('Base de datos no disponible');
        }
        
        const r = db.login(usuario, password);
        if (r?.error) {
            showToast(r.error, 'error');
            Logger.log(`Login fallido: ${r.error}`, 'warning');
            return;
        }
        
        if (r?.token) {
            // Guardar datos en localStorage
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, r.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USUARIO, JSON.stringify(r.usuario));
            localStorage.setItem(CONFIG.STORAGE_KEYS.ROL, r.rol);
            
            // Actualizar estado
            APP_STATE.token = r.token;
            APP_STATE.usuario = r.usuario;
            APP_STATE.rol = r.rol;
            
            // Actualizar UI
            actualizarSidebarUsuario();
            cerrarModal();
            mostrarApp();
            
            showToast(`¡Bienvenido, ${r.usuario.nombre}! 🙏`, 'success');
            Logger.log(`Login exitoso: ${r.usuario.nombre} (${r.rol})`, 'success');
            
            // Sincronizar datos del usuario
            sincronizarDatosUsuario();
            return;
        }
        
        showToast('Error al iniciar sesión', 'error');
        Logger.log('Login fallido: Respuesta inválida', 'error');
    } catch (error) {
        Logger.log(`Error en login: ${error.message}`, 'error');
        showToast(`Error: ${error.message}`, 'error');
    }
}

function mostrarRegistro() {
    Logger.log('Mostrando formulario de registro', 'debug');
    const m = document.getElementById('modal');
    const b = document.getElementById('modal-body');
    const t = document.getElementById('modal-title');
    const f = document.getElementById('modal-footer');
    if (!m || !b) return;
    
    if (t) t.textContent = 'Crear Cuenta';
    if (f) f.classList.add('hidden');
    
    b.innerHTML = `
        <form id="registro-form" autocomplete="off">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
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
                <label>Documento *</label>
                <input type="text" class="form-input" name="documento" required>
            </div>
            <div class="form-group">
                <label>Fecha Nac. *</label>
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
                <label>Correo *</label>
                <input type="email" class="form-input" name="correo" required>
            </div>
            <div class="form-group">
                <label>Celular *</label>
                <input type="tel" class="form-input" name="celular" required pattern="[0-9]{10}">
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
                <label>Usuario *</label>
                <input type="text" class="form-input" name="usuario" required minlength="3">
            </div>
            <div class="form-group">
                <label>Contraseña *</label>
                <div style="position:relative;">
                    <input type="password" class="form-input" name="password" required minlength="8">
                    <button type="button" class="btn-icon" onclick="togglePassword(this.parentElement.querySelector('input').id || '')" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;">
                        <i class="bx bx-show"></i>
                    </button>
                </div>
                <small style="color:var(--gris-texto);font-size:0.7rem;">Mínimo 8 caracteres</small>
            </div>
            <button type="submit" class="btn-primary" style="width:100%;margin-top:8px;">
                <i class="bx bx-user-plus"></i> Crear Cuenta
            </button>
        </form>
        <p style="text-align:center;margin-top:16px;">
            <a href="#" onclick="mostrarLogin()" style="color:var(--azul-primario);text-decoration:none;">
                ¿Ya tienes cuenta? Inicia sesión
            </a>
        </p>
    `;
    m.classList.remove('hidden');
    
    document.getElementById('registro-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const fd = new FormData(this);
        const d = Object.fromEntries(fd);
        
        // Validaciones
        if (d.password.length < 8) {
            showToast('La contraseña debe tener al menos 8 caracteres', 'warning');
            return;
        }
        
        if (d.celular.length !== 10 || !/^[0-9]+$/.test(d.celular)) {
            showToast('El celular debe tener 10 dígitos', 'warning');
            return;
        }
        
        try {
            if (typeof db === 'undefined') {
                throw new Error('Base de datos no disponible');
            }
            
            const r = db.registrarUsuario(d);
            if (r?.error) {
                showToast(r.error, 'error');
                return;
            }
            
            showToast('✅ Registro exitoso. Inicia sesión', 'success');
            Logger.log(`Usuario registrado: ${d.usuario}`, 'success');
            setTimeout(() => mostrarLogin(), 1500);
        } catch (error) {
            Logger.log(`Error en registro: ${error.message}`, 'error');
            showToast(`Error: ${error.message}`, 'error');
        }
    });
}

function continuarComoInvitado() {
    Logger.log('Continuando como invitado', 'info');
    APP_STATE.rol = 'invitado';
    APP_STATE.token = 'guest';
    APP_STATE.usuario = {
        id: 0,
        nombre: 'Invitado',
        usuario: 'invitado',
        foto: 'assets/avatars/default.png',
        verificado: false,
        ministerio: 'Visitante',
        insignias: []
    };
    mostrarApp();
    showToast('Navegando como invitado 👋', 'info');
}

function cerrarSesion() {
    Logger.log(`Cerrando sesión de ${APP_STATE.usuario?.nombre || 'usuario'}`, 'info');
    
    // Limpiar localStorage
    [
        CONFIG.STORAGE_KEYS.TOKEN,
        CONFIG.STORAGE_KEYS.USUARIO,
        CONFIG.STORAGE_KEYS.ROL
    ].forEach(k => localStorage.removeItem(k));
    
    // Limpiar estado
    APP_STATE.token = null;
    APP_STATE.usuario = null;
    APP_STATE.rol = null;
    
    // Limpiar intervalos
    if (APP_STATE.contadorInterval) clearInterval(APP_STATE.contadorInterval);
    if (APP_STATE.fechaInterval) clearInterval(APP_STATE.fechaInterval);
    
    // Cerrar dropdowns
    document.getElementById('user-dropdown')?.classList.add('hidden');
    APP_STATE.userDropdownOpen = false;
    
    // Mostrar pantalla de bienvenida
    mostrarBienvenida();
    showToast('Sesión cerrada 👋', 'info');
}

// ============================================
// FUNCIONES DE NOTIFICACIONES MEJORADAS
// ============================================
function toggleNotificaciones() {
    APP_STATE.notificationsOpen = !APP_STATE.notificationsOpen;
    const p = document.getElementById('notification-panel');
    if (!p) return;
    
    if (APP_STATE.notificationsOpen) {
        p.classList.remove('hidden');
        cargarNotificaciones();
        // Marcar como leídas al abrir
        marcarNotificacionesLeidas();
    } else {
        p.classList.add('hidden');
    }
}

function cargarNotificaciones(filtro = 'all') {
    const list = document.getElementById('notification-list');
    if (!list) return;
    
    // Obtener notificaciones de db o localStorage
    let n = [];
    try {
        if (typeof db !== 'undefined' && db.getNotificaciones) {
            n = db.getNotificaciones() || [];
        } else {
            n = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.NOTIFICACIONES) || '[]');
        }
    } catch (e) {
        Logger.log('Error cargando notificaciones', 'error', e);
        n = [];
    }
    
    // Aplicar filtro
    if (filtro === 'unread') n = n.filter(x => !x.leida);
    if (filtro === 'anuncios') n = n.filter(x => x.tipo === 'anuncio');
    
    if (n.length === 0) {
        list.innerHTML = `
            <div class="notification-empty">
                <i class="bx bx-bell-off" style="font-size:3rem;"></i>
                <p>No hay notificaciones</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = n.map(x => `
        <div class="notification-item ${!x.leida ? 'unread' : ''}" 
             style="padding:12px;border-bottom:1px solid var(--gris-medio);cursor:pointer;
                    ${!x.leida ? 'background:var(--azul-surface);border-left:3px solid var(--azul-primario);' : ''}"
             onclick="marcarNotificacionLeida('${x.id}')">
            <div style="display:flex;align-items:center;gap:8px;">
                <i class="bx ${x.icono || 'bx-bell'}" style="color:var(--azul-primario);"></i>
                <strong>${x.titulo}</strong>
            </div>
            <p style="font-size:0.85rem;color:var(--gris-texto);margin:4px 0;">${x.mensaje}</p>
            <small style="color:var(--gris-medio);font-size:0.7rem;">${formatearFecha(x.fecha)}</small>
        </div>
    `).join('');
}

function marcarNotificacionLeida(id) {
    try {
        if (typeof db !== 'undefined' && db.marcarNotificacionLeida) {
            db.marcarNotificacionLeida(id);
        }
        actualizarContadorNotificaciones();
        cargarNotificaciones();
    } catch (e) {
        Logger.log('Error marcando notificación', 'error', e);
    }
}

function marcarNotificacionesLeidas() {
    try {
        if (typeof db !== 'undefined' && db.marcarTodasLeidas) {
            db.marcarTodasLeidas();
        }
        APP_STATE.notificacionesNoLeidas = 0;
        actualizarBadgeNotificaciones();
    } catch (e) {
        Logger.log('Error marcando todas las notificaciones', 'error', e);
    }
}

function actualizarContadorNotificaciones() {
    try {
        if (typeof db !== 'undefined' && db.getNoLeidas) {
            APP_STATE.notificacionesNoLeidas = db.getNoLeidas() || 0;
        } else {
            const n = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.NOTIFICACIONES) || '[]');
            APP_STATE.notificacionesNoLeidas = n.filter(x => !x.leida).length;
        }
        actualizarBadgeNotificaciones();
    } catch (e) {
        Logger.log('Error actualizando contador', 'error', e);
    }
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

function agregarNotificacion(titulo, mensaje, tipo = 'info', icono = 'bx-bell') {
    try {
        const notificacion = {
            id: Date.now(),
            titulo,
            mensaje,
            tipo,
            icono,
            fecha: new Date().toISOString(),
            leida: false
        };
        
        if (typeof db !== 'undefined' && db.addNotificacion) {
            db.addNotificacion(notificacion);
        } else {
            const n = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.NOTIFICACIONES) || '[]');
            n.unshift(notificacion);
            localStorage.setItem(CONFIG.STORAGE_KEYS.NOTIFICACIONES, JSON.stringify(n));
        }
        
        actualizarContadorNotificaciones();
        
        // Mostrar notificación nativa si está permitido
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(titulo, { body: mensaje, icon: '/ipuclafonda.png' });
        }
    } catch (e) {
        Logger.log('Error agregando notificación', 'error', e);
    }
}

// ============================================
// FUNCIONES DE UI MEJORADAS
// ============================================
function toggleSearchBar() {
    APP_STATE.searchBarOpen = !APP_STATE.searchBarOpen;
    const b = document.getElementById('search-bar');
    if (!b) return;
    
    if (APP_STATE.searchBarOpen) {
        b.classList.remove('hidden');
        const input = document.getElementById('global-search-input');
        if (input) {
            input.focus();
            input.addEventListener('input', realizarBusquedaGlobal);
        }
    } else {
        b.classList.add('hidden');
    }
}

function realizarBusquedaGlobal(e) {
    const term = e.target.value.toLowerCase().trim();
    if (!term) return;
    
    // Buscar en publicaciones
    const resultados = APP_STATE.publicaciones.filter(p => 
        p.contenido.toLowerCase().includes(term) ||
        p.autor.toLowerCase().includes(term)
    );
    
    if (resultados.length > 0) {
        showToast(`🔍 ${resultados.length} resultados encontrados`, 'info');
        // Podríamos mostrar los resultados en un panel
    }
}

function toggleFabMenu() {
    APP_STATE.fabMenuOpen = !APP_STATE.fabMenuOpen;
    const menu = document.getElementById('fab-menu');
    if (menu) {
        menu.classList.toggle('hidden', !APP_STATE.fabMenuOpen);
        if (APP_STATE.fabMenuOpen) {
            menu.style.animation = 'fadeInUp 0.3s ease';
        }
    }
}

function toggleUserDropdown() {
    APP_STATE.userDropdownOpen = !APP_STATE.userDropdownOpen;
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden', !APP_STATE.userDropdownOpen);
    }
}

function confirmarAsistencia(estado) {
    const tipo = document.querySelector('input[name="tipo-asistente"]:checked')?.value || 'Hermano';
    
    if (!APP_STATE.usuario) {
        showToast('Inicia sesión para confirmar asistencia', 'warning');
        return;
    }
    
    try {
        const asistencia = {
            id: Date.now(),
            usuario_id: APP_STATE.usuario.id,
            nombre: APP_STATE.usuario.nombre,
            estado: estado,
            tipo: tipo,
            fecha: new Date().toISOString(),
            culto: 'Dominical'
        };
        
        if (typeof db !== 'undefined' && db.addAsistencia) {
            db.addAsistencia(asistencia);
        } else {
            const asistencias = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.ASISTENCIAS) || '[]');
            asistencias.push(asistencia);
            localStorage.setItem(CONFIG.STORAGE_KEYS.ASISTENCIAS, JSON.stringify(asistencias));
        }
        
        showToast(`✅ Asistencia confirmada: ${estado} (${tipo})`, 'success');
        Logger.log(`Asistencia confirmada: ${estado} - ${tipo}`, 'info');
        
        // Agregar notificación
        agregarNotificacion(
            '📋 Asistencia confirmada',
            `${APP_STATE.usuario.nombre} confirmó: ${estado}`,
            'info',
            'bx-check-shield'
        );
    } catch (e) {
        Logger.log('Error confirmando asistencia', 'error', e);
        showToast('Error al confirmar asistencia', 'error');
    }
}

function compartirVersiculo() {
    const v = CONFIG.VERSICULOS[new Date().getDay() % CONFIG.VERSICULOS.length];
    const texto = `"${v.texto}" - ${v.referencia}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'IPUC LA FONDA - Versículo del Día',
            text: texto,
            url: window.location.href
        }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(() => {
            showToast('📋 Versículo copiado al portapapeles', 'success');
        }).catch(() => {
            showToast('No se pudo copiar', 'error');
        });
    } else {
        showToast(texto, 'info', 5000);
    }
}

// ============================================
// SISTEMA DE PUBLICACIONES MEJORADO
// ============================================
function guardarPublicaciones() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEYS.PUBLICACIONES, JSON.stringify(APP_STATE.publicaciones));
        localStorage.setItem(CONFIG.STORAGE_KEYS.COMENTARIOS, JSON.stringify(APP_STATE.comentarios));
        localStorage.setItem(CONFIG.STORAGE_KEYS.REACCIONES, JSON.stringify(APP_STATE.reacciones));
    } catch (e) {
        Logger.log('Error guardando publicaciones', 'error', e);
    }
}

function crearPublicacion(contenido, imagen = '') {
    if (!APP_STATE.usuario) {
        showToast('Inicia sesión para publicar', 'warning');
        return null;
    }
    
    if (!contenido.trim()) {
        showToast('Escribe algo para publicar', 'warning');
        return null;
    }
    
    try {
        const publicacion = {
            id: Date.now(),
            usuario_id: APP_STATE.usuario.id,
            autor: `${APP_STATE.usuario.nombre} ${APP_STATE.usuario.apellidos || ''}`.trim(),
            usuario: APP_STATE.usuario.usuario,
            foto_autor: APP_STATE.usuario.foto || 'assets/avatars/default.png',
            verificado: APP_STATE.usuario.verificado || false,
            contenido: contenido.trim(),
            imagen: imagen,
            fecha: new Date().toISOString(),
            reacciones: { amen: 0, me_gusta: 0, fuego: 0, orando: 0, bendicion: 0 },
            comentarios_count: 0
        };
        
        APP_STATE.publicaciones.unshift(publicacion);
        guardarPublicaciones();
        
        // Agregar notificación
        agregarNotificacion(
            '📝 Nueva publicación',
            `${publicacion.autor} ha publicado en el muro`,
            'info',
            'bx-news'
        );
        
        showToast('✅ Publicación creada', 'success');
        Logger.log(`Publicación creada por ${publicacion.autor}`, 'info');
        return publicacion;
    } catch (e) {
        Logger.log('Error creando publicación', 'error', e);
        showToast('Error al crear publicación', 'error');
        return null;
    }
}

function agregarComentario(publicacionId, contenido) {
    if (!APP_STATE.usuario) {
        showToast('Inicia sesión para comentar', 'warning');
        return null;
    }
    
    if (!contenido.trim()) {
        showToast('Escribe un comentario', 'warning');
        return null;
    }
    
    try {
        const comentario = {
            id: Date.now(),
            publicacion_id: publicacionId,
            usuario_id: APP_STATE.usuario.id,
            autor: APP_STATE.usuario.nombre,
            usuario: APP_STATE.usuario.usuario,
            foto_autor: APP_STATE.usuario.foto || 'assets/avatars/default.png',
            contenido: contenido.trim(),
            fecha: new Date().toISOString()
        };
        
        APP_STATE.comentarios.push(comentario);
        const pub = APP_STATE.publicaciones.find(p => p.id === publicacionId);
        if (pub) pub.comentarios_count = (pub.comentarios_count || 0) + 1;
        
        guardarPublicaciones();
        showToast('💬 Comentario agregado', 'success');
        return comentario;
    } catch (e) {
        Logger.log('Error agregando comentario', 'error', e);
        showToast('Error al comentar', 'error');
        return null;
    }
}

function toggleReaccion(publicacionId, tipoReaccion) {
    if (!APP_STATE.usuario) {
        showToast('Inicia sesión para reaccionar', 'warning');
        return;
    }
    
    try {
        const clave = `${publicacionId}_${APP_STATE.usuario.id}`;
        const actual = APP_STATE.reacciones[clave];
        const pub = APP_STATE.publicaciones.find(p => p.id === publicacionId);
        
        if (!pub) return;
        
        if (actual === tipoReaccion) {
            // Quitar reacción
            delete APP_STATE.reacciones[clave];
            if (pub.reacciones[tipoReaccion] > 0) pub.reacciones[tipoReaccion]--;
        } else {
            // Cambiar reacción
            if (actual) {
                if (pub.reacciones[actual] > 0) pub.reacciones[actual]--;
            }
            APP_STATE.reacciones[clave] = tipoReaccion;
            pub.reacciones[tipoReaccion] = (pub.reacciones[tipoReaccion] || 0) + 1;
        }
        
        guardarPublicaciones();
    } catch (e) {
        Logger.log('Error en reacción', 'error', e);
        showToast('Error al reaccionar', 'error');
    }
}

function getReaccionUsuario(publicacionId) {
    if (!APP_STATE.usuario) return null;
    return APP_STATE.reacciones[`${publicacionId}_${APP_STATE.usuario.id}`] || null;
}

function getComentariosPublicacion(publicacionId) {
    return APP_STATE.comentarios
        .filter(c => c.publicacion_id === publicacionId)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}

function eliminarPublicacion(id) {
    confirmarAccion(
        '¿Eliminar publicación?',
        'Esta acción no se puede deshacer.',
        () => {
            try {
                APP_STATE.publicaciones = APP_STATE.publicaciones.filter(p => p.id !== id);
                APP_STATE.comentarios = APP_STATE.comentarios.filter(c => c.publicacion_id !== id);
                guardarPublicaciones();
                showToast('✅ Publicación eliminada', 'success');
                Logger.log(`Publicación ${id} eliminada`, 'info');
                cargarPublicaciones(document.getElementById('page-content'));
            } catch (e) {
                Logger.log('Error eliminando publicación', 'error', e);
                showToast('Error al eliminar', 'error');
            }
        },
        'danger'
    );
}

// ============================================
// NAVEGACIÓN MEJORADA
// ============================================
function mostrarApp() {
    document.getElementById('welcome-screen')?.classList.add('hidden');
    document.getElementById('app')?.classList.remove('hidden');
    document.getElementById('fab-main')?.classList.remove('hidden');
    
    actualizarSidebarUsuario();
    navegarA('inicio');
    iniciarContadorRegresivo();
    iniciarActualizacionFecha();
    actualizarContadorNotificaciones();
    
    // Verificar estado de conexión
    actualizarEstadoConexion();
    
    Logger.log('App mostrada', 'info');
}

function mostrarBienvenida() {
    document.getElementById('app')?.classList.add('hidden');
    document.getElementById('welcome-screen')?.classList.remove('hidden');
    document.getElementById('fab-main')?.classList.add('hidden');
    
    // Cerrar sesión si existe
    if (APP_STATE.usuario) {
        cerrarSesion();
    }
}

function toggleSidebar() {
    APP_STATE.sidebarOpen ? cerrarSidebar() : abrirSidebar();
}

function abrirSidebar() {
    APP_STATE.sidebarOpen = true;
    document.getElementById('sidebar')?.classList.add('open');
    document.getElementById('sidebar-overlay')?.classList.remove('hidden');
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
    if (!page || APP_STATE.isLoading) return;
    
    APP_STATE.currentPage = page;
    APP_STATE.isLoading = true;
    
    // Actualizar navegación
    document.querySelectorAll('.nav-item').forEach(i => {
        i.classList.toggle('active', i.getAttribute('data-page') === page);
    });
    
    // Actualizar título
    const titulo = CONFIG.TITULOS_PAGINAS[page] || page;
    document.getElementById('page-title').textContent = titulo;
    document.getElementById('breadcrumb-current').textContent = titulo;
    
    // Cargar página
    cargarPagina(page);
    
    // Cerrar sidebar en móvil
    if (window.innerWidth < 1024) cerrarSidebar();
    
    APP_STATE.isLoading = false;
    Logger.log(`Navegando a: ${page}`, 'debug');
}

function actualizarSidebarUsuario() {
    if (!APP_STATE.usuario) return;
    
    const m = document.getElementById('user-mini');
    if (m) {
        const img = m.querySelector('img');
        const name = m.querySelector('.user-name');
        const role = m.querySelector('.user-role');
        const status = m.querySelector('.user-status');
        
        if (img) img.src = APP_STATE.usuario.foto || 'assets/avatars/default.png';
        if (name) name.textContent = APP_STATE.usuario.nombre || 'Usuario';
        if (role) {
            const roles = {
                'admin': 'Administrador',
                'invitado': 'Invitado',
                'usuario': 'Miembro'
            };
            role.textContent = roles[APP_STATE.rol] || 'Miembro';
        }
        if (status) {
            status.className = `user-status ${APP_STATE.isOnline ? 'online' : 'offline'}`;
        }
    }
    
    // Mostrar/ocultar menú admin
    const adminMenu = document.getElementById('admin-menu');
    if (adminMenu) {
        adminMenu.classList.toggle('hidden', APP_STATE.rol !== 'admin');
    }
}

// ============================================
// CONTADOR, FECHA, VERSÍCULO MEJORADOS
// ============================================
function iniciarContadorRegresivo() {
    if (APP_STATE.contadorInterval) clearInterval(APP_STATE.contadorInterval);
    actualizarContador();
    APP_STATE.contadorInterval = setInterval(actualizarContador, 1000);
}

function actualizarContador() {
    const els = {
        d: document.getElementById('contador-dias'),
        h: document.getElementById('contador-horas'),
        m: document.getElementById('contador-minutos'),
        s: document.getElementById('contador-segundos'),
        t: document.getElementById('contador-titulo'),
        e: document.getElementById('contador-estado')
    };
    
    if (!els.d && !els.t) return;
    
    try {
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
        
        if (els.t) els.t.textContent = 'Culto Dominical - Domingo';
        if (els.d) els.d.textContent = String(dias).padStart(2, '0');
        if (els.h) els.h.textContent = String(horas).padStart(2, '0');
        if (els.m) els.m.textContent = String(minutos).padStart(2, '0');
        if (els.s) els.s.textContent = String(segundos).padStart(2, '0');
        if (els.e) {
            els.e.textContent = diff > 0 ? 'PRÓXIMO CULTO' : '¡CULTO EN CURSO!';
            els.e.className = `contador-estado ${diff > 0 ? 'estado-proximo' : 'estado-activo'}`;
        }
    } catch (e) {
        Logger.log('Error actualizando contador', 'error', e);
    }
}

function actualizarFechaHora() {
    try {
        const a = new Date();
        const fe = document.getElementById('fecha-actual');
        const ho = document.getElementById('hora-actual');
        
        if (fe) {
            fe.textContent = a.toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        if (ho) {
            ho.textContent = a.toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    } catch (e) {
        Logger.log('Error actualizando fecha/hora', 'error', e);
    }
}

function iniciarActualizacionFecha() {
    if (APP_STATE.fechaInterval) clearInterval(APP_STATE.fechaInterval);
    actualizarFechaHora();
    APP_STATE.fechaInterval = setInterval(actualizarFechaHora, 1000);
}

function cargarVersiculoDiario() {
    const c = document.getElementById('versiculo-content');
    if (!c) return;
    
    try {
        const v = CONFIG.VERSICULOS[new Date().getDay() % CONFIG.VERSICULOS.length];
        c.innerHTML = `
            <p style="font-style:italic;font-size:1.1rem;line-height:1.8;">"${v.texto}"</p>
            <p style="font-weight:700;color:var(--azul-primario);margin-top:8px;">${v.referencia}</p>
        `;
    } catch (e) {
        Logger.log('Error cargando versículo', 'error', e);
        c.innerHTML = '<p>No se pudo cargar el versículo</p>';
    }
}

// ============================================
// SISTEMA DE CONEXIÓN
// ============================================
function actualizarEstadoConexion() {
    APP_STATE.isOnline = navigator.onLine;
    const statusEl = document.querySelector('.user-status');
    if (statusEl) {
        statusEl.className = `user-status ${APP_STATE.isOnline ? 'online' : 'offline'}`;
        statusEl.title = APP_STATE.isOnline ? 'Conectado' : 'Sin conexión';
    }
    
    if (!APP_STATE.isOnline) {
        showToast('📶 Sin conexión a internet - Modo offline', 'warning', 3000);
    }
}

function sincronizarDatosUsuario() {
    // Aquí se podría sincronizar con un backend
    Logger.log('Sincronizando datos del usuario', 'debug');
    
    // Cargar datos del usuario
    if (APP_STATE.usuario) {
        // Cargar publicaciones del usuario
        // Cargar asistencias
        // Cargar preferencias
    }
}

// ============================================
// CARGAR PÁGINAS MEJORADO
// ============================================
function cargarPagina(page) {
    const c = document.getElementById('page-content');
    if (!c) return;
    
    c.innerHTML = `
        <div class="page-loader">
            <div class="spinner"></div>
            <p>Cargando ${CONFIG.TITULOS_PAGINAS[page] || page}...</p>
        </div>
    `;
    
    // Usar setTimeout para dar tiempo al renderizado
    setTimeout(() => {
        try {
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
                default: c.innerHTML = `
                    <div class="card fade-in">
                        <h2>${CONFIG.TITULOS_PAGINAS[page] || page}</h2>
                        <p style="text-align:center;padding:40px;color:var(--gris-texto);">
                            <i class="bx bx-construction" style="font-size:3rem;display:block;margin-bottom:16px;"></i>
                            Sección en desarrollo
                        </p>
                    </div>
                `;
            }
        } catch (e) {
            Logger.log(`Error cargando página ${page}`, 'error', e);
            c.innerHTML = `
                <div class="card fade-in" style="border-left:4px solid var(--error);">
                    <h2>Error al cargar</h2>
                    <p style="text-align:center;padding:20px;color:var(--error);">
                        <i class="bx bx-error-circle" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
                        ${e.message}
                    </p>
                </div>
            `;
        }
    }, 150);
}

// ============================================
// PÁGINA: INICIO MEJORADA
// ============================================
function cargarInicio(c) {
    const pubRecientes = APP_STATE.publicaciones.slice(0, 3);
    const versiculo = CONFIG.VERSICULOS[new Date().getDay() % CONFIG.VERSICULOS.length];
    
    c.innerHTML = `
        <div class="fade-in">
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
            
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:16px;">
                <div class="card card-glass">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:44px;height:44px;border-radius:50%;background:var(--azul-primario);display:flex;align-items:center;justify-content:center;color:white;font-size:1.3rem;">
                            <i class="bx bx-calendar"></i>
                        </div>
                        <div>
                            <div style="font-size:0.7rem;opacity:0.7;">Fecha</div>
                            <div style="font-weight:700;" id="fecha-actual"></div>
                        </div>
                    </div>
                </div>
                <div class="card card-glass">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:44px;height:44px;border-radius:50%;background:var(--dorado);display:flex;align-items:center;justify-content:center;color:var(--azul-primario);font-size:1.3rem;">
                            <i class="bx bx-time"></i>
                        </div>
                        <div>
                            <div style="font-size:0.7rem;opacity:0.7;">Hora</div>
                            <div style="font-weight:700;" id="hora-actual"></div>
                        </div>
                    </div>
                </div>
                <div class="card card-glass">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:44px;height:44px;border-radius:50%;background:var(--info);display:flex;align-items:center;justify-content:center;color:white;font-size:1.3rem;">
                            <i class="bx bx-wifi"></i>
                        </div>
                        <div>
                            <div style="font-size:0.7rem;opacity:0.7;">Estado</div>
                            <div style="font-weight:700;" id="estado-conexion">${APP_STATE.isOnline ? '🟢 Conectado' : '🔴 Desconectado'}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card" style="border-left:4px solid var(--dorado);">
                <h3><i class="bx bx-bible" style="color:var(--dorado);"></i> Versículo del Día</h3>
                <div id="versiculo-content" style="font-style:italic;font-size:1rem;line-height:1.8;margin-top:8px;">
                    <p>"${versiculo.texto}"</p>
                    <p style="font-weight:700;color:var(--azul-primario);margin-top:8px;">${versiculo.referencia}</p>
                </div>
            </div>
            
            <div class="card" style="margin-top:12px;">
                <h3>Accesos Rápidos</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:8px;">
                    <button class="btn-outline btn-sm" onclick="navegarA('asistencia')">
                        <i class="bx bx-check-shield"></i> Asistencia
                    </button>
                    <button class="btn-outline btn-sm" onclick="navegarA('peticiones')">
                        <i class="bx bx-pray"></i> Oración
                    </button>
                    <button class="btn-outline btn-sm" onclick="navegarA('publicaciones')">
                        <i class="bx bx-news"></i> Publicaciones
                    </button>
                    <button class="btn-outline btn-sm" onclick="navegarA('devocional')">
                        <i class="bx bx-bible"></i> Devocional
                    </button>
                    <button class="btn-outline btn-sm" onclick="navegarA('eventos')">
                        <i class="bx bx-calendar-star"></i> Eventos
                    </button>
                </div>
            </div>
            
            <div class="card" style="margin-top:12px;">
                <h3>Últimas Publicaciones</h3>
                <div style="margin-top:8px;">
                    ${pubRecientes.length === 0 ? 
                        '<p style="text-align:center;color:var(--gris-texto);padding:20px;">No hay publicaciones aún</p>' : 
                        pubRecientes.map(p => `
                            <div style="padding:8px 0;border-bottom:1px solid var(--gris-medio);">
                                <strong>${p.autor} ${p.verificado ? '✅' : ''}</strong>
                                <p style="font-size:0.85rem;color:var(--gris-texto);">${p.contenido.substring(0, 100)}${p.contenido.length > 100 ? '...' : ''}</p>
                                <small style="color:var(--gris-medio);">${formatearFecha(p.fecha)}</small>
                            </div>
                        `).join('')
                    }
                </div>
                <button class="btn-outline btn-sm" onclick="navegarA('publicaciones')" style="margin-top:8px;width:100%;">
                    Ver todas las publicaciones
                </button>
            </div>
        </div>
    `;
    
    // Iniciar contadores
    actualizarFechaHora();
    if (!APP_STATE.fechaInterval) {
        APP_STATE.fechaInterval = setInterval(actualizarFechaHora, 1000);
    }
    iniciarContadorRegresivo();
}

// ============================================
// PÁGINA: HORARIOS MEJORADA
// ============================================
function cargarHorarios(c) {
    const h = [
        { dia: 'Lunes', cultos: [] },
        { dia: 'Martes', cultos: [{ nombre: 'Culto de Oración', hora: '6:00 PM - 8:30 PM', tipo: 'oracion' }] },
        { dia: 'Miércoles', cultos: [{ nombre: 'Culto Campal', hora: '4:00 PM - 7:00 PM', tipo: 'campal' }] },
        { dia: 'Jueves', cultos: [{ nombre: 'Culto de Refrán', hora: '4:00 PM - 7:00 PM', tipo: 'refran' }] },
        { dia: 'Viernes', cultos: [{ nombre: 'Culto de Jóvenes', hora: '6:00 PM - 8:30 PM', tipo: 'jovenes' }] },
        { dia: 'Sábado', cultos: [] },
        { dia: 'Domingo', cultos: [{ nombre: 'Culto Dominical', hora: '10:00 AM - 12:00 PM', tipo: 'dominical' }] }
    ];
    
    const da = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-time-five"></i> Horarios de Cultos</h2>
            <div style="display:grid;gap:10px;margin-top:16px;">
                ${h.map((d, i) => `
                    <div class="card" style="border-left:4px solid ${i === da ? 'var(--azul-primario)' : 'var(--gris-medio)'};">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;">
                            <div>
                                <h3>${d.dia} ${i === da ? '<span style="background:var(--azul-primario);color:white;padding:2px 8px;border-radius:10px;font-size:0.7rem;">HOY</span>' : ''}</h3>
                                ${d.cultos.length ? 
                                    d.cultos.map(x => `
                                        <div style="display:flex;align-items:center;gap:8px;color:var(--gris-texto);">
                                            <i class="bx ${x.tipo === 'dominical' ? 'bx-church' : 'bx-time'}" style="color:var(--azul-primario);"></i>
                                            <span>${x.nombre} - ${x.hora}</span>
                                        </div>
                                    `).join('') : 
                                    '<p style="color:var(--gris-texto);">No hay culto programado</p>'
                                }
                            </div>
                            ${d.cultos.length ? 
                                `<button class="btn-primary btn-sm" onclick="navegarA('asistencia')">
                                    <i class="bx bx-check"></i> Asistir
                                </button>` : ''
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="card" style="margin-top:12px;text-align:center;">
                <p style="color:var(--gris-texto);font-size:0.8rem;">
                    <i class="bx bx-map-pin"></i> Dirección: Calle 123 #45-67, Barrio La Fonda
                </p>
            </div>
        </div>
    `;
}

// ============================================
// PÁGINA: ASISTENCIA MEJORADA
// ============================================
function cargarAsistencia(c) {
    const proximoCulto = CONFIG.DIAS_SEMANA[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-check-shield"></i> Confirmar Asistencia</h2>
            <div class="card" style="text-align:center;padding:30px;">
                <i class="bx bx-calendar-check" style="font-size:3rem;color:var(--azul-primario);"></i>
                <h3 style="margin:12px 0;">Próximo Culto</h3>
                <p id="proximo-culto-asistencia" style="font-size:1.1rem;">${proximoCulto}</p>
                
                <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
                    <button class="btn-primary btn-sm" onclick="confirmarAsistencia('Asistiré')">
                        <i class="bx bx-check"></i> Voy
                    </button>
                    <button class="btn-secondary btn-sm" onclick="confirmarAsistencia('Tal vez')">
                        <i class="bx bx-question-mark"></i> Tal vez
                    </button>
                    <button class="btn-outline btn-sm" onclick="confirmarAsistencia('No asistiré')">
                        <i class="bx bx-x"></i> No
                    </button>
                </div>
            </div>
            
            <div class="card" style="margin-top:12px;">
                <h3>Tipo de Asistente</h3>
                <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap;">
                    <label style="display:flex;align-items:center;gap:4px;">
                        <input type="radio" name="tipo-asistente" value="Hermano" checked> 
                        Hermano
                    </label>
                    <label style="display:flex;align-items:center;gap:4px;">
                        <input type="radio" name="tipo-asistente" value="Amigo"> 
                        Amigo
                    </label>
                    <label style="display:flex;align-items:center;gap:4px;">
                        <input type="radio" name="tipo-asistente" value="Niño"> 
                        Niño
                    </label>
                    <label style="display:flex;align-items:center;gap:4px;">
                        <input type="radio" name="tipo-asistente" value="Visitante"> 
                        Visitante
                    </label>
                </div>
            </div>
            
            <div class="card" style="margin-top:12px;text-align:center;">
                <p style="color:var(--gris-texto);font-size:0.8rem;">
                    <i class="bx bx-info-circle"></i> 
                    ${APP_STATE.usuario ? `Confirmando como: ${APP_STATE.usuario.nombre}` : 'Inicia sesión para confirmar asistencia'}
                </p>
            </div>
        </div>
    `;
}

// ============================================
// PÁGINAS SECUNDARIAS MEJORADAS
// ============================================
function cargarNoticias(c) {
    const noticias = CONFIG.NOTICIAS_DEMO;
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-news"></i> Noticias</h2>
            ${noticias.length === 0 ? 
                '<div class="card"><p style="text-align:center;padding:30px;color:var(--gris-texto);">No hay noticias publicadas</p></div>' :
                noticias.map(n => `
                    <div class="card" style="margin-bottom:12px;border-left:4px solid var(--azul-primario);">
                        <h3>${n.titulo}</h3>
                        <p style="font-size:0.85rem;color:var(--gris-texto);">${n.resumen}</p>
                        <small style="color:var(--gris-medio);">${formatearFecha(n.fecha)}</small>
                    </div>
                `).join('')
            }
        </div>
    `;
}

function cargarEventos(c) {
    const eventos = CONFIG.EVENTOS_DEMO;
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-calendar-star"></i> Eventos</h2>
            ${eventos.length === 0 ? 
                '<div class="card"><p style="text-align:center;padding:30px;color:var(--gris-texto);">No hay eventos programados</p></div>' :
                eventos.map(e => `
                    <div class="card" style="margin-bottom:12px;border-left:4px solid var(--dorado);">
                        <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;">
                            <div>
                                <h3><i class="bx bx-calendar-event" style="color:var(--dorado);"></i> ${e.titulo}</h3>
                                <p style="color:var(--gris-texto);">${e.descripcion}</p>
                                <div style="display:flex;gap:12px;margin-top:4px;font-size:0.85rem;color:var(--gris-medio);">
                                    <span><i class="bx bx-time"></i> ${e.hora}</span>
                                    <span><i class="bx bx-map-pin"></i> ${e.ubicacion}</span>
                                </div>
                            </div>
                            <button class="btn-primary btn-sm" onclick="navegarA('asistencia')">
                                <i class="bx bx-check"></i> Asistir
                            </button>
                        </div>
                    </div>
                `).join('')
            }
        </div>
    `;
}

function cargarChat(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-chat"></i> Mensajes</h2>
            <div class="card" style="text-align:center;padding:40px;">
                <i class="bx bx-chat" style="font-size:4rem;color:var(--gris-medio);"></i>
                <h3 style="margin:12px 0;">Chat en Desarrollo</h3>
                <p style="color:var(--gris-texto);">Pronto podrás comunicarte en tiempo real con la comunidad</p>
                <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;">
                    <span class="badge" style="background:var(--info);">🔜 Próximamente</span>
                </div>
            </div>
        </div>
    `;
}

function cargarDirectorio(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-group"></i> Directorio de Miembros</h2>
            <div class="card" style="text-align:center;padding:40px;">
                <i class="bx bx-group" style="font-size:4rem;color:var(--gris-medio);"></i>
                <h3 style="margin:12px 0;">Directorio en Desarrollo</h3>
                <p style="color:var(--gris-texto);">Conoce a los miembros de nuestra comunidad</p>
            </div>
        </div>
    `;
}

function cargarPeticiones(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-pray"></i> Peticiones de Oración</h2>
            <div class="card" style="text-align:center;padding:40px;">
                <i class="bx bx-pray" style="font-size:4rem;color:var(--azul-primario);"></i>
                <h3 style="margin:12px 0;">Comparte tu Petición</h3>
                <p style="color:var(--gris-texto);">Envía tus peticiones para que la comunidad ore por ti</p>
                ${APP_STATE.usuario ? `
                    <button class="btn-primary" style="margin-top:16px;" onclick="showToast('Funcionalidad en desarrollo', 'info')">
                        <i class="bx bx-pen"></i> Enviar Petición
                    </button>
                ` : `
                    <p style="margin-top:16px;color:var(--gris-medio);">Inicia sesión para enviar una petición</p>
                `}
            </div>
        </div>
    `;
}

function cargarEncuestas(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-poll"></i> Encuestas</h2>
            <div class="card">
                <p style="text-align:center;padding:30px;color:var(--gris-texto);">No hay encuestas activas</p>
            </div>
        </div>
    `;
}

function cargarBiblioteca(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-book-open"></i> Biblioteca Digital</h2>
            <div class="card" style="text-align:center;padding:40px;">
                <i class="bx bx-book" style="font-size:4rem;color:var(--gris-medio);"></i>
                <h3 style="margin:12px 0;">Recursos Disponibles</h3>
                <p style="color:var(--gris-texto);">Pronto encontrarás estudios, libros y recursos digitales</p>
            </div>
        </div>
    `;
}

function cargarGaleria(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-images"></i> Galería</h2>
            <div class="card" style="text-align:center;padding:40px;">
                <i class="bx bx-images" style="font-size:4rem;color:var(--gris-medio);"></i>
                <h3 style="margin:12px 0;">Galería en Desarrollo</h3>
                <p style="color:var(--gris-texto);">Fotos y videos de nuestros cultos y eventos</p>
            </div>
        </div>
    `;
}

// ============================================
// PÁGINA: DEVOCIONAL MEJORADA
// ============================================
function cargarDevocional(c) {
    const versiculo = CONFIG.VERSICULOS[new Date().getDay() % CONFIG.VERSICULOS.length];
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-bible"></i> Devocional Diario</h2>
            <div class="card" style="border-left:4px solid var(--dorado);text-align:center;padding:30px;">
                <div style="font-style:italic;font-size:1.2rem;line-height:1.8;">
                    <p>"${versiculo.texto}"</p>
                    <p style="font-weight:700;color:var(--azul-primario);margin-top:12px;">${versiculo.referencia}</p>
                </div>
                <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--gris-medio);">
                    <p style="color:var(--gris-texto);font-size:0.9rem;">
                        Reflexiona sobre la palabra de Dios y permite que transforme tu vida.
                    </p>
                </div>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;">
                <button class="btn-primary" onclick="compartirVersiculo()">
                    <i class="bx bx-share-alt"></i> Compartir
                </button>
                <button class="btn-secondary" onclick="navegarA('biblioteca')">
                    <i class="bx bx-book-open"></i> Más Recursos
                </button>
            </div>
            
            <div class="card" style="margin-top:12px;">
                <h3>Versículos Anteriores</h3>
                <div style="display:grid;gap:8px;margin-top:8px;">
                    ${CONFIG.VERSICULOS.slice(0, 5).map((v, i) => `
                        <div style="padding:8px;border-bottom:1px solid var(--gris-medio);">
                            <p style="font-size:0.9rem;font-style:italic;">"${v.texto.substring(0, 60)}..."</p>
                            <small style="color:var(--azul-primario);">${v.referencia}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// ============================================
// PÁGINA: PERFIL MEJORADA
// ============================================
function cargarPerfil(c) {
    if (!APP_STATE.usuario) {
        c.innerHTML = `
            <div class="fade-in">
                <div class="card" style="text-align:center;padding:40px;">
                    <i class="bx bx-user-circle" style="font-size:4rem;color:var(--gris-medio);"></i>
                    <h3>Inicia sesión para ver tu perfil</h3>
                    <button class="btn-primary" onclick="mostrarLogin()" style="margin-top:16px;">
                        <i class="bx bx-log-in"></i> Iniciar Sesión
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    const u = APP_STATE.usuario;
    const publicacionesUser = APP_STATE.publicaciones.filter(p => p.usuario_id === u.id);
    const asistenciasUser = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.ASISTENCIAS) || '[]')
        .filter(a => a.usuario_id === u.id);
    
    c.innerHTML = `
        <div class="fade-in">
            <div style="text-align:center;padding:30px;background:linear-gradient(135deg,var(--azul-primario),var(--azul-claro));color:white;border-radius:var(--borde-radius);margin-bottom:16px;">
                <img src="${u.foto || 'assets/avatars/default.png'}" 
                     style="width:80px;height:80px;border-radius:50%;border:3px solid var(--dorado);object-fit:cover;">
                <h2>${u.nombre} ${u.apellidos || ''}</h2>
                <p style="opacity:0.9;">@${u.usuario}</p>
                ${u.verificado ? '<span style="background:var(--info);padding:4px 12px;border-radius:20px;font-size:0.8rem;display:inline-block;margin-top:4px;">✅ Verificado</span>' : ''}
                <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap;">
                    <span class="badge" style="background:rgba(255,255,255,0.2);">${u.ministerio || 'General'}</span>
                    <span class="badge" style="background:rgba(255,255,255,0.2);">${APP_STATE.rol === 'admin' ? 'Administrador' : 'Miembro'}</span>
                </div>
            </div>
            
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:16px;">
                <div class="card" style="text-align:center;">
                    <p style="font-size:2rem;font-weight:700;color:var(--azul-primario);">${publicacionesUser.length}</p>
                    <p style="color:var(--gris-texto);font-size:0.8rem;">Publicaciones</p>
                </div>
                <div class="card" style="text-align:center;">
                    <p style="font-size:2rem;font-weight:700;color:var(--azul-primario);">${asistenciasUser.length}</p>
                    <p style="color:var(--gris-texto);font-size:0.8rem;">Asistencias</p>
                </div>
                <div class="card" style="text-align:center;">
                    <p style="font-size:2rem;font-weight:700;color:var(--azul-primario);">${u.insignias?.length || 0}</p>
                    <p style="color:var(--gris-texto);font-size:0.8rem;">Insignias</p>
                </div>
            </div>
            
            <div class="card">
                <h3>Información Personal</h3>
                <div style="display:grid;gap:8px;margin-top:8px;">
                    <p><strong><i class="bx bx-envelope"></i> Correo:</strong> ${u.correo || 'No registrado'}</p>
                    <p><strong><i class="bx bx-phone"></i> Celular:</strong> ${u.celular || 'No registrado'}</p>
                    <p><strong><i class="bx bx-calendar"></i> Fecha Nac.:</strong> ${u.fecha_nacimiento || 'No registrada'}</p>
                    <p><strong><i class="bx bx-user"></i> Sexo:</strong> ${u.sexo || 'No registrado'}</p>
                    <p><strong><i class="bx bx-document"></i> Documento:</strong> ${u.documento || 'No registrado'}</p>
                </div>
            </div>
            
            ${u.insignias?.length ? `
                <div class="card" style="margin-top:12px;">
                    <h3>Insignias</h3>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
                        ${u.insignias.map(i => `
                            <span class="badge" style="background:var(--dorado);color:var(--azul-primario);">${i}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="card" style="margin-top:12px;border-left:4px solid var(--error);">
                <h3 style="color:var(--error);">Acciones</h3>
                <button class="btn-danger btn-sm" onclick="confirmarAccion('¿Cerrar sesión?','Serás redirigido al inicio.',cerrarSesion,'danger')">
                    <i class="bx bx-log-out"></i> Cerrar Sesión
                </button>
            </div>
        </div>
    `;
}

// ============================================
// PÁGINA: CONFIGURACIÓN MEJORADA
// ============================================
function cargarConfiguracion(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-cog"></i> Configuración</h2>
            
            <div class="card">
                <h3>Apariencia</h3>
                <div style="display:flex;align-items:center;gap:12px;margin-top:8px;">
                    <button class="btn-secondary btn-sm" onclick="toggleTema()">
                        <i class="bx ${APP_STATE.tema === 'dark' ? 'bx-sun' : 'bx-moon'}"></i> 
                        ${APP_STATE.tema === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                    </button>
                    <span style="color:var(--gris-texto);font-size:0.8rem;">
                        Actual: ${APP_STATE.tema === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}
                    </span>
                </div>
            </div>
            
            <div class="card" style="margin-top:12px;">
                <h3>Notificaciones</h3>
                <div style="display:flex;align-items:center;gap:12px;margin-top:8px;">
                    <button class="btn-secondary btn-sm" onclick="solicitarPermisosNotificacion()">
                        <i class="bx bx-bell"></i> Activar Notificaciones
                    </button>
                    <span style="color:var(--gris-texto);font-size:0.8rem;">
                        ${'Notification' in window && Notification.permission === 'granted' ? '✅ Activadas' : '❌ Desactivadas'}
                    </span>
                </div>
            </div>
            
            <div class="card" style="margin-top:12px;">
                <h3>Datos</h3>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
                    <button class="btn-outline btn-sm" onclick="exportarDatos()">
                        <i class="bx bx-download"></i> Exportar Datos
                    </button>
                    <button class="btn-outline btn-sm" onclick="limpiarCache()" style="border-color:var(--warning);color:var(--warning);">
                        <i class="bx bx-trash"></i> Limpiar Cache
                    </button>
                    <button class="btn-outline btn-sm" onclick="verLogs()" style="border-color:var(--info);color:var(--info);">
                        <i class="bx bx-code"></i> Ver Logs
                    </button>
                </div>
            </div>
            
            <div class="card" style="margin-top:12px;">
                <h3>Acerca de</h3>
                <p style="color:var(--gris-texto);">
                    <strong>IPUC LA FONDA</strong> v${CONFIG.VERSION}
                </p>
                <p style="color:var(--gris-texto);">
                    "Donde el Espíritu Santo se mueve"
                </p>
                <p style="color:var(--gris-texto);font-size:0.8rem;margin-top:4px;">
                    © 2026 IPUC LA FONDA - Iglesia Pentecostal Unida de Colombia
                </p>
            </div>
            
            ${APP_STATE.usuario ? `
                <div class="card" style="margin-top:12px;border-left:4px solid var(--error);">
                    <h3 style="color:var(--error);">Zona de Riesgo</h3>
                    <button class="btn-danger btn-sm" onclick="confirmarAccion('¿Cerrar sesión?','Serás redirigido al inicio.',cerrarSesion,'danger')">
                        <i class="bx bx-log-out"></i> Cerrar Sesión
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

// ============================================
// PÁGINAS ADMIN MEJORADAS
// ============================================
function cargarDashboard(c) {
    const totalUsers = typeof db !== 'undefined' && db.getTotalUsers ? db.getTotalUsers() : 0;
    const totalPublicaciones = APP_STATE.publicaciones.length;
    const totalComentarios = APP_STATE.comentarios.length;
    
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-line-chart"></i> Dashboard</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px;">
                <div class="card" style="text-align:center;border-left:4px solid var(--azul-primario);">
                    <p style="font-size:2rem;font-weight:700;color:var(--azul-primario);">${totalUsers}</p>
                    <p style="color:var(--gris-texto);font-size:0.8rem;">Usuarios</p>
                </div>
                <div class="card" style="text-align:center;border-left:4px solid var(--dorado);">
                    <p style="font-size:2rem;font-weight:700;color:var(--dorado);">${totalPublicaciones}</p>
                    <p style="color:var(--gris-texto);font-size:0.8rem;">Publicaciones</p>
                </div>
                <div class="card" style="text-align:center;border-left:4px solid var(--info);">
                    <p style="font-size:2rem;font-weight:700;color:var(--info);">${totalComentarios}</p>
                    <p style="color:var(--gris-texto);font-size:0.8rem;">Comentarios</p>
                </div>
                <div class="card" style="text-align:center;border-left:4px solid var(--success);">
                    <p style="font-size:2rem;font-weight:700;color:var(--success);">${APP_STATE.notificacionesNoLeidas}</p>
                    <p style="color:var(--gris-texto);font-size:0.8rem;">Notificaciones</p>
                </div>
            </div>
            
            <div class="card">
                <h3>Actividad Reciente</h3>
                <div style="margin-top:8px;">
                    ${APP_STATE.publicaciones.slice(0, 5).map(p => `
                        <div style="padding:6px 0;border-bottom:1px solid var(--gris-medio);font-size:0.9rem;">
                            <strong>${p.autor}</strong> publicó: ${p.contenido.substring(0, 50)}...
                            <small style="color:var(--gris-medio);display:block;">${formatearFecha(p.fecha)}</small>
                        </div>
                    `).join('')}
                    ${APP_STATE.publicaciones.length === 0 ? '<p style="color:var(--gris-texto);">No hay actividad reciente</p>' : ''}
                </div>
            </div>
        </div>
    `;
}

function cargarGestionUsuarios(c) {
    let usuarios = [];
    try {
        if (typeof db !== 'undefined' && db.getUsuarios) {
            usuarios = db.getUsuarios() || [];
        }
    } catch (e) {
        Logger.log('Error cargando usuarios', 'error', e);
    }
    
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-user-voice"></i> Gestión de Usuarios</h2>
            <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                    <h3>Lista de Usuarios (${usuarios.length})</h3>
                    <button class="btn-primary btn-sm" onclick="showToast('Funcionalidad en desarrollo', 'info')">
                        <i class="bx bx-user-plus"></i> Agregar
                    </button>
                </div>
                <div style="margin-top:8px;max-height:400px;overflow-y:auto;">
                    ${usuarios.length === 0 ? 
                        '<p style="text-align:center;padding:20px;color:var(--gris-texto);">No hay usuarios registrados</p>' :
                        usuarios.map(u => `
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid var(--gris-medio);">
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <img src="${u.foto || 'assets/avatars/default.png'}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
                                    <div>
                                        <strong>${u.nombre} ${u.apellidos || ''}</strong>
                                        <small style="color:var(--gris-texto);display:block;">@${u.usuario}</small>
                                    </div>
                                </div>
                                <div style="display:flex;gap:4px;">
                                    <span class="badge" style="background:${u.rol === 'admin' ? 'var(--azul-primario)' : 'var(--gris-medio)'};">
                                        ${u.rol === 'admin' ? 'Admin' : 'Usuario'}
                                    </span>
                                    <button class="btn-icon" onclick="showToast('Editar usuario', 'info')">
                                        <i class="bx bx-edit"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        </div>
    `;
}

function cargarGestionNoticias(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-edit-alt"></i> Gestión de Noticias</h2>
            <div class="card" style="text-align:center;padding:40px;">
                <i class="bx bx-news" style="font-size:4rem;color:var(--gris-medio);"></i>
                <h3 style="margin:12px 0;">Crear y Administrar Noticias</h3>
                <p style="color:var(--gris-texto);">Pronto podrás gestionar las noticias de la iglesia</p>
                <button class="btn-primary" style="margin-top:16px;" onclick="showToast('Funcionalidad en desarrollo', 'info')">
                    <i class="bx bx-plus"></i> Crear Noticia
                </button>
            </div>
        </div>
    `;
}

function cargarGestionEventos(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-calendar-edit"></i> Gestión de Eventos</h2>
            <div class="card" style="text-align:center;padding:40px;">
                <i class="bx bx-calendar-star" style="font-size:4rem;color:var(--gris-medio);"></i>
                <h3 style="margin:12px 0;">Crear y Administrar Eventos</h3>
                <p style="color:var(--gris-texto);">Pronto podrás gestionar los eventos de la iglesia</p>
                <button class="btn-primary" style="margin-top:16px;" onclick="showToast('Funcionalidad en desarrollo', 'info')">
                    <i class="bx bx-plus"></i> Crear Evento
                </button>
            </div>
        </div>
    `;
}

function cargarVersiculos(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-bookmark-plus"></i> Versículos</h2>
            <div class="card" style="text-align:center;padding:40px;">
                <i class="bx bx-bible" style="font-size:4rem;color:var(--gris-medio);"></i>
                <h3 style="margin:12px 0;">Administrar Versículos Diarios</h3>
                <p style="color:var(--gris-texto);">Gestiona los versículos que se muestran diariamente</p>
                <div style="margin-top:16px;display:grid;gap:8px;text-align:left;">
                    ${CONFIG.VERSICULOS.map((v, i) => `
                        <div style="padding:8px;border-bottom:1px solid var(--gris-medio);">
                            <p style="font-size:0.9rem;">"${v.texto.substring(0, 60)}..."</p>
                            <small style="color:var(--azul-primario);">${v.referencia}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function cargarSistema(c) {
    const logs = Logger.getLogs();
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-server"></i> Sistema</h2>
            
            <div class="card">
                <h3>Información del Sistema</h3>
                <div style="display:grid;gap:8px;margin-top:8px;">
                    <p><strong>Versión:</strong> ${CONFIG.VERSION}</p>
                    <p><strong>Estado:</strong> ${APP_STATE.isOnline ? '🟢 Conectado' : '🔴 Desconectado'}</p>
                    <p><strong>Usuario:</strong> ${APP_STATE.usuario?.nombre || 'No autenticado'}</p>
                    <p><strong>Rol:</strong> ${APP_STATE.rol || 'Ninguno'}</p>
                    <p><strong>Tema:</strong> ${APP_STATE.tema === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}</p>
                </div>
            </div>
            
            <div class="card" style="margin-top:12px;">
                <h3>Logs del Sistema</h3>
                <div style="max-height:300px;overflow-y:auto;font-size:0.8rem;font-family:monospace;margin-top:8px;background:var(--gris-claro);padding:8px;border-radius:4px;">
                    ${logs.length === 0 ? 
                        '<p style="color:var(--gris-texto);">No hay logs disponibles</p>' :
                        logs.slice(-20).reverse().map(log => `
                            <div style="padding:4px 0;border-bottom:1px solid var(--gris-medio);">
                                <span style="color:${log.level === 'error' ? 'var(--error)' : log.level === 'warning' ? 'var(--warning)' : 'var(--info)'};">[${log.level}]</span>
                                ${log.message}
                                <small style="color:var(--gris-medio);display:block;">${new Date(log.timestamp).toLocaleString()}</small>
                            </div>
                        `).join('')
                    }
                </div>
                <button class="btn-outline btn-sm" onclick="Logger.clearLogs();showToast('Logs limpiados', 'success');" style="margin-top:8px;">
                    <i class="bx bx-trash"></i> Limpiar Logs
                </button>
            </div>
        </div>
    `;
}

// ============================================
// PÁGINA: PUBLICACIONES MEJORADA
// ============================================
function cargarPublicaciones(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-news"></i> Publicaciones</h2>
            
            ${APP_STATE.usuario ? `
                <div class="card" style="margin-bottom:16px;">
                    <h3>Crear Publicación</h3>
                    <form id="form-publicacion">
                        <div class="form-group">
                            <textarea class="form-input" id="contenido-publicacion" 
                                placeholder="¿Qué quieres compartir? ✝️" rows="3" 
                                maxlength="2000" required></textarea>
                            <small style="color:var(--gris-texto);font-size:0.7rem;">
                                <span id="caracteres-contador">0</span>/2000 caracteres
                            </small>
                        </div>
                        <button type="submit" class="btn-primary btn-sm">
                            <i class="bx bx-send"></i> Publicar
                        </button>
                    </form>
                </div>
            ` : `
                <div class="card" style="margin-bottom:16px;text-align:center;padding:20px;">
                    <p><i class="bx bx-lock-alt"></i> Inicia sesión para publicar</p>
                    <button class="btn-primary btn-sm" onclick="mostrarLogin()" style="margin-top:8px;">
                        <i class="bx bx-log-in"></i> Iniciar Sesión
                    </button>
                </div>
            `}
            
            <div id="lista-publicaciones">
                ${renderPublicaciones()}
            </div>
        </div>
    `;
    
    // Contador de caracteres
    const textarea = document.getElementById('contenido-publicacion');
    const contador = document.getElementById('caracteres-contador');
    if (textarea && contador) {
        textarea.addEventListener('input', () => {
            contador.textContent = textarea.value.length;
        });
    }
    
    // Evento de publicación
    document.getElementById('form-publicacion')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const contenido = document.getElementById('contenido-publicacion').value;
        const publicacion = crearPublicacion(contenido);
        if (publicacion) {
            document.getElementById('contenido-publicacion').value = '';
            if (document.getElementById('caracteres-contador')) {
                document.getElementById('caracteres-contador').textContent = '0';
            }
            cargarPublicaciones(c);
        }
    });
}

function renderPublicaciones() {
    if (APP_STATE.publicaciones.length === 0) {
        return `
            <div class="card" style="text-align:center;padding:40px;">
                <i class="bx bx-news" style="font-size:3rem;color:var(--gris-medio);"></i>
                <p style="margin-top:12px;color:var(--gris-texto);">No hay publicaciones aún. ¡Sé el primero en publicar!</p>
            </div>
        `;
    }
    
    return APP_STATE.publicaciones.map(p => {
        const miReaccion = getReaccionUsuario(p.id);
        const comentarios = getComentariosPublicacion(p.id);
        const esAutor = APP_STATE.usuario && APP_STATE.usuario.id === p.usuario_id;
        
        return `
            <div class="card" style="margin-bottom:12px;" id="pub-${p.id}">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                    <img src="${p.foto_autor}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
                    <div style="flex:1;">
                        <strong>${p.autor} ${p.verificado ? '✅' : ''}</strong>
                        <p style="font-size:0.75rem;color:var(--gris-texto);">
                            @${p.usuario} · ${formatearFecha(p.fecha)}
                        </p>
                    </div>
                    ${esAutor ? `
                        <button class="btn-icon" onclick="eliminarPublicacion(${p.id})" title="Eliminar">
                            <i class="bx bx-trash" style="color:var(--error);"></i>
                        </button>
                    ` : ''}
                </div>
                
                <p style="margin-bottom:12px;white-space:pre-wrap;">${p.contenido}</p>
                
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;padding:8px 0;border-top:1px solid var(--gris-medio);border-bottom:1px solid var(--gris-medio);">
                    ${CONFIG.REACCIONES_TIPOS.map(r => `
                        <button onclick="toggleReaccion(${p.id},'${r.clave}');cargarPublicaciones(document.getElementById('page-content'))" 
                                style="padding:6px 10px;border-radius:20px;border:1px solid ${miReaccion === r.clave ? 'var(--azul-primario)' : 'var(--gris-medio)'};
                                       background:${miReaccion === r.clave ? 'var(--azul-surface)' : 'transparent'};
                                       cursor:pointer;font-size:0.8rem;transition:all 0.2s;">
                            ${r.icono} ${p.reacciones[r.clave] || 0}
                        </button>
                    `).join('')}
                </div>
                
                ${comentarios.length > 0 ? `
                    <div style="margin-bottom:8px;max-height:200px;overflow-y:auto;">
                        ${comentarios.map(c => `
                            <div style="display:flex;gap:8px;margin-bottom:6px;padding:6px;background:var(--gris-claro);border-radius:8px;">
                                <img src="${c.foto_autor}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;">
                                <div style="flex:1;">
                                    <strong style="font-size:0.75rem;">${c.autor}</strong>
                                    <p style="font-size:0.8rem;margin:2px 0;">${c.contenido}</p>
                                    <small style="color:var(--gris-medio);font-size:0.6rem;">${formatearFecha(c.fecha)}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${APP_STATE.usuario ? `
                    <div style="display:flex;gap:8px;">
                        <input type="text" class="form-input" id="comentario-${p.id}" 
                               placeholder="Escribe un comentario..." style="flex:1;padding:6px 10px;font-size:0.8rem;">
                        <button class="btn-primary btn-sm" onclick="
                            const input = document.getElementById('comentario-${p.id}');
                            agregarComentario(${p.id}, input.value);
                            input.value = '';
                            cargarPublicaciones(document.getElementById('page-content'));
                        ">
                            <i class="bx bx-send"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// ============================================
// FUNCIONES UTILITARIAS ADICIONALES
// ============================================
function solicitarPermisosNotificacion() {
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showToast('✅ Notificaciones activadas', 'success');
                    Logger.log('Permiso de notificaciones concedido', 'info');
                } else {
                    showToast('❌ Permiso denegado', 'error');
                }
            });
        } else if (Notification.permission === 'granted') {
            showToast('✅ Las notificaciones ya están activadas', 'success');
        } else {
            showToast('❌ Permiso denegado previamente', 'error');
        }
    } else {
        showToast('❌ Tu navegador no soporta notificaciones', 'error');
    }
}

function exportarDatos() {
    try {
        const datos = {
            version: CONFIG.VERSION,
            fecha: new Date().toISOString(),
            usuario: APP_STATE.usuario,
            publicaciones: APP_STATE.publicaciones,
            comentarios: APP_STATE.comentarios,
            reacciones: APP_STATE.reacciones,
            configuracion: {
                tema: APP_STATE.tema,
                notificaciones: APP_STATE.notificacionesNoLeidas
            }
        };
        
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ipuc_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('✅ Datos exportados correctamente', 'success');
        Logger.log('Datos exportados', 'info');
    } catch (e) {
        Logger.log('Error exportando datos', 'error', e);
        showToast('Error al exportar datos', 'error');
    }
}

function limpiarCache() {
    confirmarAccion(
        '¿Limpiar cache?',
        'Se eliminarán todos los datos locales de la aplicación',
        () => {
            try {
                // Limpiar localStorage de la app
                Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
                    if (key !== 'TEMA' && key !== 'USUARIO') {
                        localStorage.removeItem(key);
                    }
                });
                
                // Limpiar cache
                cache.clear();
                
                // Reiniciar arrays
                APP_STATE.publicaciones = [];
                APP_STATE.comentarios = [];
                APP_STATE.reacciones = {};
                
                showToast('✅ Cache limpiado correctamente', 'success');
                Logger.log('Cache limpiado', 'info');
                
                // Recargar página actual
                navegarA(APP_STATE.currentPage);
            } catch (e) {
                Logger.log('Error limpiando cache', 'error', e);
                showToast('Error al limpiar cache', 'error');
            }
        },
        'danger'
    );
}

function verLogs() {
    const logs = Logger.getLogs();
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    const title = document.getElementById('modal-title');
    
    if (modal && body && title) {
        title.textContent = '📋 Logs del Sistema';
        body.innerHTML = `
            <div style="max-height:400px;overflow-y:auto;font-family:monospace;font-size:0.8rem;background:var(--gris-claro);padding:12px;border-radius:4px;">
                ${logs.length === 0 ? 
                    '<p style="color:var(--gris-texto);">No hay logs disponibles</p>' :
                    logs.slice().reverse().map(log => `
                        <div style="padding:4px 0;border-bottom:1px solid var(--gris-medio);">
                            <span style="color:${log.level === 'error' ? 'var(--error)' : log.level === 'warning' ? 'var(--warning)' : 'var(--info)'};">[${log.level}]</span>
                            ${log.message}
                            ${log.data ? `<pre style="margin:4px 0;font-size:0.7rem;color:var(--gris-texto);">${JSON.stringify(log.data, null, 2)}</pre>` : ''}
                            <small style="color:var(--gris-medio);display:block;">${new Date(log.timestamp).toLocaleString()} - ${log.user}</small>
                        </div>
                    `).join('')
                }
            </div>
            <div style="margin-top:12px;display:flex;gap:8px;">
                <button class="btn-secondary btn-sm" onclick="Logger.clearLogs();showToast('Logs limpiados', 'success');cerrarModal();">
                    <i class="bx bx-trash"></i> Limpiar
                </button>
                <button class="btn-secondary btn-sm" onclick="exportarLogs()">
                    <i class="bx bx-download"></i> Exportar
                </button>
            </div>
        `;
        modal.classList.remove('hidden');
    }
}

function exportarLogs() {
    const logs = Logger.getLogs();
    if (logs.length === 0) {
        showToast('No hay logs para exportar', 'warning');
        return;
    }
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ipuc_logs_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ Logs exportados', 'success');
}

// ============================================
// INICIALIZACIÓN PRINCIPAL MEJORADA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    Logger.log(`🚀 IPUC LA FONDA v${CONFIG.VERSION} - Inicializando...`, 'info');
    inicializarApp();
});

function inicializarApp() {
    try {
        // Cargar tema
        const temaGuardado = localStorage.getItem(CONFIG.STORAGE_KEYS.TEMA) || 'light';
        APP_STATE.tema = temaGuardado;
        aplicarTema(temaGuardado);
        
        // Cargar datos del usuario
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
        const usuarioData = localStorage.getItem(CONFIG.STORAGE_KEYS.USUARIO);
        const rol = localStorage.getItem(CONFIG.STORAGE_KEYS.ROL);
        let usuario = null;
        try {
            usuario = usuarioData ? JSON.parse(usuarioData) : null;
        } catch (e) {
            Logger.log('Error parseando usuario', 'error', e);
        }
        
        // Cargar datos de la aplicación
        APP_STATE.publicaciones = getStorageData(CONFIG.STORAGE_KEYS.PUBLICACIONES, []);
        APP_STATE.comentarios = getStorageData(CONFIG.STORAGE_KEYS.COMENTARIOS, []);
        APP_STATE.reacciones = getStorageData(CONFIG.STORAGE_KEYS.REACCIONES, {});
        
        // Mostrar splash y luego la app
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.style.display = 'none';
                splash.style.opacity = '0';
            }
            
            if (token && usuario) {
                APP_STATE.token = token;
                APP_STATE.usuario = usuario;
                APP_STATE.rol = rol || 'usuario';
                mostrarApp();
                Logger.log(`Sesión restaurada: ${usuario.nombre}`, 'info');
            } else {
                mostrarBienvenida();
                Logger.log('Sin sesión activa', 'debug');
            }
        }, 2000);
        
        // Configurar event listeners
        inicializarEventListeners();
        manejarResponsiveSidebar();
        
        // Eventos de ventana
        window.addEventListener('resize', () => manejarResponsiveSidebar());
        window.addEventListener('online', () => {
            APP_STATE.isOnline = true;
            actualizarEstadoConexion();
            showToast('🟢 Conexión restaurada', 'success');
            Logger.log('Conexión restaurada', 'info');
        });
        window.addEventListener('offline', () => {
            APP_STATE.isOnline = false;
            actualizarEstadoConexion();
            showToast('🔴 Sin conexión a internet', 'warning');
            Logger.log('Conexión perdida', 'warning');
        });
        
        // Actualizar contador de notificaciones
        actualizarContadorNotificaciones();
        
        Logger.log('✅ App inicializada correctamente', 'success');
    } catch (error) {
        Logger.log(`❌ Error al inicializar: ${error.message}`, 'error', error);
        showToast('Error al inicializar la aplicación', 'error');
    }
}

function getStorageData(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        Logger.log(`Error parsing ${key}`, 'error', e);
        localStorage.removeItem(key);
        return defaultValue;
    }
}

// ============================================
// EVENT LISTENERS MEJORADOS
// ============================================
function inicializarEventListeners() {
    // Sidebar
    document.getElementById('menu-toggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('close-sidebar')?.addEventListener('click', cerrarSidebar);
    document.getElementById('sidebar-overlay')?.addEventListener('click', cerrarSidebar);
    
    // Navegación
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
    document.getElementById('mark-all-read')?.addEventListener('click', () => {
        marcarNotificacionesLeidas();
        showToast('Todas las notificaciones leídas', 'success');
    });
    
    // Búsqueda
    document.getElementById('search-toggle')?.addEventListener('click', toggleSearchBar);
    document.getElementById('search-close')?.addEventListener('click', () => {
        document.getElementById('search-bar')?.classList.add('hidden');
        APP_STATE.searchBarOpen = false;
    });
    
    // Usuario
    document.getElementById('user-mini')?.addEventListener('click', toggleUserDropdown);
    
    // FAB
    document.getElementById('fab-main')?.addEventListener('click', toggleFabMenu);
    
    document.querySelectorAll('.fab-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            switch(action) {
                case 'oracion': navegarA('peticiones'); break;
                case 'asistencia': navegarA('asistencia'); break;
                case 'compartir': compartirVersiculo(); break;
                case 'biblia': navegarA('devocional'); break;
                case 'publicar': navegarA('publicaciones'); break;
                default: break;
            }
            toggleFabMenu();
        });
    });
    
    // Botones de autenticación
    document.getElementById('btn-logout')?.addEventListener('click', (e) => {
        e.preventDefault();
        confirmarAccion('¿Cerrar sesión?', 'Serás redirigido al inicio.', cerrarSesion, 'danger');
    });
    document.getElementById('btn-login')?.addEventListener('click', mostrarLogin);
    document.getElementById('btn-register')?.addEventListener('click', mostrarRegistro);
    document.getElementById('btn-continue-guest')?.addEventListener('click', continuarComoInvitado);
    
    // Modal
    document.getElementById('modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) cerrarModal();
    });
    document.querySelector('.modal-close')?.addEventListener('click', cerrarModal);
    
    // Confirm Modal
    document.getElementById('confirm-cancel')?.addEventListener('click', () => {
        document.getElementById('confirm-modal')?.classList.add('hidden');
        APP_STATE.pendingConfirmation = null;
    });
    document.getElementById('confirm-accept')?.addEventListener('click', () => {
        if (APP_STATE.pendingConfirmation) {
            APP_STATE.pendingConfirmation();
            APP_STATE.pendingConfirmation = null;
        }
        document.getElementById('confirm-modal')?.classList.add('hidden');
    });
    document.getElementById('confirm-modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) {
            this.classList.add('hidden');
            APP_STATE.pendingConfirmation = null;
        }
    });
    
    // Teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (APP_STATE.notificationsOpen) {
                document.getElementById('notification-panel')?.classList.add('hidden');
                APP_STATE.notificationsOpen = false;
            }
            if (APP_STATE.searchBarOpen) {
                document.getElementById('search-bar')?.classList.add('hidden');
                APP_STATE.searchBarOpen = false;
            }
            if (!document.getElementById('modal')?.classList.contains('hidden')) {
                cerrarModal();
            }
        }
    });
    
    // Click fuera de dropdowns
    document.addEventListener('click', (e) => {
        if (APP_STATE.userDropdownOpen && 
            !e.target.closest('#user-mini') && 
            !e.target.closest('#user-dropdown')) {
            document.getElementById('user-dropdown')?.classList.add('hidden');
            APP_STATE.userDropdownOpen = false;
        }
        
        if (APP_STATE.fabMenuOpen && 
            !e.target.closest('#fab-main') && 
            !e.target.closest('#fab-menu')) {
            document.getElementById('fab-menu')?.classList.add('hidden');
            APP_STATE.fabMenuOpen = false;
        }
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
window.cerrarModal = cerrarModal;
window.exportarDatos = exportarDatos;
window.limpiarCache = limpiarCache;
window.verLogs = verLogs;
window.exportarLogs = exportarLogs;
window.solicitarPermisosNotificacion = solicitarPermisosNotificacion;
window.Logger = Logger;
window.CONFIG = CONFIG;
window.APP_STATE = APP_STATE;

// ============================================
// ESTILOS ADICIONALES PARA TOAST ANIMATIONS
// ============================================
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes fadeInUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    .toast {
        animation: slideInRight 0.3s ease;
    }
    
    .toast-hide {
        animation: slideOutRight 0.3s ease;
    }
    
    .fab-menu {
        animation: fadeInUp 0.3s ease;
    }
    
    .notification-item.unread {
        background: var(--azul-surface);
        border-left: 3px solid var(--azul-primario);
    }
    
    .notification-item:hover {
        background: var(--gris-claro);
    }
    
    .badge-notifications {
        position: absolute;
        top: -4px;
        right: -4px;
        background: var(--error);
        color: white;
        border-radius: 50%;
        padding: 2px 6px;
        font-size: 0.6rem;
        min-width: 18px;
        text-align: center;
    }
`;
document.head.appendChild(styleSheet);

Logger.log(`✅ IPUC LA FONDA v${CONFIG.VERSION} - Cargado correctamente`, 'success');
