import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { ApiClient } from '../../entities/api-client.entity';
import * as bcryptjs from 'bcryptjs';
import {
  ApiClientAuthDto,
  ApiClientChangeStatusDto,
  ApiClientCreateDto,
  ApiClientCreateResultInterface,
  ApiClientResetPasswordDto,
  ApiClientResultInterface,
  ApiClientUpdateDto,
} from './api-clients.dto';
import {
  AuthUserInfo,
  ListInterface,
  RequestResultInterface,
} from '../../core/interfaces/all.interface';
import { JwtService } from '@nestjs/jwt';
import { MESSAGES } from '../../core/constants/messages';
import { auditAction } from '../../core/constants/constants';
import { Status, sStatus } from '../../core/constants/enums';
import {
  getPagination,
  createConsistentHash,
  hexCode,
  removeNullAndEmpty,
} from '../../core/helpers/functions.helpers';
import { AuditTrail } from '../../entities/audit-trail.entity';

@Injectable()
export class ApiClientsService {
  constructor(
    @InjectRepository(ApiClient)
    private readonly apiClientRepository: Repository<ApiClient>,
    @InjectRepository(AuditTrail)
    private readonly auditTrailRepository: Repository<AuditTrail>,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(data: ListInterface): Promise<ApiClientResultInterface> {
    //^ Get the request parameters
    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    const whereCondition: FindManyOptions<ApiClient> = {
      where: [
        { clientName: Like(`%${search}%`) },
        { clientIdentity: Like(`%${search}%`) },
        { clientEmail: Like(`%${search}%`) },
        { clientPhone: Like(`%${search}%`) },
      ],
    };

    // Query for result
    const [result, count] = await this.apiClientRepository.findAndCount(whereCondition);

    return {
      result: result,
      pagination: getPagination(count, page, offset, limit),
    };
  }

  async authenticate(clientData: ApiClientAuthDto) {
    const client = await this.apiClientRepository.findOne({
      where: {
        clientIdentity: clientData.identity,
        isActive: Status.Active,
      },
    });
    if (!client) {
      throw new NotFoundException('No client found with given credentials');
    }

    const isMatch = await bcryptjs.compare(clientData.secret, client.token);
    if (isMatch) {
      await this.auditTrailRepository.insert({
        userId: client.id,
        dbAction: auditAction.LOGIN,
        tableName: 'api_clients',
        resourceId: client.id,
        description: `API client logged in successfully`,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { token, createdAt, updatedAt, hash, ...data } = client;
      const jwtToken = this.jwtService.sign(data);

      //decode the generated token to get the expiry time since there is no inbuilt methode to determine this
      const decodedJwt: any = this.jwtService.decode(jwtToken);
      const expiryTimestamp = new Date(decodedJwt.exp * 1000);

      return {
        success: true,
        access_token: jwtToken,
        expires: expiryTimestamp,
      };
    }

    throw new NotAcceptableException('Incorrect client credentials');
  }

  async create(
    data: ApiClientCreateDto,
    user: AuthUserInfo,
  ): Promise<ApiClientCreateResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };

    // Generate hash
    const hash = createConsistentHash(
      `${data.clientName}.${data.clientEmail}.${data.clientPhone}.client`,
    );
    // Generate secret
    const secret = hexCode({ count: 8 });
    const token = await bcryptjs.hash(secret, 10);

    try {
      const record = this.apiClientRepository.create({
        clientIdentity: hash,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        clientName: data.clientName,
        isActive: Status.Active,
        permissions: data.permissions,
        token: token,
        hash: hash,
      });
      if (record) {
        await this.auditTrailRepository.insert({
          userId: user.id,
          dbAction: auditAction.RECORD_ADD,
          tableName: 'api_clients',
          resourceId: record.id,
          description: `created new api client record`,
        });
      }
      // Log user ID
      response.success = true;
      response.message = MESSAGES.recordAdded;
      response.data = record;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
      throw new InternalServerErrorException(response);
    }
    return response;
  }

  async changeStatus(data: ApiClientChangeStatusDto, user: AuthUserInfo) {
    //^ set variables
    const success = true;
    const message = MESSAGES.updateSuccessful;

    try {
      const record = await this.apiClientRepository.findOne({
        where: { id: data.id },
      });
      record.isActive = data.status;
      await this.apiClientRepository.save(record);
      await this.auditTrailRepository.insert({
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'api_clients',
        resourceId: record.id,
        description: `updated api client status to ${
          data.status == 1 ? sStatus.Active : sStatus.Inactive
        }`,
      });
    } catch (error: any) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
    return { success, message };
  }

  async update(data: ApiClientUpdateDto, user: AuthUserInfo): Promise<RequestResultInterface> {
    //^ set variables
    let success = true;
    let message = MESSAGES.updateSuccessful;

    // Update record
    try {
      const record = await this.apiClientRepository.findOne({
        where: { id: data.id },
      });

      if (record) {
        // remove nul or empty key => value pairs
        const formattedData = removeNullAndEmpty(data);
        // Assign cleaned properties to the record
        Object.assign(record, formattedData);
        await this.apiClientRepository.save(record);

        await this.auditTrailRepository.insert({
          userId: user.id,
          dbAction: auditAction.RECORD_MODIFIED,
          tableName: 'api_clients',
          resourceId: record.id,
          description: `updated api client record`,
        });
      } else {
        success = false;
        message = 'Record not found.';
      }
    } catch (err: any) {
      console.log(err);
      message = err.message;
      throw new InternalServerErrorException(message);
    }

    //^ return result
    return { success, message };
  }

  async resetPassword(
    data: ApiClientResetPasswordDto,
    user?: AuthUserInfo,
  ): Promise<RequestResultInterface> {
    //^ set variables
    const success = true;
    let message = MESSAGES.updateSuccessful;
    const secret = hexCode({ count: 8 });
    const token = await bcryptjs.hash(secret, 10);

    try {
      //^ update record
      const record = await this.apiClientRepository.findOne({
        where: { id: data.id },
      });
      if (!record) {
        throw new NotFoundException('No API client found');
      }
      record.token = token;
      await this.apiClientRepository.save(record);

      await this.auditTrailRepository.insert({
        userId: user.id,
        dbAction: auditAction.RECORD_MODIFIED,
        tableName: 'api_clients',
        resourceId: record.id,
        description: `Updated an API's client password`,
      });
    } catch (error: any) {
      console.log(error);
      message = error.message;
      throw new InternalServerErrorException(message);
    }
    //^ return result
    return { success, message };
  }
}
