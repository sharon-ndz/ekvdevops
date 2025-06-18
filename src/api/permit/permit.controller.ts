import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PermitService } from './permit.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AllowedRoles, Role } from '../../middlewares/roles';
import { DataResultInterface, ListInterface } from '../../core/interfaces/all.interface';
import { NewPermitRequestDto, PermitClassDto } from './permit.dto';

@Controller('permit')
export class PermitController {
  constructor(private readonly service: PermitService) {}

  @ApiOperation({
    summary: 'Get permit stats',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin, Role.MVAA_ADMIN)
  @Get('/stats')
  async studentsStats(@Query() data: PermitClassDto): Promise<DataResultInterface> {
    return await this.service.stats(data);
  }

  @ApiOperation({
    summary: 'Get permits list',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin, Role.MVAA_ADMIN)
  @Get('/list')
  async findAll(@Query() data: ListInterface, @Req() req: any): Promise<DataResultInterface> {
    return await this.service.findAll(data, req.user);
  }

  @ApiOperation({
    summary: 'Get permit details',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin, Role.MVAA_ADMIN)
  @Get('/details/:permitNo')
  async details(@Param('permitNo') permitNo: string): Promise<DataResultInterface> {
    return await this.service.details(permitNo);
  }

  @ApiOperation({
    summary: 'Issue new permit',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin, Role.MVAA_ADMIN)
  @Post('/new-issuance')
  async issuePermit(
    @Body() data: NewPermitRequestDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.issuePermit(data, req.user);
  }
}
