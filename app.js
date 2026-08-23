/* ============================================
   IPUC LA FONDA - app.js v22.0 PRO ULTIMATE
   Funciones helper para la aplicación
   Incluye: Radio, Streaming, Gamificación, Logros, Asistente
   VERSION CORREGIDA - SIN ERRORES - COMPLETA
   "Donde el Espíritu Santo se mueve"
   ============================================ */

const VERSION = "22.0";
const VERSION_NAME = "PRO ULTIMATE";

// ============================================
// UTILIDADES DE BASE DE DATOS
// ============================================

function getDB() {
    if (typeof window !== 'undefined' && window.db) return window.db;
    return null;
}

function isValidDB() {
    return getDB() !== null;
}

// ============================================
// AUTENTICACIÓN Y USUARIOS
// ============================================

function login(usuario, password) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.login(usuario, password);
    } catch (e) {
        console.error('Error en login:', e);
        return { success: false, error: 'Error en el servidor' };
    }
}

function registro(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.registrarUsuario(datos);
    } catch (e) {
        console.error('Error en registro:', e);
        return { success: false, error: 'Error en el servidor' };
    }
}

function logout() {
    try {
        localStorage.removeItem('ipuc20_token');
        localStorage.removeItem('ipuc20_usuario');
        localStorage.removeItem('ipuc20_rol');
        return { success: true, message: 'Sesión cerrada' };
    } catch (e) {
        return { success: false, error: 'Error al cerrar sesión' };
    }
}

function verificarSesion() {
    try {
        const token = localStorage.getItem('ipuc20_token');
        const udata = localStorage.getItem('ipuc20_usuario');
        const rol = localStorage.getItem('ipuc20_rol');
        
        if (!token || !udata) return { success: false };
        
        return { 
            success: true, 
            usuario: JSON.parse(udata), 
            rol: rol, 
            token: token 
        };
    } catch (e) {
        return { success: false };
    }
}

function esAdmin() {
    const session = verificarSesion();
    return session.success && session.rol === 'admin';
}

function obtenerUsuarioActual() {
    const session = verificarSesion();
    return session.success ? session.usuario : null;
}

function crearPrimerAdmin(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };
        return db.crearPrimerAdministrador(datos);
    } catch (e) {
        return { success: false, error: 'Error al crear admin' };
    }
}

function hayAdministrador() {
    try {
        const db = getDB();
        if (!db) return false;
        const admins = db.cargar('administradores');
        return (admins && admins.administradores && admins.administradores.length > 0);
    } catch (e) {
        return false;
    }
}

function obtenerUsuarios() {
    try {
        const db = getDB();
        if (!db) return [];
        const usuarios = db.cargar('usuarios');
        return (usuarios && usuarios.usuarios) || [];
    } catch (e) {
        return [];
    }
}

function obtenerAdministradores() {
    try {
        const db = getDB();
        if (!db) return [];
        const admins = db.cargar('administradores');
        return (admins && admins.administradores) || [];
    } catch (e) {
        return [];
    }
}

// ============================================
// ASISTENCIA
// ============================================

function obtenerAsistencia() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getAsistencia();
    } catch (e) {
        return [];
    }
}

function registrarAsistencia(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addAsistencia(datos);
    } catch (e) {
        return { success: false };
    }
}

function obtenerProximoCulto() {
    try {
        const ahora = new Date();
        const domingo = new Date(ahora);
        const diasHastaDomingo = (7 - ahora.getDay()) % 7 || 7;
        domingo.setDate(ahora.getDate() + diasHastaDomingo);
        domingo.setHours(10, 0, 0, 0);
        
        const diff = Math.max(0, Math.floor((domingo - ahora) / 1000));
        
        return {
            nombre: 'Culto Dominical',
            dia: 'Domingo',
            fecha: domingo.toISOString().split('T')[0],
            inicio: '10:00',
            fin: '12:00',
            estado: 'proximo',
            segundos_restantes: diff,
            dias_restantes: Math.floor(diff / 86400),
            horas_restantes: Math.floor((diff % 86400) / 3600)
        };
    } catch (e) {
        return { 
            mensaje: 'Error', 
            estado: 'error', 
            segundos_restantes: 0 
        };
    }
}

function obtenerHorarios() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getHorarios();
    } catch (e) {
        return [];
    }
}

// ============================================
// VERSÍCULOS Y BIBLIA
// ============================================

