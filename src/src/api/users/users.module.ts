import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { EmailNotification } from '../../entities/email-notification.entity';
import { AuditTrail } from '../../entities/audit-trail.entity';
import { DrivingSchool } from '../../entities/driving-school.entity';
import { MvaaOffice } from '../../entities/mvaa-office.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, MvaaOffice, EmailNotification, AuditTrail, DrivingSchool]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
