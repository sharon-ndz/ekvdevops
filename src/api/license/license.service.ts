import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ApproveLicenseDto,
  AttachFilesDto,
  ExpireLicenseDto,
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
  AuthUserInfo,
  DataResultInterface,
  ListInterface,
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
import { ApplicationNoDto, beginTransaction, LicenseNoDto } from '../../core/interfaces/all.dto';
import {
  genders,
  lgas,
  licenseClasses,
  nationalities,
  salutations,
  states,
} from '../../core/constants/constants';
import { DrivingSchoolService } from '../driving-school/driving-school.service';
import { PaymentService } from '../payment/payment.service';
import { PaymentDto } from '../payment/payment.dto';
import AttachmentUtils from '../../core/helpers/aws.s3';
import { UsersService } from '../users/users.service';
import { Role } from '../../middlewares/roles';
import { DrivingTestService } from '../driving-test/driving-test.service';
import { DrivingTestScheduleDto } from '../driving-test/driving-test.dto';
import { MESSAGES } from '../../core/constants/messages';
import { getPagination } from '../../core/helpers/functions.helpers';
import { mailer } from '../../core/helpers';

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
    @InjectRepository(EmailNotification)
    private readonly emailNotificationRepository: Repository<EmailNotification>,
    private readonly cbtService: CbtService,
    private readonly drivingTestService: DrivingTestService,
    private readonly drivingSchoolService: DrivingSchoolService,
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
  async findAll(data: ListInterface, user: AuthUserInfo): Promise<DataResultInterface> {
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
    queryBuilder.orderBy('licenses.id', 'DESC');

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

    const queryBuilder = this.preRegistrationRepository.createQueryBuilder('pre_registrations');
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
        relations: ['licenseFiles.file', 'preRegistration.student.application'],
      });
      if (license.licenseFiles) {
        license.licenseFiles = await this.getBaseRecord(license.licenseFiles);
      }
      const licenseData: any = this.getLicenseInformation(license);
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
        relations: ['licenseFiles.file', 'preRegistration.student.application'],
      });
      if (license.licenseFiles) {
        license.licenseFiles = await this.getBaseRecord(license.licenseFiles);
      }
      const licenseData: any = this.getLicenseInformation(license);
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
          relations: ['licenseFiles.file', 'preRegistration.student.application'],
        });

        if (!license) {
          throw new BadRequestException('No license found with this certificate number!');
        }
        license.licenseFiles = await this.getBaseRecord(license.licenseFiles);
        //const validationResp = await this.drivingSchoolService.validateCertNo(certificateNo);
        response.success = true;
        response.message = MESSAGES.recordFound;
        response.data = this.getLicenseInformation(license);
        return response;
      }
    }

    if (!certificateNo && data.licenseNo) {
      // try to find license
      const license = await this.licenseRepository.findOne({
        where: { licenseNo: data.licenseNo },
        relations: ['licenseFiles.file', 'preRegistration.student.application'],
      });

      if (!license) {
        throw new BadRequestException('License with supplied license Number not found!');
      }
      license.licenseFiles = await this.getBaseRecord(license.licenseFiles);
      response.success = true;
      response.message = MESSAGES.recordFound;
      response.data = this.getLicenseInformation(license);
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
        if (cbtScheduleId) {
          data.cbtScheduleId = +cbtScheduleId;
        }
        // Create driving test schedule
        // First look for any driving test center within candidate local government
        const center = await this.drivingTestService.findDrivingTestCenter(
          data.stateId,
          data.lgaId,
        );
        if (center) {
          // Create driving test schedule (pre-book)
          const drivingTestScheduleId = await this.drivingTestService.scheduleTest(
            student.id,
            center.id,
            {
              lgaId: data.lgaId,
              stateId: data.stateId,
              date: data.date,
              time: data.time,
              canCreate: true,
            } as DrivingTestScheduleDto,
          );
          if (drivingTestScheduleId) {
            data.drivingTestScheduleId = +drivingTestScheduleId;
          }
        }
      }

      // Create pre registration
      const preRegistrationRecord = await queryRunner.manager.insert(PreRegistration, data);
      const preRegistrationId = preRegistrationRecord.raw[0].id;

      // If driving test schedule ID is set, update schedule with pre-registration ID
      if (data.drivingTestScheduleId) {
        await this.drivingTestService.updateScheduleWithQueryRunner(
          data.drivingTestScheduleId,
          {
            preRegistrationId: preRegistrationId,
          },
          queryRunner,
        );
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
          .setEmailNotificationRepository(this.emailNotificationRepository)
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
      response.message = error.message;
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

      let drivingTestScheduleId: number;

      if (!data.direct) {
        // Create driving test schedule
        drivingTestScheduleId = await this.drivingTestService.scheduleTest(
          student.id,
          data.drivingTestCenterId,
          {
            lgaId: data.lgaId,
            stateId: data.stateId,
            date: data.date,
            time: data.time,
          } as DrivingTestScheduleDto,
        );
        data.drivingTestScheduleId = +drivingTestScheduleId;
      }

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
          .setEmailNotificationRepository(this.emailNotificationRepository)
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
      await this.drivingTestService.updateScheduleWithQueryRunner(
        drivingTestScheduleId,
        {
          preRegistrationId: preRegistrationId,
        },
        queryRunner,
      );

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
   */
  async submitNewRequest(data: NewLicenseRequestDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // Get pre-registration data
      const registration = await this.preRegistrationRepository.findOne({
        where: { applicationNo: data.applicationNo },
        relations: ['student.application.applicantFiles', 'drivingSchool', 'cbtSchedule'],
      });
      if (!registration) {
        throw new BadRequestException('Record with supplied applicationNo not found!');
      }
      if (registration.status === PreRegistrationStatus.Pending) {
        throw new BadRequestException('Pre registration Payment has not been confirmed!');
      }
      // Set license request type
      data.requestType = LicenseRequestType.New;
      const licenseData: License = await this.buildLicensePayload(data, registration);
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
    try {
      const renewalData: any = {};
      // If renewal is not an external license i e was issued from this system, validate license
      if (data.isExternal) {
        throw new BadRequestException(
          'Renewal of driver license issued outside of this system is not yet supported!',
        );
      }
      // Get existing license
      const license = await this.licenseRepository.findOne({
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
      const registration = await this.preRegistrationRepository.findOne({
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
      await this.preRegistrationRepository.update(registration.id, {
        status: PreRegistrationStatus.Processing,
      });

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
      const licenseData: License = await this.buildLicensePayload(data, registration);

      // After submitting renewal request for a new license, set old one to inactive so that it's not eligible in the future for renewal again
      await this.licenseRepository.update(
        { id: license.id },
        {
          isActive: Status.Inactive,
        },
      );

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = { ...licenseData, ...paymentResp };
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
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
      const license = await this.licenseRepository.findOne({
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
      const registration = await this.preRegistrationRepository.findOne({
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
      const licenseData: License = await this.buildLicensePayload(data, registration);
      // After submitting renewal request for a new license,
      // set old one to inactive so that it's not eligible in the future for renewal again
      await this.licenseRepository.update(
        { id: license.id },
        {
          isActive: Status.Inactive,
        },
      );

      // Update payment status
      payment.used = Reference.Used;
      payment.status = PaymentStatus.Used;
      await this.paymentService.update(payment.id, payment);

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
    try {
      const replacementData: any = {};
      // If renewal is not an external license i e was issued from this system, validate license
      if (data.isExternal) {
        throw new BadRequestException(
          'Renewal of driver license issued outside of this system is not yet supported!',
        );
      }
      // Get existing license
      const license = await this.licenseRepository.findOne({
        where: { licenseNo: data.oldLicenseNo },
        relations: ['preRegistration.student'],
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
      replacementData.lgaId = data.lgaId;
      replacementData.stateId = data.stateId;
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
      const registration = await this.preRegistrationRepository.findOne({
        where: { id: preRegistrationResp.data.preRegistrationId },
        relations: ['student.application.applicantFiles', 'drivingSchool', 'cbtSchedule'],
      });
      replacementData.preRegistrationId = preRegistrationResp.data.preRegistrationId;
      replacementData.applicationNo = preRegistrationResp.data.applicationNo;

      // Before creating new license, expire old one
      // blacklist if possible
      await this.licenseRepository.update(
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
      const licenseData: License = await this.buildLicensePayload(data, registration);

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = { ...licenseData, ...paymentResp };
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
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
      const license = await this.licenseRepository.findOne({
        where: { licenseNo: data.oldLicenseNo },
        relations: ['preRegistration.student'],
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
      replacementData.lgaId = data.lgaId;
      replacementData.stateId = data.stateId;
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
      const registration = await this.preRegistrationRepository.findOne({
        where: { id: preRegistrationResp.data.preRegistrationId },
        relations: ['student.application.applicantFiles', 'drivingSchool', 'cbtSchedule'],
      });
      replacementData.preRegistrationId = preRegistrationResp.data.preRegistrationId;
      replacementData.applicationNo = preRegistrationResp.data.applicationNo;

      // Before creating new license record, expire old one (since this is replacement)
      // blacklist if possible
      await this.licenseRepository.update(
        { id: license.id },
        {
          status: LicenseStatus.Expired,
          isActive: Status.Inactive,
        },
      );

      // Set license request type
      data.requestType = LicenseRequestType.Replacement;
      data.status = LicenseStatus.Processing;
      const licenseData: License = await this.buildLicensePayload(data, registration);

      // Update payment status
      payment.used = Reference.Used;
      payment.status = PaymentStatus.Used;
      await this.paymentService.update(payment.id, payment);

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
   * Approve License
   * @param data
   * @param user
   */
  async approveLicense(data: ApproveLicenseDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // Get license information
      const license = await this.licenseRepository.findOne({
        where: { id: data.licenseId },
        relations: ['preRegistration.student.application'],
      });
      if (!license) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }
      // If license payment has not been cleared, flag
      if (license.status === LicenseStatus.Pending) {
        throw new BadRequestException('License payment has not been verified');
      }
      // If license already approved, flag
      if (license.status === LicenseStatus.Completed) {
        response.message = 'License already approved!';
      } else {
        // Get license approval data
        const approvalData: any = await getLicenseApprovalData(data, this.licenseRepository);
        // Set other details
        approvalData.issuedById = user.id;
        approvalData.licenseClassId = data.licenseClassId;
        approvalData.years = data.years;
        approvalData.status = LicenseStatus.Completed;
        approvalData.isActive = Status.Active;

        // Update license
        await this.licenseRepository.update({ id: license.id }, approvalData);
        // Update the pre-registration data
        await this.preRegistrationRepository.update(
          {
            id: license.preRegistrationId,
          },
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
          .setEmailNotificationRepository(this.emailNotificationRepository)
          .sendDefault();

        response.data = approvalData;
        response.success = true;
        response.message = MESSAGES.approvedSuccessful;
      }
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
    try {
      // Get license information
      const license = await this.licenseRepository.findOne({
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
      await this.licenseRepository.update({ id: license.id }, payload);
      // Update the pre-registration data
      await this.preRegistrationRepository.update(
        {
          id: license.preRegistrationId,
        },
        { status: PreRegistrationStatus.Processing },
      );
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
    try {
      // Get license information
      const license = await this.licenseRepository.findOne({
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
        await this.licenseRepository.update(
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
      await this.licenseRepository.update({ id: license.id }, license);
      // Update the pre-registration data
      await this.preRegistrationRepository.update(
        {
          id: license.preRegistrationId,
        },
        { status: PreRegistrationStatus.Completed },
      );
      response.success = true;
      response.message = MESSAGES.recordUpdated;
      response.data = { id: license.id, licenseNo: license.licenseNo, status: license.status };
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Build License data
   * @param data
   * @param registration
   */
  async buildLicensePayload(data: any, registration: PreRegistration): Promise<License> {
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
    licenseData.lgaId = data.lgaId;
    licenseData.stateId = data.stateId;
    licenseData.nationalityId = data.nationalityId;
    licenseData.height = data.height;
    licenseData.weight = data.weight;
    licenseData.eyes = data.eyes;
    licenseData.requestType = data.requestType;
    licenseData.status = LicenseStatus.Pending;
    licenseData.approvalLevel = ApprovalLevel.LevelOne;
    // If source is set, set it
    if (data.source) {
      licenseData.source = data.source;
    }
    // If license class and years are assigned at this point, set them
    if (data.years) {
      licenseData.years = data.years;
    }
    if (data.licenseClassId) {
      licenseData.licenseClassId = data.licenseClassId;
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
    const licenseRecord = await this.licenseRepository.insert(licenseData);
    // If there are files attached, save files
    await this.saveFileRecord(licenseRecord.raw[0].id, registration);
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
      preRegistrationUpdate,
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
   * Save all pre-registration biometrics against license.
   * Biometrics for license has been improved to a module. i.e Biometrics is captured only once during pre-registration
   * This means, only update the license id on the pre-registration files
   * @param id // license id
   * @param registration // pre-registration id
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async saveFileRecord(id: number, registration: PreRegistration) {
    const preRegistrationFiles = await this.licenseFileRepository.find({
      where: { preRegistration: registration },
    });
    for (const file of preRegistrationFiles) {
      await this.licenseFileRepository.update(
        { id: file.id },
        {
          license: { id },
        },
      );
    }
  }

  /**
   * Save resource files
   * @param id
   * @param files
   */
  async saveLicenseFileRecord(id: number, files: FileInterface[]) {
    for (const file of files) {
      await this.licenseFileRepository.save({
        license: { id },
        file: { id: file.fileId },
        documentType: file.documentType,
      });
    }
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
  async getBaseRecord(files: LicenseFile[]) {
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
  }> {
    const result = await this.licenseRepository
      .createQueryBuilder('licenses')
      .select([
        'COUNT(*) AS totalLicense',
        "COUNT(CASE WHEN licenses.requestType = 'renewal' THEN 1 END) AS totalRenewed",
        "COUNT(CASE WHEN licenses.requestType = 'replacement' THEN 1 END) AS totalReplaced",
        'COUNT(CASE WHEN licenses.expiryAt < NOW() THEN 1 END) AS totalExpired',
      ])
      .getRawOne();

    return {
      totalLicense: parseInt(result.totallicense, 10) || 0,
      totalRenewed: parseInt(result.totalrenewed, 10) || 0,
      totalReplaced: parseInt(result.totalreplaced, 10) || 0,
      totalExpired: parseInt(result.totalexpired, 10) || 0,
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
   * Fetches the top 5 lgas with the most expired licenses
   * @param startDate
   * @param endDate
   */
  async getTopExpiredLicensesByLga(
    startDate: Date,
    endDate: Date,
  ): Promise<{ lgaId: number; count: number }[]> {
    return this.licenseRepository
      .createQueryBuilder('licenses')
      .select(['licenses.lgaId AS lgaId', 'COUNT(*) AS count'])
      .where('licenses.expiryAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('licenses.lgaId')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();
  }

  /**
   * Fetches gender distribution within a date range
   * @param startDate
   * @param endDate
   */
  async getGenderDistribution(
    startDate: Date,
    endDate: Date,
  ): Promise<{ genderId: number; count: number }[]> {
    return this.licenseRepository
      .createQueryBuilder('licenses')
      .select(['licenses.genderId AS genderId', 'COUNT(*) AS count'])
      .where('licenses.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('licenses.genderId')
      .getRawMany();
  }
}
