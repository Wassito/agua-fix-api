import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportPhotos1792627201000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "WATER_REPORT" ADD "photoUrl" varchar, ADD "repairPhotoUrl" varchar');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "WATER_REPORT" DROP COLUMN "repairPhotoUrl", DROP COLUMN "photoUrl"');
  }
}
