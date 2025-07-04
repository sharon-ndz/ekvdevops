import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, FindManyOptions, ILike, In, QueryRunner, Repository } from 'typeorm';
import {
  AuthUserInfo,
  DataResultInterface,
  RequestResultInterface,
} from '../../core/interfaces/all.interface';
import { DrivingSchool } from '../../entities/driving-school.entity';
import {
  ActionDrivingSchoolApplicationDto,
  ApplicationStatsDto,
  AssignOfficerDto,
  CompleteSchoolApplicationDto,
  DirivinSchoolListRequestsDto,
  DrivingSchoolApplicationStatsDto,
  DrivingSchoolDto,
  FetchDashboardStatsRequestDto,
  FetchMasterListDto,
  FetchStudentListDto,
  IssueCertDto,
  ListApplicationsDto,
  listDrivingSchoolInspectionsDto,
  SelfServiceCreateSchoolDto,
  SubmitDrivingSchoolApplicationDto,
  toggleSchoolStatusDto,
  UpdateDrivingSchoolApplicationDto,
  UpdateDrivingSchoolDto,
} from './driving-school.dto';
import { TrainingDuration } from '../../entities/training-duration.entity';
import { DrivingSchoolApplication } from '../../entities/driving-school-application.entity';
import { Student } from '../../entities/student.entity';
import { Payment } from '../../entities/payment.entity';
import {
  CourseLevel,
  PaymentStatus,
  Reference,
  Reg,
  StatisticsFilter,
  Status,
  TransactionType,
} from '../../core/constants/enums';
import {
  generateCertificateNo,
  generateDrivingSchoolApplicationNo,
  generateDrivingSchoolId,
  generateStudentNo,
  hasCompletedTraining,
} from '../../core/helpers/general';
import { ApplicantFile } from '../../entities/applicant-file.entity';
import { FileInterface } from '../file/file.dto';
import { ApplicationNoDto, BaseRequestDto, beginTransaction } from '../../core/interfaces/all.dto';
import { plainToInstance } from 'class-transformer';
import { AuthService } from '../auth/auth.service';
import AttachmentUtils from '../../core/helpers/aws.s3';
import { UserResponseDto } from '../users/users.dto';
import { Role } from '../../middlewares/roles';
import { addPaging, calculateChange, mailer } from '../../core/helpers';
import { User } from '../../entities/user.entity';
import { EmailNotification } from '../../entities/email-notification.entity';
import { Inspection } from '../../entities/inspection.entity';
import { DrivingSchoolInstructor } from '../../entities/driving-school-instructor.entity';
import { AuditTrail } from '../../entities/audit-trail.entity';
import { addBusinessDays } from 'date-fns';
import { DrivingSchoolApplicationQuery } from '../../entities/driving-school-application-query.entity';
import { PreRegistration } from '../../entities/pre-registration.entity';
import { MESSAGES } from '../../core/constants/messages';
import { auditAction, genders, lgas, MONTH_NAMES } from '../../core/constants/constants';
import { getPagination } from '../../core/helpers/functions.helpers';

@Injectable()
export class DrivingSchoolService {
  constructor(
    @InjectRepository(DrivingSchool)
    private readonly drivingSchoolRepository: Repository<DrivingSchool>,
    @InjectRepository(TrainingDuration)
    private readonly trainingDurationRepository: Repository<TrainingDuration>,
    @InjectRepository(DrivingSchoolApplication)
    private readonly drivingSchoolApplicationRepository: Repository<DrivingSchoolApplication>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(ApplicantFile)
    private readonly applicantFileRepository: Repository<ApplicantFile>,
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
    @InjectRepository(Inspection)
    private readonly inspectionRepository: Repository<Inspection>,
  ) { }

  /**
   * Get driving school stats
   * @param user
   */
  async stats(user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    try {
      const result = await this.drivingSchoolRepository
        .createQueryBuilder('driving_schools')
        .select([
          'COUNT(*) AS totalSchools',
          'COUNT(CASE WHEN driving_schools.isActive = 0 THEN 1 END) AS inactiveSchools',
        ])
        .where('driving_schools.status = :status', { status: Reg.Approved })
        .getRawOne();

      response.data = {
        totalSchools: parseInt(result.totalschools, 10) || 0,
        inactiveSchools: parseInt(result.inactiveschools, 10) || 0,
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
   * Get list of driving schools with filters
   * @param data
   * @param user
   */
  async findAll(data: ListApplicationsDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    const queryBuilder = this.drivingSchoolRepository.createQueryBuilder('driving_schools');

    if (data.isActive) {
      queryBuilder.andWhere('driving_schools.isActive = :isActive', { isActive: data.isActive });
    }

    if (data.stateId) {
      queryBuilder.andWhere('driving_schools.stateId = :stateId', { stateId: data.stateId });
    }
    if (data.lgaId) {
      queryBuilder.andWhere('driving_schools.lgaId = :lgaId', { lgaId: data.lgaId });
    }

    console.log('typeof isApprovedOnly:', typeof data.isApprovedOnly);
    console.log('value of isApprovedOnly:', data.isApprovedOnly);

    if (data.regStatus !== undefined) {
      console.log('data.regStatus:', data.regStatus);
      queryBuilder.andWhere(`driving_schools.status = :status`, {
        status: data.regStatus,
      });
    } else if (data.isApprovedOnly === 'true') {
      console.log('isApprovedOnly: true');
      queryBuilder.andWhere(`driving_schools.status = :approvedStatus`, {
        approvedStatus: Reg.Approved,
      });
    } else if (data.isApprovedOnly === 'false') {
      console.log('isApprovedOnly: false');
      queryBuilder.andWhere(`driving_schools.status != :approvedStatus`, {
        approvedStatus: Reg.Approved,
      });
    }

    if (data.createdAtStart && data.createdAtEnd) {
      queryBuilder.andWhere(`driving_schools.createdAt BETWEEN :start AND :end`, {
        start: data.createdAtStart,
        end: data.createdAtEnd,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('driving_schools.email LIKE :search', { search: `%${search}%` }) // Added wildcards
            .orWhere('driving_schools.name LIKE :search', { search: `%${search}%` })
            .orWhere('driving_schools.phone LIKE :search', { search: `%${search}%` })
            .orWhere('driving_schools.identifier LIKE :search', { search: `%${search}%` });
        }),
      );
    }
    // Apply pagination and ordering
    queryBuilder.skip(offset);
    queryBuilder.take(limit);
    queryBuilder.orderBy('driving_schools.id', 'DESC');

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
   * Get single driving school
   * @param drivingSchoolId
   * @param user
   */
  async getSingle(drivingSchoolId: number, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    try {
      const drivingSchool = await this.drivingSchoolRepository.findOne({
        where: { id: drivingSchoolId },
      });
      if (!drivingSchool) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }
      response.data = plainToInstance(DrivingSchool, drivingSchool);
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
   * Create driving school
   * @param data
   * @param user
   */
  async createSchool(data: DrivingSchoolDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const existingSchool = await queryRunner.manager.findOne(DrivingSchool, {
        where: [{ email: data.email }, { phone: data.phone }, { name: data.name }],
      });
      if (existingSchool) {
        throw new BadRequestException(MESSAGES.recordExists);
      }

      const schoolData = plainToInstance(DrivingSchool, data);
      schoolData.identifier = await generateDrivingSchoolId(this.drivingSchoolRepository);
      schoolData.isActive = Status.Active;

      // Create driving school
      const schoolRecord = await queryRunner.manager.save(DrivingSchool, schoolData);

      // Create training durations
      for (const duration of data.trainingDurations) {
        await queryRunner.manager.insert(TrainingDuration, {
          drivingSchoolId: schoolData.id,
          duration: duration,
          durationText: duration + ' Months',
          isActive: Status.Active,
        });
      }

      // Create audit log
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_ADD,
        tableName: 'driving_schools',
        resourceId: schoolRecord.id,
        description: `Driving school ${schoolRecord.identifier} created successfully`,
      });

      await queryRunner.commitTransaction();

      response.data = plainToInstance(DrivingSchool, schoolRecord);
      response.success = true;
      response.message = MESSAGES.recordAdded;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  /**
   * Create driving school [Self Service Portal]
   * @param data
   */
  async selfServiceCreateSchool(data: SelfServiceCreateSchoolDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const existingSchool = await queryRunner.manager.findOne(DrivingSchool, {
        where: [{ email: data.email }, { phone: data.phone }, { name: data.name }],
      });

      if (existingSchool) {
        throw new BadRequestException(MESSAGES.recordExists);
      }

      const schoolData = plainToInstance(DrivingSchool, data);
      schoolData.identifier = await generateDrivingSchoolId(this.drivingSchoolRepository);
      schoolData.isActive = Status.Inactive;
      schoolData.status = Reg.Initiated;

      // Create driving school
      const schoolRecord = await queryRunner.manager.save(DrivingSchool, schoolData);
      const durations = [3, 6, 9];
      // Create training durations
      for (const duration of durations) {
        await queryRunner.manager.insert(TrainingDuration, {
          drivingSchoolId: schoolData.id,
          duration: duration,
          durationText: duration + ' Months',
          isActive: Status.Active,
        });
      }

      // Create school admin using given password
      const user = new User();
      user.firstName = 'School';
      user.lastName = 'Admin';
      user.email = data.email;
      user.phone = data.phone;
      user.password = data.password;
      user.roleId = Role.SchoolAdmin;
      user.drivingSchoolId = schoolRecord.id;
      user.stateId = data.stateId;
      user.lgaId = data.lgaId;
      user.address = data.address;
      user.isActive = Status.Active;

      await queryRunner.manager.save(User, user);

      await mailer
        .setSubject(MESSAGES.schoolApplicationSubmitted)
        .setMessage(MESSAGES.drivingSchoolApplicationCreated(data.name, data.email, data.password))
        .setTo(data.email)
        .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
        .sendDefault();

      await queryRunner.commitTransaction();

      response.data = {
        id: schoolRecord.id,
        name: schoolRecord.name,
        identifier: schoolRecord.identifier,
      };
      response.success = true;
      response.message = MESSAGES.schoolApplicationSubmitted;
    } catch (error: any) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      response.message = error.message;
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  /**
   * Update driving school
   * @param data
   * @param user
   */
  async updateSchool(
    data: UpdateDrivingSchoolDto,
    user: AuthUserInfo,
  ): Promise<RequestResultInterface> {
    //^ set variables
    const response = { success: false, message: '' };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const exists = await queryRunner.manager.findOne(DrivingSchool, {
        where: { id: data.id },
      });
      if (!exists) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }
      const schoolData = plainToInstance(DrivingSchool, data);
      // Update user
      await queryRunner.manager.update(DrivingSchool, { id: data.id }, schoolData);
      // Create audit log
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'driving_schools',
        resourceId: exists.id,
        description: `Driving school ${exists.identifier} updated successfully`,
      });

      await queryRunner.commitTransaction();
      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
    return response;
  }

