# app.py - Servidor Flask IPUC LA FONDA v2.0 (Autenticación sin credenciales de prueba)
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from database import Database
import hashlib
import secrets
import datetime
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
    salt = SECRET_KEY[:16]
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

def generar_token():
    return secrets.token_urlsafe(32)

def verificar_token(token):
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
    ahora = datetime.datetime.now()
    expirados = [t for t, s in TOKENS.items() if s['expira'] < ahora]
    for t in expirados:
        del TOKENS[t]

def registrar_actividad(usuario_id, accion, detalles=""):
    try:
        actividad = db.cargar_json('actividad')
        registro = {
            "id": len(actividad.get('registros', [])) + 1,
            "usuario_id": usuario_id,
            "accion": accion,
            "detalles": detalles,
            "fecha": datetime.datetime.now().isoformat(),
            "ip": request.remote_addr
        }
        if 'registros' not in actividad:
            actividad['registros'] = []
        actividad['registros'].append(registro)
        db.guardar_json('actividad', actividad)
    except Exception as e:
        print(f"Error registrando actividad: {e}")

def verificar_bloqueo_ip(ip):
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
    if ip not in INTENTOS_FALLIDOS:
        INTENTOS_FALLIDOS[ip] = {'intentos': 1, 'ultimo': datetime.datetime.now()}
    else:
        INTENTOS_FALLIDOS[ip]['intentos'] += 1
        INTENTOS_FALLIDOS[ip]['ultimo'] = datetime.datetime.now()
    intentos = INTENTOS_FALLIDOS[ip]['intentos']
    restantes = MAX_INTENTOS - intentos
    if restantes <= 0:
        BLOQUEOS_TEMPORALES[ip] = {
            'hasta': datetime.datetime.now() + datetime.timedelta(minutes=TIEMPO_BLOQUEO)
        }
        return {"error": "IP bloqueada", "mensaje": f"Intente en {TIEMPO_BLOQUEO} minutos"}, 403
    return {"error": "Credenciales inválidas", "intentos_restantes": restantes}, 401

