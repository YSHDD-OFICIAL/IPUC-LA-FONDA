# database.py - Gestión de Base de Datos JSON IPUC LA FONDA v2.1 (SIN CREDENCIALES DE PRUEBA)
import json
import os
import shutil
from datetime import datetime
import threading
import hashlib
import secrets
import logging
from pathlib import Path

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class Database:
    def __init__(self, data_dir='data'):
        self.data_dir = data_dir
        self.lock = threading.RLock()
        self.cache = {}
        self.cache_timeout = 300
        self.last_cache_update = {}
        self._asegurar_directorios()
    
    def _asegurar_directorios(self):
        """Crear directorios necesarios si no existen"""
        directorios = [
            'data',
            'data/backups',
            'data/backups/completos',
            'data/temp',
            'data/cache',
            'assets',
            'assets/img',
            'assets/icons',
            'assets/logo',
            'assets/backgrounds',
            'assets/avatars',
            'assets/audio',
            'assets/video',
            'logs'
        ]
        
        for directorio in directorios:
            path = Path(directorio)
            if not path.exists():
                path.mkdir(parents=True, exist_ok=True)
                logger.info(f"📁 Directorio creado: {directorio}")
    
    def cargar_json(self, nombre_archivo, usar_cache=True):
        """Cargar datos de un archivo JSON con sistema de caché"""
        if usar_cache and nombre_archivo in self.cache:
            if nombre_archivo in self.last_cache_update:
                tiempo_cache = datetime.now().timestamp() - self.last_cache_update[nombre_archivo]
                if tiempo_cache < self.cache_timeout:
                    return self.cache[nombre_archivo].copy()
        
        ruta = os.path.join(self.data_dir, f"{nombre_archivo}.json")
        
        if not os.path.exists(ruta):
            logger.warning(f"⚠️ Archivo no encontrado: {nombre_archivo}.json")
            return {}
        
        try:
            with self.lock:
                with open(ruta, 'r', encoding='utf-8') as f:
                    datos = json.load(f)
                
                if usar_cache:
                    self.cache[nombre_archivo] = datos.copy()
                    self.last_cache_update[nombre_archivo] = datetime.now().timestamp()
                
                return datos
                
        except json.JSONDecodeError as e:
            logger.error(f"❌ Error al decodificar {nombre_archivo}.json: {str(e)}")
            return self._recuperar_desde_backup(nombre_archivo)
        except Exception as e:
            logger.error(f"❌ Error al cargar {nombre_archivo}.json: {str(e)}")
            return {}
    
    def guardar_json(self, nombre_archivo, datos, actualizar_cache=True):
        """Guardar datos en un archivo JSON con respaldo automático"""
        ruta = os.path.join(self.data_dir, f"{nombre_archivo}.json")
        temp_ruta = os.path.join(self.data_dir, f"{nombre_archivo}.temp")
        
        try:
            if not isinstance(datos, dict):
                raise ValueError("Los datos deben ser un diccionario")
            
            if os.path.exists(ruta):
                self._crear_backup(nombre_archivo)
            
            with self.lock:
                with open(temp_ruta, 'w', encoding='utf-8') as f:
                    json.dump(datos, f, indent=2, ensure_ascii=False, sort_keys=True)
                
                shutil.move(temp_ruta, ruta)
            
            if actualizar_cache:
                self.cache[nombre_archivo] = datos.copy()
                self.last_cache_update[nombre_archivo] = datetime.now().timestamp()
            
            logger.info(f"✅ Archivo guardado: {nombre_archivo}.json")
            return True
                    
        except Exception as e:
            logger.error(f"❌ Error al guardar {nombre_archivo}.json: {str(e)}")
            if os.path.exists(temp_ruta):
                os.remove(temp_ruta)
            return False
    
    def _crear_backup(self, nombre_archivo):
        """Crear respaldo de un archivo específico"""
        try:
            backup_dir = os.path.join(self.data_dir, 'backups')
            if not os.path.exists(backup_dir):
                os.makedirs(backup_dir)
            
            ruta_original = os.path.join(self.data_dir, f"{nombre_archivo}.json")
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_ruta = os.path.join(backup_dir, f"{nombre_archivo}_{timestamp}.json")
            
            shutil.copy2(ruta_original, backup_ruta)
            self._limpiar_backups_antiguos(nombre_archivo, max_backups=10)
            logger.info(f"💾 Backup creado: {backup_ruta}")
            
        except Exception as e:
            logger.warning(f"⚠️ Error al crear backup de {nombre_archivo}: {str(e)}")
    
    def _limpiar_backups_antiguos(self, nombre_archivo, max_backups=10):
        """Eliminar backups antiguos manteniendo solo los más recientes"""
        backup_dir = os.path.join(self.data_dir, 'backups')
        if not os.path.exists(backup_dir):
            return
        
        backups = sorted([
            f for f in os.listdir(backup_dir)
            if f.startswith(nombre_archivo) and f.endswith('.json')
        ], key=lambda x: os.path.getmtime(os.path.join(backup_dir, x)), reverse=True)
        
        if len(backups) > max_backups:
            for backup_antiguo in backups[max_backups:]:
                ruta_backup = os.path.join(backup_dir, backup_antiguo)
                os.remove(ruta_backup)
                logger.info(f"🗑️ Backup eliminado: {backup_antiguo}")
    
    def _recuperar_desde_backup(self, nombre_archivo):
        """Intentar recuperar datos desde el backup más reciente"""
        backup_dir = os.path.join(self.data_dir, 'backups')
        if not os.path.exists(backup_dir):
            return {}
        
        backups = sorted([
            f for f in os.listdir(backup_dir)
            if f.startswith(nombre_archivo) and f.endswith('.json')
        ], key=lambda x: os.path.getmtime(os.path.join(backup_dir, x)), reverse=True)
        
        for backup in backups:
            try:
                ruta_backup = os.path.join(backup_dir, backup)
                with open(ruta_backup, 'r', encoding='utf-8') as f:
                    datos = json.load(f)
                logger.info(f"🔄 Datos recuperados desde backup: {backup}")
                self.guardar_json(nombre_archivo, datos)
                return datos
            except Exception as e:
                logger.error(f"❌ Error al leer backup {backup}: {str(e)}")
                continue
        
        logger.error(f"❌ No se encontraron backups válidos para {nombre_archivo}")
        return {}
    
    def _hash_contraseña_seguro(self, contraseña):
        """Hashear contraseña de manera segura con salt"""
        salt = secrets.token_hex(16)
        return hashlib.sha256((contraseña + salt).encode()).hexdigest()
    
    def inicializar_datos(self):
        """Inicializar datos por defecto si los archivos no existen - SIN CREDENCIALES DE PRUEBA"""
        ahora = datetime.now().isoformat()
        
        archivos_iniciales = {
            'usuarios': {
                "usuarios": [],
                "ultimo_id": 0
            },
            'administradores': {
                "administradores": [],
                "ultimo_id": 0
            },
            'versiculos': {
                "versiculos": [
                    {
                        "id": 1,
                        "texto": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
                        "referencia": "Juan 3:16",
                        "tipo": "promesa"
                    },
                    {
                        "id": 2,
                        "texto": "Jehová es mi pastor; nada me faltará.",
                        "referencia": "Salmos 23:1",
                        "tipo": "salmo"
                    },
                    {
                        "id": 3,
                        "texto": "Todo lo puedo en Cristo que me fortalece.",
                        "referencia": "Filipenses 4:13",
                        "tipo": "promesa"
                    },
                    {
                        "id": 4,
                        "texto": "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.",
                        "referencia": "Mateo 6:33",
                        "tipo": "versiculo"
                    },
                    {
                        "id": 5,
                        "texto": "Jehová te bendiga, y te guarde; Jehová haga resplandecer su rostro sobre ti, y tenga de ti misericordia.",
                        "referencia": "Números 6:24-25",
                        "tipo": "bendicion"
                    },
                    {
                        "id": 6,
                        "texto": "El Señor es mi luz y mi salvación; ¿de quién temeré? El Señor es la fortaleza de mi vida; ¿de quién he de atemorizarme?",
                        "referencia": "Salmos 27:1",
                        "tipo": "salmo"
                    },
                    {
                        "id": 7,
                        "texto": "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.",
                        "referencia": "Jeremías 29:11",
                        "tipo": "promesa"
                    }
                ],
                "versiculo_actual": None,
                "ultimo_id": 7
            },
            'noticias': {
                "noticias": [
                    {
                        "id": 1,
                        "titulo": "Bienvenidos a IPUC LA FONDA",
                        "contenido": "Bienvenidos a nuestra plataforma digital. Aquí encontrarán información de nuestra iglesia, horarios de cultos, eventos, noticias y más.",
                        "imagen": "",
                        "autor_id": 0,
                        "autor_nombre": "Sistema",
                        "fecha_publicacion": ahora,
                        "fecha_actualizacion": ahora,
                        "estado": "publicado",
                        "categoria": "General",
                        "comentarios": [],
                        "reacciones": {"me_gusta": 0, "amen": 0, "bendiciones": 0, "aleluya": 0}
                    }
                ],
                "ultimo_id": 1
            },
            'eventos': {
                "eventos": [],
                "ultimo_id": 0
            },
            'asistencia': {
                "registros": [],
                "ultimo_id": 0
            },
            'mensajes': {
                "mensajes": [],
                "ultimo_id": 0
            },
            'notificaciones': {
                "notificaciones": [],
                "ultimo_id": 0
            },
            'estadisticas': {
                "asistencia": {
                    "diario": 0,
                    "mensual": 0,
                    "anual": 0,
                    "total": 0,
                    "ultima_actualizacion": ahora
                },
                "usuarios": {
                    "total": 0,
                    "activos": 0,
                    "nuevos_mes": 0,
                    "ultima_actualizacion": ahora
                },
                "crecimiento": {
                    "porcentaje": 0,
                    "historico": []
                }
            },
            'actividad': {
                "registros": [],
                "ultimo_id": 0
            },
            'encuestas': {
                "encuestas": [],
                "ultimo_id": 0
            },
            'peticiones': {
                "peticiones": [],
                "ultimo_id": 0
            },
            'insignias': {
                "insignias": [
                    {"id": 1, "nombre": "Nuevo Miembro", "icono": "bx-user-plus", "color": "#2196f3"},
                    {"id": 2, "nombre": "Miembro Activo", "icono": "bx-star", "color": "#ff9800"},
                    {"id": 3, "nombre": "Líder", "icono": "bx-crown", "color": "#ffd700"},
                    {"id": 4, "nombre": "Maestro", "icono": "bx-book", "color": "#4caf50"},
                    {"id": 5, "nombre": "Músico", "icono": "bx-music", "color": "#9c27b0"},
                    {"id": 6, "nombre": "Evangelista", "icono": "bx-bible", "color": "#f44336"},
                    {"id": 7, "nombre": "Administrador", "icono": "bx-shield", "color": "#607d8b"},
                    {"id": 8, "nombre": "Cuenta Verificada", "icono": "bx-badge-check", "color": "#2196f3"},
                    {"id": 9, "nombre": "Servidor Destacado", "icono": "bx-heart", "color": "#e91e63"}
                ],
                "ultimo_id": 9
            },
            'comentarios': {
                "comentarios": [],
                "ultimo_id": 0
            },
            'reacciones': {
                "reacciones": [],
                "ultimo_id": 0
            },
            'horarios': {
                "cultos": [
                    {"dia": "Lunes", "cultos": []},
                    {"dia": "Martes", "cultos": [{"nombre": "Culto de Oración", "inicio": "18:00", "fin": "20:30"}]},
                    {"dia": "Miércoles", "cultos": [{"nombre": "Culto Campal", "inicio": "16:00", "fin": "19:00"}]},
                    {"dia": "Jueves", "cultos": [{"nombre": "Culto de Refrán", "inicio": "16:00", "fin": "19:00"}]},
                    {"dia": "Viernes", "cultos": [{"nombre": "Culto de Jóvenes", "inicio": "18:00", "fin": "20:30"}]},
                    {"dia": "Sábado", "cultos": []},
                    {"dia": "Domingo", "cultos": [{"nombre": "Culto Dominical", "inicio": "10:00", "fin": "12:00"}]}
                ]
            },
            'biblioteca': {
                "recursos": [],
                "ultimo_id": 0
            },
            'galeria': {
                "albumes": [],
                "ultimo_id": 0
            },
            'configuracion': {
                "iglesia": {
                    "nombre": "IPUC LA FONDA",
                    "lema": "Donde el Espíritu Santo se mueve",
                    "direccion": "",
                    "telefono": "",
                    "correo": "",
                    "facebook": "",
                    "instagram": "",
                    "youtube": ""
                },
                "aplicacion": {
                    "version": "2.1.0",
                    "modo_mantenimiento": False,
                    "registro_abierto": True,
                    "primer_administrador_creado": False,
                    "colores": {
                        "primario": "#1a237e",
                        "secundario": "#ffd700",
                        "fondo_claro": "#ffffff",
                        "fondo_oscuro": "#121212"
                    }
                }
            }
        }
        
        logger.info("🚀 Inicializando base de datos de IPUC LA FONDA...")
        archivos_creados = 0
        
        for nombre_archivo, datos in archivos_iniciales.items():
            ruta = os.path.join(self.data_dir, f"{nombre_archivo}.json")
            if not os.path.exists(ruta):
                self.guardar_json(nombre_archivo, datos)
                archivos_creados += 1
                logger.info(f"✅ Archivo creado: {nombre_archivo}.json")
            else:
                logger.info(f"📄 Archivo existente: {nombre_archivo}.json")
        
        logger.info(f"🎉 Inicialización completada. {archivos_creados} archivos nuevos creados.")
        
        logger.warning("=" * 60)
        logger.warning("⚠️  IMPORTANTE: No se han creado credenciales por defecto")
        logger.warning("⚠️  El sistema NO tiene usuarios ni administradores predefinidos")
        logger.warning("⚠️  Debe crear el primer administrador mediante la API")
        logger.warning("=" * 60)
    
    def crear_primer_administrador(self, datos_admin):
        """Crear el primer administrador de la plataforma
        Args:
            datos_admin: Diccionario con nombre, apellidos, correo, usuario, password
        Returns:
            True si se creó correctamente, False en caso contrario
        """
        try:
            admins = self.cargar_json('administradores')
            if admins.get('administradores', []):
                logger.warning("⚠️ Ya existe al menos un administrador")
                return False
            
            campos_requeridos = ['nombre', 'apellidos', 'correo', 'usuario', 'password']
            for campo in campos_requeridos:
                if campo not in datos_admin or not datos_admin[campo]:
                    logger.error(f"❌ Campo requerido faltante: {campo}")
                    return False
            
            password_hash = self._hash_contraseña_seguro(datos_admin['password'])
            
            admin = {
                "id": 1,
                "nombre": datos_admin['nombre'].strip(),
                "apellidos": datos_admin['apellidos'].strip(),
                "documento": datos_admin.get('documento', '').strip(),
                "fecha_nacimiento": datos_admin.get('fecha_nacimiento', ''),
                "sexo": datos_admin.get('sexo', ''),
                "correo": datos_admin['correo'].strip().lower(),
                "celular": datos_admin.get('celular', '').strip(),
                "direccion": datos_admin.get('direccion', '').strip(),
                "ministerio": datos_admin.get('ministerio', 'Pastoral'),
                "usuario": datos_admin['usuario'].strip().lower(),
                "password": password_hash,
                "foto": "assets/avatars/admin_default.png",
                "rol": "admin",
                "verificado": True,
                "fecha_registro": datetime.now().isoformat(),
                "ultima_conexion": datetime.now().isoformat(),
                "estado": "activo",
                "insignias": ["Administrador", "Cuenta Verificada"],
                "intentos_fallidos": 0,
                "bloqueado_hasta": None
            }
            
            admins['administradores'].append(admin)
            admins['ultimo_id'] = 1
            
            if self.guardar_json('administradores', admins):
                config = self.cargar_json('configuracion')
                config['aplicacion']['primer_administrador_creado'] = True
                self.guardar_json('configuracion', config)
                logger.info(f"✅ Primer administrador creado: {admin['usuario']}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"❌ Error al crear administrador: {str(e)}")
            return False
    
    def hacer_backup_completo(self):
        """Crear respaldo completo de toda la base de datos"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_dir = os.path.join(self.data_dir, 'backups', 'completos', f"completo_{timestamp}")
        
        try:
            os.makedirs(backup_dir, exist_ok=True)
            archivos_respaldados = 0
            for archivo in os.listdir(self.data_dir):
                if archivo.endswith('.json'):
                    ruta_original = os.path.join(self.data_dir, archivo)
                    ruta_backup = os.path.join(backup_dir, archivo)
                    shutil.copy2(ruta_original, ruta_backup)
                    archivos_respaldados += 1
            
            metadata = {
                "fecha_backup": datetime.now().isoformat(),
                "archivos_respaldados": archivos_respaldados,
                "version": "2.1.0",
                "tamaño_total": sum(os.path.getsize(os.path.join(self.data_dir, f))
                                   for f in os.listdir(self.data_dir) if f.endswith('.json'))
            }
            with open(os.path.join(backup_dir, 'metadata.json'), 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
            
            backups_dir = os.path.join(self.data_dir, 'backups', 'completos')
            backups = sorted([
                d for d in os.listdir(backups_dir)
                if d.startswith('completo_') and os.path.isdir(os.path.join(backups_dir, d))
            ], key=lambda x: os.path.getmtime(os.path.join(backups_dir, x)), reverse=True)
            
            if len(backups) > 10:
                for backup_antiguo in backups[10:]:
                    ruta_backup_antiguo = os.path.join(backups_dir, backup_antiguo)
                    shutil.rmtree(ruta_backup_antiguo)
                    logger.info(f"🗑️ Backup completo eliminado: {backup_antiguo}")
            
            logger.info(f"✅ Backup completo creado: {backup_dir} ({archivos_respaldados} archivos)")
            return backup_dir
        except Exception as e:
            logger.error(f"❌ Error al crear backup completo: {str(e)}")
            return None
    
    def optimizar_json(self, nombre_archivo):
        """Optimizar y limpiar archivo JSON"""
        try:
            datos = self.cargar_json(nombre_archivo)
            if datos:
                datos = self._limpiar_datos_vacios(datos)
                return self.guardar_json(nombre_archivo, datos)
            return False
        except Exception as e:
            logger.error(f"❌ Error al optimizar {nombre_archivo}.json: {str(e)}")
            return False
    
    def _limpiar_datos_vacios(self, datos):
        """Limpiar datos vacíos recursivamente"""
        if isinstance(datos, dict):
            return {k: v for k, v in ((k, self._limpiar_datos_vacios(v)) for k, v in datos.items())
                    if v is not None and v != [] and v != {} and v != ""}
        elif isinstance(datos, list):
            return [self._limpiar_datos_vacios(item) for item in datos
                    if item is not None and item != [] and item != {} and item != ""]
        return datos
    
    def obtener_estadisticas_db(self):
        """Obtener estadísticas de la base de datos"""
        stats = {
            "total_archivos": 0,
            "tamaño_total_kb": 0,
            "archivos": {},
            "backups": {"total": 0, "tamaño_total_kb": 0}
        }
        
        for archivo in os.listdir(self.data_dir):
            if archivo.endswith('.json'):
                ruta = os.path.join(self.data_dir, archivo)
                tamaño = os.path.getsize(ruta) / 1024
                stats["total_archivos"] += 1
                stats["tamaño_total_kb"] += tamaño
                stats["archivos"][archivo] = {
                    "tamaño_kb": round(tamaño, 2),
                    "modificado": datetime.fromtimestamp(os.path.getmtime(ruta)).isoformat()
                }
        
        backup_dir = os.path.join(self.data_dir, 'backups')
        if os.path.exists(backup_dir):
            for backup in os.listdir(backup_dir):
                if backup.endswith('.json'):
                    ruta_backup = os.path.join(backup_dir, backup)
                    stats["backups"]["total"] += 1
                    stats["backups"]["tamaño_total_kb"] += os.path.getsize(ruta_backup) / 1024
        
        stats["tamaño_total_kb"] = round(stats["tamaño_total_kb"], 2)
        stats["backups"]["tamaño_total_kb"] = round(stats["backups"]["tamaño_total_kb"], 2)
        return stats
    
    def reparar_json(self, nombre_archivo):
        """Intentar reparar un archivo JSON corrupto"""
        ruta = os.path.join(self.data_dir, f"{nombre_archivo}.json")
        if not os.path.exists(ruta):
            return False, "Archivo no encontrado"
        
        try:
            with open(ruta, 'r', encoding='utf-8') as f:
                contenido = f.read()
            json.loads(contenido)
            return True, "El archivo parece estar bien"
        except json.JSONDecodeError as e:
            logger.warning(f"⚠️ Reparando JSON: {nombre_archivo}.json - {str(e)}")
            datos_recuperados = self._recuperar_desde_backup(nombre_archivo)
            if datos_recuperados:
                return True, "Archivo recuperado desde backup"
            else:
                self.guardar_json(nombre_archivo, {})
                return True, "Archivo recreado (vacío) - Se perdieron los datos"
    
    def limpiar_cache(self):
        """Limpiar la caché en memoria"""
        self.cache.clear()
        self.last_cache_update.clear()
        logger.info("🧹 Caché limpiada")
    
    def get_ultimo_id(self, nombre_archivo, campo_id="id"):
        """Obtener el último ID usado en un archivo"""
        datos = self.cargar_json(nombre_archivo)
        for key, value in datos.items():
            if isinstance(value, list):
                if value and all(isinstance(item, dict) and campo_id in item for item in value):
                    ids = [item[campo_id] for item in value if campo_id in item]
                    if ids:
                        return max(ids)
        return 0
    
    def generar_nuevo_id(self, nombre_archivo, campo_id="id"):
        """Generar un nuevo ID único para un archivo"""
        ultimo_id = self.get_ultimo_id(nombre_archivo, campo_id)
        return ultimo_id + 1
    
    def agregar_registro(self, nombre_archivo, registro, campo_id="id"):
        """Agregar un nuevo registro a un archivo"""
        try:
            datos = self.cargar_json(nombre_archivo)
            for key, value in datos.items():
                if isinstance(value, list):
                    if value and all(isinstance(item, dict) for item in value):
                        if campo_id not in registro:
                            registro[campo_id] = self.generar_nuevo_id(nombre_archivo, campo_id)
                        elif registro[campo_id] == 0:
                            registro[campo_id] = self.generar_nuevo_id(nombre_archivo, campo_id)
                        ids_existentes = [item[campo_id] for item in value if campo_id in item]
                        if registro[campo_id] in ids_existentes:
                            registro[campo_id] = max(ids_existentes) + 1
                        value.append(registro)
                        return self.guardar_json(nombre_archivo, datos)
            for key in datos.keys():
                if isinstance(datos[key], list):
                    datos[key].append(registro)
                    return self.guardar_json(nombre_archivo, datos)
            return False
        except Exception as e:
            logger.error(f"❌ Error al agregar registro: {str(e)}")
            return False

if __name__ == "__main__":
    db = Database()
    db.inicializar_datos()
    print("\n📊 Estadísticas de la base de datos:")
    stats = db.obtener_estadisticas_db()
    print(json.dumps(stats, indent=2, ensure_ascii=False))
    print("\n⚠️  IMPORTANTE: No existen credenciales por defecto.")
    print("ℹ️  Para crear el primer administrador, use:")
    print("    db.crear_primer_administrador({...})")
               