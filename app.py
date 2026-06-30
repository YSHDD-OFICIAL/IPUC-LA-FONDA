"""
IPUC LA FONDA - Backend Flask Profesional v2.0
Iglesia Pentecostal Unida de Colombia
Donde el Espíritu Santo se mueve
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from database import Database
import hashlib
import secrets
import datetime
import json
import os
import re
import time
from functools import wraps

# ============================================
# INICIALIZACIÓN
# ============================================
app = Flask(__name__)
CORS(app, origins=['*'], supports_credentials=True)
db = Database()

# ============================================
# CONFIGURACIÓN DE SEGURIDAD
# ============================================
SECRET_KEY = os.environ.get('SECRET_KEY', secrets.token_hex(32))
TOKENS = {}
INTENTOS_FALLIDOS = {}
BLOQUEOS_TEMPORALES = {}
SOLICITUDES_POR_IP = {}
RATE_LIMIT = 100  # solicitudes por minuto
RATE_WINDOW = 60  # segundos

# ============================================
# FUNCIONES DE SEGURIDAD
# ============================================
def hash_password(password):
    """Encriptar contraseña con SHA-256 + salt"""
    salt = SECRET_KEY[:16]
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

def generar_token():
    """Generar token de sesión único"""
    return secrets.token_urlsafe(32)

def generar_id_unico():
    """Generar ID único para registros"""
    return int(time.time() * 1000)

def validar_email(email):
    """Validar formato de email"""
    patron = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(patron, email) is not None

def validar_password(password):
    """Validar fortaleza de contraseña"""
    if len(password) < 6:
        return False, "La contraseña debe tener al menos 6 caracteres"
    if len(password) > 50:
        return False, "La contraseña no debe exceder 50 caracteres"
    return True, ""

def sanitizar_texto(texto):
    """Sanitizar entrada de texto"""
    if not texto:
        return ""
    # Eliminar caracteres peligrosos
    texto = re.sub(r'<[^>]*>', '', texto)
    texto = re.sub(r'[<>{}]', '', texto)
    return texto.strip()

def verificar_token(token):
    """Verificar si el token es válido y no expirado"""
    if not token or token not in TOKENS:
        return None
    if datetime.datetime.now() > TOKENS[token]['expira']:
        del TOKENS[token]
        return None
    return TOKENS[token]

def verificar_rate_limit(ip):
    """Verificar límite de solicitudes por IP"""
    ahora = datetime.datetime.now()
    if ip not in SOLICITUDES_POR_IP:
        SOLICITUDES_POR_IP[ip] = {'count': 0, 'reset': ahora + datetime.timedelta(seconds=RATE_WINDOW)}
    
    if ahora > SOLICITUDES_POR_IP[ip]['reset']:
        SOLICITUDES_POR_IP[ip] = {'count': 0, 'reset': ahora + datetime.timedelta(seconds=RATE_WINDOW)}
    
    SOLICITUDES_POR_IP[ip]['count'] += 1
    return SOLICITUDES_POR_IP[ip]['count'] <= RATE_LIMIT

def registrar_actividad(usuario_id, accion, detalles=""):
    """Registrar actividad del usuario"""
    try:
        actividad = db.cargar_json('actividad')
        nuevo_registro = {
            "id": generar_id_unico(),
            "usuario_id": usuario_id,
            "accion": accion,
            "detalles": detalles,
            "fecha": datetime.datetime.now().isoformat(),
            "ip": request.remote_addr if request else 'desconocida'
        }
        if 'registros' not in actividad:
            actividad['registros'] = []
        actividad['registros'].insert(0, nuevo_registro)
        # Mantener solo últimos 1000 registros
        if len(actividad['registros']) > 1000:
            actividad['registros'] = actividad['registros'][:1000]
        db.guardar_json('actividad', actividad)
    except Exception as e:
        print(f"Error al registrar actividad: {e}")

def notificar_usuario(usuario_id, titulo, mensaje, tipo="general"):
    """Crear notificación para un usuario específico"""
    try:
        notificaciones = db.cargar_json('notificaciones')
        nueva_notificacion = {
            "id": generar_id_unico(),
            "usuario_id": usuario_id,
            "titulo": titulo,
            "mensaje": mensaje,
            "fecha": datetime.datetime.now().isoformat(),
            "leida": False,
            "tipo": tipo
        }
        if 'notificaciones' not in notificaciones:
            notificaciones['notificaciones'] = []
        notificaciones['notificaciones'].insert(0, nueva_notificacion)
        # Mantener solo últimas 500 notificaciones por usuario
        notificaciones['notificaciones'] = notificaciones['notificaciones'][:500]
        db.guardar_json('notificaciones', notificaciones)
    except Exception as e:
        print(f"Error al crear notificación: {e}")

def notificar_todos(titulo, mensaje, tipo="anuncio"):
    """Enviar notificación a todos los usuarios"""
    try:
        usuarios = db.cargar_json('usuarios')
        administradores = db.cargar_json('administradores')
        
        todos = usuarios.get('usuarios', []) + administradores.get('administradores', [])
        
        for usuario in todos:
            notificar_usuario(usuario['id'], titulo, mensaje, tipo)
    except Exception as e:
        print(f"Error al notificar a todos: {e}")

# ============================================
# DECORADORES
# ============================================
def requiere_auth(f):
    """Decorador para requerir autenticación"""
    @wraps(f)
    def decorador(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        sesion = verificar_token(token)
        if not sesion:
            return jsonify({"error": "No autorizado. Inicia sesión nuevamente."}), 401
        return f(sesion, *args, **kwargs)
    return decorador

def requiere_admin(f):
    """Decorador para requerir rol de administrador"""
    @wraps(f)
    def decorador(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        sesion = verificar_token(token)
        if not sesion:
            return jsonify({"error": "No autorizado"}), 401
        if sesion['rol'] != 'admin':
            return jsonify({"error": "Se requieren privilegios de administrador"}), 403
        return f(sesion, *args, **kwargs)
    return decorador

# ============================================
# MIDDLEWARE
# ============================================
@app.before_request
def before_request():
    """Middleware ejecutado antes de cada solicitud"""
    # Verificar IP bloqueada
    ip = request.remote_addr
    if ip in BLOQUEOS_TEMPORALES:
        bloqueo = BLOQUEOS_TEMPORALES[ip]
        if datetime.datetime.now() < bloqueo['hasta']:
            segundos_restantes = (bloqueo['hasta'] - datetime.datetime.now()).seconds
            return jsonify({
                "error": "IP bloqueada temporalmente",
                "mensaje": f"Demasiados intentos. Intenta en {segundos_restantes} segundos"
            }), 429
    
    # Verificar rate limit (excepto para archivos estáticos)
    if not request.path.startswith('/assets') and not request.path.startswith('/static'):
        if not verificar_rate_limit(ip):
            return jsonify({
                "error": "Demasiadas solicitudes",
                "mensaje": "Intenta nuevamente en un minuto"
            }), 429

@app.after_request
def after_request(response):
    """Middleware ejecutado después de cada solicitud"""
    response.headers.add('X-Content-Type-Options', 'nosniff')
    response.headers.add('X-Frame-Options', 'DENY')
    response.headers.add('X-XSS-Protection', '1; mode=block')
    response.headers.add('Server', 'IPUC-LA-FONDA')
    return response

# ============================================
# RUTAS PRINCIPALES
# ============================================
@app.route('/')
def index():
    """Ruta principal"""
    return jsonify({
        "aplicacion": "IPUC LA FONDA",
        "version": "2.0.0",
        "estado": "online",
        "mensaje": "Bienvenido a la API de IPUC LA FONDA"
    })

@app.route('/api/health')
def health_check():
    """Verificar estado del servidor"""
    return jsonify({
        "estado": "online",
        "timestamp": datetime.datetime.now().isoformat(),
        "version": "2.0.0"
    })

# ============================================
# AUTENTICACIÓN
# ============================================
@app.route('/api/registro', methods=['POST'])
def registro():
    """Registrar nuevo usuario"""
    try:
        datos = request.json
        if not datos:
            return jsonify({"error": "Datos requeridos"}), 400
        
        # Validar campos requeridos
        campos_requeridos = ['nombre', 'apellidos', 'documento', 'correo', 'celular', 'usuario', 'password']
        for campo in campos_requeridos:
            if campo not in datos or not datos[campo]:
                return jsonify({"error": f"El campo {campo} es obligatorio"}), 400
        
        # Sanitizar entradas
        for campo in ['nombre', 'apellidos', 'usuario', 'correo', 'celular', 'documento']:
            datos[campo] = sanitizar_texto(datos[campo])
        
        # Validar email
        if not validar_email(datos['correo']):
            return jsonify({"error": "El correo electrónico no es válido"}), 400
        
        # Validar password
        password_valida, mensaje = validar_password(datos['password'])
        if not password_valida:
            return jsonify({"error": mensaje}), 400
        
        # Cargar usuarios existentes
        usuarios = db.cargar_json('usuarios')
        if 'usuarios' not in usuarios:
            usuarios['usuarios'] = []
        
        # Verificar documento único
        if any(u['documento'] == datos['documento'] for u in usuarios['usuarios']):
            return jsonify({"error": "El documento ya está registrado"}), 409
        
        # Verificar correo único
        if any(u['correo'].lower() == datos['correo'].lower() for u in usuarios['usuarios']):
            return jsonify({"error": "El correo electrónico ya está registrado"}), 409
        
        # Verificar usuario único
        if any(u['usuario'].lower() == datos['usuario'].lower() for u in usuarios['usuarios']):
            return jsonify({"error": "El nombre de usuario ya existe"}), 409
        
        # Crear nuevo usuario
        nuevo_usuario = {
            "id": generar_id_unico(),
            "nombre": datos['nombre'],
            "apellidos": datos['apellidos'],
            "documento": datos['documento'],
            "fecha_nacimiento": datos.get('fecha_nacimiento', ''),
            "sexo": datos.get('sexo', ''),
            "correo": datos['correo'].lower(),
            "celular": datos['celular'],
            "direccion": datos.get('direccion', ''),
            "ministerio": datos.get('ministerio', 'General'),
            "usuario": datos['usuario'].lower(),
            "password": hash_password(datos['password']),
            "foto": datos.get('foto', 'assets/avatars/default.png'),
            "rol": "usuario",
            "verificado": False,
            "fecha_registro": datetime.datetime.now().isoformat(),
            "ultima_conexion": datetime.datetime.now().isoformat(),
            "estado": "activo",
            "insignias": ["Nuevo Miembro"],
            "configuracion": {
                "tema": "light",
                "notificaciones": True,
                "idioma": "es"
            }
        }
        
        usuarios['usuarios'].append(nuevo_usuario)
        db.guardar_json('usuarios', usuarios)
        
        # Registrar actividad
        registrar_actividad(nuevo_usuario['id'], "Registro", "Nuevo usuario registrado")
        
        return jsonify({
            "mensaje": "Registro exitoso. Bienvenido a IPUC LA FONDA",
            "usuario": {
                "id": nuevo_usuario['id'],
                "nombre": nuevo_usuario['nombre'],
                "apellidos": nuevo_usuario['apellidos'],
                "usuario": nuevo_usuario['usuario'],
                "correo": nuevo_usuario['correo']
            }
        }), 201
        
    except Exception as e:
        print(f"Error en registro: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Iniciar sesión"""
    try:
        datos = request.json
        if not datos:
            return jsonify({"error": "Datos requeridos"}), 400
        
        usuario_identificador = sanitizar_texto(datos.get('usuario', '')).lower()
        password = datos.get('password', '')
        
        if not usuario_identificador or not password:
            return jsonify({"error": "Usuario y contraseña son obligatorios"}), 400
        
        ip = request.remote_addr
        
        # Verificar bloqueo por intentos fallidos
        if ip in BLOQUEOS_TEMPORALES:
            bloqueo = BLOQUEOS_TEMPORALES[ip]
            if datetime.datetime.now() < bloqueo['hasta']:
                segundos = (bloqueo['hasta'] - datetime.datetime.now()).seconds
                return jsonify({
                    "error": "Cuenta bloqueada temporalmente",
                    "mensaje": f"Demasiados intentos fallidos. Intenta en {segundos} segundos"
                }), 429
            else:
                del BLOQUEOS_TEMPORALES[ip]
                if ip in INTENTOS_FALLIDOS:
                    del INTENTOS_FALLIDOS[ip]
        
        hash_pass = hash_password(password)
        
        # Buscar en administradores
        administradores = db.cargar_json('administradores')
        if 'administradores' not in administradores:
            administradores['administradores'] = []
        
        admin = next((a for a in administradores['administradores'] 
                     if (a['usuario'].lower() == usuario_identificador or 
                         a.get('correo', '').lower() == usuario_identificador) and 
                        a['password'] == hash_pass), None)
        
        if admin:
            if admin.get('estado') != 'activo':
                return jsonify({"error": "Cuenta desactivada"}), 403
            
            return crear_sesion(admin, 'admin', ip)
        
        # Buscar en usuarios
        usuarios = db.cargar_json('usuarios')
        if 'usuarios' not in usuarios:
            usuarios['usuarios'] = []
        
        usuario = next((u for u in usuarios['usuarios'] 
                       if (u['usuario'].lower() == usuario_identificador or 
                           u.get('correo', '').lower() == usuario_identificador) and 
                          u['password'] == hash_pass), None)
        
        if usuario:
            if usuario.get('estado') != 'activo':
                return jsonify({"error": "Cuenta desactivada. Contacta al administrador."}), 403
            
            # Actualizar última conexión
            for i, u in enumerate(usuarios['usuarios']):
                if u['id'] == usuario['id']:
                    usuarios['usuarios'][i]['ultima_conexion'] = datetime.datetime.now().isoformat()
                    break
            db.guardar_json('usuarios', usuarios)
            
            return crear_sesion(usuario, 'usuario', ip)
        
        # Login fallido
        return registrar_intento_fallido(ip)
        
    except Exception as e:
        print(f"Error en login: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500

def crear_sesion(usuario, rol, ip):
    """Crear sesión para usuario autenticado"""
    token = generar_token()
    expiracion = datetime.datetime.now() + datetime.timedelta(hours=24)
    
    TOKENS[token] = {
        'usuario': usuario,
        'rol': rol,
        'expira': expiracion,
        'ip': ip,
        'creado': datetime.datetime.now().isoformat()
    }
    
    # Limpiar intentos fallidos
    if ip in INTENTOS_FALLIDOS:
        del INTENTOS_FALLIDOS[ip]
    
    # Registrar actividad
    registrar_actividad(usuario['id'], "Inicio de sesión", f"Rol: {rol}")
    
    return jsonify({
        "mensaje": "Inicio de sesión exitoso",
        "token": token,
        "rol": rol,
        "expira": expiracion.isoformat(),
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

def registrar_intento_fallido(ip):
    """Registrar intento fallido de inicio de sesión"""
    if ip not in INTENTOS_FALLIDOS:
        INTENTOS_FALLIDOS[ip] = {'intentos': 0, 'ultimo': datetime.datetime.now()}
    
    INTENTOS_FALLIDOS[ip]['intentos'] += 1
    INTENTOS_FALLIDOS[ip]['ultimo'] = datetime.datetime.now()
    
    intentos = INTENTOS_FALLIDOS[ip]['intentos']
    restantes = 5 - intentos
    
    if intentos >= 5:
        BLOQUEOS_TEMPORALES[ip] = {
            'hasta': datetime.datetime.now() + datetime.timedelta(minutes=15)
        }
        return jsonify({
            "error": "Cuenta bloqueada por seguridad",
            "mensaje": "Demasiados intentos fallidos. IP bloqueada por 15 minutos"
        }), 429
    
    return jsonify({
        "error": "Credenciales inválidas",
        "intentos_restantes": restantes
    }), 401

@app.route('/api/logout', methods=['POST'])
@requiere_auth
def logout(sesion):
    """Cerrar sesión"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if token in TOKENS:
        registrar_actividad(sesion['usuario']['id'], "Cierre de sesión")
        del TOKENS[token]
    return jsonify({"mensaje": "Sesión cerrada exitosamente"}), 200

# ============================================
# PERFIL DE USUARIO
# ============================================
@app.route('/api/perfil', methods=['GET'])
@requiere_auth
def obtener_perfil(sesion):
    """Obtener perfil del usuario autenticado"""
    usuario_id = sesion['usuario']['id']
    rol = sesion['rol']
    
    if rol == 'admin':
        data = db.cargar_json('administradores')
        lista = data.get('administradores', [])
    else:
        data = db.cargar_json('usuarios')
        lista = data.get('usuarios', [])
    
    usuario = next((u for u in lista if u['id'] == usuario_id), None)
    
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    # No enviar password
    usuario_seguro = {k: v for k, v in usuario.items() if k != 'password'}
    
    return jsonify({"usuario": usuario_seguro}), 200

@app.route('/api/perfil', methods=['PUT'])
@requiere_auth
def actualizar_perfil(sesion):
    """Actualizar perfil del usuario autenticado"""
    try:
        datos = request.json
        usuario_id = sesion['usuario']['id']
        rol = sesion['rol']
        
        if rol == 'admin':
            data = db.cargar_json('administradores')
            lista = data.get('administradores', [])
        else:
            data = db.cargar_json('usuarios')
            lista = data.get('usuarios', [])
        
        for i, u in enumerate(lista):
            if u['id'] == usuario_id:
                campos_permitidos = ['nombre', 'apellidos', 'celular', 'direccion', 
                                   'ministerio', 'foto']
                for campo in campos_permitidos:
                    if campo in datos:
                        lista[i][campo] = sanitizar_texto(datos[campo]) if isinstance(datos[campo], str) else datos[campo]
                
                if rol == 'admin':
                    data['administradores'] = lista
                else:
                    data['usuarios'] = lista
                
                db.guardar_json('administradores' if rol == 'admin' else 'usuarios', data)
                registrar_actividad(usuario_id, "Actualización de perfil")
                
                return jsonify({"mensaje": "Perfil actualizado exitosamente"}), 200
        
        return jsonify({"error": "Usuario no encontrado"}), 404
        
    except Exception as e:
        print(f"Error al actualizar perfil: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/api/cambiar-password', methods=['PUT'])
@requiere_auth
def cambiar_password(sesion):
    """Cambiar contraseña del usuario autenticado"""
    try:
        datos = request.json
        password_actual = datos.get('password_actual', '')
        password_nueva = datos.get('password_nueva', '')
        
        if not password_actual or not password_nueva:
            return jsonify({"error": "Contraseña actual y nueva son requeridas"}), 400
        
        password_valida, mensaje = validar_password(password_nueva)
        if not password_valida:
            return jsonify({"error": mensaje}), 400
        
        usuario_id = sesion['usuario']['id']
        rol = sesion['rol']
        
        if rol == 'admin':
            data = db.cargar_json('administradores')
            lista = data.get('administradores', [])
        else:
            data = db.cargar_json('usuarios')
            lista = data.get('usuarios', [])
        
        for i, u in enumerate(lista):
            if u['id'] == usuario_id:
                if u['password'] != hash_password(password_actual):
                    return jsonify({"error": "La contraseña actual es incorrecta"}), 400
                
                lista[i]['password'] = hash_password(password_nueva)
                
                if rol == 'admin':
                    data['administradores'] = lista
                else:
                    data['usuarios'] = lista
                
                db.guardar_json('administradores' if rol == 'admin' else 'usuarios', data)
                registrar_actividad(usuario_id, "Cambio de contraseña")
                
                return jsonify({"mensaje": "Contraseña actualizada exitosamente"}), 200
        
        return jsonify({"error": "Usuario no encontrado"}), 404
        
    except Exception as e:
        print(f"Error al cambiar contraseña: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500

# ============================================
# VERIFICACIÓN DE CUENTAS
# ============================================
@app.route('/api/solicitar-verificacion', methods=['POST'])
@requiere_auth
def solicitar_verificacion(sesion):
    """Solicitar verificación de cuenta"""
    usuario_id = sesion['usuario']['id']
    registrar_actividad(usuario_id, "Solicitud de verificación")
    notificar_usuario(1, "Solicitud de verificación", 
                     f"El usuario {sesion['usuario']['nombre']} ha solicitado verificación", 
                     "verificacion")
    return jsonify({"mensaje": "Solicitud enviada. Un administrador revisará tu caso."}), 200

@app.route('/api/verificar-usuario/<int:usuario_id>', methods=['POST'])
@requiere_admin
def verificar_usuario(sesion, usuario_id):
    """Verificar cuenta de usuario (solo admin)"""
    usuarios = db.cargar_json('usuarios')
    
    for i, u in enumerate(usuarios.get('usuarios', [])):
        if u['id'] == usuario_id:
            usuarios['usuarios'][i]['verificado'] = True
            if 'Cuenta Verificada' not in usuarios['usuarios'][i].get('insignias', []):
                if 'insignias' not in usuarios['usuarios'][i]:
                    usuarios['usuarios'][i]['insignias'] = []
                usuarios['usuarios'][i]['insignias'].append('Cuenta Verificada')
            
            db.guardar_json('usuarios', usuarios)
            registrar_actividad(sesion['usuario']['id'], "Verificación de cuenta", f"Usuario ID: {usuario_id}")
            notificar_usuario(usuario_id, "Cuenta verificada", 
                            "Tu cuenta ha sido verificada por IPUC LA FONDA", "verificacion")
            
            return jsonify({"mensaje": "Cuenta verificada exitosamente"}), 200
    
    return jsonify({"error": "Usuario no encontrado"}), 404

# ============================================
# USUARIOS (ADMIN)
# ============================================
@app.route('/api/usuarios', methods=['GET'])
@requiere_auth
def obtener_usuarios(sesion):
    """Obtener lista de usuarios"""
    usuarios = db.cargar_json('usuarios')
    
    # No enviar contraseñas
    usuarios_seguros = []
    for u in usuarios.get('usuarios', []):
        u_seguro = {k: v for k, v in u.items() if k != 'password'}
        usuarios_seguros.append(u_seguro)
    
    return jsonify({"usuarios": usuarios_seguros, "total": len(usuarios_seguros)}), 200

@app.route('/api/usuarios/<int:usuario_id>', methods=['GET'])
@requiere_auth
def obtener_usuario(sesion, usuario_id):
    """Obtener un usuario específico"""
    usuarios = db.cargar_json('usuarios')
    usuario = next((u for u in usuarios.get('usuarios', []) if u['id'] == usuario_id), None)
    
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    usuario_seguro = {k: v for k, v in usuario.items() if k != 'password'}
    return jsonify({"usuario": usuario_seguro}), 200

@app.route('/api/usuarios/<int:usuario_id>/estado', methods=['PUT'])
@requiere_admin
def cambiar_estado_usuario(sesion, usuario_id):
    """Activar/desactivar usuario"""
    datos = request.json
    nuevo_estado = datos.get('estado', 'activo')
    
    if nuevo_estado not in ['activo', 'inactivo', 'suspendido']:
        return jsonify({"error": "Estado no válido"}), 400
    
    usuarios = db.cargar_json('usuarios')
    
    for i, u in enumerate(usuarios.get('usuarios', [])):
        if u['id'] == usuario_id:
            usuarios['usuarios'][i]['estado'] = nuevo_estado
            db.guardar_json('usuarios', usuarios)
            registrar_actividad(sesion['usuario']['id'], "Cambio de estado", 
                              f"Usuario {usuario_id}: {nuevo_estado}")
            return jsonify({"mensaje": f"Usuario {nuevo_estado}"}), 200
    
    return jsonify({"error": "Usuario no encontrado"}), 404

# ============================================
# CONTADOR REGRESIVO DE CULTOS
# ============================================
@app.route('/api/cultos/proximo', methods=['GET'])
def obtener_proximo_culto():
    """Obtener información del próximo culto con contador inteligente"""
    ahora = datetime.datetime.now()
    dia_actual = ahora.weekday()
    hora_actual = ahora.strftime('%H:%M')
    
    # Horarios de cultos semanales
    cultos_semanales = {
        0: [],  # Lunes - No hay culto
        1: [{"inicio": "18:00", "fin": "20:30", "nombre": "Culto de Oración"}],  # Martes
        2: [{"inicio": "16:00", "fin": "19:00", "nombre": "Culto Campal"}],  # Miércoles
        3: [{"inicio": "16:00", "fin": "19:00", "nombre": "Culto de Refrán"}],  # Jueves
        4: [{"inicio": "18:00", "fin": "20:30", "nombre": "Culto de Jóvenes"}],  # Viernes
        5: [],  # Sábado - No hay culto
        6: [{"inicio": "10:00", "fin": "12:00", "nombre": "Culto Dominical"}]  # Domingo
    }
    
    dias_semana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    
    # Buscar próximo culto en los próximos 7 días
    for offset in range(7):
        dia_busqueda = (dia_actual + offset) % 7
        cultos_dia = cultos_semanales[dia_busqueda]
        
        for culto in cultos_dia:
            if offset == 0 and hora_actual < culto['fin']:
                # Culto hoy
                estado = "en_curso" if hora_actual >= culto['inicio'] else "proximo"
                
                inicio_dt = datetime.datetime.strptime(
                    f"{ahora.strftime('%Y-%m-%d')} {culto['inicio']}", '%Y-%m-%d %H:%M')
                fin_dt = datetime.datetime.strptime(
                    f"{ahora.strftime('%Y-%m-%d')} {culto['fin']}", '%Y-%m-%d %H:%M')
                
                return jsonify({
                    "nombre": culto['nombre'],
                    "dia": dias_semana[dia_busqueda],
                    "fecha": ahora.strftime('%Y-%m-%d'),
                    "inicio": culto['inicio'],
                    "fin": culto['fin'],
                    "estado": estado,
                    "segundos_restantes": max(0, (inicio_dt - ahora).total_seconds()) 
                        if estado == "proximo" else max(0, (fin_dt - ahora).total_seconds()),
                    "timestamp_inicio": inicio_dt.isoformat(),
                    "timestamp_fin": fin_dt.isoformat()
                }), 200
            
            elif offset > 0:
                # Culto en día futuro
                fecha_futura = ahora + datetime.timedelta(days=offset)
                inicio_dt = datetime.datetime.strptime(
                    f"{fecha_futura.strftime('%Y-%m-%d')} {culto['inicio']}", '%Y-%m-%d %H:%M')
                
                return jsonify({
                    "nombre": culto['nombre'],
                    "dia": dias_semana[dia_busqueda],
                    "fecha": fecha_futura.strftime('%Y-%m-%d'),
                    "inicio": culto['inicio'],
                    "fin": culto['fin'],
                    "estado": "proximo",
                    "segundos_restantes": max(0, (inicio_dt - ahora).total_seconds()),
                    "timestamp_inicio": inicio_dt.isoformat()
                }), 200
    
    return jsonify({
        "mensaje": "No hay cultos programados en los próximos 7 días",
        "estado": "sin_cultos"
    }), 200

@app.route('/api/horarios', methods=['GET'])
def obtener_horarios():
    """Obtener horarios de cultos"""
    return jsonify({
        "horarios": [
            {"dia": "Lunes", "cultos": []},
            {"dia": "Martes", "cultos": [{"nombre": "Culto de Oración", "hora": "6:00 PM - 8:30 PM"}]},
            {"dia": "Miércoles", "cultos": [{"nombre": "Culto Campal", "hora": "4:00 PM - 7:00 PM"}]},
            {"dia": "Jueves", "cultos": [{"nombre": "Culto de Refrán", "hora": "4:00 PM - 7:00 PM"}]},
            {"dia": "Viernes", "cultos": [{"nombre": "Culto de Jóvenes", "hora": "6:00 PM - 8:30 PM"}]},
            {"dia": "Sábado", "cultos": []},
            {"dia": "Domingo", "cultos": [{"nombre": "Culto Dominical", "hora": "10:00 AM - 12:00 PM"}]}
        ]
    }), 200

# ============================================
# ASISTENCIA
# ============================================
@app.route('/api/asistencia', methods=['POST'])
@requiere_auth
def registrar_asistencia(sesion):
    """Registrar asistencia a culto"""
    try:
        datos = request.json
        asistencia = db.cargar_json('asistencia')
        
        nuevo_registro = {
            "id": generar_id_unico(),
            "usuario_id": sesion['usuario']['id'],
            "fecha": datos.get('fecha', datetime.datetime.now().strftime('%Y-%m-%d')),
            "hora": datetime.datetime.now().strftime('%H:%M:%S'),
            "estado": datos.get('estado', 'Asistiré'),
            "tipo": datos.get('tipo', 'Hermano'),
            "culto": datos.get('culto', '')
        }
        
        if 'registros' not in asistencia:
            asistencia['registros'] = []
        asistencia['registros'].insert(0, nuevo_registro)
        db.guardar_json('asistencia', asistencia)
        
        actualizar_estadisticas_asistencia()
        registrar_actividad(sesion['usuario']['id'], "Asistencia registrada", nuevo_registro['estado'])
        
        return jsonify({"mensaje": "Asistencia registrada", "registro": nuevo_registro}), 201
        
    except Exception as e:
        print(f"Error al registrar asistencia: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/api/asistencia/estadisticas', methods=['GET'])
def obtener_estadisticas_asistencia():
    """Obtener estadísticas de asistencia"""
    estadisticas = db.cargar_json('estadisticas')
    return jsonify(estadisticas.get('asistencia', {
        "diario": 0, "semanal": 0, "mensual": 0, "anual": 0, "total": 0
    })), 200

def actualizar_estadisticas_asistencia():
    """Actualizar estadísticas de asistencia"""
    try:
        asistencia = db.cargar_json('asistencia')
        estadisticas = db.cargar_json('estadisticas')
        
        hoy = datetime.datetime.now().strftime('%Y-%m-%d')
        semana_actual = datetime.datetime.now().strftime('%Y-W%W')
        mes_actual = datetime.datetime.now().strftime('%Y-%m')
        año_actual = datetime.datetime.now().strftime('%Y')
        
        registros = asistencia.get('registros', [])
        
        estadisticas['asistencia'] = {
            "diario": len([r for r in registros if r.get('fecha') == hoy]),
            "semanal": len([r for r in registros if r.get('fecha', '').startswith(hoy[:7])]),
            "mensual": len([r for r in registros if r.get('fecha', '').startswith(mes_actual)]),
            "anual": len([r for r in registros if r.get('fecha', '').startswith(año_actual)]),
            "total": len(registros),
            "ultima_actualizacion": datetime.datetime.now().isoformat()
        }
        
        db.guardar_json('estadisticas', estadisticas)
    except Exception as e:
        print(f"Error al actualizar estadísticas: {e}")

# ============================================
# VERSÍCULO DIARIO
# ============================================
@app.route('/api/versiculo-diario', methods=['GET'])
def obtener_versiculo_diario():
    """Obtener versículo del día"""
    versiculos = db.cargar_json('versiculos')
    hoy = datetime.datetime.now().strftime('%Y-%m-%d')
    
    # Buscar versículo asignado para hoy
    versiculo_hoy = next((v for v in versiculos.get('versiculos', []) 
                         if v.get('fecha') == hoy), None)
    
    if not versiculo_hoy and versiculos.get('versiculos'):
        import random
        versiculo_hoy = random.choice(versiculos['versiculos'])
        versiculo_hoy['fecha'] = hoy
        versiculos['versiculo_actual'] = versiculo_hoy
        db.guardar_json('versiculos', versiculos)
    
    if not versiculo_hoy:
        versiculo_hoy = {
            "texto": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
            "referencia": "Juan 3:16",
            "tipo": "promesa"
        }
    
    return jsonify({"versiculo": versiculo_hoy}), 200

@app.route('/api/versiculos', methods=['POST'])
@requiere_admin
def agregar_versiculo(sesion):
    """Agregar nuevo versículo"""
    datos = request.json
    versiculos = db.cargar_json('versiculos')
    
    nuevo_versiculo = {
        "id": generar_id_unico(),
        "texto": datos.get('texto', ''),
        "referencia": datos.get('referencia', ''),
        "tipo": datos.get('tipo', 'versiculo'),
        "fecha": None
    }
    
    if 'versiculos' not in versiculos:
        versiculos['versiculos'] = []
    versiculos['versiculos'].append(nuevo_versiculo)
    db.guardar_json('versiculos', versiculos)
    
    registrar_actividad(sesion['usuario']['id'], "Versículo agregado", nuevo_versiculo['referencia'])
    
    return jsonify({"mensaje": "Versículo agregado", "versiculo": nuevo_versiculo}), 201

# ============================================
# NOTICIAS
# ============================================
@app.route('/api/noticias', methods=['GET'])
def obtener_noticias():
    """Obtener noticias publicadas"""
    noticias = db.cargar_json('noticias')
    noticias_lista = sorted(
        noticias.get('noticias', []),
        key=lambda x: x.get('fecha_publicacion', ''),
        reverse=True
    )
    return jsonify({"noticias": noticias_lista[:20]}), 200

@app.route('/api/noticias', methods=['POST'])
@requiere_admin
def crear_noticia(sesion):
    """Crear nueva noticia"""
    datos = request.json
    noticias = db.cargar_json('noticias')
    
    nueva_noticia = {
        "id": generar_id_unico(),
        "titulo": sanitizar_texto(datos.get('titulo', '')),
        "contenido": sanitizar_texto(datos.get('contenido', '')),
        "imagen": datos.get('imagen', ''),
        "autor_id": sesion['usuario']['id'],
        "autor_nombre": sesion['usuario']['nombre'],
        "fecha_publicacion": datetime.datetime.now().isoformat(),
        "fecha_actualizacion": datetime.datetime.now().isoformat(),
        "estado": "publicado",
        "comentarios": [],
        "reacciones": {"me_gusta": 0, "amen": 0, "bendiciones": 0}
    }
    
    if 'noticias' not in noticias:
        noticias['noticias'] = []
    noticias['noticias'].insert(0, nueva_noticia)
    db.guardar_json('noticias', noticias)
    
    notificar_todos("Nueva noticia", datos.get('titulo', ''), "anuncio")
    registrar_actividad(sesion['usuario']['id'], "Noticia creada", nueva_noticia['titulo'])
    
    return jsonify({"mensaje": "Noticia publicada", "noticia": nueva_noticia}), 201

# ============================================
# NOTIFICACIONES
# ============================================
@app.route('/api/notificaciones', methods=['GET'])
@requiere_auth
def obtener_notificaciones(sesion):
    """Obtener notificaciones del usuario"""
    usuario_id = sesion['usuario']['id']
    notificaciones = db.cargar_json('notificaciones')
    
    mis_notificaciones = [
        n for n in notificaciones.get('notificaciones', [])
        if n.get('usuario_id') == usuario_id
    ]
    
    # Limitar a últimas 50
    mis_notificaciones = sorted(mis_notificaciones, 
                               key=lambda x: x.get('fecha', ''), 
                               reverse=True)[:50]
    
    no_leidas = len([n for n in mis_notificaciones if not n.get('leida')])
    
    return jsonify({
        "notificaciones": mis_notificaciones,
        "no_leidas": no_leidas,
        "total": len(mis_notificaciones)
    }), 200

@app.route('/api/notificaciones/<int:notif_id>/leer', methods=['PUT'])
@requiere_auth
def marcar_notificacion_leida(sesion, notif_id):
    """Marcar notificación como leída"""
    notificaciones = db.cargar_json('notificaciones')
    
    for i, n in enumerate(notificaciones.get('notificaciones', [])):
        if n['id'] == notif_id and n['usuario_id'] == sesion['usuario']['id']:
            notificaciones['notificaciones'][i]['leida'] = True
            db.guardar_json('notificaciones', notificaciones)
            return jsonify({"mensaje": "Notificación marcada como leída"}), 200
    
    return jsonify({"error": "Notificación no encontrada"}), 404

# ============================================
# CONFIGURACIÓN
# ============================================
@app.route('/api/configuracion', methods=['GET'])
def obtener_configuracion():
    """Obtener configuración pública"""
    config = db.cargar_json('configuracion')
    return jsonify({
        "iglesia": config.get('iglesia', {}),
        "version": config.get('aplicacion', {}).get('version', '2.0.0')
    }), 200

# ============================================
# MANEJO DE ERRORES
# ============================================
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Ruta no encontrada"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Error interno del servidor"}), 500

# ============================================
# INICIO DEL SERVIDOR
# ============================================
if __name__ == '__main__':
    print("=" * 60)
    print("🔥 IPUC LA FONDA - Servidor Iniciando...")
    print("=" * 60)
    print("📱 Iglesia Pentecostal Unida de Colombia")
    print("✨ Donde el Espíritu Santo se mueve")
    print("=" * 60)
    
    # Inicializar datos
    db.inicializar_datos()
    print("✅ Base de datos inicializada")
    
    # Configurar puerto
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"🌐 Servidor corriendo en http://0.0.0.0:{port}")
    print(f"📋 API disponible en http://0.0.0.0:{port}/api")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=debug)
