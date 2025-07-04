import { Entity, Column, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { DrivingSchool } from './driving-school.entity';
import { DrivingSchoolApplication } from './driving-school-application.entity';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { Permit } from './permit.entity';

@Entity({ name: 'students' })
export class Student extends BaseEntity {
  @Index()
  @Column({ type: 'bigint', name: 'driving_school_id', nullable: false })
  drivingSchoolId: number;

  @Index()
  @Column({ type: 'bigint', name: 'application_id', nullable: false })
  applicationId: number;

  @Index()
  @Column({ length: 40, name: 'student_no', nullable: false, unique: true })
  studentNo: string;

  @Index()
  @Column({ length: 60, name: 'certificate_no', nullable: true, unique: true })
  certificateNo: string;

  @Index()
  @Column({ name: 'is_active', default: 0 })
  isActive: number;

  @Index()
  @Column({ default: false })
  graduated: boolean;

  @Column({ type: 'json', name: 'modules', nullable: true })
  modules?: string[];

  @JoinColumn({ name: 'driving_school_id' })
  @ManyToOne(() => DrivingSchool, {
    eager: false,
    nullable: true,
  })
  drivingSchool: DrivingSchool;

  @JoinColumn({ name: 'application_id' })
  @ManyToOne(() => DrivingSchoolApplication, {
    eager: false,
    nullable: true,
  })
  application: DrivingSchoolApplication;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToOne(() => Permit, (permit) => permit.student, { eager: true })
  permit: Permit;
}
