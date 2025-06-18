import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { DrivingTestService } from './driving-test.service';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { FetchMasterListDto } from '../driving-school/driving-school.dto';
import { DataResultInterface, RequestResultInterface } from '../../core/interfaces/all.interface';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AllowedRoles, Role } from '../../middlewares/roles';
import { StudentNoDto } from '../../core/interfaces/all.dto';
import {
  BookDrivingTestSlotDto,
  CreateDrivingTestCenterDto,
  DrivingTestCenterIdDto,
  SubmitDrivingTestDto,
  UpdateDrivingTestCenterDto,
} from './driving-test.dto';

@Controller('driving-test')
export class DrivingTestController {
  constructor(private readonly service: DrivingTestService) {}
  @ApiOperation({
    summary: 'Get list of driving test centers',
  })
  @Get('/centers')
  async getDrivingTestCenters(@Query() data: FetchMasterListDto): Promise<DataResultInterface> {
    return await this.service.getDrivingTestCenters(data);
  }

  @ApiOperation({
    summary: 'Get driving test slots',
  })
  @ApiBody({ type: DrivingTestCenterIdDto })
  @Post('/slots')
  async getSlots(@Body() data: DrivingTestCenterIdDto): Promise<DataResultInterface> {
    return await this.service.getSlots(data);
  }

  @ApiOperation({
    summary: 'Book driving test slots',
  })
  @ApiBody({ type: BookDrivingTestSlotDto })
  @Post('/book-slot')
  async bookSlot(@Body() data: BookDrivingTestSlotDto): Promise<DataResultInterface> {
    return await this.service.bookSlot(data);
  }

  @ApiOperation({
    summary: 'Get test history',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @AllowedRoles(Role.DVIS, Role.Admin, Role.DVIS_ADMIN)
  @Get('/test-history')
  async testHistory(@Req() req: any): Promise<DataResultInterface> {
    return await this.service.testHistory(req);
  }

  @ApiOperation({ summary: 'Submit driving test' })
  @ApiBody({ type: SubmitDrivingTestDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @AllowedRoles(Role.DVIS, Role.Admin, Role.DVIS_ADMIN)
  @Post('/submit-driving-test')
  async submitDrivingTest(
    @Body() data: SubmitDrivingTestDto,
    @Req() req: any,
  ): Promise<RequestResultInterface> {
    return await this.service.submitDrivingTest(data, req.user);
  }

  @ApiOperation({
    summary: 'Create driving test center',
  })
  @ApiBody({ type: CreateDrivingTestCenterDto })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @Post('/centers')
  async createCenter(@Body() data: CreateDrivingTestCenterDto): Promise<DataResultInterface> {
    return await this.service.createCenter(data);
  }

  @ApiOperation({
    summary: 'Update driving test center',
  })
  @ApiBody({ type: UpdateDrivingTestCenterDto })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @Patch('/centers')
  async updateCenter(@Body() data: UpdateDrivingTestCenterDto): Promise<DataResultInterface> {
    return await this.service.updateCenter(data);
  }

  @ApiOperation({
    summary: 'Get driving test failed attempts',
  })
  @ApiBody({ type: StudentNoDto })
  @Get('/failed-attempts/:studentId')
  async getFailedAttempts(@Param('studentId') studentId: number): Promise<DataResultInterface> {
    return await this.service.getFailedAttempts(studentId);
  }
}