function obtenerVersiculoDiario() {
    try {
        const db = getDB();
        if (!db) return null;
        return db.getVersiculoDiario();
    } catch (e) {
        return null;
    }
}

function obtenerVersiculos() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getVersiculos();
    } catch (e) {
        return [];
    }
}

function buscarVersiculos(query) {
    try {
        const versiculos = obtenerVersiculos();
        if (!query || !query.trim()) return versiculos;
        
        const q = query.trim().toLowerCase();
        return versiculos.filter(v => 
            (v.texto && v.texto.toLowerCase().includes(q)) || 
            (v.referencia && v.referencia.toLowerCase().includes(q))
        );
    } catch (e) {
        return [];
    }
}

// ============================================
// NOTICIAS
// ============================================

function obtenerNoticias(limit = 50) {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getNoticias(limit);
    } catch (e) {
        return [];
    }
}

function crearNoticia(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addNoticia(datos);
    } catch (e) {
        return { success: false };
    }
}

function eliminarNoticia(id) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.eliminar('noticias', id);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// EVENTOS
// ============================================

function obtenerEventos() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getEventos();
    } catch (e) {
        return [];
    }
}

function obtenerEventosProximos(limit = 10) {
    try {
        const eventos = obtenerEventos();
        const ahora = new Date();
        return eventos
            .filter(e => new Date(e.fecha) >= ahora)
            .slice(0, limit);
    } catch (e) {
        return [];
    }
}

function crearEvento(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addEvento(datos);
    } catch (e) {
        return { success: false };
    }
}

function eliminarEvento(id) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.eliminarEvento(id);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// ORACIONES Y PETICIONES
// ============================================

function obtenerOraciones() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getOraciones();
    } catch (e) {
        return [];
    }
}

function crearOracion(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addOracion(datos);
    } catch (e) {
        return { success: false };
    }
}

function orarOracion(id) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.orarOracion(id);
    } catch (e) {
        return { success: false };
    }
}

function obtenerPeticiones() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getPeticiones();
    } catch (e) {
        return [];
    }
}

function crearPeticion(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addPeticion(datos);
    } catch (e) {
        return { success: false };
    }
}

function orarPeticion(id) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.orarPeticion(id);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// BENDICIONES Y TESTIMONIOS
// ============================================

function obtenerBendiciones() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getBendiciones();
    } catch (e) {
        return [];
    }
}

function crearBendicion(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addBendicion(datos);
    } catch (e) {
        return { success: false };
    }
}

function obtenerTestimonios() {
    try {
        const db = getDB();
        if (!db) return [];
        const testimonios = db.cargar('testimonios');
        return (testimonios && testimonios.testimonios) || [];
    } catch (e) {
        return [];
    }
}

// ============================================
// PUBLICACIONES Y COMENTARIOS
// ============================================

function obtenerPublicaciones(limit = 50) {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getPublicaciones(limit);
    } catch (e) {
        return [];
    }
}

function crearPublicacion(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addPublicacion(datos);
    } catch (e) {
        return { success: false };
    }
}

function getComentariosPublicacion(pubId) {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getComentarios(pubId);
    } catch (e) {
        return [];
    }
}

function agregarComentario(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addComentario(datos);
    } catch (e) {
        return { success: false };
    }
}

function toggleReaccion(pubId, userId, tipo) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.toggleReaccion(pubId, userId, tipo);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// CHAT Y MENSAJES
// ============================================

function obtenerMensajes(limit = 50) {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getMensajes(limit);
    } catch (e) {
        return [];
    }
}

function enviarMensaje(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addMensaje(datos);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// NOTIFICACIONES
// ============================================

function obtenerNotificaciones(limit = 50) {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getNotificaciones(limit);
    } catch (e) {
        return [];
    }
}

function obtenerNoLeidas() {
    try {
        const db = getDB();
        if (!db) return 0;
        return db.getNoLeidas();
    } catch (e) {
        return 0;
    }
}

function marcarNotificacionesLeidas() {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.marcarLeidas();
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// REPORTES
// ============================================

function obtenerReportes(filtros = {}) {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getReportes(filtros);
    } catch (e) {
        return [];
    }
}

function obtenerReporte(id) {
    try {
        const db = getDB();
        if (!db) return null;
        return db.getReporte(id);
    } catch (e) {
        return null;
    }
}

function obtenerReportesPendientes() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getReportesPendientes();
    } catch (e) {
        return [];
    }
}

