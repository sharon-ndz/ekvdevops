import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateInstructorDto } from './Instructor.dto';
import { DataResultInterface } from '../../core/interfaces/all.interface';
import { DrivingSchoolInstructor } from '../../entities/driving-school-instructor.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MESSAGES } from '../../core/constants/messages';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(DrivingSchoolInstructor)
    private readonly instructorRepository: Repository<DrivingSchoolInstructor>,
    private readonly dataSource: DataSource,
  ) { }

  async create(data: CreateInstructorDto): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create instructor
      data.instructorId = `INS-${Date.now()}`;

      const instructor = await queryRunner.manager.save(DrivingSchoolInstructor, data);

      // Create audit trail
      // await queryRunner.manager.insert(AuditTrail, {      // 
      //   userId: user.id,
      //   dbAction: auditAction.RECORD_ADD,
      //   tableName: 'driving_school_instructors',
      //   resourceId: instructor.id,
      //   description: `Instructor ${instructor.name} created`,
      //   createdAt: new Date(),
      // });

      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = instructor;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  async validateInstructor(instructorId: string) {
    const instructor = await this.instructorRepository.findOne({
      where: { instructorId },
    });

    if (!instructor) {
      return {
        success: false,
        message: MESSAGES.recordNotFound,
        data: null,
      };
    }

    return {
      success: true,
      message: MESSAGES.recordFound,
      data: instructor,
    };
  }
}
