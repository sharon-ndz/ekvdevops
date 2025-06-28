import { Entity, Column, ManyToOne, JoinColumn, Index, AfterLoad } from "typeorm";
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { DifficultyLevel, QuestionCategory } from '../core/constants/enums';
import { SelectedFileFieldsDto } from "../api/file/file.dto";
import AttachmentUtils from "../core/helpers/aws.s3";

@Entity({ name: 'questions' })
export class Question extends BaseEntity {
  @Column({ name: 'question_text' })
  questionText: string;

  @Column({ length: 100, name: 'question_image', nullable: true })
  questionImage: string;

  @Column('json')
  options: { id: string; text: string }[];

  @Column({ name: 'correct_answer' })
  correctAnswer: string;

  @Column({ nullable: true })
  explanation: string;

  @Index()
  @Column({ default: DifficultyLevel.Easy, name: 'difficulty_level' })
  difficultyLevel: number;

  @Index()
  @Column({ type: 'int', default: QuestionCategory.DrivingSchoolTest, nullable: true })
  category: number;

  @Column({ type: 'int', name: 'time_limit', default: 10 }) // Time in seconds
  timeLimit: number;

  @Column({ name: 'question_type', nullable: true })
  questionType: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  presignedUrl?: string;

  @AfterLoad()
  async afterFind(): Promise<void> {
    if (this.questionImage) {
      try {
        const awsS3bucket = new AttachmentUtils();
        this.presignedUrl = await awsS3bucket.getPreSignedUrl(this.questionImage);
      } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        this.presignedUrl = null;
      }
    }
  }
}
