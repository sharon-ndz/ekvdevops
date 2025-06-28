import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { PermitClassType } from '../../core/constants/enums';
import { permitClasses } from '../../core/constants/constants';
import { MESSAGES } from '../../core/constants/messages';
import { IsNGPhoneNumber } from '../../core/validators/required.dep';

export class PermitClassDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsIn(permitClasses.map((p) => p.id.toString()), {
    message: MESSAGES.invalidValue('permit class'),
  })
  permitClassId: string;
}

export class NewPermitRequestDto {
  @ApiHideProperty()
  @IsOptional()
  @IsString()
  requestType: string;

  @ApiHideProperty()
  @IsString()
  reference: string;

  @ApiProperty()
  @IsEnum(PermitClassType)
  permitClassId: number;

  @ApiProperty()
  @IsNumber()
  years: number;

  @ApiProperty()
  @IsString()
  studentNo: string;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  permitNo: string;

  @ApiProperty({ required: false })
  @IsEmail({}, { message: 'Email is not valid' })
  @IsOptional()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNGPhoneNumber()
  phone: string;
}
