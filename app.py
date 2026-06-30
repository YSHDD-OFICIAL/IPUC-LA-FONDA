# app.py - Servidor Flask Principal IPUC LA FONDA v2.0 (COMPLETO)
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from database import Database
import hashlib
import secrets
import datetime
import json
import os

app = Flask(__name__)
CORS(app, origins=['*'])
db = Database()

# ============================================
# CONFIGURACIÓN DE SEGURIDAD
# ============================================
SECRET_KEY = secrets.token_hex(32)
TOKENS = {}
INTENTOS_FALLIDOS = {}
BLOQUEOS_TEMPORALES = {}
MAX_INTENTOS = 5
TIEMPO_BLOQUEO = 15  # minutos

def hash_password(password):
    """Encriptar contraseña con SHA-256 + salt"""
    salt = SECRET_KEY[:16]
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

def generar_token():
    """Generar token de sesión único"""
    return secrets.token_urlsafe(32)

def verificar_token(token):
    """Verificar si el token es válido y retornar datos de sesión"""
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
    """Eliminar tokens expirados"""
    ahora = datetime.datetime.now()
    expirados = [t for t, s in TOKENS.items() if s['expira'] < ahora]
    for t in expirados:
        del TOKENS[t]

def registrar_actividad(usuario_id, accion, detalles=""):
    """Registrar actividad del usuario"""
    try:
        actividad = db.cargar_json('actividad')
        nuevo_registro = {
            "id": len(actividad.get('registros', [])) + 1,
            "usuario_id": usuario_id,
            "accion": accion,
            "detalles": detalles,
            "fecha": datetime.datetime.now().isoformat(),
            "ip": request.remote_addr
        }
        if 'registros' not in actividad:
            actividad['registros'] = []
        actividad['registros'].append(nuevo_registro)
        db.guardar_json('actividad', actividad)
    except Exception as e:
        print(f"Error registrando actividad: {e}")

def verificar_bloqueo_ip(ip):
    """Verificar si una IP está bloqueada"""
    if ip in BLOQUEOS_TEMPORALES:
        bloqueo = BLOQUEOS_TEMPORALES[ip]
        if datetime.datetime.now() < bloqueo['hasta']:
            segundos_restantes = int((bloqueo['hasta'] - datetime.datetime.now()).total_seconds())
            return True, segundos_restantes
        else:
            del BLOQUEOS_TEMPORALES[ip]
            if ip in INTENTOS_FALLIDOS:
                del INTENTOS_FALLIDOS[ip]
    return False, 0

def registrar_intento_fallido(ip):
    """Registrar intento fallido de inicio de sesión"""
    if ip not in INTENTOS_FALLIDOS:
        INTENTOS_FALLIDOS[ip] = {'intentos': 1, 'ultimo': datetime.datetime.now()}
    else:
        INTENTOS_FALLIDOS[ip]['intentos'] += 1
        INTENTOS_FALLIDOS[ip]['ultimo'] = datetime.datetime.now()
    
    intentos = INTENTOS_FALLIDOS[ip]['intentos']
    intentos_restantes = MAX_INTENTOS - intentos
    
    if intentos_restantes <= 0:
        BLOQUEOS_TEMPORALES[ip] = {
            'hasta': datetime.datetime.now() + datetime.timedelta(minutes=TIEMPO_BLOQUEO)
        }
        return {
            "error": "IP bloqueada temporalmente",
            "mensaje": f"Demasiados intentos fallidos. Intente nuevamente en {TIEMPO_BLOQUEO} minutos",
            "bloqueado": True
        }, 403
    
    return {
        "error": "Credenciales inválidas",
        "intentos_restantes": intentos_restantes,
        "bloqueado": False
    }, 401

