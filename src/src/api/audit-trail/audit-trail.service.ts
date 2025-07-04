import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { AuditTrailActionDto, AuditTrailResponseDto, DeviceAgentLogsDto, ListAuditTrailDto } from './audit-trail.dto';
import { AuditTrail } from '../../entities/audit-trail.entity';
import { Role } from '../../middlewares/roles';
import { AuthUserInfo, DataResultInterface } from '../../core/interfaces/all.interface';
import { getPagination } from '../../core/helpers/functions.helpers';
import { getAllowedRoleIds } from '../../core/helpers/general';
import { Node } from '../../entities/node.entity';

@Injectable()
export class AuditTrailService {
  constructor(
    @InjectRepository(AuditTrail)
    private readonly auditTrailRepository: Repository<AuditTrail>,
    @InjectRepository(Node)
    private readonly nodeRepository: Repository<Node>,
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

    let whereCondition: any = {};

    if (user.roleId === Role.Admin) {
      // Admin can fetch everything, no restrictions
      whereCondition = {};
    } else {
      const allowedRoleIds = getAllowedRoleIds(user.roleId) || [];

      if (data.roleId) {
        allowedRoleIds.push(data.roleId);
      }

      whereCondition = {
        user: {
          roleId: In(allowedRoleIds),
        },
      };
    }

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

  async getDeviceAgentLogs(dto: DeviceAgentLogsDto): Promise<DataResultInterface<any>> {
    const response: DataResultInterface<any> = {
      success: false,
      message: '',
      data: null,
    };

    const limit = Number(dto.resultPerPage || 10);
    const page = Number(dto.page || 1);
    const offset = (page - 1) * limit;

    try {
      const node = await this.nodeRepository.findOne({
        where: { deviceId: dto.deviceId },
        relations: { agents: true },
      });

      if (!node) {
        throw new NotFoundException('Device node not found');
      }

      const agentIds = node.agents.map((agent) => agent.id);
      if (!agentIds.length) {
        response.success = true;
        response.message = 'No agent logs available';
        response.data = {
          result: [],
          pagination: getPagination(0, page, offset, limit),
        };
        return response;
      }

      const where: any = {
        userId: In(agentIds),
      };

      if (dto.search) {
        where.description = ILike(`%${dto.search}%`);
      }

      const [logs, count] = await this.auditTrailRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip: offset,
        take: limit,
        relations: { user: true },
      });

      const formatted = logs.map((log) => ({
        nameOfUser: `${log.user?.firstName} ${log.user?.lastName}`,
        action: log.dbAction,
        description: log.description,
        createdAt: log.createdAt,
      }));

      response.success = true;
      response.message = 'Agent activity logs retrieved';
      response.data = {
        result: formatted,
        pagination: getPagination(count, page, offset, limit),
      };
    } catch (error: any) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }

    return response;
  }
}
