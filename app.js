/* ============================================
   IPUC LA FONDA - app.js v18.0 PRO ULTIMATE
   Funciones helper para la aplicacion
   Incluye: Sistema de Reportes completo
   Sistema completo de gestion de datos
   VERSION INTERNACIONAL - 100% OPERATIVA
   Usa la instancia global "db" de database.js
   "Donde el Espiritu Santo se mueve"
   ============================================ */

var VERSION = "18.0";
var MAX_INTENTOS = 5;
var TIEMPO_BLOQUEO = 15;
var DURACION_TOKEN = 24;
var CACHE_TIMEOUT = 300;

var TOKENS = {};
var INTENTOS_FALLIDOS = {};
var BLOQUEOS_TEMPORALES = {};
var CACHE = {};
var CACHE_TIMESTAMP = {};

function logApp(accion, detalle, nivel) {
    detalle = detalle || '';
    nivel = nivel || 'info';
    var entry = {
        timestamp: new Date().toISOString(),
        accion: accion,
        detalle: detalle,
        nivel: nivel,
        version: VERSION
    };
    try {
        var logs = JSON.parse(localStorage.getItem('ipuc18_app_logs') || '[]');
        logs.push(entry);
        if (logs.length > 1000) logs.shift();
        localStorage.setItem('ipuc18_app_logs', JSON.stringify(logs));
    } catch (e) {}
}

function cacheGet(key) {
    if (CACHE[key] && CACHE_TIMESTAMP[key]) {
        var edad = (Date.now() - CACHE_TIMESTAMP[key]) / 1000;
        if (edad < CACHE_TIMEOUT) return CACHE[key];
        delete CACHE[key];
        delete CACHE_TIMESTAMP[key];
    }
    return null;
}

function cacheSet(key, data) {
    CACHE[key] = data;
    CACHE_TIMESTAMP[key] = Date.now();
}

function cacheClear(key) {
    if (key) {
        var keys = Object.keys(CACHE);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].indexOf(key) === 0) {
                delete CACHE[keys[i]];
                delete CACHE_TIMESTAMP[keys[i]];
            }
        }
    } else {
        CACHE = {};
        CACHE_TIMESTAMP = {};
    }
}

function generarToken() {
    return 't18_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function verificarToken(token) {
    if (!token) return null;
    if (TOKENS[token]) {
        var expira = new Date(TOKENS[token].expira);
        if (new Date() < expira) return TOKENS[token];
        delete TOKENS[token];
    }
    return null;
}

function limpiarTokensExpirados() {
    var ahora = new Date();
    var tokensKeys = Object.keys(TOKENS);
    for (var i = 0; i < tokensKeys.length; i++) {
        if (new Date(TOKENS[tokensKeys[i]].expira) < ahora) {
            delete TOKENS[tokensKeys[i]];
        }
    }
}

function verificarIntentosFallidos(usuario) {
    var ahora = Date.now();
    var bloqueo = BLOQUEOS_TEMPORALES[usuario];
    if (bloqueo && ahora < bloqueo) {
        return { bloqueado: true, minutosRestantes: Math.ceil((bloqueo - ahora) / 60000) };
    }
    if (bloqueo) {
        delete BLOQUEOS_TEMPORALES[usuario];
        INTENTOS_FALLIDOS[usuario] = 0;
    }
    return { bloqueado: false };
}

function registrarIntentoFallido(usuario) {
    var ahora = Date.now();
    if (!INTENTOS_FALLIDOS[usuario]) INTENTOS_FALLIDOS[usuario] = 0;
    INTENTOS_FALLIDOS[usuario]++;
    if (INTENTOS_FALLIDOS[usuario] >= MAX_INTENTOS) {
        BLOQUEOS_TEMPORALES[usuario] = ahora + (TIEMPO_BLOQUEO * 60000);
        return { bloqueado: true };
    }
    return { bloqueado: false, intentosRestantes: MAX_INTENTOS - INTENTOS_FALLIDOS[usuario] };
}

function getDB() {
    if (typeof window !== 'undefined' && window.db) return window.db;
    return null;
}

// ============================================
// AUTENTICACION
// ============================================