def crear_sesion(usuario, rol, ip):
    """Crear sesión para un usuario"""
    token = generar_token()
    TOKENS[token] = {
        'usuario': usuario,
        'rol': rol,
        'expira': datetime.datetime.now() + datetime.timedelta(hours=24),
        'creado': datetime.datetime.now().isoformat(),
        'ip': ip
    }
    
    if rol == 'usuario':
        usuarios = db.cargar_json('usuarios')
        for i, u in enumerate(usuarios.get('usuarios', [])):
            if u['id'] == usuario['id']:
                usuarios['usuarios'][i]['ultima_conexion'] = datetime.datetime.now().isoformat()
                break
        db.guardar_json('usuarios', usuarios)
    
    if ip in INTENTOS_FALLIDOS:
        del INTENTOS_FALLIDOS[ip]
    
    registrar_actividad(usuario['id'], "Inicio de sesión", f"Rol: {rol}")
    
    return jsonify({
        "mensaje": "Inicio de sesión exitoso",
        "token": token,
        "rol": rol,
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
    """Actualizar estadísticas de asistencia"""
    try:
        asistencia = db.cargar_json('asistencia')
        estadisticas = db.cargar_json('estadisticas')
        
        hoy = datetime.datetime.now().strftime('%Y-%m-%d')
        mes_actual = datetime.datetime.now().strftime('%Y-%m')
        año_actual = datetime.datetime.now().strftime('%Y')
        
        registros = asistencia.get('registros', [])
        
        diarios = len([r for r in registros if r.get('fecha') == hoy])
        mensuales = len([r for r in registros if r.get('fecha', '').startswith(mes_actual)])
        anuales = len([r for r in registros if r.get('fecha', '').startswith(año_actual)])
        
        estadisticas['asistencia'] = {
            "diario": diarios,
            "mensual": mensuales,
            "anual": anuales,
            "total": len(registros),
            "ultima_actualizacion": datetime.datetime.now().isoformat()
        }
        
        db.guardar_json('estadisticas', estadisticas)
    except Exception as e:
        print(f"Error actualizando estadísticas de asistencia: {e}")

def actualizar_estadisticas_usuarios():
    """Actualizar estadísticas de usuarios"""
    try:
        usuarios = db.cargar_json('usuarios')
        estadisticas = db.cargar_json('estadisticas')
        
        todos = usuarios.get('usuarios', [])
        activos = len([u for u in todos if u.get('estado') == 'activo'])
        
        mes_actual = datetime.datetime.now().strftime('%Y-%m')
        nuevos_mes = len([u for u in todos if u.get('fecha_registro', '').startswith(mes_actual)])
        
        estadisticas['usuarios'] = {
            "total": len(todos),
            "activos": activos,
            "nuevos_mes": nuevos_mes,
            "ultima_actualizacion": datetime.datetime.now().isoformat()
        }
        
        db.guardar_json('estadisticas', estadisticas)
    except Exception as e:
        print(f"Error actualizando estadísticas de usuarios: {e}")

# ============================================
# MIDDLEWARE
# ============================================
@app.before_request
def before_request():
    """Verificar IPs bloqueadas antes de cada petición"""
    if request.endpoint in ['login', 'registro']:
        ip = request.remote_addr
        bloqueado, segundos = verificar_bloqueo_ip(ip)
        if bloqueado:
            return jsonify({
                "error": "IP bloqueada temporalmente",
                "mensaje": f"Demasiados intentos fallidos. Intente nuevamente en {segundos} segundos",
                "segundos_restantes": segundos
            }), 403
    
    if hasattr(app, 'request_count'):
        app.request_count += 1
    else:
        app.request_count = 1
    
    if app.request_count % 100 == 0:
        limpiar_tokens_expirados()

# ============================================
# RUTAS PRINCIPALES
# ============================================
@app.route('/')
def index():
    """Servir archivo principal"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    """Servir archivos estáticos"""
    if os.path.exists(path):
        return send_from_directory('.', path)
    return jsonify({"error": "Archivo no encontrado"}), 404

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de verificación de salud del servidor"""
    return jsonify({
        "estado": "online",
        "version": "2.0.0",
        "timestamp": datetime.datetime.now().isoformat(),
        "servidor": "IPUC LA FONDA API"
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
                return jsonify({"error": f"El campo {campo} es obligatorio"}), 400
        
        if '@' not in datos['correo'] or '.' not in datos['correo']:
            return jsonify({"error": "Formato de correo inválido"}), 400
        
        if len(datos['password']) < 6:
            return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400
        
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
        
        return jsonify({
            "mensaje": "Registro exitoso",
            "usuario": {
                "id": nuevo_usuario['id'],
                "nombre": nuevo_usuario['nombre'],
                "usuario": nuevo_usuario['usuario']
            }
        }), 201
        
    except Exception as e:
        print(f"Error en registro: {str(e)}")
        return jsonify({"error": f"Error en el registro: {str(e)}"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Iniciar sesión"""
    try:
        datos = request.json
        if not datos:
            return jsonify({"error": "Datos inválidos"}), 400
            
        usuario_identificador = datos.get('usuario', '').strip()
        password = datos.get('password', '')
        
        if not usuario_identificador or not password:
            return jsonify({"error": "Usuario y contraseña son obligatorios"}), 400
        
        ip = request.remote_addr
        
        bloqueado, segundos = verificar_bloqueo_ip(ip)
        if bloqueado:
            return jsonify({
                "error": "IP bloqueada",
                "mensaje": f"Intente nuevamente en {segundos} segundos"
            }), 403
        
        administradores = db.cargar_json('administradores')
        admin = next((a for a in administradores.get('administradores', []) 
                     if a['usuario'].lower() == usuario_identificador.lower() 
                     or a['correo'].lower() == usuario_identificador.lower()), None)
        
        if admin and admin['password'] == hash_password(password):
            return crear_sesion(admin, 'admin', ip)
        
        usuarios = db.cargar_json('usuarios')
        usuario = next((u for u in usuarios.get('usuarios', []) 
                       if u['usuario'].lower() == usuario_identificador.lower() 
                       or u['correo'].lower() == usuario_identificador.lower()), None)
        
        if usuario and usuario['password'] == hash_password(password):
            if usuario.get('estado') != 'activo':
                return jsonify({"error": "Cuenta desactivada. Contacte al administrador"}), 403
            return crear_sesion(usuario, 'usuario', ip)
        
        return registrar_intento_fallido(ip)
        
    except Exception as e:
        print(f"Error en login: {str(e)}")
        return jsonify({"error": f"Error en el inicio de sesión: {str(e)}"}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """Cerrar sesión"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if token in TOKENS:
        usuario = TOKENS[token]['usuario']
        registrar_actividad(usuario['id'], "Cierre de sesión")
        del TOKENS[token]
    return jsonify({"mensaje": "Sesión cerrada exitosamente"}), 200

@app.route('/api/verificar-sesion', methods=['GET'])
def verificar_sesion():
    """Verificar si la sesión actual es válida"""
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
# USUARIOS
# ============================================
@app.route('/api/usuarios', methods=['GET'])
def obtener_usuarios():
    """Obtener lista de usuarios"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    usuarios = db.cargar_json('usuarios')
    
    usuarios_seguros = []
    for u in usuarios.get('usuarios', []):
        u_seguro = {k: v for k, v in u.items() if k != 'password'}
        usuarios_seguros.append(u_seguro)
    
    return jsonify({
        "usuarios": usuarios_seguros,
        "total": len(usuarios_seguros)
    }), 200

@app.route('/api/usuarios/<int:usuario_id>', methods=['GET'])
def obtener_usuario(usuario_id):
    """Obtener un usuario específico"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    usuarios = db.cargar_json('usuarios')
    usuario = next((u for u in usuarios.get('usuarios', []) if u['id'] == usuario_id), None)
    
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    usuario_seguro = {k: v for k, v in usuario.items() if k != 'password'}
    return jsonify({"usuario": usuario_seguro}), 200

@app.route('/api/usuarios/<int:usuario_id>', methods=['PUT'])
def actualizar_usuario(usuario_id):
    """Actualizar información de usuario"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    if sesion['rol'] != 'admin' and sesion['usuario']['id'] != usuario_id:
        return jsonify({"error": "No tiene permisos para editar este usuario"}), 403
    
    datos = request.json
    if not datos:
        return jsonify({"error": "Datos inválidos"}), 400
        
    usuarios = db.cargar_json('usuarios')
    
    for i, u in enumerate(usuarios.get('usuarios', [])):
        if u['id'] == usuario_id:
            campos_permitidos = ['nombre', 'apellidos', 'celular', 'direccion', 
                               'ministerio', 'foto', 'estado']
            
            for campo in campos_permitidos:
                if campo in datos:
                    usuarios['usuarios'][i][campo] = datos[campo]
            
            db.guardar_json('usuarios', usuarios)
            registrar_actividad(sesion['usuario']['id'], "Actualización de perfil", f"Usuario ID: {usuario_id}")
            
            return jsonify({"mensaje": "Usuario actualizado exitosamente"}), 200
    
    return jsonify({"error": "Usuario no encontrado"}), 404

@app.route('/api/usuarios/<int:usuario_id>/verificar', methods=['POST'])
def verificar_usuario(usuario_id):
    """Verificar cuenta de usuario (solo admin)"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion or sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    
    usuarios = db.cargar_json('usuarios')
    
    for i, u in enumerate(usuarios.get('usuarios', [])):
        if u['id'] == usuario_id:
            usuarios['usuarios'][i]['verificado'] = True
            insignias = usuarios['usuarios'][i].get('insignias', [])
            if 'Cuenta Verificada' not in insignias:
                insignias.append('Cuenta Verificada')
                usuarios['usuarios'][i]['insignias'] = insignias
            
            db.guardar_json('usuarios', usuarios)
            registrar_actividad(sesion['usuario']['id'], "Verificación de cuenta", f"Usuario ID: {usuario_id}")
            
            return jsonify({"mensaje": "Cuenta verificada exitosamente"}), 200
    
    return jsonify({"error": "Usuario no encontrado"}), 404

@app.route('/api/usuarios/<int:usuario_id>/cambiar-password', methods=['PUT'])
def cambiar_password(usuario_id):
    """Cambiar contraseña de usuario"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    if sesion['usuario']['id'] != usuario_id and sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    
    datos = request.json
    if not datos or 'password_actual' not in datos or 'password_nueva' not in datos:
        return jsonify({"error": "Datos incompletos"}), 400
    
    usuarios = db.cargar_json('usuarios')
    
    for i, u in enumerate(usuarios.get('usuarios', [])):
        if u['id'] == usuario_id:
            if u['password'] != hash_password(datos['password_actual']):
                return jsonify({"error": "Contraseña actual incorrecta"}), 400
            
            if len(datos['password_nueva']) < 6:
                return jsonify({"error": "La nueva contraseña debe tener al menos 6 caracteres"}), 400
            
            usuarios['usuarios'][i]['password'] = hash_password(datos['password_nueva'])
            db.guardar_json('usuarios', usuarios)
            
            registrar_actividad(usuario_id, "Cambio de contraseña")
            return jsonify({"mensaje": "Contraseña actualizada exitosamente"}), 200
    
    return jsonify({"error": "Usuario no encontrado"}), 404

# ============================================
# DIRECTORIO
# ============================================
@app.route('/api/directorio', methods=['GET'])
def obtener_directorio():
    """Obtener directorio de miembros"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    usuarios = db.cargar_json('usuarios')
    
    miembros = []
    for u in usuarios.get('usuarios', []):
        miembros.append({
            "id": u['id'],
            "nombre": u['nombre'],
            "apellidos": u.get('apellidos', ''),
            "foto": u.get('foto', 'assets/avatars/default.png'),
            "ministerio": u.get('ministerio', ''),
            "verificado": u.get('verificado', False),
            "ultima_conexion": u.get('ultima_conexion', ''),
            "estado": u.get('estado', 'activo'),
            "insignias": u.get('insignias', [])
        })
    
    return jsonify({
        "miembros": miembros,
        "total": len(miembros)
    }), 200

# ============================================
# ASISTENCIA
# ============================================
@app.route('/api/asistencia', methods=['GET'])
def obtener_asistencia():
    """Obtener registros de asistencia"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    asistencia = db.cargar_json('asistencia')
    registros = asistencia.get('registros', [])
    
    if sesion['rol'] == 'usuario':
        registros = [r for r in registros if r.get('usuario_id') == sesion['usuario']['id']]
    
    return jsonify({
        "registros": registros,
        "total": len(registros)
    }), 200

@app.route('/api/asistencia', methods=['POST'])
def registrar_asistencia():
    """Registrar asistencia a culto"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    datos = request.json
    if not datos:
        return jsonify({"error": "Datos inválidos"}), 400
        
    asistencia = db.cargar_json('asistencia')
    
    nuevo_registro = {
        "id": len(asistencia.get('registros', [])) + 1,
        "usuario_id": sesion['usuario']['id'],
        "nombre": sesion['usuario']['nombre'],
        "fecha": datos.get('fecha', datetime.datetime.now().strftime('%Y-%m-%d')),
        "hora": datetime.datetime.now().strftime('%H:%M:%S'),
        "estado": datos.get('estado', 'Asistiré'),
        "tipo": datos.get('tipo', 'Hermano'),
        "culto": datos.get('culto', ''),
        "comentario": datos.get('comentario', '')
    }
    
    if 'registros' not in asistencia:
        asistencia['registros'] = []
    asistencia['registros'].append(nuevo_registro)
    db.guardar_json('asistencia', asistencia)
    
    actualizar_estadisticas_asistencia()
    
    return jsonify({
        "mensaje": "Asistencia registrada exitosamente",
        "registro": nuevo_registro
    }), 201

@app.route('/api/asistencia/estadisticas', methods=['GET'])
def obtener_estadisticas_asistencia():
    """Obtener estadísticas de asistencia"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    estadisticas = db.cargar_json('estadisticas')
    return jsonify(estadisticas.get('asistencia', {})), 200

# ============================================
# CONTADOR REGRESIVO DE CULTOS
# ============================================
@app.route('/api/cultos/proximo', methods=['GET'])
def obtener_proximo_culto():
    """Obtener información del próximo culto"""
    ahora = datetime.datetime.now()
    
    cultos_semanales = {
        0: [],
        1: [{"inicio": "18:00", "fin": "20:30", "nombre": "Culto de Oración"}],
        2: [{"inicio": "16:00", "fin": "19:00", "nombre": "Culto Campal"}],
        3: [{"inicio": "16:00", "fin": "19:00", "nombre": "Culto de Refrán"}],
        4: [{"inicio": "18:00", "fin": "20:30", "nombre": "Culto de Jóvenes"}],
        5: [],
        6: [{"inicio": "10:00", "fin": "12:00", "nombre": "Culto Dominical"}]
    }
    
    dias_semana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    
    dia_actual = ahora.weekday()
    hora_actual = ahora.strftime('%H:%M')
    
    for dias_adelante in range(8):
        dia_busqueda = (dia_actual + dias_adelante) % 7
        cultos_dia = cultos_semanales[dia_busqueda]
        
        if not cultos_dia:
            continue
        
        for culto in cultos_dia:
            fecha_culto = ahora + datetime.timedelta(days=dias_adelante)
            fecha_str = fecha_culto.strftime('%Y-%m-%d')
            
            inicio_dt = datetime.datetime.strptime(f"{fecha_str} {culto['inicio']}", '%Y-%m-%d %H:%M')
            fin_dt = datetime.datetime.strptime(f"{fecha_str} {culto['fin']}", '%Y-%m-%d %H:%M')
            
            if dias_adelante == 0:
                if hora_actual >= culto['fin']:
                    continue
                
                estado = "en_curso" if hora_actual >= culto['inicio'] else "proximo"
                segundos_restantes = (fin_dt - ahora).total_seconds() if estado == "en_curso" else (inicio_dt - ahora).total_seconds()
                
                return jsonify({
                    "nombre": culto['nombre'],
                    "dia": dias_semana[dia_busqueda],
                    "fecha": fecha_str,
                    "inicio": culto['inicio'],
                    "fin": culto['fin'],
                    "estado": estado,
                    "timestamp_inicio": inicio_dt.isoformat(),
                    "timestamp_fin": fin_dt.isoformat(),
                    "segundos_restantes": max(0, segundos_restantes)
                }), 200
            else:
                segundos_restantes = (inicio_dt - ahora).total_seconds()
                
                return jsonify({
                    "nombre": culto['nombre'],
                    "dia": dias_semana[dia_busqueda],
                    "fecha": fecha_str,
                    "inicio": culto['inicio'],
                    "fin": culto['fin'],
                    "estado": "proximo",
                    "timestamp_inicio": inicio_dt.isoformat(),
                    "segundos_restantes": max(0, segundos_restantes)
                }), 200
    
    return jsonify({
        "mensaje": "No hay cultos programados",
        "estado": "sin_cultos",
        "segundos_restantes": 0
    }), 200

# ============================================
# HORARIOS
# ============================================
@app.route('/api/horarios', methods=['GET'])
def obtener_horarios():
    """Obtener horarios de cultos"""
    horarios = db.cargar_json('horarios')
    return jsonify({"horarios": horarios.get('cultos', [])}), 200

# ============================================
# VERSÍCULO DIARIO
# ============================================
@app.route('/api/versiculo-diario', methods=['GET'])
def obtener_versiculo_diario():
    """Obtener versículo del día"""
    versiculos = db.cargar_json('versiculos')
    hoy = datetime.datetime.now().strftime('%Y-%m-%d')
    
    versiculo_hoy = versiculos.get('versiculo_actual')
    
    if not versiculo_hoy or versiculo_hoy.get('fecha') != hoy:
        lista = versiculos.get('versiculos', [])
        if lista:
            indice = datetime.datetime.now().day % len(lista)
            versiculo_hoy = lista[indice].copy()
            versiculo_hoy['fecha'] = hoy
            versiculos['versiculo_actual'] = versiculo_hoy
            db.guardar_json('versiculos', versiculos)
        else:
            versiculo_hoy = {
                "texto": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
                "referencia": "Juan 3:16",
                "tipo": "promesa",
                "fecha": hoy
            }
    
    return jsonify({"versiculo": versiculo_hoy}), 200

@app.route('/api/versiculos', methods=['GET'])
def obtener_versiculos():
    """Obtener todos los versículos"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    versiculos = db.cargar_json('versiculos')
    return jsonify({"versiculos": versiculos.get('versiculos', [])}), 200

@app.route('/api/versiculos', methods=['POST'])
def crear_versiculo():
    """Crear nuevo versículo (admin)"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion or sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    
    datos = request.json
    if not datos or 'texto' not in datos or 'referencia' not in datos:
        return jsonify({"error": "Datos incompletos"}), 400
    
    versiculos = db.cargar_json('versiculos')
    
    nuevo = {
        "id": len(versiculos.get('versiculos', [])) + 1,
        "texto": datos['texto'],
        "referencia": datos['referencia'],
        "tipo": datos.get('tipo', 'versiculo'),
        "fecha_creacion": datetime.datetime.now().isoformat()
    }
    
    if 'versiculos' not in versiculos:
        versiculos['versiculos'] = []
    versiculos['versiculos'].append(nuevo)
    db.guardar_json('versiculos', versiculos)
    
    return jsonify({"mensaje": "Versículo creado exitosamente", "versiculo": nuevo}), 201

@app.route('/api/versiculos/<int:versiculo_id>', methods=['DELETE'])
def eliminar_versiculo(versiculo_id):
    """Eliminar versículo (admin)"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion or sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    
    versiculos = db.cargar_json('versiculos')
    versiculos['versiculos'] = [v for v in versiculos.get('versiculos', []) if v['id'] != versiculo_id]
    db.guardar_json('versiculos', versiculos)
    
    return jsonify({"mensaje": "Versículo eliminado exitosamente"}), 200

# ============================================
# NOTICIAS
# ============================================
@app.route('/api/noticias', methods=['GET'])
def obtener_noticias():
    """Obtener noticias"""
    noticias = db.cargar_json('noticias')
    lista = noticias.get('noticias', [])
    
    lista_ordenada = sorted(lista, key=lambda x: x.get('fecha_publicacion', ''), reverse=True)
    publicadas = [n for n in lista_ordenada if n.get('estado') == 'publicado']
    
    return jsonify({
        "noticias": publicadas[:20],
        "total": len(publicadas)
    }), 200

@app.route('/api/noticias', methods=['POST'])
def crear_noticia():
    """Crear nueva noticia (admin)"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion or sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    
    datos = request.json
    if not datos or 'titulo' not in datos or 'contenido' not in datos:
        return jsonify({"error": "Datos incompletos"}), 400
    
    noticias = db.cargar_json('noticias')
    
    nueva = {
        "id": len(noticias.get('noticias', [])) + 1,
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
    
    if 'noticias' not in noticias:
        noticias['noticias'] = []
    noticias['noticias'].append(nueva)
    db.guardar_json('noticias', noticias)
    
    return jsonify({"mensaje": "Noticia creada exitosamente", "noticia": nueva}), 201

@app.route('/api/noticias/<int:noticia_id>', methods=['DELETE'])
def eliminar_noticia(noticia_id):
    """Eliminar noticia (admin)"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion or sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    
    noticias = db.cargar_json('noticias')
    noticias['noticias'] = [n for n in noticias.get('noticias', []) if n['id'] != noticia_id]
    db.guardar_json('noticias', noticias)
    
    return jsonify({"mensaje": "Noticia eliminada exitosamente"}), 200

# ============================================
# EVENTOS
# ============================================
@app.route('/api/eventos', methods=['GET'])
def obtener_eventos():
    """Obtener eventos"""
    eventos = db.cargar_json('eventos')
    lista = eventos.get('eventos', [])
    
    lista_ordenada = sorted(lista, key=lambda x: x.get('fecha', ''))
    proximos = [e for e in lista_ordenada if e.get('fecha', '') >= datetime.datetime.now().strftime('%Y-%m-%d')]
    
    return jsonify({
        "eventos": proximos[:20],
        "total": len(proximos)
    }), 200

@app.route('/api/eventos', methods=['POST'])
def crear_evento():
    """Crear nuevo evento (admin)"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion or sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    
    datos = request.json
    if not datos or 'titulo' not in datos or 'fecha' not in datos:
        return jsonify({"error": "Datos incompletos"}), 400
    
    eventos = db.cargar_json('eventos')
    
    nuevo = {
        "id": len(eventos.get('eventos', [])) + 1,
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
    
    if 'eventos' not in eventos:
        eventos['eventos'] = []
    eventos['eventos'].append(nuevo)
    db.guardar_json('eventos', eventos)
    
    return jsonify({"mensaje": "Evento creado exitosamente", "evento": nuevo}), 201

# ============================================
# PETICIONES DE ORACIÓN
# ============================================
@app.route('/api/peticiones', methods=['GET'])
def obtener_peticiones():
    """Obtener peticiones de oración"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    peticiones = db.cargar_json('peticiones')
    lista = peticiones.get('peticiones', [])
    lista.sort(key=lambda x: x.get('fecha', ''), reverse=True)
    
    return jsonify({
        "peticiones": lista[:50],
        "total": len(lista)
    }), 200

@app.route('/api/peticiones', methods=['POST'])
def crear_peticion():
    """Crear petición de oración"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    datos = request.json
    if not datos or 'motivo' not in datos:
        return jsonify({"error": "El motivo es obligatorio"}), 400
    
    peticiones = db.cargar_json('peticiones')
    
    nueva = {
        "id": len(peticiones.get('peticiones', [])) + 1,
        "usuario_id": sesion['usuario']['id'],
        "nombre": sesion['usuario']['nombre'],
        "motivo": datos['motivo'],
        "descripcion": datos.get('descripcion', ''),
        "fecha": datetime.datetime.now().isoformat(),
        "estado": "activa",
        "oraciones": 0
    }
    
    if 'peticiones' not in peticiones:
        peticiones['peticiones'] = []
    peticiones['peticiones'].append(nueva)
    db.guardar_json('peticiones', peticiones)
    
    return jsonify({"mensaje": "Petición creada exitosamente", "peticion": nueva}), 201

# ============================================
... (el código continúa con más rutas)

# ============================================
# INICIALIZACIÓN Y ARRANQUE
# ============================================
if __name__ == '__main__':
    print("=" * 60)
    print("🔥  IPUC LA FONDA - Servidor Iniciando...")
    print("=" * 60)
    
    db.inicializar_datos()
    print("✅ Base de datos inicializada correctamente")
    
    port = int(os.environ.get('PORT', 5000))
    
    print(f"🌐 Servidor corriendo en: http://0.0.0.0:{port}")
    print(f"📱 URL local: http://localhost:{port}")
    print(f"🔑 Admin: admin / 123456")
    print(f"👤 Usuario: usuario / 123456")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=False)