def crear_sesion(usuario, rol, ip):
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
    try:
        asistencia = db.cargar_json('asistencia')
        estadisticas = db.cargar_json('estadisticas')
        hoy = datetime.datetime.now().strftime('%Y-%m-%d')
        mes = datetime.datetime.now().strftime('%Y-%m')
        año = datetime.datetime.now().strftime('%Y')
        registros = asistencia.get('registros', [])
        diarios = len([r for r in registros if r.get('fecha') == hoy])
        mensuales = len([r for r in registros if r.get('fecha', '').startswith(mes)])
        anuales = len([r for r in registros if r.get('fecha', '').startswith(año)])
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
    try:
        usuarios = db.cargar_json('usuarios')
        estadisticas = db.cargar_json('estadisticas')
        todos = usuarios.get('usuarios', [])
        activos = len([u for u in todos if u.get('estado') == 'activo'])
        mes = datetime.datetime.now().strftime('%Y-%m')
        nuevos = len([u for u in todos if u.get('fecha_registro', '').startswith(mes)])
        estadisticas['usuarios'] = {
            "total": len(todos),
            "activos": activos,
            "nuevos_mes": nuevos,
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
    if request.endpoint in ['login', 'registro']:
        ip = request.remote_addr
        bloqueado, segundos = verificar_bloqueo_ip(ip)
        if bloqueado:
            return jsonify({
                "error": "IP bloqueada temporalmente",
                "mensaje": f"Intente nuevamente en {segundos} segundos"
            }), 403
    if hasattr(app, 'request_count'):
        app.request_count += 1
    else:
        app.request_count = 1
    if app.request_count % 100 == 0:
        limpiar_tokens_expirados()

# ============================================
# RUTAS ESTÁTICAS
# ============================================
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    if os.path.exists(path):
        return send_from_directory('.', path)
    return jsonify({"error": "Archivo no encontrado"}), 404

@app.route('/api/health')
def health():
    return jsonify({"estado": "online", "version": "2.0.0"}), 200

# ============================================
# AUTENTICACIÓN
# ============================================
@app.route('/api/registro', methods=['POST'])
def registro():
    try:
        datos = request.json
        if not datos:
            return jsonify({"error": "Datos inválidos"}), 400
        campos = ['nombre', 'apellidos', 'documento', 'fecha_nacimiento', 'sexo', 'correo', 'celular', 'usuario', 'password', 'ministerio']
        for campo in campos:
            if campo not in datos or not str(datos[campo]).strip():
                return jsonify({"error": f"El campo {campo} es obligatorio"}), 400
        if '@' not in datos['correo'] or '.' not in datos['correo']:
            return jsonify({"error": "Formato de correo inválido"}), 400
        if len(datos['password']) < 6:
            return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400
        usuarios = db.cargar_json('usuarios')
        if any(u.get('documento') == datos['documento'] for u in usuarios.get('usuarios', [])):
            return jsonify({"error": "El documento ya está registrado"}), 400
        if any(u.get('correo', '').lower() == datos['correo'].lower() for u in usuarios.get('usuarios', [])):
            return jsonify({"error": "El correo ya está registrado"}), 400
        if any(u.get('usuario', '').lower() == datos['usuario'].lower() for u in usuarios.get('usuarios', [])):
            return jsonify({"error": "El nombre de usuario ya existe"}), 400
        nuevo = {
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
        usuarios['usuarios'].append(nuevo)
        db.guardar_json('usuarios', usuarios)
        actualizar_estadisticas_usuarios()
        registrar_actividad(nuevo['id'], "Registro")
        return jsonify({"mensaje": "Registro exitoso", "usuario": {"id": nuevo['id'], "nombre": nuevo['nombre'], "usuario": nuevo['usuario']}}), 201
    except Exception as e:
        print(f"Error en registro: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/api/login', methods=['POST'])
def login():
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
            return jsonify({"error": "IP bloqueada", "mensaje": f"Intente en {segundos} segundos"}), 403
        administradores = db.cargar_json('administradores')
        admin = next((a for a in administradores.get('administradores', [])
                      if a['usuario'].lower() == usuario_id.lower() or a['correo'].lower() == usuario_id.lower()), None)
        if admin and admin['password'] == hash_password(password):
            return crear_sesion(admin, 'admin', ip)
        usuarios = db.cargar_json('usuarios')
        usuario = next((u for u in usuarios.get('usuarios', [])
                        if u['usuario'].lower() == usuario_id.lower() or u['correo'].lower() == usuario_id.lower()), None)
        if usuario and usuario['password'] == hash_password(password):
            if usuario.get('estado') != 'activo':
                return jsonify({"error": "Cuenta desactivada"}), 403
            return crear_sesion(usuario, 'usuario', ip)
        return registrar_intento_fallido(ip)
    except Exception as e:
        print(f"Error en login: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if token in TOKENS:
        registrar_actividad(TOKENS[token]['usuario']['id'], "Cierre de sesión")
        del TOKENS[token]
    return jsonify({"mensaje": "Sesión cerrada"}), 200

@app.route('/api/verificar-sesion', methods=['GET'])
def verificar_sesion():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sesion = verificar_token(token)
    if not sesion:
        return jsonify({"valida": False}), 401
    return jsonify({"valida": True, "usuario": {"id": sesion['usuario']['id'], "nombre": sesion['usuario']['nombre'], "rol": sesion['rol']}}), 200

# ============================================
# USUARIOS Y DIRECTORIO
# ============================================
@app.route('/api/usuarios', methods=['GET'])
def obtener_usuarios():
    sesion = verificar_token(request.headers.get('Authorization', '').replace('Bearer ', ''))
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    usuarios = db.cargar_json('usuarios')
    seguros = [{k: v for k, v in u.items() if k != 'password'} for u in usuarios.get('usuarios', [])]
    return jsonify({"usuarios": seguros, "total": len(seguros)}), 200

@app.route('/api/usuarios/<int:usuario_id>', methods=['GET'])
def obtener_usuario(usuario_id):
    sesion = verificar_token(request.headers.get('Authorization', '').replace('Bearer ', ''))
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    usuarios = db.cargar_json('usuarios')
    usuario = next((u for u in usuarios.get('usuarios', []) if u['id'] == usuario_id), None)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify({"usuario": {k: v for k, v in usuario.items() if k != 'password'}}), 200

@app.route('/api/usuarios/<int:usuario_id>', methods=['PUT'])
def actualizar_usuario(usuario_id):
    sesion = verificar_token(request.headers.get('Authorization', '').replace('Bearer ', ''))
    if not sesion or (sesion['rol'] != 'admin' and sesion['usuario']['id'] != usuario_id):
        return jsonify({"error": "No autorizado"}), 403
    datos = request.json
    if not datos:
        return jsonify({"error": "Datos inválidos"}), 400
    usuarios = db.cargar_json('usuarios')
    for i, u in enumerate(usuarios.get('usuarios', [])):
        if u['id'] == usuario_id:
            for campo in ['nombre', 'apellidos', 'celular', 'direccion', 'ministerio', 'foto', 'estado']:
                if campo in datos:
                    usuarios['usuarios'][i][campo] = datos[campo]
            db.guardar_json('usuarios', usuarios)
            return jsonify({"mensaje": "Usuario actualizado"}), 200
    return jsonify({"error": "Usuario no encontrado"}), 404

@app.route('/api/usuarios/<int:usuario_id>/verificar', methods=['POST'])
def verificar_usuario(usuario_id):
    sesion = verificar_token(request.headers.get('Authorization', '').replace('Bearer ', ''))
    if not sesion or sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    usuarios = db.cargar_json('usuarios')
    for i, u in enumerate(usuarios.get('usuarios', [])):
        if u['id'] == usuario_id:
            usuarios['usuarios'][i]['verificado'] = True
            if 'Cuenta Verificada' not in usuarios['usuarios'][i].get('insignias', []):
                usuarios['usuarios'][i].setdefault('insignias', []).append('Cuenta Verificada')
            db.guardar_json('usuarios', usuarios)
            return jsonify({"mensaje": "Cuenta verificada"}), 200
    return jsonify({"error": "Usuario no encontrado"}), 404

@app.route('/api/directorio', methods=['GET'])
def directorio():
    sesion = verificar_token(request.headers.get('Authorization', '').replace('Bearer ', ''))
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    usuarios = db.cargar_json('usuarios')
    miembros = [{"id": u['id'], "nombre": u['nombre'], "apellidos": u.get('apellidos', ''),
                 "foto": u.get('foto'), "ministerio": u.get('ministerio'), "verificado": u.get('verificado')}
                for u in usuarios.get('usuarios', [])]
    return jsonify({"miembros": miembros}), 200

# ============================================
# ASISTENCIA
# ============================================
@app.route('/api/asistencia', methods=['GET', 'POST'])
def asistencia():
    sesion = verificar_token(request.headers.get('Authorization', '').replace('Bearer ', ''))
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    if request.method == 'GET':
        registros = db.cargar_json('asistencia').get('registros', [])
        if sesion['rol'] == 'usuario':
            registros = [r for r in registros if r.get('usuario_id') == sesion['usuario']['id']]
        return jsonify({"registros": registros}), 200
    datos = request.json
    if not datos:
        return jsonify({"error": "Datos inválidos"}), 400
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
    asistencia.setdefault('registros', []).append(nuevo)
    db.guardar_json('asistencia', asistencia)
    actualizar_estadisticas_asistencia()
    return jsonify({"mensaje": "Asistencia registrada", "registro": nuevo}), 201

@app.route('/api/asistencia/estadisticas')
def estadisticas_asistencia():
    sesion = verificar_token(request.headers.get('Authorization', '').replace('Bearer ', ''))
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    return jsonify(db.cargar_json('estadisticas').get('asistencia', {})), 200

# ============================================
# CULTOS Y HORARIOS
# ============================================
@app.route('/api/cultos/proximo')
def proximo_culto():
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
            return jsonify({"nombre": c['nombre'], "dia": dias[dia], "fecha": fecha.strftime('%Y-%m-%d'),
                            "inicio": c['inicio'], "fin": c['fin'], "estado": estado,
                            "segundos_restantes": max(0, restante)}), 200
    return jsonify({"mensaje": "No hay cultos programados", "estado": "sin_cultos", "segundos_restantes": 0}), 200

@app.route('/api/horarios')
def horarios():
    return jsonify(db.cargar_json('horarios')), 200

# ============================================
# VERSÍCULOS
# ============================================
@app.route('/api/versiculo-diario')
def versiculo_diario():
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
            actual = {"texto": "Porque de tal manera amó Dios al mundo...", "referencia": "Juan 3:16", "tipo": "promesa", "fecha": hoy}
    return jsonify({"versiculo": actual}), 200

@app.route('/api/versiculos', methods=['GET', 'POST'])
def versiculos():
    sesion = verificar_token(request.headers.get('Authorization', '').replace('Bearer ', ''))
    if request.method == 'GET':
        return jsonify(db.cargar_json('versiculos').get('versiculos', [])), 200
    if not sesion or sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    datos = request.json
    if not datos or 'texto' not in datos or 'referencia' not in datos:
        return jsonify({"error": "Datos incompletos"}), 400
    versiculos = db.cargar_json('versiculos')
    nuevo = {"id": len(versiculos.get('versiculos', [])) + 1, "texto": datos['texto'],
             "referencia": datos['referencia'], "tipo": datos.get('tipo', 'versiculo')}
    versiculos.setdefault('versiculos', []).append(nuevo)
    db.guardar_json('versiculos', versiculos)
    return jsonify({"mensaje": "Versículo creado"}), 201

# ============================================
# NOTICIAS Y EVENTOS
# ============================================
@app.route('/api/noticias', methods=['GET', 'POST'])
def noticias():
    sesion = verificar_token(request.headers.get('Authorization', '').replace('Bearer ', ''))
    if request.method == 'GET':
        noticias = db.cargar_json('noticias').get('noticias', [])
        publicadas = [n for n in noticias if n.get('estado') == 'publicado']
        return jsonify({"noticias": sorted(publicadas, key=lambda x: x.get('fecha_publicacion', ''), reverse=True)[:20]}), 200
    if not sesion or sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    datos = request.json
    if not datos or 'titulo' not in datos or 'contenido' not in datos:
        return jsonify({"error": "Datos incompletos"}), 400
    noticias = db.cargar_json('noticias')
    nueva = {"id": len(noticias.get('noticias', [])) + 1, "titulo": datos['titulo'],
             "contenido": datos['contenido'], "autor_id": sesion['usuario']['id'],
             "fecha_publicacion": datetime.datetime.now().isoformat(), "estado": "publicado"}
    noticias.setdefault('noticias', []).append(nueva)
    db.guardar_json('noticias', noticias)
    return jsonify({"mensaje": "Noticia creada"}), 201

@app.route('/api/eventos', methods=['GET', 'POST'])
def eventos():
    sesion = verificar_token(request.headers.get('Authorization', '').replace('Bearer ', ''))
    if request.method == 'GET':
        eventos = db.cargar_json('eventos').get('eventos', [])
        return jsonify({"eventos": sorted(eventos, key=lambda x: x.get('fecha', ''))[:20]}), 200
    if not sesion or sesion['rol'] != 'admin':
        return jsonify({"error": "No autorizado"}), 403
    datos = request.json
    if not datos or 'titulo' not in datos or 'fecha' not in datos:
        return jsonify({"error": "Datos incompletos"}), 400
    eventos = db.cargar_json('eventos')
    nuevo = {"id": len(eventos.get('eventos', [])) + 1, "titulo": datos['titulo'],
             "fecha": datos['fecha'], "hora": datos.get('hora', ''), "lugar": datos.get('lugar', 'IPUC LA FONDA')}
    eventos.setdefault('eventos', []).append(nuevo)
    db.guardar_json('eventos', eventos)
    return jsonify({"mensaje": "Evento creado"}), 201

# ============================================
# PETICIONES
# ============================================
@app.route('/api/peticiones', methods=['GET', 'POST'])
def peticiones():
    sesion = verificar_token(request.headers.get('Authorization', '').replace('Bearer ', ''))
    if request.method == 'GET':
        return jsonify(db.cargar_json('peticiones').get('peticiones', [])), 200
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    datos = request.json
    if not datos or 'motivo' not in datos:
        return jsonify({"error": "Motivo requerido"}), 400
    peticiones = db.cargar_json('peticiones')
    nueva = {"id": len(peticiones.get('peticiones', [])) + 1, "usuario_id": sesion['usuario']['id'],
             "nombre": sesion['usuario']['nombre'], "motivo": datos['motivo'],
             "fecha": datetime.datetime.now().isoformat(), "estado": "activa"}
    peticiones.setdefault('peticiones', []).append(nueva)
    db.guardar_json('peticiones', peticiones)
    return jsonify({"mensaje": "Petición creada"}), 201

# ============================================
# RUTA PARA CREAR EL PRIMER ADMINISTRADOR
# ============================================
@app.route('/api/admin/crear-primer-admin', methods=['POST'])
def crear_primer_admin():
    """
    Endpoint para crear el primer administrador del sistema.
    SOLO funciona si NO existe ningún administrador previo.
    Por seguridad, se deshabilita después del primer uso.
    """
    try:
        datos = request.json
        if not datos:
            return jsonify({"error": "Se requieren datos en formato JSON"}), 400
        
        # Campos requeridos
        campos_requeridos = ['nombre', 'apellidos', 'correo', 'usuario', 'password']
        for campo in campos_requeridos:
            if campo not in datos or not str(datos[campo]).strip():
                return jsonify({"error": f"El campo '{campo}' es obligatorio"}), 400
        
        # Validar formato de correo
        if '@' not in datos['correo'] or '.' not in datos['correo']:
            return jsonify({"error": "Formato de correo electrónico inválido"}), 400
        
        # Validar longitud de contraseña
        if len(datos['password']) < 8:
            return jsonify({"error": "La contraseña debe tener al menos 8 caracteres"}), 400
        
        # Validar formato de usuario
        import re
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', datos['usuario']):
            return jsonify({"error": "El usuario solo puede contener letras, números y guiones bajos (3-20 caracteres)"}), 400
        
        # Verificar que NO exista ningún administrador
        administradores = db.cargar_json('administradores')
        if administradores.get('administradores') and len(administradores['administradores']) > 0:
            registrar_actividad(0, "Intento de crear admin adicional", f"IP: {request.remote_addr}")
            return jsonify({
                "error": "Ya existe al menos un administrador en el sistema",
                "mensaje": "Por seguridad, esta función solo está disponible cuando no hay administradores. Usa el panel de administración para crear más administradores."
            }), 403
        
        # Verificar que el usuario no exista ya
        usuarios = db.cargar_json('usuarios')
        if any(u.get('usuario', '').lower() == datos['usuario'].lower() for u in usuarios.get('usuarios', [])):
            return jsonify({"error": "El nombre de usuario ya existe en el sistema"}), 400
        
        if any(u.get('correo', '').lower() == datos['correo'].lower() for u in usuarios.get('usuarios', [])):
            return jsonify({"error": "El correo electrónico ya está registrado"}), 400
        
        # Crear el administrador
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
        
        # Guardar en el archivo de administradores
        if 'administradores' not in administradores:
            administradores['administradores'] = []
        administradores['administradores'].append(admin)
        administradores['ultimo_id'] = 1
        db.guardar_json('administradores', administradores)
        
        # Actualizar configuración
        config = db.cargar_json('configuracion')
        config['aplicacion']['primer_administrador_creado'] = True
        db.guardar_json('configuracion', config)
        
        # Registrar actividad
        registrar_actividad(1, "Creación del primer administrador", f"Usuario: {datos['usuario']}")
        
        # Actualizar estadísticas
        actualizar_estadisticas_usuarios()
        
        print(f"✅ Primer administrador creado exitosamente: {datos['usuario']}")
        
        return jsonify({
            "mensaje": "Primer administrador creado exitosamente. Ahora puedes iniciar sesión en la aplicación.",
            "admin": {
                "id": 1,
                "usuario": datos['usuario'],
                "nombre": f"{datos['nombre']} {datos['apellidos']}",
                "correo": datos['correo']
            }
        }), 201
        
    except Exception as e:
        print(f"❌ Error al crear primer administrador: {str(e)}")
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

        # ============================================
# INICIALIZACIÓN DEL SERVIDOR (SIN CREDENCIALES DE PRUEBA)
# ============================================
if __name__ == '__main__':
    # --- Configuración de logging ---
    import logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    logger = logging.getLogger(__name__)
    
    # --- Banner de inicio ---
    print("=" * 60)
    print("╔══════════════════════════════════════════════════════════╗")
    print("║                                                          ║")
    print("║   🔥  IPUC LA FONDA - API REST v2.1.0                   ║")
    print("║   Iglesia Pentecostal Unida de Colombia                  ║")
    print("║   'Donde el Espíritu Santo se mueve'                     ║")
    print("║                                                          ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print("=" * 60)
    
    # --- Inicializar base de datos ---
    print("⏳ Inicializando base de datos...")
    try:
        db.inicializar_datos()
        print("✅ Base de datos inicializada correctamente")
        
        # Verificar estado de la base de datos
        stats = db.obtener_estadisticas_db()
        print(f"📊 Archivos JSON: {stats.get('total_archivos', 0)}")
        print(f"💾 Tamaño total: {stats.get('tamaño_total_kb', 0)} KB")
        
    except Exception as e:
        print(f"❌ Error al inicializar la base de datos: {str(e)}")
        print("⚠️  El servidor puede no funcionar correctamente")
    
    # --- Verificar administradores ---
    administradores = db.cargar_json('administradores')
    total_admins = len(administradores.get('administradores', []))
    
    if total_admins == 0:
        print("-" * 60)
        print("⚠️  ADVERTENCIA DE SEGURIDAD:")
        print("   No existe ningún administrador en el sistema.")
        print("   Debes crear el primer administrador usando:")
        print("   POST /api/admin/crear-primer-admin")
        print("   ")
        print("   Ejemplo con curl:")
        print('   curl -X POST http://localhost:5000/api/admin/crear-primer-admin \\')
        print('     -H "Content-Type: application/json" \\')
        print('     -d \'{"nombre":"Admin","apellidos":"Principal","correo":"admin@ipuclafonda.org","usuario":"admin","password":"ContraseñaSegura123"}\'')
        print("-" * 60)
    else:
        print(f"👑 Administradores registrados: {total_admins}")
    
    # --- Verificar usuarios ---
    usuarios = db.cargar_json('usuarios')
    total_usuarios = len(usuarios.get('usuarios', []))
    print(f"👥 Usuarios registrados: {total_usuarios}")
    
    # --- Verificar versículos ---
    versiculos = db.cargar_json('versiculos')
    total_versiculos = len(versiculos.get('versiculos', []))
    print(f"📖 Versículos disponibles: {total_versiculos}")
    
    # --- Configurar puerto ---
    port = int(os.environ.get('PORT', 5000))
    
    # --- Información del entorno ---
    entorno = "PRODUCCIÓN" if os.environ.get('RENDER') else "DESARROLLO"
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    print("-" * 60)
    print(f"⚙️  Entorno: {entorno}")
    print(f"🌐 Servidor: http://0.0.0.0:{port}")
    print(f"📱 URL Local: http://localhost:{port}")
    print(f"🔍 Debug: {'Activado' if debug_mode else 'Desactivado'}")
    print(f"🔒 Autenticación: SHA-256 + Salt")
    print(f"💾 Almacenamiento: JSON local")
    print(f"⏰ Hora del sistema: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)
    
    # --- Endpoints disponibles ---
    print("📡 Endpoints principales:")
    print("   GET  /api/health                 - Estado del servidor")
    print("   POST /api/registro               - Registrar nuevo usuario")
    print("   POST /api/login                  - Iniciar sesión")
    print("   POST /api/admin/crear-primer-admin - Crear primer administrador")
    print("   GET  /api/cultos/proximo         - Próximo culto")
    print("   GET  /api/versiculo-diario       - Versículo del día")
    print("   GET  /api/horarios               - Horarios de cultos")
    print("   GET  /api/usuarios               - Lista de usuarios (auth)")
    print("   ... (más endpoints disponibles)")
    print("-" * 60)
    
    # --- Mensaje de seguridad final ---
    if total_admins == 0 and total_usuarios == 0:
        print("🔒 SISTEMA LIMPIO - Sin usuarios ni administradores")
        print("   Crea el primer administrador para comenzar.")
    elif total_admins == 0 and total_usuarios > 0:
        print("⚠️  Hay usuarios pero NO hay administradores")
        print("   Promueve a un usuario o crea un administrador.")
    else:
        print("✅ Sistema listo para producción")
    
    print("=" * 60)
    print("🚀 Iniciando servidor Flask...")
    print("=" * 60)
    
    # --- Iniciar servidor ---
    try:
        app.run(
            host='0.0.0.0',
            port=port,
            debug=debug_mode,
            use_reloader=False,  # Desactivar reloader en producción
            threaded=True         # Permitir múltiples hilos
        )
    except KeyboardInterrupt:
        print("\n⏹️  Servidor detenido manualmente")
        print("👋 ¡Hasta luego! Dios te bendiga.")
    except Exception as e:
        print(f"\n❌ Error al iniciar el servidor: {str(e)}")
        print("⚠️  Verifica que el puerto no esté en uso")
        print(f"   Intenta: lsof -i :{port} (Linux/Mac) o netstat -ano | findstr :{port} (Windows)")