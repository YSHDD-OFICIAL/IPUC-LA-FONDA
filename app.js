// ============================================
// IPUC LA FONDA - API v5.0 (JavaScript)
// Lógica de servidor convertida a Frontend
// Autenticación local - Sin backend externo
// "Donde el Espíritu Santo se mueve"
// ============================================

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const VERSION = "5.0";
const MAX_INTENTOS = 5;
const TIEMPO_BLOQUEO = 15; // minutos
const DURACION_TOKEN = 24; // horas

// Almacenamiento en memoria
const TOKENS = {};
const INTENTOS_FALLIDOS = {};
const BLOQUEOS_TEMPORALES = {};

// ============================================
// CLASE DATABASE (localStorage)
// ============================================
class Database {
    constructor() { this.prefix = 'ipuc5_'; this.cache = {}; this.cacheTimeout = 300; this.lastCacheUpdate = {}; }
    _getKey(n) { return this.prefix + n; }
    
    cargar(n) {
        const k = this._getKey(n);
        if (this.cache[k] && this.lastCacheUpdate[k] && (Date.now() - this.lastCacheUpdate[k] < this.cacheTimeout * 1000)) return JSON.parse(JSON.stringify(this.cache[k]));
        const d = localStorage.getItem(k); if (!d) return null;
        try { const p = JSON.parse(d); this.cache[k] = JSON.parse(JSON.stringify(p)); this.lastCacheUpdate[k] = Date.now(); return p; } catch (e) { return null; }
    }
    
    guardar(n, d) {
        try { localStorage.setItem(this._getKey(n), JSON.stringify(d)); this.cache[this._getKey(n)] = JSON.parse(JSON.stringify(d)); this.lastCacheUpdate[this._getKey(n)] = Date.now(); return true; } catch (e) { return false; }
    }
    
    eliminar(n) { localStorage.removeItem(this._getKey(n)); delete this.cache[this._getKey(n)]; }
    
    inicializarDatos() {
        const a = new Date().toISOString();
        const datos = {
            'usuarios': { usuarios: [], ultimo_id: 0 },
            'administradores': { administradores: [], ultimo_id: 0 },
            'versiculos': { versiculos: [{ id: 1, texto: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", referencia: "Juan 3:16", tipo: "promesa" }, { id: 2, texto: "Jehová es mi pastor; nada me faltará.", referencia: "Salmos 23:1", tipo: "salmo" }, { id: 3, texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13", tipo: "promesa" }, { id: 4, texto: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", referencia: "Mateo 6:33", tipo: "versiculo" }, { id: 5, texto: "Jehová te bendiga, y te guarde.", referencia: "Números 6:24-25", tipo: "bendicion" }, { id: 6, texto: "El Señor es mi luz y mi salvación; ¿de quién temeré?", referencia: "Salmos 27:1", tipo: "salmo" }, { id: 7, texto: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová.", referencia: "Jeremías 29:11", tipo: "promesa" }], versiculo_actual: null, ultimo_id: 7 },
            'noticias': { noticias: [{ id: 1, titulo: "Bienvenidos a IPUC LA FONDA", contenido: "Bienvenidos a nuestra plataforma digital v5.0. Aquí encontrarán información de nuestra iglesia, horarios, eventos y más.", estado: "publicado", fecha_publicacion: a, autor_id: 0, autor_nombre: "Sistema", reacciones: { me_gusta: 0, amen: 0, bendiciones: 0, aleluya: 0 } }], ultimo_id: 1 },
            'eventos': { eventos: [], ultimo_id: 0 },
            'asistencia': { registros: [], ultimo_id: 0 },
            'peticiones': { peticiones: [], ultimo_id: 0 },
            'notificaciones': { notificaciones: [], ultimo_id: 0 },
            'estadisticas': { asistencia: { diario: 0, mensual: 0, anual: 0, total: 0 }, usuarios: { total: 0, activos: 0, nuevos_mes: 0 } },
            'actividad': { registros: [], ultimo_id: 0 },
            'horarios': { cultos: [{ dia: "Lunes", cultos: [] }, { dia: "Martes", cultos: [{ nombre: "Culto de Oración", inicio: "18:00", fin: "20:30" }] }, { dia: "Miércoles", cultos: [{ nombre: "Culto Campal", inicio: "16:00", fin: "19:00" }] }, { dia: "Jueves", cultos: [{ nombre: "Culto de Refrán", inicio: "16:00", fin: "19:00" }] }, { dia: "Viernes", cultos: [{ nombre: "Culto de Jóvenes", inicio: "18:00", fin: "20:30" }] }, { dia: "Sábado", cultos: [] }, { dia: "Domingo", cultos: [{ nombre: "Culto Dominical", inicio: "10:00", fin: "12:00" }] }] },
            'configuracion': { iglesia: { nombre: "IPUC LA FONDA", lema: "Donde el Espíritu Santo se mueve", direccion: "", telefono: "", correo: "" }, aplicacion: { version: VERSION, modo_mantenimiento: false, registro_abierto: true, primer_administrador_creado: false, colores: { primario: "#1a237e", secundario: "#ffd700", fondo_claro: "#ffffff", fondo_oscuro: "#121212" } } }
        };
        let c = 0;
        for (const [n, d] of Object.entries(datos)) { if (!localStorage.getItem(this._getKey(n))) { this.guardar(n, d); c++; } }
        console.log(`✅ ${c} archivos inicializados en IPUC LA FONDA v${VERSION}`);
    }
    
