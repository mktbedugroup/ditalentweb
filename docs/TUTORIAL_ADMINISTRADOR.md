# Manual de Usuario: Panel de Administración

Bienvenido al panel de administración de Ditalent. Esta guía te ayudará a gestionar todos los aspectos de tu portal de empleos.

## 1. Primeros Pasos: Iniciar Sesión

Para acceder al panel, navega a la página de login de tu sitio y utiliza las credenciales de administrador (ej. `admin@hrportal.com`). Una vez dentro, serás redirigido al Dashboard.

## 2. Navegación Principal

El menú lateral izquierdo contiene enlaces a todas las secciones de gestión:

-   **Dashboard**: Tu página de inicio con estadísticas clave.
-   **Analíticas**: Reportes visuales sobre la actividad de la plataforma.
-   **Reclutamiento**: Gestiona todo lo relacionado con vacantes, empresas y postulaciones.
-   **Gestión de Usuarios**: Administra cuentas de usuario y sus permisos.
-   **Contenido**: Edita el contenido de las páginas públicas (servicios, blog, banners, etc.).
-   **Monetización**: Administra los planes de suscripción.
-   **Ajustes**: Configura los ajustes globales del sitio.

## 3. Módulos Principales

### 3.1. Dashboard

Aquí encontrarás un resumen visual del estado de tu plataforma:
-   **Usuarios Activos**: Un contador en tiempo real de cuántas personas están navegando en tu sitio.
-   **Estadísticas Clave**: Total de vacantes, empresas, usuarios y formularios recibidos.
-   **Vacantes Recientes**: Un listado de las últimas vacantes publicadas.
-   **Acciones Rápidas**: Accesos directos para crear vacantes o gestionar contenido.

### 3.2. Gestión de Vacantes (`Reclutamiento > Vacantes`)

-   **Crear una Vacante**: Haz clic en "Crear Nueva Vacante". Rellena el formulario, asegurándote de seleccionar la empresa correcta. Si la empresa es un "Cliente del Servicio de Reclutamiento", la publicación no consumirá créditos de su plan.
-   **Gestionar Postulantes**: Haz clic en el número de postulantes de una vacante para ver el "Pipeline de Postulantes", un tablero Kanban donde puedes arrastrar y soltar candidatos entre las diferentes etapas del proceso (Recibido, En Revisión, Entrevista, etc.).
-   **Editar/Pausar/Eliminar**: Usa los botones de acción en cada fila para gestionar las vacantes existentes.

### 3.3. Gestión de Empresas (`Reclutamiento > Empresas`)

-   **Añadir Empresa**: Crea perfiles para nuevas empresas clientes.
-   **Editar Empresa**: Modifica los detalles de una empresa, incluyendo su logo, descripción, información de contacto, geolocalización (latitud/longitud para los mapas) y si es un cliente de reclutamiento.

### 3.4. Roles y Permisos (`Gestión de Usuarios > Roles y Permisos`)

Esta es una sección poderosa para la seguridad:
1.  **Crear un Rol**: Haz clic en "Añadir Rol" (ej. "Reclutador Junior").
2.  **Asignar Permisos**: Selecciona de la lista qué acciones puede realizar este rol (ej. solo puede `Gestionar Vacantes` y `Ver Dashboard`).
3.  **Asignar a un Usuario**: Ve a la sección de `Usuarios`, edita un usuario con rol de "Admin" y asígnale el nuevo rol que has creado desde el menú desplegable. Ahora, ese usuario solo podrá ver y acceder a las secciones que le permitiste.

### 3.5. Gestión de Contenido (`Contenido`)

-   **Banners**: Gestiona los carruseles de imágenes de la página de inicio. Puedes añadir diapositivas, personalizar los textos, los botones (color, tamaño, radio de borde) y la configuración general del carrusel.
-   **Anuncios Pop-up**: Crea publicidad emergente. Este módulo te permite un control total:
    -   **Contenido**: Define la imagen, título, texto y botón del pop-up.
    -   **Apariencia**: Elige tamaño y posición.
    -   **Activadores**: Decide si aparece por tiempo, por scroll o al intentar salir de la página.
    -   **Frecuencia**: Evita molestar a los usuarios mostrando el pop-up solo una vez por sesión o cada ciertos días.
    -   **Segmentación**: Elige en qué páginas, para qué dispositivos (móvil/escritorio) y para qué tipo de usuarios (invitados, candidatos, etc.) se mostrará.
-   **Servicios, Equipo, Blog, etc.**: Edita el contenido que aparece en las páginas públicas correspondientes.

### 3.6. Ajustes del Sitio (`Ajustes > Ajustes del Sitio`)

Esta es la sección de configuración global:
-   **Ajustes de Idioma**: Activa o desactiva el selector de idiomas, elige qué idiomas estarán disponibles y cuál será el idioma por defecto.
-   **Contenido de Páginas**: Edita los textos de misión, visión y valores de la página "Nosotros".
-   **Información de Contacto**: Actualiza la dirección, teléfono y email. **Importante**: La latitud y longitud que introduzcas aquí controlan la ubicación del marcador en el mapa de la página de contacto.
-   **Enlaces del Pie de Página**: Gestiona los links que aparecen en el footer del sitio.