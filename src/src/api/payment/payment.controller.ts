import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import {
  ListTransactionLogDto,
  PaymentDto,
  UpdatePaymentDto,
  TransactionResponseDto,
  ValidateTransactionDto,
  ReferenceDto,
  PaymentSettingsListRequestsDto,
  PaymentSettingsDto,
  UpdatePaymentSettingsDto,
  RevenueStatsWithYearDto,
} from './payment.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AllowedRoles, Role } from '../../middlewares/roles';
import {
  DataResultInterface,
  LicenseRevenueStats,
  RevenueStats,
  ServiceTypeDistributionPoint,
  LgaRevenuePoint,
} from '../../core/interfaces/all.interface';
import { PaymentStatus, TransactionType } from '../../core/constants/enums';

@Controller('payments')
export class PaymentController {
  constructor(private service: PaymentService) {}

  @ApiOperation({ summary: 'Fetches list of payment settings' })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin)
  @ApiBearerAuth()
  @Get('/settings/list')
  settingsList(@Query() data: PaymentSettingsListRequestsDto) {
    return this.service.settingsList(data);
  }

  @ApiOperation({ summary: 'Create payment setting' })
  @ApiBody({ type: PaymentSettingsDto })
  @ApiResponse({ status: 200, type: PaymentSettingsDto })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin)
  @ApiBearerAuth()
  @Post('/settings/create')
  createPaymentSetting(@Body() data: PaymentSettingsDto): Promise<DataResultInterface> {
    return this.service.createPaymentSetting(data);
  }

  @ApiOperation({ summary: 'Update payment setting' })
  @ApiBody({ type: UpdatePaymentSettingsDto })
  @ApiResponse({ status: 200, type: UpdatePaymentSettingsDto })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin)
  @ApiBearerAuth()
  @Post('/settings/update')
  updatePaymentSetting(@Body() data: UpdatePaymentSettingsDto): Promise<DataResultInterface> {
    return this.service.updatePaymentSetting(data);
  }

  @ApiOperation({
    summary: 'Calculates the total revenue for new, renewal, and replacement licenses',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Get('/revenue/summary')
  getRevenueSummary(@Req() req: any): Promise<{
    licenses: LicenseRevenueStats;
    permits: RevenueStats;
  }> {
    return this.service.getRevenueSummary(req.user);
  }

  @ApiOperation({
    summary: 'Calculates the total revenue per month',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Get('/revenue/monthly-volume')
  getMonthlyRevenueVolume(@Query() data: RevenueStatsWithYearDto, @Req() req: any) {
    return this.service.getMonthlyRevenueVolume(data, req.user);
  }

  @ApiOperation({
    summary:
      'Calculates the total revenue for each service type (new, renewal, replacement) within a date range',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Get('/revenue/by-service')
  getTotalRevenueGroupedByService(@Req() req: any): Promise<ServiceTypeDistributionPoint[]> {
    return this.service.getTotalRevenueGroupedByService(req.user);
  }

  @ApiOperation({
    summary: 'Fetches the top 5 LGAs by total revenue within a date range',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Get('/revenue/top-by-lga')
  getTopRevenueByLga(@Req() req: any): Promise<LgaRevenuePoint[]> {
    return this.service.getTopRevenueByLga(req.user);
  }

  @ApiOperation({
    summary: 'Fetches the bottom 5 LGAs by total revenue within a date range',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Get('/revenue/bottom-by-lga')
  getBottomRevenueByLga(@Req() req: any): Promise<LgaRevenuePoint[]> {
    return this.service.getBottomRevenueByLga(req.user);
  }

  @ApiOperation({ summary: 'Paystack callback' })
  @Get('/paystack-callback')
  async paystackCallback(@Query() data: ReferenceDto, @Res() res: Response) {
    const paymentResp = await this.service.verify({
      reference: data.reference,
    } as any);
    // based on the status of transaction redirect to client defined URL
    return res.redirect(
      paymentResp.paymentData && paymentResp.paymentData.status === PaymentStatus.Completed
        ? paymentResp.paymentData.successRedirectUrl +
            '&reference=' +
            paymentResp.paymentData.reference
        : paymentResp.paymentData.failureRedirectUrl,
    );
  }

  @ApiOperation({
    summary: 'Initialize payment with auto detect feature',
  })
  @Post('/initiate')
  async initiate(@Body() type: PaymentDto, @Req() req: any) {
    return await this.service.initiate(type, req);
  }

  @ApiOperation({
    summary:
      'verify payment after client has been redirected. This sets the payment to completed if successfully verified.',
  })
  @Post('/verify')
  async verify(@Body() data: ValidateTransactionDto) {
    return await this.service.verify(data);
  }

  @ApiOperation({
    summary: 'Validate the status of a transaction',
  })
  @Post('/validate-transaction')
  async validateTransaction(@Body() data: ValidateTransactionDto) {
    return await this.service.validateTransaction(data);
  }

  @ApiOperation({
    summary:
      'Calculates the total revenue for students registration, applications and inspection fees (LASDRI ADMIN)',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN)
  @ApiBearerAuth()
  @Get('/revenue/lasdri-stats')
  getLasdriRevenueStats() {
    const allowedTypes: TransactionType[] = [
      TransactionType.drivingSchoolCompletionPayment,
      TransactionType.drivingSchoolApplication,
      TransactionType.inspectionFee,
    ];

    return this.service.getRevenueStats(allowedTypes);
  }

  @ApiOperation({
    summary: 'Calculates the total revenue for students license and permits for (MVAA ADMIN)',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Get('/revenue/mvaa-stats')
  getMvaaRevenueStats() {
    const allowedTypes: TransactionType[] = [
      TransactionType.permitIssuance,
      TransactionType.licenseReplacement,
      TransactionType.licenseRenewal,
      TransactionType.preRegistration,
    ];
    return this.service.getRevenueStats(allowedTypes);
  }

  @ApiOperation({
    summary: 'List transaction logs (LASDRI ADMIN, DVIS ADMIN, MVAA Admin)',
  })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin, Role.LASDRI_ADMIN, Role.DVIS_ADMIN, Role.MVAA_ADMIN)
  @ApiBearerAuth()
  @Get('/transaction-logs')
  async listTransactionLogs(
    @Query() data: ListTransactionLogDto,
    @Req() req: any,
  ): Promise<DataResultInterface<TransactionResponseDto[]>> {
    return await this.service.listTransactionLogs(data, req.user);
  }

  @ApiOperation({
    summary: 'Update payment [TEST]',
  })
  @Post('/update')
  async updatePayment(@Body() data: UpdatePaymentDto): Promise<DataResultInterface> {
    return await this.service.updatePayment(data);
  }

  @ApiOperation({
    summary:
      'Calculates the total revenue for students registration, applications and inspection fees (LASDRI ADMIN)',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.DVIS_ADMIN)
  @ApiBearerAuth()
  @Get('/revenue/dvis-stats')
  getDvisRevenueStats() {
    const allowedTypes: TransactionType[] = [
      TransactionType.preRegistration,
      TransactionType.cbtReschedulePayment,
    ];

    return this.service.getRevenueStats(allowedTypes);
  }
}
