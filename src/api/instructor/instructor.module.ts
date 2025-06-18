import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrivingSchoolInstructor } from '../../entities/driving-school-instructor.entity';
import { InstructorService } from './instructor.service';
import { InstructorController } from './instructor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DrivingSchoolInstructor])],
  providers: [InstructorService],
  controllers: [InstructorController],
  exports: [InstructorService],
})
export class InstructorModule { }
