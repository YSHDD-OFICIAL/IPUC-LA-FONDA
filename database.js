/* ============================================
   IPUC LA FONDA - DATABASE v22.1 PRO PREMIUM
   Sistema de Base de Datos en localStorage
   Incluye: Radio, Streaming, Gamificación, Logros, QR, Asistente
   + Respaldo automático, Papelera, Código Maestro de Recuperación
   + CUENTA OFICIAL DEL ADMINISTRADOR + Cambio de contraseña
   "Donde el Espíritu Santo se mueve"
   ============================================ */

class Database {
    constructor() {
        this.prefix = 'ipuc20_';
        this.cache = new Map();
        this.cacheTimeout = 600000; // 10 minutos en ms
        this.version = '22.1';                       // ═══ v22.2 ═══
        this.versionName = 'PRO PREMIUM';            // ═══ v22.2 ═══
        this.initialized = false;
        this.backupInterval = 300000; // 5 minutos
        this.maxCacheSize = 100;

        // ═══ v22.2: Datos de la cuenta oficial ═══
        this.CUENTA_OFICIAL = {
            correo: 'ipuclafonda@gmail.com',
            usuario: 'ipuclafonda',
            passwordTextoPlano: null, // NUNCA se guarda (solo para doc)
            hashOficial: '2d8f8a1e'   // ⚠️ Hash de IPUCLAFONDA2027
                                      // Verifica con: db.hashPassword('IPUCLAFONDA2027')
        };

        this._startAutoBackup();
    }

    // ============================================
    // UTILIDADES BÁSICAS
    // ============================================

    _getKey(name) {
        return this.prefix + name;
    }

    _isValidKey(name) {
        return /^[a-zA-Z0-9_-]+$/.test(name);
    }

    _isObject(obj) {
        return obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
    }

    _cloneDeep(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (e) {
            return obj;
        }
    }

    _generateId() {
        return Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    }

