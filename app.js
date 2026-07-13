// ============================================
// IPUC LA FONDA - app.js v5.0
// Funciones helper para la aplicación
// Usa la instancia global "db" de database.js
// "Donde el Espíritu Santo se mueve"
// ============================================

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const VERSION = "5.0";
const MAX_INTENTOS = 5;
const TIEMPO_BLOQUEO = 15;
const DURACION_TOKEN = 24;

// Almacenamiento en memoria para sesiones
const TOKENS = {};
const INTENTOS_FALLIDOS = {};
const BLOQUEOS_TEMPORALES = {};

// ============================================
// FUNCIONES DE SEGURIDAD
// ============================================
function generarToken() { 
    return 't5_' + Date.now() + '_' + Math.random().toString(36).substr(2); 
}

function verificarToken(token) { 
    return TOKENS[token] && new Date() < new Date(TOKENS[token].expira) ? TOKENS[token] : null; 
}

function limpiarTokensExpirados() { 
    const ahora = new Date(); 
    Object.keys(TOKENS).forEach(t => { 
        if (new Date(TOKENS[t].expira) < ahora) delete TOKENS[t]; 
    }); 
}

function registrarActividad(uid, accion, detalle = '') { 
    console.log(`📝 [${new Date().toISOString()}] Usuario ${uid}: ${accion} - ${detalle}`); 
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================
function login(usuario, password) {
    const resultado = db.login(usuario, password);
    if (resultado.error) return resultado;
    const token = generarToken();
    TOKENS[token] = { 
        usuario: resultado.usuario, 
        rol: resultado.rol, 
        expira: new Date(Date.now() + DURACION_TOKEN * 3600000).toISOString(), 
        creado: new Date().toISOString() 
    };
    resultado.token = token;
    localStorage.setItem('ipuc5_token', token);
    localStorage.setItem('ipuc5_usuario', JSON.stringify(resultado.usuario));
    localStorage.setItem('ipuc5_rol', resultado.rol);
    registrarActividad(resultado.usuario.id, 'Inicio de sesión', `Rol: ${resultado.rol}`);
    return resultado;
}

function registro(datos) {
    if (!datos.nombre || !datos.apellidos || !datos.correo || !datos.usuario || !datos.password) 
        return { error: 'Campos obligatorios faltantes' };
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(datos.correo)) 
        return { error: 'Correo inválido' };
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(datos.usuario)) 
        return { error: 'Usuario inválido (3-20 caracteres)' };
    if (datos.password.length < 8) 
        return { error: 'Contraseña mínima 8 caracteres' };
    const resultado = db.registrarUsuario(datos);
    if (resultado.exito) { 
        db.addNotificacion({ titulo: 'Nuevo usuario', mensaje: `${datos.nombre} se ha registrado`, tipo: 'usuario' }); 
        registrarActividad(resultado.usuario.id, 'Registro'); 
    }
    return resultado;
}

function logout() {
    const token = localStorage.getItem('ipuc5_token');
    if (token && TOKENS[token]) { 
        registrarActividad(TOKENS[token].usuario.id, 'Cierre de sesión'); 
        delete TOKENS[token]; 
    }
    ['ipuc5_token', 'ipuc5_usuario', 'ipuc5_rol'].forEach(k => localStorage.removeItem(k));
    return { mensaje: 'Sesión cerrada' };
}

function verificarSesion() {
    const token = localStorage.getItem('ipuc5_token');
    const usuario = JSON.parse(localStorage.getItem('ipuc5_usuario') || 'null');
    const rol = localStorage.getItem('ipuc5_rol');
    if (token && usuario) return { valida: true, usuario, rol };
    return { valida: false };
}

// ============================================
// FUNCIONES DE ADMINISTRADOR
// ============================================
function crearPrimerAdmin(datos) {
    if (!datos.nombre || !datos.apellidos || !datos.correo || !datos.usuario || !datos.password) 
        return { error: 'Campos obligatorios faltantes' };
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(datos.correo)) 
        return { error: 'Correo inválido' };
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(datos.usuario)) 
        return { error: 'Usuario inválido' };
    if (datos.password.length < 8) 
        return { error: 'Contraseña mínima 8 caracteres' };
    const resultado = db.crearPrimerAdmin(datos);
    if (resultado.exito) { 
        db.addNotificacion({ titulo: 'Admin creado', mensaje: 'Primer administrador configurado', tipo: 'sistema' }); 
        registrarActividad(1, 'Primer admin creado'); 
    }
    return resultado;
}

// ============================================
// FUNCIONES DE USUARIOS
// ============================================
function obtenerUsuarios() { 
    const u = db.cargar('usuarios'); 
    return (u?.usuarios || []).map(x => { const { password, ...resto } = x; return resto; }); 
}

function obtenerUsuario(id) { 
    const u = db.cargar('usuarios'); 
    const user = (u?.usuarios || []).find(x => x.id === id); 
    if (!user) return null; 
    const { password, ...resto } = user; 
    return resto; 
}