    hashPassword(p) { let h = 0; const s = p + 'ipuc5_salt_2026'; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; } return Math.abs(h).toString(16); }
    
    crearPrimerAdmin(d) {
        const a = this.cargar('administradores');
        if (a?.administradores?.length > 0) return { error: 'Ya existe un administrador' };
        const admin = { id: 1, nombre: d.nombre, apellidos: d.apellidos, correo: d.correo, celular: d.celular || '', usuario: d.usuario, password: this.hashPassword(d.password), foto: 'assets/avatars/admin.png', rol: 'admin', verificado: true, fecha_registro: new Date().toISOString(), estado: 'activo', insignias: ['Administrador', 'Cuenta Verificada'], ministerio: d.ministerio || 'Pastoral' };
        if (!a.administradores) a.administradores = [];
        a.administradores.push(admin); a.ultimo_id = 1;
        this.guardar('administradores', a);
        const cfg = this.cargar('configuracion'); cfg.aplicacion.primer_administrador_creado = true; this.guardar('configuracion', cfg);
        return { exito: true, admin };
    }
    
    login(u, p) {
        const h = this.hashPassword(p);
        const admins = this.cargar('administradores');
        const admin = admins?.administradores?.find(a => (a.usuario === u || a.correo === u) && a.password === h);
        if (admin) { if (admin.estado !== 'activo') return { error: 'Cuenta desactivada' }; return { token: 't5_' + Date.now(), rol: 'admin', usuario: { ...admin, password: undefined } }; }
        const usuarios = this.cargar('usuarios');
        const user = usuarios?.usuarios?.find(us => (us.usuario === u || us.correo === u) && us.password === h);
        if (user) { if (user.estado !== 'activo') return { error: 'Cuenta desactivada' }; return { token: 't5_' + Date.now(), rol: 'usuario', usuario: { ...user, password: undefined } }; }
        return { error: 'Credenciales inválidas' };
    }
    
    registrarUsuario(d) {
        const u = this.cargar('usuarios');
        if (u?.usuarios?.find(x => x.usuario === d.usuario)) return { error: 'El usuario ya existe' };
        if (u?.usuarios?.find(x => x.correo === d.correo)) return { error: 'El correo ya está registrado' };
        if (u?.usuarios?.find(x => x.documento === d.documento)) return { error: 'El documento ya está registrado' };
        if (!d.password || d.password.length < 8) return { error: 'Contraseña mínima 8 caracteres' };
        const nuevo = { id: (u.usuarios?.length || 0) + 1, nombre: d.nombre, apellidos: d.apellidos, documento: d.documento || '', fecha_nacimiento: d.fecha_nacimiento || '', sexo: d.sexo || '', correo: d.correo, celular: d.celular || '', direccion: d.direccion || '', ministerio: d.ministerio || 'General', usuario: d.usuario, password: this.hashPassword(d.password), foto: 'assets/avatars/default.png', rol: 'usuario', verificado: false, fecha_registro: new Date().toISOString(), ultima_conexion: new Date().toISOString(), estado: 'activo', insignias: ['Nuevo Miembro'] };
        if (!u.usuarios) u.usuarios = [];
        u.usuarios.push(nuevo); u.ultimo_id = nuevo.id;
        this.guardar('usuarios', u);
        this.actualizarEstadisticasUsuarios();
        return { exito: true, usuario: { id: nuevo.id, nombre: nuevo.nombre, usuario: nuevo.usuario } };
    }
    
    actualizarEstadisticasAsistencia() {
        const a = this.cargar('asistencia'); const e = this.cargar('estadisticas');
        const hoy = new Date().toISOString().split('T')[0]; const mes = hoy.substring(0, 7); const año = hoy.substring(0, 4);
        const r = a?.registros || [];
        e.asistencia = { diario: r.filter(x => x.fecha === hoy).length, mensual: r.filter(x => x.fecha?.startsWith(mes)).length, anual: r.filter(x => x.fecha?.startsWith(año)).length, total: r.length };
        this.guardar('estadisticas', e);
    }
    
    actualizarEstadisticasUsuarios() {
        const u = this.cargar('usuarios'); const e = this.cargar('estadisticas');
        const t = u?.usuarios || []; const mes = new Date().toISOString().substring(0, 7);
        e.usuarios = { total: t.length, activos: t.filter(x => x.estado === 'activo').length, nuevos_mes: t.filter(x => x.fecha_registro?.startsWith(mes)).length };
        this.guardar('estadisticas', e);
    }
    
    addNoticia(d) { const n = this.cargar('noticias'); const nueva = { id: (n.noticias?.length || 0) + 1, titulo: d.titulo, contenido: d.contenido, imagen: d.imagen || '', autor_id: d.autor_id, autor_nombre: d.autor_nombre || 'Admin', fecha_publicacion: new Date().toISOString(), estado: 'publicado', categoria: d.categoria || 'General', reacciones: { me_gusta: 0, amen: 0, bendiciones: 0, aleluya: 0 } }; if (!n.noticias) n.noticias = []; n.noticias.unshift(nueva); n.ultimo_id = nueva.id; this.guardar('noticias', n); return nueva; }
    addEvento(d) { const e = this.cargar('eventos'); const nuevo = { id: (e.eventos?.length || 0) + 1, titulo: d.titulo, descripcion: d.descripcion || '', fecha: d.fecha, hora: d.hora || '', lugar: d.lugar || 'IPUC LA FONDA', organizador_id: d.organizador_id, fecha_creacion: new Date().toISOString(), estado: 'programado', cupos: d.cupos || 0, reservados: 0 }; if (!e.eventos) e.eventos = []; e.eventos.push(nuevo); e.ultimo_id = nuevo.id; this.guardar('eventos', e); return nuevo; }
    addAsistencia(d) { const a = this.cargar('asistencia'); const nuevo = { id: (a.registros?.length || 0) + 1, usuario_id: d.usuario_id, nombre: d.nombre, fecha: new Date().toISOString().split('T')[0], hora: new Date().toLocaleTimeString('es-CO'), estado: d.estado || 'Asistiré', tipo: d.tipo || 'Hermano', culto: d.culto || '', comentario: d.comentario || '' }; if (!a.registros) a.registros = []; a.registros.push(nuevo); a.ultimo_id = nuevo.id; this.guardar('asistencia', a); this.actualizarEstadisticasAsistencia(); return nuevo; }
    addPeticion(d) { const p = this.cargar('peticiones'); const nueva = { id: (p.peticiones?.length || 0) + 1, usuario_id: d.usuario_id, nombre: d.nombre, motivo: d.motivo, descripcion: d.descripcion || '', fecha: new Date().toISOString(), estado: 'activa', oraciones: 0 }; if (!p.peticiones) p.peticiones = []; p.peticiones.unshift(nueva); p.ultimo_id = nueva.id; this.guardar('peticiones', p); return nueva; }
    addNotificacion(d) { const n = this.cargar('notificaciones'); const nueva = { id: (n.notificaciones?.length || 0) + 1, titulo: d.titulo, mensaje: d.mensaje, fecha: new Date().toISOString(), leida: false, tipo: d.tipo || 'general' }; if (!n.notificaciones) n.notificaciones = []; n.notificaciones.unshift(nueva); n.ultimo_id = nueva.id; this.guardar('notificaciones', n); return nueva; }
    marcarTodasLeidas() { const n = this.cargar('notificaciones'); if (n?.notificaciones) { n.notificaciones.forEach(x => x.leida = true); this.guardar('notificaciones', n); } }
    getNoLeidas() { return (this.cargar('notificaciones')?.notificaciones || []).filter(x => !x.leida).length; }
    getEstadisticas() { return { usuarios: (this.cargar('usuarios')?.usuarios || []).length, noticias: (this.cargar('noticias')?.noticias || []).length, eventos: (this.cargar('eventos')?.eventos || []).length, asistencia: (this.cargar('asistencia')?.registros || []).length, peticiones: (this.cargar('peticiones')?.peticiones || []).length, noLeidas: this.getNoLeidas() }; }
    limpiarTodo() { for (let i = localStorage.length - 1; i >= 0; i--) { const k = localStorage.key(i); if (k.startsWith(this.prefix)) localStorage.removeItem(k); } this.cache = {}; }
}

