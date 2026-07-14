# 🏛️ IPUC LA FONDA - Web App Institucional

![IPUC LA FONDA](ipuclafonda.png)

[![Version](https://img.shields.io/badge/version-5.1-blue.svg)](https://github.com/tu-repo/ipuc-la-fonda)
[![PWA](https://img.shields.io/badge/PWA-Instalable-purple.svg)](https://web.dev/progressive-web-apps/)
[![Netlify](https://img.shields.io/badge/deploy-Netlify-00C7B7.svg)](https://www.netlify.com/)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/javascript-ES6+-f7df1e.svg)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/css-3-blue.svg)](https://developer.mozilla.org/es/docs/Web/CSS)
[![HTML5](https://img.shields.io/badge/html-5-orange.svg)](https://developer.mozilla.org/es/docs/Web/HTML)

---

## 📖 Descripción

Web App institucional de nivel empresarial para **IPUC LA FONDA** (Iglesia Pentecostal Unida de Colombia). Una plataforma moderna, elegante, segura y completamente funcional para la administración de la congregación, diseñada para facilitar la comunicación, gestión y crecimiento espiritual de la iglesia.

> **"Donde el Espíritu Santo se mueve"**

---

## ✨ Características Principales

### 🔐 Seguridad y Autenticación
- **Autenticación completa** con roles diferenciados (Usuario/Administrador/Invitado)
- **Sin credenciales por defecto** - Configuración inicial completamente segura
- **Bloqueo por IP** tras 5 intentos fallidos (15 minutos de bloqueo)
- **Encriptación de contraseñas** con hash personalizado + salt
- **Sesiones con token** de 24 horas de duración
- **Verificación de cuentas** con distintivo azul propio de IPUC LA FONDA
- **Registro de actividad** completa de todos los usuarios
- **Protección contra fuerza bruta** en inicio de sesión

### ⏰ Sistema de Cultos
- **Contador regresivo inteligente** para cultos en tiempo real
- **Horarios completos** de todos los cultos semanales
- **Estado del culto**: Próximo, En Curso, Finalizado
- **Notificaciones automáticas** de inicio de culto

| Día | Culto | Horario |
|-----|-------|---------|
| Lunes | Sin culto | - |
| Martes | Culto de Oración | 6:00 PM - 8:30 PM |
| Miércoles | Culto Campal | 4:00 PM - 7:00 PM |
| Jueves | Culto de Refrán | 4:00 PM - 7:00 PM |
| Viernes | Culto de Jóvenes | 6:00 PM - 8:30 PM |
| Sábado | Sin culto | - |
| Domingo | Culto Dominical | 10:00 AM - 12:00 PM |

### 💬 Comunicación y Comunidad
- **Sistema de mensajería** interno entre miembros
- **Chat en tiempo real** con indicadores de estado
- **Notificaciones push** para eventos y anuncios importantes
- **Peticiones de oración** con contador de personas orando
- **Comentarios y reacciones** en noticias y publicaciones
- **Sistema de insignias** para miembros destacados
- **Directorio de miembros** con búsqueda y filtros

### 📊 Gestión y Administración
- **Dashboard de estadísticas** con indicadores clave
- **Sistema de asistencia** con registro y seguimiento
- **Confirmación de asistencia**: Voy, Tal vez, No asistiré
- **Biblioteca digital** de recursos cristianos
- **Galería de eventos** y actividades
- **Sistema de encuestas** para la congregación
- **Gestión de versículos diarios**
- **Panel de administración** completo

### 📱 Devocional y Espiritualidad
- **Versículo del día** con cambio automático
- **Devocional diario** para reflexión
- **Promesas, Salmos y Bendiciones** categorizados
- **Compartir versículos** en redes sociales

### 🎨 Diseño y Experiencia de Usuario
- **Diseño Material Design** con Glassmorphism
- **Modo oscuro/claro** personalizable
- **Animaciones fluidas** con transiciones elegantes
- **Iconografía moderna** con Boxicons
- **Skeleton loading** para mejor experiencia de carga
- **Breadcrumb** para navegación intuitiva
- **Botón flotante (FAB)** para acciones rápidas

### 📱 Tecnologías PWA (Progressive Web App)
- **Instalable** como aplicación nativa en Android, iOS, Windows y macOS
- **Funcionamiento offline** con Service Worker
- **Sincronización en segundo plano**
- **Notificaciones push** nativas
- **Atajos rápidos** (Shortcuts) en la pantalla de inicio
- **Responsive** para todos los dispositivos

---

## 📂 Estructura del Proyecto
IPUC-LA-FONDA/
├── index.html # Página principal de la aplicación
├── styles.css # Estilos completos (claro/oscuro)
├── database.js # Gestión de base de datos (localStorage)
├── app.js # Lógica principal de la aplicación
├── script.js # UI y eventos de la aplicación
├── manifest.json # Configuración PWA
├── service-worker.js # Service Worker para offline
├── ipuclafonda.png # Logo principal de la iglesia
├── favicon.ico # Icono del sitio
├── assets/
│ ├── avatars/
│ │ ├── default.png # Avatar por defecto
│ │ └── admin.png # Avatar de administrador
│ ├── icons/
│ │ ├── favicon-16x16.png
│ │ ├── favicon-32x32.png
│ │ ├── icon-144x144.png
│ │ ├── icon-192x192.png
│ │ ├── icon-512x512.png
│ │ ├── apple-touch-icon.png
│ │ └── safari-pinned-tab.svg
│ └── screenshots/
│ ├── desktop-home.png
│ ├── mobile-home.png
│ ├── mobile-publications.png
│ └── mobile-events.png
└── README.md # Documentación del proyecto

---

## 🚀 Instalación y Despliegue

### Requisitos Previos
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (para la primera carga)
- Opcional: Servidor web para despliegue

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/ipuc-la-fonda.git
cd ipuc-la-fonda
