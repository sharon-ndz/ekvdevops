import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CbtService } from './cbt.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  FetchDashboardStatsRequestDto,
  FetchMasterListDto,
} from '../driving-school/driving-school.dto';
import { DataResultInterface, RequestResultInterface } from '../../core/interfaces/all.interface';
import {
  BookSlotDto,
  CbtCenterIdDto,
  CbtCenterResponseDto,
  CbtRescheduleDto,
  TestStatsDto,
  CbtScheduleResponseDto,
  CreateCbtCenterDto,
  CreateQuestionDto,
  FetchQuestionsDto,
  ListCbtScheduleRequestDto,
  QuestionByStudentDto,
  SubmitTestDto,
  UpdateCbtCenterDto,
  UpdateQuestionDto,
  UpdateDeviceThresholdDto,
  CbtCenterStatsDto,
} from './cbt.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AllowedRoles, Role } from '../../middlewares/roles';
import { BaseRequestDto, StudentNoDto } from '../../core/interfaces/all.dto';

@Controller('cbt')
export class CbtController {
  constructor(private readonly service: CbtService) {}
  @ApiOperation({
    summary: 'Get list of CBT centers',
  })
  @ApiResponse({ status: 200, type: [CbtCenterResponseDto] })
  @Get('/centers')
  async getCbtCenters(
    @Query() data: FetchMasterListDto,
  ): Promise<DataResultInterface<CbtCenterResponseDto[]>> {
    return await this.service.getCbtCenters(data);
  }

  @Post('/slots')
  async getSlots(@Body() data: CbtCenterIdDto): Promise<DataResultInterface> {
    return await this.service.getSlots(data);
  }

  @Post('/book-slot')
  async bookSlot(@Body() data: BookSlotDto): Promise<DataResultInterface> {
    return await this.service.bookSlot(data);
  }

  @ApiOperation({
    summary: 'Get questions by student',
  })
  @Post('/question/by-student')
  async getTestByStudent(@Body() data: QuestionByStudentDto) {
    return await this.service.getTestByStudent(data);
  }

  @ApiOperation({
    summary: 'Submit student test',
  })
  @Post('/question/submit-test')
  async submitTest(@Body() data: SubmitTestDto) {
    return await this.service.submitTest(data);
  }

