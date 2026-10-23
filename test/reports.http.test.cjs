// Pruebas HTTP reales con dependencias externas simuladas: no usa AWS, correo ni BD.
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
Object.assign(process.env, {
  AWS_REGION: 'us-east-1', S3_BUCKET: 'test-bucket',
  MAILER_SERVICE: 'gmail', MAILER_USER: 'test@example.com', MAILER_PASSWORD: 'test-only',
  CREW_EMAIL: 'crew@example.com', DB_HOST: 'localhost', DB_PORT: '5432',
  DB_USER: 'test', DB_PASSWORD: 'test-only', DB_NAME: 'test', DB_TYPE: 'postgres',
  JWT_SECRET: 'test-only', JWT_EXPIRATION: '1h',
});
const { Module } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { ReportsController } = require('../dist/reports/reports.controller');
const { ReportsService } = require('../dist/reports/reports.service');
const { EmailService } = require('../dist/email/email.service');
const { StorageService } = require('../dist/storage/storage.service');
const { InitialSchema1792627200000 } = require('../dist/db/migrations/1792627200000-InitialSchema');
const { AddReportPhotos1792627201000 } = require('../dist/db/migrations/1792627201000-AddReportPhotos');
const { dataSourceOptions } = require('../dist/db/datasource');
let app, baseUrl, calls, reports;
const url = 'https://test-bucket.s3.us-east-1.amazonaws.com/reports/test.jpg';
const fields = { address: 'Calle Prueba 123', description: '<fuga> grande', severity: 'high', reporterPhone: '4491234567' };
class TestModule {}
Module({ controllers: [ReportsController], providers: [
  { provide: StorageService, useValue: { async uploadFile(file, folder) { calls.push('upload'); assert.equal(folder, 'reports'); assert.ok(file.buffer.length); return url; } } },
  { provide: ReportsService, useValue: {
    async createReport(dto, photoUrl) { calls.push('save'); const r = { id: 1, ...dto, photoUrl, repairPhotoUrl: null }; reports.push(r); return r; },
    async findAll() { return reports; },
  } },
  { provide: EmailService, useValue: { async sendEmail(to, subject, html) { calls.push('email'); assert.equal(to, 'crew@example.com'); assert.ok(html.includes(`<img src="${url}"`)); assert.ok(html.includes('&lt;fuga&gt;')); for (const value of [fields.address, fields.reporterPhone, 'Alta']) assert.ok(html.includes(value)); } } },
] })(TestModule);
before(async () => { app = await NestFactory.create(TestModule, { logger: false }); await app.listen(0, '127.0.0.1'); baseUrl = await app.getUrl(); });
after(async () => { await app?.close(); });
beforeEach(() => { calls = []; reports = []; });
function form(type, size = 32) { const body = new FormData(); for (const [k, v] of Object.entries(fields)) body.set(k, v); if (type) body.set('photo', new Blob([Buffer.alloc(size)], { type }), 'foto.jpg'); return body; }
test('POST multipart sube, guarda y envia correo; GET incluye ambas URLs', async () => {
  const response = await fetch(`${baseUrl}/reports`, { method: 'POST', body: form('image/jpeg') });
  assert.equal(response.status, 201); const saved = await response.json();
  assert.equal(saved.photoUrl, url); assert.equal(saved.repairPhotoUrl, null);
  assert.deepEqual(calls, ['upload', 'save', 'email']);
  const listing = await (await fetch(`${baseUrl}/reports`)).json(); assert.deepEqual(listing, [saved]);
});
test('sin foto devuelve 400 sin llamar servicios externos', async () => {
  const response = await fetch(`${baseUrl}/reports`, { method: 'POST', body: form() });
  assert.equal(response.status, 400); assert.deepEqual(calls, []);
});
test('archivo no permitido devuelve 400', async () => {
  const response = await fetch(`${baseUrl}/reports`, { method: 'POST', body: form('text/plain') });
  assert.equal(response.status, 400); assert.deepEqual(calls, []);
});
test('foto mayor a 5 MiB devuelve 413', async () => {
  const response = await fetch(`${baseUrl}/reports`, { method: 'POST', body: form('image/jpeg', 5 * 1024 * 1024 + 1) });
  assert.equal(response.status, 413); assert.deepEqual(calls, []);
});
test('campo obligatorio ausente devuelve 400 antes de subir', async () => {
  const body = form('image/png'); body.delete('address');
  const response = await fetch(`${baseUrl}/reports`, { method: 'POST', body });
  assert.equal(response.status, 400); assert.deepEqual(calls, []);
});
test('migraciones no usan synchronize ni borran tablas al subir', async () => {
  assert.equal(dataSourceOptions.synchronize, false);
  const queries = []; const runner = { async query(sql) { queries.push(sql); } };
  await new InitialSchema1792627200000().up(runner);
  await new AddReportPhotos1792627201000().up(runner);
  assert.equal(queries.length, 3); assert.ok(queries[2].includes('"repairPhotoUrl"'));
  assert.ok(queries.every(sql => !/DROP|DELETE|TRUNCATE/i.test(sql)));
});
