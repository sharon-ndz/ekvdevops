import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiPermission } from '../middlewares/api-client-permission';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ name: 'api_clients' })
export class ApiClient extends BaseEntity {
  @Column({ length: 150, name: 'client_name' })
  clientName: string;

  @Index()
  @Column({ length: 200, name: 'client_identity', unique: true })
  clientIdentity: string;

  @Index()
  @Column({ length: 50, name: 'client_email', unique: true })
  clientEmail: string;

  @Index()
  @Column({ length: 20, name: 'client_phone', unique: true })
  clientPhone: string;

  @Column({ type: 'text' })
  token: string;

  @Index()
  @Column({ name: 'is_active', default: 0 })
  isActive: number;

  @Column({
    type: 'enum',
    enum: ApiPermission,
    default: ApiPermission.canReadLicense,
  })
  permissions: ApiPermission[];

  @Column({ type: 'text', nullable: false })
  hash: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
