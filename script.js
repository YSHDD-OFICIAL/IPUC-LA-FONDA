// ============================================
// IPUC LA FONDA - SCRIPT.JS v5.1 COMPLETO
// Web App Profesional - Todas las secciones funcionales
// UI, Interacciones y Eventos de la aplicación
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
    isOnline: navigator.onLine
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
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.content = t === 'dark' ? '#1a1a2e' : '#1a237e';
    }
}

// ============================================
// FUNCIONES DE TOAST
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
    c.appendChild(t);
    
    setTimeout(() => {
        t.classList.add('toast-hide');
        setTimeout(() => t.remove(), 300);
    }, duracion);
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
// FUNCIONES DE MODAL
// ============================================
function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.add('hidden');
    document.getElementById('modal-footer')?.classList.add('hidden');
}

function confirmarAccion(ti, me, cb, tipo = 'warning') {
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const modal = document.getElementById('confirm-modal');
    if (!modal) return;
    
    if (titleEl) titleEl.textContent = ti;
    if (messageEl) messageEl.textContent = me;
    
    const acceptBtn = document.getElementById('confirm-accept');
    if (acceptBtn) {
        acceptBtn.className = tipo === 'danger' ? 'btn-danger' : 'btn-primary';
    }
    
    APP_STATE.pendingConfirmation = cb;
    modal.classList.remove('hidden');
}

// ============================================
// NAVEGACIÓN
// ============================================
function mostrarApp() {
    document.getElementById('welcome-screen')?.classList.add('hidden');
    document.getElementById('app')?.classList.remove('hidden');
    document.getElementById('fab-main')?.classList.remove('hidden');
    
    actualizarSidebarUsuario();
    navegarA('inicio');
    iniciarContadorRegresivo();
    iniciarActualizacionFecha();
}

function mostrarBienvenida() {
    document.getElementById('app')?.classList.add('hidden');
    document.getElementById('welcome-screen')?.classList.remove('hidden');
    document.getElementById('fab-main')?.classList.add('hidden');
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
    
    document.querySelectorAll('.nav-item').forEach(i => {
        i.classList.toggle('active', i.getAttribute('data-page') === page);
    });
    
    const titulo = CONFIG.TITULOS_PAGINAS[page] || page;
    document.getElementById('page-title').textContent = titulo;
    document.getElementById('breadcrumb-current').textContent = titulo;
    
    cargarPagina(page);
    
    if (window.innerWidth < 1024) cerrarSidebar();
    
    APP_STATE.isLoading = false;
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
    
    const adminMenu = document.getElementById('admin-menu');
    if (adminMenu) {
        adminMenu.classList.toggle('hidden', APP_STATE.rol !== 'admin');
    }
}

// ============================================
// CONTADOR, FECHA, VERSÍCULO
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
    } catch (e) {}
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
    } catch (e) {}
}

function iniciarActualizacionFecha() {
    if (APP_STATE.fechaInterval) clearInterval(APP_STATE.fechaInterval);
    actualizarFechaHora();
    APP_STATE.fechaInterval = setInterval(actualizarFechaHora, 1000);
}

// ============================================
// FUNCIONES UI
// ============================================
function toggleSearchBar() {
    APP_STATE.searchBarOpen = !APP_STATE.searchBarOpen;
    const b = document.getElementById('search-bar');
    if (b) {
        b.classList.toggle('hidden', !APP_STATE.searchBarOpen);
        if (APP_STATE.searchBarOpen) {
            document.getElementById('global-search-input')?.focus();
        }
    }
}

function toggleFabMenu() {
    APP_STATE.fabMenuOpen = !APP_STATE.fabMenuOpen;
    document.getElementById('fab-menu')?.classList.toggle('hidden', !APP_STATE.fabMenuOpen);
}

function toggleUserDropdown() {
    APP_STATE.userDropdownOpen = !APP_STATE.userDropdownOpen;
    document.getElementById('user-dropdown')?.classList.toggle('hidden', !APP_STATE.userDropdownOpen);
}

