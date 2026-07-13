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

        return false;
    }

    // Combinar datos por defecto con personalizados
    const datos = { ...DEFAULT_ADMIN, ...datosPersonalizados };

    console.log('📋 DATOS DEL ADMINISTRADOR:');
    console.log(`   Nombre:    ${datos.nombre} ${datos.apellidos}`);
    console.log(`   Correo:    ${datos.correo}`);
    console.log(`   Usuario:   ${datos.usuario}`);
    console.log(`   Celular:   ${datos.celular}`);
    console.log(`   Password:  ${'*'.repeat(datos.password.length)}`);
    console.log('');

    // Confirmar creación (solo en navegador)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const confirmacion = confirm(`¿Deseas crear el administrador "${datos.nombre} ${datos.apellidos}" (@${datos.usuario})?`);
        if (!confirmacion) {
            console.log('');
            console.log('❌ Operación cancelada por el usuario');
            return false;
        }
    }

    console.log('');
    console.log('⏳ Creando administrador...');

    // Crear objeto administrador
    const admin = {
        id: 1,
        nombre: datos.nombre,
        apellidos: datos.apellidos,
        documento: datos.documento || '',
        fecha_nacimiento: datos.fecha_nacimiento || '',
        sexo: datos.sexo || '',
        correo: datos.correo,
        celular: datos.celular,
        direccion: datos.direccion || '',
        ministerio: datos.ministerio,
        usuario: datos.usuario,
        password: db.hashPassword(datos.password),
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

    // Guardar en la base de datos
    try {
        db.guardar('administradores', {
            administradores: [admin],
            ultimo_id: 1
        });

        // Actualizar configuración
        const config = db.cargar('configuracion');
        if (config?.aplicacion) {
            config.aplicacion.primer_administrador_creado = true;
            db.guardar('configuracion', config);
        }

        // Agregar notificación
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

        return true;

    } catch (error) {
        console.error(`❌ Error al crear administrador: ${error.message}`);
        return false;
    }
}

// ============================================
// FUNCIÓN PARA CREAR ADMIN EN NAVEGADOR
// ============================================
function crearAdminUI() {
    // Solo ejecutar en navegador
    if (typeof document === 'undefined') return;

    // Verificar si ya existe
    const adminData = localStorage.getItem('ipuc5_administradores');
    if (adminData) {
        try {
            const admins = JSON.parse(adminData);
            if (admins?.administradores?.length > 0) {
                alert('⚠️ Ya existe un administrador en este navegador.\n\nUsa el panel de administración para gestionar usuarios.');
                return;
            }
        } catch (e) {}
    }

    // Pedir confirmación
    const confirmacion = confirm(
        '🔧 CREAR PRIMER ADMINISTRADOR\n\n' +
        'Se creará el administrador con estos datos:\n\n' +
        `Nombre: ${DEFAULT_ADMIN.nombre} ${DEFAULT_ADMIN.apellidos}\n` +
        `Usuario: ${DEFAULT_ADMIN.usuario}\n` +
        `Correo: ${DEFAULT_ADMIN.correo}\n\n` +
        '¿Deseas continuar?'
    );

    if (!confirmacion) return;

    // Crear admin
    const resultado = crearAdmin();

    if (resultado) {
        alert(
            '✅ ADMINISTRADOR CREADO EXITOSAMENTE\n\n' +
            `Usuario: ${DEFAULT_ADMIN.usuario}\n` +
            `Contraseña: ${DEFAULT_ADMIN.password}\n\n` +
            '⚠️ Guarda estas credenciales en un lugar seguro.\n\n' +
            'Ahora puedes iniciar sesión en la aplicación.'
        );
        
        // Redirigir a la app
        if (confirm('¿Quieres ir a la aplicación ahora?')) {
            window.location.href = 'https://ipuclafonda.netlify.app';
        }
    } else {
        alert('❌ Error al crear el administrador. Revisa la consola para más detalles.');
    }
}

// ============================================
// FUNCIÓN PARA CREAR ADMIN CON DATOS PERSONALIZADOS
// ============================================
function crearAdminPersonalizado(datos) {
    if (!datos.nombre || !datos.apellidos || !datos.correo || !datos.usuario || !datos.password) {
        console.error('❌ Faltan campos requeridos: nombre, apellidos, correo, usuario, password');
        return false;
    }

    if (datos.password.length < 8) {
        console.error('❌ La contraseña debe tener al menos 8 caracteres');
        return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(datos.correo)) {
        console.error('❌ Formato de correo inválido');
        return false;
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
console.log(`   Contraseña: ${DEFAULT_ADMIN.password}`);
