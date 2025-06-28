import { ApiClient } from '../../entities/api-client.entity';
import { PaginationInterface } from '../../core/interfaces/all.interface';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPermission } from '../../middlewares/api-client-permission';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '../../core/constants/enums';
import { IsNGPhoneNumber } from '../../core/validators/required.dep';

export interface ApiClientCreateResultInterface {
  success: boolean;
  message: string;
  data: ApiClient | null;
}

export interface ApiClientResultInterface {
  result: ApiClient[];
  pagination: PaginationInterface;
}

export class ApiClientChangeStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    type: 'number',
  })
  @IsNotEmpty()
  @IsIn([Status.Active, Status.Inactive])
  status: number;
}

export class ApiClientCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Email is not valid' })
  @IsNotEmpty()
  clientEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNGPhoneNumber()
  clientPhone: string;

  @ApiProperty({
    type: 'array',
    items: {},
  })
  @IsArray()
  @IsIn(Object.values(ApiPermission), { each: true })
  @IsNotEmpty({ each: true })
  permissions: ApiPermission[];
}

export class ApiClientUpdateDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty({
    required: false,
  })
  @IsEmail({}, { message: 'Email is not valid' })
  @IsOptional()
  @IsNotEmpty()
  clientEmail: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsNGPhoneNumber()
  clientPhone: string;

  @ApiProperty({
    required: false,
    type: 'array',
    items: {},
  })
  @IsArray()
  @IsOptional()
  @IsIn(Object.values(ApiPermission), { each: true })
  @IsNotEmpty({ each: true })
  permissions: ApiPermission[];
}

export class ApiClientAuthDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identity: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  secret: string;
}

export class ApiClientResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  id: number;
}
