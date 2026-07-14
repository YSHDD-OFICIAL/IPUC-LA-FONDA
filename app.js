// ============================================
// IPUC LA FONDA - app.js v5.1 COMPLETO
// Funciones helper para la aplicación
// Incluye publicaciones, comentarios y reacciones
// MEJORADA - OPTIMIZADA - 100% OPERATIVA
// Usa la instancia global "db" de database.js
// "Donde el Espíritu Santo se mueve"
// ============================================

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const VERSION = "5.1";
const MAX_INTENTOS = 5;
const TIEMPO_BLOQUEO = 15; // minutos
const DURACION_TOKEN = 24; // horas

const TOKENS = {};
const INTENTOS_FALLIDOS = {};
const BLOQUEOS_TEMPORALES = {};

// ============================================
// SISTEMA DE LOGS (SILENCIOSO - SIN CONSOLE)
// ============================================
function logApp(accion, detalle = '', nivel = 'info') {
    const entry = {
        timestamp: new Date().toISOString(),
        accion,
        detalle,
        nivel,
        version: VERSION
    };
    
    // Guardar en localStorage para debugging (sin console.log)
    try {
        const logs = JSON.parse(localStorage.getItem('ipuc5_app_logs') || '[]');
        logs.push(entry);
        if (logs.length > 500) logs.shift();
        localStorage.setItem('ipuc5_app_logs', JSON.stringify(logs));
    } catch (e) {}
}

