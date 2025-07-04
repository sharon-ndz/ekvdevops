import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  AuthUserInfo,
  DataResultInterface,
  GrowthStats,
  LgaDistribution,
  ListInterface,
  SourceDistribution,
} from '../../core/interfaces/all.interface';
import {
  PaymentStatus,
  PermitClassType,
  PermitRequestType,
  Reference,
  Sources,
  TransactionType,
} from '../../core/constants/enums';
import { MESSAGES } from '../../core/constants/messages';
import { NewPermitRequestDto, PermitClassDto } from './permit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { Between, Brackets, DataSource, Repository } from 'typeorm';
import { PaymentService } from '../payment/payment.service';
import { Permit } from '../../entities/permit.entity';
import { getPermitIssuanceData } from '../../core/helpers/general';
import { getPagination } from '../../core/helpers/functions.helpers';
import { auditAction } from '../../core/constants/constants';
import { AuditTrail } from '../../entities/audit-trail.entity';
import { beginTransaction } from '../../core/interfaces/all.dto';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';

@Injectable()
export class PermitService {
  constructor(
    @InjectRepository(Permit)
    private readonly permitRepository: Repository<Permit>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly paymentService: PaymentService,
    @InjectRepository(AuditTrail)
    private readonly auditTrailRepository: Repository<AuditTrail>,
    private dataSource: DataSource,
  ) {}