function actualizarUsuario(id, datos) {
    const u = db.cargar('usuarios'); 
    const idx = (u?.usuarios || []).findIndex(x => x.id === id);
    if (idx < 0) return { error: 'No encontrado' };
    ['nombre', 'apellidos', 'celular', 'direccion', 'ministerio', 'foto', 'estado'].forEach(c => { 
        if (datos[c] !== undefined) u.usuarios[idx][c] = datos[c]; 
    });
    db.guardar('usuarios', u); 
    return { mensaje: 'Actualizado' };
}

function verificarUsuario(id) {
    const u = db.cargar('usuarios'); 
    const idx = (u?.usuarios || []).findIndex(x => x.id === id);
    if (idx < 0) return { error: 'No encontrado' };
    u.usuarios[idx].verificado = true;
    if (!u.usuarios[idx].insignias.includes('Cuenta Verificada')) u.usuarios[idx].insignias.push('Cuenta Verificada');
    db.guardar('usuarios', u); 
    return { mensaje: 'Verificado' };
}

function cambiarPassword(id, pwActual, pwNueva) {
    if (pwNueva.length < 8) return { error: 'Mínimo 8 caracteres' };
    const u = db.cargar('usuarios'); 
    const idx = (u?.usuarios || []).findIndex(x => x.id === id);
    if (idx < 0) return { error: 'No encontrado' };
    if (u.usuarios[idx].password !== db.hashPassword(pwActual)) return { error: 'Contraseña actual incorrecta' };
    u.usuarios[idx].password = db.hashPassword(pwNueva);
    db.guardar('usuarios', u); 
    return { mensaje: 'Contraseña actualizada' };
}

function obtenerDirectorio() { 
    const u = db.cargar('usuarios'); 
    return (u?.usuarios || []).map(x => ({ 
        id: x.id, nombre: x.nombre, apellidos: x.apellidos || '', 
        foto: x.foto, ministerio: x.ministerio, verificado: x.verificado || false 
    })); 
}

// ============================================
// FUNCIONES DE ASISTENCIA
// ============================================
function obtenerAsistencia(uid = null) { 
    const r = db.cargar('asistencia')?.registros || []; 
    return uid ? r.filter(x => x.usuario_id === uid) : r; 
}

function registrarAsistencia(datos) { return db.addAsistencia(datos); }
function obtenerEstadisticasAsistencia() { return db.cargar('estadisticas')?.asistencia || {}; }

// ============================================
// FUNCIONES DE CULTOS Y HORARIOS
// ============================================
function obtenerProximoCulto() {
    const ahora = new Date();
    const cultos = { 
        0: [], 1: [{ inicio: "18:00", fin: "20:30", nombre: "Culto de Oración" }], 
        2: [{ inicio: "16:00", fin: "19:00", nombre: "Culto Campal" }], 
        3: [{ inicio: "16:00", fin: "19:00", nombre: "Culto de Refrán" }], 
        4: [{ inicio: "18:00", fin: "20:30", nombre: "Culto de Jóvenes" }], 
        5: [], 6: [{ inicio: "10:00", fin: "12:00", nombre: "Culto Dominical" }] 
    };
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    for (let offset = 0; offset < 8; offset++) {
        const dia = (ahora.getDay() + offset) % 7;
        for (const c of (cultos[dia] || [])) {
            const fecha = new Date(ahora); fecha.setDate(fecha.getDate() + offset);
            const [hi, mi] = c.inicio.split(':').map(Number); 
            const [hf, mf] = c.fin.split(':').map(Number);
            const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), hi, mi);
            const fin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), hf, mf);
            if (offset === 0 && ahora > fin) continue;
            const estado = offset === 0 && ahora >= inicio ? "en_curso" : "proximo";
            const restante = Math.max(0, Math.floor(((estado === "en_curso" ? fin : inicio) - ahora) / 1000));
            return { nombre: c.nombre, dia: dias[dia], fecha: fecha.toISOString().split('T')[0], inicio: c.inicio, fin: c.fin, estado, segundos_restantes: restante };
        }
    }
    return { mensaje: "No hay cultos", estado: "sin_cultos", segundos_restantes: 0 };
}

function obtenerHorarios() { return db.cargar('horarios')?.cultos || []; }

// ============================================
// FUNCIONES DE VERSÍCULOS
// ============================================
function obtenerVersiculoDiario() {
    const data = db.cargar('versiculos'); 
    const hoy = new Date().toISOString().split('T')[0];
    let actual = data?.versiculo_actual;
    if (!actual || actual.fecha !== hoy) {
        const lista = data?.versiculos || [];
        if (lista.length > 0) { 
            actual = { ...lista[new Date().getDay() % lista.length], fecha: hoy }; 
            data.versiculo_actual = actual; 
            db.guardar('versiculos', data); 
        } else actual = { texto: "Porque de tal manera amó Dios al mundo...", referencia: "Juan 3:16", tipo: "promesa", fecha: hoy };
    }
    return actual;
}