// ============================================
// FUNCIONES DE SEGURIDAD
// ============================================
function generarToken() {
    return 't5_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
    // Intentar cargar si existe en el scope global
    if (typeof db !== 'undefined' && db) {
        return db;
    }
    logApp('Error: Database no disponible', '', 'error');
    return null;
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================
function login(usuario, password) {
    try {
        const db = getDB();
        if (!db) {
            return { success: false, error: 'Base de datos no disponible' };
        }

        // Validar intentos fallidos
        const verificar = verificarIntentosFallidos(usuario);
        if (verificar.bloqueado) {
            return { 
                success: false, 
                error: `Cuenta bloqueada. Intenta en ${verificar.minutosRestantes} minutos` 
            };
        }

        const resultado = db.login(usuario, password);
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
            creado: new Date().toISOString(),
            ip: resultado.ip || 'local'
        };

        localStorage.setItem('ipuc5_token', token);
        localStorage.setItem('ipuc5_usuario', JSON.stringify(resultado.usuario));
        localStorage.setItem('ipuc5_rol', resultado.rol);

        delete INTENTOS_FALLIDOS[usuario];
        delete BLOQUEOS_TEMPORALES[usuario];

        registrarActividad(resultado.usuario.id, 'Inicio de sesión', `Rol: ${resultado.rol}`);
        logApp('Login exitoso', `Usuario: ${resultado.usuario.usuario}`, 'success');

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
            if (db._agregarNotificacion) {
                db._agregarNotificacion({
                    titulo: 'Nuevo usuario',
                    mensaje: `${datos.nombre} se ha registrado en la comunidad`,
                    tipo: 'usuario'
                });
            }
            registrarActividad(resultado.data.id, 'Registro de usuario');
            logApp('Registro exitoso', `Usuario: ${datos.usuario}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error en registro', error.message, 'error');
        return { success: false, error: 'Error en el servidor' };
    }
}

function logout() {
    try {
        const token = localStorage.getItem('ipuc5_token');
        if (token && TOKENS[token]) {
            registrarActividad(TOKENS[token].usuario.id, 'Cierre de sesión');
            delete TOKENS[token];
        }
        ['ipuc5_token', 'ipuc5_usuario', 'ipuc5_rol'].forEach(k => localStorage.removeItem(k));
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

        const token = localStorage.getItem('ipuc5_token');
        const usuarioData = localStorage.getItem('ipuc5_usuario');
        const rol = localStorage.getItem('ipuc5_rol');

        if (!token || !usuarioData) {
            return { success: false, message: 'No hay sesión activa' };
        }

        const tokenValido = verificarToken(token);
        if (!tokenValido) {
            localStorage.removeItem('ipuc5_token');
            return { success: false, message: 'Sesión expirada' };
        }

        const usuario = JSON.parse(usuarioData);
        
        const userExists = db.cargar('usuarios')?.usuarios?.find(u => u.id === usuario.id);
        if (!userExists) {
            const adminExists = db.cargar('administradores')?.administradores?.find(a => a.id === usuario.id);
            if (!adminExists) {
                localStorage.removeItem('ipuc5_token');
                localStorage.removeItem('ipuc5_usuario');
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
            if (db._agregarNotificacion) {
                db._agregarNotificacion({
                    titulo: 'Administrador creado',
                    mensaje: `El primer administrador ha sido configurado`,
                    tipo: 'sistema'
                });
            }
            registrarActividad(1, 'Primer administrador creado');
            logApp('Admin creado', `Usuario: ${datos.usuario}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error creando admin', error.message, 'error');
        return { success: false, error: 'Error al crear administrador' };
    }
}

// ============================================
// FUNCIONES DE USUARIOS
// ============================================
function obtenerUsuarios() {
    try {
        const db = getDB();
        if (!db) return [];
        const u = db.cargar('usuarios');
        return (u?.usuarios || []).map(x => {
            const { password, ...resto } = x;
            return resto;
        });
    } catch (error) {
        logApp('Error obteniendo usuarios', error.message, 'error');
        return [];
    }
}

function obtenerUsuario(id) {
    try {
        const db = getDB();
        if (!db) return null;
        const u = db.cargar('usuarios');
        const user = (u?.usuarios || []).find(x => x.id === id);
        if (!user) return null;
        const { password, ...resto } = user;
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

        const camposPermitidos = ['nombre', 'apellidos', 'celular', 'direccion', 'ministerio', 'foto', 'estado'];
        camposPermitidos.forEach(c => {
            if (datos[c] !== undefined) u.usuarios[idx][c] = datos[c];
        });

        db.guardar('usuarios', u);
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
        if (!u.usuarios[idx].insignias.includes('Cuenta Verificada')) {
            u.usuarios[idx].insignias.push('Cuenta Verificada');
        }

        db.guardar('usuarios', u);
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
        const u = db.cargar('usuarios');
        return (u?.usuarios || []).map(x => ({
            id: x.id,
            nombre: x.nombre,
            apellidos: x.apellidos || '',
            foto: x.foto,
            ministerio: x.ministerio,
            verificado: x.verificado || false,
            estado: x.estado || 'activo'
        }));
    } catch (error) {
        logApp('Error obteniendo directorio', error.message, 'error');
        return [];
    }
}

// ============================================
// FUNCIONES DE ASISTENCIA
// ============================================
function obtenerAsistencia(uid = null) {
    try {
        const db = getDB();
        if (!db) return [];
        const r = db.getAsistencia();
        return uid ? r.filter(x => x.usuario_id === uid) : r;
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
        return db.cargar('estadisticas')?.asistencia || {};
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
        return db.cargar('horarios')?.cultos || [];
    } catch (error) {
        logApp('Error obteniendo horarios', error.message, 'error');
        return [];
    }
}

// ============================================
// FUNCIONES DE VERSÍCULOS
// ============================================
function obtenerVersiculoDiario() {
    try {
        const db = getDB();
        if (!db) return null;

        const data = db.cargar('versiculos');
        const hoy = new Date().toISOString().split('T')[0];
        let actual = data?.versiculo_actual;

        if (!actual || actual.fecha !== hoy) {
            const lista = data?.versiculos || [];
            if (lista.length > 0) {
                const index = new Date().getDay() % lista.length;
                actual = {
                    ...lista[index],
                    fecha: hoy,
                    dia: new Date().toLocaleDateString('es-CO', { weekday: 'long' })
                };
                data.versiculo_actual = actual;
                db.guardar('versiculos', data);
            } else {
                actual = {
                    texto: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
                    referencia: "Juan 3:16",
                    tipo: "promesa",
                    fecha: hoy,
                    dia: new Date().toLocaleDateString('es-CO', { weekday: 'long' })
                };
            }
        }
        return actual;
    } catch (error) {
        logApp('Error obteniendo versículo diario', error.message, 'error');
        return null;
    }
}

function obtenerVersiculos() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.cargar('versiculos')?.versiculos || [];
    } catch (error) {
        logApp('Error obteniendo versículos', error.message, 'error');
        return [];
    }
}

