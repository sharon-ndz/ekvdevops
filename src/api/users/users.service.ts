import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
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
  RequestResultInterface,
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
import { Status } from '../../core/constants/enums';
import { getPagination, hexCode } from '../../core/helpers/functions.helpers';
import { mailer } from '../../core/helpers';

@Injectable()
export class UsersService {
  private readonly userRepository: Repository<User>;
  private readonly drivingSchoolRepository: Repository<DrivingSchool>;
  constructor(
    @InjectRepository(EmailNotification)
    private readonly emailNotificationRepository: Repository<EmailNotification>,
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
      let result: any;

      if (user.roleId === Role.LASDRI_ADMIN) {
        result = await this.userRepository
          .createQueryBuilder('users')
          .select([
            'COUNT(*) AS totalusers',
            'COUNT(CASE WHEN users.isActive = 0 THEN 1 END) AS inactiveusers',
            "COUNT(CASE WHEN users.createdAt >= NOW() - INTERVAL '7 days' THEN 1 END) AS newusers",
            `COUNT(CASE WHEN users.roleId = ${Role.LASDRI_ADMIN} THEN 1 END) AS lasdriadmins`,
            `COUNT(CASE WHEN users.roleId = ${Role.LASDRI} THEN 1 END) AS lasdriofficers`,
          ])
          .where('users.roleId IN (:...roles)', {
            roles: [Role.LASDRI, Role.LASDRI_ADMIN],
          })
          .getRawOne();

        response.data = {
          totalUsers: parseInt(result.totalusers, 10) || 0,
          inactiveUsers: parseInt(result.inactiveusers, 10) || 0,
          newUsers: parseInt(result.newusers, 10) || 0,
          lasdriAdmins: parseInt(result.lasdriadmins, 10) || 0,
          lasdriOfficers: parseInt(result.lasdriofficers, 10) || 0,
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

  /**
   * Get list of users with filters
   * @param data
   * @param user
   */
  async findAll(
    data: UserListRequestDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface<UserResponseDto[]>> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

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
    ]);

    if (user && user.roleId === Role.LASDRI_ADMIN) {
      queryBuilder.andWhere('users.roleId IN (:...roles)', {
        roles: [Role.LASDRI, Role.LASDRI_ADMIN],
      });
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
          qb.where('users.email LIKE :search', { search: `%${search}%` }) // Added wildcards
            .orWhere('users.firstName LIKE :search', { search: `%${search}%` }) // Added wildcards
            .orWhere('users.lastName LIKE :search', { search: `%${search}%` }); // Added wildcards
        }),
      );
    }
    // Apply pagination and ordering
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

    try {
      const existingUser = await this.userRepository.findOne({
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
      const userRecord = await this.userRepository.save(userData);
      if (data.email) {
        // Send email
        await mailer
          .setSubject(MESSAGES.accountCreatedSubject)
          .setMessage(MESSAGES.userAccountCreated(rawPassword, userData.email))
          .setTo(userData.email)
          .setEmailNotificationRepository(this.emailNotificationRepository)
          .sendDefault();
      }
      // Create audit log
      await this.auditTrailRepository.insert({
        userId: user.id,
        dbAction: auditAction.RECORD_ADD,
        tableName: 'users',
        resourceId: userRecord.id,
        description: `User ${userRecord.email} created successfully`,
      });
      response.data = plainToInstance(User, userRecord);
      response.success = true;
      response.message = MESSAGES.recordAdded;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
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

    try {
      const exists = await this.userRepository.findOne({
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
      await this.userRepository.update({ id: data.id }, userData);
      if (user) {
        // Create audit log
        await this.auditTrailRepository.insert({
          userId: user.id,
          dbAction: auditAction.RECORD_MODIFIED,
          tableName: 'users',
          resourceId: exists.id,
          description: `User ${exists.email} updated successfully`,
        });
      }
      response.success = true;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
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
      const foundUser = await queryRunner.manager.findOne(User, { where: { id } });

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
      console.log(`Queried by ${user.id}`);
      response.message = error.message;
    }

    return response;
  }
}
