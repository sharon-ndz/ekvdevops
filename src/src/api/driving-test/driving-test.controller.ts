import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { DrivingTestService } from './driving-test.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FetchMasterListDto } from '../driving-school/driving-school.dto';
import { DataResultInterface, RequestResultInterface } from '../../core/interfaces/all.interface';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AllowedRoles, Role } from '../../middlewares/roles';
import { BaseRequestDto, StudentNoDto } from '../../core/interfaces/all.dto';
import {
  BookDrivingTestSlotDto,
  CreateDrivingTestCenterDto,
  DrivingTestCenterIdDto,
  DrivingTestScheduleResponseDto,
  ListCbtScheduleRequestDto,
  SubmitDrivingTestDto,
  UpdateDrivingTestCenterDto,
} from './driving-test.dto';
import { TestStatsDto } from '../cbt/cbt.dto';

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
  async testHistory(@Query() data: BaseRequestDto, @Req() req: any): Promise<DataResultInterface> {
    return await this.service.testHistory(data, req.user);
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

  // get all driving test schedules (driving test)
  @ApiOperation({
    summary: 'Get all driving test schedules (ADMIN, DVIS ADMIN)',
  })
  @ApiResponse({ status: 200, type: [DrivingTestScheduleResponseDto] })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @Get('/schedules')
  async getAllDrivingTestSchedules(
    @Query() data: ListCbtScheduleRequestDto,
  ): Promise<DataResultInterface<DrivingTestScheduleResponseDto[]>> {
    return await this.service.getAllDrivingTestSchedules(data);
  }

  // get driving test statistics
  @ApiOperation({
    summary: 'Get driving test statistics (ADMIN, DVIS ADMIN)',
  })
  @ApiResponse({ status: 200, type: TestStatsDto })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @Get('/schedules/statistics')
  async getDrivingtestStatistics(): Promise<DataResultInterface<TestStatsDto>> {
    return await this.service.getDrivingtestStatistics();
  }

  // get single cbt schedule
  @ApiOperation({
    summary: 'Get single driving test schedule (ADMIN, DVIS ADMIN)',
  })
  @ApiResponse({ status: 200, type: DrivingTestScheduleResponseDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN)
  @Get('/schedules/:id')
  async getDrivingtestSchedule(
    @Param('id') id: number,
  ): Promise<DataResultInterface<DrivingTestScheduleResponseDto>> {
    return await this.service.getDrivingtestSchedule(id);
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
