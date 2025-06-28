import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  Brackets,
  DataSource,
  FindManyOptions,
  ILike,
  LessThan,
  QueryRunner,
  Repository,
} from 'typeorm';
import { CbtCenter } from '../../entities/cbt-center.entity';
import {
  FetchDashboardStatsRequestDto,
  FetchMasterListDto,
} from '../driving-school/driving-school.dto';
import {
  AuthUserInfo,
  DataResultInterface,
  RequestResultInterface,
} from '../../core/interfaces/all.interface';
import { MESSAGES } from '../../core/constants/messages';
import { appConstants, auditAction, lgas, MONTH_NAMES } from '../../core/constants/constants';
import {
  BookSlotDto,
  CbtCenterIdDto,
  CbtCenterResponseDto,
  CbtRescheduleDto,
  CbtScheduleDto,
  TestStatsDto,
  CreateCbtCenterDto,
  CreateQuestionDto,
  FetchQuestionsDto,
  CbtScheduleResponseDto,
  ListCbtScheduleRequestDto,
  QuestionByStudentDto,
  SubmitTestDto,
  UpdateCbtCenterDto,
  UpdateQuestionDto,
  UpdateDeviceThresholdDto,
} from './cbt.dto';
import { CbtSchedule } from '../../entities/cbt-schedule.entity';
import { Question } from '../../entities/question.entity';
import { Student } from '../../entities/student.entity';
import {
  BookingStatus,
  TestStatus,
  PaymentStatus,
  Reference,
  StatisticsFilter,
  Status,
  TransactionType,
} from '../../core/constants/enums';
import { PaymentService } from '../payment/payment.service';
import { Payment } from '../../entities/payment.entity';
import { BaseRequestDto, beginTransaction } from '../../core/interfaces/all.dto';
import { getPagination, hexCode } from '../../core/helpers/functions.helpers';
import { AuditTrail } from '../../entities/audit-trail.entity';
import { plainToInstance } from 'class-transformer';
import { DrivingSchoolApplication } from '../../entities/driving-school-application.entity';
import { DrivingTestSchedule } from '../../entities/driving-test-schedule.entity';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { Role } from '../../middlewares/roles';
import { User } from '../../entities/user.entity';
import { mailer } from '../../core/helpers';
import { PreRegistration } from '../../entities/pre-registration.entity';
import { EmailNotification } from '../../entities/email-notification.entity';

@Injectable()
export class CbtService {
  constructor(
    @InjectRepository(CbtCenter)
    private readonly cbtCenterRepository: Repository<CbtCenter>,
    @InjectRepository(CbtSchedule)
    private readonly cbtScheduleRepository: Repository<CbtSchedule>,
    @InjectRepository(DrivingSchoolApplication)
    private readonly drivingSchoolAppRepository: Repository<DrivingSchoolApplication>,
    @InjectRepository(DrivingTestSchedule)
    private readonly drivingTestRepository: Repository<DrivingTestSchedule>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private readonly paymentService: PaymentService,
    private dataSource: DataSource,
  ) {}

  /**
   * Fetch CBT centers
   * @param data
   */
  async getCbtCenters(
    data: FetchMasterListDto,
  ): Promise<DataResultInterface<CbtCenterResponseDto[]>> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    try {
      const whereClause: FindManyOptions<CbtCenter> = {
        where: undefined,
        skip: offset,
        take: limit,
      };

      const whereConditions: Record<string, any> = {};

      if (data.stateId) {
        whereConditions.stateId = data.stateId;
      }

      if (data.lgaId) {
        whereConditions.lgaId = data.lgaId;
      }

      if (data.search) {
        whereConditions.name = ILike(`%${data.search}%`);
      }

      // Set where conditions
      whereClause.where = whereConditions;

      const [result, count] = await this.cbtCenterRepository.findAndCount(whereClause);
      if (result) {
        const transformedResult = plainToInstance(CbtCenterResponseDto, result, {
          excludeExtraneousValues: true,
        });
        response.data = {
          result: transformedResult,
          pagination: getPagination(count, page, offset, limit),
        };
      }

      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Create CBT center
   * @param data
   */
  async createCenter(data: CreateCbtCenterDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const exists = await queryRunner.manager.findOne(CbtCenter, {
        where: data,
      });
      if (exists) {
        throw new BadRequestException(MESSAGES.recordExists);
      }

      data.identifier = hexCode({ count: 8, caps: true, prefix: 'CID' });

      const cbtCenter = queryRunner.manager.create(CbtCenter, data);
      const savedCenter = await queryRunner.manager.save(cbtCenter);

      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'cbt_centers',
        resourceId: savedCenter.id,
        description: `CBT Center created with name ${savedCenter.name} created by ${user.email}`,
        createdAt: new Date(),
      });

      await queryRunner.commitTransaction();

