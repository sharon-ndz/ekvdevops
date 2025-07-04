import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'payment_settings' })
export class PaymentSetting extends BaseEntity {
  @Column({ type: 'bigint', name: 'state_id', nullable: false })
  stateId: number;

  @Column({ type: 'bigint', name: 'lga_id', nullable: false })
  lgaId: number;

  @Column({ type: 'bigint', name: 'driving_school_id', nullable: true })
  drivingSchoolId: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'decimal', default: 0.0 })
  amount: number;

  @Column({ type: 'decimal', default: 0.0 })
  charges: number;

  @Column({ type: 'varchar', length: 150, nullable: false })
  type: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  prefix: string;

  @Column({ type: 'int', default: 1 })
  status: number;

  @Column({ length: 3, nullable: false })
  currency: string;
}
