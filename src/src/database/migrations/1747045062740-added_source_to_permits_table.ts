import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedSourceToPermitsTable1747045062740 implements MigrationInterface {
  name = 'AddedSourceToPermitsTable1747045062740';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permits" ADD "source" character varying(100) NOT NULL DEFAULT 'public_portal'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "permits" DROP COLUMN "source"`);
  }
}
