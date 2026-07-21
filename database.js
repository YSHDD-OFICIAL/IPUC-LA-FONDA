// ============================================
// IPUC LA FONDA - DATABASE v18.0 PRO ULTIMATE
// Sistema de Base de Datos en localStorage
// Incluye: Reportes, Moderación, Anti-Quota
// Gestión completa - Caché inteligente
// Backup automático - Seguridad
// VERSIÓN CORREGIDA - SIN ERRORES
// ============================================

class Database {
    constructor() {
        this.prefix = 'ipuc18_';
        this.cache = {};
        this.cacheTimeout = 600;
        this.lastCacheUpdate = {};
        this.version = '18.0';
        this.initialized = false;
        this.backupInterval = 300000;
        this._startAutoBackup();
    }

    // ============================================
    // 1. MÉTODOS PRIVADOS - UTILIDADES
    // ============================================
    
    _getKey(name) {
        return this.prefix + name;
    }

    _isValidKey(name) {
        return /^[a-zA-Z0-9_\-]+$/.test(name);
    }

    _isObject(obj) {
        return obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
    }

    _cloneDeep(obj) {
        try { return JSON.parse(JSON.stringify(obj)); } 
        catch { return obj; }
    }

    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // ============================================
    // 2. GESTIÓN DE ALMACENAMIENTO (ANTI-QUOTA)
    // ============================================

