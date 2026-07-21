// ============================================
// IPUC LA FONDA - app.js v18.0 PRO ULTIMATE
// Funciones helper para la aplicación
// Incluye: Sistema de Reportes completo
// Sistema completo de gestión de datos
// VERSIÓN INTERNACIONAL - 100% OPERATIVA
// Usa la instancia global "db" de database.js
// "Donde el Espíritu Santo se mueve"
// ============================================

// ============================================
// CONFIGURACIÓN GLOBAL v18.0
// ============================================
const VERSION = "18.0";
const MAX_INTENTOS = 5;
const TIEMPO_BLOQUEO = 15; // minutos
const DURACION_TOKEN = 24; // horas
const CACHE_TIMEOUT = 300; // segundos

const TOKENS = {};
const INTENTOS_FALLIDOS = {};
const BLOQUEOS_TEMPORALES = {};
const CACHE = {};
const CACHE_TIMESTAMP = {};

// ============================================
// SISTEMA DE LOGS (SILENCIOSO)
// ============================================
function logApp(accion, detalle = '', nivel = 'info') {
    const entry = {
        timestamp: new Date().toISOString(),
        accion,
        detalle,
        nivel,
        version: VERSION
    };
    
    try {
        const logs = JSON.parse(localStorage.getItem('ipuc18_app_logs') || '[]');
        logs.push(entry);
        if (logs.length > 1000) logs.shift();
        localStorage.setItem('ipuc18_app_logs', JSON.stringify(logs));
    } catch (e) {}
}

// ============================================
// SISTEMA DE CACHÉ
// ============================================
function cacheGet(key) {
    if (CACHE[key] && CACHE_TIMESTAMP[key]) {
        const edad = (Date.now() - CACHE_TIMESTAMP[key]) / 1000;
        if (edad < CACHE_TIMEOUT) {
            return CACHE[key];
        }
        delete CACHE[key];
        delete CACHE_TIMESTAMP[key];
    }
    return null;
}

function cacheSet(key, data) {
    CACHE[key] = data;
    CACHE_TIMESTAMP[key] = Date.now();
}

function cacheClear(key = null) {
    if (key) {
        // Limpiar todas las claves que empiecen con el prefijo
        Object.keys(CACHE).forEach(k => {
            if (k.startsWith(key)) {
                delete CACHE[k];
                delete CACHE_TIMESTAMP[k];
            }
        });
    } else {
        Object.keys(CACHE).forEach(k => {
            delete CACHE[k];
            delete CACHE_TIMESTAMP[k];
        });
    }
}

// ============================================
// SISTEMA DE SEGURIDAD
// ============================================
function generarToken() {
    return 't18_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function verificarToken(token) {
    if (!token) return null;
    if (TOKENS[token]) {
        const expira = new Date(TOKENS[token].expira);
        if (new Date() < expira) {
            return TOKENS[token];
        } else {
            delete TOKENS[token];
            logApp('Token expirado', `Token: ${token.substring(0, 10)}...`, 'warning');
        }
    }
    return null;
}

function limpiarTokensExpirados() {
    const ahora = new Date();
    let eliminados = 0;
    Object.keys(TOKENS).forEach(token => {
        if (new Date(TOKENS[token].expira) < ahora) {
            delete TOKENS[token];
            eliminados++;
        }
    });
    if (eliminados > 0) {
        logApp('Tokens expirados limpiados', `${eliminados} tokens eliminados`, 'info');
    }
}

function verificarIntentosFallidos(usuario) {
    const ahora = Date.now();
    const bloqueo = BLOQUEOS_TEMPORALES[usuario];
    if (bloqueo) {
        if (ahora < bloqueo) {
            const minutosRestantes = Math.ceil((bloqueo - ahora) / 60000);
            return { bloqueado: true, minutosRestantes };
        } else {
            delete BLOQUEOS_TEMPORALES[usuario];
            INTENTOS_FALLIDOS[usuario] = 0;
        }
    }
    return { bloqueado: false };
}

function registrarIntentoFallido(usuario) {
    const ahora = Date.now();
    if (!INTENTOS_FALLIDOS[usuario]) INTENTOS_FALLIDOS[usuario] = 0;
    INTENTOS_FALLIDOS[usuario]++;
    
    if (INTENTOS_FALLIDOS[usuario] >= MAX_INTENTOS) {
        BLOQUEOS_TEMPORALES[usuario] = ahora + (TIEMPO_BLOQUEO * 60000);
        logApp('Usuario bloqueado', `${usuario} bloqueado por ${TIEMPO_BLOQUEO} minutos`, 'warning');
        return { bloqueado: true };
    }
    return { bloqueado: false, intentosRestantes: MAX_INTENTOS - INTENTOS_FALLIDOS[usuario] };
}

function registrarActividad(uid, accion, detalle = '') {
    logApp(`Usuario ${uid}: ${accion}`, detalle, 'info');
}

