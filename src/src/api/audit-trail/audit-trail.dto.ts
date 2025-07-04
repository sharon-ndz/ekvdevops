import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { BaseRequestDto } from '../../core/interfaces/all.dto';
import { Role } from '../../middlewares/roles';

export interface AuditTrailActionDto {
  userId: number;
  dbAction: string;
  tableName: string;
  resourceId: number;
  description: string;
}

export class ListAuditTrailDto extends BaseRequestDto {
  @ApiPropertyOptional({ description: 'Role ID of the user', enum: Role })
  @IsOptional()
  @IsEnum(Role)
  @Type(() => Number)
  roleId?: Role;
}

export class AuditTrailResponseDto {
  @ApiPropertyOptional({ description: 'User ID' })
  userId: number;

  @ApiPropertyOptional({ description: 'Database action performed' })
  dbAction: string;

  @ApiPropertyOptional({ description: 'Name of the table affected' })
  tableName: string;

  @ApiPropertyOptional({ description: 'ID of the resource affected' })
  resourceId: number;

  @ApiPropertyOptional({ description: 'Description of the action' })
  description: string;

  @ApiPropertyOptional({ description: 'Timestamp of the action' })
  createdAt?: Date;

  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export class DeviceAgentLogsDto extends BaseRequestDto {
  @ApiProperty()
  @IsString()
  deviceId: string;
}

