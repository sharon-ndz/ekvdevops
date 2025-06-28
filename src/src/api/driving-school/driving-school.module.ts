import { forwardRef, Module } from '@nestjs/common';
import { DrivingSchoolService } from './driving-school.service';
import { DrivingSchoolController } from './driving-school.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrivingSchool } from '../../entities/driving-school.entity';
import { TrainingDuration } from '../../entities/training-duration.entity';
import { DrivingSchoolApplication } from '../../entities/driving-school-application.entity';
import { Student } from '../../entities/student.entity';
import { Payment } from '../../entities/payment.entity';
import { ApplicantFile } from '../../entities/applicant-file.entity';
import { AuthModule } from '../auth/auth.module';
import { Permit } from '../../entities/permit.entity';
import { UsersModule } from '../users/users.module';
import { EmailNotification } from '../../entities/email-notification.entity';
import { User } from '../../entities/user.entity';
import { Inspection } from '../../entities/inspection.entity';
import { DrivingSchoolInstructor } from '../../entities/driving-school-instructor.entity';
import { AuditTrail } from '../../entities/audit-trail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DrivingSchool,
      TrainingDuration,
      DrivingSchoolApplication,
      Student,
      Payment,
      ApplicantFile,
      Permit,
      EmailNotification,
      User,
      Inspection,
      DrivingSchoolInstructor,
      AuditTrail
    ]),
    AuthModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [DrivingSchoolController],
  providers: [DrivingSchoolService],
  exports: [DrivingSchoolService],
})
export class DrivingSchoolModule { }
