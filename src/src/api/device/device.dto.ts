import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { DeviceStatus, DeviceTypes } from '../../core/constants/enums';
import { organizations } from '../../core/constants/constants';
import { GetParam } from '../../core/interfaces/all.dto';
import { Expose } from 'class-transformer';
import { MESSAGES } from '../../core/constants/messages';

export class CreateDeviceRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deviceImei: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  license: string;

  @ApiProperty()
  @IsEnum(DeviceTypes)
  @IsNotEmpty()
  type: DeviceTypes;

  @ApiProperty()
  @IsIn(organizations.map((o) => o.code), { message: MESSAGES.invalidValue('organization code') })
  organizationCode: string;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  organizationName: string;
}

export class PreActivationRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deviceImei: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  license: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  requesterEmail: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requesterFirstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requesterLastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requesterPhone: string;

  @ApiProperty()
  @IsIn(organizations.map((o) => o.code), { message: MESSAGES.invalidValue('organization code') })
  organizationCode: string;
}

export class ToggleNodeStatusDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ enum: DeviceStatus })
  @IsEnum(DeviceStatus)
  @IsNotEmpty()
  status: DeviceStatus;
}

export class GetDevicesQueryRequestDto extends GetParam {
  @ApiPropertyOptional()
  @Expose()
  search: string;

  @ApiPropertyOptional({ enum: DeviceStatus })
  @Expose()
  status: DeviceStatus;

  @ApiPropertyOptional()
  @Expose()
  pendingApproval: boolean;
}

export class DeviceDetailDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  deviceImei: string;

  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  license: string;

  @ApiProperty()
  type: DeviceTypes;

  @ApiProperty()
  organizationCode: string;

  @ApiProperty()
  organizationName: string;

  @ApiProperty()
  status: DeviceStatus;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  agents: AgentDetailDto[];

  @ApiProperty()
  agentActivityLogs: any[];
}

export class AgentDetailDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  createdAt: string;
}

export class DeviceStatsDto {
  @ApiProperty({ example: 127, description: 'Total number of devices' })
  totalDevices: number;

  @ApiProperty({ example: 117, description: 'Total number of active devices' })
  activeDevices: number;

  @ApiProperty({ example: 4, description: 'Number of pending devices' })
  pendingDevices: number;

  @ApiProperty({ example: 4, description: 'Number of deactivated devices' })
  deactivatedDevices: number;

  @ApiProperty({ example: 100, description: 'Total number of users linked to all devices' })
  totalUsersLinked: number;
}

export class DeviceUserDto {
  @ApiProperty()
  @IsString()
  deviceImei: string;

  @ApiProperty()
  @IsNumber()
  userId: number;
}
