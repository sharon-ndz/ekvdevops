import {
  Entity,
  Column,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Relation,
  OneToMany,
} from 'typeorm';
import { DrivingSchool } from './driving-school.entity';
import { TrainingDuration } from './training-duration.entity';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { CourseLevel, EyeColor, Reg, YesNo } from '../core/constants/enums';
import { Student } from './student.entity';
import { ApplicantFile } from './applicant-file.entity';

@Entity({ name: 'driving_school_applications' })
export class DrivingSchoolApplication extends BaseEntity {
  @Index()
  @Column({ type: 'bigint', name: 'driving_school_id', nullable: false })
  drivingSchoolId: number;

  @Index()
  @Column({ type: 'int', name: 'training_duration_id', nullable: false })
  trainingDurationId: number;

  @Index()
  @Column({ length: 80, nullable: false, unique: true })
  reference: string;

  @Index()
  @Column({ length: 20, nullable: false })
  nin: string;

  @Index()
  @Column({ length: 40, name: 'application_no', nullable: false, unique: true })
  applicationNo: string;

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

  @Column({ type: 'int', name: 'gender_id', nullable: false })
  genderId: number;

  @Column({ length: 20, name: 'date_of_birth', nullable: false })
  dateOfBirth: string;

  @Column({ length: 80, name: 'place_of_birth', nullable: false })
  placeOfBirth: string;

  @Column({ name: 'nationality_id', nullable: false })
  nationalityId: number;

  @Index()
  @Column({ name: 'state_of_origin_id', nullable: false })
  stateOfOriginId: number;

  @Index()
  @Column({ name: 'lga_of_origin_id', nullable: false })
  lgaOfOriginId: number;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ type: 'int', name: 'occupation_id', nullable: false })
  occupationId: number;

  @Column({ type: 'int', name: 'marital_status_id', nullable: false })
  maritalStatusId: number;

  @Column({ type: 'int', name: 'blood_group_id', nullable: false })
  bloodGroupId: number;

  @Column({ length: 100, name: 'next_of_kin_name', nullable: false })
  nextOfKinName: string;

  @Column({ length: 20, name: 'next_of_kin_phone', nullable: false })
  nextOfKinPhone: string;

  @Column({ type: 'int', name: 'next_of_kin_relationship_id', nullable: false })
  nextOfKinRelationshipId: number;

  @Column({ type: 'int', name: 'next_of_kin_nationality_id', nullable: false })
  nextOfKinNationalityId: number;

  @Index()
  @Column({ default: Reg.Pending })
  status: number;

  @Column({ length: 50, name: 'course_level', default: CourseLevel.Beginner })
  courseLevel: string;

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

  @JoinColumn({ name: 'driving_school_id' })
  @ManyToOne(() => DrivingSchool, {
    eager: false,
    nullable: true,
  })
  drivingSchool: DrivingSchool;

  @OneToOne(() => Student, (student) => student.application)
  student: Relation<Student>;

  @JoinColumn({ name: 'training_duration_id' })
  @ManyToOne(() => TrainingDuration, {
    eager: false,
    nullable: true,
  })
  trainingDuration: TrainingDuration;

  @Index()
  @Column({ type: 'bigint', name: 'approved_by_id', nullable: true })
  approvedById: number;

  @Column({
    type: 'timestamp',
    name: 'approved_at',
    nullable: true,
  })
  approvedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => ApplicantFile, (applicantFile) => applicantFile.drivingSchoolApplication)
  applicantFiles?: ApplicantFile[];
}
