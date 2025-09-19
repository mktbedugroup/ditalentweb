# Guía de Implementación y Estado del Proyecto - Ditalent (Asistente AI)

**Objetivo:** Evolucionar el prototipo a una aplicación full-stack funcional, corregir bugs y añadir nuevas funcionalidades para mejorar la plataforma.

**Stack Tecnológico:**
- Backend: Node.js, Express, TypeScript
- Base de Datos: MySQL
- ORM: Prisma
- Entorno: Docker

---

### **Análisis y Propuestas de Mejora (14/09/2025)**

Aquí tienes un análisis detallado de la aplicación y una serie de recomendaciones para mejorarla, tanto a nivel técnico como funcional.

---

#### 1. Resumen General

La aplicación es un portal de empleos full-stack con funcionalidades robustas para candidatos, empresas y administradores. El uso de un stack moderno (React/TypeScript, Node.js/Express, Prisma, MySQL) y Docker para la contenerización es una base excelente. El código está razonablemente bien estructurado, con una separación clara entre el frontend y el backend, y el uso de componentes reutilizables en React es una buena práctica.

Las recientes adiciones, como el dashboard de analíticas y la mejora en la gestión de CVs, demuestran un buen camino hacia una plataforma más completa.

---

#### 2. Análisis del Backend (`/backend`)

**Puntos Fuertes:**
*   **ORM y Migraciones:** El uso de Prisma simplifica enormemente la interacción con la base de datos y gestiona las migraciones de forma segura.
*   **API Estructurada:** La API sigue un patrón RESTful y está organizada por módulos (auth, jobs, companies, etc.), lo cual es bueno para la mantenibilidad.
*   **Validación:** El uso de Zod para la validación de esquemas en los endpoints de la API es una excelente práctica que aporta seguridad y robustez.

**Áreas de Mejora:**

*   **Manejo de Errores:** El `asyncHandler` actual captura errores pero devuelve un mensaje genérico "Something went wrong!". Sería muy beneficioso tener un manejador de errores más sofisticado que pueda:
    *   Distinguir entre errores esperados (ej. "Usuario no encontrado") y errores inesperados del servidor (500).
    *   Registrar los errores con más detalle (stack trace, request body) en un sistema de logging (ej. Winston o Pino) para facilitar la depuración.

*   **Seguridad:**
    *   **Autorización Detallada:** Actualmente, la autorización se basa en roles generales (`admin`, `company`). El modelo `Role` tiene un campo `permissions`, pero no parece estarse usando en el middleware `authorizeRoles`. Se debería implementar un sistema de permisos más granular para que un administrador pueda tener roles más específicos (ej. "Gestor de Contenido" vs "Super Admin").
    *   **Dependencias:** Algunas dependencias podrían tener vulnerabilidades. Es recomendable ejecutar `npm audit` periódicamente y actualizar los paquetes.
    *   **Secretos:** El `JWT_SECRET` está hardcodeado con un valor por defecto. Esto es un riesgo de seguridad. Se debería forzar su configuración a través de variables de entorno y quizás usar una librería como `dotenv` para gestionar un archivo `.env` en desarrollo.

*   **Código y Estructura:**
    *   **Refactorizar `server.ts`:** El archivo `server.ts` es muy grande. Se podría dividir la lógica de las rutas en archivos separados por módulo (ej. `routes/jobs.ts`, `routes/companies.ts`) e importarlos en el archivo principal. Esto mejoraría drásticamente la legibilidad y mantenibilidad.
    *   **Servicios Genéricos:** El `createCrudEndpoints` es una buena idea, pero es muy genérico. Para modelos más complejos, se está escribiendo la lógica directamente en `server.ts`. Se podría evolucionar hacia un patrón de "servicios" o "repositorios" donde la lógica de negocio y de base de datos para cada modelo esté encapsulada en su propia clase o módulo.

---

#### 3. Análisis del Frontend

