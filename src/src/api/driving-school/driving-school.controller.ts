import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { DrivingSchoolService } from './driving-school.service';
import { DataResultInterface, RequestResultInterface } from '../../core/interfaces/all.interface';
import {
  ActionDrivingSchoolApplicationDto,
  ApplicationStatsDto,
  AssignOfficerDto,
  DirivinSchoolListRequestsDto,
  DrivingSchoolApplicationStatsDto,
  DrivingSchoolDto,
  DrivingSchoolStatsDto,
  FetchMasterListDto,
  FetchStudentListDto,
  SelfServiceCreateSchoolDto,
  SubmitDrivingSchoolApplicationDto,
  UpdateDrivingSchoolApplicationDto,
  UpdateDrivingSchoolDto,
  ListApplicationsDto,
  toggleSchoolStatusDto,
  listDrivingSchoolInspectionsDto,
  CompleteSchoolApplicationDto,
  DrivingSchoolQueryApplicationDto,
  FetchDashboardStatsRequestDto, IssueCertDto
} from "./driving-school.dto";
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApplicationNoDto, BaseRequestDto } from '../../core/interfaces/all.dto';
import { AllowedRoles, Role } from '../../middlewares/roles';
import { UserResponseDto } from '../users/users.dto';

@Controller('driving-school')
export class DrivingSchoolController {
  constructor(private readonly service: DrivingSchoolService) {}