// ============================================
// OBTENER INSTANCIA DB (SEGURA)
// ============================================
function getDB() {
    if (typeof window.db !== 'undefined' && window.db) {
        return window.db;
    }
    if (typeof db !== 'undefined' && db) {
        return db;
    }
    logApp('Error: Database no disponible', '', 'error');
    return null;
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================
function login(usuario, password, recordar = false) {
    try {
        const db = getDB();
        if (!db) {
            return { success: false, error: 'Base de datos no disponible' };
        }

        const verificar = verificarIntentosFallidos(usuario);
        if (verificar.bloqueado) {
            return { 
                success: false, 
                error: `Cuenta bloqueada. Intenta en ${verificar.minutosRestantes} minutos` 
            };
        }

        const resultado = db.login(usuario, password, recordar);
        if (!resultado.success) {
            const intento = registrarIntentoFallido(usuario);
            if (intento.bloqueado) {
                return { 
                    success: false, 
                    error: `Cuenta bloqueada por ${TIEMPO_BLOQUEO} minutos` 
                };
            }
            return { 
                success: false, 
                error: resultado.error,
                intentosRestantes: intento.intentosRestantes || MAX_INTENTOS - INTENTOS_FALLIDOS[usuario]
            };
        }

        const token = generarToken();
        const expira = new Date(Date.now() + DURACION_TOKEN * 3600000);
        TOKENS[token] = {
            usuario: resultado.usuario,
            rol: resultado.rol,
            expira: expira.toISOString(),
            creado: new Date().toISOString()
        };

        localStorage.setItem('ipuc18_token', token);
        localStorage.setItem('ipuc18_usuario', JSON.stringify(resultado.usuario));
        localStorage.setItem('ipuc18_rol', resultado.rol);
        localStorage.setItem('ipuc18_token_expira', expira.toISOString());

        delete INTENTOS_FALLIDOS[usuario];
        delete BLOQUEOS_TEMPORALES[usuario];

        registrarActividad(resultado.usuario.id, 'Inicio de sesión', `Rol: ${resultado.rol}`);
        logApp('Login exitoso', `Usuario: ${resultado.usuario.usuario}`, 'success');

        cacheClear();

        return {
            success: true,
            token,
            usuario: resultado.usuario,
            rol: resultado.rol,
            expira: expira.toISOString()
        };
    } catch (error) {
        logApp('Error en login', error.message, 'error');
        return { success: false, error: 'Error en el servidor' };
    }
}

function registro(datos) {
    try {
        const db = getDB();
        if (!db) {
            return { success: false, error: 'Base de datos no disponible' };
        }

        if (!datos.nombre || !datos.apellidos || !datos.correo || !datos.usuario || !datos.password) {
            return { success: false, error: 'Campos obligatorios faltantes' };
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(datos.correo)) {
            return { success: false, error: 'Correo inválido' };
        }

        if (!/^[a-zA-Z0-9_]{3,20}$/.test(datos.usuario)) {
            return { success: false, error: 'Usuario inválido (3-20 caracteres, solo letras, números y _)' };
        }

        if (datos.password.length < 8) {
            return { success: false, error: 'Contraseña mínima 8 caracteres' };
        }

        const resultado = db.registrarUsuario(datos);
        if (resultado.success) {
            registrarActividad(resultado.data.id, 'Registro de usuario');
            logApp('Registro exitoso', `Usuario: ${datos.usuario}`, 'success');
            cacheClear();
        }
        return resultado;
    } catch (error) {
        logApp('Error en registro', error.message, 'error');
        return { success: false, error: 'Error en el servidor' };
    }
}

function logout() {
    try {
        const token = localStorage.getItem('ipuc18_token');
        if (token && TOKENS[token]) {
            registrarActividad(TOKENS[token].usuario.id, 'Cierre de sesión');
            delete TOKENS[token];
        }
        ['ipuc18_token', 'ipuc18_usuario', 'ipuc18_rol', 'ipuc18_token_expira'].forEach(k => {
            localStorage.removeItem(k);
        });
        cacheClear();
        logApp('Logout exitoso', 'Sesión cerrada', 'info');
        return { success: true, mensaje: 'Sesión cerrada correctamente' };
    } catch (error) {
        logApp('Error en logout', error.message, 'error');
        return { success: false, error: 'Error al cerrar sesión' };
    }
}

function verificarSesion() {
    try {
        const db = getDB();
        if (!db) {
            return { success: false, message: 'Base de datos no disponible' };
        }

        const token = localStorage.getItem('ipuc18_token');
        const usuarioData = localStorage.getItem('ipuc18_usuario');
        const rol = localStorage.getItem('ipuc18_rol');

        if (!token || !usuarioData) {
            return { success: false, message: 'No hay sesión activa' };
        }

        const tokenValido = verificarToken(token);
        if (!tokenValido) {
            localStorage.removeItem('ipuc18_token');
            return { success: false, message: 'Sesión expirada' };
        }

        const usuario = JSON.parse(usuarioData);
        
        const userExists = db.cargar('usuarios')?.usuarios?.find(u => u.id === usuario.id);
        if (!userExists) {
            const adminExists = db.cargar('administradores')?.administradores?.find(a => a.id === usuario.id);
            if (!adminExists) {
                localStorage.removeItem('ipuc18_token');
                localStorage.removeItem('ipuc18_usuario');
                return { success: false, message: 'Usuario no encontrado' };
            }
        }

        return {
            success: true,
            usuario,
            rol,
            token,
            expira: tokenValido.expira
        };
    } catch (error) {
        logApp('Error verificando sesión', error.message, 'error');
        return { success: false, message: 'Error al verificar sesión' };
    }
}

function esAdmin() {
    const sesion = verificarSesion();
    return sesion.success && sesion.rol === 'admin';
}

function esUsuario() {
    const sesion = verificarSesion();
    return sesion.success && sesion.rol === 'usuario';
}

function obtenerUsuarioActual() {
    const sesion = verificarSesion();
    return sesion.success ? sesion.usuario : null;
}

// ============================================
// FUNCIONES DE ADMINISTRADOR
// ============================================
function crearPrimerAdmin(datos) {
    try {
        const db = getDB();
        if (!db) {
            return { success: false, error: 'Base de datos no disponible' };
        }

        if (!datos.nombre || !datos.apellidos || !datos.correo || !datos.usuario || !datos.password) {
            return { success: false, error: 'Campos obligatorios faltantes' };
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(datos.correo)) {
            return { success: false, error: 'Correo inválido' };
        }

        if (!/^[a-zA-Z0-9_]{3,20}$/.test(datos.usuario)) {
            return { success: false, error: 'Usuario inválido (3-20 caracteres)' };
        }

        if (datos.password.length < 8) {
            return { success: false, error: 'Contraseña mínima 8 caracteres' };
        }

        const resultado = db.crearPrimerAdministrador(datos);
        if (resultado.success) {
            registrarActividad(1, 'Primer administrador creado');
            logApp('Admin creado', `Usuario: ${datos.usuario}`, 'success');
            cacheClear();
        }
        return resultado;
    } catch (error) {
        logApp('Error creando admin', error.message, 'error');
        return { success: false, error: 'Error al crear administrador' };
    }
}

function hayAdministrador() {
    try {
        const db = getDB();
        if (!db) return false;
        const admins = db.cargar('administradores');
        return (admins?.administradores?.length || 0) > 0;
    } catch {
        return false;
    }
}

// ============================================
// FUNCIONES DE USUARIOS
// ============================================
function obtenerUsuarios() {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = 'usuarios_list';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const u = db.cargar('usuarios');
        const result = (u?.usuarios || []).map(x => {
            const { password, ...resto } = x;
            return resto;
        });
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo usuarios', error.message, 'error');
        return [];
    }
}

