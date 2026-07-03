# ============================================
# IPUC LA FONDA - Script de Creación de Administrador
# v2.1.0 - Sin credenciales de prueba
# ============================================
# Este script crea el primer administrador directamente en la base de datos.
# ⚠️  IMPORTANTE: Solo funciona si NO existe ningún administrador previo.
# ⚠️  La SECRET_KEY generada debe copiarse en app.py para que el login funcione.
# ============================================

import sys
import os

# Agregar el directorio actual al path para importar database
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import Database
import hashlib
import secrets
from datetime import datetime


def crear_administrador():
    """
    Crea el primer administrador del sistema directamente en la base de datos.
    """
    print("=" * 60)
    print("🔧 IPUC LA FONDA - Creación de Administrador")
    print("=" * 60)
    print("")
    
    # Inicializar base de datos
    print("⏳ Inicializando base de datos...")
    db = Database()
    db.inicializar_datos()
    print("✅ Base de datos lista")
    print("")
    
    # Verificar si ya existe un administrador
    administradores = db.cargar_json('administradores')
    if administradores.get('administradores') and len(administradores['administradores']) > 0:
        print("⚠️  ╔══════════════════════════════════════════════════════════╗")
        print("⚠️  ║  YA EXISTE UN ADMINISTRADOR                             ║")
        print("⚠️  ║  No se puede crear otro administrador con este script.   ║")
        print("⚠️  ║  Usa el panel de administración para gestionar usuarios. ║")
        print("⚠️  ╚══════════════════════════════════════════════════════════╝")
        print("")
        
        # Mostrar administradores existentes
        for admin in administradores.get('administradores', []):
            print(f"   👑 {admin.get('nombre', 'N/A')} {admin.get('apellidos', '')}")
            print(f"      Usuario: @{admin.get('usuario', 'N/A')}")
            print(f"      Correo: {admin.get('correo', 'N/A')}")
            print("")
        
        return False
    
    # Generar SECRET_KEY
    SECRET_KEY = secrets.token_hex(32)
    
    def hash_password(password):
        """Hashea la contraseña con la SECRET_KEY generada"""
        salt = SECRET_KEY[:16]
        return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
    
    # ============================================
    # DATOS DEL ADMINISTRADOR
    # ============================================
    nombre = "LUIS ESTEBAN"
    apellidos = "POTOSI VENTE"
    correo = "estebanpotosi2005@gmail.com"
    usuario = "admin"
    password = "S3QyFkrCkNdRQk4"
    celular = "3128813818"
    
    print("📋 DATOS DEL ADMINISTRADOR:")
    print(f"   Nombre:    {nombre} {apellidos}")
    print(f"   Correo:    {correo}")
    print(f"   Usuario:   {usuario}")
    print(f"   Celular:   {celular}")
    print(f"   Password:  {'*' * len(password)}")
    print("")
    
    # Confirmar creación
    confirmacion = input("¿Deseas crear este administrador? (s/n): ").strip().lower()
    if confirmacion not in ['s', 'si', 'sí', 'y', 'yes']:
        print("")
        print("❌ Operación cancelada por el usuario")
        return False
    
    print("")
    print("⏳ Creando administrador...")
    
    # Crear objeto administrador
    admin = {
        "id": 1,
        "nombre": nombre,
        "apellidos": apellidos,
        "documento": "",
        "fecha_nacimiento": "",
        "sexo": "",
        "correo": correo,
        "celular": celular,
        "direccion": "",
        "ministerio": "Pastoral",
        "usuario": usuario,
        "password": hash_password(password),
        "foto": "assets/avatars/admin.png",
        "rol": "admin",
        "verificado": True,
        "fecha_registro": datetime.now().isoformat(),
        "ultima_conexion": datetime.now().isoformat(),
        "estado": "activo",
        "insignias": ["Administrador", "Cuenta Verificada"],
        "intentos_fallidos": 0,
        "bloqueado_hasta": None
    }
    
    # Guardar en la base de datos
    try:
        db.guardar_json('administradores', {
            "administradores": [admin],
            "ultimo_id": 1
        })
        
        # Actualizar configuración
        config = db.cargar_json('configuracion')
        if 'aplicacion' not in config:
            config['aplicacion'] = {}
        config['aplicacion']['primer_administrador_creado'] = True
        db.guardar_json('configuracion', config)
        
        print("✅ ¡Administrador creado exitosamente!")
        print("")
        print("=" * 60)
        print("📁 ARCHIVO: data/administradores.json")
        print("=" * 60)
        print("")
        print("🔑 CREDENCIALES DE ACCESO:")
        print(f"   Usuario:    {usuario}")
        print(f"   Contraseña: {password}")
        print("")
        print("=" * 60)
        print("⚠️  ¡IMPORTANTE! GUARDA ESTA SECRET_KEY:")
        print("=" * 60)
        print(f"   {SECRET_KEY}")
        print("")
        print("📝 INSTRUCCIONES:")
        print("   1. Abre el archivo app.py")
        print("   2. Busca la línea: SECRET_KEY = secrets.token_hex(32)")
        print("   3. Reemplázala por: SECRET_KEY = \"TU_SECRET_KEY_AQUÍ\"")
        print("   4. Guarda app.py y reinicia el servidor")
        print("")
        print("   Ejemplo:")
        print(f'   SECRET_KEY = "{SECRET_KEY}"')
        print("")
        print("⚠️  Sin esta SECRET_KEY en app.py, el inicio de sesión NO funcionará")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"❌ Error al crear administrador: {str(e)}")
        return False


# ============================================
# EJECUCIÓN PRINCIPAL
# ============================================
if __name__ == "__main__":
    try:
        exito = crear_administrador()
        
        if exito:
            print("")
            print("🎉 ¡Listo! El administrador ha sido creado.")
            print("   Ahora puedes iniciar sesión en la aplicación.")
            print("   Recuerda actualizar la SECRET_KEY en app.py")
        else:
            print("")
            print("ℹ️  No se realizaron cambios en la base de datos.")
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Operación cancelada por el usuario")
    except Exception as e:
        print(f"\n\n❌ Error inesperado: {str(e)}")
        print("   Verifica que el archivo database.py esté en la misma carpeta")
    
    print("")
    input("Presiona Enter para salir...")
