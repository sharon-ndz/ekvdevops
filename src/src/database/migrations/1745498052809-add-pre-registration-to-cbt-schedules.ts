import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPreRegistrationToCbtSchedules1745498052809 implements MigrationInterface {
    name = 'AddPreRegistrationToCbtSchedules1745498052809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cbt_schedules" ADD "pre_registration_id" integer`);
        await queryRunner.query(`ALTER TABLE "cbt_schedules" ADD CONSTRAINT "UQ_4119af6ebf2d26370ab9115ecf9" UNIQUE ("pre_registration_id")`);
        await queryRunner.query(`ALTER TABLE "cbt_schedules" ADD CONSTRAINT "FK_4119af6ebf2d26370ab9115ecf9" FOREIGN KEY ("pre_registration_id") REFERENCES "pre_registrations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cbt_schedules" DROP CONSTRAINT "FK_4119af6ebf2d26370ab9115ecf9"`);
        await queryRunner.query(`ALTER TABLE "cbt_schedules" DROP CONSTRAINT "UQ_4119af6ebf2d26370ab9115ecf9"`);
        await queryRunner.query(`ALTER TABLE "cbt_schedules" DROP COLUMN "pre_registration_id"`);
    }

}
