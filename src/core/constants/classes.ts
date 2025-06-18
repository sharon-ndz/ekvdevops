import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class InspectionQuestionsRequestDto {
  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsString({ each: true })
  options: string[];

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

  @ApiProperty()
  options: string[];

  @ApiProperty()
  correctAnswer: string;
  @ApiProperty()
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