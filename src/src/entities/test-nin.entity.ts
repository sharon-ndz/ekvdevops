import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'test_nins' })
export class TestNin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nin: string;

  @Column({ type: 'jsonb', nullable: false })
  data: object;
}
