import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PASSWORD_REGEX } from '../../core/constants/constants';
import { MESSAGES } from '../../core/constants/messages';
import { IsNGPhoneNumber } from '../../core/validators/required.dep';

export class AuthEmailDto {
  @ApiProperty()
  @Expose()
  @IsEmail()
  email: string;
}

export class TestNinRequestDto {
  @IsNotEmpty()
  nin: string;

  @IsNotEmpty()
  @IsObject()
  data: string;
}

export class AuthUserDto extends AuthEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fingerType: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deviceId: string;
}

export class SendOTPDataDto {
  @ApiProperty({
    required: false,
    description: 'Email address to receive the otp',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @ApiProperty({
    required: false,
    description:
      'Phone number to receive the otp. One of phone or email should be set but not both',
  })
  @IsOptional()
  @IsNGPhoneNumber()
  phone: string;
}

export class OTPDataDto extends SendOTPDataDto {
  @ApiProperty({
    required: false,
    maxLength: 6,
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  otp: string;

  @ApiHideProperty()
  @IsOptional()
  deleteOTP: boolean;
}

export class ResetPasswordDto extends SendOTPDataDto {
  @ApiProperty({
    required: false,
    maxLength: 6,
    minLength: 6,
  })
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  confirmPassword: string;
}

export class UpdatePasswordRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(new RegExp(PASSWORD_REGEX), {
    message: MESSAGES.passwordStrengthFailed,
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(new RegExp(PASSWORD_REGEX), {
    message: MESSAGES.passwordStrengthFailed,
  })
  confirmPassword: string;

  @ApiHideProperty()
  userId: number;
}
