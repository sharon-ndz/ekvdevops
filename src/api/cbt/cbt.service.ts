import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, FindManyOptions, IsNull, LessThan, Repository } from 'typeorm';
import { CbtCenter } from '../../entities/cbt-center.entity';
import { FetchMasterListDto } from '../driving-school/driving-school.dto';
import {
  AuthUserInfo,
  DataResultInterface,
  RequestResultInterface,
} from '../../core/interfaces/all.interface';
import { MESSAGES } from '../../core/constants/messages';
import { appConstants, auditAction } from '../../core/constants/constants';
import {
  BookSlotDto,
  CbtCenterIdDto,
  CbtRescheduleDto,
  CbtScheduleDto,
  CreateCbtCenterDto,
  CreateQuestionDto,
  FetchQuestionsDto,
  QuestionByStudentDto,
  SubmitTestDto,
  UpdateCbtCenterDto,
  UpdateQuestionDto,
} from './cbt.dto';
import { CbtSchedule } from '../../entities/cbt-schedule.entity';
import { Question } from '../../entities/question.entity';
import { Student } from '../../entities/student.entity';
import {
  BookingStatus,
  CbtStatus,
  PaymentStatus,
  Reference,
  Status,
  TransactionType,
} from '../../core/constants/enums';
import { PaymentService } from '../payment/payment.service';
import { Payment } from '../../entities/payment.entity';
import { beginTransaction } from '../../core/interfaces/all.dto';
import { getPagination } from '../../core/helpers/functions.helpers';
import { AuditTrail } from '../../entities/audit-trail.entity';

@Injectable()
export class CbtService {
  constructor(
    @InjectRepository(CbtCenter)
    private readonly cbtCenterRepository: Repository<CbtCenter>,
    @InjectRepository(CbtSchedule)
    private readonly cbtScheduleRepository: Repository<CbtSchedule>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(AuditTrail)
    private readonly auditTrailRepository: Repository<AuditTrail>,
    private readonly paymentService: PaymentService,
    private dataSource: DataSource,
  ) {}

  /**
   * Fetch CBT centers
   * @param data
   */
  async getCbtCenters(data: FetchMasterListDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    try {
      const whereClause: FindManyOptions<CbtCenter> = {
        select: ['id', 'name', 'stateId', 'lgaId', 'isActive'],
        where: undefined,
        skip: offset,
        take: limit,
      };

      const whereConditions: Record<string, any> = { isActive: Status.Active };

      if (data.stateId) {
        whereConditions.stateId = data.stateId;
      }

      if (data.lgaId) {
        whereConditions.lgaId = data.lgaId;
      }
      // Set where conditions
      whereClause.where = whereConditions;

      const [result, count] = await this.cbtCenterRepository.findAndCount(whereClause);
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
   * Create CBT center
   * @param data
   */
  async createCenter(data: CreateCbtCenterDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      const exists = await this.cbtCenterRepository.findOne({
        where: data,
      });
      if (exists) {
        throw new BadRequestException(MESSAGES.recordExists);
      }
      const cbtCenter = await this.cbtCenterRepository.save(data);
      response.success = true;
      response.data = cbtCenter;
      response.message = MESSAGES.recordAdded;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
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
        preBooked.cbtStatus = CbtStatus.Scheduled;
      }
      if (scheduleDto.transactionId) {
        preBooked.transactionId = scheduleDto.transactionId;
      }
      // Save the schedule
      await queryRunner.manager.save(preBooked);
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
    } finally {
      await queryRunner.release();
    }
    return null;
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
      queryBuilder.orderBy('RANDOM()'); // randomize
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
      // Update the score and answers on cbt schedule
      schedule.answers = data.answers;
      schedule.score = score;
      await this.cbtScheduleRepository.update({ id: schedule.id }, schedule);
      response.data = schedule;
      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  async cbtEnrolls(user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // Get cbt enrolls
      const enrolls = await this.cbtScheduleRepository.find({
        where: [{ assessedBy: { id: user.id } }, { assessedBy: IsNull() }],
        relations: ['cbtCenter', 'student.application'],
      });
      // return formatted response
      response.success = true;
      response.data = enrolls;
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
    try {
      // Find question
      const question = await this.questionRepository.findOne({ where: { id: data.id } });
      if (!question) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }
      // Create question
      const newQuestion = this.questionRepository.create(data);
      await this.questionRepository.update({ id: data.id }, newQuestion);
      response.data = newQuestion;

      // Create audit log
      await this.auditTrailRepository.insert({
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'questions',
        resourceId: response.data.id,
        description: `Question updated successfully`,
      });
      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
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
    try {
      // Create question
      const newQuestion = this.questionRepository.create(createQuestionDto);
      response.data = await this.questionRepository.save(newQuestion);

      // Create audit log
      await this.auditTrailRepository.insert({
        userId: user.id,
        dbAction: auditAction.RECORD_ADD,
        tableName: 'questions',
        resourceId: response.data.id,
        description: `Question created successfully`,
      });
      response.success = true;
      response.message = MESSAGES.recordAdded;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
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
        where: { studentId: student.id, cbtStatus: CbtStatus.Failed },
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
        where: { studentId: data.studentId, cbtStatus: CbtStatus.Failed },
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

      data.cbtStatus = CbtStatus.ReScheduled;
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
}