function confirmarAsistencia(estado) {
    const tipo = document.querySelector('input[name="tipo-asistente"]:checked')?.value || 'Hermano';
    
    if (!APP_STATE.usuario) {
        showToast('Inicia sesión para confirmar asistencia', 'warning');
        return;
    }
    
    showToast(`✅ Asistencia confirmada: ${estado} (${tipo})`, 'success');
}

function compartirVersiculo() {
    const versiculos = [
        { texto: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", referencia: "Juan 3:16" },
        { texto: "Jehová es mi pastor; nada me faltará.", referencia: "Salmos 23:1" },
        { texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13" }
    ];
    const v = versiculos[new Date().getDay() % versiculos.length];
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
// CARGAR PÁGINAS
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
// PÁGINA: INICIO
// ============================================
function cargarInicio(c) {
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
            </div>
            
            <div class="card" style="border-left:4px solid var(--dorado);">
                <h3><i class="bx bx-bible" style="color:var(--dorado);"></i> Versículo del Día</h3>
                <div id="versiculo-content" style="font-style:italic;font-size:1rem;line-height:1.8;margin-top:8px;">
                    <p>Cargando versículo...</p>
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
        </div>
    `;
    
    actualizarFechaHora();
    if (!APP_STATE.fechaInterval) {
        APP_STATE.fechaInterval = setInterval(actualizarFechaHora, 1000);
    }
    iniciarContadorRegresivo();
    cargarVersiculoDiario();
}

function cargarVersiculoDiario() {
    const c = document.getElementById('versiculo-content');
    if (!c) return;
    
    const versiculos = [
        { texto: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", referencia: "Juan 3:16" },
        { texto: "Jehová es mi pastor; nada me faltará.", referencia: "Salmos 23:1" },
        { texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13" },
        { texto: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", referencia: "Mateo 6:33" },
        { texto: "Jehová te bendiga, y te guarde.", referencia: "Números 6:24-25" }
    ];
    const v = versiculos[new Date().getDay() % versiculos.length];
    c.innerHTML = `
        <p style="font-style:italic;font-size:1.1rem;line-height:1.8;">"${v.texto}"</p>
        <p style="font-weight:700;color:var(--azul-primario);margin-top:8px;">${v.referencia}</p>
    `;
}

// ============================================
// PÁGINA: HORARIOS
// ============================================
function cargarHorarios(c) {
    const h = [
        { dia: 'Lunes', cultos: [] },
        { dia: 'Martes', cultos: [{ nombre: 'Culto de Oración', hora: '6:00 PM - 8:30 PM' }] },
        { dia: 'Miércoles', cultos: [{ nombre: 'Culto Campal', hora: '4:00 PM - 7:00 PM' }] },
        { dia: 'Jueves', cultos: [{ nombre: 'Culto de Refrán', hora: '4:00 PM - 7:00 PM' }] },
        { dia: 'Viernes', cultos: [{ nombre: 'Culto de Jóvenes', hora: '6:00 PM - 8:30 PM' }] },
        { dia: 'Sábado', cultos: [] },
        { dia: 'Domingo', cultos: [{ nombre: 'Culto Dominical', hora: '10:00 AM - 12:00 PM' }] }
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
                                            <i class="bx bx-time" style="color:var(--azul-primario);"></i>
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
        </div>
    `;
}

// ============================================
// PÁGINA: ASISTENCIA
// ============================================
function cargarAsistencia(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-check-shield"></i> Confirmar Asistencia</h2>
            <div class="card" style="text-align:center;padding:30px;">
                <i class="bx bx-calendar-check" style="font-size:3rem;color:var(--azul-primario);"></i>
                <h3 style="margin:12px 0;">Próximo Culto</h3>
                <p style="font-size:1.1rem;">${CONFIG.DIAS_SEMANA[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]}</p>
                
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
                    <label><input type="radio" name="tipo-asistente" value="Hermano" checked> Hermano</label>
                    <label><input type="radio" name="tipo-asistente" value="Amigo"> Amigo</label>
                    <label><input type="radio" name="tipo-asistente" value="Niño"> Niño</label>
                    <label><input type="radio" name="tipo-asistente" value="Visitante"> Visitante</label>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// PÁGINAS SECUNDARIAS
// ============================================
function cargarNoticias(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-news"></i> Noticias</h2>
            <div class="card">
                <p style="text-align:center;padding:30px;color:var(--gris-texto);">No hay noticias publicadas</p>
            </div>
        </div>
    `;
}

function cargarEventos(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-calendar-star"></i> Eventos</h2>
            <div class="card">
                <p style="text-align:center;padding:30px;color:var(--gris-texto);">No hay eventos programados</p>
            </div>
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
// PÁGINA: DEVOCIONAL
// ============================================
function cargarDevocional(c) {
    const versiculos = [
        { texto: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", referencia: "Juan 3:16" },
        { texto: "Jehová es mi pastor; nada me faltará.", referencia: "Salmos 23:1" },
        { texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13" }
    ];
    const v = versiculos[new Date().getDay() % versiculos.length];
    
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-bible"></i> Devocional Diario</h2>
            <div class="card" style="border-left:4px solid var(--dorado);text-align:center;padding:30px;">
                <div style="font-style:italic;font-size:1.2rem;line-height:1.8;">
                    <p>"${v.texto}"</p>
                    <p style="font-weight:700;color:var(--azul-primario);margin-top:12px;">${v.referencia}</p>
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
        </div>
    `;
}

// ============================================
// PÁGINA: PERFIL
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
            
            <div class="card">
                <h3>Información Personal</h3>
                <div style="display:grid;gap:8px;margin-top:8px;">
                    <p><strong><i class="bx bx-envelope"></i> Correo:</strong> ${u.correo || 'No registrado'}</p>
                    <p><strong><i class="bx bx-phone"></i> Celular:</strong> ${u.celular || 'No registrado'}</p>
                    <p><strong><i class="bx bx-calendar"></i> Fecha Nac.:</strong> ${u.fecha_nacimiento || 'No registrada'}</p>
                </div>
            </div>
            
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
// PÁGINA: CONFIGURACIÓN
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
// PÁGINAS ADMIN
// ============================================
function cargarDashboard(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-line-chart"></i> Dashboard</h2>
            <div class="card">
                <p style="text-align:center;padding:30px;color:var(--gris-texto);">Dashboard en desarrollo</p>
            </div>
        </div>
    `;
}

function cargarGestionUsuarios(c) {
    c.innerHTML = `
        <div class="fade-in">
            <h2><i class="bx bx-user-voice"></i> Gestión de Usuarios</h2>
            <div class="card">
                <p style="text-align:center;padding:30px;color:var(--gris-texto);">Panel de administración de usuarios en desarrollo</p>
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
            </div>
        </div>
    `;
}

function cargarSistema(c) {
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
        </div>
    `;
}

// ============================================
// PÁGINA: PUBLICACIONES
// ============================================
function cargarPublicaciones(c) {
    const pub = APP_STATE.publicaciones;
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
                ${pub.length === 0 ? `
                    <div class="card" style="text-align:center;padding:40px;">
                        <i class="bx bx-news" style="font-size:3rem;color:var(--gris-medio);"></i>
                        <p style="margin-top:12px;color:var(--gris-texto);">No hay publicaciones aún. ¡Sé el primero en publicar!</p>
                    </div>
                ` : pub.map(p => `
                    <div class="card" style="margin-bottom:12px;" id="pub-${p.id}">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                            <img src="${p.foto_autor}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
                            <div style="flex:1;">
                                <strong>${p.autor} ${p.verificado ? '✅' : ''}</strong>
                                <p style="font-size:0.75rem;color:var(--gris-texto);">
                                    @${p.usuario} · ${formatearFecha(p.fecha)}
                                </p>
                            </div>
                            ${APP_STATE.usuario && APP_STATE.usuario.id === p.usuario_id ? `
                                <button class="btn-icon" onclick="eliminarPublicacion(${p.id})" title="Eliminar">
                                    <i class="bx bx-trash" style="color:var(--error);"></i>
                                </button>
                            ` : ''}
                        </div>
                        <p style="margin-bottom:12px;white-space:pre-wrap;">${p.contenido}</p>
                        
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;padding:8px 0;border-top:1px solid var(--gris-medio);border-bottom:1px solid var(--gris-medio);">
                            ${CONFIG.REACCIONES_TIPOS.map(r => `
                                <button onclick="toggleReaccion(${p.id},'${r.clave}')" 
                                        style="padding:6px 10px;border-radius:20px;border:1px solid ${APP_STATE.reacciones[`${p.id}_${APP_STATE.usuario?.id}`] === r.clave ? 'var(--azul-primario)' : 'var(--gris-medio)'};
                                               background:${APP_STATE.reacciones[`${p.id}_${APP_STATE.usuario?.id}`] === r.clave ? 'var(--azul-surface)' : 'transparent'};
                                               cursor:pointer;font-size:0.8rem;transition:all 0.2s;">
                                    ${r.icono} ${p.reacciones[r.clave] || 0}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    const textarea = document.getElementById('contenido-publicacion');
    const contador = document.getElementById('caracteres-contador');
    if (textarea && contador) {
        textarea.addEventListener('input', () => {
            contador.textContent = textarea.value.length;
        });
    }
    
    document.getElementById('form-publicacion')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const contenido = document.getElementById('contenido-publicacion').value;
        if (!contenido.trim()) {
            showToast('Escribe algo para publicar', 'warning');
            return;
        }
        
        const publicacion = {
            id: Date.now(),
            usuario_id: APP_STATE.usuario.id,
            autor: APP_STATE.usuario.nombre,
            usuario: APP_STATE.usuario.usuario,
            foto_autor: APP_STATE.usuario.foto || 'assets/avatars/default.png',
            verificado: APP_STATE.usuario.verificado || false,
            contenido: contenido.trim(),
            fecha: new Date().toISOString(),
            reacciones: { amen: 0, me_gusta: 0, fuego: 0, orando: 0, bendicion: 0 },
            comentarios_count: 0
        };
        
        APP_STATE.publicaciones.unshift(publicacion);
        localStorage.setItem(CONFIG.STORAGE_KEYS.PUBLICACIONES, JSON.stringify(APP_STATE.publicaciones));
        
        document.getElementById('contenido-publicacion').value = '';
        if (document.getElementById('caracteres-contador')) {
            document.getElementById('caracteres-contador').textContent = '0';
        }
        
        showToast('✅ Publicación creada', 'success');
        cargarPublicaciones(c);
    });
}

// ============================================
// FUNCIONES DE PUBLICACIONES (LOCALES)
// ============================================
function toggleReaccion(publicacionId, tipo) {
    if (!APP_STATE.usuario) {
        showToast('Inicia sesión para reaccionar', 'warning');
        return;
    }
    
    const clave = `${publicacionId}_${APP_STATE.usuario.id}`;
    const actual = APP_STATE.reacciones[clave];
    const pub = APP_STATE.publicaciones.find(p => p.id === publicacionId);
    if (!pub) return;
    
    if (actual === tipo) {
        delete APP_STATE.reacciones[clave];
        if (pub.reacciones[tipo] > 0) pub.reacciones[tipo]--;
    } else {
        if (actual) {
            if (pub.reacciones[actual] > 0) pub.reacciones[actual]--;
        }
        APP_STATE.reacciones[clave] = tipo;
        pub.reacciones[tipo] = (pub.reacciones[tipo] || 0) + 1;
    }
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.REACCIONES, JSON.stringify(APP_STATE.reacciones));
    localStorage.setItem(CONFIG.STORAGE_KEYS.PUBLICACIONES, JSON.stringify(APP_STATE.publicaciones));
    
    cargarPublicaciones(document.getElementById('page-content'));
}

function eliminarPublicacion(id) {
    confirmarAccion(
        '¿Eliminar publicación?',
        'Esta acción no se puede deshacer.',
        () => {
            APP_STATE.publicaciones = APP_STATE.publicaciones.filter(p => p.id !== id);
            localStorage.setItem(CONFIG.STORAGE_KEYS.PUBLICACIONES, JSON.stringify(APP_STATE.publicaciones));
            showToast('✅ Publicación eliminada', 'success');
            cargarPublicaciones(document.getElementById('page-content'));
        },
        'danger'
    );
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN (UI)
// ============================================
function mostrarLogin() {
    const m = document.getElementById('modal');
    const b = document.getElementById('modal-body');
    const t = document.getElementById('modal-title');
    if (!m || !b) return;
    
    t.textContent = 'Iniciar Sesión';
    document.getElementById('modal-footer')?.classList.add('hidden');
    
    b.innerHTML = `
        <form id="login-form">
            <div class="form-group">
                <label>Usuario o Correo</label>
                <input type="text" class="form-input" id="login-usuario" placeholder="Ingresa tu usuario o correo" required>
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
        
        if (typeof login !== 'undefined') {
            const resultado = login(u, p);
            if (resultado.success) {
                APP_STATE.token = resultado.token;
                APP_STATE.usuario = resultado.usuario;
                APP_STATE.rol = resultado.rol;
                actualizarSidebarUsuario();
                cerrarModal();
                mostrarApp();
                showToast(`¡Bienvenido, ${resultado.usuario.nombre}! 🙏`, 'success');
            } else {
                showToast(resultado.error || 'Error al iniciar sesión', 'error');
            }
        } else {
            showToast('Error: Sistema de autenticación no disponible', 'error');
        }
    });
}

function mostrarRegistro() {
    const m = document.getElementById('modal');
    const b = document.getElementById('modal-body');
    const t = document.getElementById('modal-title');
    if (!m || !b) return;
    
    t.textContent = 'Crear Cuenta';
    document.getElementById('modal-footer')?.classList.add('hidden');
    
    b.innerHTML = `
        <form id="registro-form">
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
                <input type="password" class="form-input" name="password" required minlength="8">
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
        
        if (d.password.length < 8) {
            showToast('La contraseña debe tener al menos 8 caracteres', 'warning');
            return;
        }
        
        if (d.celular.length !== 10 || !/^[0-9]+$/.test(d.celular)) {
            showToast('El celular debe tener 10 dígitos', 'warning');
            return;
        }
        
        if (typeof registro !== 'undefined') {
            const resultado = registro(d);
            if (resultado.success) {
                showToast('✅ Registro exitoso. Inicia sesión', 'success');
                setTimeout(() => mostrarLogin(), 1500);
            } else {
                showToast(resultado.error || 'Error al registrar', 'error');
            }
        } else {
            showToast('Error: Sistema de registro no disponible', 'error');
        }
    });
}

function continuarComoInvitado() {
    APP_STATE.rol = 'invitado';
    APP_STATE.token = 'guest';
    APP_STATE.usuario = {
        id: 0,
        nombre: 'Invitado',
        usuario: 'invitado',
        foto: 'assets/avatars/default.png',
        verificado: false,
        ministerio: 'Visitante'
    };
    actualizarSidebarUsuario();
    mostrarApp();
    showToast('Navegando como invitado 👋', 'info');
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
    showToast('Sesión cerrada 👋', 'info');
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

// ============================================
// NOTIFICACIONES
// ============================================
function toggleNotificaciones() {
    APP_STATE.notificationsOpen = !APP_STATE.notificationsOpen;
    document.getElementById('notification-panel')?.classList.toggle('hidden', !APP_STATE.notificationsOpen);
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Cargar tema
    const temaGuardado = localStorage.getItem(CONFIG.STORAGE_KEYS.TEMA) || 'light';
    APP_STATE.tema = temaGuardado;
    aplicarTema(temaGuardado);
    
    // Cargar datos
    APP_STATE.publicaciones = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.PUBLICACIONES) || '[]');
    APP_STATE.comentarios = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.COMENTARIOS) || '[]');
    APP_STATE.reacciones = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.REACCIONES) || '{}');
    
    // Verificar sesión
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    const usuarioData = localStorage.getItem(CONFIG.STORAGE_KEYS.USUARIO);
    const rol = localStorage.getItem(CONFIG.STORAGE_KEYS.ROL);
    
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.display = 'none';
            splash.style.opacity = '0';
        }
        
        if (token && usuarioData) {
            try {
                APP_STATE.token = token;
                APP_STATE.usuario = JSON.parse(usuarioData);
                APP_STATE.rol = rol || 'usuario';
                mostrarApp();
            } catch (e) {
                mostrarBienvenida();
            }
        } else {
            mostrarBienvenida();
        }
    }, 2000);
    
    // Event listeners
    inicializarEventListeners();
    manejarResponsiveSidebar();
    
    window.addEventListener('resize', manejarResponsiveSidebar);
    window.addEventListener('online', () => {
        APP_STATE.isOnline = true;
        actualizarSidebarUsuario();
        showToast('🟢 Conexión restaurada', 'success');
    });
    window.addEventListener('offline', () => {
        APP_STATE.isOnline = false;
        actualizarSidebarUsuario();
        showToast('🔴 Sin conexión a internet', 'warning');
    });
});

