import { Module } from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { InspectionController } from './inspection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inspection } from '../../entities/inspection.entity';
import { AuditTrail } from 'src/entities/audit-trail.entity';
import { DrivingSchool } from '../../entities/driving-school.entity';
import { InspectionQuestion } from '../../entities/inspection-question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inspection, AuditTrail, InspectionQuestion, DrivingSchool])],
  controllers: [InspectionController],
  providers: [InspectionService],
  exports: [InspectionService],
})
export class InspectionModule { }
