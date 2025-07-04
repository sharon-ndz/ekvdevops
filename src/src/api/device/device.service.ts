import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Device } from '../../entities/device.entity';
import { Node } from '../../entities/node.entity';
import {
  AuthUserInfo,
  DataResultInterface,
  RequestResultInterface,
} from '../../core/interfaces/all.interface';
import {
  CreateDeviceRequestDto,
  DeviceDetailDto,
  DeviceStatsDto,
  GetDevicesQueryRequestDto,
  PreActivationRequestDto,
  ToggleNodeStatusDto,
  DeviceUserDto,
} from './device.dto';
import { plainToInstance } from 'class-transformer';
import { findOrganizationByCode, getOrganizationCodeByRole } from '../../core/helpers/general';
import { DeviceStatus } from '../../core/constants/enums';
import { User } from '../../entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuditTrail } from '../../entities/audit-trail.entity';
import { beginTransaction } from '../../core/interfaces/all.dto';
import { MESSAGES } from '../../core/constants/messages';
import { auditAction } from '../../core/constants/constants';
import { getPagination } from '../../core/helpers/functions.helpers';
import { Role } from '../../middlewares/roles';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Node)
    private readonly nodeRepository: Repository<Node>,
    private readonly usersService: UsersService,
    @InjectRepository(AuditTrail)
    private readonly auditTrailRepository: Repository<AuditTrail>,
    private dataSource: DataSource,
  ) {}

  /**
   * Get list of devices
   * @param data
   * @param user
   */
  async devices(data: GetDevicesQueryRequestDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    try {
      const queryBuilder = this.deviceRepository.createQueryBuilder('devices');

      if (user.roleId !== Role.Admin) {
        const organizationCode = getOrganizationCodeByRole(user.roleId);

        if (organizationCode) {
          queryBuilder.andWhere('devices.organizationCode = :organizationCode', {
            organizationCode,
          });
        }
      }

      if (data.status) {
        queryBuilder.andWhere('devices.status = :status', { status: data.status });
      }

      if (search) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('devices.license LIKE :search', { search: `%${search}%` }) // Added wildcards
              .orWhere('devices.deviceId LIKE :search', { search: `%${search}%` })
              .orWhere('devices.deviceImei LIKE :search', { search: `%${search}%` });
          }),
        );
      }

      // Apply pagination and ordering
      queryBuilder.skip(offset);
      queryBuilder.take(limit);
      queryBuilder.orderBy('devices.id', 'DESC');

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
      throw new InternalServerErrorException(error.message);
    }

    return response;
  }

  /**
   * Create device
   * @param data
   * @param user
   */
  async create(data: CreateDeviceRequestDto, user: AuthUserInfo): Promise<RequestResultInterface> {
    //^ set variables
    const response = { success: false, message: '' };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // Check device with organization already exists
      const device = await queryRunner.manager.findOne(Device, {
        where: { deviceImei: data.deviceImei },
      });
      if (device) {
        throw new BadRequestException('Device already exists with an organization');
      }

      const organization = findOrganizationByCode(data.organizationCode);
      const payload = plainToInstance(Device, data);
      payload.organizationName = organization.name;
      payload.status = DeviceStatus.PENDING;
      await queryRunner.manager.save(Device, payload);

      // Create audit trail
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_ADD,
        tableName: 'devices',
        resourceId: payload.id,
        description: `Added a new device`,
      });
      // commit transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = 'Device added successfully.';
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
   * Create pre-activation request
   * @param data
   */
  async preActivation(data: PreActivationRequestDto): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const device = await queryRunner.manager.findOne(Device, {
        where: {
          deviceImei: data.deviceImei,
          organizationCode: data.organizationCode,
          license: data.license,
        },
      });
      if (!device) {
        throw new BadRequestException('Device not found');
      }

      // check that this requester (user) exists
      const user = await this.usersService.findUserBy({ email: data.requesterEmail });
      if (!user) {
        throw new BadRequestException('Requester with given information not found');
      }

      if (!device.deviceId) {
        device.deviceId = data.deviceId;
        await queryRunner.manager.update(Device, { id: device.id }, device);
      }

      if (device.deviceId != data.deviceId) {
        throw new BadRequestException('License used');
      }
      const organization = findOrganizationByCode(data.organizationCode);
      const node = await queryRunner.manager.findOne(Node, { where: { deviceId: data.deviceId } });
      if (!node) {
        const nodePayload = plainToInstance(Node, data);
        nodePayload.organizationName = organization.name;
        nodePayload.status = DeviceStatus.PENDING;
        await queryRunner.manager.save(Node, nodePayload);
      }
      // Commit transaction
      await queryRunner.commitTransaction();

      response.data = { deviceId: data.deviceId, hasNode: true };
      response.success = true;
      response.message = 'Pre activation request submitted successfully.';
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
   * Check activation status
   * @param deviceId
   */
  async checkActivationStatus(deviceId: string): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    try {
      // Check device with organization already exists
      const node = await this.nodeRepository.findOne({
        where: { deviceId: deviceId },
        relations: { agents: true },
      });
      if (!node) {
        throw new BadRequestException('Pre activation request node not found.');
      }

      response.data = {
        status: node.status,
        deviceId: node.deviceId,
        noOfAgents: `${node.agents.length}`,
      };

      response.success = true;
      response.message = 'Query ok';
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Toggle approval
   * @param data
   * @param user
   */
  async toggleApprovalStatus(
    data: ToggleNodeStatusDto,
    user: AuthUserInfo,
  ): Promise<RequestResultInterface> {
    //^ set variables
    const response = { success: false, message: '' };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // Check device with organization already exists
      const device = await queryRunner.manager.findOne(Device, {
        where: { id: data.id },
      });
      if (!device) {
        throw new BadRequestException('Device not found');
      }

      // Check for node
      const node = await queryRunner.manager.findOne(Node, {
        where: { deviceId: device.deviceId },
      });
      if (!node) {
        throw new BadRequestException('Pre activation request node not found.');
      }
      // Proceed to update the status
      node.status = data.status;
      if (data.status == DeviceStatus.APPROVED) {
        // If status is approved, set user who approved it
        node.activatedBy = { id: +user.id } as User;
      }
      await queryRunner.manager.save(Node, node);

      // Also update the device
      device.status = data.status;
      await queryRunner.manager.update(Device, { id: device.id }, device);
      // commit transaction
      await queryRunner.commitTransaction();

      response.success = true;
      response.message = 'Status updated successfully';
    } catch (error: any) {
      // rollback transaction
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  /**
   * Unlink device
   * @param deviceImei
   */
  async unlinkDevice(deviceImei: string): Promise<RequestResultInterface> {
    //^ set variables
    const response = { success: false, message: '' };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // Check device with organization already exists
      const device = await queryRunner.manager.findOne(Device, { where: { deviceImei } });
      if (!device) {
        throw new BadRequestException('Device not found');
      }
      device.deviceId = null;
      await queryRunner.manager.save(Device, device);

      const node = await queryRunner.manager.exists(Node, { where: { deviceId: device.deviceId } });
      if (node) {
        await queryRunner.manager.softDelete(Node, { deviceId: device.deviceId });
      }

      await queryRunner.commitTransaction();
      response.success = true;
      response.message = 'Device unlinked successfully';
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
    return response;
  }

  async deviceStats(user: AuthUserInfo): Promise<DataResultInterface<DeviceStatsDto>> {
    const response = { success: false, message: '', data: null };

    try {
      const organizationCode = getOrganizationCodeByRole(user.roleId);

      const stats = await this.deviceRepository
        .createQueryBuilder('device')
        .where('device.organizationCode = :organizationCode', { organizationCode })
        .select([
          'COUNT(*)::int AS "totalDevices"',
          `SUM(CASE WHEN device.status = :approved THEN 1 ELSE 0 END)::int AS "activeDevices"`,
          `SUM(CASE WHEN device.status = :pending THEN 1 ELSE 0 END)::int AS "pendingDevices"`,
          `SUM(CASE WHEN device.status = :deactivated THEN 1 ELSE 0 END)::int AS "deactivatedDevices"`,
        ])
        .setParameters({
          approved: DeviceStatus.APPROVED,
          pending: DeviceStatus.PENDING,
          deactivated: DeviceStatus.DEACTIVATED,
        })
        .getRawOne();

      // get total users linked to all devices
      const totalUsersLinked = await this.nodeRepository
        .createQueryBuilder('node')
        .leftJoin('node.agents', 'agent')
        .where('node.organizationCode = :organizationCode', { organizationCode })
        .select('COUNT(DISTINCT agent.id)::int', 'totalUsersLinked')
        .getRawOne();

      stats.totalUsersLinked = totalUsersLinked?.totalUsersLinked ?? 0;

      response.data = {
        totalDevices: stats.totalDevices ?? 0,
        activeDevices: stats.activeDevices ?? 0,
        pendingDevices: stats.pendingDevices ?? 0,
        deactivatedDevices: stats.deactivatedDevices ?? 0,
        totalUsersLinked: stats.totalUsersLinked,
      } as DeviceStatsDto;
      response.success = true;
      response.message = 'Device statistics retrieved successfully.';
    } catch (error: any) {
      console.error(error);
      console.log('Queried by userId: ' + user.id);
      throw new InternalServerErrorException(error.message);
    }

    return response;
  }

  async getDeviceDetails(id: number): Promise<DataResultInterface<DeviceDetailDto>> {
    const response: DataResultInterface<DeviceDetailDto> = {
      success: false,
      message: '',
      data: null,
    };

    try {
      const device = await this.deviceRepository.findOne({
        where: { id },
      });

      if (!device) {
        throw new BadRequestException('Device not found');
      }

      const node = await this.nodeRepository.findOne({
        where: { deviceId: device.deviceId },
        relations: { agents: true },
      });

      const agents =
        node?.agents.map((agent) => ({
          id: agent.id,
          firstName: agent.firstName,
          lastName: agent.lastName,
          email: agent.email,
          phone: agent.phone,
          createdAt: agent.createdAt,
        })) || [];

      // Fetch agents activity logs
      const agentActivityLogs = await Promise.all(
        node?.agents.map(async (agent) => {
          const auditTrails = await this.auditTrailRepository.find({
            where: { userId: agent.id },
            order: { createdAt: 'DESC' },
          });

          return {
            logs: auditTrails.map((log) => ({
              nameOfUser: `${agent.firstName} ${agent.lastName}`,
              action: log.dbAction,
              description: log.description,
              createdAt: log.createdAt,
            })),
          };
        }) || [],
      );

      const deviceDetails = plainToInstance(DeviceDetailDto, {
        id: device.id,
        deviceImei: device.deviceImei,
        deviceId: device.deviceId,
        license: device.license,
        type: device.type,
        organizationCode: device.organizationCode,
        organizationName: device.organizationName,
        status: device.status,
        createdAt: device.createdAt,
        agents,
        agentActivityLogs,
      });

      response.success = true;
      response.message = 'Device details retrieved successfully';
      response.data = deviceDetails;
    } catch (error: any) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }

    return response;
  }

  async deactivateDevice(deviceImei: string): Promise<RequestResultInterface> {
    const response = { success: false, message: '' };

    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const device = await queryRunner.manager.findOne(Device, { where: { deviceImei } });
      if (!device) {
        throw new BadRequestException('Device not found');
      }

      device.status = DeviceStatus.DEACTIVATED;
      await queryRunner.manager.save(Device, device);

      // Unlink all users
      const node = await queryRunner.manager.findOne(Node, {
        where: { deviceId: device.deviceId },
        relations: ['agents'],
      });
      if (node) {
        // Don't delete node to allow relinking.
        // Simply withdraw all users.
        node.agents = [];
        await queryRunner.manager.save(Node, node);
        // await queryRunner.manager.softDelete(Node, { deviceId: device.deviceId });
      }

      await queryRunner.commitTransaction();

      response.success = true;
      response.message = 'Device deactivated successfully.';
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  async activateDevice(data: DeviceUserDto, user: AuthUserInfo): Promise<RequestResultInterface> {
    const response = { success: false, message: '' };

    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const device = await this.deviceRepository.findOne({
        where: { deviceImei: data.deviceImei },
      });
      if (!device) {
        throw new BadRequestException('Device not found');
      }

      // Find the user by userId
      const agent = await this.usersService.findUser({
        where: { id: data.userId },
        relations: ['node'],
      });
      if (!agent) {
        throw new BadRequestException('User not found');
      }

      if (agent.node) {
        throw new BadRequestException('User is already mapped to a device');
      }

      // Check if the user is linked to the device
      const node = await this.nodeRepository.findOne({
        where: { deviceId: device.deviceId },
      });
      // Link user to device
      await this.nodeRepository.createQueryBuilder().relation(Node, 'agents').of(node).add(agent);

      // activate device
      device.status = DeviceStatus.APPROVED;
      await queryRunner.manager.save(Device, device);

      // Create an audit trail for the unlinking action
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'nodes',
        resourceId: node.id,
        description: `activates and linked user with ID ${data.userId} to device with IMEI ${data.deviceImei}`,
      });

      await queryRunner.commitTransaction();

      response.success = true;
      response.message = 'Device activated and linked successfully.';
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  async unlinkUserFromDevice(data: DeviceUserDto): Promise<RequestResultInterface> {
    const response = { success: false, message: '' };

    const queryRunner = await beginTransaction(this.dataSource);
    try {
      // Find the device by deviceId
      const device = await queryRunner.manager.findOne(Device, {
        where: { deviceImei: data.deviceImei },
      });

      if (!device) {
        throw new BadRequestException('Device not found');
      }

      // Find the user by userId
      const user = await queryRunner.manager.findOne(User, { where: { id: data.userId } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if the user is linked to the device
      const node = await queryRunner.manager.findOne(Node, {
        where: { deviceId: device.deviceId },
        relations: { agents: true },
      });

      if (!node || !node.agents.some((agent) => agent.id === data.userId)) {
        throw new BadRequestException('User is not linked to the device');
      }

      // Unlink the user from the device
      node.agents = node.agents.filter((agent) => agent.id !== data.userId);
      await queryRunner.manager.save(Node, node);

      // Create an audit trail for the unlinking action
      await queryRunner.manager.insert(AuditTrail, {
        userId: data.userId,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'nodes',
        resourceId: node.id,
        description: `Unlinked user with ID ${data.userId} from device with IMEI ${data.deviceImei}`,
      });

      await queryRunner.commitTransaction();

      response.success = true;
      response.message = 'User unlinked from device successfully.';
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  async linkUserToDevice(data: DeviceUserDto): Promise<RequestResultInterface> {
    const response = { success: false, message: '' };

    const queryRunner = await beginTransaction(this.dataSource);
    try {
      // Find the device by deviceId
      const device = await queryRunner.manager.findOne(Device, {
        where: { deviceImei: data.deviceImei },
      });

      if (!device) {
        throw new BadRequestException('Device not found');
      }

      // Find the user by userId
      const user = await queryRunner.manager.findOne(User, { where: { id: data.userId } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if the user is linked to the device
      const node = await queryRunner.manager.findOne(Node, {
        where: { deviceId: device.deviceId },
      });
      // Link user to device
      await this.nodeRepository.createQueryBuilder().relation(Node, 'agents').of(node).add(user);

      // Create an audit trail for the unlinking action
      await queryRunner.manager.insert(AuditTrail, {
        userId: data.userId,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'nodes',
        resourceId: node.id,
        description: `linked user with ID ${data.userId} to device with IMEI ${data.deviceImei}`,
      });

      await queryRunner.commitTransaction();
      response.success = true;
      response.message = 'User linked to device successfully.';
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
