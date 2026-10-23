# Estado de validacion

Este archivo distingue pruebas locales de evidencia externa pendiente.

## Verificado localmente durante la implementacion

- Compilacion NestJS/TypeScript.
- Prueba unitaria original de AppController con Jest en modo ESM.
- Pruebas HTTP de multipart, foto obligatoria, MIME permitido, limite de 5 MiB, campos obligatorios y listado con ambas URLs. S3, BD y correo simulados.
- Migraciones ejecutadas contra PostgreSQL 16 temporal: base nueva, segunda ejecucion sin cambios y adopcion de datos anteriores conservando un usuario y un reporte. En esta etapa aislada no se modifico la BD del alumno; posteriormente se migro su volumen con copia previa, como se registra debajo.
- Imagen Docker construida originalmente como wassito/agua-fix-api:local; destino corregido a wassit0/agua-fix-api; comprobados usuario node y ausencia de /app/.env y /app/compose.yaml.
- Arranque de esa imagen con PostgreSQL aislado y migraciones: GET recupera el reporte anterior con ambas URLs, POST sin foto devuelve 400 y registro/login reales generan JWT. Los contenedores y red temporales se eliminaron al finalizar.
- Linter sin avisos; JSON de politicas AWS y coleccion Postman validos.
- .env ignorado y no presente entre los archivos versionados de Git.

## Verificacion real completada el 23 de octubre de 2026

- Workflow inicial exitoso y latest publicado en Docker Hub; imagen descargada y ejecutada con Compose.
- Bucket aguafix-wassit0-fotos-2026, region us-east-2; subida y descarga publica del mismo archivo verificadas.
- Volumen aguafix-api_postgres_data respaldado en .tmp/backups antes de aplicar migraciones. Tres reportes anteriores conservados.
- Reporte real de prueba ID 4: POST 201, GET 200 con ambas URLs y POST sin foto 400.
- SMTP autentica desde Docker; el usuario confirmo correo recibido con fotografia visible.
- Evidencia guardada en evidencia-s3.json y evidencia-api.json, sin credenciales.

## Pendiente

- Demostracion desde Postman y video en el orden solicitado, con nuevo cambio/commit/push grabado.
- Enlace final del video y ejecucion de Actions correspondiente al commit mostrado en el video.

La instalacion detecto avisos de seguridad en dependencias existentes. Se aplicaron las correcciones compatibles de npm audit fix sin force. Los avisos restantes estan en la cadena de desarrollo de @nestjs/mau; no se migro ni elimino esa herramienta ajena a esta actividad. La imagen final instala solo dependencias de produccion. Consulta npm audit para reevaluar el estado actual.
