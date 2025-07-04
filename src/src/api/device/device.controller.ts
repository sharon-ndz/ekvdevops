import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { DeviceService } from './device.service';
import { AllowedRoles } from '../../middlewares/roles';
import { Role } from '../../middlewares/roles';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { MessageResponseDto } from '../../core/interfaces/all.dto';
import {
  CreateDeviceRequestDto,
  DeviceDetailDto,
  DeviceStatsDto,
  GetDevicesQueryRequestDto,
  PreActivationRequestDto,
  ToggleNodeStatusDto,
  DeviceUserDto,
} from './device.dto';
import { DataResultInterface, RequestResultInterface } from '../../core/interfaces/all.interface';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) { }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.MVAA_ADMIN, Role.LASDRI_ADMIN, Role.MVAA_ADMIN, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ description: 'Create Device' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  create(@Body() data: CreateDeviceRequestDto, @Req() req: any): Promise<RequestResultInterface> {
    return this.deviceService.create(data, req.user);
  }

  @Post('/pre-activation')
  @ApiOperation({ description: 'Pre-Activation' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  preActivation(@Body() data: PreActivationRequestDto): Promise<DataResultInterface> {
    return this.deviceService.preActivation(data);
  }

  @Get('/check-activation-status')
  @ApiOperation({ description: 'Check node status' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  checkActivationStatus(@Query('deviceId') deviceId: string): Promise<DataResultInterface> {
    return this.deviceService.checkActivationStatus(deviceId);
  }

  @Post('/toggle-approval')
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.MVAA_ADMIN, Role.LASDRI_ADMIN, Role.MVAA_ADMIN, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ description: 'Toggle node approval status' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  toggleApprovalStatus(
    @Body() data: ToggleNodeStatusDto,
    @Req() req: any,
  ): Promise<RequestResultInterface> {
    return this.deviceService.toggleApprovalStatus(data, req.user);
  }

  @Get('/list')
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.MVAA_ADMIN, Role.LASDRI_ADMIN, Role.MVAA_ADMIN, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ description: 'Get devices' })
  @ApiResponse({ status: 200 })
  devices(@Query() query: GetDevicesQueryRequestDto, @Req() req: any): Promise<DataResultInterface> {
    return this.deviceService.devices(query, req.user);
  }

  @Get('/unlink/:imei')
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.MVAA_ADMIN, Role.LASDRI_ADMIN, Role.MVAA_ADMIN, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ description: 'Unlink device' })
  @ApiResponse({ status: 200 })
  async unlinkDevice(@Param('imei') imei: string): Promise<RequestResultInterface> {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    return await this.deviceService.unlinkDevice(imei);
  }

  @ApiOperation({
    summary: 'Get device stats (LASDRI ADMIN, DVIS ADMIN)',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN, Role.DVIS_ADMIN, Role.MVAA_ADMIN,)
  @ApiResponse({ status: 200, type: DeviceStatsDto })
  @ApiBearerAuth()
  @Get('/stats')
  async deviceStats(@Req() req: any): Promise<DataResultInterface<DeviceStatsDto>> {
    return await this.deviceService.deviceStats(req.user);
  }

  // get a single device details with associated users
  @Get('/details/:id')
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN, Role.MVAA_ADMIN, Role.DVIS_ADMIN, Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ description: 'Get device details' })
  @ApiResponse({ status: 200, type: DeviceDetailDto })
  async getDeviceDetails(@Param('id') id: number): Promise<DataResultInterface<DeviceDetailDto>> {
    return await this.deviceService.getDeviceDetails(id);
  }

  @Post('/deactivate/:imei')
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.LASDRI_ADMIN, Role.MVAA_ADMIN, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ description: 'Deactivate device' })
  @ApiResponse({ status: 200 })
  async deactivateDevice(@Param('imei') imei: string): Promise<RequestResultInterface> {
    return await this.deviceService.deactivateDevice(imei);
  }

  @Post('/activate')
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.LASDRI_ADMIN, Role.MVAA_ADMIN, Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ description: 'Activate device' })
  @ApiResponse({ status: 200 })
  @ApiBody({ type: DeviceUserDto })
  async activateDevice(
    @Body() data: DeviceUserDto,
    @Req() req: any,
  ): Promise<RequestResultInterface> {
    return await this.deviceService.activateDevice(data, req.user);
  }

  @Post('/unlink-user')
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN, Role.MVAA_ADMIN, Role.DVIS_ADMIN, Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ description: 'Unlink user from device' })
  @ApiResponse({ status: 200 })
  async unlinkUserFromDevice(@Body() data: DeviceUserDto): Promise<RequestResultInterface> {
    return await this.deviceService.unlinkUserFromDevice(data);
  }

  @Post('/link-user')
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN, Role.MVAA_ADMIN, Role.DVIS_ADMIN, Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ description: 'Link user to device' })
  @ApiResponse({ status: 200 })
  async linkUserToDevice(@Body() data: DeviceUserDto): Promise<RequestResultInterface> {
    return await this.deviceService.linkUserToDevice(data);
  }
}
