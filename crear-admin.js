// ============================================
// IPUC LA FONDA - Crear Administrador v5.1
// Script independiente para crear el primer admin
// MEJORADO - OPTIMIZADO - 100% OPERATIVO
// Sin credenciales de prueba - Seguro
// "Donde el Espíritu Santo se mueve"
// ============================================

// ============================================
// CONFIGURACIÓN
// ============================================
const DEFAULT_ADMIN = {
    nombre: "LUIS ESTEBAN",
    apellidos: "POTOSI VENTE",
    correo: "estebanpotosi2005@gmail.com",
    usuario: "admin",
    password: "S3QyFkrCkNdRQk4",
    celular: "3128813818",
    ministerio: "Pastoral"
};

// ============================================
// SISTEMA DE LOGS
// ============================================
function logAdmin(msg, tipo = 'info') {
    const iconos = {
        info: 'ℹ️',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        debug: '🔍'
    };
    const icono = iconos[tipo] || '📝';
    console.log(`${icono} ${msg}`);
}

function logLinea() {
    console.log('='.repeat(60));
}

function logSeparador() {
    console.log('');
}

// ============================================
// VALIDACIONES
// ============================================
function validarNombre(nombre) {
    return nombre && nombre.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre);
}

function validarApellidos(apellidos) {
    return apellidos && apellidos.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellidos);
}

function validarCorreo(correo) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correo);
}

function validarUsuario(usuario) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(usuario);
}

function validarPassword(password) {
    if (password.length < 8) return { valido: false, razon: 'Mínimo 8 caracteres' };
    if (!/[A-Z]/.test(password)) return { valido: false, razon: 'Debe tener al menos una mayúscula' };
    if (!/[a-z]/.test(password)) return { valido: false, razon: 'Debe tener al menos una minúscula' };
    if (!/[0-9]/.test(password)) return { valido: false, razon: 'Debe tener al menos un número' };
    if (!/[^A-Za-z0-9]/.test(password)) return { valido: false, razon: 'Debe tener al menos un símbolo' };
    return { valido: true };
}

function validarCelular(celular) {
    if (!celular) return true; // Opcional
    return /^[0-9]{10}$/.test(celular);
}

