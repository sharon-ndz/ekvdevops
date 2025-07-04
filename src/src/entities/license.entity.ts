import { Entity, Column, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { LicenseFile } from './license-file.entity';
import { ApprovalLevel, EyeColor, LicenseStatus, Print, YesNo } from '../core/constants/enums';
import { PreRegistration } from './pre-registration.entity';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { Payment } from './payment.entity';

@Entity({ name: 'licenses' })
export class License extends BaseEntity {
  @Index()
  @Column({ type: 'bigint', name: 'pre_registration_id', nullable: true })
  preRegistrationId: number;

  @Column({ type: 'bigint', name: 'transaction_id', nullable: true })
  transactionId: number;

  @Index()
  @Column({ length: 80, nullable: false, unique: true })
  reference: string;

  @Column({ type: 'int', name: 'title_id', nullable: false })
  titleId: number;

  @Column({ length: 50, name: 'first_name', nullable: false })
  firstName: string;

  @Column({ length: 50, name: 'middle_name', nullable: true })
  middleName: string;

  @Column({ length: 50, name: 'last_name', nullable: false })
  lastName: string;

  @Column({ length: 50, name: 'maiden_name', nullable: false })
  maidenName: string;

  @Index()
  @Column({ length: 60, nullable: false })
  email: string;

  @Index()
  @Column({ length: 20, nullable: true })
  phone: string;

  @Index()
  @Column({ length: 100, name: 'license_no', nullable: true, unique: true })
  licenseNo: string;

  @Index()
  @Column({ length: 100, name: 'old_license_no', nullable: true })
  oldLicenseNo: string;

  @Index()
  @Column({ length: 80, name: 'request_type' })
  requestType: string;

  @Index()
  @Column({ nullable: true, name: 'license_class_id' })
  licenseClassId: number;

  @Index()
  @Column({ nullable: true })
  years: number;

  @Column({ length: 20, name: 'date_of_birth', nullable: false })
  dateOfBirth: string;

  @Index()
  @Column({ type: 'int', name: 'gender_id', nullable: false })
  genderId: number;

  @Column({ name: 'nationality_id', nullable: false })
  nationalityId: number;

  @Index()
  @Column({ name: 'state_id', nullable: false })
  stateId: number;

  @Index()
  @Column({ name: 'lga_id', nullable: false })
  lgaId: number;

  @Column({ length: 255, nullable: false })
  address: string;

  @Index()
  @Column({ name: 'station_id', nullable: true })
  stationId: number;

  @Column({ type: 'float4', default: 78 })
  height: number;

  @Column({ type: 'float4', default: 175 })
  weight: number;

  @Column({
    type: 'enum',
    enum: EyeColor,
    nullable: true,
    default: EyeColor.Black,
  })
  eyeColor?: EyeColor;

  @Column({
    type: 'enum',
    enum: YesNo,
    nullable: true,
    default: YesNo.No,
  })
  facialMarks?: YesNo;

  @Column({
    type: 'enum',
    enum: YesNo,
    nullable: true,
    default: YesNo.No,
  })
  glasses?: YesNo;

  @Column({
    type: 'enum',
    enum: YesNo,
    nullable: true,
    default: YesNo.No,
  })
  disability?: YesNo;

  @Column({ length: 200, name: 'serial_number', nullable: true })
  serialNumber: string;

  @Column({ length: 100, name: 'affidavit_no', nullable: true })
  affidavitNo: string;

  @Index()
  @Column({ type: 'varchar', length: 40, default: LicenseStatus.Pending })
  status: string;

  @Index()
  @Column({ type: 'int', name: 'print_status', default: Print.pending })
  printStatus: number;

  @Index()
  @Column({ type: 'bigint', name: 'issued_by_id', nullable: true })
  issuedById: number;

  @Index()
  @Column({ type: 'int', name: 'approval_level', default: ApprovalLevel.LevelOne })
  approvalLevel: number;

  @Column({
    type: 'timestamp',
    name: 'issued_at',
    nullable: true,
  })
  issuedAt: Date;

  @Column({
    type: 'timestamp',
    name: 'expiry_at',
    nullable: true,
  })
  expiryAt: Date;

  @Column({ length: 100, nullable: false })
  source: string;

  @Column({ length: 60, name: 'replacement_reason', nullable: true })
  replacementReason: string;

  @Index()
  @Column({ name: 'is_active', default: 0 })
  isActive: number;

  @OneToMany(() => LicenseFile, (licenseFile) => licenseFile.license)
  licenseFiles?: LicenseFile[];

  @JoinColumn({ name: 'pre_registration_id' })
  @ManyToOne(() => PreRegistration, {
    eager: false,
    nullable: true,
  })
  preRegistration: PreRegistration;

  @JoinColumn({ name: 'transaction_id' })
  @ManyToOne(() => Payment, {
    eager: false,
    nullable: true,
  })
  transaction: Payment;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
