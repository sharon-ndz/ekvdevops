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
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNGPhoneNumber, IsTime } from '../../core/validators/required.dep';
import { drivingTestAnswer } from '../../core/interfaces/all.interface';
import { FileInterface } from "../file/file.dto";
import { BookingStatus, Status } from "../../core/constants/enums";
import { MESSAGES } from "../../core/constants/messages";
import { lgas, states } from "../../core/constants/constants";

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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  applicationNo: string;

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
  reference?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  transactionId?: number;
}
