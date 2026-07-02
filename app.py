# ============================================
# IPUC LA FONDA - API REST v2.1.0
# Servidor Flask Principal - COMPLETO
# Autenticación segura - Sin credenciales de prueba
# ============================================

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from database import Database
import hashlib
import secrets
import datetime
import os
import re
import logging
import sys
from functools import wraps

# ============================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ============================================
app = Flask(__name__)
CORS(app, origins=['*'], supports_credentials=True)
db = Database()

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('logs/server.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# ============================================
# CONFIGURACIÓN DE SEGURIDAD
# ============================================
SECRET_KEY = secrets.token_hex(32)
TOKENS = {}
INTENTOS_FALLIDOS = {}
BLOQUEOS_TEMPORALES = {}
MAX_INTENTOS = 5
TIEMPO_BLOQUEO = 15
DURACION_TOKEN = 24

# ============================================
# FUNCIONES DE SEGURIDAD
# ============================================
def hash_password(password):
    """Encripta contraseña con SHA-256 + salt"""
    salt = SECRET_KEY[:16]
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

def generar_token():
    """Genera token de sesión único"""
    return secrets.token_urlsafe(32)

def verificar_token(token):
    """Verifica si un token es válido y no ha expirado"""
    if not token:
        return None
    if token in TOKENS:
        sesion = TOKENS[token]
        if datetime.datetime.now() < sesion['expira']:
            return sesion
        else:
            del TOKENS[token]
    return None

def limpiar_tokens_expirados():
    """Elimina tokens expirados"""
    ahora = datetime.datetime.now()
    expirados = [t for t, s in TOKENS.items() if s['expira'] < ahora]
    for t in expirados:
        del TOKENS[t]
    if expirados:
        logger.info(f"🧹 {len(expirados)} tokens expirados eliminados")

def registrar_actividad(usuario_id, accion, detalles=""):
    """Registra actividad de usuario"""
    try:
        actividad = db.cargar_json('actividad')
        registro = {
            "id": len(actividad.get('registros', [])) + 1,
            "usuario_id": usuario_id,
            "accion": accion,
            "detalles": detalles,
            "fecha": datetime.datetime.now().isoformat(),
            "ip": request.remote_addr if request else '127.0.0.1'
        }
        if 'registros' not in actividad:
            actividad['registros'] = []
        actividad['registros'].append(registro)
        db.guardar_json('actividad', actividad)
    except Exception as e:
        logger.error(f"Error registrando actividad: {e}")

def verificar_bloqueo_ip(ip):
    """Verifica si una IP está bloqueada"""
    if ip in BLOQUEOS_TEMPORALES:
        bloqueo = BLOQUEOS_TEMPORALES[ip]
        if datetime.datetime.now() < bloqueo['hasta']:
            segundos = int((bloqueo['hasta'] - datetime.datetime.now()).total_seconds())
            return True, segundos
        else:
            del BLOQUEOS_TEMPORALES[ip]
            if ip in INTENTOS_FALLIDOS:
                del INTENTOS_FALLIDOS[ip]
    return False, 0

def registrar_intento_fallido(ip):
    """Registra intento fallido y bloquea IP si es necesario"""
    if ip not in INTENTOS_FALLIDOS:
        INTENTOS_FALLIDOS[ip] = {'intentos': 1, 'ultimo': datetime.datetime.now()}
    else:
        INTENTOS_FALLIDOS[ip]['intentos'] += 1
        INTENTOS_FALLIDOS[ip]['ultimo'] = datetime.datetime.now()
    
    intentos = INTENTOS_FALLIDOS[ip]['intentos']
    restantes = MAX_INTENTOS - intentos
    
    logger.warning(f"⚠️ Intento fallido {intentos}/{MAX_INTENTOS} desde IP: {ip}")
    
    if restantes <= 0:
        BLOQUEOS_TEMPORALES[ip] = {
            'hasta': datetime.datetime.now() + datetime.timedelta(minutes=TIEMPO_BLOQUEO)
        }
        return {
            "error": "IP bloqueada temporalmente",
            "mensaje": f"Demasiados intentos fallidos. Intente en {TIEMPO_BLOQUEO} minutos.",
            "bloqueado": True
        }, 403
    
    return {
        "error": "Credenciales inválidas",
        "mensaje": f"Usuario o contraseña incorrectos. Intentos restantes: {restantes}",
        "intentos_restantes": restantes
    }, 401

def crear_sesion(usuario, rol, ip):
    """Crea sesión para usuario autenticado"""
    token = generar_token()
    TOKENS[token] = {
        'usuario': usuario,
        'rol': rol,
        'expira': datetime.datetime.now() + datetime.timedelta(hours=DURACION_TOKEN),
        'creado': datetime.datetime.now().isoformat(),
        'ip': ip
    }
    
    if rol == 'usuario':
        try:
            usuarios = db.cargar_json('usuarios')
            for i, u in enumerate(usuarios.get('usuarios', [])):
                if u['id'] == usuario['id']:
                    usuarios['usuarios'][i]['ultima_conexion'] = datetime.datetime.now().isoformat()
                    break
            db.guardar_json('usuarios', usuarios)
        except Exception as e:
            logger.error(f"Error actualizando última conexión: {e}")
    
    if ip in INTENTOS_FALLIDOS:
        del INTENTOS_FALLIDOS[ip]
    
    registrar_actividad(usuario['id'], "Inicio de sesión", f"Rol: {rol}")
    logger.info(f"✅ Sesión creada para {usuario['usuario']} (rol: {rol})")
    
    return jsonify({
        "mensaje": "Inicio de sesión exitoso",
        "token": token,
        "rol": rol,
        "token_expira_en_horas": DURACION_TOKEN,
        "usuario": {
            "id": usuario['id'],
            "nombre": usuario['nombre'],
            "apellidos": usuario.get('apellidos', ''),
            "usuario": usuario['usuario'],
            "correo": usuario.get('correo', ''),
            "foto": usuario.get('foto', 'assets/avatars/default.png'),
            "verificado": usuario.get('verificado', False),
            "ministerio": usuario.get('ministerio', ''),
            "insignias": usuario.get('insignias', [])
        }
    }), 200

def actualizar_estadisticas_asistencia():
    """Actualiza estadísticas de asistencia"""
    try:
        asistencia = db.cargar_json('asistencia')
        estadisticas = db.cargar_json('estadisticas')
        hoy = datetime.datetime.now().strftime('%Y-%m-%d')
        mes = datetime.datetime.now().strftime('%Y-%m')
        año = datetime.datetime.now().strftime('%Y')
        registros = asistencia.get('registros', [])
        estadisticas['asistencia'] = {
            "diario": len([r for r in registros if r.get('fecha') == hoy]),
            "mensual": len([r for r in registros if r.get('fecha', '').startswith(mes)]),
            "anual": len([r for r in registros if r.get('fecha', '').startswith(año)]),
            "total": len(registros),
            "ultima_actualizacion": datetime.datetime.now().isoformat()
        }
        db.guardar_json('estadisticas', estadisticas)
    except Exception as e:
        logger.error(f"Error actualizando estadísticas de asistencia: {e}")

def actualizar_estadisticas_usuarios():
    """Actualiza estadísticas de usuarios"""
    try:
        usuarios = db.cargar_json('usuarios')
        estadisticas = db.cargar_json('estadisticas')
        todos = usuarios.get('usuarios', [])
        mes = datetime.datetime.now().strftime('%Y-%m')
        estadisticas['usuarios'] = {
            "total": len(todos),
            "activos": len([u for u in todos if u.get('estado') == 'activo']),
            "nuevos_mes": len([u for u in todos if u.get('fecha_registro', '').startswith(mes)]),
            "ultima_actualizacion": datetime.datetime.now().isoformat()
        }
        db.guardar_json('estadisticas', estadisticas)
    except Exception as e:
        logger.error(f"Error actualizando estadísticas de usuarios: {e}")

def validar_email(email):
    """Valida formato de correo electrónico"""
    patron = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(patron, email) is not None

def validar_usuario(usuario):
    """Valida formato de nombre de usuario"""
    patron = r'^[a-zA-Z0-9_]{3,20}$'
    return re.match(patron, usuario) is not None

# ============================================
# DECORADORES DE AUTENTICACIÓN
# ============================================
def requiere_auth(f):
    """Decorador para rutas que requieren autenticación"""
    @wraps(f)
    def decorador(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        sesion = verificar_token(token)
        if not sesion:
            return jsonify({"error": "No autorizado", "mensaje": "Token inválido o expirado"}), 401
        return f(*args, **kwargs)
    return decorador

def requiere_admin(f):
    """Decorador para rutas que requieren rol de administrador"""
    @wraps(f)
    def decorador(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        sesion = verificar_token(token)
        if not sesion:
            return jsonify({"error": "No autorizado", "mensaje": "Token inválido o expirado"}), 401
        if sesion['rol'] != 'admin':
            return jsonify({"error": "Acceso denegado", "mensaje": "Se requiere rol de administrador"}), 403
        return f(*args, **kwargs)
    return decorador

# ============================================
# MIDDLEWARE
# ============================================
@app.before_request
def before_request():
    """Middleware para verificar bloqueos y limpiar tokens"""
    if request.endpoint in ['login', 'registro']:
        ip = request.remote_addr
        bloqueado, segundos = verificar_bloqueo_ip(ip)
        if bloqueado:
            return jsonify({
                "error": "IP bloqueada temporalmente",
                "mensaje": f"Demasiados intentos fallidos. Intente en {segundos} segundos.",
                "segundos_restantes": segundos
            }), 403
    
    if not hasattr(app, 'request_count'):
        app.request_count = 0
    app.request_count += 1
    if app.request_count % 100 == 0:
        limpiar_tokens_expirados()

# ============================================
# RUTAS ESTÁTICAS
# ============================================
@app.route('/')
def index():
    """Sirve el archivo principal"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    """Sirve archivos estáticos"""
    if os.path.exists(path):
        return send_from_directory('.', path)
    return jsonify({"error": "Archivo no encontrado"}), 404

@app.route('/api/health')
def health():
    """Endpoint de salud del servidor"""
    return jsonify({
        "estado": "online",
        "version": "2.1.0",
        "timestamp": datetime.datetime.now().isoformat(),
        "servidor": "IPUC LA FONDA API",
        "sesiones_activas": len(TOKENS),
        "ips_bloqueadas": len(BLOQUEOS_TEMPORALES)
    }), 200

# ============================================
# AUTENTICACIÓN
# ============================================
@app.route('/api/registro', methods=['POST'])
def registro():
    """Registrar nuevo usuario"""
    try:
        datos = request.json
        if not datos:
            return jsonify({"error": "Datos inválidos"}), 400
        
        campos_requeridos = ['nombre', 'apellidos', 'documento', 'fecha_nacimiento',
                            'sexo', 'correo', 'celular', 'usuario', 'password', 'ministerio']
        
        for campo in campos_requeridos:
            if campo not in datos or not str(datos[campo]).strip():
                return jsonify({"error": f"El campo '{campo}' es obligatorio"}), 400
        
        if not validar_email(datos['correo']):
            return jsonify({"error": "Formato de correo electrónico inválido"}), 400
        
        if not validar_usuario(datos['usuario']):
            return jsonify({"error": "El usuario debe tener entre 3 y 20 caracteres (solo letras, números y guiones bajos)"}), 400
        
        if len(datos['password']) < 8:
            return jsonify({"error": "La contraseña debe tener al menos 8 caracteres"}), 400
        
        usuarios = db.cargar_json('usuarios')
        
        if any(str(u.get('documento')) == str(datos['documento']) for u in usuarios.get('usuarios', [])):
            return jsonify({"error": "El documento ya está registrado"}), 400
        
        if any(u.get('correo', '').lower() == datos['correo'].lower() for u in usuarios.get('usuarios', [])):
            return jsonify({"error": "El correo ya está registrado"}), 400
        
        if any(u.get('usuario', '').lower() == datos['usuario'].lower() for u in usuarios.get('usuarios', [])):
            return jsonify({"error": "El nombre de usuario ya existe"}), 400
        
        nuevo_usuario = {
            "id": len(usuarios.get('usuarios', [])) + 1,
            "nombre": datos['nombre'].strip(),
            "apellidos": datos['apellidos'].strip(),
            "documento": datos['documento'].strip(),
            "fecha_nacimiento": datos['fecha_nacimiento'],
            "sexo": datos['sexo'],
            "correo": datos['correo'].strip().lower(),
            "celular": datos['celular'].strip(),
            "direccion": datos.get('direccion', '').strip(),
            "ministerio": datos['ministerio'],
            "usuario": datos['usuario'].strip().lower(),
            "password": hash_password(datos['password']),
            "foto": datos.get('foto', 'assets/avatars/default.png'),
            "rol": "usuario",
            "verificado": False,
            "fecha_registro": datetime.datetime.now().isoformat(),
            "ultima_conexion": datetime.datetime.now().isoformat(),
            "estado": "activo",
            "insignias": ["Nuevo Miembro"]
        }
        
        if 'usuarios' not in usuarios:
            usuarios['usuarios'] = []
        usuarios['usuarios'].append(nuevo_usuario)
        db.guardar_json('usuarios', usuarios)
        
        actualizar_estadisticas_usuarios()
        registrar_actividad(nuevo_usuario['id'], "Registro", "Nuevo usuario registrado")
        
        logger.info(f"✅ Nuevo usuario registrado: {nuevo_usuario['usuario']}")
        
        return jsonify({
            "mensaje": "Registro exitoso. Ahora puedes iniciar sesión.",
            "usuario": {
                "id": nuevo_usuario['id'],
                "nombre": nuevo_usuario['nombre'],
                "usuario": nuevo_usuario['usuario']
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Error en registro: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Iniciar sesión"""
    try:
        datos = request.json
        if not datos:
            return jsonify({"error": "Datos inválidos"}), 400
        
        usuario_id = datos.get('usuario', '').strip()
        password = datos.get('password', '')
        
        if not usuario_id or not password:
            return jsonify({"error": "Usuario y contraseña son obligatorios"}), 400
        
        ip = request.remote_addr
        
        bloqueado, segundos = verificar_bloqueo_ip(ip)
        if bloqueado:
            return jsonify({
                "error": "IP bloqueada",
                "mensaje": f"Intente nuevamente en {segundos} segundos"
            }), 403
        
        # Buscar en administradores
        administradores = db.cargar_json('administradores')
        admin = next((a for a in administradores.get('administradores', [])
                     if a['usuario'].lower() == usuario_id.lower()
                     or a['correo'].lower() == usuario_id.lower()), None)
        
        if admin and admin['password'] == hash_password(password):
            return crear_sesion(admin, 'admin', ip)
        
        # Buscar en usuarios
        usuarios = db.cargar_json('usuarios')
        usuario = next((u for u in usuarios.get('usuarios', [])
                       if u['usuario'].lower() == usuario_id.lower()
                       or u['correo'].lower() == usuario_id.lower()), None)
        
        if usuario and usuario['password'] == hash_password(password):
            if usuario.get('estado') != 'activo':
                return jsonify({"error": "Cuenta desactivada. Contacte al administrador."}), 403
            return crear_sesion(usuario, 'usuario', ip)
        
        return registrar_intento_fallido(ip)
        
    except Exception as e:
        logger.error(f"Error en login: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """Cerrar sesión"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if token in TOKENS:
        registrar_actividad(TOKENS[token]['usuario']['id'], "Cierre de sesión")
        del TOKENS[token]
    return jsonify({"mensaje": "Sesión cerrada exitosamente"}), 200

@app.route('/api/verificar-sesion', methods=['GET'])
def verificar_sesion():
    """Verificar si la sesión es válida"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    if not sesion:
        return jsonify({"valida": False, "error": "Sesión expirada"}), 401
    return jsonify({
        "valida": True,
        "usuario": {
            "id": sesion['usuario']['id'],
            "nombre": sesion['usuario']['nombre'],
            "rol": sesion['rol']
        }
    }), 200

# ============================================
# ADMINISTRADOR - CREAR PRIMER ADMIN
# ============================================
@app.route('/api/admin/crear-primer-admin', methods=['POST'])
def crear_primer_admin():
    """
    Crea el primer administrador del sistema.
    SOLO funciona si NO existe ningún administrador previo.
    """
    try:
        datos = request.json
        if not datos:
            return jsonify({"error": "Se requieren datos en formato JSON"}), 400
        
        campos_requeridos = ['nombre', 'apellidos', 'correo', 'usuario', 'password']
        for campo in campos_requeridos:
            if campo not in datos or not str(datos[campo]).strip():
                return jsonify({"error": f"El campo '{campo}' es obligatorio"}), 400
        
        if not validar_email(datos['correo']):
            return jsonify({"error": "Formato de correo electrónico inválido"}), 400
        
        if not validar_usuario(datos['usuario']):
            return jsonify({"error": "El usuario debe tener entre 3 y 20 caracteres (solo letras, números y guiones bajos)"}), 400
        
        if len(datos['password']) < 8:
            return jsonify({"error": "La contraseña debe tener al menos 8 caracteres"}), 400
        
        # Verificar que NO exista ningún administrador
        administradores = db.cargar_json('administradores')
        if administradores.get('administradores') and len(administradores['administradores']) > 0:
            registrar_actividad(0, "Intento de crear admin adicional", f"IP: {request.remote_addr}")
            return jsonify({
                "error": "Ya existe al menos un administrador",
                "mensaje": "Esta función solo está disponible cuando no hay administradores."
            }), 403
        
        # Verificar que el usuario no exista
        usuarios = db.cargar_json('usuarios')
        if any(u.get('usuario', '').lower() == datos['usuario'].lower() for u in usuarios.get('usuarios', [])):
            return jsonify({"error": "El nombre de usuario ya existe en el sistema"}), 400
        
        if any(u.get('correo', '').lower() == datos['correo'].lower() for u in usuarios.get('usuarios', [])):
            return jsonify({"error": "El correo electrónico ya está registrado"}), 400
        
        # Crear administrador
        admin = {
            "id": 1,
            "nombre": datos['nombre'].strip(),
            "apellidos": datos['apellidos'].strip(),
            "documento": datos.get('documento', ''),
            "fecha_nacimiento": datos.get('fecha_nacimiento', ''),
            "sexo": datos.get('sexo', ''),
            "correo": datos['correo'].strip().lower(),
            "celular": datos.get('celular', '').strip(),
            "direccion": datos.get('direccion', '').strip(),
            "ministerio": datos.get('ministerio', 'Pastoral'),
            "usuario": datos['usuario'].strip().lower(),
            "password": hash_password(datos['password']),
            "foto": "assets/avatars/admin.png",
            "rol": "admin",
            "verificado": True,
            "fecha_registro": datetime.datetime.now().isoformat(),
            "ultima_conexion": datetime.datetime.now().isoformat(),
            "estado": "activo",
            "insignias": ["Administrador", "Cuenta Verificada"]
        }
        
        if 'administradores' not in administradores:
            administradores['administradores'] = []
        administradores['administradores'].append(admin)
        administradores['ultimo_id'] = 1
        db.guardar_json('administradores', administradores)
        
        # Actualizar configuración
        config = db.cargar_json('configuracion')
        config['aplicacion']['primer_administrador_creado'] = True
        db.guardar_json('configuracion', config)
        
        registrar_actividad(1, "Primer administrador creado", f"Usuario: {datos['usuario']}")
        actualizar_estadisticas_usuarios()
        
        logger.info(f"✅ Primer administrador creado: {datos['usuario']}")
        
        return jsonify({
            "mensaje": "Primer administrador creado exitosamente. Ahora puedes iniciar sesión.",
            "admin": {
                "id": 1,
                "usuario": datos['usuario'],
                "nombre": f"{datos['nombre']} {datos['apellidos']}",
                "correo": datos['correo']
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Error creando primer admin: {e}")
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

# ============================================
# USUARIOS Y DIRECTORIO
# ============================================
@app.route('/api/usuarios', methods=['GET'])
@requiere_auth
def obtener_usuarios():
    """Obtener lista de usuarios"""
    usuarios = db.cargar_json('usuarios')
    seguros = [{k: v for k, v in u.items() if k != 'password'} for u in usuarios.get('usuarios', [])]
    return jsonify({"usuarios": seguros, "total": len(seguros)}), 200

@app.route('/api/usuarios/<int:usuario_id>', methods=['GET'])
@requiere_auth
def obtener_usuario(usuario_id):
    """Obtener usuario por ID"""
    usuarios = db.cargar_json('usuarios')
    usuario = next((u for u in usuarios.get('usuarios', []) if u['id'] == usuario_id), None)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify({"usuario": {k: v for k, v in usuario.items() if k != 'password'}}), 200

@app.route('/api/usuarios/<int:usuario_id>', methods=['PUT'])
@requiere_auth
def actualizar_usuario(usuario_id):
    """Actualizar información de usuario"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if sesion['rol'] != 'admin' and sesion['usuario']['id'] != usuario_id:
        return jsonify({"error": "No tiene permisos para editar este usuario"}), 403
    
    datos = request.json
    if not datos:
        return jsonify({"error": "Datos inválidos"}), 400
    
    usuarios = db.cargar_json('usuarios')
    for i, u in enumerate(usuarios.get('usuarios', [])):
        if u['id'] == usuario_id:
            campos_permitidos = ['nombre', 'apellidos', 'celular', 'direccion', 'ministerio', 'foto', 'estado']
            for campo in campos_permitidos:
                if campo in datos:
                    usuarios['usuarios'][i][campo] = datos[campo]
            db.guardar_json('usuarios', usuarios)
            registrar_actividad(sesion['usuario']['id'], "Actualización de perfil", f"Usuario ID: {usuario_id}")
            return jsonify({"mensaje": "Usuario actualizado exitosamente"}), 200
    
    return jsonify({"error": "Usuario no encontrado"}), 404

@app.route('/api/usuarios/<int:usuario_id>/verificar', methods=['POST'])
@requiere_admin
def verificar_usuario(usuario_id):
    """Verificar cuenta de usuario (admin)"""
    usuarios = db.cargar_json('usuarios')
    for i, u in enumerate(usuarios.get('usuarios', [])):
        if u['id'] == usuario_id:
            usuarios['usuarios'][i]['verificado'] = True
            if 'Cuenta Verificada' not in usuarios['usuarios'][i].get('insignias', []):
                usuarios['usuarios'][i].setdefault('insignias', []).append('Cuenta Verificada')
            db.guardar_json('usuarios', usuarios)
            token = request.headers.get('Authorization', '').replace('Bearer ', '')
            sesion = verificar_token(token)
            registrar_actividad(sesion['usuario']['id'], "Verificación de cuenta", f"Usuario ID: {usuario_id}")
            return jsonify({"mensaje": "Cuenta verificada exitosamente"}), 200
    return jsonify({"error": "Usuario no encontrado"}), 404

@app.route('/api/usuarios/<int:usuario_id>/cambiar-password', methods=['PUT'])
@requiere_auth
def cambiar_password(usuario_id):
    """Cambiar contraseña de usuario"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if sesion['usuario']['id'] != usuario_id and sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    
    datos = request.json
    if not datos or 'password_actual' not in datos or 'password_nueva' not in datos:
        return jsonify({"error": "Datos incompletos"}), 400
    
    if len(datos['password_nueva']) < 8:
        return jsonify({"error": "La nueva contraseña debe tener al menos 8 caracteres"}), 400
    
    usuarios = db.cargar_json('usuarios')
    for i, u in enumerate(usuarios.get('usuarios', [])):
        if u['id'] == usuario_id:
            if u['password'] != hash_password(datos['password_actual']):
                return jsonify({"error": "Contraseña actual incorrecta"}), 400
            usuarios['usuarios'][i]['password'] = hash_password(datos['password_nueva'])
            db.guardar_json('usuarios', usuarios)
            registrar_actividad(usuario_id, "Cambio de contraseña")
            return jsonify({"mensaje": "Contraseña actualizada exitosamente"}), 200
    
    return jsonify({"error": "Usuario no encontrado"}), 404

@app.route('/api/directorio', methods=['GET'])
@requiere_auth
def directorio():
    """Obtener directorio de miembros"""
    usuarios = db.cargar_json('usuarios')
    miembros = [{
        "id": u['id'],
        "nombre": u['nombre'],
        "apellidos": u.get('apellidos', ''),
        "foto": u.get('foto'),
        "ministerio": u.get('ministerio'),
        "verificado": u.get('verificado', False),
        "ultima_conexion": u.get('ultima_conexion', '')
    } for u in usuarios.get('usuarios', [])]
    return jsonify({"miembros": miembros, "total": len(miembros)}), 200

# ============================================
# ASISTENCIA
# ============================================
@app.route('/api/asistencia', methods=['GET', 'POST'])
@requiere_auth
def asistencia():
    """Obtener o registrar asistencia"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if request.method == 'GET':
        registros = db.cargar_json('asistencia').get('registros', [])
        if sesion['rol'] == 'usuario':
            registros = [r for r in registros if r.get('usuario_id') == sesion['usuario']['id']]
        return jsonify({"registros": registros, "total": len(registros)}), 200
    
    datos = request.json
    if not datos:
        return jsonify({"error": "Datos inválidos"}), 400
    
    asistencia_data = db.cargar_json('asistencia')
    nuevo = {
        "id": len(asistencia_data.get('registros', [])) + 1,
        "usuario_id": sesion['usuario']['id'],
        "nombre": sesion['usuario']['nombre'],
        "fecha": datos.get('fecha', datetime.datetime.now().strftime('%Y-%m-%d')),
        "hora": datetime.datetime.now().strftime('%H:%M:%S'),
        "estado": datos.get('estado', 'Asistiré'),
        "tipo": datos.get('tipo', 'Hermano'),
        "culto": datos.get('culto', ''),
        "comentario": datos.get('comentario', '')
    }
    asistencia_data.setdefault('registros', []).append(nuevo)
    db.guardar_json('asistencia', asistencia_data)
    actualizar_estadisticas_asistencia()
    return jsonify({"mensaje": "Asistencia registrada exitosamente", "registro": nuevo}), 201

@app.route('/api/asistencia/estadisticas')
@requiere_auth
def estadisticas_asistencia():
    """Obtener estadísticas de asistencia"""
    return jsonify(db.cargar_json('estadisticas').get('asistencia', {})), 200

# ============================================
# CULTOS Y HORARIOS
# ============================================
@app.route('/api/cultos/proximo')
def proximo_culto():
    """Obtener información del próximo culto"""
    ahora = datetime.datetime.now()
    cultos = {
        0: [], 1: [{"inicio": "18:00", "fin": "20:30", "nombre": "Culto de Oración"}],
        2: [{"inicio": "16:00", "fin": "19:00", "nombre": "Culto Campal"}],
        3: [{"inicio": "16:00", "fin": "19:00", "nombre": "Culto de Refrán"}],
        4: [{"inicio": "18:00", "fin": "20:30", "nombre": "Culto de Jóvenes"}],
        5: [], 6: [{"inicio": "10:00", "fin": "12:00", "nombre": "Culto Dominical"}]
    }
    dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    
    for offset in range(8):
        dia = (ahora.weekday() + offset) % 7
        for c in cultos[dia]:
            fecha = ahora + datetime.timedelta(days=offset)
            inicio = datetime.datetime.strptime(f"{fecha.strftime('%Y-%m-%d')} {c['inicio']}", '%Y-%m-%d %H:%M')
            fin = datetime.datetime.strptime(f"{fecha.strftime('%Y-%m-%d')} {c['fin']}", '%Y-%m-%d %H:%M')
            if offset == 0 and ahora.time() > fin.time():
                continue
            estado = "en_curso" if offset == 0 and ahora.time() >= inicio.time() else "proximo"
            restante = (fin - ahora).total_seconds() if estado == "en_curso" else (inicio - ahora).total_seconds()
            return jsonify({
                "nombre": c['nombre'], "dia": dias[dia], "fecha": fecha.strftime('%Y-%m-%d'),
                "inicio": c['inicio'], "fin": c['fin'], "estado": estado,
                "segundos_restantes": max(0, restante)
            }), 200
    
    return jsonify({"mensaje": "No hay cultos programados", "estado": "sin_cultos", "segundos_restantes": 0}), 200

@app.route('/api/horarios')
def horarios():
    """Obtener horarios de cultos"""
    return jsonify(db.cargar_json('horarios')), 200

# ============================================
# VERSÍCULOS
# ============================================
@app.route('/api/versiculo-diario')
def versiculo_diario():
    """Obtener versículo del día"""
    data = db.cargar_json('versiculos')
    hoy = datetime.datetime.now().strftime('%Y-%m-%d')
    actual = data.get('versiculo_actual')
    
    if not actual or actual.get('fecha') != hoy:
        lista = data.get('versiculos', [])
        if lista:
            actual = lista[datetime.datetime.now().day % len(lista)].copy()
            actual['fecha'] = hoy
            data['versiculo_actual'] = actual
            db.guardar_json('versiculos', data)
        else:
            actual = {
                "texto": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
                "referencia": "Juan 3:16",
                "tipo": "promesa",
                "fecha": hoy
            }
    
    return jsonify({"versiculo": actual}), 200

@app.route('/api/versiculos', methods=['GET', 'POST'])
@requiere_auth
def versiculos():
    """Obtener o crear versículos"""
    if request.method == 'GET':
        return jsonify({"versiculos": db.cargar_json('versiculos').get('versiculos', [])}), 200
    
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    if sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    
    datos = request.json
    if not datos or 'texto' not in datos or 'referencia' not in datos:
        return jsonify({"error": "Datos incompletos"}), 400
    
    versiculos_data = db.cargar_json('versiculos')
    nuevo = {
        "id": len(versiculos_data.get('versiculos', [])) + 1,
        "texto": datos['texto'],
        "referencia": datos['referencia'],
        "tipo": datos.get('tipo', 'versiculo'),
        "fecha_creacion": datetime.datetime.now().isoformat()
    }
    versiculos_data.setdefault('versiculos', []).append(nuevo)
    db.guardar_json('versiculos', versiculos_data)
    return jsonify({"mensaje": "Versículo creado exitosamente", "versiculo": nuevo}), 201

@app.route('/api/versiculos/<int:versiculo_id>', methods=['DELETE'])
@requiere_admin
def eliminar_versiculo(versiculo_id):
    """Eliminar versículo (admin)"""
    versiculos_data = db.cargar_json('versiculos')
    versiculos_data['versiculos'] = [v for v in versiculos_data.get('versiculos', []) if v['id'] != versiculo_id]
    db.guardar_json('versiculos', versiculos_data)
    return jsonify({"mensaje": "Versículo eliminado exitosamente"}), 200

# ============================================
# NOTICIAS
# ============================================
@app.route('/api/noticias', methods=['GET', 'POST'])
def noticias():
    """Obtener o crear noticias"""
    if request.method == 'GET':
        noticias_data = db.cargar_json('noticias')
        lista = noticias_data.get('noticias', [])
        publicadas = [n for n in lista if n.get('estado') == 'publicado']
        return jsonify({
            "noticias": sorted(publicadas, key=lambda x: x.get('fecha_publicacion', ''), reverse=True)[:20],
            "total": len(publicadas)
        }), 200
    
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    if not sesion or sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    
    datos = request.json
    if not datos or 'titulo' not in datos or 'contenido' not in datos:
        return jsonify({"error": "Datos incompletos"}), 400
    
    noticias_data = db.cargar_json('noticias')
    nueva = {
        "id": len(noticias_data.get('noticias', [])) + 1,
        "titulo": datos['titulo'],
        "contenido": datos['contenido'],
        "imagen": datos.get('imagen', ''),
        "autor_id": sesion['usuario']['id'],
        "autor_nombre": sesion['usuario']['nombre'],
        "fecha_publicacion": datetime.datetime.now().isoformat(),
        "fecha_actualizacion": datetime.datetime.now().isoformat(),
        "estado": datos.get('estado', 'publicado'),
        "categoria": datos.get('categoria', 'General'),
        "comentarios": [],
        "reacciones": {"me_gusta": 0, "amen": 0, "bendiciones": 0, "aleluya": 0}
    }
    noticias_data.setdefault('noticias', []).append(nueva)
    db.guardar_json('noticias', noticias_data)
    return jsonify({"mensaje": "Noticia creada exitosamente", "noticia": nueva}), 201

@app.route('/api/noticias/<int:noticia_id>', methods=['DELETE'])
@requiere_admin
def eliminar_noticia(noticia_id):
    """Eliminar noticia (admin)"""
    noticias_data = db.cargar_json('noticias')
    noticias_data['noticias'] = [n for n in noticias_data.get('noticias', []) if n['id'] != noticia_id]
    db.guardar_json('noticias', noticias_data)
    return jsonify({"mensaje": "Noticia eliminada exitosamente"}), 200

# ============================================
# EVENTOS
# ============================================
@app.route('/api/eventos', methods=['GET', 'POST'])
def eventos():
    """Obtener o crear eventos"""
    if request.method == 'GET':
        eventos_data = db.cargar_json('eventos')
        lista = eventos_data.get('eventos', [])
        proximos = [e for e in lista if e.get('fecha', '') >= datetime.datetime.now().strftime('%Y-%m-%d')]
        return jsonify({
            "eventos": sorted(proximos, key=lambda x: x.get('fecha', ''))[:20],
            "total": len(proximos)
        }), 200
    
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    if not sesion or sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    
    datos = request.json
    if not datos or 'titulo' not in datos or 'fecha' not in datos:
        return jsonify({"error": "Datos incompletos"}), 400
    
    eventos_data = db.cargar_json('eventos')
    nuevo = {
        "id": len(eventos_data.get('eventos', [])) + 1,
        "titulo": datos['titulo'],
        "descripcion": datos.get('descripcion', ''),
        "fecha": datos['fecha'],
        "hora": datos.get('hora', ''),
        "lugar": datos.get('lugar', 'IPUC LA FONDA'),
        "imagen": datos.get('imagen', ''),
        "organizador_id": sesion['usuario']['id'],
        "fecha_creacion": datetime.datetime.now().isoformat(),
        "estado": datos.get('estado', 'programado'),
        "cupos": datos.get('cupos', 0),
        "reservados": 0
    }
    eventos_data.setdefault('eventos', []).append(nuevo)
    db.guardar_json('eventos', eventos_data)
    return jsonify({"mensaje": "Evento creado exitosamente", "evento": nuevo}), 201

# ============================================
# PETICIONES DE ORACIÓN
# ============================================
@app.route('/api/peticiones', methods=['GET', 'POST'])
@requiere_auth
def peticiones():
    """Obtener o crear peticiones de oración"""
    if request.method == 'GET':
        peticiones_data = db.cargar_json('peticiones')
        lista = peticiones_data.get('peticiones', [])
        return jsonify({
            "peticiones": sorted(lista, key=lambda x: x.get('fecha', ''), reverse=True)[:50],
            "total": len(lista)
        }), 200
    
    datos = request.json
    if not datos or 'motivo' not in datos:
        return jsonify({"error": "El motivo es obligatorio"}), 400
    
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    peticiones_data = db.cargar_json('peticiones')
    nueva = {
        "id": len(peticiones_data.get('peticiones', [])) + 1,
        "usuario_id": sesion['usuario']['id'],
        "nombre": sesion['usuario']['nombre'],
        "motivo": datos['motivo'],
        "descripcion": datos.get('descripcion', ''),
        "fecha": datetime.datetime.now().isoformat(),
        "estado": "activa",
        "oraciones": 0
    }
    peticiones_data.setdefault('peticiones', []).append(nueva)
    db.guardar_json('peticiones', peticiones_data)
    return jsonify({"mensaje": "Petición creada exitosamente", "peticion": nueva}), 201

# ============================================
# INICIALIZACIÓN DEL SERVIDOR
# ============================================
if __name__ == '__main__':
    print("\n")
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║                                                              ║")
    print("║   🔥  IPUC LA FONDA - API REST v2.1.0                       ║")
    print("║   Iglesia Pentecostal Unida de Colombia                      ║")
    print("║   'Donde el Espíritu Santo se mueve'                         ║")
    print("║                                                              ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print("")
    
    print("⏳ Inicializando base de datos...")
    try:
        db.inicializar_datos()
        print("✅ Base de datos inicializada correctamente")
        
        stats = db.obtener_estadisticas_db()
        print(f"   📊 Archivos JSON: {stats.get('total_archivos', 0)}")
        print(f"   💾 Tamaño total: {stats.get('tamaño_total_kb', 0):.2f} KB")
    except Exception as e:
        print(f"❌ Error al inicializar la base de datos: {str(e)}")
    
    # Verificar administradores
    administradores = db.cargar_json('administradores')
    total_admins = len(administradores.get('administradores', []))
    
    if total_admins == 0:
        print("")
        print("⚠️  ╔══════════════════════════════════════════════════════════╗")
        print("⚠️  ║  ADVERTENCIA DE SEGURIDAD                               ║")
        print("⚠️  ║  No existe ningún administrador en el sistema.          ║")
        print("⚠️  ║  Usa: POST /api/admin/crear-primer-admin               ║")
        print("⚠️  ╚══════════════════════════════════════════════════════════╝")
    else:
        print(f"👑 Administradores registrados: {total_admins}")
    
    usuarios = db.cargar_json('usuarios')
    total_usuarios = len(usuarios.get('usuarios', []))
    print(f"👥 Usuarios registrados: {total_usuarios}")
    
    port = int(os.environ.get('PORT', 5000))
    entorno = "PRODUCCIÓN" if os.environ.get('RENDER') else "DESARROLLO"
    
    print("")
    print("-" * 60)
    print(f"⚙️  Entorno: {entorno}")
    print(f"🌐 Servidor: http://0.0.0.0:{port}")
    print(f"🔒 Autenticación: SHA-256 + Salt")
    print(f"⏰ Hora: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)
    print("🚀 Iniciando servidor Flask...")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=False)