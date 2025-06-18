import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Inspection } from '../../entities/inspection.entity';
import {
  AuthUserInfo,
  DataResultInterface,
} from '../../core/interfaces/all.interface';
import { InspectionQuestionReqDto, InspectionQuestionResDto, ListInspectionsDto, ListInspectionsQuestionsDto, NewInspectionDto } from './inspection.dto';
import { Role } from '../../middlewares/roles';
import { MESSAGES } from '../../core/constants/messages';
import { auditAction } from '../../core/constants/constants';
import { getPagination } from '../../core/helpers/functions.helpers';
import { AuditTrail } from '../../entities/audit-trail.entity';
import { beginTransaction } from '../../core/interfaces/all.dto';
import { InspectionStatus, Reg } from '../../core/constants/enums';
import { DrivingSchool } from '../../entities/driving-school.entity';
import { mailer } from '../../core/helpers';
import { EmailNotification } from '../../entities/email-notification.entity';
import { InspectionQuestion } from '../../entities/inspection-question.entity';

@Injectable()
export class InspectionService {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepository: Repository<Inspection>,
    @InjectRepository(AuditTrail)
    private readonly auditTrailRepository: Repository<AuditTrail>,
    private dataSource: DataSource,
    @InjectRepository(InspectionQuestion)
    private readonly inspectionQuestionRepository: Repository<InspectionQuestion>,
  ) { }

  /**
   * Get list of inspection with filters
   * @param data
   * @param user
   */
  async findAll(data: ListInspectionsDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    const { roleId, drivingSchoolId } = user;

    const queryBuilder = this.inspectionRepository
      .createQueryBuilder('inspections')
      .leftJoinAndSelect('inspections.drivingSchool', 'drivingSchool');

    // If user is a SchoolAdmin, restrict to their driving school
    if (roleId === Role.SchoolAdmin && drivingSchoolId) {
      queryBuilder.where('inspections.drivingSchoolId = :drivingSchoolId', { drivingSchoolId });
    }
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('inspections.name ILIKE :search', { search: `%${search}%` })
            .orWhere('drivingSchool.name ILIKE :search', { search: `%${search}%` })
            .orWhere('drivingSchool.identifier ILIKE :search', { search: `%${search}%` })
            .orWhere('drivingSchool.email ILIKE :search', { search: `%${search}%` })
            .orWhere('drivingSchool.phone ILIKE :search', { search: `%${search}%` });
        }),
      );
    }
    // Apply pagination and ordering
    queryBuilder.skip(offset);
    queryBuilder.take(limit);
    queryBuilder.orderBy('inspections.id', 'DESC');

    try {
      const [result, count] = await queryBuilder.getManyAndCount();
      if (result) {
        response.data = {
          result,
          pagination: getPagination(count, page, offset, limit),
        };
      }

      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.log(error);
      console.log(`Queried by ${user.id}`);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Create Inspection log
   * @param data
   * @param user
   */
  async create(data: NewInspectionDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // Get inspection data
      const inspection = await this.inspectionRepository.findOne({
        where: { month: data.month, year: data.year },
      });
      if (inspection) {
        throw new BadRequestException(MESSAGES.recordExists);
      }
      const inspectionRecord = await this.inspectionRepository.insert(data);
      const id = inspectionRecord.raw[0].id;
      // Create audit log
      await this.auditTrailRepository.insert({
        userId: user.id,
        dbAction: auditAction.RECORD_ADD,
        tableName: 'inspections',
        resourceId: id,
        description: `Inspection log with id ${id} created successfully`,
      });

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = data;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  async getUserInspections(
    userId: number,
    data: ListInspectionsDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };

    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    const queryBuilder = this.inspectionRepository
      .createQueryBuilder('inspections')
      .where('inspections.createdBy = :userId', { userId });

    if (data.status) {
      queryBuilder.andWhere('inspections.status = :status', { status: data.status });
    }

    if (data.createdAtStart && data.createdAtEnd) {
      queryBuilder.andWhere(`inspections.createdAt BETWEEN :start AND :end`, {
        start: data.createdAtStart,
        end: data.createdAtEnd,
      });
    }

    queryBuilder.skip(offset);
    queryBuilder.take(limit);
    queryBuilder.orderBy('inspections.createdAt', data.order || 'DESC');

    try {
      const [result, count] = await queryBuilder.getManyAndCount();
      if (result) {
        response.data = {
          result,
          pagination: getPagination(count, page, offset, limit),
        };
      }

      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.error(`Error occurred while querying by user ${user.id}:`, error);
      throw new InternalServerErrorException(error.message);
    }

    return response;
  }

  async getSingle(id: number): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };
    try {
      const inspection = await this.inspectionRepository.findOne({
        where: { id },
        relations: ['drivingSchool'],
      });

      if (!inspection) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }

      response.success = true;
      response.message = MESSAGES.recordFound;
      response.data = inspection;
    } catch (error: any) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
    return response;
  }

  async uploadQuestions(data: InspectionQuestionReqDto, user: AuthUserInfo): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };

    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const uploadedQuestions = await queryRunner.manager.save(InspectionQuestion, {
        ...data,
        createdBy: { id: user.id }
      });

      // Create audit log
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_ADD,
        tableName: 'inspection_questions',
        resourceId: uploadedQuestions.id,
        description: `inspection_questions log with id ${uploadedQuestions.id} created successfully`,
      });

      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.questionsUploaded;
      response.data = uploadedQuestions;
    } catch (error: any) {
      console.error(`Error occurred while uploading questions by user ${user.id}:`, error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  async getInspectionQuestions(data: ListInspectionsQuestionsDto, stateId: number, user: AuthUserInfo): Promise<DataResultInterface<InspectionQuestionResDto>> {
    const response = { success: false, message: '', data: null };

    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    const queryBuilder = this.inspectionQuestionRepository
      .createQueryBuilder('questions')
      .where('questions.stateId = :stateId', { stateId });

    queryBuilder.skip(offset);
    queryBuilder.take(limit);
    queryBuilder.orderBy('questions.createdAt', data.order || 'DESC');

    try {
      const [result, count] = await queryBuilder.getManyAndCount();
      if (result) {
        response.data = {
          result,
          pagination: getPagination(count, page, offset, limit),
        };
      }

      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.error(`Error occurred while querying by user ${user.id}:`, error);
      throw new InternalServerErrorException(error.message);
    }

    return response;
  }

  async submitInspection(data: NewInspectionDto, user: AuthUserInfo): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };
    let queryReasons = []
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      data.stateId = user.stateId;

      // query or approve inspection depending on the total score obtained
      data.status = data.totalScore < 50 ? InspectionStatus.Queried : InspectionStatus.Approved;

      // get query reasons
      queryReasons = data.inspectionResult
        .filter((m) => m.choice !== 'Yes')
        .map((m) => m.comment);

      if (queryReasons.length > 0) {
        data.queryReasons = queryReasons;
      }

      const inspectionRecord = await queryRunner.manager.save(Inspection, {
        ...data,
        createdBy: { id: user.id },
        drivingSchool: { id: data.drivingSchoolId },
      });

      const drivingSchoolStatus = data.status === InspectionStatus.Queried
        ? Reg.InspectionQueried
        : Reg.Approved;

      await queryRunner.manager.update(
        DrivingSchool,
        { id: data.drivingSchoolId },
        { status: drivingSchoolStatus },
      );

      // Create audit log
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_ADD,
        tableName: 'inspections',
        resourceId: inspectionRecord.id,
        description: `Inspection log with id ${inspectionRecord.id} created successfully`,
      });

      // send confirmation email to the driving school depending on the status
      const emailSubject = data.status === InspectionStatus.Queried ? MESSAGES.inspectionQueried : MESSAGES.inspectionApproved;
      const emailContent = data.status === InspectionStatus.Queried ? MESSAGES.inspectionQueriedEmailBody(queryReasons) : MESSAGES.inspectionApprovedEmailBody();

      const drivingSchool = await queryRunner.manager.findOne(DrivingSchool, {
        where: { id: inspectionRecord.drivingSchoolId },
      });

      await mailer
        .setSubject(emailSubject)
        .setMessage(emailContent)
        .setTo(drivingSchool.email)
        .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
        .sendDefault();

      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = data;
    } catch (error: any) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }

    return response;
  }
}
