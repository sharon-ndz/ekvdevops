import { Entity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';
import { DrivingSchool } from './driving-school.entity';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'training_durations' })
export class TrainingDuration extends BaseEntity {
  @Index()
  @Column({ type: 'bigint', name: 'driving_school_id', nullable: false })
  drivingSchoolId: number;

  @Index()
  @Column({ type: 'int', nullable: false })
  duration: number;

  @Column({ length: 20, name: 'duration_text', nullable: false })
  durationText: string;

  @Index()
  @Column({ name: 'is_active', default: 0 })
  isActive: number;

  @JoinColumn({ name: 'driving_school_id' })
  @ManyToOne(() => DrivingSchool, {
    eager: false,
    nullable: true,
  })
  drivingSchool: DrivingSchool;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