  /**
   * Fetch all driving schools (As Master list)
   * @param data
   */
  async minimalList(data: FetchMasterListDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    try {
      const whereClause: FindManyOptions<DrivingSchool> = {
        select: {
          id: true,
          name: true,
          address: true,
        },
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

      const [result, count] = await this.drivingSchoolRepository.findAndCount(whereClause);
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
   * View a single driving school
   * @param id
   */
  async findOne(id: number): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // const options: FindOneOptions<DrivingSchool> = {
      //   where: { id, isActive: Status.Active },
      // };
      const result = await this.drivingSchoolRepository.findOne({ where: { id }, relations: ['instructors', 'inspections'] });
      if (result) {
        if (result.docFile) {
          const awsS3bucket = new AttachmentUtils();
          result.docFile = await awsS3bucket.getPreSignedUrl(result.docFile);
        }
        response.data = result;
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
   * Fetch training durations for a driving school
   * @param id
   */
  async trainingDurations(id: number): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      const result = await this.trainingDurationRepository.find({
        where: { drivingSchoolId: id, isActive: Status.Active },
        select: ['id', 'drivingSchoolId', 'duration', 'durationText'],
      });
      if (result) {
        response.data = result;
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
   * Fetch single training duration
   * @param id
   */
  async singleTrainingDuration(id: number): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      const result = await this.trainingDurationRepository.find({
        where: { id: id },
        select: ['id', 'drivingSchoolId', 'duration', 'durationText'],
      });
      if (result) {
        response.data = result;
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
   * Submit driving school application [driving lesson]
   * @param data
   */
  async submitApplication(data: SubmitDrivingSchoolApplicationDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // verify payment
      const payment = await queryRunner.manager.findOne(Payment, {
        where: {
          reference: data.reference,
          type: TransactionType.drivingSchoolApplication,
          status: PaymentStatus.Completed,
          used: Reference.Unused,
        },
      });

      if (!payment) {
        throw new NotFoundException('Payment reference not found or has been used');
      }

      const validateNinResp = await this.authService.verifyNIN(data.nin);
      if (!validateNinResp.success) {
        throw new BadRequestException(MESSAGES.invalidValue('NIN'));
      }

      const validateNin = validateNinResp.data;
      const ninNames = [
        validateNin.firstname.toLowerCase(),
        validateNin.lastname.toLowerCase(),
        validateNin.middlename?.toLowerCase() || '',
      ];
      const suppliedNames: any[] = [
        data.firstName.toLowerCase(),
        data.lastName.toLowerCase(),
        data.middleName?.toLowerCase() || '',
      ];
      const namesMatch = suppliedNames.every((name) => ninNames.includes(name));
      if (!namesMatch) {
        throw new BadRequestException(MESSAGES.ninNameMismatch);
      }

      // Check driving school
      const drivingSchool = await queryRunner.manager.findOne(DrivingSchool, {
        where: { id: data.drivingSchoolId },
      });

      if (!drivingSchool) {
        throw new BadRequestException('Driving School not found');
      }

      // Generate driving school application number
      const applicationNumber = generateDrivingSchoolApplicationNo(drivingSchool);

      if (!data.courseLevel) {
        data.courseLevel = CourseLevel.Beginner;
      }

      const applicantData: any = {
        ...data,
        applicationNo: applicationNumber,
      };

      // Save information using transaction
      const createdApplication = await queryRunner.manager.save(
        DrivingSchoolApplication,
        applicantData,
      );

      // Save attached files using transaction
      if (data.files) {
        await this.saveFileRecordWithQueryRunner(createdApplication.id, data.files, queryRunner);
      }

      // Update payment status using transaction
      await queryRunner.manager.update(
        Payment,
        { id: payment.id },
        { used: Reference.Used, status: PaymentStatus.Used },
      );

      if (applicantData.email) {
        const name = [applicantData.firstName, applicantData.lastName].join(' ');
        await mailer
          .setSubject(MESSAGES.schoolApplicationSubmitted)
          .setMessage(MESSAGES.drivingSchoolApplicantEmail(name, applicantData.applicationNo))
          .setTo(data.email)
          .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
          .sendDefault();
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = {
        applicationId: applicantData.applicationNo,
      };
    } catch (error: any) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      // Release queryRunner
      await queryRunner.release();
    }

    return response;
  }

  /**
   * Update driving school application
   * @param data
   */
  async updateApplication(data: UpdateDrivingSchoolApplicationDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // Check that this application data exists
      const application = await this.drivingSchoolApplicationRepository.findOne({
        where: { id: data.id },
      });

      if (!application) {
        throw new BadRequestException('Application does not exist');
      }

      const applicantData: any = {
        ...data,
        status: Reg.Pending,
        updatedAt: new Date(),
      };
      // Update application data
      await this.drivingSchoolApplicationRepository.update({ id: data.id }, applicantData);

      response.success = true;
      response.message = MESSAGES.recordUpdated;
      response.data = {
        applicationId: application.applicationNo,
        status: application.status,
      };
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }

    return response;
  }

  /**
   * Fetch driving school application
   * @param data
   */
  async checkApplication(data: ApplicationNoDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      const result = await this.drivingSchoolApplicationRepository
        .createQueryBuilder('dsa')
        .where({ applicationNo: data.applicationId })
        .leftJoinAndSelect('dsa.drivingSchool', 'ds')
        .leftJoinAndSelect('dsa.trainingDuration', 'td')
        .leftJoinAndSelect('dsa.applicantFiles', 'af')
        .leftJoinAndSelect('dsa.student', 'student')
        .leftJoinAndSelect('af.file', 'f')
        .select([
          'dsa',
          'student.id',
          'student.studentNo',
          'student.certificateNo',
          'ds.id',
          'ds.identifier',
          'ds.name',
          'ds.address',
          'td.id',
          'td.duration',
          'td.durationText',
          'af',
          'f.id',
          'f.fileName',
          'f.bucketKey',
          'f.bucketName',
          'f.mimeType',
          'f.checksum',
        ])
        .getOne();
      if (result) {
        if (result.applicantFiles) {
          result.applicantFiles = await this.getBaseRecord(result.applicantFiles);
        }
        response.data = result;
        response.success = true;
        response.message = MESSAGES.recordFound;
      } else {
        response.message = MESSAGES.recordNotFound;
      }
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Get applicant details
   * @param applicationId
   */
  async getApplicantDetails(applicationId: number): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      const result = await this.drivingSchoolApplicationRepository
        .createQueryBuilder('dsa')
        .where({ id: applicationId })
        .leftJoinAndSelect('dsa.drivingSchool', 'ds')
        .leftJoinAndSelect('dsa.trainingDuration', 'td')
        .leftJoinAndSelect('dsa.applicantFiles', 'af')
        .leftJoinAndSelect('dsa.student', 'student')
        .leftJoinAndSelect('af.file', 'f')
        .select([
          'dsa',
          'student.id',
          'student.studentNo',
          'student.certificateNo',
          'ds.id',
          'ds.identifier',
          'ds.name',
          'ds.address',
          'td.id',
          'td.duration',
          'td.durationText',
          'af',
          'f.id',
          'f.fileName',
          'f.bucketKey',
          'f.bucketName',
          'f.mimeType',
          'f.checksum',
        ])
        .getOne();
      if (result) {
        if (result.applicantFiles) {
          result.applicantFiles = await this.getBaseRecord(result.applicantFiles);
        }
        response.data = result;
        response.success = true;
        response.message = MESSAGES.recordFound;
      } else {
        response.message = MESSAGES.recordNotFound;
      }
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Approve driving school application
   * @param data
   * @param user
   */
  async changeApplicationStatus(
    data: ActionDrivingSchoolApplicationDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      if (!user.drivingSchoolId) {
        throw new BadRequestException('Sorry! You are not a school administrator!');
      }

      // Fetch application
      const application = await queryRunner.manager.findOne(DrivingSchoolApplication, {
        where: { applicationNo: data.applicationId },
        relations: ['drivingSchool'],
      });

      // If application does not exist, throw error
      if (!application) {
        throw new BadRequestException('Application does not exist');
      }

      // If application was already approved, throw error
      if (application.status == Reg.Approved) {
        throw new BadRequestException('Application already approved');
      }

      // If application not in pending state, throw error.
      // Only threat applications in pending state
      if (application.status == Reg.Queried) {
        throw new BadRequestException('Application already queried and yet to be updated');
      }

      // Generate student number
      const studentNumber = generateStudentNo(application.drivingSchool);

      // transfer records to students table
      const studentData = {
        applicationId: application.id,
        drivingSchoolId: application.drivingSchoolId,
        isActive: Status.Active,
        approvedBy: user.id,
        studentNo: studentNumber,
      };

      // Create student record using transaction
      await queryRunner.manager.insert(Student, studentData);

      // Update application record using transaction
      await queryRunner.manager.update(
        DrivingSchoolApplication,
        {
          id: application.id,
        },
        {
          status: Reg.Approved,
          approvedById: user.id,
          approvedAt: new Date(),
        },
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = 'Application approved successfully';
      response.data = {
        studentNo: studentData.studentNo,
      };
    } catch (error: any) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException(error.message);
    } finally {
      // Release queryRunner
      await queryRunner.release();
    }

    return response;
  }

  /**
   * Issue certificate
   * @param data
   * @param user
   */
  async issueCert(data: IssueCertDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);
    try {
      // Pull student records
      const student = await this.studentRepository.findOne({
        where: { studentNo: data.studentNo },
        relations: ['drivingSchool', 'application.trainingDuration'],
      });
      // If student record doesn't exist, return error
      if (!student) {
        throw new BadRequestException('Student does not exist');
      }
      // If student already has a certificate, return error
      if (student.graduated) {
        throw new BadRequestException('Student already graduated and certificate issued.');
      }
      // If this environment is production, ensure that student has completed training
      if (process.env.NODE_ENV === 'production') {
        if (
          !hasCompletedTraining(student.createdAt, student.application.trainingDuration.duration)
        ) {
          throw new BadRequestException('Student has not completed training duration!');
        }
      }
      // Generate certificate number
      const certificateNo = generateCertificateNo(student);
      // Update student record
      await queryRunner.manager.update(
        Student,
        { id: student.id },
        {
          certificateNo: certificateNo,
          graduated: true,
          modules: data.modules,
          updatedAt: new Date(),
        },
      );

      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'students',
        resourceId: student.id,
        description: `Issued driving school certificate to student ${data.studentNo}`,
        createdAt: new Date(),
      });

      // Commit transaction
      await queryRunner.commitTransaction();

      // send out email notification
      const name = [student.application.firstName, student.application.lastName].join(' ');
      await mailer
        .setSubject(MESSAGES.drivingSchoolCertificate)
        .setMessage(
          MESSAGES.drivingSchoolCertificateBody(
            name,
            student.application.applicationNo,
            certificateNo,
          ),
        )
        .setTo(student.application.email)
        .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
        .sendDefault();

      response.success = true;
      response.message = MESSAGES.recordUpdated;
      response.data = {
        certificateNo: certificateNo,
        studentNo: data.studentNo,
      };
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
   * Validate certificate No
   * @param certificateNo
   */
  async validateCertNo(certificateNo: string): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // Pull student records
      const student = await this.studentRepository.findOne({
        where: { certificateNo: certificateNo },
        relations: ['drivingSchool', 'application.applicantFiles.file'],
      });
      // If student record doesn't exist, return error
      if (!student) {
        throw new BadRequestException('Student with supplied certificate number does not exist');
      }

      if (student.application.applicantFiles) {
        student.application.applicantFiles = await this.getBaseRecord(
          student.application.applicantFiles,
        );
      }

      response.success = true;
      response.message = MESSAGES.recordFound;
      response.data = { ...student, dateOfIssuance: student.updatedAt };
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Get applications stats
   * @param data
   */
  async applicationsStats(
    data: ApplicationStatsDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };

    try {
      const roleId = user.roleId;

      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      let queryBuilder;

      if (roleId === Role.LASDRI_ADMIN) {
        queryBuilder = this.drivingSchoolRepository
          .createQueryBuilder('ds')
          .select([
            'COUNT(*)::int AS "totalApplications"',
            'COUNT(CASE WHEN ds.status = :assignedStatus THEN 1 END)::int AS "totalInspections"',
            'COUNT(CASE WHEN ds.created_at >= :startOfThisMonth THEN 1 END)::int AS "currentMonthTotal"',
            'COUNT(CASE WHEN ds.created_at >= :startOfLastMonth AND ds.created_at < :startOfThisMonth THEN 1 END)::int AS "previousTotal"',
          ])
          .where('ds.status != :approvedStatus', { approvedStatus: Reg.Approved })
          .setParameters({
            startOfLastMonth: startOfLastMonth.toISOString(),
            startOfThisMonth: startOfThisMonth.toISOString(),
            assignedStatus: Reg.Assigned,
          });

      } else if (roleId === Role.SchoolAdmin) {
        queryBuilder = this.drivingSchoolApplicationRepository
          .createQueryBuilder('dsa')
          .select([
            'COUNT(*)::int AS "totalApplications"',
            'COUNT(CASE WHEN dsa.status = :pendingStatus THEN 1 END)::int AS "pendingApplications"',
            'COUNT(CASE WHEN dsa.status = :approvedStatus THEN 1 END)::int AS "acknowledgedApplications"',

            // Stats based on date
            'COUNT(CASE WHEN dsa.created_at >= :startOfThisMonth THEN 1 END)::int AS "currentMonthTotal"',
            'COUNT(CASE WHEN dsa.created_at >= :startOfLastMonth AND dsa.created_at < :startOfThisMonth THEN 1 END)::int AS "previousTotal"',

            'COUNT(CASE WHEN dsa.status = :pendingStatus AND dsa.created_at >= :startOfThisMonth THEN 1 END)::int AS "currentMonthPending"',
            'COUNT(CASE WHEN dsa.status = :pendingStatus AND dsa.created_at >= :startOfLastMonth AND dsa.created_at < :startOfThisMonth THEN 1 END)::int AS "previousPending"',

            'COUNT(CASE WHEN dsa.status = :approvedStatus AND dsa.created_at >= :startOfThisMonth THEN 1 END)::int AS "currentMonthApproved"',
            'COUNT(CASE WHEN dsa.status = :approvedStatus AND dsa.created_at >= :startOfLastMonth AND dsa.created_at < :startOfThisMonth THEN 1 END)::int AS "previousApproved"',
          ])
          .where('dsa.drivingSchoolId = :drivingSchoolId', {
            drivingSchoolId: user.drivingSchoolId,
          })
          .setParameters({
            startOfLastMonth: startOfLastMonth.toISOString(),
            startOfThisMonth: startOfThisMonth.toISOString(),
            pendingStatus: Reg.Pending,
            approvedStatus: Reg.Approved,
          });
      }

      const stats = await queryBuilder.getRawOne();

      // All-time totals
      const totalApplications = Number(stats.totalApplications || 0);
      const totalInspections = Number(stats.totalInspections || 0);
      const pendingApplications = Number(stats.pendingApplications || 0);
      const acknowledgedApplications = Number(stats.acknowledgedApplications || 0);

      // Monthly breakdowns
      const currentMonthTotal = Number(stats.currentMonthTotal || 0);
      const previousTotal = Number(stats.previousTotal || 0);

      const currentMonthPending = Number(stats.currentMonthPending || 0);
      const previousPending = Number(stats.previousPending || 0);

      const currentMonthApproved = Number(stats.currentMonthApproved || 0);
      const previousApproved = Number(stats.previousApproved || 0);

      const data: DrivingSchoolApplicationStatsDto = {
        totalApplications,
        totalInspections,
        pendingApplications,
        acknowledgedApplications,

        totalApplicationsStats: {
          value: currentMonthTotal - previousTotal,
          changePercentage: previousTotal === 0 ? 100 : ((currentMonthTotal - previousTotal) / previousTotal) * 100,
          isUp: currentMonthTotal > previousTotal,
        },

        pendingApplicationsStats: {
          value: currentMonthPending - previousPending,
          changePercentage: previousPending === 0 ? 100 : ((currentMonthPending - previousPending) / previousPending) * 100,
          isUp: currentMonthPending > previousPending,
        },

        acknowledgedApplicationsStats: {
          value: currentMonthApproved - previousApproved,
          changePercentage: previousApproved === 0 ? 100 : ((currentMonthApproved - previousApproved) / previousApproved) * 100,
          isUp: currentMonthApproved > previousApproved,
        },
      };

      response.success = true;
      response.message = MESSAGES.recordFound;
      response.data = data;

    } catch (error: any) {
      console.error(error);
      response.message = error.message;
    }

    return response;
  }

  /**
   * Get list of applications with filters
   * @param data
   * @param user
   */
  async applicationsList(
    data: ListApplicationsDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;
    const roleId = user.roleId;

    const queryBuilder = this.drivingSchoolApplicationRepository.createQueryBuilder(
      'driving_school_applications',
    );

    if (roleId === Role.SchoolAdmin) {
      queryBuilder.andWhere(`driving_school_applications.drivingSchoolId = :drivingSchoolId`, {
        drivingSchoolId: user.drivingSchoolId,
      });
    }

    if (data.regStatus) {
      queryBuilder.andWhere(`driving_school_applications.status = :status`, {
        status: data.regStatus,
      });
    }
    if (data.createdAtStart && data.createdAtEnd) {
      queryBuilder.andWhere(`driving_school_applications.createdAt BETWEEN :start AND :end`, {
        start: data.createdAtStart,
        end: data.createdAtEnd,
      });
    }
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('driving_school_applications.applicationNo LIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('driving_school_applications.firstName LIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('driving_school_applications.lastName LIKE :search', { search: `%${search}%` })
            .orWhere('driving_school_applications.reference LIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('driving_school_applications.email LIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('driving_school_applications.phone LIKE :search', {
              search: `%${search}%`,
            }); // Added wildcards
        }),
      );
    }
    // Apply pagination and ordering
    queryBuilder.skip(offset);
    queryBuilder.take(limit);
    queryBuilder.orderBy('driving_school_applications.id', 'DESC');

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
   * Get application details
   * @param drivingSchoolId
   */
  async getSingleApplication(drivingSchoolId: number): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // Get application details
      const application = await this.drivingSchoolRepository.findOne({
        where: { id: drivingSchoolId },
        relations: ['officer', 'instructors'],
        select: {
          officer: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      });

      if (!application) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }

      response.success = true;
      response.message = MESSAGES.recordFound;
      response.data = application;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Get students stats
   * @param data
   */
  async studentsStats(data: FetchStudentListDto, user: AuthUserInfo): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };

