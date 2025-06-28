import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { InpectionQuestionCategory } from "./enums";
import { Type } from "class-transformer";


export class OptionsDto {
  @ApiProperty({ example: "Option A" })
  @IsString()
  label: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  marks: number;
}

export class InspectionQuestionsRequestDto {
  @ApiHideProperty()
  @IsOptional()
  id: number;

  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty({ enum: InpectionQuestionCategory })
  @IsEnum(InpectionQuestionCategory)
  category: InpectionQuestionCategory;

  @ApiProperty({
    type: [OptionsDto],
    description: 'List of available options for the question',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionsDto)
  options: OptionsDto[];

  @ApiProperty()
  @IsString()
  correctAnswer: string;
}

export class InspectionQuestionsResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  question: string;

  @ApiProperty()
  category: string;

  @ApiProperty({
    type: [OptionsDto],
  })
  @IsArray()
  @Type(() => OptionsDto)
  options: OptionsDto[];

  @ApiHideProperty()
  correctAnswer: string;

  @ApiHideProperty()
  score: number;
}

export class InspectionResponse {
  @ApiProperty()
  @IsNumber()
  questionId: number;

  @ApiProperty()
  @IsString()
  choice: string;

  @ApiProperty()
  @IsString()
  comment: string;
}