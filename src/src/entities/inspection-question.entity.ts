import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { InspectionQuestionsRequestDto } from '../core/constants/classes';

@Entity({ name: 'inspection_questions' })
export class InspectionQuestion extends BaseEntity {
    @Column({ type: 'jsonb', name: 'response', nullable: false })
    questions: InspectionQuestionsRequestDto[];

    @Column({ name: 'state_id', type: 'bigint', nullable: false })
    stateId: number;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'created_by' })
    createdBy: User;
}
