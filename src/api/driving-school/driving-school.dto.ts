import {
  IsArray,
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';
import { BaseRequestDto, GetParam } from '../../core/interfaces/all.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MESSAGES } from '../../core/constants/messages';
import { FileInterface, SelectedFileFieldsDto } from '../file/file.dto';
import {
  CourseLevel,
  InspectionStatus,
  Reg,
  StatisticsFilter,
  Status,
} from '../../core/constants/enums';
import { IsInReg, IsNGPhoneNumber, IsValidDateFormat } from '../../core/validators/required.dep';
import { Type } from 'class-transformer';
import {
  bloodGroups,
  genders,
  lgas,
  maritalStatuses,
  nationalities,
  occupations,
  PASSWORD_REGEX,
  relationships,
  salutations,
  states,
} from '../../core/constants/constants';
import { PageOptionsDto } from '../../core/interfaces/page-options.dto';

export class DrivingSchoolDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @ApiProperty()
  @IsOptional()
  logo: string;

  @ApiProperty()
  @IsNGPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsNumber()
  stateId: number;

  @ApiProperty()
  @IsNumber()
  lgaId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEnum(Status, { each: true })
  isActive: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(3, { each: true })
  trainingDurations: number[];
}

export class SelfServiceCreateSchoolDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @ApiProperty()
  @IsOptional()
  logo: string;

  @ApiProperty()
  @IsNGPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsNumber()
  stateId: number;

  @ApiProperty()
  @IsNumber()
  lgaId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rcNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(new RegExp(PASSWORD_REGEX), {
    message: MESSAGES.passwordStrengthFailed,
  })
  password: string;
}

export class UpdateDrivingSchoolDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @ApiProperty()
  @IsOptional()
  logo: string;

  @ApiProperty()
  @IsNGPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsNumber()
  stateId: number;

  @ApiProperty()
  @IsNumber()
  lgaId: number;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEnum(Status, { each: true })
  isActive: number;

  @ApiProperty()
  @IsNumber()
  id: number;
}

export class FetchMasterListDto extends GetParam {
  @ApiProperty({
    required: false,
    example: 25,
  })
  @IsOptional()
  @IsIn(states.map((s) => s.id.toString()), { message: MESSAGES.invalidValue('state') })
  stateId: number;

  @ApiProperty({
    required: false,
    example: 518,
  })
  @IsOptional()
  @IsIn(lgas.map((l) => l.id.toString()), { message: MESSAGES.invalidValue('lga') })
  lgaId: string;
}

export class FetchStudentListDto extends BaseRequestDto {
  @ApiPropertyOptional({
    required: false,
  })
  @IsOptional()
  @IsIn(['0', '1'])
  graduated: string;
}

export class DrivingSchoolCommonDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsIn(salutations.map((s) => s.id), { message: MESSAGES.invalidValue('title') })
  titleId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  middleName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  maidenName: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Email is not valid' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNGPhoneNumber()
  phone: string;

  @ApiProperty({
    enum: [1, 2],
  })
  @IsNotEmpty()
  @IsIn(genders.map((g) => g.id), { message: MESSAGES.invalidValue('gender') })
  genderId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsValidDateFormat()
  dateOfBirth: string;

  @ApiProperty()
  @IsNotEmpty()
  placeOfBirth: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn(nationalities.map((n) => n.id), { message: MESSAGES.invalidValue('nationality') })
  nationalityId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn(states.map((s) => s.id), { message: MESSAGES.invalidValue('state of origin') })
  stateOfOriginId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn(lgas.map((l) => l.id), { message: MESSAGES.invalidValue('lga of origin') })
  lgaOfOriginId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  files: FileInterface[];

  @ApiProperty()
  @IsNotEmpty()
  @IsIn(maritalStatuses.map((s) => s.id), {
    message: MESSAGES.invalidValue('marital status'),
  })
  maritalStatusId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn(bloodGroups.map((b) => b.id), {
    message: MESSAGES.invalidValue('blood group'),
  })
  bloodGroupId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn(occupations.map((o) => o.id), { message: MESSAGES.invalidValue('occupation') })
  occupationId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  trainingDurationId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nextOfKinName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nextOfKinPhone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn(relationships.map((r) => r.id), {
    message: MESSAGES.invalidValue('next of kin relationship'),
  })
  nextOfKinRelationshipId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn(nationalities.map((n) => n.id), { message: MESSAGES.invalidValue('nationality') })
  nextOfKinNationalityId: number;

  @ApiProperty()
  @Length(11, 11)
  @IsNotEmpty()
  nin: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(CourseLevel)
  courseLevel: string;
}

