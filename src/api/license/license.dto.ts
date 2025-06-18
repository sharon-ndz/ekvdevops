import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CbtScheduleDto } from '../cbt/cbt.dto';
import { lgas, licenseClasses, nationalities, states } from '../../core/constants/constants';
import { FileInterface } from '../file/file.dto';
import {
  LicenseStatType,
  LicenseStatus,
  ReplacementReason,
  Sources, Status
} from "../../core/constants/enums";
import { MESSAGES } from '../../core/constants/messages';
import { IsNGPhoneNumber } from '../../core/validators/required.dep';

export class LicenseStatsDto {
  @ApiProperty()
  @IsEnum(LicenseStatType)
  type: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(LicenseStatus)
  status: string;
}

export class LicenseStatsWithYearDto extends LicenseStatsDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  year: string;
}

export class ApproveLicenseDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  licenseId: number;

  @ApiProperty()
  @IsIn(licenseClasses.map((l) => l.id), { message: MESSAGES.invalidValue('license class') })
  licenseClassId: number;

  @ApiProperty()
  @IsNumber()
  years: number;
}

export class UpdateLicenseDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  licenseId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(LicenseStatus)
  status: string;

  @ApiProperty()
  @IsEnum(Status)
  isActive: number;
}

export class ExpireLicenseDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  licenseId: number;
}

export class ValidateLicenseDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  licenseNo: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  drivingCertNo: string;
}

export class AttachFilesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  applicationNo: string;

  // @ApiProperty()
  // @IsString()
  // @IsOptional()
  // reference: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  files?: FileInterface[];
}

export class PreRegistrationRequestDto extends CbtScheduleDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  cbtCenterId: number;

  @ApiHideProperty()
  @IsOptional()
  cbtScheduleId: number;

  @ApiHideProperty()
  @IsOptional()
  studentId: number;

  @ApiHideProperty()
  @IsOptional()
  drivingSchoolId: number;

  @ApiHideProperty()
  @IsOptional()
  drivingTestScheduleId: number;

  @ApiProperty()
  @IsOptional()
  @IsIn(licenseClasses.map((l) => l.id), { message: MESSAGES.invalidValue('license class') })
  licenseClassId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  years: number;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  rrr: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  certificateNo: string;

  @ApiHideProperty()
  @IsOptional()
  applicationNo: string;

  @ApiHideProperty()
  @IsOptional()
  direct: boolean;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  files?: FileInterface[];

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  successRedirectUrl: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  failureRedirectUrl: string;
}

export class RenewalPreRegistrationDto extends CbtScheduleDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  drivingTestCenterId: number;

  @ApiHideProperty()
  @IsOptional()
  drivingTestScheduleId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldLicenseNo: string;

  @ApiHideProperty()
  @IsOptional()
  studentId: number;

  @ApiHideProperty()
  @IsOptional()
  drivingSchoolId: number;

  @ApiProperty()
  @IsIn(licenseClasses.map((l) => l.id), { message: MESSAGES.invalidValue('license class') })
  licenseClassId: number;

  @ApiProperty()
  @IsNumber()
  years: number;

  @ApiProperty()
  @IsEnum(Sources, { each: true })
  source: string;

  @ApiHideProperty()
  @IsOptional()
  applicationNo: string;

  @ApiHideProperty()
  @IsOptional()
  direct: boolean;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  files?: FileInterface[];

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  successRedirectUrl: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  failureRedirectUrl: string;
}

export class NewLicenseRequestDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  weight: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  height: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  eyes: string;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  requestType: string;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  reference: string;

  @ApiProperty()
  @IsIn(licenseClasses.map((l) => l.id), { message: MESSAGES.invalidValue('license class') })
  licenseClassId: number;

  @ApiProperty()
  @IsNumber()
  years: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  applicationNo: string;

  @ApiProperty({ required: false })
  @IsEmail({}, { message: 'Email is not valid' })
  @IsOptional()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNGPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsIn(nationalities.map((n) => n.id), { message: MESSAGES.invalidValue('nationality') })
  nationalityId: number;

  @ApiProperty()
  @IsIn(states.map((s) => s.id), { message: MESSAGES.invalidValue('state of origin') })
  stateId: number;

  @ApiProperty()
  @IsIn(lgas.map((l) => l.id), { message: MESSAGES.invalidValue('lga of origin') })
  lgaId: number;
}

