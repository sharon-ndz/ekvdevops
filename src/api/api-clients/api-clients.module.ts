import { Module } from '@nestjs/common';
import { ApiClientsService } from './api-clients.service';
import { ApiClientsController } from './api-clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiClient } from '../../entities/api-client.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../guards/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { jwtConstants } from '../../core/constants/constants';
import { AuditTrail } from 'src/entities/audit-trail.entity';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    TypeOrmModule.forFeature([ApiClient, AuditTrail]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [ApiClientsController],
  providers: [ApiClientsService, JwtStrategy],
  exports: [ApiClientsService],
})
export class ApiClientsModule {}