**Puntos Fuertes:**
*   **Componentes Reutilizables:** El uso de componentes en `/components/common` es excelente para mantener la consistencia de la UI.
*   **Gestión de Estado:** Se utiliza `React.Context` (`AuthContext`, `I18nContext`), lo cual es adecuado para el estado global de la aplicación.
*   **Internacionalización (i18n):** El soporte para múltiples idiomas está bien implementado.

**Áreas de Mejora:**

*   **Rendimiento:**
    *   **Carga de Datos:** En varias páginas se realizan múltiples llamadas a la API en `useEffect`. Se podrían combinar algunas de estas llamadas en un único endpoint en el backend si los datos se necesitan siempre juntos. Por ejemplo, en `AdminDashboardPage`, se podrían cargar todas las estadísticas en una sola petición.
    *   **Memoización:** El uso de `useMemo` como en la nueva `AdminCvSubmissionsPage` es un buen ejemplo a seguir. Se debería aplicar en otros componentes que realicen cálculos o filtrados complejos para evitar re-renderizados innecesarios.
    *   **Code Splitting:** La aplicación podría beneficiarse de la división de código por ruta (Route-based code splitting) usando `React.lazy()` y `Suspense`. Esto reduciría el tamaño del bundle inicial y mejoraría el tiempo de carga percibido.

*   **Experiencia de Usuario (UX):**
    *   **Feedback al Usuario:** Aunque se muestran mensajes de carga y error, se podría mejorar el feedback. Por ejemplo, al guardar un formulario, en lugar de solo cerrar el modal, se podría mostrar una notificación "toast" no intrusiva (ej. con `react-hot-toast`) para confirmar que la acción fue exitosa.
    *   **Optimistic UI Updates:** Para acciones rápidas (como marcar un CV como leído), se podría actualizar la UI inmediatamente y revertir el cambio solo si la llamada a la API falla. Esto hace que la aplicación se sienta mucho más rápida.

*   **UI y Diseño:**
    *   **Consistencia:** Hay una buena base, pero se podría crear una guía de estilo más estricta o un "design system" con todos los componentes base (botones, inputs, tarjetas, etc.) para asegurar una consistencia total.
    *   **Librerías de Componentes:** Para acelerar el desarrollo y obtener componentes más pulidos y accesibles, se podría considerar integrar una librería como **Shadcn/UI** o **Mantine**, que son muy populares y personalizables.

---

#### 4. Propuestas de Mejora y Nuevas Funcionalidades

**Mejoras de Alto Impacto (Quick Wins):**

1.  **Refactorizar `server.ts`:** Dividir las rutas en módulos separados. Es un cambio de bajo riesgo con un gran impacto en la mantenibilidad.
2.  **Implementar un Sistema de Notificaciones "Toast":** Añadir `react-hot-toast` o similar para un feedback al usuario más moderno y menos intrusivo que los `alert()`.
3.  **Añadir Logging Detallado en el Backend:** Usar `winston` para registrar errores detallados, lo que salvará horas de depuración en el futuro.

**Nuevas Funcionalidades Sugeridas:**

1.  **Dashboard de Candidato Mejorado:**
    *   **Estadísticas:** Mostrar al candidato cuántas veces su perfil ha sido visto por empresas.
    *   **Sugerencias de Mejora de Perfil:** Además de la barra de completitud, se podrían dar sugerencias más inteligentes basadas en las vacantes a las que aplica.

2.  **Pipeline de Contratación para Empresas (Kanban):** La página de aplicantes a una vacante se beneficiaría enormemente de una vista tipo Kanban (como Trello) donde los reclutadores puedan arrastrar y soltar candidatos entre columnas (`Recibido`, `En Revisión`, `Entrevista`, `Contratado`).

3.  **Sistema de Notificaciones Interno:**
    *   Notificar a las empresas por email o en la app cuando un candidato aplica a su vacante.
    *   Notificar a los candidatos cuando el estado de su aplicación cambia.

4.  **Búsqueda Avanzada y Alertas de Empleo:**
    *   Permitir a los candidatos guardar búsquedas y crear alertas por email para recibir notificaciones cuando se publiquen nuevas vacantes que coincidan con sus criterios.

**Mejoras Técnicas:**

