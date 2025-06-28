import { MigrationInterface, QueryRunner } from "typeorm";

export class AddYearsToSchedules1745498510018 implements MigrationInterface {
    name = 'AddYearsToSchedules1745498510018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cbt_schedules" ADD "years" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" ADD "years" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" DROP COLUMN "years"`);
        await queryRunner.query(`ALTER TABLE "cbt_schedules" DROP COLUMN "years"`);
    }

}
