/* ============================================
   IPUC LA FONDA - app.js v20.0 PRO ULTIMATE
   Funciones helper para la aplicación
   Incluye: Radio, Streaming, Gamificación, Logros, Asistente
   VERSION CORREGIDA - SIN ERRORES
   ============================================ */

var VERSION = "20.0";
var VERSION_NAME = "PRO ULTIMATE";

function getDB() {
    if (typeof window !== 'undefined' && window.db) return window.db;
    return null;
}

// ============================================
// AUTENTICACIÓN Y USUARIOS
// ============================================

function login(usuario, password) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.login(usuario, password);
    } catch (e) { return { success: false, error: 'Error en el servidor' }; }
}

function registro(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.registrarUsuario(datos);
    } catch (e) { return { success: false, error: 'Error en el servidor' }; }
}

function logout() {
    try {
        localStorage.removeItem('ipuc20_token');
        localStorage.removeItem('ipuc20_usuario');
        localStorage.removeItem('ipuc20_rol');
        return { success: true };
    } catch (e) { return { success: false }; }
}

function verificarSesion() {
    try {
        var token = localStorage.getItem('ipuc20_token');
        var udata = localStorage.getItem('ipuc20_usuario');
        var rol = localStorage.getItem('ipuc20_rol');
        if (!token || !udata) return { success: false };
        return { success: true, usuario: JSON.parse(udata), rol: rol, token: token };
    } catch (e) { return { success: false }; }
}

function esAdmin() {
    var s = verificarSesion();
    return s.success && s.rol === 'admin';
}

function obtenerUsuarioActual() {
    var s = verificarSesion();
    return s.success ? s.usuario : null;
}

function crearPrimerAdmin(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.crearPrimerAdministrador(datos);
    } catch (e) { return { success: false, error: 'Error al crear admin' }; }
}

function hayAdministrador() {
    try {
        var db = getDB();
        if (!db) return false;
        var a = db.cargar('administradores');
        return (a && a.administradores && a.administradores.length > 0);
    } catch (e) { return false; }
}

function obtenerUsuarios() {
    try {
        var db = getDB();
        if (!db) return [];
        var u = db.cargar('usuarios');
        return (u && u.usuarios || []);
    } catch (e) { return []; }
}

function obtenerAdministradores() {
    try {
        var db = getDB();
        if (!db) return [];
        var a = db.cargar('administradores');
        return (a && a.administradores || []);
    } catch (e) { return []; }
}

// ============================================
// ASISTENCIA
// ============================================

function obtenerAsistencia() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getAsistencia();
    } catch (e) { return []; }
}

function registrarAsistencia(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addAsistencia(datos);
    } catch (e) { return { success: false }; }
}

function obtenerProximoCulto() {
    try {
        var ahora = new Date();
        var domingo = new Date(ahora);
        domingo.setDate(ahora.getDate() + ((7 - ahora.getDay()) % 7));
        domingo.setHours(10, 0, 0, 0);
        if (domingo <= ahora) domingo.setDate(domingo.getDate() + 7);
        var diff = Math.max(0, Math.floor((domingo - ahora) / 1000));
        return {
            nombre: 'Culto Dominical',
            dia: 'Domingo',
            fecha: domingo.toISOString().split('T')[0],
            inicio: '10:00',
            fin: '12:00',
            estado: 'proximo',
            segundos_restantes: diff
        };
    } catch (e) { return { mensaje: 'Error', estado: 'error', segundos_restantes: 0 }; }
}

function obtenerHorarios() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getHorarios();
    } catch (e) { return []; }
}

// ============================================
// VERSÍCULOS Y BIBLIA
// ============================================

function obtenerVersiculoDiario() {
    try {
        var db = getDB();
        if (!db) return null;
        return db.getVersiculoDiario();
    } catch (e) { return null; }
}

function obtenerVersiculos() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getVersiculos();
    } catch (e) { return []; }
}

function buscarVersiculos(query) {
    try {
        var versiculos = obtenerVersiculos();
        if (!query || !query.trim()) return versiculos;
        var q = query.trim().toLowerCase();
        return versiculos.filter(function(v) {
            return v.texto.toLowerCase().includes(q) || v.referencia.toLowerCase().includes(q);
        });
    } catch (e) { return []; }
}