function crearVersiculo(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        if (!datos.texto || !datos.referencia) {
            return { success: false, error: 'Texto y referencia requeridos' };
        }

        const v = db.cargar('versiculos');
        const nuevo = {
            id: (v.versiculos?.length || 0) + 1,
            texto: datos.texto.trim(),
            referencia: datos.referencia.trim(),
            tipo: datos.tipo || 'versiculo'
        };

        if (!v.versiculos) v.versiculos = [];
        v.versiculos.push(nuevo);
        v.ultimo_id = nuevo.id;

        db.guardar('versiculos', v);
        logApp('Versículo creado', `Referencia: ${nuevo.referencia}`, 'success');
        return { success: true, data: nuevo };
    } catch (error) {
        logApp('Error creando versículo', error.message, 'error');
        return { success: false, error: 'Error al crear versículo' };
    }
}

function eliminarVersiculo(id) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const v = db.cargar('versiculos');
        v.versiculos = (v.versiculos || []).filter(x => x.id !== id);
        db.guardar('versiculos', v);
        logApp('Versículo eliminado', `ID: ${id}`, 'info');
        return { success: true, mensaje: 'Versículo eliminado' };
    } catch (error) {
        logApp('Error eliminando versículo', error.message, 'error');
        return { success: false, error: 'Error al eliminar versículo' };
    }
}

// ============================================
// FUNCIONES DE NOTICIAS
// ============================================
function obtenerNoticias() {
    try {
        const db = getDB();
        if (!db) return [];
        const n = db.getNoticias();
        return n.filter(x => x.estado === 'publicado')
            .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));
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

        const n = db.cargar('noticias');
        n.noticias = (n.noticias || []).filter(x => x.id !== id);
        db.guardar('noticias', n);
        logApp('Noticia eliminada', `ID: ${id}`, 'info');
        return { success: true, mensaje: 'Noticia eliminada' };
    } catch (error) {
        logApp('Error eliminando noticia', error.message, 'error');
        return { success: false, error: 'Error al eliminar noticia' };
    }
}

// ============================================
// FUNCIONES DE EVENTOS
// ============================================
function obtenerEventos() {
    try {
        const db = getDB();
        if (!db) return [];
        const e = db.getEventos();
        const hoy = new Date().toISOString().split('T')[0];
        return e.filter(x => x.fecha >= hoy)
            .sort((a, b) => a.fecha.localeCompare(b.fecha));
    } catch (error) {
        logApp('Error obteniendo eventos', error.message, 'error');
        return [];
    }
}

