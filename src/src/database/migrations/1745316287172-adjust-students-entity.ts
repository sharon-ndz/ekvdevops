import { MigrationInterface, QueryRunner } from "typeorm";

export class AdjustStudentsEntity1745316287172 implements MigrationInterface {
    name = 'AdjustStudentsEntity1745316287172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_7d7f07271ad4ce999880713f05e"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_7d7f07271ad4ce999880713f05e" FOREIGN KEY ("id") REFERENCES "permits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
