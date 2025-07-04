import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { User } from '../../entities/user.entity';
import {
  AttachUserBiometricsDto,
  CreateUserDto,
  toggleUserStatusDto,
  UpdateMeDto,
  UpdateUserDto,
  UserListRequestDto,
  UserResponseDto,
  UserStatsDto,
} from './users.dto';
import {
  AuthUserInfo,
  DataResultInterface,
  LgaDistribution,
  RequestResultInterface,
  UserStatusDistribution,
} from '../../core/interfaces/all.interface';
import { Role, RoleName } from '../../middlewares/roles';
import { plainToInstance } from 'class-transformer';
import { EmailNotification } from '../../entities/email-notification.entity';
import { genSaltSync, hashSync } from 'bcrypt';
import { DrivingSchoolApplication } from '../../entities/driving-school-application.entity';
import { AuditTrail } from '../../entities/audit-trail.entity';
import { beginTransaction } from '../../core/interfaces/all.dto';
import { DrivingSchool } from '../../entities/driving-school.entity';
import { MESSAGES } from '../../core/constants/messages';
import { auditAction } from '../../core/constants/constants';
import { ActiveInactiveStatus, Status } from '../../core/constants/enums';
import { getPagination, hexCode } from '../../core/helpers/functions.helpers';
import { mailer } from '../../core/helpers';
import { getAllowedRoleIds } from '../../core/helpers/general';
import { MvaaOffice } from '../../entities/mvaa-office.entity';

@Injectable()
export class UsersService {
  private readonly userRepository: Repository<User>;
  private readonly drivingSchoolRepository: Repository<DrivingSchool>;
  constructor(
    @InjectRepository(MvaaOffice)
    private readonly mvaaOfficeRepository: Repository<MvaaOffice>,
    @InjectRepository(AuditTrail)
    private readonly auditTrailRepository: Repository<AuditTrail>,
    private dataSource: DataSource,
  ) {
    this.userRepository = this.dataSource.getRepository(User);
    this.drivingSchoolRepository = this.dataSource.getRepository(DrivingSchool);
  }

  /**
   * Get users stats
   * @param user
   */
  async stats(user: AuthUserInfo): Promise<DataResultInterface<UserStatsDto>> {
    const response = { success: false, message: '', data: null };

    try {
      const allowedRoleIds = getAllowedRoleIds(user.roleId);
      let result: any;

      if (allowedRoleIds) {
        result = await this.userRepository
          .createQueryBuilder('users')
          .select([
            'COUNT(*) AS totalusers',
            'COUNT(CASE WHEN users.isActive = 0 THEN 1 END) AS inactiveusers',
            "COUNT(CASE WHEN users.createdAt >= NOW() - INTERVAL '7 days' THEN 1 END) AS newusers",
            `COUNT(CASE WHEN users.roleId = ${allowedRoleIds[0]} THEN 1 END) AS adminCount`,
            `COUNT(CASE WHEN users.roleId = ${allowedRoleIds[1]} THEN 1 END) AS officerCount`,
          ])
          .where('users.roleId IN (:...roles)', { roles: allowedRoleIds })
          .getRawOne();

        const adminKey = allowedRoleIds[0] === Role.LASDRI_ADMIN ? 'lasdriAdmins' : 'dvisAdmins';
        const officerKey = allowedRoleIds[1] === Role.LASDRI ? 'lasdriOfficers' : 'dvisOfficers';

        response.data = {
          totalUsers: parseInt(result.admincount, 10) + parseInt(result.officercount, 10) || 0,
          inactiveUsers: parseInt(result.inactiveusers, 10) || 0,
          newUsers: parseInt(result.newusers, 10) || 0,
          [adminKey]: parseInt(result.admincount, 10) || 0,
          [officerKey]: parseInt(result.officercount, 10) || 0,
        };
      } else {
        result = await this.userRepository
          .createQueryBuilder('users')
          .select([
            'COUNT(*) AS totalusers',
            'COUNT(CASE WHEN users.isActive = 0 THEN 1 END) AS inactiveusers',
            "COUNT(CASE WHEN users.createdAt >= NOW() - INTERVAL '7 days' THEN 1 END) AS newusers",
          ])
          .getRawOne();

        response.data = {
          totalUsers: parseInt(result.totalusers, 10) || 0,
          inactiveUsers: parseInt(result.inactiveusers, 10) || 0,
          newUsers: parseInt(result.newusers, 10) || 0,
        };
      }

      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.error(error);
      console.log(`Queried by user ${user.id}`);
      response.message = error.message;
    }

    return response;
  }

