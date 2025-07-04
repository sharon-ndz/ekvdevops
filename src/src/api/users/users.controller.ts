import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import {
  DataResultInterface,
  LgaDistribution,
  RequestResultInterface,
  UserStatusDistribution,
} from '../../core/interfaces/all.interface';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AttachUserBiometricsDto,
  CreateUserDto,
  toggleUserStatusDto,
  UpdateMeDto,
  UpdateUserDto,
  UserListRequestDto,
  UserResponseDto,
  UserStatsDto,
} from './users.dto';
import { AllowedRoles, Role } from '../../middlewares/roles';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @ApiOperation({
    summary: 'Get users stats (ADMIN, DVIS ADMIN, LASDRI ADMIN, MVAA ADMIN)',
  })
  @ApiResponse({ status: 200, type: UserStatsDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.LASDRI_ADMIN, Role.MVAA_ADMIN)
  @Get('/stats')
  async stats(@Req() req: any): Promise<DataResultInterface<UserStatsDto>> {
    return await this.service.stats(req.user);
  }

  @ApiOperation({
    summary: 'Get all users (ADMIN, DVIS ADMIN, LASDRI ADMIN, MVAA ADMIN)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.LASDRI_ADMIN, Role.MVAA_ADMIN)
  @Get()
  async findAll(
    @Query() data: UserListRequestDto,
    @Req() req: any,
  ): Promise<DataResultInterface<UserResponseDto[]>> {
    return await this.service.findAll(data, req.user);
  }

  @ApiOperation({
    summary: 'Get single user',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.LASDRI_ADMIN, Role.MVAA_ADMIN)
  @Get('/single/:userId')
  async getSingle(@Param('userId') userId: number, @Req() req: any) {
    return this.service.getSingle(userId, req.user);
  }

  @ApiOperation({
    summary: 'Create user',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.LASDRI_ADMIN, Role.MVAA_ADMIN)
  @Post('/')
  async createUser(@Body() data: CreateUserDto, @Req() req: any): Promise<DataResultInterface> {
    return this.service.createUser(data, req.user);
  }

  @ApiOperation({
    summary: 'Update user',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.DVIS_ADMIN, Role.LASDRI_ADMIN, Role.MVAA_ADMIN)
  @Patch('/')
  async updateUser(@Body() data: UpdateUserDto, @Req() req: any): Promise<RequestResultInterface> {
    return await this.service.updateUser(data, req.user);
  }

  @ApiOperation({
    summary: 'Get my profile',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getProfile(@Req() req: any): Promise<DataResultInterface> {
    return await this.service.getProfile(req.user);
  }

  @ApiOperation({
    summary: 'Update my profile',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('/me')
  async updateProfile(@Body() data: UpdateMeDto, @Req() req: any): Promise<RequestResultInterface> {
    return await this.service.updateProfile(data, req.user);
  }

  @ApiOperation({
    summary: 'Update user biometrics',
  })
  @ApiBody({ type: AttachUserBiometricsDto })
  @Post('/update-biometrics')
  async updateUserBiometrics(@Body() data: AttachUserBiometricsDto) {
    return this.service.updateUserBiometrics(data);
  }

  // TEST METHODS
  @Patch('/test-update')
  async updateUserTest(
    @Body() data: UpdateUserDto,
    @Req() req: any,
  ): Promise<RequestResultInterface> {
    return await this.service.updateUser(data, req.user);
  }

  @Get('/test-list')
  async findAllTest(
    @Query() data: UserListRequestDto,
    @Req() req: any,
  ): Promise<DataResultInterface> {
    return await this.service.findAll(data, req.user);
  }

  @ApiOperation({
    summary: 'Toggle user status (LASDRI ADMIN)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN, Role.DVIS_ADMIN)
  @Patch('/toggle-status/:id')
  async toggleUserStatus(
    @Param('id') id: number,
    @Body() data: toggleUserStatusDto,
    @Req() req: any,
  ): Promise<RequestResultInterface> {
    return await this.service.toggleUserStatus(id, data, req.user);
  }

  // Get my driving school application
  @Get('/driving-school-application')
  @ApiOperation({
    summary: 'Get my driving school application',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.SchoolAdmin)
  async getMySchoolApplication(@Req() req: any): Promise<DataResultInterface> {
    return await this.service.getMySchoolApplication(req.user);
  }

  @ApiOperation({
    summary: 'Get MVAA dashboard stats',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.MVAA_ADMIN)
  @Get('/mvaa-stats')
  async mvaaDashboardStats(@Req() req: any): Promise<DataResultInterface> {
    return await this.service.mvaaDashboardStats(req.user);
  }

  @ApiOperation({
    summary: 'Get MVAA officer distribution by status',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.MVAA_ADMIN)
  @Get('/mvaa-officers-distribution-by-status')
  async officerDistributionByStatus(@Req() req: any): Promise<UserStatusDistribution[]> {
    return await this.service.officerDistributionByStatus(req.user);
  }

  @ApiOperation({
    summary: 'Get MVAA officer distribution by status',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.MVAA_ADMIN)
  @Get('/mvaa-officers-distribution-by-lga')
  async officerDistributionByLga(@Req() req: any): Promise<LgaDistribution[]> {
    return await this.service.officerDistributionByLga(req.user);
  }
}