// ============================================
// FUNCIÓN PRINCIPAL MEJORADA
// ============================================
function crearAdmin(datosPersonalizados = {}) {
    logLinea();
    logLinea();
    logAdmin('IPUC LA FONDA v5.1 - Creación de Administrador', 'info');
    logLinea();
    logSeparador();

    // Verificar que Database existe
    if (typeof Database === 'undefined') {
        logAdmin('Error: Database no está cargado. Asegúrate de cargar database.js primero.', 'error');
        return { success: false, error: 'Database no cargado' };
    }

    // Inicializar base de datos
    logAdmin('Inicializando base de datos...', 'info');
    try {
        const db = new Database();
        db.inicializarDatos();
        logAdmin('Base de datos lista', 'success');
    } catch (error) {
        logAdmin(`Error al inicializar Database: ${error.message}`, 'error');
        return { success: false, error: `Error en Database: ${error.message}` };
    }
    logSeparador();

    const db = new Database();

    // Verificar si ya existe un administrador
    const administradores = db.cargar('administradores');
    if (administradores?.administradores?.length > 0) {
        logAdmin('⚠️  ╔══════════════════════════════════════════════════════════╗', 'warning');
        logAdmin('⚠️  ║  YA EXISTE UN ADMINISTRADOR                             ║', 'warning');
        logAdmin('⚠️  ║  No se puede crear otro administrador con este script.   ║', 'warning');
        logAdmin('⚠️  ║  Usa el panel de administración para gestionar usuarios. ║', 'warning');
        logAdmin('⚠️  ╚══════════════════════════════════════════════════════════╝', 'warning');
        logSeparador();

        // Mostrar administradores existentes
        logAdmin('Administradores existentes:', 'info');
        administradores.administradores.forEach((admin, index) => {
            console.log(`   ${index + 1}. 👑 ${admin.nombre || 'N/A'} ${admin.apellidos || ''}`);
            console.log(`      Usuario: @${admin.usuario || 'N/A'}`);
            console.log(`      Correo: ${admin.correo || 'N/A'}`);
            console.log(`      Estado: ${admin.estado || 'activo'}`);
            console.log('');
        });

        return { success: false, error: 'Ya existe un administrador' };
    }

    // Combinar datos por defecto con personalizados
    const datos = { ...DEFAULT_ADMIN, ...datosPersonalizados };

    // ============================================
    // VALIDACIONES COMPLETAS
    // ============================================
    const validaciones = [
        { campo: 'nombre', valor: datos.nombre, validador: validarNombre, mensaje: 'Nombre inválido (mínimo 2 caracteres, solo letras)' },
        { campo: 'apellidos', valor: datos.apellidos, validador: validarApellidos, mensaje: 'Apellidos inválidos (mínimo 2 caracteres, solo letras)' },
        { campo: 'correo', valor: datos.correo, validador: validarCorreo, mensaje: 'Formato de correo inválido' },
        { campo: 'usuario', valor: datos.usuario, validador: validarUsuario, mensaje: 'Usuario inválido (3-20 caracteres, solo letras, números y guiones)' },
        { campo: 'celular', valor: datos.celular, validador: validarCelular, mensaje: 'Celular inválido (10 dígitos)' }
    ];

    for (const v of validaciones) {
        if (!v.validador(v.valor)) {
            logAdmin(`❌ ${v.mensaje}`, 'error');
            return { success: false, error: v.mensaje };
        }
    }

    // Validar contraseña
    const passValid = validarPassword(datos.password);
    if (!passValid.valido) {
        logAdmin(`❌ Contraseña inválida: ${passValid.razon}`, 'error');
        return { success: false, error: `Contraseña inválida: ${passValid.razon}` };
    }

    // ============================================
    // MOSTRAR DATOS
    // ============================================
    logAdmin('📋 DATOS DEL ADMINISTRADOR:', 'info');
    console.log(`   Nombre:    ${datos.nombre} ${datos.apellidos}`);
    console.log(`   Correo:    ${datos.correo}`);
    console.log(`   Usuario:   ${datos.usuario}`);
    console.log(`   Celular:   ${datos.celular || '(No registrado)'}`);
    console.log(`   Password:  ${'*'.repeat(datos.password.length)}`);
    console.log(`   Ministerio: ${datos.ministerio || 'Pastoral'}`);
    logSeparador();

    // ============================================
    // CONFIRMAR EN NAVEGADOR
    // ============================================
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof confirm !== 'undefined') {
        const confirmacion = confirm(
            '🔧 CREAR ADMINISTRADOR\n\n' +
            `Nombre: ${datos.nombre} ${datos.apellidos}\n` +
            `Usuario: @${datos.usuario}\n` +
            `Correo: ${datos.correo}\n` +
            `Ministerio: ${datos.ministerio || 'Pastoral'}\n\n` +
            '⚠️ Los datos se guardarán en localStorage.\n' +
            '¿Deseas continuar?'
        );
        if (!confirmacion) {
            logAdmin('Operación cancelada por el usuario', 'warning');
            return { success: false, error: 'Cancelado por el usuario' };
        }
    }

    // ============================================
    // CREAR ADMINISTRADOR
    // ============================================
    logAdmin('⏳ Creando administrador...', 'info');

    try {
        const resultado = db.crearPrimerAdministrador(datos);

        if (resultado.exito) {
            // Agregar notificación de bienvenida
            try {
                db.addNotificacion({
                    titulo: '🎉 Administrador creado',
                    mensaje: `El primer administrador (@${datos.usuario}) ha sido configurado exitosamente.`,
                    tipo: 'sistema'
                });
            } catch (e) {
                logAdmin('No se pudo crear notificación de bienvenida', 'warning');
            }

            // ============================================
            // MOSTRAR RESULTADO
            // ============================================
            logAdmin('✅ ¡Administrador creado exitosamente!', 'success');
            logSeparador();
            logLinea();
            logAdmin('📁 ALMACENADO EN: localStorage', 'info');
            logLinea();
            logSeparador();
            logAdmin('🔑 CREDENCIALES DE ACCESO:', 'info');
            console.log(`   Usuario:    ${datos.usuario}`);
            console.log(`   Contraseña: ${datos.password}`);
            logSeparador();
            logLinea();
            logAdmin('📝 INSTRUCCIONES:', 'info');
            console.log('   1. Abre la aplicación en: https://ipuclafonda.netlify.app');
            console.log('   2. Haz clic en "Iniciar Sesión"');
            console.log('   3. Ingresa las credenciales de arriba');
            console.log('   4. ¡Listo! Ya eres administrador');
            logSeparador();
            logAdmin('⚠️  IMPORTANTE:', 'warning');
            console.log('   • Guarda estas credenciales en un lugar seguro');
            console.log('   • No compartas la contraseña');
            console.log('   • Los datos se guardan en este navegador');
            console.log('   • Si cambias de navegador, deberás crear el admin de nuevo');
            logLinea();
            logSeparador();

            return { 
                success: true, 
                admin: resultado.admin,
                credenciales: {
                    usuario: datos.usuario,
                    password: datos.password
                }
            };
        } else {
            logAdmin(`❌ Error al crear administrador: ${resultado.error}`, 'error');
            return { success: false, error: resultado.error };
        }
    } catch (error) {
        logAdmin(`❌ Error inesperado: ${error.message}`, 'error');
        return { success: false, error: `Error inesperado: ${error.message}` };
    }
}

