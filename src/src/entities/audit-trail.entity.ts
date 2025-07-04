import { Entity, Column, Index, JoinColumn, ManyToOne, BeforeInsert } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'audit_trails' })
export class AuditTrail extends BaseEntity {
  @Index()
  @Column({ type: 'bigint', name: 'user_id', nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.auditTrails)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 200, name: 'db_action' })
  dbAction: string;

  @Column({ length: 250, name: 'table_name' })
  tableName: string;

  @Index()
  @Column({ type: 'integer', name: 'resource_id' })
  resourceId: number;

  @Column({ type: 'text', nullable: true })
  description: string;
}