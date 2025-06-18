import { Module } from '@nestjs/common';
import { CbtService } from './cbt.service';
import { CbtController } from './cbt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CbtCenter } from '../../entities/cbt-center.entity';
import { CbtSchedule } from '../../entities/cbt-schedule.entity';
import { Question } from '../../entities/question.entity';
import { Student } from '../../entities/student.entity';
import { PaymentModule } from '../payment/payment.module';
import { AuditTrail } from '../../entities/audit-trail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CbtCenter, CbtSchedule, Question, Student, AuditTrail]),
    PaymentModule,
  ],
  controllers: [CbtController],
  providers: [CbtService],
  exports: [CbtService],
})
export class CbtModule {}
