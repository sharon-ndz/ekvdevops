import { Module } from '@nestjs/common';
import { AuditTrailService } from './audit-trail.service';
import { AuditTrailController } from './audit-trail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditTrail } from '../../entities/audit-trail.entity';
import { User } from '../../entities/user.entity';
import { Node } from '../../entities/node.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditTrail, User, Node])],
  controllers: [AuditTrailController],
  providers: [AuditTrailService],
  exports: [AuditTrailService],
})
export class AuditTrailModule { }
