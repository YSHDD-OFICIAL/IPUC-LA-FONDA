/* ============================================
   IPUC LA FONDA - DATABASE v18.0 PRO ULTIMATE
   Sistema de Base de Datos en localStorage
   Incluye: Reportes, Moderacion, Anti-Quota
   Gestion completa - Cache inteligente
   Backup automatico - Seguridad
   VERSION CORREGIDA - SIN ERRORES
   ============================================ */

var Database = (function() {
    function Database() {
        this.prefix = 'ipuc18_';
        this.cache = {};
        this.cacheTimeout = 600;
        this.lastCacheUpdate = {};
        this.version = '18.0';
        this.initialized = false;
        this.backupInterval = 300000;
        this._startAutoBackup();
    }

    Database.prototype._getKey = function(name) {
        return this.prefix + name;
    };

    Database.prototype._isValidKey = function(name) {
        return /^[a-zA-Z0-9_-]+$/.test(name);
    };

    Database.prototype._isObject = function(obj) {
        return obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
    };

    Database.prototype._cloneDeep = function(obj) {
        try { return JSON.parse(JSON.stringify(obj)); }
        catch (e) { return obj; }
    };

    Database.prototype._generateId = function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    };

    Database.prototype._safeSetItem = function(clave, valor) {
        try {
            localStorage.setItem(clave, valor);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError' ||
                String(error).indexOf('quota') !== -1 ||
                String(error).indexOf('exceeded') !== -1) {
                this._liberarEspacio();
                try {
                    localStorage.setItem(clave, valor);
                    return true;
                } catch (retryError) {
                    return false;
                }
            }
            return false;
        }
    };

    Database.prototype._liberarEspacio = function() {
        var self = this;
        try {
            var backups = [];
            for (var i = 0; i < localStorage.length; i++) {
                var clave = localStorage.key(i);
                if (clave && clave.indexOf(self.prefix + 'backup_') === 0) {
                    backups.push({ clave: clave, tiempo: self._extraerTiempoBackup(clave) });
                }
            }
            backups.sort(function(a, b) { return b.tiempo - a.tiempo; });
            for (var j = 3; j < backups.length; j++) {
                try { localStorage.removeItem(backups[j].clave); } catch (e) {}
            }

            var colecciones = ['logs', 'notificaciones', 'chat', 'publicaciones', 'comentarios', 'asistencia', 'reportes'];
            var limites = { logs: 25, notificaciones: 50, chat: 100, publicaciones: 50, comentarios: 100, asistencia: 200, reportes: 50 };
            for (var k = 0; k < colecciones.length; k++) {
                var nombre = colecciones[k];
                var key = self._getKey(nombre);
                try {
                    var dataStr = localStorage.getItem(key);
                    if (dataStr) {
                        var data = JSON.parse(dataStr);
                        var cambiado = false;
                        if (nombre === 'logs' && data.logs && data.logs.length > limites[nombre]) {
                            data.logs = data.logs.slice(0, limites[nombre]); cambiado = true;
                        }
                        if (nombre === 'notificaciones' && data.notificaciones && data.notificaciones.length > limites[nombre]) {
                            data.notificaciones = data.notificaciones.slice(0, limites[nombre]); cambiado = true;
                        }
                        if (nombre === 'chat' && data.mensajes && data.mensajes.length > limites[nombre]) {
                            data.mensajes = data.mensajes.slice(-limites[nombre]); cambiado = true;
                        }
                        if (nombre === 'publicaciones' && data.publicaciones && data.publicaciones.length > limites[nombre]) {
                            data.publicaciones = data.publicaciones.slice(0, limites[nombre]).map(function(p) {
                                return { id: p.id, usuario_id: p.usuario_id, autor: p.autor, contenido: (p.contenido || '').substring(0, 500), fecha: p.fecha, reacciones: p.reacciones || {}, comentarios_count: p.comentarios_count || 0, estado: p.estado || 'publicado' };
                            });
                            cambiado = true;
                        }
                        if (nombre === 'comentarios' && data.comentarios && data.comentarios.length > limites[nombre]) {
                            data.comentarios = data.comentarios.slice(-limites[nombre]); cambiado = true;
                        }
                        if (nombre === 'asistencia' && data.registros && data.registros.length > limites[nombre]) {
                            data.registros = data.registros.slice(-limites[nombre]); cambiado = true;
                        }
                        if (nombre === 'reportes' && data.reportes && data.reportes.length > limites[nombre]) {
                            data.reportes = data.reportes.slice(0, limites[nombre]); cambiado = true;
                        }
                        if (cambiado) {
                            localStorage.setItem(key, JSON.stringify(data));
                        }
                    }
                } catch (e) {}
            }
            this.cache = {};
            this.lastCacheUpdate = {};
        } catch (error) {}
    };

    Database.prototype._extraerTiempoBackup = function(clave) {
        try {
            var partes = clave.split('_');
            return new Date(partes[partes.length - 1].replace(/-/g, ':')).getTime() || 0;
        } catch (e) { return 0; }
    };

    Database.prototype.cargar = function(nombreArchivo) {
        if (!this._isValidKey(nombreArchivo)) return null;
        var clave = this._getKey(nombreArchivo);
        if (this.cache[clave] && this.lastCacheUpdate[clave]) {
            if ((Date.now() - this.lastCacheUpdate[clave]) / 1000 < this.cacheTimeout) {
                return this._cloneDeep(this.cache[clave]);
            }
        }
        try {
            var datos = localStorage.getItem(clave);
            if (!datos || datos === 'null' || datos === 'undefined') {
                return this._crearArchivoPorDefecto(nombreArchivo);
            }
            var parsed = JSON.parse(datos);
            this.cache[clave] = this._cloneDeep(parsed);
            this.lastCacheUpdate[clave] = Date.now();
            return parsed;
        } catch (e) {
            var backup = this._recuperarRespaldo(nombreArchivo);
            if (backup) { this.cache[clave] = this._cloneDeep(backup); this.lastCacheUpdate[clave] = Date.now(); return backup; }
            return this._crearArchivoPorDefecto(nombreArchivo);
        }
    };

    Database.prototype.guardar = function(nombreArchivo, datos) {
        if (!this._isValidKey(nombreArchivo) || !this._isObject(datos)) return false;
        var clave = this._getKey(nombreArchivo);
        try {
            var datosAnteriores = localStorage.getItem(clave);
            if (datosAnteriores) this._crearRespaldo(nombreArchivo, datosAnteriores);
            var guardado = this._safeSetItem(clave, JSON.stringify(datos));
            if (guardado) {
                this.cache[clave] = this._cloneDeep(datos);
                this.lastCacheUpdate[clave] = Date.now();
                this._registrarLog('guardar', nombreArchivo);
                return true;
            }
            return false;
        } catch (error) { return false; }
    };

    Database.prototype.eliminar = function(nombreArchivo, id) {
        if (!this._isValidKey(nombreArchivo) || !id) return false;
        var coleccion = this.cargar(nombreArchivo);
        if (!coleccion) return false;
        var encontrado = false;
        var keys = Object.keys(coleccion);
        for (var i = 0; i < keys.length; i++) {
            var value = coleccion[keys[i]];
            if (Array.isArray(value)) {
                var filtered = value.filter(function(item) { return item.id !== id; });
                if (filtered.length !== value.length) { coleccion[keys[i]] = filtered; encontrado = true; break; }
            }
        }
        if (!encontrado) return false;
        this._registrarLog('eliminar', nombreArchivo, { id: id });
        return this.guardar(nombreArchivo, coleccion);
    };

    Database.prototype._crearRespaldo = function(nombreArchivo, datosAnteriores) {
        try {
            var timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            this._safeSetItem(this.prefix + 'backup_' + nombreArchivo + '_' + timestamp, datosAnteriores);
            this._limpiarRespaldosAntiguos(nombreArchivo, 3);
        } catch (e) {}
    };

    Database.prototype._limpiarRespaldosAntiguos = function(nombreArchivo, maxRespaldos) {
        try {
            var respaldos = [];
            for (var i = 0; i < localStorage.length; i++) {
                var clave = localStorage.key(i);
                if (clave && clave.indexOf(this.prefix + 'backup_' + nombreArchivo + '_') === 0) respaldos.push(clave);
            }
            respaldos.sort(function(a, b) { return b.localeCompare(a); });
            for (var j = maxRespaldos; j < respaldos.length; j++) localStorage.removeItem(respaldos[j]);
        } catch (e) {}
    };

    Database.prototype._recuperarRespaldo = function(nombreArchivo) {
        try {
            var respaldos = [];
            for (var i = 0; i < localStorage.length; i++) {
                var clave = localStorage.key(i);
                if (clave && clave.indexOf(this.prefix + 'backup_' + nombreArchivo + '_') === 0) respaldos.push(clave);
            }
            respaldos.sort(function(a, b) { return b.localeCompare(a); });
            for (var j = 0; j < respaldos.length; j++) {
                try {
                    var datos = localStorage.getItem(respaldos[j]);
                    if (datos) { var parsed = JSON.parse(datos); this.guardar(nombreArchivo, parsed); return parsed; }
                } catch (e) {}
            }
            return null;
        } catch (e) { return null; }
    };

    Database.prototype._startAutoBackup = function() {
        var self = this;
        setInterval(function() {
            try {
                var archivos = self._getAllCollectionNames();
                for (var i = 0; i < archivos.length; i++) {
                    var datos = self.cargar(archivos[i]);
                    if (datos) self._crearRespaldo(archivos[i], JSON.stringify(datos));
                }
            } catch (e) {}
        }, this.backupInterval);
    };

    Database.prototype._registrarLog = function(accion, nombreArchivo, detalles) {
        try {
            detalles = detalles || {};
            var logs = this.cargar('logs') || { logs: [], ultimo_id: 0 };
            var nuevoLog = {
                id: (logs.logs && logs.logs.length || 0) + 1,
                accion: accion, nombreArchivo: nombreArchivo, detalles: detalles,
                fecha: new Date().toISOString(), usuario: detalles.usuario || 'sistema'
            };
            if (!logs.logs) logs.logs = [];
            logs.logs.unshift(nuevoLog);
            logs.ultimo_id = nuevoLog.id;
            if (logs.logs.length > 100) logs.logs = logs.logs.slice(0, 100);
            this.guardar('logs', logs);
        } catch (e) {}
    };

    Database.prototype._crearArchivoPorDefecto = function(nombreArchivo) {
        var datosPorDefecto = {
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
            'reportes_config': { max_pendientes: 50, tiempo_resolucion: 72, niveles_urgencia: ['baja', 'media', 'alta', 'critica'], estados: ['pendiente', 'en_revision', 'resuelto', 'desestimado'], tipos: ['usuario', 'contenido', 'asistencia', 'financiero', 'ministerio'] }
        };
        if (datosPorDefecto[nombreArchivo]) {
            var clave = this._getKey(nombreArchivo);
            if (localStorage.getItem(clave)) { try { return JSON.parse(localStorage.getItem(clave)); } catch (e) {} }
            try { var datos = datosPorDefecto[nombreArchivo]; this._safeSetItem(clave, JSON.stringify(datos)); this.cache[clave] = this._cloneDeep(datos); this.lastCacheUpdate[clave] = Date.now(); return datos; }
            catch (e) { return datosPorDefecto[nombreArchivo]; }
        }
        return { datos: [], ultimo_id: 0 };
    };

    Database.prototype._getAllCollectionNames = function() {
        var collections = [];
        for (var i = 0; i < localStorage.length; i++) {
            var clave = localStorage.key(i);
            if (clave && clave.indexOf(this.prefix) === 0 && clave.indexOf('backup_') === -1) {
                var name = clave.replace(this.prefix, '');
                if (name.indexOf('backup_') === -1) collections.push(name);
            }
        }
        return collections;
    };

    Database.prototype.hashPassword = function(password) {
        if (!password || typeof password !== 'string') return '00000000';
        var hash = 0, salt = 'ipuc18_salt_2026', str = password + salt;
        for (var i = 0; i < str.length; i++) { var char = str.charCodeAt(i); hash = ((hash << 5) - hash) + char; hash = hash & hash; }
        return Math.abs(hash).toString(16).padStart(8, '0');
    };

    Database.prototype.verificarPassword = function(password, hash) {
        return this.hashPassword(password) === hash;
    };

    Database.prototype._validarCorreo = function(correo) { return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correo); };
    Database.prototype._validarUsuario = function(usuario) { return /^[a-zA-Z0-9_]{3,20}$/.test(usuario); };
    Database.prototype._validarTelefono = function(telefono) { return /^[0-9]{10,15}$/.test(telefono); };
    Database.prototype._validarPassword = function(password) { return password && password.length >= 8; };

    Database.prototype.crearPrimerAdministrador = function(datos) {
        try {
            var admins = this.cargar('administradores');
            if (admins && admins.administradores && admins.administradores.length > 0) return { success: false, error: 'Ya existe un administrador' };
            if (!datos.nombre || !datos.apellidos || !datos.correo || !datos.usuario || !datos.password) return { success: false, error: 'Campos obligatorios faltantes' };
            if (!this._validarCorreo(datos.correo)) return { success: false, error: 'Correo invalido' };
            if (!this._validarUsuario(datos.usuario)) return { success: false, error: 'Usuario invalido' };
            if (!this._validarPassword(datos.password)) return { success: false, error: 'Contrasena minima 8 caracteres' };
            var admin = { id: 1, nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(), correo: datos.correo.trim().toLowerCase(), celular: (datos.celular || '').trim(), usuario: datos.usuario.trim().toLowerCase(), password: this.hashPassword(datos.password), foto: datos.foto || 'assets/avatars/admin.png', rol: 'admin', verificado: true, fecha_registro: new Date().toISOString(), estado: 'activo', ministerio: datos.ministerio || 'Pastoral', insignias: ['Administrador', 'Cuenta Verificada'] };
            if (!admins.administradores) admins.administradores = [];
            admins.administradores.push(admin); admins.ultimo_id = 1;
            if (this.guardar('administradores', admins)) {
                var cfg = this.cargar('configuracion');
                if (cfg && cfg.aplicacion) { cfg.aplicacion.primer_administrador_creado = true; this.guardar('configuracion', cfg); }
                return { success: true, data: admin };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.login = function(usuario, password, recordar) {
        try {
            recordar = recordar || false;
            if (!usuario || !password) return { success: false, error: 'Usuario y contrasena requeridos' };
            var hash = this.hashPassword(password);
            var admins = this.cargar('administradores');
            if (admins && admins.administradores) {
                for (var i = 0; i < admins.administradores.length; i++) {
                    var a = admins.administradores[i];
                    if ((a.usuario === usuario || a.correo === usuario) && a.password === hash) {
                        if (a.estado !== 'activo') return { success: false, error: 'Cuenta desactivada' };
                        var token = 't18_' + Date.now() + '_' + this._generateId();
                        if (recordar) this._guardarSesion(token, a, 'admin');
                        return { success: true, token: token, rol: 'admin', usuario: { id: a.id, nombre: a.nombre, apellidos: a.apellidos, correo: a.correo, usuario: a.usuario, rol: a.rol, foto: a.foto, verificado: a.verificado, ministerio: a.ministerio } };
                    }
                }
            }
            var usuarios = this.cargar('usuarios');
            if (usuarios && usuarios.usuarios) {
                for (var j = 0; j < usuarios.usuarios.length; j++) {
                    var u = usuarios.usuarios[j];
                    if ((u.usuario === usuario || u.correo === usuario) && u.password === hash) {
                        if (u.estado !== 'activo') return { success: false, error: 'Cuenta desactivada' };
                        var tokenU = 't18_' + Date.now() + '_' + this._generateId();
                        if (recordar) this._guardarSesion(tokenU, u, 'usuario');
                        return { success: true, token: tokenU, rol: 'usuario', usuario: { id: u.id, nombre: u.nombre, apellidos: u.apellidos, correo: u.correo, usuario: u.usuario, rol: u.rol, foto: u.foto, verificado: u.verificado, ministerio: u.ministerio, celular: u.celular } };
                    }
                }
            }
            return { success: false, error: 'Credenciales invalidas' };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype._guardarSesion = function(token, usuario, rol) {
        try { this._safeSetItem(this.prefix + 'session', JSON.stringify({ token: token, usuario: usuario, rol: rol, fecha: new Date().toISOString(), expira: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })); } catch (e) {}
    };

    Database.prototype.getSesion = function() {
        try {
            var datos = localStorage.getItem(this.prefix + 'session');
            if (!datos) return null;
            var sesion = JSON.parse(datos);
            if (new Date(sesion.expira) < new Date()) { localStorage.removeItem(this.prefix + 'session'); return null; }
            return sesion;
        } catch (e) { return null; }
    };

    Database.prototype.cerrarSesion = function() {
        try { localStorage.removeItem(this.prefix + 'session'); return { success: true }; } catch (e) { return { success: false }; }
    };

    Database.prototype.registrarUsuario = function(datos) {
        try {
            var campos = ['nombre', 'apellidos', 'documento', 'fecha_nacimiento', 'sexo', 'correo', 'celular', 'usuario', 'password', 'ministerio'];
            for (var i = 0; i < campos.length; i++) { if (!datos[campos[i]] || !String(datos[campos[i]]).trim()) return { success: false, error: "El campo '" + campos[i] + "' es obligatorio" }; }
            if (!this._validarCorreo(datos.correo)) return { success: false, error: 'Correo invalido' };
            if (!this._validarUsuario(datos.usuario)) return { success: false, error: 'Usuario invalido' };
            if (!this._validarTelefono(datos.celular)) return { success: false, error: 'Celular invalido' };
            if (!this._validarPassword(datos.password)) return { success: false, error: 'Contrasena minima 8 caracteres' };
            var usuarios = this.cargar('usuarios');
            if (usuarios && usuarios.usuarios) {
                for (var j = 0; j < usuarios.usuarios.length; j++) {
                    if (String(usuarios.usuarios[j].documento) === String(datos.documento)) return { success: false, error: 'Documento ya registrado' };
                    if (usuarios.usuarios[j].correo && usuarios.usuarios[j].correo.toLowerCase() === datos.correo.toLowerCase()) return { success: false, error: 'Correo ya registrado' };
                    if (usuarios.usuarios[j].usuario && usuarios.usuarios[j].usuario.toLowerCase() === datos.usuario.toLowerCase()) return { success: false, error: 'Usuario ya existe' };
                }
            }
            var nuevo = { id: (usuarios && usuarios.usuarios ? usuarios.usuarios.length : 0) + 1, nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(), documento: datos.documento.trim(), fecha_nacimiento: datos.fecha_nacimiento, sexo: datos.sexo, correo: datos.correo.trim().toLowerCase(), celular: datos.celular.trim(), direccion: (datos.direccion || '').trim(), ministerio: datos.ministerio, usuario: datos.usuario.trim().toLowerCase(), password: this.hashPassword(datos.password), foto: datos.foto || 'assets/avatars/default.png', rol: 'usuario', verificado: false, fecha_registro: new Date().toISOString(), estado: 'activo', insignias: ['Nuevo Miembro'] };
            if (!usuarios.usuarios) usuarios.usuarios = [];
            usuarios.usuarios.push(nuevo); usuarios.ultimo_id = nuevo.id;
            if (this.guardar('usuarios', usuarios)) { this._agregarNotificacion({ titulo: 'Nuevo miembro', mensaje: nuevo.nombre + ' se ha unido', tipo: 'usuario' }); return { success: true, data: { id: nuevo.id, nombre: nuevo.nombre, usuario: nuevo.usuario } }; }
            return { success: false, error: 'Error al guardar' };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.getPublicaciones = function(limit, offset) {
        limit = limit || 100; offset = offset || 0;
        var pub = this.cargar('publicaciones');
        return (pub && pub.publicaciones || []).slice(offset, offset + limit);
    };

    Database.prototype.addPublicacion = function(datos) {
        try {
            if (!datos.usuario_id || !datos.autor || !datos.contenido) return { success: false, error: 'Datos incompletos' };
            var publicaciones = this.cargar('publicaciones');
            var nueva = { id: this._generateId(), usuario_id: datos.usuario_id, autor: datos.autor, usuario: datos.usuario || 'usuario', foto_autor: datos.foto_autor || 'assets/avatars/default.png', verificado: datos.verificado || false, contenido: datos.contenido.trim().substring(0, 2000), imagen: datos.imagen || '', fecha: new Date().toISOString(), reacciones: { amen: 0, me_gusta: 0, fuego: 0, orando: 0, bendicion: 0 }, comentarios_count: 0, estado: 'publicado' };
            if (!publicaciones.publicaciones) publicaciones.publicaciones = [];
            publicaciones.publicaciones.unshift(nueva);
            if (publicaciones.publicaciones.length > 100) publicaciones.publicaciones = publicaciones.publicaciones.slice(0, 100);
            publicaciones.ultimo_id = nueva.id;
            if (this.guardar('publicaciones', publicaciones)) { this._agregarNotificacion({ titulo: 'Nueva publicacion', mensaje: datos.autor + ' ha publicado', tipo: 'publicacion' }); return { success: true, data: nueva }; }
            return { success: false, error: 'Error al guardar' };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.deletePublicacion = function(id) {
        try {
            var publicaciones = this.cargar('publicaciones');
            if (!publicaciones || !publicaciones.publicaciones) return { success: false };
            publicaciones.publicaciones = publicaciones.publicaciones.filter(function(p) { return p.id !== id; });
            this.guardar('publicaciones', publicaciones);
            return { success: true };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.getComentarios = function(publicacionId) {
        var comentarios = this.cargar('comentarios');
        var lista = (comentarios && comentarios.comentarios) ? comentarios.comentarios : [];
        if (publicacionId) return lista.filter(function(c) { return c.publicacion_id === publicacionId; });
        return lista;
    };

    Database.prototype.addComentario = function(datos) {
        try {
            if (!datos.publicacion_id || !datos.usuario_id || !datos.autor || !datos.contenido) return { success: false, error: 'Datos incompletos' };
            var comentarios = this.cargar('comentarios');
            var nuevo = { id: this._generateId(), publicacion_id: datos.publicacion_id, usuario_id: datos.usuario_id, autor: datos.autor, contenido: datos.contenido.trim().substring(0, 1000), fecha: new Date().toISOString(), estado: 'activo' };
            if (!comentarios.comentarios) comentarios.comentarios = [];
            comentarios.comentarios.push(nuevo);
            if (comentarios.comentarios.length > 500) comentarios.comentarios = comentarios.comentarios.slice(-500);
            comentarios.ultimo_id = nuevo.id;
            this.guardar('comentarios', comentarios);
            return { success: true, data: nuevo };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.toggleReaccion = function(publicacionId, usuarioId, tipo) {
        try {
            if (!publicacionId || !usuarioId || !tipo) return { success: false };
            var tiposValidos = ['amen', 'me_gusta', 'fuego', 'orando', 'bendicion'];
            if (tiposValidos.indexOf(tipo) === -1) return { success: false };
            var reacciones = this.cargar('reacciones');
            if (!reacciones.reacciones) reacciones.reacciones = {};
            var clave = publicacionId + '_' + usuarioId;
            var actual = reacciones.reacciones[clave];
            var publicaciones = this.cargar('publicaciones');
            if (!publicaciones || !publicaciones.publicaciones) return { success: false };
            var pub = publicaciones.publicaciones.find(function(p) { return p.id === publicacionId; });
            if (!pub) return { success: false };
            if (actual === tipo) { delete reacciones.reacciones[clave]; if (pub.reacciones && pub.reacciones[tipo] > 0) pub.reacciones[tipo]--; }
            else { if (actual && pub.reacciones && pub.reacciones[actual] > 0) pub.reacciones[actual]--; reacciones.reacciones[clave] = tipo; if (!pub.reacciones) pub.reacciones = { amen: 0, me_gusta: 0, fuego: 0, orando: 0, bendicion: 0 }; pub.reacciones[tipo] = (pub.reacciones[tipo] || 0) + 1; }
            this.guardar('reacciones', reacciones); this.guardar('publicaciones', publicaciones);
            return { success: true };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.getNoticias = function(limit) {
        limit = limit || 50;
        var noticias = this.cargar('noticias');
        return (noticias && noticias.noticias || []).slice(0, limit);
    };

    Database.prototype.addNoticia = function(datos) {
        try {
            if (!datos.titulo || !datos.contenido) return { success: false, error: 'Titulo y contenido requeridos' };
            var noticias = this.cargar('noticias');
            var nueva = { id: this._generateId(), titulo: datos.titulo.trim(), contenido: datos.contenido.trim().substring(0, 5000), resumen: datos.resumen || datos.contenido.trim().substring(0, 150), autor_nombre: datos.autor_nombre || 'Admin', fecha_publicacion: new Date().toISOString(), estado: 'publicado' };
            if (!noticias.noticias) noticias.noticias = [];
            noticias.noticias.unshift(nueva);
            if (noticias.noticias.length > 100) noticias.noticias = noticias.noticias.slice(0, 100);
            noticias.ultimo_id = nueva.id;
            this.guardar('noticias', noticias);
            return { success: true, data: nueva };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.getEventos = function(filtros) {
        filtros = filtros || {};
        var eventos = this.cargar('eventos');
        var lista = (eventos && eventos.eventos) ? eventos.eventos : [];
        if (filtros.estado) lista = lista.filter(function(e) { return e.estado === filtros.estado; });
        return lista.sort(function(a, b) { return new Date(a.fecha) - new Date(b.fecha); });
    };

    Database.prototype.addEvento = function(datos) {
        try {
            if (!datos.titulo || !datos.fecha) return { success: false, error: 'Titulo y fecha requeridos' };
            var eventos = this.cargar('eventos');
            var nuevo = { id: this._generateId(), titulo: datos.titulo.trim(), descripcion: datos.descripcion || '', fecha: datos.fecha, hora_inicio: datos.hora_inicio || '', lugar: datos.lugar || 'IPUC LA FONDA', fecha_creacion: new Date().toISOString(), estado: 'programado' };
            if (!eventos.eventos) eventos.eventos = [];
            eventos.eventos.push(nuevo);
            if (eventos.eventos.length > 200) eventos.eventos = eventos.eventos.slice(-200);
            eventos.ultimo_id = nuevo.id;
            this.guardar('eventos', eventos);
            return { success: true, data: nuevo };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.getAsistencia = function(filtros) {
        filtros = filtros || {};
        var asistencia = this.cargar('asistencia');
        var registros = (asistencia && asistencia.registros) ? asistencia.registros : [];
        if (filtros.usuario_id) registros = registros.filter(function(r) { return r.usuario_id === filtros.usuario_id; });
        return registros;
    };

    Database.prototype.addAsistencia = function(datos) {
        try {
            if (!datos.usuario_id || !datos.nombre) return { success: false, error: 'Datos incompletos' };
            var asistencia = this.cargar('asistencia');
            var nuevo = { id: this._generateId(), usuario_id: datos.usuario_id, nombre: datos.nombre.trim(), fecha: datos.fecha || new Date().toISOString().split('T')[0], hora: datos.hora || new Date().toLocaleTimeString('es-CO'), estado: datos.estado || 'Asistire', tipo: datos.tipo || 'Hermano', creado: new Date().toISOString() };
            if (!asistencia.registros) asistencia.registros = [];
            asistencia.registros.push(nuevo);
            if (asistencia.registros.length > 500) asistencia.registros = asistencia.registros.slice(-500);
            asistencia.ultimo_id = nuevo.id;
            this.guardar('asistencia', asistencia);
            return { success: true, data: nuevo };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.getPeticiones = function(filtros) {
        filtros = filtros || {};
        var peticiones = this.cargar('peticiones');
        var lista = (peticiones && peticiones.peticiones) ? peticiones.peticiones : [];
        if (filtros.estado) lista = lista.filter(function(p) { return p.estado === filtros.estado; });
        return lista.sort(function(a, b) { return new Date(b.fecha) - new Date(a.fecha); });
    };

    Database.prototype.addPeticion = function(datos) {
        try {
            if (!datos.usuario_id || !datos.nombre || !datos.motivo) return { success: false, error: 'Datos incompletos' };
            var peticiones = this.cargar('peticiones');
            var nueva = { id: this._generateId(), usuario_id: datos.usuario_id, nombre: datos.nombre.trim(), motivo: datos.motivo.trim(), descripcion: datos.descripcion || '', fecha: new Date().toISOString(), estado: 'activa', oraciones: 0 };
            if (!peticiones.peticiones) peticiones.peticiones = [];
            peticiones.peticiones.unshift(nueva);
            if (peticiones.peticiones.length > 200) peticiones.peticiones = peticiones.peticiones.slice(0, 200);
            peticiones.ultimo_id = nueva.id;
            this.guardar('peticiones', peticiones);
            return { success: true, data: nueva };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.orarPeticion = function(id) {
        try {
            var peticiones = this.cargar('peticiones');
            if (!peticiones || !peticiones.peticiones) return { success: false };
            var peticion = peticiones.peticiones.find(function(p) { return p.id === id; });
            if (!peticion) return { success: false };
            peticion.oraciones = (peticion.oraciones || 0) + 1;
            this.guardar('peticiones', peticiones);
            return { success: true };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.getEncuestas = function() {
        var encuestas = this.cargar('encuestas');
        return (encuestas && encuestas.encuestas) ? encuestas.encuestas : [];
    };

    Database.prototype.addEncuesta = function(datos) {
        try {
            if (!datos.titulo) return { success: false, error: 'Titulo requerido' };
            var encuestas = this.cargar('encuestas');
            var nueva = { id: this._generateId(), titulo: datos.titulo.trim(), preguntas: datos.preguntas || [], fecha: new Date().toISOString(), activa: true, votos: {}, total_votos: 0 };
            if (!encuestas.encuestas) encuestas.encuestas = [];
            encuestas.encuestas.push(nueva); encuestas.ultimo_id = nueva.id;
            this.guardar('encuestas', encuestas);
            return { success: true, data: nueva };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.getRecursos = function() {
        var biblioteca = this.cargar('biblioteca');
        return (biblioteca && biblioteca.recursos) ? biblioteca.recursos : [];
    };

    Database.prototype.addRecurso = function(datos) {
        try {
            if (!datos.titulo || !datos.autor) return { success: false, error: 'Titulo y autor requeridos' };
            var biblioteca = this.cargar('biblioteca');
            var nuevo = { id: this._generateId(), titulo: datos.titulo.trim(), autor: datos.autor.trim(), categoria: datos.categoria || 'General', fecha: new Date().toISOString() };
            if (!biblioteca.recursos) biblioteca.recursos = [];
            biblioteca.recursos.push(nuevo); biblioteca.ultimo_id = nuevo.id;
            this.guardar('biblioteca', biblioteca);
            return { success: true, data: nuevo };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.getAlbumes = function() { var g = this.cargar('galeria'); return (g && g.albumes) ? g.albumes : []; };
    Database.prototype.getPodcast = function() { var p = this.cargar('podcast'); return (p && p.episodios) ? p.episodios : []; };

    Database.prototype.addPodcast = function(datos) {
        try {
            if (!datos.titulo || !datos.pastor) return { success: false, error: 'Titulo y pastor requeridos' };
            var podcast = this.cargar('podcast');
            var nuevo = { id: this._generateId(), titulo: datos.titulo.trim(), pastor: datos.pastor.trim(), duracion: datos.duracion || '30 min', fecha: new Date().toISOString() };
            if (!podcast.episodios) podcast.episodios = [];
            podcast.episodios.push(nuevo); podcast.ultimo_id = nuevo.id;
            this.guardar('podcast', podcast);
            return { success: true, data: nuevo };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.getMensajes = function(limit) {
        limit = limit || 100;
        var chat = this.cargar('chat');
        return ((chat && chat.mensajes) ? chat.mensajes : []).slice(-limit);
    };

    Database.prototype.addMensaje = function(datos) {
        try {
            if (!datos.usuario || !datos.usuario_id || !datos.mensaje) return { success: false, error: 'Datos incompletos' };
            var chat = this.cargar('chat');
            var nuevo = { id: this._generateId(), usuario: datos.usuario, usuario_id: datos.usuario_id, mensaje: datos.mensaje.trim().substring(0, 500), fecha: new Date().toISOString() };
            if (!chat.mensajes) chat.mensajes = [];
            chat.mensajes.push(nuevo);
            if (chat.mensajes.length > 200) chat.mensajes = chat.mensajes.slice(-200);
            chat.ultimo_id = nuevo.id;
            this.guardar('chat', chat);
            return { success: true, data: nuevo };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.getDirectorio = function() { var d = this.cargar('directorio'); return (d && d.miembros) ? d.miembros : []; };

    Database.prototype.getNotificaciones = function(limit) {
        limit = limit || 50;
        var n = this.cargar('notificaciones');
        return (n && n.notificaciones || []).slice(0, limit);
    };

    Database.prototype._agregarNotificacion = function(datos) {
        try {
            var notificaciones = this.cargar('notificaciones');
            var nueva = { id: this._generateId(), titulo: datos.titulo, mensaje: datos.mensaje, fecha: new Date().toISOString(), leida: false, tipo: datos.tipo || 'general' };
            if (!notificaciones.notificaciones) notificaciones.notificaciones = [];
            notificaciones.notificaciones.unshift(nueva);
            if (notificaciones.notificaciones.length > 100) notificaciones.notificaciones = notificaciones.notificaciones.slice(0, 100);
            notificaciones.ultimo_id = nueva.id;
            this.guardar('notificaciones', notificaciones);
        } catch (e) {}
    };

    Database.prototype.getNoLeidas = function() {
        var notif = this.getNotificaciones(), count = 0;
        for (var i = 0; i < notif.length; i++) { if (!notif[i].leida) count++; }
        return count;
    };

    // ============================================
    // SISTEMA DE REPORTES
    // ============================================

    Database.prototype.getReportes = function(filtros) {
        filtros = filtros || {};
        var reportes = this.cargar('reportes');
        var lista = (reportes && reportes.reportes) ? reportes.reportes : [];
        if (filtros.estado) lista = lista.filter(function(r) { return r.estado === filtros.estado; });
        if (filtros.tipo) lista = lista.filter(function(r) { return r.tipo === filtros.tipo; });
        if (filtros.urgencia) lista = lista.filter(function(r) { return r.urgencia === filtros.urgencia; });
        return lista.sort(function(a, b) { return new Date(b.fecha) - new Date(a.fecha); });
    };

    Database.prototype.getReporte = function(id) {
        var r = this.cargar('reportes');
        return (r && r.reportes) ? r.reportes.find(function(x) { return x.id === id; }) || null : null;
    };

    Database.prototype.getReportesPendientes = function() { return this.getReportes({ estado: 'pendiente' }); };

    Database.prototype.addReporte = function(datos) {
        try {
            if (!datos.tipo || !datos.reportado_por || !datos.descripcion) return { success: false, error: 'Datos incompletos' };
            var tiposValidos = ['usuario', 'contenido', 'asistencia', 'financiero', 'ministerio'];
            if (tiposValidos.indexOf(datos.tipo) === -1) return { success: false, error: 'Tipo invalido' };
            var reportes = this.cargar('reportes');
            var nuevo = { id: this._generateId(), tipo: datos.tipo, reportado_por: { id: datos.reportado_por.id, nombre: datos.reportado_por.nombre, email: datos.reportado_por.email || '' }, usuario_reportado: datos.usuario_reportado || null, descripcion: datos.descripcion.trim().substring(0, 2000), motivo: datos.motivo || '', urgencia: datos.urgencia || 'baja', estado: 'pendiente', fecha: new Date().toISOString(), fecha_resolucion: null, notas_admin: '', historial: [{ estado: 'pendiente', fecha: new Date().toISOString(), usuario: datos.reportado_por.nombre, comentario: 'Reporte creado' }] };
            if (!reportes.reportes) reportes.reportes = [];
            reportes.reportes.unshift(nuevo);
            if (reportes.reportes.length > 100) reportes.reportes = reportes.reportes.slice(0, 100);
            reportes.ultimo_id = nuevo.id;
            if (this.guardar('reportes', reportes)) { this._agregarNotificacion({ titulo: 'Nuevo reporte', mensaje: 'Reporte #' + nuevo.id.substring(0, 8), tipo: 'reporte' }); return { success: true, data: nuevo }; }
            return { success: false, error: 'Error al guardar' };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.cambiarEstadoReporte = function(id, nuevoEstado, usuarioAdmin, comentario) {
        try {
            usuarioAdmin = usuarioAdmin || 'Admin'; comentario = comentario || '';
            var estadosValidos = ['pendiente', 'en_revision', 'resuelto', 'desestimado'];
            if (estadosValidos.indexOf(nuevoEstado) === -1) return { success: false, error: 'Estado invalido' };
            var reportes = this.cargar('reportes');
            if (!reportes || !reportes.reportes) return { success: false };
            var reporte = reportes.reportes.find(function(r) { return r.id === id; });
            if (!reporte) return { success: false, error: 'No encontrado' };
            var anterior = reporte.estado;
            reporte.estado = nuevoEstado;
            if (nuevoEstado === 'resuelto' || nuevoEstado === 'desestimado') reporte.fecha_resolucion = new Date().toISOString();
            if (!reporte.historial) reporte.historial = [];
            reporte.historial.push({ estado: nuevoEstado, fecha: new Date().toISOString(), usuario: usuarioAdmin, comentario: comentario || 'Cambio: ' + anterior + ' -> ' + nuevoEstado });
            this.guardar('reportes', reportes);
            return { success: true, data: reporte };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.deleteReporte = function(id) {
        try {
            var reportes = this.cargar('reportes');
            if (reportes && reportes.reportes) { reportes.reportes = reportes.reportes.filter(function(r) { return r.id !== id; }); this.guardar('reportes', reportes); }
            return { success: true };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.getEstadisticasReportes = function() {
        var lista = (this.cargar('reportes') || {}).reportes || [];
        return { total: lista.length, pendientes: lista.filter(function(r) { return r.estado === 'pendiente'; }).length, en_revision: lista.filter(function(r) { return r.estado === 'en_revision'; }).length, resueltos: lista.filter(function(r) { return r.estado === 'resuelto'; }).length };
    };

    Database.prototype.getEstadisticas = function() {
        return { usuarios: 0, publicaciones: this.getPublicaciones().length, noticias: this.getNoticias().length, eventos: this.getEventos().length, reportes_pendientes: this.getReportesPendientes().length };
    };

    Database.prototype.getConfiguracion = function() { return this.cargar('configuracion'); };
    Database.prototype.getConfiguracionIglesia = function() { var c = this.getConfiguracion(); return (c && c.iglesia) ? c.iglesia : {}; };
    Database.prototype.getHorarios = function() { var h = this.cargar('horarios'); return (h && h.cultos) ? h.cultos : []; };
    Database.prototype.getVersiculos = function() { var v = this.cargar('versiculos'); return (v && v.versiculos) ? v.versiculos : []; };
    Database.prototype.getDonaciones = function() { var d = this.cargar('donaciones'); return (d && d.donaciones) ? d.donaciones : []; };

    Database.prototype.addDonacion = function(datos) {
        try {
            if (!datos.usuario_id || !datos.monto) return { success: false, error: 'Datos incompletos' };
            var donaciones = this.cargar('donaciones');
            var nueva = { id: this._generateId(), usuario_id: datos.usuario_id, usuario_nombre: datos.usuario_nombre || 'Anonimo', monto: datos.monto, metodo: datos.metodo || 'Efectivo', concepto: datos.concepto || 'Ofrenda', fecha: new Date().toISOString() };
            if (!donaciones.donaciones) donaciones.donaciones = [];
            donaciones.donaciones.push(nueva); donaciones.ultimo_id = nueva.id;
            this.guardar('donaciones', donaciones);
            return { success: true, data: nueva };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.exportarTodo = function() {
        var datos = {};
        for (var i = 0; i < localStorage.length; i++) { var clave = localStorage.key(i); if (clave && clave.indexOf(this.prefix) === 0) { try { datos[clave] = JSON.parse(localStorage.getItem(clave)); } catch (e) {} } }
        return { version: this.version, fecha: new Date().toISOString(), datos: datos };
    };

    Database.prototype.limpiarTodo = function() {
        try {
            var keys = [];
            for (var i = 0; i < localStorage.length; i++) { var clave = localStorage.key(i); if (clave && clave.indexOf(this.prefix) === 0) keys.push(clave); }
            for (var j = 0; j < keys.length; j++) localStorage.removeItem(keys[j]);
            this.cache = {}; this.lastCacheUpdate = {};
            return { success: true };
        } catch (error) { return { success: false, error: 'Error: ' + error.message }; }
    };

    Database.prototype.inicializarDatos = function() {
        var archivos = ['usuarios', 'administradores', 'publicaciones', 'comentarios', 'reacciones', 'noticias', 'eventos', 'asistencia', 'notificaciones', 'peticiones', 'insignias', 'versiculos', 'horarios', 'biblioteca', 'galeria', 'encuestas', 'podcast', 'chat', 'directorio', 'estadisticas', 'configuracion', 'logs', 'favoritos', 'metas', 'misiones', 'testimonios', 'grupos', 'donaciones', 'reportes', 'reportes_config'];
        for (var i = 0; i < archivos.length; i++) {
            var clave = this._getKey(archivos[i]);
            if (!localStorage.getItem(clave)) { var datos = this._crearArchivoPorDefecto(archivos[i]); if (datos) { try { this._safeSetItem(clave, JSON.stringify(datos)); this.cache[clave] = this._cloneDeep(datos); this.lastCacheUpdate[clave] = Date.now(); } catch (e) {} } }
        }
        this._inicializarDatosPorDefecto();
        this.initialized = true;
    };

    Database.prototype._inicializarDatosPorDefecto = function() {
        var insignias = this.cargar('insignias');
        if (!insignias.insignias || insignias.insignias.length === 0) { insignias.insignias = [{ id: 1, nombre: "Nuevo Miembro", icono: "bx-user-plus", color: "#2196f3" }, { id: 2, nombre: "Miembro Activo", icono: "bx-star", color: "#ff9800" }]; insignias.ultimo_id = 2; this.guardar('insignias', insignias); }
        var versiculos = this.cargar('versiculos');
        if (!versiculos.versiculos || versiculos.versiculos.length === 0) { versiculos.versiculos = [{ id: 1, texto: "Porque de tal manera amo Dios al mundo...", referencia: "Juan 3:16" }, { id: 2, texto: "Jehova es mi pastor; nada me faltara.", referencia: "Salmos 23:1" }]; versiculos.ultimo_id = 2; this.guardar('versiculos', versiculos); }
        var horarios = this.cargar('horarios');
        if (!horarios.cultos || horarios.cultos.length === 0) { horarios.cultos = [{ dia: "Domingo", cultos: [{ nombre: "Culto Dominical", inicio: "10:00", fin: "12:00" }] }]; this.guardar('horarios', horarios); }
        var config = this.cargar('configuracion');
        if (!config.iglesia || !config.iglesia.nombre) { config.iglesia = { nombre: "IPUC LA FONDA", lema: "Donde el Espiritu Santo se mueve" }; config.aplicacion = { version: this.version, registro_abierto: true }; this.guardar('configuracion', config); }
    };

    return Database;
})();

// Crear instancia global
if (typeof window !== 'undefined') {
    if (!window.db) {
        window.db = new Database();
        window.db.inicializarDatos();
    }
    window.Database = Database;
}
