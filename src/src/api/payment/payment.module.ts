import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../entities/payment.entity';
import { EmailNotification } from '../../entities/email-notification.entity';
import { License } from '../../entities/license.entity';
import { PreRegistration } from '../../entities/pre-registration.entity';
import { PaymentSetting } from '../../entities/payment-setting.entity';
import { Permit } from '../../entities/permit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Permit,
      PaymentSetting,
      PreRegistration,
      License,
      EmailNotification,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