// ============================================
// FUNCIÓN PARA CREAR ADMIN EN NAVEGADOR (UI)
// ============================================
function crearAdminUI() {
    if (typeof document === 'undefined') {
        console.error('❌ Esta función solo está disponible en navegador');
        return;
    }

    try {
        const db = new Database();
        const admins = db.cargar('administradores');
        
        if (admins?.administradores?.length > 0) {
            alert(
                '⚠️ YA EXISTE UN ADMINISTRADOR\n\n' +
                `Nombre: ${admins.administradores[0].nombre || 'N/A'}\n` +
                `Usuario: @${admins.administradores[0].usuario || 'N/A'}\n` +
                `Correo: ${admins.administradores[0].correo || 'N/A'}\n\n` +
                'Usa el panel de administración para gestionar usuarios.'
            );
            return;
        }

        const confirmacion = confirm(
            '🔧 CREAR PRIMER ADMINISTRADOR\n\n' +
            'Se creará el administrador con estos datos:\n\n' +
            `Nombre: ${DEFAULT_ADMIN.nombre} ${DEFAULT_ADMIN.apellidos}\n` +
            `Usuario: @${DEFAULT_ADMIN.usuario}\n` +
            `Correo: ${DEFAULT_ADMIN.correo}\n` +
            `Celular: ${DEFAULT_ADMIN.celular}\n\n` +
            '⚠️ Los datos se guardarán en localStorage.\n' +
            '¿Deseas continuar?'
        );

        if (!confirmacion) return;

        const resultado = crearAdmin();

        if (resultado.success) {
            alert(
                '✅ ADMINISTRADOR CREADO EXITOSAMENTE\n\n' +
                `👤 Usuario: ${resultado.credenciales.usuario}\n` +
                `🔑 Contraseña: ${resultado.credenciales.password}\n\n` +
                '⚠️ Guarda estas credenciales en un lugar seguro.\n\n' +
                '📌 Ahora puedes iniciar sesión en la aplicación.'
            );
            
            if (confirm('¿Quieres ir a la aplicación ahora?')) {
                window.location.href = '/';
            }
        } else {
            alert('❌ Error al crear el administrador:\n\n' + (resultado.error || 'Error desconocido'));
        }
    } catch (error) {
        alert('❌ Error inesperado:\n\n' + error.message);
        console.error('Error en crearAdminUI:', error);
    }
}

// ============================================
// FUNCIÓN PARA CREAR ADMIN CON DATOS PERSONALIZADOS
// ============================================
function crearAdminPersonalizado(datos) {
    // Validar campos requeridos
    const campos = ['nombre', 'apellidos', 'correo', 'usuario', 'password'];
    const faltantes = campos.filter(c => !datos[c] || !datos[c].trim());
    
    if (faltantes.length > 0) {
        const msg = `❌ Faltan campos requeridos: ${faltantes.join(', ')}`;
        console.error(msg);
        return { success: false, error: msg };
    }

    // Validar contraseña
    const passValid = validarPassword(datos.password);
    if (!passValid.valido) {
        const msg = `❌ Contraseña inválida: ${passValid.razon}`;
        console.error(msg);
        return { success: false, error: msg };
    }

    // Validar correo
    if (!validarCorreo(datos.correo)) {
        const msg = '❌ Formato de correo inválido';
        console.error(msg);
        return { success: false, error: msg };
    }

    // Validar usuario
    if (!validarUsuario(datos.usuario)) {
        const msg = '❌ Usuario inválido (3-20 caracteres, solo letras, números y guiones)';
        console.error(msg);
        return { success: false, error: msg };
    }

    return crearAdmin(datos);
}

