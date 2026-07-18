// ============================================
// IPUC LA FONDA - DATABASE v10.0 (PRIVADO)
// Gestión de Base de Datos en localStorage
// Sin mensajes en consola - Acceso restringido
// VERSIÓN INTERNACIONAL - COMPLETO
// ============================================

class Database {
    constructor() {
        this.prefix = 'ipuc10_';
        this.cache = {};
        this.cacheTimeout = 300;
        this.lastCacheUpdate = {};
        this.version = '10.0';
        this.initialized = false;
    }

    _getKey(name) {
        return `${this.prefix}${name}`;
    }

    _isValidKey(name) {
        return /^[a-zA-Z0-9_\-]+$/.test(name);
    }

    // ============================================
    // OPERACIONES CRUD BÁSICAS
    // ============================================
    cargar(nombreArchivo) {
        if (!this._isValidKey(nombreArchivo)) return null;
        const clave = this._getKey(nombreArchivo);
        if (this.cache[clave] && this.lastCacheUpdate[clave]) {
            const tiempoCache = (Date.now() - this.lastCacheUpdate[clave]) / 1000;
            if (tiempoCache < this.cacheTimeout) {
                return JSON.parse(JSON.stringify(this.cache[clave]));
            }
        }
        try {
            const datos = localStorage.getItem(clave);
            if (!datos) return this._crearArchivoPorDefecto(nombreArchivo);
            const parsed = JSON.parse(datos);
            this.cache[clave] = JSON.parse(JSON.stringify(parsed));
            this.lastCacheUpdate[clave] = Date.now();
            return parsed;
        } catch {
            return this._recuperarRespaldo(nombreArchivo);
        }
    }

    guardar(nombreArchivo, datos) {
        if (!this._isValidKey(nombreArchivo) || typeof datos !== 'object' || datos === null) return false;
        const clave = this._getKey(nombreArchivo);
        try {
            const datosAnteriores = localStorage.getItem(clave);
            if (datosAnteriores) this._crearRespaldo(nombreArchivo, datosAnteriores);
            localStorage.setItem(clave, JSON.stringify(datos, null, 2));
            this.cache[clave] = JSON.parse(JSON.stringify(datos));
            this.lastCacheUpdate[clave] = Date.now();
            return true;
        } catch {
            return false;
        }
    }

    eliminar(nombreArchivo) {
        if (!this._isValidKey(nombreArchivo)) return false;
        const clave = this._getKey(nombreArchivo);
        try {
            localStorage.removeItem(clave);
            delete this.cache[clave];
            delete this.lastCacheUpdate[clave];
            return true;
        } catch {
            return false;
        }
    }

