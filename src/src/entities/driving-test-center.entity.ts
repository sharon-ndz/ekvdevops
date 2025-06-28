import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'driving_test_centers' })
export class DrivingTestCenter extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 50 })
  identifier: string;

  @Column({ length: 80 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 70, nullable: true })
  email?: string;

  @Column({ name: 'lga_id', nullable: true })
  lgaId: number;

  @Column({ name: 'state_id', nullable: true })
  stateId: number;

  @Column({ type: 'int' })
  threshold: number;

  @Column({ type: 'int' })
  devices: number;

  @Column({ type: 'varchar', nullable: true })
  address?: string;

  @Column({ type: 'int', name: 'is_active', default: 0 })
  isActive: number;
}
