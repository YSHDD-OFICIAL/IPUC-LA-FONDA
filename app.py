# app.py - Servidor Flask Principal IPUC LA FONDA v2.1 (COMPLETO - SIN CREDENCIALES)
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from database import Database
import hashlib
import secrets
import datetime
import json
import os
import re

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
    """Hashear contraseña con salt seguro"""
    salt = SECRET_KEY[:16]
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

def generar_token():
    """Generar token de sesión seguro"""
    return secrets.token_urlsafe(32)

def verificar_token(token):
    """Verificar validez de token"""
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
    """Limpiar tokens expirados automáticamente"""
    ahora = datetime.datetime.now()
    expirados = [t for t, s in TOKENS.items() if s['expira'] < ahora]
    for t in expirados:
        del TOKENS[t]

def registrar_actividad(usuario_id, accion, detalles=""):
    """Registrar actividad de usuario"""
    try:
        actividad = db.cargar_json('actividad')
        nuevo = {
            "id": len(actividad.get('registros', [])) + 1,
            "usuario_id": usuario_id,
            "accion": accion,
            "detalles": detalles,
            "fecha": datetime.datetime.now().isoformat(),
            "ip": request.remote_addr
        }
        if 'registros' not in actividad:
            actividad['registros'] = []
        actividad['registros'].append(nuevo)
        db.guardar_json('actividad', actividad)
    except Exception as e:
        print(f"Error registrando actividad: {e}")

def verificar_bloqueo_ip(ip):
    """Verificar si una IP está bloqueada por intentos fallidos"""
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
    """Registrar intento fallido de login"""
    if ip not in INTENTOS_FALLIDOS:
        INTENTOS_FALLIDOS[ip] = {'intentos': 1}
    else:
        INTENTOS_FALLIDOS[ip]['intentos'] += 1
    
    intentos = INTENTOS_FALLIDOS[ip]['intentos']
    restantes = MAX_INTENTOS - intentos
    
    if restantes <= 0:
        BLOQUEOS_TEMPORALES[ip] = {
            'hasta': datetime.datetime.now() + datetime.timedelta(minutes=TIEMPO_BLOQUEO)
        }
        return {
            "error": "IP bloqueada",
            "mensaje": f"Demasiados intentos fallidos. Intente en {TIEMPO_BLOQUEO} minutos",
            "bloqueado": True
        }, 403
    
    return {
        "error": "Credenciales inválidas",
        "intentos_restantes": restantes,
        "bloqueado": False
    }, 401

def crear_sesion(usuario, rol, ip):
    """Crear sesión para usuario autenticado"""
    token = generar_token()
    TOKENS[token] = {
        'usuario': usuario,
        'rol': rol,
        'expira': datetime.datetime.now() + datetime.timedelta(hours=24),
        'ip': ip
    }
    
    # Actualizar última conexión
    if rol == 'usuario':
        usuarios = db.cargar_json('usuarios')
        for i, u in enumerate(usuarios.get('usuarios', [])):
            if u['id'] == usuario['id']:
                usuarios['usuarios'][i]['ultima_conexion'] = datetime.datetime.now().isoformat()
                break
        db.guardar_json('usuarios', usuarios)
    
    # Limpiar intentos fallidos
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

# ============================================
# MIDDLEWARE
# ============================================
@app.before_request
def before_request():
    """Middleware para verificar bloqueos y limpiar tokens"""
    # Verificar bloqueo de IP para rutas de autenticación
    if request.endpoint in ['login', 'registro']:
        ip = request.remote_addr
        bloqueado, segundos = verificar_bloqueo_ip(ip)
        if bloqueado:
            return jsonify({
                "error": "IP bloqueada",
                "mensaje": f"Demasiados intentos fallidos",
                "segundos_restantes": segundos
            }), 403
    
    # Limpiar tokens expirados cada 100 peticiones
    if not hasattr(app, 'request_count'):
        app.request_count = 0
    app.request_count += 1
    if app.request_count % 100 == 0:
        limpiar_tokens_expirados()

# ============================================
# RUTAS PRINCIPALES
# ============================================
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    if os.path.exists(path):
        return send_from_directory('.', path)
    return jsonify({"error": "Archivo no encontrado"}), 404

