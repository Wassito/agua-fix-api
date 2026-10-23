// Valida las migraciones con PostgreSQL aislado; nunca usa la BD ni el .env del alumno.
const { execFileSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const assert = require('node:assert/strict');
const { DataSource } = require('typeorm');
const { Report } = require('../dist/reports/entities/report.entity');
const { User } = require('../dist/users/entities/user.entity');
const { InitialSchema1792627200000 } = require('../dist/db/migrations/1792627200000-InitialSchema');
const { AddReportPhotos1792627201000 } = require('../dist/db/migrations/1792627201000-AddReportPhotos');
const password = randomBytes(32).toString('hex');
let container, connection, network, api;
const keepAlive = setInterval(() => {}, 1000);
const request = (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(5000) });
const testEnvironment = { ...process.env, POSTGRES_PASSWORD: password,
  DB_PASSWORD: password, DB_USER: 'postgres', DB_NAME: 'postgres', DB_HOST: 'validation-db', DB_PORT: '5432', DB_TYPE: 'postgres',
  MAILER_SERVICE: 'gmail', MAILER_USER: 'test@example.com', MAILER_PASSWORD: 'test-only', CREW_EMAIL: 'crew@example.com',
  JWT_SECRET: randomBytes(48).toString('hex'), JWT_EXPIRATION: '1h', AWS_REGION: 'us-east-1', S3_BUCKET: 'test-only-bucket',
};
const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8', env: testEnvironment }).trim();
(async () => {
  try {
    network = docker('network', 'create', `aguafix-validation-${randomBytes(6).toString('hex')}`);
    container = docker('run', '--rm', '-d', '--network', network, '--network-alias', 'validation-db', '-p', '127.0.0.1::5432', '-e', 'POSTGRES_PASSWORD', 'postgres:16');
    const port = Number(docker('port', container, '5432/tcp').split(':').at(-1));
    for (let attempt = 0; attempt < 30; attempt++) {
      try { docker('exec', container, 'pg_isready', '-U', 'postgres'); break; }
      catch { await new Promise(resolve => setTimeout(resolve, 1000)); }
    }
    for (let attempt = 0; attempt < 30; attempt++) {
      try {
        connection = await new DataSource({ type: 'postgres', host: '127.0.0.1', port,
          username: 'postgres', password, database: 'postgres', synchronize: false,
          entities: [Report, User], migrations: [InitialSchema1792627200000, AddReportPhotos1792627201000],
        }).initialize();
        break;
      } catch (error) {
        if (attempt === 29) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    // Base vacia: ambas migraciones y ejecucion repetida sin cambios.
    assert.equal((await connection.runMigrations()).length, 2);
    assert.equal((await connection.runMigrations()).length, 0);
    await connection.getRepository(Report).save({ address: 'Prueba', description: 'Fuga', severity: 'high', reporterPhone: '123', photoUrl: 'https://example.com/reports/test.jpg', repairPhotoUrl: null });
    assert.equal((await connection.getRepository(Report).find())[0].repairPhotoUrl, null);
    // Reinicia SOLO el esquema del contenedor temporal para simular primer parcial.
    await connection.query('DROP SCHEMA public CASCADE');
    await connection.query('CREATE SCHEMA public');
    await new InitialSchema1792627200000().up({ query: sql => connection.query(sql) });
    await connection.query(`INSERT INTO "WATER_REPORT" ("address","description","severity","reporterPhone") VALUES ('Anterior','Conservar','low','123')`);
    await connection.query(`INSERT INTO "SYSTEM_USER" ("name","email","password","isNotificationEnabled") VALUES ('Anterior','test@example.com','test-hash',true)`);
    assert.equal((await connection.runMigrations()).length, 2);
    const previous = (await connection.getRepository(Report).find())[0];
    assert.equal(previous.address, 'Anterior'); assert.equal(previous.photoUrl, null); assert.equal(previous.repairPhotoUrl, null);
    assert.equal(await connection.getRepository(User).count(), 1);
    console.log('OK: base nueva, migraciones repetibles y datos del primer parcial conservados.');
    const keys = ['DB_PASSWORD','DB_USER','DB_NAME','DB_HOST','DB_PORT','DB_TYPE','MAILER_SERVICE','MAILER_USER','MAILER_PASSWORD','CREW_EMAIL','JWT_SECRET','JWT_EXPIRATION','AWS_REGION','S3_BUCKET'];
    api = docker('run', '--rm', '-d', '--network', network, '-p', '127.0.0.1::3000', ...keys.flatMap(key => ['-e', key]),
      'wassit0/agua-fix-api:local', 'sh', '-c', 'node node_modules/typeorm/cli.js migration:run -d dist/db/datasource.js && exec node dist/main');
    const apiPort = Number(docker('port', api, '3000/tcp').split(':').at(-1));
    const baseUrl = `http://127.0.0.1:${apiPort}`;
    for (let attempt = 0; attempt < 30; attempt++) {
      try { const response = await request(baseUrl); assert.equal(response.status, 200); await response.text(); break; }
      catch (error) { if (attempt === 29) throw error; await new Promise(resolve => setTimeout(resolve, 1000)); }
    }
    const listing = await (await request(`${baseUrl}/reports`)).json();
    assert.equal(listing[0].address, 'Anterior'); assert.equal(listing[0].photoUrl, null); assert.equal(listing[0].repairPhotoUrl, null);
    const noPhoto = await request(`${baseUrl}/reports`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(noPhoto.status, 400);
    await noPhoto.text();
    const user = { name: 'Test', email: 'integration@example.com', password: 'Test-only-12345', isNotificationEnabled: true };
    const register = await request(`${baseUrl}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) });
    assert.equal(register.status, 201); assert.ok((await register.json()).token);
    const login = await request(`${baseUrl}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) });
    assert.equal(login.status, 201); assert.ok((await login.json()).token);
    console.log('OK: imagen arranca con migraciones, GET muestra datos previos, POST sin foto da 400 y registro/login generan JWT.');
    docker('exec', api, 'sh', '-c', 'test ! -e /app/.env && test ! -e /app/compose.yaml');
    console.log('OK: .env y compose.yaml excluidos de la imagen.');
  } finally {
    if (connection?.isInitialized) await connection.destroy();
    if (api) docker('stop', api);
    if (container) docker('stop', container);
    if (network) docker('network', 'rm', network);
    clearInterval(keepAlive);
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