// Instancia global
const db = new Database();
db.inicializarDatos();

// ============================================
// FUNCIONES DE SEGURIDAD
// ============================================
function hashPassword(password) { return db.hashPassword(password); }
function generarToken() { return 't5_' + Date.now() + '_' + Math.random().toString(36).substr(2); }
function verificarToken(token) { return TOKENS[token] && new Date() < new Date(TOKENS[token].expira) ? TOKENS[token] : null; }
function limpiarTokensExpirados() { const ahora = new Date(); Object.keys(TOKENS).forEach(t => { if (new Date(TOKENS[t].expira) < ahora) delete TOKENS[t]; }); }
function verificarBloqueoIP() { return false; } // No aplica en frontend
function registrarActividad(uid, accion, detalle = '') { console.log(`📝 [${new Date().toISOString()}] Usuario ${uid}: ${accion} - ${detalle}`); }

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================
function login(usuario, password) {
    const resultado = db.login(usuario, password);
    if (resultado.error) return resultado;
    const token = generarToken();
    TOKENS[token] = { usuario: resultado.usuario, rol: resultado.rol, expira: new Date(Date.now() + DURACION_TOKEN * 3600000).toISOString(), creado: new Date().toISOString() };
    resultado.token = token;
    localStorage.setItem('ipuc5_token', token);
    localStorage.setItem('ipuc5_usuario', JSON.stringify(resultado.usuario));
    localStorage.setItem('ipuc5_rol', resultado.rol);
    registrarActividad(resultado.usuario.id, 'Inicio de sesión', `Rol: ${resultado.rol}`);
    console.log(`✅ Sesión iniciada: ${resultado.usuario.usuario} (${resultado.rol})`);
    return resultado;
}

