import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ApproveLicenseDto,
  AttachFilesDto,
  ExpireLicenseDto,
  LicenseList,
  LicenseStatsDto,
  LicenseStatsWithYearDto,
  MobileRenewalLicenseRequestDto,
  MobileReplaceLicenseRequestDto,
  NewLicenseRequestDto,
  PreRegistrationRequestDto,
  RenewalLicenseRequestDto,
  RenewalPreRegistrationDto,
  ReplaceLicenseRequestDto,
  UpdateLicenseDto,
  ValidateLicenseDto,
} from './license.dto';
import {
  AgeGroupDistribution,
  AuthUserInfo,
  DataResultInterface,
  ListInterface,
  RequestTypeDistribution,
} from '../../core/interfaces/all.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Brackets, DataSource, Repository } from 'typeorm';
import {
  ApprovalLevel,
  LicenseRequestType,
  LicenseStatus,
  PaymentStatus,
  PreRegistrationStatus,
  Reference,
  Status,
  TransactionType,
} from '../../core/constants/enums';
import { Student } from '../../entities/student.entity';
import {
  generateLicenseCard,
  generatePreRegApplicationNo,
  getLicenseApprovalData,
  getMapValue,
  hasExpired,
} from '../../core/helpers/general';
import { CbtService } from '../cbt/cbt.service';
import { CbtScheduleDto } from '../cbt/cbt.dto';
import { PreRegistration } from '../../entities/pre-registration.entity';
import { EmailNotification } from '../../entities/email-notification.entity';
import { License } from '../../entities/license.entity';
import { FileInterface } from '../file/file.dto';
import { LicenseFile } from '../../entities/license-file.entity';
import {
  ApplicationNoDto,
  BaseRequestDto,
  beginTransaction,
  LicenseNoDto,
} from '../../core/interfaces/all.dto';
import {
  genders,
  lgas,
  licenseClasses,
  nationalities,
  salutations,
  states,
} from '../../core/constants/constants';
import { PaymentService } from '../payment/payment.service';
import { PaymentDto } from '../payment/payment.dto';
import AttachmentUtils from '../../core/helpers/aws.s3';
import { UsersService } from '../users/users.service';
import { Role } from '../../middlewares/roles';
import { DrivingTestService } from '../driving-test/driving-test.service';
import { MESSAGES } from '../../core/constants/messages';
import { getPagination } from '../../core/helpers/functions.helpers';
import { mailer } from '../../core/helpers';
import { AuthService } from '../auth/auth.service';
import { ApplicantFile } from '../../entities/applicant-file.entity';

@Injectable()
export class LicenseService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(PreRegistration)
    private readonly preRegistrationRepository: Repository<PreRegistration>,
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
    @InjectRepository(LicenseFile)
    private readonly licenseFileRepository: Repository<LicenseFile>,
    private readonly cbtService: CbtService,
    private readonly drivingTestService: DrivingTestService,
    private readonly authService: AuthService,
    private readonly paymentService: PaymentService,
    private readonly userService: UsersService,
    private dataSource: DataSource,
  ) {}

  /**
   * Get license stats
   * @param data
   * @param user
   */
  async stats(data: LicenseStatsDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    try {
      const type = data.type;
      const status = data.status;
      const queryBuilder = this.licenseRepository.createQueryBuilder('licenses');
      if (type !== 'all') {
        queryBuilder.where('licenses.request_type = :type', { type });
      }
      if (status) {
        queryBuilder.where('licenses.status = :status', { status });
      }
      const result = await queryBuilder.select('COUNT(*) AS totalLicenses').getRawOne();

      response.data = {
        totalLicenses: parseInt(result.totallicenses, 10) || 0,
      };
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
   * Get list of licenses with filters
   * @param data
   * @param user
   */
  async findAll(data: LicenseList, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    const queryBuilder = this.licenseRepository.createQueryBuilder('licenses');
    if (data.stateId) {
      queryBuilder.andWhere('licenses.stateId = :stateId', { stateId: data.stateId });
    }
    if (data.lgaId) {
      queryBuilder.andWhere('licenses.lgaId = :lgaId', { lgaId: data.lgaId });
    }
    if (data.printStatus) {
      queryBuilder.andWhere('licenses.printStatus = :printStatus', {
        printStatus: data.printStatus,
      });
    }
    if (data.reason) {
      queryBuilder.andWhere('licenses.replacementReason = :replacementReason', {
        replacementReason: data.reason,
      });
    }
    if (data.licenseClassId) {
      queryBuilder.andWhere('licenses.licenseClassId = :licenseClassId', {
        licenseClassId: data.licenseClassId,
      });
    }
    if (data.status) {
      queryBuilder.andWhere(`licenses.status = :status`, {
        status: data.status,
      });
    }
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('licenses.licenseNo LIKE :search', { search: `%${search}%` }) // Added wildcards
            .orWhere('licenses.firstName LIKE :search', { search: `%${search}%` }) // Added wildcards
            .orWhere('licenses.lastName LIKE :search', { search: `%${search}%` }); // Added wildcards
        }),
      );
    }
    if (data.type && data.type !== 'all') {
      queryBuilder.andWhere(`licenses.isActive = :isActive`, {
        isActive: data.type === 'active' ? 1 : 0,
      });
    }
    if (data.requestType && data.requestType !== 'all') {
      queryBuilder.andWhere(`licenses.requestType = :requestType`, {
        requestType: data.requestType,
      });
    }
    // Apply pagination and ordering
    queryBuilder.skip(offset);
    queryBuilder.take(limit);
    queryBuilder.orderBy('licenses.id', data.order);

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
   * Get single license details
   * @param licenseId
   */
  async licenseDetails(licenseId: number): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    try {
      const fieldsToSelect = [
        'licenses',
        'preRegistration.id',
        'preRegistration.studentId',
        'preRegistration.cbtCenterId',
        'preRegistration.cbtScheduleId',
        'preRegistration.drivingTestCenterId',
        'preRegistration.drivingTestScheduleId',
        'preRegistration.applicationNo',
        'cbtSchedule.id',
        'cbtSchedule.cbtCenterId',
        'cbtSchedule.score',
        'cbtSchedule.date',
        'cbtSchedule.time',
        'cbtSchedule.cbtStatus',
        'drivingTestSchedule.id',
        'drivingTestSchedule.drivingTestCenterId',
        'drivingTestSchedule.drivingTestCenterId',
        'drivingTestSchedule.score',
        'drivingTestSchedule.date',
        'drivingTestSchedule.time',
        'drivingTestSchedule.status',
        'student.id',
        'student.drivingSchoolId',
        'student.applicationId',
        'student.studentNo',
        'student.certificateNo',
        'student.graduated',
        'application',
        'drivingSchool.id',
        'drivingSchool.identifier',
        'drivingSchool.name',
        'drivingSchool.address',
      ];

      const queryBuilder = this.licenseRepository
        .createQueryBuilder('licenses')
        .where('licenses.id = :id', { id: licenseId })
        .leftJoinAndSelect('licenses.preRegistration', 'preRegistration')
        .leftJoinAndSelect('preRegistration.cbtSchedule', 'cbtSchedule')
        .leftJoinAndSelect('preRegistration.drivingTestSchedule', 'drivingTestSchedule')
        .leftJoinAndSelect('preRegistration.student', 'student')
        .leftJoinAndSelect('student.drivingSchool', 'drivingSchool')
        .leftJoinAndSelect('student.application', 'application')
        .select(fieldsToSelect);

      response.data = await queryBuilder.getOne();
      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Get list of pre-registrations with filters
   * @param data
   * @param user
   */
  async preRegistrations(data: ListInterface, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    const queryBuilder = this.preRegistrationRepository
      .createQueryBuilder('pre_registrations')
      .leftJoinAndSelect('pre_registrations.student', 'student')
      .leftJoinAndSelect('student.application', 'application');

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('pre_registrations.applicationNo LIKE :search', {
            search: `%${search}%`,
          }).orWhere('pre_registrations.reference LIKE :search', { search: `%${search}%` });
        }),
      );
    }
    // Apply pagination and ordering
    queryBuilder.skip(offset);
    queryBuilder.take(limit);
    queryBuilder.orderBy('pre_registrations.id', 'DESC');

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
   * Get license details
   * @param data
   */
  async details(data: ApplicationNoDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // Get pre-registration data
      const registration = await this.preRegistrationRepository.findOne({
        where: { applicationNo: data.applicationId },
      });
      if (!registration) {
        throw new BadRequestException('Record with supplied applicationNo not found!');
      }
      // Get license by preregistration id
      const license = await this.licenseRepository.findOne({
        where: { preRegistrationId: registration.id },
        relations: ['licenseFiles.file', 'preRegistration.student.application.applicantFiles.file'],
      });
      const licenseData: any = this.getLicenseInformation(license);

      const files = license.preRegistration.student.application.applicantFiles;
      if (files) {
        const fetchedFiles = await this.getBaseRecord(files);
        licenseData.licenseFiles = [...fetchedFiles, ...license.licenseFiles];
      }
      response.success = true;
      response.message = MESSAGES.recordFound;
      response.data = licenseData;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Get pre-registration details
   * @param studentId
   */
  async preRegistrationDetailsByStudent(studentId: number): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // Get pre-registration data
      const registration = await this.preRegistrationRepository.findOne({
        where: { studentId: studentId, status: PreRegistrationStatus.Processing },
        order: {
          createdAt: 'DESC',
        },
      });
      if (!registration) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }
      response.success = true;
      response.message = MESSAGES.recordFound;
      response.data = {
        id: registration.id,
        applicationNo: registration.applicationNo,
        studentId: registration.studentId,
        cbtCenterId: registration.cbtCenterId,
        reference: registration.reference,
      };
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Get license details by license number
   * @param data
   */
  async detailsByLicenseNo(data: LicenseNoDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // Get license by preregistration id
      const license = await this.licenseRepository.findOne({
        where: { licenseNo: data.licenseNo },
        relations: ['licenseFiles.file', 'preRegistration.student.application.applicantFiles.file'],
      });
      const licenseData: any = this.getLicenseInformation(license);

      const files = license.preRegistration.student.application.applicantFiles;
      if (files) {
        const fetchedFiles = await this.getBaseRecord(files);
        licenseData.licenseFiles = [...fetchedFiles, ...license.licenseFiles];
      }

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = licenseData;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Verify license by either certNo or license No
   * @param data
   */
  async verifyLicense(data: ValidateLicenseDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    const certificateNo = data.drivingCertNo;
    // If license has not been issued for request, throw error
    if (certificateNo) {
      // Find student record
      const student = await this.studentRepository.findOne({
        where: { certificateNo: certificateNo },
        relations: ['application.applicantFiles.file'],
      });
      if (student) {
        const license = await this.licenseRepository.findOne({
          where: {
            preRegistration: {
              student: {
                id: student.id,
              },
            },
          },
          relations: [
            'licenseFiles.file',
            'preRegistration.student.application.applicantFiles.file',
          ],
        });

        if (!license) {
          throw new BadRequestException('No license found with this certificate number!');
        }
        const licenseData: any = this.getLicenseInformation(license);

        const files = license.preRegistration.student.application.applicantFiles;
        if (files) {
          const fetchedFiles = await this.getBaseRecord(files);
          licenseData.licenseFiles = [...fetchedFiles, ...license.licenseFiles];
        }

        response.success = true;
        response.message = MESSAGES.recordFound;
        response.data = licenseData;
        return response;
      }
    }

    if (!certificateNo && data.licenseNo) {
      // try to find license
      const license = await this.licenseRepository.findOne({
        where: { licenseNo: data.licenseNo },
        relations: ['licenseFiles.file', 'preRegistration.student.application.applicantFiles.file'],
      });

      if (!license) {
        throw new BadRequestException('License with supplied license Number not found!');
      }

      const licenseData: any = this.getLicenseInformation(license);

      const files = license.preRegistration.student.application.applicantFiles;
      if (files) {
        const fetchedFiles = await this.getBaseRecord(files);
        licenseData.licenseFiles = [...fetchedFiles, ...license.licenseFiles];
      }
      response.success = true;
      response.message = MESSAGES.recordFound;
      response.data = licenseData;
      return response;
    }

    throw new BadRequestException('License with supplied license Number not found!');
  }

  /**
   * Submit New License Request
   * @param data
   * @param req
   */
  async preRegistration(data: PreRegistrationRequestDto, req: any): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);
    try {
      // Get student
      const student = await queryRunner.manager.findOne(Student, {
        where: { certificateNo: data.certificateNo },
        relations: ['application'],
      });
      if (!student) {
        throw new BadRequestException('Record with certificateNo not found!');
      }
      if (data.direct) {
        // Generate application no and append to data if it's direct else this gets generated on validation of payment
        data.applicationNo = generatePreRegApplicationNo(student);
      }

      data.studentId = student.id;
      data.drivingSchoolId = student.drivingSchoolId;
      if (!data.direct) {
        // Create CBT schedule
        const cbtScheduleId = await this.cbtService.scheduleTest(student.id, data.cbtCenterId, {
          lgaId: data.lgaId,
          stateId: data.stateId,
          date: data.date,
          time: data.time,
        } as CbtScheduleDto);

        // Assign the cbtScheduleId
        data.cbtScheduleId = +cbtScheduleId;
        // Create driving test schedule
        // First look for any driving test center within candidate local government
        // const center = await this.drivingTestService.findDrivingTestCenter(
        //   data.stateId,
        //   data.lgaId,
        // );
        // if (center) {
        //   // Create driving test schedule (pre-book)
        //   const drivingTestScheduleId = await this.drivingTestService.scheduleTest(
        //     student.id,
        //     center.id,
        //     {
        //       lgaId: data.lgaId,
        //       stateId: data.stateId,
        //       date: data.date,
        //       time: data.time,
        //       canCreate: true,
        //     } as DrivingTestScheduleDto,
        //   );
        //
        //   // Assign the drivingTestScheduleId
        //   data.drivingTestScheduleId = +drivingTestScheduleId;
        // }
      }

      // Create pre registration
      const preRegistrationRecord = await queryRunner.manager.save(PreRegistration, data);
      const preRegistrationId = preRegistrationRecord.id;

      // If CBT schedule was successfully created, update the pre_registration id
      if (!data.direct) {
        await this.cbtService.updateScheduleWithQueryRunner(
          data.cbtScheduleId,
          { preRegistrationId: preRegistrationId },
          queryRunner,
        );

        // If driving test schedule ID is set, update schedule with pre-registration ID
        // await this.drivingTestService.updateScheduleWithQueryRunner(
        //   data.drivingTestScheduleId,
        //   {
        //     preRegistrationId: preRegistrationId,
        //   },
        //   queryRunner,
        // );
      }

      if (data.files) {
        // if files are sent, save with application
        await this.savePreRegFileRecord(preRegistrationId, data.files);
      }

      let paymentResp: any;
      if (!data.direct) {
        // Generate payment
        const paymentPayload: any = {
          type: TransactionType.preRegistration,
          email: student.application.email,
          description: 'Payment for license pre registration',
          successRedirectUrl: data.successRedirectUrl,
          failureRedirectUrl: data.failureRedirectUrl,
        };
        paymentResp = await this.paymentService.initiate(paymentPayload as PaymentDto, req);

        // update reference
        await queryRunner.manager.update(
          PreRegistration,
          { id: preRegistrationId },
          { reference: paymentResp.reference },
        );
      }

      // If applicationNo is set, send via email
      const fullName = [
        student.application.firstName,
        student.application.middleName,
        student.application.lastName,
      ].join(' ');

      if (data.applicationNo) {
        await mailer
          .setSubject(MESSAGES.preRegistrationEmailSubject)
          .setMessage(MESSAGES.preRegistrationEmailBody(data.applicationNo, fullName))
          .setTo(student.application.email)
          .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
          .sendDefault();

        // update status
        await queryRunner.manager.update(
          PreRegistration,
          { id: preRegistrationId },
          { status: PreRegistrationStatus.Processing },
        );
      }

      response.data = {
        applicationNo: data.applicationNo,
        preRegistrationId: preRegistrationId,
        date: data.date,
        time: data.time,
      };

      if (paymentResp && paymentResp.success) {
        delete paymentResp.success;
        response.data = { ...response.data, ...paymentResp };
      }
      // Commit the transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.recordAdded;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message || 'Pre-registration failed due to an internal error.';
    } finally {
      await queryRunner.release();
    }
    return response;
  }

  /**
   * Submit Renewal License Request
   * @param data
   * @param req
   */
  async licenseRenewalPreRegistration(
    data: RenewalPreRegistrationDto,
    req: any,
  ): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);
    try {
      // Get existing license
      const license = await queryRunner.manager.findOne(License, {
        where: { licenseNo: data.oldLicenseNo },
        relations: ['preRegistration.student.application'],
      });
      if (!license) {
        throw new BadRequestException('Old license record was not found!');
      }
      if (license.isActive === Status.Inactive) {
        throw new BadRequestException(
          'Renewal already done for this license. Use the most recent license number!',
        );
      }
      // If it's found, verify that it has truly expired
      if (!hasExpired(license.issuedAt, license.expiryAt)) {
        throw new BadRequestException('Existing license is yet to expire. Please try again later.');
      }
      const student = license.preRegistration.student;
      // Generate application no and append to data if it's direct else this gets generated on validation of payment
      data.applicationNo = generatePreRegApplicationNo(student);

      data.studentId = student.id;
      data.drivingSchoolId = student.drivingSchoolId;

      // let drivingTestScheduleId: number;

      // if (!data.direct) {
      //   // Create driving test schedule
      //   drivingTestScheduleId = await this.drivingTestService.scheduleTest(
      //     student.id,
      //     data.drivingTestCenterId,
      //     {
      //       lgaId: data.lgaId,
      //       stateId: data.stateId,
      //       date: data.date,
      //       time: data.time,
      //       years: data.years ?? 3,
      //     } as DrivingTestScheduleDto,
      //   );
      //   data.drivingTestScheduleId = +drivingTestScheduleId;
      // }

      // Create pre registration
      const preRegistrationRecord = await this.preRegistrationRepository.insert(data);
      const preRegistrationId = preRegistrationRecord.raw[0].id;
      if (data.files) {
        for (const file of data.files) {
          await queryRunner.manager.save(LicenseFile, {
            preRegistration: { id: preRegistrationId },
            file: { id: file.fileId },
            documentType: file.documentType,
          });
        }
        // if files are sent, save with application
        //await this.savePreRegFileRecord(preRegistrationId, data.files);
      }

      // If applicationNo is set, send via email
      const fullName = [
        student.application.firstName,
        student.application.middleName,
        student.application.lastName,
      ].join(' ');

      if (data.applicationNo) {
        await mailer
          .setSubject(MESSAGES.preRegistrationEmailSubject)
          .setMessage(MESSAGES.preRegistrationEmailBody(data.applicationNo, fullName))
          .setTo(student.application.email)
          .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
          .sendDefault();

        // update status
        await queryRunner.manager.update(
          PreRegistration,
          { id: preRegistrationId },
          {
            status: PreRegistrationStatus.Processing,
          },
        );
      }

      // Update schedule
      // await this.drivingTestService.updateScheduleWithQueryRunner(
      //   drivingTestScheduleId,
      //   {
      //     preRegistrationId: preRegistrationId,
      //   },
      //   queryRunner,
      // );

      // Generate payment
      const paymentPayload: any = {
        type: TransactionType.licenseRenewal,
        email: student.application.email,
        description: 'Payment for license renewal',
        successRedirectUrl: data.successRedirectUrl,
        failureRedirectUrl: data.failureRedirectUrl,
      };
      const paymentResp = await this.paymentService.initiate(paymentPayload as PaymentDto, req);

      // Commit the transaction
      await queryRunner.commitTransaction();

      response.data = {
        applicationNo: data.applicationNo,
        preRegistrationId: preRegistrationId,
        date: data.date,
        time: data.time,
        ...paymentResp,
      };

      response.success = true;
      response.message = MESSAGES.recordAdded;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      await queryRunner.release();
    }
    return response;
  }

  /**
   * Get pre-registration data by application no
   * @param applicationNo
   */
  async getPreRegistration(applicationNo: string): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      const registration = await this.preRegistrationRepository.findOne({
        where: { applicationNo },
        relations: [
          'student.application',
          'cbtCenter',
          'drivingSchool',
          'cbtSchedule',
          'drivingTestCenter',
          'drivingTestSchedule',
        ],
      });
      if (!registration) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }
      // const files = await this.licenseFileRepository.find({
      //   // where: { preRegistrationId: registration.id },
      //   relations: ['file'],
      // });
      const registrationData: any = {
        applicationNo: applicationNo,
        studentId: registration.studentId,
        cbtScheduleId: registration.cbtScheduleId,
        cbtCenterId: registration.cbtCenterId,
        drivingTestCenterId: registration.drivingTestCenterId,
        drivingTestScheduleId: registration.drivingTestScheduleId,
        reference: registration.reference,
        licenseClassId: registration.licenseClassId,
        years: registration.years,
        rrr: registration.rrr,
        status: registration.status,
        registrationDate: registration.createdAt,
        cbtSchedule: null,
        drivingTestSchedule: null,
      };

      if (registration.drivingSchool) {
        registrationData.drivingSchoolId = registration.drivingSchool.identifier;
        registrationData.drivingSchoolName = registration.drivingSchool.name;
      }
      if (registration.cbtCenter) {
        registrationData.cbtCenterName = registration.cbtCenter.name;
      }
      if (registration.cbtSchedule) {
        registrationData.cbtSchedule = {
          cbtCenterId: registration.cbtSchedule.cbtCenterId,
          lgaId: registration.cbtSchedule.lgaId,
          stateId: registration.cbtSchedule.stateId,
          date: registration.cbtSchedule.date,
          time: registration.cbtSchedule.time,
        };
      }

      if (registration.drivingTestSchedule) {
        registrationData.drivingTestSchedule = registration.drivingTestSchedule;
      }

      if (registration.student) {
        registrationData.studentNo = registration.student.studentNo;
        registrationData.certificateNo = registration.student.certificateNo;
        registrationData.graduated = registration.student.graduated;
        registrationData.applicantData = registration.student.application;
        // if (files) {
        //   registrationData.applicantFiles = await this.drivingSchoolService.getBaseRecord(files);
        // }
      }

      response.success = true;
      response.message = MESSAGES.recordFound;
      response.data = registrationData;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Submit new license request
   * @param data
   * @param user
   */
  async submitNewRequest(
    data: NewLicenseRequestDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // Get pre-registration data
      const registration = await this.preRegistrationRepository.findOne({
        where: { applicationNo: data.applicationNo },
        relations: ['student.application.applicantFiles', 'drivingSchool', 'cbtSchedule'],
      });
      if (!registration) {
        throw new BadRequestException('Record with supplied applicationNo not found!');
      }
      // check if there is a license already issued to this registration record
      const license = await this.licenseRepository.findOne({
        where: { preRegistrationId: registration.id },
      });
      if (license) {
        throw new BadRequestException('License already issued for this application!');
      }

      if (registration.status === PreRegistrationStatus.Pending) {
        throw new BadRequestException('Pre registration Payment has not been confirmed!');
      }
      // Set license request type
      data.requestType = LicenseRequestType.New;
      const licenseData: License = await this.buildLicensePayload(data, registration, user);

      // Get license approval data
      const approvalData: any = await getLicenseApprovalData(
        {
          licenseId: licenseData.id,
          licenseClassId: licenseData.licenseClassId,
          years: licenseData.years,
        } as ApproveLicenseDto,
        queryRunner.manager.getRepository(License),
      );
      // Set other details
      if (user) {
        approvalData.issuedById = user.id;
      }
      approvalData.licenseClassId = licenseData.licenseClassId;
      approvalData.years = licenseData.years;
      approvalData.status = LicenseStatus.Completed;
      approvalData.isActive = Status.Active;

      // Update license with approval data
      await queryRunner.manager.update(License, { id: licenseData.id }, approvalData);

      // Update the pre-registration data
      await queryRunner.manager.update(
        PreRegistration,
        { id: licenseData.preRegistrationId },
        { status: PreRegistrationStatus.Completed },
      );

      // If reference is set, update the payment
      if (licenseData.reference) {
        const payment = await this.paymentService.findPaymentBy({
          reference: licenseData.reference,
        });
        if (payment) {
          payment.used = Reference.Used;
          payment.status = PaymentStatus.Used;
          await this.paymentService.update(payment.id, payment);
        }
      }

      // generate license card using the generated licenseNo
      const generatedLicense = await this.generateLicense(approvalData.licenseNo);

      // Send email notification
      const fullName = [licenseData.firstName, licenseData.middleName, licenseData.lastName].join(
        ' ',
      );
      await mailer
        .setSubject(MESSAGES.licenseApproved)
        .setMessage(
          MESSAGES.licenseEmailBody(registration.applicationNo, approvalData.licenseNo, fullName),
        )
        .setTo(licenseData.email)
        .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
        .sendDefault();

      // Commit transaction - all operations succeed together
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = {
        ...licenseData,
        ...{ licenseNo: approvalData.licenseNo, cardBase64: generatedLicense.data },
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
      throw new BadRequestException(response.message);
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  /**
   * Submit renewal license request
   * @param data
   * @param req
   */
  async submitRenewalRequest(
    data: RenewalLicenseRequestDto,
    req: any,
  ): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const renewalData: any = {};
      // If renewal is not an external license i e was issued from this system, validate license
      if (data.isExternal) {
        throw new BadRequestException(
          'Renewal of driver license issued outside of this system is not yet supported!',
        );
      }
      // Get existing license
      const license = await queryRunner.manager.findOne(License, {
        where: { licenseNo: data.oldLicenseNo },
      });
      if (!license) {
        throw new BadRequestException('Old license record was not found!');
      }
      if (license.isActive === Status.Inactive) {
        throw new BadRequestException(
          'Renewal already done for this license. Use the most recent license number!',
        );
      }
      // If it's found, verify that it has truly expired
      if (!hasExpired(license.issuedAt, license.expiryAt)) {
        throw new BadRequestException('Existing license is yet to expire. Please try again later.');
      }

      // Get pre-registration (for renewal) record
      const registration = await queryRunner.manager.findOne(PreRegistration, {
        where: { applicationNo: data.applicationNo },
        relations: [
          'student.application.applicantFiles',
          'drivingSchool',
          'cbtSchedule',
          'drivingTestSchedule',
          'drivingTestCenter',
        ],
      });
      renewalData.preRegistrationId = registration.id;
      renewalData.applicationNo = data.applicationNo;

      // Update pre-registration
      await queryRunner.manager.update(
        PreRegistration,
        { id: registration.id },
        { status: PreRegistrationStatus.Processing },
      );

      // Generate payment
      const paymentPayload: any = {
        type: TransactionType.licenseRenewal,
        email: registration.student.application.email,
        description: 'Payment for license renewal',
        successRedirectUrl: data.successRedirectUrl,
        failureRedirectUrl: data.failureRedirectUrl,
      };
      const paymentResp = await this.paymentService.initiate(paymentPayload as PaymentDto, req);

      // Set license request type
      data.requestType = LicenseRequestType.Renewal;
      data.reference = paymentResp.reference;
      const user: AuthUserInfo | null = req.user;
      const licenseData: License = await this.buildLicensePayload(data, registration, user);

      // After submitting renewal request for a new license, set old one to inactive
      await queryRunner.manager.update(License, { id: license.id }, { isActive: Status.Inactive });

      // Commit transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = { ...licenseData, ...paymentResp };
    } catch (error: any) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
    return response;
  }

  /**
   * Submit renewal license request [Mobile]
   * @param data
   * @param req
   */
  async mobileSubmitRenewalRequest(
    data: MobileRenewalLicenseRequestDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    req: any,
  ): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const renewalData: any = {};
      // If renewal is not an external license i e was issued from this system, validate license
      if (data.isExternal) {
        throw new BadRequestException(
          'Renewal of driver license issued outside of this system is not yet supported!',
        );
      }
      // verify payment
      const payment = await this.paymentService.findPaymentBy({
        reference: data.reference,
        type: TransactionType.licenseRenewal,
        status: PaymentStatus.Completed,
        used: Reference.Unused,
      });
      if (!payment) {
        throw new NotFoundException('Payment reference not found or has been used');
      }
      // Get existing license
      const license = await queryRunner.manager.findOne(License, {
        where: { licenseNo: data.oldLicenseNo },
      });
      if (!license) {
        throw new BadRequestException('Old license record was not found!');
      }
      if (license.isActive === Status.Inactive) {
        throw new BadRequestException(
          'Renewal already done for this license. Use the most recent license number!',
        );
      }
      // If it's found, verify that it has truly expired
      if (!hasExpired(license.issuedAt, license.expiryAt)) {
        throw new BadRequestException('Existing license is yet to expire. Please try again later.');
      }
      // Pull pre-registration data
      const registration = await queryRunner.manager.findOne(PreRegistration, {
        where: { applicationNo: data.applicationNo },
        relations: [
          'student.application.applicantFiles',
          'drivingSchool',
          'cbtSchedule',
          'drivingTestSchedule',
          'drivingTestCenter',
        ],
      });
      renewalData.preRegistrationId = registration.id;
      renewalData.applicationNo = data.applicationNo;

      // Set license request type
      data.requestType = LicenseRequestType.Renewal;
      data.status = LicenseStatus.Processing;
      const user: AuthUserInfo | null = req.user;
      const licenseData: License = await this.buildLicensePayload(data, registration, user);

      // After submitting renewal request for a new license,
      // set old one to inactive so that it's not eligible in the future for renewal again
      await queryRunner.manager.update(
        License,
        { id: license.id },
        {
          isActive: Status.Inactive,
        },
      );

      // Update payment status
      payment.used = Reference.Used;
      payment.status = PaymentStatus.Used;
      await this.paymentService.update(payment.id, payment);

      // Commit transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = licenseData;
    } catch (error: any) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
    return response;
  }

  /**
   * Submit replacement license request
   * @param data
   * @param req
   */
  async submitReplacementRequest(
    data: ReplaceLicenseRequestDto,
    req: any,
  ): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const replacementData: any = {};
      // If renewal is not an external license i e was issued from this system, validate license
      if (data.isExternal) {
        throw new BadRequestException(
          'Renewal of driver license issued outside of this system is not yet supported!',
        );
      }
      // Get existing license
      const license = await queryRunner.manager.findOne(License, {
        where: { licenseNo: data.oldLicenseNo },
        relations: ['preRegistration.student.application'],
      });
      if (!license) {
        throw new BadRequestException('Old license record was not found!');
      }
      if (license.isActive === Status.Inactive) {
        throw new BadRequestException(
          'Replacement already done for this license. Use the most recent license number!',
        );
      }

      replacementData.reference = data.reference;
      replacementData.lgaId = license.preRegistration.student.application.lgaOfOriginId;
      replacementData.stateId = license.preRegistration.student.application.stateOfOriginId;
      replacementData.direct = true;
      if (license) {
        replacementData.studentId = license.preRegistration.studentId;
        replacementData.certificateNo = license.preRegistration.student.certificateNo;
      }
      // Create a pre-registration data
      const preRegistrationResp = await this.preRegistration(
        replacementData as PreRegistrationRequestDto,
        req,
      );
      // If pre-registration failed for any reason, flag
      if (!preRegistrationResp.success) {
        throw new BadRequestException(preRegistrationResp.message);
      }
      // Pull pre-registration data
      const registration = await queryRunner.manager.findOne(PreRegistration, {
        where: { id: preRegistrationResp.data.preRegistrationId },
        relations: ['student.application.applicantFiles', 'drivingSchool', 'cbtSchedule'],
      });
      replacementData.preRegistrationId = preRegistrationResp.data.preRegistrationId;
      replacementData.applicationNo = preRegistrationResp.data.applicationNo;

      // Before creating new license, expire old one
      // blacklist if possible
      await queryRunner.manager.update(
        License,
        { id: license.id },
        {
          status: LicenseStatus.Expired,
          isActive: Status.Inactive,
        },
      );

      // Generate payment
      const paymentPayload: any = {
        type: TransactionType.licenseReplacement,
        email: registration.student.application.email,
        description: 'Payment for license replacement',
        successRedirectUrl: data.successRedirectUrl,
        failureRedirectUrl: data.failureRedirectUrl,
      };
      const paymentResp = await this.paymentService.initiate(paymentPayload as PaymentDto, req);
      // Set license request type
      data.requestType = LicenseRequestType.Replacement;
      data.reference = paymentResp.reference;
      const user: AuthUserInfo | null = req.user;
      const licenseData: License = await this.buildLicensePayload(data, registration, user);

      // Commit transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = { ...licenseData, ...paymentResp };
    } catch (error: any) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
    return response;
  }

  /**
   * Submit replacement license request [Mobile]
   * @param data
   * @param req
   */
  async mobileSubmitReplacementRequest(
    data: MobileReplaceLicenseRequestDto,
    req: any,
  ): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const replacementData: any = {};
      // If renewal is not an external license i e was issued from this system, validate license
      if (data.isExternal) {
        throw new BadRequestException(
          'Renewal of driver license issued outside of this system is not yet supported!',
        );
      }
      // verify payment
      const payment = await this.paymentService.findPaymentBy({
        reference: data.reference,
        type: TransactionType.licenseReplacement,
        status: PaymentStatus.Completed,
        used: Reference.Unused,
      });
      if (!payment) {
        throw new NotFoundException('Payment reference not found or has been used');
      }
      // Get existing license
      const license = await queryRunner.manager.findOne(License, {
        where: { licenseNo: data.oldLicenseNo },
        relations: ['preRegistration.student.application'],
      });
      if (!license) {
        throw new BadRequestException('Old license record was not found!');
      }
      if (license.isActive === Status.Inactive) {
        throw new BadRequestException(
          'Replacement already done for this license. Use the most recent license number!',
        );
      }

      replacementData.reference = data.reference;
      replacementData.lgaId = license.preRegistration.student.application.lgaOfOriginId;
      replacementData.stateId = license.preRegistration.student.application.stateOfOriginId;
      replacementData.direct = true;
      replacementData.studentId = license.preRegistration.studentId;
      replacementData.certificateNo = license.preRegistration.student.certificateNo;
      replacementData.status = PreRegistrationStatus.Processing;
      // Create a pre-registration data
      const preRegistrationResp = await this.preRegistration(
        replacementData as PreRegistrationRequestDto,
        req,
      );
      // If pre-registration failed for any reason, flag
      if (!preRegistrationResp.success) {
        throw new BadRequestException(preRegistrationResp.message);
      }
      // Pull pre-registration data
      const registration = await queryRunner.manager.findOne(PreRegistration, {
        where: { id: preRegistrationResp.data.preRegistrationId },
        relations: ['student.application.applicantFiles', 'drivingSchool', 'cbtSchedule'],
      });
      replacementData.preRegistrationId = preRegistrationResp.data.preRegistrationId;
      replacementData.applicationNo = preRegistrationResp.data.applicationNo;

      // Before creating new license record, expire old one (since this is replacement)
      // blacklist if possible
      await queryRunner.manager.update(
        License,
        { id: license.id },
        {
          status: LicenseStatus.Expired,
          isActive: Status.Inactive,
        },
      );

      // Set license request type
      data.requestType = LicenseRequestType.Replacement;
      data.status = LicenseStatus.Processing;
      const user: AuthUserInfo | null = req.user;
      const licenseData: License = await this.buildLicensePayload(data, registration, user);

      // Update payment status
      payment.used = Reference.Used;
      payment.status = PaymentStatus.Used;
      await this.paymentService.update(payment.id, payment);

      // Commit transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = licenseData;
    } catch (error: any) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
    return response;
  }

  /**
   * Approve License
   * @param data
   * @param user
   */
  async approveLicense(data: ApproveLicenseDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // Get license information
      const license = await this.licenseRepository.findOne({
        where: { id: data.licenseId },
        relations: ['preRegistration.student.application'],
      });
      if (!license) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }
      // If license already approved, flag
      if (license.status === LicenseStatus.Completed) {
        response.message = 'License already approved!';
        response.success = true;
      } else {
        // Get license approval data
        const approvalData: any = await getLicenseApprovalData(
          data,
          queryRunner.manager.getRepository(License),
        );
        // Set other details
        if (user) {
          approvalData.issuedById = user.id;
        }
        approvalData.licenseClassId = data.licenseClassId ?? license.licenseClassId;
        approvalData.years = data.years ?? license.years;
        approvalData.status = LicenseStatus.Completed;
        approvalData.isActive = Status.Active;

        // Update license
        await queryRunner.manager.update(License, { id: license.id }, approvalData);

        // Update the pre-registration data
        await queryRunner.manager.update(
          PreRegistration,
          { id: license.preRegistrationId },
          { status: PreRegistrationStatus.Completed },
        );

        // Send email notification
        const fullName = [license.firstName, license.middleName, license.lastName].join(' ');
        await mailer
          .setSubject(MESSAGES.licenseApproved)
          .setMessage(
            MESSAGES.licenseEmailBody(
              license.preRegistration.applicationNo,
              approvalData.licenseNo,
              fullName,
            ),
          )
          .setTo(license.email)
          .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
          .sendDefault();

        // Commit transaction
        await queryRunner.commitTransaction();

        response.data = { ...approvalData, licenseNo: approvalData.licenseNo };
        response.success = true;
        response.message = MESSAGES.approvedSuccessful;
      }
    } catch (error: any) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
    return response;
  }

  async agentRegistrations(data: BaseRequestDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;
    const sortOrder = data.order && ['ASC', 'DESC'].includes(data.order) ? data.order : 'DESC';

    try {
      const queryBuilder = this.licenseRepository.createQueryBuilder('license');
      const fieldsToSelect = [
        // license fields (License)
        'license.id',
        'license.preRegistrationId',
        'license.transactionId',
        'license.issuedById',
        'license.titleId',
        'license.firstName',
        'license.middleName',
        'license.lastName',
        'license.maidenName',
        'license.email',
        'license.phone',
        'license.licenseNo',
        'license.requestType',
        'license.licenseClassId',
        'license.years',
        'license.status',
        'license.createdAt',
        // --- preRegistration fields
        'preRegistration.id',
        'preRegistration.applicationNo',
      ];

      queryBuilder
        .leftJoinAndSelect('license.createdBy', 'createdBy')
        .leftJoinAndSelect('license.preRegistration', 'preRegistration');

      queryBuilder.select(fieldsToSelect);

      queryBuilder.where(
        new Brackets((qb) => {
          qb.where('createdBy.id = :userId', { userId: user.id }).orWhere(
            'license.issuedById = :userId',
            {
              userId: user.id,
            },
          );
        }),
      );
      if (data.search && data.search.trim() !== '') {
        const searchTerm = `%${data.search.trim()}%`;
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('license.firstName LIKE :search', { search: searchTerm })
              .orWhere('license.lastName LIKE :search', { search: searchTerm })
              .orWhere('license.email LIKE :search', { search: searchTerm });
          }),
        );
      }

      queryBuilder.orderBy('license.createdAt', sortOrder);

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
   * Update License
   * @param data
   */
  async updateLicense(data: UpdateLicenseDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // Get license information
      const license = await queryRunner.manager.findOne(License, {
        where: { id: data.licenseId },
        relations: ['preRegistration.student.application'],
      });
      if (!license) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }

      const payload = {
        ...license,
        status: data.status ?? LicenseStatus.Completed,
        isActive: data.isActive,
      };

      // Update license
      await queryRunner.manager.update(License, { id: license.id }, payload);

      // Update the pre-registration data
      await queryRunner.manager.update(
        PreRegistration,
        { id: license.preRegistrationId },
        { status: PreRegistrationStatus.Processing },
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
    return response;
  }

  /**
   * Generate License
   * @param licenseNo
   */
  async generateLicense(licenseNo: string): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    try {
      // Get license information
      const license = await this.licenseRepository.findOne({
        where: { licenseNo: licenseNo },
        relations: [
          'preRegistration.student.application.applicantFiles.file',
          'preRegistration.cbtCenter',
        ],
      });
      if (!license) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }

      // Generate license
      response.data = await generateLicenseCard(license, this.authService);
      // Update printed status on license [leave for now since we've still testing]

      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Expire License
   * @param data
   */
  async expireLicense(data: ExpireLicenseDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // Get license information
      const license = await queryRunner.manager.findOne(License, {
        where: { id: data.licenseId },
        relations: ['preRegistration.student.application'],
      });

      if (!license) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }

      // If license already expires, return message
      if (license.status === LicenseStatus.Expired) {
        throw new BadRequestException('License has already expired');
      }

      if (license.status === LicenseStatus.Pending) {
        await queryRunner.manager.update(
          License,
          { id: license.id },
          { status: LicenseStatus.Processing },
        );
      }

      // find an admin to use
      const user = await this.userService.findUserBy({ roleId: Role.Admin });
      if (!user) {
        throw new BadRequestException('No Admin found to authorize this request');
      }

      // check that this license has been approved, If not, approve license
      if (!license.licenseNo) {
        await this.approveLicense(
          { licenseId: data.licenseId, licenseClassId: 3, years: 5 } as ApproveLicenseDto,
          {
            id: user.id,
            roleId: user.roleId,
            email: user.email,
            stateId: user.stateId,
            lgaId: user.lgaId,
          } as AuthUserInfo,
        );
      }

      // Expire this license
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      license.status = LicenseStatus.Expired;
      license.expiryAt = yesterday;

      // Update license
      await queryRunner.manager.update(License, { id: license.id }, license);

      // Update the pre-registration data
      await queryRunner.manager.update(
        PreRegistration,
        { id: license.preRegistrationId },
        { status: PreRegistrationStatus.Completed },
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.recordUpdated;
      response.data = { id: license.id, licenseNo: license.licenseNo, status: license.status };
    } catch (error: any) {
      // Rollback transaction
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      // Release query runner
      await queryRunner.release();
    }

    return response;
  }

  /**
   * Build License data
   * @param data
   * @param registration
   * @param user
   */
  async buildLicensePayload(
    data: any,
    registration: PreRegistration,
    user: AuthUserInfo | null = null,
  ): Promise<License> {
    // Get transaction
    const reference = data.reference ?? registration.reference;
    const transaction = await this.paymentService.findPaymentBy({
      reference: reference,
    });
    const licenseData = new License();
    licenseData.preRegistrationId = registration.id;
    licenseData.reference = reference;
    licenseData.transactionId = transaction.id;
    licenseData.titleId = registration.student.application.titleId;
    licenseData.firstName = registration.student.application.firstName;
    licenseData.lastName = registration.student.application.lastName;
    licenseData.middleName = registration.student.application.middleName;
    licenseData.maidenName = registration.student.application.maidenName;
    licenseData.email = registration.student.application.email;
    licenseData.phone = registration.student.application.phone;
    licenseData.address = registration.student.application.address;
    licenseData.dateOfBirth = registration.student.application.dateOfBirth;
    licenseData.genderId = registration.student.application.genderId;
    licenseData.lgaId = registration.student.application.lgaOfOriginId;
    licenseData.stateId = registration.student.application.stateOfOriginId;
    licenseData.nationalityId = registration.student.application.nationalityId;
    licenseData.height = data.height ?? registration.student.application.height;
    licenseData.weight = data.weight ?? registration.student.application.weight;
    licenseData.eyeColor = data.eyeColor ?? registration.student.application.eyeColor;
    licenseData.facialMarks = data.facialMarks ?? registration.student.application.facialMarks;
    licenseData.disability = data.disability ?? registration.student.application.disability;
    licenseData.glasses = data.glasses ?? registration.student.application.glasses;
    licenseData.requestType = data.requestType;
    licenseData.status = LicenseStatus.Pending;
    licenseData.approvalLevel = ApprovalLevel.LevelOne;
    licenseData.years = data.years ?? registration.years ?? 3;
    licenseData.licenseClassId = data.licenseClassId ?? registration.licenseClassId ?? 3;
    // If source is set, set it
    if (data.source) {
      licenseData.source = data.source;
    }
    // If a new email is set, use it else use application email
    if (data.email) {
      licenseData.email = data.email;
    }
    // If a new phone is set, use it else use application phone
    if (data.phone) {
      licenseData.phone = data.phone;
    }
    // If affidavit is supplied, set it
    if (data.affidavitNo) {
      licenseData.affidavitNo = data.affidavitNo;
    }
    // If reason for replacement is given, set it
    if (data.replacementReason) {
      licenseData.replacementReason = data.replacementReason;
    }
    // create license entry
    const licenseRecord = await this.licenseRepository.save({
      ...licenseData,
      createdBy: user ? { id: user.id } : null,
    });
    licenseData.id = licenseRecord.id;
    // If there are files attached, save files
    // await this.saveFileRecord(licenseRecord.id, registration);
    // If license class and years are set from this point, save
    const preRegistrationUpdate: any = {
      status: PreRegistrationStatus.Processing,
    };
    if (data.licenseClassId) {
      preRegistrationUpdate.licenseClassId = data.licenseClassId;
    }
    if (data.years) {
      preRegistrationUpdate.years = data.years;
    }
    // Update pre-registration record
    await this.preRegistrationRepository.update(
      {
        id: registration.id,
      },
      {
        ...preRegistrationUpdate,
        createdBy: user ? { id: user.id } : null,
      },
    );
    return licenseData;
  }

  /**
   * Submit pre-registration files
   * @param data
   */
  async submitPreRegistrationFiles(data: AttachFilesDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // // verify payment
      // const payment = await this.paymentService.findPaymentBy({
      //   reference: data.reference,
      //   type: TransactionType.biometricsPayment,
      //   status: PaymentStatus.Completed,
      //   used: Reference.Unused,
      // });
      // if (!payment) {
      //   throw new NotFoundException('Payment reference not found or has been used');
      // }
      // Get pre-registration information
      const preRegistration = await this.preRegistrationRepository.findOne({
        where: { applicationNo: data.applicationNo },
        relations: ['student.application.applicantFiles'],
      });
      if (!preRegistration) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }

      // Save pre registration files
      await this.savePreRegFileRecord(preRegistration.id, data.files);

      // Update payment status
      // payment.used = Reference.Used;
      // payment.status = PaymentStatus.Used;
      // await this.paymentService.update(payment.id, payment);

      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Save resource files
   * @param id
   * @param files
   */
  async savePreRegFileRecord(id: number, files: FileInterface[]) {
    for (const file of files) {
      await this.licenseFileRepository.save({
        preRegistration: { id },
        file: { id: file.fileId },
        documentType: file.documentType,
      });
    }
  }

  /**
   * Append base64 (only for single record)
   * @param files
   */
  async getBaseRecord(files: LicenseFile[] | ApplicantFile[]) {
    for (const file of files) {
      if (file.file.bucketKey) {
        const awsS3bucket = new AttachmentUtils();
        file.file.base64String = await awsS3bucket.getPreSignedUrl(file.file.bucketKey);
      }
    }
    return files;
  }

  /**
   * Helper to get common license information
   * @param license
   */
  getLicenseInformation(license: License) {
    const data: any = {
      title: getMapValue(salutations, 'id', license.titleId, 'name'),
      gender: getMapValue(genders, 'id', license.genderId, 'name'),
      licenseClass: getMapValue(licenseClasses, 'id', license.licenseClassId, 'name'),
      state: getMapValue(states, 'id', license.stateId, 'name'),
      lga: getMapValue(lgas, 'id', license.lgaId, 'name'),
      nationality: getMapValue(nationalities, 'id', license.nationalityId, 'name'),
      ...license,
    };
    if (
      license.preRegistration &&
      license.preRegistration.student &&
      license.preRegistration.student.application
    ) {
      data.occupationId = license.preRegistration.student.application.occupationId;
      data.maritalStatusId = license.preRegistration.student.application.maritalStatusId;
      data.bloodGroupId = license.preRegistration.student.application.bloodGroupId;
      data.nextOfKinName = license.preRegistration.student.application.nextOfKinName;
      data.nextOfKinRelationshipId =
        license.preRegistration.student.application.nextOfKinRelationshipId;
      data.nextOfKinNationalityId =
        license.preRegistration.student.application.nextOfKinNationalityId;
      data.nextOfKinPhone = license.preRegistration.student.application.nextOfKinPhone;
    }
    return data;
  }

  /**
   * Calculates total licenses, renewed, replaced, and expired licenses.
   */
  async getLicenseSummary(): Promise<{
    totalLicense: number;
    totalRenewed: number;
    totalReplaced: number;
    totalExpired: number;
    totalNewLicence: number;
  }> {
    const result = await this.licenseRepository
      .createQueryBuilder('licenses')
      .select([
        'COUNT(*) AS totalLicense',
        "COUNT(CASE WHEN licenses.requestType = 'renewal' THEN 1 END) AS totalRenewed",
        "COUNT(CASE WHEN licenses.requestType = 'new' THEN 1 END) AS totalNewLicence",
        "COUNT(CASE WHEN licenses.requestType = 'replacement' THEN 1 END) AS totalReplaced",
        'COUNT(CASE WHEN licenses.expiryAt < NOW() THEN 1 END) AS totalExpired',
      ])
      .getRawOne();

    return {
      totalLicense: parseInt(result.totallicense, 10) || 0,
      totalRenewed: parseInt(result.totalrenewed, 10) || 0,
      totalReplaced: parseInt(result.totalreplaced, 10) || 0,
      totalExpired: parseInt(result.totalexpired, 10) || 0,
      totalNewLicence: parseInt(result.totalNewLicence, 10) || 0,
    };
  }

  /**
   * Filters by the current year.
   * Uses EXTRACT(MONTH FROM ...) to group by month.
   * Handles the expired type filtering by checking expiry_date.
   * Orders the results by month.
   * @param data
   */
  async getMonthlyLicenseVolume(
    data: LicenseStatsWithYearDto,
  ): Promise<{ month: number; count: number }[]> {
    let year = new Date().getFullYear();
    if (data.year) {
      year = new Date(new Date().setFullYear(+data.year)).getFullYear();
    }
    const qb = this.licenseRepository.createQueryBuilder('licenses');

    qb.select(['EXTRACT(MONTH FROM licenses.created_at) AS month', 'COUNT(*) AS count'])
      .where(`EXTRACT(YEAR FROM licenses.created_at) = :year`, { year })
      .groupBy('month')
      .orderBy('month');

    if (data.status) {
      if (data.status === 'expired') {
        qb.andWhere('licenses.expiryAt < NOW()');
      } else {
        qb.andWhere(`licenses.status = :status`, { status: data.status });
      }
    }

    if (data.type !== 'all') {
      qb.andWhere(`licenses.requestType = :type`, { type: data.type });
    }
    return qb.getRawMany();
  }

  /**
   * Calculates the renewal rate as a percentage
   * @param startDate
   * @param endDate
   */
  async getRenewalRate(startDate: Date, endDate: Date): Promise<number> {
    const [renewed, expired] = await Promise.all([
      this.licenseRepository.count({
        where: { requestType: 'renewal', createdAt: Between(startDate, endDate) },
      }),
      this.licenseRepository.count({ where: { expiryAt: Between(startDate, endDate) } }),
    ]);
    return expired > 0 ? (renewed / expired) * 100 : 0;
  }

  /**
   * Fetches distribution by LGA
   */
  async getLgaDistributionByState(): Promise<{ lgaId: number; count: number }[]> {
    return (
      this.licenseRepository
        .createQueryBuilder('licenses')
        .select(['licenses.lgaId AS lgaId', 'COUNT(*) AS count'])
        // .where('licenses.status = :status', { status: LicenseStatus.Completed })
        .groupBy('licenses.lgaId')
        .orderBy('count', 'DESC')
        .getRawMany()
    );
  }

  /**
   * Get distribution by license class
   */
  async getClassDistribution(): Promise<{ licenseClassId: number; count: number }[]> {
    return (
      this.licenseRepository
        .createQueryBuilder('licenses')
        .select(['licenses.licenseClassId AS licenseClassId', 'COUNT(*) AS count'])
        // .where('licenses.status = :status', { status: LicenseStatus.Completed })
        .groupBy('licenses.licenseClassId')
        .orderBy('count', 'DESC')
        .getRawMany()
    );
  }

  /**
   * Get distribution by license request type
   */
  async getApplicationDistribution(): Promise<RequestTypeDistribution[]> {
    const requestTypeColumn = 'licenses.requestType';
    const queryBuilder = this.licenseRepository
      .createQueryBuilder('licenses')
      .select(requestTypeColumn, 'requestType')
      .addSelect('COUNT(licenses.id)', 'count')
      .groupBy(requestTypeColumn)
      .orderBy(requestTypeColumn, 'ASC');

    const rawResults: Array<{ requestType: string; count: string | number }> =
      await queryBuilder.getRawMany();

    // Ensure 'count' is a number, as getRawMany might return it as a string from some DB drivers.
    return rawResults.map((result) => ({
      requestType: result.requestType,
      count: typeof result.count === 'string' ? parseInt(result.count, 10) : result.count,
    }));
  }

  /**
   * Get distribution by age group
   */
  async getAgeDistribution(): Promise<AgeGroupDistribution[]> {
    const ageCalculationSql = `DATE_PART('year', AGE(CURRENT_DATE, TO_DATE(licenses."date_of_birth", 'DD-MM-YYYY')))`;

    const ageGroupCaseSql = `
      CASE
        WHEN ${ageCalculationSql} >= 18 AND ${ageCalculationSql} <= 25 THEN '18-25'
        WHEN ${ageCalculationSql} >= 26 AND ${ageCalculationSql} <= 35 THEN '26-35'
        WHEN ${ageCalculationSql} >= 36 AND ${ageCalculationSql} <= 45 THEN '36-45'
        WHEN ${ageCalculationSql} >= 46 AND ${ageCalculationSql} <= 55 THEN '46-55'
        WHEN ${ageCalculationSql} >= 56 THEN '56-above'
        ELSE 'Other/Invalid'
      END
    `;

    const queryBuilder = this.licenseRepository
      .createQueryBuilder('licenses')
      .select(ageGroupCaseSql, 'ageGroup')
      .addSelect('COUNT(licenses.id)', 'count')
      .where('licenses."date_of_birth" IS NOT NULL')
      .groupBy(ageGroupCaseSql)
      .orderBy(ageGroupCaseSql, 'ASC');

    const rawResults: Array<{ ageGroup: string; count: string | number }> =
      await queryBuilder.getRawMany();

    return rawResults.map((result) => ({
      ageGroup: result.ageGroup,
      count: typeof result.count === 'string' ? parseInt(result.count, 10) : result.count,
    }));
  }

  /**
   * Fetches gender distribution
   */
  async getGenderDistribution(): Promise<{ genderId: number; count: number }[]> {
    return (
      this.licenseRepository
        .createQueryBuilder('licenses')
        .select(['licenses.genderId AS genderId', 'COUNT(*) AS count'])
        // .where('licenses.status = :status', { status: LicenseStatus.Completed })
        .groupBy('licenses.genderId')
        .getRawMany()
    );
  }
}