function login(usuario, password, recordar) {
    recordar = recordar || false;
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        var verificar = verificarIntentosFallidos(usuario);
        if (verificar.bloqueado) {
            return { success: false, error: 'Cuenta bloqueada. Intenta en ' + verificar.minutosRestantes + ' minutos' };
        }

        var resultado = db.login(usuario, password, recordar);
        if (!resultado.success) {
            var intento = registrarIntentoFallido(usuario);
            if (intento.bloqueado) {
                return { success: false, error: 'Cuenta bloqueada por ' + TIEMPO_BLOQUEO + ' minutos' };
            }
            return { success: false, error: resultado.error, intentosRestantes: intento.intentosRestantes || 0 };
        }

        var token = generarToken();
        var expira = new Date(Date.now() + DURACION_TOKEN * 3600000);
        TOKENS[token] = {
            usuario: resultado.usuario,
            rol: resultado.rol,
            expira: expira.toISOString(),
            creado: new Date().toISOString()
        };

        localStorage.setItem('ipuc18_token', token);
        localStorage.setItem('ipuc18_usuario', JSON.stringify(resultado.usuario));
        localStorage.setItem('ipuc18_rol', resultado.rol);

        delete INTENTOS_FALLIDOS[usuario];
        delete BLOQUEOS_TEMPORALES[usuario];

        cacheClear();
        return { success: true, token: token, usuario: resultado.usuario, rol: resultado.rol };
    } catch (error) {
        return { success: false, error: 'Error en el servidor' };
    }
}

function registro(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        if (!datos.nombre || !datos.apellidos || !datos.correo || !datos.usuario || !datos.password) {
            return { success: false, error: 'Campos obligatorios faltantes' };
        }
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(datos.correo)) {
            return { success: false, error: 'Correo invalido' };
        }
        if (datos.password.length < 8) {
            return { success: false, error: 'Contrasena minima 8 caracteres' };
        }

        var resultado = db.registrarUsuario(datos);
        if (resultado.success) cacheClear();
        return resultado;
    } catch (error) {
        return { success: false, error: 'Error en el servidor' };
    }
}

function logout() {
    try {
        var token = localStorage.getItem('ipuc18_token');
        if (token && TOKENS[token]) delete TOKENS[token];
        localStorage.removeItem('ipuc18_token');
        localStorage.removeItem('ipuc18_usuario');
        localStorage.removeItem('ipuc18_rol');
        cacheClear();
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Error al cerrar sesion' };
    }
}

function verificarSesion() {
    try {
        var token = localStorage.getItem('ipuc18_token');
        var usuarioData = localStorage.getItem('ipuc18_usuario');
        var rol = localStorage.getItem('ipuc18_rol');

        if (!token || !usuarioData) return { success: false, message: 'No hay sesion activa' };

        var tokenValido = verificarToken(token);
        if (!tokenValido) {
            localStorage.removeItem('ipuc18_token');
            return { success: false, message: 'Sesion expirada' };
        }

        var usuario = JSON.parse(usuarioData);
        return { success: true, usuario: usuario, rol: rol, token: token };
    } catch (error) {
        return { success: false, message: 'Error al verificar sesion' };
    }
}

function esAdmin() {
    var sesion = verificarSesion();
    return sesion.success && sesion.rol === 'admin';
}

function esUsuario() {
    var sesion = verificarSesion();
    return sesion.success && sesion.rol === 'usuario';
}

function obtenerUsuarioActual() {
    var sesion = verificarSesion();
    return sesion.success ? sesion.usuario : null;
}

function crearPrimerAdmin(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.crearPrimerAdministrador(datos);
    } catch (error) {
        return { success: false, error: 'Error al crear administrador' };
    }
}

function hayAdministrador() {
    try {
        var db = getDB();
        if (!db) return false;
        var admins = db.cargar('administradores');
        return (admins && admins.administradores && admins.administradores.length > 0);
    } catch (e) {
        return false;
    }
}

// ============================================
// USUARIOS
// ============================================

function obtenerUsuarios() {
    try {
        var db = getDB();
        if (!db) return [];
        var u = db.cargar('usuarios');
        return (u && u.usuarios || []).map(function(x) {
            return {
                id: x.id, nombre: x.nombre, apellidos: x.apellidos,
                correo: x.correo, usuario: x.usuario, foto: x.foto,
                ministerio: x.ministerio, verificado: x.verificado, estado: x.estado
            };
        });
    } catch (error) { return []; }
}

