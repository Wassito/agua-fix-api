# Estado de validacion

Este archivo distingue pruebas locales de evidencia externa pendiente.

## Verificado localmente durante la implementacion

- Compilacion NestJS/TypeScript.
- Prueba unitaria original de AppController con Jest en modo ESM.
- Pruebas HTTP de multipart, foto obligatoria, MIME permitido, limite de 5 MiB, campos obligatorios y listado con ambas URLs. S3, BD y correo simulados.
- Migraciones ejecutadas contra PostgreSQL 16 temporal: base nueva, segunda ejecucion sin cambios y adopcion de datos anteriores conservando un usuario y un reporte. No se modifico la BD del alumno.
- Imagen Docker construida originalmente como wassito/agua-fix-api:local; destino corregido a wassit0/agua-fix-api; comprobados usuario node y ausencia de /app/.env y /app/compose.yaml.
- Arranque de esa imagen con PostgreSQL aislado y migraciones: GET recupera el reporte anterior con ambas URLs, POST sin foto devuelve 400 y registro/login reales generan JWT. Los contenedores y red temporales se eliminaron al finalizar.
- Linter sin avisos; JSON de politicas AWS y coleccion Postman validos.
- .env ignorado y no presente entre los archivos versionados de Git.

## Pendiente de entorno y cuentas

- Ejecutar la API completa con AWS y correo reales. Docker Desktop ya fue detectado y utilizado.
- Crear/configurar bucket, identidad AWS y permisos publicos.
- Completar .env local sin divulgar credenciales.
- Aplicar migraciones sobre PostgreSQL real y comprobar los datos anteriores.
- Crear repositorio Docker Hub y Secrets de GitHub.
- Commit/push y workflow verde; inspeccionar imagen publicada.
- Prueba real S3/correo desde Postman y video del alumno.

La instalacion detecto avisos de seguridad en dependencias existentes. Se aplicaron las correcciones compatibles de npm audit fix sin force. Los avisos restantes estan en la cadena de desarrollo de @nestjs/mau; no se migro ni elimino esa herramienta ajena a esta actividad. La imagen final instala solo dependencias de produccion. Consulta npm audit para reevaluar el estado actual.
