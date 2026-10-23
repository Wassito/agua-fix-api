# Entregables AguaFix II

- Repositorio: https://github.com/Wassito/agua-fix-api
- Imagen publicada: https://hub.docker.com/r/wassit0/agua-fix-api
- Tag requerido: latest
- Commit mostrado en video: PENDIENTE
- Ejecucion inicial de Actions en verde: https://github.com/Wassito/agua-fix-api/actions/runs/39911655264 (commit c4e1264)
- Publicacion inicial de imagen: 23 de octubre de 2026, 00:30, America/Mexico_City
- Video (archivo o URL): PENDIENTE

## Validacion final real (marcar solo despues de comprobar)

- [ ] Registro/login y reportes anteriores funcionan.
- [x] Migraciones aplicadas con synchronize=false.
- [x] POST multipart con photo devuelve 201 y photoUrl.
- [x] POST sin photo devuelve 400.
- [x] GET devuelve photoUrl y repairPhotoUrl.
- [x] Foto accesible sin autenticacion AWS.
- [x] Correo recibido con foto visible.
- [x] .env no esta versionado ni en la imagen; compose.yaml no esta en la imagen.
- [ ] Actions verde y latest publicado para el commit mostrado.
- [ ] Video muestra el orden solicitado y no expone credenciales.

Evidencia tecnica real: evidencia-api.json y evidencia-s3.json. El usuario confirmo que recibio el correo con la imagen visible. El video y el commit mostrado en el siguen pendientes.