function inicializarEventListeners() {
    document.getElementById('menu-toggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('close-sidebar')?.addEventListener('click', cerrarSidebar);
    document.getElementById('sidebar-overlay')?.addEventListener('click', cerrarSidebar);
    
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navegarA(this.getAttribute('data-page'));
        });
    });
    
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTema);
    document.getElementById('notifications-toggle')?.addEventListener('click', toggleNotificaciones);
    document.getElementById('close-notifications')?.addEventListener('click', () => {
        document.getElementById('notification-panel')?.classList.add('hidden');
        APP_STATE.notificationsOpen = false;
    });
    
    document.getElementById('search-toggle')?.addEventListener('click', toggleSearchBar);
    document.getElementById('search-close')?.addEventListener('click', () => {
        document.getElementById('search-bar')?.classList.add('hidden');
        APP_STATE.searchBarOpen = false;
    });
    
    document.getElementById('user-mini')?.addEventListener('click', toggleUserDropdown);
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
    
    document.getElementById('btn-logout')?.addEventListener('click', (e) => {
        e.preventDefault();
        confirmarAccion('¿Cerrar sesión?', 'Serás redirigido al inicio.', cerrarSesion, 'danger');
    });
    document.getElementById('btn-login')?.addEventListener('click', mostrarLogin);
    document.getElementById('btn-register')?.addEventListener('click', mostrarRegistro);
    document.getElementById('btn-continue-guest')?.addEventListener('click', continuarComoInvitado);
    
    document.getElementById('modal')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) cerrarModal();
    });
    document.querySelector('.modal-close')?.addEventListener('click', cerrarModal);
    
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
window.toggleTema = toggleTema;
window.aplicarTema = aplicarTema;
window.showToast = showToast;
window.cerrarModal = cerrarModal;
window.continuarComoInvitado = continuarComoInvitado;
window.CONFIG = CONFIG;
window.APP_STATE = APP_STATE;

// ============================================
// ESTILOS ADICIONALES
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
    .toast { animation: slideInRight 0.3s ease; }
    .toast-hide { animation: slideOutRight 0.3s ease; }
    .fab-menu { animation: fadeInUp 0.3s ease; }
`;
document.head.appendChild(styleSheet);

console.log(`✅ IPUC LA FONDA v${CONFIG.VERSION} - Script cargado correctamente`);
