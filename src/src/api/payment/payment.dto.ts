import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseRequestDto } from '../../core/interfaces/all.dto';
import { ActiveInactiveStatus, PaymentStatus, TransactionType } from '../../core/constants/enums';
import { RequiredIfValueIs } from '../../core/validators/required.dep';
import { Type } from 'class-transformer';
import { lgas, states } from '../../core/constants/constants';
import { MESSAGES } from '../../core/constants/messages';

export class PaymentSettingsListRequestsDto extends BaseRequestDto {
  @ApiPropertyOptional({ description: 'Search by payment name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  drivingSchoolId?: string;

  @ApiPropertyOptional({
    description: 'Filter by status (Active: 1, Inactive: 0)',
    enum: ActiveInactiveStatus,
  })
  @IsEnum(ActiveInactiveStatus)
  @IsOptional()
  @Type(() => Number)
  status: ActiveInactiveStatus;
}

export class PaymentSettingsDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  drivingSchoolId?: number;

  @ApiProperty({
    example: 25,
  })
  @IsNotEmpty()
  @IsIn(states.map((s) => s.id.toString()), { message: MESSAGES.invalidValue('state') })
  stateId: number;

  @ApiProperty({
    example: 518,
  })
  @IsNotEmpty()
  @IsIn(lgas.map((l) => l.id.toString()), { message: MESSAGES.invalidValue('lga') })
  lgaId: number;

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty()
  @IsNumberString()
  @IsOptional()
  charges: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  prefix: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ enum: ActiveInactiveStatus })
  @IsEnum(ActiveInactiveStatus)
  @IsOptional()
  status?: ActiveInactiveStatus;
}

export class UpdatePaymentSettingsDto extends PaymentSettingsDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class ValidateTransactionDto {
  @ApiPropertyOptional()
  @IsIn(Object.values(TransactionType))
  type: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  successIndicator: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  reference: string;
}

export class PaymentDetailsDto {
  reference: string;
  currency: string;
  amountToPay: number;
  amount: number;
  charges: number;
}

export class ReferenceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  trxref: string;
}

export class UpdatePaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty()
  @IsString()
  @IsIn(Object.values(TransactionType))
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(PaymentStatus))
  status: string;

  @ApiProperty()
  @IsNumber()
  @IsIn([0, 1])
  used: number;
}

export class PaymentDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(TransactionType))
  type: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  drivingSchoolId: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  orderId: number;

  @ApiHideProperty()
  @RequiredIfValueIs('type', TransactionType.unit, PaymentDto)
  @IsNumber()
  amount: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  currency: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  successRedirectUrl: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  failureRedirectUrl: string;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  redirectUrl: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  description: string;
}

export class RevenueStatsWithYearDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  year: string;
}

export class ListTransactionLogDto extends BaseRequestDto {
  @ApiPropertyOptional({
    description: 'Transaction type filter',
    enum: Object.values(TransactionType),
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Transaction status filter',
    enum: Object.values(PaymentStatus),
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtEnd?: string;
}

export class TransactionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: PaymentStatus;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  channel: string | null;

  @ApiProperty()
  type: TransactionType;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  log: string;

  @ApiProperty()
  itemType: string;

  @ApiProperty()
  itemId: number;

  @ApiProperty()
  provider: number;

  @ApiProperty()
  used: number;

  @ApiProperty()
  charges: number;

  @ApiProperty()
  refunded: boolean;
}
