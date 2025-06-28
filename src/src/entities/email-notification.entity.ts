import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  AfterInsert,
} from 'typeorm';
import { EmailStatus } from '../core/constants/enums';
import { Attachment } from '../core/interfaces/all.interface';
import { sendEmailNotification } from '../core/helpers/notifications';

@Entity({ name: 'email_notifications' })
export class EmailNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EmailStatus,
  })
  status: string;

  @Index()
  @Column({ length: 50 })
  to: string;

  @Index()
  @Column({ length: 100 })
  from: string;

  @Column({ length: 100 })
  subject: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'text' })
  html: string;

  @Column({ type: 'json', nullable: true })
  attachments: Attachment[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // @AfterInsert()
  // async sendNotification() {
    // await sendEmailNotification({ id: this.id });
  // }
}
