import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AuthUserInfo,
  DataResultInterface,
  ListInterface,
} from '../../core/interfaces/all.interface';
import {
  PaymentStatus,
  PermitClassType,
  PermitRequestType,
  Reference,
  TransactionType,
} from '../../core/constants/enums';
import { MESSAGES } from '../../core/constants/messages';
import { NewPermitRequestDto, PermitClassDto } from './permit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { Brackets, Repository } from 'typeorm';
import { PaymentService } from '../payment/payment.service';
import { Permit } from '../../entities/permit.entity';
import { getPermitIssuanceData } from '../../core/helpers/general';
import { getPagination } from '../../core/helpers/functions.helpers';
import { auditAction } from '../../core/constants/constants';
import { AuditTrail } from '../../entities/audit-trail.entity';

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
          'af.id',
          'af.fileId',
          'af.documentType',
          'af.drivingSchoolApplicationId',
          'f',
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
      // Create audit log
      await this.auditTrailRepository.insert({
        userId: user.id,
        dbAction: auditAction.RECORD_ADD,
        tableName: 'permits',
        resourceId: permitData.id,
        description: `Permit issuance with no ${permitData.permitNo} created successfully`,
      });
      // Update payment
      payment.used = Reference.Used;
      payment.status = PaymentStatus.Used;
      await this.paymentService.update(payment.id, payment);

      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = { ...permitData, studentNo: data.studentNo };
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
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