function crearEvento(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addEvento(datos);
        if (resultado.success) {
            logApp('Evento creado', `Título: ${datos.titulo}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error creando evento', error.message, 'error');
        return { success: false, error: 'Error al crear evento' };
    }
}

// ============================================
// FUNCIONES DE PETICIONES
// ============================================
function obtenerPeticiones() {
    try {
        const db = getDB();
        if (!db) return [];
        const p = db.getPeticiones();
        return p.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
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
            logApp('Petición creada', `Motivo: ${datos.motivo}`, 'success');
        }
        return resultado;
    } catch (error) {
        logApp('Error creando petición', error.message, 'error');
        return { success: false, error: 'Error al crear petición' };
    }
}

// ============================================
// FUNCIONES DE NOTIFICACIONES
// ============================================
function obtenerNotificaciones() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getNotificaciones();
    } catch (error) {
        logApp('Error obteniendo notificaciones', error.message, 'error');
        return [];
    }
}

function crearNotificacion(datos) {
    try {
        const db = getDB();
        if (!db) return null;
        return db.addNotificacion(datos);
    } catch (error) {
        logApp('Error creando notificación', error.message, 'error');
        return null;
    }
}

function marcarNotificacionesLeidas() {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        db.marcarTodasLeidas();
        logApp('Notificaciones marcadas como leídas', '', 'info');
        return { success: true };
    } catch (error) {
        logApp('Error marcando notificaciones', error.message, 'error');
        return { success: false, error: 'Error al marcar notificaciones' };
    }
}

function obtenerNoLeidas() {
    try {
        const db = getDB();
        if (!db) return 0;
        return db.getNoLeidas();
    } catch (error) {
        logApp('Error obteniendo notificaciones no leídas', error.message, 'error');
        return 0;
    }
}

// ============================================
// FUNCIONES DE PUBLICACIONES
// ============================================
function obtenerPublicaciones() {
    try {
        const db = getDB();
        if (!db) return [];
        return db.getPublicaciones();
    } catch (error) {
        logApp('Error obteniendo publicaciones', error.message, 'error');
        return [];
    }
}

function crearPublicacion(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.addPublicacion(datos);
        if (resultado.success) {
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
        return db.getComentarios(publicacionId);
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
            logApp('Comentario agregado', `Publicación: ${datos.publicacion_id}`, 'info');
        }
        return resultado;
    } catch (error) {
        logApp('Error agregando comentario', error.message, 'error');
        return { success: false, error: 'Error al agregar comentario' };
    }
}

function toggleReaccion(publicacionId, usuarioId, tipo) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const resultado = db.toggleReaccion(publicacionId, usuarioId, tipo);
        if (resultado.success) {
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

// ============================================
// FUNCIONES DE ESTADÍSTICAS Y SISTEMA
// ============================================
function obtenerEstadisticas() {
    try {
        const db = getDB();
        if (!db) return {};
        return db.getEstadisticas();
    } catch (error) {
        logApp('Error obteniendo estadísticas', error.message, 'error');
        return {};
    }
}

function obtenerConfiguracion() {
    try {
        const db = getDB();
        if (!db) return null;
        return db.cargar('configuracion');
    } catch (error) {
        logApp('Error obteniendo configuración', error.message, 'error');
        return null;
    }
}

function actualizarConfiguracion(datos) {
    try {
        const db = getDB();
        if (!db) return { success: false, error: 'Base de datos no disponible' };

        const c = db.cargar('configuracion');
        if (datos.iglesia) Object.assign(c.iglesia, datos.iglesia);
        if (datos.aplicacion) Object.assign(c.aplicacion, datos.aplicacion);
        db.guardar('configuracion', c);
        logApp('Configuración actualizada', '', 'info');
        return { success: true, data: c };
    } catch (error) {
        logApp('Error actualizando configuración', error.message, 'error');
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

// ============================================
// FUNCIÓN DE INICIALIZACIÓN
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
        
        try {
            const logs = JSON.parse(localStorage.getItem('ipuc5_app_logs') || '[]');
            if (logs.length > 1000) {
                localStorage.setItem('ipuc5_app_logs', JSON.stringify(logs.slice(-500)));
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
// EXPORTAR FUNCIONES GLOBALES
// ============================================
// Autenticación
window.login = login;
window.registro = registro;
window.logout = logout;
window.verificarSesion = verificarSesion;
window.crearPrimerAdmin = crearPrimerAdmin;

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
window.crearEvento = crearEvento;

// Peticiones
window.obtenerPeticiones = obtenerPeticiones;
window.crearPeticion = crearPeticion;

// Notificaciones
window.obtenerNotificaciones = obtenerNotificaciones;
window.crearNotificacion = crearNotificacion;
window.marcarNotificacionesLeidas = marcarNotificacionesLeidas;
window.obtenerNoLeidas = obtenerNoLeidas;

// Publicaciones
window.obtenerPublicaciones = obtenerPublicaciones;
window.crearPublicacion = crearPublicacion;
window.eliminarPublicacion = eliminarPublicacion;
window.getComentariosPublicacion = getComentariosPublicacion;
window.agregarComentario = agregarComentario;
window.toggleReaccion = toggleReaccion;
window.getReaccionUsuario = getReaccionUsuario;

// Estadísticas y Sistema
window.obtenerEstadisticas = obtenerEstadisticas;
window.obtenerConfiguracion = obtenerConfiguracion;
window.actualizarConfiguracion = actualizarConfiguracion;
window.exportarDatos = exportarDatos;
window.importarDatos = importarDatos;
window.iniciarApp = iniciarApp;

// Log
window.logApp = logApp;

// ============================================
// INICIALIZAR (SIN CONSOLE.LOG)
// ============================================
iniciarApp();
