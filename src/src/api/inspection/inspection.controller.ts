import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AllowedRoles, Role } from '../../middlewares/roles';
import { DrivingSchoolResponseDto } from '../driving-school/driving-school.dto';
import { AuthUserInfo, DataResultInterface } from '../../core/interfaces/all.interface';
import {
  InspectionQuestionReqDto,
  InspectionQuestionResDto,
  ListAssignedInspectionsDto,
  ListInspectionsDto,
  ListInspectionsQuestionsDto,
  NewInspectionDto,
} from './inspection.dto';

@Controller('inspections')
export class InspectionController {
  constructor(private readonly service: InspectionService) {}

  @ApiOperation({
    summary: 'Get inspection list',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.SchoolAdmin, Role.LASDRI_ADMIN)
  @Get('/')
  async findAll(@Query() data: ListInspectionsDto, @Req() req: any): Promise<DataResultInterface> {
    return await this.service.findAll(data, req.user);
  }

  @ApiOperation({
    summary: 'Create inspection',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.LASDRI_ADMIN)
  @Post()
  async create(@Body() data: NewInspectionDto, @Req() req: any): Promise<DataResultInterface> {
    return await this.service.create(data, req.user);
  }

  // get assigned inspections
  @ApiOperation({
    summary: 'Get assigned inspections (LASDRI Officer)',
  })
  @ApiResponse({ status: 200, type: [DrivingSchoolResponseDto] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI)
  @Get('/assigned')
  async getAssignedInspections(
    @Query() data: ListAssignedInspectionsDto,
    @Req() req: any,
  ): Promise<DataResultInterface<DrivingSchoolResponseDto[]>> {
    return await this.service.getAssignedInspections(data, req.user);
  }

  @ApiOperation({
    summary: 'Retrieve user inspection list',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN, Role.MVAA_ADMIN)
  @Get('/:userId')
  async getUserInspections(
    @Param('userId') userId: number,
    @Query() data: ListInspectionsDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.getUserInspections(userId, data, req.user);
  }

  // get inspection questions by state
  @ApiOperation({
    summary: 'Get inspection questions by state',
  })
  @ApiResponse({ status: 200, type: InspectionQuestionResDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI, Role.SchoolAdmin)
  @Get('/get-questions/:stateId')
  async getInspectionQuestions(
    @Param('stateId') stateId: number,
    @Query() data: ListInspectionsQuestionsDto,
    @Req() req: any,
  ): Promise<DataResultInterface<InspectionQuestionResDto>> {
    const user: AuthUserInfo = req.user;
    return await this.service.getInspectionQuestions(data, stateId, user);
  }

  // upload inspection questions
  @ApiOperation({
    summary: 'Upload inspection questions',
  })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.LASDRI_ADMIN)
  @Post('/upload-questions')
  async uploadQuestions(
    @Body() data: InspectionQuestionReqDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.uploadQuestions(data, req.user);
  }

  // submit inspection
  @ApiOperation({
    summary: 'Submit inspection',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.LASDRI, Role.LASDRI_ADMIN)
  @Post('/submit-inspection')
  async submitInspection(
    @Body() data: NewInspectionDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.submitInspection(data, req.user);
  }

  // endpoint to aknowledge inspection
  @ApiOperation({
    summary: 'Acknowledge inspection (School Admin)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin)
  @Post('/acknowledge-inspection/:id')
  async acknowledgeInspection(@Param('id') id: number): Promise<DataResultInterface> {
    return await this.service.acknowledgeInspection(id);
  }

  // get single inspection
  @ApiOperation({ summary: 'Get single inspection (LASDRI ADMIN, School Admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN, Role.SchoolAdmin)
  @Get('/detail/:id')
  async getSingle(@Param('id') id: number, @Req() req: any): Promise<DataResultInterface> {
    return await this.service.getSingle(id);
  }
}