function obtenerVersiculos() { return db.cargar('versiculos')?.versiculos || []; }

function crearVersiculo(datos) { 
    const v = db.cargar('versiculos'); 
    const nuevo = { id: (v.versiculos?.length || 0) + 1, texto: datos.texto, referencia: datos.referencia, tipo: datos.tipo || 'versiculo' }; 
    if (!v.versiculos) v.versiculos = []; 
    v.versiculos.push(nuevo); v.ultimo_id = nuevo.id; 
    db.guardar('versiculos', v); 
    return nuevo; 
}

function eliminarVersiculo(id) { 
    const v = db.cargar('versiculos'); 
    v.versiculos = (v.versiculos || []).filter(x => x.id !== id); 
    db.guardar('versiculos', v); 
    return { mensaje: 'Eliminado' }; 
}

// ============================================
// FUNCIONES DE NOTICIAS
// ============================================
function obtenerNoticias() { 
    const n = db.cargar('noticias'); 
    return (n?.noticias || []).filter(x => x.estado === 'publicado').sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion)); 
}

function crearNoticia(datos) { return db.addNoticia(datos); }

function eliminarNoticia(id) { 
    const n = db.cargar('noticias'); 
    n.noticias = (n.noticias || []).filter(x => x.id !== id); 
    db.guardar('noticias', n); 
    return { mensaje: 'Eliminada' }; 
}

// ============================================
// FUNCIONES DE EVENTOS
// ============================================
function obtenerEventos() { 
    const e = db.cargar('eventos'); 
    const hoy = new Date().toISOString().split('T')[0]; 
    return (e?.eventos || []).filter(x => x.fecha >= hoy).sort((a, b) => a.fecha.localeCompare(b.fecha)); 
}

function crearEvento(datos) { return db.addEvento(datos); }

// ============================================
// FUNCIONES DE PETICIONES
// ============================================
function obtenerPeticiones() { 
    const p = db.cargar('peticiones'); 
    return (p?.peticiones || []).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); 
}

function crearPeticion(datos) { return db.addPeticion(datos); }

// ============================================
// FUNCIONES DE NOTIFICACIONES
// ============================================
function obtenerNotificaciones() { return db.cargar('notificaciones')?.notificaciones || []; }
function crearNotificacion(datos) { return db.addNotificacion(datos); }
function marcarNotificacionesLeidas() { db.marcarTodasLeidas(); }
function obtenerNoLeidas() { return db.getNoLeidas(); }

// ============================================
// FUNCIONES DE ESTADÍSTICAS
// ============================================
function obtenerEstadisticas() { return db.getEstadisticas(); }

// ============================================
// FUNCIONES DE CONFIGURACIÓN
// ============================================
function obtenerConfiguracion() { return db.cargar('configuracion'); }

function actualizarConfiguracion(datos) { 
    const c = db.cargar('configuracion'); 
    Object.assign(c.iglesia, datos.iglesia || {}); 
    Object.assign(c.aplicacion, datos.aplicacion || {}); 
    db.guardar('configuracion', c); 
    return c; 
}

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================
window.login = login;
window.registro = registro;
window.logout = logout;
window.verificarSesion = verificarSesion;
window.crearPrimerAdmin = crearPrimerAdmin;
window.obtenerUsuarios = obtenerUsuarios;
window.obtenerUsuario = obtenerUsuario;
window.actualizarUsuario = actualizarUsuario;
window.verificarUsuario = verificarUsuario;
window.cambiarPassword = cambiarPassword;
window.obtenerDirectorio = obtenerDirectorio;
window.obtenerAsistencia = obtenerAsistencia;
window.registrarAsistencia = registrarAsistencia;
window.obtenerEstadisticasAsistencia = obtenerEstadisticasAsistencia;
window.obtenerProximoCulto = obtenerProximoCulto;
window.obtenerHorarios = obtenerHorarios;
window.obtenerVersiculoDiario = obtenerVersiculoDiario;
window.obtenerVersiculos = obtenerVersiculos;
window.crearVersiculo = crearVersiculo;
window.eliminarVersiculo = eliminarVersiculo;
window.obtenerNoticias = obtenerNoticias;
window.crearNoticia = crearNoticia;
window.eliminarNoticia = eliminarNoticia;
window.obtenerEventos = obtenerEventos;
window.crearEvento = crearEvento;
window.obtenerPeticiones = obtenerPeticiones;
window.crearPeticion = crearPeticion;
window.obtenerNotificaciones = obtenerNotificaciones;
window.crearNotificacion = crearNotificacion;
window.marcarNotificacionesLeidas = marcarNotificacionesLeidas;
window.obtenerNoLeidas = obtenerNoLeidas;
window.obtenerEstadisticas = obtenerEstadisticas;
window.obtenerConfiguracion = obtenerConfiguracion;
window.actualizarConfiguracion = actualizarConfiguracion;

console.log('✅ app.js v5.0 cargado - Funciones listas');
