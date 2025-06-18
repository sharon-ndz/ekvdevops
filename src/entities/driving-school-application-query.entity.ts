import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { DrivingSchool } from './driving-school.entity';

@Entity({ name: 'driving_school_application_queries' })
export class DrivingSchoolApplicationQuery extends BaseEntity {
  @ManyToOne(() => DrivingSchool, (application) => application.queries)
  @JoinColumn({ name: 'driving_school_id' })
  application: DrivingSchool;

  @Column({ type: 'text', nullable: false })
  reason: string;

  @Column({ type: 'bigint', name: 'queried_by_id', nullable: false })
  queriedById: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'queried_by_id' })
  queriedBy: User;
}
