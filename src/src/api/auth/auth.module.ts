import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../guards/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Otp } from '../../entities/otp.entity';
import { EmailNotification } from '../../entities/email-notification.entity';
import { TestNin } from '../../entities/test-nin.entity';
import { FileModule } from '../file/file.module';
import { Node } from '../../entities/node.entity';
import { jwtConstants } from '../../core/constants/constants';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    FileModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
    TypeOrmModule.forFeature([User, Node, Otp, TestNin, EmailNotification]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