export class SubmitDrivingSchoolApplicationDto extends DrivingSchoolCommonDto {
  @ApiProperty({
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  drivingSchoolId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reference: string;
}

export class UpdateDrivingSchoolApplicationDto extends DrivingSchoolCommonDto {
  @ApiProperty({
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  files: FileInterface[];
}

export class ActionDrivingSchoolApplicationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @ApiProperty({
    type: 'number',
    enum: [1],
  })
  @IsNumber()
  @IsNotEmpty()
  @IsIn([Reg.Approved], { each: true })
  status: number;
}

export class ApplicationStatsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInReg()
  status: string;
}

export class SelectedApplicantFileDto {
  id: number;
  fileId: number;
  documentType: string;
  file?: SelectedFileFieldsDto;
}

export class DrivingSchoolStatsDto {
  @ApiProperty({ example: 127, description: 'Total number of driving schools' })
  totalSchools: number;

  @ApiProperty({ example: 117, description: 'Number of active driving schools' })
  activeSchools: number;

  @ApiProperty({ example: 6, description: 'Number of driving schools on probation' })
  probationSchools: number;

  @ApiProperty({ example: 4, description: 'Number of suspended driving schools' })
  suspendedSchools: number;
}

export class DirivinSchoolListRequestsDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'Search by school name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Search by school identifier' })
  @IsString()
  @IsOptional()
  identifier?: string;

  @ApiPropertyOptional({ description: 'Search by school email' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Search by school phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Filter by status (Active, Inactive, Probation, Suspended)',
    enum: Status,
  })
  @IsEnum(Status)
  @IsOptional()
  @Type(() => Number)
  status: Status;
}
export class AssignOfficerDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  officerId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  inspectionDate: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  drivingSchoolId: number;
}
export class DrivingSchoolApplicationStatsDto {
  @ApiProperty({ example: 127, description: 'Total number of driving school applications' })
  totalApplications: number;

  @ApiProperty({ example: 117, description: 'Total number of inspections' })
  totalInspections: number;

  @ApiProperty({ example: 4, description: 'Number of pending applications' })
  pendingApplications: number;

  @ApiProperty({ example: 4, description: 'Number of acknowledged applications' })
  acknowledgedApplicaitons: number;
}

export class InspectionListRequestsDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'Search by school name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Search by application ID' })
  @IsString()
  @IsOptional()
  applicationId?: string;

  @ApiPropertyOptional({ description: 'Search by school email' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Search by school phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Filter by status (Active, Inactive, Probation, Suspended)',
    enum: Status,
  })
  @IsEnum(Status)
  @IsOptional()
  @Type(() => Number)
  status?: Status;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtEnd?: string;
}

export class ListApplicationsDto extends BaseRequestDto {
  @ApiPropertyOptional({ description: 'Registration status filter', enum: Reg })
  @IsOptional()
  @IsString()
  regStatus?: Reg.Approved | Reg.Pending | Reg.Queried;

  @ApiPropertyOptional({ description: 'Status filter', enum: [Status.Active | Status.Inactive] })
  @IsOptional()
  @IsString()
  isActive?: Status.Active | Status.Inactive;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stateId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lgaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtEnd?: string;
}

export class listDrivingSchoolInspectionsDto extends BaseRequestDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: InspectionStatus })
  @IsEnum(InspectionStatus)
  @IsOptional()
  status?: InspectionStatus;
}
export class CompleteSchoolApplicationDto {
  @ApiProperty({ example: 10, description: 'Total number of vehicles available' })
  @IsNumber()
  @IsNotEmpty()
  totalVehicles: number;

  @ApiProperty({
    example: ['Mini Pick-ups', 'Motorcycle', 'SUVs'],
    description: 'Types of vehicles available',
  })
  @IsString({ each: true })
  @IsNotEmpty()
  vehicleTypes: string[];

  @ApiProperty({ example: 'None', description: 'Special gadgets in vehicles, if any' })
  @IsString()
  @IsOptional()
  specialGadgets?: string;

  @ApiProperty({ example: 5, description: 'Total number of driving simulators' })
  @IsNumber()
  @IsNotEmpty()
  totalSimulators: number;

  @ApiProperty({ example: 'Instructor guide', description: 'Teaching aids available' })
  @IsString()
  @IsOptional()
  teachingAids?: string;

  @ApiProperty({ example: '50 kilometers', description: 'Training range location' })
  @IsString()
  @IsOptional()
  trainingRange?: string;

  @ApiProperty({ example: 10, description: 'Total number of classrooms' })
  @IsNumber()
  @IsNotEmpty()
  totalClassrooms: number;

  @ApiProperty({ example: '10 Person', description: 'Classroom capacity' })
  @IsString()
  @IsOptional()
  classRoomCapacity?: string;

  @ApiProperty({ example: 2, description: 'Total number of instructors' })
  @IsNumber()
  @IsNotEmpty()
  totalInstructors: number;

  @ApiProperty({ example: ['IN-676633', 'IN-092993', 'IN-234165'], description: 'Instructor IDs' })
  @IsString({ each: true })
  @IsNotEmpty()
  instructorIDs: string[];

  @ApiProperty()
  @IsString()
  docType: string;

  @ApiProperty()
  @IsString()
  docFile: string;
}

export class toggleSchoolStatusDto {
  @ApiProperty({ description: 'status (Active, Inactive, Probation, Suspended)', enum: Status })
  @IsEnum(Status)
  @Type(() => Number)
  status?: Status;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.status === Status.Suspended)
  reason?: string;
}

export class DrivingSchoolQueryApplicationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class FetchDashboardStatsRequestDto {
  @ApiProperty({
    description: 'Query statistics status by (Driving Schools, Students, LASDRI Officers, Revenue)',
    enum: StatisticsFilter,
  })
  @IsEnum(StatisticsFilter)
  type: StatisticsFilter;

  @ApiPropertyOptional({
    description: 'Filter revenue monthly breakdown statistics by the selected year',
  })
  @IsOptional()
  selectedYear?: number;

  @ApiPropertyOptional({ description: 'Top LGA revenue count to display' })
  @IsOptional()
  topLgaCount?: number;

  @ApiPropertyOptional({ description: 'Bottom LGA revenue count to display' })
  @IsOptional()
  bottomLgaCount?: number;
}
