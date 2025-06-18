import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { AuditTrailActionDto, AuditTrailResponseDto, ListAuditTrailDto } from './audit-trail.dto';
import { AuditTrail } from '../../entities/audit-trail.entity';
import { Role } from '../../middlewares/roles';
import { AuthUserInfo, DataResultInterface } from '../../core/interfaces/all.interface';
import { getPagination } from '../../core/helpers/functions.helpers';

@Injectable()
export class AuditTrailService {
  constructor(
    @InjectRepository(AuditTrail)
    private readonly auditTrailRepository: Repository<AuditTrail>,
  ) { }

  async record(data: AuditTrailActionDto): Promise<void> {
    await this.auditTrailRepository.insert(data);
  }

  async findAll(data: ListAuditTrailDto, user: AuthUserInfo): Promise<DataResultInterface<AuditTrailResponseDto[]>> {
    const response = { success: false, message: '', data: null };

    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    const allowedRoleIds = [Role.LASDRI_ADMIN, Role.LASDRI];
    if (data.roleId) {
      allowedRoleIds.push(data.roleId);
    }

    const whereCondition: any = {
      user: {
        roleId: In(allowedRoleIds),
      },
    };

    if (search) {
      whereCondition.dbAction = ILike(`%${search}%`);
      whereCondition.tableName = ILike(`%${search}%`);
      whereCondition.description = ILike(`%${search}%`);
    }

    try {
      const [result, count] = await this.auditTrailRepository.findAndCount({
        where: whereCondition,
        relations: {
          user: true,
        },
        select: {
          user: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        order: { id: data.order },
        skip: offset,
        take: limit,
      });

      const formattedResult: AuditTrailResponseDto[] = result.map((item) => ({
        userId: item.userId,
        dbAction: item.dbAction,
        tableName: item.tableName,
        resourceId: item.resourceId,
        description: item.description,
        createdAt: item.createdAt,
        user: {
          id: item.user.id,
          firstName: item.user.firstName,
          lastName: item.user.lastName,
        },
      }));

      response.success = true;
      response.message = 'Audit trail retrieved successfully';
      response.data = {
        result: formattedResult,
        pagination: getPagination(count, page, offset, limit),
      };

      return response;
    } catch (error: any) {
      console.log(error);
      console.log(`Queried by ${user.id}`);
      throw new InternalServerErrorException(error.message);
    }
  }
}
