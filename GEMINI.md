# Guía de Implementación del Backend para Ditalent (Asistente AI)

**Objetivo:** Convertir el prototipo de React en una aplicación full-stack funcional, implementando un backend con Node.js/Express, conectándolo a una base de datos PostgreSQL a través de Prisma, y reemplazando la API simulada del frontend por llamadas reales.

**Stack Tecnológico:**
- **Backend:** Node.js, Express, TypeScript
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma
- **Entorno:** Docker

---

### **Paso 1: Entorno y Base de Datos (Ya configurado)**

El entorno de desarrollo está listo para ser levantado con Docker.

1.  **Iniciar Entorno:** Ejecuta `docker-compose up --build` en la raíz del proyecto. Esto levantará los contenedores del backend y la base de datos.
2.  **Aplicar Migración Inicial:** En una nueva terminal, ejecuta `docker-compose exec backend npm run prisma:migrate`. Prisma leerá `backend/prisma/schema.prisma` y creará todas las tablas y relaciones en la base de datos PostgreSQL. La base de datos estará lista para ser utilizada.

---

### **Paso 2: El Plan de Batalla - Conectar el Frontend**

La tarea principal es reemplazar cada una de las funciones dentro del objeto `api` en `services/api.ts` con llamadas `fetch` a los nuevos endpoints del backend que vamos a crear.

**Estrategia:**
1.  **Define la URL Base:** En `services/api.ts`, establece `const API_BASE_URL = 'http://localhost:8080/api';`.
2.  **Itera y Reemplaza:** Por cada función simulada (ej. `api.getJobs`), implementa su correspondiente endpoint en `backend/server.ts` y luego modifica la función en el frontend para que haga la llamada real a ese endpoint.

---

### **Paso 3: Guía de Implementación de Endpoints (Módulo por Módulo)**

Aquí está el desglose de los endpoints que necesitas crear en `backend/server.ts`.

#### **Módulo 1: Autenticación y Usuarios**

-   **`POST /api/auth/register`**
    -   **Propósito:** Registrar un nuevo usuario (candidato o empresa).
    -   **Body:** `{ email, password, role, companyData? }`
    -   **Lógica Prisma:**
        1.  Verifica si el email ya existe con `prisma.user.findUnique`. Si existe, devuelve error.
        2.  (Opcional) Hashea la contraseña.
        3.  Crea el usuario con `prisma.user.create`.
        4.  Si `role` es 'candidate', crea un `CandidateProfile` vacío asociado.
        5.  Si `role` es 'company', crea una `Company` con los `companyData` y asóciala.
    -   **Respuesta (201):** El objeto del nuevo `User`.

-   **`POST /api/auth/login`**
    -   **Propósito:** Autenticar un usuario.
    -   **Body:** `{ email, password }`
    -   **Lógica Prisma:** Busca el usuario con `prisma.user.findUnique`. Verifica la contraseña.
    -   **Respuesta (200):** El objeto del `User`. (En una app real, devolverías un token JWT).

-   **`GET /api/users`**, **`PUT /api/users/:id`**, **`DELETE /api/users/:id`**
    -   **Propósito:** CRUD para la gestión de usuarios desde el panel de admin.
    -   **Lógica Prisma:** Usa `findMany`, `update`, `delete` de `prisma.user`. Implementa protección para no poder eliminar al super-admin.

#### **Módulo 2: Vacantes (Jobs)**

-   **`GET /api/jobs`**
    -   **Propósito:** Obtener una lista paginada y filtrada de vacantes.
    -   **Query Params:** `page`, `limit`, `searchTerm`, `location`, `professionalArea`, `companyId`, `status`, `isInternal`.
    -   **Lógica Prisma:** Construye un objeto `where` dinámico para `prisma.job.findMany` basado en los query params. Usa `skip` y `take` para la paginación. Realiza un `prisma.job.count` con el mismo `where` para la paginación total.
    -   **Respuesta (200):** `{ jobs: Job[], total: number }`.