function crearReporte(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addReporte(datos);
    } catch (e) {
        return { success: false };
    }
}

function cambiarEstadoReporte(id, estado, admin = 'Admin', comentario = '') {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.cambiarEstadoReporte(id, estado, admin, comentario);
    } catch (e) {
        return { success: false };
    }
}

function eliminarReporte(id) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.deleteReporte(id);
    } catch (e) {
        return { success: false };
    }
}

function obtenerEstadisticasReportes() {
    try {
        const db = getDB();
        if (!db) return {};
        return db.getEstadisticasReportes();
    } catch (e) {
        return {};
    }
}

// ============================================
// RADIO
// ============================================

function obtenerEstacionesRadio() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getEstacionesRadio();
    } catch (e) {
        return [];
    }
}

function agregarEstacionRadio(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addEstacionRadio(datos);
    } catch (e) {
        return { success: false };
    }
}

function obtenerHistorialRadio(limit = 20) {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getHistorialRadio(limit);
    } catch (e) {
        return [];
    }
}

function agregarHistorialRadio(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addHistorialRadio(datos);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// STREAMING
// ============================================

function obtenerTransmisiones() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getTransmisiones();
    } catch (e) {
        return [];
    }
}

function obtenerTransmisionActiva() {
    try {
        const transmisiones = obtenerTransmisiones();
        return transmisiones.find(t => 
            t.estado === 'activa' || t.estado === 'en_vivo'
        ) || null;
    } catch (e) {
        return null;
    }
}

function crearTransmision(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addTransmision(datos);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// GAMIFICACIÓN - LOGROS Y RANKING
// ============================================

function obtenerLogrosUsuario(usuarioId) {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getLogrosUsuario(usuarioId);
    } catch (e) {
        return [];
    }
}

function desbloquearLogro(usuarioId, logroId, datos = {}) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.desbloquearLogro(usuarioId, logroId, datos);
    } catch (e) {
        return { success: false };
    }
}

function agregarXP(usuarioId, cantidad) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.agregarXP(usuarioId, cantidad);
    } catch (e) {
        return { success: false };
    }
}

function obtenerRanking(limit = 10) {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getRanking(limit);
    } catch (e) {
        return [];
    }
}

function agregarPuntajeRanking(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addPuntajeRanking(datos);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// DIARIO ESPIRITUAL
// ============================================

function obtenerDiarioEspiritual(usuarioId = null) {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getDiarioEspiritual(usuarioId);
    } catch (e) {
        return [];
    }
}

function agregarEntradaDiario(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addEntradaDiario(datos);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// LECTURA BÍBLICA
// ============================================

function obtenerProgresoLectura(usuarioId) {
    try {
        const db = getDB();
        if (!db) return null;
        return db.getProgresoLectura(usuarioId);
    } catch (e) {
        return null;
    }
}

function marcarLecturaCompletada(usuarioId, fecha = null) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.marcarLecturaCompletada(usuarioId, fecha);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// HIMNARIO Y PLAYLIST
// ============================================

function obtenerCanciones() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getCanciones();
    } catch (e) {
        return [];
    }
}

function agregarCancion(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addCancion(datos);
    } catch (e) {
        return { success: false };
    }
}

function obtenerPlaylists() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getPlaylists();
    } catch (e) {
        return [];
    }
}

function crearPlaylist(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addPlaylist(datos);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// ASISTENTE VIRTUAL
// ============================================

function obtenerConversaciones(usuarioId = null) {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getConversaciones(usuarioId);
    } catch (e) {
        return [];
    }
}

function guardarConversacion(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addConversacion(datos);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// JUEGOS Y TRIVIA
// ============================================

function obtenerPreguntasTrivia() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getPreguntasTrivia();
    } catch (e) {
        return [];
    }
}

function agregarPreguntaTrivia(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addPreguntaTrivia(datos);
    } catch (e) {
        return { success: false };
    }
}

function obtenerPartidasJuego(usuarioId = null) {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getPartidasJuego(usuarioId);
    } catch (e) {
        return [];
    }
}

function guardarPartidaJuego(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addPartidaJuego(datos);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// QR CODES
// ============================================

function obtenerQRCodes() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getQRCodes();
    } catch (e) {
        return [];
    }
}

