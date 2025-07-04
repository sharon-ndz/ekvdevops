import { MigrationInterface, QueryRunner } from "typeorm";

export class AdjusmtentsToDsaLicenseMigration1748519617795 implements MigrationInterface {
    name = 'AdjusmtentsToDsaLicenseMigration1748519617795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "licenses" DROP COLUMN "eyes"`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" ADD "height" real NOT NULL DEFAULT '78'`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" ADD "weight" real NOT NULL DEFAULT '175'`);
        await queryRunner.query(`CREATE TYPE "public"."driving_school_applications_eyecolor_enum" AS ENUM('BLUE', 'BLACK', 'GREEN', 'BROWN', 'HAZEL', 'GRAY')`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" ADD "eyeColor" "public"."driving_school_applications_eyecolor_enum" DEFAULT 'BLACK'`);
        await queryRunner.query(`CREATE TYPE "public"."driving_school_applications_facialmarks_enum" AS ENUM('Yes', 'No', 'yes', 'no')`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" ADD "facialMarks" "public"."driving_school_applications_facialmarks_enum" DEFAULT 'no'`);
        await queryRunner.query(`CREATE TYPE "public"."driving_school_applications_glasses_enum" AS ENUM('Yes', 'No', 'yes', 'no')`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" ADD "glasses" "public"."driving_school_applications_glasses_enum" DEFAULT 'no'`);
        await queryRunner.query(`CREATE TYPE "public"."driving_school_applications_disability_enum" AS ENUM('Yes', 'No', 'yes', 'no')`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" ADD "disability" "public"."driving_school_applications_disability_enum" DEFAULT 'no'`);
        await queryRunner.query(`CREATE TYPE "public"."licenses_eyecolor_enum" AS ENUM('BLUE', 'BLACK', 'GREEN', 'BROWN', 'HAZEL', 'GRAY')`);
        await queryRunner.query(`ALTER TABLE "licenses" ADD "eyeColor" "public"."licenses_eyecolor_enum" DEFAULT 'BLACK'`);
        await queryRunner.query(`CREATE TYPE "public"."licenses_facialmarks_enum" AS ENUM('Yes', 'No', 'yes', 'no')`);
        await queryRunner.query(`ALTER TABLE "licenses" ADD "facialMarks" "public"."licenses_facialmarks_enum" DEFAULT 'no'`);
        await queryRunner.query(`CREATE TYPE "public"."licenses_glasses_enum" AS ENUM('Yes', 'No', 'yes', 'no')`);
        await queryRunner.query(`ALTER TABLE "licenses" ADD "glasses" "public"."licenses_glasses_enum" DEFAULT 'no'`);
        await queryRunner.query(`CREATE TYPE "public"."licenses_disability_enum" AS ENUM('Yes', 'No', 'yes', 'no')`);
        await queryRunner.query(`ALTER TABLE "licenses" ADD "disability" "public"."licenses_disability_enum" DEFAULT 'no'`);
        await queryRunner.query(`ALTER TABLE "licenses" ALTER COLUMN "height" SET DEFAULT '78'`);
        await queryRunner.query(`ALTER TABLE "licenses" ALTER COLUMN "weight" SET DEFAULT '175'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "licenses" ALTER COLUMN "weight" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "licenses" ALTER COLUMN "height" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "licenses" DROP COLUMN "disability"`);
        await queryRunner.query(`DROP TYPE "public"."licenses_disability_enum"`);
        await queryRunner.query(`ALTER TABLE "licenses" DROP COLUMN "glasses"`);
        await queryRunner.query(`DROP TYPE "public"."licenses_glasses_enum"`);
        await queryRunner.query(`ALTER TABLE "licenses" DROP COLUMN "facialMarks"`);
        await queryRunner.query(`DROP TYPE "public"."licenses_facialmarks_enum"`);
        await queryRunner.query(`ALTER TABLE "licenses" DROP COLUMN "eyeColor"`);
        await queryRunner.query(`DROP TYPE "public"."licenses_eyecolor_enum"`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" DROP COLUMN "disability"`);
        await queryRunner.query(`DROP TYPE "public"."driving_school_applications_disability_enum"`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" DROP COLUMN "glasses"`);
        await queryRunner.query(`DROP TYPE "public"."driving_school_applications_glasses_enum"`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" DROP COLUMN "facialMarks"`);
        await queryRunner.query(`DROP TYPE "public"."driving_school_applications_facialmarks_enum"`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" DROP COLUMN "eyeColor"`);
        await queryRunner.query(`DROP TYPE "public"."driving_school_applications_eyecolor_enum"`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" DROP COLUMN "weight"`);
        await queryRunner.query(`ALTER TABLE "driving_school_applications" DROP COLUMN "height"`);
        await queryRunner.query(`ALTER TABLE "licenses" ADD "eyes" character varying(20)`);
    }

}
