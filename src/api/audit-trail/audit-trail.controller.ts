import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { DataResultInterface } from '../../core/interfaces/all.interface';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AllowedRoles, Role } from '../../middlewares/roles';
import { AuditTrailResponseDto, ListAuditTrailDto } from './audit-trail.dto';
import { AuditTrailService } from './audit-trail.service';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
@Throttle(5, 60)
@Controller('audit-trail')
export class AuditTrailController {
  constructor(private readonly service: AuditTrailService) {}

  @ApiOperation({
    summary: 'Get audit trail list (LASDRI ADMIN)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN)
  @Get('/')
  async findAll(
    @Query() data: ListAuditTrailDto,
    @Req() req: any,
  ): Promise<DataResultInterface<AuditTrailResponseDto[]>> {
    return await this.service.findAll(data, req.user);
  }
}