    // ============================================
    // ARCHIVOS POR DEFECTO
    // ============================================
    _crearArchivoPorDefecto(nombreArchivo) {
        const datosPorDefecto = {
            'usuarios': { usuarios: [], ultimo_id: 0 },
            'administradores': { administradores: [], ultimo_id: 0 },
            'publicaciones': { publicaciones: [], ultimo_id: 0 },
            'comentarios': { comentarios: [], ultimo_id: 0 },
            'reacciones': { reacciones: {} },
            'noticias': { noticias: [], ultimo_id: 0 },
            'eventos': { eventos: [], ultimo_id: 0 },
            'asistencia': { registros: [], ultimo_id: 0 },
            'notificaciones': { notificaciones: [], ultimo_id: 0 },
            'peticiones': { peticiones: [], ultimo_id: 0 },
            'insignias': { insignias: [], ultimo_id: 0 },
            'versiculos': { versiculos: [], ultimo_id: 0 },
            'horarios': { cultos: [] },
            'biblioteca': { recursos: [], ultimo_id: 0 },
            'galeria': { albumes: [], ultimo_id: 0 },
            'encuestas': { encuestas: [], ultimo_id: 0 },
            'podcast': { episodios: [], ultimo_id: 0 },
            'chat': { mensajes: [], ultimo_id: 0 },
            'directorio': { miembros: [], ultimo_id: 0 },
            'estadisticas': { asistencia: {}, usuarios: {}, publicaciones: {} },
            'configuracion': { iglesia: {}, aplicacion: {} }
        };
        if (datosPorDefecto[nombreArchivo]) {
            this.guardar(nombreArchivo, datosPorDefecto[nombreArchivo]);
            return datosPorDefecto[nombreArchivo];
        }
        return null;
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
        } catch {}
    }

    _limpiarRespaldosAntiguos(nombreArchivo, maxRespaldos = 10) {
        try {
            const respaldos = [];
            for (let i = 0; i < localStorage.length; i++) {
                const clave = localStorage.key(i);
                if (clave && clave.startsWith(`${this.prefix}backup_${nombreArchivo}_`)) {
                    respaldos.push(clave);
                }
            }
            respaldos.sort((a, b) => b.localeCompare(a));
            if (respaldos.length > maxRespaldos) {
                for (let i = maxRespaldos; i < respaldos.length; i++) {
                    localStorage.removeItem(respaldos[i]);
                }
            }
        } catch {}
    }

    _recuperarRespaldo(nombreArchivo) {
        try {
            const respaldos = [];
            for (let i = 0; i < localStorage.length; i++) {
                const clave = localStorage.key(i);
                if (clave && clave.startsWith(`${this.prefix}backup_${nombreArchivo}_`)) {
                    respaldos.push(clave);
                }
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
                } catch {}
            }
            return null;
        } catch {
            return null;
        }
    }

    // ============================================
    // SEGURIDAD Y HASH
    // ============================================
    hashPassword(password) {
        if (!password || typeof password !== 'string') throw new Error('Contraseña inválida');
        let hash = 0;
        const salt = 'ipuc10_salt_2026';
        const str = password + salt;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    // ============================================
    // VALIDACIONES
    // ============================================
    _validarCorreo(correo) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correo);
    }

    _validarUsuario(usuario) {
        return /^[a-zA-Z0-9_]{3,20}$/.test(usuario);
    }

    _validarTelefono(telefono) {
        return /^[0-9]{10}$/.test(telefono);
    }

    _validarDocumento(documento) {
        return documento && documento.length >= 5;
    }

    // ============================================
    // ADMINISTRADOR
    // ============================================
    crearPrimerAdministrador(datos) {
        try {
            const admins = this.cargar('administradores');
            if (admins?.administradores?.length > 0) {
                return { success: false, error: 'Ya existe un administrador' };
            }
            const campos = ['nombre', 'apellidos', 'correo', 'usuario', 'password'];
            for (const c of campos) {
                if (!datos[c] || !String(datos[c]).trim()) {
                    return { success: false, error: `El campo '${c}' es obligatorio` };
                }
            }
            if (!this._validarCorreo(datos.correo)) {
                return { success: false, error: 'Correo inválido' };
            }
            if (!this._validarUsuario(datos.usuario)) {
                return { success: false, error: 'Usuario inválido (3-20 caracteres, solo letras, números y _)' };
            }
            if (datos.password.length < 8) {
                return { success: false, error: 'Contraseña mínima 8 caracteres' };
            }
            const admin = {
                id: 1,
                nombre: datos.nombre.trim(),
                apellidos: datos.apellidos.trim(),
                correo: datos.correo.trim().toLowerCase(),
                celular: (datos.celular || '').trim(),
                usuario: datos.usuario.trim().toLowerCase(),
                password: this.hashPassword(datos.password),
                foto: datos.foto || 'assets/avatars/admin.png',
                rol: 'admin',
                verificado: true,
                fecha_registro: new Date().toISOString(),
                estado: 'activo',
                ministerio: datos.ministerio || 'Pastoral',
                insignias: ['Administrador', 'Cuenta Verificada', 'Líder']
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
                return { success: true, data: admin };
            }
            return { success: false, error: 'Error al guardar' };
        } catch {
            return { success: false, error: 'Error al crear administrador' };
        }
    }

    // ============================================
    // AUTENTICACIÓN
    // ============================================
    login(usuario, password) {
        try {
            if (!usuario || !password) {
                return { success: false, error: 'Usuario y contraseña requeridos' };
            }
            const hash = this.hashPassword(password);
            const admins = this.cargar('administradores');
            const admin = admins?.administradores?.find(a =>
                (a.usuario === usuario || a.correo === usuario) && a.password === hash
            );
            if (admin) {
                if (admin.estado !== 'activo') {
                    return { success: false, error: 'Cuenta desactivada' };
                }
                const { password: _, ...adminSeguro } = admin;
                return {
                    success: true,
                    token: 't10_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    rol: 'admin',
                    usuario: adminSeguro
                };
            }
            const usuarios = this.cargar('usuarios');
            const user = usuarios?.usuarios?.find(u =>
                (u.usuario === usuario || u.correo === usuario) && u.password === hash
            );
            if (user) {
                if (user.estado !== 'activo') {
                    return { success: false, error: 'Cuenta desactivada' };
                }
                const { password: _, ...userSeguro } = user;
                return {
                    success: true,
                    token: 't10_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    rol: 'usuario',
                    usuario: userSeguro
                };
            }
            return { success: false, error: 'Credenciales inválidas' };
        } catch {
            return { success: false, error: 'Error en el servidor' };
        }
    }

    // ============================================
    // REGISTRO DE USUARIO
    // ============================================
    registrarUsuario(datos) {
        try {
            const campos = ['nombre', 'apellidos', 'documento', 'fecha_nacimiento',
                'sexo', 'correo', 'celular', 'usuario', 'password', 'ministerio'
            ];
            for (const c of campos) {
                if (!datos[c] || !String(datos[c]).trim()) {
                    return { success: false, error: `El campo '${c}' es obligatorio` };
                }
            }
            if (!this._validarCorreo(datos.correo)) {
                return { success: false, error: 'Correo inválido' };
            }
            if (!this._validarUsuario(datos.usuario)) {
                return { success: false, error: 'Usuario inválido (3-20 caracteres)' };
            }
            if (!this._validarTelefono(datos.celular)) {
                return { success: false, error: 'Celular inválido (10 dígitos)' };
            }
            if (datos.password.length < 8) {
                return { success: false, error: 'Contraseña mínima 8 caracteres' };
            }
            const usuarios = this.cargar('usuarios');
            if (usuarios?.usuarios?.some(u => String(u.documento) === String(datos.documento))) {
                return { success: false, error: 'Documento ya registrado' };
            }
            if (usuarios?.usuarios?.some(u => u.correo?.toLowerCase() === datos.correo.toLowerCase())) {
                return { success: false, error: 'Correo ya registrado' };
            }
            if (usuarios?.usuarios?.some(u => u.usuario?.toLowerCase() === datos.usuario.toLowerCase())) {
                return { success: false, error: 'Usuario ya existe' };
            }
            const nuevo = {
                id: (usuarios?.usuarios?.length || 0) + 1,
                nombre: datos.nombre.trim(),
                apellidos: datos.apellidos.trim(),
                documento: datos.documento.trim(),
                fecha_nacimiento: datos.fecha_nacimiento,
                sexo: datos.sexo,
                correo: datos.correo.trim().toLowerCase(),
                celular: datos.celular.trim(),
                direccion: (datos.direccion || '').trim(),
                ministerio: datos.ministerio,
                usuario: datos.usuario.trim().toLowerCase(),
                password: this.hashPassword(datos.password),
                foto: datos.foto || 'assets/avatars/default.png',
                rol: 'usuario',
                verificado: false,
                fecha_registro: new Date().toISOString(),
                estado: 'activo',
                insignias: ['Nuevo Miembro']
            };
            if (!usuarios.usuarios) usuarios.usuarios = [];
            usuarios.usuarios.push(nuevo);
            usuarios.ultimo_id = nuevo.id;
            if (this.guardar('usuarios', usuarios)) {
                this._actualizarEstadisticasUsuarios();
                this._agregarNotificacion({
                    titulo: 'Nuevo miembro',
                    mensaje: `${nuevo.nombre} se ha unido a la comunidad`,
                    tipo: 'usuario'
                });
                return {
                    success: true,
                    data: {
                        id: nuevo.id,
                        nombre: nuevo.nombre,
                        usuario: nuevo.usuario
                    }
                };
            }
            return { success: false, error: 'Error al guardar' };
        } catch {
            return { success: false, error: 'Error en el servidor' };
        }
    }

    // ============================================
    // PUBLICACIONES
    // ============================================
    getPublicaciones() {
        return this.cargar('publicaciones')?.publicaciones || [];
    }

    addPublicacion(datos) {
        try {
            if (!datos.usuario_id || !datos.autor || !datos.contenido) {
                return { success: false, error: 'Datos incompletos' };
            }
            const publicaciones = this.cargar('publicaciones');
            const nueva = {
                id: Date.now(),
                usuario_id: datos.usuario_id,
                autor: datos.autor,
                usuario: datos.usuario || 'usuario',
                foto_autor: datos.foto_autor || 'assets/avatars/default.png',
                verificado: datos.verificado || false,
                contenido: datos.contenido.trim(),
                imagen: datos.imagen || '',
                fecha: new Date().toISOString(),
                reacciones: { amen: 0, me_gusta: 0, fuego: 0, orando: 0, bendicion: 0 },
                comentarios_count: 0
            };
            if (!publicaciones.publicaciones) publicaciones.publicaciones = [];
            publicaciones.publicaciones.unshift(nueva);
            publicaciones.ultimo_id = nueva.id;
            if (this.guardar('publicaciones', publicaciones)) {
                this._agregarNotificacion({
                    titulo: 'Nueva publicación',
                    mensaje: `${datos.autor} ha publicado en el muro`,
                    tipo: 'publicacion'
                });
                return { success: true, data: nueva };
            }
            return { success: false, error: 'Error al guardar' };
        } catch {
            return { success: false, error: 'Error al crear publicación' };
        }
    }

    deletePublicacion(id) {
        try {
            const publicaciones = this.cargar('publicaciones');
            publicaciones.publicaciones = (publicaciones.publicaciones || [])
                .filter(p => p.id !== id);
            this.guardar('publicaciones', publicaciones);
            const comentarios = this.cargar('comentarios');
            comentarios.comentarios = (comentarios.comentarios || [])
                .filter(c => c.publicacion_id !== id);
            this.guardar('comentarios', comentarios);
            return { success: true };
        } catch {
            return { success: false, error: 'Error al eliminar publicación' };
        }
    }

    // ============================================
    // COMENTARIOS
    // ============================================
    getComentarios(publicacionId = null) {
        const comentarios = this.cargar('comentarios')?.comentarios || [];
        if (publicacionId) {
            return comentarios
                .filter(c => c.publicacion_id === publicacionId)
                .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        }
        return comentarios;
    }

    addComentario(datos) {
        try {
            if (!datos.publicacion_id || !datos.usuario_id || !datos.autor || !datos.contenido) {
                return { success: false, error: 'Datos incompletos' };
            }
            const comentarios = this.cargar('comentarios');
            const nuevo = {
                id: Date.now(),
                publicacion_id: datos.publicacion_id,
                usuario_id: datos.usuario_id,
                autor: datos.autor,
                usuario: datos.usuario || 'usuario',
                foto_autor: datos.foto_autor || 'assets/avatars/default.png',
                contenido: datos.contenido.trim(),
                fecha: new Date().toISOString()
            };
            if (!comentarios.comentarios) comentarios.comentarios = [];
            comentarios.comentarios.push(nuevo);
            comentarios.ultimo_id = nuevo.id;
            this.guardar('comentarios', comentarios);
            const publicaciones = this.cargar('publicaciones');
            const pub = (publicaciones?.publicaciones || [])
                .find(p => p.id === datos.publicacion_id);
            if (pub) {
                pub.comentarios_count = (pub.comentarios_count || 0) + 1;
                this.guardar('publicaciones', publicaciones);
            }
            return { success: true, data: nuevo };
        } catch {
            return { success: false, error: 'Error al agregar comentario' };
        }
    }

    // ============================================
    // REACCIONES
    // ============================================
    toggleReaccion(publicacionId, usuarioId, tipo) {
        try {
            if (!publicacionId || !usuarioId || !tipo) {
                return { success: false, error: 'Datos incompletos' };
            }
            const reacciones = this.cargar('reacciones');
            if (!reacciones.reacciones) reacciones.reacciones = {};
            const clave = `${publicacionId}_${usuarioId}`;
            const actual = reacciones.reacciones[clave];
            const publicaciones = this.cargar('publicaciones');
            const pub = (publicaciones?.publicaciones || [])
                .find(p => p.id === publicacionId);
            if (!pub) {
                return { success: false, error: 'Publicación no encontrada' };
            }
            if (actual === tipo) {
                delete reacciones.reacciones[clave];
                if (pub.reacciones[tipo] > 0) pub.reacciones[tipo]--;
            } else {
                if (actual) {
                    if (pub.reacciones[actual] > 0) pub.reacciones[actual]--;
                }
                reacciones.reacciones[clave] = tipo;
                pub.reacciones[tipo] = (pub.reacciones[tipo] || 0) + 1;
            }
            this.guardar('reacciones', reacciones);
            this.guardar('publicaciones', publicaciones);
            return { success: true, data: reacciones.reacciones[clave] || null };
        } catch {
            return { success: false, error: 'Error al procesar reacción' };
        }
    }

    getReaccionUsuario(publicacionId, usuarioId) {
        const reacciones = this.cargar('reacciones');
        return reacciones?.reacciones?.[`${publicacionId}_${usuarioId}`] || null;
    }

    // ============================================
    // NOTICIAS
    // ============================================
    getNoticias() {
        return this.cargar('noticias')?.noticias || [];
    }

    addNoticia(datos) {
        try {
            if (!datos.titulo || !datos.contenido) {
                return { success: false, error: 'Título y contenido requeridos' };
            }
            const noticias = this.cargar('noticias');
            const nueva = {
                id: (noticias.noticias?.length || 0) + 1,
                titulo: datos.titulo.trim(),
                contenido: datos.contenido.trim(),
                imagen: datos.imagen || '',
                autor_id: datos.autor_id || 0,
                autor_nombre: datos.autor_nombre || 'Admin',
                fecha_publicacion: new Date().toISOString(),
                estado: 'publicado',
                categoria: datos.categoria || 'General',
                reacciones: { me_gusta: 0, amen: 0, bendiciones: 0, aleluya: 0 }
            };
            if (!noticias.noticias) noticias.noticias = [];
            noticias.noticias.unshift(nueva);
            noticias.ultimo_id = nueva.id;
            if (this.guardar('noticias', noticias)) {
                this._agregarNotificacion({
                    titulo: 'Nueva noticia',
                    mensaje: `${nueva.titulo}`,
                    tipo: 'noticia'
                });
                return { success: true, data: nueva };
            }
            return { success: false, error: 'Error al guardar' };
        } catch {
            return { success: false, error: 'Error al crear noticia' };
        }
    }

    // ============================================
    // EVENTOS
    // ============================================
    getEventos() {
        return this.cargar('eventos')?.eventos || [];
    }

    addEvento(datos) {
        try {
            if (!datos.titulo || !datos.fecha) {
                return { success: false, error: 'Título y fecha requeridos' };
            }
            const eventos = this.cargar('eventos');
            const nuevo = {
                id: (eventos.eventos?.length || 0) + 1,
                titulo: datos.titulo.trim(),
                descripcion: datos.descripcion || '',
                fecha: datos.fecha,
                hora: datos.hora || '',
                lugar: datos.lugar || 'IPUC LA FONDA',
                organizador_id: datos.organizador_id || 0,
                fecha_creacion: new Date().toISOString(),
                estado: 'programado',
                cupos: datos.cupos || 0,
                reservados: 0
            };
            if (!eventos.eventos) eventos.eventos = [];
            eventos.eventos.push(nuevo);
            eventos.ultimo_id = nuevo.id;
            if (this.guardar('eventos', eventos)) {
                this._agregarNotificacion({
                    titulo: 'Nuevo evento',
                    mensaje: `${nuevo.titulo} - ${nuevo.fecha}`,
                    tipo: 'evento'
                });
                return { success: true, data: nuevo };
            }
            return { success: false, error: 'Error al guardar' };
        } catch {
            return { success: false, error: 'Error al crear evento' };
        }
    }

    // ============================================
    // ASISTENCIA
    // ============================================
    getAsistencia() {
        return this.cargar('asistencia')?.registros || [];
    }

    addAsistencia(datos) {
        try {
            if (!datos.usuario_id || !datos.nombre) {
                return { success: false, error: 'Datos incompletos' };
            }
            const asistencia = this.cargar('asistencia');
            const nuevo = {
                id: (asistencia.registros?.length || 0) + 1,
                usuario_id: datos.usuario_id,
                nombre: datos.nombre.trim(),
                fecha: new Date().toISOString().split('T')[0],
                hora: new Date().toLocaleTimeString('es-CO'),
                estado: datos.estado || 'Asistiré',
                tipo: datos.tipo || 'Hermano',
                culto: datos.culto || '',
                comentario: datos.comentario || ''
            };
            if (!asistencia.registros) asistencia.registros = [];
            asistencia.registros.push(nuevo);
            asistencia.ultimo_id = nuevo.id;
            if (this.guardar('asistencia', asistencia)) {
                this._actualizarEstadisticasAsistencia();
                return { success: true, data: nuevo };
            }
            return { success: false, error: 'Error al guardar' };
        } catch {
            return { success: false, error: 'Error al registrar asistencia' };
        }
    }

    // ============================================
    // PETICIONES
    // ============================================
    getPeticiones() {
        return this.cargar('peticiones')?.peticiones || [];
    }

    addPeticion(datos) {
        try {
            if (!datos.usuario_id || !datos.nombre || !datos.motivo) {
                return { success: false, error: 'Datos incompletos' };
            }
            const peticiones = this.cargar('peticiones');
            const nueva = {
                id: (peticiones.peticiones?.length || 0) + 1,
                usuario_id: datos.usuario_id,
                nombre: datos.nombre.trim(),
                motivo: datos.motivo.trim(),
                descripcion: datos.descripcion || '',
                fecha: new Date().toISOString(),
                estado: 'activa',
                oraciones: 0
            };
            if (!peticiones.peticiones) peticiones.peticiones = [];
            peticiones.peticiones.unshift(nueva);
            peticiones.ultimo_id = nueva.id;
            if (this.guardar('peticiones', peticiones)) {
                this._agregarNotificacion({
                    titulo: 'Nueva petición',
                    mensaje: `${nueva.nombre} ha compartido una petición`,
                    tipo: 'peticion'
                });
                return { success: true, data: nueva };
            }
            return { success: false, error: 'Error al guardar' };
        } catch {
            return { success: false, error: 'Error al crear petición' };
        }
    }

    // ============================================
    // ENCUESTAS
    // ============================================
    getEncuestas() {
        return this.cargar('encuestas')?.encuestas || [];
    }

    addEncuesta(datos) {
        try {
            if (!datos.titulo) {
                return { success: false, error: 'Título requerido' };
            }
            const encuestas = this.cargar('encuestas');
            const nueva = {
                id: (encuestas.encuestas?.length || 0) + 1,
                titulo: datos.titulo.trim(),
                preguntas: datos.preguntas || [],
                fecha: new Date().toISOString(),
                activa: true,
                votos: {}
            };
            if (!encuestas.encuestas) encuestas.encuestas = [];
            encuestas.encuestas.push(nueva);
            encuestas.ultimo_id = nueva.id;
            this.guardar('encuestas', encuestas);
            return { success: true, data: nueva };
        } catch {
            return { success: false, error: 'Error al crear encuesta' };
        }
    }

    votarEncuesta(encuestaId, opcion) {
        try {
            const encuestas = this.cargar('encuestas');
            const encuesta = encuestas?.encuestas?.find(e => e.id === encuestaId);
            if (!encuesta) return { success: false, error: 'Encuesta no encontrada' };
            if (!encuesta.activa) return { success: false, error: 'Encuesta cerrada' };
            
            if (!encuesta.votos) encuesta.votos = {};
            encuesta.votos[opcion] = (encuesta.votos[opcion] || 0) + 1;
            this.guardar('encuestas', encuestas);
            return { success: true, data: encuesta };
        } catch {
            return { success: false, error: 'Error al votar' };
        }
    }

    // ============================================
    // BIBLIOTECA
    // ============================================
    getRecursos() {
        return this.cargar('biblioteca')?.recursos || [];
    }

    addRecurso(datos) {
        try {
            if (!datos.titulo || !datos.autor) {
                return { success: false, error: 'Título y autor requeridos' };
            }
            const biblioteca = this.cargar('biblioteca');
            const nuevo = {
                id: (biblioteca.recursos?.length || 0) + 1,
                titulo: datos.titulo.trim(),
                autor: datos.autor.trim(),
                categoria: datos.categoria || 'General',
                pdf: datos.pdf || 'recurso.pdf',
                fecha: new Date().toISOString()
            };
            if (!biblioteca.recursos) biblioteca.recursos = [];
            biblioteca.recursos.push(nuevo);
            biblioteca.ultimo_id = nuevo.id;
            this.guardar('biblioteca', biblioteca);
            return { success: true, data: nuevo };
        } catch {
            return { success: false, error: 'Error al agregar recurso' };
        }
    }

    // ============================================
    // GALERIA
    // ============================================
    getAlbumes() {
        return this.cargar('galeria')?.albumes || [];
    }

    addImagen(datos) {
        try {
            if (!datos.titulo) {
                return { success: false, error: 'Título requerido' };
            }
            const galeria = this.cargar('galeria');
            const nuevo = {
                id: (galeria.albumes?.length || 0) + 1,
                titulo: datos.titulo.trim(),
                url: datos.url || '',
                fecha: new Date().toISOString(),
                descripcion: datos.descripcion || ''
            };
            if (!galeria.albumes) galeria.albumes = [];
            galeria.albumes.push(nuevo);
            galeria.ultimo_id = nuevo.id;
            this.guardar('galeria', galeria);
            return { success: true, data: nuevo };
        } catch {
            return { success: false, error: 'Error al agregar imagen' };
        }
    }

    // ============================================
    // PODCAST
    // ============================================
    getPodcast() {
        return this.cargar('podcast')?.episodios || [];
    }

    addPodcast(datos) {
        try {
            if (!datos.titulo || !datos.pastor) {
                return { success: false, error: 'Título y pastor requeridos' };
            }
            const podcast = this.cargar('podcast');
            const nuevo = {
                id: (podcast.episodios?.length || 0) + 1,
                titulo: datos.titulo.trim(),
                pastor: datos.pastor.trim(),
                duracion: datos.duracion || '30 min',
                fecha: new Date().toISOString(),
                audio: datos.audio || 'podcast.mp3'
            };
            if (!podcast.episodios) podcast.episodios = [];
            podcast.episodios.push(nuevo);
            podcast.ultimo_id = nuevo.id;
            this.guardar('podcast', podcast);
            return { success: true, data: nuevo };
        } catch {
            return { success: false, error: 'Error al agregar podcast' };
        }
    }

    // ============================================
    // CHAT
    // ============================================
    getMensajes() {
        return this.cargar('chat')?.mensajes || [];
    }

    addMensaje(datos) {
        try {
            if (!datos.usuario || !datos.usuario_id || !datos.mensaje) {
                return { success: false, error: 'Datos incompletos' };
            }
            const chat = this.cargar('chat');
            const nuevo = {
                id: Date.now(),
                usuario: datos.usuario,
                usuario_id: datos.usuario_id,
                mensaje: datos.mensaje.trim(),
                fecha: new Date().toISOString()
            };
            if (!chat.mensajes) chat.mensajes = [];
            chat.mensajes.push(nuevo);
            chat.ultimo_id = nuevo.id;
            this.guardar('chat', chat);
            return { success: true, data: nuevo };
        } catch {
            return { success: false, error: 'Error al enviar mensaje' };
        }
    }

    // ============================================
    // DIRECTORIO
    // ============================================
    getDirectorio() {
        return this.cargar('directorio')?.miembros || [];
    }

    addMiembro(datos) {
        try {
            if (!datos.nombre) {
                return { success: false, error: 'Nombre requerido' };
            }
            const directorio = this.cargar('directorio');
            const nuevo = {
                id: (directorio.miembros?.length || 0) + 1,
                nombre: datos.nombre.trim(),
                apellidos: datos.apellidos || '',
                ministerio: datos.ministerio || 'General',
                verificado: datos.verificado || false,
                fecha: new Date().toISOString()
            };
            if (!directorio.miembros) directorio.miembros = [];
            directorio.miembros.push(nuevo);
            directorio.ultimo_id = nuevo.id;
            this.guardar('directorio', directorio);
            return { success: true, data: nuevo };
        } catch {
            return { success: false, error: 'Error al agregar miembro' };
        }
    }

    // ============================================
    // NOTIFICACIONES
    // ============================================
    getNotificaciones() {
        return this.cargar('notificaciones')?.notificaciones || [];
    }

    _agregarNotificacion(datos) {
        try {
            const notificaciones = this.cargar('notificaciones');
            const nueva = {
                id: (notificaciones.notificaciones?.length || 0) + 1,
                titulo: datos.titulo,
                mensaje: datos.mensaje,
                fecha: new Date().toISOString(),
                leida: false,
                tipo: datos.tipo || 'general',
                icono: datos.icono || null
            };
            if (!notificaciones.notificaciones) notificaciones.notificaciones = [];
            notificaciones.notificaciones.unshift(nueva);
            notificaciones.ultimo_id = nueva.id;
            this.guardar('notificaciones', notificaciones);
        } catch {}
    }

    marcarTodasLeidas() {
        try {
            const notificaciones = this.cargar('notificaciones');
            if (notificaciones?.notificaciones) {
                notificaciones.notificaciones.forEach(n => n.leida = true);
                this.guardar('notificaciones', notificaciones);
                return { success: true };
            }
            return { success: false, error: 'No hay notificaciones' };
        } catch {
            return { success: false, error: 'Error al marcar notificaciones' };
        }
    }

    getNoLeidas() {
        return this.getNotificaciones().filter(n => !n.leida).length;
    }

    // ============================================
    // ESTADÍSTICAS
    // ============================================
    _actualizarEstadisticasAsistencia() {
        try {
            const asistencia = this.cargar('asistencia');
            const estadisticas = this.cargar('estadisticas');
            const hoy = new Date().toISOString().split('T')[0];
            const mes = hoy.substring(0, 7);
            const año = hoy.substring(0, 4);
            const registros = asistencia?.registros || [];
            estadisticas.asistencia = {
                diario: registros.filter(r => r.fecha === hoy).length,
                mensual: registros.filter(r => r.fecha?.startsWith(mes)).length,
                anual: registros.filter(r => r.fecha?.startsWith(año)).length,
                total: registros.length
            };
            this.guardar('estadisticas', estadisticas);
        } catch {}
    }

    _actualizarEstadisticasUsuarios() {
        try {
            const usuarios = this.cargar('usuarios');
            const estadisticas = this.cargar('estadisticas');
            const usuariosList = usuarios?.usuarios || [];
            const mes = new Date().toISOString().substring(0, 7);
            estadisticas.usuarios = {
                total: usuariosList.length,
                activos: usuariosList.filter(u => u.estado === 'activo').length,
                nuevos_mes: usuariosList.filter(u => u.fecha_registro?.startsWith(mes)).length
            };
            const publicaciones = this.getPublicaciones();
            const comentarios = this.cargar('comentarios')?.comentarios || [];
            estadisticas.publicaciones = {
                total: publicaciones.length,
                comentarios: comentarios.length
            };
            this.guardar('estadisticas', estadisticas);
        } catch {}
    }

    getEstadisticas() {
        try {
            const estadisticas = this.cargar('estadisticas');
            return {
                usuarios: estadisticas?.usuarios?.total || 0,
                activos: estadisticas?.usuarios?.activos || 0,
                nuevos_mes: estadisticas?.usuarios?.nuevos_mes || 0,
                publicaciones: estadisticas?.publicaciones?.total || 0,
                comentarios: estadisticas?.publicaciones?.comentarios || 0,
                noticias: this.getNoticias().length,
                eventos: this.getEventos().length,
                asistencia_diaria: estadisticas?.asistencia?.diario || 0,
                asistencia_mensual: estadisticas?.asistencia?.mensual || 0,
                asistencia_total: estadisticas?.asistencia?.total || 0,
                peticiones: this.getPeticiones().length,
                encuestas: this.getEncuestas().length,
                recursos: this.getRecursos().length,
                episodios: this.getPodcast().length,
                mensajes: this.getMensajes().length,
                notificaciones_no_leidas: this.getNoLeidas()
            };
        } catch {
            return {};
        }
    }

    // ============================================
    // VERSÍCULOS
    // ============================================
    getVersiculos() {
        return this.cargar('versiculos')?.versiculos || [];
    }

    getVersiculoDiario() {
        const versiculos = this.getVersiculos();
        if (versiculos.length === 0) return null;
        const index = new Date().getDay() % versiculos.length;
        return versiculos[index];
    }

    // ============================================
    // INSIGNIAS
    // ============================================
    getInsignias() {
        return this.cargar('insignias')?.insignias || [];
    }

    getInsigniasUsuario(usuarioId) {
        const usuarios = this.cargar('usuarios');
        const user = usuarios?.usuarios?.find(u => u.id === usuarioId);
        return user?.insignias || [];
    }

    // ============================================
    // HORARIOS
    // ============================================
    getHorarios() {
        return this.cargar('horarios')?.cultos || [];
    }

    getHorarioDia(dia) {
        const cultos = this.getHorarios();
        return cultos.find(c => c.dia === dia) || null;
    }

    // ============================================
    // CONFIGURACIÓN
    // ============================================
    getConfiguracion() {
        return this.cargar('configuracion');
    }

    updateConfiguracion(config) {
        try {
            const cfg = this.cargar('configuracion');
            const nuevaCfg = { ...cfg, ...config };
            if (this.guardar('configuracion', nuevaCfg)) {
                return { success: true };
            }
            return { success: false, error: 'Error al guardar' };
        } catch {
            return { success: false, error: 'Error al actualizar configuración' };
        }
    }

    // ============================================
    // UTILIDADES
    // ============================================
    exportarTodo() {
        const datos = {};
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave && clave.startsWith(this.prefix)) {
                try {
                    datos[clave] = JSON.parse(localStorage.getItem(clave));
                } catch {
                    datos[clave] = localStorage.getItem(clave);
                }
            }
        }
        return {
            version: this.version,
            fecha: new Date().toISOString(),
            datos
        };
    }

    importarTodo(exportData) {
        try {
            if (!exportData || typeof exportData !== 'object') {
                return { success: false, error: 'Datos inválidos' };
            }
            const datos = exportData.datos || exportData;
            for (const [clave, valor] of Object.entries(datos)) {
                if (clave.startsWith(this.prefix)) {
                    localStorage.setItem(clave, JSON.stringify(valor));
                }
            }
            this.cache = {};
            this.lastCacheUpdate = {};
            return { success: true };
        } catch {
            return { success: false, error: 'Error al importar datos' };
        }
    }

    limpiarTodo() {
        try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const clave = localStorage.key(i);
                if (clave && clave.startsWith(this.prefix)) {
                    localStorage.removeItem(clave);
                }
            }
            this.cache = {};
            this.lastCacheUpdate = {};
            return { success: true };
        } catch {
            return { success: false, error: 'Error al limpiar datos' };
        }
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================
    inicializarDatos() {
        const archivos = [
            'usuarios', 'administradores', 'publicaciones', 'comentarios',
            'reacciones', 'noticias', 'eventos', 'asistencia', 'notificaciones',
            'peticiones', 'insignias', 'versiculos', 'horarios', 'biblioteca',
            'galeria', 'encuestas', 'podcast', 'chat', 'directorio',
            'estadisticas', 'configuracion'
        ];
        for (const archivo of archivos) {
            if (!localStorage.getItem(this._getKey(archivo))) {
                const datos = this._crearArchivoPorDefecto(archivo);
                if (datos) {
                    this.guardar(archivo, datos);
                }
            }
        }
        this._inicializarDatosPorDefecto();
        this.initialized = true;
    }

    _inicializarDatosPorDefecto() {
        // Insignias
        const insignias = this.cargar('insignias');
        if (insignias.insignias.length === 0) {
            const insigniasPorDefecto = [
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
            ];
            insignias.insignias = insigniasPorDefecto;
            insignias.ultimo_id = 11;
            this.guardar('insignias', insignias);
        }

        // Versículos
        const versiculos = this.cargar('versiculos');
        if (versiculos.versiculos.length === 0) {
            const versiculosPorDefecto = [
                { id: 1, texto: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", referencia: "Juan 3:16", tipo: "promesa" },
                { id: 2, texto: "Jehová es mi pastor; nada me faltará.", referencia: "Salmos 23:1", tipo: "salmo" },
                { id: 3, texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13", tipo: "promesa" },
                { id: 4, texto: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", referencia: "Mateo 6:33", tipo: "versiculo" },
                { id: 5, texto: "Jehová te bendiga, y te guarde.", referencia: "Números 6:24-25", tipo: "bendicion" },
                { id: 6, texto: "El Señor es mi luz y mi salvación; ¿de quién temeré?", referencia: "Salmos 27:1", tipo: "salmo" },
                { id: 7, texto: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová.", referencia: "Jeremías 29:11", tipo: "promesa" }
            ];
            versiculos.versiculos = versiculosPorDefecto;
            versiculos.ultimo_id = 7;
            this.guardar('versiculos', versiculos);
        }

        // Horarios
        const horarios = this.cargar('horarios');
        if (horarios.cultos.length === 0) {
            horarios.cultos = [
                { dia: "Lunes", cultos: [] },
                { dia: "Martes", cultos: [{ nombre: "Culto de Oración", inicio: "18:00", fin: "20:30" }] },
                { dia: "Miércoles", cultos: [{ nombre: "Culto Campal", inicio: "16:00", fin: "19:00" }] },
                { dia: "Jueves", cultos: [{ nombre: "Culto de Refrán", inicio: "16:00", fin: "19:00" }] },
                { dia: "Viernes", cultos: [{ nombre: "Culto de Jóvenes", inicio: "18:00", fin: "20:30" }] },
                { dia: "Sábado", cultos: [] },
                { dia: "Domingo", cultos: [{ nombre: "Culto Dominical", inicio: "10:00", fin: "12:00" }] }
            ];
            this.guardar('horarios', horarios);
        }

        // Configuración
        const config = this.cargar('configuracion');
        if (!config.iglesia.nombre) {
            config.iglesia = {
                nombre: "IPUC LA FONDA",
                lema: "Where the Holy Spirit moves",
                direccion: "",
                telefono: "",
                correo: "",
                facebook: "",
                instagram: "",
                youtube: "",
                idioma: "es"
            };
            config.aplicacion = {
                version: this.version,
                modo_mantenimiento: false,
                registro_abierto: true,
                primer_administrador_creado: false,
                colores: {
                    primario: "#1a237e",
                    secundario: "#ffd700",
                    fondo_claro: "#ffffff",
                    fondo_oscuro: "#121212"
                }
            };
            this.guardar('configuracion', config);
        }
    }
}

// ============================================
// CREAR INSTANCIA GLOBAL (CON VERIFICACIÓN)
// ============================================
if (typeof window.db === 'undefined') {
    const db = new Database();
    db.inicializarDatos();
    window.db = db;
} else {
    if (!window.db.initialized) {
        window.db.inicializarDatos();
    }
}

window.Database = Database;
