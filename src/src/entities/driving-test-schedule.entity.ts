import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BookingStatus, TestStatus } from '../core/constants/enums';
import { Payment } from './payment.entity';
import { drivingTestAnswer, FileData } from '../core/interfaces/all.interface';
import { User } from './user.entity';
import { PreRegistration } from './pre-registration.entity';
import { DrivingTestCenter } from './driving-test-center.entity';
import { Student } from './student.entity';

@Entity({ name: 'driving_test_schedules' })
export class DrivingTestSchedule extends BaseEntity {
  @Column({ type: 'bigint', name: 'pre_registration_id', nullable: true })
  preRegistrationId: number;

  @Column({ type: 'bigint', name: 'driving_test_center_id', nullable: true })
  drivingTestCenterId: number;

  @Column({ name: 'license_class_id', nullable: true })
  licenseClassId: number;

  @Column({ type: 'bigint', name: 'student_id', nullable: true })
  studentId: number;

  @Column({ type: 'int', name: 'lga_id', nullable: true })
  lgaId: number;

  @Column({ type: 'bigint', name: 'transaction_id', nullable: true })
  transactionId: number;

  @Column({ type: 'int', name: 'state_id', nullable: true })
  stateId: number;

  @Column({ length: 40 })
  date: string;

  @Column({ length: 20 })
  time: string;

  @Column({ type: 'int', default: 1 })
  years: number;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
  answers: drivingTestAnswer[];

  @Column({ type: 'json', nullable: true })
  files: FileData[];

  @Column({ type: 'varchar', name: 'vehicle_type', length: 90, nullable: true })
  vehicleType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ type: 'int', name: 'booking_status', default: BookingStatus.Pending })
  bookingStatus: number;

  @Column({ name: 'status', length: 40, default: TestStatus.Scheduled })
  status: string;

  @JoinColumn({ name: 'driving_test_center_id' })
  @ManyToOne(() => DrivingTestCenter, {
    eager: false,
    nullable: true,
  })
  drivingTestCenter: DrivingTestCenter;

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
  @JoinColumn({ name: 'assessed_by' })
  assessedBy: User;

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
