import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, FindManyOptions, LessThan, QueryRunner, Repository } from 'typeorm';
import { FetchMasterListDto } from '../driving-school/driving-school.dto';
import { AuthUserInfo, DataResultInterface } from '../../core/interfaces/all.interface';
import { DrivingTestCenter } from '../../entities/driving-test-center.entity';
import { DrivingTestSchedule } from '../../entities/driving-test-schedule.entity';
import { Student } from '../../entities/student.entity';
import {
  BookingStatus,
  TestStatus,
  PaymentStatus,
  Reference,
  Status,
} from '../../core/constants/enums';
import {
  BookDrivingTestSlotDto,
  CreateDrivingTestCenterDto,
  DrivingTestCenterIdDto,
  DrivingTestScheduleDto,
  DrivingTestScheduleResponseDto,
  ListCbtScheduleRequestDto,
  SubmitDrivingTestDto,
  UpdateDrivingTestCenterDto,
} from './driving-test.dto';
import { plainToInstance } from 'class-transformer';
import { generateDrivingCenterNo } from '../../core/helpers/general';
import { PreRegistration } from '../../entities/pre-registration.entity';
import { BaseRequestDto, beginTransaction } from '../../core/interfaces/all.dto';
import { getPagination } from '../../core/helpers/functions.helpers';
import { MESSAGES } from '../../core/constants/messages';
import { appConstants } from '../../core/constants/constants';
import { PaymentService } from '../payment/payment.service';
import { Payment } from '../../entities/payment.entity';
import { TestStatsDto } from '../cbt/cbt.dto';
import { mailer } from '../../core/helpers';
import { EmailNotification } from '../../entities/email-notification.entity';

@Injectable()
export class DrivingTestService {
  constructor(
    @InjectRepository(DrivingTestCenter)
    private readonly drivingTestCenterRepository: Repository<DrivingTestCenter>,
    @InjectRepository(PreRegistration)
    private readonly preRegistrationRepository: Repository<PreRegistration>,
    @InjectRepository(DrivingTestSchedule)
    private readonly drivingTestScheduleRepository: Repository<DrivingTestSchedule>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private readonly paymentService: PaymentService,
    private dataSource: DataSource,
  ) {}

