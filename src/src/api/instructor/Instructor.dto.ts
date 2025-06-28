import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, IsIn } from 'class-validator';
import { genders, lgas, states } from 'src/core/constants/constants';
import { Status } from 'src/core/constants/enums';
import { MESSAGES } from 'src/core/constants/messages';
import { IsValidDateFormat } from 'src/core/validators/required.dep';

export class CreateInstructorDto {
  @ApiProperty({ description: 'Name of the instructor' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Avatar URL of the instructor', required: false })
  @IsString()
  @IsOptional()
  avatar: string;

  @ApiProperty({ description: 'Phone number of the instructor' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Email address of the instructor' })
  @IsEmail({}, { message: 'Email is not valid' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Date of birth of the instructor' })
  @IsNotEmpty()
  @IsValidDateFormat()
  dateOfBirth: string;

  @ApiProperty({
    description: 'Gender ID of the instructor',
    enum: genders.map((g) => g.id),
  })
  @IsNumber()
  @IsNotEmpty()
  @IsIn(genders.map((g) => g.id), { message: MESSAGES.invalidValue('gender') })
  genderId: number;

  @ApiProperty({
    description: 'LGA ID of the instructor',
    example: 518,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsIn(lgas.map((l) => l.id), { message: MESSAGES.invalidValue('lga') })
  lgaId: number;

  @ApiProperty({
    description: 'State ID of the instructor',
    example: 25,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsIn(states.map((s) => s.id), { message: MESSAGES.invalidValue('state') })
  stateId: number;

  @ApiProperty({ description: 'Address of the instructor' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Status of the instructor',
    enum: Status,
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(Status), { message: MESSAGES.invalidValue('status') })
  isActive: number;

  @IsOptional()
  instructorId?: string;

  @ApiProperty()
  @IsNumber()
  drivingSchoolId: number;
}

export class InstructorResponseDto {
  @ApiProperty({ description: 'ID of the instructor' })
  id: number;

  @ApiProperty({ description: 'Name of the instructor' })
  name: string;

  @ApiProperty({ description: 'Avatar URL of the instructor', required: false })
  avatar: string;

  @ApiProperty({ description: 'Phone number of the instructor' })
  phone: string;

  @ApiProperty({ description: 'Email address of the instructor' })
  email: string;

  @ApiProperty({ description: 'Date of birth of the instructor' })
  dateOfBirth: string;

  @ApiProperty({
    description: 'Gender ID of the instructor',
  })
  genderId: number;

  @ApiProperty({
    description: 'LGA ID of the instructor',
  })
  lgaId: number;

  @ApiProperty({
    description: 'State ID of the instructor',
    example: 25,
  })
  stateId: number;

  @ApiProperty({ description: 'Address of the instructor' })
  address: string;

  @ApiProperty({
    description: 'Status of the instructor'
  })
  isActive: number;

  @ApiProperty()
  instructorId?: string;

  @ApiProperty()
  @IsNumber()
  drivingSchoolId: number;
}