      response.success = true;
      response.data = savedCenter;
      response.message = MESSAGES.recordAdded;
    } catch (error: any) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
    return response;
  }

  /**
   * Update CBT center
   * @param data
   */
  async updateCenter(data: UpdateCbtCenterDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      const cbtCenter = await this.cbtCenterRepository.findOne({
        where: { id: data.id },
      });
      if (!cbtCenter) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }
      // Update CBT center
      await this.cbtCenterRepository.update({ id: data.id }, data);
      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Get booked slots
   * @param data
   */
  async getSlots(data: CbtCenterIdDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      const cbtCenterID = data.cbtCenterId;
      // Find the CBT center
      const cbtCenter = await this.cbtCenterRepository.findOne({ where: { id: cbtCenterID } });
      if (!cbtCenter) {
        throw new Error('CBT Center not found');
      }
      // Find all booked time slots for the given CBT center
      const bookedSlots = await this.cbtScheduleRepository.find({
        where: { cbtCenterId: cbtCenterID },
        select: ['date', 'time'],
      });

      const endDate = new Date();
      endDate.setMonth(new Date().getMonth() + 1); // Set end date to one month from start

      const availableSlots: { date: string; times: string[] }[] = [];

      const currentDate = new Date();
      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
        const times: string[] = [];

        // Generate times between 8 AM and 5 PM
        for (let hour = 8; hour <= 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            // Example: 30-minute intervals
            const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
            times.push(formattedTime);
          }
        }
        availableSlots.push({ date: dateString, times });
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
      }

      const openSlots = availableSlots
        .map((slot) => {
          const availableTimes = slot.times.filter(
            (time) =>
              !bookedSlots.some(
                (bookedSlot) => bookedSlot.date === slot.date && bookedSlot.time === time,
              ),
          );
          return { ...slot, times: availableTimes };
        })
        .filter((slot) => slot.times.length > 0);

      response.success = true;
      response.data = {
        bookedSlots: bookedSlots,
        availableSlots: openSlots,
      };
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Book slot
   * @param data
   */
  async bookSlot(data: BookSlotDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      const cbtCenterID = data.cbtCenterId;
      // Find the CBT center
      const cbtCenter = await this.cbtCenterRepository.findOne({ where: { id: cbtCenterID } });
      if (!cbtCenter) {
        throw new Error('CBT Center not found');
      }
      // check if this slot has been booked by this student
      const checkBooked = await this.cbtScheduleRepository.findOne({
        where: {
          date: data.date,
          time: data.time,
          studentId: data.studentId,
          cbtCenterId: data.cbtCenterId,
        },
      });
      if (checkBooked) {
        throw new BadRequestException('This date and time already booked by student');
      }
      // Check if this date and time has been booked by others
      const bookedByOthers = await this.cbtScheduleRepository.findOne({
        where: { date: data.date, time: data.time, cbtCenterId: data.cbtCenterId },
      });
      if (bookedByOthers) {
        throw new BadRequestException('This date and time already booked.');
      }
      // Create a slot
      await this.cbtScheduleRepository.insert(data);

      response.success = true;
      response.data = data;
      response.message = MESSAGES.recordAdded;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Create CBT schedule
   * @param studentId
   * @param cbtCenterId
   * @param scheduleDto
   */
  async scheduleTest(studentId: number, cbtCenterId: number, scheduleDto: CbtScheduleDto) {
    const queryRunner = await beginTransaction(this.dataSource);
    try {
      // Find the CBT center
      const cbtCenter = await queryRunner.manager.findOne(CbtCenter, {
        where: { id: cbtCenterId },
      });
      if (!cbtCenter) {
        throw new Error('CBT Center not found');
      }
      // Find pre-booked schedule
      const preBooked = await queryRunner.manager.findOne(CbtSchedule, {
        where: {
          studentId: studentId,
          cbtCenterId: cbtCenterId,
          date: scheduleDto.date,
          time: scheduleDto.time,
        },
      });
      if (!preBooked) {
        throw new Error('No pro-booked date and time slot for this schedule.');
      }

      // set update parameters
      preBooked.status = BookingStatus.Booked;
      if (!scheduleDto.cbtStatus) {
        preBooked.cbtStatus = TestStatus.Scheduled;
      }
      if (scheduleDto.transactionId) {
        preBooked.transactionId = scheduleDto.transactionId;
      }
      // Save the schedule
      await queryRunner.manager.update(CbtSchedule, { id: preBooked.id }, preBooked);
      // run check on pre-booked dates and remove slots not confirmed
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      await queryRunner.manager.delete(CbtSchedule, {
        score: 0, // prevent removing schedules that have taken tests before this update
        status: BookingStatus.Pending, // Unconfirmed slots
        createdAt: LessThan(fiveMinutesAgo), // Created more than 5 minutes ago
      });

      // Commit the transaction
      await queryRunner.commitTransaction();
      return preBooked.id;
    } catch (error: any) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update Test
   * @param data
   * @param user
   */
  async updateTest(data: QuestionByStudentDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);
    try {
      // Get student
      const student = await queryRunner.manager.findOne(Student, {
        where: { studentNo: data.studentNo },
        relations: ['application'],
      });
      if (!student) {
        throw new BadRequestException('Student record not found!');
      }
      // Get student test schedule
      const schedule = await queryRunner.manager.findOne(CbtSchedule, {
        where: { studentId: student.id },
      });
      if (!schedule) {
        throw new BadRequestException('Student test schedule not found!');
      }

      const score = schedule.score;
      const questionIds = Object.keys(schedule.answers).map(Number);
      // Rate in percentage
      const totalQuestions = questionIds.length;
      const minimumScorePercentage =
        Number.isFinite(appConstants.cbtMinimumScore) &&
        appConstants.cbtMinimumScore >= 0 &&
        appConstants.cbtMinimumScore <= 100
          ? appConstants.cbtMinimumScore
          : 70;

      let rawPercentage = 0.0;
      if (totalQuestions > 0) {
        rawPercentage = (score / totalQuestions) * 100;
      }

      const formattedPercentage = parseFloat(rawPercentage.toFixed(2));
      if (formattedPercentage >= minimumScorePercentage) {
        schedule.cbtStatus = TestStatus.Passed;
      } else {
        schedule.cbtStatus = TestStatus.Failed;
      }

      const updatedSchedule = await queryRunner.manager.save(CbtSchedule, schedule);

      const name = [student.application.firstName, student.application.lastName].join(' ');
      await mailer
        .setSubject(MESSAGES.cbtTestResult)
        .setMessage(
          MESSAGES.cbtTestResultBody(
            name,
            student.application.applicationNo,
            schedule.cbtStatus,
            formattedPercentage,
          ),
        )
        .setTo(student.application.email)
        .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
        .sendDefault();

      await queryRunner.commitTransaction();

      response.data = updatedSchedule;
      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      console.log(`Admin User: ${user.id}`);
      response.message = error.message;
    } finally {
      await queryRunner.release();
    }
    return response;
  }

  /**
   * Get questions by student
   * @param data
   */
  async getTestByStudent(data: QuestionByStudentDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // Get student
      const student = await this.studentRepository.findOne({
        where: { studentNo: data.studentNo },
      });
      if (!student) {
        throw new BadRequestException('Student record not found!');
      }
      // Get student test schedule
      const schedule = await this.cbtScheduleRepository.findOne({
        where: { studentId: student.id },
      });
      if (!schedule) {
        throw new BadRequestException('Student test schedule not found!');
      }
      const queryBuilder = this.questionRepository.createQueryBuilder('questions');
      if (data.category) {
        queryBuilder.andWhere('questions.category = :category', { category: data.category });
      }
      if (data.difficultyLevel) {
        queryBuilder.andWhere('questions.difficultyLevel = :difficultyLevel', {
          difficultyLevel: data.difficultyLevel,
        });
      }
      // queryBuilder.orderBy('RANDOM()'); // randomize
      const questions = await queryBuilder.getMany();
      if (!questions || questions.length === 0) {
        throw new NotFoundException('No questions found for this test');
      }
      response.data = {
        questions: questions,
        totalTimeInSeconds: 3600,
      };
      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Submit student test
   * @param data
   */
  async submitTest(data: SubmitTestDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // Get student
      const student = await queryRunner.manager.findOne(Student, {
        where: { studentNo: data.studentNo },
        relations: ['application'],
      });
      if (!student || !student.application) {
        throw new BadRequestException('Student record not found!');
      }
      // Get student test schedule
      const schedule = await queryRunner.manager.findOne(CbtSchedule, {
        where: { studentId: student.id },
      });
      if (!schedule) {
        throw new BadRequestException('Student test schedule not found!');
      }

      const questionIds = Object.keys(data.answers).map(Number);
      const questions = await this.questionRepository
        .createQueryBuilder('questions')
        .where('questions.id IN (:...questionIds)', { questionIds }) // Use IN clause for efficiency
        .getMany();

      let score = 0;

      for (const question of questions) {
        const userAnswer = data.answers[question.id.toString()];
        const isCorrect = userAnswer && userAnswer === question.correctAnswer;
        if (isCorrect) {
          score++;
        }
      }
      // Rate in percentage
      const totalQuestions = questions.length;
      const minimumScorePercentage =
        Number.isFinite(appConstants.cbtMinimumScore) &&
        appConstants.cbtMinimumScore >= 0 &&
        appConstants.cbtMinimumScore <= 100
          ? appConstants.cbtMinimumScore
          : 70;

      let rawPercentage = 0.0;
      if (totalQuestions > 0) {
        rawPercentage = (score / totalQuestions) * 100;
      }

      const formattedPercentage = parseFloat(rawPercentage.toFixed(2));
      if (formattedPercentage >= minimumScorePercentage) {
        schedule.cbtStatus = TestStatus.Passed;
      } else {
        schedule.cbtStatus = TestStatus.Failed;
      }
      // Update the score and answers on cbt schedule
      schedule.answers = data.answers;
      schedule.score = score;
      const updatedSchedule = await queryRunner.manager.save(CbtSchedule, schedule);

      const name = [student.application.firstName, student.application.lastName]
        .filter(Boolean)
        .join(' ');
      await mailer
        .setSubject(MESSAGES.cbtTestResult)
        .setMessage(
          MESSAGES.cbtTestResultBody(
            name,
            student.application.applicationNo,
            schedule.cbtStatus,
            formattedPercentage,
          ),
        )
        .setTo(student.application.email)
        .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
        .sendDefault();

      await queryRunner.commitTransaction();

      response.data = updatedSchedule;
      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      await queryRunner.release();
    }
    return response;
  }

  async cbtEnrolls(data: BaseRequestDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;
    const sortOrder = data.order && ['ASC', 'DESC'].includes(data.order) ? data.order : 'DESC';

    try {
      const queryBuilder = this.cbtScheduleRepository.createQueryBuilder('schedules');
      const fieldsToSelect = [
        // schedules fields (CbtSchedule)
        'schedules.id',
        'schedules.studentId',
        'schedules.cbtCenterId',
        'schedules.date',
        'schedules.time',
        'schedules.years',
        'schedules.score',
        'schedules.status',
        'schedules.cbtStatus',
        'schedules.createdAt',
        // center fields (CbtCenter)
        'center.id',
        'center.name',
        // student fields
        'student.id',
        'student.drivingSchoolId',
        'student.studentNo',
        'student.certificateNo',
        'student.isActive',
        'student.graduated',
        // application fields
        'application.id',
        'application.titleId',
        'application.applicationNo',
        'application.firstName',
        'application.middleName',
        'application.lastName',
        'application.email',
        'application.phone',
        'application.genderId',
        'application.dateOfBirth',
        // --- preRegistration fields
        'preRegistration.id',
        'preRegistration.applicationNo',
        'preRegistration.status',
        'preRegistration.reference',
        'preRegistration.years',
        'preRegistration.licenseClassId',
      ];

      queryBuilder
        .leftJoinAndSelect('schedules.cbtCenter', 'center')
        .leftJoinAndSelect('schedules.student', 'student')
        .leftJoinAndSelect('student.application', 'application')
        .leftJoinAndSelect('schedules.assessedBy', 'assessor')
        .leftJoin('schedules.preRegistration', 'preRegistration');

      queryBuilder.select(fieldsToSelect);

      queryBuilder.where(
        new Brackets((qb) => {
          qb.where('assessor.id = :userId', { userId: user.id }).orWhere('assessor.id IS NULL');
        }),
      );
      if (data.search && data.search.trim() !== '') {
        const searchTerm = `%${data.search.trim()}%`;
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('application.firstName LIKE :search', { search: searchTerm })
              .orWhere('application.lastName LIKE :search', { search: searchTerm })
              .orWhere('application.email LIKE :search', { search: searchTerm });
          }),
        );
      }

      queryBuilder.orderBy('schedules.createdAt', sortOrder);

      // --- Pagination ---
      queryBuilder.skip(offset).take(limit);
      const [result, count] = await queryBuilder.getManyAndCount();

      if (result) {
        response.data = {
          result,
          pagination: getPagination(count, page, offset, limit),
        };
      }
      // return formatted response
      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Fetch questions
   * @param data
   */
  async questionList(data: FetchQuestionsDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    //^ set variables
    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    const queryBuilder = this.questionRepository.createQueryBuilder('questions');
    if (data.category) {
      queryBuilder.where('questions.category = :category', {
        category: data.category,
      });
    }
    if (data.difficultyLevel) {
      queryBuilder.where('questions.difficultyLevel = :difficultyLevel', {
        difficultyLevel: data.difficultyLevel,
      });
    }
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('questions.questionText ILIKE :search', { search: `%${search}%` });
        }),
      );
    }
    // Apply pagination and ordering
    queryBuilder.skip(offset);
    queryBuilder.take(limit);
    queryBuilder.orderBy('questions.id', 'DESC');

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
      response.message = error.message;
    }
    return response;
  }

  /**
   * Update question
   * @param data
   * @param user
   */
  async updateQuestion(data: UpdateQuestionDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // Find question
      const question = await queryRunner.manager.findOne(Question, { where: { id: data.id } });
      if (!question) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }

      // Create and update question
      const newQuestion = queryRunner.manager.create(Question, data);
      await queryRunner.manager.update(Question, { id: data.id }, newQuestion);
      response.data = newQuestion;

      // Create audit log
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'questions',
        resourceId: response.data.id,
        description: `Question updated successfully`,
      });

      await queryRunner.commitTransaction();
      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
    return response;
  }

  /**
   * Create question
   * @param createQuestionDto
   * @param user
   */
  async createQuestion(
    createQuestionDto: CreateQuestionDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // Create question
      const newQuestion = queryRunner.manager.create(Question, createQuestionDto);
      response.data = await queryRunner.manager.save(newQuestion);

      // Create audit log
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_ADD,
        tableName: 'questions',
        resourceId: response.data.id,
        description: `Question created successfully`,
      });

      await queryRunner.commitTransaction();
      response.success = true;
      response.message = MESSAGES.recordAdded;
    } catch (error: any) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  /**
   * Get failed attempts
   * @param studentId
   */
  async getFailedAttempts(studentId: number): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      const currentDate = new Date();
      // Fetch student by student cert number
      // Pull student records
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });
      // If student record doesn't exist, return error
      if (!student) {
        throw new BadRequestException('Student does not exist');
      }
      // Find all previous failed attempts for the student
      const failedAttempts = await this.cbtScheduleRepository.find({
        where: { studentId: student.id, cbtStatus: TestStatus.Failed },
        order: { date: 'DESC', time: 'DESC', createdAt: 'DESC' },
      });

      const numberOfFailedAttempts = failedAttempts.length;
      let nextRescheduleDate: Date | null = null;
      const totalRescheduleAttempts = appConstants.totalRescheduleAttempts;

      if (numberOfFailedAttempts === totalRescheduleAttempts - 1) {
        // Reschedule after 3 months
        nextRescheduleDate = this.addMonths(currentDate, 3);
      } else if (numberOfFailedAttempts === totalRescheduleAttempts - 2) {
        // Reschedule after 1 month
        nextRescheduleDate = this.addMonths(currentDate, 1);
      } else if (numberOfFailedAttempts === 1) {
        // Reschedule after 7 days
        nextRescheduleDate = this.addDays(currentDate, 7);
      }

      response.data = {
        maxAttempts: totalRescheduleAttempts - 1,
        failedAttempts: numberOfFailedAttempts,
        nextRescheduleDate: nextRescheduleDate,
      };
      response.success = true;
      response.message = 'Query ok!';
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Reschedule CBT
   * @param data
   */
  async rescheduleCbt(data: CbtRescheduleDto): Promise<RequestResultInterface> {
    //^ set variables
    const response = { success: false, message: '' };
    let payment: Payment;
    try {
      if (data.reference && data.reference.length > 0) {
        // Validate and attach transaction to cbt schedule
        payment = await this.paymentService.findPaymentBy({
          reference: data.reference,
          type: TransactionType.cbtReschedulePayment,
          status: PaymentStatus.Completed,
          used: Reference.Unused,
        });

        if (!payment) {
          throw new NotFoundException('Payment reference not found or has been used');
        }
        // Set transaction ID
        data.transactionId = payment.id;
      }

      // Prevent booking a date in the past
      const currentDate = new Date();
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const bookingDate = new Date(data.date);
      bookingDate.setHours(0, 0, 0, 0);

      if (now > bookingDate) {
        throw new BadRequestException('You cannot book a date in the past!');
      }
      // Find all previous failed attempts for the student
      const failedAttempts = await this.cbtScheduleRepository.find({
        where: { studentId: data.studentId, cbtStatus: TestStatus.Failed },
        order: { date: 'DESC', time: 'DESC', createdAt: 'DESC' },
      });

      const numberOfFailedAttempts = failedAttempts.length;
      let nextRescheduleDate: Date | null = null;
      const totalRescheduleAttempts = appConstants.totalRescheduleAttempts;

      if (numberOfFailedAttempts >= totalRescheduleAttempts) {
        // Payment is required
        if (!data.reference) {
          throw new Error(
            'Student has reached the maximum number of failed free attempts. Payment is required.',
          );
        }
      } else if (numberOfFailedAttempts === totalRescheduleAttempts - 1) {
        // Reschedule after 3 months
        nextRescheduleDate = this.addMonths(currentDate, 3);
      } else if (numberOfFailedAttempts === totalRescheduleAttempts - 2) {
        // Reschedule after 1 month
        nextRescheduleDate = this.addMonths(currentDate, 1);
      } else if (numberOfFailedAttempts === 1) {
        // Reschedule after 7 days
        nextRescheduleDate = this.addDays(currentDate, 7);
      }

      if (numberOfFailedAttempts > 0) {
        // Find the latest failed attempt
        const latestFailedAttempt = failedAttempts[0];
        if (nextRescheduleDate && new Date(latestFailedAttempt.date) < nextRescheduleDate) {
          const formattedNextRescheduleDate = nextRescheduleDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
          throw new Error(`Rescheduling is allowed only after ${formattedNextRescheduleDate}.`);
        }
      }

      data.cbtStatus = TestStatus.ReScheduled;
      await this.scheduleTest(data.studentId, data.cbtCenterId, data);

      if (payment) {
        // Update payment status
        payment.used = Reference.Used;
        payment.status = PaymentStatus.Used;
        await this.paymentService.update(payment.id, payment);
      }

      response.success = true;
      response.message = 'CBT rescheduled successfully!';
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Update schedule with query runner
   * @param scheduleId
   * @param data
   * @param queryRunner
   */
  async updateScheduleWithQueryRunner(scheduleId: number, data: any, queryRunner: QueryRunner) {
    await queryRunner.manager.update(CbtSchedule, { id: scheduleId }, data);
  }

  /**
   * Add Days
   * @param date
   * @param days
   * @private
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Add Months
   * @param date
   * @param months
   * @private
   */
  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  async viewCenterDetails(id: number): Promise<DataResultInterface<CbtCenterResponseDto>> {
    const response = { success: false, message: '', data: null };

    const centerDetails = await this.cbtCenterRepository.findOne({ where: { id } });
    if (!centerDetails) {
      throw new NotFoundException('Center not found');
    }

    response.data = plainToInstance(CbtCenterResponseDto, centerDetails);

    response.success = true;
    response.message = MESSAGES.recordFound;

    return response;
  }

  async getAllCbtSchedules(
    data: ListCbtScheduleRequestDto,
  ): Promise<DataResultInterface<CbtScheduleResponseDto[]>> {
    const response = { success: false, message: '', data: null };

    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset = (page - 1) * limit;

    try {
      const qb = this.cbtScheduleRepository
        .createQueryBuilder('cbt')
        .leftJoinAndSelect('cbt.student', 'student')
        .leftJoinAndSelect('student.application', 'application')
        .select([
          'cbt.id',
          'cbt.date',
          'cbt.time',
          'cbt.cbtStatus',
          'cbt.score',
          'student.id',
          'application.id',
          'application.applicationNo',
          'application.firstName',
          'application.lastName',
          'application.middleName',
          'application.email',
        ])
        .orderBy('cbt.date', data.order === 'ASC' ? 'ASC' : 'DESC')
        .skip(offset)
        .take(limit);

      if (data.cbtStatus) {
        qb.andWhere('cbt.cbtStatus = :cbtStatus', { cbtStatus: data.cbtStatus });
      }

      if (data.createdAtStart && data.createdAtEnd) {
        qb.andWhere(`cbt.date BETWEEN :start AND :end`, {
          start: data.createdAtStart,
          end: data.createdAtEnd,
        });
      }

      if (data.search?.trim()) {
        const searchTerm = `%${data.search.trim()}%`;
        qb.andWhere(
          `(application.firstName ILIKE :search OR application.lastName ILIKE :search OR application.middleName ILIKE :search)`,
          { search: searchTerm },
        );
      }

      const [result, count] = await qb.getManyAndCount();

      const transformedResult = plainToInstance(CbtScheduleResponseDto, result, {
        excludeExtraneousValues: true,
      });

      response.success = true;
      response.message = MESSAGES.recordFound;
      response.data = {
        result: transformedResult,
        pagination: getPagination(count, page, offset, limit),
      };
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }

    return response;
  }

  async getSingleCbtSchedule(id: number): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };

    try {
      const schedule = await this.cbtScheduleRepository.findOne({
        where: { id },
        relations: ['student', 'cbtCenter', 'student.application'],
      });

      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      const transformed = plainToInstance(CbtScheduleResponseDto, schedule, {
        excludeExtraneousValues: true,
      });

      response.success = true;
      response.message = MESSAGES.recordFound;
      response.data = transformed;
      return response;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }

  async getCbtScheduleStatistics(): Promise<DataResultInterface<TestStatsDto>> {
    const response = { success: false, message: '', data: null };

    try {
      const stats = await this.cbtScheduleRepository
        .createQueryBuilder('cbt')
        .select([
          'COUNT(*)::int AS "allApplications"',
          'SUM(CASE WHEN cbt.cbtStatus = :reScheduled THEN 1 ELSE 0 END)::int AS "reScheduled"',
          'SUM(CASE WHEN cbt.cbtStatus = :scheduled THEN 1 ELSE 0 END)::int AS "scheduled"',
          'SUM(CASE WHEN cbt.cbtStatus = :failed THEN 1 ELSE 0 END)::int AS "failed"',
          'SUM(CASE WHEN cbt.cbtStatus = :passed THEN 1 ELSE 0 END)::int AS "passed"',
        ])
        .setParameters({
          reScheduled: TestStatus.ReScheduled,
          scheduled: TestStatus.Scheduled,
          failed: TestStatus.Failed,
          passed: TestStatus.Passed,
        })
        .getRawOne();

      response.data = {
        allApplications: stats.allApplications || 0,
        reScheduled: stats.reScheduled || 0,
        scheduled: stats.scheduled || 0,
        failed: stats.failed || 0,
        passed: stats.passed || 0,
      };
      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(response.message);
    }

    return response;
  }

  async updateDeviceThreshold(
    data: UpdateDeviceThresholdDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const center = await queryRunner.manager.findOne(CbtCenter, { where: { id: data.centerId } });
      if (!center) {
        throw new NotFoundException('Center not found');
      }

      // Update device threshold
      await queryRunner.manager.update(
        CbtCenter,
        { id: data.centerId },
        { threshold: data.threshold, devices: data.devices },
      );

      // Create audit log
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'cbt_centers',
        resourceId: data.centerId,
        description: `Device threshold updated to ${data.threshold} and devices updated to ${data.devices}`,
      });

      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  async getCbtCenterStatistics(user: AuthUserInfo): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };
    try {
      const result = await this.cbtCenterRepository
        .createQueryBuilder('center')
        .select([
          'COUNT(*) AS "totalCenters"',
          'SUM(CASE WHEN center.isActive = :active THEN 1 ELSE 0 END) AS "activeCenters"',
          'SUM(CASE WHEN center.isActive = :probation THEN 1 ELSE 0 END) AS "probationCenters"',
          'SUM(CASE WHEN center.isActive = :suspended THEN 1 ELSE 0 END) AS "suspendedCenters"',
        ])
        .setParameters({
          active: Status.Active,
          probation: Status.Probation,
          suspended: Status.Suspended,
        })
        .getRawOne();

      response.data = {
        totalCenters: parseInt(result.totalCenters) || 0,
        activeCenters: parseInt(result.activeCenters) || 0,
        probationCenters: parseInt(result.probationCenters) || 0,
        suspendedCenters: parseInt(result.suspendedCenters) || 0,
      };
      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.error(error);
      console.error(`Queried by user ID: ${user.id}`);
      throw new InternalServerErrorException(error.message);
    }

    return response;
  }

  async bulkCenterUpload(
    data: CreateCbtCenterDto[],
    user: AuthUserInfo,
  ): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const createdCenters: CbtCenter[] = [];
      const existingCenters: string[] = [];

      for (const centerData of data) {
        // Check if the center already exists
        const exists = await queryRunner.manager.findOne(CbtCenter, {
          where: { name: centerData.name, stateId: centerData.stateId, lgaId: centerData.lgaId },
        });

        if (exists) {
          existingCenters.push(centerData.name);
          continue; // Skip creating this center
        }

        // Generate unique identifier for the center
        centerData.identifier = hexCode({ count: 8, caps: true, prefix: 'CID' });
        centerData.isActive = 1;

        // Create and save the center
        const newCenter = queryRunner.manager.create(CbtCenter, centerData);
        const savedCenter = await queryRunner.manager.save(CbtCenter, newCenter);
        createdCenters.push(savedCenter);

        // Create audit log for each center
        await queryRunner.manager.insert(AuditTrail, {
          userId: user.id,
          dbAction: auditAction.RECORD_ADD,
          tableName: 'cbt_centers',
          resourceId: savedCenter.id,
          description: `CBT Center "${savedCenter.name}" created successfully`,
        });
      }

      await queryRunner.commitTransaction();

      response.success = true;
      response.message = `${createdCenters.length} CBT Centers uploaded successfully.`;
      if (existingCenters.length > 0) {
        response.message += ` The following centers already exist and were skipped: ${existingCenters.join(', ')}.`;
      }
      response.data = createdCenters;
    } catch (error: any) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  async dashboardStats(data: FetchDashboardStatsRequestDto) {
    const statisticsType = data.type;

    switch (statisticsType) {
      case StatisticsFilter.Tests:
        return this.getTestsDashboardStats();

      case StatisticsFilter.Centers:
        return this.getCentersDashboardStats();

      case StatisticsFilter.DVISOfficers:
        return this.getDVISROLEDashboardStats();

      case StatisticsFilter.Revenue:
        return this.getRevenueDashboardStats(
          data.selectedYear,
          data.topLgaCount,
          data.bottomLgaCount,
        );

      default:
        throw new BadRequestException('Invalid statistics type');
    }
  }

  async getTestsDashboardStats() {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));

    // Count Applications
    const currentMonthCount = await this.drivingSchoolAppRepository.count({
      where: {
        createdAt: Between(startOfCurrentMonth, endOfCurrentMonth),
      },
    });

    const lastMonthCount = await this.drivingSchoolAppRepository.count({
      where: {
        createdAt: Between(startOfLastMonth, endOfLastMonth),
      },
    });

    const totalApplicationsCount = await this.drivingSchoolAppRepository.count();

    // Compute Change
    const change = currentMonthCount - lastMonthCount;
    const percentageChange = lastMonthCount === 0 ? 100 : (change / lastMonthCount) * 100;
    const direction = change >= 0 ? 'up' : 'down';
    const formattedChange = `${Math.abs(percentageChange).toFixed(1)}%`;

    const totalApplications = {
      count: totalApplicationsCount,
      monthlyPercentageChange: {
        value: Number(percentageChange.toFixed(1)),
        direction,
        formatted: formattedChange,
      },
    };

    // CBT Stats
    const cbtStats = await this.cbtScheduleRepository
      .createQueryBuilder('cbt')
      .select(['COUNT(*) as total', `SUM(CASE WHEN cbt.score >= 50 THEN 1 ELSE 0 END) as passed`])
      .getRawOne();

    const totalCbt = parseInt(cbtStats.total, 10);
    const cbtPassed = parseInt(cbtStats.passed, 10);
    const cbtFailed = totalCbt - cbtPassed;
    const cbtPassRate = totalCbt > 0 ? (cbtPassed / totalCbt) * 100 : 0;
    const cbtFailRate = totalCbt > 0 ? (cbtFailed / totalCbt) * 100 : 0;

    // Driving Test Stats (status = Scheduled)
    const drivingStats = await this.drivingTestRepository
      .createQueryBuilder('dt')
      .select(['COUNT(*) as total', `SUM(CASE WHEN dt.score >= 50 THEN 1 ELSE 0 END) as passed`])
      .where('dt.status = :status', { status: TestStatus.Scheduled })
      .getRawOne();

    const totalDrivingTests = parseInt(drivingStats.total, 10);
    const drivingPassed = parseInt(drivingStats.passed, 10);
    const drivingFailed = totalDrivingTests - drivingPassed;
    const drivingPassRate = totalDrivingTests > 0 ? (drivingPassed / totalDrivingTests) * 100 : 0;
    const drivingFailRate = totalDrivingTests > 0 ? (drivingFailed / totalDrivingTests) * 100 : 0;

    // Renewal Test Stats (status = ReScheduled)
    const renewalStats = await this.drivingTestRepository
      .createQueryBuilder('dt')
      .select(['COUNT(*) as total', `SUM(CASE WHEN dt.score >= 50 THEN 1 ELSE 0 END) as passed`])
      .where('dt.status = :status', { status: TestStatus.ReScheduled })
      .getRawOne();

    const totalRenewalTests = parseInt(renewalStats.total, 10);
    const renewalPassed = parseInt(renewalStats.passed, 10);
    const renewalFailed = totalRenewalTests - renewalPassed;
    const renewalPassRate = totalRenewalTests > 0 ? (renewalPassed / totalRenewalTests) * 100 : 0;
    const renewalFailRate = totalRenewalTests > 0 ? (renewalFailed / totalRenewalTests) * 100 : 0;

    const cbtStatsCounts = await this.cbtScheduleRepository
      .createQueryBuilder('cbt')
      .select([
        'SUM(CASE WHEN cbt.cbtStatus = :reScheduled THEN 1 ELSE 0 END)::int AS "reScheduled"',
        'SUM(CASE WHEN cbt.cbtStatus = :scheduled THEN 1 ELSE 0 END)::int AS "scheduled"',
        'SUM(CASE WHEN cbt.cbtStatus = :failed THEN 1 ELSE 0 END)::int AS "failed"',
        'SUM(CASE WHEN cbt.cbtStatus = :passed THEN 1 ELSE 0 END)::int AS "passed"',
      ])
      .setParameters({
        reScheduled: TestStatus.ReScheduled,
        scheduled: TestStatus.Scheduled,
        failed: TestStatus.Failed,
        passed: TestStatus.Passed,
      })
      .getRawOne();

    const cbtDistributionByStatus = {
      pending: cbtStatsCounts.scheduled || 0,
      failed: cbtStatsCounts.failed || 0,
      passed: cbtStatsCounts.passed || 0,
      reScheduled: cbtStatsCounts.reScheduled || 0,
      missed: cbtStatsCounts.missed || 0,
    };

    const drivingTestStatsCounts = await this.drivingTestRepository
      .createQueryBuilder('dt')
      .select([
        'SUM(CASE WHEN dt.status = :scheduled THEN 1 ELSE 0 END)::int AS "scheduled"',
        'SUM(CASE WHEN dt.status = :failed THEN 1 ELSE 0 END)::int AS "failed"',
        'SUM(CASE WHEN dt.status = :passed THEN 1 ELSE 0 END)::int AS "passed"',
      ])
      .setParameters({
        scheduled: TestStatus.Scheduled,
        failed: TestStatus.Failed,
        passed: TestStatus.Passed,
      })
      .getRawOne();

    const DrivingTestDistributionByStatus = {
      pending: drivingTestStatsCounts.scheduled || 0,
      failed: drivingTestStatsCounts.failed || 0,
      passed: drivingTestStatsCounts.passed || 0,
    };

    const cbtAppDistributionByLgaId = await this.cbtScheduleRepository
      .createQueryBuilder('dt')
      .leftJoin('dt.student', 'student')
      .leftJoin('student.application', 'application')
      .select('application.lgaOfOriginId', 'lgaOfOriginId')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('application.lgaOfOriginId')
      .getRawMany();

    const cbtApplicationDistributionByLga = cbtAppDistributionByLgaId.map((entry) => {
      const lga = lgas.find((l) => l.id === Number(entry.lgaOfOriginId));
      return {
        lga: lga?.name ?? `Unknown (${entry.lgaOfOriginId})`,
        count: Number(entry.count),
      };
    });

    return {
      totalApplications,
      cbt: {
        total: totalCbt,
        passRate: Number(cbtPassRate.toFixed(1)),
        failRate: Number(cbtFailRate.toFixed(1)),
      },
      drivingTest: {
        total: totalDrivingTests,
        passRate: Number(drivingPassRate.toFixed(1)),
        failRate: Number(drivingFailRate.toFixed(1)),
      },
      renewalTest: {
        total: totalRenewalTests,
        passRate: Number(renewalPassRate.toFixed(1)),
        failRate: Number(renewalFailRate.toFixed(1)),
      },
      cbtDistributionByStatus,
      DrivingTestDistributionByStatus,
      cbtApplicationDistributionByLga,
    };
  }

  async getCentersDashboardStats() {
    const totalCentersCount = await this.cbtCenterRepository.count();

    const centerDistributionByLgaId = await this.cbtCenterRepository
      .createQueryBuilder('center')
      .select('center.lgaId', 'lgaId')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('center.lgaId')
      .getRawMany();

    const centerDistributionByLga = centerDistributionByLgaId.map((entry) => {
      const lga = lgas.find((l) => l.id === Number(entry.lgaId));
      return {
        lga: lga?.name ?? `Unknown (${entry.lgaId})`,
        count: Number(entry.count),
      };
    });

    return {
      totalCenters: totalCentersCount,
      centerDistributionByLga,
    };
  }

  async getDVISROLEDashboardStats() {
    const result = await this.userRepository
      .createQueryBuilder('users')
      .select('COUNT(*)', 'total')
      .addSelect(`COUNT(CASE WHEN users."is_active" = ${Status.Active} THEN 1 END)`, 'active')
      .addSelect(`COUNT(CASE WHEN users."is_active" = ${Status.Inactive} THEN 1 END)`, 'inactive')
      .where('users."role_id" = :dvisRoleId', { dvisRoleId: Role.DVIS })
      .getRawOne();

    const stats = {
      total: Number(result.total),
      active: Number(result.active),
      inactive: Number(result.inactive),
    };

    const distributionByLgaId = await this.userRepository
      .createQueryBuilder('users')
      .select('users.lgaId', 'lgaId')
      .addSelect('COUNT(*)::int', 'count')
      .where('users."role_id" = :dvisRoleId', { dvisRoleId: Role.DVIS })
      .groupBy('users.lgaId')
      .getRawMany();

    // distributionByAgeGroup: user entity dont have age or date of birth field

    // distributionByGender user dont have gender or genderId field

    const dvisOfficerDistributionByLga = distributionByLgaId.map((entry) => {
      const lga = lgas.find((l) => l.id === Number(entry.lgaId));

      return {
        lga: lga?.name ?? `Unknown (${entry.lgaId})`,
        count: Number(entry.count),
      };
    });

    return {
      stats,
      dvisOfficerDistributionByLga,
    };
  }

  async getRevenueDashboardStats(
    selectedYear: number = new Date().getFullYear(),
    topLgaCount: number = 5,
    bottomLgaCount: number = 5,
  ) {
    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const allowedTypes = [TransactionType.preRegistration, TransactionType.cbtReschedulePayment];

    // === CURRENT MONTH DATA ===
    const currentStats = await this.paymentRepository
      .createQueryBuilder('transactions')
      .select('transactions.itemType', 'itemType')
      .addSelect('SUM(transactions.amount)', 'totalAmount')
      .where('transactions.status = :status', { status: PaymentStatus.Completed })
      .andWhere('transactions.refunded = false')
      .andWhere('transactions.itemType IN (:...allowedTypes)', { allowedTypes })
      .andWhere('transactions.created_at BETWEEN :start AND :end', {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      })
      .groupBy('transactions.itemType')
      .getRawMany();

    const currentMap = new Map<string, number>();
    currentStats.forEach((entry) => {
      currentMap.set(entry.itemType, parseFloat(entry.totalAmount));
    });

    // === LAST MONTH DATA ===
    const lastStats = await this.paymentRepository
      .createQueryBuilder('transactions')
      .select('transactions.itemType', 'itemType')
      .addSelect('SUM(transactions.amount)', 'totalAmount')
      .where('transactions.status = :status', { status: PaymentStatus.Completed })
      .andWhere('transactions.refunded = false')
      .andWhere('transactions.itemType IN (:...allowedTypes)', { allowedTypes })
      .andWhere('transactions.created_at BETWEEN :start AND :end', {
        start: new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1),
        end: new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0),
      })
      .groupBy('transactions.itemType')
      .getRawMany();

    const lastMap = new Map<string, number>();
    lastStats.forEach((entry) => {
      lastMap.set(entry.itemType, parseFloat(entry.totalAmount));
    });

    // === MERGE + CALCULATE PERCENTAGE CHANGE BY ITEM TYPE ===
    const revenueByType = allowedTypes.map((type) => {
      const currentAmount = currentMap.get(type) || 0;
      const lastAmount = lastMap.get(type) || 0;

      let percentageChange = 0;
      let isUp = false;

      if (lastAmount === 0) {
        if (currentAmount > 0) {
          percentageChange = 100;
          isUp = true;
        }
      } else {
        percentageChange = ((currentAmount - lastAmount) / lastAmount) * 100;
        isUp = currentAmount > lastAmount;
      }

      const label = (() => {
        switch (type) {
          case TransactionType.preRegistration:
            return 'CBT';
          case TransactionType.cbtReschedulePayment:
            return 'Renewal Test';
          default:
            return 'Unknown';
        }
      })();

      return {
        itemType: label,
        amount: currentAmount,
        changePercentage: Math.abs(Number(percentageChange.toFixed(1))),
        isUp,
      };
    });

    const revenueStatsRaw = await this.paymentRepository
      .createQueryBuilder('payment')
      .select(`EXTRACT(MONTH FROM payment.createdAt)`, 'month')
      .addSelect(`SUM(payment.amount)::float`, 'totalRevenue')
      .where(`EXTRACT(YEAR FROM payment.createdAt) = :year`, { year: selectedYear })
      .andWhere('payment.status = :status', { status: PaymentStatus.Completed })
      .andWhere('payment.itemType IN (:...allowedTypes)', { allowedTypes })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    const monthlyRevenue = Array.from({ length: 12 }, (_, index) => {
      const monthData = revenueStatsRaw.find((m) => Number(m.month) === index + 1);
      return {
        month: MONTH_NAMES[index],
        revenue: monthData ? Number(monthData.totalRevenue) : 0,
      };
    });

    // === TOTAL REVENUE CURRENT & LAST MONTH ===
    const currentMonthRevenue = revenueByType.reduce((acc, entry) => acc + entry.amount, 0);
    const lastMonthRevenue = allowedTypes.reduce((sum, type) => sum + (lastMap.get(type) || 0), 0);

    console.log({ currentMonthRevenue });
    console.log({ lastMonthRevenue });

    let revenueChange = 0;
    let isUp = false;
    if (lastMonthRevenue === 0) {
      // If last month had no revenue, mark as up if current month has any revenue.
      if (currentMonthRevenue > 0) {
        revenueChange = 100; // or set to a default / sentinel value indicating 'new revenue'
        isUp = true;
      }
    } else {
      revenueChange = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      isUp = revenueChange > 0;
    }

    const totalRevenue = {
      amount: currentMonthRevenue,
      changePercentage: Math.abs(Number(revenueChange.toFixed(1))),
      isUp,
    };

    // === DISTRIBUTION BY ITEM TYPE ===
    const distributionByItemType = allowedTypes.map((type) => {
      const amount = currentMap.get(type) || 0;
      const percentage =
        currentMonthRevenue > 0 ? Number(((amount / currentMonthRevenue) * 100).toFixed(1)) : 0;

      const label = (() => {
        switch (type) {
          case TransactionType.preRegistration:
            return 'CBT';
          case TransactionType.cbtReschedulePayment:
            return 'Renewal Test';
          default:
            return 'Unknown';
        }
      })();

      return {
        itemType: label,
        amount,
        percentage,
      };
    });

    // === DISTRIBUTION BY LGA === (TOP & BOTTOM)
    const topLgaRevenueStats = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin(
        PreRegistration,
        'preReg',
        'payment.item_type = :preType AND payment.reference = preReg.reference',
        { preType: TransactionType.preRegistration },
      )
      .leftJoin(Student, 'student', 'student.id = COALESCE(preReg.student_id, student.id)')
      .leftJoin('student.application', 'application')
      .select('application.lga_of_origin_id', 'lgaId')
      .addSelect('COUNT(payment.id)', 'paymentCount')
      .where('payment.status = :status', { status: PaymentStatus.Completed })
      .andWhere('payment.refunded = false')
      .andWhere('payment.item_type IN (:...allowedTypes)', { allowedTypes })
      .groupBy('application.lga_of_origin_id')
      .orderBy('"paymentCount"', 'DESC')
      .limit(topLgaCount)
      .getRawMany();

    const bottomLgaRevenueStats = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin(
        PreRegistration,
        'preReg',
        'payment.item_type = :preType AND payment.reference = preReg.reference',
        { preType: TransactionType.preRegistration },
      )
      .leftJoin(Student, 'student', 'student.id = COALESCE(preReg.student_id, student.id)')
      .leftJoin('student.application', 'application')
      .select('application.lga_of_origin_id', 'lgaId')
      .addSelect('COUNT(payment.id)', 'paymentCount')
      .where('payment.status = :status', { status: PaymentStatus.Completed })
      .andWhere('payment.refunded = false')
      .andWhere('payment.item_type IN (:...allowedTypes)', { allowedTypes })
      .groupBy('application.lga_of_origin_id')
      .orderBy('"paymentCount"', 'ASC')
      .limit(bottomLgaCount)
      .getRawMany();

    const mapToLgaDistribution = (stats) =>
      stats.map((row) => {
        const lga = lgas.find((l) => l.id === Number(row.lgaId));
        return {
          lga: lga?.name ?? `Unknown (${row.lgaId})`,
          count: parseInt(row.paymentCount, 10),
        };
      });

    const topLgaRevenueDistribution = mapToLgaDistribution(topLgaRevenueStats);
    const bottomLgaRevenueDistribution = mapToLgaDistribution(bottomLgaRevenueStats);

    return {
      totalRevenue,
      revenueByType,
      monthlyRevenueStats: {
        year: selectedYear,
        data: monthlyRevenue,
      },
      distributionByItemType,
      topLgaRevenueDistribution,
      bottomLgaRevenueDistribution,
    };
  }

  async bulkUploadQuestions(
    data: CreateQuestionDto[],
    user: AuthUserInfo,
  ): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const createdQuestions: Question[] = [];
      const existingQuestions: string[] = [];

      for (const questionData of data) {
        // Check if the question already exists
        const exists = await queryRunner.manager.findOne(Question, {
          where: { questionText: questionData.questionText },
        });

        if (exists) {
          existingQuestions.push(questionData.questionText);
          continue; // Skip creating this question
        }

        // Create and save the question
        const newQuestion = queryRunner.manager.create(Question, questionData);
        const savedQuestion = await queryRunner.manager.save(Question, newQuestion);
        createdQuestions.push(savedQuestion);

        // Create audit log for each question
        await queryRunner.manager.insert(AuditTrail, {
          userId: user.id,
          dbAction: auditAction.RECORD_ADD,
          tableName: 'questions',
          resourceId: savedQuestion.id,
          description: `CBT Question "${savedQuestion.questionText}" created successfully`,
        });
      }

      await queryRunner.commitTransaction();

      response.success = true;
      response.message = `${createdQuestions.length} CBT Questions uploaded.`;
      if (existingQuestions.length > 0) {
        response.message += ` The following questions already exist and were skipped: ${existingQuestions.join(', ')}.`;
      }
      response.data = createdQuestions;
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
