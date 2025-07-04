import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsTocbtCenterEntity1746102028706 implements MigrationInterface {
    name = 'AddColumnsTocbtCenterEntity1746102028706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cbt_centers" ADD "identifier" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "cbt_centers" ADD "phone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "cbt_centers" ADD "email" character varying(70)`);
        await queryRunner.query(`ALTER TABLE "cbt_centers" ADD "threshold" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "cbt_centers" ADD "devices" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "cbt_centers" ADD "address" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cbt_centers" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "cbt_centers" DROP COLUMN "devices"`);
        await queryRunner.query(`ALTER TABLE "cbt_centers" DROP COLUMN "threshold"`);
        await queryRunner.query(`ALTER TABLE "cbt_centers" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "cbt_centers" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "cbt_centers" DROP COLUMN "identifier"`);
    }

}
