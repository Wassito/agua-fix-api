# AguaFix API

API NestJS para reportar fugas con fotografias en S3, PostgreSQL y notificaciones por correo.

## Configuracion

Completa `.env` usando `.env.example` como referencia. No publiques credenciales.

## Ejecutar

```sh
npm ci
npm run build
npm run migration:run
npm run start:dev
```

Con Docker:

```sh
docker compose pull api
docker compose up -d
```

## Pruebas

```sh
npm test -- --runInBand
npm run test:acceptance
npm run lint
```