1.  **Suite de Pruebas:** La aplicación carece de pruebas automatizadas. Introducir **Jest** y **React Testing Library** en el frontend, y Jest en el backend, aumentaría la fiabilidad del código y permitiría hacer cambios con más confianza.
2.  **Actualización de Dependencias:** Hay una advertencia de Prisma sobre una nueva versión mayor. Es importante mantener las dependencias actualizadas para recibir mejoras de rendimiento y parches de seguridad.
3.  **CI/CD (Integración y Despliegue Continuo):** Configurar un pipeline simple con GitHub Actions para que ejecute las pruebas y lints automáticamente en cada pull request.

---

### **Historial de Tareas Recientes**

*   **Funcionalidad: Módulo de Newsletter Avanzado (Completado)**
    *   **Problema:** La funcionalidad de suscripción al boletín era muy básica y no tenía gestión.
    *   **Solución:** Se ha implementado un módulo completo de administración de newsletter.
        *   **Gestión de Suscriptores:**
            *   Se creó una nueva página en el panel de administración (`/admin/newsletter`).
            *   Muestra una lista de todos los suscriptores con su fecha de suscripción.
            *   Permite exportar la lista completa de suscriptores a un archivo Excel.
        *   **Creación y Envío de Campañas:**
            *   Se añadió una pestaña de "Crear Campaña" con un editor de texto enriquecido (`react-quill-new`) para redactar correos.
            *   Se implementó un endpoint en el backend (`/api/newsletter/send`) que recibe la campaña.
            *   El backend simula el envío a todos los suscriptores, registrando la acción en la consola del servidor.
        *   **Configuración Dinámica:**
            *   Se añadió un campo `emailSettings` a la base de datos para guardar configuraciones de envío de correo.
            *   Se implementó un formulario en "Ajustes del Sitio" para que el administrador pueda configurar el proveedor de correo (ej. SendGrid), la clave de API y el email remitente.
            *   El endpoint de envío ahora utiliza estas configuraciones de la base de datos para la simulación.
        *   **Mejoras Técnicas y Bugs:**
            *   Se solucionó un problema de compatibilidad de librerías instalando `react-quill-new` para soportar React 19.
            *   Se resolvieron múltiples bugs de renderizado y de compilación durante la implementación.
            *   Se solucionó un problema persistente con las migraciones de Prisma y las variables de entorno.

#### **Funcionalidad: Mejoras en la administración de vacantes (Completado)**
Se ha mejorado la página de administración de vacantes con las siguientes funcionalidades:
*   **Backend:**
    *   Se ha añadido un endpoint `GET /api/jobs/:jobId/applicants/excel` para descargar los datos de los postulantes en formato Excel.
    *   Se ha optimizado la consulta del endpoint `GET /api/jobs` para incluir el conteo de postulantes directamente.
*   **Frontend:**
    *   La tabla de vacantes ahora muestra la fecha de publicación y el conteo de postulantes con un icono.
    *   Se ha implementado un menú desplegable de acciones para cada vacante con opciones para:
        *   Reiniciar (activar)
        *   Detener (pausar)
        *   Ocultar (hacer interna)
        *   Publicar (hacer pública y activa)
        *   Modificar (editar)
        *   Eliminar
        *   Descargar Excel de postulantes.
    *   Se ha corregido la clave de traducción para el estado "Oculta".
*   **i18n:** Se han añadido todas las nuevas traducciones para las opciones del menú desplegable.

#### **Funcionalidad: Mejoras en la administración de formularios de contacto y dashboard (Completado)**
Se ha mejorado la página de administración de formularios de contacto y el dashboard con las siguientes funcionalidades:
*   **Backend:**
    *   Se ha añadido un campo `status` al modelo `ContactSubmission`.
    *   Se ha creado un endpoint `PUT /api/contact-submissions/:id/status` para actualizar el estado de un envío.
    *   Se ha creado un endpoint `GET /api/admin/dashboard-stats` para obtener estadísticas del dashboard (nuevos/total mensajes de contacto, nuevos/total CVs).
