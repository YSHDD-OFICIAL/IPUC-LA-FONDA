# database.py - Gestión de Base de Datos JSON
import json
import os
import shutil
from datetime import datetime

class Database:
    def __init__(self, data_dir='data'):
        self.data_dir = data_dir
        self.asegurar_directorios()
    
    def asegurar_directorios(self):
        """Crear directorios necesarios si no existen"""
        directorios = ['data', 'assets', 'assets/img', 'assets/icons', 
                      'assets/logo', 'assets/backgrounds', 'assets/avatars']
        
        for directorio in directorios:
            if not os.path.exists(directorio):
                os.makedirs(directorio)
    
    def cargar_json(self, nombre_archivo):
        """Cargar datos de un archivo JSON"""
        ruta = os.path.join(self.data_dir, f"{nombre_archivo}.json")
        
        if os.path.exists(ruta):
            try:
                with open(ruta, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                return {}
        return {}
    
    def guardar_json(self, nombre_archivo, datos):
        """Guardar datos en un archivo JSON"""
        ruta = os.path.join(self.data_dir, f"{nombre_archivo}.json")
        
        # Crear respaldo antes de guardar
        if os.path.exists(ruta):
            backup_dir = os.path.join(self.data_dir, 'backups')
            if not os.path.exists(backup_dir):
                os.makedirs(backup_dir)
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_ruta = os.path.join(backup_dir, f"{nombre_archivo}_{timestamp}.json")
            shutil.copy2(ruta, backup_ruta)
        
        with open(ruta, 'w', encoding='utf-8') as f:
            json.dump(datos, f, indent=2, ensure_ascii=False)
    
    def inicializar_datos(self):
        """Inicializar datos por defecto si los archivos no existen"""
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
                        "password": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
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
                        "password": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
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
                    {"texto": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", "referencia": "Juan 3:16", "tipo": "promesa"},
                    {"texto": "Jehová es mi pastor; nada me faltará.", "referencia": "Salmos 23:1", "tipo": "salmo"},
                    {"texto": "Todo lo puedo en Cristo que me fortalece.", "referencia": "Filipenses 4:13", "tipo": "promesa"},
                    {"texto": "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", "referencia": "Mateo 6:33", "tipo": "versiculo"},
                    {"texto": "Jehová te bendiga, y te guarde; Jehová haga resplandecer su rostro sobre ti, y tenga de ti misericordia.", "referencia": "Números 6:24-25", "tipo": "bendicion"}
                ],
                "versiculo_actual": None
            },
            'noticias': {
                "noticias": [
                    {
                        "id": 1,
                        "titulo": "Bienvenidos a IPUC LA FONDA",
                        "contenido": "Nos complace darles la bienvenida a nuestra nueva plataforma digital. Aquí encontrarán toda la información de nuestra iglesia.",
                        "imagen": "",
                        "autor_id": 1,
                        "fecha_publicacion": datetime.now().isoformat(),
                        "fecha_actualizacion": datetime.now().isoformat(),
                        "estado": "publicado",
                        "comentarios": [],
                        "reacciones": {"me_gusta": 0, "amen": 0, "bendiciones": 0}
                    }
                ]
            },
            'eventos': {"eventos": []},
            'asistencia': {"registros": []},
            'mensajes': {"mensajes": []},
            'notificaciones': {"notificaciones": []},
            'estadisticas': {"asistencia": {}, "usuarios": {}, "crecimiento": {}},
            'actividad': {"registros": []},
            'encuestas': {"encuestas": []},
            'configuracion': {
                "iglesia": {
                    "nombre": "IPUC LA FONDA",
                    "lema": "Donde el Espíritu Santo se mueve",
                    "direccion": "Carrera XX #XX-XX",
                    "telefono": "+57 300 123 4567",
                    "correo": "contacto@ipuclafonda.org"
                },
                "aplicacion": {
                    "version": "2.0.0",
                    "modo_mantenimiento": False,
                    "colores": {
                        "primario": "#1a237e",
                        "secundario": "#ffd700",
                        "fondo_claro": "#ffffff",
                        "fondo_oscuro": "#121212"
                    }
                }
            }
        }
        
        for nombre_archivo, datos in archivos_iniciales.items():
            if not os.path.exists(os.path.join(self.data_dir, f"{nombre_archivo}.json")):
                self.guardar_json(nombre_archivo, datos)
                print(f"✅ Archivo {nombre_archivo}.json creado con datos iniciales")
    
    def hacer_backup_completo(self):
        """Crear respaldo completo de la base de datos"""
        backup_dir = os.path.join(self.data_dir, 'backups', f"completo_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        os.makedirs(backup_dir)
        
        for archivo in os.listdir(self.data_dir):
            if archivo.endswith('.json'):
                ruta_original = os.path.join(self.data_dir, archivo)
                ruta_backup = os.path.join(backup_dir, archivo)
                shutil.copy2(ruta_original, ruta_backup)
        
        # Mantener solo últimos 10 backups
        backups = sorted([d for d in os.listdir(os.path.join(self.data_dir, 'backups')) 
                        if d.startswith('completo_')])
        
        if len(backups) > 10:
            for backup_antiguo in backups[:-10]:
                shutil.rmtree(os.path.join(self.data_dir, 'backups', backup_antiguo))
        
        print(f"✅ Backup completo creado en: {backup_dir}")
        return backup_dir
    
    def optimizar_json(self, nombre_archivo):
        """Optimizar y limpiar archivo JSON"""
        datos = self.cargar_json(nombre_archivo)
        self.guardar_json(nombre_archivo, datos)
        print(f"✅ Archivo {nombre_archivo}.json optimizado")