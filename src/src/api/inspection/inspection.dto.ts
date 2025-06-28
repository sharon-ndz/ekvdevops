import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { InspectionStatus, Reg } from '../../core/constants/enums';
import { BaseRequestDto } from '../../core/interfaces/all.dto';
import {
  InspectionQuestionsRequestDto,
  InspectionQuestionsResponseDto,
  InspectionResponse,
} from '../../core/constants/classes';
import { Type } from 'class-transformer';

export class NewInspectionDto {
  @ApiProperty()
  @IsNumber()
  drivingSchoolId: number;

  @ApiProperty()
  @IsNumber()
  questionId: number;

  @ApiHideProperty()
  @IsOptional()
  status: string;

  @ApiHideProperty()
  @IsOptional()
  totalScore: number;

  @ApiHideProperty()
  stateId: number;

  @ApiHideProperty()
  @IsOptional()
  queryReasons?: string[];

  @ApiPropertyOptional({ type: [InspectionResponse] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InspectionResponse)
  inspectionResult: InspectionResponse[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  month?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment: string;
}

export class ListInspectionsDto extends BaseRequestDto {
  @ApiPropertyOptional({ description: 'Registration status filter', enum: InspectionStatus })
  @IsOptional()
  @IsString()
  status?: InspectionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtEnd?: string;
}

export class ListAssignedInspectionsDto extends BaseRequestDto {
  @ApiPropertyOptional({
    description: 'Registration status filter (1. Approved, 5. Assigned)',
    enum: [Reg.Approved, Reg.Assigned],
  })
  @IsOptional()
  status?: Reg.Approved | Reg.Assigned;
}

export class ListInspectionsQuestionsDto extends BaseRequestDto {}

export class InspectionQuestionReqDto {
  @ApiProperty({
    type: [InspectionQuestionsRequestDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InspectionQuestionsRequestDto)
  questions: InspectionQuestionsRequestDto[];

  @ApiProperty()
  @IsNumber()
  stateId: number;
}

export class InspectionQuestionResDto {
  @ApiProperty({
    type: [InspectionQuestionsResponseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InspectionQuestionsResponseDto)
  questions: InspectionQuestionsResponseDto[];

  @ApiProperty()
  stateId: number;
}
