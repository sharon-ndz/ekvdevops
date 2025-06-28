import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDrivingTestCenterMigration1745322244759 implements MigrationInterface {
    name = 'AddDrivingTestCenterMigration1745322244759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" ALTER COLUMN "driving_test_center_id" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" ADD CONSTRAINT "FK_92ae409ad5c69395b110e63c9c6" FOREIGN KEY ("driving_test_center_id") REFERENCES "driving_test_centers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" DROP CONSTRAINT "FK_92ae409ad5c69395b110e63c9c6"`);
        await queryRunner.query(`ALTER TABLE "driving_test_schedules" ALTER COLUMN "driving_test_center_id" TYPE bigint`);
    }

}