-   **`GET /api/jobs/:id`**
    -   **Propósito:** Obtener una vacante específica.
    -   **Lógica Prisma:** `prisma.job.findUnique({ where: { id } })`.

-   **`POST /api/jobs`** y **`PUT /api/jobs/:id`**
    -   **Propósito:** Crear o actualizar una vacante.
    -   **Body:** El objeto de la vacante.
    -   **Lógica Prisma:** Usa `prisma.job.create` o `prisma.job.update`. Para la creación, maneja la lógica de descontar créditos del plan de la empresa si no es un cliente de reclutamiento.

-   **`DELETE /api/jobs/:id`**
    -   **Propósito:** Eliminar una vacante.
    -   **Lógica Prisma:** `prisma.job.delete({ where: { id } })`.

#### **Módulo 3: Empresas (Companies)**

-   Implementa los endpoints CRUD estándar: `GET /api/companies`, `GET /api/companies/:id`, `POST /api/companies`, `PUT /api/companies/:id`, `DELETE /api/companies/:id`.
-   Para `GET /api/companies`, implementa la lógica de búsqueda por nombre.

#### **Módulo 4: Perfiles de Candidato (Profiles)**

-   **`GET /api/profiles/:userId`**: Obtiene el perfil de un candidato por el ID de usuario.
-   **`PUT /api/profiles/:profileId`**: Actualiza un perfil.
-   **`GET /api/candidates/search`**:
    -   **Propósito:** Implementar la búsqueda de candidatos para empresas.
    -   **Query Params:** `searchTerm`, `professionalArea`.
    -   **Lógica Prisma:** Construye una cláusula `where` compleja que busque en `fullName`, `headline`, `summary`, `skills`, y filtre por `professionalAreas`.

#### **Módulo 5: Contenido del Sitio (CMS)**

-   Para cada uno de estos módulos (`Services`, `TeamMembers`, `Testimonials`, `BlogPosts`, `Resources`, `Banners`, `PopupAds`, `SubscriptionPlans`, `SiteSettings`), implementa los endpoints CRUD correspondientes.
-   Ejemplo para Servicios: `GET /api/services`, `POST /api/services`, `PUT /api/services/:id`, `DELETE /api/services/:id`.
-   Para `SiteSettings`, solo necesitarás `GET /api/settings` y `PUT /api/settings`.

---

### **Paso 4: Consideraciones Adicionales**

-   **Autenticación y Autorización:** Para los endpoints del admin, implementa un middleware en Express que verifique el rol del usuario (y, en una app real, un token JWT).
-   **Manejo de Datos Multilingües:** Los campos `Json` en Prisma almacenarán los objetos `{ "es": "...", "en": "...", "fr": "..." }`. El backend simplemente los guardará y los devolverá tal cual. El frontend ya se encarga de mostrar el idioma correcto.
-   **Validación de Datos:** Antes de procesar cualquier solicitud en el backend, valida los datos del `body` y de los `query params` para asegurar que son correctos y evitar errores.

### **Paso 5: Despliegue (Hosting)**

Una vez que el backend esté completo y conectado:

1.  **Frontend:** Construye los archivos estáticos de React (`npm run build`).
2.  **Backend:** Construye el proyecto de TypeScript a JavaScript (`npm run build`).
3.  **Hosting:**
    -   Sube los archivos estáticos del frontend a un servicio como Vercel, Netlify o un bucket S3.
    -   Despliega el backend en un servicio como Heroku, Render o un contenedor en la nube (AWS, Google Cloud).
    -   Utiliza una base de datos PostgreSQL gestionada (ej. AWS RDS, Heroku Postgres).
    -   Configura las variables de entorno en producción, especialmente `DATABASE_URL` y la URL del frontend para la configuración de CORS.

**Conclusión:** Siguiendo esta guía paso a paso, podrás transformar el prototipo en una aplicación robusta, escalable y lista para producción. ¡Adelante!