import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { CbtService } from './cbt.service';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { FetchMasterListDto } from '../driving-school/driving-school.dto';
import { DataResultInterface, RequestResultInterface } from '../../core/interfaces/all.interface';
import {
  BookSlotDto,
  CbtCenterIdDto,
  CbtRescheduleDto,
  CreateCbtCenterDto,
  CreateQuestionDto,
  FetchQuestionsDto,
  QuestionByStudentDto,
  SubmitTestDto,
  UpdateCbtCenterDto,
  UpdateQuestionDto,
} from './cbt.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AllowedRoles, Role } from '../../middlewares/roles';
import { StudentNoDto } from '../../core/interfaces/all.dto';

@Controller('cbt')
export class CbtController {
  constructor(private readonly service: CbtService) {}
  @ApiOperation({
    summary: 'Get list of CBT centers',
  })
  @Get('/centers')
  async getCbtCenters(@Query() data: FetchMasterListDto): Promise<DataResultInterface> {
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
    summary: 'Get CBT enrolls',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.DVIS, Role.Admin, Role.SchoolAdmin, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @Get('/enrolls')
  async cbtEnrolls(@Req() req: any): Promise<DataResultInterface> {
    return await this.service.cbtEnrolls(req);
  }

  @ApiOperation({
    summary: 'Create CBT center',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @Post('/centers')
  async createCenter(@Body() data: CreateCbtCenterDto): Promise<DataResultInterface> {
    return await this.service.createCenter(data);
  }

  @ApiOperation({
    summary: 'Update CBT center',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @Patch('/centers')
  async updateCenter(@Body() data: UpdateCbtCenterDto): Promise<DataResultInterface> {
    return await this.service.updateCenter(data);
  }

  @ApiOperation({
    summary: 'Get questions list',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @Get('/question')
  async questionList(@Query() data: FetchQuestionsDto): Promise<DataResultInterface> {
    return await this.service.questionList(data);
  }

  @ApiOperation({
    summary: 'Update Question',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN)
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
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @Post('/question')
  async createQuestion(
    @Body() data: CreateQuestionDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.createQuestion(data, req.user);
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
}
