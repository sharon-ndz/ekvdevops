import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from './middlewares/roles';
import { ApiClientPermissionsGuard } from './middlewares/api-client-permission';
import { ApiClientsModule } from './api/api-clients/api-clients.module';
import { UsersModule } from './api/users/users.module';
import { AuthModule } from './api/auth/auth.module';
import { AuditTrailModule } from './api/audit-trail/audit-trail.module';
import { PaymentModule } from './api/payment/payment.module';
import { CommonModule } from './api/common/common.module';
import { DrivingSchoolModule } from './api/driving-school/driving-school.module';
import { CbtModule } from './api/cbt/cbt.module';
import { LicenseModule } from './api/license/license.module';
import { FileModule } from './api/file/file.module';
import { PermitModule } from './api/permit/permit.module';
import { InspectionModule } from './api/inspection/inspection.module';
import config from './config';
import { DeviceModule } from './api/device/device.module';
import { DrivingTestModule } from './api/driving-test/driving-test.module';
import { InstructorModule } from './api/instructor/instructor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config], envFilePath: ['.env'] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return configService.get(process.env.NODE_ENV);
      },
    }),
    FileModule,
    UsersModule,
    AuditTrailModule,
    AuthModule,
    ApiClientsModule,
    CbtModule,
    PaymentModule,
    CommonModule,
    DrivingSchoolModule,
    LicenseModule,
    PermitModule,
    InspectionModule,
    DeviceModule,
    DrivingTestModule,
    InstructorModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ApiClientPermissionsGuard,
    },
  ],
})
export class AppModule { }
