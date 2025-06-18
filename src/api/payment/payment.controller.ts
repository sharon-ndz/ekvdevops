import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import {
  ListTransactionLogDto,
  PaymentDto,
  UpdatePaymentDto,
  TransactionResponseDto,
  ValidateTransactionDto,
  ReferenceDto, PaymentSettingsListRequestsDto, PaymentSettingsDto, UpdatePaymentSettingsDto
} from "./payment.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AllowedRoles, Role } from '../../middlewares/roles';
import { LicenseStatsWithYearDto } from '../license/license.dto';
import { DataResultInterface } from '../../core/interfaces/all.interface';
import { PaymentStatus } from '../../core/constants/enums';

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
  @AllowedRoles(Role.Admin)
  @ApiBearerAuth()
  @Get('/revenue/summary')
  getRevenueSummary() {
    return this.service.getRevenueSummary();
  }

  @ApiOperation({
    summary: 'Calculates the total revenue per month',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin)
  @ApiBearerAuth()
  @Get('/revenue/monthly-volume')
  getMonthlyRevenueVolume(@Query() data: LicenseStatsWithYearDto) {
    return this.service.getMonthlyRevenueVolume(data);
  }

  @ApiOperation({
    summary:
      'Calculates the total revenue for each service type (new, renewal, replacement) within a date range',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin)
  @ApiBearerAuth()
  @Get('/revenue/by-service')
  getTotalRevenueGroupedByService(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.service.getTotalRevenueGroupedByService(new Date(startDate), new Date(endDate));
  }

  @ApiOperation({
    summary: 'Fetches the top 5 LGAs by total revenue within a date range',
  })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.Admin)
  @ApiBearerAuth()
  @Get('/revenue/top-by-lga')
  getTopRevenueByLga(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.service.getTopRevenueByLga(new Date(startDate), new Date(endDate));
  }

  @ApiOperation({ summary: 'Paystack callback' })
  @Get('/paystack-callback')
  async paystackCallback(@Query() data: ReferenceDto, @Res() res: Response): Promise<void> {
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
  getRevenueStats() {
    return this.service.getRevenueStats();
  }

  @ApiOperation({
    summary: 'List transaction logs (LASDRI_ADMIN)',
  })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  @UseGuards(JwtAuthGuard)
  @AllowedRoles(Role.LASDRI_ADMIN)
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
}
