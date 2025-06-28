import { Module } from '@nestjs/common';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { CbtModule } from '../cbt/cbt.module';
import { PreRegistration } from '../../entities/pre-registration.entity';
import { LicenseFile } from '../../entities/license-file.entity';
import { License } from '../../entities/license.entity';
import { DrivingSchoolModule } from '../driving-school/driving-school.module';
import { PaymentModule } from '../payment/payment.module';
import { UsersModule } from '../users/users.module';
import { ApplicantFile } from '../../entities/applicant-file.entity';
import { DrivingTestModule } from '../driving-test/driving-test.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, PreRegistration, LicenseFile, ApplicantFile, License]),
    CbtModule,
    DrivingTestModule,
    DrivingSchoolModule,
    PaymentModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [LicenseController],
  providers: [LicenseService],
  exports: [LicenseService],
})
export class LicenseModule {}