export class RenewalLicenseRequestDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  weight: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  height: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  eyes: string;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  reference: string;

  @ApiProperty()
  @IsIn(licenseClasses.map((l) => l.id), { message: MESSAGES.invalidValue('license class') })
  @IsOptional()
  licenseClassId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  years: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldLicenseNo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  applicationNo: string;

  @ApiProperty({ required: false })
  @IsEmail({}, { message: 'Email is not valid' })
  @IsOptional()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNGPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsIn(nationalities.map((n) => n.id), { message: MESSAGES.invalidValue('nationality') })
  nationalityId: number;

  @ApiProperty()
  @IsIn(states.map((s) => s.id), { message: MESSAGES.invalidValue('state of origin') })
  stateId: number;

  @ApiProperty()
  @IsIn(lgas.map((l) => l.id), { message: MESSAGES.invalidValue('lga of origin') })
  lgaId: number;

  @ApiProperty()
  @IsEnum(Sources, { each: true })
  source: string;

  @ApiProperty()
  @IsBoolean()
  isExternal: boolean;

  @ApiHideProperty()
  @IsOptional()
  requestType: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  successRedirectUrl: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  failureRedirectUrl: string;
}

export class MobileRenewalLicenseRequestDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  weight: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  height: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  eyes: string;

  @ApiProperty()
  @IsString()
  reference: string;

  @ApiProperty()
  @IsIn(licenseClasses.map((l) => l.id), { message: MESSAGES.invalidValue('license class') })
  @IsOptional()
  licenseClassId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  years: number;

  @ApiProperty()
  @IsString()
  oldLicenseNo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  applicationNo: string;

  @ApiProperty({ required: false })
  @IsEmail({}, { message: 'Email is not valid' })
  @IsOptional()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNGPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsIn(nationalities.map((n) => n.id), { message: MESSAGES.invalidValue('nationality') })
  nationalityId: number;

  @ApiProperty()
  @IsIn(states.map((s) => s.id), { message: MESSAGES.invalidValue('state of origin') })
  stateId: number;

  @ApiProperty()
  @IsIn(lgas.map((l) => l.id), { message: MESSAGES.invalidValue('lga of origin') })
  lgaId: number;

  @ApiProperty()
  @IsEnum(Sources, { each: true })
  source: string;

  @ApiProperty()
  @IsBoolean()
  isExternal: boolean;

  @ApiHideProperty()
  @IsOptional()
  requestType: string;

  @ApiHideProperty()
  @IsOptional()
  status?: string;
}

export class ReplaceLicenseRequestDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  weight: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  height: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  eyes: string;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  reference: string;

  @ApiProperty()
  @IsIn(licenseClasses.map((l) => l.id), { message: MESSAGES.invalidValue('license class') })
  @IsOptional()
  licenseClassId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  years: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldLicenseNo: string;

  @ApiProperty({ required: false })
  @IsEmail({}, { message: 'Email is not valid' })
  @IsOptional()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNGPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsIn(nationalities.map((n) => n.id), { message: MESSAGES.invalidValue('nationality') })
  nationalityId: number;

  @ApiProperty()
  @IsIn(states.map((s) => s.id), { message: MESSAGES.invalidValue('state of origin') })
  stateId: number;

  @ApiProperty()
  @IsIn(lgas.map((l) => l.id), { message: MESSAGES.invalidValue('lga of origin') })
  lgaId: number;

  @ApiProperty()
  @IsEnum(Sources, { each: true })
  source: string;

  @ApiProperty()
  @IsBoolean()
  isExternal: boolean;

  @ApiHideProperty()
  @IsOptional()
  requestType: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  successRedirectUrl: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  failureRedirectUrl: string;

  @ApiProperty()
  @IsEnum(ReplacementReason, { each: true })
  replacementReason: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  affidavitNo: string;
}

export class MobileReplaceLicenseRequestDto extends MobileRenewalLicenseRequestDto {
  @ApiProperty()
  @IsEnum(ReplacementReason, { each: true })
  replacementReason: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  affidavitNo: string;

  @ApiHideProperty()
  @IsOptional()
  status?: string;
}
