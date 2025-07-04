import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Inspection } from '../../entities/inspection.entity';
import { AuthUserInfo, DataResultInterface } from '../../core/interfaces/all.interface';
import {
  InspectionQuestionReqDto,
  InspectionQuestionResDto,
  ListAssignedInspectionsDto,
  ListInspectionsDto,
  ListInspectionsQuestionsDto,
  NewInspectionDto,
} from './inspection.dto';
import { Role } from '../../middlewares/roles';
import { MESSAGES } from '../../core/constants/messages';
import { auditAction } from '../../core/constants/constants';
import { getPagination } from '../../core/helpers/functions.helpers';
import { AuditTrail } from '../../entities/audit-trail.entity';
import { beginTransaction } from '../../core/interfaces/all.dto';
import { InspectionStatus, Reg, Status } from '../../core/constants/enums';
import { DrivingSchool } from '../../entities/driving-school.entity';
import { mailer } from '../../core/helpers';
import { EmailNotification } from '../../entities/email-notification.entity';
import { InspectionQuestion } from '../../entities/inspection-question.entity';
import { DrivingSchoolResponseDto } from '../driving-school/driving-school.dto';
import * as process from 'node:process';

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
    @InjectRepository(DrivingSchool)
    private readonly drivingSchoolRepository: Repository<DrivingSchool>,
  ) {}

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
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // Get inspection data
      const inspection = await queryRunner.manager.findOne(Inspection, {
        where: { month: data.month, year: data.year },
      });

      if (inspection) {
        throw new BadRequestException(MESSAGES.recordExists);
      }

      const inspectionRecord = await queryRunner.manager.insert(Inspection, data);
      const id = inspectionRecord.raw[0].id;

      // Create audit log
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_ADD,
        tableName: 'inspections',
        resourceId: id,
        description: `Inspection log with id ${id} created successfully`,
      });

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

  async uploadQuestions(
    data: InspectionQuestionReqDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // Check if inspection question record exists for the state
      const existing = await queryRunner.manager.findOne(InspectionQuestion, {
        where: { stateId: data.stateId },
      });

      const questionsWithIds = data.questions.map((q, index) => ({
        id: index + 1,
        ...q,
      }));

      let savedRecord: InspectionQuestion;

      if (existing) {
        // Update existing record
        existing.questions = questionsWithIds;
        savedRecord = await queryRunner.manager.save(InspectionQuestion, existing);
      } else {
        // Create new record
        const newRecord = queryRunner.manager.create(InspectionQuestion, {
          questions: questionsWithIds,
          stateId: data.stateId,
          createdBy: { id: user.id },
        });
        savedRecord = await queryRunner.manager.save(InspectionQuestion, newRecord);
      }

      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: existing ? auditAction.RECORD_MODIFIED : auditAction.RECORD_ADD,
        tableName: 'inspection_questions',
        resourceId: savedRecord.id,
        description: `inspection_questions record with id ${savedRecord.id} ${existing ? 'updated' : 'created'} successfully`,
      });

      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.questionsUploaded;
      response.data = savedRecord;
    } catch (error: any) {
      console.error(`Error occurred while uploading questions by user ${user.id}:`, error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  async getInspectionQuestions(
    data: ListInspectionsQuestionsDto,
    stateId: number,
    user: AuthUserInfo,
  ): Promise<DataResultInterface<InspectionQuestionResDto>> {
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
    let queryReasons = [];
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      data.stateId = user.stateId;

      if (!user.stateId) {
        throw new BadRequestException('Officer must belong to a state to submit an inspection.');
      }

      // === Fetch and prepare questions ===
      const questionRecord = await this.inspectionQuestionRepository.findOne({
        where: { stateId: data.stateId },
      });

      console.log({ questionRecord });

      if (!questionRecord) {
        throw new NotFoundException('Inspection questions not found for this state.');
      }

      const correctAnswerMap = new Map<number, string>();
      questionRecord.questions.forEach((q) => {
        correctAnswerMap.set(q.id, q.correctAnswer);
      });

      console.log({ correctAnswerMap });

      // === Score calculation ===
      const maxScorePerQuestion = Number(process.env.MAX_MARKS_PER_INSPECTION_QUESTION);
      let obtainedMarks = 0;

      console.log({ maxScorePerQuestion });

      // Total possible marks = total number of questions * max marks per question
      const totalPossibleMarks = data.inspectionResult.length * maxScorePerQuestion;

      console.log({ totalPossibleMarks });

      data.inspectionResult.forEach((item) => {
        console.log('useranswer', item);
        const question = questionRecord.questions.find((q) => q.id === item.questionId);
        if (!question) return;

        const selectedOption = question.options.find((opt) => opt.label === item.choice);
        if (selectedOption) {
          obtainedMarks += selectedOption.marks;
        }

        console.log({ obtainedMarks });
      });

      const scorePercentage =
        totalPossibleMarks > 0 ? (obtainedMarks / totalPossibleMarks) * 100 : 0;

      console.log({ scorePercentage });

      data.totalScore = Number(scorePercentage.toFixed());
      data.status = scorePercentage < 50 ? InspectionStatus.Queried : InspectionStatus.Approved;

      console.log('status', data.status);

      // === Get query reasons for incorrect answers ===
      if (data.status === InspectionStatus.Queried) {
        queryReasons = data.inspectionResult
          .filter((m) => m.choice !== correctAnswerMap.get(m.questionId))
          .map((m) => m.comment)
          .filter(Boolean); // remove nulls or undefined

        if (queryReasons.length > 0) {
          data.queryReasons = queryReasons;
        }
      }

      // === Save inspection record ===
      const inspectionRecord = await queryRunner.manager.save(Inspection, {
        ...data,
        createdBy: { id: user.id },
        drivingSchool: { id: data.drivingSchoolId },
      });

      const drivingSchoolStatus =
        data.status === InspectionStatus.Queried ? Reg.InspectionQueried : Reg.Approved;

      await queryRunner.manager.update(
        DrivingSchool,
        { id: data.drivingSchoolId },
        {
          status: drivingSchoolStatus,
          isActive: data.status === InspectionStatus.Approved ? Status.Active : Status.Inactive,
        },
      );

      // === Audit Trail ===
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_ADD,
        tableName: 'inspections',
        resourceId: inspectionRecord.id,
        description: `Inspection log with id ${inspectionRecord.id} created successfully`,
      });

      // === Email Notification ===
      const emailSubject =
        data.status === InspectionStatus.Queried
          ? MESSAGES.inspectionQueried
          : MESSAGES.inspectionApproved;

      const emailContent =
        data.status === InspectionStatus.Queried
          ? MESSAGES.inspectionQueriedEmailBody(queryReasons)
          : MESSAGES.inspectionApprovedEmailBody();

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

  async getAssignedInspections(
    data: ListAssignedInspectionsDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface<DrivingSchoolResponseDto[]>> {
    const response = { success: false, message: '', data: null };
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    try {
      const queryBuilder = this.drivingSchoolRepository.createQueryBuilder('driving_schools');
      queryBuilder.where('driving_schools.officerId = :officerId', { officerId: user.id });

      if (data.status) {
        queryBuilder.andWhere(`driving_schools.status = :status`, {
          status: data.status,
        });
      }

      queryBuilder.skip(offset);
      queryBuilder.take(limit);
      queryBuilder.orderBy('driving_schools.createdAt', data.order || 'DESC');

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
      throw new InternalServerErrorException(error.message);
    }

    return response;
  }

  async acknowledgeInspection(id: number): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };
    try {
      const inspection = await this.inspectionRepository.findOne({ where: { id } });
      if (!inspection) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }

      inspection.acknowledgedInspection = true;
      await this.inspectionRepository.save(inspection);

      response.success = true;
      response.message = 'Inspection acknowledged successfully';
      response.data = inspection;
    } catch (error: any) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
    return response;
  }
}