  /**
   * Fetch driving test centers
   * @param data
   */
  async getDrivingTestCenters(data: FetchMasterListDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    try {
      const whereClause: FindManyOptions<DrivingTestCenter> = {
        select: [
          'id',
          'identifier',
          'threshold',
          'email',
          'phone',
          'devices',
          'name',
          'stateId',
          'lgaId',
          'isActive',
        ],
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

      const [result, count] = await this.drivingTestCenterRepository.findAndCount(whereClause);
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
   * Create driving test center
   * @param data
   */
  async createCenter(data: CreateDrivingTestCenterDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      const exists = await this.drivingTestCenterRepository.findOne({
        where: data,
      });
      if (exists) {
        throw new BadRequestException(MESSAGES.recordExists);
      }
      data.identifier = await generateDrivingCenterNo(data.name, this.drivingTestCenterRepository);
      data.isActive = Status.Active;
      response.data = await this.drivingTestCenterRepository.save(data);
      response.success = true;
      response.message = MESSAGES.recordAdded;
    } catch (error: any) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
    return response;
  }

  /**
   * Update driving test center
   * @param data
   */
  async updateCenter(data: UpdateDrivingTestCenterDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      const cbtCenter = await this.drivingTestCenterRepository.findOne({
        where: { id: data.id },
      });
      if (!cbtCenter) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }
      // Update CBT center
      await this.drivingTestCenterRepository.update({ id: data.id }, data);
      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
    return response;
  }

  /**
   * Get booked slots
   * @param data
   */
  async getSlots(data: DrivingTestCenterIdDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // Find the driving test center
      const center = await this.drivingTestCenterRepository.findOne({
        where: { id: data.drivingTestCenterId },
      });
      if (!center) {
        throw new Error('Driving test center not found');
      }
      // Find all booked time slots for the given driving test center
      const bookedSlots = await this.drivingTestScheduleRepository.find({
        where: { drivingTestCenterId: center.id },
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
   * Book driving test slot
   * @param data
   */
  async bookSlot(data: BookDrivingTestSlotDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // Find the driving test center
      const center = await this.drivingTestCenterRepository.findOne({
        where: { id: data.drivingTestCenterId },
      });
      if (!center) {
        throw new Error('Driving test center not found');
      }
      // check if this slot has been booked by this candidate
      const checkBooked = await this.drivingTestScheduleRepository.findOne({
        where: {
          date: data.date,
          time: data.time,
          studentId: data.studentId,
          drivingTestCenterId: center.id,
        },
      });
      if (checkBooked) {
        throw new BadRequestException('This date and time already booked by student');
      }
      // Check if this date and time has been booked by others
      const bookedByOthers = await this.drivingTestScheduleRepository.findOne({
        where: { date: data.date, time: data.time, drivingTestCenterId: center.id },
      });
      if (bookedByOthers) {
        throw new BadRequestException('This date and time already booked.');
      }
      // Create a slot
      const payload = plainToInstance(DrivingTestSchedule, data);
      payload.drivingTestCenterId = center.id;
      await this.drivingTestScheduleRepository.insert(payload);

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
   * Create driving test schedule
   * @param studentId
   * @param centerId
   * @param scheduleDto
   */
  async scheduleTest(studentId: number, centerId: number, scheduleDto: DrivingTestScheduleDto) {
    const queryRunner = await beginTransaction(this.dataSource);
    try {
      // Find the driving test center
      const cbtCenter = await queryRunner.manager.findOne(DrivingTestCenter, {
        where: { id: centerId },
      });
      if (!cbtCenter) {
        throw new BadRequestException('Driving test center not found');
      }

      let preBooked: DrivingTestSchedule | null;

      if (scheduleDto.canCreate) {
        delete scheduleDto.canCreate;
        const newRecord = await queryRunner.manager.insert(DrivingTestSchedule, scheduleDto);
        preBooked = await queryRunner.manager.findOne(DrivingTestSchedule, {
          where: { id: newRecord.raw[0].id },
        });
      } else {
        preBooked = await queryRunner.manager.findOne(DrivingTestSchedule, {
          where: {
            studentId: studentId,
            drivingTestCenterId: centerId,
            date: scheduleDto.date,
            time: scheduleDto.time,
          },
        });
      }

      if (!preBooked) {
        throw new Error('No driving test pro-booked date and time slot for this schedule.');
      }

      // Set parameters
      preBooked.bookingStatus = BookingStatus.Booked;
      preBooked.drivingTestCenterId = centerId;
      preBooked.studentId = studentId;
      if (!scheduleDto.bookingStatus) {
        preBooked.status = TestStatus.Scheduled;
      }
      if (scheduleDto.transactionId) {
        preBooked.transactionId = scheduleDto.transactionId;
      }
      // Save the schedule
      await queryRunner.manager.save(preBooked);
      // run check on pre-booked dates and remove slots not confirmed
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      await queryRunner.manager.delete(DrivingTestSchedule, {
        score: 0, // prevent removing schedules that have taken tests before this update
        bookingStatus: BookingStatus.Pending, // Unconfirmed slots
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
   * Submit driving test
   * @param data
   * @param user
   */
  async submitDrivingTest(
    data: SubmitDrivingTestDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);
    let payment: Payment;
    try {
      // check for preRegistration
      const preRegistration = await this.preRegistrationRepository.findOne({
        where: { applicationNo: data.applicationNo },
        relations: ['student.application', 'cbtSchedule'],
      });
      if (!preRegistration) {
        throw new NotFoundException('No application found with given application Number');
      }
      // Get candidate test schedule
      let schedule = await this.drivingTestScheduleRepository.findOne({
        where: { preRegistrationId: preRegistration.id },
      });

      // validate payment reference if set
      if (data.reference) {
        // Validate and attach transaction to cbt schedule
        payment = await this.paymentService.findPaymentBy({
          reference: data.reference,
          status: PaymentStatus.Completed,
          used: Reference.Unused,
        });

        if (!payment) {
          throw new NotFoundException('Payment reference not found or has been used');
        }
        // Set transaction ID
        data.transactionId = payment.id;
      }

      const minimumScore =
        Number.isFinite(appConstants.cbtMinimumScore) &&
        appConstants.cbtMinimumScore >= 0 &&
        appConstants.cbtMinimumScore <= 100
          ? appConstants.cbtMinimumScore
          : 70;

      const payload: any = {};
      payload.answers = data.answers;
      payload.vehicleType = data.vehicleType;
      payload.location = data.location;
      payload.assessedBy = user.id;
      payload.score = data.score;
      if (payload.score >= minimumScore) {
        payload.status = TestStatus.Passed;
      } else {
        payload.status = TestStatus.Failed;
      }
      if (data.transactionId) {
        payload.transactionId = data.transactionId;
      }
      if (data.files) {
        payload.files = data.files;
      }

      // If candidate passed, record test
      if (payload.status === TestStatus.Passed) {
        if (!schedule) {
          // Create new record
          schedule = await queryRunner.manager.save(DrivingTestSchedule, {
            preRegistrationId: preRegistration.id,
            studentId: preRegistration.studentId,
            licenseClassId: data.licenseClassId ?? preRegistration.licenseClassId,
            years: preRegistration.years,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            status: TestStatus.Scheduled,
            lgaId:
              preRegistration.cbtSchedule.lgaId ??
              preRegistration.student.application.lgaOfOriginId,
            stateId:
              preRegistration.cbtSchedule.stateId ??
              preRegistration.student.application.stateOfOriginId,
          });
        }

        console.log('SubmitDrivingTest Log: ', payload);
        await queryRunner.manager.update(
          DrivingTestSchedule,
          { id: schedule.id },
          { ...payload, assessedBy: { id: user.id } },
        );
        // Commit transaction
        await queryRunner.commitTransaction();

        // Update payment status if reference is set
        if (payment) {
          // Update payment status
          payment.used = Reference.Used;
          payment.status = PaymentStatus.Used;
          await this.paymentService.update(payment.id, payment);
        }

        // Send email
        const application = preRegistration.student.application;
        const name = [application.firstName, application.lastName].join(' ');
        await mailer
          .setSubject(MESSAGES.drivingTestResult)
          .setMessage(
            MESSAGES.drivingTestResultBody(
              name,
              preRegistration.applicationNo,
              schedule.status,
              payload.score,
            ),
          )
          .setTo(application.email)
          .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
          .sendDefault();

        response.success = true;
        response.message = MESSAGES.recordUpdated;
      } else {
        response.success = false;
        response.message = `Candidate failed driving test with ${payload.score} score`;
      }
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      await queryRunner.release();
    }
    return response;
  }

  async testHistory(data: BaseRequestDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    try {
      const queryBuilder = this.drivingTestScheduleRepository.createQueryBuilder('schedules');
      const fieldsToSelect = [
        // schedule fields
        'schedules.id',
        'schedules.preRegistrationId',
        'schedules.drivingTestCenterId',
        'schedules.studentId',
        'schedules.date',
        'schedules.time',
        'schedules.years',
        'schedules.score',
        'schedules.bookingStatus',
        'schedules.status',
        'schedules.createdAt',
        // center fields (drivingTestCenter)
        'center.id',
        'center.identifier',
        'center.name',
        // preReg fields (preRegistration)
        'preReg.id',
        'preReg.applicationNo',
        'preReg.studentId',
        'preReg.status',
        'preReg.licenseClassId',
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
      ];

      queryBuilder
        .leftJoinAndSelect('schedules.drivingTestCenter', 'center')
        .leftJoinAndSelect('schedules.preRegistration', 'preReg')
        .leftJoinAndSelect('preReg.student', 'student')
        .leftJoinAndSelect('student.application', 'application')
        .leftJoinAndSelect('schedules.assessedBy', 'assessor');

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

      queryBuilder.orderBy('schedules.createdAt', data.order);

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
      const failedAttempts = await this.drivingTestScheduleRepository.find({
        where: { studentId: student.id, status: TestStatus.Failed },
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

  async updateScheduleWithQueryRunner(scheduleId: number, data: any, queryRunner: QueryRunner) {
    await queryRunner.manager.update(DrivingTestSchedule, { id: scheduleId }, data);
  }

  async findDrivingTestCenter(stateId: number, lgaId: number) {
    return await this.drivingTestCenterRepository.findOne({ where: { stateId, lgaId } });
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

  async getDrivingtestStatistics(): Promise<DataResultInterface<TestStatsDto>> {
    const response = { success: false, message: '', data: null };

    try {
      const stats = await this.drivingTestScheduleRepository
        .createQueryBuilder('drivingTest')
        .select([
          'COUNT(*)::int AS "allApplications"',
          'SUM(CASE WHEN drivingTest.status = :reScheduled THEN 1 ELSE 0 END)::int AS "reScheduled"',
          'SUM(CASE WHEN drivingTest.status = :scheduled THEN 1 ELSE 0 END)::int AS "scheduled"',
          'SUM(CASE WHEN drivingTest.status = :failed THEN 1 ELSE 0 END)::int AS "failed"',
          'SUM(CASE WHEN drivingTest.status = :passed THEN 1 ELSE 0 END)::int AS "passed"',
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

  async getAllDrivingTestSchedules(
    data: ListCbtScheduleRequestDto,
  ): Promise<DataResultInterface<DrivingTestScheduleResponseDto[]>> {
    const response = { success: false, message: '', data: null };

    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset = (page - 1) * limit;

    try {
      const qb = this.drivingTestScheduleRepository
        .createQueryBuilder('schedules')
        .innerJoinAndSelect('schedules.student', 'student')
        .leftJoinAndSelect('student.application', 'application')
        .leftJoinAndSelect('schedules.preRegistration', 'preRegistration')
        .select([
          'schedules.id',
          'schedules.date',
          'schedules.status',
          'schedules.score',
          'student.id',
          'application.applicationNo',
          'application.firstName',
          'application.middleName',
          'application.lastName',
          'application.email',
          'application.phone',
          'preRegistration.id',
          'preRegistration.applicationNo',
        ])
        .orderBy('schedules.date', data.order)
        .skip(offset)
        .take(limit);

      if (data.status) {
        qb.andWhere('schedules.status = :status', { status: data.status });
      }

      if (data.createdAtStart && data.createdAtEnd) {
        qb.andWhere(`schedules.date BETWEEN :start AND :end`, {
          start: data.createdAtStart,
          end: data.createdAtEnd,
        });
      }

      if (data.search?.trim()) {
        const searchTerm = `%${data.search.trim()}%`;
        qb.andWhere(
          `(application.firstName ILIKE :search OR application.lastName ILIKE :search OR application.middleName ILIKE :search OR application.phone ILIKE :search OR application.email ILIKE :search)`,
          { search: searchTerm },
        );
      }

      const [result, count] = await qb.getManyAndCount();

      const transformedResult = plainToInstance(DrivingTestScheduleResponseDto, result, {
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
      throw new BadRequestException(error.message);
    }

    return response;
  }

  async getDrivingtestSchedule(
    id: number,
  ): Promise<DataResultInterface<DrivingTestScheduleResponseDto>> {
    const response = { success: false, message: '', data: null };

    try {
      const schedule = await this.drivingTestScheduleRepository.findOne({
        where: { id },
        relations: ['student', 'student.application'],
      });

      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      const transformed = plainToInstance(DrivingTestScheduleResponseDto, schedule, {
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
}
