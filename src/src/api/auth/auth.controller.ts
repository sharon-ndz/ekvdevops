import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthUserDto,
  OTPDataDto,
  ResetPasswordDto,
  SendOTPDataDto,
  TestNinRequestDto,
  UpdatePasswordRequestDto,
} from './auth.dto';
import { DataResultInterface, RequestResultInterface } from '../../core/interfaces/all.interface';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TestNin } from '../../entities/test-nin.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @ApiOperation({
    summary: 'Login a user and return access token',
  })
  @ApiBody({ type: AuthUserDto })
  @Post('/login')
  async login(@Body() data: AuthUserDto) {
    return this.service.login(data);
  }

  @ApiOperation({
    summary: 'Send OTP to supplied email or phone',
  })
  @ApiBody({ type: SendOTPDataDto })
  @Post('/send-otp')
  async sendOtp(@Body() data: SendOTPDataDto): Promise<RequestResultInterface> {
    return await this.service.sendOtp(data);
  }

  @ApiOperation({
    summary: 'Validate OTP sent to supplied email or phone',
  })
  @ApiBody({ type: OTPDataDto })
  @Post('/validate-otp')
  async validateOtp(@Body() data: OTPDataDto): Promise<RequestResultInterface> {
    return await this.service.validateOtp(data);
  }

  @ApiOperation({
    summary: 'Resend OTP to supplied email or phone',
  })
  @ApiBody({ type: SendOTPDataDto })
  @Post('/resend-otp')
  async resendOtp(@Body() data: SendOTPDataDto) {
    return await this.service.resendOtp(data);
  }

  @ApiOperation({ description: 'Reset password.' })
  @Post('/reset-password')
  async changePassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<RequestResultInterface> {
    return await this.service.resetPassword(resetPasswordDto);
  }

  @ApiOperation({ summary: 'Logout a user' })
  @Post('/logout')
  async logout(@Req() req: any) {
    return this.service.logout(req.user);
  }

  @ApiOperation({ description: 'Upload test nin' })
  @ApiResponse({ status: 200, type: TestNin })
  @Post('/test-nin')
  async addTestNIN(@Body() { nin, data }: TestNinRequestDto) {
    return await this.service.addTestNin(nin, data);
  }

  @ApiOperation({ summary: 'verify NIN and return nin data' })
  @Get('/verify-nin/:nin')
  async verifyNIN(@Param('nin') nin: string): Promise<DataResultInterface> {
    return await this.service.verifyNIN(nin);
  }

  @ApiOperation({ description: 'Update user password' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('/update-password')
  async updatePassword(
    @Req() req: any,
    @Body() updatePasswordDto: UpdatePasswordRequestDto,
  ): Promise<RequestResultInterface> {
    return await this.service.updatePassword(req.user, updatePasswordDto);
  }
}