function obtenerUsuario(id) {
    try {
        var db = getDB();
        if (!db) return null;
        var u = db.cargar('usuarios');
        return (u && u.usuarios || []).find(function(x) { return x.id === id; }) || null;
    } catch (error) { return null; }
}

// ============================================
// ASISTENCIA
// ============================================

function obtenerAsistencia(uid, filtros) {
    try {
        var db = getDB();
        if (!db) return [];
        var r = db.getAsistencia(filtros || {});
        return uid ? r.filter(function(x) { return x.usuario_id === uid; }) : r;
    } catch (error) { return []; }
}

function registrarAsistencia(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.addAsistencia(datos);
    } catch (error) { return { success: false, error: 'Error al registrar' }; }
}

// ============================================
// CULTOS Y HORARIOS
// ============================================

function obtenerProximoCulto() {
    try {
        var ahora = new Date();
        var cultos = {
            0: [],
            1: [{ inicio: "18:00", fin: "20:30", nombre: "Culto de Oracion" }],
            2: [{ inicio: "16:00", fin: "19:00", nombre: "Culto Campal" }],
            3: [{ inicio: "16:00", fin: "19:00", nombre: "Culto de Refran" }],
            4: [{ inicio: "18:00", fin: "20:30", nombre: "Culto de Jovenes" }],
            5: [],
            6: [{ inicio: "10:00", fin: "12:00", nombre: "Culto Dominical" }]
        };
        var dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

        for (var offset = 0; offset < 8; offset++) {
            var dia = (ahora.getDay() + offset) % 7;
            var cultosDia = cultos[dia] || [];
            for (var i = 0; i < cultosDia.length; i++) {
                var c = cultosDia[i];
                var fecha = new Date(ahora);
                fecha.setDate(fecha.getDate() + offset);
                var hi = parseInt(c.inicio.split(':')[0]);
                var mi = parseInt(c.inicio.split(':')[1]);
                var hf = parseInt(c.fin.split(':')[0]);
                var mf = parseInt(c.fin.split(':')[1]);
                var inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), hi, mi);
                var fin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), hf, mf);
                if (offset === 0 && ahora > fin) continue;
                var estado = offset === 0 && ahora >= inicio ? "en_curso" : "proximo";
                var restante = Math.max(0, Math.floor(((estado === "en_curso" ? fin : inicio) - ahora) / 1000));
                return { nombre: c.nombre, dia: dias[dia], fecha: fecha.toISOString().split('T')[0], inicio: c.inicio, fin: c.fin, estado: estado, segundos_restantes: restante };
            }
        }
        return { mensaje: "No hay cultos", estado: "sin_cultos", segundos_restantes: 0 };
    } catch (error) { return { mensaje: "Error", estado: "error", segundos_restantes: 0 }; }
}

function obtenerHorarios() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getHorarios();
    } catch (error) { return []; }
}

// ============================================
// VERSICULOS
// ============================================

function obtenerVersiculoDiario() {
    try {
        var db = getDB();
        if (!db) return null;
        return db.getVersiculoDiario();
    } catch (error) { return null; }
}

function obtenerVersiculos() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getVersiculos();
    } catch (error) { return []; }
}

// ============================================
// NOTICIAS
// ============================================

function obtenerNoticias(limit) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getNoticias(limit || 50);
    } catch (error) { return []; }
}

function crearNoticia(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.addNoticia(datos);
    } catch (error) { return { success: false, error: 'Error al crear noticia' }; }
}

function eliminarNoticia(id) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.deleteNoticia(id);
    } catch (error) { return { success: false }; }
}

// ============================================
// EVENTOS
// ============================================

function obtenerEventos(filtros) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getEventos(filtros || {});
    } catch (error) { return []; }
}

function obtenerEvento(id) {
    try {
        var db = getDB();
        if (!db) return null;
        return db.getEvento(id);
    } catch (error) { return null; }
}

function crearEvento(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.addEvento(datos);
    } catch (error) { return { success: false, error: 'Error al crear evento' }; }
}

function eliminarEvento(id) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.deleteEvento(id);
    } catch (error) { return { success: false }; }
}

