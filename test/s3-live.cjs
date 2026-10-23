// Ejecucion manual: usa las credenciales locales y crea un objeto real de prueba en S3.
require('dotenv').config({ quiet: true });
const fs = require('node:fs');
const { StorageService } = require('../dist/storage/storage.service');

(async () => {
  const buffer = fs.readFileSync('postman/foto-prueba.png');
  const photoUrl = await new StorageService().uploadFile({ buffer, mimetype: 'image/png' }, 'reports');
  console.log('Subida S3 correcta: ' + photoUrl);
  const response = await fetch(photoUrl, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('La URL publica responde HTTP ' + response.status);
  const downloaded = Buffer.from(await response.arrayBuffer());
  if (!downloaded.equals(buffer)) throw new Error('La descarga no coincide con la imagen subida');
  fs.writeFileSync('docs/evidencia-s3.json', JSON.stringify({
    checkedAt: new Date().toISOString(), bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION, photoUrl, publicHttpStatus: response.status,
    contentType: response.headers.get('content-type'), bytes: buffer.length,
  }, null, 2) + '\n');
  console.log('Lectura publica sin credenciales: HTTP 200; imagen verificada.');
})().catch(error => {
  console.error('Verificacion S3: ' + error.name + ': ' + error.message);
  process.exitCode = 1;
});
