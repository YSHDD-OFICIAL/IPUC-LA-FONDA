// ============================================
// IPUC LA FONDA - DATABASE v5.0 COMPLETA
// Gestión de Base de Datos en localStorage
// Sistema de publicaciones, comentarios, reacciones
// Sin credenciales de prueba - Seguro
// "Donde el Espíritu Santo se mueve"
// ============================================

class Database {
    constructor() {
        this.prefix = 'ipuc5_';
        this.cache = {};
        this.cacheTimeout = 300;
        this.lastCacheUpdate = {};
    }

    _getKey(name) { return this.prefix + name; }

    // ============================================
    // CARGA Y GUARDADO DE DATOS
    // ============================================
    cargar(nombreArchivo) {
        const clave = this._getKey(nombreArchivo);
        // Verificar caché
        if (this.cache[clave] && this.lastCacheUpdate[clave]) {
            const tiempoCache = (Date.now() - this.lastCacheUpdate[clave]) / 1000;
            if (tiempoCache < this.cacheTimeout) {
                return JSON.parse(JSON.stringify(this.cache[clave]));
            }
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
            if (typeof datos !== 'object' || datos === null) {
                throw new Error('Los datos deben ser un objeto');
            }
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
                ], versiculo_actual: null, ultimo_id: 7
            },
            'noticias': {
                noticias: [{ id: 1, titulo: "Bienvenidos a IPUC LA FONDA v5.0", contenido: "Bienvenidos a nuestra plataforma digital v5.0. ¡Dios te bendiga!", imagen: "", autor_id: 0, autor_nombre: "Sistema", fecha_publicacion: ahora, estado: "publicado", categoria: "General", reacciones: { me_gusta: 0, amen: 0, bendiciones: 0, aleluya: 0 } }], ultimo_id: 1
            },
            'eventos': { eventos: [], ultimo_id: 0 },
            'asistencia': { registros: [], ultimo_id: 0 },
            'notificaciones': { notificaciones: [], ultimo_id: 0 },
            'estadisticas': { asistencia: { diario: 0, mensual: 0, anual: 0, total: 0 }, usuarios: { total: 0, activos: 0, nuevos_mes: 0 }, publicaciones: { total: 0, comentarios: 0 } },
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
                    { id: 9, nombre: "Servidor Destacado", icono: "bx-heart", color: "#e91e63" },
                    { id: 10, nombre: "Publicador Activo", icono: "bx-news", color: "#00bcd4" },
                    { id: 11, nombre: "Intercesor", icono: "bx-pray", color: "#9c27b0" }
                ], ultimo_id: 11
            },
            'publicaciones': { publicaciones: [], ultimo_id: 0 },
            'comentarios': { comentarios: [], ultimo_id: 0 },
            'reacciones': { reacciones: {} },
            'horarios': {
                cultos: [
                    { dia: "Lunes", cultos: [] }, { dia: "Martes", cultos: [{ nombre: "Culto de Oración", inicio: "18:00", fin: "20:30" }] },
                    { dia: "Miércoles", cultos: [{ nombre: "Culto Campal", inicio: "16:00", fin: "19:00" }] },
                    { dia: "Jueves", cultos: [{ nombre: "Culto de Refrán", inicio: "16:00", fin: "19:00" }] },
                    { dia: "Viernes", cultos: [{ nombre: "Culto de Jóvenes", inicio: "18:00", fin: "20:30" }] },
                    { dia: "Sábado", cultos: [] }, { dia: "Domingo", cultos: [{ nombre: "Culto Dominical", inicio: "10:00", fin: "12:00" }] }
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
            if (!localStorage.getItem(this._getKey(nombre))) {
                this.guardar(nombre, datos);
                archivosCreados++;
                console.log(`✅ Archivo creado: ${nombre}`);
            }
        }
        
        if (archivosCreados > 0) {
            console.log(`✅ ${archivosCreados} archivos nuevos inicializados en IPUC LA FONDA v5.0`);
        } else {
            console.log('📄 Todos los archivos ya existen - Base de datos lista');
        }
        console.warn('⚠️ Sin credenciales de prueba - Usa db.crearPrimerAdministrador()');
    }

    // ============================================
    // HASH DE CONTRASEÑA
    // ============================================
    hashPassword(password) {
        let hash = 0;
        const str = password + 'ipuc5_salt_2026';
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(16);
    }

    // ============================================
    // ADMINISTRADOR
    // ============================================
    crearPrimerAdministrador(datos) {
        const admins = this.cargar('administradores');
        if (admins?.administradores?.length > 0) return { error: 'Ya existe un administrador' };
        
        const campos = ['nombre', 'apellidos', 'correo', 'usuario', 'password'];
        for (const c of campos) {
            if (!datos[c] || !String(datos[c]).trim()) return { error: `El campo '${c}' es obligatorio` };
        }
        
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(datos.correo)) return { error: 'Correo inválido' };
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(datos.usuario)) return { error: 'Usuario inválido (3-20 caracteres)' };
        if (datos.password.length < 8) return { error: 'Contraseña mínima 8 caracteres' };
        
        const admin = {
            id: 1, nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(),
            correo: datos.correo.trim().toLowerCase(), celular: (datos.celular || '').trim(),
            usuario: datos.usuario.trim().toLowerCase(), password: this.hashPassword(datos.password),
            foto: 'assets/avatars/admin.png', rol: 'admin', verificado: true,
            fecha_registro: new Date().toISOString(), estado: 'activo',
            ministerio: datos.ministerio || 'Pastoral', insignias: ['Administrador', 'Cuenta Verificada']
        };
        
        if (!admins.administradores) admins.administradores = [];
        admins.administradores.push(admin);
        admins.ultimo_id = 1;
        
        if (this.guardar('administradores', admins)) {
            const cfg = this.cargar('configuracion');
            if (cfg?.aplicacion) {
                cfg.aplicacion.primer_administrador_creado = true;
                this.guardar('configuracion', cfg);
            }
            return { exito: true, admin };
        }
        return { error: 'Error al guardar' };
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
        const campos = ['nombre', 'apellidos', 'documento', 'fecha_nacimiento', 'sexo', 'correo', 'celular', 'usuario', 'password', 'ministerio'];
        
        for (const c of campos) {
            if (!datos[c] || !String(datos[c]).trim()) return { error: `El campo '${c}' es obligatorio` };
        }
        
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(datos.correo)) return { error: 'Correo inválido' };
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(datos.usuario)) return { error: 'Usuario inválido' };
        if (datos.password.length < 8) return { error: 'Contraseña mínima 8 caracteres' };
        
        if (usuarios?.usuarios?.some(u => String(u.documento) === String(datos.documento))) return { error: 'Documento ya registrado' };
        if (usuarios?.usuarios?.some(u => u.correo?.toLowerCase() === datos.correo.toLowerCase())) return { error: 'Correo ya registrado' };
        if (usuarios?.usuarios?.some(u => u.usuario?.toLowerCase() === datos.usuario.toLowerCase())) return { error: 'Usuario ya existe' };
        
        const nuevo = {
            id: (usuarios?.usuarios?.length || 0) + 1,
            nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(),
            documento: datos.documento.trim(), fecha_nacimiento: datos.fecha_nacimiento,
            sexo: datos.sexo, correo: datos.correo.trim().toLowerCase(),
            celular: datos.celular.trim(), direccion: (datos.direccion || '').trim(),
            ministerio: datos.ministerio, usuario: datos.usuario.trim().toLowerCase(),
            password: this.hashPassword(datos.password),
            foto: datos.foto || 'assets/avatars/default.png',
            rol: 'usuario', verificado: false,
            fecha_registro: new Date().toISOString(), estado: 'activo',
            insignias: ['Nuevo Miembro']
        };
        
        if (!usuarios.usuarios) usuarios.usuarios = [];
        usuarios.usuarios.push(nuevo);
        usuarios.ultimo_id = nuevo.id;
        
        if (this.guardar('usuarios', usuarios)) {
            this.actualizarEstadisticasUsuarios();
            return { exito: true, usuario: { id: nuevo.id, nombre: nuevo.nombre, usuario: nuevo.usuario } };
        }
        return { error: 'Error al guardar' };
    }

    // ============================================
    // PUBLICACIONES
    // ============================================
    getPublicaciones() { return this.cargar('publicaciones')?.publicaciones || []; }
    
    addPublicacion(d) {
        const p = this.cargar('publicaciones');
        const nueva = {
            id: Date.now(), usuario_id: d.usuario_id, autor: d.autor,
            usuario: d.usuario, foto_autor: d.foto_autor || 'assets/avatars/default.png',
            verificado: d.verificado || false, contenido: d.contenido,
            imagen: d.imagen || '', fecha: new Date().toISOString(),
            reacciones: { amen: 0, me_gusta: 0, fuego: 0, orando: 0, bendicion: 0 },
            comentarios_count: 0
        };
        if (!p.publicaciones) p.publicaciones = [];
        p.publicaciones.unshift(nueva);
        p.ultimo_id = nueva.id;
        this.guardar('publicaciones', p);
        this.addNotificacion({ titulo: '📝 Nueva publicación', mensaje: `${d.autor} ha publicado en el muro`, tipo: 'publicacion' });
        return nueva;
    }
    
    deletePublicacion(id) {
        const p = this.cargar('publicaciones');
        p.publicaciones = (p.publicaciones || []).filter(x => x.id !== id);
        const c = this.cargar('comentarios');
        c.comentarios = (c.comentarios || []).filter(x => x.publicacion_id !== id);
        this.guardar('publicaciones', p);
        this.guardar('comentarios', c);
        return true;
    }

    // ============================================
    // COMENTARIOS
    // ============================================
    getComentarios(publicacionId = null) {
        const c = this.cargar('comentarios')?.comentarios || [];
        return publicacionId ? c.filter(x => x.publicacion_id === publicacionId).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)) : c;
    }
    
    addComentario(d) {
        const c = this.cargar('comentarios');
        const nuevo = {
            id: Date.now(), publicacion_id: d.publicacion_id, usuario_id: d.usuario_id,
            autor: d.autor, usuario: d.usuario, foto_autor: d.foto_autor || 'assets/avatars/default.png',
            contenido: d.contenido, fecha: new Date().toISOString()
        };
        if (!c.comentarios) c.comentarios = [];
        c.comentarios.push(nuevo);
        c.ultimo_id = nuevo.id;
        this.guardar('comentarios', c);
        
        const p = this.cargar('publicaciones');
        const pub = (p?.publicaciones || []).find(x => x.id === d.publicacion_id);
        if (pub) {
            pub.comentarios_count = (pub.comentarios_count || 0) + 1;
            this.guardar('publicaciones', p);
        }
        return nuevo;
    }

    // ============================================
    // REACCIONES
    // ============================================
    toggleReaccion(publicacionId, usuarioId, tipo) {
        const r = this.cargar('reacciones');
        if (!r.reacciones) r.reacciones = {};
        
        const clave = `${publicacionId}_${usuarioId}`;
        const actual = r.reacciones[clave];
        
        if (actual === tipo) {
            delete r.reacciones[clave];
            const p = this.cargar('publicaciones');
            const pub = (p?.publicaciones || []).find(x => x.id === publicacionId);
            if (pub && pub.reacciones[tipo] > 0) pub.reacciones[tipo]--;
            this.guardar('publicaciones', p);
        } else {
            if (actual) {
                const p = this.cargar('publicaciones');
                const pub = (p?.publicaciones || []).find(x => x.id === publicacionId);
                if (pub && pub.reacciones[actual] > 0) pub.reacciones[actual]--;
                this.guardar('publicaciones', p);
            }
            r.reacciones[clave] = tipo;
            const p = this.cargar('publicaciones');
            const pub = (p?.publicaciones || []).find(x => x.id === publicacionId);
            if (pub) pub.reacciones[tipo] = (pub.reacciones[tipo] || 0) + 1;
            this.guardar('publicaciones', p);
        }
        
        this.guardar('reacciones', r);
        return r.reacciones[clave] || null;
    }
    
    getReaccionUsuario(publicacionId, usuarioId) {
        const r = this.cargar('reacciones');
        return r?.reacciones?.[`${publicacionId}_${usuarioId}`] || null;
    }

    // ============================================
    // ESTADÍSTICAS
    // ============================================
    actualizarEstadisticasAsistencia() {
        const a = this.cargar('asistencia');
        const e = this.cargar('estadisticas');
        const hoy = new Date().toISOString().split('T')[0];
        const mes = hoy.substring(0, 7);
        const año = hoy.substring(0, 4);
        const r = a?.registros || [];
        e.asistencia = {
            diario: r.filter(x => x.fecha === hoy).length,
            mensual: r.filter(x => x.fecha?.startsWith(mes)).length,
            anual: r.filter(x => x.fecha?.startsWith(año)).length,
            total: r.length
        };
        this.guardar('estadisticas', e);
    }
    
    actualizarEstadisticasUsuarios() {
        const u = this.cargar('usuarios');
        const e = this.cargar('estadisticas');
        const t = u?.usuarios || [];
        const mes = new Date().toISOString().substring(0, 7);
        e.usuarios = {
            total: t.length,
            activos: t.filter(x => x.estado === 'activo').length,
            nuevos_mes: t.filter(x => x.fecha_registro?.startsWith(mes)).length
        };
        const pub = this.getPublicaciones();
        const com = this.cargar('comentarios')?.comentarios || [];
        e.publicaciones = { total: pub.length, comentarios: com.length };
        this.guardar('estadisticas', e);
    }

    // ============================================
    // NOTICIAS, EVENTOS, ASISTENCIA, PETICIONES, NOTIFICACIONES
    // ============================================
    getNoticias() { return this.cargar('noticias')?.noticias || []; }
    addNoticia(d) {
        const n = this.cargar('noticias');
        const nueva = {
            id: (n.noticias?.length || 0) + 1, titulo: d.titulo, contenido: d.contenido,
            imagen: d.imagen || '', autor_id: d.autor_id, autor_nombre: d.autor_nombre || 'Admin',
            fecha_publicacion: new Date().toISOString(), estado: 'publicado',
            categoria: d.categoria || 'General', reacciones: { me_gusta: 0, amen: 0, bendiciones: 0, aleluya: 0 }
        };
        if (!n.noticias) n.noticias = [];
        n.noticias.unshift(nueva);
        n.ultimo_id = nueva.id;
        this.guardar('noticias', n);
        return nueva;
    }
    
    getEventos() { return this.cargar('eventos')?.eventos || []; }
    addEvento(d) {
        const e = this.cargar('eventos');
        const nuevo = {
            id: (e.eventos?.length || 0) + 1, titulo: d.titulo, descripcion: d.descripcion || '',
            fecha: d.fecha, hora: d.hora || '', lugar: d.lugar || 'IPUC LA FONDA',
            organizador_id: d.organizador_id, fecha_creacion: new Date().toISOString(),
            estado: 'programado', cupos: d.cupos || 0, reservados: 0
        };
        if (!e.eventos) e.eventos = [];
        e.eventos.push(nuevo);
        e.ultimo_id = nuevo.id;
        this.guardar('eventos', e);
        return nuevo;
    }
    
    getAsistencia() { return this.cargar('asistencia')?.registros || []; }
    addAsistencia(d) {
        const a = this.cargar('asistencia');
        const nuevo = {
            id: (a.registros?.length || 0) + 1, usuario_id: d.usuario_id, nombre: d.nombre,
            fecha: new Date().toISOString().split('T')[0], hora: new Date().toLocaleTimeString('es-CO'),
            estado: d.estado || 'Asistiré', tipo: d.tipo || 'Hermano',
            culto: d.culto || '', comentario: d.comentario || ''
        };
        if (!a.registros) a.registros = [];
        a.registros.push(nuevo);
        a.ultimo_id = nuevo.id;
        this.guardar('asistencia', a);
        this.actualizarEstadisticasAsistencia();
        return nuevo;
    }
    
    getPeticiones() { return this.cargar('peticiones')?.peticiones || []; }
    addPeticion(d) {
        const p = this.cargar('peticiones');
        const nueva = {
            id: (p.peticiones?.length || 0) + 1, usuario_id: d.usuario_id, nombre: d.nombre,
            motivo: d.motivo, descripcion: d.descripcion || '', fecha: new Date().toISOString(),
            estado: 'activa', oraciones: 0
        };
        if (!p.peticiones) p.peticiones = [];
        p.peticiones.unshift(nueva);
        p.ultimo_id = nueva.id;
        this.guardar('peticiones', p);
        return nueva;
    }
    
    getNotificaciones() { return this.cargar('notificaciones')?.notificaciones || []; }
    addNotificacion(d) {
        const n = this.cargar('notificaciones');
        const nueva = {
            id: (n.notificaciones?.length || 0) + 1, titulo: d.titulo, mensaje: d.mensaje,
            fecha: new Date().toISOString(), leida: false, tipo: d.tipo || 'general'
        };
        if (!n.notificaciones) n.notificaciones = [];
        n.notificaciones.unshift(nueva);
        n.ultimo_id = nueva.id;
        this.guardar('notificaciones', n);
        return nueva;
    }
    
    marcarTodasLeidas() {
        const n = this.cargar('notificaciones');
        if (n?.notificaciones) {
            n.notificaciones.forEach(x => x.leida = true);
            this.guardar('notificaciones', n);
        }
    }
    
    getNoLeidas() { return this.getNotificaciones().filter(x => !x.leida).length; }

    // ============================================
    // ESTADÍSTICAS GENERALES Y UTILIDADES
    // ============================================
    getEstadisticas() {
        const pub = this.getPublicaciones();
        const com = this.cargar('comentarios')?.comentarios || [];
        return {
            usuarios: (this.cargar('usuarios')?.usuarios || []).length,
            noticias: this.getNoticias().length,
            eventos: this.getEventos().length,
            asistencia: this.getAsistencia().length,
            peticiones: this.getPeticiones().length,
            noLeidas: this.getNoLeidas(),
            publicaciones: pub.length,
            comentarios: com.length
        };
    }
    
    exportarTodo() {
        const datos = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k.startsWith(this.prefix)) datos[k] = localStorage.getItem(k);
        }
        return datos;
    }
    
    importarTodo(datos) {
        for (const [k, v] of Object.entries(datos)) {
            if (k.startsWith(this.prefix)) localStorage.setItem(k, v);
        }
        this.cache = {};
        this.lastCacheUpdate = {};
    }
    
    limpiarTodo() {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k.startsWith(this.prefix)) localStorage.removeItem(k);
        }
        this.cache = {};
    }
}

// ============================================
// CREAR INSTANCIA GLOBAL
// ============================================
const db = new Database();
db.inicializarDatos();

window.Database = Database;
window.db = db;

console.log('✅ IPUC LA FONDA - Database v5.0 cargada correctamente');
console.log('💾 Almacenamiento: localStorage con sistema de respaldos');
console.log('📝 Sistema de publicaciones, comentarios y reacciones integrado');
console.log('🔒 Sin credenciales de prueba');
