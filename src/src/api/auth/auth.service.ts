import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  AuthUserDto,
  OTPDataDto,
  ResetPasswordDto,
  SendOTPDataDto,
  UpdatePasswordRequestDto,
} from './auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuthUserInfo,
  DataResultInterface,
  RequestResultInterface,
} from '../../core/interfaces/all.interface';
import { Otp } from '../../entities/otp.entity';
import ninHelper from '../../core/nin';
import { isNINValid, isOTPValid } from '../../core/helpers/general';
import { EmailNotification } from '../../entities/email-notification.entity';
import { TestNin } from '../../entities/test-nin.entity';
import { User } from '../../entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { FileService } from '../file/file.service';
import { Role } from '../../middlewares/roles';
import { Node } from '../../entities/node.entity';
import { MESSAGES } from '../../core/constants/messages';
import { ChangePasswordNextLogin, Status } from '../../core/constants/enums';
import { mailer } from '../../core/helpers';
import { getDateDiff, numberCode } from '../../core/helpers/functions.helpers';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private fileService: FileService,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    @InjectRepository(TestNin)
    private readonly testNinRepository: Repository<TestNin>,
    @InjectRepository(Node)
    private readonly nodeRepository: Repository<Node>,
    @InjectRepository(EmailNotification)
    private readonly emailNotificationRepository: Repository<EmailNotification>,
  ) { }

  /**
   * Login user
   * @param data
   */
  async login(data: AuthUserDto) {
    const user = await this.usersService.findUserBy({ email: data.email });
    const nodeLimit = 3;
    let node: Node;

    if (!user || !(await User.comparePasswords(data.password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    if (user.isActive === Status.Inactive) {
      throw new BadRequestException('Account suspended!');
    }
    // force password reset after 60 days
    if (user.lastPasswordChange && getDateDiff(user.lastPasswordChange, new Date()) >= 60) {
      user.changePasswordNextLogin = ChangePasswordNextLogin.True;
    }

    if (user.roleId === Role.MVAA || user.roleId === Role.DVIS || user.roleId === Role.LASDRI) {
      node = await this.nodeRepository.findOne({
        where: { deviceId: data.deviceId },
      });
      if (!node) {
        throw new BadRequestException('Pre activation request node not found');
      }

      // if (
      //   (await this.usersService.findByCount({ where: { node: { id: node.id } } })) >= nodeLimit
      // ) {
      //   throw new BadRequestException('Users per device limit reached!');
      // }

      if (user.node && user.node.deviceId !== data.deviceId) {
        throw new BadRequestException('User not linked on device.');
      } else {
        await this.usersService.updateNode(user.id, node.id);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...rest } = user;
    const payload = { ...rest, node: node ? node.id : null };
    const accessToken = this.jwtService.sign(payload);
    const expiry = this.jwtService.decode(accessToken, { complete: true }).payload.exp;

    const result: any = {
      success: true,
      message: MESSAGES.welcome,
      user: plainToInstance(User, payload),
      accessToken: accessToken,
      expires: new Date(expiry * 1000).toISOString(),
      biometric: null,
    };

    if (data.fingerType) {
      // Pull biometrics for finger index (for FE match)
      result.biometric = await this.getFileByFingerType(data.fingerType, user);
      result.deviceOnboarded = true;
    }

    return result;
  }

  /**
   * Reset Password
   * @param data
   */
  async resetPassword(data: ResetPasswordDto): Promise<RequestResultInterface> {
    //^ set variables
    const response = { success: false, message: '' };

    try {
      const whereConditions: Record<string, any> = this.getWhereClause(data);
      if (Object.values(whereConditions).length === 0) {
        throw new BadRequestException('Either email or phone number is required');
      }

      // Validate OTP
      const validateResp = await this.validateOtp({
        otp: data.otp,
        phone: data.phone,
        email: data.email,
        deleteOTP: true,
      } as OTPDataDto);
      if (!validateResp.success) {
        throw new NotFoundException('Invalid OTP or has already been used');
      }
      // Get user
      const user = await this.usersService.findUserBy(whereConditions);
      user.password = data.password;
      await user.hashPassword();
      await this.usersService.update(user.id, user);

      response.success = true;
      response.message = 'Password reset successfully!';
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }

    return response;
  }

  /**
   * Update password
   * @param user
   * @param data
   */
  async updatePassword(
    user: AuthUserInfo,
    data: UpdatePasswordRequestDto,
  ): Promise<RequestResultInterface> {
    //^ set variables
    const response = { success: false, message: '' };
    data.userId = user.id;

    try {
      if (data.password !== data.confirmPassword) {
        throw new BadRequestException(MESSAGES.passwordMismatch);
      }
      // Get user
      const userRecord = await this.usersService.findUserBy({ id: data.userId });
      // Validate user and check password matches
      if (!userRecord || !(await User.comparePasswords(data.oldPassword, userRecord.password))) {
        throw new BadRequestException('Invalid credentials');
      }
      // make sure the old and new passwords are different
      if (await User.comparePasswords(data.password, userRecord.password)) {
        throw new BadRequestException(MESSAGES.oldNewPasswordMatch);
      }

      userRecord.password = data.password;
      userRecord.changePasswordNextLogin = 0;
      userRecord.lastPasswordChange = new Date();
      await userRecord.hashPassword();
      await this.usersService.update(user.id, userRecord);
      // set response data
      response.success = true;
      response.message = 'Password updated successfully!';
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Send OTP (supports phone and email)
   * @param data
   */
  async sendOtp(data: SendOTPDataDto): Promise<RequestResultInterface> {
    //^ set variables
    const response = { success: false, message: '' };
    try {
      const otp = numberCode(6);
      const params: Record<string, any> = this.getWhereClause(data);
      if (Object.values(params).length === 0) {
        throw new BadRequestException('Either email or phone number is required');
      }

      // Create OTP in record
      params.otp = otp;
      await this.otpRepository.insert(params);
      if (params.email) {
        // Send for email if email is set
        await mailer
          .setSubject(MESSAGES.otpEmailSubject)
          .setMessage(MESSAGES.otpEmailBody(otp))
          .setTo(params.email)
          .setEmailNotificationRepository(this.emailNotificationRepository)
          .sendDefault();
      }
      // Return response
      response.success = true;
      response.message = MESSAGES.otpSent;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Validates OTP
   * @param data
   */
  async validateOtp(data: OTPDataDto): Promise<RequestResultInterface> {
    //^ set variables
    const response = { success: false, message: '' };
    try {
      const whereConditions: Record<string, any> = this.getWhereClause(data);
      if (Object.values(whereConditions).length === 0) {
        throw new BadRequestException('Either email or phone number is required');
      }
      // Check otp from record
      whereConditions.otp = data.otp;
      const result = await this.otpRepository.findOne({
        where: whereConditions,
      });
      if (!result || result.isUsed || result.otp !== data.otp) {
        throw new NotFoundException('Invalid OTP or has already been used');
      }
      // Validate OTP
      if (!isOTPValid(result.issuedAt)) {
        throw new NotAcceptableException('OTP has expired');
      }

      if (data.deleteOTP) {
        // Since it's successfully validated, remove OTP
        await this.otpRepository.delete({ id: result.id });
      }

      response.success = true;
      response.message = MESSAGES.otpValid;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }

    return response;
  }

  /**
   * Resend OTP
   * @param data
   */
  async resendOtp(data: SendOTPDataDto): Promise<RequestResultInterface> {
    //^ set variables
    const response = { success: false, message: '' };
    try {
      const params: Record<string, any> = this.getWhereClause(data);
      if (Object.values(params).length === 0) {
        throw new BadRequestException('Either email or phone number is required');
      }
      // Check if otp hasn't been used and resend
      const existingOtps = await this.otpRepository.find({
        where: params,
        order: {
          createdAt: 'DESC',
        },
      });
      const existingOtp = existingOtps[0];
      if (!existingOtp || existingOtp.isUsed) {
        // Generate and send a new OTP
        return await this.sendOtp(params as OTPDataDto);
      }

      const dbTimezoneOffset = existingOtp.issuedAt.getTimezoneOffset();
      const newIssuedAt = new Date(Date.now() + dbTimezoneOffset);

      if (params.email) {
        // Send for email if email is set
        await mailer
          .setSubject(MESSAGES.otpEmailSubject)
          .setMessage(MESSAGES.otpEmailBody(existingOtp.otp))
          .setTo(params.email)
          .setEmailNotificationRepository(this.emailNotificationRepository)
          .sendDefault();
      }
      // update OTP expiry
      await this.otpRepository.update({ id: existingOtp.id }, { issuedAt: newIssuedAt });
      response.success = true;
      response.message = MESSAGES.otpSent;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Delete OTP
   * @param otp
   */
  async deleteOtp(otp: string) {
    await this.otpRepository.delete({ otp: otp });
  }

  /**
   * logout user
   * @param user
   */
  async logout(user: AuthUserInfo) {
    const userRecord = await this.usersService.findUserBy({ id: user.id });
    if (!userRecord) {
      throw new NotFoundException('No user found');
    }

    return {
      success: true,
      message: MESSAGES.logout,
    };
  }

  /**
   * Add Test NIN
   * @param nin
   * @param data
   */
  async addTestNin(nin: string, data: any) {
    try {
      const record = await this.testNinRepository.findOne({ where: { nin: nin } });
      if (record) {
        record.data = data;
        await this.testNinRepository.update({ id: record.id }, record);
      } else {
        await this.testNinRepository.insert({ nin: nin, data: data });
      }
      return { message: 'Test NIN insert/update successful' };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('Unable to add test nin');
    }
  }

  /**
   * Verify NIN
   * @param nin
   */
  async verifyNIN(nin: string): Promise<DataResultInterface> {
    const response = { success: false, message: 'Query ok', data: null };
    try {
      // If not in production, use test NIN
      if (process.env.NODE_ENV !== 'production') {
        const ninData = await this.testNinRepository.findOne({ where: { nin } });
        if (!ninData) {
          throw new BadRequestException(MESSAGES.invalidNin);
        }
        response.success = true;
        response.data = ninData.data;
        return response;
      }
      // In production, run actual NIN verification and return data
      const ninData = await ninHelper.verifyNIN(nin);
      if (isNINValid(ninData)) {
        response.data = ninData;
        response.success = true;
      } else {
        response.message =
          'Some demographic information or the picture is missing. Please contact NIMC for more information.';
      }
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }

    return response;
  }

  // Private helper method to get where clause
  private getWhereClause(data: SendOTPDataDto) {
    const whereConditions: Record<string, any> = {};

    if (data.email && data.email.length > 0) {
      whereConditions.email = data.email;
    } else if (data.phone && data.phone.length > 0) {
      whereConditions.phone = data.phone;
    }

    return whereConditions;
  }

  // Get file by finger type (return base64)
  async getFileByFingerType(fingerType: string, user: User): Promise<string | null> {
    if (user.files && Array.isArray(user.files)) {
      for (const file of user.files) {
        if (file && file.fingerType === fingerType) {
          const base64 = await this.fileService.getFileById(file.fileId);
          if (!base64) {
            return null;
          }
          return base64;
        }
      }
    }
    return null;
  }
}
