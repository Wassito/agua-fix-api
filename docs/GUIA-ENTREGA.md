# AguaFix II: implementacion y entrega

Repositorio identificado: https://github.com/Wassito/agua-fix-api

Imagen publicada y verificada: https://hub.docker.com/r/wassit0/agua-fix-api

## Estado real verificado el 23 de octubre de 2026

- Imagen publicada: wassit0/agua-fix-api:latest; workflow inicial exitoso: https://github.com/Wassito/agua-fix-api/actions/runs/39911655264
- Bucket configurado: aguafix-wassit0-fotos-2026, region us-east-2 (Ohio). Las referencias a us-east-1 en los ejemplos son solo ejemplos; conserva us-east-2 en este entorno.
- Compose local usa COMPOSE_PROJECT_NAME=aguafix-api en .env para reutilizar aguafix-api_postgres_data. No cambies ese valor sin revisar el volumen.
- Copia previa local: .tmp/backups/aguafix-api-postgres-before-photos.tar.gz. Contiene datos de la BD; no se versiona ni se entrega publicamente.
- API de la imagen publicada funcionando en http://localhost:3000; reporte de prueba ID 4 creado; los tres reportes anteriores siguen presentes.
- S3 y foto publica verificados, POST 201, GET 200, POST sin foto 400. El servidor SMTP acepto el correo desde Docker.
- El usuario confirmo correo recibido e imagen visible. Falta grabar el video obligatorio desde Postman.

Para pruebas manuales hay una imagen rotulada en postman/foto-prueba.png. Para el video del examen selecciona una fotografia de una fuga, segun el enunciado.

Los scripts test/s3-live.cjs y test/reports-live.cjs se ejecutan SOLO manualmente: crean objetos reales; el segundo tambien crea un reporte y envia correo. No los repitas sin revisar primero GET /reports. El fallo DNS de Nodemailer observado desde Windows no se reproduce en la imagen Docker; usa Docker para la demostracion.

## 1. Que quedo implementado

- POST /reports recibe multipart/form-data con address, description, severity, reporterPhone y archivo photo obligatorio.
- StorageModule exporta StorageService; uploadFile(file, folder): Promise<string> sube a S3 con UUID y devuelve URL publica.
- Prefijo reports/; JPEG, PNG o WebP de hasta 5 MiB. Se valida el MIME declarado, no se analiza la firma binaria del archivo.
- WATER_REPORT incorpora photoUrl y repairPhotoUrl. Los reportes nuevos exigen foto en la API; los antiguos conservan null para no inventar URLs ni perder datos.
- GET /reports devuelve ambas columnas. repairPhotoUrl queda null; el examen no describe un endpoint para cargar una foto de reparacion.
- El correo conserva los datos y muestra la fotografia con img.
- synchronize esta desactivado. Dos migraciones permiten crear una base vacia o adoptar las tablas del primer parcial y agregar las columnas.
- Dockerfile multietapa node:22-alpine, usuario node y CMD node dist/main. La imagen no contiene .env ni compose.yaml.
- Compose inicia PostgreSQL, espera su healthcheck y ejecuta migraciones antes de arrancar la API publicada.
- Actions comprueba compilacion y pruebas, hace login con Secrets y publica latest en cada push a main.

No se cambio el acceso publico original a /reports. Registro/login y JWT se conservan. Si el primer parcial exigia proteger reportes, hay que contrastar ese enunciado antes de cambiar el acceso.

## 2. Intervencion: herramientas y cuentas

Necesitas Node 22, npm, Git, Docker Desktop funcionando con contenedores Linux, Postman, navegador, GitHub, Docker Hub, AWS y correo.

Node y Git ya estaban disponibles durante la implementacion. Posteriormente se confirmo Docker Desktop funcionando y se construyo la imagen local. Si necesitas reinstalarlo, utiliza https://www.docker.com/products/docker-desktop/ y sigue sus instrucciones si pide WSL 2 o reiniciar. Abre Docker Desktop y una terminal nueva.

```powershell
node --version
docker version
docker compose version
```

Resultado: Node 22 y Docker mostrando cliente y servidor; Compose mostrando version. Si solo aparece cliente, espera a que Docker Desktop inicie el motor. No necesitas Redis, PostGIS ni Mapbox.

## 3. Intervencion: AWS S3 e IAM

