import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DataSource, QueryRunner } from 'typeorm';
import { Order } from '../constants/enums';

export class ApplicationNoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  applicationId: string;
}

export class StudentNoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  studentCertNo: string;
}

export class LicenseNoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  licenseNo: string;
}

export class RejectParam {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class GetParam {
  @IsOptional()
  search: any;

  @IsOptional()
  resultPerPage: any;

  @IsOptional()
  page: any;
}

export class PaymentParam {
  @IsString()
  @IsNotEmpty()
  email: any;

  @IsString()
  @IsNotEmpty()
  callbackUrl: any;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Action status response message' })
  message!: string;
}

export class ErrorData {
  message: string;
  details?: any;

  constructor(message: string, details?: any) {
    this.message = message;
    this.details = details;
    Object.setPrototypeOf(this, ErrorData.prototype);
  }
}

export async function beginTransaction(dataSource: DataSource): Promise<QueryRunner> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  return queryRunner;
}

export class BaseRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  search?: string;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  resultPerPage?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  page?: number;

  @ApiPropertyOptional({ enum: Order })
  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  order?: Order.ASC | Order.DESC = Order.DESC;
}
