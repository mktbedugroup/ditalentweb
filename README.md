# Portal de Empleos Ditalent - Aplicación Full-Stack

Este proyecto es una aplicación web completa para un portal de empleos, construida con React en el frontend y preparada para un backend con Node.js/Express y una base de datos PostgreSQL gestionada con Docker.

## Estructura del Proyecto

- **/ (raíz)**: Contiene los archivos del frontend de React y la configuración principal.
- **/backend**: Contiene el código fuente del servidor, el esquema de la base de datos (`prisma/schema.prisma`) y su propio `package.json`.
- **/docs**: Contiene toda la documentación del proyecto.
- `docker-compose.yml`: Orquesta los servicios de la aplicación (frontend, backend, base de datos) para el desarrollo local.
- `GEMINI.md`: Guía especial para un asistente de IA o desarrollador para implementar el backend.

## Cómo Empezar

Para levantar todo el entorno de desarrollo local, necesitarás tener **Docker** y **Docker Compose** instalados.

1.  **Revisa la Documentación**: Antes de empezar, lee detenidamente los archivos en la carpeta `docs/`. El `DOCUMENTACION_TECNICA.md` y el `GEMINI.md` contienen todos los pasos detallados para la configuración y el desarrollo.

2.  **Construye y Levanta los Contenedores**: Desde la raíz del proyecto, ejecuta el siguiente comando:

    ```bash
    docker-compose up --build
    ```

    Este comando hará lo siguiente:
    - Construirá la imagen de Docker para el backend.
    - Descargará la imagen de PostgreSQL.
    - Creará y levantará los contenedores para el backend y la base de datos.

3.  **Prepara la Base de Datos con Prisma**: Mientras los contenedores están corriendo, abre una **nueva terminal** y ejecuta el siguiente comando para aplicar el esquema de base de datos definido en `backend/prisma/schema.prisma`:
    ```bash
    docker-compose exec backend npm run prisma:migrate
    ```
    -   `docker-compose exec backend`: Ejecuta un comando dentro del contenedor `backend`.
    -   `npm run prisma:migrate`: Ejecuta el script que aplica las migraciones de la base de datos. Prisma creará todas las tablas y columnas por ti.

4.  **Accede a los Servicios**:
    -   **Frontend**: El prototipo actual seguirá funcionando como hasta ahora.
    -   **Backend API**: El servidor de Express estará disponible en `http://localhost:8080`.
    -   **Base de Datos**: Puedes conectarte a la base de datos a través de `localhost:5432` con las credenciales definidas en `docker-compose.yml` (user: `user`, password: `password`, db: `ditalent`).

Sigue las instrucciones en la documentación para desarrollar el backend y conectar la base de datos.