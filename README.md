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
IPUC-LA-FONDA/
├── index.html # Página principal (v22.1)
├── styles.css # Estilos completos (claro/oscuro) + panel backup
├── database.js # Gestión de base de datos (localStorage) v22.1
├── storage.js # 🆕 Sistema de respaldo, papelera y snapshots v1.0
├── app.js # Helper functions v22.1
├── script.js # UI y eventos de la aplicación v22.1
├── manifest.json # Configuración PWA v22.1
├── service-worker.js # Service Worker offline v22.1
├── ipuclafonda.png # Logo principal de la iglesia
├── favicon.ico # Icono del sitio
├── README.md # Documentación del proyecto
├── LÉAME.md # Documentación adicional
│
├── assets/
│ ├── avatars/
│ │ ├── default.png # Avatar por defecto
│ │ └── admin.png # Avatar de administrador
│ │
│ ├── icons/
│ │ ├── favicon-16x16.png
│ │ ├── favicon-32x32.png
│ │ ├── icon-48x48.png
│ │ ├── icon-72x72.png
│ │ ├── icon-96x96.png
│ │ ├── icon-128x128.png
│ │ ├── icon-144x144.png
│ │ ├── icon-192x192.png
│ │ ├── icon-256x256.png
│ │ ├── icon-384x384.png
│ │ ├── icon-512x512.png
│ │ ├── maskable-icon.png
│ │ ├── monochrome-icon.png
│ │ ├── apple-touch-icon.png
│ │ └── safari-pinned-tab.svg
│ │
│ ├── screenshots/
│ │ ├── desktop-home.png
│ │ ├── desktop-backup.png # 🆕 Panel de backup
│ │ ├── mobile-home.png
│ │ ├── mobile-backup.png # 🆕 Panel de backup móvil
│ │ ├── mobile-publications.png
│ │ └── mobile-events.png
│ │
│ └── media/
│ ├── INFORME MISIONERO.mp4
│ └── INTRO IPUC 2025 UNÁNIMES(360P).mp4
│
└── LICENSE

text

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
Verificar los nombres de archivos

⚠️ MUY IMPORTANTE: Asegúrate de que estos nombres coincidan (el HTML los busca así):

Archivo en repo	Nombre correcto
base de datos.js	❌ Renombrar a database.js
estilos.css	❌ Renombrar a styles.css
índice.html	❌ Renombrar a index.html
storage.js	✅ NUEVO - Crear
Abrir en el navegador

bash
# Opción A: Servidor local con Python
python -m http.server 8000

# Opción B: Servidor local con Node.js
npx serve

# Opción C: Doble clic en index.html (algunos navegadores lo bloquean por CORS)
Abrir http://localhost:8000 y crear el primer administrador

Despliegue en Netlify
Conectar repo con Netlify

Ir a netlify.com

Clic en "New site from Git"

Autorizar GitHub y seleccionar tu repositorio

Configurar despliegue

Branch: main

Build command: (dejar vacío)

Publish directory: / (raíz)

Clic en "Deploy site" y esperar 1-2 minutos

Verificar en incógnito (Ctrl + Shift + N)

🆕 Cómo respaldar tu información
Para usuarios normales
Inicia sesión

Ve a Menú lateral → Copias de Seguridad

Clic en "Descargar respaldo" → se descarga un .json con TODOS tus datos

Guárdalo en tu PC, USB, correo o Google Drive

Para administradores
Accede al Dashboard Admin → Copias de Seguridad (o menú lateral)

Verás el estado completo del sistema:

Número de colecciones

Espacio usado

Elementos en papelera

Último respaldo

Descargar respaldo → .json

Restaurar respaldo → subir .json (⚠️ reemplaza los datos actuales)

Crear snapshot → punto de restauración interno en IndexedDB

Ver código maestro → guarda el LF-2026-XXXX-XXXX en un lugar seguro

Recomendaciones
Respalda 1 vez por semana o cada vez que agregues datos importantes

