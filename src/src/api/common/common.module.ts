import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailNotification } from '../../entities/email-notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailNotification])],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