*   **Frontend:**
    *   La página de administración de formularios de contacto ha sido rediseñada para incluir:
        *   Gestión de estado para cada mensaje.
        *   Indicador visual para mensajes nuevos.
        *   Filtros y búsqueda por estado y contenido.
        *   Un modal para ver los detalles completos del mensaje.
    *   El dashboard de administración ahora muestra:
        *   Alertas para nuevos mensajes de contacto y CVs.
        *   Tarjetas de estadísticas actualizadas con conteos de mensajes y CVs (nuevos/total).
*   **i18n:** Se han añadido todas las nuevas traducciones.

#### **Funcionalidad: Mejora de la gestión de CVs (Completado)**
Se ha mejorado la página de administración de CVs con las siguientes funcionalidades:
*   **Backend:**
    *   Se ha añadido un campo `subject` y `isRead` al modelo `CVSubmission`.
    *   Se ha creado un endpoint `PUT /api/cv-submissions/:id/read` para marcar un CV como leído.
*   **Frontend:**
    *   Se ha añadido un campo de "Asunto" al formulario de envío de CV.
    *   La página de administración de CVs ha sido rediseñada para incluir:
        *   Búsqueda y filtros (leído/no leído).
        *   Indicador visual para CVs no leídos.
        *   Selección múltiple y descarga masiva.
        *   Se marca como leído automáticamente al descargar.
*   **i18n:** Se han añadido todas las nuevas traducciones.

#### **Funcionalidad: Dashboard de Analíticas de Empresas (Completado)**

Se ha implementado un nuevo dashboard para administradores que mejora la visualización y gestión de empresas.

*   **Backend:**
    *   Se añadió la fecha de registro (`createdAt`) al modelo `Company` para un mejor seguimiento.
    *   Se creó un nuevo endpoint (`GET /api/admin/companies-analytics`) que devuelve una lista de empresas enriquecida con su plan de suscripción y el conteo de vacantes publicadas.
    *   El endpoint soporta filtrado por ubicación (dirección).
*   **Frontend:**
    *   La página de `AdminCompaniesPage` fue rediseñada completamente para incluir:
        *   Tarjetas de KPIs (Total de Empresas, Total de Vacantes, etc.).
        *   Una barra de filtro por ubicación.
        *   Una tabla de datos mejorada con la nueva información.
*   **i18n:** Se añadieron todos los nuevos textos a los archivos de traducción en español, inglés y francés.

#### **Corrección de Bugs (Completado)**

*   **Envío de CV (Completado):**
    *   Se solucionó un error 404 al no existir el endpoint `POST /api/cv-submissions`.
    *   Se solucionó un error 500 posterior debido a que el tipo de dato de `cvBase64` en la base de datos era muy pequeño. Se migró a `LONGTEXT`.
*   **Asignación de Plan Gratuito (Completado):**
    *   Se corrigió la lógica de registro para que a las nuevas empresas se les asigne automáticamente el plan gratuito (`plan_free`).
*   **Filtro de Vacantes (Completado):**
    *   Se reescribió por completo la lógica de filtrado de vacantes usando **SQL nativo (`queryRaw`)** para solucionar un problema de incompatibilidad de Prisma con los filtros complejos en campos `JSON`.
    *   La búsqueda ahora es insensible a mayúsculas/minúsculas y funciona correctamente.
*   **Edición de Empresas (Completado):**
    *   Se solucionó un error que impedía guardar al enviar el `id` en el cuerpo de la petición.
    *   Se corrigió un error de tipo de dato con la `latitud` y `longitud`, asegurando que se guarden como números.
    *   Se aumentó el tamaño del campo `logo` en la base de datos para permitir guardar imágenes (Base64).
*   **Visualización de Pop-ups (Completado):**
    *   Se reactivó y reescribió el endpoint `GET /api/popups/active`.
    *   La nueva lógica filtra los pop-ups en el código del servidor para soportar reglas complejas de segmentación (página, dispositivo, rol de usuario) que no eran posibles directamente en la base de datos.

---

### **Informe de Implementación y Próximos Pasos**

Aquí se detalla el progreso de las tareas recientes y lo que queda por hacer.

#### **Tareas Completadas Recientemente:**