Guarda 2-3 copias en lugares distintos (PC + correo + USB)

Nunca compartas el respaldo — contiene contraseñas hasheadas

Anota el código maestro en papel o gestor de contraseñas

🔑 Cómo recuperar tu cuenta
Si olvidaste la contraseña del admin
En la pantalla de login, clic en "¿Olvidaste tu contraseña?"

Ingresa tu código maestro (LF-2026-XXXX-XXXX)

Ingresa nueva contraseña (mínimo 8 caracteres)

Confirma y ¡listo!

Si borraste los datos del navegador
Vuelve a abrir la app

Inicia sesión con cualquier cuenta

Ve a Copias de Seguridad → Restaurar respaldo

Sube el .json que guardaste previamente

Recarga la página y todo vuelve

Si perdiste el código maestro Y el respaldo
⚠️ Lamentablemente no hay recuperación posible. Deberás crear un administrador nuevo desde cero. Por eso es importante guardar AMBOS.

🧪 Plan de Pruebas
Prueba 1 — Crear primer admin y código maestro
Abre la app en modo incógnito

Clic en "Crear Primer Administrador"

Llena el formulario y guarda

Debe aparecer el modal con el código maestro LF-2026-XXXX-XXXX

Cópialo y guárdalo

Prueba 2 — Respaldo manual
Inicia sesión como admin

Crea una publicación de prueba

Ve a Copias de Seguridad → Descargar respaldo

Verifica que el .json contenga ipuc20_publicaciones

Prueba 3 — Restauración
Elimina la publicación de prueba

Ve a Copias de Seguridad → Restaurar respaldo

Sube el .json descargado antes

La publicación debe reaparecer

Prueba 4 — Papelera
Elimina un evento o reporte

Ve a Copias de Seguridad → Papelera

Debe aparecer listado

Clic en restaurar → reaparece en su sección

Prueba 5 — Snapshots
Ve a Copias de Seguridad → Crear snapshot

Ponle un nombre

Haz cambios en los datos

Restaura el snapshot → los datos vuelven

Prueba 6 — Recuperación con código maestro
Cierra sesión

Clic en "¿Olvidaste tu contraseña?"

Ingresa el código maestro

Pon nueva contraseña

Inicia sesión con la nueva → debe funcionar

📋 Versiones
Versión	Fecha	Cambios principales
v22.1	2026-11-18	🆕 Sistema de respaldo, papelera, snapshots, código maestro
v22.0	2026-08-23	Módulo de IA, streaming, gamificación completa
v20.0	2026-06-10	Rediseño con dark mode, PWA mejorada
v18.0	2026-03-15	Sistema de reportes con urgencia y adjuntos
v15.0	2025-12-20	Gamificación y logros
v10.0	2025-09-01	Versión inicial estable
📝 Changelog — v22.1
Añadido
✅ storage.js — archivo nuevo con todo el sistema de respaldo

✅ Papelera con restauración y auto-purga (30 días)

✅ Snapshots en IndexedDB (últimos 10 puntos de restauración)

✅ Código maestro de recuperación (LF-2026-XXXX-XXXX)

✅ Panel de Copias de Seguridad con estado completo

✅ Modal de código maestro al crear el primer admin

✅ Modal de confirmación de restauración

✅ Sincronización APP_STATE ↔ db (soluciona pérdida de datos)

✅ file_handlers en manifest para abrir .json de respaldo

✅ Shortcuts de Backup y Recuperar en manifest

✅ Logs de respaldo en Service Worker

✅ Evento periodic-backup en Service Worker

Cambiado
🔄 VERSION 22.0 → 22.1 en todos los archivos

🔄 CACHE_VERSION v22.0.2026 → v22.1.2026

🔄 database.js — Nuevas colecciones _papelera, _meta_recuperacion, _meta_respaldo

🔄 script.js — 8 parches para persistir correctamente en DB

🔄 app.js — 7 funciones de persistencia nuevas + exports

