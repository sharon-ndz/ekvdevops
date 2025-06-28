import { Entity, Column, Index, JoinColumn, ManyToOne, OneToOne, Relation } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { Payment } from './payment.entity';
import { Student } from './student.entity';
import { Print, Sources } from '../core/constants/enums';

@Entity({ name: 'permits' })
export class Permit extends BaseEntity {
  @Index()
  @Column({ type: 'bigint', name: 'student_id', nullable: false })
  studentId: number;

  @Index()
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
  @Column({ length: 100, name: 'permit_no', nullable: true, unique: true })
  permitNo: string;

  @Index()
  @Column({ length: 100, name: 'old_permit_no', nullable: true })
  oldPermitNo: string;

  @Index()
  @Column({ length: 80, name: 'request_type', nullable: true })
  requestType: string;

  @Index()
  @Column({ nullable: true, name: 'permit_class_id' })
  permitClassId: number;

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

  @Column({ length: 100, nullable: false, default: Sources.PublicPortal })
  source: string;

  @Index()
  @Column({ name: 'station_id', nullable: true })
  stationId: number;

  @Column({ length: 200, name: 'serial_number', nullable: true })
  serialNumber: string;

  @Index()
  @Column({ type: 'int', name: 'print_status', default: Print.pending })
  printStatus: number;

  @Index()
  @Column({ type: 'bigint', name: 'issued_by_id', nullable: true })
  issuedById: number;

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

  @Column({ length: 60, name: 'replacement_reason', nullable: true })
  replacementReason: string;

  @Index()
  @Column({ name: 'is_active', default: 0 })
  isActive: number;

  @JoinColumn({ name: 'student_id' })
  @OneToOne(() => Student, (student) => student.permit)
  student: Relation<Student>;

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