*   **Funcionalidad: Actualización de Estado de Postulantes (Pipeline Kanban)**
    *   **Problema:** Los cambios de estado de los aplicantes en el pipeline no persistían al cambiar de ventana.
    *   **Solución:** Se añadió el endpoint `PUT /api/applications/:id/status` en el backend para permitir la actualización del estado de las postulaciones en la base de datos. El frontend ya realizaba la llamada a la API correctamente.

*   **Corrección de Traducciones en Panel de Administración (Gestión de Vacantes)**
    *   **Problema:** Ciertas claves de traducción en el menú desplegable de acciones (`admin.jobs.dropdown.*`) y el encabezado de la tabla (`admin.jobs.tableDate`) se mostraban sin traducir.
    *   **Solución:** Se corrigieron las claves de traducción en `AdminJobsPage.tsx` para que coincidieran con la estructura anidada en `translations/es.json` (ej. `admin.jobs.form.dropdown.stop`).

*   **Mejora de la Página de Servicios (`ServicesPage.tsx`)**
    *   **Problema:** La página se veía "plana" y carecía de llamadas a la acción.
    *   **Solución:**
        *   Se mejoró la sección principal (hero) con una descripción más atractiva y un botón "Solicitar un Servicio" que enlaza a la página de contacto.
        *   Se añadió una sección de suscripción al boletín con un formulario básico en el frontend.

*   **Implementación de Suscripción a Boletín (Fase 1: Backend y Frontend API)**
    *   **Objetivo:** Permitir a los usuarios suscribirse a un boletín y almacenar sus correos electrónicos.
    *   **Solución:**
        *   **Modelo Prisma:** Se añadió el modelo `NewsletterSubscriber` (`id`, `email` único, `subscribedAt`) en `backend/prisma/schema.prisma`.
        *   **Migración de Base de Datos:** Se ejecutó la migración para crear la tabla `NewsletterSubscriber` en la base de datos.
        *   **Endpoint Backend:** Se creó el endpoint `POST /api/newsletter/subscribe` en `backend/server.ts` para guardar los correos electrónicos, incluyendo validación con Zod y manejo de duplicados.
        *   **Frontend API:** Se añadió la función `api.subscribeToNewsletter` en `services/api.ts`.
        *   **Integración Frontend:** Se actualizó el formulario de suscripción en `ServicesPage.tsx` para usar la nueva API y mostrar mensajes de éxito/error.

*   **Corrección de Carga de Imágenes en Artículos de Blog**
    *   **Problema:** No se podían guardar artículos de blog con imágenes (especialmente Base64) debido a la limitación de tamaño del campo `imageUrl` en la base de datos.
    *   **Solución:** Se modificó el campo `imageUrl` del modelo `BlogPost` en `backend/prisma/schema.prisma` a `@db.LongText` para permitir almacenar URLs o cadenas Base64 largas. Se ejecutó la migración de base de datos correspondiente.

*   **Resolución de Problemas de Conexión a Base de Datos del Backend (Causa Raíz de Traducciones y Contenido no cargado)**
    *   **Problema:** El backend no podía conectarse a la base de datos al ejecutarse localmente (`npm run dev`), lo que causaba que el frontend no cargara datos ni traducciones.
    *   **Solución:**
        *   Se configuró `dotenv` explícitamente en `backend/server.ts` (`import * => dotenv from 'dotenv'; dotenv.config({ path: './.env' });`) para asegurar la carga de variables de entorno.
        *   Se configuró el constructor de `PrismaClient` para usar explícitamente `process.env.DATABASE_URL` como URL de la base de datos, forzando la lectura de la variable de entorno.
        *   Se ajustó la `DATABASE_URL` en `backend/.env` a `localhost` (en lugar de `db`) para el desarrollo local, permitiendo la conexión desde la máquina host.

#### **Próximos Pasos y Tareas Pendientes:**

Para continuar con el desarrollo, se deben abordar las siguientes tareas:

