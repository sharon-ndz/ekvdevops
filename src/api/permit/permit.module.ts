import { Module } from '@nestjs/common';
import { PermitService } from './permit.service';
import { PermitController } from './permit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { EmailNotification } from '../../entities/email-notification.entity';
import { PaymentModule } from '../payment/payment.module';
import { Permit } from '../../entities/permit.entity';
import { AuditTrail } from '../../entities/audit-trail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permit, Student, EmailNotification, AuditTrail]),
    PaymentModule,
  ],
  controllers: [PermitController],
  providers: [PermitService],
  exports: [PermitService],
})
export class PermitModule {}