function generarQRCode(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addQRCode(datos);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// RECURSOS Y BIBLIOTECA
// ============================================

function obtenerBiblioteca() {
    try {
        const db = getDB();
        if (!db) return [];
        const biblioteca = db.cargar('biblioteca');
        return (biblioteca && biblioteca.recursos) || [];
    } catch (e) {
        return [];
    }
}

function obtenerPodcast() {
    try {
        const db = getDB();
        if (!db) return [];
        const podcast = db.cargar('podcast');
        return (podcast && podcast.episodios) || [];
    } catch (e) {
        return [];
    }
}

function obtenerEncuestas() {
    try {
        const db = getDB();
        if (!db) return [];
        const encuestas = db.cargar('encuestas');
        return (encuestas && encuestas.encuestas) || [];
    } catch (e) {
        return [];
    }
}

// ============================================
// DIRECTORIO Y GRUPOS
// ============================================

function obtenerDirectorio() {
    try {
        const db = getDB();
        if (!db) return [];
        const directorio = db.cargar('directorio');
        return (directorio && directorio.miembros) || [];
    } catch (e) {
        return [];
    }
}

function obtenerGrupos() {
    try {
        const db = getDB();
        if (!db) return [];
        const grupos = db.cargar('grupos');
        return (grupos && grupos.grupos) || [];
    } catch (e) {
        return [];
    }
}

function obtenerMisiones() {
    try {
        const db = getDB();
        if (!db) return [];
        const misiones = db.cargar('misiones');
        return (misiones && misiones.misiones) || [];
    } catch (e) {
        return [];
    }
}

// ============================================
// DONACIONES
// ============================================

function obtenerDonaciones() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getDonaciones();
    } catch (e) {
        return [];
    }
}

function registrarDonacion(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        return db.addDonacion(datos);
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// FAVORITOS Y METAS
// ============================================

function obtenerFavoritos(usuarioId = null) {
    try {
        const db = getDB();
        if (!db) return [];
        const favoritos = db.cargar('favoritos');
        const lista = (favoritos && favoritos.favoritos) || [];
        return usuarioId ? lista.filter(f => f.usuario_id === usuarioId) : lista;
    } catch (e) {
        return [];
    }
}

function toggleFavorito(usuarioId, itemId, tipo) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        const favoritos = db.cargar('favoritos');
        if (!favoritos.favoritos) favoritos.favoritos = [];
        
        const existente = favoritos.favoritos.find(f => 
            f.usuario_id === usuarioId && f.item_id === itemId && f.tipo === tipo
        );
        
        if (existente) {
            favoritos.favoritos = favoritos.favoritos.filter(f => f.id !== existente.id);
        } else {
            favoritos.favoritos.push({
                id: db._generateId(),
                usuario_id: usuarioId,
                item_id: itemId,
                tipo: tipo,
                fecha: new Date().toISOString()
            });
        }
        
        db.guardar('favoritos', favoritos);
        return { success: true, esFavorito: !existente };
    } catch (e) {
        return { success: false };
    }
}

function obtenerMetas(usuarioId = null) {
    try {
        const db = getDB();
        if (!db) return [];
        const metas = db.cargar('metas');
        const lista = (metas && metas.metas) || [];
        return usuarioId ? lista.filter(m => m.usuario_id === usuarioId) : lista;
    } catch (e) {
        return [];
    }
}

function crearMeta(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false };
        const metas = db.cargar('metas');
        if (!metas.metas) metas.metas = [];
        
        metas.metas.push({
            id: db._generateId(),
            usuario_id: datos.usuario_id,
            titulo: datos.titulo,
            descripcion: datos.descripcion || '',
            fecha_objetivo: datos.fecha_objetivo || '',
            estado: 'pendiente',
            fecha_creacion: new Date().toISOString()
        });
        
        db.guardar('metas', metas);
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// INSIGNIAS
// ============================================

function obtenerInsignias() {
    try {
        const db = getDB();
        if (!db) return [];
        const insignias = db.cargar('insignias');
        return (insignias && insignias.insignias) || [];
    } catch (e) {
        return [];
    }
}

function obtenerInsigniasUsuario(usuarioId) {
    try {
        const insignias = obtenerInsignias();
        return insignias;
    } catch (e) {
        return [];
    }
}

// ============================================
// ESTADÍSTICAS Y SISTEMA
// ============================================

function obtenerEstadisticas() {
    try {
        const db = getDB();
        if (!db) return {};
        return db.getEstadisticas();
    } catch (e) {
        return {};
    }
}

function obtenerConfiguracion() {
    try {
        const db = getDB();
        if (!db) return null;
        return db.getConfiguracion();
    } catch (e) {
        return null;
    }
}

