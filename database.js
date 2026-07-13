// ============================================
// IPUC LA FONDA - DATABASE v5.0
// Gestión de Base de Datos en localStorage
// Sin credenciales de prueba - Seguro
// "Donde el Espíritu Santo se mueve"
// ============================================

class Database {
    constructor() {
        this.prefix = 'ipuc5_';
        this.cache = {};
        this.cacheTimeout = 300;
        this.lastCacheUpdate = {};
        console.log('🗄️ IPUC LA FONDA v5.0 - Base de datos local inicializada');
    }

    _getKey(name) { return this.prefix + name; }

    // ============================================
    // CARGA Y GUARDADO DE DATOS
    // ============================================
    cargar(nombreArchivo) {
        const clave = this._getKey(nombreArchivo);
        if (this.cache[clave] && this.lastCacheUpdate[clave]) {
            const tiempoCache = (Date.now() - this.lastCacheUpdate[clave]) / 1000;
            if (tiempoCache < this.cacheTimeout) return JSON.parse(JSON.stringify(this.cache[clave]));
        }
        const datos = localStorage.getItem(clave);
        if (!datos) return null;
        try {
            const parsed = JSON.parse(datos);
            this.cache[clave] = JSON.parse(JSON.stringify(parsed));
            this.lastCacheUpdate[clave] = Date.now();
            return parsed;
        } catch (e) {
            console.error(`❌ Error al cargar ${nombreArchivo}:`, e);
            return this._recuperarRespaldo(nombreArchivo);
        }
    }

    guardar(nombreArchivo, datos) {
        const clave = this._getKey(nombreArchivo);
        try {
            if (typeof datos !== 'object' || datos === null) throw new Error('Los datos deben ser un objeto');
            const datosAnteriores = localStorage.getItem(clave);
            if (datosAnteriores) this._crearRespaldo(nombreArchivo, datosAnteriores);
            localStorage.setItem(clave, JSON.stringify(datos, null, 2));
            this.cache[clave] = JSON.parse(JSON.stringify(datos));
            this.lastCacheUpdate[clave] = Date.now();
            return true;
        } catch (e) {
            console.error(`❌ Error al guardar ${nombreArchivo}:`, e);
            return false;
        }
    }

    eliminar(nombreArchivo) {
        const clave = this._getKey(nombreArchivo);
        localStorage.removeItem(clave);
        delete this.cache[clave];
        delete this.lastCacheUpdate[clave];
    }

