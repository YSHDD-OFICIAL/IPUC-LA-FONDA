# 🏛️ IPUC LA FONDA - Web App Institucional

![IPUC LA FONDA](assets/logo/logo.png)

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/tu-repo/ipuc-la-fonda)
[![Python](https://img.shields.io/badge/python-3.8+-green.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/flask-2.0+-red.svg)](https://flask.palletsprojects.com/)
[![PWA](https://img.shields.io/badge/PWA-Instalable-purple.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

## 📖 Descripción

Web App institucional de nivel empresarial para **IPUC LA FONDA** (Iglesia Pentecostal Unida de Colombia). Una plataforma moderna, elegante y completamente segura para la administración de la congregación, diseñada para facilitar la comunicación y gestión de la iglesia.

---

## ✨ Características Principales

### 🔐 Seguridad y Autenticación
- **Autenticación completa** con roles diferenciados (Usuario/Administrador)
- **Sin credenciales por defecto** - Configuración inicial segura
- **Bloqueo por IP** tras 5 intentos fallidos
- **Encriptación de contraseñas** con salt aleatorio
- **Sesiones con token JWT** (24 horas de duración)
- **Verificación de cuentas** con distintivo azul propio
- **Logs de actividad** completa de usuarios

### ⏰ Sistema de Cultos
- **Contador regresivo inteligente** para cultos en tiempo real
- **Horarios completos** de todos los cultos (Martes a Domingo)
- **Estado del culto**: Próximo, En Curso, Finalizado
- **Notificaciones automáticas** de inicio de culto

### 💬 Comunicación
- **Sistema de mensajería** interno en tiempo real
- **Notificaciones push** para eventos importantes
- **Peticiones de oración** con contador de oraciones
- **Comentarios y reacciones** en noticias
- **Sistema de insignias** para miembros destacados

### 📊 Gestión
- **Dashboard de estadísticas** con gráficos interactivos
- **Sistema de asistencia** con registro y seguimiento
- **Biblioteca digital** de recursos cristianos
- **Galería de eventos** y actividades
- **Directorio de miembros** con búsqueda

### 🎨 Diseño y Experiencia
- **Diseño Material Design** con Glassmorphism
- **Modo oscuro/claro** personalizable
- **Animaciones fluidas** con interacciones elegantes
- **Iconografía moderna** con Boxicons
- **Fuentes tipográficas** profesionales

### 📱 Tecnologías PWA
- **Instalable** en dispositivos móviles
- **Funcionamiento offline** con Service Worker
- **Sincronización en segundo plano**
- **Notificaciones push** nativas
- **Responsive** para todos los dispositivos

---

## 🚀 Instalación

### Requisitos Previos

- **Python 3.8** o superior
- **pip** (gestor de paquetes de Python)
- Navegador moderno (Chrome, Firefox, Edge, Safari)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/ipuc-la-fonda.git
cd ipuc-la-fonda