function obtenerUsuario(id) {
    try {
        const db = getDB();
        if (!db) return null;
        
        const cacheKey = `usuario_${id}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const u = db.cargar('usuarios');
        const user = (u?.usuarios || []).find(x => x.id === id);
        if (!user) return null;
        const { password, ...resto } = user;
        cacheSet(cacheKey, resto);
        return resto;
    } catch (error) {
        logApp('Error obteniendo usuario', error.message, 'error');
        return null;
    }
}

function actualizarUsuario(id, datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const u = db.cargar('usuarios');
        const idx = (u?.usuarios || []).findIndex(x => x.id === id);
        if (idx < 0) return { success: false, error: 'Usuario no encontrado' };

        const camposPermitidos = ['nombre', 'apellidos', 'celular', 'direccion', 'ministerio', 'foto', 'estado', 'verificado'];
        camposPermitidos.forEach(c => {
            if (datos[c] !== undefined) u.usuarios[idx][c] = datos[c];
        });

        db.guardar('usuarios', u);
        cacheClear('usuario_');
        cacheClear('usuarios_list');
        logApp('Usuario actualizado', `ID: ${id}`, 'info');
        return { success: true, mensaje: 'Usuario actualizado correctamente' };
    } catch (error) {
        logApp('Error actualizando usuario', error.message, 'error');
        return { success: false, error: 'Error al actualizar usuario' };
    }
}

function verificarUsuario(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const u = db.cargar('usuarios');
        const idx = (u?.usuarios || []).findIndex(x => x.id === id);
        if (idx < 0) return { success: false, error: 'Usuario no encontrado' };

        u.usuarios[idx].verificado = true;
        if (!u.usuarios[idx].insignias) u.usuarios[idx].insignias = [];
        if (!u.usuarios[idx].insignias.includes('Cuenta Verificada')) {
            u.usuarios[idx].insignias.push('Cuenta Verificada');
        }

        db.guardar('usuarios', u);
        cacheClear('usuario_');
        cacheClear('usuarios_list');
        logApp('Usuario verificado', `ID: ${id}`, 'success');
        return { success: true, mensaje: 'Usuario verificado correctamente' };
    } catch (error) {
        logApp('Error verificando usuario', error.message, 'error');
        return { success: false, error: 'Error al verificar usuario' };
    }
}

function cambiarPassword(id, pwActual, pwNueva) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        if (pwNueva.length < 8) {
            return { success: false, error: 'Mínimo 8 caracteres' };
        }

        const u = db.cargar('usuarios');
        const idx = (u?.usuarios || []).findIndex(x => x.id === id);
        if (idx < 0) return { success: false, error: 'Usuario no encontrado' };

        if (u.usuarios[idx].password !== db.hashPassword(pwActual)) {
            return { success: false, error: 'Contraseña actual incorrecta' };
        }

        u.usuarios[idx].password = db.hashPassword(pwNueva);
        db.guardar('usuarios', u);
        cacheClear('usuario_');
        logApp('Contraseña cambiada', `ID: ${id}`, 'info');
        return { success: true, mensaje: 'Contraseña actualizada correctamente' };
    } catch (error) {
        logApp('Error cambiando contraseña', error.message, 'error');
        return { success: false, error: 'Error al cambiar contraseña' };
    }
}

function obtenerDirectorio() {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = 'directorio_list';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const u = db.cargar('usuarios');
        const result = (u?.usuarios || []).map(x => ({
            id: x.id,
            nombre: x.nombre,
            apellidos: x.apellidos || '',
            foto: x.foto || 'assets/avatars/default.png',
            ministerio: x.ministerio || 'General',
            verificado: x.verificado || false,
            estado: x.estado || 'activo'
        }));
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo directorio', error.message, 'error');
        return [];
    }
}

// ============================================
// FUNCIONES DE ASISTENCIA
// ============================================
function obtenerAsistencia(uid = null, filtros = {}) {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = `asistencia_${uid || 'all'}_${JSON.stringify(filtros)}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const r = db.getAsistencia(filtros);
        const result = uid ? r.filter(x => x.usuario_id === uid) : r;
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo asistencia', error.message, 'error');
        return [];
    }
}

