# ============================================
# IPUC LA FONDA - Generador de Hash de Contraseña
# v2.1.0
# ============================================
# Este script genera el hash de una contraseña usando la misma
# SECRET_KEY que se usa en app.py.
# 
# INSTRUCCIONES:
# 1. Copia la SECRET_KEY de tu archivo app.py
# 2. Pégala en la variable SECRET_KEY de este script
# 3. Ejecuta: python generar_hash.py
# 4. Copia el hash generado y pégalo en data/administradores.json
# ============================================

import hashlib
import secrets
import sys


def generar_hash_contraseña():
    """
    Genera el hash de una contraseña usando SHA-256 + salt.
    """
    print("=" * 60)
    print("🔐 IPUC LA FONDA - Generador de Hash de Contraseña")
    print("=" * 60)
    print("")
    
    # ============================================
    # CONFIGURACIÓN - MODIFICA ESTOS VALORES
    # ============================================
    
    # ⚠️  IMPORTANTE: Copia aquí la SECRET_KEY de tu archivo app.py
    # La SECRET_KEY se encuentra al inicio de app.py:
    #   SECRET_KEY = secrets.token_hex(32)
    # Debes reemplazar esa línea por el valor fijo que se muestra abajo
    SECRET_KEY = "TU_SECRET_KEY_AQUI"  # <-- CAMBIA ESTO
    
    # Contraseña a hashear
    password = "S3QyFkrCkNdRQk4"  # <-- CAMBIA ESTO SI QUIERES OTRA CONTRASEÑA
    
    # ============================================
    # VALIDACIÓN
    # ============================================
    if SECRET_KEY == "TU_SECRET_KEY_AQUI":
        print("⚠️  ╔══════════════════════════════════════════════════════════╗")
        print("⚠️  ║  ADVERTENCIA                                            ║")
        print("⚠️  ║  No has configurado la SECRET_KEY.                      ║")
        print("⚠️  ║                                                          ║")
        print("⚠️  ║  Debes copiar la SECRET_KEY de tu archivo app.py        ║")
        print("⚠️  ║  y pegarla en la variable SECRET_KEY de este script.    ║")
        print("⚠️  ╚══════════════════════════════════════════════════════════╝")
        print("")
        print("📝 Pasos a seguir:")
        print("   1. Abre tu archivo app.py")
        print("   2. Al iniciar el servidor, busca la línea que dice:")
        print("      'Tu SECRET_KEY temporal: xxxxxxxxxxxxxxxx'")
        print("      O busca: SECRET_KEY = secrets.token_hex(32)")
        print("   3. Copia esa SECRET_KEY")
        print("   4. Pégala en este script y vuelve a ejecutarlo")
        print("")
        
        # Opción: generar una nueva SECRET_KEY
        print("💡 ¿Quieres generar una nueva SECRET_KEY?")
        respuesta = input("   (s/n): ").strip().lower()
        
        if respuesta in ['s', 'si', 'sí', 'y', 'yes']:
            SECRET_KEY = secrets.token_hex(32)
            print("")
            print("✅ Nueva SECRET_KEY generada:")
            print(f"   {SECRET_KEY}")
            print("")
            print("📝 Ahora debes actualizar app.py:")
            print("   Busca: SECRET_KEY = secrets.token_hex(32)")
            print("   Cambia por: SECRET_KEY = \"TU_NUEVA_SECRET_KEY\"")
            print("")
        else:
            print("")
            print("❌ No se puede continuar sin una SECRET_KEY válida.")
            print("   Ejecuta el script de nuevo cuando tengas la SECRET_KEY.")
            return
    
    # ============================================
    # GENERAR HASH
    # ============================================
    def hash_password(password, secret_key):
        """Hashea la contraseña con SHA-256 + salt"""
        salt = secret_key[:16]
        return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
    
    print("=" * 60)
    print("🔒 GENERANDO HASH DE CONTRASEÑA")
    print("=" * 60)
    print("")
    print(f"   SECRET_KEY:  {SECRET_KEY[:20]}... (truncado por seguridad)")
    print(f"   Contraseña:  {'*' * len(password)}")
    print("")
    
    hash_resultado = hash_password(password, SECRET_KEY)
    
    print("✅ Hash generado exitosamente:")
    print("")
    print("=" * 60)
    print(f"   {hash_resultado}")
    print("=" * 60)
    print("")
    print("📝 INSTRUCCIONES DE USO:")
    print("")
    print("   Opción 1: Usar en data/administradores.json")
    print("   Abre el archivo data/administradores.json y pega el hash")
    print("   en el campo 'password' del administrador.")
    print("")
    print("   Opción 2: Usar en app.py")
    print("   1. Abre app.py")
    print("   2. Busca: SECRET_KEY = secrets.token_hex(32)")
    print("   3. Cambia por: SECRET_KEY = \"TU_SECRET_KEY\"")
    print("   4. Reinicia el servidor Flask")
    print("")
    print("⚠️  IMPORTANTE:")
    print("   • La SECRET_KEY debe ser LA MISMA en app.py y en este script")
    print("   • Si cambias la SECRET_KEY, TODAS las contraseñas anteriores")
    print("     dejarán de funcionar")
    print("   • Guarda la SECRET_KEY en un lugar seguro")
    print("=" * 60)
    print("")
    
    # Preguntar si quiere guardar en archivo
    guardar = input("¿Quieres guardar el hash en un archivo hash.txt? (s/n): ").strip().lower()
    if guardar in ['s', 'si', 'sí', 'y', 'yes']:
        with open('hash.txt', 'w', encoding='utf-8') as f:
            f.write("=" * 60 + "\n")
            f.write("IPUC LA FONDA - Hash de Contraseña\n")
            f.write("=" * 60 + "\n")
            f.write(f"SECRET_KEY: {SECRET_KEY}\n")
            f.write(f"Contraseña: {password}\n")
            f.write(f"Hash: {hash_resultado}\n")
            f.write("=" * 60 + "\n")
            f.write("\n⚠️  Guarda este archivo en un lugar seguro\n")
        print("✅ Hash guardado en hash.txt")
    
    return hash_resultado


# ============================================
# EJECUCIÓN PRINCIPAL
# ============================================
if __name__ == "__main__":
    try:
        hash_generado = generar_hash_contraseña()
        
        if hash_generado:
            print("")
            print("🎉 ¡Hash generado correctamente!")
            print("   Ya puedes usar este hash en tu archivo administradores.json")
        else:
            print("")
            print("ℹ️  No se generó ningún hash.")
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Operación cancelada por el usuario")
    except Exception as e:
        print(f"\n\n❌ Error inesperado: {str(e)}")
    
    print("")
    input("Presiona Enter para salir...")