// ============================================
// NOTICIAS
// ============================================

function obtenerNoticias(limit) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getNoticias(limit || 50);
    } catch (e) { return []; }
}

function crearNoticia(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addNoticia(datos);
    } catch (e) { return { success: false }; }
}

function eliminarNoticia(id) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.eliminar('noticias', id);
    } catch (e) { return { success: false }; }
}

// ============================================
// EVENTOS
// ============================================

function obtenerEventos() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getEventos();
    } catch (e) { return []; }
}

function obtenerEventosProximos(limit) {
    try {
        var eventos = obtenerEventos();
        var ahora = new Date();
        return eventos.filter(function(e) {
            return new Date(e.fecha) >= ahora;
        }).slice(0, limit || 10);
    } catch (e) { return []; }
}

function crearEvento(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addEvento(datos);
    } catch (e) { return { success: false }; }
}

function eliminarEvento(id) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.eliminarEvento(id);
    } catch (e) { return { success: false }; }
}

// ============================================
// ORACIONES Y PETICIONES
// ============================================

function obtenerOraciones() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getOraciones();
    } catch (e) { return []; }
}

function crearOracion(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addOracion(datos);
    } catch (e) { return { success: false }; }
}

function orarOracion(id) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.orarOracion(id);
    } catch (e) { return { success: false }; }
}

function obtenerPeticiones() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getPeticiones();
    } catch (e) { return []; }
}

function crearPeticion(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addPeticion(datos);
    } catch (e) { return { success: false }; }
}

function orarPeticion(id) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.orarPeticion(id);
    } catch (e) { return { success: false }; }
}

// ============================================
// BENDICIONES Y TESTIMONIOS
// ============================================

function obtenerBendiciones() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getBendiciones();
    } catch (e) { return []; }
}

function crearBendicion(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addBendicion(datos);
    } catch (e) { return { success: false }; }
}

function obtenerTestimonios() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getTestimonios();
    } catch (e) { return []; }
}

// ============================================
// PUBLICACIONES Y COMENTARIOS
// ============================================

function obtenerPublicaciones(limit) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getPublicaciones(limit || 50);
    } catch (e) { return []; }
}

function crearPublicacion(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addPublicacion(datos);
    } catch (e) { return { success: false }; }
}

function getComentariosPublicacion(pubId) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getComentarios(pubId);
    } catch (e) { return []; }
}

function agregarComentario(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addComentario(datos);
    } catch (e) { return { success: false }; }
}

function toggleReaccion(pubId, userId, tipo) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.toggleReaccion(pubId, userId, tipo);
    } catch (e) { return { success: false }; }
}

// ============================================
// CHAT Y MENSAJES
// ============================================

function obtenerMensajes(limit) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getMensajes(limit || 50);
    } catch (e) { return []; }
}

function enviarMensaje(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addMensaje(datos);
    } catch (e) { return { success: false }; }
}

// ============================================
// NOTIFICACIONES
// ============================================

function obtenerNotificaciones(limit) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getNotificaciones(limit || 50);
    } catch (e) { return []; }
}

function obtenerNoLeidas() {
    try {
        var db = getDB();
        if (!db) return 0;
        return db.getNoLeidas();
    } catch (e) { return 0; }
}

function marcarNotificacionesLeidas() {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.marcarLeidas();
    } catch (e) { return { success: false }; }
}

// ============================================
// REPORTES
// ============================================

function obtenerReportes(filtros) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getReportes(filtros || {});
    } catch (e) { return []; }
}

function obtenerReporte(id) {
    try {
        var db = getDB();
        if (!db) return null;
        return db.getReporte(id);
    } catch (e) { return null; }
}

function obtenerReportesPendientes() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getReportesPendientes();
    } catch (e) { return []; }
}

function crearReporte(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addReporte(datos);
    } catch (e) { return { success: false }; }
}