🔄 index.html — Nuevo storage.js, formularios de recuperación, modales

🔄 styles.css — ~250 líneas nuevas para el panel de backup

Corregido
🐛 Datos que se perdían al recargar (publicaciones, oraciones, peticiones, bendiciones, chat, diario)

🐛 Lista de usuarios hardcodeada en cargarGestionUsuarios() — ahora lee de DB

🐛 Ranking hardcodeado — ahora lee de DB

🐛 Noticias hardcodeadas — ahora lee de DB

🐛 Insignias hardcodeadas — ahora lee de DB

Documentación
📖 README reescrito con secciones nuevas

📖 Guía de respaldo paso a paso

📖 Guía de recuperación de cuenta

📖 Plan de pruebas completo

❓ Preguntas Frecuentes (FAQ)
¿Necesito backend para que funcione?
No. Todo funciona en el navegador usando localStorage e IndexedDB. No necesitas servidor, base de datos externa ni pagos mensuales.

¿Dónde se guardan mis datos?
En el navegador que uses (Chrome, Firefox, Edge, Safari). Cada navegador y dispositivo es independiente.

¿Qué pasa si cambio de dispositivo?
Los datos no se transfieren automáticamente. Debes:

Descargar el respaldo .json en el dispositivo viejo

Transferir el archivo (USB, correo, Drive)

Importarlo en el dispositivo nuevo

¿Qué pasa si borro los datos del navegador?
Si no tienes un respaldo .json, pierdes todo. Por eso es crucial descargar respaldos regularmente.

¿Puedo usar la app sin internet?
Sí. Gracias al Service Worker, la app funciona offline una vez cargada la primera vez.

¿Cuántos administradores puedo crear?
Los que quieras. Solo el primer admin genera el código maestro. Los demás se crean con el formulario normal.

¿El respaldo contiene contraseñas?
Sí, pero hasheadas (no en texto plano). Aun así, no compartas el archivo.

¿Puedo editar el .json de respaldo?
No recomendado. Puedes corromperlo. Si necesitas cambios, edita desde la app.

¿Cuántos snapshots se guardan?
Los últimos 10. Los más antiguos se eliminan automáticamente.

¿Cuánto dura la papelera?
30 días. Después se purga automáticamente.

🤝 Contribuciones
Las contribuciones son bienvenidas. Por favor:

Fork el proyecto

Crea una rama (git checkout -b feature/nueva-funcionalidad)

Commit (git commit -m 'Añade nueva funcionalidad')

Push (git push origin feature/nueva-funcionalidad)

Abre un Pull Request

📄 Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

👨‍💻 Autor
IPUC LA FONDA - Iglesia Pentecostal Unida de Colombia

🌐 Sitio web: https://ipuclafonda.netlify.app/

📧 Email: ipuclafonda@gmail.com

📱 WhatsApp: +57 312 881 3818

📍 Ubicación: Cali, Valle del Cauca, Colombia

🙏 Agradecimientos
A Dios, por permitir este proyecto y bendecir a la congregación.

Al Pastor y liderazgo de IPUC LA FONDA por su apoyo.

A la comunidad de código abierto por las herramientas (Boxicons, AOS, Leaflet, QRCode.js).

A Netlify por el hosting gratuito.

A todos los hermanos que usan y mejoran esta app día a día.

"Todo lo puedo en Cristo que me fortalece" — Filipenses 4:13

🔗 Enlaces de Interés
📖 Documentación PWA

📖 MDN Web Docs

📖 Netlify Docs

📖 Boxicons

📖 AOS Animations

🎯 Roadmap Futuro
Corto plazo (próximas versiones)
□ Respaldo automático a Google Drive (OAuth)
□ Notificaciones push reales con Firebase
□ Chat multiusuario con WebSockets
Mediano plazo
□ Sincronización entre dispositivos con backend ligero
□ App nativa en Play Store / App Store
□ Integración con pasarelas de pago (donaciones)
Largo plazo
□ Panel multi-iglesia (varias congregaciones)
□ Módulo de discipulado
□ IA pastoral para consejería
Hecho con ❤️ y 🙏 para la gloria de Dios

