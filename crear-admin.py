from database import Database
import hashlib
import secrets

db = Database()
db.inicializar_datos()

# Generar SECRET_KEY (debe ser la misma que usarás en app.py)
SECRET_KEY = secrets.token_hex(32)
print("Tu SECRET_KEY temporal:", SECRET_KEY)

def hash_password(password):
    salt = SECRET_KEY[:16]
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

# Datos del administrador
nombre = "LUIS ESTEBAN"
apellidos = "POTOSI VENTE"
correo = "estebanpotosi2005@gmail.com"
usuario = "admin"
password = "S3QyFkrCkNdRQk4"

# Crear admin directamente en la base de datos
admin = {
    "id": 1,
    "nombre": nombre,
    "apellidos": apellidos,
    "documento": "",
    "fecha_nacimiento": "",
    "sexo": "",
    "correo": correo,
    "celular": "3128813818",
    "direccion": "",
    "ministerio": "Pastoral",
    "usuario": usuario,
    "password": hash_password(password),
    "foto": "assets/avatars/admin.png",
    "rol": "admin",
    "verificado": True,
    "fecha_registro": "2026-07-02T00:00:00",
    "ultima_conexion": "2026-07-02T00:00:00",
    "estado": "activo",
    "insignias": ["Administrador", "Cuenta Verificada"]
}

db.guardar_json('administradores', {"administradores": [admin], "ultimo_id": 1})
print("✅ Administrador creado exitosamente en data/administradores.json")
print(f"Usuario: {usuario}")
print(f"Contraseña: {password}")
print("⚠️  Guarda esta SECRET_KEY si vas a usar este backend en producción")