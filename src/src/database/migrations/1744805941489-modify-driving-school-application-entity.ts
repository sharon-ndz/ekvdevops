import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyDrivingSchoolApplicationEntity1744805941489 implements MigrationInterface {
    name = 'ModifyDrivingSchoolApplicationEntity1744805941489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driving_school_application_queries" DROP CONSTRAINT "FK_c5066f97a058071b7d0b7264bac"`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" DROP CONSTRAINT "FK_373731975eb1719111ba43d3f68"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c5066f97a058071b7d0b7264ba"`);
        await queryRunner.query(`ALTER TABLE "driving_school_application_queries" RENAME COLUMN "application_id" TO "driving_school_id"`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" DROP COLUMN "inspection_end_date"`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" DROP COLUMN "officer_id"`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" DROP COLUMN "inspection_date"`);
        await queryRunner.query(`ALTER TABLE "driving_schools" ADD "reference" character varying(80)`);
        await queryRunner.query(`ALTER TABLE "driving_schools" ADD CONSTRAINT "UQ_b6050900ae84e59d45b833aaf97" UNIQUE ("reference")`);
        await queryRunner.query(`ALTER TABLE "driving_schools" ADD "status" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "driving_schools" ADD "officer_id" integer`);
        await queryRunner.query(`ALTER TABLE "driving_schools" ADD "inspection_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "driving_schools" ADD "inspection_end_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "driving_school_application_queries" ALTER COLUMN "driving_school_id" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_b6050900ae84e59d45b833aaf9" ON "driving_schools" ("reference") `);
        await queryRunner.query(`CREATE INDEX "IDX_1afe7206f551457424304c16d3" ON "driving_schools" ("status") `);
        await queryRunner.query(`ALTER TABLE "driving_school_application_queries" ADD CONSTRAINT "FK_3d4e8a26e609d8780126dda6381" FOREIGN KEY ("driving_school_id") REFERENCES "driving_schools"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "driving_schools" ADD CONSTRAINT "FK_31271ae1f75b634d48ea00810da" FOREIGN KEY ("officer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driving_schools" DROP CONSTRAINT "FK_31271ae1f75b634d48ea00810da"`);
        await queryRunner.query(`ALTER TABLE "driving_school_application_queries" DROP CONSTRAINT "FK_3d4e8a26e609d8780126dda6381"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1afe7206f551457424304c16d3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b6050900ae84e59d45b833aaf9"`);
        await queryRunner.query(`ALTER TABLE "driving_school_application_queries" ALTER COLUMN "driving_school_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "driving_schools" DROP COLUMN "inspection_end_date"`);
        await queryRunner.query(`ALTER TABLE "driving_schools" DROP COLUMN "inspection_date"`);
        await queryRunner.query(`ALTER TABLE "driving_schools" DROP COLUMN "officer_id"`);
        await queryRunner.query(`ALTER TABLE "driving_schools" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "driving_schools" DROP CONSTRAINT "UQ_b6050900ae84e59d45b833aaf97"`);
        await queryRunner.query(`ALTER TABLE "driving_schools" DROP COLUMN "reference"`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" ADD "inspection_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" ADD "officer_id" integer`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" ADD "inspection_end_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "driving_school_application_queries" RENAME COLUMN "driving_school_id" TO "application_id"`);
        await queryRunner.query(`CREATE INDEX "IDX_c5066f97a058071b7d0b7264ba" ON "driving_school_application_queries" ("application_id") `);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" ADD CONSTRAINT "FK_373731975eb1719111ba43d3f68" FOREIGN KEY ("officer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "driving_school_application_queries" ADD CONSTRAINT "FK_c5066f97a058071b7d0b7264bac" FOREIGN KEY ("application_id") REFERENCES "driving_school_applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