    _safeSetItem(key, value) {
        try {
            localStorage.setItem(key, value);
            this._updateCache(key, value);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                this._liberarEspacio();
                try {
                    localStorage.setItem(key, value);
                    this._updateCache(key, value);
                    return true;
                } catch (e) {
                    return false;
                }
            }
            return false;
        }
    }

    _updateCache(key, value) {
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, {
            data: value,
            timestamp: Date.now()
        });
    }

    _getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    _liberarEspacio() {
        try {
            const backups = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.includes(this.prefix + 'backup_')) {
                    backups.push(k);
                }
            }
            backups.sort((a, b) => b.localeCompare(a));
            for (let j = 3; j < backups.length; j++) {
                localStorage.removeItem(backups[j]);
            }

            const collectionsToTrim = ['logs', 'notificaciones', 'chat', 'mensajes'];
            collectionsToTrim.forEach(coll => {
                try {
                    const data = this.cargar(coll);
                    if (data) {
                        const arrays = ['logs', 'notificaciones', 'mensajes', 'registros'];
                        arrays.forEach(arr => {
                            if (data[arr] && data[arr].length > 50) {
                                data[arr] = arr === 'mensajes' ? data[arr].slice(-50) : data[arr].slice(0, 50);
                            }
                        });
                        this.guardar(coll, data);
                    }
                } catch (e) {}
            });

            this.cache.clear();
        } catch (e) {}
    }

    // ============================================
    // OPERACIONES CRUD BÁSICAS
    // ============================================

    cargar(nombre) {
        if (!this._isValidKey(nombre)) return null;

        const clave = this._getKey(nombre);

        const cached = this._getFromCache(clave);
        if (cached !== null) {
            return this._cloneDeep(cached);
        }

        try {
            const datos = localStorage.getItem(clave);
            if (!datos || datos === 'null') return this._crearDefecto(nombre);

            const parsed = JSON.parse(datos);
            this._updateCache(clave, parsed);
            return parsed;
        } catch (e) {
            return this._crearDefecto(nombre);
        }
    }

    guardar(nombre, datos) {
        if (!this._isValidKey(nombre) || !this._isObject(datos)) return false;

        const clave = this._getKey(nombre);

        try {
            const anterior = localStorage.getItem(clave);
            if (anterior) this._crearRespaldo(nombre, anterior);

            if (this._safeSetItem(clave, JSON.stringify(datos))) {
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    eliminar(nombre, id) {
        if (!this._isValidKey(nombre) || !id) return false;

        const col = this.cargar(nombre);
        if (!col) return false;

        let encontrado = false;
        const keys = Object.keys(col);

        for (const key of keys) {
            const val = col[key];
            if (Array.isArray(val)) {
                const filtrado = val.filter(item => item.id !== id);
                if (filtrado.length !== val.length) {
                    col[key] = filtrado;
                    encontrado = true;
                    break;
                }
            }
        }

        if (!encontrado) return false;
        return this.guardar(nombre, col);
    }

    _crearRespaldo(nombre, datos) {
        try {
            const ts = new Date().toISOString().replace(/[:.]/g, '-');
            this._safeSetItem(this.prefix + 'backup_' + nombre + '_' + ts, datos);
        } catch (e) {}
    }

    _startAutoBackup() {
        setInterval(() => {
            try {
                const nombres = this._getAllNames();
                nombres.forEach(nombre => {
                    const datos = this.cargar(nombre);
                    if (datos) this._crearRespaldo(nombre, JSON.stringify(datos));
                });
            } catch (e) {}
        }, this.backupInterval);
    }

    _getAllNames() {
        const cols = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(this.prefix) && !k.includes('backup_')) {
                cols.push(k.replace(this.prefix, ''));
            }
        }
        return cols;
    }

    _crearDefecto(nombre) {
        const defs = {
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
            'mensajes': { mensajes: [], ultimo_id: 0 },
            // ═══ v22.1: Respaldo y recuperación ═══
            '_papelera': { items: [], ultimo_id: 0 },
            '_meta_recuperacion': {
                codigo_maestro: null,
                fecha_generacion: null,
                usos: 0,
                ultimo_uso: null
            },
            '_meta_respaldo': {
                ultimo_respaldo_manual: null,
                ultimo_respaldo_auto: null,
                total_respaldos: 0
            }
        };

        if (defs[nombre]) {
            const clave = this._getKey(nombre);
            if (!localStorage.getItem(clave)) {
                this._safeSetItem(clave, JSON.stringify(defs[nombre]));
            }
            return defs[nombre];
        }

        return { datos: [], ultimo_id: 0 };
    }

    // ============================================
    // AUTENTICACIÓN Y USUARIOS
    // ============================================

    hashPassword(pw) {
        if (!pw || typeof pw !== 'string') return '00000000';

        let h = 0;
        const salt = 'ipuc20_salt_2026';
        const str = pw + salt;

        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) - h) + str.charCodeAt(i);
            h = h & h;
        }

        return Math.abs(h).toString(16).padStart(8, '0');
    }

    _validarCorreo(c) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
    }

    _validarPassword(p) {
        return p && p.length >= 8;
    }

    // ═══ v22.2: Crea la cuenta oficial del administrador ═══
    /**
     * Crea la cuenta oficial del administrador principal.
     * - Solo se crea si NO existe ya un admin con ese correo.
     * - NO sobrescribe otros admins.
     * - Usa hash pre-calculado (nunca guarda la contraseña en texto plano).
     * - Genera el código maestro automáticamente si Storage está disponible.
     */
    _crearCuentaOficial() {
        try {
            const admins = this.cargar('administradores');

            // Verificar si ya existe la cuenta oficial (por correo)
            const yaExiste = (admins.administradores || []).some(
                a => a.correo === this.CUENTA_OFICIAL.correo
            );

            if (yaExiste) {
                return {
                    success: false,
                    motivo: 'La cuenta oficial ya existe',
                    correo: this.CUENTA_OFICIAL.correo
                };
            }

            // ═══ v22.2: Verificar si el hash es válido ═══
            let hashFinal = this.CUENTA_OFICIAL.hashOficial;
            const testHash = this.hashPassword('IPUCLAFONDA2027');

            if (hashFinal !== testHash) {
                // Fallback: si el hash pre-calculado no coincide, calcularlo al vuelo
                console.warn(
                    '⚠️ [Database] El hash pre-calculado no coincide. ' +
                    'Usando hash al vuelo. ' +
                    `Esperado: ${testHash}, en código: ${hashFinal}`
                );
                hashFinal = testHash;
            }

            // Determinar el próximo ID disponible
            const ultimoId = (admins.administradores || []).reduce(
                (max, a) => Math.max(max, a.id || 0), 0
            );
            const nuevoId = ultimoId + 1;

            const adminOficial = {
                id: nuevoId,
                nombre: 'Administrador',
                apellidos: 'IPUC LA FONDA',
                correo: this.CUENTA_OFICIAL.correo,
                usuario: this.CUENTA_OFICIAL.usuario,
                password: hashFinal,
                rol: 'admin',
                verificado: true,
                fecha_registro: new Date().toISOString(),
                estado: 'activo',
                ministerio: 'Pastoral',
                foto: 'assets/avatars/admin.png',
                esAdminInicial: true,
                esAdminOficial: true,                  // ═══ v22.2 ═══
                passwordCambiada: false,                // ═══ v22.2 ═══
                nivel: 1,
                xp: 0,
                logros: [],
                codigo_maestro_generado: false
            };

            if (!admins.administradores) admins.administradores = [];
            admins.administradores.push(adminOficial);
            admins.ultimo_id = nuevoId;

            if (!this.guardar('administradores', admins)) {
                return { success: false, error: 'No se pudo guardar el administrador' };
            }

            console.log('✅ [Database] Cuenta oficial del administrador creada:', adminOficial.correo);

            // ═══ v22.2: Generar código maestro automáticamente ═══
            setTimeout(() => {
                try {
                    if (window.Storage && typeof window.Storage.generarCodigoMaestro === 'function') {
                        const codigo = window.Storage.generarCodigoMaestro();
                        if (codigo) {
                            console.log('🔑 [Database] Código maestro generado automáticamente:', codigo);
                            console.log('   ⚠️ GUÁRDALO en un lugar seguro. No se mostrará de nuevo.');
                        }
                    }
                } catch (e) {
                    console.warn('Error generando código maestro para cuenta oficial:', e);
                }
            }, 800);

            return { success: true, data: adminOficial };
        } catch (e) {
            console.error('❌ Error creando cuenta oficial:', e);
            return { success: false, error: e.message };
        }
    }

    /**
     * Verifica si un usuario es la cuenta oficial.
     */
    esCuentaOficial(usuarioOCorreo) {
        if (!usuarioOCorreo) return false;
        const valor = String(usuarioOCorreo).toLowerCase();
        return valor === this.CUENTA_OFICIAL.correo.toLowerCase() ||
               valor === this.CUENTA_OFICIAL.usuario.toLowerCase();
    }

    /**
     * Devuelve advertencia si la cuenta oficial aún usa la contraseña por defecto.
     */
    getAdvertenciaCuentaOficial() {
        try {
            const admins = this.cargar('administradores');
            const oficial = (admins.administradores || []).find(a => a.esAdminOficial);

            if (!oficial) {
                return {
                    existe: false,
                    advertencia: null,
                    mensaje: 'La cuenta oficial no existe'
                };
            }

            if (oficial.passwordCambiada) {
                return {
                    existe: true,
                    advertencia: false,
                    mensaje: 'La cuenta oficial tiene contraseña personalizada ✅'
                };
            }

            return {
                existe: true,
                advertencia: true,
                mensaje: '⚠️ La cuenta oficial usa la contraseña por defecto. ' +
                         'Cámbiala desde Mi Perfil → Cambiar contraseña.'
            };
        } catch (e) {
            return { existe: false, advertencia: null, error: e.message };
        }
    }

    // ═══ v22.2: Cambiar contraseña del admin/usuarios ═══
    /**
     * Permite cambiar la contraseña de un usuario.
     * @param {string|number} usuarioId - ID del usuario
     * @param {string} passwordActual - Contraseña actual (verificación)
     * @param {string} passwordNueva - Nueva contraseña (mín. 8 caracteres)
     * @returns {{success: boolean, error?: string, esOficial?: boolean}}
     */
    cambiarPassword(usuarioId, passwordActual, passwordNueva) {
        try {
            // Validaciones
            if (!usuarioId) {
                return { success: false, error: 'ID de usuario requerido' };
            }
            if (!passwordActual || !passwordNueva) {
                return { success: false, error: 'Contraseñas requeridas' };
            }
            if (!this._validarPassword(passwordNueva)) {
                return { success: false, error: 'Contraseña nueva mínimo 8 caracteres' };
            }
            if (passwordActual === passwordNueva) {
                return { success: false, error: 'La nueva contraseña debe ser diferente' };
            }

            const hashActual = this.hashPassword(passwordActual);
            const hashNuevo = this.hashPassword(passwordNueva);

            // Buscar en administradores
            const admins = this.cargar('administradores');
            const adminIdx = (admins.administradores || []).findIndex(a => a.id === usuarioId);

            if (adminIdx >= 0) {
                const admin = admins.administradores[adminIdx];

                if (admin.password !== hashActual) {
                    return { success: false, error: 'Contraseña actual incorrecta' };
                }

                admin.password = hashNuevo;
                admin.passwordCambiada = true;      // ═══ v22.2 ═══
                admin.fecha_cambio_password = new Date().toISOString();

                if (this.guardar('administradores', admins)) {
                    console.log('✅ [Database] Contraseña de administrador actualizada:', admin.usuario);
                    return {
                        success: true,
                        esOficial: admin.esAdminOficial || false,
                        mensaje: 'Contraseña actualizada correctamente'
                    };
                }
                return { success: false, error: 'Error al guardar' };
            }

            // Buscar en usuarios
            const usuarios = this.cargar('usuarios');
            const userIdx = (usuarios.usuarios || []).findIndex(u => u.id === usuarioId);

            if (userIdx >= 0) {
                const user = usuarios.usuarios[userIdx];

                if (user.password !== hashActual) {
                    return { success: false, error: 'Contraseña actual incorrecta' };
                }

                user.password = hashNuevo;
                user.fecha_cambio_password = new Date().toISOString();

                if (this.guardar('usuarios', usuarios)) {
                    console.log('✅ [Database] Contraseña de usuario actualizada:', user.usuario);
                    return {
                        success: true,
                        esOficial: false,
                        mensaje: 'Contraseña actualizada correctamente'
                    };
                }
                return { success: false, error: 'Error al guardar' };
            }

            return { success: false, error: 'Usuario no encontrado' };
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    crearPrimerAdministrador(datos) {
        try {
            const admins = this.cargar('administradores');

            if (admins.administradores && admins.administradores.length > 0) {
                return { success: false, error: 'Ya existe un administrador' };
            }

            if (!datos.nombre || !datos.correo || !datos.usuario || !datos.password) {
                return { success: false, error: 'Campos obligatorios' };
            }

            if (!this._validarCorreo(datos.correo)) {
                return { success: false, error: 'Correo inválido' };
            }

            if (!this._validarPassword(datos.password)) {
                return { success: false, error: 'Contraseña mínima 8 caracteres' };
            }

            const admin = {
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
                foto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKYAAACUCAMAAAAu5KLjAAAANlBMVEXl5uivtLi9wsWssbXo6euprrKyt7vc3uDT1tnf4ePY2923vL/Bxci6vsKttLrQ09bIy87R1NMZNpqKAAAECElEQVR4nO2b23LcIAxAAclgbDD0/3+22N402ZsX0K5wM5ynTiYzPREIAxJCdDqdTqfT6XQ6nU6n0/mdIH7/C49+sSGIdgzRKe+9cjFM9oSmyTF6LeEbqVUU5zJFG+YB5C0w+FGcRhRFmO8dd1Hw4SQRxVE/kdxF9XQCTzTqQHI3dba16HEovzzn1gGNsCwvNSXI0NTTvQ7lzhDbeWK2pVygnefL5LmKp2vjibHEMk3QJvMT/5RZJhrkO06lkhK0ZdcUvjiYEhR3OEsn5sWTe3payFjV75l5h71gxbwOZ2TVLM+fnQVYw1kZzDWcjLPT1lom+DRrZ+YWTr5kR10fzEVxWYqJMOZSGyZLdATLNOpMmtaTNLk2dIYwNROax1KMlKmZ9sdMK3wgao4so05ZNVeYPkRYsdO8gieHKIv7hudJ9f9Ek2gpZx5N4tTk0qw6XvBrEi2ZNMmZzqQ5EzV5TutYdMN1D9dXqOom4ZuB6ZhB3Xowbd9rD+kXgMdSWFqqMy2bhbfEd8Hkup+h5RBMTJq0AzDfpRw+K1HmBJOvUoCEQxtwXsDr6l0SW56vVCcRXwKt1C6dMHNa1q9JI6tm2nTmVH7vgsl3a3jRrFo7gb/+XzHsXFu4K4q/7OD4JQUW1gkWYK5dfXkW7juhUUsSjgWxXNr1+eA45Is2bJ7BKaO9Zxtw3bQJDU3Wng5884Yp9aITaVmWgbfu+xAcXwQUfOuerg20EZ6JLnKQ4Ty9kW5tMHsQSKm5ampZoAhKw3VQAbQ7UZfpDgozOg3DFzDH0Z5NcgdRWDOGECZjz9yqfUNroVtWJTONMUZ3aSh3MY6TESeR3Yc5rumzTch/WQT7D6T2awd800m69uNHNd9m+M2alNDehTbN+un/NHFOC2PW1mP9O7SbuGOKdnL6QT/+MQOoYNhUEY2bl6pzehp/xfTttEEfzcVj0mYKIH48pGhi5kb4MKbqo9MUhaNLbqLSf6yTAq0rzprnDPNHtiUo0nBTa78/SUNv3u6JE7VS+UBUvvnwgVYVHHWzWd77SCfrGUslb6wYuKxnLDWkY6d+zwxFQ+07esU7jksVrwVKeUeBnViVzvOk3nVj/Lyk3AoclIBSGxHyPT3Fk8sypfxcfRnGFku5XXlXalIKqDWelXn0+ZXoxrOq0GEJRfM6oGIPSu55rfEsrsggx7J+hy/VJPa2V1L8wkB9aEt0TOGrJ9616KdmUTciuUWznoLtPIZmlkXPiUhPWIjk96xMTfJnJ/+bSX10QfTMjmZLy+wHMK1WowuQ+RYCVUvLRN4ST2x2pZM16gwn3mPyzsMN1/aLpsoZdc4T0GPyGoGIjwTo5L1rbbBtvyavx9OpxvisaN4VctnJsex0Or+Pv0+WNhUXOXRxAAAAAElFTkSuQmCC',
                esAdminInicial: true,
                nivel: 1,
                xp: 0,
                logros: [],
                passwordCambiada: false,
                codigo_maestro_generado: false
            };

            if (!admins.administradores) admins.administradores = [];
            admins.administradores.push(admin);
            admins.ultimo_id = 1;

            if (this.guardar('administradores', admins)) {
                this._notificarCodigoMaestro();

                const config = this.cargar('configuracion');
                if (config && config.aplicacion) {
                    config.aplicacion.primer_administrador_creado = true;
                    this.guardar('configuracion', config);
                }
                return { success: true, data: admin };
            }

            return { success: false, error: 'Error al guardar' };
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    _notificarCodigoMaestro() {
        setTimeout(() => {
            try {
                if (window.Storage && typeof window.Storage.generarCodigoMaestro === 'function') {
                    const codigo = window.Storage.generarCodigoMaestro();

                    const admins = this.cargar('administradores');
                    if (admins.administradores && admins.administradores[0]) {
                        admins.administradores[0].codigo_maestro_generado = true;
                        this.guardar('administradores', admins);
                    }

                    if (typeof window.mostrarModalCodigoMaestro === 'function') {
                        window.mostrarModalCodigoMaestro(codigo);
                    } else {
                        alert(
                            '⚠️ GUARDA ESTE CÓDIGO DE RECUPERACIÓN\n\n' +
                            'Código: ' + codigo + '\n\n' +
                            'Lo necesitarás si olvidas tu contraseña o se borran los datos del navegador.\n\n' +
                            'Guárdalo en un lugar seguro (papel, gestor de contraseñas, correo).'
                        );
                    }
                }
            } catch (e) {
                console.error('Error generando código maestro:', e);
            }
        }, 500);
    }

    login(usuario, password) {
        try {
            if (!usuario || !password) {
                return { success: false, error: 'Credenciales requeridas' };
            }

            const hash = this.hashPassword(password);
            const usuarioLower = usuario.toLowerCase().trim();

            // Buscar en administradores
            const admins = this.cargar('administradores');
            if (admins.administradores) {
                const admin = admins.administradores.find(a =>
                    (a.usuario === usuarioLower || a.correo === usuarioLower) && a.password === hash
                );

                if (admin) {
                    if (admin.estado !== 'activo') {
                        return { success: false, error: 'Cuenta desactivada' };
                    }

                    // ═══ v22.2: Advertencia en localhost para cuenta oficial ═══
                    if (admin.esAdminOficial && !admin.passwordCambiada) {
                        const hostname = (typeof window !== 'undefined' && window.location)
                            ? window.location.hostname
                            : 'unknown';
                        if (hostname === 'localhost' || hostname === '127.0.0.1') {
                            console.warn(
                                '⚠️ [Database] Iniciando sesión con la cuenta oficial ' +
                                'que usa la contraseña por defecto. ' +
                                'Cámbiala antes de desplegar a producción.'
                            );
                        }
                    }

                    return {
                        success: true,
                        token: 't20_' + Date.now(),
                        rol: 'admin',
                        esCuentaOficial: admin.esAdminOficial || false, // ═══ v22.2 ═══
                        passwordCambiada: admin.passwordCambiada || false, // ═══ v22.2 ═══
                        usuario: {
                            id: admin.id,
                            nombre: admin.nombre,
                            apellidos: admin.apellidos,
                            correo: admin.correo,
                            usuario: admin.usuario,
                            rol: admin.rol,
                            foto: admin.foto,
                            ministerio: admin.ministerio,
                            nivel: admin.nivel || 1,
                            xp: admin.xp || 0,
                            logros: admin.logros || [],
                            esCuentaOficial: admin.esAdminOficial || false,
                            passwordCambiada: admin.passwordCambiada || false
                        }
                    };
                }
            }

            // Buscar en usuarios
            const usuarios = this.cargar('usuarios');
            if (usuarios.usuarios) {
                const user = usuarios.usuarios.find(u =>
                    (u.usuario === usuarioLower || u.correo === usuarioLower) && u.password === hash
                );

                if (user) {
                    if (user.estado !== 'activo') {
                        return { success: false, error: 'Cuenta desactivada' };
                    }

                    return {
                        success: true,
                        token: 't20_' + Date.now(),
                        rol: 'usuario',
                        esCuentaOficial: false,
                        passwordCambiada: true,
                        usuario: {
                            id: user.id,
                            nombre: user.nombre,
                            apellidos: user.apellidos,
                            correo: user.correo,
                            usuario: user.usuario,
                            rol: user.rol,
                            foto: user.foto,
                            ministerio: user.ministerio,
                            celular: user.celular,
                            nivel: user.nivel || 1,
                            xp: user.xp || 0,
                            logros: user.logros || []
                        }
                    };
                }
            }

            return { success: false, error: 'Credenciales inválidas' };
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    registrarUsuario(datos) {
        try {
            if (!datos.nombre || !datos.correo || !datos.usuario || !datos.password) {
                return { success: false, error: 'Campos obligatorios' };
            }

            if (!this._validarCorreo(datos.correo)) {
                return { success: false, error: 'Correo inválido' };
            }

            if (!this._validarPassword(datos.password)) {
                return { success: false, error: 'Contraseña mínima 8 caracteres' };
            }

            // ═══ v22.2: Proteger el correo/usuario oficial ═══
            if (this.esCuentaOficial(datos.correo) || this.esCuentaOficial(datos.usuario)) {
                return {
                    success: false,
                    error: 'Este correo/usuario está reservado para la cuenta oficial'
                };
            }

            const usuarios = this.cargar('usuarios');

            if (usuarios.usuarios) {
                const correoExiste = usuarios.usuarios.some(u => u.correo === datos.correo.toLowerCase());
                if (correoExiste) return { success: false, error: 'Correo ya registrado' };

                const usuarioExiste = usuarios.usuarios.some(u => u.usuario === datos.usuario.toLowerCase());
                if (usuarioExiste) return { success: false, error: 'Usuario ya existe' };
            }

            const nuevo = {
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
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    // ============================================
    // PUBLICACIONES Y COMENTARIOS
    // ============================================

    getPublicaciones(limit = 50) {
        const p = this.cargar('publicaciones');
        return (p && p.publicaciones || []).slice(0, limit);
    }

    addPublicacion(datos) {
        try {
            if (!datos.autor || !datos.contenido) {
                return { success: false, error: 'Datos incompletos' };
            }

            const pub = this.cargar('publicaciones');
            const nueva = {
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

            if (pub.publicaciones.length > 100) {
                pub.publicaciones = pub.publicaciones.slice(0, 100);
            }

            pub.ultimo_id = nueva.id;
            this.guardar('publicaciones', pub);

            return { success: true, data: nueva };
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    getComentarios(pubId = null) {
        const c = this.cargar('comentarios');
        const lista = (c && c.comentarios || []);
        return pubId ? lista.filter(x => x.publicacion_id === pubId) : lista;
    }

    addComentario(datos) {
        try {
            if (!datos.publicacion_id || !datos.autor || !datos.contenido) {
                return { success: false, error: 'Datos incompletos' };
            }

            const com = this.cargar('comentarios');
            const nuevo = {
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

            if (com.comentarios.length > 500) {
                com.comentarios = com.comentarios.slice(-500);
            }

            this.guardar('comentarios', com);
            return { success: true, data: nuevo };
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    toggleReaccion(pubId, userId, tipo) {
        try {
            const reacciones = this.cargar('reacciones');
            if (!reacciones.reacciones) reacciones.reacciones = {};

            const clave = pubId + '_' + userId;

            if (reacciones.reacciones[clave] === tipo) {
                delete reacciones.reacciones[clave];
            } else {
                reacciones.reacciones[clave] = tipo;
            }

            this.guardar('reacciones', reacciones);
            return { success: true };
        } catch (e) {
            return { success: false };
        }
    }

    // ============================================
    // NOTICIAS Y EVENTOS
    // ============================================

    getNoticias(limit = 50) {
        const n = this.cargar('noticias');
        return (n && n.noticias || []).slice(0, limit);
    }

    addNoticia(datos) {
        try {
            if (!datos.titulo || !datos.contenido) {
                return { success: false, error: 'Datos incompletos' };
            }

            const noticias = this.cargar('noticias');
            const nueva = {
                id: this._generateId(),
                titulo: datos.titulo.trim(),
                contenido: datos.contenido.trim().substring(0, 5000),
                fecha_publicacion: new Date().toISOString(),
                estado: 'publicado',
                autor: datos.autor || 'Admin'
            };

            if (!noticias.noticias) noticias.noticias = [];
            noticias.noticias.unshift(nueva);

            if (noticias.noticias.length > 100) {
                noticias.noticias = noticias.noticias.slice(0, 100);
            }

            this.guardar('noticias', noticias);
            return { success: true, data: nueva };
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    getEventos() {
        const e = this.cargar('eventos');
        return (e && e.eventos || []).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    }

    addEvento(datos) {
        try {
            if (!datos.titulo || !datos.fecha) {
                return { success: false, error: 'Datos incompletos' };
            }

            const eventos = this.cargar('eventos');
            const nuevo = {
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
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    eliminarEvento(id) {
        if (window.Storage && typeof window.Storage.eliminarConRespaldo === 'function') {
            return window.Storage.eliminarConRespaldo('eventos', id, 'Admin');
        }
        return this.eliminar('eventos', id);
    }

    // ============================================
    // ASISTENCIA
    // ============================================

    getAsistencia() {
        const a = this.cargar('asistencia');
        return (a && a.registros || []);
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
                fecha: new Date().toISOString().split('T')[0],
                estado: datos.estado || 'Asistiré',
                tipo: datos.tipo || 'Hermano'
            };

            if (!asistencia.registros) asistencia.registros = [];
            asistencia.registros.push(nuevo);
            this.guardar('asistencia', asistencia);

            return { success: true, data: nuevo };
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    // ============================================
    // ORACIONES Y BENDICIONES
    // ============================================

    getOraciones() {
        const o = this.cargar('oraciones');
        return (o && o.oraciones || []).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    addOracion(datos) {
        try {
            if (!datos.motivo) return { success: false, error: 'Motivo requerido' };

            const oraciones = this.cargar('oraciones');
            const nueva = {
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
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    orarOracion(id) {
        try {
            const oraciones = this.cargar('oraciones');
            const oracion = oraciones.oraciones?.find(o => o.id === id);

            if (oracion) {
                oracion.oraciones_count = (oracion.oraciones_count || 0) + 1;
                this.guardar('oraciones', oraciones);
                return { success: true };
            }

            return { success: false };
        } catch (e) {
            return { success: false };
        }
    }

    getBendiciones() {
        const b = this.cargar('bendiciones');
        return (b && b.bendiciones || []).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    addBendicion(datos) {
        try {
            if (!datos.mensaje) return { success: false, error: 'Mensaje requerido' };

            const bendiciones = this.cargar('bendiciones');
            const nueva = {
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
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    // ============================================
    // PETICIONES
    // ============================================

    getPeticiones() {
        const p = this.cargar('peticiones');
        return (p && p.peticiones || []).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    addPeticion(datos) {
        try {
            if (!datos.nombre || !datos.motivo) {
                return { success: false, error: 'Datos incompletos' };
            }

            const peticiones = this.cargar('peticiones');
            const nueva = {
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
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    orarPeticion(id) {
        try {
            const peticiones = this.cargar('peticiones');
            const peticion = peticiones.peticiones?.find(p => p.id === id);

            if (peticion) {
                peticion.oraciones = (peticion.oraciones || 0) + 1;
                this.guardar('peticiones', peticiones);
                return { success: true };
            }

            return { success: false };
        } catch (e) {
            return { success: false };
        }
    }

    // ============================================
    // CHAT Y MENSAJES
    // ============================================

    getMensajes(limit = 50) {
        const c = this.cargar('chat');
        return ((c && c.mensajes) || []).slice(-limit);
    }

    addMensaje(datos) {
        try {
            if (!datos.usuario || !datos.mensaje) {
                return { success: false, error: 'Datos incompletos' };
            }

            const chat = this.cargar('chat');
            const nuevo = {
                id: this._generateId(),
                usuario: datos.usuario,
                usuario_id: datos.usuario_id || 0,
                mensaje: datos.mensaje.trim().substring(0, 500),
                fecha: new Date().toISOString()
            };

            if (!chat.mensajes) chat.mensajes = [];
            chat.mensajes.push(nuevo);

            if (chat.mensajes.length > 200) {
                chat.mensajes = chat.mensajes.slice(-200);
            }

            this.guardar('chat', chat);
            return { success: true, data: nuevo };
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    // ============================================
    // LOGROS Y GAMIFICACIÓN
    // ============================================

    getLogros() {
        const l = this.cargar('logros');
        return (l && l.logros || []);
    }

    getLogrosUsuario(usuarioId) {
        return this.getLogros().filter(l => l.usuario_id === usuarioId);
    }

    desbloquearLogro(usuarioId, logroId, datos = {}) {
        try {
            const logros = this.cargar('logros');
            const existe = logros.logros?.some(l =>
                l.usuario_id === usuarioId && l.logro_id === logroId
            );

            if (existe) return { success: false, error: 'Logro ya desbloqueado' };

            const nuevo = {
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

            this.agregarXP(usuarioId, datos.xp || 10);

            return { success: true, data: nuevo };
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    agregarXP(usuarioId, cantidad) {
        try {
            const usuarios = this.cargar('usuarios');
            let user = usuarios.usuarios?.find(u => u.id === usuarioId);

            if (user) {
                user.xp = (user.xp || 0) + cantidad;
                let xp = user.xp;
                let nivel = user.nivel || 1;
                let xpNecesario = 100;

                while (xp >= xpNecesario) {
                    xp -= xpNecesario;
                    nivel++;
                    xpNecesario = Math.floor(xpNecesario * 1.5);
                }

                user.nivel = nivel;
                this.guardar('usuarios', usuarios);
                return { success: true };
            }

            const admins = this.cargar('administradores');
            const admin = admins.administradores?.find(a => a.id === usuarioId);

            if (admin) {
                admin.xp = (admin.xp || 0) + cantidad;
                let xp = admin.xp;
                let nivel = admin.nivel || 1;
                let xpNecesario = 100;

                while (xp >= xpNecesario) {
                    xp -= xpNecesario;
                    nivel++;
                    xpNecesario = Math.floor(xpNecesario * 1.5);
                }

                admin.nivel = nivel;
                this.guardar('administradores', admins);
                return { success: true };
            }

            return { success: false, error: 'Usuario no encontrado' };
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    getRanking(limit = 10) {
        const ranking = this.cargar('ranking');
        return (ranking && ranking.puntajes || [])
            .sort((a, b) => (b.puntos || 0) - (a.puntos || 0))
            .slice(0, limit);
    }

    addPuntajeRanking(datos) {
        try {
            if (!datos.usuario_id || !datos.puntos) {
                return { success: false, error: 'Datos incompletos' };
            }

            const ranking = this.cargar('ranking');
            const existente = ranking.puntajes?.find(r => r.usuario_id === datos.usuario_id);

            if (existente) {
                existente.puntos += datos.puntos;
                existente.fecha_actualizacion = new Date().toISOString();
            } else {
                if (!ranking.puntajes) ranking.puntajes = [];
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
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    // ============================================
    // DIARIO ESPIRITUAL Y LECTURA BÍBLICA
    // ============================================

    getDiarioEspiritual(usuarioId = null) {
        const d = this.cargar('diario-espiritual');
        const entradas = (d && d.entradas || []);
        return usuarioId ? entradas.filter(e => e.usuario_id === usuarioId) : entradas;
    }

    addEntradaDiario(datos) {
        try {
            if (!datos.usuario_id || !datos.contenido) {
                return { success: false, error: 'Datos incompletos' };
            }

            const diario = this.cargar('diario-espiritual');
            const nueva = {
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
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    getProgresoLectura(usuarioId) {
        const l = this.cargar('lectura-biblica');
        const progreso = (l && l.progreso || []);

        if (usuarioId) {
            return progreso.find(p => p.usuario_id === usuarioId) || {
                usuario_id: usuarioId,
                completados: 0,
                total: 365,
                fecha_inicio: new Date().toISOString()
            };
        }

        return progreso;
    }

    marcarLecturaCompletada(usuarioId, fecha = null) {
        try {
            const lectura = this.cargar('lectura-biblica');
            if (!lectura.progreso) lectura.progreso = [];

            let progreso = lectura.progreso.find(p => p.usuario_id === usuarioId);

            if (progreso) {
                progreso.completados = (progreso.completados || 0) + 1;
                progreso.ultima_lectura = fecha || new Date().toISOString();
            } else {
                progreso = {
                    id: this._generateId(),
                    usuario_id: usuarioId,
                    completados: 1,
                    total: 365,
                    fecha_inicio: new Date().toISOString(),
                    ultima_lectura: fecha || new Date().toISOString()
                };
                lectura.progreso.push(progreso);
            }

            this.guardar('lectura-biblica', lectura);

            if (progreso.completados >= 10) {
                this.desbloquearLogro(usuarioId, 'bible_reader', {
                    nombre: 'Lector de la Biblia',
                    descripcion: 'Has leído 10 capítulos',
                    icono: '📖',
                    xp: 25
                });
            }

            return { success: true };
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    // ============================================
    // HIMNARIO, PLAYLIST Y RADIO
    // ============================================

    getCanciones() {
        const h = this.cargar('himnario');
        return (h && h.canciones || []);
    }

    addCancion(datos) {
        try {
            if (!datos.titulo || !datos.artista) {
                return { success: false, error: 'Datos incompletos' };
            }

            const himnario = this.cargar('himnario');
            const nueva = {
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
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    getPlaylists() {
        const p = this.cargar('playlist');
        return (p && p.listas || []);
    }

    addPlaylist(datos) {
        try {
            if (!datos.nombre) return { success: false, error: 'Nombre requerido' };

            const playlist = this.cargar('playlist');
            const nueva = {
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
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    getEstacionesRadio() {
        const r = this.cargar('radio');
        return (r && r.estaciones || []);
    }

    addEstacionRadio(datos) {
        try {
            if (!datos.nombre || !datos.url) {
                return { success: false, error: 'Datos incompletos' };
            }

            const radio = this.cargar('radio');
            const nueva = {
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
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    getHistorialRadio(limit = 20) {
        const r = this.cargar('radio');
        return (r && r.historial || []).slice(-limit);
    }

    addHistorialRadio(datos) {
        try {
            if (!datos.cancion) return { success: false };

            const radio = this.cargar('radio');
            const nueva = {
                id: this._generateId(),
                cancion: datos.cancion.trim(),
                artista: datos.artista || '',
                fecha: new Date().toISOString()
            };

            if (!radio.historial) radio.historial = [];
            radio.historial.push(nueva);

            if (radio.historial.length > 50) {
                radio.historial = radio.historial.slice(-50);
            }

            this.guardar('radio', radio);
            return { success: true };
        } catch (e) {
            return { success: false };
        }
    }

    // ============================================
    // STREAMING Y QR
    // ============================================

    getTransmisiones() {
        const s = this.cargar('streaming');
        return (s && s.transmisiones || []).sort((a, b) =>
            new Date(b.fecha_inicio) - new Date(a.fecha_inicio)
        );
    }

    addTransmision(datos) {
        try {
            if (!datos.titulo) return { success: false, error: 'Título requerido' };

            const streaming = this.cargar('streaming');
            const nueva = {
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
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    getQRCodes() {
        const q = this.cargar('qr-codes');
        return (q && q.codigos || []);
    }

    addQRCode(datos) {
        try {
            if (!datos.url || !datos.titulo) return { success: false };

            const qr = this.cargar('qr-codes');
            const nuevo = {
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
        } catch (e) {
            return { success: false };
        }
    }

    // ============================================
    // REPORTES
    // ============================================

    getReportes(filtros = {}) {
        const r = this.cargar('reportes');
        let lista = (r && r.reportes || []);

        if (filtros.estado) lista = lista.filter(x => x.estado === filtros.estado);
        if (filtros.tipo) lista = lista.filter(x => x.tipo === filtros.tipo);
        if (filtros.urgencia) lista = lista.filter(x => x.urgencia === filtros.urgencia);

        return lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    getReporte(id) {
        const r = this.cargar('reportes');
        return (r && r.reportes || []).find(x => x.id === id) || null;
    }

    getReportesPendientes() {
        return this.getReportes({ estado: 'pendiente' });
    }

    addReporte(datos) {
        try {
            if (!datos.tipo || !datos.descripcion) {
                return { success: false, error: 'Datos incompletos' };
            }

            const reportes = this.cargar('reportes');
            const nuevo = {
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

            if (reportes.reportes.length > 100) {
                reportes.reportes = reportes.reportes.slice(0, 100);
            }

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
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    cambiarEstadoReporte(id, nuevoEstado, admin = 'Admin', comentario = '') {
        try {
            const reportes = this.cargar('reportes');
            const reporte = reportes.reportes?.find(r => r.id === id);

            if (!reporte) return { success: false };

            reporte.estado = nuevoEstado;

            if (nuevoEstado === 'resuelto' || nuevoEstado === 'desestimado') {
                reporte.fecha_resolucion = new Date().toISOString();
            }

            if (!reporte.historial) reporte.historial = [];
            reporte.historial.push({
                estado: nuevoEstado,
                fecha: new Date().toISOString(),
                usuario: admin,
                comentario: comentario || 'Estado: ' + nuevoEstado
            });

            this.guardar('reportes', reportes);
            return { success: true, data: reporte };
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    deleteReporte(id) {
        if (window.Storage && typeof window.Storage.eliminarConRespaldo === 'function') {
            return window.Storage.eliminarConRespaldo('reportes', id, 'Admin');
        }
        return this.eliminar('reportes', id);
    }

    getEstadisticasReportes() {
        const r = this.cargar('reportes');
        const lista = (r && r.reportes || []);

        return {
            total: lista.length,
            pendientes: lista.filter(x => x.estado === 'pendiente').length,
            en_revision: lista.filter(x => x.estado === 'en_revision').length,
            resueltos: lista.filter(x => x.estado === 'resuelto').length,
            desestimados: lista.filter(x => x.estado === 'desestimado').length
        };
    }

    // ============================================
    // NOTIFICACIONES
    // ============================================

    _agregarNotificacion(datos) {
        try {
            const notif = this.cargar('notificaciones');
            const nueva = {
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
    }

    getNotificaciones(limit = 50) {
        const n = this.cargar('notificaciones');
        return (n && n.notificaciones || []).slice(0, limit);
    }

    getNoLeidas() {
        return this.getNotificaciones().filter(n => !n.leida).length;
    }

    marcarLeidas() {
        try {
            const n = this.cargar('notificaciones');

            if (n && n.notificaciones) {
                n.notificaciones.forEach(notif => notif.leida = true);
                this.guardar('notificaciones', n);
                return { success: true };
            }

            return { success: false };
        } catch (e) {
            return { success: false };
        }
    }

    // ============================================
    // ASISTENTE VIRTUAL
    // ============================================

    getConversaciones(usuarioId = null) {
        const a = this.cargar('asistente');
        const convs = (a && a.conversaciones || []);
        return usuarioId ? convs.filter(c => c.usuario_id === usuarioId) : convs;
    }

    addConversacion(datos) {
        try {
            if (!datos.usuario_id || !datos.mensaje) return { success: false };

            const asistente = this.cargar('asistente');
            const nueva = {
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
        } catch (e) {
            return { success: false };
        }
    }

    // ============================================
    // JUEGOS Y TRIVIA
    // ============================================

    getPreguntasTrivia() {
        const t = this.cargar('trivia');
        return (t && t.preguntas || []);
    }

    addPreguntaTrivia(datos) {
        try {
            if (!datos.pregunta || !datos.opciones || datos.respuesta === undefined) {
                return { success: false, error: 'Datos incompletos' };
            }

            const trivia = this.cargar('trivia');
            const nueva = {
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
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    getPartidasJuego(usuarioId = null) {
        const j = this.cargar('juegos');
        const partidas = (j && j.partidas || []);
        return usuarioId ? partidas.filter(p => p.usuario_id === usuarioId) : partidas;
    }

    addPartidaJuego(datos) {
        try {
            if (!datos.usuario_id || !datos.puntaje) return { success: false };

            const juegos = this.cargar('juegos');
            const nueva = {
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

            this.addPuntajeRanking({
                usuario_id: datos.usuario_id,
                nombre: datos.nombre || 'Usuario',
                puntos: datos.puntaje
            });

            return { success: true, data: nueva };
        } catch (e) {
            return { success: false };
        }
    }

    // ============================================
    // CONFIGURACIÓN Y ESTADÍSTICAS
    // ============================================

    getConfiguracion() {
        return this.cargar('configuracion');
    }

    getConfiguracionIglesia() {
        const c = this.getConfiguracion();
        return (c && c.iglesia) ? c.iglesia : {};
    }

    getHorarios() {
        const h = this.cargar('horarios');
        return (h && h.cultos || []);
    }

    getVersiculos() {
        const v = this.cargar('versiculos');
        return (v && v.versiculos || []);
    }

    getVersiculoDiario() {
        const versiculos = this.getVersiculos();
        if (versiculos.length === 0) return null;

        const idx = new Date().getDate() % versiculos.length;
        return versiculos[idx] || versiculos[0];
    }

    getDonaciones() {
        const d = this.cargar('donaciones');
        return (d && d.donaciones || []);
    }

    addDonacion(datos) {
        try {
            if (!datos.monto) return { success: false, error: 'Monto requerido' };

            const donaciones = this.cargar('donaciones');
            const nueva = {
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
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    getEstadisticas() {
        return {
            usuarios: (this.cargar('usuarios').usuarios || []).length,
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
    }

    getEstadoSistema() {
        try {
            const papelera = this.cargar('_papelera');
            const metaRec = this.cargar('_meta_recuperacion');
            const metaResp = this.cargar('_meta_respaldo');

            let bytesUsados = 0;
            let totalColecciones = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith(this.prefix) && !k.includes('backup_')) {
                    bytesUsados += (localStorage.getItem(k) || '').length * 2;
                    totalColecciones++;
                }
            }

            // ═══ v22.2: Info de la cuenta oficial ═══
            const advertenciaOficial = this.getAdvertenciaCuentaOficial();

            return {
                version: this.version,
                versionName: this.versionName,
                totalColecciones: totalColecciones,
                espacioUsado: bytesUsados,
                espacioFormateado: this._formatBytes(bytesUsados),
                papeleraCount: (papelera && papelera.items) ? papelera.items.length : 0,
                ultimoRespaldoManual: metaResp ? metaResp.ultimo_respaldo_manual : null,
                ultimoRespaldoAuto: metaResp ? metaResp.ultimo_respaldo_auto : null,
                codigoMaestroGenerado: !!(metaRec && metaRec.codigo_maestro),
                codigoMaestroUsos: metaRec ? (metaRec.usos || 0) : 0,
                cuentaOficial: {
                    existe: advertenciaOficial.existe,
                    tieneAdvertencia: advertenciaOficial.advertencia,
                    mensaje: advertenciaOficial.mensaje
                }
            };
        } catch (e) {
            return { error: e.message };
        }
    }

    _formatBytes(b) {
        if (b < 1024) return b + ' B';
        if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
        return (b / 1048576).toFixed(2) + ' MB';
    }

    verificarIntegridad() {
        const reporte = {
            valido: true,
            errores: [],
            advertencias: [],
            colecciones: {},
            totalRegistros: 0
        };

        try {
            const nombres = this._getAllNames();

            nombres.forEach(nombre => {
                if (nombre.startsWith('backup_')) return;

                try {
                    const datos = this.cargar(nombre);
                    if (!datos) {
                        reporte.advertencias.push(`Colección "${nombre}" vacía o inexistente`);
                        return;
                    }

                    let registros = 0;
                    Object.keys(datos).forEach(key => {
                        if (Array.isArray(datos[key])) {
                            registros += datos[key].length;
                        }
                    });

                    reporte.colecciones[nombre] = registros;
                    reporte.totalRegistros += registros;
                } catch (e) {
                    reporte.errores.push(`Error en "${nombre}": ${e.message}`);
                    reporte.valido = false;
                }
            });

            const admins = this.cargar('administradores');
            if (!admins.administradores || admins.administradores.length === 0) {
                reporte.advertencias.push('No hay administradores registrados');
            }

            // ═══ v22.2: Verificar cuenta oficial ═══
            const advOficial = this.getAdvertenciaCuentaOficial();
            if (!advOficial.existe) {
                reporte.advertencias.push('La cuenta oficial no existe');
            } else if (advOficial.advertencia) {
                reporte.advertencias.push(advOficial.mensaje);
            }

            const metaRec = this.cargar('_meta_recuperacion');
            if (!metaRec || !metaRec.codigo_maestro) {
                reporte.advertencias.push('No se ha generado el código maestro de recuperación');
            }

        } catch (e) {
            reporte.errores.push('Error general: ' + e.message);
            reporte.valido = false;
        }

        return reporte;
    }

    // ============================================
    // EXPORTACIÓN E IMPORTACIÓN
    // ============================================

    exportarTodo() {
        const datos = {};

        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(this.prefix) && !k.includes('backup_')) {
                try {
                    datos[k] = JSON.parse(localStorage.getItem(k));
                } catch (e) {}
            }
        }

        return {
            version: this.version,
            versionName: this.versionName,
            fecha: new Date().toISOString(),
            datos: datos,
            metadata: {
                total_items: Object.keys(datos).length,
                exportado_por: 'IPUC LA FONDA',
                iglesia: 'IPUC LA FONDA',
                lema: 'Donde el Espíritu Santo se mueve'
            }
        };
    }

    importarTodo(exportData) {
        try {
            if (!exportData || !exportData.datos) {
                return { success: false, error: 'Datos inválidos' };
            }

            const datos = exportData.datos;
            const keys = Object.keys(datos);

            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    this._safeSetItem(key, JSON.stringify(datos[key]));
                }
            });

            this.cache.clear();
            this.initialized = false;
            this.inicializarDatos();

            try {
                const meta = this.cargar('_meta_respaldo');
                meta.ultimo_respaldo_manual = new Date().toISOString();
                meta.total_respaldos = (meta.total_respaldos || 0) + 1;
                this.guardar('_meta_respaldo', meta);
            } catch (e) {}

            return { success: true, items_importados: keys.length };
        } catch (e) {
            return { success: false, error: 'Error: ' + e.message };
        }
    }

    limpiarTodo() {
        const keys = [];

        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(this.prefix)) keys.push(k);
        }

        keys.forEach(k => localStorage.removeItem(k));

        this.cache.clear();
        this.initialized = false;
        this.inicializarDatos();

        return { success: true, items_eliminados: keys.length };
    }

    getLogs(limit = 50) {
        const l = this.cargar('logs');
        return (l && l.logs || []).slice(0, limit);
    }

    // Métodos adicionales para compatibilidad
    getRecursos() {
        const b = this.cargar('biblioteca');
        return (b && b.recursos || []);
    }

    getPodcast() {
        const p = this.cargar('podcast');
        return (p && p.episodios || []);
    }

    getEncuestas() {
        const e = this.cargar('encuestas');
        return (e && e.encuestas || []);
    }

    getDirectorio() {
        const d = this.cargar('directorio');
        return (d && d.miembros || []);
    }

    getGrupos() {
        const g = this.cargar('grupos');
        return (g && g.grupos || []);
    }

    getMisiones() {
        const m = this.cargar('misiones');
        return (m && m.misiones || []);
    }

    getTestimonios() {
        const t = this.cargar('testimonios');
        return (t && t.testimonios || []);
    }

    agregarTestimonio(usuarioId, datos = {}) {
        try {
            const t = this.cargar('testimonios');
            if (!t.testimonios) t.testimonios = [];

            const nuevo = {
                id: (t.ultimo_id || 0) + 1,
                usuario_id: usuarioId,
                autor: datos.autor || 'Anónimo',
                titulo: datos.titulo || 'Testimonio',
                contenido: datos.contenido || '',
                fecha: new Date().toISOString(),
                likes: 0
            };

            t.testimonios.unshift(nuevo);
            t.ultimo_id = nuevo.id;
            this.guardar('testimonios', t);

            return { success: true, data: nuevo };
        } catch (e) {
            return { success: false, error: 'Error al guardar el testimonio: ' + e.message };
        }
    }

    getInsignias() {
        const i = this.cargar('insignias');
        return (i && i.insignias || []);
    }

    getFavoritos(usuarioId = null) {
        const f = this.cargar('favoritos');
        const favoritos = (f && f.favoritos || []);
        return usuarioId ? favoritos.filter(x => x.usuario_id === usuarioId) : favoritos;
    }

    getMetas(usuarioId = null) {
        const m = this.cargar('metas');
        const metas = (m && m.metas || []);
        return usuarioId ? metas.filter(x => x.usuario_id === usuarioId) : metas;
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================

    inicializarDatos() {
        const collections = [
            'usuarios', 'administradores', 'publicaciones', 'comentarios',
            'reacciones', 'noticias', 'eventos', 'asistencia', 'notificaciones',
            'peticiones', 'chat', 'directorio', 'configuracion', 'reportes',
            'biblioteca', 'galeria', 'encuestas', 'podcast', 'versiculos',
            'horarios', 'donaciones', 'favoritos', 'metas', 'misiones',
            'testimonios', 'grupos', 'insignias', 'logs',
            'oraciones', 'bendiciones', 'logros', 'diario-espiritual',
            'lectura-biblica', 'concordancia', 'himnario', 'playlist',
            'radio', 'streaming', 'qr-codes', 'asistente',
            'juegos', 'trivia', 'ranking', 'mensajes',
            '_papelera', '_meta_recuperacion', '_meta_respaldo'
        ];

        collections.forEach(coll => {
            const clave = this._getKey(coll);
            if (!localStorage.getItem(clave)) {
                this._crearDefecto(coll);
            }
        });

        this._inicializarDefectos();
        this.initialized = true;

        this._purgarPapeleraAutomatica();
    }

    _purgarPapeleraAutomatica() {
        try {
            const papelera = this.cargar('_papelera');
            if (!papelera || !papelera.items || papelera.items.length === 0) return;

            const ahora = new Date();
            const antes = papelera.items.length;

            papelera.items = papelera.items.filter(item => {
                if (!item.expira) return true;
                return new Date(item.expira) > ahora;
            });

            const purgados = antes - papelera.items.length;
            if (purgados > 0) {
                this.guardar('_papelera', papelera);
                console.log(`🗑️ Papelera: ${purgados} elementos expirados eliminados`);
            }
        } catch (e) {
            console.warn('Error purgando papelera:', e);
        }
    }

    _inicializarDefectos() {
        // Horarios por defecto
        const horarios = this.cargar('horarios');
        if (!horarios.cultos || horarios.cultos.length === 0) {
            horarios.cultos = [
                { dia: "Domingo", cultos: [{ nombre: "Culto Dominical", inicio: "10:00", fin: "12:00" }] },
                { dia: "Martes", cultos: [{ nombre: "Culto de Oración", inicio: "18:00", fin: "20:30" }] },
                { dia: "Viernes", cultos: [{ nombre: "Culto de Jóvenes", inicio: "18:00", fin: "20:30" }] },
                { dia: "Sábado", cultos: [{ nombre: "Escuela Bíblica", inicio: "16:00", fin: "18:00" }] }
            ];
            this.guardar('horarios', horarios);
        }

        // Versículos por defecto
        const versiculos = this.cargar('versiculos');
        if (!versiculos.versiculos || versiculos.versiculos.length === 0) {
            versiculos.versiculos = [
                { id: 1, texto: "Porque de tal manera amó Dios al mundo...", referencia: "Juan 3:16" },
                { id: 2, texto: "Jehová es mi pastor; nada me faltará.", referencia: "Salmos 23:1" },
                { id: 3, texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13" },
                { id: 4, texto: "El Señor es mi luz y mi salvación; ¿de quién temeré?", referencia: "Salmos 27:1" },
                { id: 5, texto: "No temas, porque yo estoy contigo...", referencia: "Isaías 41:10" }
            ];
            versiculos.ultimo_id = 5;
            this.guardar('versiculos', versiculos);
        }

        // Insignias por defecto
        const insignias = this.cargar('insignias');
        if (!insignias.insignias || insignias.insignias.length === 0) {
            insignias.insignias = [
                { id: 1, nombre: "Nuevo Miembro", icono: "bx-user-plus", color: "#2196f3" },
                { id: 2, nombre: "Miembro Activo", icono: "bx-star", color: "#ff9800" },
                { id: 3, nombre: "Líder", icono: "bx-crown", color: "#ffd700" },
                { id: 4, nombre: "Cuenta Verificada", icono: "bx-badge-check", color: "#2196f3" },
                { id: 5, nombre: "Orador Constante", icono: "bx-pray", color: "#4caf50" },
                { id: 6, nombre: "Comparte Testimonio", icono: "bx-heart", color: "#e91e63" }
            ];
            insignias.ultimo_id = 6;
            this.guardar('insignias', insignias);
        }

        // Configuración por defecto
        const config = this.cargar('configuracion');
        if (!config.iglesia || !config.iglesia.nombre) {
            config.iglesia = {
                nombre: "IPUC LA FONDA",
                lema: "Donde el Espíritu Santo se mueve",
                direccion: "Cali, Valle del Cauca, Colombia",
                telefono: "+57 312 881 3818",
                correo: "ipuclafonda@gmail.com",
                fundacion: "2020",
                horario_cultos: "Domingo 10:00 AM"
            };
            config.aplicacion = {
                version: this.version,
                versionName: this.versionName,
                registro_abierto: true,
                primer_administrador_creado: false,
                fecha_instalacion: new Date().toISOString(),
                respaldo_automatico: true,
                papelera_activa: true,
                codigo_maestro_activo: true
            };
            this.guardar('configuracion', config);
        }

        // Preguntas de Trivia por defecto
        const trivia = this.cargar('trivia');
        if (!trivia.preguntas || trivia.preguntas.length === 0) {
            trivia.preguntas = [
                { id: this._generateId(), pregunta: "¿Quién construyó el arca?", opciones: ["Moisés", "Noé", "Abraham", "David"], respuesta: 1, categoria: "Antiguo Testamento", dificultad: "facil" },
                { id: this._generateId(), pregunta: "¿Cuántos libros tiene la Biblia?", opciones: ["66", "73", "39", "27"], respuesta: 0, categoria: "General", dificultad: "facil" },
                { id: this._generateId(), pregunta: "¿Quién fue el primer rey de Israel?", opciones: ["David", "Salomón", "Saúl", "Josué"], respuesta: 2, categoria: "Antiguo Testamento", dificultad: "media" },
                { id: this._generateId(), pregunta: "¿En qué ciudad nació Jesús?", opciones: ["Jerusalén", "Belén", "Nazaret", "Cafarnaúm"], respuesta: 1, categoria: "Nuevo Testamento", dificultad: "facil" },
                { id: this._generateId(), pregunta: "¿Quién dividió el Mar Rojo?", opciones: ["Josué", "Moisés", "Abraham", "Elías"], respuesta: 1, categoria: "Antiguo Testamento", dificultad: "media" },
                { id: this._generateId(), pregunta: "¿Cuántos discípulos tuvo Jesús?", opciones: ["7", "10", "12", "14"], respuesta: 2, categoria: "Nuevo Testamento", dificultad: "facil" },
                { id: this._generateId(), pregunta: "¿Qué animal habló en la Biblia?", opciones: ["Burro", "Serpiente", "Paloma", "León"], respuesta: 0, categoria: "Antiguo Testamento", dificultad: "media" },
                { id: this._generateId(), pregunta: "¿Quién escribió el libro de Apocalipsis?", opciones: ["Pedro", "Juan", "Pablo", "Mateo"], respuesta: 1, categoria: "Nuevo Testamento", dificultad: "dificil" }
            ];
            trivia.ultimo_id = trivia.preguntas.length;
            this.guardar('trivia', trivia);
        }

        // Canciones por defecto
        const himnario = this.cargar('himnario');
        if (!himnario.canciones || himnario.canciones.length === 0) {
            himnario.canciones = [
                { id: this._generateId(), titulo: "Santo Espíritu", artista: "IPUC LA FONDA", duracion: "4:32", genero: "Adoración" },
                { id: this._generateId(), titulo: "Alabanzas al Rey", artista: "IPUC LA FONDA", duracion: "5:15", genero: "Alabanza" },
                { id: this._generateId(), titulo: "Adoración Profunda", artista: "IPUC LA FONDA", duracion: "6:08", genero: "Adoración" },
                { id: this._generateId(), titulo: "Glorioso Día", artista: "IPUC LA FONDA", duracion: "4:45", genero: "Alabanza" },
                { id: this._generateId(), titulo: "Cordero de Dios", artista: "IPUC LA FONDA", duracion: "5:20", genero: "Adoración" },
                { id: this._generateId(), titulo: "Grande es el Señor", artista: "IPUC LA FONDA", duracion: "4:55", genero: "Alabanza" }
            ];
            himnario.ultimo_id = himnario.canciones.length;
            this.guardar('himnario', himnario);
        }

        // Estaciones de Radio por defecto
        const radio = this.cargar('radio');
        if (!radio.estaciones || radio.estaciones.length === 0) {
            radio.estaciones = [
                { id: this._generateId(), nombre: "Radio IPUC", url: "https://radio.ipuc.com/stream", genero: "Cristiana", activa: true },
                { id: this._generateId(), nombre: "Alabanza Global", url: "https://alabanza.com/stream", genero: "Alabanza", activa: true },
                { id: this._generateId(), nombre: "Adoración Profunda", url: "https://adoracion.com/stream", genero: "Adoración", activa: true }
            ];
            radio.ultimo_id = radio.estaciones.length;
            this.guardar('radio', radio);
        }

        // ═══ v22.2: Crear cuenta oficial del administrador ═══
        this._crearCuentaOficial();
    }
}

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
            console.log('📊 ' + Object.keys(window.db.getEstadisticas()).length + ' estadísticas disponibles');
            console.log('🗄️ ' + window.db._getAllNames().length + ' colecciones activas');
            console.log('🛡️ Papelera: ' + (window.db.cargar('_papelera').items || []).length + ' elementos');
            console.log('🔑 Código maestro: ' + (window.db.cargar('_meta_recuperacion').codigo_maestro ? 'Generado' : 'No generado'));
            // ═══ v22.2: Log de cuenta oficial ═══
            const admins = window.db.cargar('administradores');
            const oficial = (admins.administradores || []).find(a => a.esAdminOficial);
            if (oficial) {
                console.log('👑 Cuenta oficial: ' + oficial.correo + ' (' + (oficial.passwordCambiada ? 'contraseña personalizada ✅' : '⚠️ contraseña por defecto') + ')');
            } else {
                console.log('ℹ️ Cuenta oficial no creada (probablemente ya hay otros admins)');
            }
        } catch (e) {
            console.error('❌ Error inicializando Database:', e);
        }
    }
    window.Database = Database;
}

/* ============================================
   FINAL DEL DATABASE v22.1 PRO PREMIUM
   IPUC LA FONDA - International Pentecostal Church
   "Donde el Espíritu Santo se mueve"
   ============================================ */