1.  **Verificación de Soluciones Recientes (Requiere tu Acción):**
    *   **Conexión a Base de Datos y Traducciones:** Es crucial que reinicies tu servidor backend, borres la caché de tu navegador y realices una recarga forzada del frontend. Luego, confirma que la página carga correctamente, las traducciones aparecen y el formulario de suscripción al boletín funciona sin errores.
    *   **Descarga de Excel (Gestión de Vacantes):** Aunque se añadieron logs en el backend, aún necesitamos tu ayuda para diagnosticar por qué no funciona. Por favor, proporciona la salida de la consola del backend cuando intentes descargar un Excel.

2.  **Implementación de Suscripción a Boletín (Fase 2: Interfaz de Administración):**
    *   **Objetivo:** Permitir a los administradores visualizar y gestionar la lista de suscriptores.
    *   **Tareas:**
        *   **Endpoint Backend para Listado:** Crear `GET /api/newsletter/subscribers` en `backend/server.ts` para obtener todos los suscriptores (solo para `admin`).
        *   **Actualizar Sidebar de Administración:** Añadir un enlace a la nueva página `AdminNewsletterPage.tsx` en `components/layout/AdminLayout.tsx` para que sea accesible desde el panel de administración.

3.  **Implementación de Suscripción a Boletín (Fase 3: Exportar Suscriptores - Opcional):**
    *   **Objetivo:** Permitir a los administradores exportar la lista de suscriptores.
    *   **Tareas:**
        *   **Endpoint Backend para Exportación:** Crear `GET /api/newsletter/subscribers/excel`.
        *   **Botón de Exportación en Frontend:** Añadir un botón en `AdminNewsletterPage.tsx` para activar la descarga del Excel.

4.  **Implementación de Suscripción a Boletín (Fase 4: Envío de Mensajes - Futuro):**
    *   **Objetivo:** Permitir a los administradores enviar correos electrónicos a los suscriptores.
    *   **Consideraciones:** Esta es una tarea compleja que implica la integración con servicios de envío de correo electrónico (ej. SendGrid, Mailgun) y la lógica para componer y enviar campañas. Se abordará una vez completadas las fases anteriores.

5.  **Administración de Formularios de Contacto (Edición de Contenido):**
    *   **Objetivo:** Si se requiere, permitir la edición del *contenido* de los mensajes de contacto enviados.
    *   **Consideraciones:** Actualmente, solo se gestiona el estado de los envíos. La edición del contenido original de un mensaje de contacto es una funcionalidad no estándar y requeriría una discusión más profunda sobre su necesidad y diseño.

---

### **Historial de Tareas Recientes (Original)**

#### **Funcionalidad: Mejoras en la administración de vacantes (Completado)**
Se ha mejorado la página de administración de vacantes con las siguientes funcionalidades:
*   **Backend:**
    *   Se ha añadido un endpoint `GET /api/jobs/:jobId/applicants/excel` para descargar los datos de los postulantes en formato Excel.
    *   Se ha optimizado la consulta del endpoint `GET /api/jobs` para incluir el conteo de postulantes directamente.
*   **Frontend:**
    *   La tabla de vacantes ahora muestra la fecha de publicación y el conteo de postulantes con un icono.
    *   Se ha implementado un menú desplegable de acciones para cada vacante con opciones para:
        *   Reiniciar (activar)
        *   Detener (pausar)
        *   Ocultar (hacer interna)
        *   Publicar (hacer pública y activa)
        *   Modificar (editar)
        *   Eliminar
        *   Descargar Excel de postulantes.
    *   Se ha corregido la clave de traducción para el estado "Oculta".
*   **i18n:** Se han añadido todas las nuevas traducciones para las opciones del menú desplegable.

#### **Funcionalidad: Mejoras en la administración de formularios de contacto y dashboard (Completado)**
Se ha mejorado la página de administración de formularios de contacto y el dashboard con las siguientes funcionalidades:
*   **Backend:**
    *   Se ha añadido un campo `status` al modelo `ContactSubmission`.
    *   Se ha creado un endpoint `PUT /api/contact-submissions/:id/status` para actualizar el estado de un envío.
    *   Se ha creado un endpoint `GET /api/admin/dashboard-stats` para obtener estadísticas del dashboard (nuevos/total mensajes de contacto, nuevos/total CVs).