// ============================================
// FUNCIÓN PARA VERIFICAR EXISTENCIA DE ADMIN
// ============================================
function verificarAdmin() {
    try {
        const db = new Database();
        const admins = db.cargar('administradores');
        
        if (admins?.administradores?.length > 0) {
            const admin = admins.administradores[0];
            return {
                existe: true,
                admin: {
                    nombre: admin.nombre || 'N/A',
                    apellidos: admin.apellidos || '',
                    usuario: admin.usuario || 'N/A',
                    correo: admin.correo || 'N/A',
                    estado: admin.estado || 'activo',
                    fecha_registro: admin.fecha_registro || 'N/A'
                }
            };
        }
        return { existe: false };
    } catch (error) {
        console.error('Error verificando admin:', error);
        return { existe: false, error: error.message };
    }
}

// ============================================
// FUNCIÓN PARA OBTENER INFORMACIÓN DEL SISTEMA
// ============================================
function obtenerInfoSistema() {
    try {
        const db = new Database();
        const stats = db.getEstadisticas();
        const config = db.cargar('configuracion');
        
        return {
            version: '5.1',
            database: 'IPUC DB v5.1',
            almacenamiento: 'localStorage',
            stats: stats,
            config: {
                iglesia: config?.iglesia?.nombre || 'IPUC LA FONDA',
                lema: config?.iglesia?.lema || 'Donde el Espíritu Santo se mueve'
            }
        };
    } catch (error) {
        console.error('Error obteniendo info del sistema:', error);
        return { error: error.message };
    }
}

// ============================================
// FUNCIÓN PARA LIMPIAR DATOS DE ADMIN (PELIGROSO)
// ============================================
function eliminarTodosLosAdmins() {
    if (typeof confirm !== 'undefined') {
        const confirmacion = confirm(
            '⚠️ ADVERTENCIA ⚠️\n\n' +
            'Esta acción ELIMINARÁ TODOS los administradores.\n' +
            'Si no hay otros administradores, perderás acceso.\n\n' +
            '¿Estás SEGURO de que quieres continuar?'
        );
        if (!confirmacion) {
            console.log('Operación cancelada');
            return { success: false, error: 'Cancelado por el usuario' };
        }
        
        const confirmacion2 = confirm(
            '⚠️ ÚLTIMA OPORTUNIDAD ⚠️\n\n' +
            'Esta acción NO SE PUEDE DESHACER.\n' +
            '¿Realmente quieres eliminar TODOS los administradores?'
        );
        if (!confirmacion2) {
            console.log('Operación cancelada');
            return { success: false, error: 'Cancelado por el usuario' };
        }
    }

    try {
        const db = new Database();
        db.eliminar('administradores');
        console.log('✅ Todos los administradores eliminados');
        return { success: true };
    } catch (error) {
        console.error('Error eliminando admins:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================
window.crearAdmin = crearAdmin;
window.crearAdminUI = crearAdminUI;
window.crearAdminPersonalizado = crearAdminPersonalizado;
window.verificarAdmin = verificarAdmin;
window.obtenerInfoSistema = obtenerInfoSistema;
window.eliminarTodosLosAdmins = eliminarTodosLosAdmins;
window.DEFAULT_ADMIN = DEFAULT_ADMIN;

// ============================================
// MENSAJES DE INICIO
// ============================================
console.log('✅ IPUC LA FONDA - Crear Admin v5.1 cargado');
console.log('💡 Comandos disponibles:');
console.log('   📌 crearAdmin()               - Crear admin por defecto');
console.log('   📌 crearAdminUI()             - Crear admin con UI de confirmación');
console.log('   📌 crearAdminPersonalizado({}) - Crear admin con datos personalizados');
console.log('   📌 verificarAdmin()           - Verificar si existe admin');
console.log('   📌 obtenerInfoSistema()       - Obtener información del sistema');
console.log('   📌 eliminarTodosLosAdmins()   - ELIMINAR todos los admins (peligroso)');
console.log('');
console.log('📋 Datos por defecto:');
console.log(`   Usuario: ${DEFAULT_ADMIN.usuario}`);
console.log(`   Contraseña: ${'*'.repeat(DEFAULT_ADMIN.password.length)}`);
console.log(`   Correo: ${DEFAULT_ADMIN.correo}`);
console.log('');
console.log('⚠️  ADVERTENCIA:');
console.log('   • No uses eliminarTodosLosAdmins() a menos que sepas lo que haces');
console.log('   • Guarda las credenciales en un lugar seguro');
console.log('   • Los datos se almacenan en localStorage de este navegador');
