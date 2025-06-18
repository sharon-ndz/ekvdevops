import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { DrivingSchoolInstructor } from './driving-school-instructor.entity';
import { DrivingSchoolApplicationQuery } from './driving-school-application-query.entity';
import { ApplicantFile } from './applicant-file.entity';
import { Inspection } from './inspection.entity';

@Entity({ name: 'driving_schools' })
export class DrivingSchool extends BaseEntity {
  @Index()
  @Column({ length: 50, unique: true, nullable: false })
  identifier: string;

  @Index()
  @Column({ length: 80, nullable: false })
  name: string;

  @Column({ length: 255, nullable: true })
  logo: string;

  @Index()
  @Column({ length: 20, unique: false })
  phone: string;

  @Index()
  @Column({ length: 100, unique: true, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Index()
  @Column({ name: 'lga_id', nullable: true })
  lgaId: number;

  @Index()
  @Column({ name: 'state_id', nullable: true })
  stateId: number;

  @Column({ name: 'rc_number', length: 30, nullable: true })
  rcNumber: string;

  @Column({ type: 'int', name: 'total_vehicles', default: 0 })
  totalVehicles: number;

  @Column({ type: 'jsonb', name: 'vehicle_types', nullable: true })
  vehicleTypes: string[];

  @Column({ type: 'text', name: 'special_gadgets', nullable: true })
  specialGadgets: string;

  @Column({ type: 'int', name: 'total_simulators', default: 0 })
  totalSimulators: number;

  @Column({ name: 'teaching_aids', length: 200, nullable: true })
  teachingAids: string;

  @Column({ name: 'training_range', length: 100, nullable: true })
  trainingRange: string;

  @Column({ type: 'int', name: 'total_classrooms', default: 0 })
  totalClassrooms: number;

  @Column({ name: 'classroom_capacity', length: 100, nullable: true })
  classRoomCapacity: string;

  @Column({ type: 'int', name: 'total_instructors', default: 0 })
  totalInstructors: number;

  @Column({ name: 'doc_type', length: 90, nullable: true })
  docType: string;

  @Column({ name: 'doc_file', length: 150, nullable: true })
  docFile: string;

  @Index()
  @Column({ name: 'is_active', default: 0 })
  isActive: number;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => DrivingSchoolInstructor, (instructor) => instructor.drivingSchool)
  instructors: DrivingSchoolInstructor[];

  @Column({ type: 'text', nullable: true })
  reasonForSuspension: string;

  @Index()
  @Column({ length: 80, nullable: true, unique: true })
  reference: string;

  @Index()
  @Column({ default: 0 })
  status: number;

  @Column({ name: 'officer_id', nullable: true })
  officerId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'officer_id' })
  officer: User;

  @Column({
    type: 'timestamp',
    name: 'inspection_date',
    nullable: true,
  })
  inspectionDate: Date;

  @Column({
    type: 'timestamp',
    name: 'inspection_end_date',
    nullable: true,
  })
  inspectionEndDate: Date;

  @OneToMany(() => DrivingSchoolApplicationQuery, (query) => query.application)
  queries: DrivingSchoolApplicationQuery[];

  @OneToMany(() => ApplicantFile, (applicantFile) => applicantFile.drivingSchool)
  applicantFiles?: ApplicantFile[];

  @OneToMany(() => Inspection, (inspection) => inspection.drivingSchool)
  inspections?: Inspection[];
}
