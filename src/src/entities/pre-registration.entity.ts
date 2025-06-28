import { Entity, Column, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { PreRegistrationStatus } from '../core/constants/enums';
import { DrivingSchool } from './driving-school.entity';
import { Student } from './student.entity';
import { CbtCenter } from './cbt-center.entity';
import { CbtSchedule } from './cbt-schedule.entity';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { LicenseFile } from './license-file.entity';
import { DrivingTestCenter } from './driving-test-center.entity';
import { DrivingTestSchedule } from './driving-test-schedule.entity';

@Entity({ name: 'pre_registrations' })
export class PreRegistration extends BaseEntity {
  @Index()
  @Column({ length: 80, name: 'application_no', nullable: true, unique: true })
  applicationNo: string;

  @Index()
  @Column({ type: 'bigint', name: 'student_id', nullable: false })
  studentId: number;

  @Index()
  @Column({ type: 'bigint', name: 'cbt_center_id', nullable: true })
  cbtCenterId: number;

  @Index()
  @Column({ type: 'bigint', name: 'cbt_schedule_id', nullable: true })
  cbtScheduleId: number;

  @Index()
  @Column({ type: 'bigint', name: 'driving_school_id', nullable: true })
  drivingSchoolId: number;

  @Column({ type: 'bigint', name: 'driving_test_center_id', nullable: true })
  drivingTestCenterId: number;

  @Column({ type: 'bigint', name: 'driving_test_schedule_id', nullable: true })
  drivingTestScheduleId: number;

  @Index()
  @Column({ length: 80, nullable: true, unique: true })
  reference: string;

  @Index()
  @Column({ nullable: true, name: 'license_class_id' })
  licenseClassId: number;

  @Index()
  @Column({ nullable: true })
  years: number;

  @Index()
  @Column({ length: 80, nullable: true, unique: true })
  rrr: string;

  @Index()
  @Column({ type: 'int', default: PreRegistrationStatus.Pending })
  status: number;

  @OneToMany(() => LicenseFile, (licenseFile) => licenseFile.preRegistration)
  licenseFiles?: LicenseFile[];

  @JoinColumn({ name: 'driving_school_id' })
  @ManyToOne(() => DrivingSchool, {
    eager: false,
    nullable: true,
  })
  drivingSchool: DrivingSchool;

  @JoinColumn({ name: 'student_id' })
  @ManyToOne(() => Student, {
    eager: false,
    nullable: true,
  })
  student: Student;

  @JoinColumn({ name: 'cbt_center_id' })
  @ManyToOne(() => CbtCenter, {
    eager: false,
    nullable: true,
  })
  cbtCenter: CbtCenter;

  @JoinColumn({ name: 'cbt_schedule_id' })
  @ManyToOne(() => CbtSchedule, {
    eager: false,
    nullable: true,
  })
  cbtSchedule: CbtSchedule;

  @JoinColumn({ name: 'driving_test_center_id' })
  @ManyToOne(() => DrivingTestCenter, {
    eager: false,
    nullable: true,
  })
  drivingTestCenter: DrivingTestCenter;

  @JoinColumn({ name: 'driving_test_schedule_id' })
  @ManyToOne(() => DrivingTestSchedule, {
    eager: false,
    nullable: true,
  })
  drivingTestSchedule: DrivingTestSchedule;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