  /**
   * Get permit stats
   * @param data
   */
  async stats(data: PermitClassDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    try {
      const stats: any = {};
      stats.totalPermits = await this.permitRepository.count();
      if (
        !data.permitClassId ||
        (data.permitClassId && +data.permitClassId == PermitClassType.LearnersPermit)
      ) {
        stats.learnersPermits = await this.permitRepository.count({
          where: { permitClassId: PermitClassType.LearnersPermit },
        });
      }
      if (
        !data.permitClassId ||
        (data.permitClassId && +data.permitClassId == PermitClassType.CoverNote)
      ) {
        stats.coverNotePermits = await this.permitRepository.count({
          where: { permitClassId: PermitClassType.CoverNote },
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
   * Fetches the distribution of permits based on their LGA ID.
   * Groups permits by the 'lgaId' column and counts them.
   * @returns {Promise<LgaDistribution[]>} A promise that resolves to an array of objects,
   * each containing an lgaId and its corresponding count.
   */
  async getDistributionByLga(user: AuthUserInfo): Promise<LgaDistribution[]> {
    try {
      // Use the query builder to create a custom query
      const distribution = await this.permitRepository
        .createQueryBuilder('permit')
        .select('permit.lgaId', 'lgaId')
        .addSelect('COUNT(permit.id)', 'count')
        .where('permit.stateId = :stateId', { stateId: user.stateId })
        .andWhere('permit.lgaId IS NOT NULL')
        .groupBy('permit.lgaId')
        .orderBy('permit.lgaId', 'ASC')
        .getRawMany();

      // Parse the lgaId and count from string/raw type to number
      return distribution
        .map((item) => ({
          lgaId: parseInt(item.lgaId, 10),
          count: parseInt(item.count, 10) || 0,
        }))
        .filter((item) => !isNaN(item.lgaId));
    } catch (error: any) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Calculates permit growth statistics comparing the current month to the previous month.
   * Assumes the Permit entity has a 'createdAt' field inherited from BaseEntity.
   * @returns {Promise<GrowthStats>} A promise resolving to an object with total permits
   * for the current month, percentage difference from the previous month, and growth type.
   */
  async getPermitGrowthStats(user: AuthUserInfo): Promise<GrowthStats> {
    try {
      const now = new Date();

      // Define date ranges for current and previous months
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const previousMonthStart = startOfMonth(subMonths(now, 1));
      const previousMonthEnd = endOfMonth(subMonths(now, 1));

      // Count permits for the current month
      const currentMonthCount = await this.permitRepository.count({
        where: {
          stateId: user.stateId,
          createdAt: Between(currentMonthStart, currentMonthEnd),
        },
      });

      // Count permits for the previous month
      const previousMonthCount = await this.permitRepository.count({
        where: {
          stateId: user.stateId,
          createdAt: Between(previousMonthStart, previousMonthEnd),
        },
      });

      // Calculate percentage difference
      let percentageDifference = 0;
      if (previousMonthCount > 0) {
        percentageDifference =
          ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;
      } else if (currentMonthCount > 0) {
        // If previous month had 0 and current has > 0, consider it infinite growth, often represented as 100% or a large number
        percentageDifference = 100;
      } // If both are 0, difference is 0

      // Determine growth type
      let growthType: 'positive' | 'negative' | 'neutral' = 'neutral';
      if (percentageDifference > 0) {
        growthType = 'positive';
      } else if (percentageDifference < 0) {
        growthType = 'negative';
      }

      // Round percentage difference to 2 decimal places
      percentageDifference = parseFloat(percentageDifference.toFixed(2));

      return {
        total: currentMonthCount,
        percentageDifference: percentageDifference,
        growthType: growthType,
      };
    } catch (error: any) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Fetches the distribution of permits based on their source.
   * Groups permits by the 'source' column and counts them.
   * @returns {Promise<SourceDistribution[]>} A promise that resolves to an array of objects,
   * each containing a source and its corresponding count.
   */
  async getSourceDistribution(user: AuthUserInfo): Promise<SourceDistribution[]> {
    try {
      // Use the query builder to create a custom query
      const distribution = await this.permitRepository
        .createQueryBuilder('permit')
        .where('permit.stateId = :stateId', { stateId: user.stateId })
        .select('permit.source', 'source')
        .addSelect('COUNT(permit.id)', 'count')
        .groupBy('permit.source')
        .getRawMany();

      const formattedDistribution: SourceDistribution[] = distribution.map((item) => ({
        source: item.source,
        count: parseInt(item.count, 10) || 0,
      }));

      const allSources = Object.values(Sources);
      const resultMap = new Map<string, number>();

      // Initialize map with all possible sources and count 0
      allSources.forEach((sourceValue) => {
        resultMap.set(sourceValue, 0);
      });

      // Update counts from the query result
      formattedDistribution.forEach((item) => {
        if (resultMap.has(item.source)) {
          resultMap.set(item.source, item.count);
        }
      });

      // Convert map back to the desired array format
      return Array.from(resultMap.entries()).map(([source, count]) => ({ source, count }));
    } catch (error: any) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Get list of permits with filters
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

    const queryBuilder = this.permitRepository
      .createQueryBuilder('permits')
      .leftJoinAndSelect('permits.student', 'students')
      .select(['permits', 'students.id', 'students.studentNo', 'students.certificateNo']);
    if (data.permitClassId) {
      queryBuilder.where('permits.permitClassId = :permitClassId', {
        permitClassId: data.permitClassId,
      });
    }
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('permits.permitNo ILIKE :search', { search: `%${search}%` }) // Added wildcards
            .orWhere('permits.firstName ILIKE :search', { search: `%${search}%` }) // Added wildcards
            .orWhere('permits.lastName ILIKE :search', { search: `%${search}%` }); // Added wildcards
        }),
      );
    }
    // Apply pagination and ordering
    queryBuilder.skip(offset);
    queryBuilder.take(limit);
    queryBuilder.orderBy('permits.id', 'DESC');

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
   * Get permit details
   * @param permitNo
   */
  async details(permitNo: string): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    try {
      const permit = await this.permitRepository
        .createQueryBuilder('permits')
        .where('permits.permitNo = :permitNo', { permitNo })
        .leftJoinAndSelect('permits.student', 'students')
        .leftJoinAndSelect('students.application', 'dsa')
        .leftJoinAndSelect('dsa.applicantFiles', 'af')
        .leftJoinAndSelect('af.file', 'f')
        .select([
          'permits',
          'students.id',
          'students.studentNo',
          'students.certificateNo',
          'dsa.id',
          'dsa.trainingDurationId',
          'dsa.bloodGroupId',
          'dsa.maritalStatusId',
          'dsa.placeOfBirth',
          'dsa.nextOfKinName',
          'dsa.nextOfKinPhone',
          'dsa.nextOfKinRelationshipId',
          'dsa.nextOfKinNationalityId',
          'dsa.courseLevel',
          'dsa.occupationId',
          'af',
          'f.id',
          'f.fileName',
          'f.bucketKey',
          'f.bucketName',
          'f.mimeType',
          'f.checksum',
        ])
        .getOne();
      if (!permit) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }
      response.success = true;
      response.message = MESSAGES.recordFound;
      response.data = permit;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Issue new permit
   * @param data
   * @param user
   */
  async issuePermit(data: NewPermitRequestDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // verify payment
      const payment = await this.paymentService.findPaymentBy({
        reference: data.reference,
        type: TransactionType.permitIssuance,
        status: PaymentStatus.Completed,
        used: Reference.Unused,
      });

      if (!payment) {
        throw new NotFoundException('Payment reference not found or has been used');
      }

      // Get student data
      const student = await this.studentRepository.findOne({
        where: { studentNo: data.studentNo },
        relations: ['application', 'drivingSchool'],
      });

      if (!student) {
        throw new BadRequestException('Student Record with supplied studentNo not found!');
      }

      // If student has not graduated, don't honor
      if (!student.graduated) {
        throw new BadRequestException('Student yet to complete driving school training');
      }

      // Set permit request type
      data.requestType = PermitRequestType.New;
      const permitData: Permit = await this.buildPermitPayload(data, student, user);

      // Save permit using transaction
      await queryRunner.manager.save(Permit, permitData);

      // Create audit log using transaction
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_ADD,
        tableName: 'permits',
        resourceId: permitData.id,
        description: `Permit issuance with no ${permitData.permitNo} created successfully`,
      });

      // Update payment using transaction
      payment.used = Reference.Used;
      payment.status = PaymentStatus.Used;
      await queryRunner.manager.save(payment);

      // Commit transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = { ...permitData, studentNo: data.studentNo };
    } catch (error: any) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException(error.message);
    } finally {
      // Release transaction
      await queryRunner.release();
    }

    return response;
  }

