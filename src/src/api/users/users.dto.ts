import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from '../../middlewares/roles';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileInterface } from '../file/file.dto';
import { Type } from 'class-transformer';
import { BaseRequestDto } from '../../core/interfaces/all.dto';
import { IsNGPhoneNumber, RequiredIfValueInArray } from '../../core/validators/required.dep';
import { Status } from '../../core/constants/enums';

export class UserDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  middleName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @ApiProperty()
  @IsNGPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @RequiredIfValueInArray('roleId', [Role.FRSC, Role.SchoolAdmin, Role.LASDRI_ADMIN, Role.LASDRI], UserDto)
  @IsNumber()
  stateId: number;

  @ApiProperty()
  @RequiredIfValueInArray('roleId', [Role.FRSC, Role.SchoolAdmin, Role.LASDRI_ADMIN, Role.LASDRI], UserDto)
  @IsNumber()
  lgaId: number;

  @ApiProperty()
  @RequiredIfValueInArray('roleId', [Role.SchoolAdmin], UserDto)
  @IsNumber()
  drivingSchoolId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  permissions: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEnum(Status, { each: true })
  isActive: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address: string;
}

export class AttachUserBiometricsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @ApiProperty()
  @IsArray()
  files: FileInterface[];
}

export class CreateUserDto extends UserDto {
  @ApiHideProperty()
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsEnum(Role, { each: true })
  roleId: number;

  @ApiHideProperty()
  @IsOptional()
  roleName: string;
}

export class UpdateUserDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  middleName: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @ApiProperty({
    required: false,
  })
  @IsNGPhoneNumber()
  @IsOptional()
  phone: string;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsOptional()
  roleId: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  roleName: string;

  @ApiProperty({
    required: false,
  })
  @RequiredIfValueInArray('roleId', [Role.FRSC, Role.SchoolAdmin], UserDto)
  @IsNumber()
  @IsNotEmpty()
  stateId: number;

  @ApiProperty({
    required: false,
  })
  @RequiredIfValueInArray('roleId', [Role.FRSC, Role.SchoolAdmin], UserDto)
  @IsNumber()
  @IsNotEmpty()
  lgaId: number;

  @ApiProperty({
    required: false,
  })
  @RequiredIfValueInArray('roleId', [Role.SchoolAdmin], UserDto)
  @IsNumber()
  drivingSchoolId: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  permissions: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEnum(Status, { each: true })
  isActive: number;

  @ApiHideProperty()
  @IsOptional()
  password: string;
}

export class ChangeUserPasswordDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  newPassword: string;
}

export class UpdateMeDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  middleName: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({
    required: false,
  })
  @IsNGPhoneNumber()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  stateId: number;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsOptional()
  lgaId: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address?: string;
}

export class UserStatsDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  inactiveUsers: number;

  @ApiProperty()
  newUsers: number;

  @ApiProperty()
  lasdriAdmins: number;

  @ApiProperty()
  lasdriOfficers: number;
}

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  middleName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  roleId: number;

  @ApiProperty()
  roleName: string;

  @ApiProperty()
  stateId: number;

  @ApiProperty()
  lgaId: number;

  @ApiProperty()
  drivingSchoolId: number;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  changePasswordNextLogin: boolean;

  @ApiProperty()
  isActive: number;

  @ApiProperty()
  createdAt: Date;
}

export class UserListRequestDto extends BaseRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stateId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lgaId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  drivingSchoolId: number;

  @ApiPropertyOptional({
    description: 'status (Active, Inactive, Probation, Suspended)',
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status)
  @Type(() => Number)
  status?: Status;

  @ApiPropertyOptional({ description: 'Role ID of the user', enum: Role })
  @IsOptional()
  @IsEnum(Role)
  @Type(() => Number)
  roleId?: Role;
}

export class toggleUserStatusDto {
  @ApiPropertyOptional({
    description: 'status (Active, Inactive)',
    enum: [Status.Active, Status.Inactive],
  })
  @IsOptional()
  @IsEnum([Status.Active, Status.Inactive])
  @Type(() => Number)
  status?: Status.Active | Status.Inactive;
}
