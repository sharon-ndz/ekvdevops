import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdditionalFieldsToApplicantFiles1744892725009 implements MigrationInterface {
    name = 'AddAdditionalFieldsToApplicantFiles1744892725009'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant_files" ADD "driving_school_application_id" integer`);
        await queryRunner.query(`ALTER TABLE "applicant_files" ADD CONSTRAINT "FK_1334609961c28d59a274db574de" FOREIGN KEY ("driving_school_application_id") REFERENCES "driving_school_applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant_files" DROP CONSTRAINT "FK_1334609961c28d59a274db574de"`);
        await queryRunner.query(`ALTER TABLE "applicant_files" DROP COLUMN "driving_school_application_id"`);
    }

}