Si tu escuela ofrece AWS Academy/Learner Lab, inicia primero el laboratorio y usa sus permisos y credenciales temporales; pueden restringir buckets publicos. Si no, necesitas una cuenta AWS activa. No crees claves de acceso del usuario raiz.

1. En S3 crea un bucket de proposito general con nombre unico sin puntos, por ejemplo aguafix-wassit0-fotos-2026. Elige una region y anotala exactamente, por ejemplo us-east-1.
2. Deja Object Ownership en Bucket owner enforced (ACL deshabilitadas) y cifrado SSE-S3. La aplicacion no utiliza ACL.
3. Para cumplir la URL publica permanente del examen, permite lectura publica SOLO de reports/* mediante bucket policy. En Block Public Access conserva los bloqueos de ACL y permite las politicas publicas (BlockPublicPolicy y RestrictPublicBuckets deben permitirlo). El bloqueo a nivel cuenta u organizacion tambien puede impedirlo; no cambies politicas de una cuenta compartida sin su administrador.
4. En Permissions → Bucket policy pega docs/aws/bucket-public-read.json, reemplazando el nombre del bucket si usas uno diferente; el archivo ya apunta a aguafix-wassit0-fotos-2026. La politica concede unicamente s3:GetObject sobre reports/*, nunca escritura publica.
5. En IAM crea una identidad para esta aplicacion. Para trabajo local puedes crear un usuario sin acceso a consola y asignarle docs/aws/iam-upload.json, sustituyendo el bucket. Esta politica concede solo s3:PutObject en reports/*.
6. Crea su access key para el uso local de la aplicacion. Guarda Access key ID y Secret access key unicamente en tu .env. Si son credenciales temporales, necesitas tambien AWS_SESSION_TOKEN y renovarlas al expirar.
7. Si una politica de la escuela impide lectura publica, informa al profesor: una URL firmada que caduca no equivale a la URL publica permanente solicitada. No cambies el requisito silenciosamente.

Debes obtener: nombre del bucket, region, credenciales de la identidad y politica de lectura aplicada. No envies claves al chat. Usa una foto de prueba sin informacion personal: cualquier persona con su URL podra verla. No se necesita configurar CORS para una subida servidor-a-servidor ni para mostrar una imagen normal en el correo.

Referencias: [lectura publica](https://docs.aws.amazon.com/AmazonS3/latest/userguide/granting-public-access.html), [bloqueos de acceso](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html).

## 4. Intervencion: completar .env local

Ya existe un .env local: NO lo sobrescribas. Usa .env.example como lista de variables y agrega las faltantes. No incluyas valores reales en .env.example.

- AWS_REGION, S3_BUCKET: los datos anteriores.
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY: claves locales. AWS_SESSION_TOKEN solo para credenciales temporales; elimina la linea si no aplica.
- JWT_SECRET: secreto aleatorio largo. Puedes generar uno localmente con el comando siguiente y pegarlo en .env; no lo grabes en el video.
- JWT_EXPIRATION=1h.
- DOCKER_IMAGE=wassit0/agua-fix-api y API_PORT=3000.
- Conserva DB_NAME, DB_USER, DB_PASSWORD y las variables de correo existentes. DB_HOST=localhost para ejecutar con npm; Compose lo sustituye por postgres dentro del contenedor.
- MAILER_SERVICE, MAILER_USER, MAILER_PASSWORD y CREW_EMAIL deben permitir enviar correo real a la cuadrilla. En Gmail utiliza una contrasena de aplicacion cuando tu cuenta lo permita, no tu contrasena normal.

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Las claves se inyectan en ejecucion con env_file; nunca mediante COPY, ARG o ENV del Dockerfile. GitHub no necesita claves AWS ni del correo para construir la imagen.

## 5. Pruebas locales y migraciones

Desde la carpeta del proyecto:

```powershell
npm ci
npm run build
npm test -- --runInBand
npm run test:acceptance
npm run lint
```

Las pruebas de aceptacion levantan HTTP real con dependencias simuladas. No demuestran conectividad real con S3, PostgreSQL o correo. La opcion experimental-vm-modules de Jest permite probar las dependencias ESM de NestJS 12 con Node 22.

Se verificaron tambien las migraciones en un PostgreSQL 16 temporal y aislado con `node test/docker-migrations.cjs`. Esta prueba requiere Docker, crea su propio contenedor sin volumen y lo elimina al terminar; no lee el .env ni toca la BD del alumno. La imagen local construida se llama wassit0/agua-fix-api:local; no equivale a latest publicado.

Ese script tambien inicia la imagen local y verifica GET, rechazo de POST sin foto y registro/login con JWT contra la BD aislada. Para repetirlo, primero construye la imagen con `docker build -t wassit0/agua-fix-api:local .`. Al finalizar elimina unicamente sus contenedores y red temporales. No prueba el envio real de correo ni la subida real a S3.

Antes de aplicar migraciones a la base del primer parcial, haz una copia con tu herramienta PostgreSQL (pgAdmin/DBeaver/pg_dump). Conserva el nombre del proyecto Compose y el volumen actuales; el compose mantiene postgres_data y no borra tablas existentes. No ejecutes docker compose down -v: elimina los datos.

```powershell
docker compose up -d postgres
npm run migration:run
npm run start:dev
```

Estos comandos requieren .env completo incluso para migraciones. Si postgres ya existe fuera de Docker, puedes usarlo directamente con DB_HOST y DB_PORT correctos. Si el puerto 5432 esta ocupado, no inicies otra instancia sobre el mismo puerto.

Resultado: dos migraciones registradas en la tabla migrations, WATER_REPORT con ambas URLs y registros previos conservados. La migracion inicial usa CREATE TABLE IF NOT EXISTS y presupone que las tablas antiguas tienen la estructura de este repositorio. Si tu BD fue modificada manualmente, revisa su esquema antes. Su down se bloquea expresamente para no borrar datos heredados. La migracion de fotos puede revertirse, pero al hacerlo se pierden las URLs: no la reviertas como prueba sobre datos reales.

## 6. Intervencion: Docker Hub y GitHub

1. En Docker Hub crea repositorio PUBLICO wassit0/agua-fix-api.
2. En la configuracion de Docker Hub crea un personal access token con permiso de escritura para publicar. Copialo una sola vez a GitHub, no al codigo.
3. En https://github.com/Wassito/agua-fix-api/settings/secrets/actions crea los repository secrets DOCKER_USER=wassit0 y DOCKER_PASSWORD=<token>.
4. El nombre de imagen predeterminado es agua-fix-api. Solo si lo cambias, crea la Actions variable DOCKER_IMAGE_NAME con el nuevo nombre y actualiza DOCKER_IMAGE local.
5. Confirma que GitHub Actions esta habilitado y que puedes hacer push a main.

Referencia: https://docs.docker.com/guides/gha/

## 7. Preparar el commit y publicar (tambien primera parte del video)

El video debe mostrar un cambio de codigo, commit y push. Puedes grabar la revision y el commit de los cambios preparados aqui; si ensayas antes y ya los publicaste, haz durante la grabacion un cambio de texto visible en src/app.service.ts, guardalo y crea otro commit.

```powershell
git status --short
git check-ignore .env
git ls-files .env
```

Resultado: check-ignore muestra .env y ls-files no devuelve nada. Si Git avisa dubious ownership en TU terminal, comprueba que esta es tu carpeta y ejecuta git config --global --add safe.directory con la ruta exacta del proyecto. No uses safe.directory=*.

Revisa los cambios, asegurate de estar en main y agrega los archivos explicitamente:

```powershell
git add src test docs postman .github Dockerfile .dockerignore .env.example compose.yaml package.json package-lock.json tsconfig.json jest.config.ts README.md
git diff --cached --stat
git commit -m "feat: fotos de reportes en S3 y publicacion Docker automatica"
git push origin main
```

El commit inicial c4e1264 ya se publico y su workflow termino en verde. Para el video hace falta grabar otro cambio de codigo con su commit/push y la nueva ejecucion. No grabes .env, tokens, ni la pantalla con claves. Si Git pide autenticarte, usa su ventana de inicio de sesion.

En GitHub abre Actions y el workflow Build and publish AguaFix. Espera a que compile, pruebe y publique en verde. Luego abre Docker Hub → Tags: latest debe mostrar una fecha nueva. No basta con que se construya localmente.

## 8. Ejecutar la imagen publicada

Deten el servidor local con Ctrl+C si usa el mismo puerto. Desde el proyecto:

```powershell
docker compose pull api
docker compose up -d
docker compose logs --tail 100 api
```

Resultado: PostgreSQL saludable, migraciones aplicadas y API escuchando en http://localhost:3000. No muestres docker compose config en el video: puede imprimir credenciales expandidas.

Para verificar que no se incluyeron los archivos prohibidos:

```powershell
docker run --rm --entrypoint sh wassit0/agua-fix-api:latest -c 'test ! -e /app/.env && test ! -e /app/compose.yaml && echo Archivos-excluidos-OK'
```

## 9. Postman y evidencia funcional

Importa postman/AguaFix-II.postman_collection.json. La variable baseUrl ya vale http://localhost:3000. En Crear reporte con foto abre Body → form-data y selecciona una fotografia REAL en photo (tipo File). Los demas campos son Text. No fijes Content-Type manualmente: Postman agrega el boundary.

Ejemplo de datos: address=Calle Prueba 123; description=Fuga visible en banqueta; severity=high; reporterPhone=4491234567. Usa datos ficticios para la demostracion.

1. Envia POST /reports: espera 201 y photoUrl publica con /reports/<uuid>.jpg (o png/webp); repairPhotoUrl=null.
2. En S3 abre el bucket y reports/: debe existir el objeto nuevo. Abre la URL en una ventana privada sin sesion AWS: debe mostrar la foto.
3. Abre el correo de la cuadrilla: revisa direccion, descripcion, severidad, telefono y foto visible. Si el cliente bloquea imagenes externas, permite mostrarlas.
4. Envia GET /reports: debe incluir ambas URLs y seguir mostrando los reportes antiguos.
5. Prueba Crear reporte sin foto: debe devolver 400. Prueba archivo incorrecto o mayor a 5 MiB si quieres mostrar validaciones adicionales.
6. Prueba registro e inicio de sesion con un usuario de prueba para comprobar el primer parcial.

El flujo conserva el comportamiento anterior: guarda el reporte y despues envia correo. Si falla correo, puede quedar el reporte guardado aunque la peticion devuelva error. Revisa GET antes de reintentar para evitar duplicados. Si falla la BD despues de subir, puede quedar un objeto sin reporte; revisalo en S3 durante las pruebas.

## 10. Guion del video y entregables

Prepara las cuentas y ensaya antes. Graba en este orden obligatorio:

1. Editor: cambio visible en codigo; terminal: commit y push a main.
2. Navegador: GitHub Actions ejecutandose y finalizando verde para ese mismo commit.
3. Docker Hub: repositorio, tag latest y fecha de actualizacion.
4. Terminal: pull y arranque de la imagen; Postman: POST /reports con photo y respuesta 201; S3: objeto; correo: foto visible.

Como evidencia extra muestra GET con photoUrl y repairPhotoUrl, y POST sin foto devolviendo 400. Puedes usar Xbox Game Bar o tu grabador habitual; evita capturar claves. Si una sola ventana no permite mostrar navegador y Postman, usa un grabador que capture pantalla completa.

Entrega:

- URL Git: https://github.com/Wassito/agua-fix-api
- URL Docker Hub: https://hub.docker.com/r/wassit0/agua-fix-api (comprueba que existe y tiene latest publicado).
- Video: archivo o enlace segun tu plataforma escolar; si es enlace, comprueba sus permisos desde una ventana privada.

Ninguna URL prevista de imagen o video representa evidencia hasta que se haya publicado y verificado. Completa docs/ENTREGABLES.md con el commit, fecha y enlace reales.

## 11. Problemas frecuentes

- Actions login falla: revisa nombres exactos de Secrets, usuario en minusculas y token con escritura.
- S3 AccessDenied al subir: revisa identidad, s3:PutObject sobre el bucket/prefijo correcto y las restricciones del laboratorio.
- S3 AccessDenied al abrir URL: revisa GetObject publico y Block Public Access de bucket/cuenta. No se soluciona agregando CORS.
- Token AWS expirado: renueva las tres variables temporales y recrea el contenedor con docker compose up -d --force-recreate api.
- Conexion a BD rechazada dentro del contenedor: DB_HOST debe ser postgres; Compose ya lo establece.
- PostgreSQL password authentication failed: las variables POSTGRES_* no cambian una contrasena ya guardada en el volumen. Usa las credenciales originales o cambialas correctamente en PostgreSQL; no borres el volumen para resolverlo.
- Puerto ocupado: detiene la instancia anterior o cambia API_PORT y baseUrl de Postman.
- No aparece foto: selecciona photo como File, revisa la URL en privado y permite imagenes externas en el correo.
