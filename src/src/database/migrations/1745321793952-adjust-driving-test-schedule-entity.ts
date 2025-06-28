import { MigrationInterface, QueryRunner } from "typeorm";

export class AdjustDrivingTestScheduleEntity1745321793952 implements MigrationInterface {
    name = 'AdjustDrivingTestScheduleEntity1745321793952'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" ALTER COLUMN "pre_registration_id" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" ADD CONSTRAINT "FK_2318bbd77abc42c9ff5bd6c1bcc" FOREIGN KEY ("pre_registration_id") REFERENCES "pre_registrations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" DROP CONSTRAINT "FK_2318bbd77abc42c9ff5bd6c1bcc"`);
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" ALTER COLUMN "pre_registration_id" TYPE bigint`);
    }

}
