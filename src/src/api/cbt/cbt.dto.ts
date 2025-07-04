import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNGPhoneNumber, IsTime } from '../../core/validators/required.dep';
import { TestStatus, DifficultyLevel, QuestionCategory, Status } from '../../core/constants/enums';
import { BaseRequestDto, GetParam } from '../../core/interfaces/all.dto';
import { MESSAGES } from '../../core/constants/messages';
import { lgas, states } from '../../core/constants/constants';
import { Expose, Type } from 'class-transformer';

export class CbtCenterIdDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  cbtCenterId: number;
}

export class BookSlotDto {
  @ApiProperty()
  @IsNumber()
  cbtCenterId: number;

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

export class CreateCbtCenterDto {
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
  @IsString()
  name: string;

  @ApiHideProperty()
  @IsOptional()
  isActive: number;

  @ApiHideProperty()
  @IsOptional()
  identifier: string;

  @ApiProperty()
  @IsNGPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  address: string;
}

export class UpdateCbtCenterDto extends CreateCbtCenterDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsEnum(Status, { message: MESSAGES.invalidValue('status') })
  @IsOptional()
  isActive: number;
}

export class CbtScheduleDto {
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
  cbtStatus: string;

  @ApiHideProperty()
  @IsNumber()
  @IsOptional()
  transactionId: number;
}

export class CbtRescheduleDto extends CbtScheduleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reference: string;

  @ApiHideProperty()
  @IsNumber()
  @IsOptional()
  transactionId: number;

  @ApiProperty()
  @IsNumber()
  studentId: number;

  @ApiProperty()
  @IsNumber()
  cbtCenterId: number;
}

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty()
  @IsArray()
  options: { id: string; text: string }[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiProperty()
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel: number;

  @ApiProperty()
  @IsEnum(QuestionCategory)
  @IsOptional()
  category: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  timeLimit?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  questionType?: string;
}

export class UpdateQuestionDto extends CreateQuestionDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  id: number;
}

export class FetchQuestionsDto extends GetParam {
  @ApiProperty()
  @IsString()
  @IsOptional()
  category: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  difficultyLevel: number;
}

export class QuestionByStudentDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  studentNo: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsOptional()
  difficultyLevel: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsOptional()
  category: number;
}

export class SubmitTestDto extends QuestionByStudentDto {
  @ApiProperty({
    required: true,
  })
  @IsObject()
  answers: { [questionId: number]: string };
}

export class CbtCenterResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  stateId: number;

  @ApiProperty()
  @Expose()
  lgaId: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  isActive: number;

  @ApiProperty()
  @Expose()
  identifier: string;

  @ApiProperty()
  @Expose()
  phone: string;

  @ApiProperty()
  @Expose()
  email?: string;

  @ApiProperty()
  @Expose()
  threshold: number;

  @ApiProperty()
  @Expose()
  devices: number;

  @ApiProperty()
  @Expose()
  address?: string;
}

export class ListCbtScheduleRequestDto extends BaseRequestDto {
  @ApiPropertyOptional({ enum: TestStatus })
  @IsOptional()
  @IsEnum(TestStatus)
  cbtStatus?: TestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtEnd?: string;
}

export class ApplicationInfoDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  applicationNo: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiProperty()
  @Expose()
  middleName: string;

  @ApiProperty()
  @Expose()
  email: string;
}

export class StudentInfoDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty({ type: () => ApplicationInfoDto })
  @Expose()
  @Type(() => ApplicationInfoDto)
  application: ApplicationInfoDto;
}

export class CbtScheduleResponseDto {
  @ApiProperty({ type: () => Number })
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  date: string;

  @ApiProperty()
  @Expose()
  time: string;

  @ApiProperty()
  @Expose()
  cbtStatus: string;

  @ApiProperty({ type: () => Number })
  @Expose()
  score: number;

  @ApiProperty({ type: () => StudentInfoDto })
  @Expose()
  @Type(() => StudentInfoDto)
  student: StudentInfoDto;

  @ApiProperty()
  @Expose()
  @Type(() => CbtCenterResponseDto)
  cbtCenter: CbtCenterResponseDto;
}

export class TestStatsDto {
  @ApiProperty()
  allApplications: number;

  @ApiProperty()
  reScheduled: number;

  @ApiProperty()
  scheduled: number;

  @ApiProperty()
  failed: number;

  @ApiProperty()
  passed: number;
}

export class UpdateDeviceThresholdDto {
  @ApiProperty()
  @IsNumber()
  centerId: number;

  @ApiProperty()
  @IsNumber()
  threshold: number;

  @ApiProperty()
  @IsNumber()
  devices: number;
}

export class CbtCenterStatsDto {
  @ApiProperty({ example: 127, description: 'Total number of cbt centers' })
  totalCenters: number;

  @ApiProperty({ example: 117, description: 'Number of active cbt centers' })
  activeCenters: number;

  @ApiProperty({ example: 6, description: 'Number of cbt centers on probation' })
  probationCenters: number;

  @ApiProperty({ example: 4, description: 'Number of suspended cbt centers' })
  suspendedCenters: number;
}
