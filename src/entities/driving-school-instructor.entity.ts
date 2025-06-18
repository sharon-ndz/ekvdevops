import { Entity, Column, Index, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { DrivingSchool } from './driving-school.entity';

@Entity({ name: 'driving_school_instructors' })
export class DrivingSchoolInstructor extends BaseEntity {
  @Column({ type: 'bigint', name: 'driving_school_id', nullable: false })
  drivingSchoolId: number;

  @Column({ length: 150, nullable: false })
  name: string;

  @Column({ length: 150, nullable: true })
  avatar: string;

  @Column({ length: 20, nullable: false })
  phone: string;

  @Column({ length: 100, unique: true, nullable: false })
  email: string;

  @Column({ length: 20, name: 'date_of_birth', nullable: false })
  dateOfBirth: string;

  @Column({ type: 'int', name: 'gender_id', nullable: false })
  genderId: number;

  @Column({ type: 'int', name: 'lga_id', nullable: false })
  lgaId: number;

  @Column({ type: 'int', name: 'state_id', nullable: false })
  stateId: number;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Index()
  @Column({ name: 'is_active', default: 0 })
  isActive: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: Relation<User>;

  @Column({ name: 'instructor_id', unique: true, nullable: true })
  instructorId: string;

  @ManyToOne(() => DrivingSchool, (drivingSchool) => drivingSchool.instructors)
  @JoinColumn({ name: 'driving_school_id' })
  drivingSchool: Relation<DrivingSchool>;
}
