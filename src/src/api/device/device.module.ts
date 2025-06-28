import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Device } from '../../entities/device.entity';
import { Node } from '../../entities/node.entity';
import { AuditTrailModule } from '../audit-trail/audit-trail.module';
import { UsersModule } from '../users/users.module';
import { AuditTrail } from '../../entities/audit-trail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device, Node, User, AuditTrail]), UsersModule],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule { }
