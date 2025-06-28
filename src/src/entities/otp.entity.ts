import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'otps' })
export class Otp extends BaseEntity {
  @Index()
  @Column({ length: 50, nullable: true })
  email: string;

  @Index()
  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 10, unique: true, nullable: false })
  otp: string;

  @Index()
  @Column({
    type: 'timestamp',
    name: 'issued_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  issuedAt: Date;

  @Index()
  @Column({ name: 'is_used', default: false })
  isUsed: boolean;
}
