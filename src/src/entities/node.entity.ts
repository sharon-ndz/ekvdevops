import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { DeviceStatus, DeviceTypes } from '../core/constants/enums';

@Entity({ name: 'nodes' })
export class Node extends BaseEntity {
  @Column({ name: 'device_imei', nullable: false })
  deviceImei: string;

  @Column({ name: 'license', nullable: true })
  license: string;

  @Column({ name: 'device_id', nullable: true })
  deviceId: string;

  @Column({ length: 80, name: 'organization_code', nullable: false })
  organizationCode: string;

  @Column({ length: 150, name: 'organization_name', nullable: false })
  organizationName: string;

  @Column({
    type: 'enum',
    enum: Object.values(DeviceStatus),
    default: DeviceStatus.PENDING,
  })
  status: DeviceStatus;

  @Column({ name: 'rejection_reason', nullable: true })
  rejectionReason: string;

  @Column({ name: 'requester_email', nullable: false })
  requesterEmail: string;

  @Column({ name: 'requester_first_name', nullable: false })
  requesterFirstName: string;

  @Column({ name: 'requester_last_name', nullable: false })
  requesterLastName: string;

  @Column({ name: 'requester_phone', nullable: false })
  requesterPhone: string;

  @Column({
    type: 'enum',
    enum: Object.values(DeviceTypes),
    default: DeviceTypes.ANDROID,
  })
  type: DeviceTypes;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'activated_by' })
  activatedBy: User;

  @OneToMany(() => User, (user) => user.node)
  agents: User[];
}
