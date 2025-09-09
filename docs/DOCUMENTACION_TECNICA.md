# Documentación Técnica - Portal de Empleos Ditalent

## 1. Introducción

Bienvenido a la documentación técnica del portal de empleos Ditalent. Esta guía está diseñada para desarrolladores y explica la arquitectura de la aplicación, cómo configurarla localmente y cómo realizar la transición del prototipo de frontend a una aplicación full-stack completamente funcional.

### 1.1. Arquitectura General

La aplicación está diseñada con una arquitectura de servicios desacoplados:

-   **Frontend**: Una aplicación de página única (SPA) construida con **React** y **TypeScript**. Se encarga de toda la interfaz de usuario y la experiencia del cliente. Actualmente, utiliza un API simulada (`services/api.ts`) que debe ser reemplazada por llamadas a un backend real.
-   **Backend**: Un servidor API REST construido con **Node.js** y **Express**. Es responsable de la lógica de negocio, la autenticación y la comunicación con la base de datos.
-   **Base de Datos**: **PostgreSQL**, una base de datos relacional robusta para almacenar todos los datos de la aplicación.
-   **ORM**: **Prisma**, un ORM de nueva generación para Node.js y TypeScript que facilita las interacciones con la base de datos de una manera segura y moderna.
-   **Entorno de Desarrollo**: **Docker** y **Docker Compose** para orquestar todos los servicios y garantizar un entorno de desarrollo consistente y fácil de configurar.

## 2. Configuración del Entorno Local con Docker

Para levantar la aplicación completa en tu máquina local, solo necesitas Docker y Docker Compose.

### 2.1. Pasos de Configuración

1.  **Clona/Descarga el Proyecto**: Asegúrate de tener todos los archivos del proyecto, incluyendo el `docker-compose.yml` y la carpeta `backend`.

2.  **Construye y Levanta los Contenedores**: Abre una terminal en la raíz del proyecto y ejecuta:
    ```bash
    docker-compose up --build
    ```
    -   Este comando leerá el archivo `docker-compose.yml`.
    -   Construirá la imagen de Docker para el servicio `backend` usando su `Dockerfile`.
    -   Descargará la imagen oficial de `postgres`.
    -   Creará e iniciará los contenedores para la base de datos y el backend.

3.  **Prepara la Base de Datos con Prisma**: Mientras los contenedores están corriendo, abre una **nueva terminal** y ejecuta el siguiente comando para aplicar el esquema de base de datos definido en `backend/prisma/schema.prisma`:
    ```bash
    docker-compose exec backend npm run prisma:migrate
    ```
    -   `docker-compose exec backend`: Ejecuta un comando dentro del contenedor `backend`.
    -   `npm run prisma:migrate`: Ejecuta el script que aplica las migraciones de la base de datos. Prisma creará todas las tablas y columnas por ti.

4.  **Accede a los Servicios**:
    -   **Frontend**: El prototipo seguirá funcionando como hasta ahora, sirviendo los archivos estáticos.
    -   **Backend API**: El servidor de Express estará disponible en `http://localhost:8080`.
    -   **Base de Datos**: Puedes conectarte a la base de datos a través de `localhost:5432` con las credenciales definidas en `docker-compose.yml` (user: `user`, password: `password`, db: `ditalent`).

## 3. Esquema de la Base de Datos (Prisma)

El archivo `backend/prisma/schema.prisma` es la única fuente de verdad para la estructura de tu base de datos. Define los modelos (tablas), sus campos (columnas) y las relaciones entre ellos.

**Ejemplo de Modelo `Job`:**

```prisma
model Job {
  id                String        @id @default(cuid())
  title             Json
  companyId         String
  company           Company       @relation(fields: [companyId], references: [id])
  // ... otros campos
}
```

Cada vez que modifiques este archivo (por ejemplo, para añadir un nuevo campo), debes generar una nueva migración y aplicarla ejecutando de nuevo `docker-compose exec backend npm run prisma:migrate`.

## 4. Conectar el Frontend al Backend (¡Paso Clave!)

Este es el paso más importante para hacer que la aplicación sea funcional. Debes modificar el archivo `services/api.ts` para que, en lugar de devolver datos simulados, realice llamadas `fetch` a tu API de backend.

### 4.1. Proceso General

1.  **Identifica una función simulada**: Elige una función en `services/api.ts`, por ejemplo, `getJobs`.
2.  **Crea el Endpoint en el Backend**: En `backend/server.ts`, crea el endpoint correspondiente (ej. `GET /api/jobs`). Asegúrate de que este endpoint consulte la base de datos usando Prisma y devuelva los datos en el formato que el frontend espera.
3.  **Modifica la función en el Frontend**: Reemplaza el código simulado en `services/api.ts` con una llamada `fetch`.

### 4.2. Ejemplo: Modificando `api.getJobs`

**Antes (services/api.ts - Simulado):**

```typescript
// ...
export const api = {
  // ...
  getJobs: async (params: ...) => {
    return new Promise(resolve => setTimeout(() => {
        // ... lógica de filtrado sobre MOCK_JOBS
        resolve({ jobs: paginatedJobs, total });
    }, LATENCY));
  },
  // ...
}
```

**Después (services/api.ts - Conectado):**

```typescript
const API_BASE_URL = 'http://localhost:8080/api'; // URL de tu backend

export const api = {
  // ...
  getJobs: async (params: { ... } = {}): Promise<{ jobs: Job[]; total: number }> => {
    // Construye la URL con los parámetros de consulta
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    // ... añadir otros filtros

    const response = await fetch(`${API_BASE_URL}/jobs?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    return response.json();
  },
  // ...
}
```

**Backend (backend/server.ts - Endpoint correspondiente):**

```typescript
app.get('/api/jobs', async (req: Request, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    try {
        const jobs = await prisma.job.findMany({
            where: {
                // TODO: Aplicar lógica de filtros basada en `filters`
            },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: {
                postedDate: 'desc'
            }
        });
        const total = await prisma.job.count({
            // TODO: where: { ... }
        });
        res.json({ jobs, total });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las vacantes.' });
    }
});
```

**Deberás repetir este proceso para CADA función en `services/api.ts`**, creando su correspondiente endpoint en el backend y actualizando la llamada en el frontend.

### 4.3. Listado de Módulos y Endpoints a Crear

-   **Jobs**: `GET /jobs`, `GET /jobs/:id`, `POST /jobs`, `PUT /jobs/:id`, `DELETE /jobs/:id`
-   **Companies**: `GET /companies`, `GET /companies/:id`, `POST /companies`, `PUT /companies/:id`
-   **Users**: `GET /users`, `POST /login`, `POST /register`
-   **Profiles**: `GET /profiles/:userId`, `PUT /profiles/:userId`
-   **Applications**: `GET /applications`, `POST /applications`
-   **Content (Services, Team, etc.)**: CRUD endpoints para cada tipo de contenido.
-   **Settings**: `GET /settings`, `PUT /settings`
-   **Popups**: `GET /popups`, `POST /popups`, `PUT /popups/:id`, `DELETE /popups/:id`
-   ...y así sucesivamente para todos los módulos.