/* ============================================
   IPUC LA FONDA - DATABASE v18.0 PRO ULTIMATE
   Sistema de Base de Datos en localStorage
   Incluye: Reportes, Anti-Quota, Backup
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

            var limpiar = ['logs', 'notificaciones', 'chat', 'publicaciones', 'reportes'];
            for (var m = 0; m < limpiar.length; m++) {
                try {
                    var clave = self._getKey(limpiar[m]);
                    var data = localStorage.getItem(clave);
                    if (data) {
                        var obj = JSON.parse(data);
                        var arr = obj[limpiar[m]] || obj.mensajes || obj.registros;
                        if (arr && arr.length > 50) {
                            if (limpiar[m] === 'chat') arr = arr.slice(-50);
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
            'grupos': { grupos: [], ultimo_id: 0 }
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
        var h = 0, s = 'ipuc18_salt', str = pw + s;
        for (var i = 0; i < str.length; i++) {
            h = ((h << 5) - h) + str.charCodeAt(i);
            h = h & h;
        }
        return Math.abs(h).toString(16).padStart(8, '0');
    };

    Database.prototype._validarCorreo = function(c) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c); };
    Database.prototype._validarPassword = function(p) { return p && p.length >= 8; };

    Database.prototype.crearPrimerAdministrador = function(datos) {
        try {
            var admins = this.cargar('administradores');
            if (admins.administradores && admins.administradores.length > 0) {
                return { success: false, error: 'Ya existe un administrador' };
            }
            if (!datos.nombre || !datos.correo || !datos.usuario || !datos.password) {
                return { success: false, error: 'Campos obligatorios' };
            }
            if (!this._validarCorreo(datos.correo)) return { success: false, error: 'Correo invalido' };
            if (!this._validarPassword(datos.password)) return { success: false, error: 'Contrasena minima 8 caracteres' };

            var admin = {
                id: 1, nombre: datos.nombre.trim(), apellidos: (datos.apellidos || '').trim(),
                correo: datos.correo.trim().toLowerCase(), usuario: datos.usuario.trim().toLowerCase(),
                password: this.hashPassword(datos.password), rol: 'admin', verificado: true,
                fecha_registro: new Date().toISOString(), estado: 'activo',
                ministerio: datos.ministerio || 'Pastoral', foto: 'assets/avatars/admin.png'
            };
            if (!admins.administradores) admins.administradores = [];
            admins.administradores.push(admin);
            admins.ultimo_id = 1;
            if (this.guardar('administradores', admins)) {
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
                        return { success: true, token: 't18_' + Date.now(), rol: 'admin',
                            usuario: { id: a.id, nombre: a.nombre, apellidos: a.apellidos, correo: a.correo,
                            usuario: a.usuario, rol: a.rol, foto: a.foto, ministerio: a.ministerio } };
                    }
                }
            }

            var usuarios = this.cargar('usuarios');
            if (usuarios.usuarios) {
                for (var j = 0; j < usuarios.usuarios.length; j++) {
                    var u = usuarios.usuarios[j];
                    if ((u.usuario === usuario || u.correo === usuario) && u.password === hash) {
                        if (u.estado !== 'activo') return { success: false, error: 'Cuenta desactivada' };
                        return { success: true, token: 't18_' + Date.now(), rol: 'usuario',
                            usuario: { id: u.id, nombre: u.nombre, apellidos: u.apellidos, correo: u.correo,
                            usuario: u.usuario, rol: u.rol, foto: u.foto, ministerio: u.ministerio, celular: u.celular } };
                    }
                }
            }
            return { success: false, error: 'Credenciales invalidas' };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.registrarUsuario = function(datos) {
        try {
            if (!datos.nombre || !datos.correo || !datos.usuario || !datos.password) {
                return { success: false, error: 'Campos obligatorios' };
            }
            if (!this._validarCorreo(datos.correo)) return { success: false, error: 'Correo invalido' };
            if (!this._validarPassword(datos.password)) return { success: false, error: 'Contrasena minima 8 caracteres' };

            var usuarios = this.cargar('usuarios');
            if (usuarios.usuarios) {
                for (var i = 0; i < usuarios.usuarios.length; i++) {
                    if (usuarios.usuarios[i].correo === datos.correo.toLowerCase()) return { success: false, error: 'Correo ya registrado' };
                    if (usuarios.usuarios[i].usuario === datos.usuario.toLowerCase()) return { success: false, error: 'Usuario ya existe' };
                }
            }

            var nuevo = {
                id: (usuarios.usuarios ? usuarios.usuarios.length : 0) + 1,
                nombre: datos.nombre.trim(), apellidos: (datos.apellidos || '').trim(),
                documento: (datos.documento || '').trim(), fecha_nacimiento: datos.fecha_nacimiento || '',
                sexo: datos.sexo || '', correo: datos.correo.trim().toLowerCase(),
                celular: (datos.celular || '').trim(), ministerio: datos.ministerio || 'General',
                usuario: datos.usuario.trim().toLowerCase(), password: this.hashPassword(datos.password),
                foto: 'assets/avatars/default.png', rol: 'usuario', verificado: false,
                fecha_registro: new Date().toISOString(), estado: 'activo'
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
                id: this._generateId(), usuario_id: datos.usuario_id || 0,
                autor: datos.autor, contenido: datos.contenido.trim().substring(0, 2000),
                fecha: new Date().toISOString(), reacciones: { amen: 0, me_gusta: 0 },
                comentarios_count: 0, estado: 'publicado'
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
            if (!datos.publicacion_id || !datos.autor || !datos.contenido) return { success: false, error: 'Datos incompletos' };
            var com = this.cargar('comentarios');
            var nuevo = {
                id: this._generateId(), publicacion_id: datos.publicacion_id,
                usuario_id: datos.usuario_id || 0, autor: datos.autor,
                contenido: datos.contenido.trim().substring(0, 1000),
                fecha: new Date().toISOString(), estado: 'activo'
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
                id: this._generateId(), titulo: datos.titulo.trim(),
                contenido: datos.contenido.trim().substring(0, 5000),
                fecha_publicacion: new Date().toISOString(), estado: 'publicado'
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
        return (e && e.eventos || []).sort(function(a, b) { return new Date(a.fecha) - new Date(b.fecha); });
    };

    Database.prototype.addEvento = function(datos) {
        try {
            if (!datos.titulo || !datos.fecha) return { success: false, error: 'Datos incompletos' };
            var eventos = this.cargar('eventos');
            var nuevo = {
                id: this._generateId(), titulo: datos.titulo.trim(),
                descripcion: datos.descripcion || '', fecha: datos.fecha,
                hora_inicio: datos.hora_inicio || '', lugar: datos.lugar || 'IPUC LA FONDA',
                fecha_creacion: new Date().toISOString(), estado: 'programado'
            };
            if (!eventos.eventos) eventos.eventos = [];
            eventos.eventos.push(nuevo);
            this.guardar('eventos', eventos);
            return { success: true, data: nuevo };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.getAsistencia = function() {
        var a = this.cargar('asistencia');
        return (a && a.registros || []);
    };

    Database.prototype.addAsistencia = function(datos) {
        try {
            if (!datos.usuario_id || !datos.nombre) return { success: false, error: 'Datos incompletos' };
            var asistencia = this.cargar('asistencia');
            var nuevo = {
                id: this._generateId(), usuario_id: datos.usuario_id,
                nombre: datos.nombre.trim(), fecha: new Date().toISOString().split('T')[0],
                estado: datos.estado || 'Asistire', tipo: datos.tipo || 'Hermano'
            };
            if (!asistencia.registros) asistencia.registros = [];
            asistencia.registros.push(nuevo);
            this.guardar('asistencia', asistencia);
            return { success: true, data: nuevo };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.getPeticiones = function() {
        var p = this.cargar('peticiones');
        return (p && p.peticiones || []);
    };

    Database.prototype.addPeticion = function(datos) {
        try {
            if (!datos.nombre || !datos.motivo) return { success: false, error: 'Datos incompletos' };
            var peticiones = this.cargar('peticiones');
            var nueva = {
                id: this._generateId(), usuario_id: datos.usuario_id || 0,
                nombre: datos.nombre.trim(), motivo: datos.motivo.trim(),
                descripcion: datos.descripcion || '', fecha: new Date().toISOString(),
                estado: 'activa', oraciones: 0
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

    Database.prototype.getEncuestas = function() {
        var e = this.cargar('encuestas');
        return (e && e.encuestas || []);
    };

    Database.prototype.getRecursos = function() {
        var b = this.cargar('biblioteca');
        return (b && b.recursos || []);
    };

    Database.prototype.getPodcast = function() {
        var p = this.cargar('podcast');
        return (p && p.episodios || []);
    };

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
                id: this._generateId(), usuario: datos.usuario,
                usuario_id: datos.usuario_id || 0, mensaje: datos.mensaje.trim().substring(0, 500),
                fecha: new Date().toISOString()
            };
            if (!chat.mensajes) chat.mensajes = [];
            chat.mensajes.push(nuevo);
            if (chat.mensajes.length > 200) chat.mensajes = chat.mensajes.slice(-200);
            this.guardar('chat', chat);
            return { success: true, data: nuevo };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.getDirectorio = function() {
        var d = this.cargar('directorio');
        return (d && d.miembros || []);
    };

    Database.prototype.getNotificaciones = function(limit) {
        limit = limit || 50;
        var n = this.cargar('notificaciones');
        return (n && n.notificaciones || []).slice(0, limit);
    };

    Database.prototype._agregarNotificacion = function(datos) {
        try {
            var notif = this.cargar('notificaciones');
            var nueva = {
                id: this._generateId(), titulo: datos.titulo, mensaje: datos.mensaje,
                fecha: new Date().toISOString(), leida: false, tipo: datos.tipo || 'general'
            };
            if (!notif.notificaciones) notif.notificaciones = [];
            notif.notificaciones.unshift(nueva);
            if (notif.notificaciones.length > 100) notif.notificaciones = notif.notificaciones.slice(0, 100);
            this.guardar('notificaciones', notif);
        } catch (e) {}
    };

    Database.prototype.getNoLeidas = function() {
        var n = this.getNotificaciones(), c = 0;
        for (var i = 0; i < n.length; i++) { if (!n[i].leida) c++; }
        return c;
    };

    Database.prototype.getReportes = function(filtros) {
        filtros = filtros || {};
        var r = this.cargar('reportes');
        var lista = (r && r.reportes || []);
        if (filtros.estado) lista = lista.filter(function(x) { return x.estado === filtros.estado; });
        if (filtros.tipo) lista = lista.filter(function(x) { return x.tipo === filtros.tipo; });
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
                id: this._generateId(), tipo: datos.tipo,
                reportado_por: datos.reportado_por || { id: 0, nombre: 'Anonimo' },
                usuario_reportado: datos.usuario_reportado || null,
                descripcion: datos.descripcion.trim().substring(0, 2000),
                motivo: datos.motivo || '', urgencia: datos.urgencia || 'baja',
                estado: 'pendiente', fecha: new Date().toISOString(),
                fecha_resolucion: null, notas_admin: '',
                historial: [{ estado: 'pendiente', fecha: new Date().toISOString(), usuario: 'Sistema', comentario: 'Reporte creado' }]
            };
            if (!reportes.reportes) reportes.reportes = [];
            reportes.reportes.unshift(nuevo);
            if (reportes.reportes.length > 100) reportes.reportes = reportes.reportes.slice(0, 100);
            reportes.ultimo_id = nuevo.id;
            if (this.guardar('reportes', reportes)) {
                this._agregarNotificacion({ titulo: 'Nuevo reporte', mensaje: 'Reporte #' + nuevo.id.substring(0, 8), tipo: 'reporte' });
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
                        estado: nuevoEstado, fecha: new Date().toISOString(),
                        usuario: admin, comentario: comentario || 'Estado: ' + nuevoEstado
                    });
                    this.guardar('reportes', reportes);
                    return { success: true, data: reportes.reportes[i] };
                }
            }
            return { success: false, error: 'No encontrado' };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.deleteReporte = function(id) {
        try {
            var reportes = this.cargar('reportes');
            if (reportes && reportes.reportes) {
                reportes.reportes = reportes.reportes.filter(function(r) { return r.id !== id; });
                this.guardar('reportes', reportes);
            }
            return { success: true };
        } catch (e) { return { success: false }; }
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

    Database.prototype.getEstadisticas = function() {
        return {
            usuarios: 0,
            publicaciones: this.getPublicaciones().length,
            noticias: this.getNoticias().length,
            eventos: this.getEventos().length,
            peticiones: this.getPeticiones().length,
            reportes_pendientes: this.getReportesPendientes().length
        };
    };

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
        return v[new Date().getDay() % v.length];
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
                id: this._generateId(), usuario_id: datos.usuario_id || 0,
                usuario_nombre: datos.usuario_nombre || 'Anonimo', monto: datos.monto,
                metodo: datos.metodo || 'Efectivo', concepto: datos.concepto || 'Ofrenda',
                fecha: new Date().toISOString()
            };
            if (!donaciones.donaciones) donaciones.donaciones = [];
            donaciones.donaciones.push(nueva);
            this.guardar('donaciones', donaciones);
            return { success: true, data: nueva };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.getFavoritos = function(uid) {
        var f = this.cargar('favoritos');
        return (f && f.favoritos || []).filter(function(x) { return x.usuario_id === uid; });
    };

    Database.prototype.toggleFavorito = function(uid, itemId, tipo) {
        try {
            var f = this.cargar('favoritos');
            if (!f.favoritos) f.favoritos = [];
            var existe = f.favoritos.find(function(x) { return x.usuario_id === uid && x.item_id === itemId && x.tipo === tipo; });
            if (existe) {
                f.favoritos = f.favoritos.filter(function(x) { return !(x.usuario_id === uid && x.item_id === itemId && x.tipo === tipo); });
            } else {
                f.favoritos.push({ id: this._generateId(), usuario_id: uid, item_id: itemId, tipo: tipo, fecha: new Date().toISOString() });
            }
            this.guardar('favoritos', f);
            return { success: true, favorito: !existe };
        } catch (e) { return { success: false }; }
    };

    Database.prototype.getMetas = function(uid) {
        var m = this.cargar('metas');
        return (m && m.metas || []).filter(function(x) { return x.usuario_id === uid; });
    };

    Database.prototype.addMeta = function(datos) {
        try {
            if (!datos.usuario_id || !datos.titulo) return { success: false, error: 'Datos incompletos' };
            var metas = this.cargar('metas');
            var nueva = {
                id: this._generateId(), usuario_id: datos.usuario_id,
                titulo: datos.titulo.trim(), descripcion: datos.descripcion || '',
                progreso: 0, completada: false, fecha_inicio: new Date().toISOString().split('T')[0]
            };
            if (!metas.metas) metas.metas = [];
            metas.metas.push(nueva);
            this.guardar('metas', metas);
            return { success: true, data: nueva };
        } catch (e) { return { success: false, error: 'Error: ' + e.message }; }
    };

    Database.prototype.getMisiones = function() {
        var m = this.cargar('misiones');
        return (m && m.misiones || []);
    };

    Database.prototype.getTestimonios = function() {
        var t = this.cargar('testimonios');
        return (t && t.testimonios || []);
    };

    Database.prototype.getGrupos = function() {
        var g = this.cargar('grupos');
        return (g && g.grupos || []);
    };

    Database.prototype.getInsignias = function() {
        var i = this.cargar('insignias');
        return (i && i.insignias || []);
    };

    Database.prototype.exportarTodo = function() {
        var datos = {};
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && k.indexOf(this.prefix) === 0) {
                try { datos[k] = JSON.parse(localStorage.getItem(k)); } catch (e) {}
            }
        }
        return { version: this.version, fecha: new Date().toISOString(), datos: datos };
    };

    Database.prototype.importarTodo = function(exportData) {
        try {
            if (!exportData || !exportData.datos) return { success: false, error: 'Datos invalidos' };
            var datos = exportData.datos;
            var keys = Object.keys(datos);
            for (var i = 0; i < keys.length; i++) {
                if (keys[i].indexOf(this.prefix) === 0) {
                    this._safeSetItem(keys[i], JSON.stringify(datos[keys[i]]));
                }
            }
            this.cache = {};
            this.lastCacheUpdate = {};
            return { success: true };
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
        return { success: true };
    };

    Database.prototype.getLogs = function(limit) {
        limit = limit || 50;
        var l = this.cargar('logs');
        return (l && l.logs || []).slice(0, limit);
    };

    Database.prototype.inicializarDatos = function() {
        var archivos = ['usuarios', 'administradores', 'publicaciones', 'comentarios',
            'reacciones', 'noticias', 'eventos', 'asistencia', 'notificaciones',
            'peticiones', 'chat', 'directorio', 'configuracion', 'reportes',
            'biblioteca', 'galeria', 'encuestas', 'podcast', 'versiculos',
            'horarios', 'donaciones', 'favoritos', 'metas', 'misiones',
            'testimonios', 'grupos', 'insignias', 'logs'];
        for (var i = 0; i < archivos.length; i++) {
            var clave = this._getKey(archivos[i]);
            if (!localStorage.getItem(clave)) this._crearDefecto(archivos[i]);
        }
        this._inicializarDefectos();
        this.initialized = true;
    };

    Database.prototype._inicializarDefectos = function() {
        var h = this.cargar('horarios');
        if (!h.cultos || h.cultos.length === 0) {
            h.cultos = [
                { dia: "Domingo", cultos: [{ nombre: "Culto Dominical", inicio: "10:00", fin: "12:00" }] },
                { dia: "Martes", cultos: [{ nombre: "Culto de Oracion", inicio: "18:00", fin: "20:30" }] },
                { dia: "Viernes", cultos: [{ nombre: "Culto de Jovenes", inicio: "18:00", fin: "20:30" }] }
            ];
            this.guardar('horarios', h);
        }

        var v = this.cargar('versiculos');
        if (!v.versiculos || v.versiculos.length === 0) {
            v.versiculos = [
                { id: 1, texto: "Porque de tal manera amo Dios al mundo...", referencia: "Juan 3:16" },
                { id: 2, texto: "Jehova es mi pastor; nada me faltara.", referencia: "Salmos 23:1" },
                { id: 3, texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13" }
            ];
            v.ultimo_id = 3;
            this.guardar('versiculos', v);
        }

        var i = this.cargar('insignias');
        if (!i.insignias || i.insignias.length === 0) {
            i.insignias = [
                { id: 1, nombre: "Nuevo Miembro", icono: "bx-user-plus", color: "#2196f3" },
                { id: 2, nombre: "Miembro Activo", icono: "bx-star", color: "#ff9800" },
                { id: 3, nombre: "Lider", icono: "bx-crown", color: "#ffd700" },
                { id: 4, nombre: "Cuenta Verificada", icono: "bx-badge-check", color: "#2196f3" }
            ];
            i.ultimo_id = 4;
            this.guardar('insignias', i);
        }

        var c = this.cargar('configuracion');
        if (!c.iglesia || !c.iglesia.nombre) {
            c.iglesia = {
                nombre: "IPUC LA FONDA",
                lema: "Donde el Espiritu Santo se mueve",
                direccion: "Cali, Valle del Cauca, Colombia",
                telefono: "+57 312 881 3818",
                correo: "ipuclafonda@gmail.com"
            };
            c.aplicacion = {
                version: this.version,
                registro_abierto: true,
                primer_administrador_creado: false
            };
            this.guardar('configuracion', c);
        }
    };

    return Database;
})();

if (typeof window !== 'undefined') {
    if (!window.db) {
        window.db = new Database();
        window.db.inicializarDatos();
    }
    window.Database = Database;
}