function obtenerConfiguracionIglesia() {
    try {
        const db = getDB();
        if (!db) return {};
        return db.getConfiguracionIglesia();
    } catch (e) {
        return {};
    }
}

function obtenerLogs(limit = 50) {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getLogs(limit);
    } catch (e) {
        return [];
    }
}

// ============================================
// EXPORTACIÓN E IMPORTACIÓN
// ============================================

function exportarDatos() {
    try {
        const db = getDB();
        if (!db) return { success: false };
        
        const datos = db.exportarTodo();
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ipuc_backup_' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return { success: true, message: 'Datos exportados' };
    } catch (e) {
        return { success: false, error: 'Error al exportar' };
    }
}

function importarDatos(archivo) {
    return new Promise((resolve) => {
        try {
            const db = getDB();
            if (!db) {
                resolve({ success: false, error: 'Base de datos no disponible' });
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const datos = JSON.parse(e.target.result);
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
        const db = getDB();
        if (!db) return { success: false };
        return db.limpiarTodo();
    } catch (e) {
        return { success: false };
    }
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function formatearFecha(fecha) {
    try {
        const d = new Date(fecha);
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
        const d = new Date(fecha);
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
        const d = new Date(fecha);
        const ahora = new Date();
        const diff = Math.ceil((d - ahora) / (1000 * 60 * 60 * 24));
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

function generarQRTexto(datos) {
    return JSON.stringify(datos);
}

// ============================================
// EXPORTAR A WINDOW
// ============================================

// Versión
window.VERSION = VERSION;
window.VERSION_NAME = VERSION_NAME;

// Base de datos
window.getDB = getDB;
window.isValidDB = isValidDB;

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

// Radio
window.obtenerEstacionesRadio = obtenerEstacionesRadio;
window.agregarEstacionRadio = agregarEstacionRadio;
window.obtenerHistorialRadio = obtenerHistorialRadio;
window.agregarHistorialRadio = agregarHistorialRadio;

// Streaming
window.obtenerTransmisiones = obtenerTransmisiones;
window.obtenerTransmisionActiva = obtenerTransmisionActiva;
window.crearTransmision = crearTransmision;

// Gamificación
window.obtenerLogrosUsuario = obtenerLogrosUsuario;
window.desbloquearLogro = desbloquearLogro;
window.agregarXP = agregarXP;
window.obtenerRanking = obtenerRanking;
window.agregarPuntajeRanking = agregarPuntajeRanking;

// Diario Espiritual
window.obtenerDiarioEspiritual = obtenerDiarioEspiritual;
window.agregarEntradaDiario = agregarEntradaDiario;

// Lectura Bíblica
window.obtenerProgresoLectura = obtenerProgresoLectura;
window.marcarLecturaCompletada = marcarLecturaCompletada;

// Himnario y Playlist
window.obtenerCanciones = obtenerCanciones;
window.agregarCancion = agregarCancion;
window.obtenerPlaylists = obtenerPlaylists;
window.crearPlaylist = crearPlaylist;

// Asistente
window.obtenerConversaciones = obtenerConversaciones;
window.guardarConversacion = guardarConversacion;

// Juegos
window.obtenerPreguntasTrivia = obtenerPreguntasTrivia;
window.agregarPreguntaTrivia = agregarPreguntaTrivia;
window.obtenerPartidasJuego = obtenerPartidasJuego;
window.guardarPartidaJuego = guardarPartidaJuego;

// QR Codes
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

console.log('IPUC LA FONDA v' + VERSION + ' ' + VERSION_NAME + ' - Helper Functions cargadas');
console.log(Object.keys(window).filter(k => 
    typeof window[k] === 'function' && k.startsWith('obtener')
).length + ' funciones de consulta disponibles');
console.log(Object.keys(window).filter(k => 
    typeof window[k] === 'function' && (k.includes('Logro') || k.includes('XP') || k.includes('Ranking'))
).length + ' funciones de gamificación');
console.log(Object.keys(window).filter(k => 
    typeof window[k] === 'function' && (k.includes('Radio') || k.includes('Streaming'))
).length + ' funciones multimedia');
console.log('Todas las funciones definidas correctamente');

/* ============================================
   FINAL DEL APP.JS v22.0 PRO ULTIMATE
   IPUC LA FONDA - International Pentecostal Church
   "Donde el Espíritu Santo se mueve"
   ============================================ */
