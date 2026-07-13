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
        this.cacheTimeout = 300; // 5 minutos en segundos
        this.lastCacheUpdate = {};
        console.log('🗄️ IPUC LA FONDA v5.0 - Base de datos local inicializada');
    }

    // ============================================
    // GESTIÓN DE CLAVES
    // ============================================
    _getKey(name) {
        return this.prefix + name;
    }

    // ============================================
    // CARGA Y GUARDADO DE DATOS
    // ============================================
    cargar(nombreArchivo) {
        const clave = this._getKey(nombreArchivo);
        
        // Verificar caché primero
        if (this.cache[clave] && this.lastCacheUpdate[clave]) {
            const tiempoCache = (Date.now() - this.lastCacheUpdate[clave]) / 1000;
            if (tiempoCache < this.cacheTimeout) {
                return JSON.parse(JSON.stringify(this.cache[clave]));
            }
        }

        const datos = localStorage.getItem(clave);
        if (!datos) {
            console.warn(`⚠️ Datos no encontrados: ${nombreArchivo}`);
            return null;
        }

        try {
            const parsed = JSON.parse(datos);
            // Actualizar caché
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

            // Crear respaldo antes de guardar
            const datosAnteriores = localStorage.getItem(clave);
            if (datosAnteriores) {
                this._crearRespaldo(nombreArchivo, datosAnteriores);
            }

            // Guardar datos
            const datosJSON = JSON.stringify(datos, null, 2);
            localStorage.setItem(clave, datosJSON);

            // Actualizar caché
            this.cache[clave] = JSON.parse(JSON.stringify(datos));
            this.lastCacheUpdate[clave] = Date.now();

            console.log(`✅ Datos guardados: ${nombreArchivo}`);
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
        console.log(`🗑️ Datos eliminados: ${nombreArchivo}`);
    }

    // ============================================
    // SISTEMA DE RESPALDOS
    // ============================================
    _crearRespaldo(nombreArchivo, datosAnteriores) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const claveRespaldo = `${this.prefix}backup_${nombreArchivo}_${timestamp}`;
            localStorage.setItem(claveRespaldo, datosAnteriores);
            
            // Limpiar respaldos antiguos (mantener solo 10)
            this._limpiarRespaldosAntiguos(nombreArchivo, 10);
            
            console.log(`💾 Respaldo creado: ${nombreArchivo}`);
        } catch (e) {
            console.warn(`⚠️ Error al crear respaldo de ${nombreArchivo}:`, e);
        }
    }

    _limpiarRespaldosAntiguos(nombreArchivo, maxRespaldos = 10) {
        const respaldos = [];
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave.startsWith(`${this.prefix}backup_${nombreArchivo}_`)) {
                respaldos.push(clave);
            }
        }
        
        // Ordenar por timestamp (más reciente primero)
        respaldos.sort((a, b) => b.localeCompare(a));
        
        // Eliminar los más antiguos
        if (respaldos.length > maxRespaldos) {
            for (let i = maxRespaldos; i < respaldos.length; i++) {
                localStorage.removeItem(respaldos[i]);
                console.log(`🗑️ Respaldo eliminado: ${respaldos[i]}`);
            }
        }
    }

    _recuperarRespaldo(nombreArchivo) {
        const respaldos = [];
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave.startsWith(`${this.prefix}backup_${nombreArchivo}_`)) {
                respaldos.push(clave);
            }
        }
        
        // Ordenar por timestamp (más reciente primero)
        respaldos.sort((a, b) => b.localeCompare(a));
        
        for (const claveRespaldo of respaldos) {
            try {
                const datos = localStorage.getItem(claveRespaldo);
                if (datos) {
                    const parsed = JSON.parse(datos);
                    console.log(`🔄 Datos recuperados desde respaldo: ${nombreArchivo}`);
                    this.guardar(nombreArchivo, parsed);
                    return parsed;
                }
            } catch (e) {
                console.error(`❌ Error al leer respaldo ${claveRespaldo}:`, e);
            }
        }
        
        console.error(`❌ No se encontraron respaldos válidos para ${nombreArchivo}`);
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
                    { id: 5, texto: "Jehová te bendiga, y te guarde; Jehová haga resplandecer su rostro sobre ti, y tenga de ti misericordia.", referencia: "Números 6:24-25", tipo: "bendicion" },
                    { id: 6, texto: "El Señor es mi luz y mi salvación; ¿de quién temeré? El Señor es la fortaleza de mi vida; ¿de quién he de atemorizarme?", referencia: "Salmos 27:1", tipo: "salmo" },
                    { id: 7, texto: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.", referencia: "Jeremías 29:11", tipo: "promesa" }
                ],
                versiculo_actual: null,
                ultimo_id: 7
            },
            'noticias': {
                noticias: [{
                    id: 1,
                    titulo: "Bienvenidos a IPUC LA FONDA v5.0",
                    contenido: "Bienvenidos a nuestra plataforma digital v5.0. Aquí encontrarán información de nuestra iglesia, horarios de cultos, eventos, noticias y mucho más. ¡Dios te bendiga!",
                    imagen: "",
                    autor_id: 0,
                    autor_nombre: "Sistema",
                    fecha_publicacion: ahora,
                    fecha_actualizacion: ahora,
                    estado: "publicado",
                    categoria: "General",
                    comentarios: [],
                    reacciones: { me_gusta: 0, amen: 0, bendiciones: 0, aleluya: 0 }
                }],
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
                    { id: 1, nombre: "Nuevo Miembro", icono: "bx-user-plus", color: "#2196f3", descripcion: "Recién llegado a la congregación" },
                    { id: 2, nombre: "Miembro Activo", icono: "bx-star", color: "#ff9800", descripcion: "Participa activamente en la iglesia" },
                    { id: 3, nombre: "Líder", icono: "bx-crown", color: "#ffd700", descripcion: "Líder de ministerio" },
                    { id: 4, nombre: "Maestro", icono: "bx-book", color: "#4caf50", descripcion: "Maestro de Escuela Dominical" },
                    { id: 5, nombre: "Músico", icono: "bx-music", color: "#9c27b0", descripcion: "Parte del ministerio de alabanza" },
                    { id: 6, nombre: "Evangelista", icono: "bx-bible", color: "#f44336", descripcion: "Predicador del evangelio" },
                    { id: 7, nombre: "Administrador", icono: "bx-shield", color: "#607d8b", descripcion: "Administrador de la plataforma" },
                    { id: 8, nombre: "Cuenta Verificada", icono: "bx-badge-check", color: "#2196f3", descripcion: "Cuenta verificada por IPUC LA FONDA" },
                    { id: 9, nombre: "Servidor Destacado", icono: "bx-heart", color: "#e91e63", descripcion: "Servidor destacado de la iglesia" }
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
                iglesia: {
                    nombre: "IPUC LA FONDA",
                    lema: "Donde el Espíritu Santo se mueve",
                    direccion: "",
                    telefono: "",
                    correo: "",
                    facebook: "",
                    instagram: "",
                    youtube: ""
                },
                aplicacion: {
                    version: "5.0",
                    modo_mantenimiento: false,
                    registro_abierto: true,
                    primer_administrador_creado: false,
                    colores: {
                        primario: "#1a237e",
                        secundario: "#ffd700",
                        fondo_claro: "#ffffff",
                        fondo_oscuro: "#121212"
                    }
                }
            }
        };

        console.log('🚀 Inicializando base de datos de IPUC LA FONDA v5.0...');
        let archivosCreados = 0;

        for (const [nombre, datos] of Object.entries(archivosIniciales)) {
            const clave = this._getKey(nombre);
            if (!localStorage.getItem(clave)) {
                this.guardar(nombre, datos);
                archivosCreados++;
                console.log(`✅ Archivo creado: ${nombre}`);
            } else {
                console.log(`📄 Archivo existente: ${nombre}`);
            }
        }

        console.log(`🎉 Inicialización completada. ${archivosCreados} archivos nuevos creados.`);
        console.warn('='.repeat(60));
        console.warn('⚠️  IMPORTANTE: No se han creado credenciales por defecto');
        console.warn('⚠️  El sistema NO tiene usuarios ni administradores predefinidos');
        console.warn('⚠️  Debe crear el primer administrador');
        console.warn('⚠️  Usa: crearPrimerAdmin({...}) en la consola');
        console.warn('='.repeat(60));
    }

    // ============================================
    // HASH DE CONTRASEÑA
    // ============================================
    hashPassword(password) {
        let hash = 0;
        const str = password + 'ipuc5_salt_2026';
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convertir a entero de 32 bits
        }
        return Math.abs(hash).toString(16);
    }

    // ============================================
    // CREACIÓN DE ADMINISTRADOR
    // ============================================
    crearPrimerAdministrador(datos) {
        const admins = this.cargar('administradores');
        
        // Verificar que no exista ningún administrador
        if (admins?.administradores?.length > 0) {
            console.warn('⚠️ Ya existe al menos un administrador en el sistema');
            return { error: 'Ya existe un administrador' };
        }

        // Validar campos requeridos
        const camposRequeridos = ['nombre', 'apellidos', 'correo', 'usuario', 'password'];
        for (const campo of camposRequeridos) {
            if (!datos[campo] || !String(datos[campo]).trim()) {
                console.error(`❌ Campo requerido faltante: ${campo}`);
                return { error: `El campo '${campo}' es obligatorio` };
            }
        }

        // Validar formato de correo
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(datos.correo)) {
            return { error: 'Formato de correo electrónico inválido' };
        }

        // Validar formato de usuario
        const usuarioRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usuarioRegex.test(datos.usuario)) {
            return { error: 'El usuario debe tener entre 3 y 20 caracteres (solo letras, números y guiones bajos)' };
        }

        // Validar longitud de contraseña
        if (datos.password.length < 8) {
            return { error: 'La contraseña debe tener al menos 8 caracteres' };
        }

        // Crear hash de contraseña
        const passwordHash = this.hashPassword(datos.password);

        // Crear objeto administrador
        const admin = {
            id: 1,
            nombre: datos.nombre.trim(),
            apellidos: datos.apellidos.trim(),
            documento: (datos.documento || '').trim(),
            fecha_nacimiento: datos.fecha_nacimiento || '',
            sexo: datos.sexo || '',
            correo: datos.correo.trim().toLowerCase(),
            celular: (datos.celular || '').trim(),
            direccion: (datos.direccion || '').trim(),
            ministerio: datos.ministerio || 'Pastoral',
            usuario: datos.usuario.trim().toLowerCase(),
            password: passwordHash,
            foto: 'assets/avatars/admin.png',
            rol: 'admin',
            verificado: true,
            fecha_registro: new Date().toISOString(),
            ultima_conexion: new Date().toISOString(),
            estado: 'activo',
            insignias: ['Administrador', 'Cuenta Verificada'],
            intentos_fallidos: 0,
            bloqueado_hasta: null
        };

        // Guardar administrador
        if (!admins.administradores) admins.administradores = [];
        admins.administradores.push(admin);
        admins.ultimo_id = 1;

        if (this.guardar('administradores', admins)) {
            // Actualizar configuración
            const config = this.cargar('configuracion');
            if (config?.aplicacion) {
                config.aplicacion.primer_administrador_creado = true;
                this.guardar('configuracion', config);
            }
            
            console.log(`✅ Primer administrador creado exitosamente: ${admin.usuario}`);
            return { exito: true, admin };
        }

        return { error: 'Error al guardar el administrador' };
    }

    // ============================================
    // AUTENTICACIÓN
    // ============================================
    login(usuario, password) {
        const hash = this.hashPassword(password);

        // Verificar en administradores
        const admins = this.cargar('administradores');
        const admin = admins?.administradores?.find(a =>
            (a.usuario === usuario || a.correo === usuario) && a.password === hash
        );
        
        if (admin) {
            if (admin.estado !== 'activo') {
                return { error: 'Cuenta desactivada. Contacte al administrador.' };
            }
            // No devolver la contraseña
            const { password: _, ...adminSeguro } = admin;
            return {
                token: 't5_' + Date.now() + '_' + Math.random().toString(36).substr(2),
                rol: 'admin',
                usuario: adminSeguro
            };
        }

        // Verificar en usuarios
        const usuarios = this.cargar('usuarios');
        const user = usuarios?.usuarios?.find(u =>
            (u.usuario === usuario || u.correo === usuario) && u.password === hash
        );
        
        if (user) {
            if (user.estado !== 'activo') {
                return { error: 'Cuenta desactivada. Contacte al administrador.' };
            }
            const { password: _, ...userSeguro } = user;
            return {
                token: 't5_' + Date.now() + '_' + Math.random().toString(36).substr(2),
                rol: 'usuario',
                usuario: userSeguro
            };
        }

        return { error: 'Credenciales inválidas' };
    }

    // ============================================
    // REGISTRO DE USUARIO
    // ============================================
    registrarUsuario(datos) {
        const usuarios = this.cargar('usuarios');

        // Validar campos requeridos
        const camposRequeridos = ['nombre', 'apellidos', 'documento', 'fecha_nacimiento',
                                  'sexo', 'correo', 'celular', 'usuario', 'password', 'ministerio'];
        
        for (const campo of camposRequeridos) {
            if (!datos[campo] || !String(datos[campo]).trim()) {
                return { error: `El campo '${campo}' es obligatorio` };
            }
        }

        // Validar formato de correo
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(datos.correo)) {
            return { error: 'Formato de correo electrónico inválido' };
        }

        // Validar formato de usuario
        const usuarioRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usuarioRegex.test(datos.usuario)) {
            return { error: 'El usuario debe tener entre 3 y 20 caracteres (solo letras, números y guiones bajos)' };
        }

        // Validar longitud de contraseña
        if (datos.password.length < 8) {
            return { error: 'La contraseña debe tener al menos 8 caracteres' };
        }

        // Verificar duplicados
        if (usuarios?.usuarios?.some(u => String(u.documento) === String(datos.documento))) {
            return { error: 'El documento ya está registrado en el sistema' };
        }
        if (usuarios?.usuarios?.some(u => u.correo?.toLowerCase() === datos.correo.toLowerCase())) {
            return { error: 'El correo electrónico ya está registrado' };
        }
        if (usuarios?.usuarios?.some(u => u.usuario?.toLowerCase() === datos.usuario.toLowerCase())) {
            return { error: 'El nombre de usuario ya existe' };
        }

        // Crear nuevo usuario
        const nuevoUsuario = {
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
            ultima_conexion: new Date().toISOString(),
            estado: 'activo',
            insignias: ['Nuevo Miembro']
        };

        if (!usuarios.usuarios) usuarios.usuarios = [];
        usuarios.usuarios.push(nuevoUsuario);
        usuarios.ultimo_id = nuevoUsuario.id;
        
        if (this.guardar('usuarios', usuarios)) {
            // Actualizar estadísticas
            this.actualizarEstadisticasUsuarios();
            
            return {
                exito: true,
                mensaje: 'Registro exitoso. Ahora puedes iniciar sesión.',
                usuario: {
                    id: nuevoUsuario.id,
                    nombre: nuevoUsuario.nombre,
                    usuario: nuevoUsuario.usuario
                }
            };
        }

        return { error: 'Error al guardar el usuario' };
    }

    // ============================================
    // ACTUALIZAR ESTADÍSTICAS
    // ============================================
    actualizarEstadisticasAsistencia() {
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
            total: registros.length,
            ultima_actualizacion: new Date().toISOString()
        };
        
        this.guardar('estadisticas', estadisticas);
    }

    actualizarEstadisticasUsuarios() {
        const usuarios = this.cargar('usuarios');
        const estadisticas = this.cargar('estadisticas');
        
        const todos = usuarios?.usuarios || [];
        const mes = new Date().toISOString().substring(0, 7);
        
        estadisticas.usuarios = {
            total: todos.length,
            activos: todos.filter(u => u.estado === 'activo').length,
            nuevos_mes: todos.filter(u => u.fecha_registro?.startsWith(mes)).length,
            ultima_actualizacion: new Date().toISOString()
        };
        
        this.guardar('estadisticas', estadisticas);
    }

    // ============================================
    // NOTICIAS
    // ============================================
    getNoticias() {
        return this.cargar('noticias')?.noticias || [];
    }

    addNoticia(datos) {
        const noticias = this.cargar('noticias');
        const nueva = {
            id: (noticias?.noticias?.length || 0) + 1,
            titulo: datos.titulo,
            contenido: datos.contenido,
            imagen: datos.imagen || '',
            autor_id: datos.autor_id,
            autor_nombre: datos.autor_nombre || 'Admin',
            fecha_publicacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString(),
            estado: datos.estado || 'publicado',
            categoria: datos.categoria || 'General',
            comentarios: [],
            reacciones: { me_gusta: 0, amen: 0, bendiciones: 0, aleluya: 0 }
        };
        
        if (!noticias.noticias) noticias.noticias = [];
        noticias.noticias.unshift(nueva);
        noticias.ultimo_id = nueva.id;
        this.guardar('noticias', noticias);
        return nueva;
    }

    // ============================================
    // EVENTOS
    // ============================================
    getEventos() {
        return this.cargar('eventos')?.eventos || [];
    }

    addEvento(datos) {
        const eventos = this.cargar('eventos');
        const nuevo = {
            id: (eventos?.eventos?.length || 0) + 1,
            titulo: datos.titulo,
            descripcion: datos.descripcion || '',
            fecha: datos.fecha,
            hora: datos.hora || '',
            lugar: datos.lugar || 'IPUC LA FONDA',
            imagen: datos.imagen || '',
            organizador_id: datos.organizador_id,
            fecha_creacion: new Date().toISOString(),
            estado: datos.estado || 'programado',
            cupos: datos.cupos || 0,
            reservados: 0
        };
        
        if (!eventos.eventos) eventos.eventos = [];
        eventos.eventos.push(nuevo);
        eventos.ultimo_id = nuevo.id;
        this.guardar('eventos', eventos);
        return nuevo;
    }

    // ============================================
    // ASISTENCIA
    // ============================================
    getAsistencia() {
        return this.cargar('asistencia')?.registros || [];
    }

    addAsistencia(datos) {
        const asistencia = this.cargar('asistencia');
        const nuevo = {
            id: (asistencia?.registros?.length || 0) + 1,
            usuario_id: datos.usuario_id,
            nombre: datos.nombre,
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
        this.guardar('asistencia', asistencia);
        this.actualizarEstadisticasAsistencia();
        return nuevo;
    }

    // ============================================
    // PETICIONES
    // ============================================
    getPeticiones() {
        return this.cargar('peticiones')?.peticiones || [];
    }

    addPeticion(datos) {
        const peticiones = this.cargar('peticiones');
        const nueva = {
            id: (peticiones?.peticiones?.length || 0) + 1,
            usuario_id: datos.usuario_id,
            nombre: datos.nombre,
            motivo: datos.motivo,
            descripcion: datos.descripcion || '',
            fecha: new Date().toISOString(),
            estado: 'activa',
            oraciones: 0
        };
        
        if (!peticiones.peticiones) peticiones.peticiones = [];
        peticiones.peticiones.unshift(nueva);
        peticiones.ultimo_id = nueva.id;
        this.guardar('peticiones', peticiones);
        return nueva;
    }

    // ============================================
    // NOTIFICACIONES
    // ============================================
    getNotificaciones() {
        return this.cargar('notificaciones')?.notificaciones || [];
    }

    addNotificacion(datos) {
        const notificaciones = this.cargar('notificaciones');
        const nueva = {
            id: (notificaciones?.notificaciones?.length || 0) + 1,
            titulo: datos.titulo,
            mensaje: datos.mensaje,
            fecha: new Date().toISOString(),
            leida: false,
            tipo: datos.tipo || 'general'
        };
        
        if (!notificaciones.notificaciones) notificaciones.notificaciones = [];
        notificaciones.notificaciones.unshift(nueva);
        notificaciones.ultimo_id = nueva.id;
        this.guardar('notificaciones', notificaciones);
        return nueva;
    }

    marcarTodasLeidas() {
        const notificaciones = this.cargar('notificaciones');
        if (notificaciones?.notificaciones) {
            notificaciones.notificaciones.forEach(n => n.leida = true);
            this.guardar('notificaciones', notificaciones);
        }
    }

    getNoLeidas() {
        return this.getNotificaciones().filter(n => !n.leida).length;
    }

    // ============================================
    // ESTADÍSTICAS
    // ============================================
    getEstadisticas() {
        return {
            usuarios: (this.cargar('usuarios')?.usuarios || []).length,
            noticias: this.getNoticias().length,
            eventos: this.getEventos().length,
            asistencia: this.getAsistencia().length,
            peticiones: this.getPeticiones().length,
            notificaciones: this.getNotificaciones().length,
            noLeidas: this.getNoLeidas()
        };
    }

    // ============================================
    // UTILIDADES
    // ============================================
    getUltimoId(nombreArchivo, campoId = 'id') {
        const datos = this.cargar(nombreArchivo);
        for (const [key, value] of Object.entries(datos || {})) {
            if (Array.isArray(value) && value.length > 0) {
                const ids = value.map(item => item[campoId]).filter(id => id !== undefined);
                if (ids.length > 0) return Math.max(...ids);
            }
        }
        return 0;
    }

    generarNuevoId(nombreArchivo, campoId = 'id') {
        return this.getUltimoId(nombreArchivo, campoId) + 1;
    }

    agregarRegistro(nombreArchivo, registro, campoId = 'id') {
        try {
            const datos = this.cargar(nombreArchivo);
            for (const [key, value] of Object.entries(datos || {})) {
                if (Array.isArray(value)) {
                    if (!registro[campoId] || registro[campoId] === 0) {
                        registro[campoId] = this.generarNuevoId(nombreArchivo, campoId);
                    }
                    value.push(registro);
                    return this.guardar(nombreArchivo, datos);
                }
            }
            return false;
        } catch (e) {
            console.error(`❌ Error al agregar registro en ${nombreArchivo}:`, e);
            return false;
        }
    }

    limpiarCache() {
        this.cache = {};
        this.lastCacheUpdate = {};
        console.log('🧹 Caché limpiada completamente');
    }

    limpiarTodo() {
        const claves = [];
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave.startsWith(this.prefix)) {
                claves.push(clave);
            }
        }
        claves.forEach(c => localStorage.removeItem(c));
        this.cache = {};
        this.lastCacheUpdate = {};
        console.log('🧹 Base de datos limpiada completamente');
    }
}

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.Database = Database;

console.log('✅ IPUC LA FONDA - Database v5.0 cargado correctamente');
console.log('💾 Almacenamiento: localStorage con sistema de respaldos');
console.log('🔒 Sin credenciales de prueba');