function registrarAsistencia(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addAsistencia(datos);
        if (resultado.success) {
            cacheClear('asistencia_');
            logApp('Asistencia registrada', `Usuario: ${datos.usuario_id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error registrando asistencia', error.message, 'error');
        return { success: false, error: 'Error al registrar asistencia' };
    }
}

function obtenerEstadisticasAsistencia() {
    try {
        const db = getDB();
        if (!db) return {};
        
        const cacheKey = 'estadisticas_asistencia';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.cargar('estadisticas')?.asistencia || {};
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo estadísticas de asistencia', error.message, 'error');
        return {};
    }
}

// ============================================
// FUNCIONES DE CULTOS Y HORARIOS
// ============================================
function obtenerProximoCulto() {
    try {
        const ahora = new Date();
        const cultos = {
            0: [],
            1: [{ inicio: "18:00", fin: "20:30", nombre: "Culto de Oración" }],
            2: [{ inicio: "16:00", fin: "19:00", nombre: "Culto Campal" }],
            3: [{ inicio: "16:00", fin: "19:00", nombre: "Culto de Refrán" }],
            4: [{ inicio: "18:00", fin: "20:30", nombre: "Culto de Jóvenes" }],
            5: [],
            6: [{ inicio: "10:00", fin: "12:00", nombre: "Culto Dominical" }]
        };
        const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        for (let offset = 0; offset < 8; offset++) {
            const dia = (ahora.getDay() + offset) % 7;
            for (const c of (cultos[dia] || [])) {
                const fecha = new Date(ahora);
                fecha.setDate(fecha.getDate() + offset);
                const [hi, mi] = c.inicio.split(':').map(Number);
                const [hf, mf] = c.fin.split(':').map(Number);
                const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), hi, mi);
                const fin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), hf, mf);

                if (offset === 0 && ahora > fin) continue;

                const estado = offset === 0 && ahora >= inicio ? "en_curso" : "proximo";
                const restante = Math.max(0, Math.floor(((estado === "en_curso" ? fin : inicio) - ahora) / 1000));

                return {
                    nombre: c.nombre,
                    dia: dias[dia],
                    fecha: fecha.toISOString().split('T')[0],
                    inicio: c.inicio,
                    fin: c.fin,
                    estado,
                    segundos_restantes: restante
                };
            }
        }
        return { mensaje: "No hay cultos", estado: "sin_cultos", segundos_restantes: 0 };
    } catch (error) {
        logApp('Error obteniendo próximo culto', error.message, 'error');
        return { mensaje: "Error", estado: "error", segundos_restantes: 0 };
    }
}

function obtenerHorarios() {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = 'horarios_list';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.cargar('horarios')?.cultos || [];
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo horarios', error.message, 'error');
        return [];
    }
}

function actualizarHorarios(horarios) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const result = db.updateHorarios(horarios);
        if (result.success) {
            cacheClear('horarios_list');
            logApp('Horarios actualizados', '', 'success');
        }
        return result;
    } catch (error) {
        logApp('Error actualizando horarios', error.message, 'error');
        return { success: false, error: 'Error al actualizar horarios' };
    }
}

// ============================================
// FUNCIONES DE VERSÍCULOS
// ============================================
function obtenerVersiculoDiario() {
    try {
        const db = getDB();
        if (!db) return null;

        const cacheKey = 'versiculo_diario';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;

        const result = db.getVersiculoDiario();
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo versículo diario', error.message, 'error');
        return null;
    }
}

function obtenerVersiculos() {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = 'versiculos_list';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getVersiculos();
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo versículos', error.message, 'error');
        return [];
    }
}

function crearVersiculo(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addVersiculo(datos);
        if (resultado.success) {
            cacheClear('versiculos_list');
            cacheClear('versiculo_diario');
            logApp('Versículo creado', `Referencia: ${datos.referencia}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error creando versículo', error.message, 'error');
        return { success: false, error: 'Error al crear versículo' };
    }
}

function eliminarVersiculo(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.deleteVersiculo(id);
        if (resultado.success) {
            cacheClear('versiculos_list');
            cacheClear('versiculo_diario');
            logApp('Versículo eliminado', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error eliminando versículo', error.message, 'error');
        return { success: false, error: 'Error al eliminar versículo' };
    }
}

// ============================================
// FUNCIONES DE NOTICIAS
// ============================================
function obtenerNoticias(limit = 50) {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = `noticias_list_${limit}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const n = db.getNoticias(limit);
        const result = n.filter(x => x.estado === 'publicado')
            .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo noticias', error.message, 'error');
        return [];
    }
}

function crearNoticia(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addNoticia(datos);
        if (resultado.success) {
            cacheClear('noticias_list');
            logApp('Noticia creada', `Título: ${datos.titulo}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error creando noticia', error.message, 'error');
        return { success: false, error: 'Error al crear noticia' };
    }
}

function eliminarNoticia(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.deleteNoticia(id);
        if (resultado.success) {
            cacheClear('noticias_list');
            logApp('Noticia eliminada', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error eliminando noticia', error.message, 'error');
        return { success: false, error: 'Error al eliminar noticia' };
    }
}

// ============================================
// FUNCIONES DE EVENTOS
// ============================================
function obtenerEventos(filtros = {}) {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = `eventos_list_${JSON.stringify(filtros)}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const e = db.getEventos(filtros);
        const result = e.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo eventos', error.message, 'error');
        return [];
    }
}

function obtenerEvento(id) {
    try {
        const db = getDB();
        if (!db) return null;
        
        const cacheKey = `evento_${id}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getEvento(id);
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo evento', error.message, 'error');
        return null;
    }
}

function crearEvento(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addEvento(datos);
        if (resultado.success) {
            cacheClear('eventos_list');
            logApp('Evento creado', `Título: ${datos.titulo}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error creando evento', error.message, 'error');
        return { success: false, error: 'Error al crear evento' };
    }
}

function eliminarEvento(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.deleteEvento(id);
        if (resultado.success) {
            cacheClear('eventos_list');
            cacheClear(`evento_${id}`);
            logApp('Evento eliminado', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error eliminando evento', error.message, 'error');
        return { success: false, error: 'Error al eliminar evento' };
    }
}

function reservarEvento(eventoId, usuarioId, datos = {}) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.reservarEvento(eventoId, usuarioId, datos);
        if (resultado.success) {
            cacheClear('eventos_list');
            cacheClear(`evento_${eventoId}`);
            logApp('Evento reservado', `Evento: ${eventoId}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error reservando evento', error.message, 'error');
        return { success: false, error: 'Error al reservar evento' };
    }
}

// ============================================
// FUNCIONES DE PETICIONES
// ============================================
function obtenerPeticiones(filtros = {}) {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = `peticiones_list_${JSON.stringify(filtros)}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getPeticiones(filtros);
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo peticiones', error.message, 'error');
        return [];
    }
}

function crearPeticion(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addPeticion(datos);
        if (resultado.success) {
            cacheClear('peticiones_list');
            logApp('Petición creada', `Motivo: ${datos.motivo}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error creando petición', error.message, 'error');
        return { success: false, error: 'Error al crear petición' };
    }
}

function orarPeticion(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.orarPeticion(id);
        if (resultado.success) {
            cacheClear('peticiones_list');
            logApp('Oración por petición', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error orando por petición', error.message, 'error');
        return { success: false, error: 'Error al orar por petición' };
    }
}

function cerrarPeticion(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.cerrarPeticion(id);
        if (resultado.success) {
            cacheClear('peticiones_list');
            logApp('Petición cerrada', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error cerrando petición', error.message, 'error');
        return { success: false, error: 'Error al cerrar petición' };
    }
}

// ============================================
// FUNCIONES DE NOTIFICACIONES
// ============================================
function obtenerNotificaciones(limit = 50) {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = `notificaciones_list_${limit}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getNotificaciones(limit);
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo notificaciones', error.message, 'error');
        return [];
    }
}

function marcarNotificacionLeida(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.marcarNotificacionLeida(id);
        if (resultado.success) {
            cacheClear('notificaciones_list');
            logApp('Notificación marcada como leída', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error marcando notificación', error.message, 'error');
        return { success: false, error: 'Error al marcar notificación' };
    }
}

function marcarNotificacionesLeidas() {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.marcarTodasLeidas();
        if (resultado.success) {
            cacheClear('notificaciones_list');
            logApp('Notificaciones marcadas como leídas', '', 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error marcando notificaciones', error.message, 'error');
        return { success: false, error: 'Error al marcar notificaciones' };
    }
}

function obtenerNoLeidas() {
    try {
        const db = getDB();
        if (!db) return 0;
        
        const cacheKey = 'notificaciones_no_leidas';
        const cached = cacheGet(cacheKey);
        if (cached !== null) return cached;
        
        const result = db.getNoLeidas();
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo notificaciones no leídas', error.message, 'error');
        return 0;
    }
}

// ============================================
// FUNCIONES DE PUBLICACIONES
// ============================================
function obtenerPublicaciones(limit = 100, offset = 0) {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = `publicaciones_${limit}_${offset}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getPublicaciones(limit, offset);
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo publicaciones', error.message, 'error');
        return [];
    }
}

function obtenerPublicacion(id) {
    try {
        const db = getDB();
        if (!db) return null;
        
        const cacheKey = `publicacion_${id}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getPublicacion(id);
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo publicación', error.message, 'error');
        return null;
    }
}

function crearPublicacion(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addPublicacion(datos);
        if (resultado.success) {
            cacheClear('publicaciones_');
            cacheClear('publicacion_');
            logApp('Publicación creada', `Autor: ${datos.autor}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error creando publicación', error.message, 'error');
        return { success: false, error: 'Error al crear publicación' };
    }
}

function eliminarPublicacion(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.deletePublicacion(id);
        if (resultado.success) {
            cacheClear('publicaciones_');
            cacheClear(`publicacion_${id}`);
            logApp('Publicación eliminada', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error eliminando publicación', error.message, 'error');
        return { success: false, error: 'Error al eliminar publicación' };
    }
}

function getComentariosPublicacion(publicacionId) {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = `comentarios_${publicacionId}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getComentarios(publicacionId);
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo comentarios', error.message, 'error');
        return [];
    }
}

function agregarComentario(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addComentario(datos);
        if (resultado.success) {
            cacheClear(`comentarios_${datos.publicacion_id}`);
            cacheClear('publicaciones_');
            logApp('Comentario agregado', `Publicación: ${datos.publicacion_id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error agregando comentario', error.message, 'error');
        return { success: false, error: 'Error al agregar comentario' };
    }
}

function eliminarComentario(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.deleteComentario(id);
        if (resultado.success) {
            cacheClear('comentarios_');
            cacheClear('publicaciones_');
            logApp('Comentario eliminado', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error eliminando comentario', error.message, 'error');
        return { success: false, error: 'Error al eliminar comentario' };
    }
}

function toggleReaccion(publicacionId, usuarioId, tipo) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.toggleReaccion(publicacionId, usuarioId, tipo);
        if (resultado.success) {
            cacheClear('publicaciones_');
            cacheClear(`publicacion_${publicacionId}`);
            logApp('Reacción actualizada', `Publicación: ${publicacionId}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error en reacción', error.message, 'error');
        return { success: false, error: 'Error al procesar reacción' };
    }
}

function getReaccionUsuario(publicacionId, usuarioId) {
    try {
        const db = getDB();
        if (!db) return null;
        return db.getReaccionUsuario(publicacionId, usuarioId);
    } catch (error) {
        logApp('Error obteniendo reacción', error.message, 'error');
        return null;
    }
}

function getReaccionesCount(publicacionId) {
    try {
        const db = getDB();
        if (!db) return {};
        return db.getReaccionesCount(publicacionId);
    } catch (error) {
        logApp('Error obteniendo conteo de reacciones', error.message, 'error');
        return {};
    }
}

// ============================================
// FUNCIONES DE ENCUESTAS
// ============================================
function obtenerEncuestas() {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = 'encuestas_list';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getEncuestas();
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo encuestas', error.message, 'error');
        return [];
    }
}

function crearEncuesta(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addEncuesta(datos);
        if (resultado.success) {
            cacheClear('encuestas_list');
            logApp('Encuesta creada', `Título: ${datos.titulo}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error creando encuesta', error.message, 'error');
        return { success: false, error: 'Error al crear encuesta' };
    }
}

function votarEncuesta(encuestaId, preguntaIndex, opcion) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.votarEncuesta(encuestaId, preguntaIndex, opcion);
        if (resultado.success) {
            cacheClear('encuestas_list');
            logApp('Voto registrado', `Encuesta: ${encuestaId}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error votando encuesta', error.message, 'error');
        return { success: false, error: 'Error al votar' };
    }
}

function cerrarEncuesta(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.cerrarEncuesta(id);
        if (resultado.success) {
            cacheClear('encuestas_list');
            logApp('Encuesta cerrada', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error cerrando encuesta', error.message, 'error');
        return { success: false, error: 'Error al cerrar encuesta' };
    }
}

// ============================================
// FUNCIONES DE BIBLIOTECA
// ============================================
function obtenerBiblioteca(categoria = null) {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = `biblioteca_${categoria || 'all'}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getRecursos(categoria);
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo biblioteca', error.message, 'error');
        return [];
    }
}

function agregarRecurso(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addRecurso(datos);
        if (resultado.success) {
            cacheClear('biblioteca_');
            logApp('Recurso agregado', `Título: ${datos.titulo}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error agregando recurso', error.message, 'error');
        return { success: false, error: 'Error al agregar recurso' };
    }
}

function eliminarRecurso(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.deleteRecurso(id);
        if (resultado.success) {
            cacheClear('biblioteca_');
            logApp('Recurso eliminado', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error eliminando recurso', error.message, 'error');
        return { success: false, error: 'Error al eliminar recurso' };
    }
}

// ============================================
// FUNCIONES DE PODCAST
// ============================================
function obtenerPodcast() {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = 'podcast_list';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getPodcast();
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo podcast', error.message, 'error');
        return [];
    }
}

function agregarPodcast(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addPodcast(datos);
        if (resultado.success) {
            cacheClear('podcast_list');
            logApp('Podcast agregado', `Título: ${datos.titulo}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error agregando podcast', error.message, 'error');
        return { success: false, error: 'Error al agregar podcast' };
    }
}

function eliminarPodcast(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.deletePodcast(id);
        if (resultado.success) {
            cacheClear('podcast_list');
            logApp('Podcast eliminado', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error eliminando podcast', error.message, 'error');
        return { success: false, error: 'Error al eliminar podcast' };
    }
}

// ============================================
// FUNCIONES DE GALERIA
// ============================================
function obtenerGaleria() {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = 'galeria_list';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getAlbumes();
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo galería', error.message, 'error');
        return [];
    }
}

function agregarImagen(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addImagen(datos);
        if (resultado.success) {
            cacheClear('galeria_list');
            logApp('Imagen agregada', `Título: ${datos.titulo}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error agregando imagen', error.message, 'error');
        return { success: false, error: 'Error al agregar imagen' };
    }
}

function eliminarImagen(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.deleteImagen(id);
        if (resultado.success) {
            cacheClear('galeria_list');
            logApp('Imagen eliminada', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error eliminando imagen', error.message, 'error');
        return { success: false, error: 'Error al eliminar imagen' };
    }
}

// ============================================
// FUNCIONES DE CHAT
// ============================================
function obtenerMensajes(limit = 100) {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = `chat_mensajes_${limit}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getMensajes(limit);
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo mensajes', error.message, 'error');
        return [];
    }
}

function enviarMensaje(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addMensaje(datos);
        if (resultado.success) {
            cacheClear('chat_mensajes');
            logApp('Mensaje enviado', `Usuario: ${datos.usuario}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error enviando mensaje', error.message, 'error');
        return { success: false, error: 'Error al enviar mensaje' };
    }
}

function eliminarMensaje(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.deleteMensaje(id);
        if (resultado.success) {
            cacheClear('chat_mensajes');
            logApp('Mensaje eliminado', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error eliminando mensaje', error.message, 'error');
        return { success: false, error: 'Error al eliminar mensaje' };
    }
}

// ============================================
// FUNCIONES DE DIRECTORIO
// ============================================
function obtenerDirectorioCompleto(filtros = {}) {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = `directorio_completo_${JSON.stringify(filtros)}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getDirectorio(filtros);
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo directorio completo', error.message, 'error');
        return [];
    }
}

function agregarMiembro(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addMiembro(datos);
        if (resultado.success) {
            cacheClear('directorio_completo');
            logApp('Miembro agregado', `Nombre: ${datos.nombre}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error agregando miembro', error.message, 'error');
        return { success: false, error: 'Error al agregar miembro' };
    }
}

function eliminarMiembro(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.deleteMiembro(id);
        if (resultado.success) {
            cacheClear('directorio_completo');
            logApp('Miembro eliminado', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error eliminando miembro', error.message, 'error');
        return { success: false, error: 'Error al eliminar miembro' };
    }
}

// ============================================
// FUNCIONES DE FAVORITOS
// ============================================
function obtenerFavoritos(usuarioId) {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = `favoritos_${usuarioId}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getFavoritos(usuarioId);
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo favoritos', error.message, 'error');
        return [];
    }
}

function toggleFavorito(usuarioId, itemId, tipo) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.toggleFavorito(usuarioId, itemId, tipo);
        if (resultado.success) {
            cacheClear(`favoritos_${usuarioId}`);
            logApp('Favorito actualizado', `Usuario: ${usuarioId}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error actualizando favorito', error.message, 'error');
        return { success: false, error: 'Error al actualizar favorito' };
    }
}

// ============================================
// FUNCIONES DE METAS
// ============================================
function obtenerMetas(usuarioId) {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = `metas_${usuarioId}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getMetas(usuarioId);
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo metas', error.message, 'error');
        return [];
    }
}

function crearMeta(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addMeta(datos);
        if (resultado.success) {
            cacheClear(`metas_${datos.usuario_id}`);
            logApp('Meta creada', `Título: ${datos.titulo}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error creando meta', error.message, 'error');
        return { success: false, error: 'Error al crear meta' };
    }
}

function actualizarMetaProgreso(id, progreso) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.updateMetaProgreso(id, progreso);
        if (resultado.success) {
            const meta = resultado.data;
            cacheClear(`metas_${meta.usuario_id}`);
            logApp('Meta actualizada', `ID: ${id}, Progreso: ${progreso}%`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error actualizando meta', error.message, 'error');
        return { success: false, error: 'Error al actualizar meta' };
    }
}

// ============================================
// FUNCIONES DE MISIONES
// ============================================
function obtenerMisiones() {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = 'misiones_list';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getMisiones();
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo misiones', error.message, 'error');
        return [];
    }
}

function crearMision(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addMision(datos);
        if (resultado.success) {
            cacheClear('misiones_list');
            logApp('Misión creada', `Título: ${datos.titulo}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error creando misión', error.message, 'error');
        return { success: false, error: 'Error al crear misión' };
    }
}

function donarMision(id, monto, donante) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.donarMision(id, monto, donante);
        if (resultado.success) {
            cacheClear('misiones_list');
            logApp('Donación a misión', `ID: ${id}, Monto: ${monto}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error donando a misión', error.message, 'error');
        return { success: false, error: 'Error al donar a misión' };
    }
}

// ============================================
// FUNCIONES DE TESTIMONIOS
// ============================================
function obtenerTestimonios() {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = 'testimonios_list';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getTestimonios();
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo testimonios', error.message, 'error');
        return [];
    }
}

function crearTestimonio(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addTestimonio(datos);
        if (resultado.success) {
            cacheClear('testimonios_list');
            logApp('Testimonio creado', `Autor: ${datos.autor}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error creando testimonio', error.message, 'error');
        return { success: false, error: 'Error al crear testimonio' };
    }
}

// ============================================
// FUNCIONES DE GRUPOS
// ============================================
function obtenerGrupos() {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = 'grupos_list';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getGrupos();
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo grupos', error.message, 'error');
        return [];
    }
}

function crearGrupo(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addGrupo(datos);
        if (resultado.success) {
            cacheClear('grupos_list');
            logApp('Grupo creado', `Nombre: ${datos.nombre}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error creando grupo', error.message, 'error');
        return { success: false, error: 'Error al crear grupo' };
    }
}

function unirseGrupo(grupoId, usuarioId) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.unirseGrupo(grupoId, usuarioId);
        if (resultado.success) {
            cacheClear('grupos_list');
            logApp('Usuario unido a grupo', `Grupo: ${grupoId}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error uniéndose a grupo', error.message, 'error');
        return { success: false, error: 'Error al unirse al grupo' };
    }
}

// ============================================
// FUNCIONES DE DONACIONES
// ============================================
function obtenerDonaciones() {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = 'donaciones_list';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getDonaciones();
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo donaciones', error.message, 'error');
        return [];
    }
}

function registrarDonacion(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addDonacion(datos);
        if (resultado.success) {
            cacheClear('donaciones_list');
            logApp('Donación registrada', `Usuario: ${datos.usuario_id}, Monto: ${datos.monto}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error registrando donación', error.message, 'error');
        return { success: false, error: 'Error al registrar donación' };
    }
}

// ============================================
// FUNCIONES DE INSIGNIAS
// ============================================
function obtenerInsignias() {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = 'insignias_list';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getInsignias();
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo insignias', error.message, 'error');
        return [];
    }
}

function obtenerInsigniasUsuario(usuarioId) {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = `insignias_usuario_${usuarioId}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getInsigniasUsuario(usuarioId);
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo insignias de usuario', error.message, 'error');
        return [];
    }
}

function asignarInsignia(usuarioId, insigniaId) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.asignarInsignia(usuarioId, insigniaId);
        if (resultado.success) {
            cacheClear(`insignias_usuario_${usuarioId}`);
            logApp('Insignia asignada', `Usuario: ${usuarioId}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error asignando insignia', error.message, 'error');
        return { success: false, error: 'Error al asignar insignia' };
    }
}

// ============================================
// FUNCIONES DE REPORTES v18.0 (NUEVO)
// ============================================

/**
 * Obtiene todos los reportes con filtros opcionales
 */
function obtenerReportes(filtros = {}) {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = `reportes_list_${JSON.stringify(filtros)}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getReportes(filtros);
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo reportes', error.message, 'error');
        return [];
    }
}

/**
 * Obtiene un reporte por ID
 */
function obtenerReporte(id) {
    try {
        const db = getDB();
        if (!db) return null;
        
        const cacheKey = `reporte_${id}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getReporte(id);
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo reporte', error.message, 'error');
        return null;
    }
}

/**
 * Obtiene reportes pendientes
 */
function obtenerReportesPendientes() {
    try {
        const db = getDB();
        if (!db) return [];
        
        const cacheKey = 'reportes_pendientes';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getReportesPendientes();
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo reportes pendientes', error.message, 'error');
        return [];
    }
}

/**
 * Crea un nuevo reporte
 */
function crearReporte(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        if (!datos.tipo || !datos.reportado_por || !datos.descripcion) {
            return { success: false, error: 'Datos incompletos para el reporte' };
        }

        const resultado = db.addReporte(datos);
        if (resultado.success) {
            cacheClear('reportes_');
            cacheClear('reporte_');
            logApp('Reporte creado', `Tipo: ${datos.tipo}, Urgencia: ${datos.urgencia}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error creando reporte', error.message, 'error');
        return { success: false, error: 'Error al crear reporte' };
    }
}

/**
 * Cambia el estado de un reporte
 */
function cambiarEstadoReporte(id, nuevoEstado, usuarioAdmin = 'Admin', comentario = '') {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.cambiarEstadoReporte(id, nuevoEstado, usuarioAdmin, comentario);
        if (resultado.success) {
            cacheClear('reportes_');
            cacheClear(`reporte_${id}`);
            logApp('Estado de reporte cambiado', `ID: ${id}, Estado: ${nuevoEstado}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error cambiando estado de reporte', error.message, 'error');
        return { success: false, error: 'Error al cambiar estado de reporte' };
    }
}

/**
 * Agrega notas administrativas a un reporte
 */
function agregarNotaReporte(id, nota, usuarioAdmin = 'Admin') {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.agregarNotaReporte(id, nota, usuarioAdmin);
        if (resultado.success) {
            cacheClear(`reporte_${id}`);
            logApp('Nota agregada a reporte', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error agregando nota a reporte', error.message, 'error');
        return { success: false, error: 'Error al agregar nota' };
    }
}

/**
 * Elimina un reporte
 */
function eliminarReporte(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.deleteReporte(id);
        if (resultado.success) {
            cacheClear('reportes_');
            cacheClear(`reporte_${id}`);
            logApp('Reporte eliminado', `ID: ${id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error eliminando reporte', error.message, 'error');
        return { success: false, error: 'Error al eliminar reporte' };
    }
}

/**
 * Obtiene estadísticas de reportes
 */
function obtenerEstadisticasReportes() {
    try {
        const db = getDB();
        if (!db) return {};
        
        const cacheKey = 'estadisticas_reportes';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getEstadisticasReportes();
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo estadísticas de reportes', error.message, 'error');
        return {};
    }
}

/**
 * Obtiene la configuración de reportes
 */
function obtenerConfiguracionReportes() {
    try {
        const db = getDB();
        if (!db) return null;
        return db.getConfiguracionReportes();
    } catch (error) {
        logApp('Error obteniendo configuración de reportes', error.message, 'error');
        return null;
    }
}

/**
 * Actualiza la configuración de reportes
 */
function actualizarConfiguracionReportes(config) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.updateConfiguracionReportes(config);
        if (resultado.success) {
            cacheClear('estadisticas_reportes');
            logApp('Configuración de reportes actualizada', '', 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error actualizando configuración de reportes', error.message, 'error');
        return { success: false, error: 'Error al actualizar configuración' };
    }
}

// ============================================
// FUNCIONES DE ESTADÍSTICAS Y SISTEMA
// ============================================
function obtenerEstadisticas() {
    try {
        const db = getDB();
        if (!db) return {};
        
        const cacheKey = 'estadisticas_globales';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        
        const result = db.getEstadisticas();
        cacheSet(cacheKey, result);
        return result;
    } catch (error) {
        logApp('Error obteniendo estadísticas', error.message, 'error');
        return {};
    }
}

function obtenerConfiguracion() {
    try {
        const db = getDB();
        if (!db) return null;
        return db.getConfiguracion();
    } catch (error) {
        logApp('Error obteniendo configuración', error.message, 'error');
        return null;
    }
}

function actualizarConfiguracion(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.updateConfiguracion(datos);
        if (resultado.success) {
            cacheClear();
            logApp('Configuración actualizada', '', 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error actualizando configuración', error.message, 'error');
        return { success: false, error: 'Error al actualizar configuración' };
    }
}

function obtenerConfiguracionIglesia() {
    try {
        const db = getDB();
        if (!db) return {};
        return db.getConfiguracionIglesia();
    } catch (error) {
        logApp('Error obteniendo configuración de iglesia', error.message, 'error');
        return {};
    }
}

function actualizarConfiguracionIglesia(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.updateConfiguracionIglesia(datos);
        if (resultado.success) {
            cacheClear();
            logApp('Configuración de iglesia actualizada', '', 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error actualizando configuración de iglesia', error.message, 'error');
        return { success: false, error: 'Error al actualizar configuración' };
    }
}

function exportarDatos() {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const datos = db.exportarTodo();
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ipuc_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        logApp('Datos exportados', '', 'info');
        return { success: true };
    } catch (error) {
        logApp('Error exportando datos', error.message, 'error');
        return { success: false, error: 'Error al exportar datos' };
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
                    const resultado = db.importarTodo(datos);
                    if (resultado.success) {
                        cacheClear();
                        logApp('Datos importados', '', 'success');
                        resolve({ success: true });
                    } else {
                        resolve({ success: false, error: resultado.error });
                    }
                } catch (err) {
                    logApp('Error importando datos', err.message, 'error');
                    resolve({ success: false, error: 'Error al procesar el archivo' });
                }
            };
            reader.onerror = function() {
                resolve({ success: false, error: 'Error al leer el archivo' });
            };
            reader.readAsText(archivo);
        } catch (error) {
            logApp('Error en importación', error.message, 'error');
            resolve({ success: false, error: 'Error al importar datos' });
        }
    });
}

function limpiarDatos() {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.limpiarTodo();
        if (resultado.success) {
            cacheClear();
            logApp('Datos limpiados', '', 'warning');
        }
        return resultado;
    } catch (error) {
        logApp('Error limpiando datos', error.message, 'error');
        return { success: false, error: 'Error al limpiar datos' };
    }
}

function obtenerLogs(limit = 100) {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getLogs(limit);
    } catch (error) {
        logApp('Error obteniendo logs', error.message, 'error');
        return [];
    }
}

// ============================================
// FUNCIÓN DE INICIALIZACIÓN v18.0
// ============================================
function iniciarApp() {
    try {
        const db = getDB();
        if (!db) {
            logApp('Error: Database no disponible en iniciarApp', '', 'error');
            return { success: false, error: 'Database no disponible' };
        }

        logApp('Iniciando aplicación', `Versión ${VERSION}`, 'info');
        
        limpiarTokensExpirados();
        
        const sesion = verificarSesion();
        if (sesion.success) {
            logApp('Sesión activa', `Usuario: ${sesion.usuario.usuario}`, 'info');
        }
        
        // Limpiar logs antiguos
        try {
            const logs = JSON.parse(localStorage.getItem('ipuc18_app_logs') || '[]');
            if (logs.length > 1000) {
                localStorage.setItem('ipuc18_app_logs', JSON.stringify(logs.slice(-500)));
            }
        } catch (e) {}
        
        return {
            success: true,
            version: VERSION,
            sesion: sesion,
            mensaje: 'Aplicación iniciada correctamente'
        };
    } catch (error) {
        logApp('Error iniciando aplicación', error.message, 'error');
        return { success: false, error: 'Error al iniciar la aplicación' };
    }
}

// ============================================
// EXPORTAR FUNCIONES GLOBALES v18.0
// ============================================

// Autenticación
window.login = login;
window.registro = registro;
window.logout = logout;
window.verificarSesion = verificarSesion;
window.esAdmin = esAdmin;
window.esUsuario = esUsuario;
window.obtenerUsuarioActual = obtenerUsuarioActual;
window.crearPrimerAdmin = crearPrimerAdmin;
window.hayAdministrador = hayAdministrador;

// Usuarios
window.obtenerUsuarios = obtenerUsuarios;
window.obtenerUsuario = obtenerUsuario;
window.actualizarUsuario = actualizarUsuario;
window.verificarUsuario = verificarUsuario;
window.cambiarPassword = cambiarPassword;
window.obtenerDirectorio = obtenerDirectorio;

// Asistencia
window.obtenerAsistencia = obtenerAsistencia;
window.registrarAsistencia = registrarAsistencia;
window.obtenerEstadisticasAsistencia = obtenerEstadisticasAsistencia;

// Cultos y Horarios
window.obtenerProximoCulto = obtenerProximoCulto;
window.obtenerHorarios = obtenerHorarios;
window.actualizarHorarios = actualizarHorarios;

// Versículos
window.obtenerVersiculoDiario = obtenerVersiculoDiario;
window.obtenerVersiculos = obtenerVersiculos;
window.crearVersiculo = crearVersiculo;
window.eliminarVersiculo = eliminarVersiculo;

// Noticias
window.obtenerNoticias = obtenerNoticias;
window.crearNoticia = crearNoticia;
window.eliminarNoticia = eliminarNoticia;

// Eventos
window.obtenerEventos = obtenerEventos;
window.obtenerEvento = obtenerEvento;
window.crearEvento = crearEvento;
window.eliminarEvento = eliminarEvento;
window.reservarEvento = reservarEvento;

// Peticiones
window.obtenerPeticiones = obtenerPeticiones;
window.crearPeticion = crearPeticion;
window.orarPeticion = orarPeticion;
window.cerrarPeticion = cerrarPeticion;

// Notificaciones
window.obtenerNotificaciones = obtenerNotificaciones;
window.marcarNotificacionLeida = marcarNotificacionLeida;
window.marcarNotificacionesLeidas = marcarNotificacionesLeidas;
window.obtenerNoLeidas = obtenerNoLeidas;

// Publicaciones
window.obtenerPublicaciones = obtenerPublicaciones;
window.obtenerPublicacion = obtenerPublicacion;
window.crearPublicacion = crearPublicacion;
window.eliminarPublicacion = eliminarPublicacion;
window.getComentariosPublicacion = getComentariosPublicacion;
window.agregarComentario = agregarComentario;
window.eliminarComentario = eliminarComentario;
window.toggleReaccion = toggleReaccion;
window.getReaccionUsuario = getReaccionUsuario;
window.getReaccionesCount = getReaccionesCount;

// Encuestas
window.obtenerEncuestas = obtenerEncuestas;
window.crearEncuesta = crearEncuesta;
window.votarEncuesta = votarEncuesta;
window.cerrarEncuesta = cerrarEncuesta;

// Biblioteca
window.obtenerBiblioteca = obtenerBiblioteca;
window.agregarRecurso = agregarRecurso;
window.eliminarRecurso = eliminarRecurso;

// Podcast
window.obtenerPodcast = obtenerPodcast;
window.agregarPodcast = agregarPodcast;
window.eliminarPodcast = eliminarPodcast;

// Galeria
window.obtenerGaleria = obtenerGaleria;
window.agregarImagen = agregarImagen;
window.eliminarImagen = eliminarImagen;

// Chat
window.obtenerMensajes = obtenerMensajes;
window.enviarMensaje = enviarMensaje;
window.eliminarMensaje = eliminarMensaje;

// Directorio
window.obtenerDirectorioCompleto = obtenerDirectorioCompleto;
window.agregarMiembro = agregarMiembro;
window.eliminarMiembro = eliminarMiembro;

// Favoritos
window.obtenerFavoritos = obtenerFavoritos;
window.toggleFavorito = toggleFavorito;

// Metas
window.obtenerMetas = obtenerMetas;
window.crearMeta = crearMeta;
window.actualizarMetaProgreso = actualizarMetaProgreso;

// Misiones
window.obtenerMisiones = obtenerMisiones;
window.crearMision = crearMision;
window.donarMision = donarMision;

// Testimonios
window.obtenerTestimonios = obtenerTestimonios;
window.crearTestimonio = crearTestimonio;

// Grupos
window.obtenerGrupos = obtenerGrupos;
window.crearGrupo = crearGrupo;
window.unirseGrupo = unirseGrupo;

// Donaciones
window.obtenerDonaciones = obtenerDonaciones;
window.registrarDonacion = registrarDonacion;

// Insignias
window.obtenerInsignias = obtenerInsignias;
window.obtenerInsigniasUsuario = obtenerInsigniasUsuario;
window.asignarInsignia = asignarInsignia;

// NUEVO v18: Reportes
window.obtenerReportes = obtenerReportes;
window.obtenerReporte = obtenerReporte;
window.obtenerReportesPendientes = obtenerReportesPendientes;
window.crearReporte = crearReporte;
window.cambiarEstadoReporte = cambiarEstadoReporte;
window.agregarNotaReporte = agregarNotaReporte;
window.eliminarReporte = eliminarReporte;
window.obtenerEstadisticasReportes = obtenerEstadisticasReportes;
window.obtenerConfiguracionReportes = obtenerConfiguracionReportes;
window.actualizarConfiguracionReportes = actualizarConfiguracionReportes;

// Estadísticas y Sistema
window.obtenerEstadisticas = obtenerEstadisticas;
window.obtenerConfiguracion = obtenerConfiguracion;
window.actualizarConfiguracion = actualizarConfiguracion;
window.obtenerConfiguracionIglesia = obtenerConfiguracionIglesia;
window.actualizarConfiguracionIglesia = actualizarConfiguracionIglesia;
window.exportarDatos = exportarDatos;
window.importarDatos = importarDatos;
window.limpiarDatos = limpiarDatos;
window.obtenerLogs = obtenerLogs;
window.iniciarApp = iniciarApp;

// Log y Caché
window.logApp = logApp;
window.cacheClear = cacheClear;

// ============================================
// INICIALIZAR APLICACIÓN v18.0
// ============================================
iniciarApp();