// ============================================
// PETICIONES
// ============================================

function obtenerPeticiones(filtros) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getPeticiones(filtros || {});
    } catch (error) { return []; }
}

function crearPeticion(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.addPeticion(datos);
    } catch (error) { return { success: false, error: 'Error al crear peticion' }; }
}

function orarPeticion(id) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.orarPeticion(id);
    } catch (error) { return { success: false }; }
}

// ============================================
// NOTIFICACIONES
// ============================================

function obtenerNotificaciones(limit) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getNotificaciones(limit || 50);
    } catch (error) { return []; }
}

function obtenerNoLeidas() {
    try {
        var db = getDB();
        if (!db) return 0;
        return db.getNoLeidas();
    } catch (error) { return 0; }
}

// ============================================
// PUBLICACIONES
// ============================================

function obtenerPublicaciones(limit, offset) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getPublicaciones(limit || 100, offset || 0);
    } catch (error) { return []; }
}

function crearPublicacion(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.addPublicacion(datos);
    } catch (error) { return { success: false, error: 'Error al crear publicacion' }; }
}

function eliminarPublicacion(id) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.deletePublicacion(id);
    } catch (error) { return { success: false }; }
}

function getComentariosPublicacion(publicacionId) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getComentarios(publicacionId);
    } catch (error) { return []; }
}

function agregarComentario(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.addComentario(datos);
    } catch (error) { return { success: false, error: 'Error al agregar comentario' }; }
}

function toggleReaccion(publicacionId, usuarioId, tipo) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.toggleReaccion(publicacionId, usuarioId, tipo);
    } catch (error) { return { success: false }; }
}

// ============================================
// ENCUESTAS
// ============================================

function obtenerEncuestas() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getEncuestas();
    } catch (error) { return []; }
}

function crearEncuesta(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.addEncuesta(datos);
    } catch (error) { return { success: false, error: 'Error al crear encuesta' }; }
}

// ============================================
// BIBLIOTECA
// ============================================

function obtenerBiblioteca() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getRecursos();
    } catch (error) { return []; }
}

function agregarRecurso(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.addRecurso(datos);
    } catch (error) { return { success: false, error: 'Error al agregar recurso' }; }
}

// ============================================
// PODCAST
// ============================================

function obtenerPodcast() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getPodcast();
    } catch (error) { return []; }
}

function agregarPodcast(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.addPodcast(datos);
    } catch (error) { return { success: false, error: 'Error al agregar podcast' }; }
}

// ============================================
// GALERIA
// ============================================

function obtenerGaleria() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getAlbumes();
    } catch (error) { return []; }
}

// ============================================
// CHAT
// ============================================

function obtenerMensajes(limit) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getMensajes(limit || 100);
    } catch (error) { return []; }
}

function enviarMensaje(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.addMensaje(datos);
    } catch (error) { return { success: false, error: 'Error al enviar mensaje' }; }
}

// ============================================
// DIRECTORIO
// ============================================

function obtenerDirectorio() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getDirectorio();
    } catch (error) { return []; }
}

// ============================================
// DONACIONES
// ============================================

function obtenerDonaciones() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getDonaciones();
    } catch (error) { return []; }
}

function registrarDonacion(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.addDonacion(datos);
    } catch (error) { return { success: false, error: 'Error al registrar donacion' }; }
}

// ============================================
// REPORTES v18.0
// ============================================

function obtenerReportes(filtros) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getReportes(filtros || {});
    } catch (error) { return []; }
}

function obtenerReporte(id) {
    try {
        var db = getDB();
        if (!db) return null;
        return db.getReporte(id);
    } catch (error) { return null; }
}

function obtenerReportesPendientes() {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getReportesPendientes();
    } catch (error) { return []; }
}

function crearReporte(datos) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.addReporte(datos);
    } catch (error) { return { success: false, error: 'Error al crear reporte' }; }
}

function cambiarEstadoReporte(id, nuevoEstado, usuarioAdmin, comentario) {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.cambiarEstadoReporte(id, nuevoEstado, usuarioAdmin || 'Admin', comentario || '');
    } catch (error) { return { success: false, error: 'Error al cambiar estado' }; }
}