    // ============================================
    // SISTEMA DE RESPALDOS
    // ============================================
    _crearRespaldo(nombreArchivo, datosAnteriores) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const claveRespaldo = `${this.prefix}backup_${nombreArchivo}_${timestamp}`;
            localStorage.setItem(claveRespaldo, datosAnteriores);
            this._limpiarRespaldosAntiguos(nombreArchivo, 10);
        } catch (e) {
            console.warn(`⚠️ Error al crear respaldo de ${nombreArchivo}:`, e);
        }
    }

    _limpiarRespaldosAntiguos(nombreArchivo, maxRespaldos = 10) {
        const respaldos = [];
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave.startsWith(`${this.prefix}backup_${nombreArchivo}_`)) respaldos.push(clave);
        }
        respaldos.sort((a, b) => b.localeCompare(a));
        if (respaldos.length > maxRespaldos) {
            for (let i = maxRespaldos; i < respaldos.length; i++) localStorage.removeItem(respaldos[i]);
        }
    }

    _recuperarRespaldo(nombreArchivo) {
        const respaldos = [];
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave.startsWith(`${this.prefix}backup_${nombreArchivo}_`)) respaldos.push(clave);
        }
        respaldos.sort((a, b) => b.localeCompare(a));
        for (const claveRespaldo of respaldos) {
            try {
                const datos = localStorage.getItem(claveRespaldo);
                if (datos) {
                    const parsed = JSON.parse(datos);
                    this.guardar(nombreArchivo, parsed);
                    return parsed;
                }
            } catch (e) {
                console.error(`❌ Error al leer respaldo ${claveRespaldo}:`, e);
            }
        }
        return null;
    }

    // ============================================
    // INICIALIZACIÓN DE DATOS POR DEFECTO
    // ============================================
    inicializarDatos() {
        const ahora = new Date().toISOString();
        const archivosIniciales = {
            'usuarios': { usuarios: [], ultimo_id: 0 },
            'administradores': { administradores: [], ultimo_id: 0 },
            'versiculos': {
                versiculos: [
                    { id: 1, texto: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", referencia: "Juan 3:16", tipo: "promesa" },
                    { id: 2, texto: "Jehová es mi pastor; nada me faltará.", referencia: "Salmos 23:1", tipo: "salmo" },
                    { id: 3, texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13", tipo: "promesa" },
                    { id: 4, texto: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", referencia: "Mateo 6:33", tipo: "versiculo" },
                    { id: 5, texto: "Jehová te bendiga, y te guarde.", referencia: "Números 6:24-25", tipo: "bendicion" },
                    { id: 6, texto: "El Señor es mi luz y mi salvación; ¿de quién temeré?", referencia: "Salmos 27:1", tipo: "salmo" },
                    { id: 7, texto: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová.", referencia: "Jeremías 29:11", tipo: "promesa" }
                ],
                versiculo_actual: null, ultimo_id: 7
            },
            'noticias': {
                noticias: [{ id: 1, titulo: "Bienvenidos a IPUC LA FONDA v5.0", contenido: "Bienvenidos a nuestra plataforma digital v5.0. Aquí encontrarán información de nuestra iglesia, horarios de cultos, eventos, noticias y mucho más. ¡Dios te bendiga!", imagen: "", autor_id: 0, autor_nombre: "Sistema", fecha_publicacion: ahora, fecha_actualizacion: ahora, estado: "publicado", categoria: "General", comentarios: [], reacciones: { me_gusta: 0, amen: 0, bendiciones: 0, aleluya: 0 } }],
                ultimo_id: 1
            },
            'eventos': { eventos: [], ultimo_id: 0 },
            'asistencia': { registros: [], ultimo_id: 0 },
            'mensajes': { mensajes: [], ultimo_id: 0 },
            'notificaciones': { notificaciones: [], ultimo_id: 0 },
            'estadisticas': {
                asistencia: { diario: 0, mensual: 0, anual: 0, total: 0, ultima_actualizacion: ahora },
                usuarios: { total: 0, activos: 0, nuevos_mes: 0, ultima_actualizacion: ahora },
                crecimiento: { porcentaje: 0, historico: [] }
            },
            'actividad': { registros: [], ultimo_id: 0 },
            'encuestas': { encuestas: [], ultimo_id: 0 },
            'peticiones': { peticiones: [], ultimo_id: 0 },
            'insignias': {
                insignias: [
                    { id: 1, nombre: "Nuevo Miembro", icono: "bx-user-plus", color: "#2196f3" },
                    { id: 2, nombre: "Miembro Activo", icono: "bx-star", color: "#ff9800" },
                    { id: 3, nombre: "Líder", icono: "bx-crown", color: "#ffd700" },
                    { id: 4, nombre: "Maestro", icono: "bx-book", color: "#4caf50" },
                    { id: 5, nombre: "Músico", icono: "bx-music", color: "#9c27b0" },
                    { id: 6, nombre: "Evangelista", icono: "bx-bible", color: "#f44336" },
                    { id: 7, nombre: "Administrador", icono: "bx-shield", color: "#607d8b" },
                    { id: 8, nombre: "Cuenta Verificada", icono: "bx-badge-check", color: "#2196f3" },
                    { id: 9, nombre: "Servidor Destacado", icono: "bx-heart", color: "#e91e63" }
                ],
                ultimo_id: 9
            },
            'comentarios': { comentarios: [], ultimo_id: 0 },
            'reacciones': { reacciones: [], ultimo_id: 0 },
            'horarios': {
                cultos: [
                    { dia: "Lunes", cultos: [] },
                    { dia: "Martes", cultos: [{ nombre: "Culto de Oración", inicio: "18:00", fin: "20:30" }] },
                    { dia: "Miércoles", cultos: [{ nombre: "Culto Campal", inicio: "16:00", fin: "19:00" }] },
                    { dia: "Jueves", cultos: [{ nombre: "Culto de Refrán", inicio: "16:00", fin: "19:00" }] },
                    { dia: "Viernes", cultos: [{ nombre: "Culto de Jóvenes", inicio: "18:00", fin: "20:30" }] },
                    { dia: "Sábado", cultos: [] },
                    { dia: "Domingo", cultos: [{ nombre: "Culto Dominical", inicio: "10:00", fin: "12:00" }] }
                ]
            },
            'biblioteca': { recursos: [], ultimo_id: 0 },
            'galeria': { albumes: [], ultimo_id: 0 },
            'configuracion': {
                iglesia: { nombre: "IPUC LA FONDA", lema: "Donde el Espíritu Santo se mueve", direccion: "", telefono: "", correo: "", facebook: "", instagram: "", youtube: "" },
                aplicacion: { version: "5.0", modo_mantenimiento: false, registro_abierto: true, primer_administrador_creado: false, colores: { primario: "#1a237e", secundario: "#ffd700", fondo_claro: "#ffffff", fondo_oscuro: "#121212" } }
            }
        };

        let archivosCreados = 0;
        for (const [nombre, datos] of Object.entries(archivosIniciales)) {
            if (!localStorage.getItem(this._getKey(nombre))) { this.guardar(nombre, datos); archivosCreados++; }
        }
        console.log(`✅ ${archivosCreados} archivos inicializados en IPUC LA FONDA v5.0`);
        console.warn('⚠️ Sin credenciales de prueba - Usa db.crearPrimerAdministrador()');
    }

    // ============================================
    // HASH DE CONTRASEÑA
    // ============================================
    hashPassword(password) {
        let hash = 0;
        const str = password + 'ipuc5_salt_2026';
        for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; }
        return Math.abs(hash).toString(16);
    }

    // ============================================
    // CREACIÓN DE ADMINISTRADOR
    // ============================================
    crearPrimerAdministrador(datos) {
        const admins = this.cargar('administradores');
        if (admins?.administradores?.length > 0) return { error: 'Ya existe un administrador' };
        
        const camposRequeridos = ['nombre', 'apellidos', 'correo', 'usuario', 'password'];
        for (const campo of camposRequeridos) {
            if (!datos[campo] || !String(datos[campo]).trim()) return { error: `El campo '${campo}' es obligatorio` };
        }
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(datos.correo)) return { error: 'Formato de correo electrónico inválido' };
        
        const usuarioRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usuarioRegex.test(datos.usuario)) return { error: 'El usuario debe tener entre 3 y 20 caracteres' };
        
        if (datos.password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres' };

        const admin = {
            id: 1, nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(),
            correo: datos.correo.trim().toLowerCase(), celular: (datos.celular || '').trim(),
            usuario: datos.usuario.trim().toLowerCase(), password: this.hashPassword(datos.password),
            foto: 'assets/avatars/admin.png', rol: 'admin', verificado: true,
            fecha_registro: new Date().toISOString(), ultima_conexion: new Date().toISOString(),
            estado: 'activo', ministerio: datos.ministerio || 'Pastoral',
            insignias: ['Administrador', 'Cuenta Verificada']
        };

        if (!admins.administradores) admins.administradores = [];
        admins.administradores.push(admin); admins.ultimo_id = 1;
        
        if (this.guardar('administradores', admins)) {
            const config = this.cargar('configuracion');
            if (config?.aplicacion) { config.aplicacion.primer_administrador_creado = true; this.guardar('configuracion', config); }
            return { exito: true, admin };
        }
        return { error: 'Error al guardar el administrador' };
    }

    // ============================================
    // AUTENTICACIÓN
    // ============================================
    login(usuario, password) {
        const hash = this.hashPassword(password);
        const admins = this.cargar('administradores');
        const admin = admins?.administradores?.find(a => (a.usuario === usuario || a.correo === usuario) && a.password === hash);
        if (admin) {
            if (admin.estado !== 'activo') return { error: 'Cuenta desactivada' };
            const { password: _, ...adminSeguro } = admin;
            return { token: 't5_' + Date.now(), rol: 'admin', usuario: adminSeguro };
        }
        const usuarios = this.cargar('usuarios');
        const user = usuarios?.usuarios?.find(u => (u.usuario === usuario || u.correo === usuario) && u.password === hash);
        if (user) {
            if (user.estado !== 'activo') return { error: 'Cuenta desactivada' };
            const { password: _, ...userSeguro } = user;
            return { token: 't5_' + Date.now(), rol: 'usuario', usuario: userSeguro };
        }
        return { error: 'Credenciales inválidas' };
    }

    // ============================================
    // REGISTRO DE USUARIO
    // ============================================
    registrarUsuario(datos) {
        const usuarios = this.cargar('usuarios');
        const camposRequeridos = ['nombre', 'apellidos', 'documento', 'fecha_nacimiento', 'sexo', 'correo', 'celular', 'usuario', 'password', 'ministerio'];
        for (const campo of camposRequeridos) {
            if (!datos[campo] || !String(datos[campo]).trim()) return { error: `El campo '${campo}' es obligatorio` };
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(datos.correo)) return { error: 'Formato de correo electrónico inválido' };
        const usuarioRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usuarioRegex.test(datos.usuario)) return { error: 'El usuario debe tener entre 3 y 20 caracteres' };
        if (datos.password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres' };
        if (usuarios?.usuarios?.some(u => String(u.documento) === String(datos.documento))) return { error: 'El documento ya está registrado' };
        if (usuarios?.usuarios?.some(u => u.correo?.toLowerCase() === datos.correo.toLowerCase())) return { error: 'El correo ya está registrado' };
        if (usuarios?.usuarios?.some(u => u.usuario?.toLowerCase() === datos.usuario.toLowerCase())) return { error: 'El usuario ya existe' };

        const nuevo = {
            id: (usuarios?.usuarios?.length || 0) + 1, nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(),
            documento: datos.documento.trim(), fecha_nacimiento: datos.fecha_nacimiento, sexo: datos.sexo,
            correo: datos.correo.trim().toLowerCase(), celular: datos.celular.trim(),
            direccion: (datos.direccion || '').trim(), ministerio: datos.ministerio,
            usuario: datos.usuario.trim().toLowerCase(), password: this.hashPassword(datos.password),
            foto: datos.foto || 'assets/avatars/default.png', rol: 'usuario', verificado: false,
            fecha_registro: new Date().toISOString(), ultima_conexion: new Date().toISOString(),
            estado: 'activo', insignias: ['Nuevo Miembro']
        };

        if (!usuarios.usuarios) usuarios.usuarios = [];
        usuarios.usuarios.push(nuevo); usuarios.ultimo_id = nuevo.id;
        if (this.guardar('usuarios', usuarios)) {
            this.actualizarEstadisticasUsuarios();
            return { exito: true, usuario: { id: nuevo.id, nombre: nuevo.nombre, usuario: nuevo.usuario } };
        }
        return { error: 'Error al guardar el usuario' };
    }

    // ============================================
    // ESTADÍSTICAS
    // ============================================
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

    // ============================================
    // NOTICIAS, EVENTOS, ASISTENCIA, PETICIONES, NOTIFICACIONES
    // ============================================
    getNoticias() { return this.cargar('noticias')?.noticias || []; }
    addNoticia(d) { const n = this.cargar('noticias'); const nueva = { id: (n.noticias?.length || 0) + 1, titulo: d.titulo, contenido: d.contenido, imagen: d.imagen || '', autor_id: d.autor_id, autor_nombre: d.autor_nombre || 'Admin', fecha_publicacion: new Date().toISOString(), estado: 'publicado', categoria: d.categoria || 'General', reacciones: { me_gusta: 0, amen: 0, bendiciones: 0, aleluya: 0 } }; if (!n.noticias) n.noticias = []; n.noticias.unshift(nueva); n.ultimo_id = nueva.id; this.guardar('noticias', n); return nueva; }
    
    getEventos() { return this.cargar('eventos')?.eventos || []; }
    addEvento(d) { const e = this.cargar('eventos'); const nuevo = { id: (e.eventos?.length || 0) + 1, titulo: d.titulo, descripcion: d.descripcion || '', fecha: d.fecha, hora: d.hora || '', lugar: d.lugar || 'IPUC LA FONDA', organizador_id: d.organizador_id, fecha_creacion: new Date().toISOString(), estado: 'programado', cupos: d.cupos || 0, reservados: 0 }; if (!e.eventos) e.eventos = []; e.eventos.push(nuevo); e.ultimo_id = nuevo.id; this.guardar('eventos', e); return nuevo; }
    
    getAsistencia() { return this.cargar('asistencia')?.registros || []; }
    addAsistencia(d) { const a = this.cargar('asistencia'); const nuevo = { id: (a.registros?.length || 0) + 1, usuario_id: d.usuario_id, nombre: d.nombre, fecha: new Date().toISOString().split('T')[0], hora: new Date().toLocaleTimeString('es-CO'), estado: d.estado || 'Asistiré', tipo: d.tipo || 'Hermano', culto: d.culto || '', comentario: d.comentario || '' }; if (!a.registros) a.registros = []; a.registros.push(nuevo); a.ultimo_id = nuevo.id; this.guardar('asistencia', a); this.actualizarEstadisticasAsistencia(); return nuevo; }
    
    getPeticiones() { return this.cargar('peticiones')?.peticiones || []; }
    addPeticion(d) { const p = this.cargar('peticiones'); const nueva = { id: (p.peticiones?.length || 0) + 1, usuario_id: d.usuario_id, nombre: d.nombre, motivo: d.motivo, descripcion: d.descripcion || '', fecha: new Date().toISOString(), estado: 'activa', oraciones: 0 }; if (!p.peticiones) p.peticiones = []; p.peticiones.unshift(nueva); p.ultimo_id = nueva.id; this.guardar('peticiones', p); return nueva; }
    
    getNotificaciones() { return this.cargar('notificaciones')?.notificaciones || []; }
    addNotificacion(d) { const n = this.cargar('notificaciones'); const nueva = { id: (n.notificaciones?.length || 0) + 1, titulo: d.titulo, mensaje: d.mensaje, fecha: new Date().toISOString(), leida: false, tipo: d.tipo || 'general' }; if (!n.notificaciones) n.notificaciones = []; n.notificaciones.unshift(nueva); n.ultimo_id = nueva.id; this.guardar('notificaciones', n); return nueva; }
    marcarTodasLeidas() { const n = this.cargar('notificaciones'); if (n?.notificaciones) { n.notificaciones.forEach(x => x.leida = true); this.guardar('notificaciones', n); } }
    getNoLeidas() { return this.getNotificaciones().filter(x => !x.leida).length; }

    // ============================================
    // ESTADÍSTICAS Y UTILIDADES
    // ============================================
    getEstadisticas() { return { usuarios: (this.cargar('usuarios')?.usuarios || []).length, noticias: this.getNoticias().length, eventos: this.getEventos().length, asistencia: this.getAsistencia().length, peticiones: this.getPeticiones().length, noLeidas: this.getNoLeidas() }; }
    limpiarTodo() { for (let i = localStorage.length - 1; i >= 0; i--) { const k = localStorage.key(i); if (k.startsWith(this.prefix)) localStorage.removeItem(k); } this.cache = {}; }
}

// ============================================
// CREAR INSTANCIA GLOBAL
// ============================================
const db = new Database();
db.inicializarDatos();

// Exportar
window.Database = Database;
window.db = db;

console.log('✅ IPUC LA FONDA - Database v5.0 cargado correctamente');
console.log('💾 Almacenamiento: localStorage con sistema de respaldos');
console.log('🔒 Sin credenciales de prueba');