  @ApiOperation({
    summary: 'Update CBT Test',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS, Role.SchoolAdmin)
  @ApiBearerAuth()
  @Post('/update-test')
  async updateTest(@Body() data: QuestionByStudentDto, @Req() req: any) {
    return await this.service.updateTest(data, req.user);
  }

  @ApiOperation({
    summary: 'Get CBT enrolls',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.DVIS, Role.Admin, Role.SchoolAdmin, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @Get('/enrolls')
  async cbtEnrolls(@Query() data: BaseRequestDto, @Req() req: any): Promise<DataResultInterface> {
    return await this.service.cbtEnrolls(data, req);
  }

  @ApiOperation({
    summary: 'Create CBT center',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Post('/centers')
  async createCenter(
    @Body() data: CreateCbtCenterDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.createCenter(data, req.user);
  }

  @ApiOperation({
    summary: 'Update CBT center',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Patch('/centers')
  async updateCenter(@Body() data: UpdateCbtCenterDto): Promise<DataResultInterface> {
    return await this.service.updateCenter(data);
  }

  @ApiOperation({
    summary: 'Get questions list',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Get('/question')
  async questionList(@Query() data: FetchQuestionsDto): Promise<DataResultInterface> {
    return await this.service.questionList(data);
  }

  @ApiOperation({
    summary: 'Update Question',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Patch('/question')
  async updateQuestion(
    @Body() data: UpdateQuestionDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.updateQuestion(data, req.user);
  }

  @ApiOperation({
    summary: 'Create Question',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Post('/question')
  async createQuestion(
    @Body() data: CreateQuestionDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.createQuestion(data, req.user);
  }

  // get cbt schedule statistics
  @ApiOperation({
    summary: 'Get CBT center statistics (ADMIN, DVIS ADMIN)',
  })
  @ApiResponse({ status: 200, type: CbtCenterStatsDto })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Get('/center/statistics')
  async getCbtCenterStatistics(@Req() req: any): Promise<DataResultInterface<CbtCenterStatsDto>> {
    return await this.service.getCbtCenterStatistics(req.user);
  }

  // get all cbt schedules (cbt test)
  @ApiOperation({
    summary: 'Get all CBT Test schedules (ADMIN, DVIS ADMIN)',
  })
  @ApiResponse({ status: 200, type: [CbtScheduleResponseDto] })
  @ApiResponse({ status: 200, type: CbtCenterResponseDto })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Get('/schedules')
  async getAllCbtSchedules(
    @Query() data: ListCbtScheduleRequestDto,
  ): Promise<DataResultInterface<CbtScheduleResponseDto[]>> {
    return await this.service.getAllCbtSchedules(data);
  }

  // get cbt schedule statistics
  @ApiOperation({
    summary: 'Get CBT schedule statistics (ADMIN, DVIS ADMIN)',
  })
  @ApiResponse({ status: 200, type: TestStatsDto })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Get('/schedules/statistics')
  async getCbtScheduleStatistics(): Promise<DataResultInterface<TestStatsDto>> {
    return await this.service.getCbtScheduleStatistics();
  }

  // Update device threshold for a center
  @ApiOperation({
    summary: 'Update device threshold for a center (ADMIN, DVIS ADMIN)',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.MVAA_ADMIN)
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  @Patch('/center/update-device-threshold')
  async updateDeviceThreshold(
    @Body() data: UpdateDeviceThresholdDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.updateDeviceThreshold(data, req.user);
  }

  @ApiOperation({
    summary: 'Bulk center upload (ADMIN, DVIS ADMIN)',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.MVAA_ADMIN)
  @ApiResponse({ status: 200 })
  @ApiBody({ type: [CreateCbtCenterDto] })
  @ApiBearerAuth()
  @Post('/center/bulk-upload')
  async bulkCenterUpload(@Body() data: CreateCbtCenterDto[], @Req() req: any): Promise<object> {
    return await this.service.bulkCenterUpload(data, req.user);
  }

  @ApiOperation({
    summary: 'Bulk upload cbt questions (ADMIN, DVIS ADMIN)',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.MVAA_ADMIN)
  @ApiResponse({ status: 200 })
  @ApiBody({ type: [CreateQuestionDto] })
  @ApiBearerAuth()
  @Post('/question/bulk-upload')
  async bulkUploadCbtQuestions(
    @Body() data: CreateQuestionDto[],
    @Req() req: any,
  ): Promise<object> {
    return await this.service.bulkUploadQuestions(data, req.user);
  }

  @ApiOperation({
    summary: 'Get CBT failed attempts',
  })
  @ApiBody({ type: StudentNoDto })
  @Get('/failed-attempts/:studentId')
  async getFailedAttempts(@Param('studentId') studentId: number): Promise<DataResultInterface> {
    return await this.service.getFailedAttempts(studentId);
  }

  @ApiOperation({
    summary: 'CBT Reschedule',
  })
  @ApiBody({ type: CbtRescheduleDto })
  @Post('/reschedule')
  async rescheduleCbt(@Body() data: CbtRescheduleDto): Promise<RequestResultInterface> {
    return await this.service.rescheduleCbt(data);
  }

  @ApiOperation({
    summary: 'View center details',
  })
  @ApiResponse({ status: 200, type: CbtCenterResponseDto })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Get('/center/:id')
  async viewCenterDetails(
    @Param('id') id: number,
  ): Promise<DataResultInterface<CbtCenterResponseDto>> {
    return await this.service.viewCenterDetails(id);
  }

  // get single cbt schedule
  @ApiOperation({
    summary: 'Get single CBT Test schedule',
  })
  @ApiResponse({ status: 200, type: CbtScheduleResponseDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.MVAA_ADMIN)
  @Get('/schedules/:id')
  async getSingleCbtSchedule(
    @Param('id') id: number,
  ): Promise<DataResultInterface<CbtScheduleResponseDto>> {
    return await this.service.getSingleCbtSchedule(id);
  }

  // dashboard stats
  @ApiOperation({
    summary: 'Get dashboard stats (DVIS ADMIN)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.DVIS_ADMIN)
  @Get('/dashboard/stats')
  async dashboardStats(@Query() data: FetchDashboardStatsRequestDto) {
    return await this.service.dashboardStats(data);
  }
}
