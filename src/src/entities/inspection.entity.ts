import { Entity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { DrivingSchool } from './driving-school.entity';
import { InspectionStatus } from '../core/constants/enums';
import { InspectionResponse } from '../core/constants/classes';

@Entity({ name: 'inspections' })
export class Inspection extends BaseEntity {
  @Index()
  @Column({ type: 'bigint', name: 'driving_school_id', nullable: false })
  drivingSchoolId: number;

  @Column({ length: 200, nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Index()
  @Column({ enum: InspectionStatus, nullable: true })
  status: string;

  @Index()
  @Column({ type: 'int', nullable: true })
  month: number;

  @Index()
  @Column({ type: 'int', nullable: true })
  year: number;

  @JoinColumn({ name: 'driving_school_id' })
  @ManyToOne(() => DrivingSchool, (drivingSchool) => drivingSchool.inspections, {
    eager: false,
    nullable: true,
  })
  drivingSchool: DrivingSchool;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ type: 'float', default: 0 })
  totalScore: number;

  @Column({ type: 'jsonb', name: 'inspection_result', nullable: true })
  inspectionResult: InspectionResponse[];

  @Column({ name: 'state_id', type: 'bigint', nullable: true })
  stateId: number;

  @Column({ type: 'jsonb', name: 'query_reasons', nullable: true })
  queryReasons?: string[];

  @Column({ type: 'boolean', default: false, name: 'acknowledged_inspection' })
  acknowledgedInspection: boolean;
}