    try {
      const stats: any = {};

      const roleId = user.roleId;

      const condition: any = {};
      if (roleId !== Role.LASDRI_ADMIN) {
        condition.drivingSchoolId = user.drivingSchoolId;
      }

      stats.totalRegisteredStudents = await this.studentRepository.count({ where: condition });
      if (!data.graduated || (data.graduated && +data.graduated == 0)) {
        stats.ongoingStudents = await this.studentRepository.count({
          where: { ...condition, graduated: false },
        });
      }
      if (!data.graduated || (data.graduated && +data.graduated == 1)) {
        stats.certifiedStudents = await this.studentRepository.count({
          where: { ...condition, graduated: true },
        });
      }
      response.data = stats;
      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Get the list of all students
   * @param data
   * @param user
   */
  async studentsList(data: FetchStudentListDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    const roleId = user.roleId;

    const condition: any = {};

    if (roleId !== Role.LASDRI_ADMIN) {
      condition.drivingSchoolId = user.drivingSchoolId;
    }

    try {
      const queryBuilder = this.studentRepository
        .createQueryBuilder('students')
        .leftJoinAndSelect('students.application', 'applications')
        .where(condition);

      if (data.graduated !== undefined) {
        const graduated = data.graduated === '1';
        queryBuilder.andWhere('students.graduated = :graduated', { graduated });
      }

      if (search) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('students.studentNo ILIKE :search', { search: `%${search}%` }).orWhere(
              'students.certificateNo ILIKE :search',
              { search: `%${search}%` },
            );
          }),
        );
      }

      // Apply pagination and ordering
      queryBuilder.skip(offset);
      queryBuilder.take(limit);
      queryBuilder.orderBy('students.id', 'DESC');

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
      console.log(user.id);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Get student details
   * @param studentNo
   */
  async studentDetails(studentNo: string): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // Get student data
      const student = await this.studentRepository.findOne({
        where: { studentNo: studentNo },
        relations: ['drivingSchool', 'permit', 'application.applicantFiles.file'],
      });
      if (!student) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }
      response.success = true;
      response.message = MESSAGES.recordFound;
      response.data = student;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Register student
   * @param data
   * @param user
   */
  async registerStudent(
    data: SubmitDrivingSchoolApplicationDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      // verify payment
      const payment = await this.paymentRepository.findOne({
        where: {
          reference: data.reference,
          type: TransactionType.drivingSchoolApplication,
          status: PaymentStatus.Completed,
          used: Reference.Unused,
        },
      });

      if (!payment) {
        throw new NotFoundException('Payment reference not found or has been used');
      }

      const validateNinResp = await this.authService.verifyNIN(data.nin);
      if (!validateNinResp.success) {
        throw new BadRequestException(MESSAGES.invalidValue('NIN'));
      }

      const validateNin = validateNinResp.data;
      const ninNames = [
        validateNin.firstname.toLowerCase(),
        validateNin.lastname.toLowerCase(),
        validateNin.middlename?.toLowerCase() || '',
      ];
      const suppliedNames: any[] = [
        data.firstName.toLowerCase(),
        data.lastName.toLowerCase(),
        data.middleName?.toLowerCase() || '',
      ];
      const namesMatch = suppliedNames.every((name) => ninNames.includes(name));
      if (!namesMatch) {
        throw new BadRequestException(MESSAGES.ninNameMismatch);
      }
      // Ensure that admin onboarding student is from same school
      if (user.drivingSchoolId !== data.drivingSchoolId) {
        throw new BadRequestException('You are not authorized to onboard for this school!');
      }
      // Check the school exists
      const school = await this.drivingSchoolRepository.findOneBy({ id: data.drivingSchoolId });
      if (!school) {
        throw new BadRequestException('Driving School not found');
      }
      if (!data.courseLevel) {
        data.courseLevel = CourseLevel.Beginner;
      }
      // Generate driving school application number
      const applicationNumber = generateDrivingSchoolApplicationNo(school);
      const applicantData: any = {
        ...data,
        applicationNo: applicationNumber,
      };
      // Save information
      const createdApplication =
        await this.drivingSchoolApplicationRepository.insert(applicantData);
      // Save attached files
      if (data.files) {
        await this.saveFileRecord(createdApplication.raw[0].id, data.files);
      }
      // Update payment status
      await this.paymentRepository.update(
        { id: payment.id },
        { used: Reference.Used, status: PaymentStatus.Used },
      );
      // Create student record
      const studentResp = await this.changeApplicationStatus(
        {
          applicationId: applicantData.applicationNo,
          status: Reg.Approved,
        },
        user,
      );

      if (!studentResp.success) {
        response.message =
          'Application was created but failed to create student record for some reasons. Attached is application ID to continue the process.';
        response.data = {
          applicationId: applicantData.applicationNo,
        };
        return response;
      }

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = {
        applicationId: applicantData.applicationNo,
        studentNo: studentResp.data.studentNo,
      };
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
  async saveFileRecord(id: number, files: FileInterface[]) {
    for (const file of files) {
      await this.applicantFileRepository.save({
        drivingSchoolApplication: { id },
        file: { id: file.fileId },
        documentType: file.documentType,
      });
    }
  }

  async saveFileRecordWithQueryRunner(
    id: number,
    files: FileInterface[],
    queryRunner: QueryRunner,
  ) {
    for (const file of files) {
      await queryRunner.manager.save(ApplicantFile, {
        drivingSchoolApplication: { id },
        file: { id: file.fileId },
        documentType: file.documentType,
      });
    }
  }

  /**
   * Append base64 (only for single record)
   * @param files
   */
  async getBaseRecord(files: any[]) {
    for (const file of files) {
      if (file.file.bucketKey) {
        const awsS3bucket = new AttachmentUtils();
        file.file.base64String = await awsS3bucket.getPreSignedUrl(file.file.bucketKey);
      }
    }
    return files;
  }

  async getLasdriStats(user: AuthUserInfo): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };
    try {
      const stateId = Number(user.stateId);

      const result = await this.drivingSchoolRepository
        .createQueryBuilder('drivingSchool')
        .select([
          'COUNT(*) AS "totalSchools"',
          'SUM(CASE WHEN drivingSchool.isActive = :active THEN 1 ELSE 0 END) AS "activeSchools"',
          'SUM(CASE WHEN drivingSchool.isActive = :probation THEN 1 ELSE 0 END) AS "probationSchools"',
          'SUM(CASE WHEN drivingSchool.isActive = :suspended THEN 1 ELSE 0 END) AS "suspendedSchools"',
        ])
        .where('drivingSchool.stateId = :stateId', { stateId })
        .setParameters({
          active: Status.Active,
          probation: Status.Probation,
          suspended: Status.Suspended,
        })
        .getRawOne();

      response.data = {
        totalSchools: parseInt(result.totalSchools) || 0,
        activeSchools: parseInt(result.activeSchools) || 0,
        probationSchools: parseInt(result.probationSchools) || 0,
        suspendedSchools: parseInt(result.suspendedSchools) || 0,
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

  async getDrivingSchoolList(query: DirivinSchoolListRequestsDto) {
    const dbQuery: Record<string, any> = {};

    if (query.name) {
      dbQuery.name = ILike(`%${query.name}%`);
    }

    if (query.identifier) {
      dbQuery.identifier = ILike(`%${query.identifier}%`);
    }

    if (query.email) {
      dbQuery.email = ILike(`%${query.email}%`);
    }

    if (query.phone) {
      dbQuery.phone = ILike(`%${query.phone}%`);
    }

    if (query.status !== undefined) {
      dbQuery.isActive = query.status;
    }

    const [records, count] = await this.drivingSchoolRepository.findAndCount({
      where: { ...dbQuery },
      ...addPaging(query.take, query.page),
      order: { createdAt: query.order },
    });

    return {
      records,
      total: count,
    };
  }

  async assignLasdriOfficer(
    data: AssignOfficerDto,
    user: AuthUserInfo,
  ): Promise<RequestResultInterface> {
    const response = { success: false, message: '' };
    const queryRunner = await beginTransaction(this.dataSource);
    let officer: User;
    let application: DrivingSchool;

    try {
      // Fetch the application
      application = await queryRunner.manager.findOne(DrivingSchool, {
        where: { id: data.drivingSchoolId },
      });

      if (!application) {
        throw new NotFoundException(MESSAGES.recordNotFound);
      }

      // Check if the application is already approved
      if (application.status === Reg.Approved) {
        throw new BadRequestException('Application is already approved');
      }

      // Fetch the officer
      officer = await queryRunner.manager.findOne(User, {
        where: { id: data.officerId, roleId: Role.LASDRI },
      });

      if (!officer) {
        throw new NotFoundException('Assigned officer not found');
      }

      // Update application status and assign officer
      application.status = Reg.Assigned;
      application.officerId = officer.id;
      application.inspectionDate = data.inspectionDate;

      // add 7 working days to inspection date to determine inspection end date
      application.inspectionEndDate = addBusinessDays(data.inspectionDate, 7);
      await queryRunner.manager.save(application);

      // Create audit trail
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'driving_schools',
        resourceId: data.drivingSchoolId,
        description: `Assigned inspector to driving school`,
        createdAt: new Date(),
      });

      // Commit the transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = 'LASDRI officer successfully assigned';
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.error('An error occurred while assigning the officer:', error);
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }

    try {
      // Send notification to LASDRI office
      await mailer
        .setSubject(MESSAGES.newApplicationAssigned)
        .setMessage(
          MESSAGES.newApplicationAssignedEmailBody(officer.firstName, application.identifier),
        )
        .setTo(officer.email)
        .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
        .sendDefault();
    } catch (emailError) {
      console.error('Failed to send email to LASDRI officer:', emailError);
    }

    try {
      // Send notification to Driving School
      await mailer
        .setSubject(MESSAGES.lasdriOfficerAssigned)
        .setMessage(MESSAGES.applicationApprovedEmailBody())
        .setTo(application.email)
        .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
        .sendDefault();
    } catch (emailError) {
      console.error('Failed to send email to Driving School:', emailError);
    }

    return response;
  }

  async completeApplication(data: CompleteSchoolApplicationDto, user: AuthUserInfo) {
    const response = { success: false, message: '' };
    const { instructorIDs, drivingSchoolId, ...res } = data;

    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const schoolId = drivingSchoolId ? data.drivingSchoolId : user.drivingSchoolId;
      const updateResult = await queryRunner.manager.update(
        DrivingSchool,
        { id: schoolId },
        {
          ...res,
          status: Reg.Pending,
        },
      );

      if (updateResult.affected === 0) {
        response.message = 'No pending application found for this user';
        return response;
      }

      // Update instructors to be linked to the driving school
      if (data.instructorIDs && data.instructorIDs.length > 0) {
        // Find instructors by their IDs
        const instructors = await queryRunner.manager.find(DrivingSchoolInstructor, {
          where: { instructorId: In(instructorIDs) },
        });

        if (instructors.length !== instructorIDs.length) {
          const foundInstructorIDs = instructors.map((instructor) => instructor.instructorId);
          const notFoundInstructorIDs = instructorIDs.filter(
            (id) => !foundInstructorIDs.includes(id),
          );

          response.message = `Some instructors were not found: ${notFoundInstructorIDs.join(', ')}`;
          return response;
        }

        await queryRunner.manager.update(
          DrivingSchoolInstructor,
          { instructorId: In(instructorIDs) },
          { drivingSchoolId: schoolId },
        );
      }

      await queryRunner.commitTransaction();
      response.success = true;
      response.message = 'Application completed successfully';
      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      response.message = 'An error occurred while completing the application';
      console.error(error);
      return response;
    } finally {
      await queryRunner.release();
    }
  }

  async toggleDrivingSchoolStatus(
    id: number,
    data: toggleSchoolStatusDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };

    const queryRunner = await beginTransaction(this.dataSource);
    try {
      const drivingSchool = await queryRunner.manager.findOne(DrivingSchool, {
        where: { id },
      });

      if (!drivingSchool) {
        throw new BadRequestException('Driving School not found');
      }

      drivingSchool.isActive = data.status;
      // update reason for suspension if status is suspended
      if (data.status === Status.Suspended) {
        drivingSchool.reasonForSuspension = data.reason;
      }

      await queryRunner.manager.save(drivingSchool);

      // Update associated user account if not probation
      if (data.status !== Status.Probation) {
        await queryRunner.manager.update(User, { drivingSchoolId: id }, { isActive: data.status });
      }

      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'driving_schools',
        resourceId: id,
        description: `Updated driving school status to ${data.status}`,
        createdAt: new Date(),
      });

      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
    return response;
  }

  async drivingSchoolInspections(drivingSchoolId: number, data: listDrivingSchoolInspectionsDto) {
    const response = { success: false, message: '', data: null };

    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    try {
      const queryBuilder = this.inspectionRepository
        .createQueryBuilder('inspections')
        .where('inspections.drivingSchoolId = :drivingSchoolId', { drivingSchoolId })
        .leftJoinAndSelect('inspections.drivingSchool', 'drivingSchool')
        .select([
          'inspections',
          'drivingSchool.identifier',
          'drivingSchool.name',
          'drivingSchool.email',
          'drivingSchool.phone',
        ])
        .orderBy('inspections.createdAt', data.order)
        .skip(offset)
        .take(limit);

      if (data.status) {
        queryBuilder.andWhere(`inspections.status = :status`, {
          status: data.status,
        });
      }

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

  async confirmApplicationPayment(
    paymentRef: string,
    user: AuthUserInfo,
  ): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };

    const queryRunner = await beginTransaction(this.dataSource);
    try {
      const payment = await queryRunner.manager.findOne(Payment, {
        where: { reference: paymentRef, type: TransactionType.drivingSchoolCompletionPayment },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Check if payment is not completed
      if (payment.status !== PaymentStatus.Completed) {
        throw new BadRequestException('Payment is not completed');
      }

      const application = await queryRunner.manager.findOne(DrivingSchool, {
        where: { id: user.drivingSchoolId },
      });

      if (!application) {
        throw new NotFoundException('Driving school application not found');
      }

      // Update driving school reference
      application.reference = paymentRef;
      await queryRunner.manager.save(application);

      // Update payment status
      payment.used = Reference.Used;
      payment.status = PaymentStatus.Used;
      await queryRunner.manager.save(payment);

      // Create audit trail
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'driving_schools',
        resourceId: application.id,
        description: `Payment confirmed for driving school with identifier number: ${application.identifier} with payment reference ${paymentRef}`,
        createdAt: new Date(),
      });

      // Send email notification to driving school
      await mailer
        .setSubject(MESSAGES.applicationPaymentConfirmed)
        .setMessage(
          MESSAGES.applicationPaymentConfirmedEmailBody(
            application.name,
            application.email,
            application.phone,
          ),
        )
        .setTo(application.email)
        .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
        .sendDefault();

      // Commit the transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = 'Payment confirmed successfully';
      response.data = {
        paymentReference: payment.reference,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  async queryApplication(drivingSchoolId: number, reasonForQuerying: string, user: AuthUserInfo) {
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const application = await queryRunner.manager.findOne(DrivingSchool, {
        where: { id: drivingSchoolId },
      });

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      // Update application status
      application.status = Reg.Queried;
      await queryRunner.manager.save(application);

      // Save query record to query history table
      await queryRunner.manager.insert(DrivingSchoolApplicationQuery, {
        application: { id: drivingSchoolId },
        reason: reasonForQuerying,
        queriedById: user.id,
      });

      // Create audit trail
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'driving_schools',
        resourceId: application.id,
        description: `Application queried for driving school ID ${drivingSchoolId} for reason: ${reasonForQuerying}`,
        createdAt: new Date(),
      });

      // Send email notification to driving school
      await mailer
        .setSubject(MESSAGES.applicationQueried)
        .setMessage(MESSAGES.applicationQueriedEmailBody(reasonForQuerying))
        .setTo(application.email)
        .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
        .sendDefault();

      // Commit the transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = 'Application queried successfully';
      response.data = {
        applicationId: application.id,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  async requestInspection(user: AuthUserInfo): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };

    try {
      const application = await this.drivingSchoolRepository.findOne({
        where: { id: user.drivingSchoolId },
      });

      if (!application) {
        throw new NotFoundException(MESSAGES.recordNotFound);
      }

      application.status = Reg.Revalidated;
      await this.drivingSchoolRepository.save(application);

      response.success = true;
      response.message = MESSAGES.inspectionRequested;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  async dashboardStats(data: FetchDashboardStatsRequestDto) {
    const statisticsType = data.type;

    switch (statisticsType) {
      case StatisticsFilter.DrivingSchools:
        return this.getDrivingSchoolDashboardStats();

      case StatisticsFilter.Students:
        return this.getStudentDashboardStats();

      case StatisticsFilter.LASDRIOfficers:
        return this.getLASDRIROLEDashboardStats();

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

  async getDrivingSchoolDashboardStats() {
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(now.getMonth() - 1);

    const stats = await this.drivingSchoolRepository
      .createQueryBuilder('app')
      .select('COUNT(*)::int', 'totalApplications')
      .addSelect(`SUM(CASE WHEN app.status = :approved THEN 1 ELSE 0 END)::int`, 'totalApproved')
      .addSelect(`SUM(CASE WHEN app.status = :pending THEN 1 ELSE 0 END)::int`, 'totalPending')
      .addSelect(`SUM(CASE WHEN app.status = :initiated THEN 1 ELSE 0 END)::int`, 'totalInitiated')
      .addSelect(`SUM(CASE WHEN app.status = :queried THEN 1 ELSE 0 END)::int`, 'totalQueried')
      .addSelect(`SUM(CASE WHEN app.status = :assigned THEN 1 ELSE 0 END)::int`, 'totalAssigned')
      .addSelect(
        `SUM(CASE WHEN app.status = :revalidated THEN 1 ELSE 0 END)::int`,
        'totalRevalidated',
      )

      // Current month
      .addSelect(
        `SUM(CASE WHEN app.status = :initiated AND app.createdAt >= :lastMonth THEN 1 ELSE 0 END)::int`,
        'monthlyInitiated',
      )
      .addSelect(
        `SUM(CASE WHEN app.status = :pending AND app.createdAt >= :lastMonth THEN 1 ELSE 0 END)::int`,
        'monthlyPending',
      )
      .addSelect(
        `SUM(CASE WHEN app.status = :approved AND app.createdAt >= :lastMonth THEN 1 ELSE 0 END)::int`,
        'monthlyApproved',
      )
      .addSelect(
        `SUM(CASE WHEN app.status = :queried AND app.createdAt >= :lastMonth THEN 1 ELSE 0 END)::int`,
        'monthlyQueried',
      )
      .addSelect(
        `SUM(CASE WHEN app.status = :revalidated AND app.createdAt >= :lastMonth THEN 1 ELSE 0 END)::int`,
        'monthlyRevalidated',
      )

      // Previous month
      .addSelect(
        `SUM(CASE WHEN app.status = :initiated AND app.createdAt < :lastMonth THEN 1 ELSE 0 END)::int`,
        'lastMonthInitiated',
      )
      .addSelect(
        `SUM(CASE WHEN app.status = :pending AND app.createdAt < :lastMonth THEN 1 ELSE 0 END)::int`,
        'lastMonthPending',
      )
      .addSelect(
        `SUM(CASE WHEN app.status = :approved AND app.createdAt < :lastMonth THEN 1 ELSE 0 END)::int`,
        'lastMonthApproved',
      )
      .addSelect(
        `SUM(CASE WHEN app.status = :queried AND app.createdAt < :lastMonth THEN 1 ELSE 0 END)::int`,
        'lastMonthQueried',
      )
      .addSelect(
        `SUM(CASE WHEN app.status = :revalidated AND app.createdAt < :lastMonth THEN 1 ELSE 0 END)::int`,
        'lastMonthRevalidated',
      )

      .setParameters({
        approved: Reg.Approved,
        pending: Reg.Pending,
        initiated: Reg.Initiated,
        queried: Reg.Queried,
        assigned: Reg.Assigned,
        revalidated: Reg.Revalidated,
        lastMonth,
      })
      .getRawOne();

    const [totalInspections, totalRequests] = await Promise.all([
      this.inspectionRepository.count(),
      stats.totalApplications,
    ]);

    const rawDistribution = await this.drivingSchoolRepository
      .createQueryBuilder('school')
      .select('school.is_active', 'status')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('school.is_active')
      .getRawMany();

    const statusMap = {
      [Status.Active]: 'Active',
      [Status.Probation]: 'Probation',
      [Status.Suspended]: 'Suspended',
      [Status.Inactive]: 'Inactive',
    };

    const drivingSchoolDistributionByStatus = rawDistribution.map((entry) => ({
      label: statusMap[entry.status],
      value: Number(entry.count),
    }));

    const distributionByLgaId = await this.drivingSchoolRepository
      .createQueryBuilder('school')
      .select('school.lgaId', 'lgaId')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('school.lgaId')
      .getRawMany();

    const drivingSchoolDistributionByLga = distributionByLgaId.map((entry) => {
      const lga = lgas.find((l) => l.id === Number(entry.lgaId));
      return {
        lga: lga?.name ?? `Unknown (${entry.lgaId})`,
        count: Number(entry.count),
      };
    });

    return {
      applicationStats: {
        totalApplications: stats.totalApplications,
        totalApproved: stats.totalApproved,
        totalPending: stats.totalPending,
        totalInitiated: stats.totalInitiated,
        totalQueried: stats.totalQueried,
        totalRevalidated: stats.totalRevalidated,
        totalAssigned: stats.totalAssigned,
      },
      monthlyChange: {
        initiated: calculateChange(stats.monthlyInitiated, stats.lastMonthInitiated),
        pending: calculateChange(stats.monthlyPending, stats.lastMonthPending),
        approved: calculateChange(stats.monthlyApproved, stats.lastMonthApproved),
        queried: calculateChange(stats.monthlyQueried, stats.lastMonthQueried),
        revalidated: calculateChange(stats.monthlyRevalidated, stats.lastMonthRevalidated),
      },
      applicationDistribution: {
        inspections: totalInspections,
        requests: totalRequests,
      },
      drivingSchoolDistributionByLga,
      drivingSchoolDistributionByStatus,
    };
  }

  async getStudentDashboardStats() {
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(now.getMonth() - 1);

    const stats = await this.studentRepository
      .createQueryBuilder('student')
      .select('COUNT(*)::int', 'totalStudents')
      .addSelect(
        `SUM(CASE WHEN student.graduated = true THEN 1 ELSE 0 END)::int`,
        'certifiedStudents',
      )
      .addSelect(
        `SUM(CASE WHEN student.graduated = false THEN 1 ELSE 0 END)::int`,
        'registeredStudents',
      )
      .getRawOne();

    const distributionByAgeGroup = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.application', 'application')
      .select([
        `CASE 
      WHEN date_part('year', age(to_date(application.date_of_birth, 'DD-MM-YYYY'))) BETWEEN 18 AND 25 THEN 'Young Adults'
      WHEN date_part('year', age(to_date(application.date_of_birth, 'DD-MM-YYYY'))) BETWEEN 26 AND 35 THEN 'Early Career Adults'
      WHEN date_part('year', age(to_date(application.date_of_birth, 'DD-MM-YYYY'))) BETWEEN 36 AND 45 THEN 'Mid-Age Adults'
      WHEN date_part('year', age(to_date(application.date_of_birth, 'DD-MM-YYYY'))) BETWEEN 46 AND 55 THEN 'Mature Adults'
      WHEN date_part('year', age(to_date(application.date_of_birth, 'DD-MM-YYYY'))) >= 56 THEN 'Pre-Retirement'
      ELSE 'Unknown'
    END AS ageGroup`,
        'COUNT(*)::int AS count',
      ])
      .groupBy('ageGroup')
      .getRawMany();

    const distributionByGender = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.application', 'application')
      .select([
        `CASE 
      WHEN application.genderId = ${genders.find((g) => g.name === 'Male')?.id} THEN 'Male'
      WHEN application.genderId = ${genders.find((g) => g.name === 'Female')?.id} THEN 'Female'
      ELSE 'Unknown'
      END AS gender`,
        'COUNT(*)::int AS count',
      ])
      .groupBy('gender')
      .getRawMany();

    const distributionByLgaId = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.application', 'application')
      .select('application.lgaOfOriginId', 'lgaOfOriginId')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('application.lgaOfOriginId')
      .getRawMany();

    const studentDistributionByLga = distributionByLgaId.map((entry) => {
      const lga = lgas.find((l) => l.id === Number(entry.lgaOfOriginId));

      return {
        lga: lga?.name ?? `Unknown (${entry.lgaOfOriginId})`,
        count: Number(entry.count),
      };
    });

    return {
      studentStats: stats,
      distributionByAgeGroup,
      distributionByGender,
      studentDistributionByLga,
    };
  }

  async getLASDRIROLEDashboardStats() {
    const result = await this.userRepository
      .createQueryBuilder('users')
      .select('COUNT(*)', 'total')
      .addSelect(`COUNT(CASE WHEN users."is_active" = ${Status.Active} THEN 1 END)`, 'active')
      .addSelect(`COUNT(CASE WHEN users."is_active" = ${Status.Inactive} THEN 1 END)`, 'inactive')
      .where('users."role_id" = :lasdriRoleId', { lasdriRoleId: Role.LASDRI })
      .getRawOne();

    const stats = {
      total: Number(result.total),
      active: Number(result.active),
      inactive: Number(result.inactive),
    };

    // distributionByAgeGroup: user entity dont have age or date of birth field

    // distributionByGender user dont have gender or genderId field

    const distributionByLgaId = await this.userRepository
      .createQueryBuilder('users')
      .select('users.lgaId', 'lgaId')
      .addSelect('COUNT(*)::int', 'count')
      .where('users."role_id" = :lasdriRoleId', { lasdriRoleId: Role.LASDRI })
      .groupBy('users.lgaId')
      .getRawMany();

    const lasdriOfficerDistributionByLga = distributionByLgaId.map((entry) => {
      const lga = lgas.find((l) => l.id === Number(entry.lgaId));

      return {
        lga: lga?.name ?? `Unknown (${entry.lgaId})`,
        count: Number(entry.count),
      };
    });

    return {
      stats,
      lasdriOfficerDistributionByLga,
    };
  }

  async getRevenueDashboardStats(
    selectedYear: number = new Date().getFullYear(),
    topLgaCount: number = 5,
    bottomLgaCount: number = 5,
  ) {
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(now.getMonth() - 1);

    const allowedTypes = [
      TransactionType.drivingSchoolCompletionPayment,
      TransactionType.drivingSchoolApplication,
      TransactionType.inspectionFee,
    ];

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
        start: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
        end: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0),
      })
      .groupBy('transactions.itemType')
      .getRawMany();

    const lastMap = new Map<string, number>();
    lastStats.forEach((entry) => {
      lastMap.set(entry.itemType, parseFloat(entry.totalAmount));
    });

    // === MERGE + CALCULATE PERCENTAGE CHANGE ===
    const revenueByType = allowedTypes.map((type) => {
      const currentAmount = currentMap.get(type) || 0;
      const lastAmount = lastMap.get(type) || 0;

      const percentageChange = calculateChange(currentAmount, lastAmount);

      const label = (() => {
        switch (type) {
          case TransactionType.drivingSchoolApplication:
            return 'Student Registration';
          case TransactionType.drivingSchoolCompletionPayment:
            return 'Application Fee';
          case TransactionType.inspectionFee:
            return 'Inspection Fee';
          default:
            return 'Unknown';
        }
      })();

      return {
        itemType: label,
        amount: currentAmount,
        percentageChange,
      };
    });

    const revenueStatsRaw = await this.paymentRepository
      .createQueryBuilder('payment')
      .select(`EXTRACT(MONTH FROM payment.createdAt)`, 'month')
      .addSelect(`SUM(payment.amount)::float`, 'totalRevenue')
      .where(`EXTRACT(YEAR FROM payment.createdAt) = :year`, { year: selectedYear })
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

    // === TOTAL REVENUE ===
    const totalRevenue = revenueByType.reduce((acc, entry) => acc + entry.amount, 0);

    // === DISTRIBUTION BY ITEM TYPE ===
    const distributionByItemType = allowedTypes.map((type) => {
      const amount = currentMap.get(type) || 0;
      const percentage = totalRevenue > 0 ? Number(((amount / totalRevenue) * 100).toFixed(1)) : 0;

      const label = (() => {
        switch (type) {
          case TransactionType.drivingSchoolApplication:
            return 'Student Registration';
          case TransactionType.drivingSchoolCompletionPayment:
            return 'Application Fee';
          case TransactionType.inspectionFee:
            return 'Inspection Fee';
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

    // === DISTRIBUTION BY LGA ===
    // Top 5
    const topLgaRevenueStats = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin(
        PreRegistration,
        'preReg',
        'payment.item_type = :preType AND payment.reference = preReg.reference',
        { preType: TransactionType.preRegistration },
      )
      .leftJoin(
        DrivingSchoolApplication,
        'application',
        'payment.item_type IN (:...dsTypes) AND payment.reference = application.reference',
        { dsTypes: [TransactionType.drivingSchoolApplication, TransactionType.inspectionFee] },
      )
      .leftJoin(
        DrivingSchool,
        'school',
        'school.id = COALESCE(preReg.driving_school_id, application.driving_school_id)',
      )
      .select('school.lga_id', 'lgaId')
      .addSelect('COUNT(payment.id)', 'paymentCount')
      .where('payment.status = :status', { status: PaymentStatus.Completed })
      .andWhere('payment.refunded = false')
      .andWhere('payment.item_type IN (:...allowedTypes)', { allowedTypes })
      .groupBy('school.lga_id')
      .orderBy('"paymentCount"', 'DESC')
      .limit(topLgaCount)
      .getRawMany();

    // Bottom 5
    const bottomLgaRevenueStats = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin(
        PreRegistration,
        'preReg',
        'payment.item_type = :preType AND payment.reference = preReg.reference',
        { preType: TransactionType.preRegistration },
      )
      .leftJoin(
        DrivingSchoolApplication,
        'application',
        'payment.item_type IN (:...dsTypes) AND payment.reference = application.reference',
        { dsTypes: [TransactionType.drivingSchoolApplication, TransactionType.inspectionFee] },
      )
      .leftJoin(
        DrivingSchool,
        'school',
        'school.id = COALESCE(preReg.driving_school_id, application.driving_school_id)',
      )
      .select('school.lga_id', 'lgaId')
      .addSelect('COUNT(payment.id)', 'paymentCount')
      .where('payment.status = :status', { status: PaymentStatus.Completed })
      .andWhere('payment.refunded = false')
      .andWhere('payment.item_type IN (:...allowedTypes)', { allowedTypes })
      .groupBy('school.lga_id')
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

  async listLasdriOfficers(data: BaseRequestDto): Promise<DataResultInterface<UserResponseDto[]>> {
    const response = { success: false, message: '', data: null };
    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    try {
      const queryBuilder = this.userRepository
        .createQueryBuilder('users')
        .where('users.roleId = :roleId', { roleId: Role.LASDRI });

      if (search) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('users.firstName ILIKE :search', { search: `%${search}%` })
              .orWhere('users.lastName ILIKE :search', { search: `%${search}%` })
              .orWhere('users.email ILIKE :search', { search: `%${search}%` })
              .orWhere('users.phone ILIKE :search', { search: `%${search}%` });
          }),
        );
      }

      queryBuilder
        .select([
          'users.id',
          'users.firstName',
          'users.middleName',
          'users.lastName',
          'users.email',
          'users.phone',
          'users.roleId',
          'users.roleName',
          'users.stateId',
          'users.lgaId',
          'users.drivingSchoolId',
          'users.avatar',
          'users.changePasswordNextLogin',
        ])
        .skip(offset)
        .take(limit)
        .orderBy('users.id', 'DESC');

      const [officers, count] = await queryBuilder.getManyAndCount();

      response.success = true;
      response.message = MESSAGES.recordFound;
      response.data = {
        result: officers.map((officer) => plainToInstance(UserResponseDto, officer)),
        pagination: getPagination(count, page, offset, limit),
      };
    } catch (error: any) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
    return response;
  }

  async inspectionRevalidation(user: AuthUserInfo) {
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const application = await queryRunner.manager.findOne(DrivingSchool, {
        where: { id: user.drivingSchoolId },
      });

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      // Update application status
      application.status = Reg.Revalidated;
      await queryRunner.manager.save(application);

      // Create audit trail
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'driving_schools',
        resourceId: application.id,
        description: `Application revalidated for driving school ID ${user.drivingSchoolId}`,
        createdAt: new Date(),
      });

      // Commit the transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = 'Application revalidated successfully';
      response.data = {
        applicationId: application.id,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }

    return response;
  }
}