  /**
   * Build Permit data
   * @param data
   * @param student
   * @param user
   */
  async buildPermitPayload(
    data: NewPermitRequestDto,
    student: Student,
    user: AuthUserInfo,
  ): Promise<Permit> {
    // Get transaction
    const transaction = await this.paymentService.findPaymentBy({
      reference: data.reference,
    });
    const permitIssuanceData = await getPermitIssuanceData(data, this.permitRepository);
    const permitData = new Permit();
    permitData.studentId = student.id;
    permitData.reference = data.reference;
    permitData.transactionId = transaction.id;
    permitData.titleId = student.application.titleId;
    permitData.firstName = student.application.firstName;
    permitData.lastName = student.application.lastName;
    permitData.middleName = student.application.middleName;
    permitData.maidenName = student.application.maidenName;
    permitData.email = student.application.email;
    permitData.phone = student.application.phone;
    permitData.address = student.application.address;
    permitData.dateOfBirth = student.application.dateOfBirth;
    permitData.genderId = student.application.genderId;
    permitData.lgaId = student.drivingSchool.lgaId; // take LGA of the school
    permitData.stateId = student.drivingSchool.stateId; // take State of the school
    permitData.nationalityId = student.application.nationalityId;
    permitData.requestType = data.requestType;
    permitData.years = data.years;
    permitData.permitClassId = data.permitClassId;
    permitData.issuedById = user.id;
    permitData.permitNo = permitIssuanceData.permitNo;
    permitData.issuedAt = permitIssuanceData.issuedAt;
    permitData.expiryAt = permitIssuanceData.expiryAt;
    // create permit entry
    return await this.permitRepository.save(permitData);
  }
}
