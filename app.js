/* ============================================
   IPUC LA FONDA - app.js v18.0 PRO ULTIMATE
   Funciones helper para la aplicacion
   VERSION CORREGIDA - SIN ERRORES
   ============================================ */

var VERSION = "18.0";

function getDB() {
    if (typeof window !== 'undefined' && window.db) return window.db;
    return null;
}

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
        localStorage.removeItem('ipuc18_token');
        localStorage.removeItem('ipuc18_usuario');
        localStorage.removeItem('ipuc18_rol');
        return { success: true };
    } catch (e) { return { success: false }; }
}

function verificarSesion() {
    try {
        var token = localStorage.getItem('ipuc18_token');
        var udata = localStorage.getItem('ipuc18_usuario');
        var rol = localStorage.getItem('ipuc18_rol');
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

function obtenerEventos() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getEventos();
    } catch (e) { return []; }
}

function crearEvento(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.addEvento(datos);
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

function obtenerEncuestas() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getEncuestas();
    } catch (e) { return []; }
}

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

function obtenerDirectorio() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getDirectorio();
    } catch (e) { return []; }
}

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

function obtenerMisiones() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getMisiones();
    } catch (e) { return []; }
}

function obtenerTestimonios() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getTestimonios();
    } catch (e) { return []; }
}

function obtenerGrupos() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getGrupos();
    } catch (e) { return []; }
}

function obtenerInsignias() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getInsignias();
    } catch (e) { return []; }
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
// ESTADISTICAS Y SISTEMA
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

function exportarDatos() {
    try {
        var db = getDB();
        if (!db) return { success: false };
        var datos = db.exportarTodo();
        var blob = new Blob([JSON.stringify(datos)], { type: 'application/json' });
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
            if (!db) { resolve({ success: false }); return; }
            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    var datos = JSON.parse(e.target.result);
                    resolve(db.importarTodo(datos));
                } catch (err) { resolve({ success: false }); }
            };
            reader.onerror = function() { resolve({ success: false }); };
            reader.readAsText(archivo);
        } catch (e) { resolve({ success: false }); }
    });
}

function limpiarDatos() {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.limpiarTodo();
    } catch (e) { return { success: false }; }
}

function obtenerLogs(limit) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getLogs(limit || 50);
    } catch (e) { return []; }
}

// ============================================
// EXPORTAR A WINDOW
// ============================================

window.login = login;
window.registro = registro;
window.logout = logout;
window.verificarSesion = verificarSesion;
window.esAdmin = esAdmin;
window.obtenerUsuarioActual = obtenerUsuarioActual;
window.crearPrimerAdmin = crearPrimerAdmin;
window.hayAdministrador = hayAdministrador;
window.obtenerUsuarios = obtenerUsuarios;
window.obtenerAsistencia = obtenerAsistencia;
window.registrarAsistencia = registrarAsistencia;
window.obtenerProximoCulto = obtenerProximoCulto;
window.obtenerHorarios = obtenerHorarios;
window.obtenerVersiculoDiario = obtenerVersiculoDiario;
window.obtenerVersiculos = obtenerVersiculos;
window.obtenerNoticias = obtenerNoticias;
window.crearNoticia = crearNoticia;
window.obtenerEventos = obtenerEventos;
window.crearEvento = crearEvento;
window.obtenerPeticiones = obtenerPeticiones;
window.crearPeticion = crearPeticion;
window.orarPeticion = orarPeticion;
window.obtenerNotificaciones = obtenerNotificaciones;
window.obtenerNoLeidas = obtenerNoLeidas;
window.obtenerPublicaciones = obtenerPublicaciones;
window.crearPublicacion = crearPublicacion;
window.getComentariosPublicacion = getComentariosPublicacion;
window.agregarComentario = agregarComentario;
window.toggleReaccion = toggleReaccion;
window.obtenerEncuestas = obtenerEncuestas;
window.obtenerBiblioteca = obtenerBiblioteca;
window.obtenerPodcast = obtenerPodcast;
window.obtenerMensajes = obtenerMensajes;
window.enviarMensaje = enviarMensaje;
window.obtenerDirectorio = obtenerDirectorio;
window.obtenerDonaciones = obtenerDonaciones;
window.registrarDonacion = registrarDonacion;
window.obtenerFavoritos = obtenerFavoritos;
window.toggleFavorito = toggleFavorito;
window.obtenerMetas = obtenerMetas;
window.crearMeta = crearMeta;
window.obtenerMisiones = obtenerMisiones;
window.obtenerTestimonios = obtenerTestimonios;
window.obtenerGrupos = obtenerGrupos;
window.obtenerInsignias = obtenerInsignias;

window.obtenerReportes = obtenerReportes;
window.obtenerReporte = obtenerReporte;
window.obtenerReportesPendientes = obtenerReportesPendientes;
window.crearReporte = crearReporte;
window.cambiarEstadoReporte = cambiarEstadoReporte;
window.eliminarReporte = eliminarReporte;
window.obtenerEstadisticasReportes = obtenerEstadisticasReportes;

window.obtenerEstadisticas = obtenerEstadisticas;
window.obtenerConfiguracion = obtenerConfiguracion;
window.obtenerConfiguracionIglesia = obtenerConfiguracionIglesia;
window.exportarDatos = exportarDatos;
window.importarDatos = importarDatos;
window.limpiarDatos = limpiarDatos;
window.obtenerLogs = obtenerLogs;
