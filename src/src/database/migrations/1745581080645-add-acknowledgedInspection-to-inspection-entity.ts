import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAcknowledgedInspectionToInspectionEntity1745581080645 implements MigrationInterface {
    name = 'AddAcknowledgedInspectionToInspectionEntity1745581080645'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inspections" ADD "acknowledged_inspection" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inspections" DROP COLUMN "acknowledged_inspection"`);
    }

}
