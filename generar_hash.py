import hashlib
import secrets

# Esta es la SECRET_KEY que usa tu app.py (debe ser la misma)
SECRET_KEY = "TU_SECRET_KEY_AQUI"  # Cópiala de tu app.py

def hash_password(password):
    salt = SECRET_KEY[:16]
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

# Generar hash para tu contraseña
password = "S3QyFkrCkNdRQk4"
hash_resultado = hash_password(password)
print(f"Hash generado: {hash_resultado}")