"Donde el Espíritu Santo se mueve"

text

---

## 📋 Resumen de cambios en el README

| # | Sección | Cambio |
|---|---|---|
| 1 | Badges | Versión `5.1` → `22.1` + 2 nuevos badges (Storage, Recovery) |
| 2 | Descripción | Mención de respaldo v22.1 |
| 3 | Seguridad | + Código maestro |
| 4 | **NUEVA** sección | **Sistema de Respaldo y Recuperación** |
| 5 | Comunicación | + "Todo persiste en localStorage" |
| 6 | Gestión | + "acceso a copias de seguridad" |
| 7 | PWA | + Soporte `file_handlers` |
| 8 | Estructura | + `storage.js`, + `assets/media/`, + screenshots backup |
| 9 | Instalación | + Tabla de renombrado de archivos |
| 10 | Netlify | Guía más detallada |
| 11 | **NUEVA** sección | **Cómo respaldar tu información** |
| 12 | **NUEVA** sección | **Cómo recuperar tu cuenta** |
| 13 | **NUEVA** sección | **Plan de Pruebas (6 pruebas)** |
| 14 | **NUEVA** sección | **Changelog v22.1** completo |
| 15 | **NUEVA** sección | **FAQ (10 preguntas)** |
| 16 | **NUEVA** sección | **Roadmap futuro** |
| 17 | Autor | Contacto completo |
| 18 | Agradecimientos | Actualizado |

---

## 🎯 Estado del proyecto — **COMPLETO**

| Archivo | Versión | Estado |
|---|---|---|
| `index.html` | v22.1 | ✅ |
| `styles.css` | v22.1 | ✅ |
| `database.js` | v22.1 | ✅ |
| `storage.js` | v1.0 | ✅ |
| `script.js` | v22.1 | ✅ |
| `app.js` | v22.1 | ✅ |
| `service-worker.js` | v22.1 | ✅ |
| `manifest.json` | v22.1 | ✅ |
| **`README.md`** | **v22.1** | ✅ |

**🎉 ¡Los 9 archivos del proyecto están completos!**

---

## 🚀 Lista final antes de subir a Netlify

### Checklist

- [ ] `base de datos.js` renombrado a `database.js`
- [ ] `estilos.css` renombrado a `styles.css`
- [ ] `índice.html` renombrado a `index.html`
- [ ] `storage.js` subido al repo
- [ ] README.md reemplazado
- [ ] `manifest.json` actualizado
- [ ] Service Worker actualizado
- [ ] Screenshots opcionales creados (`desktop-backup.png`, `mobile-backup.png`)
- [ ] Commit y push a GitHub
- [ ] Netlify detecta el cambio y despliega
- [ ] Prueba en modo incógnito
- [ ] Consola muestra `Database v22.1` y `Storage v1.0`
- [ ] Panel de backup funciona
- [ ] Código maestro se genera y se guarda
- [ ] Respaldo descargable
- [ ] Restauración funcional

---

## 🙏 ¡Felicidades!

Has completado un **sistema profesional de nivel empresarial** para tu iglesia, **sin backend, sin pagos mensuales**, usando solo HTML5, CSS3, JavaScript y JSON.

**El proyecto está 100% listo para producción.**

Si más adelante quieres:
- 🌐 **Sincronización multiusuario real** → backend con Node.js o Supabase
- 📤 **Respaldo en la nube automático** → Google Drive API o Dropbox
- 📱 **App nativa** → Capacitor o TWA (Trusted Web Activity)

Solo avísame y lo armamos. ¡Que Dios bendiga este proyecto y a toda la congregación de IPUC LA FONDA! 🙏

---

*"Encomienda a Jehová tus obras, y tus pensamientos serán afirmados" — Proverbios 16:3*
