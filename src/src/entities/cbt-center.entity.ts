import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'cbt_centers' })
export class CbtCenter extends BaseEntity {
  @Column({ length: 80, nullable: false })
  name: string;

  @Column({ name: 'lga_id', nullable: true })
  lgaId: number;

  @Column({ name: 'state_id', nullable: true })
  stateId: number;

  @Column({ name: 'is_active', default: 0 })
  isActive: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  identifier: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 70, nullable: true })
  email?: string;

  @Column({ type: 'int', default: 0 })
  threshold: number;

  @Column({ type: 'int', default: 0 })
  devices: number;

  @Column({ type: 'varchar', nullable: true })
  address?: string;
}
