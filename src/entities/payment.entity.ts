import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Reference } from '../core/constants/enums';

@Entity({ name: 'transactions' })
export class Payment extends BaseEntity {
  @Index()
  @Column({ type: 'bigint', name: 'user_id', nullable: true })
  userId: number;

  @Index()
  @Column({ length: 100, nullable: false })
  email: string;

  @Column({ type: 'decimal', default: 0.0 })
  amount: number;

  @Column({ length: 10 })
  status: string;

  @Index()
  @Column({ length: 40, unique: true })
  reference: string;

  @Index()
  @Column({ length: 20, nullable: true })
  channel: string;

  @Index()
  @Column({ length: 40, nullable: false })
  type: string;

  @Index()
  @Column({ length: 3, nullable: false })
  currency: string;

  @Column({ type: 'text', nullable: false })
  log: string;

  @Index()
  @Column({ length: 40, name: 'item_type', nullable: false })
  itemType: string;

  @Index()
  @Column({ type: 'bigint', name: 'item_id', nullable: true })
  itemId: number;

  @Index()
  @Column({ length: 30, nullable: false })
  provider: string;

  @Index()
  @Column({ type: 'smallint', default: Reference.Unused })
  used: number;

  @Column({ type: 'decimal', default: 0.0 })
  charges: number;

  @Index()
  @Column({ type: 'boolean', default: false })
  refunded: boolean;

  @Column({ type: 'varchar', name: 'success_redirect_url', length: 250, nullable: true })
  successRedirectUrl: string;

  @Column({ type: 'varchar', name: 'failure_redirect_url', length: 250, nullable: true })
  failureRedirectUrl: string;
}
