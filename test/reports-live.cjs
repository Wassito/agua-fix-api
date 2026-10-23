// Ejecucion manual: crea UN reporte real de prueba y envia el correo configurado.
require('dotenv').config({ quiet: true });
const fs = require('node:fs');
const assert = require('node:assert/strict');
const baseUrl = `http://127.0.0.1:${process.env.API_PORT || 3000}`;
const request = (path, options = {}) => fetch(baseUrl + path, { ...options, signal: AbortSignal.timeout(60000) });

(async () => {
  const initialResponse = await request('/reports');
  assert.equal(initialResponse.status, 200, 'GET inicial debe responder 200');
  const previousReports = await initialResponse.json();
  assert.ok(Array.isArray(previousReports));
  const image = fs.readFileSync('postman/foto-prueba.png');
  const form = new FormData();
  form.set('address', 'PRUEBA TECNICA AguaFix II - sin incidente real');
  form.set('description', 'Validacion de Docker, PostgreSQL, S3 y correo. Registro de prueba.');
  form.set('severity', 'low');
  form.set('reporterPhone', '0000000000');
  form.set('photo', new Blob([image], { type: 'image/png' }), 'foto-prueba.png');
  const createdResponse = await request('/reports', { method: 'POST', body: form });
  assert.equal(createdResponse.status, 201, 'POST con foto debe responder 201; revisar GET antes de reintentar si falla');
  const report = await createdResponse.json();
  assert.ok(report.photoUrl?.includes('/reports/'));
  assert.equal(report.repairPhotoUrl, null);
  const publicResponse = await fetch(report.photoUrl, { signal: AbortSignal.timeout(15000) });
  assert.equal(publicResponse.status, 200);
  assert.ok(Buffer.from(await publicResponse.arrayBuffer()).equals(image));
  const listingResponse = await request('/reports');
  const listing = await listingResponse.json();
  assert.equal(listingResponse.status, 200);
  assert.ok(listing.some(item => item.id === report.id && item.photoUrl === report.photoUrl));
  assert.ok(previousReports.every(previous => listing.some(item => item.id === previous.id)));
  const missing = await request('/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(missing.status, 400);
  await missing.text();
  const evidence = {
    checkedAt: new Date().toISOString(), baseUrl, reportId: report.id,
    postStatus: createdResponse.status, getStatus: listingResponse.status,
    missingPhotoStatus: missing.status, photoUrl: report.photoUrl,
    repairPhotoUrl: report.repairPhotoUrl, publicPhotoStatus: publicResponse.status,
    previousReportsPreserved: previousReports.length,
    smtpAcceptedByApi: true, inboxAndImageVisibility: 'PENDIENTE de confirmacion visual',
  };
  fs.writeFileSync('docs/evidencia-api.json', JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify(evidence, null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
