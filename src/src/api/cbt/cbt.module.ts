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
import { DrivingSchoolApplication } from '../../entities/driving-school-application.entity';
import { DrivingTestSchedule } from '../../entities/driving-test-schedule.entity';
import { User } from '../../entities/user.entity';
import { Payment } from '../../entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CbtCenter,
      CbtSchedule,
      Question,
      Student,
      AuditTrail,
      DrivingSchoolApplication,
      DrivingTestSchedule,
      User,
      Payment,
    ]),
    PaymentModule,
  ],
  controllers: [CbtController],
  providers: [CbtService],
  exports: [CbtService],
})
export class CbtModule { }