function cambiarEstadoReporte(id, estado, admin, comentario) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.cambiarEstadoReporte(id, estado, admin || 'Admin', comentario || '');
    } catch (e) { return { success: false }; }
}

function eliminarReporte(id) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.deleteReporte(id);
    } catch (e) { return { success: false }; }
}

function obtenerEstadisticasReportes() {
    try {
        var db = getDB();
        if (!db) return {};
        return db.getEstadisticasReportes();
    } catch (e) { return {}; }
}

// ============================================
// RADIO (NUEVO v20)
// ============================================

function obtenerEstacionesRadio() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getEstacionesRadio();
    } catch (e) { return []; }
}

function agregarEstacionRadio(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addEstacionRadio(datos);
    } catch (e) { return { success: false }; }
}

function obtenerHistorialRadio(limit) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getHistorialRadio(limit || 20);
    } catch (e) { return []; }
}

function agregarHistorialRadio(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addHistorialRadio(datos);
    } catch (e) { return { success: false }; }
}

// ============================================
// STREAMING (NUEVO v20)
// ============================================

function obtenerTransmisiones() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getTransmisiones();
    } catch (e) { return []; }
}

function obtenerTransmisionActiva() {
    try {
        var transmisiones = obtenerTransmisiones();
        return transmisiones.find(function(t) {
            return t.estado === 'activa' || t.estado === 'en_vivo';
        }) || null;
    } catch (e) { return null; }
}

function crearTransmision(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addTransmision(datos);
    } catch (e) { return { success: false }; }
}

// ============================================
// GAMIFICACIÓN - LOGROS Y RANKING (NUEVO v20)
// ============================================

function obtenerLogrosUsuario(usuarioId) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getLogrosUsuario(usuarioId);
    } catch (e) { return []; }
}

function desbloquearLogro(usuarioId, logroId, datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.desbloquearLogro(usuarioId, logroId, datos);
    } catch (e) { return { success: false }; }
}

function agregarXP(usuarioId, cantidad) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.agregarXP(usuarioId, cantidad);
    } catch (e) { return { success: false }; }
}

function obtenerRanking(limit) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getRanking(limit || 10);
    } catch (e) { return []; }
}

function agregarPuntajeRanking(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addPuntajeRanking(datos);
    } catch (e) { return { success: false }; }
}

// ============================================
// DIARIO ESPIRITUAL (NUEVO v20)
// ============================================

function obtenerDiarioEspiritual(usuarioId) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getDiarioEspiritual(usuarioId);
    } catch (e) { return []; }
}

function agregarEntradaDiario(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addEntradaDiario(datos);
    } catch (e) { return { success: false }; }
}

// ============================================
// LECTURA BÍBLICA (NUEVO v20)
// ============================================

function obtenerProgresoLectura(usuarioId) {
    try {
        var db = getDB();
        if (!db) return null;
        return db.getProgresoLectura(usuarioId);
    } catch (e) { return null; }
}

function marcarLecturaCompletada(usuarioId, fecha) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.marcarLecturaCompletada(usuarioId, fecha);
    } catch (e) { return { success: false }; }
}

// ============================================
// HIMNARIO Y PLAYLIST (NUEVO v20)
// ============================================

function obtenerCanciones() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getCanciones();
    } catch (e) { return []; }
}

function agregarCancion(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addCancion(datos);
    } catch (e) { return { success: false }; }
}

function obtenerPlaylists() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getPlaylists();
    } catch (e) { return []; }
}

function crearPlaylist(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addPlaylist(datos);
    } catch (e) { return { success: false }; }
}

// ============================================
// ASISTENTE VIRTUAL (NUEVO v20)
// ============================================

function obtenerConversaciones(usuarioId) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getConversaciones(usuarioId);
    } catch (e) { return []; }
}

function guardarConversacion(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addConversacion(datos);
    } catch (e) { return { success: false }; }
}

// ============================================
// JUEGOS Y TRIVIA (NUEVO v20)
// ============================================

function obtenerPreguntasTrivia() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getPreguntasTrivia();
    } catch (e) { return []; }
}

function agregarPreguntaTrivia(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addPreguntaTrivia(datos);
    } catch (e) { return { success: false }; }
}

