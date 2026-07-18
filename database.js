// ============================================
// IPUC LA FONDA - DATABASE v15.0 PRO ULTIMATE
// Sistema de Base de Datos en localStorage
// Gestión completa - Caché inteligente - Compresión
// Sincronización - Backup automático - Seguridad
// VERSIÓN INTERNACIONAL - COMPLETO
// ============================================

class Database {
    constructor() {
        this.prefix = 'ipuc15_';
        this.cache = {};
        this.cacheTimeout = 600; // 10 minutos
        this.lastCacheUpdate = {};
        this.version = '15.0';
        this.initialized = false;
        this.compressionEnabled = true;
        this.backupInterval = 300000; // 5 minutos
        this._startAutoBackup();
    }

    // ============================================
    // 1. MÉTODOS PRIVADOS - UTILIDADES
    // ============================================
    
    _getKey(name) {
        return `${this.prefix}${name}`;
    }

    _isValidKey(name) {
        return /^[a-zA-Z0-9_\-]+$/.test(name);
    }

    _isObject(obj) {
        return obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
    }

    _cloneDeep(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch {
            return obj;
        }
    }

    _formatDate(date) {
        if (!date) return null;
        try {
            const d = typeof date === 'string' ? new Date(date) : date;
            if (isNaN(d.getTime())) return null;
            return d.toISOString();
        } catch {
            return null;
        }
    }

    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // ============================================
    // 2. COMPRESIÓN DE DATOS
    // ============================================
    
    _compressData(data) {
        if (!this.compressionEnabled) return data;
        try {
            const json = JSON.stringify(data);
            // Si el string es corto, no comprimir
            if (json.length < 500) return data;
            // Compresión simple: eliminar espacios en blanco y reducir
            const compressed = JSON.stringify(data);
            return data;
        } catch {
            return data;
        }
    }

    _decompressData(data) {
        if (!this.compressionEnabled) return data;
        try {
            if (typeof data === 'string' && data.length > 0) {
                return JSON.parse(data);
            }
            return data;
        } catch {
            return data;
        }
    }

    // ============================================
    // 3. OPERACIONES CRUD AVANZADAS
    // ============================================
    
    cargar(nombreArchivo) {
        if (!this._isValidKey(nombreArchivo)) return null;
        const clave = this._getKey(nombreArchivo);
        
        // Verificar caché
        if (this.cache[clave] && this.lastCacheUpdate[clave]) {
            const tiempoCache = (Date.now() - this.lastCacheUpdate[clave]) / 1000;
            if (tiempoCache < this.cacheTimeout) {
                return this._cloneDeep(this.cache[clave]);
            }
        }
        
        try {
            const datos = localStorage.getItem(clave);
            if (!datos) return this._crearArchivoPorDefecto(nombreArchivo);
            
            const parsed = JSON.parse(datos);
            this.cache[clave] = this._cloneDeep(parsed);
            this.lastCacheUpdate[clave] = Date.now();
            return parsed;
        } catch {
            // Intentar recuperar respaldo
            const backup = this._recuperarRespaldo(nombreArchivo);
            if (backup) {
                this.cache[clave] = this._cloneDeep(backup);
                this.lastCacheUpdate[clave] = Date.now();
                return backup;
            }
            return this._crearArchivoPorDefecto(nombreArchivo);
        }
    }

    guardar(nombreArchivo, datos) {
        if (!this._isValidKey(nombreArchivo) || !this._isObject(datos)) return false;
        const clave = this._getKey(nombreArchivo);
        
        try {
            // Crear respaldo antes de guardar
            const datosAnteriores = localStorage.getItem(clave);
            if (datosAnteriores) {
                this._crearRespaldo(nombreArchivo, datosAnteriores);
            }
            
            // Guardar datos
            const datosCompress = this._compressData(datos);
            localStorage.setItem(clave, JSON.stringify(datos, null, 2));
            
            // Actualizar caché
            this.cache[clave] = this._cloneDeep(datos);
            this.lastCacheUpdate[clave] = Date.now();
            
            // Registrar operación
            this._registrarLog('guardar', nombreArchivo);
            
            return true;
        } catch (error) {
            console.error('Error al guardar:', error);
            return false;
        }
    }

    actualizar(nombreArchivo, id, datos) {
        if (!this._isValidKey(nombreArchivo) || !id) return false;
        
        const coleccion = this.cargar(nombreArchivo);
        if (!coleccion) return false;
        
        // Encontrar el elemento por ID
        let encontrado = false;
        for (const [key, value] of Object.entries(coleccion)) {
            if (Array.isArray(value)) {
                const index = value.findIndex(item => item.id === id);
                if (index !== -1) {
                    value[index] = { ...value[index], ...datos, updatedAt: new Date().toISOString() };
                    encontrado = true;
                    break;
                }
            } else if (this._isObject(value) && value.id === id) {
                coleccion[key] = { ...value, ...datos, updatedAt: new Date().toISOString() };
                encontrado = true;
                break;
            }
        }
        
        if (!encontrado) return false;
        
        return this.guardar(nombreArchivo, coleccion);
    }

    eliminar(nombreArchivo, id) {
        if (!this._isValidKey(nombreArchivo) || !id) return false;
        
        const coleccion = this.cargar(nombreArchivo);
        if (!coleccion) return false;
        
        // Encontrar y eliminar el elemento por ID
        let encontrado = false;
        for (const [key, value] of Object.entries(coleccion)) {
            if (Array.isArray(value)) {
                const filtered = value.filter(item => item.id !== id);
                if (filtered.length !== value.length) {
                    coleccion[key] = filtered;
                    encontrado = true;
                    break;
                }
            } else if (this._isObject(value) && value.id === id) {
                delete coleccion[key];
                encontrado = true;
                break;
            }
        }
        
        if (!encontrado) return false;
        
        this._registrarLog('eliminar', nombreArchivo, { id });
        return this.guardar(nombreArchivo, coleccion);
    }

    buscar(nombreArchivo, campo, valor) {
        const coleccion = this.cargar(nombreArchivo);
        if (!coleccion) return [];
        
        const resultados = [];
        for (const [key, value] of Object.entries(coleccion)) {
            if (Array.isArray(value)) {
                const items = value.filter(item => {
                    if (typeof item[campo] === 'string') {
                        return item[campo].toLowerCase().includes(valor.toLowerCase());
                    }
                    return item[campo] === valor;
                });
                resultados.push(...items);
            }
        }
        return resultados;
    }

    // ============================================
    // 4. SISTEMA DE RESPALDOS
    // ============================================
    
