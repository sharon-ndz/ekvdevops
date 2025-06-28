import { config } from 'dotenv';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailNotification } from '../entities/email-notification.entity';
import { NotificationService } from './notification-service';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from '../middlewares/roles';
import { ApiClientPermissionsGuard } from '../middlewares/api-client-permission';
import { UsersModule } from '../api/users/users.module';
config();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        poolSize: 2,
        connectTimeoutMS: 5000,
        logging: true,
      }),
    }),
    TypeOrmModule.forFeature([EmailNotification]),
  ],
  providers: [
    NotificationService,
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionsGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: ApiClientPermissionsGuard,
    // },
  ],
})
export class ServicesModule {}