    _safeSetItem(clave, valor) {
        try {
            localStorage.setItem(clave, valor);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError' || 
                String(error).includes('quota') ||
                String(error).includes('exceeded')) {
                console.warn('⚠️ Cuota excedida. Liberando espacio...');
                this._liberarEspacio();
                try {
                    localStorage.setItem(clave, valor);
                    return true;
                } catch (retryError) {
                    console.error('❌ No se pudo guardar:', retryError.message);
                    return false;
                }
            }
            console.error('Error al guardar:', error.message);
            return false;
        }
    }

    _liberarEspacio() {
        let espacioLiberado = 0;
        const inicio = Date.now();

        try {
            // 1. Eliminar respaldos antiguos (dejar solo 3)
            const backups = [];
            for (let i = 0; i < localStorage.length; i++) {
                const clave = localStorage.key(i);
                if (clave && clave.startsWith(this.prefix + 'backup_')) {
                    backups.push({
                        clave: clave,
                        tiempo: this._extraerTiempoBackup(clave)
                    });
                }
            }
            backups.sort(function(a, b) { return b.tiempo - a.tiempo; });
            for (let i = 3; i < backups.length; i++) {
                try {
                    const item = localStorage.getItem(backups[i].clave);
                    if (item) espacioLiberado += item.length * 2;
                    localStorage.removeItem(backups[i].clave);
                } catch (e) {}
            }

            // 2. Limpiar logs (dejar solo 25)
            try {
                const logsKey = this._getKey('logs');
                const logsData = localStorage.getItem(logsKey);
                if (logsData) {
                    const logs = JSON.parse(logsData);
                    if (logs.logs && logs.logs.length > 25) {
                        const tamanoAntes = logsData.length;
                        logs.logs = logs.logs.slice(0, 25);
                        const nuevoJSON = JSON.stringify(logs);
                        localStorage.setItem(logsKey, nuevoJSON);
                        espacioLiberado += (tamanoAntes - nuevoJSON.length);
                    }
                }
            } catch (e) {}

            // 3. Limpiar notificaciones (dejar solo 50)
            try {
                const notifKey = this._getKey('notificaciones');
                const notifData = localStorage.getItem(notifKey);
                if (notifData) {
                    const notif = JSON.parse(notifData);
                    if (notif.notificaciones && notif.notificaciones.length > 50) {
                        const tamanoAntes = notifData.length;
                        notif.notificaciones = notif.notificaciones.slice(0, 50);
                        const nuevoJSON = JSON.stringify(notif);
                        localStorage.setItem(notifKey, nuevoJSON);
                        espacioLiberado += (tamanoAntes - nuevoJSON.length);
                    }
                }
            } catch (e) {}

            // 4. Limpiar chat (dejar solo 100 mensajes)
            try {
                const chatKey = this._getKey('chat');
                const chatData = localStorage.getItem(chatKey);
                if (chatData) {
                    const chat = JSON.parse(chatData);
                    if (chat.mensajes && chat.mensajes.length > 100) {
                        const tamanoAntes = chatData.length;
                        chat.mensajes = chat.mensajes.slice(-100);
                        const nuevoJSON = JSON.stringify(chat);
                        localStorage.setItem(chatKey, nuevoJSON);
                        espacioLiberado += (tamanoAntes - nuevoJSON.length);
                    }
                }
            } catch (e) {}

            // 5. Limpiar publicaciones (dejar solo 50)
            try {
                const pubKey = this._getKey('publicaciones');
                const pubData = localStorage.getItem(pubKey);
                if (pubData) {
                    const pub = JSON.parse(pubData);
                    if (pub.publicaciones && pub.publicaciones.length > 50) {
                        const tamanoAntes = pubData.length;
                        pub.publicaciones = pub.publicaciones.slice(0, 50).map(function(p) {
                            return {
                                id: p.id,
                                usuario_id: p.usuario_id,
                                autor: p.autor,
                                usuario: p.usuario,
                                foto_autor: p.foto_autor,
                                verificado: p.verificado,
                                contenido: (p.contenido || '').substring(0, 500),
                                fecha: p.fecha,
                                reacciones: p.reacciones || {},
                                comentarios_count: p.comentarios_count || 0,
                                estado: p.estado || 'publicado'
                            };
                        });
                        const nuevoJSON = JSON.stringify(pub);
                        localStorage.setItem(pubKey, nuevoJSON);
                        espacioLiberado += (tamanoAntes - nuevoJSON.length);
                    }
                }
            } catch (e) {}

            // 6. Limpiar comentarios (dejar solo 100)
            try {
                const comKey = this._getKey('comentarios');
                const comData = localStorage.getItem(comKey);
                if (comData) {
                    const com = JSON.parse(comData);
                    if (com.comentarios && com.comentarios.length > 100) {
                        const tamanoAntes = comData.length;
                        com.comentarios = com.comentarios.slice(-100);
                        const nuevoJSON = JSON.stringify(com);
                        localStorage.setItem(comKey, nuevoJSON);
                        espacioLiberado += (tamanoAntes - nuevoJSON.length);
                    }
                }
            } catch (e) {}

            // 7. Limpiar asistencia (dejar solo 200)
            try {
                const asistKey = this._getKey('asistencia');
                const asistData = localStorage.getItem(asistKey);
                if (asistData) {
                    const asist = JSON.parse(asistData);
                    if (asist.registros && asist.registros.length > 200) {
                        const tamanoAntes = asistData.length;
                        asist.registros = asist.registros.slice(-200);
                        const nuevoJSON = JSON.stringify(asist);
                        localStorage.setItem(asistKey, nuevoJSON);
                        espacioLiberado += (tamanoAntes - nuevoJSON.length);
                    }
                }
            } catch (e) {}

            // 8. Limpiar reportes (dejar solo 50)
            try {
                const repKey = this._getKey('reportes');
                const repData = localStorage.getItem(repKey);
                if (repData) {
                    const rep = JSON.parse(repData);
                    if (rep.reportes && rep.reportes.length > 50) {
                        const tamanoAntes = repData.length;
                        rep.reportes = rep.reportes.slice(0, 50);
                        const nuevoJSON = JSON.stringify(rep);
                        localStorage.setItem(repKey, nuevoJSON);
                        espacioLiberado += (tamanoAntes - nuevoJSON.length);
                    }
                }
            } catch (e) {}

            // 9. Limpiar caché interna
            this.cache = {};
            this.lastCacheUpdate = {};

            const duracion = Date.now() - inicio;
            console.log('💾 Espacio liberado: ~' + Math.round(espacioLiberado / 1024) + ' KB en ' + duracion + 'ms');
        } catch (error) {
            console.error('Error liberando espacio:', error.message);
        }
    }

    _extraerTiempoBackup(clave) {
        try {
            const partes = clave.split('_');
            const fechaHora = partes[partes.length - 1];
            return new Date(fechaHora.replace(/-/g, ':')).getTime() || 0;
        } catch {
            return 0;
        }
    }

    getStorageUsage() {
        try {
            let totalUsado = 0;
            let totalApp = 0;
            const limite = 5 * 1024 * 1024;
            
            for (let i = 0; i < localStorage.length; i++) {
                const clave = localStorage.key(i);
                const valor = localStorage.getItem(clave);
                const tamano = valor ? valor.length * 2 : 0;
                totalUsado += tamano;
                if (clave && clave.startsWith(this.prefix)) {
                    totalApp += tamano;
                }
            }
            
            return {
                usado_total: totalUsado,
                usado_app: totalApp,
                limite_estimado: limite,
                disponible: Math.max(0, limite - totalUsado),
                porcentaje_usado: Math.round((totalUsado / limite) * 100)
            };
        } catch {
            return { usado_total: 0, usado_app: 0, limite_estimado: 5242880, disponible: 0, porcentaje_usado: 0 };
        }
    }

    // ============================================
    // 3. OPERACIONES CRUD
    // ============================================
    
    cargar(nombreArchivo) {
        if (!this._isValidKey(nombreArchivo)) return null;
        const clave = this._getKey(nombreArchivo);
        
        if (this.cache[clave] && this.lastCacheUpdate[clave]) {
            const tiempoCache = (Date.now() - this.lastCacheUpdate[clave]) / 1000;
            if (tiempoCache < this.cacheTimeout) {
                return this._cloneDeep(this.cache[clave]);
            }
        }
        
        try {
            const datos = localStorage.getItem(clave);
            if (!datos || datos === 'null' || datos === 'undefined') {
                return this._crearArchivoPorDefecto(nombreArchivo);
            }
            
            const parsed = JSON.parse(datos);
            this.cache[clave] = this._cloneDeep(parsed);
            this.lastCacheUpdate[clave] = Date.now();
            return parsed;
        } catch {
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
            const datosAnteriores = localStorage.getItem(clave);
            if (datosAnteriores) {
                this._crearRespaldo(nombreArchivo, datosAnteriores);
            }
            
            const guardado = this._safeSetItem(clave, JSON.stringify(datos));
            
            if (guardado) {
                this.cache[clave] = this._cloneDeep(datos);
                this.lastCacheUpdate[clave] = Date.now();
                this._registrarLog('guardar', nombreArchivo);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al guardar:', error.message);
            return false;
        }
    }

    eliminar(nombreArchivo, id) {
        if (!this._isValidKey(nombreArchivo) || !id) return false;
        const coleccion = this.cargar(nombreArchivo);
        if (!coleccion) return false;
        
        let encontrado = false;
        for (const [key, value] of Object.entries(coleccion)) {
            if (Array.isArray(value)) {
                const filtered = value.filter(function(item) { return item.id !== id; });
                if (filtered.length !== value.length) {
                    coleccion[key] = filtered;
                    encontrado = true;
                    break;
                }
            }
        }
        
        if (!encontrado) return false;
        this._registrarLog('eliminar', nombreArchivo, { id: id });
        return this.guardar(nombreArchivo, coleccion);
    }

    // ============================================
    // 4. SISTEMA DE RESPALDOS
    // ============================================
    
    _crearRespaldo(nombreArchivo, datosAnteriores) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const claveRespaldo = this.prefix + 'backup_' + nombreArchivo + '_' + timestamp;
            this._safeSetItem(claveRespaldo, datosAnteriores);
            this._limpiarRespaldosAntiguos(nombreArchivo, 5);
        } catch (e) {}
    }

    _limpiarRespaldosAntiguos(nombreArchivo, maxRespaldos) {
        try {
            const respaldos = [];
            for (let i = 0; i < localStorage.length; i++) {
                const clave = localStorage.key(i);
                if (clave && clave.startsWith(this.prefix + 'backup_' + nombreArchivo + '_')) {
                    respaldos.push(clave);
                }
            }
            respaldos.sort(function(a, b) { return b.localeCompare(a); });
            if (respaldos.length > maxRespaldos) {
                for (let i = maxRespaldos; i < respaldos.length; i++) {
                    localStorage.removeItem(respaldos[i]);
                }
            }
        } catch (e) {}
    }

    _recuperarRespaldo(nombreArchivo) {
        try {
            const respaldos = [];
            for (let i = 0; i < localStorage.length; i++) {
                const clave = localStorage.key(i);
                if (clave && clave.startsWith(this.prefix + 'backup_' + nombreArchivo + '_')) {
                    respaldos.push(clave);
                }
            }
            respaldos.sort(function(a, b) { return b.localeCompare(a); });
            for (let i = 0; i < respaldos.length; i++) {
                try {
                    const datos = localStorage.getItem(respaldos[i]);
                    if (datos) {
                        const parsed = JSON.parse(datos);
                        this.guardar(nombreArchivo, parsed);
                        return parsed;
                    }
                } catch (e) {}
            }
            return null;
        } catch {
            return null;
        }
    }

    _startAutoBackup() {
        const self = this;
        setInterval(function() {
            try {
                const archivos = self._getAllCollectionNames();
                for (let i = 0; i < archivos.length; i++) {
                    const archivo = archivos[i];
                    const datos = self.cargar(archivo);
                    if (datos) {
                        self._crearRespaldo(archivo, JSON.stringify(datos));
                    }
                }
            } catch (e) {}
        }, this.backupInterval);
    }

    // ============================================
    // 5. SISTEMA DE LOGS
    // ============================================
    
    _registrarLog(accion, nombreArchivo, detalles) {
        try {
            detalles = detalles || {};
            const logs = this.cargar('logs') || { logs: [], ultimo_id: 0 };
            const nuevoLog = {
                id: (logs.logs && logs.logs.length || 0) + 1,
                accion: accion,
                nombreArchivo: nombreArchivo,
                detalles: detalles,
                fecha: new Date().toISOString(),
                usuario: detalles.usuario || 'sistema'
            };
            if (!logs.logs) logs.logs = [];
            logs.logs.unshift(nuevoLog);
            logs.ultimo_id = nuevoLog.id;
            
            if (logs.logs.length > 100) {
                logs.logs = logs.logs.slice(0, 100);
            }
            
            this.guardar('logs', logs);
        } catch (e) {}
    }

    getLogs(limit) {
        limit = limit || 50;
        const logs = this.cargar('logs');
        return (logs && logs.logs || []).slice(0, limit);
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
            'misiones': { misiones: [], ultimo_id: 0 },
            'testimonios': { testimonios: [], ultimo_id: 0 },
            'grupos': { grupos: [], ultimo_id: 0 },
            'donaciones': { donaciones: [], ultimo_id: 0 },
            'reportes': { reportes: [], ultimo_id: 0 },
            'reportes_config': { 
                max_pendientes: 50,
                tiempo_resolucion: 72,
                niveles_urgencia: ['baja', 'media', 'alta', 'critica'],
                estados: ['pendiente', 'en_revision', 'resuelto', 'desestimado'],
                tipos: ['usuario', 'contenido', 'asistencia', 'financiero', 'ministerio']
            }
        };
        
        if (datosPorDefecto[nombreArchivo]) {
            const clave = this._getKey(nombreArchivo);
            
            if (localStorage.getItem(clave)) {
                try { return JSON.parse(localStorage.getItem(clave)); } 
                catch (e) {}
            }
            
            try {
                const datos = datosPorDefecto[nombreArchivo];
                const guardado = this._safeSetItem(clave, JSON.stringify(datos));
                if (guardado) {
                    this.cache[clave] = this._cloneDeep(datos);
                    this.lastCacheUpdate[clave] = Date.now();
                }
                return datos;
            } catch (e) {
                return datosPorDefecto[nombreArchivo];
            }
        }
        return { datos: [], ultimo_id: 0 };
    }

    _getAllCollectionNames() {
        const collections = [];
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave && clave.startsWith(this.prefix) && clave.indexOf('backup_') === -1) {
                const name = clave.replace(this.prefix, '');
                if (name.indexOf('backup_') === -1) {
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
        if (!password || typeof password !== 'string') return '00000000';
        let hash = 0;
        const salt = 'ipuc18_salt_2026_secure_v18';
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
    
    _validarCorreo(correo) { return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correo); }
    _validarUsuario(usuario) { return /^[a-zA-Z0-9_]{3,20}$/.test(usuario); }
    _validarTelefono(telefono) { return /^[0-9]{10,15}$/.test(telefono); }
    _validarPassword(password) { return password && password.length >= 8; }

    // ============================================
    // 9. ADMINISTRADOR
    // ============================================
    
    crearPrimerAdministrador(datos) {
        try {
            const admins = this.cargar('administradores');
            if (admins && admins.administradores && admins.administradores.length > 0) {
                return { success: false, error: 'Ya existe un administrador' };
            }

            if (!datos.nombre || !datos.apellidos || !datos.correo || !datos.usuario || !datos.password) {
                return { success: false, error: 'Campos obligatorios faltantes' };
            }

            if (!this._validarCorreo(datos.correo)) return { success: false, error: 'Correo inválido' };
            if (!this._validarUsuario(datos.usuario)) return { success: false, error: 'Usuario inválido (3-20 caracteres)' };
            if (!this._validarPassword(datos.password)) return { success: false, error: 'Contraseña mínima 8 caracteres' };

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
                insignias: ['Administrador', 'Cuenta Verificada']
            };

            if (!admins.administradores) admins.administradores = [];
            admins.administradores.push(admin);
            admins.ultimo_id = 1;

            if (this.guardar('administradores', admins)) {
                const cfg = this.cargar('configuracion');
                if (cfg && cfg.aplicacion) {
                    cfg.aplicacion.primer_administrador_creado = true;
                    this.guardar('configuracion', cfg);
                }
                this._registrarLog('crear_admin', 'administradores', { usuario: datos.usuario });
                return { success: true, data: admin, message: 'Administrador creado exitosamente' };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    // ============================================
    // 10. AUTENTICACIÓN
    // ============================================
    
    login(usuario, password, recordar) {
        try {
            recordar = recordar || false;
            if (!usuario || !password) return { success: false, error: 'Usuario y contraseña requeridos' };

            const hash = this.hashPassword(password);
            
            const admins = this.cargar('administradores');
            if (admins && admins.administradores) {
                const admin = admins.administradores.find(function(a) {
                    return (a.usuario === usuario || a.correo === usuario) && a.password === hash;
                });
                
                if (admin) {
                    if (admin.estado !== 'activo') return { success: false, error: 'Cuenta desactivada' };
                    
                    const { password: pwd, ...adminSeguro } = admin;
                    const token = 't18_' + Date.now() + '_' + this._generateId();
                    
                    if (recordar) this._guardarSesion(token, adminSeguro, 'admin');
                    this._registrarLog('login', 'administradores', { usuario: admin.usuario, rol: 'admin' });
                    
                    return { success: true, token: token, rol: 'admin', usuario: adminSeguro };
                }
            }

            const usuarios = this.cargar('usuarios');
            if (usuarios && usuarios.usuarios) {
                const user = usuarios.usuarios.find(function(u) {
                    return (u.usuario === usuario || u.correo === usuario) && u.password === hash;
                });
                
                if (user) {
                    if (user.estado !== 'activo') return { success: false, error: 'Cuenta desactivada' };
                    
                    const { password: pwd, ...userSeguro } = user;
                    const token = 't18_' + Date.now() + '_' + this._generateId();
                    
                    if (recordar) this._guardarSesion(token, userSeguro, 'usuario');
                    this._registrarLog('login', 'usuarios', { usuario: user.usuario, rol: 'usuario' });
                    
                    return { success: true, token: token, rol: 'usuario', usuario: userSeguro };
                }
            }

            this._registrarLog('login_fallido', 'auth', { usuario: usuario });
            return { success: false, error: 'Credenciales inválidas' };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    _guardarSesion(token, usuario, rol) {
        try {
            const sesion = {
                token: token,
                usuario: usuario,
                rol: rol,
                fecha: new Date().toISOString(),
                expira: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            this._safeSetItem(this.prefix + 'session', JSON.stringify(sesion));
        } catch (e) {}
    }

    getSesion() {
        try {
            const datos = localStorage.getItem(this.prefix + 'session');
            if (!datos) return null;
            const sesion = JSON.parse(datos);
            if (new Date(sesion.expira) < new Date()) {
                localStorage.removeItem(this.prefix + 'session');
                return null;
            }
            return sesion;
        } catch {
            return null;
        }
    }

    cerrarSesion() {
        try {
            localStorage.removeItem(this.prefix + 'session');
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
                'sexo', 'correo', 'celular', 'usuario', 'password', 'ministerio'];
            
            for (let i = 0; i < campos.length; i++) {
                const c = campos[i];
                if (!datos[c] || !String(datos[c]).trim()) {
                    return { success: false, error: "El campo '" + c + "' es obligatorio" };
                }
            }

            if (!this._validarCorreo(datos.correo)) return { success: false, error: 'Correo inválido' };
            if (!this._validarUsuario(datos.usuario)) return { success: false, error: 'Usuario inválido (3-20 caracteres)' };
            if (!this._validarTelefono(datos.celular)) return { success: false, error: 'Celular inválido (10-15 dígitos)' };
            if (!this._validarPassword(datos.password)) return { success: false, error: 'Contraseña mínima 8 caracteres' };

            const usuarios = this.cargar('usuarios');
            
            if (usuarios && usuarios.usuarios) {
                if (usuarios.usuarios.some(function(u) { return String(u.documento) === String(datos.documento); })) {
                    return { success: false, error: 'Documento ya registrado' };
                }
                if (usuarios.usuarios.some(function(u) { return u.correo && u.correo.toLowerCase() === datos.correo.toLowerCase(); })) {
                    return { success: false, error: 'Correo ya registrado' };
                }
                if (usuarios.usuarios.some(function(u) { return u.usuario && u.usuario.toLowerCase() === datos.usuario.toLowerCase(); })) {
                    return { success: false, error: 'Usuario ya existe' };
                }
            }

            const nuevo = {
                id: (usuarios && usuarios.usuarios ? usuarios.usuarios.length : 0) + 1,
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
                this._agregarNotificacion({
                    titulo: 'Nuevo miembro',
                    mensaje: nuevo.nombre + ' se ha unido a la comunidad',
                    tipo: 'usuario'
                });
                this._registrarLog('registro_usuario', 'usuarios', { usuario: nuevo.usuario });
                return { success: true, data: { id: nuevo.id, nombre: nuevo.nombre, usuario: nuevo.usuario }, message: 'Usuario registrado exitosamente' };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    // ============================================
    // 12. PUBLICACIONES
    // ============================================
    
    getPublicaciones(limit, offset) {
        limit = limit || 100;
        offset = offset || 0;
        const pub = this.cargar('publicaciones');
        return (pub && pub.publicaciones || []).slice(offset, offset + limit);
    }

    getPublicacion(id) {
        const pub = this.cargar('publicaciones');
        if (!pub || !pub.publicaciones) return null;
        return pub.publicaciones.find(function(p) { return p.id === id; }) || null;
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
                contenido: datos.contenido.trim().substring(0, 2000),
                imagen: datos.imagen || '',
                fecha: new Date().toISOString(),
                reacciones: { amen: 0, me_gusta: 0, fuego: 0, orando: 0, bendicion: 0 },
                comentarios_count: 0,
                estado: 'publicado'
            };

            if (!publicaciones.publicaciones) publicaciones.publicaciones = [];
            publicaciones.publicaciones.unshift(nueva);
            
            if (publicaciones.publicaciones.length > 100) {
                publicaciones.publicaciones = publicaciones.publicaciones.slice(0, 100);
            }
            publicaciones.ultimo_id = nueva.id;

            if (this.guardar('publicaciones', publicaciones)) {
                this._agregarNotificacion({
                    titulo: 'Nueva publicación',
                    mensaje: datos.autor + ' ha publicado en el muro',
                    tipo: 'publicacion'
                });
                return { success: true, data: nueva };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    deletePublicacion(id) {
        try {
            const publicaciones = this.cargar('publicaciones');
            if (!publicaciones || !publicaciones.publicaciones) return { success: false, error: 'No encontrada' };
            
            publicaciones.publicaciones = publicaciones.publicaciones.filter(function(p) { return p.id !== id; });
            this.guardar('publicaciones', publicaciones);
            
            const comentarios = this.cargar('comentarios');
            if (comentarios && comentarios.comentarios) {
                comentarios.comentarios = comentarios.comentarios.filter(function(c) { return c.publicacion_id !== id; });
                this.guardar('comentarios', comentarios);
            }
            
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    // ============================================
    // 13. COMENTARIOS
    // ============================================
    
    getComentarios(publicacionId) {
        const comentarios = this.cargar('comentarios');
        if (!comentarios || !comentarios.comentarios) return [];
        if (publicacionId) {
            return comentarios.comentarios
                .filter(function(c) { return c.publicacion_id === publicacionId; })
                .sort(function(a, b) { return new Date(a.fecha) - new Date(b.fecha); });
        }
        return comentarios.comentarios;
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
                contenido: datos.contenido.trim().substring(0, 1000),
                fecha: new Date().toISOString(),
                estado: 'activo'
            };

            if (!comentarios.comentarios) comentarios.comentarios = [];
            comentarios.comentarios.push(nuevo);
            
            if (comentarios.comentarios.length > 500) {
                comentarios.comentarios = comentarios.comentarios.slice(-500);
            }
            comentarios.ultimo_id = nuevo.id;
            this.guardar('comentarios', comentarios);

            const publicaciones = this.cargar('publicaciones');
            if (publicaciones && publicaciones.publicaciones) {
                const pub = publicaciones.publicaciones.find(function(p) { return p.id === datos.publicacion_id; });
                if (pub) {
                    pub.comentarios_count = (pub.comentarios_count || 0) + 1;
                    this.guardar('publicaciones', publicaciones);
                }
            }

            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    // ============================================
    // 14. REACCIONES
    // ============================================
    
    toggleReaccion(publicacionId, usuarioId, tipo) {
        try {
            if (!publicacionId || !usuarioId || !tipo) return { success: false, error: 'Datos incompletos' };

            const tiposValidos = ['amen', 'me_gusta', 'fuego', 'orando', 'bendicion'];
            if (tiposValidos.indexOf(tipo) === -1) return { success: false, error: 'Tipo inválido' };

            const reacciones = this.cargar('reacciones');
            if (!reacciones.reacciones) reacciones.reacciones = {};
            const clave = publicacionId + '_' + usuarioId;
            const actual = reacciones.reacciones[clave];

            const publicaciones = this.cargar('publicaciones');
            if (!publicaciones || !publicaciones.publicaciones) return { success: false, error: 'No encontrada' };
            
            const pub = publicaciones.publicaciones.find(function(p) { return p.id === publicacionId; });
            if (!pub) return { success: false, error: 'Publicación no encontrada' };

            if (actual === tipo) {
                delete reacciones.reacciones[clave];
                if (pub.reacciones && pub.reacciones[tipo] > 0) pub.reacciones[tipo]--;
            } else {
                if (actual && pub.reacciones && pub.reacciones[actual] > 0) pub.reacciones[actual]--;
                reacciones.reacciones[clave] = tipo;
                if (!pub.reacciones) pub.reacciones = { amen: 0, me_gusta: 0, fuego: 0, orando: 0, bendicion: 0 };
                pub.reacciones[tipo] = (pub.reacciones[tipo] || 0) + 1;
            }

            this.guardar('reacciones', reacciones);
            this.guardar('publicaciones', publicaciones);
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    // ============================================
    // 15. NOTICIAS Y EVENTOS
    // ============================================
    
    getNoticias(limit) {
        limit = limit || 50;
        const noticias = this.cargar('noticias');
        return (noticias && noticias.noticias || []).slice(0, limit);
    }

    addNoticia(datos) {
        try {
            if (!datos.titulo || !datos.contenido) return { success: false, error: 'Título y contenido requeridos' };
            const noticias = this.cargar('noticias');
            const nueva = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                contenido: datos.contenido.trim().substring(0, 5000),
                resumen: datos.resumen || datos.contenido.trim().substring(0, 150),
                autor_nombre: datos.autor_nombre || 'Admin',
                fecha_publicacion: new Date().toISOString(),
                estado: 'publicado',
                categoria: datos.categoria || 'General'
            };
            if (!noticias.noticias) noticias.noticias = [];
            noticias.noticias.unshift(nueva);
            if (noticias.noticias.length > 100) noticias.noticias = noticias.noticias.slice(0, 100);
            noticias.ultimo_id = nueva.id;
            if (this.guardar('noticias', noticias)) {
                this._agregarNotificacion({ titulo: 'Nueva noticia', mensaje: nueva.titulo, tipo: 'noticia' });
                return { success: true, data: nueva };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    deleteNoticia(id) {
        try {
            const noticias = this.cargar('noticias');
            if (noticias && noticias.noticias) {
                noticias.noticias = noticias.noticias.filter(function(n) { return n.id !== id; });
                this.guardar('noticias', noticias);
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    getEventos(filtros) {
        filtros = filtros || {};
        let eventos = this.cargar('eventos');
        eventos = (eventos && eventos.eventos) ? eventos.eventos : [];
        
        if (filtros.estado) eventos = eventos.filter(function(e) { return e.estado === filtros.estado; });
        if (filtros.fecha_desde) eventos = eventos.filter(function(e) { return e.fecha >= filtros.fecha_desde; });
        
        return eventos.sort(function(a, b) { return new Date(a.fecha) - new Date(b.fecha); });
    }

    addEvento(datos) {
        try {
            if (!datos.titulo || !datos.fecha) return { success: false, error: 'Título y fecha requeridos' };
            const eventos = this.cargar('eventos');
            const nuevo = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                descripcion: datos.descripcion || '',
                fecha: datos.fecha,
                hora_inicio: datos.hora_inicio || '',
                lugar: datos.lugar || 'IPUC LA FONDA',
                fecha_creacion: new Date().toISOString(),
                estado: 'programado'
            };
            if (!eventos.eventos) eventos.eventos = [];
            eventos.eventos.push(nuevo);
            if (eventos.eventos.length > 200) eventos.eventos = eventos.eventos.slice(-200);
            eventos.ultimo_id = nuevo.id;
            if (this.guardar('eventos', eventos)) {
                this._agregarNotificacion({ titulo: 'Nuevo evento', mensaje: nuevo.titulo + ' - ' + nuevo.fecha, tipo: 'evento' });
                return { success: true, data: nuevo };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    deleteEvento(id) {
        try {
            const eventos = this.cargar('eventos');
            if (eventos && eventos.eventos) {
                eventos.eventos = eventos.eventos.filter(function(e) { return e.id !== id; });
                this.guardar('eventos', eventos);
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    // ============================================
    // 16. ASISTENCIA
    // ============================================
    
    getAsistencia(filtros) {
        filtros = filtros || {};
        let registros = this.cargar('asistencia');
        registros = (registros && registros.registros) ? registros.registros : [];
        
        if (filtros.usuario_id) registros = registros.filter(function(r) { return r.usuario_id === filtros.usuario_id; });
        if (filtros.fecha) registros = registros.filter(function(r) { return r.fecha === filtros.fecha; });
        
        return registros;
    }

    addAsistencia(datos) {
        try {
            if (!datos.usuario_id || !datos.nombre) return { success: false, error: 'Datos incompletos' };
            const asistencia = this.cargar('asistencia');
            const nuevo = {
                id: this._generateId(),
                usuario_id: datos.usuario_id,
                nombre: datos.nombre.trim(),
                fecha: datos.fecha || new Date().toISOString().split('T')[0],
                hora: datos.hora || new Date().toLocaleTimeString('es-CO'),
                estado: datos.estado || 'Asistiré',
                tipo: datos.tipo || 'Hermano',
                creado: new Date().toISOString()
            };
            if (!asistencia.registros) asistencia.registros = [];
            asistencia.registros.push(nuevo);
            if (asistencia.registros.length > 500) asistencia.registros = asistencia.registros.slice(-500);
            asistencia.ultimo_id = nuevo.id;
            if (this.guardar('asistencia', asistencia)) return { success: true, data: nuevo };
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    // ============================================
    // 17. PETICIONES
    // ============================================
    
    getPeticiones(filtros) {
        filtros = filtros || {};
        let peticiones = this.cargar('peticiones');
        peticiones = (peticiones && peticiones.peticiones) ? peticiones.peticiones : [];
        
        if (filtros.estado) peticiones = peticiones.filter(function(p) { return p.estado === filtros.estado; });
        
        return peticiones.sort(function(a, b) { return new Date(b.fecha) - new Date(a.fecha); });
    }

    addPeticion(datos) {
        try {
            if (!datos.usuario_id || !datos.nombre || !datos.motivo) return { success: false, error: 'Datos incompletos' };
            const peticiones = this.cargar('peticiones');
            const nueva = {
                id: this._generateId(),
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
            if (peticiones.peticiones.length > 200) peticiones.peticiones = peticiones.peticiones.slice(0, 200);
            peticiones.ultimo_id = nueva.id;
            if (this.guardar('peticiones', peticiones)) return { success: true, data: nueva };
            return { success: false, error: 'Error al guardar' };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    orarPeticion(id) {
        try {
            const peticiones = this.cargar('peticiones');
            if (!peticiones || !peticiones.peticiones) return { success: false, error: 'No encontrada' };
            const peticion = peticiones.peticiones.find(function(p) { return p.id === id; });
            if (!peticion) return { success: false, error: 'Petición no encontrada' };
            peticion.oraciones = (peticion.oraciones || 0) + 1;
            this.guardar('peticiones', peticiones);
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    // ============================================
    // 18. ENCUESTAS
    // ============================================
    
    getEncuestas() {
        const encuestas = this.cargar('encuestas');
        return (encuestas && encuestas.encuestas) ? encuestas.encuestas : [];
    }

    addEncuesta(datos) {
        try {
            if (!datos.titulo) return { success: false, error: 'Título requerido' };
            const encuestas = this.cargar('encuestas');
            const nueva = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                preguntas: datos.preguntas || [],
                fecha: new Date().toISOString(),
                activa: true,
                votos: {},
                total_votos: 0
            };
            if (!encuestas.encuestas) encuestas.encuestas = [];
            encuestas.encuestas.push(nueva);
            encuestas.ultimo_id = nueva.id;
            this.guardar('encuestas', encuestas);
            return { success: true, data: nueva };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    // ============================================
    // 19. BIBLIOTECA, GALERIA, PODCAST
    // ============================================
    
    getRecursos(categoria) {
        const recursos = this.cargar('biblioteca');
        const lista = (recursos && recursos.recursos) ? recursos.recursos : [];
        return categoria ? lista.filter(function(r) { return r.categoria === categoria; }) : lista;
    }

    addRecurso(datos) {
        try {
            if (!datos.titulo || !datos.autor) return { success: false, error: 'Título y autor requeridos' };
            const biblioteca = this.cargar('biblioteca');
            const nuevo = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                autor: datos.autor.trim(),
                categoria: datos.categoria || 'General',
                fecha: new Date().toISOString()
            };
            if (!biblioteca.recursos) biblioteca.recursos = [];
            biblioteca.recursos.push(nuevo);
            biblioteca.ultimo_id = nuevo.id;
            this.guardar('biblioteca', biblioteca);
            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    getAlbumes() {
        const galeria = this.cargar('galeria');
        return (galeria && galeria.albumes) ? galeria.albumes : [];
    }

    addImagen(datos) {
        try {
            if (!datos.titulo) return { success: false, error: 'Título requerido' };
            const galeria = this.cargar('galeria');
            const nuevo = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                imagen: datos.imagen || '',
                fecha: new Date().toISOString()
            };
            if (!galeria.albumes) galeria.albumes = [];
            galeria.albumes.push(nuevo);
            galeria.ultimo_id = nuevo.id;
            this.guardar('galeria', galeria);
            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    getPodcast() {
        const podcast = this.cargar('podcast');
        return (podcast && podcast.episodios) ? podcast.episodios : [];
    }

    addPodcast(datos) {
        try {
            if (!datos.titulo || !datos.pastor) return { success: false, error: 'Título y pastor requeridos' };
            const podcast = this.cargar('podcast');
            const nuevo = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                pastor: datos.pastor.trim(),
                duracion: datos.duracion || '30 min',
                fecha: new Date().toISOString()
            };
            if (!podcast.episodios) podcast.episodios = [];
            podcast.episodios.push(nuevo);
            podcast.ultimo_id = nuevo.id;
            this.guardar('podcast', podcast);
            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    // ============================================
    // 20. CHAT Y DIRECTORIO
    // ============================================
    
    getMensajes(limit) {
        limit = limit || 100;
        const mensajes = this.cargar('chat');
        const lista = (mensajes && mensajes.mensajes) ? mensajes.mensajes : [];
        return lista.slice(-limit);
    }

    addMensaje(datos) {
        try {
            if (!datos.usuario || !datos.usuario_id || !datos.mensaje) return { success: false, error: 'Datos incompletos' };
            const chat = this.cargar('chat');
            const nuevo = {
                id: this._generateId(),
                usuario: datos.usuario,
                usuario_id: datos.usuario_id,
                mensaje: datos.mensaje.trim().substring(0, 500),
                fecha: new Date().toISOString()
            };
            if (!chat.mensajes) chat.mensajes = [];
            chat.mensajes.push(nuevo);
            if (chat.mensajes.length > 200) chat.mensajes = chat.mensajes.slice(-200);
            chat.ultimo_id = nuevo.id;
            this.guardar('chat', chat);
            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    getDirectorio() {
        const directorio = this.cargar('directorio');
        return (directorio && directorio.miembros) ? directorio.miembros : [];
    }

    addMiembro(datos) {
        try {
            if (!datos.nombre) return { success: false, error: 'Nombre requerido' };
            const directorio = this.cargar('directorio');
            const nuevo = {
                id: this._generateId(),
                nombre: datos.nombre.trim(),
                apellidos: datos.apellidos || '',
                ministerio: datos.ministerio || 'General',
                fecha: new Date().toISOString()
            };
            if (!directorio.miembros) directorio.miembros = [];
            directorio.miembros.push(nuevo);
            directorio.ultimo_id = nuevo.id;
            this.guardar('directorio', directorio);
            return { success: true, data: nuevo };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    // ============================================
    // 21. NOTIFICACIONES
    // ============================================
    
    getNotificaciones(limit) {
        limit = limit || 50;
        const notificaciones = this.cargar('notificaciones');
        return (notificaciones && notificaciones.notificaciones || []).slice(0, limit);
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
                tipo: datos.tipo || 'general'
            };
            if (!notificaciones.notificaciones) notificaciones.notificaciones = [];
            notificaciones.notificaciones.unshift(nueva);
            if (notificaciones.notificaciones.length > 100) {
                notificaciones.notificaciones = notificaciones.notificaciones.slice(0, 100);
            }
            notificaciones.ultimo_id = nueva.id;
            this.guardar('notificaciones', notificaciones);
        } catch (e) {}
    }

    marcarTodasLeidas() {
        try {
            const notificaciones = this.cargar('notificaciones');
            if (notificaciones && notificaciones.notificaciones) {
                notificaciones.notificaciones.forEach(function(n) { n.leida = true; });
                this.guardar('notificaciones', notificaciones);
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    getNoLeidas() {
        const notificaciones = this.getNotificaciones();
        return notificaciones.filter(function(n) { return !n.leida; }).length;
    }

    // ============================================
    // 22. SISTEMA DE REPORTES
    // ============================================

    getReportes(filtros) {
        filtros = filtros || {};
        let reportes = this.cargar('reportes');
        reportes = (reportes && reportes.reportes) ? reportes.reportes : [];
        
        if (filtros.estado) reportes = reportes.filter(function(r) { return r.estado === filtros.estado; });
        if (filtros.tipo) reportes = reportes.filter(function(r) { return r.tipo === filtros.tipo; });
        if (filtros.urgencia) reportes = reportes.filter(function(r) { return r.urgencia === filtros.urgencia; });
        if (filtros.usuario_id) reportes = reportes.filter(function(r) { return r.reportado_por && r.reportado_por.id === filtros.usuario_id; });
        
        return reportes.sort(function(a, b) { return new Date(b.fecha) - new Date(a.fecha); });
    }

    getReporte(id) {
        const reportes = this.cargar('reportes');
        if (!reportes || !reportes.reportes) return null;
        return reportes.reportes.find(function(r) { return r.id === id; }) || null;
    }

    getReportesPendientes() {
        return this.getReportes({ estado: 'pendiente' });
    }

    addReporte(datos) {
        try {
            if (!datos.tipo || !datos.reportado_por || !datos.descripcion) {
                return { success: false, error: 'Datos incompletos' };
            }

            const tiposValidos = ['usuario', 'contenido', 'asistencia', 'financiero', 'ministerio'];
            if (tiposValidos.indexOf(datos.tipo) === -1) {
                return { success: false, error: 'Tipo de reporte inválido' };
            }

            const reportes = this.cargar('reportes');
            const nuevo = {
                id: this._generateId(),
                tipo: datos.tipo,
                reportado_por: {
                    id: datos.reportado_por.id,
                    nombre: datos.reportado_por.nombre,
                    email: datos.reportado_por.email || ''
                },
                usuario_reportado: datos.usuario_reportado || null,
                descripcion: datos.descripcion.trim().substring(0, 2000),
                motivo: datos.motivo || '',
                urgencia: datos.urgencia || 'baja',
                estado: 'pendiente',
                fecha: new Date().toISOString(),
                fecha_resolucion: null,
                notas_admin: '',
                historial: [{
                    estado: 'pendiente',
                    fecha: new Date().toISOString(),
                    usuario: datos.reportado_por.nombre,
                    comentario: 'Reporte creado'
                }]
            };

            if (!reportes.reportes) reportes.reportes = [];
            reportes.reportes.unshift(nuevo);
            
            if (reportes.reportes.length > 100) {
                reportes.reportes = reportes.reportes.slice(0, 100);
            }
            reportes.ultimo_id = nuevo.id;

            if (this.guardar('reportes', reportes)) {
                this._agregarNotificacion({
                    titulo: 'Nuevo reporte',
                    mensaje: 'Reporte #' + nuevo.id.substring(0, 8) + ' - ' + nuevo.tipo,
                    tipo: 'reporte'
                });
                return { success: true, data: nuevo };
            }
            return { success: false, error: 'Error al guardar reporte' };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    cambiarEstadoReporte(id, nuevoEstado, usuarioAdmin, comentario) {
        try {
            usuarioAdmin = usuarioAdmin || 'Admin';
            comentario = comentario || '';
            
            const estadosValidos = ['pendiente', 'en_revision', 'resuelto', 'desestimado'];
            if (estadosValidos.indexOf(nuevoEstado) === -1) {
                return { success: false, error: 'Estado inválido' };
            }

            const reportes = this.cargar('reportes');
            if (!reportes || !reportes.reportes) return { success: false, error: 'No encontrado' };
            
            const reporte = reportes.reportes.find(function(r) { return r.id === id; });
            if (!reporte) return { success: false, error: 'Reporte no encontrado' };

            const estadoAnterior = reporte.estado;
            reporte.estado = nuevoEstado;
            
            if (nuevoEstado === 'resuelto' || nuevoEstado === 'desestimado') {
                reporte.fecha_resolucion = new Date().toISOString();
            }

            if (!reporte.historial) reporte.historial = [];
            reporte.historial.push({
                estado: nuevoEstado,
                fecha: new Date().toISOString(),
                usuario: usuarioAdmin,
                comentario: comentario || 'Cambio: ' + estadoAnterior + ' → ' + nuevoEstado
            });

            this.guardar('reportes', reportes);
            return { success: true, data: reporte };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    deleteReporte(id) {
        try {
            const reportes = this.cargar('reportes');
            if (reportes && reportes.reportes) {
                reportes.reportes = reportes.reportes.filter(function(r) { return r.id !== id; });
                this.guardar('reportes', reportes);
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    getEstadisticasReportes() {
        const reportes = this.cargar('reportes');
        const lista = (reportes && reportes.reportes) ? reportes.reportes : [];
        
        return {
            total: lista.length,
            pendientes: lista.filter(function(r) { return r.estado === 'pendiente'; }).length,
            en_revision: lista.filter(function(r) { return r.estado === 'en_revision'; }).length,
            resueltos: lista.filter(function(r) { return r.estado === 'resuelto'; }).length,
            desestimados: lista.filter(function(r) { return r.estado === 'desestimado'; }).length,
            por_tipo: {
                usuario: lista.filter(function(r) { return r.tipo === 'usuario'; }).length,
                contenido: lista.filter(function(r) { return r.tipo === 'contenido'; }).length,
                asistencia: lista.filter(function(r) { return r.tipo === 'asistencia'; }).length,
                financiero: lista.filter(function(r) { return r.tipo === 'financiero'; }).length,
                ministerio: lista.filter(function(r) { return r.tipo === 'ministerio'; }).length
            },
            por_urgencia: {
                critica: lista.filter(function(r) { return r.urgencia === 'critica'; }).length,
                alta: lista.filter(function(r) { return r.urgencia === 'alta'; }).length,
                media: lista.filter(function(r) { return r.urgencia === 'media'; }).length,
                baja: lista.filter(function(r) { return r.urgencia === 'baja'; }).length
            }
        };
    }

    // ============================================
    // 23. ESTADÍSTICAS Y CONFIGURACIÓN
    // ============================================
    
    getEstadisticas() {
        try {
            const estadisticas = this.cargar('estadisticas');
            return {
                usuarios: (estadisticas && estadisticas.usuarios ? estadisticas.usuarios.total : 0) || 0,
                publicaciones: this.getPublicaciones().length,
                noticias: this.getNoticias().length,
                eventos: this.getEventos().length,
                peticiones: this.getPeticiones().length,
                notificaciones_no_leidas: this.getNoLeidas(),
                reportes_pendientes: this.getReportesPendientes().length
            };
        } catch {
            return {};
        }
    }

    getConfiguracion() {
        return this.cargar('configuracion');
    }

    getConfiguracionIglesia() {
        const cfg = this.getConfiguracion();
        return (cfg && cfg.iglesia) ? cfg.iglesia : {};
    }

    updateConfiguracionIglesia(datos) {
        const cfg = this.getConfiguracion();
        if (!cfg.iglesia) cfg.iglesia = {};
        cfg.iglesia = { ...cfg.iglesia, ...datos };
        return this.guardar('configuracion', cfg) ? { success: true } : { success: false, error: 'Error al guardar' };
    }

    getHorarios() {
        const horarios = this.cargar('horarios');
        return (horarios && horarios.cultos) ? horarios.cultos : [];
    }

    getVersiculos() {
        const versiculos = this.cargar('versiculos');
        return (versiculos && versiculos.versiculos) ? versiculos.versiculos : [];
    }

    getVersiculoDiario() {
        const versiculos = this.getVersiculos();
        if (versiculos.length === 0) return null;
        return versiculos[new Date().getDay() % versiculos.length];
    }

    getDonaciones() {
        const donaciones = this.cargar('donaciones');
        return (donaciones && donaciones.donaciones) ? donaciones.donaciones : [];
    }

    addDonacion(datos) {
        try {
            if (!datos.usuario_id || !datos.monto) return { success: false, error: 'Datos incompletos' };
            const donaciones = this.cargar('donaciones');
            const nueva = {
                id: this._generateId(),
                usuario_id: datos.usuario_id,
                usuario_nombre: datos.usuario_nombre || 'Anónimo',
                monto: datos.monto,
                metodo: datos.metodo || 'Efectivo',
                concepto: datos.concepto || 'Ofrenda',
                fecha: new Date().toISOString()
            };
            if (!donaciones.donaciones) donaciones.donaciones = [];
            donaciones.donaciones.push(nueva);
            donaciones.ultimo_id = nueva.id;
            this.guardar('donaciones', donaciones);
            return { success: true, data: nueva };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    // ============================================
    // 24. EXPORTACIÓN E IMPORTACIÓN
    // ============================================
    
    exportarTodo() {
        const datos = {};
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave && clave.startsWith(this.prefix)) {
                try { datos[clave] = JSON.parse(localStorage.getItem(clave)); } 
                catch { datos[clave] = localStorage.getItem(clave); }
            }
        }
        return { version: this.version, fecha: new Date().toISOString(), datos: datos };
    }

    importarTodo(exportData) {
        try {
            if (!exportData || !exportData.datos) return { success: false, error: 'Datos inválidos' };
            const datos = exportData.datos;
            for (const clave in datos) {
                if (datos.hasOwnProperty(clave) && clave.startsWith(this.prefix)) {
                    this._safeSetItem(clave, JSON.stringify(datos[clave]));
                }
            }
            this.cache = {};
            this.lastCacheUpdate = {};
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    limpiarTodo() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const clave = localStorage.key(i);
                if (clave && clave.startsWith(this.prefix)) {
                    keysToRemove.push(clave);
                }
            }
            for (let i = 0; i < keysToRemove.length; i++) {
                localStorage.removeItem(keysToRemove[i]);
            }
            this.cache = {};
            this.lastCacheUpdate = {};
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error: ' + error.message };
        }
    }

    // ============================================
    // 25. INICIALIZACIÓN
    // ============================================
    
    inicializarDatos() {
        const archivos = [
            'usuarios', 'administradores', 'publicaciones', 'comentarios',
            'reacciones', 'noticias', 'eventos', 'asistencia', 'notificaciones',
            'peticiones', 'insignias', 'versiculos', 'horarios', 'biblioteca',
            'galeria', 'encuestas', 'podcast', 'chat', 'directorio',
            'estadisticas', 'configuracion', 'logs', 'favoritos', 'metas',
            'misiones', 'testimonios', 'grupos', 'donaciones',
            'reportes', 'reportes_config'
        ];
        
        for (let i = 0; i < archivos.length; i++) {
            const archivo = archivos[i];
            const clave = this._getKey(archivo);
            if (!localStorage.getItem(clave)) {
                const datos = this._crearArchivoPorDefecto(archivo);
                if (datos) {
                    try {
                        this._safeSetItem(clave, JSON.stringify(datos));
                        this.cache[clave] = this._cloneDeep(datos);
                        this.lastCacheUpdate[clave] = Date.now();
                    } catch (e) {}
                }
            }
        }
        this._inicializarDatosPorDefecto();
        this.initialized = true;
        this._registrarLog('inicializar', 'sistema', { version: this.version });
    }

    _inicializarDatosPorDefecto() {
        const insignias = this.cargar('insignias');
        if (!insignias.insignias || insignias.insignias.length === 0) {
            insignias.insignias = [
                { id: 1, nombre: "Nuevo Miembro", icono: "bx-user-plus", color: "#2196f3" },
                { id: 2, nombre: "Miembro Activo", icono: "bx-star", color: "#ff9800" },
                { id: 3, nombre: "Líder", icono: "bx-crown", color: "#ffd700" },
                { id: 4, nombre: "Cuenta Verificada", icono: "bx-badge-check", color: "#2196f3" }
            ];
            insignias.ultimo_id = 4;
            this.guardar('insignias', insignias);
        }

        const versiculos = this.cargar('versiculos');
        if (!versiculos.versiculos || versiculos.versiculos.length === 0) {
            versiculos.versiculos = [
                { id: 1, texto: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito.", referencia: "Juan 3:16" },
                { id: 2, texto: "Jehová es mi pastor; nada me faltará.", referencia: "Salmos 23:1" },
                { id: 3, texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13" }
            ];
            versiculos.ultimo_id = 3;
            this.guardar('versiculos', versiculos);
        }

        const horarios = this.cargar('horarios');
        if (!horarios.cultos || horarios.cultos.length === 0) {
            horarios.cultos = [
                { dia: "Domingo", cultos: [{ nombre: "Culto Dominical", inicio: "10:00", fin: "12:00" }] },
                { dia: "Martes", cultos: [{ nombre: "Culto de Oración", inicio: "18:00", fin: "20:30" }] },
                { dia: "Viernes", cultos: [{ nombre: "Culto de Jóvenes", inicio: "18:00", fin: "20:30" }] }
            ];
            this.guardar('horarios', horarios);
        }

        const config = this.cargar('configuracion');
        if (!config.iglesia || !config.iglesia.nombre) {
            config.iglesia = {
                nombre: "IPUC LA FONDA",
                lema: "Donde el Espíritu Santo se mueve",
                direccion: "Cali, Valle del Cauca, Colombia",
                telefono: "+57 312 881 3818",
                correo: "ipuclafonda@gmail.com"
            };
            config.aplicacion = {
                version: this.version,
                modo_mantenimiento: false,
                registro_abierto: true,
                primer_administrador_creado: false
            };
            this.guardar('configuracion', config);
        }
    }
}

// ============================================
// CREAR INSTANCIA GLOBAL
// ============================================
if (typeof window !== 'undefined') {
    if (!window.db) {
        const db = new Database();
        db.inicializarDatos();
        window.db = db;
    } else {
        if (!window.db.initialized) {
            window.db.inicializarDatos();
        }
    }
    window.Database = Database;
}

console.log('✅ IPUC LA FONDA Database v18.0 PRO ULTIMATE cargada');
console.log('📊 Sistema de datos inicializado correctamente');
console.log('💾 Manejo de cuota de almacenamiento activo');
console.log('📋 Sistema de Reportes integrado');