function registro(datos) {
    if (!datos.nombre || !datos.apellidos || !datos.correo || !datos.usuario || !datos.password) return { error: 'Campos obligatorios faltantes' };
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(datos.correo)) return { error: 'Correo inválido' };
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(datos.usuario)) return { error: 'Usuario inválido (3-20 caracteres)' };
    if (datos.password.length < 8) return { error: 'Contraseña mínima 8 caracteres' };
    const resultado = db.registrarUsuario(datos);
    if (resultado.exito) { db.addNotificacion({ titulo: 'Nuevo usuario', mensaje: `${datos.nombre} se ha registrado`, tipo: 'usuario' }); registrarActividad(resultado.usuario.id, 'Registro'); }
    return resultado;
}

function logout() {
    const token = localStorage.getItem('ipuc5_token');
    if (token && TOKENS[token]) { registrarActividad(TOKENS[token].usuario.id, 'Cierre de sesión'); delete TOKENS[token]; }
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
    if (!datos.nombre || !datos.apellidos || !datos.correo || !datos.usuario || !datos.password) return { error: 'Campos obligatorios faltantes' };
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(datos.correo)) return { error: 'Correo inválido' };
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(datos.usuario)) return { error: 'Usuario inválido' };
    if (datos.password.length < 8) return { error: 'Contraseña mínima 8 caracteres' };
    const resultado = db.crearPrimerAdmin(datos);
    if (resultado.exito) { db.addNotificacion({ titulo: 'Admin creado', mensaje: 'Primer administrador configurado', tipo: 'sistema' }); registrarActividad(1, 'Primer admin creado'); }
    return resultado;
}