function obtenerPartidasJuego(usuarioId) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getPartidasJuego(usuarioId);
    } catch (e) { return []; }
}

function guardarPartidaJuego(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addPartidaJuego(datos);
    } catch (e) { return { success: false }; }
}

// ============================================
// QR CODES (NUEVO v20)
// ============================================

function obtenerQRCodes() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getQRCodes();
    } catch (e) { return []; }
}

function generarQRCode(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addQRCode(datos);
    } catch (e) { return { success: false }; }
}

// ============================================
// RECURSOS Y BIBLIOTECA
// ============================================

function obtenerBiblioteca() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getRecursos();
    } catch (e) { return []; }
}

function obtenerPodcast() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getPodcast();
    } catch (e) { return []; }
}

function obtenerEncuestas() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getEncuestas();
    } catch (e) { return []; }
}

// ============================================
// DIRECTORIO Y GRUPOS
// ============================================

function obtenerDirectorio() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getDirectorio();
    } catch (e) { return []; }
}

function obtenerGrupos() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getGrupos();
    } catch (e) { return []; }
}

function obtenerMisiones() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getMisiones();
    } catch (e) { return []; }
}

// ============================================
// DONACIONES
// ============================================

function obtenerDonaciones() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getDonaciones();
    } catch (e) { return []; }
}

function registrarDonacion(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addDonacion(datos);
    } catch (e) { return { success: false }; }
}

// ============================================
// FAVORITOS Y METAS
// ============================================

function obtenerFavoritos(uid) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getFavoritos(uid);
    } catch (e) { return []; }
}

function toggleFavorito(uid, itemId, tipo) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.toggleFavorito(uid, itemId, tipo);
    } catch (e) { return { success: false }; }
}

function obtenerMetas(uid) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getMetas(uid);
    } catch (e) { return []; }
}

function crearMeta(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addMeta(datos);
    } catch (e) { return { success: false }; }
}

// ============================================
// INSIGNIAS
// ============================================

function obtenerInsignias() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getInsignias();
    } catch (e) { return []; }
}

function obtenerInsigniasUsuario(usuarioId) {
    try {
        var insignias = obtenerInsignias();
        // En una implementación real, se filtrarían por usuario
        return insignias;
    } catch (e) { return []; }
}

// ============================================
// ESTADÍSTICAS Y SISTEMA
// ============================================

function obtenerEstadisticas() {
    try {
        var db = getDB();
        if (!db) return {};
        return db.getEstadisticas();
    } catch (e) { return {}; }
}

function obtenerConfiguracion() {
    try {
        var db = getDB();
        if (!db) return null;
        return db.getConfiguracion();
    } catch (e) { return null; }
}

function obtenerConfiguracionIglesia() {
    try {
        var db = getDB();
        if (!db) return {};
        return db.getConfiguracionIglesia();
    } catch (e) { return {}; }
}

function obtenerLogs(limit) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getLogs(limit || 50);
    } catch (e) { return []; }
}

// ============================================
// EXPORTACIÓN E IMPORTACIÓN
// ============================================

function exportarDatos() {
    try {
        var db = getDB();
        if (!db) return { success: false };
        var datos = db.exportarTodo();
        var blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'ipuc_backup_' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return { success: true };
    } catch (e) { return { success: false }; }
}

function importarDatos(archivo) {
    return new Promise(function(resolve) {
        try {
            var db = getDB();
            if (!db) { resolve({ success: false, error: 'Base de datos no disponible' }); return; }
            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    var datos = JSON.parse(e.target.result);
                    resolve(db.importarTodo(datos));
                } catch (err) {
                    resolve({ success: false, error: 'Error al leer el archivo' });
                }
            };
            reader.onerror = function() {
                resolve({ success: false, error: 'Error al leer el archivo' });
            };
            reader.readAsText(archivo);
        } catch (e) {
            resolve({ success: false, error: 'Error al procesar' });
        }
    });
}

function limpiarDatos() {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.limpiarTodo();
    } catch (e) { return { success: false }; }
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function formatearFecha(fecha) {
    try {
        var d = new Date(fecha);
        if (isNaN(d.getTime())) return 'Fecha inválida';
        return d.toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Fecha inválida';
    }
}