@app.route('/api/health', methods=['GET'])
def health_check():
    """Verificar estado del servidor"""
    return jsonify({
        "estado": "online",
        "version": "2.1.0",
        "timestamp": datetime.datetime.now().isoformat(),
        "requiere_configuracion": not db.cargar_json('configuracion').get('aplicacion', {}).get('primer_administrador_creado', False)
    }), 200

# ============================================
# CONFIGURACIÓN INICIAL
# ============================================
@app.route('/api/configuracion-inicial', methods=['GET'])
def verificar_configuracion():
    """Verificar si ya existe un administrador"""
    config = db.cargar_json('configuracion')
    admin_creado = config.get('aplicacion', {}).get('primer_administrador_creado', False)
    return jsonify({
        "configurado": admin_creado,
        "mensaje": "Sistema ya configurado" if admin_creado else "Se requiere crear administrador"
    }), 200

@app.route('/api/crear-primer-admin', methods=['POST'])
def crear_primer_admin():
    """Crear el primer administrador del sistema"""
    try:
        datos = request.json
        if not datos:
            return jsonify({"error": "Datos inválidos"}), 400
        
        # Verificar que no exista administrador
        admins = db.cargar_json('administradores')
        if admins.get('administradores', []):
            return jsonify({"error": "Ya existe un administrador"}), 400
        
        # Validar campos requeridos
        campos_requeridos = ['nombre', 'apellidos', 'correo', 'usuario', 'password']
        for campo in campos_requeridos:
            if campo not in datos or not str(datos[campo]).strip():
                return jsonify({"error": f"Campo '{campo}' es obligatorio"}), 400
        
        # Validar formato de correo
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', datos['correo']):
            return jsonify({"error": "Correo electrónico inválido"}), 400
        
        # Validar contraseña
        if len(datos['password']) < 8:
            return jsonify({"error": "La contraseña debe tener al menos 8 caracteres"}), 400
        if not re.search(r'[A-Z]', datos['password']):
            return jsonify({"error": "La contraseña debe tener al menos una mayúscula"}), 400
        if not re.search(r'[a-z]', datos['password']):
            return jsonify({"error": "La contraseña debe tener al menos una minúscula"}), 400
        if not re.search(r'[0-9]', datos['password']):
            return jsonify({"error": "La contraseña debe tener al menos un número"}), 400
        
        # Crear administrador usando el método de la base de datos
        exito = db.crear_primer_administrador(datos)
        
        if exito:
            return jsonify({
                "mensaje": "Administrador creado exitosamente",
                "usuario": datos['usuario']
            }), 201
        else:
            return jsonify({"error": "Error al crear administrador"}), 500
            
    except Exception as e:
        print(f"Error creando administrador: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

# ============================================
# AUTENTICACIÓN
# ============================================
@app.route('/api/registro', methods=['POST'])
def registro():
    """Registro de nuevos usuarios (no administradores)"""
    try:
        datos = request.json
        if not datos:
            return jsonify({"error": "Datos inválidos"}), 400
        
        # Verificar que el sistema esté configurado
        config = db.cargar_json('configuracion')
        if not config.get('aplicacion', {}).get('primer_administrador_creado', False):
            return jsonify({"error": "Sistema no configurado. Contacte al administrador"}), 403
        
        # Validar campos obligatorios
        campos = ['nombre', 'apellidos', 'documento', 'correo', 'celular', 'usuario', 'password']
        for c in campos:
            if c not in datos or not str(datos[c]).strip():
                return jsonify({"error": f"Campo {c} obligatorio"}), 400
        
        # Validar formato de correo
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', datos['correo']):
            return jsonify({"error": "Correo electrónico inválido"}), 400
        
        # Validar contraseña
        if len(datos['password']) < 8:
            return jsonify({"error": "La contraseña debe tener al menos 8 caracteres"}), 400
        
        # Verificar duplicados
        usuarios = db.cargar_json('usuarios')
        if any(str(u.get('documento')) == str(datos['documento']) for u in usuarios.get('usuarios', [])):
            return jsonify({"error": "Documento ya registrado"}), 400
        if any(u.get('correo', '').lower() == datos['correo'].lower() for u in usuarios.get('usuarios', [])):
            return jsonify({"error": "Correo ya registrado"}), 400
        if any(u.get('usuario', '').lower() == datos['usuario'].lower() for u in usuarios.get('usuarios', [])):
            return jsonify({"error": "Usuario ya existe"}), 400
        
        # Crear usuario
        nuevo = {
            "id": len(usuarios.get('usuarios', [])) + 1,
            "nombre": datos['nombre'].strip(),
            "apellidos": datos['apellidos'].strip(),
            "documento": datos['documento'].strip(),
            "fecha_nacimiento": datos.get('fecha_nacimiento', ''),
            "sexo": datos.get('sexo', ''),
            "correo": datos['correo'].strip().lower(),
            "celular": datos['celular'].strip(),
            "direccion": datos.get('direccion', '').strip(),
            "ministerio": datos.get('ministerio', ''),
            "usuario": datos['usuario'].strip().lower(),
            "password": hash_password(datos['password']),
            "foto": "assets/avatars/default.png",
            "rol": "usuario",
            "verificado": False,
            "fecha_registro": datetime.datetime.now().isoformat(),
            "ultima_conexion": datetime.datetime.now().isoformat(),
            "estado": "activo",
            "insignias": ["Nuevo Miembro"],
            "intentos_fallidos": 0,
            "bloqueado_hasta": None
        }
        
        if 'usuarios' not in usuarios:
            usuarios['usuarios'] = []
        usuarios['usuarios'].append(nuevo)
        db.guardar_json('usuarios', usuarios)
        
        # Actualizar estadísticas
        actualizar_estadisticas_usuarios()
        
        return jsonify({
            "mensaje": "Registro exitoso",
            "usuario": {
                "id": nuevo['id'],
                "nombre": nuevo['nombre'],
                "usuario": nuevo['usuario']
            }
        }), 201
        
    except Exception as e:
        print(f"Error registro: {e}")
        return jsonify({"error": "Error en el registro"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Inicio de sesión"""
    try:
        datos = request.json
        if not datos:
            return jsonify({"error": "Datos inválidos"}), 400
        
        usuario_id = datos.get('usuario', '').strip()
        password = datos.get('password', '')
        
        if not usuario_id or not password:
            return jsonify({"error": "Usuario y contraseña obligatorios"}), 400
        
        ip = request.remote_addr
        
        # Verificar bloqueo de IP
        bloqueado, segundos = verificar_bloqueo_ip(ip)
        if bloqueado:
            return jsonify({
                "error": "IP bloqueada",
                "mensaje": f"Demasiados intentos fallidos",
                "segundos_restantes": segundos
            }), 403
        
        # Buscar en administradores
        admins = db.cargar_json('administradores')
        admin = next(
            (a for a in admins.get('administradores', []) 
             if a['usuario'].lower() == usuario_id.lower() or a['correo'].lower() == usuario_id.lower()),
            None
        )
        
        if admin and admin['password'] == hash_password(password):
            return crear_sesion(admin, 'admin', ip)
        
        # Buscar en usuarios
        usuarios = db.cargar_json('usuarios')
        usuario = next(
            (u for u in usuarios.get('usuarios', []) 
             if u['usuario'].lower() == usuario_id.lower() or u['correo'].lower() == usuario_id.lower()),
            None
        )
        
        if usuario and usuario['password'] == hash_password(password):
            if usuario.get('estado') != 'activo':
                return jsonify({"error": "Cuenta desactivada"}), 403
            return crear_sesion(usuario, 'usuario', ip)
        
        # Registro de intento fallido
        return registrar_intento_fallido(ip)
        
    except Exception as e:
        print(f"Error login: {e}")
        return jsonify({"error": "Error en inicio de sesión"}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """Cerrar sesión"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if token in TOKENS:
        registrar_actividad(TOKENS[token]['usuario']['id'], "Cierre de sesión")
        del TOKENS[token]
    return jsonify({"mensaje": "Sesión cerrada"}), 200

@app.route('/api/verificar-sesion', methods=['GET'])
def verificar_sesion():
    """Verificar si el token de sesión es válido"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    if not sesion:
        return jsonify({"valida": False}), 401
    return jsonify({
        "valida": True,
        "usuario": {
            "id": sesion['usuario']['id'],
            "nombre": sesion['usuario']['nombre'],
            "rol": sesion['rol']
        }
    }), 200

# ============================================
# USUARIOS (Rutas protegidas)
# ============================================
@app.route('/api/usuarios', methods=['GET'])
def obtener_usuarios():
    """Obtener lista de usuarios (solo admin)"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    if not sesion or sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    
    usuarios = db.cargar_json('usuarios')
    seguros = [{k: v for k, v in u.items() if k != 'password'} for u in usuarios.get('usuarios', [])]
    return jsonify({"usuarios": seguros, "total": len(seguros)}), 200

@app.route('/api/usuarios/<int:usuario_id>', methods=['GET'])
def obtener_usuario(usuario_id):
    """Obtener datos de un usuario específico"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    usuarios = db.cargar_json('usuarios')
    u = next((u for u in usuarios.get('usuarios', []) if u['id'] == usuario_id), None)
    if not u:
        return jsonify({"error": "No encontrado"}), 404
    
    # Solo el propio usuario o admin pueden ver los datos
    if sesion['usuario']['id'] != usuario_id and sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    
    return jsonify({"usuario": {k: v for k, v in u.items() if k != 'password'}}), 200

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
            if 'Cuenta Verificada' not in usuarios['usuarios'][i].get('insignias', []):
                usuarios['usuarios'][i]['insignias'].append('Cuenta Verificada')
            db.guardar_json('usuarios', usuarios)
            return jsonify({"mensaje": "Usuario verificado exitosamente"}), 200
    return jsonify({"error": "Usuario no encontrado"}), 404

# ============================================
# FUNCIONES DE ESTADÍSTICAS
# ============================================
def actualizar_estadisticas_asistencia():
    """Actualizar estadísticas de asistencia"""
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
        print(f"Error estadísticas asistencia: {e}")

def actualizar_estadisticas_usuarios():
    """Actualizar estadísticas de usuarios"""
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
        print(f"Error estadísticas usuarios: {e}")

# ============================================
# DIRECTORIO
# ============================================
@app.route('/api/directorio', methods=['GET'])
def obtener_directorio():
    """Obtener directorio de miembros"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not verificar_token(token):
        return jsonify({"error": "No autorizado"}), 401
    
    usuarios = db.cargar_json('usuarios')
    miembros = [
        {
            "id": u['id'],
            "nombre": u['nombre'],
            "apellidos": u.get('apellidos', ''),
            "foto": u.get('foto', ''),
            "ministerio": u.get('ministerio', ''),
            "verificado": u.get('verificado', False)
        }
        for u in usuarios.get('usuarios', [])
    ]
    
    return jsonify({"miembros": miembros, "total": len(miembros)}), 200

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
    
    return jsonify({"registros": registros, "total": len(registros)}), 200

@app.route('/api/asistencia', methods=['POST'])
def registrar_asistencia():
    """Registrar asistencia"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    datos = request.json or {}
    asistencia = db.cargar_json('asistencia')
    
    nuevo = {
        "id": len(asistencia.get('registros', [])) + 1,
        "usuario_id": sesion['usuario']['id'],
        "nombre": sesion['usuario']['nombre'],
        "fecha": datos.get('fecha', datetime.datetime.now().strftime('%Y-%m-%d')),
        "hora": datetime.datetime.now().strftime('%H:%M:%S'),
        "estado": datos.get('estado', 'Asistiré'),
        "tipo": datos.get('tipo', 'Hermano')
    }
    
    if 'registros' not in asistencia:
        asistencia['registros'] = []
    asistencia['registros'].append(nuevo)
    db.guardar_json('asistencia', asistencia)
    
    actualizar_estadisticas_asistencia()
    
    return jsonify({"mensaje": "Asistencia registrada", "registro": nuevo}), 201

@app.route('/api/asistencia/estadisticas', methods=['GET'])
def obtener_estadisticas_asistencia():
    """Obtener estadísticas de asistencia"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not verificar_token(token):
        return jsonify({"error": "No autorizado"}), 401
    
    return jsonify(db.cargar_json('estadisticas').get('asistencia', {})), 200

# ============================================
# CONTADOR REGRESIVO DE CULTOS
# ============================================
@app.route('/api/cultos/proximo', methods=['GET'])
def obtener_proximo_culto():
    """Obtener información del próximo culto"""
    ahora = datetime.datetime.now()
    
    # Definir horarios de cultos (día: [cultos])
    cultos = {
        0: [],  # Lunes
        1: [{"inicio": "18:00", "fin": "20:30", "nombre": "Culto de Oración"}],
        2: [{"inicio": "16:00", "fin": "19:00", "nombre": "Culto Campal"}],
        3: [{"inicio": "16:00", "fin": "19:00", "nombre": "Culto de Refrán"}],
        4: [{"inicio": "18:00", "fin": "20:30", "nombre": "Culto de Jóvenes"}],
        5: [],  # Sábado
        6: [{"inicio": "10:00", "fin": "12:00", "nombre": "Culto Dominical"}]
    }
    
    dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    dia_actual = ahora.weekday()
    hora_actual = ahora.strftime('%H:%M')
    
    # Buscar próximo culto
    for d in range(8):  # Buscar hasta 7 días adelante
        dia_busqueda = (dia_actual + d) % 7
        for culto in cultos[dia_busqueda]:
            fecha_culto = ahora + datetime.timedelta(days=d)
            fecha_str = fecha_culto.strftime('%Y-%m-%d')
            
            inicio = datetime.datetime.strptime(f"{fecha_str} {culto['inicio']}", '%Y-%m-%d %H:%M')
            fin = datetime.datetime.strptime(f"{fecha_str} {culto['fin']}", '%Y-%m-%d %H:%M')
            
            if d == 0:  # Hoy
                if hora_actual >= culto['fin']:
                    continue
                estado = "en_curso" if hora_actual >= culto['inicio'] else "proximo"
                segundos = (fin - ahora).total_seconds() if estado == "en_curso" else (inicio - ahora).total_seconds()
            else:
                estado = "proximo"
                segundos = (inicio - ahora).total_seconds()
            
            return jsonify({
                "nombre": culto['nombre'],
                "dia": dias[dia_busqueda],
                "fecha": fecha_str,
                "inicio": culto['inicio'],
                "fin": culto['fin'],
                "estado": estado,
                "segundos_restantes": max(0, int(segundos))
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
    return jsonify({"horarios": db.cargar_json('horarios').get('cultos', [])}), 200

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
            # Seleccionar versículo basado en el día del año
            indice = datetime.datetime.now().timetuple().tm_yday % len(lista)
            versiculo_hoy = lista[indice].copy()
            versiculo_hoy['fecha'] = hoy
            versiculos['versiculo_actual'] = versiculo_hoy
            db.guardar_json('versiculos', versiculos)
        else:
            versiculo_hoy = {
                "texto": "Porque de tal manera amó Dios al mundo...",
                "referencia": "Juan 3:16",
                "tipo": "promesa",
                "fecha": hoy
            }
    
    return jsonify({"versiculo": versiculo_hoy}), 200

@app.route('/api/versiculos', methods=['GET'])
def obtener_versiculos():
    """Obtener todos los versículos (solo admin)"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not verificar_token(token):
        return jsonify({"error": "No autorizado"}), 401
    return jsonify({"versiculos": db.cargar_json('versiculos').get('versiculos', [])}), 200

@app.route('/api/versiculos', methods=['POST'])
def crear_versiculo():
    """Crear nuevo versículo (solo admin)"""
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
    
    return jsonify({"mensaje": "Versículo creado", "versiculo": nuevo}), 201

# ============================================
# NOTICIAS
# ============================================
@app.route('/api/noticias', methods=['GET'])
def obtener_noticias():
    """Obtener noticias públicas"""
    noticias = db.cargar_json('noticias')
    lista = sorted(
        noticias.get('noticias', []),
        key=lambda x: x.get('fecha_publicacion', ''),
        reverse=True
    )
    publicadas = [n for n in lista if n.get('estado') == 'publicado']
    return jsonify({"noticias": publicadas[:20], "total": len(publicadas)}), 200

@app.route('/api/noticias', methods=['POST'])
def crear_noticia():
    """Crear noticia (solo admin)"""
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
        "estado": "publicado",
        "categoria": datos.get('categoria', 'General'),
        "comentarios": [],
        "reacciones": {"me_gusta": 0, "amen": 0, "bendiciones": 0, "aleluya": 0}
    }
    
    if 'noticias' not in noticias:
        noticias['noticias'] = []
    noticias['noticias'].append(nueva)
    db.guardar_json('noticias', noticias)
    
    return jsonify({"mensaje": "Noticia creada", "noticia": nueva}), 201

# ============================================
# EVENTOS
# ============================================
@app.route('/api/eventos', methods=['GET'])
def obtener_eventos():
    """Obtener eventos futuros"""
    eventos = db.cargar_json('eventos')
    hoy = datetime.datetime.now().strftime('%Y-%m-%d')
    lista = sorted(
        eventos.get('eventos', []),
        key=lambda x: x.get('fecha', '')
    )
    futuros = [e for e in lista if e.get('fecha', '') >= hoy]
    return jsonify({"eventos": futuros[:20]}), 200

@app.route('/api/eventos', methods=['POST'])
def crear_evento():
    """Crear evento (solo admin)"""
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
        "estado": "programado",
        "cupos": datos.get('cupos', 0),
        "reservados": 0
    }
    
    if 'eventos' not in eventos:
        eventos['eventos'] = []
    eventos['eventos'].append(nuevo)
    db.guardar_json('eventos', eventos)
    
    return jsonify({"mensaje": "Evento creado", "evento": nuevo}), 201

# ============================================
# PETICIONES DE ORACIÓN
# ============================================
@app.route('/api/peticiones', methods=['GET'])
def obtener_peticiones():
    """Obtener peticiones de oración"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not verificar_token(token):
        return jsonify({"error": "No autorizado"}), 401
    
    peticiones = db.cargar_json('peticiones')
    lista = sorted(
        peticiones.get('peticiones', []),
        key=lambda x: x.get('fecha', ''),
        reverse=True
    )
    return jsonify({"peticiones": lista[:50]}), 200

@app.route('/api/peticiones', methods=['POST'])
def crear_peticion():
    """Crear petición de oración"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    datos = request.json
    if not datos or 'motivo' not in datos:
        return jsonify({"error": "Motivo obligatorio"}), 400
    
    peticiones = db.cargar_json('peticiones')
    
    nueva = {
        "id": len(peticiones.get('peticiones', [])) + 1,
        "usuario_id": sesion['usuario']['id'],
        "nombre": sesion['usuario']['nombre'],
        "motivo": datos['motivo'],
        "descripcion": datos.get('descripcion', ''),
        "fecha": datetime.datetime.now().isoformat(),
        "oraciones": 0,
        "estado": "activo"
    }
    
    if 'peticiones' not in peticiones:
        peticiones['peticiones'] = []
    peticiones['peticiones'].append(nueva)
    db.guardar_json('peticiones', peticiones)
    
    return jsonify({"mensaje": "Petición creada", "peticion": nueva}), 201

@app.route('/api/peticiones/<int:peticion_id>/orar', methods=['POST'])
def orar_por_peticion(peticion_id):
    """Registrar oración por una petición"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not verificar_token(token):
        return jsonify({"error": "No autorizado"}), 401
    
    peticiones = db.cargar_json('peticiones')
    for i, p in enumerate(peticiones.get('peticiones', [])):
        if p['id'] == peticion_id:
            peticiones['peticiones'][i]['oraciones'] = p.get('oraciones', 0) + 1
            db.guardar_json('peticiones', peticiones)
            return jsonify({"mensaje": "Oración registrada", "oraciones": peticiones['peticiones'][i]['oraciones']}), 200
    
    return jsonify({"error": "Petición no encontrada"}), 404

# ============================================
# INICIALIZACIÓN Y ARRANQUE
# ============================================
if __name__ == '__main__':
    print("=" * 60)
    print("🔥 IPUC LA FONDA - Servidor Iniciando...")
    print("=" * 60)
    
    # Inicializar base de datos (sin credenciales)
    db.inicializar_datos()
    print("✅ Base de datos inicializada")
    
    # Verificar configuración
    config = db.cargar_json('configuracion')
    admin_creado = config.get('aplicacion', {}).get('primer_administrador_creado', False)
    
    if not admin_creado:
        print("⚠️  ADVERTENCIA: No hay administradores configurados")
        print("ℹ️  Accede a /api/configuracion-inicial para verificar")
        print("ℹ️  Usa POST /api/crear-primer-admin para crear el primer administrador")
    else:
        print("✅ Sistema configurado correctamente")
    
    # Mostrar información
    port = int(os.environ.get('PORT', 5000))
    print(f"🌐 Servidor en http://localhost:{port}")
    print("=" * 60)
    
    # Iniciar servidor
    app.run(host='0.0.0.0', port=port, debug=False)
