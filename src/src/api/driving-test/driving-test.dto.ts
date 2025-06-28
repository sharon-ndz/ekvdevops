import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNGPhoneNumber, IsTime } from '../../core/validators/required.dep';
import { drivingTestAnswer } from '../../core/interfaces/all.interface';
import { FileInterface } from '../file/file.dto';
import { BookingStatus, TestStatus, Status } from '../../core/constants/enums';
import { MESSAGES } from '../../core/constants/messages';
import { lgas, licenseClasses, states } from "../../core/constants/constants";
import { BaseRequestDto } from '../../core/interfaces/all.dto';
import { Exclude, Expose, Transform, Type } from "class-transformer";

export class DrivingTestCenterIdDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  drivingTestCenterId: number;
}

export class BookDrivingTestSlotDto extends DrivingTestCenterIdDto {
  @ApiProperty()
  @IsNumber()
  studentId: number;

  @ApiProperty()
  @IsIn(states.map((s) => s.id), { message: MESSAGES.invalidValue('state') })
  stateId: number;

  @ApiProperty()
  @IsIn(lgas.map((l) => l.id), { message: MESSAGES.invalidValue('lga') })
  lgaId: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty()
  @IsTime()
  @IsNotEmpty()
  time: string;
}

export class CreateDrivingTestCenterDto {
  @ApiProperty({
    required: true,
  })
  @IsIn(states.map((s) => s.id), { message: MESSAGES.invalidValue('state') })
  stateId: number;

  @ApiProperty({
    required: true,
  })
  @IsIn(lgas.map((l) => l.id), { message: MESSAGES.invalidValue('lga') })
  lgaId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @ApiProperty()
  @IsNGPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  devices: number;

  @ApiProperty()
  @IsNumber()
  threshold: number;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsEnum(Status, { message: MESSAGES.invalidValue('status') })
  @IsOptional()
  isActive: number;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  identifier: string;
}

export class UpdateDrivingTestCenterDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsIn(states.map((s) => s.id), { message: MESSAGES.invalidValue('state') })
  @IsOptional()
  stateId: number;

  @ApiProperty()
  @IsIn(lgas.map((l) => l.id), { message: MESSAGES.invalidValue('lga') })
  @IsOptional()
  lgaId: number;

  @ApiProperty()
  @IsEmail({}, { message: 'Email is not valid' })
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsNGPhoneNumber()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  devices: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  threshold: number;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsEnum(Status, { message: MESSAGES.invalidValue('status') })
  @IsOptional()
  isActive: number;
}

export class DrivingTestScheduleDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsIn(states.map((s) => s.id), { message: MESSAGES.invalidValue('state') })
  stateId: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsIn(lgas.map((l) => l.id), { message: MESSAGES.invalidValue('lga') })
  lgaId: number;

  @ApiProperty({
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    required: true,
  })
  @IsTime()
  @IsNotEmpty()
  time: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  years: number;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  @IsIn(Object.values(BookingStatus))
  bookingStatus: BookingStatus;

  @ApiHideProperty()
  @IsNumber()
  @IsOptional()
  transactionId: number;

  @ApiHideProperty()
  @IsBoolean()
  @IsOptional()
  canCreate: boolean;
}

export class SubmitDrivingTestDto {
  @ApiProperty({
    required: true,
  })
  @IsArray()
  answers: drivingTestAnswer[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(licenseClasses.map((l) => l.id), {
    message: MESSAGES.invalidValue('license class'),
  })
  licenseClassId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  applicationNo: string;

  @ApiProperty()
  @IsNumber()
  score: number;

  @ApiHideProperty()
  @IsNumber()
  @IsOptional()
  assessedBy: number;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  files?: FileInterface[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Exclude()
  reference: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  transactionId?: number;
}

export class ListCbtScheduleRequestDto extends BaseRequestDto {
  @ApiPropertyOptional({ enum: TestStatus })
  @IsOptional()
  @IsEnum(TestStatus)
  status?: TestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtEnd?: string;
}

export class DrivingSchoolApplicationDto {
  @ApiProperty()
  @Expose()
  applicationNo: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  middleName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  phone: string;
}

class StudentDot {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Type(() => DrivingSchoolApplicationDto)
  @Expose()
  application: DrivingSchoolApplicationDto;
}

class PreRegistrationDot {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  applicationNo: string;
}

export class DrivingTestScheduleResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  date: string;

  @ApiProperty()
  @Expose()
  status: TestStatus;

  @ApiProperty()
  @Expose()
  score: number;

  @ApiProperty()
  @Type(() => StudentDot)
  @Expose()
  student: StudentDot;

  @ApiProperty()
  @Type(() => PreRegistrationDot)
  @Expose()
  preRegistration: PreRegistrationDot;
}