function eliminarReporte(id) {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.deleteReporte(id);
    } catch (error) { return { success: false }; }
}

function obtenerEstadisticasReportes() {
    try {
        var db = getDB();
        if (!db) return {};
        return db.getEstadisticasReportes();
    } catch (error) { return {}; }
}

// ============================================
// ESTADISTICAS Y SISTEMA
// ============================================

function obtenerEstadisticas() {
    try {
        var db = getDB();
        if (!db) return {};
        return db.getEstadisticas();
    } catch (error) { return {}; }
}

function obtenerConfiguracion() {
    try {
        var db = getDB();
        if (!db) return null;
        return db.getConfiguracion();
    } catch (error) { return null; }
}

function obtenerConfiguracionIglesia() {
    try {
        var db = getDB();
        if (!db) return {};
        return db.getConfiguracionIglesia();
    } catch (error) { return {}; }
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
    } catch (error) { return { success: false }; }
}

function limpiarDatos() {
    try {
        var db = getDB();
        if (!db) return { success: false };
        return db.limpiarTodo();
    } catch (error) { return { success: false }; }
}

function obtenerLogs(limit) {
    try {
        var db = getDB();
        if (!db) return [];
        return db.getLogs(limit || 50);
    } catch (error) { return []; }
}

function iniciarApp() {
    try {
        var db = getDB();
        if (!db) return { success: false, error: 'Database no disponible' };
        limpiarTokensExpirados();
        return { success: true, version: VERSION };
    } catch (error) { return { success: false, error: 'Error al iniciar' }; }
}

// ============================================
// EXPORTAR A WINDOW
// ============================================

window.login = login;
window.registro = registro;
window.logout = logout;
window.verificarSesion = verificarSesion;
window.esAdmin = esAdmin;
window.esUsuario = esUsuario;
window.obtenerUsuarioActual = obtenerUsuarioActual;
window.crearPrimerAdmin = crearPrimerAdmin;
window.hayAdministrador = hayAdministrador;

window.obtenerUsuarios = obtenerUsuarios;
window.obtenerUsuario = obtenerUsuario;

window.obtenerAsistencia = obtenerAsistencia;
window.registrarAsistencia = registrarAsistencia;

window.obtenerProximoCulto = obtenerProximoCulto;
window.obtenerHorarios = obtenerHorarios;

window.obtenerVersiculoDiario = obtenerVersiculoDiario;
window.obtenerVersiculos = obtenerVersiculos;

window.obtenerNoticias = obtenerNoticias;
window.crearNoticia = crearNoticia;
window.eliminarNoticia = eliminarNoticia;

window.obtenerEventos = obtenerEventos;
window.obtenerEvento = obtenerEvento;
window.crearEvento = crearEvento;
window.eliminarEvento = eliminarEvento;

window.obtenerPeticiones = obtenerPeticiones;
window.crearPeticion = crearPeticion;
window.orarPeticion = orarPeticion;

window.obtenerNotificaciones = obtenerNotificaciones;
window.obtenerNoLeidas = obtenerNoLeidas;

window.obtenerPublicaciones = obtenerPublicaciones;
window.crearPublicacion = crearPublicacion;
window.eliminarPublicacion = eliminarPublicacion;
window.getComentariosPublicacion = getComentariosPublicacion;
window.agregarComentario = agregarComentario;
window.toggleReaccion = toggleReaccion;

window.obtenerEncuestas = obtenerEncuestas;
window.crearEncuesta = crearEncuesta;

window.obtenerBiblioteca = obtenerBiblioteca;
window.agregarRecurso = agregarRecurso;

window.obtenerPodcast = obtenerPodcast;
window.agregarPodcast = agregarPodcast;

window.obtenerGaleria = obtenerGaleria;

window.obtenerMensajes = obtenerMensajes;
window.enviarMensaje = enviarMensaje;

window.obtenerDirectorio = obtenerDirectorio;

window.obtenerDonaciones = obtenerDonaciones;
window.registrarDonacion = registrarDonacion;

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
window.limpiarDatos = limpiarDatos;
window.obtenerLogs = obtenerLogs;
window.iniciarApp = iniciarApp;

window.logApp = logApp;
window.cacheClear = cacheClear;

iniciarApp();
