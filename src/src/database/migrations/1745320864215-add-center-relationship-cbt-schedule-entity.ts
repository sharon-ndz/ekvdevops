import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCenterRelationshipCbtScheduleEntity1745320864215 implements MigrationInterface {
    name = 'AddCenterRelationshipCbtScheduleEntity1745320864215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_53fd61a4c83318ed2e30c11bdb"`);
        await queryRunner.query(`ALTER TABLE "cbt_schedules" ALTER COLUMN "cbt_center_id" TYPE integer`);
        await queryRunner.query(`CREATE INDEX "IDX_53fd61a4c83318ed2e30c11bdb" ON "cbt_schedules" ("cbt_center_id") `);
        await queryRunner.query(`ALTER TABLE "cbt_schedules" ADD CONSTRAINT "FK_53fd61a4c83318ed2e30c11bdba" FOREIGN KEY ("cbt_center_id") REFERENCES "cbt_centers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cbt_schedules" DROP CONSTRAINT "FK_53fd61a4c83318ed2e30c11bdba"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_53fd61a4c83318ed2e30c11bdb"`);
        await queryRunner.query(`ALTER TABLE "cbt_schedules" ALTER COLUMN "cbt_center_id" TYPE bigint`);
        await queryRunner.query(`CREATE INDEX "IDX_53fd61a4c83318ed2e30c11bdb" ON "cbt_schedules" ("cbt_center_id") `);
    }

}
