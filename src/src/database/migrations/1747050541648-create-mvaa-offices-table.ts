import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMvaaOfficesTable1747050541648 implements MigrationInterface {
    name = 'CreateMvaaOfficesTable1747050541648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mvaa_offices" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(80) NOT NULL, "lga_id" integer, "state_id" integer, "is_active" integer NOT NULL DEFAULT '0', "identifier" character varying(50), "phone" character varying(20), "email" character varying(70), "threshold" integer NOT NULL DEFAULT '0', "devices" integer NOT NULL DEFAULT '0', "address" character varying, CONSTRAINT "PK_fd483a1b55c423d083e929745aa" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "mvaa_offices"`);
    }

}