  @ApiOperation({
    summary: 'Get driving school stats',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.LASDRI_ADMIN)
  @ApiBearerAuth()
  @Get('/stats')
  async stats(@Req() req: any): Promise<DataResultInterface> {
    return await this.service.stats(req.user);
  }

  @ApiOperation({
    summary: 'Get all driving schools',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.LASDRI_ADMIN)
  @ApiBearerAuth()
  @Get('/list')
  async findAll(@Query() data: ListApplicationsDto, @Req() req: any): Promise<DataResultInterface> {
    return await this.service.findAll(data, req.user);
  }

  @ApiOperation({
    summary: 'Create driving school',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.LASDRI_ADMIN)
  @ApiBearerAuth()
  @Post()
  async createSchool(
    @Body() data: DrivingSchoolDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return this.service.createSchool(data, req.user);
  }

  @ApiOperation({
    summary: 'Create driving school [Self Service Portal]',
  })
  @ApiBody({ type: SelfServiceCreateSchoolDto })
  @Post('/self-service/create')
  async selfServiceCreateSchool(
    @Body() data: SelfServiceCreateSchoolDto,
  ): Promise<DataResultInterface> {
    return this.service.selfServiceCreateSchool(data);
  }

  @ApiOperation({
    summary: 'Update driving school',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.LASDRI_ADMIN)
  @ApiBearerAuth()
  @Patch()
  async updateSchool(
    @Body() data: UpdateDrivingSchoolDto,
    @Req() req: any,
  ): Promise<RequestResultInterface> {
    return await this.service.updateSchool(data, req.user);
  }

  @ApiOperation({
    summary: 'Master list to get all driving schools',
  })
  @Get('/')
  async minimalList(@Query() data: FetchMasterListDto): Promise<DataResultInterface> {
    return await this.service.minimalList(data);
  }

  @ApiOperation({
    summary: 'Fetch single driving school',
  })
  @Get('single/:id')
  async findOne(@Param('id') id: string): Promise<DataResultInterface> {
    return await this.service.findOne(+id);
  }

  @ApiOperation({
    summary: 'Get a driving school training durations',
  })
  @Get('/training-durations/:id')
  async trainingDurations(@Param('id') id: string): Promise<DataResultInterface> {
    return await this.service.trainingDurations(+id);
  }

  @ApiOperation({
    summary: 'Get single training duration',
  })
  @Get('/training-duration/:id')
  async singleTrainingDuration(@Param('id') id: string): Promise<DataResultInterface> {
    return await this.service.singleTrainingDuration(+id);
  }

  @ApiOperation({
    summary: 'Submit driving school application',
  })
  @ApiBody({
    type: SubmitDrivingSchoolApplicationDto,
  })
  @Post('/submit-application')
  async submitApplication(
    @Body() data: SubmitDrivingSchoolApplicationDto,
  ): Promise<DataResultInterface> {
    return await this.service.submitApplication(data);
  }

  @ApiOperation({
    summary: 'Update driving school application',
  })
  @ApiBody({
    type: UpdateDrivingSchoolApplicationDto,
  })
  @Post('/update-application')
  async updateApplication(
    @Body() data: UpdateDrivingSchoolApplicationDto,
  ): Promise<DataResultInterface> {
    return await this.service.updateApplication(data);
  }

  @ApiOperation({
    summary: 'Check or pull driving school application with status',
  })
  @ApiBody({
    type: ApplicationNoDto,
  })
  @Post('/check-application')
  async checkApplication(@Body() data: ApplicationNoDto): Promise<DataResultInterface> {
    return await this.service.checkApplication(data);
  }

  @ApiOperation({
    summary: 'Get applicant details',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.SchoolAdmin, Role.LASDRI_ADMIN, Role.LASDRI)
  @ApiBearerAuth()
  @Get('/applicant/details/:applicationId')
  async getApplicantDetails(
    @Param('applicationId') applicationId: number,
  ): Promise<DataResultInterface> {
    return this.service.getApplicantDetails(applicationId);
  }

  @ApiOperation({
    summary: 'Issue Certificate for student who have successfully completed training. (TEST ONlY)',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.SchoolAdmin, Role.LASDRI_ADMIN, Role.LASDRI)
  @ApiBearerAuth()
  @ApiBody({ type: IssueCertDto })
  @Post('/students/issue-cert')
  async issueCert(@Body() data: IssueCertDto, @Req() req: any): Promise<DataResultInterface> {
    return await this.service.issueCert(data, req.user);
  }

  @ApiOperation({
    summary: 'Validate certificate for student who have successfully completed training.',
  })
  @Post('/validate-cert-no')
  async validateCertNo(@Body('certificateNo') certificateNo: string): Promise<DataResultInterface> {
    return await this.service.validateCertNo(certificateNo);
  }

  @ApiOperation({
    summary: 'Get applications stats',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin, Role.LASDRI_ADMIN)
  @ApiResponse({ status: 200, type: DrivingSchoolApplicationStatsDto })
  @ApiBearerAuth()
  @Get('/applications/stats')
  async applicationsStats(
    @Query() data: ApplicationStatsDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.applicationsStats(data, req.user);
  }

  @ApiOperation({
    summary: 'Get all applications',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin, Role.LASDRI_ADMIN)
  @ApiBearerAuth()
  @Get('/applications/list')
  async applicationsList(
    @Query() data: ListApplicationsDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.applicationsList(data, req.user);
  }

  @ApiOperation({
    summary: 'Get single application (SchoolAdmin, LASDRI-ADMIN)',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin, Role.LASDRI_ADMIN, Role.LASDRI)
  @ApiBearerAuth()
  @Get('/applications/details/:drivingSchoolId')
  async getSingleApplication(
    @Param('drivingSchoolId') drivingSchoolId: number,
  ): Promise<DataResultInterface> {
    return this.service.getSingleApplication(drivingSchoolId);
  }

  @ApiOperation({
    summary: 'Acknowledge application [Admin]',
  })
  @ApiBody({
    type: ActionDrivingSchoolApplicationDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.SchoolAdmin, Role.LASDRI_ADMIN)
  @Post('/change-application-status')
  async changeApplicationStatus(
    @Body() data: ActionDrivingSchoolApplicationDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.changeApplicationStatus(data, req.user);
  }

  @ApiOperation({
    summary: 'Get student stats (School Admin, LASDRI ADMIN)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin, Role.LASDRI_ADMIN)
  @Get('/students/stats')
  async studentsStats(
    @Query() data: FetchStudentListDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.studentsStats(data, req.user);
  }

  @ApiOperation({
    summary: 'Get students list  (School Admin, LASDRI ADMIN)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin, Role.LASDRI_ADMIN)
  @Get('/students')
  async studentsList(
    @Query() data: FetchStudentListDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.studentsList(data, req.user);
  }

  @ApiOperation({
    summary: 'Get student details',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin, Role.LASDRI_ADMIN)
  @Post('/students/details/:studentNo')
  async studentDetails(@Param('studentNo') studentNo: string): Promise<DataResultInterface> {
    return await this.service.studentDetails(studentNo);
  }

  @ApiOperation({
    summary: 'Register student',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin, Role.LASDRI_ADMIN)
  @Post('/students/register')
  async registerStudent(
    @Body() data: SubmitDrivingSchoolApplicationDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.registerStudent(data, req.user);
  }

  // LASDRI - Get Driving School Stats
  @ApiOperation({
    summary: 'Get driving school stats (LASDRI ADMIN)',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN)
  @ApiResponse({ status: 200, type: DrivingSchoolStatsDto })
  @ApiBearerAuth()
  @Get('/lasdri/stats')
  async lasdriStats(@Req() req: any): Promise<DataResultInterface> {
    return await this.service.getLasdriStats(req.user);
  }

  // LASDRI - List Driving Schools
  @ApiOperation({
    summary: 'List Driving Schools (LASDRI ADMIN)',
  })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, type: DrivingSchoolDto })
  @AllowedRoles(Role.LASDRI_ADMIN)
  @ApiBearerAuth()
  @Get('/lasdri/list')
  async getDrivingSchoolList(@Query() data: DirivinSchoolListRequestsDto) {
    return await this.service.getDrivingSchoolList(data);
  }

  @ApiOperation({
    summary: 'Assign LASDRI officer to driving school (LASDRI ADMIN)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.LASDRI_ADMIN)
  @Post('/lasdri/assign-officer')
  async assignLasdriOfficer(
    @Body() data: AssignOfficerDto,
    @Req() req: any,
  ): Promise<RequestResultInterface> {
    return await this.service.assignLasdriOfficer(data, req.user);
  }

  @ApiOperation({
    summary: 'Complete driving school application (Driving School)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.SchoolAdmin)
  @ApiResponse({ status: 200 })
  @Post('/complete-application')
  async completeApplication(
    @Body() data: CompleteSchoolApplicationDto,
    @Req() req: any,
  ): Promise<RequestResultInterface> {
    const user = req.user;
    return this.service.completeApplication(data, user);
  }

  // Toggle driving school status
  @ApiOperation({
    summary: 'Toggle driving school status (LASDRI ADMIN)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN)
  @Patch('/toggle-status/:id')
  async toggleDrivingSchoolStatus(
    @Param('id') id: number,
    @Body() data: toggleSchoolStatusDto,
    @Req() req: any,
  ): Promise<RequestResultInterface> {
    return await this.service.toggleDrivingSchoolStatus(id, data, req.user);
  }

  @ApiOperation({
    summary: 'Fetch driving school inspections (LASDRI ADMIN)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN)
  @Get('inspections/:drivingSchoolId')
  async drivingSchoolInspections(
    @Param('drivingSchoolId') drivingSchoolId: number,
    @Query() data: listDrivingSchoolInspectionsDto,
  ): Promise<DataResultInterface> {
    return await this.service.drivingSchoolInspections(drivingSchoolId, data);
  }

  // confirm driving school application payment
  @ApiOperation({
    summary: 'Confirm driving school application payment (Driving School)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin)
  @Post('/confirm-application-payment/:paymentRef')
  async confirmApplicationPayment(
    @Param('paymentRef') paymentRef: string,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.confirmApplicationPayment(paymentRef, req.user);
  }

  // Query driving school application
  @ApiOperation({
    summary: 'Query driving school application (LASDRI ADMIN)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN)
  @Post('/query-application/:drivingSchoolId')
  async queryApplication(
    @Param('drivingSchoolId') drivingSchoolId: number,
    @Body() data: DrivingSchoolQueryApplicationDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.queryApplication(drivingSchoolId, data.reason, req.user);
  }

  // driving school request for inspection
  @ApiOperation({
    summary: 'Request for inspection (Driving School)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin)
  @Post('/request-inspection')
  async requestInspection(@Req() req: any): Promise<DataResultInterface> {
    return await this.service.requestInspection(req.user);
  }

  // dashboard stats
  @ApiOperation({
    summary: 'Get dashboard stats (LASDRI ADMIN)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN)
  @Get('/dashboard/stats')
  async dashboardStats(@Query() data: FetchDashboardStatsRequestDto) {
    return await this.service.dashboardStats(data);
  }

  // list LASDRI Officers
  @ApiOperation({
    summary: 'List LASDRI Officers (LASDRI ADMIN)',
  })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN)
  @Get('/list-lasdri-officers')
  async listLasdriOfficers(
    @Query() data: BaseRequestDto,
  ): Promise<DataResultInterface<UserResponseDto[]>> {
    return await this.service.listLasdriOfficers(data);
  }

  // endpoint to request for inspection revalidation
  @ApiOperation({
    summary: 'Request for inspection revalidation (Driving School)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin)
  @Post('/inspection-revalidation')
  async inspectionRevalidation(@Req() req: any): Promise<DataResultInterface> {
    return await this.service.inspectionRevalidation(req.user);
  }
}
