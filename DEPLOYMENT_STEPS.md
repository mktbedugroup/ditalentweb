# Pasos para el Despliegue de Ditalent en Google Cloud

Este documento registra los pasos que hemos seguido para preparar y desplegar la aplicación Ditalent.

## 1. Preparación y Corrección del Código Fuente

- **Análisis del Proyecto:** Se revisaron los archivos de configuración `cloudbuild.yaml`, `Dockerfile` (frontend), `backend/Dockerfile` y `docker-compose.yml` para entender la estructura del despliegue.
- **Revisión de Errores Anteriores:** Se analizaron `GEMINI.md` y `deployment_summary.md` para identificar los puntos de fallo de despliegues previos.
- **Corrección Crítica de CORS:**
    - Se identificó que el backend rechazaba peticiones del frontend en producción.
    - Se modificó `backend/server.ts` para añadir dinámicamente la URL del frontend de producción (`https://ditalent-frontend-247804277912.us-central1.run.app`) a la lista de orígenes permitidos (CORS).
- **Mejora del Script de Construcción:** Se actualizó el script `build` en `backend/package.json` para que ejecute `prisma generate` antes de la compilación de TypeScript (`tsc`), asegurando que el cliente de Prisma esté siempre actualizado.

## 2. Configuración del Repositorio de GitHub

- **Vinculación de Repositorio:** Se configuró el repositorio local para apuntar a la nueva URL en GitHub: `https://github.com/mktbedugroup/ditalentweb.git`.
- **Resolución de Autenticación:** Se guió al usuario para conceder permisos de colaborador al usuario `jfscreative`, solucionando un error de permisos (403 Forbidden).
- **Resolución de Problema de Red:** Se solucionó un error de timeout (HTTP 408) durante la subida inicial aumentando el buffer de Git con `git config http.postBuffer 524288000`.
- **Subida Exitosa:** Se subió el código completo y corregido a la rama `main` del repositorio.

## 3. Conexión de Google Cloud y Creación de Trigger

- **Autorización de GitHub:** Se guió al usuario para conectar la cuenta de GitHub `mktbedugroup` a Google Cloud Build a través de la consola web, resolviendo un problema de pop-ups bloqueados.
- **Creación del Trigger:** Una vez autorizada la conexión, se creó un trigger en Google Cloud Build con la siguiente configuración:
    - **Nombre:** `deploy-main`
    - **Evento:** Push a la rama `main`.
    - **Configuración:** Se utilizó el archivo `cloudbuild.yaml`.
    - **Logs:** Se habilitó el envío de registros de compilación a GitHub para mayor visibilidad.
    - **Cuenta de Servicio:** Se seleccionó la cuenta por defecto de Cloud Build (`[PROJECT-NUMBER]@cloudbuild.gserviceaccount.com`).

## 4. Próximos Pasos: Prueba del Despliegue Automático

- Realizar un cambio menor en el código.
- Subir el cambio a la rama `main` de GitHub para activar el trigger.
- Verificar el nuevo despliegue en Cloud Run.
