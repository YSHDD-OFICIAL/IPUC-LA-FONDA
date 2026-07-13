// ============================================
// IPUC LA FONDA - Generador de Hash v5.0
// Genera hash de contraseña para usar en la app
// "Donde el Espíritu Santo se mueve"
// ============================================

function generarHash(password, salt = 'ipuc5_salt_2026') {
    let hash = 0;
    const str = password + salt;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(16);
}

// ============================================
// INTERFAZ DE CONSOLA
// ============================================
function generarHashConsola() {
    console.log('='.repeat(60));
    console.log('🔐 IPUC LA FONDA v5.0 - Generador de Hash de Contraseña');
    console.log('='.repeat(60));
    console.log('');
    
    // Contraseña por defecto
    const password = "S3QyFkrCkNdRQk4";
    const salt = 'ipuc5_salt_2026';
    
    console.log('🔒 GENERANDO HASH DE CONTRASEÑA');
    console.log('-'.repeat(60));
    console.log(`   Salt:        ${salt}`);
    console.log(`   Contraseña:  ${'*'.repeat(password.length)}`);
    console.log('');
    
    const hashResultado = generarHash(password, salt);
    
    console.log('✅ Hash generado exitosamente:');
    console.log('');
    console.log('='.repeat(60));
    console.log(`   ${hashResultado}`);
    console.log('='.repeat(60));
    console.log('');
    console.log('📝 INSTRUCCIONES DE USO:');
    console.log('');
    console.log('   Opción 1: Usar en crear-admin.html');
    console.log('   El hash se genera automáticamente al crear el admin');
    console.log('');
    console.log('   Opción 2: Usar en data/administradores.json');
    console.log('   Pega el hash en el campo "password" del administrador');
    console.log('');
    console.log('   Opción 3: Usar directamente en la consola');
    console.log('   Ejecuta: crearAdminLocal("Nombre","Apellidos","correo","usuario","password")');
    console.log('');
    console.log('⚠️  IMPORTANTE:');
    console.log('   • El salt debe ser el mismo en database.js');
    console.log('   • Si cambias el salt, todas las contraseñas anteriores');
    console.log('     dejarán de funcionar');
    console.log('='.repeat(60));
    
    return hashResultado;
}

// ============================================
// FUNCIÓN PARA GUARDAR HASH EN ARCHIVO
// ============================================
function guardarHashEnArchivo(password, hash) {
    const contenido = [
        '='.repeat(60),
        'IPUC LA FONDA v5.0 - Hash de Contraseña',
        '='.repeat(60),
        `Salt: ipuc5_salt_2026`,
        `Contraseña: ${password}`,
        `Hash: ${hash}`,
        '='.repeat(60),
        '',
        '⚠️  Guarda este archivo en un lugar seguro'
    ].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hash_ipuc.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Hash guardado en hash_ipuc.txt');
}

// ============================================
// INTERFAZ HTML (SI SE ABRE EN NAVEGADOR)
// ============================================
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        // Solo mostrar si no hay otro contenido
        if (document.body.children.length === 0 || window.location.pathname.includes('generar_hash')) {
            document.body.innerHTML = `
                <div style="max-width:500px;margin:50px auto;padding:30px;font-family:'Segoe UI',sans-serif;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.1);">
                    <h2 style="color:#1a237e;text-align:center;">🔐 IPUC LA FONDA v5.0</h2>
                    <h3 style="text-align:center;color:#666;">Generador de Hash de Contraseña</h3>
                    
                    <div style="margin:20px 0;">
                        <label style="font-weight:600;display:block;margin-bottom:5px;">Contraseña:</label>
                        <input type="text" id="passwordInput" value="S3QyFkrCkNdRQk4" style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:8px;font-size:16px;">
                    </div>
                    
                    <div style="margin:20px 0;">
                        <label style="font-weight:600;display:block;margin-bottom:5px;">Salt:</label>
                        <input type="text" id="saltInput" value="ipuc5_salt_2026" readonly style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:8px;font-size:16px;background:#f5f5f5;">
                    </div>
                    
                    <button onclick="generarHashUI()" style="width:100%;padding:12px;background:#1a237e;color:white;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;">
                        🔒 Generar Hash
                    </button>
                    
                    <div id="resultado" style="margin-top:20px;padding:15px;background:#f5f5f5;border-radius:8px;display:none;">
                        <strong>Hash generado:</strong>
                        <p id="hashResultado" style="word-break:break-all;font-family:monospace;margin-top:8px;"></p>
                    </div>
                    
                    <button id="btnDescargar" onclick="descargarHash()" style="width:100%;padding:10px;margin-top:10px;background:#4caf50;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;display:none;">
                        💾 Descargar hash.txt
                    </button>
                    
                    <p style="text-align:center;margin-top:20px;color:#666;font-size:14px;">
                        IPUC LA FONDA v5.0 | "Donde el Espíritu Santo se mueve"
                    </p>
                </div>
            `;
        }
    });
}

// ============================================
// FUNCIONES PARA LA INTERFAZ HTML
// ============================================
let ultimoHash = '';
let ultimaPassword = '';

function generarHashUI() {
    const password = document.getElementById('passwordInput').value;
    const salt = document.getElementById('saltInput').value;
    
    if (!password) {
        alert('Ingresa una contraseña');
        return;
    }
    
    const hash = generarHash(password, salt);
    
    document.getElementById('hashResultado').textContent = hash;
    document.getElementById('resultado').style.display = 'block';
    document.getElementById('btnDescargar').style.display = 'block';
    
    ultimoHash = hash;
    ultimaPassword = password;
    
    console.log('✅ Hash generado:', hash);
}

function descargarHash() {
    if (ultimoHash && ultimaPassword) {
        guardarHashEnArchivo(ultimaPassword, ultimoHash);
    }
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================
window.generarHash = generarHash;
window.generarHashConsola = generarHashConsola;
window.guardarHashEnArchivo = guardarHashEnArchivo;
window.generarHashUI = generarHashUI;
window.descargarHash = descargarHash;

console.log('✅ IPUC LA FONDA - Generador de Hash v5.0 cargado');
console.log('💡 Ejecuta generarHashConsola() para ver el hash por defecto');
console.log('💡 O abre este archivo en el navegador para usar la interfaz gráfica');