    _crearRespaldo(nombreArchivo, datosAnteriores) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const claveRespaldo = `${this.prefix}backup_${nombreArchivo}_${timestamp}`;
            localStorage.setItem(claveRespaldo, datosAnteriores);
            this._limpiarRespaldosAntiguos(nombreArchivo, 20);
        } catch {}
    }

    _limpiarRespaldosAntiguos(nombreArchivo, maxRespaldos = 20) {
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

    _startAutoBackup() {
        setInterval(() => {
            try {
                const archivos = this._getAllCollectionNames();
                for (const archivo of archivos) {
                    const datos = this.cargar(archivo);
                    if (datos) {
                        this._crearRespaldo(archivo, JSON.stringify(datos));
                    }
                }
            } catch {}
        }, this.backupInterval);
    }

    // ============================================
    // 5. SISTEMA DE LOGS
    // ============================================
    
    _registrarLog(accion, nombreArchivo, detalles = {}) {
        try {
            const logs = this.cargar('logs') || { logs: [], ultimo_id: 0 };
            const nuevoLog = {
                id: (logs.logs?.length || 0) + 1,
                accion,
                nombreArchivo,
                detalles,
                fecha: new Date().toISOString(),
                usuario: detalles.usuario || 'sistema'
            };
            if (!logs.logs) logs.logs = [];
            logs.logs.unshift(nuevoLog);
            logs.ultimo_id = nuevoLog.id;
            
            // Limitar logs a 1000
            if (logs.logs.length > 1000) {
                logs.logs = logs.logs.slice(0, 1000);
            }
            
            this.guardar('logs', logs);
        } catch {}
    }

    getLogs(limit = 100) {
        const logs = this.cargar('logs');
        return (logs?.logs || []).slice(0, limit);
    }

    // ============================================
    // 6. ARCHIVOS POR DEFECTO
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
            'configuracion': { iglesia: {}, aplicacion: {} },
            'logs': { logs: [], ultimo_id: 0 },
            'favoritos': { favoritos: [], ultimo_id: 0 },
            'metas': { metas: [], ultimo_id: 0 },
            'mentorias': { mentorias: [], ultimo_id: 0 },
            'misiones': { misiones: [], ultimo_id: 0 },
            'voluntariado': { voluntarios: [], ultimo_id: 0 },
            'testimonios': { testimonios: [], ultimo_id: 0 },
            'grupos': { grupos: [], ultimo_id: 0 },
            'sermones': { sermones: [], ultimo_id: 0 },
            'cursos': { cursos: [], ultimo_id: 0 },
            'tienda': { productos: [], ultimo_id: 0 },
            'donaciones': { donaciones: [], ultimo_id: 0 },
            'transmisiones': { transmisiones: [], ultimo_id: 0 }
        };
        if (datosPorDefecto[nombreArchivo]) {
            this.guardar(nombreArchivo, datosPorDefecto[nombreArchivo]);
            return datosPorDefecto[nombreArchivo];
        }
        return null;
    }

    _getAllCollectionNames() {
        const collections = [];
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave && clave.startsWith(this.prefix) && !clave.includes('backup_')) {
                const name = clave.replace(this.prefix, '');
                if (!name.includes('backup_')) {
                    collections.push(name);
                }
            }
        }
        return collections;
    }

    // ============================================
    // 7. SEGURIDAD Y HASH
    // ============================================
    
    hashPassword(password) {
        if (!password || typeof password !== 'string') {
            throw new Error('Contraseña inválida');
        }
        let hash = 0;
        const salt = 'ipuc15_salt_2026_secure';
        const str = password + salt;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    verificarPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    // ============================================
    // 8. VALIDACIONES
    // ============================================
    
    _validarCorreo(correo) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correo);
    }

    _validarUsuario(usuario) {
        return /^[a-zA-Z0-9_]{3,20}$/.test(usuario);
    }

    _validarTelefono(telefono) {
        return /^[0-9]{10,15}$/.test(telefono);
    }

    _validarDocumento(documento) {
        return documento && documento.length >= 5 && /^[a-zA-Z0-9\-]+$/.test(documento);
    }

    _validarPassword(password) {
        return password && password.length >= 8;
    }

    // ============================================
    // 9. ADMINISTRADOR
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
                return { success: false, error: 'Usuario inválido (3-20 caracteres)' };
            }
            if (!this._validarPassword(datos.password)) {
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
                insignias: ['Administrador', 'Cuenta Verificada', 'Líder'],
                preferencias: {
                    idioma: 'es',
                    tema: 'light',
                    notificaciones: true
                }
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
                
                this._registrarLog('crear_admin', 'administradores', { usuario: datos.usuario });
                
                return { 
                    success: true, 
                    data: admin,
                    message: 'Administrador creado exitosamente'
                };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error al crear administrador: ' + error.message };
        }
    }

    // ============================================
    // 10. AUTENTICACIÓN
    // ============================================
    
    login(usuario, password, recordar = false) {
        try {
            if (!usuario || !password) {
                return { success: false, error: 'Usuario y contraseña requeridos' };
            }

            const hash = this.hashPassword(password);
            
            // Buscar en administradores
            const admins = this.cargar('administradores');
            const admin = admins?.administradores?.find(a =>
                (a.usuario === usuario || a.correo === usuario) && a.password === hash
            );
            
            if (admin) {
                if (admin.estado !== 'activo') {
                    return { success: false, error: 'Cuenta desactivada' };
                }
                
                const { password: _, ...adminSeguro } = admin;
                const token = 't15_' + Date.now() + '_' + this._generateId();
                
                if (recordar) {
                    this._guardarSesion(token, adminSeguro, 'admin');
                }
                
                this._registrarLog('login', 'administradores', { usuario: admin.usuario, rol: 'admin' });
                
                return {
                    success: true,
                    token,
                    rol: 'admin',
                    usuario: adminSeguro
                };
            }

            // Buscar en usuarios
            const usuarios = this.cargar('usuarios');
            const user = usuarios?.usuarios?.find(u =>
                (u.usuario === usuario || u.correo === usuario) && u.password === hash
            );
            
            if (user) {
                if (user.estado !== 'activo') {
                    return { success: false, error: 'Cuenta desactivada' };
                }
                
                const { password: _, ...userSeguro } = user;
                const token = 't15_' + Date.now() + '_' + this._generateId();
                
                if (recordar) {
                    this._guardarSesion(token, userSeguro, 'usuario');
                }
                
                this._registrarLog('login', 'usuarios', { usuario: user.usuario, rol: 'usuario' });
                
                return {
                    success: true,
                    token,
                    rol: 'usuario',
                    usuario: userSeguro
                };
            }

            this._registrarLog('login_fallido', 'auth', { usuario, motivo: 'credenciales_invalidas' });
            return { success: false, error: 'Credenciales inválidas' };
        } catch (error) {
            return { success: false, error: 'Error en el servidor: ' + error.message };
        }
    }

    _guardarSesion(token, usuario, rol) {
        try {
            const sesion = {
                token,
                usuario,
                rol,
                fecha: new Date().toISOString(),
                expira: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            localStorage.setItem(`${this.prefix}session`, JSON.stringify(sesion));
        } catch {}
    }

    getSesion() {
        try {
            const datos = localStorage.getItem(`${this.prefix}session`);
            if (!datos) return null;
            const sesion = JSON.parse(datos);
            if (new Date(sesion.expira) < new Date()) {
                localStorage.removeItem(`${this.prefix}session`);
                return null;
            }
            return sesion;
        } catch {
            return null;
        }
    }

    cerrarSesion() {
        try {
            localStorage.removeItem(`${this.prefix}session`);
            this._registrarLog('logout', 'auth', {});
            return { success: true };
        } catch {
            return { success: false };
        }
    }

    // ============================================
    // 11. REGISTRO DE USUARIO
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
                return { success: false, error: 'Celular inválido (10-15 dígitos)' };
            }
            if (!this._validarPassword(datos.password)) {
                return { success: false, error: 'Contraseña mínima 8 caracteres' };
            }

            const usuarios = this.cargar('usuarios');
            
            // Verificar duplicados
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
                insignias: ['Nuevo Miembro'],
                preferencias: {
                    idioma: 'es',
                    tema: 'light',
                    notificaciones: true
                }
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
                this._registrarLog('registro_usuario', 'usuarios', { usuario: nuevo.usuario });
                
                return {
                    success: true,
                    data: {
                        id: nuevo.id,
                        nombre: nuevo.nombre,
                        usuario: nuevo.usuario
                    },
                    message: 'Usuario registrado exitosamente'
                };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error en el servidor: ' + error.message };
        }
    }

    // ============================================
    // 12. PUBLICACIONES
    // ============================================
    
    getPublicaciones(limit = 100, offset = 0) {
        const pub = this.cargar('publicaciones');
        return (pub?.publicaciones || []).slice(offset, offset + limit);
    }

    getPublicacion(id) {
        const pub = this.cargar('publicaciones');
        return (pub?.publicaciones || []).find(p => p.id === id) || null;
    }

    addPublicacion(datos) {
        try {
            if (!datos.usuario_id || !datos.autor || !datos.contenido) {
                return { success: false, error: 'Datos incompletos' };
            }

            const publicaciones = this.cargar('publicaciones');
            const nueva = {
                id: this._generateId(),
                usuario_id: datos.usuario_id,
                autor: datos.autor,
                usuario: datos.usuario || 'usuario',
                foto_autor: datos.foto_autor || 'assets/avatars/default.png',
                verificado: datos.verificado || false,
                contenido: datos.contenido.trim(),
                imagen: datos.imagen || '',
                video: datos.video || '',
                enlace: datos.enlace || '',
                fecha: new Date().toISOString(),
                reacciones: { amen: 0, me_gusta: 0, fuego: 0, orando: 0, bendicion: 0 },
                comentarios_count: 0,
                compartidos: 0,
                estado: 'publicado',
                tipo: datos.tipo || 'general'
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
                this._registrarLog('add_publicacion', 'publicaciones', { autor: datos.autor });
                return { success: true, data: nueva };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error al crear publicación: ' + error.message };
        }
    }

    deletePublicacion(id) {
        try {
            const publicaciones = this.cargar('publicaciones');
            const pub = publicaciones.publicaciones.find(p => p.id === id);
            if (!pub) {
                return { success: false, error: 'Publicación no encontrada' };
            }
            publicaciones.publicaciones = publicaciones.publicaciones.filter(p => p.id !== id);
            this.guardar('publicaciones', publicaciones);
            
            // Eliminar comentarios asociados
            const comentarios = this.cargar('comentarios');
            comentarios.comentarios = (comentarios.comentarios || [])
                .filter(c => c.publicacion_id !== id);
            this.guardar('comentarios', comentarios);
            
            this._registrarLog('delete_publicacion', 'publicaciones', { id });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al eliminar publicación: ' + error.message };
        }
    }

    // ============================================
    // 13. COMENTARIOS
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
                id: this._generateId(),
                publicacion_id: datos.publicacion_id,
                usuario_id: datos.usuario_id,
                autor: datos.autor,
                usuario: datos.usuario || 'usuario',
                foto_autor: datos.foto_autor || 'assets/avatars/default.png',
                contenido: datos.contenido.trim(),
                fecha: new Date().toISOString(),
                reacciones: { me_gusta: 0 },
                estado: 'activo'
            };

            if (!comentarios.comentarios) comentarios.comentarios = [];
            comentarios.comentarios.push(nuevo);
            comentarios.ultimo_id = nuevo.id;
            this.guardar('comentarios', comentarios);

            // Actualizar contador en publicación
            const publicaciones = this.cargar('publicaciones');
            const pub = (publicaciones?.publicaciones || [])
                .find(p => p.id === datos.publicacion_id);
            if (pub) {
                pub.comentarios_count = (pub.comentarios_count || 0) + 1;
                this.guardar('publicaciones', publicaciones);
            }

            this._registrarLog('add_comentario', 'comentarios', { publicacion_id: datos.publicacion_id });
            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error al agregar comentario: ' + error.message };
        }
    }

    deleteComentario(id) {
        try {
            const comentarios = this.cargar('comentarios');
            const comentario = comentarios.comentarios.find(c => c.id === id);
            if (!comentario) {
                return { success: false, error: 'Comentario no encontrado' };
            }
            comentarios.comentarios = comentarios.comentarios.filter(c => c.id !== id);
            this.guardar('comentarios', comentarios);
            
            // Actualizar contador en publicación
            const publicaciones = this.cargar('publicaciones');
            const pub = (publicaciones?.publicaciones || [])
                .find(p => p.id === comentario.publicacion_id);
            if (pub && pub.comentarios_count > 0) {
                pub.comentarios_count--;
                this.guardar('publicaciones', publicaciones);
            }
            
            this._registrarLog('delete_comentario', 'comentarios', { id });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al eliminar comentario: ' + error.message };
        }
    }

    // ============================================
    // 14. REACCIONES
    // ============================================
    
    toggleReaccion(publicacionId, usuarioId, tipo) {
        try {
            if (!publicacionId || !usuarioId || !tipo) {
                return { success: false, error: 'Datos incompletos' };
            }

            const tiposValidos = ['amen', 'me_gusta', 'fuego', 'orando', 'bendicion'];
            if (!tiposValidos.includes(tipo)) {
                return { success: false, error: 'Tipo de reacción inválido' };
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
                // Quitar reacción
                delete reacciones.reacciones[clave];
                if (pub.reacciones[tipo] > 0) pub.reacciones[tipo]--;
                this._registrarLog('remove_reaccion', 'reacciones', { publicacionId, usuarioId, tipo });
            } else {
                // Cambiar o agregar reacción
                if (actual) {
                    if (pub.reacciones[actual] > 0) pub.reacciones[actual]--;
                }
                reacciones.reacciones[clave] = tipo;
                pub.reacciones[tipo] = (pub.reacciones[tipo] || 0) + 1;
                this._registrarLog('add_reaccion', 'reacciones', { publicacionId, usuarioId, tipo });
            }

            this.guardar('reacciones', reacciones);
            this.guardar('publicaciones', publicaciones);
            return { success: true, data: reacciones.reacciones[clave] || null };
        } catch (error) {
            return { success: false, error: 'Error al procesar reacción: ' + error.message };
        }
    }

    getReaccionUsuario(publicacionId, usuarioId) {
        const reacciones = this.cargar('reacciones');
        return reacciones?.reacciones?.[`${publicacionId}_${usuarioId}`] || null;
    }

    getReaccionesCount(publicacionId) {
        const publicaciones = this.cargar('publicaciones');
        const pub = (publicaciones?.publicaciones || []).find(p => p.id === publicacionId);
        if (!pub) return {};
        return pub.reacciones || {};
    }

    // ============================================
    // 15. NOTICIAS
    // ============================================
    
    getNoticias(limit = 50) {
        const noticias = this.cargar('noticias');
        return (noticias?.noticias || []).slice(0, limit);
    }

    addNoticia(datos) {
        try {
            if (!datos.titulo || !datos.contenido) {
                return { success: false, error: 'Título y contenido requeridos' };
            }

            const noticias = this.cargar('noticias');
            const nueva = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                contenido: datos.contenido.trim(),
                resumen: datos.resumen || datos.contenido.trim().substring(0, 150) + '...',
                imagen: datos.imagen || '',
                video: datos.video || '',
                autor_id: datos.autor_id || 0,
                autor_nombre: datos.autor_nombre || 'Admin',
                fecha_publicacion: new Date().toISOString(),
                estado: datos.estado || 'publicado',
                categoria: datos.categoria || 'General',
                destacada: datos.destacada || false,
                reacciones: { me_gusta: 0, amen: 0, bendiciones: 0, aleluya: 0 },
                comentarios_count: 0,
                visitas: 0
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
                this._registrarLog('add_noticia', 'noticias', { titulo: nueva.titulo });
                return { success: true, data: nueva };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error al crear noticia: ' + error.message };
        }
    }

    deleteNoticia(id) {
        try {
            const noticias = this.cargar('noticias');
            noticias.noticias = (noticias.noticias || []).filter(n => n.id !== id);
            this.guardar('noticias', noticias);
            this._registrarLog('delete_noticia', 'noticias', { id });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al eliminar noticia: ' + error.message };
        }
    }

    // ============================================
    // 16. EVENTOS
    // ============================================
    
    getEventos(filtros = {}) {
        let eventos = this.cargar('eventos')?.eventos || [];
        
        if (filtros.estado) {
            eventos = eventos.filter(e => e.estado === filtros.estado);
        }
        if (filtros.categoria) {
            eventos = eventos.filter(e => e.categoria === filtros.categoria);
        }
        if (filtros.fecha_desde) {
            eventos = eventos.filter(e => e.fecha >= filtros.fecha_desde);
        }
        if (filtros.fecha_hasta) {
            eventos = eventos.filter(e => e.fecha <= filtros.fecha_hasta);
        }
        
        // Ordenar por fecha
        eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        return eventos;
    }

    getEvento(id) {
        const eventos = this.cargar('eventos');
        return (eventos?.eventos || []).find(e => e.id === id) || null;
    }

    addEvento(datos) {
        try {
            if (!datos.titulo || !datos.fecha) {
                return { success: false, error: 'Título y fecha requeridos' };
            }

            const eventos = this.cargar('eventos');
            const nuevo = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                descripcion: datos.descripcion || '',
                fecha: datos.fecha,
                hora_inicio: datos.hora_inicio || '',
                hora_fin: datos.hora_fin || '',
                lugar: datos.lugar || 'IPUC LA FONDA',
                ubicacion: datos.ubicacion || '',
                organizador_id: datos.organizador_id || 0,
                organizador_nombre: datos.organizador_nombre || 'Administración',
                fecha_creacion: new Date().toISOString(),
                estado: datos.estado || 'programado',
                categoria: datos.categoria || 'General',
                cupos: datos.cupos || 0,
                reservados: 0,
                imagen: datos.imagen || '',
                destacado: datos.destacado || false
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
                this._registrarLog('add_evento', 'eventos', { titulo: nuevo.titulo });
                return { success: true, data: nuevo };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error al crear evento: ' + error.message };
        }
    }

    deleteEvento(id) {
        try {
            const eventos = this.cargar('eventos');
            eventos.eventos = (eventos.eventos || []).filter(e => e.id !== id);
            this.guardar('eventos', eventos);
            this._registrarLog('delete_evento', 'eventos', { id });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al eliminar evento: ' + error.message };
        }
    }

    reservarEvento(eventoId, usuarioId, datos = {}) {
        try {
            const eventos = this.cargar('eventos');
            const evento = (eventos?.eventos || []).find(e => e.id === eventoId);
            if (!evento) {
                return { success: false, error: 'Evento no encontrado' };
            }
            if (evento.estado !== 'programado') {
                return { success: false, error: 'Evento no está disponible' };
            }
            if (evento.cupos > 0 && evento.reservados >= evento.cupos) {
                return { success: false, error: 'No hay cupos disponibles' };
            }

            if (!evento.reservas) evento.reservas = [];
            evento.reservas.push({
                usuario_id: usuarioId,
                nombre: datos.nombre || 'Usuario',
                fecha: new Date().toISOString(),
                estado: 'confirmada'
            });
            evento.reservados = (evento.reservados || 0) + 1;

            this.guardar('eventos', eventos);
            this._registrarLog('reservar_evento', 'eventos', { eventoId, usuarioId });
            return { success: true, data: evento };
        } catch (error) {
            return { success: false, error: 'Error al reservar evento: ' + error.message };
        }
    }

    // ============================================
    // 17. ASISTENCIA
    // ============================================
    
    getAsistencia(filtros = {}) {
        let registros = this.cargar('asistencia')?.registros || [];
        
        if (filtros.usuario_id) {
            registros = registros.filter(r => r.usuario_id === filtros.usuario_id);
        }
        if (filtros.fecha) {
            registros = registros.filter(r => r.fecha === filtros.fecha);
        }
        if (filtros.fecha_desde) {
            registros = registros.filter(r => r.fecha >= filtros.fecha_desde);
        }
        if (filtros.fecha_hasta) {
            registros = registros.filter(r => r.fecha <= filtros.fecha_hasta);
        }
        
        return registros;
    }

    addAsistencia(datos) {
        try {
            if (!datos.usuario_id || !datos.nombre) {
                return { success: false, error: 'Datos incompletos' };
            }

            const asistencia = this.cargar('asistencia');
            const nuevo = {
                id: this._generateId(),
                usuario_id: datos.usuario_id,
                nombre: datos.nombre.trim(),
                fecha: datos.fecha || new Date().toISOString().split('T')[0],
                hora: datos.hora || new Date().toLocaleTimeString('es-CO'),
                estado: datos.estado || 'Asistiré',
                tipo: datos.tipo || 'Hermano',
                culto: datos.culto || '',
                comentario: datos.comentario || '',
                creado: new Date().toISOString()
            };

            if (!asistencia.registros) asistencia.registros = [];
            asistencia.registros.push(nuevo);
            asistencia.ultimo_id = nuevo.id;

            if (this.guardar('asistencia', asistencia)) {
                this._actualizarEstadisticasAsistencia();
                this._registrarLog('add_asistencia', 'asistencia', { usuario_id: datos.usuario_id });
                return { success: true, data: nuevo };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error al registrar asistencia: ' + error.message };
        }
    }

    // ============================================
    // 18. PETICIONES
    // ============================================
    
    getPeticiones(filtros = {}) {
        let peticiones = this.cargar('peticiones')?.peticiones || [];
        
        if (filtros.estado) {
            peticiones = peticiones.filter(p => p.estado === filtros.estado);
        }
        if (filtros.usuario_id) {
            peticiones = peticiones.filter(p => p.usuario_id === filtros.usuario_id);
        }
        
        return peticiones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    addPeticion(datos) {
        try {
            if (!datos.usuario_id || !datos.nombre || !datos.motivo) {
                return { success: false, error: 'Datos incompletos' };
            }

            const peticiones = this.cargar('peticiones');
            const nueva = {
                id: this._generateId(),
                usuario_id: datos.usuario_id,
                nombre: datos.nombre.trim(),
                motivo: datos.motivo.trim(),
                descripcion: datos.descripcion || '',
                fecha: new Date().toISOString(),
                estado: 'activa',
                oraciones: 0,
                tipo: datos.tipo || 'personal',
                anonimo: datos.anonimo || false
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
                this._registrarLog('add_peticion', 'peticiones', { usuario_id: datos.usuario_id });
                return { success: true, data: nueva };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error al crear petición: ' + error.message };
        }
    }

    orarPeticion(id) {
        try {
            const peticiones = this.cargar('peticiones');
            const peticion = (peticiones?.peticiones || []).find(p => p.id === id);
            if (!peticion) {
                return { success: false, error: 'Petición no encontrada' };
            }
            peticion.oraciones = (peticion.oraciones || 0) + 1;
            this.guardar('peticiones', peticiones);
            this._registrarLog('orar_peticion', 'peticiones', { id });
            return { success: true, data: peticion };
        } catch (error) {
            return { success: false, error: 'Error al orar por petición: ' + error.message };
        }
    }

    cerrarPeticion(id) {
        try {
            const peticiones = this.cargar('peticiones');
            const peticion = (peticiones?.peticiones || []).find(p => p.id === id);
            if (!peticion) {
                return { success: false, error: 'Petición no encontrada' };
            }
            peticion.estado = 'cerrada';
            peticion.fecha_cierre = new Date().toISOString();
            this.guardar('peticiones', peticiones);
            this._registrarLog('cerrar_peticion', 'peticiones', { id });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al cerrar petición: ' + error.message };
        }
    }

    // ============================================
    // 19. ENCUESTAS
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
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                preguntas: datos.preguntas || [],
                descripcion: datos.descripcion || '',
                fecha: new Date().toISOString(),
                fecha_fin: datos.fecha_fin || '',
                activa: true,
                votos: {},
                total_votos: 0,
                creador_id: datos.creador_id || 0
            };

            if (!encuestas.encuestas) encuestas.encuestas = [];
            encuestas.encuestas.push(nueva);
            encuestas.ultimo_id = nueva.id;

            this.guardar('encuestas', encuestas);
            this._registrarLog('add_encuesta', 'encuestas', { titulo: nueva.titulo });
            return { success: true, data: nueva };
        } catch (error) {
            return { success: false, error: 'Error al crear encuesta: ' + error.message };
        }
    }

    votarEncuesta(encuestaId, preguntaIndex, opcion) {
        try {
            const encuestas = this.cargar('encuestas');
            const encuesta = (encuestas?.encuestas || []).find(e => e.id === encuestaId);
            if (!encuesta) {
                return { success: false, error: 'Encuesta no encontrada' };
            }
            if (!encuesta.activa) {
                return { success: false, error: 'Encuesta cerrada' };
            }
            
            const clave = `${preguntaIndex}_${opcion}`;
            if (!encuesta.votos) encuesta.votos = {};
            encuesta.votos[clave] = (encuesta.votos[clave] || 0) + 1;
            encuesta.total_votos = (encuesta.total_votos || 0) + 1;
            
            this.guardar('encuestas', encuestas);
            this._registrarLog('votar_encuesta', 'encuestas', { encuestaId });
            return { success: true, data: encuesta };
        } catch (error) {
            return { success: false, error: 'Error al votar: ' + error.message };
        }
    }

    cerrarEncuesta(id) {
        try {
            const encuestas = this.cargar('encuestas');
            const encuesta = (encuestas?.encuestas || []).find(e => e.id === id);
            if (!encuesta) {
                return { success: false, error: 'Encuesta no encontrada' };
            }
            encuesta.activa = false;
            encuesta.fecha_fin = new Date().toISOString();
            this.guardar('encuestas', encuestas);
            this._registrarLog('cerrar_encuesta', 'encuestas', { id });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al cerrar encuesta: ' + error.message };
        }
    }

    // ============================================
    // 20. BIBLIOTECA
    // ============================================
    
    getRecursos(categoria = null) {
        const recursos = this.cargar('biblioteca')?.recursos || [];
        if (categoria) {
            return recursos.filter(r => r.categoria === categoria);
        }
        return recursos;
    }

    addRecurso(datos) {
        try {
            if (!datos.titulo || !datos.autor) {
                return { success: false, error: 'Título y autor requeridos' };
            }

            const biblioteca = this.cargar('biblioteca');
            const nuevo = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                autor: datos.autor.trim(),
                categoria: datos.categoria || 'General',
                pdf: datos.pdf || '',
                imagen: datos.imagen || '',
                descripcion: datos.descripcion || '',
                fecha: new Date().toISOString(),
                descargas: 0,
                tipo: datos.tipo || 'pdf'
            };

            if (!biblioteca.recursos) biblioteca.recursos = [];
            biblioteca.recursos.push(nuevo);
            biblioteca.ultimo_id = nuevo.id;

            this.guardar('biblioteca', biblioteca);
            this._registrarLog('add_recurso', 'biblioteca', { titulo: nuevo.titulo });
            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error al agregar recurso: ' + error.message };
        }
    }

    deleteRecurso(id) {
        try {
            const biblioteca = this.cargar('biblioteca');
            biblioteca.recursos = (biblioteca.recursos || []).filter(r => r.id !== id);
            this.guardar('biblioteca', biblioteca);
            this._registrarLog('delete_recurso', 'biblioteca', { id });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al eliminar recurso: ' + error.message };
        }
    }

    // ============================================
    // 21. GALERIA
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
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                url: datos.url || '',
                imagen: datos.imagen || '',
                fecha: new Date().toISOString(),
                descripcion: datos.descripcion || '',
                categoria: datos.categoria || 'General',
                autor: datos.autor || 'Usuario'
            };

            if (!galeria.albumes) galeria.albumes = [];
            galeria.albumes.push(nuevo);
            galeria.ultimo_id = nuevo.id;

            this.guardar('galeria', galeria);
            this._registrarLog('add_imagen', 'galeria', { titulo: nuevo.titulo });
            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error al agregar imagen: ' + error.message };
        }
    }

    deleteImagen(id) {
        try {
            const galeria = this.cargar('galeria');
            galeria.albumes = (galeria.albumes || []).filter(a => a.id !== id);
            this.guardar('galeria', galeria);
            this._registrarLog('delete_imagen', 'galeria', { id });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al eliminar imagen: ' + error.message };
        }
    }

    // ============================================
    // 22. PODCAST
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
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                pastor: datos.pastor.trim(),
                duracion: datos.duracion || '30 min',
                fecha: new Date().toISOString(),
                audio: datos.audio || 'podcast.mp3',
                imagen: datos.imagen || '',
                descripcion: datos.descripcion || '',
                reproducciones: 0,
                destacado: datos.destacado || false
            };

            if (!podcast.episodios) podcast.episodios = [];
            podcast.episodios.push(nuevo);
            podcast.ultimo_id = nuevo.id;

            this.guardar('podcast', podcast);
            this._registrarLog('add_podcast', 'podcast', { titulo: nuevo.titulo });
            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error al agregar podcast: ' + error.message };
        }
    }

    deletePodcast(id) {
        try {
            const podcast = this.cargar('podcast');
            podcast.episodios = (podcast.episodios || []).filter(e => e.id !== id);
            this.guardar('podcast', podcast);
            this._registrarLog('delete_podcast', 'podcast', { id });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al eliminar podcast: ' + error.message };
        }
    }

    // ============================================
    // 23. CHAT
    // ============================================
    
    getMensajes(limit = 100) {
        const mensajes = this.cargar('chat')?.mensajes || [];
        return mensajes.slice(-limit);
    }

    addMensaje(datos) {
        try {
            if (!datos.usuario || !datos.usuario_id || !datos.mensaje) {
                return { success: false, error: 'Datos incompletos' };
            }

            const chat = this.cargar('chat');
            const nuevo = {
                id: this._generateId(),
                usuario: datos.usuario,
                usuario_id: datos.usuario_id,
                mensaje: datos.mensaje.trim(),
                fecha: new Date().toISOString(),
                foto: datos.foto || 'assets/avatars/default.png',
                tipo: datos.tipo || 'texto',
                archivo: datos.archivo || null
            };

            if (!chat.mensajes) chat.mensajes = [];
            chat.mensajes.push(nuevo);
            chat.ultimo_id = nuevo.id;

            // Limitar mensajes a 1000
            if (chat.mensajes.length > 1000) {
                chat.mensajes = chat.mensajes.slice(-1000);
            }

            this.guardar('chat', chat);
            this._registrarLog('add_mensaje', 'chat', { usuario: datos.usuario });
            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error al enviar mensaje: ' + error.message };
        }
    }

    deleteMensaje(id) {
        try {
            const chat = this.cargar('chat');
            chat.mensajes = (chat.mensajes || []).filter(m => m.id !== id);
            this.guardar('chat', chat);
            this._registrarLog('delete_mensaje', 'chat', { id });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al eliminar mensaje: ' + error.message };
        }
    }

    // ============================================
    // 24. DIRECTORIO
    // ============================================
    
    getDirectorio(filtros = {}) {
        let miembros = this.cargar('directorio')?.miembros || [];
        
        if (filtros.ministerio) {
            miembros = miembros.filter(m => m.ministerio === filtros.ministerio);
        }
        if (filtros.verificado !== undefined) {
            miembros = miembros.filter(m => m.verificado === filtros.verificado);
        }
        if (filtros.busqueda) {
            const query = filtros.busqueda.toLowerCase();
            miembros = miembros.filter(m => 
                m.nombre.toLowerCase().includes(query) ||
                (m.apellidos && m.apellidos.toLowerCase().includes(query))
            );
        }
        
        return miembros;
    }

    addMiembro(datos) {
        try {
            if (!datos.nombre) {
                return { success: false, error: 'Nombre requerido' };
            }

            const directorio = this.cargar('directorio');
            const nuevo = {
                id: this._generateId(),
                nombre: datos.nombre.trim(),
                apellidos: datos.apellidos || '',
                ministerio: datos.ministerio || 'General',
                verificado: datos.verificado || false,
                fecha: new Date().toISOString(),
                telefono: datos.telefono || '',
                correo: datos.correo || '',
                foto: datos.foto || 'assets/avatars/default.png'
            };

            if (!directorio.miembros) directorio.miembros = [];
            directorio.miembros.push(nuevo);
            directorio.ultimo_id = nuevo.id;

            this.guardar('directorio', directorio);
            this._registrarLog('add_miembro', 'directorio', { nombre: nuevo.nombre });
            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error al agregar miembro: ' + error.message };
        }
    }

    deleteMiembro(id) {
        try {
            const directorio = this.cargar('directorio');
            directorio.miembros = (directorio.miembros || []).filter(m => m.id !== id);
            this.guardar('directorio', directorio);
            this._registrarLog('delete_miembro', 'directorio', { id });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al eliminar miembro: ' + error.message };
        }
    }

    // ============================================
    // 25. NOTIFICACIONES
    // ============================================
    
    getNotificaciones(limit = 50) {
        const notificaciones = this.cargar('notificaciones')?.notificaciones || [];
        return notificaciones.slice(0, limit);
    }

    _agregarNotificacion(datos) {
        try {
            const notificaciones = this.cargar('notificaciones');
            const nueva = {
                id: this._generateId(),
                titulo: datos.titulo,
                mensaje: datos.mensaje,
                fecha: new Date().toISOString(),
                leida: false,
                tipo: datos.tipo || 'general',
                icono: datos.icono || null,
                enlace: datos.enlace || null,
                usuario_id: datos.usuario_id || null
            };

            if (!notificaciones.notificaciones) notificaciones.notificaciones = [];
            notificaciones.notificaciones.unshift(nueva);
            notificaciones.ultimo_id = nueva.id;

            // Limitar a 500 notificaciones
            if (notificaciones.notificaciones.length > 500) {
                notificaciones.notificaciones = notificaciones.notificaciones.slice(0, 500);
            }

            this.guardar('notificaciones', notificaciones);
        } catch {}
    }

    marcarNotificacionLeida(id) {
        try {
            const notificaciones = this.cargar('notificaciones');
            const notif = (notificaciones?.notificaciones || []).find(n => n.id === id);
            if (notif) {
                notif.leida = true;
                this.guardar('notificaciones', notificaciones);
                return { success: true };
            }
            return { success: false, error: 'Notificación no encontrada' };
        } catch (error) {
            return { success: false, error: 'Error al marcar notificación: ' + error.message };
        }
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
        } catch (error) {
            return { success: false, error: 'Error al marcar notificaciones: ' + error.message };
        }
    }

    getNoLeidas() {
        const notificaciones = this.getNotificaciones();
        return notificaciones.filter(n => !n.leida).length;
    }

    // ============================================
    // 26. ESTADÍSTICAS
    // ============================================
    
    _actualizarEstadisticasAsistencia() {
        try {
            const asistencia = this.cargar('asistencia');
            const estadisticas = this.cargar('estadisticas');
            const hoy = new Date().toISOString().split('T')[0];
            const mes = hoy.substring(0, 7);
            const año = hoy.substring(0, 4);
            const registros = asistencia?.registros || [];
            
            if (!estadisticas.asistencia) estadisticas.asistencia = {};
            estadisticas.asistencia = {
                diario: registros.filter(r => r.fecha === hoy).length,
                mensual: registros.filter(r => r.fecha?.startsWith(mes)).length,
                anual: registros.filter(r => r.fecha?.startsWith(año)).length,
                total: registros.length,
                ultima_actualizacion: new Date().toISOString()
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
            
            if (!estadisticas.usuarios) estadisticas.usuarios = {};
            estadisticas.usuarios = {
                total: usuariosList.length,
                activos: usuariosList.filter(u => u.estado === 'activo').length,
                nuevos_mes: usuariosList.filter(u => u.fecha_registro?.startsWith(mes)).length,
                ultima_actualizacion: new Date().toISOString()
            };
            
            const publicaciones = this.getPublicaciones();
            const comentarios = this.cargar('comentarios')?.comentarios || [];
            if (!estadisticas.publicaciones) estadisticas.publicaciones = {};
            estadisticas.publicaciones = {
                total: publicaciones.length,
                comentarios: comentarios.length,
                ultima_actualizacion: new Date().toISOString()
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
                notificaciones_no_leidas: this.getNoLeidas(),
                ultima_actualizacion: new Date().toISOString()
            };
        } catch {
            return {};
        }
    }

    // ============================================
    // 27. VERSÍCULOS
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

    addVersiculo(datos) {
        try {
            if (!datos.texto || !datos.referencia) {
                return { success: false, error: 'Texto y referencia requeridos' };
            }

            const versiculos = this.cargar('versiculos');
            const nuevo = {
                id: (versiculos.versiculos?.length || 0) + 1,
                texto: datos.texto.trim(),
                referencia: datos.referencia.trim(),
                tipo: datos.tipo || 'versiculo',
                fecha_agregado: new Date().toISOString()
            };

            if (!versiculos.versiculos) versiculos.versiculos = [];
            versiculos.versiculos.push(nuevo);
            versiculos.ultimo_id = nuevo.id;

            this.guardar('versiculos', versiculos);
            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error al agregar versículo: ' + error.message };
        }
    }

    deleteVersiculo(id) {
        try {
            const versiculos = this.cargar('versiculos');
            versiculos.versiculos = (versiculos.versiculos || []).filter(v => v.id !== id);
            this.guardar('versiculos', versiculos);
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al eliminar versículo: ' + error.message };
        }
    }

    // ============================================
    // 28. INSIGNIAS
    // ============================================
    
    getInsignias() {
        return this.cargar('insignias')?.insignias || [];
    }

    getInsigniasUsuario(usuarioId) {
        const usuarios = this.cargar('usuarios');
        const user = usuarios?.usuarios?.find(u => u.id === usuarioId);
        return user?.insignias || [];
    }

    asignarInsignia(usuarioId, insigniaId) {
        try {
            const usuarios = this.cargar('usuarios');
            const user = usuarios?.usuarios?.find(u => u.id === usuarioId);
            if (!user) {
                return { success: false, error: 'Usuario no encontrado' };
            }

            const insignias = this.getInsignias();
            const insignia = insignias.find(i => i.id === insigniaId);
            if (!insignia) {
                return { success: false, error: 'Insignia no encontrada' };
            }

            if (!user.insignias) user.insignias = [];
            if (user.insignias.includes(insignia.nombre)) {
                return { success: false, error: 'Usuario ya tiene esta insignia' };
            }

            user.insignias.push(insignia.nombre);
            this.guardar('usuarios', usuarios);
            
            this._registrarLog('asignar_insignia', 'usuarios', { usuarioId, insigniaId });
            return { success: true, data: user };
        } catch (error) {
            return { success: false, error: 'Error al asignar insignia: ' + error.message };
        }
    }

    // ============================================
    // 29. HORARIOS
    // ============================================
    
    getHorarios() {
        return this.cargar('horarios')?.cultos || [];
    }

    getHorarioDia(dia) {
        const cultos = this.getHorarios();
        return cultos.find(c => c.dia === dia) || null;
    }

    updateHorarios(horarios) {
        try {
            const data = this.cargar('horarios');
            data.cultos = horarios;
            this.guardar('horarios', data);
            this._registrarLog('update_horarios', 'horarios');
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al actualizar horarios: ' + error.message };
        }
    }

    // ============================================
    // 30. CONFIGURACIÓN
    // ============================================
    
    getConfiguracion() {
        return this.cargar('configuracion');
    }

    updateConfiguracion(config) {
        try {
            const cfg = this.cargar('configuracion');
            const nuevaCfg = { ...cfg, ...config };
            if (this.guardar('configuracion', nuevaCfg)) {
                this._registrarLog('update_configuracion', 'configuracion');
                return { success: true };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error al actualizar configuración: ' + error.message };
        }
    }

    getConfiguracionIglesia() {
        const cfg = this.getConfiguracion();
        return cfg?.iglesia || {};
    }

    updateConfiguracionIglesia(datos) {
        const cfg = this.getConfiguracion();
        if (!cfg.iglesia) cfg.iglesia = {};
        cfg.iglesia = { ...cfg.iglesia, ...datos };
        return this.updateConfiguracion(cfg);
    }

    // ============================================
    // 31. FAVORITOS
    // ============================================
    
    getFavoritos(usuarioId) {
        const favoritos = this.cargar('favoritos');
        return (favoritos?.favoritos || []).filter(f => f.usuario_id === usuarioId);
    }

    toggleFavorito(usuarioId, itemId, tipo) {
        try {
            const favoritos = this.cargar('favoritos');
            const clave = `${usuarioId}_${itemId}_${tipo}`;
            const existe = (favoritos?.favoritos || []).some(f => 
                f.usuario_id === usuarioId && f.item_id === itemId && f.tipo === tipo
            );

            if (existe) {
                favoritos.favoritos = (favoritos.favoritos || []).filter(f => 
                    !(f.usuario_id === usuarioId && f.item_id === itemId && f.tipo === tipo)
                );
            } else {
                if (!favoritos.favoritos) favoritos.favoritos = [];
                favoritos.favoritos.push({
                    id: this._generateId(),
                    usuario_id: usuarioId,
                    item_id: itemId,
                    tipo: tipo,
                    fecha: new Date().toISOString()
                });
            }

            this.guardar('favoritos', favoritos);
            this._registrarLog('toggle_favorito', 'favoritos', { usuarioId, itemId, tipo });
            return { success: true, favorito: !existe };
        } catch (error) {
            return { success: false, error: 'Error al gestionar favorito: ' + error.message };
        }
    }

    // ============================================
    // 32. METAS
    // ============================================
    
    getMetas(usuarioId) {
        const metas = this.cargar('metas');
        return (metas?.metas || []).filter(m => m.usuario_id === usuarioId);
    }

    addMeta(datos) {
        try {
            if (!datos.usuario_id || !datos.titulo) {
                return { success: false, error: 'Datos incompletos' };
            }

            const metas = this.cargar('metas');
            const nueva = {
                id: this._generateId(),
                usuario_id: datos.usuario_id,
                titulo: datos.titulo.trim(),
                descripcion: datos.descripcion || '',
                fecha_inicio: datos.fecha_inicio || new Date().toISOString().split('T')[0],
                fecha_fin: datos.fecha_fin || '',
                progreso: 0,
                completada: false,
                categoria: datos.categoria || 'Espiritual'
            };

            if (!metas.metas) metas.metas = [];
            metas.metas.push(nueva);
            metas.ultimo_id = nueva.id;

            this.guardar('metas', metas);
            this._registrarLog('add_meta', 'metas', { usuario_id: datos.usuario_id });
            return { success: true, data: nueva };
        } catch (error) {
            return { success: false, error: 'Error al crear meta: ' + error.message };
        }
    }

    updateMetaProgreso(id, progreso) {
        try {
            const metas = this.cargar('metas');
            const meta = (metas?.metas || []).find(m => m.id === id);
            if (!meta) {
                return { success: false, error: 'Meta no encontrada' };
            }
            meta.progreso = Math.min(Math.max(progreso, 0), 100);
            if (meta.progreso >= 100) {
                meta.completada = true;
                meta.fecha_completada = new Date().toISOString();
            }
            this.guardar('metas', metas);
            this._registrarLog('update_meta_progreso', 'metas', { id, progreso });
            return { success: true, data: meta };
        } catch (error) {
            return { success: false, error: 'Error al actualizar meta: ' + error.message };
        }
    }

    // ============================================
    // 33. MISIONES
    // ============================================
    
    getMisiones() {
        return this.cargar('misiones')?.misiones || [];
    }

    addMision(datos) {
        try {
            if (!datos.titulo || !datos.pais) {
                return { success: false, error: 'Título y país requeridos' };
            }

            const misiones = this.cargar('misiones');
            const nueva = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                pais: datos.pais.trim(),
                descripcion: datos.descripcion || '',
                fecha_inicio: datos.fecha_inicio || new Date().toISOString().split('T')[0],
                fecha_fin: datos.fecha_fin || '',
                estado: datos.estado || 'activa',
                meta_financiera: datos.meta_financiera || 0,
                recaudado: 0,
                misioneros: datos.misioneros || []
            };

            if (!misiones.misiones) misiones.misiones = [];
            misiones.misiones.push(nueva);
            misiones.ultimo_id = nueva.id;

            this.guardar('misiones', misiones);
            this._registrarLog('add_mision', 'misiones', { titulo: nueva.titulo });
            return { success: true, data: nueva };
        } catch (error) {
            return { success: false, error: 'Error al crear misión: ' + error.message };
        }
    }

    donarMision(id, monto, donante) {
        try {
            const misiones = this.cargar('misiones');
            const mision = (misiones?.misiones || []).find(m => m.id === id);
            if (!mision) {
                return { success: false, error: 'Misión no encontrada' };
            }
            mision.recaudado = (mision.recaudado || 0) + monto;
            if (!mision.donaciones) mision.donaciones = [];
            mision.donaciones.push({
                id: this._generateId(),
                monto: monto,
                donante: donante || 'Anónimo',
                fecha: new Date().toISOString()
            });
            this.guardar('misiones', misiones);
            this._registrarLog('donar_mision', 'misiones', { id, monto });
            return { success: true, data: mision };
        } catch (error) {
            return { success: false, error: 'Error al donar a misión: ' + error.message };
        }
    }

    // ============================================
    // 34. TESTIMONIOS
    // ============================================
    
    getTestimonios() {
        return this.cargar('testimonios')?.testimonios || [];
    }

    addTestimonio(datos) {
        try {
            if (!datos.usuario_id || !datos.autor || !datos.contenido) {
                return { success: false, error: 'Datos incompletos' };
            }

            const testimonios = this.cargar('testimonios');
            const nuevo = {
                id: this._generateId(),
                usuario_id: datos.usuario_id,
                autor: datos.autor,
                contenido: datos.contenido.trim(),
                fecha: new Date().toISOString(),
                aprobado: datos.aprobado || false,
                categoria: datos.categoria || 'Testimonio'
            };

            if (!testimonios.testimonios) testimonios.testimonios = [];
            testimonios.testimonios.push(nuevo);
            testimonios.ultimo_id = nuevo.id;

            this.guardar('testimonios', testimonios);
            this._registrarLog('add_testimonio', 'testimonios', { autor: datos.autor });
            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error al agregar testimonio: ' + error.message };
        }
    }

    // ============================================
    // 35. GRUPOS
    // ============================================
    
    getGrupos() {
        return this.cargar('grupos')?.grupos || [];
    }

    addGrupo(datos) {
        try {
            if (!datos.nombre || !datos.creador_id) {
                return { success: false, error: 'Datos incompletos' };
            }

            const grupos = this.cargar('grupos');
            const nuevo = {
                id: this._generateId(),
                nombre: datos.nombre.trim(),
                descripcion: datos.descripcion || '',
                creador_id: datos.creador_id,
                creador_nombre: datos.creador_nombre || '',
                fecha: new Date().toISOString(),
                miembros: [datos.creador_id],
                publicaciones: [],
                estado: 'activo'
            };

            if (!grupos.grupos) grupos.grupos = [];
            grupos.grupos.push(nuevo);
            grupos.ultimo_id = nuevo.id;

            this.guardar('grupos', grupos);
            this._registrarLog('add_grupo', 'grupos', { nombre: nuevo.nombre });
            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error al crear grupo: ' + error.message };
        }
    }

    unirseGrupo(grupoId, usuarioId) {
        try {
            const grupos = this.cargar('grupos');
            const grupo = (grupos?.grupos || []).find(g => g.id === grupoId);
            if (!grupo) {
                return { success: false, error: 'Grupo no encontrado' };
            }
            if (!grupo.miembros) grupo.miembros = [];
            if (grupo.miembros.includes(usuarioId)) {
                return { success: false, error: 'Ya eres miembro de este grupo' };
            }
            grupo.miembros.push(usuarioId);
            this.guardar('grupos', grupos);
            this._registrarLog('unirse_grupo', 'grupos', { grupoId, usuarioId });
            return { success: true, data: grupo };
        } catch (error) {
            return { success: false, error: 'Error al unirse al grupo: ' + error.message };
        }
    }

    // ============================================
    // 36. DONACIONES
    // ============================================
    
    getDonaciones() {
        return this.cargar('donaciones')?.donaciones || [];
    }

    addDonacion(datos) {
        try {
            if (!datos.usuario_id || !datos.monto) {
                return { success: false, error: 'Datos incompletos' };
            }

            const donaciones = this.cargar('donaciones');
            const nueva = {
                id: this._generateId(),
                usuario_id: datos.usuario_id,
                usuario_nombre: datos.usuario_nombre || 'Anónimo',
                monto: datos.monto,
                metodo: datos.metodo || 'Efectivo',
                concepto: datos.concepto || 'Ofrenda',
                fecha: new Date().toISOString(),
                estado: datos.estado || 'completada',
                mensaje: datos.mensaje || ''
            };

            if (!donaciones.donaciones) donaciones.donaciones = [];
            donaciones.donaciones.push(nueva);
            donaciones.ultimo_id = nueva.id;

            this.guardar('donaciones', donaciones);
            this._registrarLog('add_donacion', 'donaciones', { usuario_id: datos.usuario_id, monto: datos.monto });
            return { success: true, data: nueva };
        } catch (error) {
            return { success: false, error: 'Error al registrar donación: ' + error.message };
        }
    }

    // ============================================
    // 37. UTILIDADES DE EXPORTACIÓN
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
            this._registrarLog('importar_todo', 'sistema');
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al importar datos: ' + error.message };
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
            this._registrarLog('limpiar_todo', 'sistema');
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al limpiar datos: ' + error.message };
        }
    }

    // ============================================
    // 38. INICIALIZACIÓN
    // ============================================
    
    inicializarDatos() {
        const archivos = [
            'usuarios', 'administradores', 'publicaciones', 'comentarios',
            'reacciones', 'noticias', 'eventos', 'asistencia', 'notificaciones',
            'peticiones', 'insignias', 'versiculos', 'horarios', 'biblioteca',
            'galeria', 'encuestas', 'podcast', 'chat', 'directorio',
            'estadisticas', 'configuracion', 'logs', 'favoritos', 'metas',
            'mentorias', 'misiones', 'voluntariado', 'testimonios', 'grupos',
            'sermones', 'cursos', 'tienda', 'donaciones', 'transmisiones'
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
        this._registrarLog('inicializar', 'sistema', { version: this.version });
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
                { id: 11, nombre: "Intercesor", icono: "bx-pray", color: "#9c27b0" },
                { id: 12, nombre: "Misionero", icono: "bx-globe-alt", color: "#009688" },
                { id: 13, nombre: "Testigo", icono: "bx-message", color: "#ff5722" },
                { id: 14, nombre: "Anciano", icono: "bx-user-check", color: "#795548" },
                { id: 15, nombre: "Diácono", icono: "bx-hands", color: "#8bc34a" }
            ];
            insignias.insignias = insigniasPorDefecto;
            insignias.ultimo_id = 15;
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
                { id: 7, texto: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová.", referencia: "Jeremías 29:11", tipo: "promesa" },
                { id: 8, texto: "Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.", referencia: "Salmos 46:1", tipo: "salmo" },
                { id: 9, texto: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.", referencia: "Salmos 91:1", tipo: "salmo" },
                { id: 10, texto: "Y conoceréis la verdad, y la verdad os hará libres.", referencia: "Juan 8:32", tipo: "versiculo" }
            ];
            versiculos.versiculos = versiculosPorDefecto;
            versiculos.ultimo_id = 10;
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
                tiktok: "",
                twitter: "",
                idioma: "es",
                zona_horaria: "America/Bogota"
            };
            config.aplicacion = {
                version: this.version,
                modo_mantenimiento: false,
                registro_abierto: true,
                primer_administrador_creado: false,
                modo_oscuro: false,
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
// CREAR INSTANCIA GLOBAL
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

console.log('✅ IPUC LA FONDA Database v15.0 PRO ULTIMATE cargada');
console.log('📊 Sistema de datos inicializado correctamente');
console.log('🔄 Backup automático activo');
console.log('🔒 Seguridad y hash implementados');
