/* ============================================
   IPUC LA FONDA - DATABASE v20.0 PRO ULTIMATE
   Sistema de Base de Datos en localStorage
   Incluye: Radio, Streaming, Gamificación, Logros, QR, Asistente
   VERSION CORREGIDA - SIN ERRORES
   ============================================ */

var Database = (function() {
    function Database() {
        this.prefix = 'ipuc20_';
        this.cache = {};
        this.cacheTimeout = 600;
        this.lastCacheUpdate = {};
        this.version = '20.0';
        this.versionName = 'PRO ULTIMATE';
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
        return Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    };

    Database.prototype._safeSetItem = function(clave, valor) {
        try {
            localStorage.setItem(clave, valor);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                this._liberarEspacio();
                try { localStorage.setItem(clave, valor); return true; }
                catch (e) { return false; }
            }
            return false;
        }
    };

    Database.prototype._liberarEspacio = function() {
        var self = this;
        try {
            var backups = [];
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i);
                if (k && k.indexOf(self.prefix + 'backup_') === 0) backups.push(k);
            }
            backups.sort(function(a, b) { return b.localeCompare(a); });
            for (var j = 3; j < backups.length; j++) {
                try { localStorage.removeItem(backups[j]); } catch (e) {}
            }

            var limpiar = ['logs', 'notificaciones', 'chat', 'publicaciones', 'reportes', 'mensajes'];
            for (var m = 0; m < limpiar.length; m++) {
                try {
                    var clave = self._getKey(limpiar[m]);
                    var data = localStorage.getItem(clave);
                    if (data) {
                        var obj = JSON.parse(data);
                        var arr = obj[limpiar[m]] || obj.mensajes || obj.registros;
                        if (arr && arr.length > 50) {
                            if (limpiar[m] === 'chat' || limpiar[m] === 'mensajes') arr = arr.slice(-50);
                            else arr = arr.slice(0, 50);
                            if (obj[limpiar[m]]) obj[limpiar[m]] = arr;
                            else if (obj.mensajes) obj.mensajes = arr;
                            else if (obj.registros) obj.registros = arr;
                            localStorage.setItem(clave, JSON.stringify(obj));
                        }
                    }
                } catch (e) {}
            }
            self.cache = {};
            self.lastCacheUpdate = {};
        } catch (e) {}
    };

    Database.prototype.cargar = function(nombre) {
        if (!this._isValidKey(nombre)) return null;
        var clave = this._getKey(nombre);
        if (this.cache[clave] && this.lastCacheUpdate[clave]) {
            if ((Date.now() - this.lastCacheUpdate[clave]) / 1000 < this.cacheTimeout) {
                return this._cloneDeep(this.cache[clave]);
            }
        }
        try {
            var datos = localStorage.getItem(clave);
            if (!datos || datos === 'null') return this._crearDefecto(nombre);
            var parsed = JSON.parse(datos);
            this.cache[clave] = this._cloneDeep(parsed);
            this.lastCacheUpdate[clave] = Date.now();
            return parsed;
        } catch (e) {
            return this._crearDefecto(nombre);
        }
    };

    Database.prototype.guardar = function(nombre, datos) {
        if (!this._isValidKey(nombre) || !this._isObject(datos)) return false;
        var clave = this._getKey(nombre);
        try {
            var anterior = localStorage.getItem(clave);
            if (anterior) this._crearRespaldo(nombre, anterior);
            if (this._safeSetItem(clave, JSON.stringify(datos))) {
                this.cache[clave] = this._cloneDeep(datos);
                this.lastCacheUpdate[clave] = Date.now();
                return true;
            }
            return false;
        } catch (e) { return false; }
    };

    Database.prototype.eliminar = function(nombre, id) {
        if (!this._isValidKey(nombre) || !id) return false;
        var col = this.cargar(nombre);
        if (!col) return false;
        var encontrado = false;
        var keys = Object.keys(col);
        for (var i = 0; i < keys.length; i++) {
            var val = col[keys[i]];
            if (Array.isArray(val)) {
                var filtrado = val.filter(function(item) { return item.id !== id; });
                if (filtrado.length !== val.length) {
                    col[keys[i]] = filtrado;
                    encontrado = true;
                    break;
                }
            }
        }
        if (!encontrado) return false;
        return this.guardar(nombre, col);
    };

    Database.prototype._crearRespaldo = function(nombre, datos) {
        try {
            var ts = new Date().toISOString().replace(/[:.]/g, '-');
            this._safeSetItem(this.prefix + 'backup_' + nombre + '_' + ts, datos);
        } catch (e) {}
    };

    Database.prototype._startAutoBackup = function() {
        var self = this;
        setInterval(function() {
            try {
                var nombres = self._getAllNames();
                for (var i = 0; i < nombres.length; i++) {
                    var d = self.cargar(nombres[i]);
                    if (d) self._crearRespaldo(nombres[i], JSON.stringify(d));
                }
            } catch (e) {}
        }, this.backupInterval);
    };

    Database.prototype._getAllNames = function() {
        var cols = [];
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && k.indexOf(this.prefix) === 0 && k.indexOf('backup_') === -1) {
                cols.push(k.replace(this.prefix, ''));
            }
        }
        return cols;
    };

    Database.prototype._crearDefecto = function(nombre) {
        var defs = {
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
            'chat': { mensajes: [], ultimo_id: 0 },
            'directorio': { miembros: [], ultimo_id: 0 },
            'configuracion': { iglesia: {}, aplicacion: {} },
            'reportes': { reportes: [], ultimo_id: 0 },
            'biblioteca': { recursos: [], ultimo_id: 0 },
            'galeria': { albumes: [], ultimo_id: 0 },
            'encuestas': { encuestas: [], ultimo_id: 0 },
            'podcast': { episodios: [], ultimo_id: 0 },
            'versiculos': { versiculos: [], ultimo_id: 0 },
            'horarios': { cultos: [] },
            'donaciones': { donaciones: [], ultimo_id: 0 },
            'favoritos': { favoritos: [], ultimo_id: 0 },
            'metas': { metas: [], ultimo_id: 0 },
            'misiones': { misiones: [], ultimo_id: 0 },
            'testimonios': { testimonios: [], ultimo_id: 0 },
            'grupos': { grupos: [], ultimo_id: 0 },
            'insignias': { insignias: [], ultimo_id: 0 },
            'logs': { logs: [], ultimo_id: 0 },
            // NUEVOS v20
            'oraciones': { oraciones: [], ultimo_id: 0 },
            'bendiciones': { bendiciones: [], ultimo_id: 0 },
            'logros': { logros: [], ultimo_id: 0 },
            'diario-espiritual': { entradas: [], ultimo_id: 0 },
            'lectura-biblica': { progreso: [], ultimo_id: 0 },
            'concordancia': { busquedas: [] },
            'himnario': { canciones: [], ultimo_id: 0 },
            'playlist': { listas: [], ultimo_id: 0 },
            'radio': { estaciones: [], historial: [], ultimo_id: 0 },
            'streaming': { transmisiones: [], ultimo_id: 0 },
            'qr-codes': { codigos: [], ultimo_id: 0 },
            'asistente': { conversaciones: [], ultimo_id: 0 },
            'juegos': { partidas: [], ultimo_id: 0 },
            'trivia': { preguntas: [], ultimo_id: 0 },
            'ranking': { puntajes: [], ultimo_id: 0 },
            'mensajes': { mensajes: [], ultimo_id: 0 }
        };
        if (defs[nombre]) {
            var clave = this._getKey(nombre);
            if (!localStorage.getItem(clave)) {
                try { this._safeSetItem(clave, JSON.stringify(defs[nombre])); } catch (e) {}
            }
            return defs[nombre];
        }
        return { datos: [], ultimo_id: 0 };
    };

    Database.prototype.hashPassword = function(pw) {
        if (!pw || typeof pw !== 'string') return '00000000';
        var h = 0, s = 'ipuc20_salt_2026', str = pw + s;
        for (var i = 0; i < str.length; i++) {
            h = ((h << 5) - h) + str.charCodeAt(i);
            h = h & h;
        }
        return Math.abs(h).toString(16).padStart(8, '0');
    };

    Database.prototype._validarCorreo = function(c) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c); };
    Database.prototype._validarPassword = function(p) { return p && p.length >= 8; };

    // ============================================
    // AUTENTICACIÓN Y USUARIOS
    // ============================================

    Database.prototype.crearPrimerAdministrador = function(datos) {
        try {
            var admins = this.cargar('administradores');
            if (admins.administradores && admins.administradores.length > 0) {
                return { success: false, error: 'Ya existe un administrador' };
            }
            if (!datos.nombre || !datos.correo || !datos.usuario || !datos.password) {
                return { success: false, error: 'Campos obligatorios' };
            }
            if (!this._validarCorreo(datos.correo)) return { success: false, error: 'Correo inválido' };
            if (!this._validarPassword(datos.password)) return { success: false, error: 'Contraseña mínima 8 caracteres' };

            var admin = {
                id: 1,
                nombre: datos.nombre.trim(),
                apellidos: (datos.apellidos || '').trim(),
                correo: datos.correo.trim().toLowerCase(),
                usuario: datos.usuario.trim().toLowerCase(),
                password: this.hashPassword(datos.password),
                rol: 'admin',
                verificado: true,
                fecha_registro: new Date().toISOString(),
                estado: 'activo',
                ministerio: datos.ministerio || 'Pastoral',
                foto: 'assets/avatars/admin.png',
                esAdminInicial: true,
                nivel: 1,
                xp: 0,
                logros: []
            };
            if (!admins.administradores) admins.administradores = [];
            admins.administradores.push(admin);
            admins.ultimo_id = 1;
            if (this.guardar('administradores', admins)) {
                // Marcar que el primer admin fue creado
                var config = this.cargar('configuracion');
                if (config && config.aplicacion) {
                    config.aplicacion.primer_administrador_creado = true;
                    this.guardar('configuracion', config);
                }
                return { success: true, data: admin };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.login = function(usuario, password) {
        try {
            if (!usuario || !password) return { success: false, error: 'Credenciales requeridas' };
            var hash = this.hashPassword(password);

            var admins = this.cargar('administradores');
            if (admins.administradores) {
                for (var i = 0; i < admins.administradores.length; i++) {
                    var a = admins.administradores[i];
                    if ((a.usuario === usuario || a.correo === usuario) && a.password === hash) {
                        if (a.estado !== 'activo') return { success: false, error: 'Cuenta desactivada' };
                        return {
                            success: true,
                            token: 't20_' + Date.now(),
                            rol: 'admin',
                            usuario: {
                                id: a.id,
                                nombre: a.nombre,
                                apellidos: a.apellidos,
                                correo: a.correo,
                                usuario: a.usuario,
                                rol: a.rol,
                                foto: a.foto,
                                ministerio: a.ministerio,
                                nivel: a.nivel || 1,
                                xp: a.xp || 0,
                                logros: a.logros || []
                            }
                        };
                    }
                }
            }

            var usuarios = this.cargar('usuarios');
            if (usuarios.usuarios) {
                for (var j = 0; j < usuarios.usuarios.length; j++) {
                    var u = usuarios.usuarios[j];
                    if ((u.usuario === usuario || u.correo === usuario) && u.password === hash) {
                        if (u.estado !== 'activo') return { success: false, error: 'Cuenta desactivada' };
                        return {
                            success: true,
                            token: 't20_' + Date.now(),
                            rol: 'usuario',
                            usuario: {
                                id: u.id,
                                nombre: u.nombre,
                                apellidos: u.apellidos,
                                correo: u.correo,
                                usuario: u.usuario,
                                rol: u.rol,
                                foto: u.foto,
                                ministerio: u.ministerio,
                                celular: u.celular,
                                nivel: u.nivel || 1,
                                xp: u.xp || 0,
                                logros: u.logros || []
                            }
                        };
                    }
                }
            }
            return { success: false, error: 'Credenciales inválidas' };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.registrarUsuario = function(datos) {
        try {
            if (!datos.nombre || !datos.correo || !datos.usuario || !datos.password) {
                return { success: false, error: 'Campos obligatorios' };
            }
            if (!this._validarCorreo(datos.correo)) return { success: false, error: 'Correo inválido' };
            if (!this._validarPassword(datos.password)) return { success: false, error: 'Contraseña mínima 8 caracteres' };

            var usuarios = this.cargar('usuarios');
            if (usuarios.usuarios) {
                for (var i = 0; i < usuarios.usuarios.length; i++) {
                    if (usuarios.usuarios[i].correo === datos.correo.toLowerCase()) {
                        return { success: false, error: 'Correo ya registrado' };
                    }
                    if (usuarios.usuarios[i].usuario === datos.usuario.toLowerCase()) {
                        return { success: false, error: 'Usuario ya existe' };
                    }
                }
            }

            var nuevo = {
                id: (usuarios.usuarios ? usuarios.usuarios.length : 0) + 1,
                nombre: datos.nombre.trim(),
                apellidos: (datos.apellidos || '').trim(),
                documento: (datos.documento || '').trim(),
                fecha_nacimiento: datos.fecha_nacimiento || '',
                sexo: datos.sexo || '',
                correo: datos.correo.trim().toLowerCase(),
                celular: (datos.celular || '').trim(),
                ministerio: datos.ministerio || 'General',
                usuario: datos.usuario.trim().toLowerCase(),
                password: this.hashPassword(datos.password),
                foto: 'assets/avatars/default.png',
                rol: 'usuario',
                verificado: false,
                fecha_registro: new Date().toISOString(),
                estado: 'activo',
                nivel: 1,
                xp: 0,
                logros: []
            };

            if (!usuarios.usuarios) usuarios.usuarios = [];
            usuarios.usuarios.push(nuevo);
            usuarios.ultimo_id = nuevo.id;

            if (this.guardar('usuarios', usuarios)) {
                return { success: true, data: { id: nuevo.id, nombre: nuevo.nombre, usuario: nuevo.usuario } };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    // ============================================
    // PUBLICACIONES Y COMENTARIOS
    // ============================================

    Database.prototype.getPublicaciones = function(limit) {
        limit = limit || 50;
        var p = this.cargar('publicaciones');
        return (p && p.publicaciones || []).slice(0, limit);
    };

    Database.prototype.addPublicacion = function(datos) {
        try {
            if (!datos.autor || !datos.contenido) return { success: false, error: 'Datos incompletos' };
            var pub = this.cargar('publicaciones');
            var nueva = {
                id: this._generateId(),
                usuario_id: datos.usuario_id || 0,
                autor: datos.autor,
                contenido: datos.contenido.trim().substring(0, 2000),
                fecha: new Date().toISOString(),
                reacciones: { amen: 0, me_gusta: 0 },
                comentarios_count: 0,
                estado: 'publicado'
            };
            if (!pub.publicaciones) pub.publicaciones = [];
            pub.publicaciones.unshift(nueva);
            if (pub.publicaciones.length > 100) pub.publicaciones = pub.publicaciones.slice(0, 100);
            pub.ultimo_id = nueva.id;
            this.guardar('publicaciones', pub);
            return { success: true, data: nueva };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.getComentarios = function(pubId) {
        var c = this.cargar('comentarios');
        var lista = (c && c.comentarios || []);
        if (pubId) return lista.filter(function(x) { return x.publicacion_id === pubId; });
        return lista;
    };

    Database.prototype.addComentario = function(datos) {
        try {
            if (!datos.publicacion_id || !datos.autor || !datos.contenido) {
                return { success: false, error: 'Datos incompletos' };
            }
            var com = this.cargar('comentarios');
            var nuevo = {
                id: this._generateId(),
                publicacion_id: datos.publicacion_id,
                usuario_id: datos.usuario_id || 0,
                autor: datos.autor,
                contenido: datos.contenido.trim().substring(0, 1000),
                fecha: new Date().toISOString(),
                estado: 'activo'
            };
            if (!com.comentarios) com.comentarios = [];
            com.comentarios.push(nuevo);
            if (com.comentarios.length > 500) com.comentarios = com.comentarios.slice(-500);
            this.guardar('comentarios', com);
            return { success: true, data: nuevo };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.toggleReaccion = function(pubId, userId, tipo) {
        try {
            var reacciones = this.cargar('reacciones');
            if (!reacciones.reacciones) reacciones.reacciones = {};
            var clave = pubId + '_' + userId;
            if (reacciones.reacciones[clave] === tipo) {
                delete reacciones.reacciones[clave];
            } else {
                reacciones.reacciones[clave] = tipo;
            }
            this.guardar('reacciones', reacciones);
            return { success: true };
        } catch (e) { return { success: false }; }
    };

    // ============================================
    // NOTICIAS Y EVENTOS
    // ============================================

    Database.prototype.getNoticias = function(limit) {
        limit = limit || 50;
        var n = this.cargar('noticias');
        return (n && n.noticias || []).slice(0, limit);
    };

    Database.prototype.addNoticia = function(datos) {
        try {
            if (!datos.titulo || !datos.contenido) return { success: false, error: 'Datos incompletos' };
            var noticias = this.cargar('noticias');
            var nueva = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                contenido: datos.contenido.trim().substring(0, 5000),
                fecha_publicacion: new Date().toISOString(),
                estado: 'publicado',
                autor: datos.autor || 'Admin'
            };
            if (!noticias.noticias) noticias.noticias = [];
            noticias.noticias.unshift(nueva);
            if (noticias.noticias.length > 100) noticias.noticias = noticias.noticias.slice(0, 100);
            this.guardar('noticias', noticias);
            return { success: true, data: nueva };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.getEventos = function() {
        var e = this.cargar('eventos');
        return (e && e.eventos || []).sort(function(a, b) {
            return new Date(a.fecha) - new Date(b.fecha);
        });
    };

    Database.prototype.addEvento = function(datos) {
        try {
            if (!datos.titulo || !datos.fecha) return { success: false, error: 'Datos incompletos' };
            var eventos = this.cargar('eventos');
            var nuevo = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                descripcion: datos.descripcion || '',
                fecha: datos.fecha,
                hora: datos.hora || '',
                lugar: datos.lugar || 'IPUC LA FONDA',
                tipo: datos.tipo || 'culto',
                fecha_creacion: new Date().toISOString(),
                estado: 'programado',
                creado_por: datos.creado_por || 'Admin',
                recordatorio: datos.recordatorio || false
            };
            if (!eventos.eventos) eventos.eventos = [];
            eventos.eventos.push(nuevo);
            this.guardar('eventos', eventos);
            return { success: true, data: nuevo };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.eliminarEvento = function(id) {
        return this.eliminar('eventos', id);
    };

    // ============================================
    // ASISTENCIA
    // ============================================

    Database.prototype.getAsistencia = function() {
        var a = this.cargar('asistencia');
        return (a && a.registros || []);
    };

    Database.prototype.addAsistencia = function(datos) {
        try {
            if (!datos.usuario_id || !datos.nombre) return { success: false, error: 'Datos incompletos' };
            var asistencia = this.cargar('asistencia');
            var nuevo = {
                id: this._generateId(),
                usuario_id: datos.usuario_id,
                nombre: datos.nombre.trim(),
                fecha: new Date().toISOString().split('T')[0],
                estado: datos.estado || 'Asistiré',
                tipo: datos.tipo || 'Hermano'
            };
            if (!asistencia.registros) asistencia.registros = [];
            asistencia.registros.push(nuevo);
            this.guardar('asistencia', asistencia);
            return { success: true, data: nuevo };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    // ============================================
    // ORACIONES Y BENDICIONES (NUEVO v20)
    // ============================================

    Database.prototype.getOraciones = function() {
        var o = this.cargar('oraciones');
        return (o && o.oraciones || []).sort(function(a, b) {
            return new Date(b.fecha) - new Date(a.fecha);
        });
    };

    Database.prototype.addOracion = function(datos) {
        try {
            if (!datos.motivo) return { success: false, error: 'Motivo requerido' };
            var oraciones = this.cargar('oraciones');
            var nueva = {
                id: this._generateId(),
                usuario_id: datos.usuario_id || 0,
                nombre: datos.nombre || 'Anónimo',
                motivo: datos.motivo.trim(),
                categoria: datos.categoria || 'general',
                privacidad: datos.privacidad || 'public',
                fecha: new Date().toISOString(),
                oraciones_count: 0,
                estado: 'activa'
            };
            if (!oraciones.oraciones) oraciones.oraciones = [];
            oraciones.oraciones.unshift(nueva);
            this.guardar('oraciones', oraciones);
            return { success: true, data: nueva };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.orarOracion = function(id) {
        try {
            var oraciones = this.cargar('oraciones');
            if (oraciones.oraciones) {
                for (var i = 0; i < oraciones.oraciones.length; i++) {
                    if (oraciones.oraciones[i].id === id) {
                        oraciones.oraciones[i].oraciones_count = (oraciones.oraciones[i].oraciones_count || 0) + 1;
                        this.guardar('oraciones', oraciones);
                        return { success: true };
                    }
                }
            }
            return { success: false };
        } catch (e) { return { success: false }; }
    };

    Database.prototype.getBendiciones = function() {
        var b = this.cargar('bendiciones');
        return (b && b.bendiciones || []).sort(function(a, b) {
            return new Date(b.fecha) - new Date(a.fecha);
        });
    };

    Database.prototype.addBendicion = function(datos) {
        try {
            if (!datos.mensaje) return { success: false, error: 'Mensaje requerido' };
            var bendiciones = this.cargar('bendiciones');
            var nueva = {
                id: this._generateId(),
                usuario_id: datos.usuario_id || 0,
                nombre: datos.nombre || 'Anónimo',
                mensaje: datos.mensaje.trim(),
                fecha: new Date().toISOString(),
                reacciones: 0
            };
            if (!bendiciones.bendiciones) bendiciones.bendiciones = [];
            bendiciones.bendiciones.unshift(nueva);
            this.guardar('bendiciones', bendiciones);
            return { success: true, data: nueva };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    // ============================================
    // PETICIONES
    // ============================================

    Database.prototype.getPeticiones = function() {
        var p = this.cargar('peticiones');
        return (p && p.peticiones || []).sort(function(a, b) {
            return new Date(b.fecha) - new Date(a.fecha);
        });
    };

    Database.prototype.addPeticion = function(datos) {
        try {
            if (!datos.nombre || !datos.motivo) return { success: false, error: 'Datos incompletos' };
            var peticiones = this.cargar('peticiones');
            var nueva = {
                id: this._generateId(),
                usuario_id: datos.usuario_id || 0,
                nombre: datos.nombre.trim(),
                motivo: datos.motivo.trim(),
                descripcion: datos.descripcion || '',
                fecha: new Date().toISOString(),
                estado: 'activa',
                oraciones: 0
            };
            if (!peticiones.peticiones) peticiones.peticiones = [];
            peticiones.peticiones.unshift(nueva);
            this.guardar('peticiones', peticiones);
            return { success: true, data: nueva };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.orarPeticion = function(id) {
        try {
            var peticiones = this.cargar('peticiones');
            if (peticiones.peticiones) {
                for (var i = 0; i < peticiones.peticiones.length; i++) {
                    if (peticiones.peticiones[i].id === id) {
                        peticiones.peticiones[i].oraciones = (peticiones.peticiones[i].oraciones || 0) + 1;
                        this.guardar('peticiones', peticiones);
                        return { success: true };
                    }
                }
            }
            return { success: false };
        } catch (e) { return { success: false }; }
    };

    // ============================================
    // CHAT Y MENSAJES
    // ============================================

    Database.prototype.getMensajes = function(limit) {
        limit = limit || 50;
        var c = this.cargar('chat');
        return ((c && c.mensajes) || []).slice(-limit);
    };

    Database.prototype.addMensaje = function(datos) {
        try {
            if (!datos.usuario || !datos.mensaje) return { success: false, error: 'Datos incompletos' };
            var chat = this.cargar('chat');
            var nuevo = {
                id: this._generateId(),
                usuario: datos.usuario,
                usuario_id: datos.usuario_id || 0,
                mensaje: datos.mensaje.trim().substring(0, 500),
                fecha: new Date().toISOString()
            };
            if (!chat.mensajes) chat.mensajes = [];
            chat.mensajes.push(nuevo);
            if (chat.mensajes.length > 200) chat.mensajes = chat.mensajes.slice(-200);
            this.guardar('chat', chat);
            return { success: true, data: nuevo };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    // ============================================
    // LOGROS Y GAMIFICACIÓN (NUEVO v20)
    // ============================================

    Database.prototype.getLogros = function() {
        var l = this.cargar('logros');
        return (l && l.logros || []);
    };

    Database.prototype.getLogrosUsuario = function(usuarioId) {
        var logros = this.getLogros();
        return logros.filter(function(l) { return l.usuario_id === usuarioId; });
    };

    Database.prototype.desbloquearLogro = function(usuarioId, logroId, datos) {
        try {
            var logros = this.cargar('logros');
            var existe = logros.logros.find(function(l) {
                return l.usuario_id === usuarioId && l.logro_id === logroId;
            });
            if (existe) return { success: false, error: 'Logro ya desbloqueado' };

            var nuevo = {
                id: this._generateId(),
                usuario_id: usuarioId,
                logro_id: logroId,
                nombre: datos.nombre || 'Logro',
                descripcion: datos.descripcion || '',
                icono: datos.icono || '🏆',
                fecha: new Date().toISOString()
            };
            if (!logros.logros) logros.logros = [];
            logros.logros.push(nuevo);
            this.guardar('logros', logros);

            // Actualizar XP del usuario
            this.agregarXP(usuarioId, datos.xp || 10);

            return { success: true, data: nuevo };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.agregarXP = function(usuarioId, cantidad) {
        try {
            var usuarios = this.cargar('usuarios');
            var admins = this.cargar('administradores');

            // Buscar en usuarios
            if (usuarios.usuarios) {
                for (var i = 0; i < usuarios.usuarios.length; i++) {
                    if (usuarios.usuarios[i].id === usuarioId) {
                        usuarios.usuarios[i].xp = (usuarios.usuarios[i].xp || 0) + cantidad;
                        // Subir de nivel
                        var xp = usuarios.usuarios[i].xp;
                        var nivel = 1;
                        var xpNecesario = 100;
                        while (xp >= xpNecesario) {
                            xp -= xpNecesario;
                            nivel++;
                            xpNecesario = Math.floor(xpNecesario * 1.5);
                        }
                        usuarios.usuarios[i].nivel = nivel;
                        this.guardar('usuarios', usuarios);
                        return { success: true };
                    }
                }
            }

            // Buscar en administradores
            if (admins.administradores) {
                for (var j = 0; j < admins.administradores.length; j++) {
                    if (admins.administradores[j].id === usuarioId) {
                        admins.administradores[j].xp = (admins.administradores[j].xp || 0) + cantidad;
                        var xpA = admins.administradores[j].xp;
                        var nivelA = 1;
                        var xpNecesarioA = 100;
                        while (xpA >= xpNecesarioA) {
                            xpA -= xpNecesarioA;
                            nivelA++;
                            xpNecesarioA = Math.floor(xpNecesarioA * 1.5);
                        }
                        admins.administradores[j].nivel = nivelA;
                        this.guardar('administradores', admins);
                        return { success: true };
                    }
                }
            }

            return { success: false, error: 'Usuario no encontrado' };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.getRanking = function(limit) {
        limit = limit || 10;
        var ranking = this.cargar('ranking');
        return (ranking && ranking.puntajes || []).sort(function(a, b) {
            return (b.puntos || 0) - (a.puntos || 0);
        }).slice(0, limit);
    };

    Database.prototype.addPuntajeRanking = function(datos) {
        try {
            if (!datos.usuario_id || !datos.puntos) return { success: false, error: 'Datos incompletos' };
            var ranking = this.cargar('ranking');
            var existente = ranking.puntajes.find(function(r) {
                return r.usuario_id === datos.usuario_id;
            });
            if (existente) {
                existente.puntos += datos.puntos;
                existente.fecha_actualizacion = new Date().toISOString();
            } else {
                ranking.puntajes.push({
                    id: this._generateId(),
                    usuario_id: datos.usuario_id,
                    nombre: datos.nombre || 'Usuario',
                    puntos: datos.puntos,
                    fecha: new Date().toISOString()
                });
            }
            this.guardar('ranking', ranking);
            return { success: true };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    // ============================================
    // DIARIO ESPIRITUAL (NUEVO v20)
    // ============================================

    Database.prototype.getDiarioEspiritual = function(usuarioId) {
        var d = this.cargar('diario-espiritual');
        var entradas = (d && d.entradas || []);
        if (usuarioId) {
            return entradas.filter(function(e) { return e.usuario_id === usuarioId; });
        }
        return entradas;
    };

    Database.prototype.addEntradaDiario = function(datos) {
        try {
            if (!datos.usuario_id || !datos.contenido) return { success: false, error: 'Datos incompletos' };
            var diario = this.cargar('diario-espiritual');
            var nueva = {
                id: this._generateId(),
                usuario_id: datos.usuario_id,
                fecha: datos.fecha || new Date().toISOString().split('T')[0],
                contenido: datos.contenido.trim(),
                titulo: datos.titulo || '',
                fecha_creacion: new Date().toISOString()
            };
            if (!diario.entradas) diario.entradas = [];
            diario.entradas.unshift(nueva);
            this.guardar('diario-espiritual', diario);
            return { success: true, data: nueva };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    // ============================================
    // LECTURA BÍBLICA (NUEVO v20)
    // ============================================

    Database.prototype.getProgresoLectura = function(usuarioId) {
        var l = this.cargar('lectura-biblica');
        var progreso = (l && l.progreso || []);
        if (usuarioId) {
            var p = progreso.find(function(p) { return p.usuario_id === usuarioId; });
            return p || { usuario_id: usuarioId, completados: 0, total: 365, fecha_inicio: new Date().toISOString() };
        }
        return progreso;
    };

    Database.prototype.marcarLecturaCompletada = function(usuarioId, fecha) {
        try {
            var lectura = this.cargar('lectura-biblica');
            var progreso = lectura.progreso || [];
            var p = progreso.find(function(p) { return p.usuario_id === usuarioId; });
            if (p) {
                p.completados = (p.completados || 0) + 1;
                p.ultima_lectura = fecha || new Date().toISOString();
            } else {
                progreso.push({
                    id: this._generateId(),
                    usuario_id: usuarioId,
                    completados: 1,
                    total: 365,
                    fecha_inicio: new Date().toISOString(),
                    ultima_lectura: fecha || new Date().toISOString()
                });
            }
            lectura.progreso = progreso;
            this.guardar('lectura-biblica', lectura);

            // Desbloquear logro si aplica
            if (p && p.completados >= 10) {
                this.desbloquearLogro(usuarioId, 'bible_reader', {
                    nombre: 'Lector de la Biblia',
                    descripcion: 'Has leído 10 capítulos',
                    icono: '📖',
                    xp: 25
                });
            }

            return { success: true };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    // ============================================
    // HIMNARIO Y PLAYLIST (NUEVO v20)
    // ============================================

    Database.prototype.getCanciones = function() {
        var h = this.cargar('himnario');
        return (h && h.canciones || []);
    };

    Database.prototype.addCancion = function(datos) {
        try {
            if (!datos.titulo || !datos.artista) return { success: false, error: 'Datos incompletos' };
            var himnario = this.cargar('himnario');
            var nueva = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                artista: datos.artista.trim(),
                duracion: datos.duracion || '',
                genero: datos.genero || 'Cristiana',
                letra: datos.letra || '',
                fecha_agregado: new Date().toISOString()
            };
            if (!himnario.canciones) himnario.canciones = [];
            himnario.canciones.push(nueva);
            this.guardar('himnario', himnario);
            return { success: true, data: nueva };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.getPlaylists = function() {
        var p = this.cargar('playlist');
        return (p && p.listas || []);
    };

    Database.prototype.addPlaylist = function(datos) {
        try {
            if (!datos.nombre) return { success: false, error: 'Nombre requerido' };
            var playlist = this.cargar('playlist');
            var nueva = {
                id: this._generateId(),
                nombre: datos.nombre.trim(),
                descripcion: datos.descripcion || '',
                canciones: datos.canciones || [],
                usuario_id: datos.usuario_id || 0,
                fecha_creacion: new Date().toISOString()
            };
            if (!playlist.listas) playlist.listas = [];
            playlist.listas.push(nueva);
            this.guardar('playlist', playlist);
            return { success: true, data: nueva };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    // ============================================
    // RADIO (NUEVO v20)
    // ============================================

    Database.prototype.getEstacionesRadio = function() {
        var r = this.cargar('radio');
        return (r && r.estaciones || []);
    };

    Database.prototype.addEstacionRadio = function(datos) {
        try {
            if (!datos.nombre || !datos.url) return { success: false, error: 'Datos incompletos' };
            var radio = this.cargar('radio');
            var nueva = {
                id: this._generateId(),
                nombre: datos.nombre.trim(),
                url: datos.url.trim(),
                genero: datos.genero || 'Cristiana',
                imagen: datos.imagen || '',
                activa: true
            };
            if (!radio.estaciones) radio.estaciones = [];
            radio.estaciones.push(nueva);
            this.guardar('radio', radio);
            return { success: true, data: nueva };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.getHistorialRadio = function(limit) {
        limit = limit || 20;
        var r = this.cargar('radio');
        return (r && r.historial || []).slice(-limit);
    };

    Database.prototype.addHistorialRadio = function(datos) {
        try {
            if (!datos.cancion) return { success: false };
            var radio = this.cargar('radio');
            var nueva = {
                id: this._generateId(),
                cancion: datos.cancion.trim(),
                artista: datos.artista || '',
                fecha: new Date().toISOString()
            };
            if (!radio.historial) radio.historial = [];
            radio.historial.push(nueva);
            if (radio.historial.length > 50) radio.historial = radio.historial.slice(-50);
            this.guardar('radio', radio);
            return { success: true };
        } catch (e) { return { success: false }; }
    };

    // ============================================
    // STREAMING (NUEVO v20)
    // ============================================

    Database.prototype.getTransmisiones = function() {
        var s = this.cargar('streaming');
        return (s && s.transmisiones || []).sort(function(a, b) {
            return new Date(b.fecha_inicio) - new Date(a.fecha_inicio);
        });
    };

    Database.prototype.addTransmision = function(datos) {
        try {
            if (!datos.titulo) return { success: false, error: 'Título requerido' };
            var streaming = this.cargar('streaming');
            var nueva = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                descripcion: datos.descripcion || '',
                url: datos.url || '',
                fecha_inicio: datos.fecha_inicio || new Date().toISOString(),
                fecha_fin: datos.fecha_fin || '',
                estado: datos.estado || 'programado',
                espectadores: 0,
                likes: 0
            };
            if (!streaming.transmisiones) streaming.transmisiones = [];
            streaming.transmisiones.push(nueva);
            this.guardar('streaming', streaming);
            return { success: true, data: nueva };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    // ============================================
    // ASISTENTE VIRTUAL (NUEVO v20)
    // ============================================

    Database.prototype.getConversaciones = function(usuarioId) {
        var a = this.cargar('asistente');
        var convs = (a && a.conversaciones || []);
        if (usuarioId) {
            return convs.filter(function(c) { return c.usuario_id === usuarioId; });
        }
        return convs;
    };

    Database.prototype.addConversacion = function(datos) {
        try {
            if (!datos.usuario_id || !datos.mensaje) return { success: false };
            var asistente = this.cargar('asistente');
            var nueva = {
                id: this._generateId(),
                usuario_id: datos.usuario_id,
                mensaje: datos.mensaje.trim(),
                respuesta: datos.respuesta || '',
                fecha: new Date().toISOString()
            };
            if (!asistente.conversaciones) asistente.conversaciones = [];
            asistente.conversaciones.push(nueva);
            if (asistente.conversaciones.length > 100) {
                asistente.conversaciones = asistente.conversaciones.slice(-100);
            }
            this.guardar('asistente', asistente);
            return { success: true, data: nueva };
        } catch (e) { return { success: false }; }
    };

    // ============================================
    // JUEGOS Y TRIVIA (NUEVO v20)
    // ============================================

    Database.prototype.getPreguntasTrivia = function() {
        var t = this.cargar('trivia');
        return (t && t.preguntas || []);
    };

    Database.prototype.addPreguntaTrivia = function(datos) {
        try {
            if (!datos.pregunta || !datos.opciones || !datos.respuesta) {
                return { success: false, error: 'Datos incompletos' };
            }
            var trivia = this.cargar('trivia');
            var nueva = {
                id: this._generateId(),
                pregunta: datos.pregunta.trim(),
                opciones: datos.opciones,
                respuesta: datos.respuesta,
                categoria: datos.categoria || 'general',
                dificultad: datos.dificultad || 'media'
            };
            if (!trivia.preguntas) trivia.preguntas = [];
            trivia.preguntas.push(nueva);
            this.guardar('trivia', trivia);
            return { success: true, data: nueva };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.getPartidasJuego = function(usuarioId) {
        var j = this.cargar('juegos');
        var partidas = (j && j.partidas || []);
        if (usuarioId) {
            return partidas.filter(function(p) { return p.usuario_id === usuarioId; });
        }
        return partidas;
    };

    Database.prototype.addPartidaJuego = function(datos) {
        try {
            if (!datos.usuario_id || !datos.puntaje) return { success: false };
            var juegos = this.cargar('juegos');
            var nueva = {
                id: this._generateId(),
                usuario_id: datos.usuario_id,
                juego: datos.juego || 'trivia',
                puntaje: datos.puntaje,
                nivel_alcanzado: datos.nivel || 1,
                fecha: new Date().toISOString()
            };
            if (!juegos.partidas) juegos.partidas = [];
            juegos.partidas.push(nueva);
            this.guardar('juegos', juegos);

            // Actualizar ranking
            this.addPuntajeRanking({
                usuario_id: datos.usuario_id,
                nombre: datos.nombre || 'Usuario',
                puntos: datos.puntaje
            });

            return { success: true, data: nueva };
        } catch (e) { return { success: false }; }
    };

    // ============================================
    // QR CODES (NUEVO v20)
    // ============================================

    Database.prototype.getQRCodes = function() {
        var q = this.cargar('qr-codes');
        return (q && q.codigos || []);
    };

    Database.prototype.addQRCode = function(datos) {
        try {
            if (!datos.url || !datos.titulo) return { success: false };
            var qr = this.cargar('qr-codes');
            var nuevo = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                url: datos.url.trim(),
                usuario_id: datos.usuario_id || 0,
                fecha_creacion: new Date().toISOString(),
                usos: 0
            };
            if (!qr.codigos) qr.codigos = [];
            qr.codigos.push(nuevo);
            this.guardar('qr-codes', qr);
            return { success: true, data: nuevo };
        } catch (e) { return { success: false }; }
    };

    // ============================================
    // REPORTES MEJORADOS
    // ============================================

    Database.prototype.getReportes = function(filtros) {
        filtros = filtros || {};
        var r = this.cargar('reportes');
        var lista = (r && r.reportes || []);
        if (filtros.estado) lista = lista.filter(function(x) { return x.estado === filtros.estado; });
        if (filtros.tipo) lista = lista.filter(function(x) { return x.tipo === filtros.tipo; });
        if (filtros.urgencia) lista = lista.filter(function(x) { return x.urgencia === filtros.urgencia; });
        return lista.sort(function(a, b) { return new Date(b.fecha) - new Date(a.fecha); });
    };

    Database.prototype.getReporte = function(id) {
        var r = this.cargar('reportes');
        if (!r || !r.reportes) return null;
        return r.reportes.find(function(x) { return x.id === id; }) || null;
    };

    Database.prototype.getReportesPendientes = function() {
        return this.getReportes({ estado: 'pendiente' });
    };

    Database.prototype.addReporte = function(datos) {
        try {
            if (!datos.tipo || !datos.descripcion) return { success: false, error: 'Datos incompletos' };
            var reportes = this.cargar('reportes');
            var nuevo = {
                id: this._generateId(),
                tipo: datos.tipo,
                reportado_por: datos.reportado_por || { id: 0, nombre: 'Anónimo' },
                usuario_reportado: datos.usuario_reportado || null,
                descripcion: datos.descripcion.trim().substring(0, 2000),
                motivo: datos.motivo || '',
                urgencia: datos.urgencia || 'baja',
                estado: 'pendiente',
                fecha: new Date().toISOString(),
                fecha_resolucion: null,
                notas_admin: '',
                adjuntos: datos.adjuntos || 0,
                historial: [{
                    estado: 'pendiente',
                    fecha: new Date().toISOString(),
                    usuario: 'Sistema',
                    comentario: 'Reporte creado'
                }]
            };
            if (!reportes.reportes) reportes.reportes = [];
            reportes.reportes.unshift(nuevo);
            if (reportes.reportes.length > 100) reportes.reportes = reportes.reportes.slice(0, 100);
            reportes.ultimo_id = nuevo.id;
            if (this.guardar('reportes', reportes)) {
                this._agregarNotificacion({
                    titulo: 'Nuevo reporte',
                    mensaje: 'Reporte #' + nuevo.id.substring(0, 8),
                    tipo: 'reporte'
                });
                return { success: true, data: nuevo };
            }
            return { success: false, error: 'Error al guardar' };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.cambiarEstadoReporte = function(id, nuevoEstado, admin, comentario) {
        try {
            admin = admin || 'Admin';
            comentario = comentario || '';
            var reportes = this.cargar('reportes');
            if (!reportes || !reportes.reportes) return { success: false };
            for (var i = 0; i < reportes.reportes.length; i++) {
                if (reportes.reportes[i].id === id) {
                    reportes.reportes[i].estado = nuevoEstado;
                    if (nuevoEstado === 'resuelto' || nuevoEstado === 'desestimado') {
                        reportes.reportes[i].fecha_resolucion = new Date().toISOString();
                    }
                    if (!reportes.reportes[i].historial) reportes.reportes[i].historial = [];
                    reportes.reportes[i].historial.push({
                        estado: nuevoEstado,
                        fecha: new Date().toISOString(),
                        usuario: admin,
                        comentario: comentario || 'Estado: ' + nuevoEstado
                    });
                    this.guardar('reportes', reportes);
                    return { success: true, data: reportes.reportes[i] };
                }
            }
            return { success: false, error: 'No encontrado' };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.deleteReporte = function(id) {
        return this.eliminar('reportes', id);
    };

    Database.prototype.getEstadisticasReportes = function() {
        var r = this.cargar('reportes');
        var lista = (r && r.reportes || []);
        return {
            total: lista.length,
            pendientes: lista.filter(function(x) { return x.estado === 'pendiente'; }).length,
            en_revision: lista.filter(function(x) { return x.estado === 'en_revision'; }).length,
            resueltos: lista.filter(function(x) { return x.estado === 'resuelto'; }).length,
            desestimados: lista.filter(function(x) { return x.estado === 'desestimado'; }).length
        };
    };

    // ============================================
    // NOTIFICACIONES
    // ============================================

    Database.prototype._agregarNotificacion = function(datos) {
        try {
            var notif = this.cargar('notificaciones');
            var nueva = {
                id: this._generateId(),
                titulo: datos.titulo,
                mensaje: datos.mensaje,
                fecha: new Date().toISOString(),
                leida: false,
                tipo: datos.tipo || 'general',
                icono: datos.icono || '📌'
            };
            if (!notif.notificaciones) notif.notificaciones = [];
            notif.notificaciones.unshift(nueva);
            if (notif.notificaciones.length > 100) {
                notif.notificaciones = notif.notificaciones.slice(0, 100);
            }
            this.guardar('notificaciones', notif);
        } catch (e) {}
    };

    Database.prototype.getNotificaciones = function(limit) {
        limit = limit || 50;
        var n = this.cargar('notificaciones');
        return (n && n.notificaciones || []).slice(0, limit);
    };

    Database.prototype.getNoLeidas = function() {
        var n = this.getNotificaciones();
        var c = 0;
        for (var i = 0; i < n.length; i++) {
            if (!n[i].leida) c++;
        }
        return c;
    };

    Database.prototype.marcarLeidas = function() {
        try {
            var n = this.cargar('notificaciones');
            if (n && n.notificaciones) {
                for (var i = 0; i < n.notificaciones.length; i++) {
                    n.notificaciones[i].leida = true;
                }
                this.guardar('notificaciones', n);
                return { success: true };
            }
            return { success: false };
        } catch (e) { return { success: false }; }
    };

    // ============================================
    // CONFIGURACIÓN Y ESTADÍSTICAS
    // ============================================

    Database.prototype.getConfiguracion = function() {
        return this.cargar('configuracion');
    };

    Database.prototype.getConfiguracionIglesia = function() {
        var c = this.getConfiguracion();
        return (c && c.iglesia) ? c.iglesia : {};
    };

    Database.prototype.getHorarios = function() {
        var h = this.cargar('horarios');
        return (h && h.cultos || []);
    };

    Database.prototype.getVersiculos = function() {
        var v = this.cargar('versiculos');
        return (v && v.versiculos || []);
    };

    Database.prototype.getVersiculoDiario = function() {
        var v = this.getVersiculos();
        if (v.length === 0) return null;
        var idx = new Date().getDate() % v.length;
        return v[idx] || v[0];
    };

    Database.prototype.getDonaciones = function() {
        var d = this.cargar('donaciones');
        return (d && d.donaciones || []);
    };

    Database.prototype.addDonacion = function(datos) {
        try {
            if (!datos.monto) return { success: false, error: 'Monto requerido' };
            var donaciones = this.cargar('donaciones');
            var nueva = {
                id: this._generateId(),
                usuario_id: datos.usuario_id || 0,
                usuario_nombre: datos.usuario_nombre || 'Anónimo',
                monto: datos.monto,
                metodo: datos.metodo || 'Efectivo',
                concepto: datos.concepto || 'Ofrenda',
                fecha: new Date().toISOString()
            };
            if (!donaciones.donaciones) donaciones.donaciones = [];
            donaciones.donaciones.push(nueva);
            this.guardar('donaciones', donaciones);
            return { success: true, data: nueva };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.getEstadisticas = function() {
        return {
            usuarios: this.cargar('usuarios').usuarios ? this.cargar('usuarios').usuarios.length : 0,
            publicaciones: this.getPublicaciones().length,
            noticias: this.getNoticias().length,
            eventos: this.getEventos().length,
            peticiones: this.getPeticiones().length,
            reportes_pendientes: this.getReportesPendientes().length,
            oraciones: this.getOraciones().length,
            bendiciones: this.getBendiciones().length,
            logros_desbloqueados: this.getLogros().length,
            mensajes_chat: this.getMensajes().length
        };
    };

    // ============================================
    // EXPORTACIÓN E IMPORTACIÓN
    // ============================================

    Database.prototype.exportarTodo = function() {
        var datos = {};
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && k.indexOf(this.prefix) === 0) {
                try { datos[k] = JSON.parse(localStorage.getItem(k)); } catch (e) {}
            }
        }
        return {
            version: this.version,
            versionName: this.versionName,
            fecha: new Date().toISOString(),
            datos: datos,
            metadata: {
                total_items: Object.keys(datos).length,
                exportado_por: 'IPUC LA FONDA'
            }
        };
    };

    Database.prototype.importarTodo = function(exportData) {
        try {
            if (!exportData || !exportData.datos) return { success: false, error: 'Datos inválidos' };
            var datos = exportData.datos;
            var keys = Object.keys(datos);
            for (var i = 0; i < keys.length; i++) {
                if (keys[i].indexOf(this.prefix) === 0) {
                    this._safeSetItem(keys[i], JSON.stringify(datos[keys[i]]));
                }
            }
            this.cache = {};
            this.lastCacheUpdate = {};
            this.initialized = false;
            this.inicializarDatos();
            return { success: true, items_importados: keys.length };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.limpiarTodo = function() {
        var keys = [];
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && k.indexOf(this.prefix) === 0) keys.push(k);
        }
        for (var j = 0; j < keys.length; j++) localStorage.removeItem(keys[j]);
        this.cache = {};
        this.lastCacheUpdate = {};
        this.initialized = false;
        this.inicializarDatos();
        return { success: true, items_eliminados: keys.length };
    };

    Database.prototype.getLogs = function(limit) {
        limit = limit || 50;
        var l = this.cargar('logs');
        return (l && l.logs || []).slice(0, limit);
    };

    // ============================================
    // INICIALIZACIÓN
    // ============================================

    Database.prototype.inicializarDatos = function() {
        var archivos = [
            'usuarios', 'administradores', 'publicaciones', 'comentarios',
            'reacciones', 'noticias', 'eventos', 'asistencia', 'notificaciones',
            'peticiones', 'chat', 'directorio', 'configuracion', 'reportes',
            'biblioteca', 'galeria', 'encuestas', 'podcast', 'versiculos',
            'horarios', 'donaciones', 'favoritos', 'metas', 'misiones',
            'testimonios', 'grupos', 'insignias', 'logs',
            // NUEVOS v20
            'oraciones', 'bendiciones', 'logros', 'diario-espiritual',
            'lectura-biblica', 'concordancia', 'himnario', 'playlist',
            'radio', 'streaming', 'qr-codes', 'asistente',
            'juegos', 'trivia', 'ranking', 'mensajes'
        ];
        for (var i = 0; i < archivos.length; i++) {
            var clave = this._getKey(archivos[i]);
            if (!localStorage.getItem(clave)) this._crearDefecto(archivos[i]);
        }
        this._inicializarDefectos();
        this.initialized = true;
    };

    Database.prototype._inicializarDefectos = function() {
        // Horarios
        var h = this.cargar('horarios');
        if (!h.cultos || h.cultos.length === 0) {
            h.cultos = [
                { dia: "Domingo", cultos: [{ nombre: "Culto Dominical", inicio: "10:00", fin: "12:00" }] },
                { dia: "Martes", cultos: [{ nombre: "Culto de Oración", inicio: "18:00", fin: "20:30" }] },
                { dia: "Viernes", cultos: [{ nombre: "Culto de Jóvenes", inicio: "18:00", fin: "20:30" }] },
                { dia: "Sábado", cultos: [{ nombre: "Escuela Bíblica", inicio: "16:00", fin: "18:00" }] }
            ];
            this.guardar('horarios', h);
        }

        // Versículos
        var v = this.cargar('versiculos');
        if (!v.versiculos || v.versiculos.length === 0) {
            v.versiculos = [
                { id: 1, texto: "Porque de tal manera amó Dios al mundo...", referencia: "Juan 3:16" },
                { id: 2, texto: "Jehová es mi pastor; nada me faltará.", referencia: "Salmos 23:1" },
                { id: 3, texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13" },
                { id: 4, texto: "El Señor es mi luz y mi salvación; ¿de quién temeré?", referencia: "Salmos 27:1" },
                { id: 5, texto: "No temas, porque yo estoy contigo...", referencia: "Isaías 41:10" }
            ];
            v.ultimo_id = 5;
            this.guardar('versiculos', v);
        }

        // Insignias
        var i = this.cargar('insignias');
        if (!i.insignias || i.insignias.length === 0) {
            i.insignias = [
                { id: 1, nombre: "Nuevo Miembro", icono: "bx-user-plus", color: "#2196f3" },
                { id: 2, nombre: "Miembro Activo", icono: "bx-star", color: "#ff9800" },
                { id: 3, nombre: "Líder", icono: "bx-crown", color: "#ffd700" },
                { id: 4, nombre: "Cuenta Verificada", icono: "bx-badge-check", color: "#2196f3" },
                { id: 5, nombre: "Orador Constante", icono: "bx-pray", color: "#4caf50" },
                { id: 6, nombre: "Comparte Testimonio", icono: "bx-heart", color: "#e91e63" }
            ];
            i.ultimo_id = 6;
            this.guardar('insignias', i);
        }

        // Configuración
        var c = this.cargar('configuracion');
        if (!c.iglesia || !c.iglesia.nombre) {
            c.iglesia = {
                nombre: "IPUC LA FONDA",
                lema: "Donde el Espíritu Santo se mueve",
                direccion: "Cali, Valle del Cauca, Colombia",
                telefono: "+57 312 881 3818",
                correo: "ipuclafonda@gmail.com",
                fundacion: "2020",
                horario_cultos: "Domingo 10:00 AM"
            };
            c.aplicacion = {
                version: this.version,
                versionName: this.versionName,
                registro_abierto: true,
                primer_administrador_creado: false,
                fecha_instalacion: new Date().toISOString()
            };
            this.guardar('configuracion', c);
        }

        // Preguntas de Trivia por defecto
        var t = this.cargar('trivia');
        if (!t.preguntas || t.preguntas.length === 0) {
            t.preguntas = [
                { id: this._generateId(), pregunta: "¿Quién construyó el arca?", opciones: ["Moisés", "Noé", "Abraham", "David"], respuesta: 1, categoria: "Antiguo Testamento", dificultad: "facil" },
                { id: this._generateId(), pregunta: "¿Cuántos libros tiene la Biblia?", opciones: ["66", "73", "39", "27"], respuesta: 0, categoria: "General", dificultad: "facil" },
                { id: this._generateId(), pregunta: "¿Quién fue el primer rey de Israel?", opciones: ["David", "Salomón", "Saúl", "Josué"], respuesta: 2, categoria: "Antiguo Testamento", dificultad: "media" },
                { id: this._generateId(), pregunta: "¿En qué ciudad nació Jesús?", opciones: ["Jerusalén", "Belén", "Nazaret", "Cafarnaúm"], respuesta: 1, categoria: "Nuevo Testamento", dificultad: "facil" },
                { id: this._generateId(), pregunta: "¿Quién dividió el Mar Rojo?", opciones: ["Josué", "Moisés", "Abraham", "Elías"], respuesta: 1, categoria: "Antiguo Testamento", dificultad: "media" },
                { id: this._generateId(), pregunta: "¿Cuántos discípulos tuvo Jesús?", opciones: ["7", "10", "12", "14"], respuesta: 2, categoria: "Nuevo Testamento", dificultad: "facil" },
                { id: this._generateId(), pregunta: "¿Qué animal habló en la Biblia?", opciones: ["Burro", "Serpiente", "Paloma", "León"], respuesta: 0, categoria: "Antiguo Testamento", dificultad: "media" },
                { id: this._generateId(), pregunta: "¿Quién escribió el libro de Apocalipsis?", opciones: ["Pedro", "Juan", "Pablo", "Mateo"], respuesta: 1, categoria: "Nuevo Testamento", dificultad: "dificil" }
            ];
            t.ultimo_id = t.preguntas.length;
            this.guardar('trivia', t);
        }

        // Canciones por defecto
        var hmn = this.cargar('himnario');
        if (!hmn.canciones || hmn.canciones.length === 0) {
            hmn.canciones = [
                { id: this._generateId(), titulo: "Santo Espíritu", artista: "IPUC LA FONDA", duracion: "4:32", genero: "Adoración" },
                { id: this._generateId(), titulo: "Alabanzas al Rey", artista: "IPUC LA FONDA", duracion: "5:15", genero: "Alabanza" },
                { id: this._generateId(), titulo: "Adoración Profunda", artista: "IPUC LA FONDA", duracion: "6:08", genero: "Adoración" },
                { id: this._generateId(), titulo: "Glorioso Día", artista: "IPUC LA FONDA", duracion: "4:45", genero: "Alabanza" },
                { id: this._generateId(), titulo: "Cordero de Dios", artista: "IPUC LA FONDA", duracion: "5:20", genero: "Adoración" },
                { id: this._generateId(), titulo: "Grande es el Señor", artista: "IPUC LA FONDA", duracion: "4:55", genero: "Alabanza" }
            ];
            hmn.ultimo_id = hmn.canciones.length;
            this.guardar('himnario', hmn);
        }

        // Estaciones de Radio por defecto
        var rd = this.cargar('radio');
        if (!rd.estaciones || rd.estaciones.length === 0) {
            rd.estaciones = [
                { id: this._generateId(), nombre: "Radio IPUC", url: "https://radio.ipuc.com/stream", genero: "Cristiana", activa: true },
                { id: this._generateId(), nombre: "Alabanza Global", url: "https://alabanza.com/stream", genero: "Alabanza", activa: true },
                { id: this._generateId(), nombre: "Adoración Profunda", url: "https://adoracion.com/stream", genero: "Adoración", activa: true }
            ];
            rd.ultimo_id = rd.estaciones.length;
            this.guardar('radio', rd);
        }
    };

    return Database;
})();

// ============================================
// INICIALIZACIÓN GLOBAL
// ============================================

if (typeof window !== 'undefined') {
    if (!window.db) {
        try {
            window.db = new Database();
            window.db.inicializarDatos();
            console.log('✅ Database v' + window.db.version + ' ' + window.db.versionName + ' inicializado');
            console.log('📌 Sistema listo para usar');
        } catch (e) {
            console.error('❌ Error inicializando Database:', e);
        }
    }
    window.Database = Database;
}

/* ============================================
   FINAL DEL DATABASE v20.0 PRO ULTIMATE
   IPUC LA FONDA - International Pentecostal Church
   "Donde el Espíritu Santo se mueve"
   ============================================ */