*   **Frontend:**
    *   La página de administración de formularios de contacto ha sido rediseñada para incluir:
        *   Gestión de estado para cada mensaje.
        *   Indicador visual para mensajes nuevos.
        *   Filtros y búsqueda por estado y contenido.
        *   Un modal para ver los detalles completos del mensaje.
    *   El dashboard de administración ahora muestra:
        *   Alertas para nuevos mensajes de contacto y CVs.
        *   Tarjetas de estadísticas actualizadas con conteos de mensajes y CVs (nuevos/total).
*   **i18n:** Se han añadido todas las nuevas traducciones.

#### **Funcionalidad: Mejora de la gestión de CVs (Completado)**
Se ha mejorado la página de administración de CVs con las siguientes funcionalidades:
*   **Backend:**
    *   Se ha añadido un campo `subject` y `isRead` al modelo `CVSubmission`.
    *   Se ha creado un endpoint `PUT /api/cv-submissions/:id/read` para marcar un CV como leído.
*   **Frontend:**
    *   Se ha añadido un campo de "Asunto" al formulario de envío de CV.
    *   La página de administración de CVs ha sido rediseñada para incluir:
        *   Búsqueda y filtros (leído/no leído).
        *   Indicador visual para CVs no leídos.
        *   Selección múltiple y descarga masiva.
        *   Se marca como leído automáticamente al descargar.
*   **i18n:** Se han añadido todas las nuevas traducciones.

#### **Funcionalidad: Dashboard de Analíticas de Empresas (Completado)**

Se ha implementado un nuevo dashboard para administradores que mejora la visualización y gestión de empresas.

*   **Backend:**
    *   Se añadió la fecha de registro (`createdAt`) al modelo `Company` para un mejor seguimiento.
    *   Se creó un nuevo endpoint (`GET /api/admin/companies-analytics`) que devuelve una lista de empresas enriquecida con su plan de suscripción y el conteo de vacantes publicadas.
    *   El endpoint soporta filtrado por ubicación (dirección).
*   **Frontend:**
    *   La página de `AdminCompaniesPage` fue rediseñada completamente para incluir:
        *   Tarjetas de KPIs (Total de Empresas, Total de Vacantes, etc.).
        *   Una barra de filtro por ubicación.
        *   Una tabla de datos mejorada con la nueva información.
*   **i1-8n:** Se añadieron todos los nuevos textos a los archivos de traducción en español, inglés y francés.

#### **Corrección de Bugs (Completado)**

*   **Envío de CV (Completado):**
    *   Se solucionó un error 404 al no existir el endpoint `POST /api/cv-submissions`.
    *   Se solucionó un error 500 posterior debido a que el tipo de dato de `cvBase64` en la base de datos era muy pequeño. Se migró a `LONGTEXT`.
*   **Asignación de Plan Gratuito (Completado):**
    *   Se corrigió la lógica de registro para que a las nuevas empresas se les asigne automáticamente el plan gratuito (`plan_free`).
*   **Filtro de Vacantes (Completado):**
    *   Se reescribió por completo la lógica de filtrado de vacantes usando **SQL nativo (`queryRaw`)** para solucionar un problema de incompatibilidad de Prisma con los filtros complejos en campos `JSON`.
    *   La búsqueda ahora es insensible a mayúsculas/minúsculas y funciona correctamente.
*   **Edición de Empresas (Completado):**
    *   Se solucionó un error que impedía guardar al enviar el `id` en el cuerpo de la petición.
    *   Se corrigió un error de tipo de dato con la `latitud` y `longitud`, asegurando que se guarden como números.
    *   Se aumentó el tamaño del campo `logo` en la base de datos para permitir guardar imágenes (Base64).
*   **Visualización de Pop-ups (Completado):**
    *   Se reactivó y reescribió el endpoint `GET /api/popups/active`.
    *   La nueva lógica filtra los pop-ups en el código del servidor para soportar reglas complejas de segmentación (página, dispositivo, rol de usuario) que no eran posibles directamente en la base de datos.