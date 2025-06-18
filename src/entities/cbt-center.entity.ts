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
}
