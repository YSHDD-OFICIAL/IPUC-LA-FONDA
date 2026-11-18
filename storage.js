/* ============================================
   IPUC LA FONDA - STORAGE.JS v1.0
   Extiende window.db sin modificarlo.
   Añade: papelera, snapshots (IndexedDB),
   código maestro, respaldo manual, puente
   APP_STATE ↔ DB, y panel de backup.
   "Donde el Espíritu Santo se mueve"
   ============================================ */

const Storage = {
    // ═════════════════════════════════════════
    // CONFIGURACIÓN
    // ═════════════════════════════════════════
    DB_NAME: 'ipuc_snapshots',
    DB_VERSION: 1,
    STORE_SNAPSHOTS: 'snapshots',
    PREFIX: 'ipuc20_',
    PAPELERA_DIAS: 30,
    MAX_SNAPSHOTS: 10,

    // ═════════════════════════════════════════
    // 1. PUENTE APP_STATE ↔ DB
    //    (Resuelve el problema de pérdida de datos
    //     en publicaciones, peticiones, etc.)
    // ═════════════════════════════════════════

    persistirPublicacion(datos) {
        const db = window.db;
        if (!db) return { success: false, error: 'DB no disponible' };
        try {
            const r = db.addPublicacion({
                autor: datos.autor,
                contenido: datos.contenido,
                usuario_id: datos.usuario_id || 0
            });
            if (r.success && window.APP_STATE) {
                window.APP_STATE.publicaciones = db.getPublicaciones();
            }
            return r;
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    persistirPeticion(datos) {
        const db = window.db;
        if (!db) return { success: false, error: 'DB no disponible' };
        try {
            const r = db.addPeticion({
                nombre: datos.nombre,
                motivo: datos.motivo,
                usuario_id: datos.usuario_id || 0
            });
            if (r.success && window.APP_STATE) {
                window.APP_STATE.peticiones = db.getPeticiones();
            }
            return r;
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    persistirOracion(datos) {
        const db = window.db;
        if (!db) return { success: false, error: 'DB no disponible' };
        try {
            const r = db.addOracion({
                nombre: datos.nombre,
                motivo: datos.motivo,
                usuario_id: datos.usuario_id || 0
            });
            if (r.success && window.APP_STATE) {
                window.APP_STATE.oraciones = db.getOraciones();
            }
            return r;
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    persistirBendicion(datos) {
        const db = window.db;
        if (!db) return { success: false, error: 'DB no disponible' };
        try {
            const r = db.addBendicion({
                nombre: datos.nombre,
                mensaje: datos.mensaje,
                usuario_id: datos.usuario_id || 0
            });
            if (r.success && window.APP_STATE) {
                window.APP_STATE.bendiciones = db.getBendiciones();
            }
            return r;
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    persistirMensajeChat(datos) {
        const db = window.db;
        if (!db) return { success: false, error: 'DB no disponible' };
        try {
            const r = db.addMensaje({
                usuario: datos.autor,
                mensaje: datos.mensaje,
                usuario_id: datos.usuario_id || 0
            });
            if (r.success && window.APP_STATE) {
                window.APP_STATE.chatMessages = db.getMensajes();
            }
            return r;
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    persistirEntradaDiario(datos) {
        const db = window.db;
        if (!db) return { success: false, error: 'DB no disponible' };
        try {
            const r = db.addEntradaDiario({
                usuario_id: datos.usuario_id || 0,
                fecha: datos.fecha,
                contenido: datos.contenido
            });
            if (r.success && window.APP_STATE) {
                window.APP_STATE.diaryEntries = db.getDiarioEspiritual();
            }
            return r;
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    persistirEvento(datos) {
        const db = window.db;
        if (!db) return { success: false, error: 'DB no disponible' };
        try {
            const r = db.addEvento({
                titulo: datos.titulo,
                descripcion: datos.desc || datos.descripcion,
                fecha: datos.fecha,
                hora: datos.hora,
                lugar: datos.lugar,
                tipo: datos.tipo
            });
            if (r.success && window.APP_STATE) {
                window.APP_STATE.eventos = db.getEventos();
            }
            return r;
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    /**
     * Sincroniza TODO APP_STATE con la DB persistente.
     * Llamar al iniciar la app (después de DOMContentLoaded).
     */
    sincronizarAppState() {
        const db = window.db;
        if (!db || !window.APP_STATE) {
            console.warn('⚠️ No se puede sincronizar: db o APP_STATE no disponible');
            return;
        }
        try {
            const usuarioId = APP_STATE.usuario?.id || 0;

            APP_STATE.publicaciones = db.getPublicaciones();
            APP_STATE.peticiones = db.getPeticiones();
            APP_STATE.oraciones = db.getOraciones();
            APP_STATE.bendiciones = db.getBendiciones();
            APP_STATE.chatMessages = db.getMensajes();
            APP_STATE.eventos = db.getEventos();
            APP_STATE.reportes = db.getReportes();
            APP_STATE.diaryEntries = usuarioId
                ? db.getDiarioEspiritual(usuarioId)
                : db.getDiarioEspiritual();
            APP_STATE.logrosDesbloqueados = db.getLogros()
                .filter(l => l.usuario_id === usuarioId)
                .map(l => l.logro_id);

            console.log('✅ APP_STATE sincronizado con DB');
        } catch (e) {
            console.error('❌ Error sincronizando APP_STATE:', e);
        }
    },

    // ═════════════════════════════════════════
    // 2. PAPELERA (soft delete)
    //    Los registros eliminados se conservan
    //    30 días y se pueden restaurar.
    // ═════════════════════════════════════════

    /**
     * Elimina un registro de una colección pero lo guarda en papelera.
     * @param {string} coleccion - Nombre de la colección (ej: 'eventos', 'reportes')
     * @param {string|number} id - ID del registro a eliminar
     * @param {string} usuario - Nombre del usuario que elimina
     * @returns {{success: boolean, data?: object, error?: string}}
     */
    eliminarConRespaldo(coleccion, id, usuario = 'Sistema') {
        const db = window.db;
        if (!db) return { success: false, error: 'DB no disponible' };
        try {
            const col = db.cargar(coleccion);
            if (!col) return { success: false, error: 'Colección no existe' };

            let itemEliminado = null;
            let arrayKey = null;

            // Buscar el ítem en cualquier array de la colección
            for (const key of Object.keys(col)) {
                if (Array.isArray(col[key])) {
                    const idx = col[key].findIndex(x => x.id === id);
                    if (idx >= 0) {
                        itemEliminado = col[key][idx];
                        arrayKey = key;
                        col[key].splice(idx, 1);
                        break;
                    }
                }
            }

            if (!itemEliminado) {
                return { success: false, error: 'Registro no encontrado' };
            }

            // Añadir a papelera
            const papelera = db.cargar('_papelera') || { items: [], ultimo_id: 0 };
            const entry = {
                id: 'del_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5),
                coleccion,
                arrayKey,
                item: itemEliminado,
                eliminadoPor: usuario,
                fechaEliminacion: new Date().toISOString(),
                expira: new Date(Date.now() + this.PAPELERA_DIAS * 86400000).toISOString()
            };
            papelera.items.unshift(entry);

            // Limitar a 200 items en papelera
            if (papelera.items.length > 200) {
                papelera.items = papelera.items.slice(0, 200);
            }
            papelera.ultimo_id = entry.id;

            db.guardar('_papelera', papelera);
            db.guardar(coleccion, col);

            return { success: true, data: { id: entry.id, item: itemEliminado } };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    listarPapelera() {
        const db = window.db;
        if (!db) return [];
        try {
            const p = db.cargar('_papelera');
            return (p && p.items) || [];
        } catch (e) {
            return [];
        }
    },

    restaurarDePapelera(idPapelera) {
        const db = window.db;
        if (!db) return { success: false, error: 'DB no disponible' };
        try {
            const papelera = db.cargar('_papelera');
            if (!papelera || !papelera.items) {
                return { success: false, error: 'Papelera vacía' };
            }

            const idx = papelera.items.findIndex(x => x.id === idPapelera);
            if (idx < 0) return { success: false, error: 'Registro no está en papelera' };

            const entry = papelera.items[idx];
            const col = db.cargar(entry.coleccion);
            if (!col[entry.arrayKey]) col[entry.arrayKey] = [];
            col[entry.arrayKey].push(entry.item);

            db.guardar(entry.coleccion, col);

            // Quitar de papelera
            papelera.items.splice(idx, 1);
            db.guardar('_papelera', papelera);

            return { success: true, data: entry.item };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    vaciarPapelera() {
        const db = window.db;
        if (!db) return { success: false };
        try {
            db.guardar('_papelera', { items: [], ultimo_id: 0 });
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    purgarPapeleraVieja() {
        const db = window.db;
        if (!db) return { purgados: 0 };
        try {
            const papelera = db.cargar('_papelera');
            if (!papelera || !papelera.items) return { purgados: 0 };

            const ahora = new Date();
            const antes = papelera.items.length;
            papelera.items = papelera.items.filter(x => {
                if (!x.expira) return true;
                return new Date(x.expira) > ahora;
            });

            const purgados = antes - papelera.items.length;
            if (purgados > 0) {
                db.guardar('_papelera', papelera);
            }
            return { purgados };
        } catch (e) {
            return { purgados: 0 };
        }
    },

    // ═════════════════════════════════════════
    // 3. SNAPSHOTS (IndexedDB)
    //    Copias completas del estado en puntos
    //    concretos. Se conservan los últimos 10.
    // ═════════════════════════════════════════

    _openDB() {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                reject(new Error('IndexedDB no soportado'));
                return;
            }
            const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            req.onerror = () => reject(req.error);
            req.onsuccess = () => resolve(req.result);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.STORE_SNAPSHOTS)) {
                    db.createObjectStore(this.STORE_SNAPSHOTS, { keyPath: 'id' });
                }
            };
        });
    },

    async crearSnapshot(nombre = null) {
        const db = window.db;
        if (!db) return { success: false, error: 'DB no disponible' };
        try {
            const idx = await this._openDB();
            const data = db.exportarTodo();

            const snapshot = {
                id: 'snap_' + Date.now(),
                nombre: nombre || 'Punto de restauración ' + new Date().toLocaleString('es-CO'),
                fecha: new Date().toISOString(),
                tamaño: JSON.stringify(data).length,
                datos: data
            };

            await new Promise((resolve, reject) => {
                const tx = idx.transaction(this.STORE_SNAPSHOTS, 'readwrite');
                tx.objectStore(this.STORE_SNAPSHOTS).add(snapshot);
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });

            await this._podarSnapshots(idx);
            idx.close();

            return { success: true, data: { id: snapshot.id, nombre: snapshot.nombre } };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    async _podarSnapshots(idx) {
        try {
            const todos = await new Promise((resolve, reject) => {
                const tx = idx.transaction(this.STORE_SNAPSHOTS, 'readonly');
                const req = tx.objectStore(this.STORE_SNAPSHOTS).getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => reject(req.error);
            });

            todos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            if (todos.length > this.MAX_SNAPSHOTS) {
                const sobrantes = todos.slice(this.MAX_SNAPSHOTS);
                for (const s of sobrantes) {
                    await new Promise((resolve) => {
                        const tx = idx.transaction(this.STORE_SNAPSHOTS, 'readwrite');
                        tx.objectStore(this.STORE_SNAPSHOTS).delete(s.id);
                        tx.oncomplete = resolve;
                    });
                }
            }
        } catch (e) {
            console.warn('Error podando snapshots:', e);
        }
    },

    async listarSnapshots() {
        try {
            const idx = await this._openDB();
            const todos = await new Promise((resolve, reject) => {
                const tx = idx.transaction(this.STORE_SNAPSHOTS, 'readonly');
                const req = tx.objectStore(this.STORE_SNAPSHOTS).getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => reject(req.error);
            });
            idx.close();

            return todos
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                .map(s => ({
                    id: s.id,
                    nombre: s.nombre,
                    fecha: s.fecha,
                    tamaño: s.tamaño
                }));
        } catch (e) {
            return [];
        }
    },

    async restaurarSnapshot(id) {
        try {
            const idx = await this._openDB();
            const snapshot = await new Promise((resolve, reject) => {
                const tx = idx.transaction(this.STORE_SNAPSHOTS, 'readonly');
                const req = tx.objectStore(this.STORE_SNAPSHOTS).get(id);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
            idx.close();

            if (!snapshot) return { success: false, error: 'Snapshot no encontrado' };

            const r = window.db.importarTodo(snapshot.datos);
            if (r.success) this.sincronizarAppState();
            return r;
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    async eliminarSnapshot(id) {
        try {
            const idx = await this._openDB();
            await new Promise((resolve, reject) => {
                const tx = idx.transaction(this.STORE_SNAPSHOTS, 'readwrite');
                tx.objectStore(this.STORE_SNAPSHOTS).delete(id);
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });
            idx.close();
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    // ═════════════════════════════════════════
    // 4. CÓDIGO MAESTRO DE RECUPERACIÓN
    //    Permite resetear la contraseña del admin
    //    si se olvidó o se borraron los datos.
    // ═════════════════════════════════════════

    generarCodigoMaestro() {
        const db = window.db;
        if (!db) return null;

        // Formato: LF-2026-XXXX-XXXX (sin caracteres ambiguos: 0/O, 1/I)
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const grupos = [];
        for (let g = 0; g < 2; g++) {
            let grupo = '';
            for (let i = 0; i < 4; i++) {
                grupo += chars[Math.floor(Math.random() * chars.length)];
            }
            grupos.push(grupo);
        }
        const codigo = 'LF-2026-' + grupos.join('-');

        try {
            const meta = db.cargar('_meta_recuperacion') || {};
            meta.codigo_maestro = codigo;
            meta.fecha_generacion = new Date().toISOString();
            meta.usos = 0;
            db.guardar('_meta_recuperacion', meta);
        } catch (e) {
            console.error('Error guardando código maestro:', e);
        }

        return codigo;
    },

    obtenerCodigoMaestro() {
        const db = window.db;
        if (!db) return null;
        try {
            const meta = db.cargar('_meta_recuperacion');
            return (meta && meta.codigo_maestro) || null;
        } catch (e) {
            return null;
        }
    },

    validarCodigoMaestro(codigo) {
        if (!codigo) return false;
        const guardado = this.obtenerCodigoMaestro();
        if (!guardado) return false;
        return guardado.toUpperCase() === codigo.toUpperCase().trim();
    },

    resetearPasswordConCodigo(codigo, nuevaPass) {
        const db = window.db;
        if (!db) return { success: false, error: 'DB no disponible' };

        if (!this.validarCodigoMaestro(codigo)) {
            return { success: false, error: 'Código inválido' };
        }
        if (!nuevaPass || nuevaPass.length < 8) {
            return { success: false, error: 'Contraseña mínimo 8 caracteres' };
        }

        try {
            const admins = db.cargar('administradores');
            if (!admins.administradores || admins.administradores.length === 0) {
                return { success: false, error: 'No hay administradores registrados' };
            }

            // Resetear al primer admin
            admins.administradores[0].password = db.hashPassword(nuevaPass);
            db.guardar('administradores', admins);

            // Registrar uso
            const meta = db.cargar('_meta_recuperacion');
            meta.usos = (meta.usos || 0) + 1;
            meta.ultimo_uso = new Date().toISOString();
            db.guardar('_meta_recuperacion', meta);

            return {
                success: true,
                admin: admins.administradores[0].usuario,
                mensaje: 'Contraseña restablecida. Ya puedes iniciar sesión.'
            };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    // ═════════════════════════════════════════
    // 5. RESPALDO MANUAL (JSON)
    // ═════════════════════════════════════════

    descargarRespaldo() {
        const db = window.db;
        if (!db) {
            alert('Sistema de base de datos no disponible');
            return;
        }
        try {
            const data = db.exportarTodo();
            data._meta_respaldo = {
                iglesia: 'IPUC LA FONDA',
                version: db.version + ' ' + db.versionName,
                fechaDescarga: new Date().toISOString(),
                totalColecciones: Object.keys(data.datos).length
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const fecha = new Date().toISOString().split('T')[0];
            a.download = `IPUC_LA_FONDA_respaldo_${fecha}.json`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Registrar en metadata
            try {
                const meta = db.cargar('_meta_respaldo') || {};
                meta.ultimo_respaldo_manual = new Date().toISOString();
                meta.total_respaldos = (meta.total_respaldos || 0) + 1;
                db.guardar('_meta_respaldo', meta);
            } catch (e) {}

            return { success: true, archivo: a.download };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    importarRespaldoDesdeArchivo(file) {
        return new Promise((resolve) => {
            if (!file) {
                resolve({ success: false, error: 'No hay archivo' });
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data.datos) {
                        resolve({ success: false, error: 'Formato de respaldo inválido' });
                        return;
                    }

                    const r = window.db.importarTodo(data);
                    if (r.success) {
                        this.sincronizarAppState();
                    }
                    resolve(r);
                } catch (err) {
                    resolve({ success: false, error: 'JSON inválido: ' + err.message });
                }
            };

            reader.onerror = () => resolve({ success: false, error: 'Error leyendo archivo' });
            reader.readAsText(file);
        });
    },

    estadoRespaldos() {
        const db = window.db;
        if (!db) return {};
        try {
            const meta = db.cargar('_meta_respaldo') || {};
            const papelera = this.listarPapelera();
            const totalKeys = db._getAllNames().length;

            // Calcular espacio usado
            let bytesUsados = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith(this.PREFIX) && !k.includes('backup_')) {
                    bytesUsados += (localStorage.getItem(k) || '').length * 2;
                }
            }

            return {
                ultimoManual: meta.ultimo_respaldo_manual || null,
                ultimoAuto: meta.ultimo_respaldo_auto || null,
                totalRespaldo: meta.total_respaldos || 0,
                totalColecciones: totalKeys,
                espacioUsado: bytesUsados,
                espacioFormateado: this._formatBytes(bytesUsados),
                papeleraCount: papelera.length,
                codigoMaestro: !!this.obtenerCodigoMaestro()
            };
        } catch (e) {
            return {};
        }
    },

    _formatBytes(b) {
        if (b < 1024) return b + ' B';
        if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
        return (b / 1048576).toFixed(2) + ' MB';
    },

    // ═════════════════════════════════════════
    // 6. UI DEL PANEL DE BACKUP
    // ═════════════════════════════════════════

    renderPanelBackup() {
        const e = this.estadoRespaldos();
        const ultimo = e.ultimoManual
            ? new Date(e.ultimoManual).toLocaleString('es-CO')
            : 'Nunca';

        return `
      <div class="fade-in">
        <h2><i class="bx bx-cloud-download"></i> Copias de Seguridad</h2>

        <div class="card" style="border-left:4px solid var(--dorado);">
          <h3><i class="bx bx-info-circle"></i> Estado del Sistema</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:12px;">
            <div style="text-align:center;padding:12px;background:var(--gris-claro);border-radius:8px;">
              <strong style="font-size:1.3rem;display:block;">${e.totalColecciones || 0}</strong>
              <small>Colecciones</small>
            </div>
            <div style="text-align:center;padding:12px;background:var(--gris-claro);border-radius:8px;">
              <strong style="font-size:1.3rem;display:block;">${e.espacioFormateado || '0 B'}</strong>
              <small>Espacio usado</small>
            </div>
            <div style="text-align:center;padding:12px;background:var(--gris-claro);border-radius:8px;">
              <strong style="font-size:1.3rem;display:block;">${e.papeleraCount || 0}</strong>
              <small>En papelera</small>
            </div>
            <div style="text-align:center;padding:12px;background:var(--gris-claro);border-radius:8px;">
              <strong style="font-size:0.85rem;display:block;">${ultimo}</strong>
              <small>Último respaldo</small>
            </div>
          </div>
        </div>

        <div class="card">
          <h3><i class="bx bx-download"></i> Respaldar / Restaurar</h3>
          <p style="font-size:0.9rem;color:var(--gris-texto);margin-bottom:12px;">
            Descarga un archivo .json con TODOS los datos. Guárdalo en tu PC, USB o Drive.
          </p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn-primary" id="btn-descargar-respaldo">
              <i class="bx bx-download"></i> Descargar respaldo
            </button>
            <button class="btn-secondary" id="btn-importar-respaldo">
              <i class="bx bx-upload"></i> Restaurar desde archivo
            </button>
            <input type="file" id="input-respaldo" accept=".json,application/json" style="display:none;">
          </div>
        </div>

        <div class="card">
          <h3><i class="bx bx-history"></i> Puntos de Restauración</h3>
          <button class="btn-primary btn-sm" id="btn-crear-snapshot" style="margin-bottom:12px;">
            <i class="bx bx-plus"></i> Crear snapshot ahora
          </button>
          <div id="lista-snapshots">
            <p style="color:var(--gris-texto);text-align:center;">Cargando...</p>
          </div>
        </div>

        <div class="card">
          <h3><i class="bx bx-trash"></i> Papelera</h3>
          <div id="lista-papelera">
            <p style="color:var(--gris-texto);text-align:center;">Cargando...</p>
          </div>
          <button class="btn-danger btn-sm" id="btn-vaciar-papelera" style="margin-top:8px;">
            <i class="bx bx-trash"></i> Vaciar papelera
          </button>
        </div>

        <div class="card">
          <h3><i class="bx bx-key"></i> Código Maestro de Recuperación</h3>
          <p style="font-size:0.9rem;color:var(--gris-texto);margin-bottom:8px;">
            Con este código puedes recuperar tu cuenta si pierdes acceso.
          </p>
          <div style="padding:16px;background:var(--gris-claro);border-radius:8px;text-align:center;font-family:monospace;font-size:1.1rem;letter-spacing:2px;font-weight:700;" id="codigo-maestro-display">
            ${e.codigoMaestro ? '••••-••••-••••' : 'No generado'}
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
            <button class="btn-primary btn-sm" id="btn-ver-codigo">
              <i class="bx bx-show"></i> Ver código
            </button>
            <button class="btn-secondary btn-sm" id="btn-regenerar-codigo">
              <i class="bx bx-refresh"></i> Regenerar
            </button>
            <button class="btn-secondary btn-sm" id="btn-copiar-codigo">
              <i class="bx bx-copy"></i> Copiar
            </button>
          </div>
        </div>
      </div>
    `;
    },

    bindPanelBackup() {
        const $ = (id) => document.getElementById(id);

        // Descargar respaldo
        $('btn-descargar-respaldo')?.addEventListener('click', () => {
            const r = this.descargarRespaldo();
            if (window.showToast) {
                if (r.success) showToast('Respaldo descargado correctamente', 'success');
                else showToast('Error: ' + r.error, 'error');
            }
            this._refrescarPanel();
        });

        // Importar respaldo
        $('btn-importar-respaldo')?.addEventListener('click', () => {
            $('input-respaldo')?.click();
        });

        $('input-respaldo')?.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const ok = confirm(
                '⚠️ Esto REEMPLAZARÁ todos los datos actuales con los del archivo.\n\n' +
                '¿Continuar con la restauración?'
            );
            if (!ok) {
                e.target.value = '';
                return;
            }

            if (window.showToast) showToast('Restaurando respaldo...', 'info');
            const r = await this.importarRespaldoDesdeArchivo(file);

            if (r.success) {
                if (window.showToast) showToast('Respaldo restaurado. Recargando...', 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                if (window.showToast) showToast('Error: ' + r.error, 'error');
            }
            e.target.value = '';
        });

        // Crear snapshot
        $('btn-crear-snapshot')?.addEventListener('click', async () => {
            const nombre = prompt(
                'Nombre del punto de restauración:',
                'Manual ' + new Date().toLocaleString('es-CO')
            );
            if (!nombre) return;

            const r = await this.crearSnapshot(nombre);
            if (r.success) {
                if (window.showToast) showToast('Snapshot creado', 'success');
                this._refrescarSnapshots();
            } else {
                if (window.showToast) showToast('Error: ' + r.error, 'error');
            }
        });

        // Vaciar papelera
        $('btn-vaciar-papelera')?.addEventListener('click', () => {
            if (!confirm('¿Vaciar la papelera? Esto es IRREVERSIBLE.')) return;
            this.vaciarPapelera();
            this._refrescarPapelera();
            if (window.showToast) showToast('Papelera vaciada', 'success');
        });

        // Ver código maestro
        $('btn-ver-codigo')?.addEventListener('click', () => {
            const codigo = this.obtenerCodigoMaestro();
            if (!codigo) {
                if (window.showToast) showToast('No hay código generado', 'warning');
                return;
            }
            $('codigo-maestro-display').textContent = codigo;
        });

        // Regenerar código
        $('btn-regenerar-codigo')?.addEventListener('click', () => {
            if (!confirm('⚠️ Regenerar el código invalidará el anterior.\n\n¿Continuar?')) return;
            const nuevo = this.generarCodigoMaestro();
            $('codigo-maestro-display').textContent = nuevo;
            if (window.showToast) showToast('Código regenerado. Guárdalo.', 'success');
        });

        // Copiar código
        $('btn-copiar-codigo')?.addEventListener('click', async () => {
            const codigo = this.obtenerCodigoMaestro();
            if (!codigo) {
                if (window.showToast) showToast('No hay código generado', 'warning');
                return;
            }
            try {
                await navigator.clipboard.writeText(codigo);
                if (window.showToast) showToast('Código copiado al portapapeles', 'success');
            } catch (e) {
                if (window.showToast) showToast('No se pudo copiar. Cópialo manualmente.', 'warning');
                $('codigo-maestro-display').textContent = codigo;
            }
        });

        // Cargar listas
        this._refrescarSnapshots();
        this._refrescarPapelera();
    },

    async _refrescarSnapshots() {
        const cont = document.getElementById('lista-snapshots');
        if (!cont) return;

        const snaps = await this.listarSnapshots();

        if (snaps.length === 0) {
            cont.innerHTML = '<p style="color:var(--gris-texto);text-align:center;padding:12px;">No hay snapshots creados</p>';
            return;
        }

        cont.innerHTML = snaps.map(s => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--gris-medio);gap:8px;">
        <div style="flex:1;min-width:0;">
          <strong style="font-size:0.9rem;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${this._escape(s.nombre)}</strong>
          <small style="color:var(--gris-texto);">${new Date(s.fecha).toLocaleString('es-CO')} · ${this._formatBytes(s.tamaño)}</small>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0;">
          <button class="btn-primary btn-sm" title="Restaurar" onclick="Storage._restaurarSnapshotUI('${s.id}')">
            <i class="bx bx-revision"></i>
          </button>
          <button class="btn-danger btn-sm" title="Eliminar" onclick="Storage._eliminarSnapshotUI('${s.id}')">
            <i class="bx bx-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
    },

    async _restaurarSnapshotUI(id) {
        if (!confirm('¿Restaurar este snapshot? Se reemplazarán los datos actuales.')) return;
        const r = await this.restaurarSnapshot(id);
        if (r.success) {
            if (window.showToast) showToast('Snapshot restaurado. Recargando...', 'success');
            setTimeout(() => location.reload(), 1200);
        } else {
            if (window.showToast) showToast('Error: ' + r.error, 'error');
        }
    },

    async _eliminarSnapshotUI(id) {
        if (!confirm('¿Eliminar este snapshot? No se puede deshacer.')) return;
        const r = await this.eliminarSnapshot(id);
        if (r.success) {
            this._refrescarSnapshots();
            if (window.showToast) showToast('Snapshot eliminado', 'info');
        }
    },

    _refrescarPapelera() {
        const cont = document.getElementById('lista-papelera');
        if (!cont) return;

        const items = this.listarPapelera();

        if (items.length === 0) {
            cont.innerHTML = '<p style="color:var(--gris-texto);text-align:center;padding:12px;">Papelera vacía</p>';
            return;
        }

        cont.innerHTML = items.slice(0, 20).map(p => {
            const titulo = p.item?.titulo || p.item?.nombre || p.item?.motivo ||
                           p.item?.contenido || p.item?.mensaje || '(sin título)';
            const preview = typeof titulo === 'string'
                ? titulo.substring(0, 60)
                : '(sin título)';

            return `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--gris-medio);gap:8px;">
          <div style="flex:1;min-width:0;">
            <span class="badge badge-info">${this._escape(p.coleccion)}</span>
            <small style="color:var(--gris-texto);display:block;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${this._escape(preview)}
            </small>
            <small style="color:var(--gris-texto);font-size:0.7rem;">
              ${new Date(p.fechaEliminacion).toLocaleString('es-CO')}
            </small>
          </div>
          <button class="btn-success btn-sm" title="Restaurar" onclick="Storage._restaurarPapeleraUI('${p.id}')">
            <i class="bx bx-undo"></i>
          </button>
        </div>
      `;
        }).join('');
    },

    _restaurarPapeleraUI(id) {
        const r = this.restaurarDePapelera(id);
        if (r.success) {
            this._refrescarPapelera();
            if (window.showToast) showToast('Registro restaurado', 'success');
        } else {
            if (window.showToast) showToast('Error: ' + r.error, 'error');
        }
    },

    _escape(text) {
        if (!text || typeof text !== 'string') return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    _refrescarPanel() {
        const cont = document.getElementById('page-content');
        if (cont && window.APP_STATE?.currentPage === 'backup') {
            cont.innerHTML = this.renderPanelBackup();
            this.bindPanelBackup();
        }
    },

    // ═════════════════════════════════════════
    // 7. UTILIDADES EXTRA
    // ═════════════════════════════════════════

    /**
     * Exporta un respaldo y lo sube a un Gist de GitHub (opcional).
     * Requiere token de GitHub guardado en localStorage.
     * Es solo un ejemplo; puedes quitarlo si no lo usas.
     */
    async subirGistPrivado(token, descripcion = 'Respaldo IPUC LA FONDA') {
        if (!token) return { success: false, error: 'Token requerido' };
        try {
            const data = window.db.exportarTodo();
            const res = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Authorization': 'token ' + token,
                    'Accept': 'application/vnd.github+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: descripcion,
                    public: false,
                    files: {
                        'respaldo_ipuc.json': {
                            content: JSON.stringify(data, null, 2)
                        }
                    }
                })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const json = await res.json();
            return { success: true, url: json.html_url };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    /**
     * Diagnóstico completo del sistema.
     * Útil para depurar problemas.
     */
    diagnostico() {
        const db = window.db;
        if (!db) return { error: 'DB no disponible' };

        const estado = this.estadoRespaldos();
        const integridad = db.verificarIntegridad();
        const papelera = this.listarPapelera();

        return {
            version: db.version + ' ' + db.versionName,
            appState: !!window.APP_STATE,
            storage: !!window.Storage,
            indexedDB: 'indexedDB' in window,
            estado,
            integridad,
            papeleraItems: papelera.length,
            codigoMaestro: this.obtenerCodigoMaestro() ? 'Sí' : 'No',
            timestamp: new Date().toISOString()
        };
    }
};

// ============================================
// INICIALIZACIÓN GLOBAL
// ============================================

if (typeof window !== 'undefined') {
    window.Storage = Storage;

    // Auto-purgar papelera vieja al iniciar
    setTimeout(() => {
        if (window.db) {
            try {
                const r = Storage.purgarPapeleraVieja();
                if (r.purgados > 0) {
                    console.log(`🗑️ Storage: ${r.purgados} elementos purgados de papelera`);
                }
            } catch (e) {
                console.warn('Error en purga inicial:', e);
            }
        }
    }, 3000);

    // Sincronizar APP_STATE con DB cuando esté listo
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.db && window.APP_STATE) {
                Storage.sincronizarAppState();
            }
        }, 800);
    });

    // Sincronizar cuando el usuario inicie sesión
    window.addEventListener('ipuc:login', () => {
        setTimeout(() => Storage.sincronizarAppState(), 300);
    });

    console.log('✅ Storage v1.0 cargado - Respaldo y recuperación activos');
}

/* ============================================
   FINAL DEL STORAGE.JS v1.0
   IPUC LA FONDA - International Pentecostal Church
   "Donde el Espíritu Santo se mueve"
   ============================================ */