function formatearFechaCorta(fecha) {
    try {
        var d = new Date(fecha);
        if (isNaN(d.getTime())) return 'Fecha inválida';
        return d.toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return 'Fecha inválida';
    }
}

function obtenerDiasRestantes(fecha) {
    try {
        var d = new Date(fecha);
        var ahora = new Date();
        var diff = Math.ceil((d - ahora) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    } catch (e) {
        return 0;
    }
}

function generarSlug(texto) {
    if (!texto) return '';
    return texto.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function truncarTexto(texto, longitud) {
    if (!texto) return '';
    if (texto.length <= longitud) return texto;
    return texto.substring(0, longitud) + '...';
}

function esValidoEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function esValidoTelefono(telefono) {
    return /^[0-9+\-\s()]{7,15}$/.test(telefono);
}

// ============================================
// EXPORTAR A WINDOW
// ============================================

// Autenticación
window.login = login;
window.registro = registro;
window.logout = logout;
window.verificarSesion = verificarSesion;
window.esAdmin = esAdmin;
window.obtenerUsuarioActual = obtenerUsuarioActual;
window.crearPrimerAdmin = crearPrimerAdmin;
window.hayAdministrador = hayAdministrador;
window.obtenerUsuarios = obtenerUsuarios;
window.obtenerAdministradores = obtenerAdministradores;

// Asistencia
window.obtenerAsistencia = obtenerAsistencia;
window.registrarAsistencia = registrarAsistencia;
window.obtenerProximoCulto = obtenerProximoCulto;
window.obtenerHorarios = obtenerHorarios;

// Versículos
window.obtenerVersiculoDiario = obtenerVersiculoDiario;
window.obtenerVersiculos = obtenerVersiculos;
window.buscarVersiculos = buscarVersiculos;

// Noticias
window.obtenerNoticias = obtenerNoticias;
window.crearNoticia = crearNoticia;
window.eliminarNoticia = eliminarNoticia;

// Eventos
window.obtenerEventos = obtenerEventos;
window.obtenerEventosProximos = obtenerEventosProximos;
window.crearEvento = crearEvento;
window.eliminarEvento = eliminarEvento;

// Oraciones
window.obtenerOraciones = obtenerOraciones;
window.crearOracion = crearOracion;
window.orarOracion = orarOracion;

// Peticiones
window.obtenerPeticiones = obtenerPeticiones;
window.crearPeticion = crearPeticion;
window.orarPeticion = orarPeticion;

// Bendiciones
window.obtenerBendiciones = obtenerBendiciones;
window.crearBendicion = crearBendicion;
window.obtenerTestimonios = obtenerTestimonios;

// Publicaciones
window.obtenerPublicaciones = obtenerPublicaciones;
window.crearPublicacion = crearPublicacion;
window.getComentariosPublicacion = getComentariosPublicacion;
window.agregarComentario = agregarComentario;
window.toggleReaccion = toggleReaccion;

// Chat
window.obtenerMensajes = obtenerMensajes;
window.enviarMensaje = enviarMensaje;

// Notificaciones
window.obtenerNotificaciones = obtenerNotificaciones;
window.obtenerNoLeidas = obtenerNoLeidas;
window.marcarNotificacionesLeidas = marcarNotificacionesLeidas;

// Reportes
window.obtenerReportes = obtenerReportes;
window.obtenerReporte = obtenerReporte;
window.obtenerReportesPendientes = obtenerReportesPendientes;
window.crearReporte = crearReporte;
window.cambiarEstadoReporte = cambiarEstadoReporte;
window.eliminarReporte = eliminarReporte;
window.obtenerEstadisticasReportes = obtenerEstadisticasReportes;

// Radio (NUEVO v20)
window.obtenerEstacionesRadio = obtenerEstacionesRadio;
window.agregarEstacionRadio = agregarEstacionRadio;
window.obtenerHistorialRadio = obtenerHistorialRadio;
window.agregarHistorialRadio = agregarHistorialRadio;

// Streaming (NUEVO v20)
window.obtenerTransmisiones = obtenerTransmisiones;
window.obtenerTransmisionActiva = obtenerTransmisionActiva;
window.crearTransmision = crearTransmision;

// Gamificación (NUEVO v20)
window.obtenerLogrosUsuario = obtenerLogrosUsuario;
window.desbloquearLogro = desbloquearLogro;
window.agregarXP = agregarXP;
window.obtenerRanking = obtenerRanking;
window.agregarPuntajeRanking = agregarPuntajeRanking;

// Diario Espiritual (NUEVO v20)
window.obtenerDiarioEspiritual = obtenerDiarioEspiritual;
window.agregarEntradaDiario = agregarEntradaDiario;

// Lectura Bíblica (NUEVO v20)
window.obtenerProgresoLectura = obtenerProgresoLectura;
window.marcarLecturaCompletada = marcarLecturaCompletada;

// Himnario y Playlist (NUEVO v20)
window.obtenerCanciones = obtenerCanciones;
window.agregarCancion = agregarCancion;
window.obtenerPlaylists = obtenerPlaylists;
window.crearPlaylist = crearPlaylist;

// Asistente (NUEVO v20)
window.obtenerConversaciones = obtenerConversaciones;
window.guardarConversacion = guardarConversacion;

// Juegos (NUEVO v20)
window.obtenerPreguntasTrivia = obtenerPreguntasTrivia;
window.agregarPreguntaTrivia = agregarPreguntaTrivia;
window.obtenerPartidasJuego = obtenerPartidasJuego;
window.guardarPartidaJuego = guardarPartidaJuego;

// QR Codes (NUEVO v20)
window.obtenerQRCodes = obtenerQRCodes;
window.generarQRCode = generarQRCode;

// Recursos
window.obtenerBiblioteca = obtenerBiblioteca;
window.obtenerPodcast = obtenerPodcast;
window.obtenerEncuestas = obtenerEncuestas;

// Directorio y Grupos
window.obtenerDirectorio = obtenerDirectorio;
window.obtenerGrupos = obtenerGrupos;
window.obtenerMisiones = obtenerMisiones;

// Donaciones
window.obtenerDonaciones = obtenerDonaciones;
window.registrarDonacion = registrarDonacion;

// Favoritos y Metas
window.obtenerFavoritos = obtenerFavoritos;
window.toggleFavorito = toggleFavorito;
window.obtenerMetas = obtenerMetas;
window.crearMeta = crearMeta;

// Insignias
window.obtenerInsignias = obtenerInsignias;
window.obtenerInsigniasUsuario = obtenerInsigniasUsuario;

// Estadísticas y Sistema
window.obtenerEstadisticas = obtenerEstadisticas;
window.obtenerConfiguracion = obtenerConfiguracion;
window.obtenerConfiguracionIglesia = obtenerConfiguracionIglesia;
window.obtenerLogs = obtenerLogs;

// Exportación
window.exportarDatos = exportarDatos;
window.importarDatos = importarDatos;
window.limpiarDatos = limpiarDatos;

// Utilidades
window.formatearFecha = formatearFecha;
window.formatearFechaCorta = formatearFechaCorta;
window.obtenerDiasRestantes = obtenerDiasRestantes;
window.generarSlug = generarSlug;
window.truncarTexto = truncarTexto;
window.esValidoEmail = esValidoEmail;
window.esValidoTelefono = esValidoTelefono;

// Versión
window.VERSION = VERSION;
window.VERSION_NAME = VERSION_NAME;

console.log('✅ IPUC LA FONDA v' + VERSION + ' ' + VERSION_NAME + ' - Helper Functions cargadas');
console.log('📌 ' + Object.keys(window).filter(function(k) {
    return typeof window[k] === 'function' && k.startsWith('obtener');
}).length + ' funciones de consulta disponibles');

/* ============================================
   FINAL DEL APP.JS v20.0 PRO ULTIMATE
   IPUC LA FONDA - International Pentecostal Church
   "Donde el Espíritu Santo se mueve"
   ============================================ */
