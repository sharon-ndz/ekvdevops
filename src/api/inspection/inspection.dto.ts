import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { InspectionStatus } from '../../core/constants/enums';
import { BaseRequestDto } from '../../core/interfaces/all.dto';
import { InspectionQuestionsRequestDto, InspectionQuestionsResponseDto, InspectionResponse } from '../../core/constants/classes';
import { Type } from 'class-transformer';

export class NewInspectionDto {
  @ApiProperty()
  @IsNumber()
  drivingSchoolId: number;

  @ApiProperty()
  @IsNumber()
  questionId: number;

  @ApiProperty()
  @IsEnum(InspectionStatus)
  status: string;

  @ApiProperty()
  @IsNumber()
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

export class ListInspectionsQuestionsDto extends BaseRequestDto {

}

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
