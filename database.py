# database.py - Gestión de Base de Datos JSON IPUC LA FONDA v2.0
import json
import os
import shutil
from datetime import datetime
import threading

class Database:
    def __init__(self, data_dir='data'):
        self.data_dir = data_dir
        self.lock = threading.Lock()
        self.asegurar_directorios()
    
    def asegurar_directorios(self):
        """Crear directorios necesarios si no existen"""
        directorios = [
            'data',
            'data/backups',
            'assets',
            'assets/img',
            'assets/icons',
            'assets/logo',
            'assets/backgrounds',
            'assets/avatars',
            'assets/audio'
        ]
        
        for directorio in directorios:
            if not os.path.exists(directorio):
                os.makedirs(directorio)
                print(f"📁 Directorio creado: {directorio}")
    
    def cargar_json(self, nombre_archivo):
        """Cargar datos de un archivo JSON con manejo de errores"""
        ruta = os.path.join(self.data_dir, f"{nombre_archivo}.json")
        
        if not os.path.exists(ruta):
            print(f"⚠️ Archivo no encontrado: {nombre_archivo}.json")
            return {}
        
        try:
            with self.lock:
                with open(ruta, 'r', encoding='utf-8') as f:
                    datos = json.load(f)
                    return datos
        except json.JSONDecodeError as e:
            print(f"❌ Error al decodificar {nombre_archivo}.json: {str(e)}")
            return self.recuperar_desde_backup(nombre_archivo)
        except Exception as e:
            print(f"❌ Error al cargar {nombre_archivo}.json: {str(e)}")
            return {}
    
    def guardar_json(self, nombre_archivo, datos):
        """Guardar datos en un archivo JSON con respaldo automático"""
        ruta = os.path.join(self.data_dir, f"{nombre_archivo}.json")
        
        try:
            if os.path.exists(ruta):
                self._crear_backup(nombre_archivo)
            
            with self.lock:
                with open(ruta, 'w', encoding='utf-8') as f:
                    json.dump(datos, f, indent=2, ensure_ascii=False)
                    
        except Exception as e:
            print(f"❌ Error al guardar {nombre_archivo}.json: {str(e)}")
            raise
    
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
            
            self._limpiar_backups_antiguos(nombre_archivo, max_backups=5)
            
        except Exception as e:
            print(f"⚠️ Error al crear backup de {nombre_archivo}: {str(e)}")
    
    def _limpiar_backups_antiguos(self, nombre_archivo, max_backups=5):
        """Eliminar backups antiguos manteniendo solo los más recientes"""
        backup_dir = os.path.join(self.data_dir, 'backups')
        if not os.path.exists(backup_dir):
            return
        
        backups = sorted([
            f for f in os.listdir(backup_dir)
            if f.startswith(nombre_archivo) and f.endswith('.json')
        ])
        
        if len(backups) > max_backups:
            for backup_antiguo in backups[:-max_backups]:
                ruta_backup = os.path.join(backup_dir, backup_antiguo)
                os.remove(ruta_backup)
    
    def recuperar_desde_backup(self, nombre_archivo):
        """Intentar recuperar datos desde el backup más reciente"""
        backup_dir = os.path.join(self.data_dir, 'backups')
        if not os.path.exists(backup_dir):
            return {}
        
        backups = sorted([
            f for f in os.listdir(backup_dir)
            if f.startswith(nombre_archivo) and f.endswith('.json')
        ], reverse=True)
        
        for backup in backups:
            try:
                ruta_backup = os.path.join(backup_dir, backup)
                with open(ruta_backup, 'r', encoding='utf-8') as f:
                    datos = json.load(f)
                print(f"🔄 Datos recuperados desde backup: {backup}")
                self.guardar_json(nombre_archivo, datos)
                return datos
            except:
                continue
        
        print(f"❌ No se encontraron backups válidos para {nombre_archivo}")
        return {}
    
    def inicializar_datos(self):
        """Inicializar datos por defecto si los archivos no existen"""
        password_hash = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
        
        archivos_iniciales = {
            'usuarios': {
                "usuarios": [
                    {
                        "id": 1,
                        "nombre": "Usuario",
                        "apellidos": "Demo",
                        "documento": "123456789",
                        "fecha_nacimiento": "1990-01-01",
                        "sexo": "Masculino",
                        "correo": "usuario@ipuclafonda.org",
                        "celular": "3001234567",
                        "direccion": "Calle Principal #123",
                        "ministerio": "Jóvenes",
                        "usuario": "usuario",
                        "password": password_hash,
                        "foto": "assets/avatars/default.png",
                        "rol": "usuario",
                        "verificado": False,
                        "fecha_registro": datetime.now().isoformat(),
                        "ultima_conexion": datetime.now().isoformat(),
                        "estado": "activo",
                        "insignias": ["Nuevo Miembro"]
                    }
                ]
            },
            'administradores': {
                "administradores": [
                    {
                        "id": 1,
                        "nombre": "Administrador",
                        "apellidos": "Principal",
                        "documento": "987654321",
                        "fecha_nacimiento": "1985-01-01",
                        "sexo": "Masculino",
                        "correo": "admin@ipuclafonda.org",
                        "celular": "3009876543",
                        "direccion": "Avenida Iglesia #456",
                        "ministerio": "Pastoral",
                        "usuario": "admin",
                        "password": password_hash,
                        "foto": "assets/avatars/admin.png",
                        "rol": "admin",
                        "verificado": True,
                        "fecha_registro": datetime.now().isoformat(),
                        "ultima_conexion": datetime.now().isoformat(),
                        "estado": "activo",
                        "insignias": ["Administrador", "Cuenta Verificada"]
                    }
                ]
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
                "versiculo_actual": None
            },
            'noticias': {
                "noticias": [
                    {
                        "id": 1,
                        "titulo": "Bienvenidos a IPUC LA FONDA",
                        "contenido": "Nos complace darles la bienvenida a nuestra nueva plataforma digital. Aquí encontrarán toda la información de nuestra iglesia, horarios de cultos, eventos, noticias y mucho más.",
                        "imagen": "",
                        "autor_id": 1,
                        "autor_nombre": "Administrador",
                        "fecha_publicacion": datetime.now().isoformat(),
                        "fecha_actualizacion": datetime.now().isoformat(),
                        "estado": "publicado",
                        "categoria": "General",
                        "comentarios": [],
                        "reacciones": {"me_gusta": 0, "amen": 0, "bendiciones": 0, "aleluya": 0}
                    }
                ]
            },
            'eventos': {
                "eventos": [
                    {
                        "id": 1,
                        "titulo": "Culto de Acción de Gracias",
                        "descripcion": "Únete a nosotros para dar gracias a Dios por todas sus bendiciones.",
                        "fecha": datetime.now().strftime('%Y-%m-%d'),
                        "hora": "10:00 AM",
                        "lugar": "IPUC LA FONDA",
                        "imagen": "",
                        "organizador_id": 1,
                        "fecha_creacion": datetime.now().isoformat(),
                        "estado": "programado",
                        "cupos": 200,
                        "reservados": 0
                    }
                ]
            },
            'asistencia': {
                "registros": []
            },
            'mensajes': {
                "mensajes": []
            },
            'notificaciones': {
                "notificaciones": [
                    {
                        "id": 1,
                        "usuario_id": 1,
                        "titulo": "Bienvenido a IPUC LA FONDA",
                        "mensaje": "Gracias por unirte a nuestra plataforma. ¡Dios te bendiga!",
                        "fecha": datetime.now().isoformat(),
                        "leida": False,
                        "tipo": "bienvenida"
                    }
                ]
            },
            'estadisticas': {
                "asistencia": {
                    "diario": 0,
                    "mensual": 0,
                    "anual": 0,
                    "total": 0,
                    "ultima_actualizacion": datetime.now().isoformat()
                },
                "usuarios": {
                    "total": 1,
                    "activos": 1,
                    "nuevos_mes": 1,
                    "ultima_actualizacion": datetime.now().isoformat()
                },
                "crecimiento": {
                    "porcentaje": 0,
                    "historico": []
                }
            },
            'actividad': {
                "registros": []
            },
            'encuestas': {
                "encuestas": []
            },
            'peticiones': {
                "peticiones": []
            },
            'insignias': {
                "insignias": [
                    {"id": 1, "nombre": "Nuevo Miembro", "icono": "bx-user-plus", "color": "#2196f3", "descripcion": "Recién llegado a la congregación"},
                    {"id": 2, "nombre": "Miembro Activo", "icono": "bx-star", "color": "#ff9800", "descripcion": "Participa activamente en la iglesia"},
                    {"id": 3, "nombre": "Líder", "icono": "bx-crown", "color": "#ffd700", "descripcion": "Líder de ministerio"},
                    {"id": 4, "nombre": "Maestro", "icono": "bx-book", "color": "#4caf50", "descripcion": "Maestro de Escuela Dominical"},
                    {"id": 5, "nombre": "Músico", "icono": "bx-music", "color": "#9c27b0", "descripcion": "Parte del ministerio de alabanza"},
                    {"id": 6, "nombre": "Evangelista", "icono": "bx-bible", "color": "#f44336", "descripcion": "Predicador del evangelio"},
                    {"id": 7, "nombre": "Administrador", "icono": "bx-shield", "color": "#607d8b", "descripcion": "Administrador de la plataforma"},
                    {"id": 8, "nombre": "Cuenta Verificada", "icono": "bx-badge-check", "color": "#2196f3", "descripcion": "Cuenta verificada por IPUC LA FONDA"},
                    {"id": 9, "nombre": "Servidor Destacado", "icono": "bx-heart", "color": "#e91e63", "descripcion": "Servidor destacado de la iglesia"}
                ]
            },
            'comentarios': {
                "comentarios": []
            },
            'reacciones': {
                "reacciones": []
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
                "recursos": [
                    {
                        "id": 1,
                        "titulo": "Manual de Doctrina IPUC",
                        "descripcion": "Manual oficial de doctrina de la Iglesia Pentecostal Unida de Colombia",
                        "categoria": "Manuales",
                        "tipo": "pdf",
                        "url": "",
                        "fecha_subida": datetime.now().isoformat(),
                        "subido_por": 1
                    }
                ]
            },
            'galeria': {
                "albumes": []
            },
            'configuracion': {
                "iglesia": {
                    "nombre": "IPUC LA FONDA",
                    "lema": "Donde el Espíritu Santo se mueve",
                    "direccion": "Carrera XX #XX-XX",
                    "telefono": "+57 300 123 4567",
                    "correo": "contacto@ipuclafonda.org",
                    "facebook": "https://facebook.com/ipuclafonda",
                    "instagram": "https://instagram.com/ipuclafonda",
                    "youtube": "https://youtube.com/@ipuclafonda"
                },
                "aplicacion": {
                    "version": "2.0.0",
                    "modo_mantenimiento": False,
                    "registro_abierto": True,
                    "colores": {
                        "primario": "#1a237e",
                        "secundario": "#ffd700",
                        "fondo_claro": "#ffffff",
                        "fondo_oscuro": "#121212"
                    }
                }
            }
        }
        
        print("🚀 Inicializando base de datos de IPUC LA FONDA...")
        archivos_creados = 0
        
        for nombre_archivo, datos in archivos_iniciales.items():
            ruta = os.path.join(self.data_dir, f"{nombre_archivo}.json")
            if not os.path.exists(ruta):
                self.guardar_json(nombre_archivo, datos)
                archivos_creados += 1
                print(f"✅ Archivo creado: {nombre_archivo}.json")
            else:
                print(f"📄 Archivo existente: {nombre_archivo}.json")
        
        print(f"🎉 Inicialización completada. {archivos_creados} archivos nuevos creados.")
    
    def hacer_backup_completo(self):
        """Crear respaldo completo de toda la base de datos"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_dir = os.path.join(self.data_dir, 'backups', f"completo_{timestamp}")
        
        try:
            os.makedirs(backup_dir, exist_ok=True)
            
            archivos_respaldados = 0
            for archivo in os.listdir(self.data_dir):
                if archivo.endswith('.json'):
                    ruta_original = os.path.join(self.data_dir, archivo)
                    ruta_backup = os.path.join(backup_dir, archivo)
                    shutil.copy2(ruta_original, ruta_backup)
                    archivos_respaldados += 1
            
            # Mantener solo últimos 10 backups completos
            backups_dir = os.path.join(self.data_dir, 'backups')
            backups = sorted([
                d for d in os.listdir(backups_dir)
                if d.startswith('completo_') and os.path.isdir(os.path.join(backups_dir, d))
            ])
            
            if len(backups) > 10:
                for backup_antiguo in backups[:-10]:
                    ruta_backup_antiguo = os.path.join(backups_dir, backup_antiguo)
                    shutil.rmtree(ruta_backup_antiguo)
                    print(f"🗑️ Backup completo eliminado: {backup_antiguo}")
            
            print(f"✅ Backup completo creado: {backup_dir} ({archivos_respaldados} archivos)")
            return backup_dir
            
        except Exception as e:
            print(f"❌ Error al crear backup completo: {str(e)}")
            return None
    
    def optimizar_json(self, nombre_archivo):
        """Optimizar y limpiar archivo JSON"""
        try:
            datos = self.cargar_json(nombre_archivo)
            self.guardar_json(nombre_archivo, datos)
            print(f"✅ Archivo {nombre_archivo}.json optimizado")
            return True
        except Exception as e:
            print(f"❌ Error al optimizar {nombre_archivo}.json: {str(e)}")
            return False
    
    def obtener_estadisticas_db(self):
        """Obtener estadísticas de la base de datos"""
        stats = {
            "total_archivos": 0,
            "tamaño_total_kb": 0,
            "archivos": {}
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
        
        stats["tamaño_total_kb"] = round(stats["tamaño_total_kb"], 2)
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
            
        except json.JSONDecodeError:
            datos_recuperados = self.recuperar_desde_backup(nombre_archivo)
            if datos_recuperados:
                return True, "Archivo recuperado desde backup"
            else:
                self.guardar_json(nombre_archivo, {})
                return True, "Archivo recreado (vacío) - Se perdieron los datos"
