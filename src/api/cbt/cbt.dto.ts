import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsTime } from '../../core/validators/required.dep';
import { DifficultyLevel, QuestionCategory, Status } from '../../core/constants/enums';
import { GetParam } from '../../core/interfaces/all.dto';
import { MESSAGES } from '../../core/constants/messages';
import { lgas, states } from '../../core/constants/constants';

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
