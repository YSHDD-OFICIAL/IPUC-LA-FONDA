// ============================================
// IPUC LA FONDA - Crear Administrador v5.0
// Script independiente para crear el primer admin
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
// FUNCIÓN PRINCIPAL
// ============================================
function crearAdmin(datosPersonalizados = {}) {
    console.log('='.repeat(60));
    console.log('🔧 IPUC LA FONDA v5.0 - Creación de Administrador');
    console.log('='.repeat(60));
    console.log('');

    // Verificar que Database existe
    if (typeof Database === 'undefined') {
        console.error('❌ Error: Database no está cargado. Asegúrate de cargar database.js primero.');
        return false;
    }

    // Inicializar base de datos
    console.log('⏳ Inicializando base de datos...');
    const db = new Database();
    db.inicializarDatos();
    console.log('✅ Base de datos lista');
    console.log('');

    // Verificar si ya existe un administrador
    const administradores = db.cargar('administradores');
    if (administradores?.administradores?.length > 0) {
        console.log('⚠️  ╔══════════════════════════════════════════════════════════╗');
        console.log('⚠️  ║  YA EXISTE UN ADMINISTRADOR                             ║');
        console.log('⚠️  ║  No se puede crear otro administrador con este script.   ║');
        console.log('⚠️  ║  Usa el panel de administración para gestionar usuarios. ║');
        console.log('⚠️  ╚══════════════════════════════════════════════════════════╝');
        console.log('');

        // Mostrar administradores existentes
        administradores.administradores.forEach(admin => {
            console.log(`   👑 ${admin.nombre || 'N/A'} ${admin.apellidos || ''}`);
            console.log(`      Usuario: @${admin.usuario || 'N/A'}`);
            console.log(`      Correo: ${admin.correo || 'N/A'}`);
            console.log('');
        });

        return { exito: false, error: 'Ya existe un administrador' };
    }

    // Combinar datos por defecto con personalizados
    const datos = { ...DEFAULT_ADMIN, ...datosPersonalizados };

    // Validar datos
    if (!datos.nombre || datos.nombre.length < 2) {
        console.error('❌ El nombre debe tener al menos 2 caracteres');
        return { exito: false, error: 'Nombre inválido' };
    }
    if (!datos.apellidos || datos.apellidos.length < 2) {
        console.error('❌ Los apellidos deben tener al menos 2 caracteres');
        return { exito: false, error: 'Apellidos inválidos' };
    }
    if (!datos.correo || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(datos.correo)) {
        console.error('❌ Formato de correo inválido');
        return { exito: false, error: 'Correo inválido' };
    }
    if (!datos.usuario || !/^[a-zA-Z0-9_]{3,20}$/.test(datos.usuario)) {
        console.error('❌ Usuario inválido (3-20 caracteres, solo letras, números y guiones)');
        return { exito: false, error: 'Usuario inválido' };
    }
    if (!datos.password || datos.password.length < 8) {
        console.error('❌ La contraseña debe tener al menos 8 caracteres');
        return { exito: false, error: 'Contraseña muy corta' };
    }

    console.log('📋 DATOS DEL ADMINISTRADOR:');
    console.log(`   Nombre:    ${datos.nombre} ${datos.apellidos}`);
    console.log(`   Correo:    ${datos.correo}`);
    console.log(`   Usuario:   ${datos.usuario}`);
    console.log(`   Celular:   ${datos.celular}`);
    console.log(`   Password:  ${'*'.repeat(datos.password.length)}`);
    console.log('');

    // Confirmar creación (solo en navegador)
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof confirm !== 'undefined') {
        const confirmacion = confirm(`¿Deseas crear el administrador "${datos.nombre} ${datos.apellidos}" (@${datos.usuario})?`);
        if (!confirmacion) {
            console.log('');
            console.log('❌ Operación cancelada por el usuario');
            return { exito: false, error: 'Cancelado por el usuario' };
        }
    }

    console.log('');
    console.log('⏳ Creando administrador...');

    // Usar el método de Database para crear el admin
    const resultado = db.crearPrimerAdministrador(datos);

    if (resultado.exito) {
        // Agregar notificación de bienvenida
        db.addNotificacion({
            titulo: '🎉 Administrador creado',
            mensaje: `El primer administrador (@${datos.usuario}) ha sido configurado exitosamente.`,
            tipo: 'sistema'
        });

        console.log('✅ ¡Administrador creado exitosamente!');
        console.log('');
        console.log('='.repeat(60));
        console.log('📁 ALMACENADO EN: localStorage');
        console.log('='.repeat(60));
        console.log('');
        console.log('🔑 CREDENCIALES DE ACCESO:');
        console.log(`   Usuario:    ${datos.usuario}`);
        console.log(`   Contraseña: ${datos.password}`);
        console.log('');
        console.log('='.repeat(60));
        console.log('📝 INSTRUCCIONES:');
        console.log('   1. Abre la aplicación en: https://ipuclafonda.netlify.app');
        console.log('   2. Haz clic en "Iniciar Sesión"');
        console.log('   3. Ingresa las credenciales de arriba');
        console.log('   4. ¡Listo! Ya eres administrador');
        console.log('');
        console.log('⚠️  IMPORTANTE:');
        console.log('   • Guarda estas credenciales en un lugar seguro');
        console.log('   • No compartas la contraseña');
        console.log('   • Los datos se guardan en este navegador');
        console.log('   • Si cambias de navegador, deberás crear el admin de nuevo');
        console.log('='.repeat(60));

        return { exito: true, admin: resultado.admin };
    } else {
        console.error(`❌ Error al crear administrador: ${resultado.error}`);
        return { exito: false, error: resultado.error };
    }
}

