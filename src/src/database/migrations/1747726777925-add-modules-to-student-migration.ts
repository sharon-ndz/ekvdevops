import { MigrationInterface, QueryRunner } from "typeorm";

export class AddModulesToStudentMigration1747726777925 implements MigrationInterface {
    name = 'AddModulesToStudentMigration1747726777925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" ADD "modules" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "modules"`);
    }

}
