import { MigrationInterface, QueryRunner } from 'typeorm';

// Adopta tambien las tablas creadas con synchronize en el primer parcial.
export class InitialSchema1792627200000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "SYSTEM_USER" (
      "id" SERIAL PRIMARY KEY, "name" varchar NOT NULL, "email" varchar NOT NULL,
      "password" varchar NOT NULL, "isNotificationEnabled" boolean NOT NULL
    )`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "WATER_REPORT" (
      "id" SERIAL PRIMARY KEY, "address" varchar NOT NULL, "description" varchar NOT NULL,
      "severity" varchar NOT NULL, "reporterPhone" varchar NOT NULL,
      "isResolved" boolean NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now()
    )`);
  }

  async down(): Promise<void> {
    throw new Error('La migracion inicial no se revierte automaticamente para proteger los datos del primer parcial.');
  }
}
