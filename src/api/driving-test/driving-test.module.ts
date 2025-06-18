import { Module } from '@nestjs/common';
import { DrivingTestService } from './driving-test.service';
import { DrivingTestController } from './driving-test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { PaymentModule } from '../payment/payment.module';
import { DrivingTestCenter } from '../../entities/driving-test-center.entity';
import { DrivingTestSchedule } from '../../entities/driving-test-schedule.entity';
import { PreRegistration } from '../../entities/pre-registration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DrivingTestCenter, PreRegistration, DrivingTestSchedule, Student]),
    PaymentModule,
  ],
  controllers: [DrivingTestController],
  providers: [DrivingTestService],
  exports: [DrivingTestService],
})
export class DrivingTestModule {}
