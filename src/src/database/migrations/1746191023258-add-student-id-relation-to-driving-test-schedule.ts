import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStudentIdRelationToDrivingTestSchedule1746191023258 implements MigrationInterface {
    name = 'AddStudentIdRelationToDrivingTestSchedule1746191023258'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" DROP COLUMN "student_id"`);
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" ADD "student_id" integer`);
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" ADD CONSTRAINT "FK_d04156f749656f1206fe5428c10" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" DROP CONSTRAINT "FK_d04156f749656f1206fe5428c10"`);
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" DROP COLUMN "student_id"`);
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" ADD "student_id" bigint`);
    }

}
