import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { BookingStatus, CbtStatus } from '../core/constants/enums';
import { Payment } from './payment.entity';
import { Student } from './student.entity';
import { CbtCenter } from './cbt-center.entity';

@Entity({ name: 'cbt_schedules' })
export class CbtSchedule extends BaseEntity {
  @Column({ type: 'int', name: 'student_id', nullable: true })
  studentId: number;

  @Index()
  @Column({ type: 'int', name: 'cbt_center_id', nullable: true })
  cbtCenterId: number;

  @Index()
  @Column({ type: 'bigint', name: 'lga_id', nullable: true })
  lgaId: number;

  @Column({ type: 'bigint', name: 'transaction_id', nullable: true })
  transactionId: number;

  @Index()
  @Column({ type: 'int', name: 'state_id', nullable: true })
  stateId: number;

  @Index()
  @Column({ length: 40 })
  date: string;

  @Index()
  @Column({ length: 20 })
  time: string;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ type: 'json', nullable: true })
  answers: { [questionId: number]: string };

  @Column({ type: 'int', default: BookingStatus.Pending })
  status: number;

  @Column({ name: 'cbt_status', length: 40, default: CbtStatus.Scheduled })
  cbtStatus: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assessed_by' })
  assessedBy: User;

  @JoinColumn({ name: 'transaction_id' })
  @ManyToOne(() => Payment, {
    eager: false,
    nullable: true,
  })
  transaction: Payment;

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
}