// ============================================
// FUNCIONES DE USUARIOS
// ============================================
function obtenerUsuarios() { const u = db.cargar('usuarios'); return (u?.usuarios || []).map(x => { const { password, ...resto } = x; return resto; }); }
function obtenerUsuario(id) { const u = db.cargar('usuarios'); const user = (u?.usuarios || []).find(x => x.id === id); if (!user) return null; const { password, ...resto } = user; return resto; }
function actualizarUsuario(id, datos) {
    const u = db.cargar('usuarios'); const idx = (u?.usuarios || []).findIndex(x => x.id === id);
    if (idx < 0) return { error: 'No encontrado' };
    ['nombre', 'apellidos', 'celular', 'direccion', 'ministerio', 'foto', 'estado'].forEach(c => { if (datos[c] !== undefined) u.usuarios[idx][c] = datos[c]; });
    db.guardar('usuarios', u); return { mensaje: 'Actualizado' };
}
function verificarUsuario(id) {
    const u = db.cargar('usuarios'); const idx = (u?.usuarios || []).findIndex(x => x.id === id);
    if (idx < 0) return { error: 'No encontrado' };
    u.usuarios[idx].verificado = true;
    if (!u.usuarios[idx].insignias.includes('Cuenta Verificada')) u.usuarios[idx].insignias.push('Cuenta Verificada');
    db.guardar('usuarios', u); return { mensaje: 'Verificado' };
}
function cambiarPassword(id, pwActual, pwNueva) {
    if (pwNueva.length < 8) return { error: 'Mínimo 8 caracteres' };
    const u = db.cargar('usuarios'); const idx = (u?.usuarios || []).findIndex(x => x.id === id);
    if (idx < 0) return { error: 'No encontrado' };
    if (u.usuarios[idx].password !== db.hashPassword(pwActual)) return { error: 'Contraseña actual incorrecta' };
    u.usuarios[idx].password = db.hashPassword(pwNueva);
    db.guardar('usuarios', u); return { mensaje: 'Contraseña actualizada' };
}
function obtenerDirectorio() { const u = db.cargar('usuarios'); return (u?.usuarios || []).map(x => ({ id: x.id, nombre: x.nombre, apellidos: x.apellidos || '', foto: x.foto, ministerio: x.ministerio, verificado: x.verificado || false })); }

// ============================================
// FUNCIONES DE ASISTENCIA
// ============================================
function obtenerAsistencia(uid = null) { const r = db.cargar('asistencia')?.registros || []; return uid ? r.filter(x => x.usuario_id === uid) : r; }
function registrarAsistencia(datos) { return db.addAsistencia(datos); }
function obtenerEstadisticasAsistencia() { return db.cargar('estadisticas')?.asistencia || {}; }