// ============================================
// FUNCIÓN PARA CREAR ADMIN EN NAVEGADOR (UI)
// ============================================
function crearAdminUI() {
    if (typeof document === 'undefined') return;

    // Verificar si ya existe
    const db = new Database();
    const admins = db.cargar('administradores');
    if (admins?.administradores?.length > 0) {
        alert('⚠️ Ya existe un administrador en este navegador.\n\nUsa el panel de administración para gestionar usuarios.');
        return;
    }

    const confirmacion = confirm(
        '🔧 CREAR PRIMER ADMINISTRADOR\n\n' +
        'Se creará el administrador con estos datos:\n\n' +
        `Nombre: ${DEFAULT_ADMIN.nombre} ${DEFAULT_ADMIN.apellidos}\n` +
        `Usuario: ${DEFAULT_ADMIN.usuario}\n` +
        `Correo: ${DEFAULT_ADMIN.correo}\n\n` +
        '¿Deseas continuar?'
    );

    if (!confirmacion) return;

    const resultado = crearAdmin();

    if (resultado.exito) {
        alert(
            '✅ ADMINISTRADOR CREADO EXITOSAMENTE\n\n' +
            `Usuario: ${DEFAULT_ADMIN.usuario}\n` +
            `Contraseña: ${DEFAULT_ADMIN.password}\n\n` +
            '⚠️ Guarda estas credenciales en un lugar seguro.\n\n' +
            'Ahora puedes iniciar sesión en la aplicación.'
        );
        if (confirm('¿Quieres ir a la aplicación ahora?')) {
            window.location.href = 'https://ipuclafonda.netlify.app';
        }
    } else {
        alert('❌ Error al crear el administrador: ' + (resultado.error || 'Error desconocido'));
    }
}

// ============================================
// FUNCIÓN PARA CREAR ADMIN CON DATOS PERSONALIZADOS
// ============================================
function crearAdminPersonalizado(datos) {
    if (!datos.nombre || !datos.apellidos || !datos.correo || !datos.usuario || !datos.password) {
        console.error('❌ Faltan campos requeridos: nombre, apellidos, correo, usuario, password');
        return { exito: false, error: 'Campos requeridos faltantes' };
    }

    if (datos.password.length < 8) {
        console.error('❌ La contraseña debe tener al menos 8 caracteres');
        return { exito: false, error: 'Contraseña muy corta' };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(datos.correo)) {
        console.error('❌ Formato de correo inválido');
        return { exito: false, error: 'Correo inválido' };
    }

    return crearAdmin(datos);
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================
window.crearAdmin = crearAdmin;
window.crearAdminUI = crearAdminUI;
window.crearAdminPersonalizado = crearAdminPersonalizado;
window.DEFAULT_ADMIN = DEFAULT_ADMIN;

console.log('✅ IPUC LA FONDA - Crear Admin v5.0 cargado');
console.log('💡 Ejecuta crearAdmin() en la consola para crear el administrador por defecto');
console.log('💡 O ejecuta crearAdminUI() para usar la interfaz de confirmación');
console.log('💡 O ejecuta crearAdminPersonalizado({...}) para datos personalizados');
console.log('');
console.log('📋 Datos por defecto:');
console.log(`   Usuario: ${DEFAULT_ADMIN.usuario}`);
console.log(`   Contraseña: ${'*'.repeat(DEFAULT_ADMIN.password.length)}`);
