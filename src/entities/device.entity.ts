import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { DeviceStatus, DeviceTypes } from '../core/constants/enums';

@Entity({ name: 'devices' })
export class Device extends BaseEntity {
  @Index()
  @Column({ length: 80, name: 'organization_code', nullable: false })
  organizationCode: string;

  @Column({ length: 150, name: 'organization_name', nullable: false })
  organizationName: string;

  @Column({ length: 150, name: 'license', nullable: false })
  license: string;

  @Column({ name: 'device_id', nullable: true })
  deviceId: string;

  @Column({ length: 100, name: 'device_imei', nullable: false, unique: true })
  deviceImei: string;

  @Column({
    type: 'enum',
    enum: Object.values(DeviceTypes),
    default: DeviceTypes.ANDROID,
  })
  type: DeviceTypes;

  @Index()
  @Column({
    type: 'enum',
    enum: Object.values(DeviceStatus),
    default: DeviceStatus.PENDING,
  })
  status: DeviceStatus;
}