// ============================================
// FUNCIONES DE CULTOS Y HORARIOS
// ============================================
function obtenerProximoCulto() {
    const ahora = new Date();
    const cultos = { 0: [], 1: [{ inicio: "18:00", fin: "20:30", nombre: "Culto de Oración" }], 2: [{ inicio: "16:00", fin: "19:00", nombre: "Culto Campal" }], 3: [{ inicio: "16:00", fin: "19:00", nombre: "Culto de Refrán" }], 4: [{ inicio: "18:00", fin: "20:30", nombre: "Culto de Jóvenes" }], 5: [], 6: [{ inicio: "10:00", fin: "12:00", nombre: "Culto Dominical" }] };
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    for (let offset = 0; offset < 8; offset++) {
        const dia = (ahora.getDay() + offset) % 7;
        for (const c of (cultos[dia] || [])) {
            const fecha = new Date(ahora); fecha.setDate(fecha.getDate() + offset);
            const [hi, mi] = c.inicio.split(':').map(Number); const [hf, mf] = c.fin.split(':').map(Number);
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
    const data = db.cargar('versiculos'); const hoy = new Date().toISOString().split('T')[0];
    let actual = data?.versiculo_actual;
    if (!actual || actual.fecha !== hoy) {
        const lista = data?.versiculos || [];
        if (lista.length > 0) { actual = { ...lista[new Date().getDay() % lista.length], fecha: hoy }; data.versiculo_actual = actual; db.guardar('versiculos', data); }
        else actual = { texto: "Porque de tal manera amó Dios al mundo...", referencia: "Juan 3:16", tipo: "promesa", fecha: hoy };
    }
    return actual;
}
function obtenerVersiculos() { return db.cargar('versiculos')?.versiculos || []; }
function crearVersiculo(datos) { const v = db.cargar('versiculos'); const nuevo = { id: (v.versiculos?.length || 0) + 1, texto: datos.texto, referencia: datos.referencia, tipo: datos.tipo || 'versiculo' }; if (!v.versiculos) v.versiculos = []; v.versiculos.push(nuevo); v.ultimo_id = nuevo.id; db.guardar('versiculos', v); return nuevo; }
function eliminarVersiculo(id) { const v = db.cargar('versiculos'); v.versiculos = (v.versiculos || []).filter(x => x.id !== id); db.guardar('versiculos', v); return { mensaje: 'Eliminado' }; }

// ============================================
// FUNCIONES DE NOTICIAS
// ============================================
function obtenerNoticias() { const n = db.cargar('noticias'); return (n?.noticias || []).filter(x => x.estado === 'publicado').sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion)); }
function crearNoticia(datos) { return db.addNoticia(datos); }
function eliminarNoticia(id) { const n = db.cargar('noticias'); n.noticias = (n.noticias || []).filter(x => x.id !== id); db.guardar('noticias', n); return { mensaje: 'Eliminada' }; }

// ============================================
// FUNCIONES DE EVENTOS
// ============================================
function obtenerEventos() { const e = db.cargar('eventos'); const hoy = new Date().toISOString().split('T')[0]; return (e?.eventos || []).filter(x => x.fecha >= hoy).sort((a, b) => a.fecha.localeCompare(b.fecha)); }
function crearEvento(datos) { return db.addEvento(datos); }

// ============================================
// FUNCIONES DE PETICIONES
// ============================================
function obtenerPeticiones() { const p = db.cargar('peticiones'); return (p?.peticiones || []).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); }
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
function actualizarConfiguracion(datos) { const c = db.cargar('configuracion'); Object.assign(c.iglesia, datos.iglesia || {}); Object.assign(c.aplicacion, datos.aplicacion || {}); db.guardar('configuracion', c); return c; }

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================
window.db = db;
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

console.log('✅ IPUC LA FONDA API v5.0 - JavaScript cargado correctamente');
console.log('🔒 Autenticación local - Sin backend externo');
console.log('💾 Datos almacenados en localStorage');
console.log('📱 Listo para usar en el frontend');