  async mvaaDashboardStats(user: AuthUserInfo): Promise<DataResultInterface<UserStatsDto>> {
    const response = { success: false, message: '', data: null };

    try {
      const countsByRole = await this.userRepository
        .createQueryBuilder('user')
        .select('user.roleId', 'roleId')
        .addSelect('COUNT(user.id)', 'count')
        .where('user.stateId = :stateId', { stateId: user.stateId })
        .andWhere('user.roleId IN (:...roles)', { roles: [Role.MVAA, Role.MVAA_ADMIN] })
        .groupBy('user.roleId')
        .getRawMany();

      const totalCenters = await this.mvaaOfficeRepository
        .createQueryBuilder('mvaaOffices')
        .where('mvaaOffices.stateId = :stateId', { stateId: user.stateId })
        .getCount();

      const adminCount = countsByRole.find((r) => r.roleId === Role.MVAA_ADMIN)?.count || 0;
      const officerCount = countsByRole.find((r) => r.roleId === Role.MVAA)?.count || 0;
      const combinedUserCount = countsByRole
        .filter((r) => r.roleId === Role.MVAA || r.roleId === Role.MVAA_ADMIN)
        .reduce((sum, r) => sum + parseInt(r.count, 10), 0);

      response.data = {
        totalUsers: combinedUserCount || 0,
        totalAdmins: adminCount || 0,
        totalMvaaOfficers: officerCount || 0,
        totalCenters: totalCenters || 0,
      };

      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.error(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Fetches the distribution of MVAA users by their active/inactive status.
   * @returns {Promise<UserStatusDistribution[]>} A promise that resolves to an array of objects,
   * each containing a status (Active/Inactive) and its corresponding count for MVAA users.
   */
  async officerDistributionByStatus(user: AuthUserInfo): Promise<UserStatusDistribution[]> {
    console.log('Fetching MVAA user distribution by status');
    try {
      const rawDistribution = await this.userRepository
        .createQueryBuilder('user')
        .select('user.isActive', 'statusValue')
        .addSelect('COUNT(user.id)', 'count')
        .where('user.stateId = :stateId', { stateId: user.stateId })
        .andWhere('user.roleId = :roleId', { roleId: Role.MVAA })
        .groupBy('user.isActive')
        .getRawMany();

      // Initialize counts for Active and Inactive statuses
      const statusCounts = {
        [ActiveInactiveStatus.Active]: 0,
        [ActiveInactiveStatus.Inactive]: 0,
      };

      // Populate counts from the query result
      rawDistribution.forEach((item) => {
        const status = parseInt(item.statusValue, 10);
        const count = parseInt(item.count, 10) || 0;
        if (status === ActiveInactiveStatus.Active) {
          statusCounts[ActiveInactiveStatus.Active] = count;
        } else if (status === ActiveInactiveStatus.Inactive) {
          statusCounts[ActiveInactiveStatus.Inactive] = count;
        }
      });

      // Format the result according to the UserStatusDistribution interface
      return [
        {
          status: ActiveInactiveStatus.Active,
          statusLabel: 'Active',
          count: statusCounts[ActiveInactiveStatus.Active],
        },
        {
          status: ActiveInactiveStatus.Inactive,
          statusLabel: 'Inactive',
          count: statusCounts[ActiveInactiveStatus.Inactive],
        },
      ];
    } catch (error: any) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Fetches the distribution of all users by their LGA ID.
   * Filters out users with null lgaId.
   * @returns {Promise<LgaDistribution[]>} A promise that resolves to an array of objects,
   * each containing an lgaId and its corresponding count.
   */
  async officerDistributionByLga(user: AuthUserInfo): Promise<LgaDistribution[]> {
    try {
      const rawDistribution = await this.userRepository
        .createQueryBuilder('user')
        .select('user.lgaId', 'lgaId')
        .addSelect('COUNT(user.id)', 'count')
        .where('user.stateId = :stateId', { stateId: user.stateId })
        .andWhere('user.roleId = :roleId', { roleId: Role.MVAA })
        .andWhere('user.lgaId IS NOT NULL')
        .groupBy('user.lgaId')
        .orderBy('user.lgaId', 'ASC')
        .getRawMany();

      // Format the result according to the LgaDistribution interface
      return rawDistribution
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
   * Get list of users with filters
   * @param data
   * @param user
   */
  async findAll(
    data: UserListRequestDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface<UserResponseDto[]>> {
    const response = { success: false, message: '', data: null };
    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    let allowedRoleIds: number[];
    if (user && user.roleId) {
      allowedRoleIds = getAllowedRoleIds(user.roleId);
    }

    const queryBuilder = this.userRepository.createQueryBuilder('users');
    queryBuilder.select([
      'users.id',
      'users.firstName',
      'users.middleName',
      'users.lastName',
      'users.phone',
      'users.email',
      'users.avatar',
      'users.stateId',
      'users.lgaId',
      'users.drivingSchoolId',
      'users.roleId',
      'users.roleName',
      'users.changePasswordNextLogin',
      'users.isActive',
      'users.createdAt',
    ]);

    if (allowedRoleIds) {
      queryBuilder.where('users.roleId IN (:...roles)', { roles: allowedRoleIds });
    }

    if (data.stateId) {
      queryBuilder.andWhere('users.stateId = :stateId', { stateId: data.stateId });
    }
    if (data.lgaId) {
      queryBuilder.andWhere('users.lgaId = :lgaId', { lgaId: data.lgaId });
    }
    if (data.roleId) {
      queryBuilder.andWhere('users.roleId = :roleId', { roleId: data.roleId });
    }
    if (data.status) {
      queryBuilder.andWhere('users.isActive = :status', { status: data.status });
    }
    if (data.drivingSchoolId) {
      queryBuilder.andWhere('users.drivingSchoolId = :drivingSchoolId', {
        drivingSchoolId: data.drivingSchoolId,
      });
    }
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('users.email LIKE :search', { search: `%${search}%` })
            .orWhere('users.firstName LIKE :search', { search: `%${search}%` })
            .orWhere('users.lastName LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    queryBuilder.skip(offset);
    queryBuilder.take(limit);
    queryBuilder.orderBy('users.id', data.order);

    try {
      const [result, count] = await queryBuilder.getManyAndCount();
      if (result) {
        const userResponseDtos = result.map((user) => plainToInstance(UserResponseDto, user));
        response.data = {
          result: userResponseDtos,
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
   * Get single user
   * @param userId
   * @param user
   */
  async getSingle(userId: number, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }
      response.data = plainToInstance(User, user);
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
   * Create user
   * @param data
   * @param user
   */
  async createUser(data: CreateUserDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const existingUser = await queryRunner.manager.findOne(User, {
        where: [{ email: data.email }, { phone: data.phone }],
      });
      if (existingUser) {
        throw new BadRequestException(MESSAGES.recordExists);
      }

      const userData = plainToInstance(User, data);
      // Set password
      const rawPassword = hexCode({ count: 8 });
      userData.password = rawPassword;
      userData.roleName = RoleName(data.roleId);
      userData.isActive = Status.Active;

      // Create user
      const userRecord = await queryRunner.manager.save(User, userData);

      if (data.email) {
        // Send email
        await mailer
          .setSubject(MESSAGES.accountCreatedSubject)
          .setMessage(MESSAGES.userAccountCreated(rawPassword, userData.email))
          .setTo(userData.email)
          .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
          .sendDefault();
      }

      // Create audit log
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_ADD,
        tableName: 'users',
        resourceId: userRecord.id,
        description: `User ${userRecord.email} created successfully`,
      });

      await queryRunner.commitTransaction();

      response.data = plainToInstance(User, userRecord);
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
   * Update user
   * @param data
   * @param user
   */
  async updateUser(data: UpdateUserDto, user: AuthUserInfo): Promise<RequestResultInterface> {
    //^ set variables
    const response = { success: false, message: '' };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const exists = await queryRunner.manager.findOne(User, {
        where: { id: data.id },
      });
      if (!exists) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }

      const rounds = genSaltSync(parseInt(process.env.SALT_ROUND));
      const userData = plainToInstance(User, data);
      userData.password = hashSync(data.password, rounds);
      // Set role name (in case it changes)
      userData.roleName = RoleName(data.roleId);

      // Update user
      await queryRunner.manager.update(User, { id: data.id }, userData);

      if (user) {
        // Create audit log
        await queryRunner.manager.insert(AuditTrail, {
          userId: user.id,
          dbAction: auditAction.RECORD_MODIFIED,
          tableName: 'users',
          resourceId: exists.id,
          description: `User ${exists.email} updated successfully`,
        });
      }

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
   * Get my profile
   * @param user
   */
  async getProfile(user: AuthUserInfo): Promise<DataResultInterface> {
    const response = { success: false, message: 'ok', data: null };
    const userRecord = await this.userRepository.findOneBy({ id: user.id });
    response.data = plainToInstance(User, userRecord);
    response.success = true;
    return response;
  }

  /**
   * Update my profile
   * @param data
   * @param user
   */
  async updateProfile(data: UpdateMeDto, user: AuthUserInfo): Promise<RequestResultInterface> {
    //^ set variables
    const response = { success: false, message: '' };

    try {
      const userData = plainToInstance(User, data);
      // Update user
      await this.userRepository.update({ id: user.id }, userData);
      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Update user Biometrics
   * @param data
   */
  async updateUserBiometrics(data: AttachUserBiometricsDto) {
    //^ set variables
    const response = { success: false, message: '' };

    try {
      // Check if user exists
      const user = await this.findUserBy({ email: data.email });
      if (!user) {
        throw new BadRequestException('User ' + MESSAGES.recordNotFound);
      }

      // Update user biometrics
      user.files = data.files;
      await this.update(user.id, user);

      response.success = true;
      response.message = 'User biometrics record updated!';
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }

    return response;
  }

  /**
   * Create user [internally]
   * @param data
   */
  async createUserInternal(data: CreateUserDto): Promise<RequestResultInterface> {
    //^ set variables
    const response = { success: false, message: '' };

    try {
      const existingUser = await this.userRepository.findOne({
        where: [{ email: data.email }, { phone: data.phone }],
      });
      if (!existingUser) {
        const rounds = genSaltSync(parseInt(process.env.SALT_ROUND));
        const userData = plainToInstance(User, data);
        userData.roleName = RoleName(data.roleId);
        userData.isActive = Status.Active;

        userData.password = hashSync(data.password, rounds);
        // Create user
        await this.userRepository.insert(userData);
        response.message = MESSAGES.recordAdded;
      } else {
        response.message = MESSAGES.recordExists;
      }
      response.success = true;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Create user record (internal use)
   * @param data
   */
  async save(data: User) {
    return await this.userRepository.save(data);
  }

  async updateNode(userId: number, nodeId: number) {
    return await this.userRepository.update(userId, { node: { id: nodeId } });
  }

  /**
   * Update user record (internal use)
   * @param id
   * @param user
   */
  async update(id: number, user: User) {
    await this.userRepository.update(id, user);
  }

  /**
   * Find counts
   * @param where
   */
  async findByCount(where: FindManyOptions<User>) {
    return await this.userRepository.count(where);
  }

  /**
   * Find user by where options
   * @param where
   */
  async findUserBy(where: FindOptionsWhere<User>) {
    return await this.userRepository.findOneBy(where);
  }

  /**
   * Find user by where options and relations
   * @param options
   */
  async findUser(options: FindOneOptions<User>) {
    return await this.userRepository.findOne(options);
  }

  async toggleUserStatus(
    id: number,
    data: toggleUserStatusDto,
    user: AuthUserInfo,
  ): Promise<RequestResultInterface> {
    const response = { success: false, message: '' };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const allowedRoleIds = getAllowedRoleIds(user.roleId);

      const foundUser = await queryRunner.manager.findOne(User, {
        where: {
          id,
          ...(allowedRoleIds ? { roleId: In(allowedRoleIds) } : {}),
        },
      });

      if (!foundUser) {
        throw new BadRequestException('User not found');
      }

      foundUser.isActive = data.status;
      await queryRunner.manager.save(foundUser);

      // Create audit trail
      await queryRunner.manager.insert(AuditTrail, {
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'users',
        resourceId: foundUser.id,
        description: `User status for ${foundUser.email} updated to ${data.status ? 'Active' : 'Inactive'}`,
        createdAt: new Date(),
      });

      response.success = true;
      response.message = 'User status updated successfully';
      await queryRunner.commitTransaction();
      return response;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getMySchoolApplication(user: AuthUserInfo): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };

    try {
      const application = await this.drivingSchoolRepository.findOne({
        where: { id: user.drivingSchoolId },
        relations: {
          queries: true,
          instructors: true,
          inspections: true,
        },
      });
      if (!application) {
        throw new BadRequestException(MESSAGES.recordNotFound);
      }

      response.data = plainToInstance(DrivingSchoolApplication, application);

      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }

    return response;
  }
}
