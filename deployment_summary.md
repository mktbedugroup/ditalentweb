### Estado Actual de la Aplicación y Notas de Despliegue

**Estado Actual:**

*   **Backend (`ditalent-backend`):**
    *   **Estado:** Desplegado y funcionando (STATUS: SUCCESS en Cloud Build).
    *   **URL:** `https://ditalent-backend-247804277912.us-central1.run.app`
    *   **Problema:** Devuelve errores CORS (`Not allowed by CORS`) a las peticiones del frontend.
    *   **Diagnóstico:** El backend está recibiendo la petición, pero la está rechazando por una discrepancia en el origen. A pesar de que el frontend envía el origen correcto (`https://ditalent-frontend-247804277912.us-central1.run.app`), el backend lo está rechazando. Esto sugiere una diferencia muy sutil en la cadena del origen, o un problema con la variable `NODE_ENV` que hace que el backend use la URL de `localhost` para la comparación.

*   **Frontend (`ditalent-frontend`):**
    *   **Estado:** Desplegado y funcionando (STATUS: SUCCESS en Cloud Build).
    *   **URL:** `https://ditalent-frontend-247804277912.us-central1.run.app`
    *   **Problema:** La página no carga el menú ni las sesiones. La consola muestra errores de red (`Fetch API cannot load ... due to access control checks.`) y errores de CORS (`Preflight response is not successful. Status code: 500/503`).
    *   **Diagnóstico:** El frontend está intentando conectarse al backend, pero las peticiones son rechazadas por el backend debido al problema de CORS. La URL del backend en el bundle del frontend es correcta (se verificó en `vite.config.ts` y se hardcodeó para probar).

*   **Problemas Pendientes de Diagnóstico:**
    *   **CORS:** Necesitamos ver los logs detallados del backend (con los `console.log` que intentamos añadir) para entender por qué el origen del frontend no es permitido.
    *   **Archivo JS vacío:** La descarga directa del archivo JavaScript principal del frontend (`index-B1DVN8bu.js`) sigue devolviendo contenido vacío, lo cual es muy extraño dado que el build de Vite lo genera con 1MB. Esto podría ser un problema de Nginx sirviendo el archivo o de una caché muy agresiva.

---

### **Notas para Futuros Proyectos en Google Cloud (Lecciones Aprendidas):**

*   **Prerrequisitos:** Siempre verificar `gcloud` CLI localmente (`gcloud --version`) y que esté autenticado (`gcloud init`).
*   **Dockerfiles:**
    *   Usar builds multi-stage (`FROM ... AS build`, `FROM ...`).
    *   Asegurarse de que `npm install` y `npm run build` sean correctos.
    *   **Backend (Node.js/Prisma):** El script `build` en `package.json` debe incluir `prisma generate && tsc`.
    *   **Frontend (Vite/React):**
        *   La variable de entorno `VITE_API_BASE_URL` debe ser inyectada correctamente en `vite.config.ts` usando `define` (ej. `'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL)`).
        *   Nginx en el `Dockerfile` debe escuchar en el puerto `8080` (el `PORT` por defecto de Cloud Run).
        *   Verificar que los archivos `dist` se copian correctamente al directorio de Nginx.
*   **.dockerignore:** Usar archivos `.dockerignore` completos para evitar copiar archivos innecesarios (`node_modules`, `.env`, `.git`).
*   **Cloud Build (`cloudbuild.yaml`):**
    *   Usar tags de imagen como `:latest` o `:$(BUILD_ID)` para builds manuales.
    *   Pasar variables de entorno a los pasos de build (`env:` o `--set-env-vars`).
    *   Pasar secretos al despliegue (`--set-secrets`).
*   **Permisos IAM:**
    *   La Cuenta de Servicio de Cloud Build necesita `roles/run.admin`, `roles/secretmanager.secretAccessor`, `roles/iam.serviceAccountUser`.
    *   La Cuenta de Servicio de Cloud Run (SA por defecto de Compute Engine) necesita `roles/secretmanager.secretAccessor`.
    *   Para depurar, el usuario necesita `roles/logging.viewer` y `roles/cloudbuild.builds.viewer` (o `editor` si el `viewer` falla).
    *   Recordar ejecutar `gcloud run services add-iam-policy-binding --member="allUsers" --role="roles/run.invoker"` para acceso público.
*   **CORS:**
    *   **¡Extremadamente sensible!** La lista `allowedOrigins` en el backend debe coincidir **exactamente** con el origen que envía el frontend (protocolo, dominio, puerto, barra final).
    *   Añadir `console.log` detallados en el middleware de CORS (`origin`, `allowedOrigins`, `NODE_ENV`) es crucial para depurar.
    *   Considerar permitir temporalmente `*` para depuración si hay problemas.
*   **Base de Datos:**
    *   Crear una base de datos dedicada dentro de la instancia de Cloud SQL.
    *   Actualizar el secreto `DATABASE_URL` para incluir el nombre de la base de datos.
    *   Ejecutar `npx prisma migrate deploy` localmente con Cloud SQL Auth Proxy.
*   **Depuración:**
    *   Siempre revisar los logs de Cloud Build y Cloud Run.
    *   Usar las herramientas de desarrollador del navegador (Consola, Pestaña Network).
    *   **¡Borrar la caché del navegador agresivamente!** (Ctrl+Shift+R, modo incógnito, o incluso otro navegador/dispositivo).
    *   Inspeccionar el código JavaScript desplegado (`web_fetch`) para verificar las URLs.
